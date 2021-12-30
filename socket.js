require('dotenv').config()
let ip = process.env.ip;
let port = 28016;
let pw = process.env.pw;
let WebSocket = require('ws');

//socket connection init
let ws = new WebSocket('ws://'+ip+':'+port+'/'+pw);/* we're connected */

//user input eventually removing when using with react 
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

//when connection established/authed prompt the user
ws.on('open', function open() {
  console.log('connected');  /* send a test command */
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
  console.log('message');
  console.log(JSON.parse(data));
});
//print when server closes
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