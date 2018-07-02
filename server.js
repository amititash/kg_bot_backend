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