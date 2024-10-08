const WebSocketServer = require('websocket').server;
const http = require('http');
const { type } = require('os');
const { Await } = require('react-router-dom');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'ContraseñaPruebaJWT12PM'; 
const API_BASE_URL = 'https://phmsoft.tech/Ultimochatlojuro'; //api base defincion de la url
const MESSAGE_TYPES = {
  LOGIN: 'LOGIN',
  SELECT_AREA: 'SELECT_AREA',
  MESSAGE: 'MESSAGE',
  REPORT_MESSAGE: 'REPORT_MESSAGE',
  FINALIZE: 'FINALIZE',
  REDIRECT_CHAT: 'REDIRECT_CHAT',
  GET_CHATS: 'GET_CHATS', //Obtener chats sin asignar
  GET_CHATS2:'GET_CHATS',
  GET_CHATS3:'GET_CHATS3',
  GET_CHATS_ASSIGNED:'GET_CHATS_ASSIGNED', //obtener chats abietos o asignados
  GET_CHATS_FINALIZED:'GET_CHATS_FINALIZED', //obtener chats finalizados
  GET_CHATS_ASSIGNED_BY_NAME:'GET_CHATS_ASSIGNED_BY_NAME', //obtener chats finalizados
  GET_CHATS_CLIENT: 'GET_CHATS_CLIENT', //Obtener chats 
  FILE:'FILE',
  GET_CHAT_MESSAGES: 'GET_CHAT_MESSAGES',
  MARK_AS_READ: 'MARK_AS_READ',
  GET_UNREAD_OWNERS: 'GET_UNREAD_OWNERS',
  CREATE_ADMIN: 'CREATE_ADMIN',
  GET_ADMINS: 'GET_ADMINS',
  DELETE_CHAT: 'DELETE_CHAT',
  PING: 'PING' //declaracion de mensaje ping pong para evitar desconexion por inactividad
};

// Rate limiter para conexiones por segundo (per IP)
const rateLimiterIP = new RateLimiterMemory({
  points: 5, // 5 connections
  duration: 1, // per 1 second
});

// Rate limiter para los mensajes por segundo
const rateLimiterConnection = new RateLimiterMemory({
  points: 10, // 10 mensajes
  duration: 1, // por 1 second
});


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
  const allowedOrigins = ['http://localhost:3000'];
  return allowedOrigins.includes(origin);
}


webSocketServer.on('request', (request) => {
  if (!originIsAllowed(request.origin)) {
    request.reject();
    console.log('Connection from origin ' + request.origin + ' rejected.');
    return;
  }

  const ip = request.remoteAddress;
  const handleRequest = async () => {
    try {
      await rateLimiterIP.consume(ip);
    } catch (rejRes) {
      request.reject(429, 'Too Many Requests');
      console.log(`Connection from IP ${ip} rejected due to rate limiting.`);
      return;
    }

    const connection = request.accept(null, request.origin);
    console.log('Connection accepted from origin:', request.origin);

    let token = null;

    connection.on('message', async (message) => {
      try {
        await rateLimiterConnection.consume(connection.remoteAddress);
      } catch (rejRes) {
        connection.sendUTF(JSON.stringify({ error: 'Too Many Requests' }));
        return;
      }

      let msg;
      try {
        msg = JSON.parse(message.utf8Data);
      } catch (error) {
        console.error('Invalid JSON message received:', error);
        return;
      }

      console.log('Received message:', msg);

      if (msg.type !== MESSAGE_TYPES.LOGIN) {
        const token = msg.token;
        if (!token) {
          connection.sendUTF(JSON.stringify({ error: 'Token missing' }));
          connection.close();
          return;
        }

        try {
          const decoded = jwt.verify(token, SECRET_KEY);
          connection.user_id = decoded.user_id;
          connection.role = decoded.role;
          connection.area_id = decoded.area_id;
        } catch (error) {
          if (error.name === 'TokenExpiredError') {
            // Cuando el token expira generamos uno nuevo
            const newToken = jwt.sign({
              user_id: connection.user_id,
              role: connection.role,
              area_id: connection.area_id,
            }, SECRET_KEY, { expiresIn: '1h' }); // Nueva expiración 
    
            // Enviar el nuevo token al cliente
            connection.sendUTF(JSON.stringify({ type: 'NEW_TOKEN', token: newToken }));
    
            console.log('Token expired, new token issued');
            return; // Opcional, si quieres permitir la ejecución con el nuevo token
          } else {
            console.error('Invalid token:', error);
            connection.sendUTF(JSON.stringify({ error: 'Invalid token' }));
            connection.close();
            return;
          }
        }
      }

      try {
        switch (msg.type) {
          case MESSAGE_TYPES.LOGIN:
            await handleLogin(connection, msg);
            isAuthenticated = true
            break;
          case MESSAGE_TYPES.SELECT_AREA:
            await handleSelectArea(connection, msg);
            break;
          case MESSAGE_TYPES.MESSAGE:
            await handleMessage(connection, msg);
            break;
          case MESSAGE_TYPES.REPORT_MESSAGE:
            await handleReportMessage(connection, msg);
            break;
          case MESSAGE_TYPES.FINALIZE:
            await handleMessage(connection, msg);
            break;
          case MESSAGE_TYPES.REDIRECT_CHAT:
            await handleRedirectChat(connection, msg);
            break;
          case MESSAGE_TYPES.GET_CHATS:
            await handleGetChatsNotAssigned(connection);
            break;
          case MESSAGE_TYPES.GET_CHATS_ASSIGNED:
            await handleGetChatsAssigned(connection);
            break;
          case MESSAGE_TYPES.GET_CHATS_FINALIZED:
            await handleGetChatsFinalized(connection);
            break;
          case MESSAGE_TYPES.GET_CHATS_ASSIGNED_BY_NAME:
            await handleGetChatsAssignedByName(connection, msg.admin_Name);
            break;
          case MESSAGE_TYPES.GET_CHATS2:
            await handleGetChats2(msg.area_id, msg.current_url);
            break;
          case MESSAGE_TYPES.GET_CHATS3:
            await handleGetChats3(msg);
            break;
          case MESSAGE_TYPES.GET_CHATS_CLIENT:
            await handleGetChatsClient(connection, msg.chat_id); // Pasa connection y chat_id
            break; 
          case MESSAGE_TYPES.GET_CHAT_MESSAGES:
            await handleGetChatMessages(connection, msg);
            break;
          case MESSAGE_TYPES.MARK_AS_READ:
            await handleMarkAsRead(msg);
            break;
          case MESSAGE_TYPES.DELETE_CHAT:
            await handleDeleteChat(msg);
            break;
          case MESSAGE_TYPES.GET_ADMINS:
            await handleShowAdminList(connection, msg);
            break;
          case MESSAGE_TYPES.CREATE_ADMIN:
            await handleCreateAdmin(connection, msg);
            break;
          case MESSAGE_TYPES.FILE:
              // Manejar los mensajes de archivo
            await handleFileMessage(msg, connection);
            break;
          case MESSAGE_TYPES.PING: //cuando se recibe el mensaje ping se manda un mensaje pongo al cliente (admin.js)
            connection.sendUTF(JSON.stringify({ type: 'PONG'}));
            break;
          default:
            console.log('Unknown message type:', msg.type);
        }
      } catch (error) {
        console.error(`Error processing message of type ${msg.type}:`, error);
      }
    });

    connection.on('close', (reasonCode, description) => {
      console.log('Client has disconnected.');
      if (token) {
        authenticatedTokens.delete(token);
      }
    });
  };

  handleRequest();
});


async function handleLogin(connection, msg) {
  console.log('Processing LOGIN');
  try {
    let url = `${API_BASE_URL}/auth_user.php`;
    let body = { email_or_name: msg.email_or_name };

    if (msg.password) {
      url = `${API_BASE_URL}/auth_admin.php`;
      body.password = msg.password;
    }

    const response = await fetchWrapper(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body),
    });

    if (!response.ok) throw new Error('Network response was not ok');
    
    const authData = await response.json();
    console.log('Auth data:', authData);

        // Generar JWT
        const token = jwt.sign({
          user_id: authData.user_id,
          role: authData.role,
          area_id: authData.area_id,
        }, SECRET_KEY, { expiresIn: '1h' }); // El token expira en 1 hora

    connection.role = authData.role;
    connection.user_id = authData.user_id;
    connection.name = authData.name;
    connection.area_id = authData.area_id;
    connection.type_admin = authData.type_admin
    connection.current_url = authData.current_url

    if (authData.role === 'admin') {
      connection.sendUTF(JSON.stringify({ type: 'LOGIN_SUCCESS', 
        role: 'admin', 
        user_id: authData.user_id, 
        IsAdmin: 1, 
        area_id: authData.area_id, 
        name: authData.name, 
        type_admin: authData.type_admin, 
        current_url: authData.current_url,
        token }));
    } else if (authData.role === 'client') {
      connection.sendUTF(JSON.stringify({ type: 'LOGIN_SUCCESS', 
        role: 'client', 
        user_id: authData.user_id, 
        IsAdmin: 0, 
        name: authData.name,
      token}));
      connection.sendUTF(JSON.stringify({
        type: 'WELCOME',
        message: 'Bienvenido! ¿Qué problema tienes? ',
      }));
    } else {
      connection.sendUTF(JSON.stringify({ type: 'LOGIN_FAILURE' }));
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    connection.sendUTF(JSON.stringify({ type: 'LOGIN_FAILURE' }));
  }
}


async function handleShowAdminList(connection, msg) {
  console.log('Received message:', msg); // Agregado para depuración

  try {
    if (!msg.user_mom_id) {
      throw new Error('user_mom_id no está definido en el mensaje recibido');
    }

    const url = `${API_BASE_URL}/obtener_admins.php`;
    const params = new URLSearchParams({ user_mom_id: msg.user_mom_id });

    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Error en la respuesta: ${response.statusText}`);
    }

    // Asegúrate de que estás utilizando la variable correcta
    const admins = await response.json();
    
    // Verifica si el resultado es un array anidado
    if (Array.isArray(admins) && Array.isArray(admins[0])) {
      // Aplana el array
      const flattenedAdmins = admins.flat();
      connection.sendUTF(JSON.stringify({ type: 'GET_ADMINS', admins: flattenedAdmins }));
    } else {
      connection.sendUTF(JSON.stringify({ type: 'GET_ADMINS', admins }));
    }

  } catch (error) {
    console.error('Error al mostrar usuarios:', error);
  }
}


async function handleSelectArea(connection, msg) {
  if (connection.role !== 'client') return;
  console.log('Processing area selection:', msg);
  console.log(msg.current_url);

  const validAreas = ['1', '2', '3'];
  connection.area_id = validAreas.includes(msg.area_id.toString()) ? msg.area_id : '1';
  connection.current_url = msg.current_url;

  try {
    const chatData = await getOrCreateChat(connection, msg);
    console.log('Chat data:', chatData);

    // Enviar la respuesta al cliente con el área seleccionada y current_url
    connection.sendUTF(JSON.stringify({ type: 'AREA_SELECTED', area_id: connection.area_id, current_url: connection.current_url, user: connection.name}));
    notifyAdminsAboutNewChat(connection, chatData.chat_id);
  } catch (error) {
    console.error('Error creating or checking chat:', error);
  }
}

async function getOrCreateChat(connection, msg) {
  // Verificar si el chat ya existe
  console.log("buscando chat con: " + connection.current_url + " user_ name: " + connection.name + " areaid: " + connection.area_id);
  const checkChatResponse = await fetchWrapper(`${API_BASE_URL}/check_chat.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ user_id: connection.user_id, area_id: connection.area_id, current_url: connection.current_url }),
  });

  if (!checkChatResponse.ok) throw new Error('Network response was not ok');

  const chatData = await checkChatResponse.json();
  console.log("El area id es : " + msg.area_id)

  if (chatData.chat_id) {
    connection.chat_id = chatData.chat_id;
    connection.area_id = chatData.area_id
    console.log("el chat ya existe " + connection.current_url + " area_id: " + msg.area_id)
    return chatData;
  } else {
    // Crear un nuevo chat si no existe
    console.log("no existe un chat, creando nuevo chat con url " + connection.current_url + msg.area_id)
    const chatResponse = await fetchWrapper(`${API_BASE_URL}/start_chat.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ user_id: connection.user_id, area_id: msg.area_id, current_url: connection.current_url, name:connection.name }),
    });

    if (!chatResponse.ok) throw new Error('Network response was not ok');

    const newChatData = await chatResponse.json();
    connection.chat_id = newChatData.chat_id;
    connection.area_id= newChatData.area_id
    return newChatData;
  }
}



function notifyAdminsAboutNewChat(connection, chat_id) {
  webSocketServer.connections.forEach((conn) => {
    if (conn.role === 'admin' && conn.area_id === connection.area_id) {
      conn.sendUTF(JSON.stringify({ type: 'NEW_CHAT', chat_id, user_id: connection.user_id, area_id: connection.area_id }));
    }
  });
}

async function handleMessage(connection, msg) {
  console.log('Processing MESSAGE:', msg);
  try {
    const chat_id = msg.chat_id || connection.chat_id;
    if (!chat_id) throw new Error('Chat ID is null. Cannot save message.');

    const response = await fetchWrapper(`${API_BASE_URL}/save_message.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        chat_id,
        text: msg.text,
        owner_id: connection.user_id || msg.owner_id,
        role: msg.role || (connection.role === 'admin' ? 'Admin' : 'Client'),
        IsAdmin: msg.IsAdmin,
        chat_finalized: msg.chat_finalized
      }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const savedMessage = await response.json();
 

    webSocketServer.connections.forEach((conn) => {
      if (conn.chat_id === chat_id ) {
        conn.sendUTF(JSON.stringify({ type: 'MESSAGE', message: savedMessage }));
      }
    });

    // Verificamos si el mensaje es de un cliente (IsAdmin === 0) y si tiene area_id
    //AQui es donde se manda el mensaje para actuliazar las notificaciones cuando se manda un mensaje del lado del client
    if (msg.IsAdmin === 0) {
      console.log('Notifying admins for area:', msg.area_id);
      await handleGetChats2(msg.area_id, msg.current_url);
    } else if (msg.IsAdmin === 0 && !msg.area_id) {
      console.warn('Message from client does not have area_id:', msg);
    }

  } catch (error) {
    console.error('Error in handleMessage:', error);
  }
}

async function handleFileMessage(connection, msg) {
  console.log('Processing FILE MESSAGE:', msg);
  try {
    const chat_id = msg.chat_id || connection.chat_id;
    if (!chat_id) throw new Error('Chat ID is null. Cannot save file message.');

    // Crear un nuevo objeto FormData
    const formData = new FormData();
    formData.append('chat_id', chat_id);
    formData.append('owner_id', connection.user_id || msg.owner_id);
    formData.append('IsAdmin', msg.IsAdmin);

    // Asumimos que `msg.file` es el archivo que deseas subir
    if (msg.file) {
      formData.append('image', msg.file);
    } else {
      throw new Error('No file found in message');
    }

    // Enviar la solicitud con fetch
    const response = await fetchWrapper(`${API_BASE_URL}/upload_images.php`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const savedFile = await response.json();
    webSocketServer.connections.forEach((conn) => {
      if (conn.chat_id === chat_id) {
        conn.sendUTF(JSON.stringify({ type: 'FILE_RECEIVED', file: savedFile }));
      }
    });
  } catch (error) {
    console.error('Error handling file message:', error);
    // Aquí podrías enviar un mensaje de error a través de WebSocket si es necesario
  }
}



async function handleReportMessage(connection, msg) {
  console.log('Processing REPORT_MESSAGE:', msg);
  try {
    const chat_id = msg.chat_id || connection.chat_id;
    if (!chat_id) throw new Error('Chat ID is null. Cannot save message.');

    const response = await fetchWrapper(`${API_BASE_URL}/save_message.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        chat_id,
        text: msg.message.text,
        owner_id: msg.owner_id,
        role: 'system',
        IsAdmin: msg.IsAdmin
      }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const savedMessage = await response.json();
    webSocketServer.connections.forEach((conn) => {
      if (conn.chat_id === chat_id) {
        conn.sendUTF(JSON.stringify({ type: 'MESSAGE', message: savedMessage }));
      }
    });
  } catch (error) {
    console.error('Error saving report message:', error);
  }
}

async function handleRedirectChat(connection, msg) {
  if (connection.role !== 'admin') return;
  console.log('Processing REDIRECT_CHAT:', msg);

  try {
    const response = await fetchWrapper(`${API_BASE_URL}/redirect_chat.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        chat_id: msg.chat_id,
        new_area_id: msg.new_area_id,
      }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const updatedChat = await response.json();

    webSocketServer.connections.forEach((conn) => {
      if (conn.role === 'admin' && (conn.area_id == msg.new_area_id || conn.area_id == connection.area_id)) {
        conn.sendUTF(JSON.stringify({ type: 'CHAT_REDIRECTED', chat: updatedChat }));
      }
    });
  } catch (error) {
    console.error('Error redirecting chat:', error);
  }
}

async function handleGetChatsNotAssigned(connection) {
  console.log('handleGetChats called for user:', connection.user_id, 'role:', connection.role, 'area_id:', connection.area_id, 'current_url:', connection.current_url);
  if (connection.role !== 'admin') {
    console.log('User is not admin, aborting GET_CHATS. User details:', {
      user_id: connection.user_id,
      role: connection.role,
      area_id: connection.area_id,
      name: connection.name,
    });
    return;
  }
  console.log('Processing GET_CHATS for area_id:', connection.area_id);
  try {
    const response = await fetchWrapper(`${API_BASE_URL}/get_chats.php?area_id=${connection.area_id}&current_url=${connection.current_url}`);
    if (!response.ok) throw new Error('Network response was not ok');

    const chats = await response.json();
    // Filtrar los chats que tienen IsAssigned igual a 0
    const unassignedChats = chats.filter(chat => chat.IsAssigned === 0 && chat.Finalizado===0);

    // Enviar solo los chats sin asignar al admin
    connection.sendUTF(JSON.stringify({ type: 'CHATS', chats: unassignedChats }));
  } catch (error) {
    console.error('Error fetching chats:', error);
  }
}

async function handleGetChatsAssigned(connection) {
  console.log('handleGetChats called for user:', connection.user_id, 'role:', connection.role, 'area_id:', connection.area_id, 'current_url:', connection.current_url);
  if (connection.role !== 'admin') {
    console.log('User is not admin, aborting GET_CHATS. User details:', {
      user_id: connection.user_id,
      role: connection.role,
      area_id: connection.area_id,
      name: connection.name,
    });
    return;
  }
  console.log('Processing GET_CHATS for area_id:', connection.area_id);
  try {
    const response = await fetchWrapper(`${API_BASE_URL}/get_chats.php?area_id=${connection.area_id}&current_url=${connection.current_url}`);
    if (!response.ok) throw new Error('Network response was not ok');

    const chats = await response.json();
    // Filtrar los chats que tienen IsAssigned igual a 0
    const unassignedChats = chats.filter(chat => chat.IsAssigned === 1 && chat.admin_name === connection.name);

    // Enviar solo los chats sin asignar al admin
    connection.sendUTF(JSON.stringify({ type: 'CHATS', chats: unassignedChats }));
  } catch (error) {
    console.error('Error fetching chats:', error);
  }
}

async function handleGetChatsFinalized(connection) {
  console.log('handleGetChats called for user:', connection.user_id, 'role:', connection.role, 'area_id:', connection.area_id, 'current_url:', connection.current_url);
  if (connection.role !== 'admin') {
    console.log('User is not admin, aborting GET_CHATS. User details:', {
      user_id: connection.user_id,
      role: connection.role,
      area_id: connection.area_id,
      name: connection.name,
    });
    return;
  }
  console.log('Processing GET_CHATS for area_id:', connection.area_id);
  try {
    const response = await fetchWrapper(`${API_BASE_URL}/get_chats.php?area_id=${connection.area_id}&current_url=${connection.current_url}`);
    if (!response.ok) throw new Error('Network response was not ok');

    const chats = await response.json();
    // Filtrar los chats que tienen finalizado = 1
    const unassignedChats = chats.filter(chat => chat.Finalizado===1);

    // Enviar solo los chats sin asignar al admin
    connection.sendUTF(JSON.stringify({ type: 'CHATS', chats: unassignedChats }));
  } catch (error) {
    console.error('Error fetching chats:', error);
  }
}

async function handleGetChatsAssignedByName(connection, admin_Name) {
  console.log('handleGetChats called for user:', connection.user_id, 'role:', connection.role, 'area_id:', connection.area_id, 'current_url:', connection.current_url, 'nombre del asesor del que se buscan chats asignados:', admin_Name);
  if (connection.role !== 'admin') {
    console.log('User is not admin, aborting GET_CHATS. User details:', {
      user_id: connection.user_id,
      role: connection.role,
      area_id: connection.area_id,
      name: connection.name,
    });
    return;
  }
  console.log('Processing GET_CHATS for area_id:', connection.area_id, 'asesor name:', admin_Name);
  try {
    const response = await fetchWrapper(`${API_BASE_URL}/get_chats.php?area_id=${connection.area_id}&current_url=${connection.current_url}`);
    if (!response.ok) throw new Error('Network response was not ok');

    const chats = await response.json();
    // Filtrar los chats que estan asignados por nombre del asesor 
    const AssignedByNamesChats = chats.filter(chat => chat.admin_name===admin_Name && chat.IsAssigned === 1);

    // Enviar solo los chats sin asignar al admin
    connection.sendUTF(JSON.stringify({ type: 'CHATS', chats: AssignedByNamesChats }));
  } catch (error) {
    console.error('Error fetching chats:', error);
  }
}

async function handleGetChatMessages(connection, msg) {
  if (connection.role !== 'admin') return;
  console.log('Processing GET_CHAT_MESSAGES:', msg);

  try {
    const response = await fetchWrapper(`${API_BASE_URL}/get_messages.php?chat_id=${msg.chat_id}`);
    if (!response.ok) throw new Error('Network response was not ok');

    const messages = await response.json();
    connection.chat_id = msg.chat_id;
    connection.sendUTF(JSON.stringify({ type: 'CHAT_MESSAGES', chat_id: msg.chat_id, messages }));
  } catch (error) {
    console.error('Error fetching chat messages:', error);
  }
}

async function handleGetChats2(area_id, current_url) {
  console.log('nuevo mensaje enviado Processing GET_CHATS for area_id:', area_id, current_url);
  try {
    const response = await fetchWrapper(`${API_BASE_URL}/get_chats.php?area_id=${area_id}&current_url=${current_url}`);
    console.log("api get chats");
    if (!response.ok) throw new Error('Network response was not ok');

    const chats = await response.json();
    webSocketServer.connections.forEach((conn) => {
      if (conn.role === 'admin' && conn.area_id === area_id) {
        conn.sendUTF(JSON.stringify({ type: 'CHATS_NOTIF', chats }));
      }
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
  }
}

async function handleGetChats3(msg) {
  console.log('nuevo mensaje enviado Processing GET_CHATS for area_id:', msg.area_id, msg.current_url);
  try {
    const response = await fetchWrapper(`${API_BASE_URL}/get_chats.php?area_id=${msg.area_id}&current_url=${msg.current_url}`);
    console.log("api get chats");
    if (!response.ok) throw new Error('Network response was not ok');

    const chats = await response.json();
    webSocketServer.connections.forEach((conn) => {
      if (msg.role === 'admin') {
        conn.sendUTF(JSON.stringify({ type: 'CHATS', chats }));
      }
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
  }
}

async function handleGetChatsClient(connection, chat_id) {
  console.log('Processing GET_CHATS_CLIENT for chat_id:', chat_id);
  try {
    const response = await fetchWrapper(`${API_BASE_URL}/get_chats_client.php?chat_id=${chat_id}`);
    if (!response.ok) throw new Error('Network response was not ok');

    const chats = await response.json();
    connection.sendUTF(JSON.stringify({ type: 'CHATS_CLIENT', chats }));
  } catch (error) {
    console.error('Error fetching client chats:', error);
  }
}

async function handleCreateAdmin(connection, msg) {
  try {
    const url = `${API_BASE_URL}/create_admin.php`;
    const body = JSON.stringify({
      name: msg.name,
      email: msg.email,
      area_id: msg.area_id,
      contrasena: msg.contrasena,
      type_admin: msg.type_admin,
      user_mom: msg.user_mom,
      user_mom_id: msg.user_mom_id,
      current_url: msg.current_url
    });

    // Asegúrate de que fetchWrapper esté bien definido
    const response = await fetchWrapper(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });

    // Asegúrate de que la respuesta esté en formato JSON
    const result = await response.json();

    // Asegúrate de que `sendUTF` es el método correcto para enviar datos
    connection.sendUTF(JSON.stringify(result));

  } catch (error) {
    console.error('Error creating admin:', error);
    // Maneja los errores enviando una respuesta adecuada
    connection.sendUTF(JSON.stringify({ success: false, message: 'Failed to create admin' }));
  }
}

async function handleMarkAsRead(msg) {
  console.log('Processing MARK_AS_READ:', msg);
  try {
    const response = await fetchWrapper(`${API_BASE_URL}/mark_messages_read.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ chat_id: msg.chat_id }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const result = await response.json();
    console.log('Messages marked as read:', result);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
}



async function handleDeleteChat(msg) {
  console.log('Processing DELETE_CHAT:', msg);

  try {
    const response = await fetchWrapper(`${API_BASE_URL}/delete_chat.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ chat_id: msg.chat_id }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const result = await response.json();
    console.log('Chat deleted:', result);

    webSocketServer.connections.forEach((conn) => {
      if (conn.role === 'admin') {
        conn.sendUTF(JSON.stringify({ type: 'CHAT_DELETED', chat_id: msg.chat_id }));
      }
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
  }
}

server.listen(3001, () => {
  console.log('WebSocket server is listening on port 3001');
});