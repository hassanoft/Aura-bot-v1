const path = require("path");
const fs = require("fs");
const pino = require("pino");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");


const config = require("./config");
const logger = require("./utils/logger");
const db = require("./database/db");

const { loadCommands } = require("./utils/commandLoader");
const { loadEvents } = require("./utils/eventLoader");
const { createServer } = require("./server");



const SESSION_DIR = path.resolve(
  config.paths.session
);



const delay = ms =>
new Promise(resolve =>
setTimeout(resolve, ms)
);



// Version WhatsApp fixe pour Render
const WA_VERSION = [
  2,
  3000,
  1015901307
];



// ===============================
// ETAT DU BOT
// ===============================

const state = {

  connected:false,

  lastConnectedAt:null,

  usersCount(){
    return Object.keys(db.users.all()).length;
  },

  groupsCount(){
    return Object.keys(db.groups.all()).length;
  }

};



const commands = loadCommands();



let sock = null;
let authState = null;
let saveCreds = null;


let reconnecting = false;
let pairingRunning = false;
let reconnectAttempts = 0;

const MAX_RECONNECT_ATTEMPTS = 20;




// ===============================
// START WHATSAPP
// ===============================

async function startBot(){


  try{


    // Vérifier trop de tentatives
    if(reconnectAttempts >= MAX_RECONNECT_ATTEMPTS){


      logger.error(
        "Trop de tentatives de reconnexion"
      );


      logger.info(
        "Processus maintenu pour health check Render"
      );


      return;


    }




    if(!fs.existsSync(SESSION_DIR)){

      fs.mkdirSync(
        SESSION_DIR,
        {
          recursive:true
        }
      );

      logger.info(
        "Dossier session créé"
      );

    }



    const auth =
    await useMultiFileAuthState(
      SESSION_DIR
    );



    authState = auth.state;
    saveCreds = auth.saveCreds;




    if(authState.creds.registered){


      logger.success(
        "Session existante trouvée"
      );


    }else{


      logger.info(
        "Nouvelle session - utilisez API pairing"
      );


    }




    logger.info(
      "Version WhatsApp : "+
      WA_VERSION.join(".")
    );




    sock =
    makeWASocket({

      version:WA_VERSION,

      auth:{
        creds:authState.creds,
        keys:makeCacheableSignalKeyStore(
          authState.keys,
          pino({level:"silent"})
        )
      },


      browser:[
        "AURA BOT",
        "Chrome",
        "10.0.0"
      ],


      logger:pino({
        level:"silent"
      }),


      printQRInTerminal:false,


      connectTimeoutMs:120000,


      keepAliveIntervalMs:30000,


      markOnlineOnConnect:false,


      defaultQueryTimeoutMs:60000,


      syncFullHistory:false,


      retryRequestDelayMs:10000

    });




    sock.ev.on(
      "creds.update",
      saveCreds
    );





    const context = {


      commands,


      state,


      reconnect:startBot,


      clearSession:deleteSession


    };





    loadEvents(
      sock,
      context
    );







    sock.ev.on(
      "connection.update",
      async(update)=>{


        const {
          connection,
          lastDisconnect
        } = update;





        if(connection==="connecting"){


          logger.info(
            "Connexion WhatsApp..."
          );


        }






        if(connection==="open"){


          state.connected=true;


          state.lastConnectedAt =
          new Date();


          reconnectAttempts = 0;


          reconnecting = false;



          const botNumber =
          sock.user?.id?.split(":")[0] ||
          "Inconnu";



          logger.success(
            "✅ WhatsApp connecté"
          );


          logger.info(
            "Numéro : "+botNumber
          );


        }








        if(connection==="close"){



          state.connected=false;



          const code =
          lastDisconnect
          ?.error
          ?.output
          ?.statusCode;



          const erreur =
          lastDisconnect
          ?.error
          ?.message ||
          "Inconnue";



          logger.warn(
            "Déconnecté - Code: "+
            code
          );


          logger.warn(
            "Raison: "+erreur
          );





          // Si loggedOut
          if(
            code === DisconnectReason.loggedOut
          ){


            logger.error(
              "Session invalide - loggedOut"
            );


            deleteSession();


            reconnectAttempts = MAX_RECONNECT_ATTEMPTS;


            return;


          }





          // Reconnexion automatique
          if(
            !reconnecting &&
            reconnectAttempts < MAX_RECONNECT_ATTEMPTS
          ){


            reconnecting=true;


            reconnectAttempts++;



            const waitTime =
            Math.min(
              5000 * reconnectAttempts,
              30000
            );



            logger.info(
              "Reconnexion "+
              reconnectAttempts+
              "/"+
              MAX_RECONNECT_ATTEMPTS+
              " dans "+
              waitTime/1000+
              "s..."
            );



            await delay(waitTime);



            try{
              sock?.end();
            }catch(e){}



            sock = null;


            reconnecting = false;



            startBot();



          }



        }



      }

    );





    return sock;



  }catch(error){



    logger.error(
      "Erreur démarrage bot : "+
      error.message
    );



    await delay(10000);


    if(!reconnecting){


      return startBot();


    }



  }


}






// ===============================
// PAIRING CODE
// ===============================

async function requestPairingCode(number){



  if(pairingRunning){

    throw new Error(
      "Pairing déjà en cours"
    );

  }



  pairingRunning=true;



  try{



    const phone =
    number.replace(/\D/g,"");




    if(phone.length < 10){


      throw new Error(
        "Numéro de téléphone invalide"
      );


    }




    logger.info(
      "Demande pairing pour : "+phone
    );




    if(!sock){


      logger.info(
        "Initialisation du socket..."
      );


      await startBot();



      // Attendre que le socket soit prêt
      let tentatives = 0;


      while(
        (!sock || !authState) &&
        tentatives < 30
      ){


        await delay(2000);


        tentatives++;


        logger.info(
          "Attente... ("+
          tentatives+
          "/30)"
        );


      }



      if(!sock || !authState){


        throw new Error(
          "Impossible d'initialiser le socket"
        );


      }



    }





    if(authState?.creds?.registered){


      logger.warn(
        "Session déjà connectée"
      );



      return{
        success:true,
        message:"Session déjà connectée",
        alreadyConnected:true
      };


    }





    await delay(3000);




    logger.info(
      "Demande du code pairing..."
    );






    const code =
    await sock.requestPairingCode(
      phone
    );



    const formattedCode =
    code?.match(/.{1,4}/g)?.join("-") ||
    code;




    logger.success(
      "══════════════════════════════"
    );


    logger.success(
      "📲 CODE PAIRING : "+formattedCode
    );


    logger.success(
      "══════════════════════════════"
    );


    logger.info(
      "1. WhatsApp > Appareils connectés"
    );


    logger.info(
      "2. Lier un appareil"
    );


    logger.info(
      "3. Entrez le code"
    );


    logger.info(
      "⏰ Code expire dans 2 minutes"
    );




    return{
      success:true,
      code:code,
      formattedCode:formattedCode,
      phone:phone
    };




  }catch(error){



    logger.error(
      "Erreur pairing : "+
      error.message
    );


    throw error;



  }finally{


    pairingRunning=false;


  }



}







// ===============================
// RESTART
// ===============================

async function restart(){



  logger.info(
    "Redémarrage..."
  );



  try{


    if(sock){

      sock.end();

    }


  }catch(e){}





  sock=null;


  reconnecting=false;


  reconnectAttempts=0;



  await delay(3000);



  startBot();



}






// ===============================
// DELETE SESSION
// ===============================

function deleteSession(){



  logger.warn(
    "Suppression session..."
  );



  try{


    if(fs.existsSync(SESSION_DIR)){


      fs.rmSync(
        SESSION_DIR,
        {
          recursive:true,
          force:true
        }
      );


    }




    fs.mkdirSync(
      SESSION_DIR,
      {
        recursive:true
      }
    );



    state.connected=false;


    sock=null;


    authState=null;



    logger.success(
      "Session supprimée"
    );



  }catch(error){


    logger.error(
      "Erreur suppression : "+
      error.message
    );


  }



}






// ===============================
// ANTI CRASH
// ===============================


process.on(
"uncaughtException",
err=>{

 logger.error(
  "Crash : "+
  err.message
 );

 logger.error(
  err.stack
 );

});



process.on(
"unhandledRejection",
reason=>{


 logger.error(
  "Erreur non gérée : "+
  reason
 );


});








// ===============================
// SERVEUR WEB + BOT
// ===============================


(async()=>{



 try{



  logger.info(
    "══════════════════════════════"
  );


  logger.info(
    "🤖 AURA BOT - RENDER"
  );


  logger.info(
    "══════════════════════════════"
  );



  const app =
  createServer({

   state,

   commands,

   requestPairingCode,

   restart,

   deleteSession

  });



  const PORT =
  process.env.PORT ||
  config.server.port ||
  10000;




  // Health check pour Render
  app.get(
    "/health",
    (req,res)=>{


      res.json({
        status:"ok",
        connected:state.connected,
        uptime:process.uptime(),
        memory:Math.round(
          process.memoryUsage().heapUsed /
          1024 /
          1024
        )+"MB",
        timestamp:new Date().toISOString()
      });


    }
  );




  app.listen(
    PORT,
    "0.0.0.0",
    ()=>{


     logger.success(
      "🌐 Serveur lancé sur "+PORT
     );


     logger.info(
      "Health check : /health"
     );


    }

  );





  // Lance le socket WhatsApp
  logger.info(
    "Démarrage WhatsApp..."
  );


  await startBot();



 }catch(error){



  logger.error(
    "Erreur fatale : "+
    error.message
  );



 }



})();




// ===============================
// HEALTH CHECK AUTO
// ===============================

setInterval(
  ()=>{


    const uptime =
    process.uptime();


    const memory =
    Math.round(
      process.memoryUsage().heapUsed /
      1024 /
      1024
    );



    logger.info(
      "💓 Uptime: "+
      Math.floor(uptime)+
      "s | RAM: "+
      memory+
      "MB | WhatsApp: "+
      (state.connected ? "✅" : "❌")
    );



    // Reconnexion auto si déconnecté
    if(
      !state.connected &&
      !reconnecting &&
      reconnectAttempts < MAX_RECONNECT_ATTEMPTS
    ){


      logger.warn(
        "Tentative de reconnexion auto..."
      );


      startBot().catch(
        err=>logger.error(
          "Échec reconnexion : "+
          err.message
        )
      );


    }



  },
  5 * 60 * 1000
);