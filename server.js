const WebSocket = require('websocket').server;
const http = require('http');

const server = http.createServer((request, response) => {
  // Handle HTTP requests here
});

const webSocketServer = new WebSocket({
  httpServer: server,
});

webSocketServer.on('request', (request) => {
  const connection = request.accept(null, request.origin);

  connection.on('message', (message) => {
    const msgString = message.utf8Data;
    // Broadcasting message to all connected clients
    webSocketServer.connections.forEach(conn => {
      conn.sendUTF(msgString);
    });
  });

  connection.on('close', (reasonCode, description) => {
    console.log('Client has disconnected.');
  });
});

server.listen(3001, () => {
  console.log('WebSocket server is listening on port 3001');
});
