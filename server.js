const WebSocketServer = require('websocket').server;
const http = require('http');

async function fetchWrapper(url, options) {
  const fetch = (await import('node-fetch')).default;
  return fetch(url, options);
}

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('WebSocket server is running\n');
});

const webSocketServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
});

function originIsAllowed(origin) {
  return true; // Permitir todas las conexiones
}

webSocketServer.on('request', (request) => {
  if (!originIsAllowed(request.origin)) {
    request.reject();
    console.log('Connection from origin ' + request.origin + ' rejected.');
    return;
  }

  const connection = request.accept(null, request.origin);

  connection.on('message', async (message) => {
    const msg = JSON.parse(message.utf8Data);

    if (msg.type === 'NEW_CLIENT') {
      webSocketServer.connections.forEach((conn) => {
        conn.sendUTF(JSON.stringify({ type: 'NEW_CLIENT', client: msg.client }));
      });
    } else {
      try {
        // Guardar el mensaje en la base de datos
        const response = await fetchWrapper('https://phmsoft.tech/Ultimochatlojuro/save_message.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_name: msg.client,
            message: msg.text,
            sender: msg.role,
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        // Solo enviar el mensaje a los demás clientes si se guardó correctamente en la base de datos
        webSocketServer.connections.forEach((conn) => {
          conn.sendUTF(JSON.stringify(msg));
        });
      } catch (error) {
        console.error('Error saving message:', error);
      }
    }
  });

  connection.on('close', (reasonCode, description) => {
    console.log('Client has disconnected.');
  });
});

server.listen(3001, () => {
  console.log('WebSocket server is listening on port 3001');
});
