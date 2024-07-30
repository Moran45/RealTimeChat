const WebSocketServer = require('websocket').server;
const http = require('http');
const { type } = require('os');

const API_BASE_URL = 'https://phmsoft.tech/Ultimochatlojuro';
const MESSAGE_TYPES = {
  LOGIN: 'LOGIN',
  SELECT_AREA: 'SELECT_AREA',
  MESSAGE: 'MESSAGE',
  REPORT_MESSAGE: 'REPORT_MESSAGE',
  FINALIZE: 'FINALIZE',
  REDIRECT_CHAT: 'REDIRECT_CHAT',
  GET_CHATS: 'GET_CHATS',
  GET_CHATS2:'GET_CHATS',
  GET_CHATS_CLIENT: 'GET_CHATS_CLIENT', //Obtener chats 
  GET_CHAT_MESSAGES: 'GET_CHAT_MESSAGES',
  MARK_AS_READ: 'MARK_AS_READ',
  GET_UNREAD_OWNERS: 'GET_UNREAD_OWNERS',
  CREATE_ADMIN: 'CREATE_ADMIN',
  GET_ADMINS: 'GET_ADMINS',
  DELETE_CHAT: 'DELETE_CHAT'
};

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

    try {
      switch (msg.type) {
        case MESSAGE_TYPES.LOGIN:
          await handleLogin(connection, msg);
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
          await handleGetChats(connection);
          break;
        case MESSAGE_TYPES.GET_CHATS2:
          await handleGetChats2(msg.area_id);
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
        case MESSAGE_TYPES.GET_UNREAD_OWNERS:
          await handleGetUnreadOwners(connection);
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
        default:
          console.log('Unknown message type:', msg.type);
      }
    } catch (error) {
      console.error(`Error processing message of type ${msg.type}:`, error);
    }
  });

  connection.on('close', (reasonCode, description) => {
    console.log('Client has disconnected.');
  });
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
    connection.role = authData.role;
    connection.user_id = authData.user_id;
    connection.name = authData.name;
    connection.area_id = authData.area_id;
    connection.type_admin = authData.type_admin

    if (authData.role === 'admin') {
      connection.sendUTF(JSON.stringify({ type: 'LOGIN_SUCCESS', role: 'admin', user_id: authData.user_id, IsAdmin: 1, area_id: authData.area_id, name: authData.name, type_admin: authData.type_admin }));
    } else if (authData.role === 'client') {
      connection.sendUTF(JSON.stringify({ type: 'LOGIN_SUCCESS', role: 'client', user_id: authData.user_id, IsAdmin: 0, name: authData.name}));
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

  const validAreas = ['1', '2', '3'];
  connection.area_id = validAreas.includes(msg.area_id.toString()) ? msg.area_id : '1';

  try {
    const chatData = await getOrCreateChat(connection);
    console.log('Chat data:', chatData);

    connection.sendUTF(JSON.stringify({ type: 'AREA_SELECTED', area_id: connection.area_id }));
    notifyAdminsAboutNewChat(connection, chatData.chat_id);
  } catch (error) {
    console.error('Error creating or checking chat:', error);
  }
}

async function getOrCreateChat(connection) {
  const checkChatResponse = await fetchWrapper(`${API_BASE_URL}/check_chat.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ user_id: connection.user_id, area_id: connection.area_id }),
  });

  if (!checkChatResponse.ok) throw new Error('Network response was not ok');

  const chatData = await checkChatResponse.json();

  if (chatData.chat_id) {
    connection.chat_id = chatData.chat_id;
    return chatData;
  } else {
    const chatResponse = await fetchWrapper(`${API_BASE_URL}/start_chat.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ user_id: connection.user_id, area_id: connection.area_id }),
    });

    if (!chatResponse.ok) throw new Error('Network response was not ok');

    const newChatData = await chatResponse.json();
    connection.chat_id = newChatData.chat_id;
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
      if (conn.chat_id === chat_id) {
        conn.sendUTF(JSON.stringify({ type: 'MESSAGE', message: savedMessage }));
      }
    });

    // Verificamos si el mensaje es de un cliente (IsAdmin === 0) y si tiene area_id
    if (msg.IsAdmin === 0) {
      console.log('Notifying admins for area:', msg.area_id);
      await handleGetChats2(msg.area_id);
    } else if (msg.IsAdmin === 0 && !msg.area_id) {
      console.warn('Message from client does not have area_id:', msg);
    }

  } catch (error) {
    console.error('Error in handleMessage:', error);
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

async function handleGetChats(connection) {
  console.log('handleGetChats called for user:', connection.user_id, 'role:', connection.role, 'area_id:', connection.area_id);
  if (connection.role !== 'admin') {
    console.log('User is not admin, aborting GET_CHATS. User details:', {
      user_id: connection.user_id,
      role: connection.role,
      area_id: connection.area_id,
      name: connection.name
    });
    return;
  }
  console.log('Processing GET_CHATS for area_id:', connection.area_id);
  try {
    const response = await fetchWrapper(`${API_BASE_URL}/get_chats.php?area_id=${connection.area_id}`);
    if (!response.ok) throw new Error('Network response was not ok');

    const chats = await response.json();
    connection.sendUTF(JSON.stringify({ type: 'CHATS', chats }));
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

async function handleGetChats2(area_id) {
  console.log('Processing GET_CHATS for area_id:', area_id);
  try {
    const response = await fetchWrapper(`${API_BASE_URL}/get_chats.php?area_id=${area_id}`);
    console.log("api get chats");
    if (!response.ok) throw new Error('Network response was not ok');

    const chats = await response.json();
    webSocketServer.connections.forEach((conn) => {
      if (conn.role === 'admin' && conn.area_id === area_id) {
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
      user_mom_id: msg.user_mom_id
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

async function handleGetUnreadOwners(connection) {
  console.log('Processing GET_UNREAD_OWNERS:');

  try {
    const response = await fetchWrapper(`${API_BASE_URL}/get_owners_messages_unread.php`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const unreadOwners = await response.json();
    console.log('Unread Owners Count:', unreadOwners.unread_count);
    connection.sendUTF(JSON.stringify({ type: 'UNREAD_OWNERS_COUNT', count: unreadOwners.unread_count }));
  } catch (error) {
    console.error('Error fetching unread owners count:', error);
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