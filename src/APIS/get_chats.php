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

// Verificar si area_id está presente en la solicitud
if (!isset($_GET['area_id'])) {
    echo json_encode(['error' => 'Falta el parámetro area_id']);
    exit;
}

$area_id = $_GET['area_id'];

$sql = "SELECT c.id as chat_id, u.name as user_name, u.email as user_email,
        (SELECT COUNT(*) FROM message m WHERE m.chat_id = c.id AND m.status = 'unread') as unread_count 
        FROM chats c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.area_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $area_id);
$stmt->execute();
$result = $stmt->get_result();

$chats = [];
while ($row = $result->fetch_assoc()) {
    $chat_id = $row['chat_id'];
    
    // Obtener los mensajes del chat
    $messages_sql = "SELECT m.text, m.timestamp, m.status, 
                            IF(m.owner_id = u.id, 'Cliente', 'Admin') as role 
                     FROM message m 
                     JOIN users u ON m.owner_id = u.id 
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
