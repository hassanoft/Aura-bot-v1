const path = require("path");
const fs = require("fs");
const pino = require("pino");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
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




// ===============================
// START WHATSAPP
// ===============================

async function startBot(){


  try{


    if(!fs.existsSync(SESSION_DIR)){

      fs.mkdirSync(
        SESSION_DIR,
        {
          recursive:true
        }
      );

    }



    const auth =
    await useMultiFileAuthState(
      SESSION_DIR
    );



    authState = auth.state;
    saveCreds = auth.saveCreds;




    const {version} =
    await fetchLatestBaileysVersion();



    logger.info(
      "Version WhatsApp : "+
      version.join(".")
    );




    sock =
    makeWASocket({

      version,

      auth:authState,


      browser:[
        "AURA BOT",
        "Chrome",
        "1.0.0"
      ],


      logger:pino({
        level:"silent"
      }),


      printQRInTerminal:false,


      connectTimeoutMs:60000,


      keepAliveIntervalMs:10000,


      markOnlineOnConnect:false

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



          logger.success(
            "✅ WhatsApp connecté"
          );


        }








        if(connection==="close"){



          state.connected=false;



          const code =
          lastDisconnect
          ?.error
          ?.output
          ?.statusCode;



          logger.warn(
            "Connexion fermée : "+
            code
          );





          if(
            code !== DisconnectReason.loggedOut &&
            !reconnecting
          ){


            reconnecting=true;



            await delay(5000);



            reconnecting=false;



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



    await delay(5000);


    return startBot();



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




    if(!sock){


      await startBot();


    }





    if(authState.creds.registered){


      throw new Error(
        "Cette session est déjà connectée"
      );


    }





    logger.info(
      "Préparation du code pairing..."
    );




    await delay(10000);






    const code =
    await sock.requestPairingCode(
      phone
    );






    logger.success(
      "Code pairing : "+code
    );




    return code;




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



  await delay(2000);



  startBot();



}






// ===============================
// DELETE SESSION
// ===============================

function deleteSession(){



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



  logger.warn(
    "Session supprimée"
  );


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

});



process.on(
"unhandledRejection",
err=>{


 logger.error(
  "Erreur Promise : "+
  err
 );


});








// ===============================
// SERVEUR WEB
// ===============================


(async()=>{



 const app =
 createServer({

  state,

  commands,

  requestPairingCode,

  restart,

  deleteSession

 });





 app.listen(
  config.server.port,
  ()=>{


   logger.success(
    "🌐 Serveur lancé sur "+
    config.server.port
   );


  }

 );





 // Lance le socket même sans session

 await startBot();



})();