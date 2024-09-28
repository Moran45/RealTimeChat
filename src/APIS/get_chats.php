<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

include 'db.php';

// Verificar si area_id y current_url están presentes en la solicitud
if (!isset($_GET['area_id']) || !isset($_GET['current_url'])) {
    echo json_encode(['error' => 'Faltan los parámetros area_id o current_url']);
    exit;
}

$area_id = $_GET['area_id'];
$current_url = $_GET['current_url'];

// Consulta para obtener los chats filtrados por area_id y current_url
$sql = "SELECT c.id as chat_id, user_name as user_name, admin_name as admin_name, 
(SELECT COUNT(*) FROM message m WHERE m.chat_id = c.id AND m.status = 'unread') as unread_count 
FROM chats c 
WHERE c.area_id = ? AND c.current_url = ?;
";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $area_id, $current_url); // Cambiar a 'is', no 'i,s'
$stmt->execute();
$result = $stmt->get_result();

$chats = [];
while ($row = $result->fetch_assoc()) {
    $chat_id = $row['chat_id'];
    
    // Obtener los mensajes del chat
    $messages_sql = "SELECT m.text, m.timestamp, m.status, m.IsAdmin,
                            IF(m.IsAdmin = 0, 'Cliente', 'Admin') as role 
                     FROM message m 
                     WHERE m.chat_id = ?
                     ORDER BY m.timestamp";
    $messages_stmt = $conn->prepare($messages_sql);
    $messages_stmt->bind_param("i", $chat_id);
    $messages_stmt->execute();
    $messages_result = $messages_stmt->get_result();
    
    $messages = [];
    while ($message_row = $messages_result->fetch_assoc()) {
        $messages[] = $message_row;
    }

    $row['messages'] = $messages;
    $chats[] = $row;
}

// Asegurar que solo se devuelve JSON
header('Content-Type: application/json');
echo json_encode($chats);
?>
