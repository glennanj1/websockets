require('dotenv').config()
let ip = process.env.ip;
let port = 28016;
let pw = process.env.pw;
let WebSocket = require('ws');

//mongoose init
const mongoose = require('mongoose');

//check for errors
main().catch(err => console.log(err));

//connection
async function main() {
  await mongoose.connect(process.env.DB_URL);
}

//clean up and add into a model folder
const rustServerSchema = new mongoose.Schema({
  hostname: String,
  population: Number,
  uptime: Number,
  version: String,
});
// model folder and export
const RustServer = mongoose.model('RustServer', rustServerSchema);


//socket connection init
let ws = new WebSocket('ws://'+ip+':'+port+'/'+pw);

//user input eventually removing when using with react 
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

//when connection established/authed prompt the user

  ws.on('open', function open() {
    console.log('connected');  
    let prompt = () => {
        readline.question(`Enter a Command Soilder\n`, c => {
          if (c == 'q') {
              readline.close()
              this.terminate();
          } else {
              messageToServer(c, 1)
              prompt();
          }
        })
      }
      prompt();
  });
  
  //logging server returns to cli
  ws.on('message', function(data) {
    let m = JSON.parse(data.toString('utf8'))
    // m.Message.split(/\r?\n/)
    console.log(m);

    //store message if its ServerInfo
    // let serverinfo = {
    //   hostname: '',
    //   population: pop,
    //   uptime: Number,
    //   version: String,
    // }
    // let tenx = new RustServer(serverinfo)
    // console.log('message');
    // console.log(JSON.parse(data));
    
  });
  //log when server closes
  ws.on('close', function close() {
    console.log('disconnected');
  });
  //send messages/commands to rcon
  let messageToServer = (m, identifier) => {
      let json = {
          Identifier: identifier,
          Message: m,
          Name: "WebRcon"
      }
      ws.send(JSON.stringify(json));
      
  }

  module.exports = messageToServer;


