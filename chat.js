const prettyjson = require('prettyjson');
const DialogManager_1 = require("./dist/DialogManager");
let dialogManager;


const express = require('express'); //added
const port = process.env.PORT || 3000; //added
const request = require('request');
const recastai = require('recastai')
const app = express(); //added

// Routing for index.html
app.use(express.static(__dirname + '/public')); //added

const server = app.listen(port, '0.0.0.0', () => {  //added
    console.log('Server listening at port %d', port);
});

const Botmaster = require('botmaster');
const SocketioBot = require('botmaster-socket.io');

const botmaster = new Botmaster({
  server,
});

const socketioSettings = {
  id: '00001',
  server,
};

const socketioBot = new SocketioBot(socketioSettings);
botmaster.addBot(socketioBot);


botmaster.use({
  type: 'incoming',
  name: 'my-middleware',
  controller: (bot, update) => {

    dialogManager = new DialogManager_1.default({ debug: true });
    let context = 'launch';
  
    console.log("here ", update.raw.message.text);


    dialogManager.ask(update.raw.message.text, context)
    .then((result) => {

        console.log(">>>",result);
        return bot.reply(update, result);

    })
        .catch(() => {
          return bot.reply(update, "sorrry try again");
    });

  }
});



/*const Botmaster = require('botmaster');
const SocketioBot = require('botmaster-socket.io');
const botmaster = new Botmaster();

const socketioSettings = {
  id: '00001',
  server: botmaster.server, // this is required for socket.io. You can set it to another node server object if you wish to. But in this example, we will use the one created by botmaster under the hood
};

const socketioBot = new SocketioBot(socketioSettings);
botmaster.addBot(socketioBot);

botmaster.use({
  type: 'incoming',
  name: 'my-middleware',
  controller: (bot, update) => {
    return bot.reply(update, 'Hello world!');
  }
});*/
/* 
const express = require('express'); //added
const port = process.env.PORT || 3000; //added
const request = require('request');
const recastai = require('recastai')
const app = express(); //added

// Routing for index.html
app.use(express.static(__dirname + '/public')); //added

const server = app.listen(port, '0.0.0.0', () => {  //added
    console.log('Server listening at port %d', port);
});

const Botmaster = require('botmaster');
const SocketioBot = require('botmaster-socket.io');

const botmaster = new Botmaster({
  server,
});

const socketioSettings = {
  id: '00001',
  server,
};

const socketioBot = new SocketioBot(socketioSettings);
botmaster.addBot(socketioBot);


botmaster.use({
  type: 'incoming',
  name: 'my-middleware',
  controller: (bot, update) => {
   console.log(update.raw.message.text,'-=-=-=-')
    let message = update.raw.message.text
       

     const client = new recastai.request('4eb80539442ac9ff618a3cb48fee7853', 'en');
     let dataToSend = "hi";
//inputText is the chat that user will send

client.analyseText(message)

  .then(function(res) {

    if (res.intent()) { console.log('Intent: ', res.intent().slug) }

    if (res.intent().slug === 'measure_sales') {

      // send a response back saying you want 

    //to measure sales
    dataToSend = 'want to measure sales';

    }

  if (res.intent().slug === 'measure_sales') {

      // send a response back saying you want 

    //to measure sales and send the entities 

    //returned
    dataToSend = 'want to measure sales and send the entities returned'

    }

  if (res.intent().slug === 'measure_pipline') {

      // send a response back saying you want 

    //to measure pipline and send the entities 

    //returned
    dataToSend = 'want to measure pipeline and send the entities'

    }

    console.log(dataToSend);
    return bot.reply(update, dataToSend);

  })
      /* request({
      method: 'GET',
      url:'http://52.15.46.77:3001/getall/?sentence=why%20is%20india%20like%20this',
    },function(err, response, body){
      if(err){
        console.log(err)
      } else {
        console.log('-=-=-=-=',body)
        dataToSend = dataToSend + body;
        
      }
    }) 
   
  }
});

botmaster.on('error', (bot, err) => { // added
  console.log(err.stack); // added
}); // added
 */