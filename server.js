// server.js
const WebSocket = require('websocket').server;
const http = require('http');

const server = http.createServer((request, response) => {
  // Handle HTTP requests here
});

const webSocketServer = new WebSocket({
  httpServer: server,
});

const clients = [];

webSocketServer.on('request', (request) => {
  const connection = request.accept(null, request.origin);

  connection.on('message', (message) => {
    const msg = JSON.parse(message.utf8Data);

    if (msg.type === 'NEW_CLIENT') {
      clients.push(msg.client);
      webSocketServer.connections.forEach((conn) => {
        conn.sendUTF(JSON.stringify({ type: 'NEW_CLIENT', client: msg.client }));
      });
    } else {
      webSocketServer.connections.forEach((conn) => {
        conn.sendUTF(JSON.stringify(msg));
      });
    }
  });

  connection.on('close', (reasonCode, description) => {
    console.log('Client has disconnected.');
  });
});

server.listen(3001, () => {
  console.log('WebSocket server is listening on port 3001');
});
