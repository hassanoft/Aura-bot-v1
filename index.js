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


const SESSION_DIR = path.resolve(config.paths.session);


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));


// Etat du bot
const state = {

  connected:false,

  lastConnectedAt:null,

  usersCount:()=>Object.keys(db.users.all()).length,

  groupsCount:()=>Object.keys(db.groups.all()).length

};


const commands = loadCommands();


let sock = null;
let authState = null;
let saveCreds = null;

let pairingNumber = null;
let pairingRunning = false;

let reconnecting = false;



// ===============================
// CONNEXION WHATSAPP
// ===============================

async function startBot(){


  if(!fs.existsSync(SESSION_DIR)){
    fs.mkdirSync(SESSION_DIR,{
      recursive:true
    });
  }



  const auth = await useMultiFileAuthState(
    SESSION_DIR
  );


  authState = auth.state;
  saveCreds = auth.saveCreds;



  const {version} = await fetchLatestBaileysVersion();



  sock = makeWASocket({

    version,

    auth:authState,

    printQRInTerminal:false,

    browser:[
      "AURA BOT",
      "Chrome",
      "1.0.0"
    ],

    logger:pino({
      level:"silent"
    })

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



      if(connection==="open"){


        state.connected=true;

        state.lastConnectedAt=
          new Date();


        logger.success(
          "✅ WhatsApp connecté"
        );


      }



      if(connection==="close"){


        state.connected=false;


        const code =
        lastDisconnect?.error?.output?.statusCode;



        logger.warn(
          `Connexion fermée (${code})`
        );



        if(
          code !== DisconnectReason.loggedOut &&
          !reconnecting
        ){

          reconnecting=true;


          logger.info(
            "Reconnexion automatique..."
          );


          await delay(3000);


          reconnecting=false;


          startBot();

        }


      }


    }

  );



  await delay(1000);



  return sock;

}




// ===============================
// GENERER CODE PAIRING
// ===============================

async function requestPairingCode(number){


  if(pairingRunning){

    throw new Error(
      "Une demande de pairing est déjà en cours"
    );

  }


  pairingRunning=true;


  try{


    pairingNumber =
    number.replace(/\D/g,"");



    if(!sock){

      await startBot();

    }



    if(authState.creds.registered){

      throw new Error(
        "Session déjà connectée"
      );

    }



    await delay(2000);



    const code =
    await sock.requestPairingCode(
      pairingNumber
    );



    logger.info(
      `Pairing Code généré pour ${pairingNumber} : ${code}`
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
// REDEMARRAGE
// ===============================

async function restart(){


  logger.info(
    "Redémarrage demandé..."
  );


  try{

    if(sock){

      sock.end();

    }

  }catch(e){}



  sock=null;


  await delay(1000);


  startBot();


}





// ===============================
// SUPPRESSION SESSION
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
    "Session WhatsApp supprimée"
  );


}





// Anti crash

process.on(
"uncaughtException",
err=>{

 logger.error(
  "Exception : "+
  err.message
 );

});


process.on(
"unhandledRejection",
err=>{

 logger.error(
  "Rejection : "+
  err
 );

});





// ===============================
// DEMARRAGE SERVEUR
// ===============================


(async()=>{


 const botContext={


  state,

  requestPairingCode,

  restart,

  deleteSession,

  commands


 };



 const app=createServer(
  botContext
 );



 app.listen(
  config.server.port,
  ()=>{


   logger.success(
    `🌐 Interface web disponible sur le port ${config.server.port}`
   );


  }

 );





 if(
 fs.existsSync(SESSION_DIR) &&
 fs.readdirSync(SESSION_DIR).length>0
 ){

   await startBot();


 }else{


   logger.info(
    "Aucune session trouvée. En attente du Pairing Code."
   );


 }


})();