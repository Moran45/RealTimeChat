const WebSocketServer = require('websocket').server;
const { Console } = require('console');
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
  console.log('Connection accepted from origin:', request.origin);

  connection.on('message', async (message) => {
    const msg = JSON.parse(message.utf8Data);
    console.log('Received message:', msg);

    if (msg.type === 'LOGIN') {
      console.log('Processing LOGIN');
      try {
        const response = await fetchWrapper('https://phmsoft.tech/Ultimochatlojuro/authenticate.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            email_or_name: msg.email_or_name
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const authData = await response.json();
        console.log('Auth data:', authData);

        if (authData.role === 'admin') {
          connection.role = 'admin';
          connection.area_id = authData.area_id;
          connection.user_id = authData.user_id; // Guardar el user_id del admin
          connection.sendUTF(JSON.stringify({ type: 'LOGIN_SUCCESS', role: 'admin', user_id: authData.user_id }));
        } else if (authData.role === 'client') {
          connection.role = 'client';
          connection.user_id = authData.user_id;
          connection.sendUTF(JSON.stringify({ type: 'LOGIN_SUCCESS', role: 'client', user_id: authData.user_id }));
          
          // Enviar mensaje de bienvenida al cliente
          connection.sendUTF(JSON.stringify({
            type: 'WELCOME',
            message: 'Bienvenido! ¿Qué problema tienes? Selecciona el número correspondiente: \n1. Area 1 \n2. Area 2 \n3. Area 3',
          }));
        } else {
          connection.sendUTF(JSON.stringify({ type: 'LOGIN_FAILURE' }));
        }
      } catch (error) {
        console.error('Error during authentication:', error);
        connection.sendUTF(JSON.stringify({ type: 'LOGIN_FAILURE' }));
      }
    } else if (msg.type === 'SELECT_AREA' && connection.role === 'client') {
      console.log('Processing area selection:', msg);

      // Validar y asignar area_id
      const validAreas = ['1', '2', '3'];
      console.log("MSG.AREA_ID",msg.area_id);
      if (validAreas.includes(msg.area_id.toString())) {
        connection.area_id = msg.area_id;
      } else {
        connection.area_id = '1'; // Área por defecto es '1'
      }

      // Crear el chat si no existe
      if (!connection.chat_id) {
        try {
          const chatResponse = await fetchWrapper('https://phmsoft.tech/Ultimochatlojuro/start_chat.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              user_id: connection.user_id,
              area_id: connection.area_id, // Usar el area_id del mensaje
            }),
          });

          if (!chatResponse.ok) {
            throw new Error('Network response was not ok');
          }

          const chatData = await chatResponse.json();
          console.log('Chat data:', chatData);
          connection.chat_id = chatData.chat_id;

          // Informar al cliente del nuevo chat_id
          connection.sendUTF(JSON.stringify({ type: 'CHAT_STARTED', chat_id: chatData.chat_id }));
        } catch (error) {
          console.error('Error creating chat:', error);
        }
      }

      connection.sendUTF(JSON.stringify({ type: 'AREA_SELECTED', area_id: connection.area_id }));
    } else if (msg.type === 'MESSAGE') {
      console.log('Processing MESSAGE:', msg);
      try {
        const chat_id = msg.chat_id || connection.chat_id; // Obtener chat_id de msg o de la conexión

        if (!chat_id) {
          console.error('Chat ID is null. Cannot save message.');
          return;
        }

        console.log(`chat_id { area_id: ${connection.area_id} }`); // Añadido aquí para debugging

        const response = await fetchWrapper('https://phmsoft.tech/Ultimochatlojuro/save_message.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            chat_id: chat_id,
            text: msg.text,
            owner_id: connection.user_id || msg.owner_id, // Usar el user_id de la conexión o de msg
            role: msg.role || (connection.role === 'admin' ? 'Admin' : 'Client'), // Asignar el rol apropiado
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const savedMessage = await response.json();
        webSocketServer.connections.forEach((conn) => {
        console.log("connection ids: ",conn.chat_id, chat_id);
          if (conn.chat_id === chat_id) {
            console.log("SavedMEssage: ",savedMessage)
            console.log("SavedMEssageRole: ",conn.role)
            conn.sendUTF(JSON.stringify({ type: 'MESSAGE', message: savedMessage }));
          } else {
            console.log("distintos chats bro");
          }
        });
      } catch (error) {
        console.error('Error saving message:', error);
      }
    } else if (msg.type === 'REPORT_MESSAGE') {
      console.log('Processing REPORT_MESSAGE:', msg);
      try {
        const chat_id = msg.chat_id || connection.chat_id; // Obtener chat_id de msg o de la conexión

        if (!chat_id) {
          console.error('Chat ID is null. Cannot save message.');
          return;
        }

        const response = await fetchWrapper('https://phmsoft.tech/Ultimochatlojuro/save_message.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            chat_id: chat_id,
            text: msg.message.text,
            owner_id: msg.owner_id,
            role: 'system', // Rol de sistema para mensajes de reporte
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const savedMessage = await response.json();
        webSocketServer.connections.forEach((conn) => {
          if (conn.chat_id === chat_id) {
            conn.sendUTF(JSON.stringify({ type: 'MESSAGE', message: savedMessage }));
          }
        });
      } catch (error) {
        console.error('Error saving report message:', error);
      }
    } else if (msg.type === 'REDIRECT_CHAT' && connection.role === 'admin') {
      console.log('Processing REDIRECT_CHAT:', msg);
      try {
        const response = await fetchWrapper('https://phmsoft.tech/Ultimochatlojuro/redirect_chat.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            chat_id: msg.chat_id,
            new_area_id: msg.new_area_id,
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const updatedChat = await response.json();
        connection.sendUTF(JSON.stringify({ type: 'CHAT_REDIRECTED', chat: updatedChat }));
      } catch (error) {
        console.error('Error redirecting chat:', error);
      }
    } else if (msg.type === 'GET_CHATS' && connection.role === 'admin') {
      console.log('Processing GET_CHATS:', msg);
      try {
        const response = await fetchWrapper(`https://phmsoft.tech/Ultimochatlojuro/get_chats.php?area_id=${connection.area_id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const chats = await response.json();
        connection.sendUTF(JSON.stringify({ type: 'CHATS', chats: chats }));
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    } else if (msg.type === 'GET_CHAT_MESSAGES' && connection.role === 'admin') {
      console.log('Processing GET_CHAT_MESSAGES:', msg);
      try {
        const response = await fetchWrapper(`https://phmsoft.tech/Ultimochatlojuro/get_messages.php?chat_id=${msg.chat_id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const messages = await response.json();
        connection.chat_id = msg.chat_id; // Set chat_id for the admin connection
        connection.sendUTF(JSON.stringify({ type: 'CHAT_MESSAGES', chat_id: msg.chat_id, messages: messages }));
      } catch (error) {
        console.error('Error fetching chat messages:', error);
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




/***** OLD CODE *****/
/*
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
*/
