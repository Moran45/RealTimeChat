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

$chat_id = $_GET['chat_id'];

$sql = "SELECT m.text, m.IsAdmin, m.timestamp, 
               IF(m.owner_id = c.user_id, 'Cliente', 'Admin') as role 
        FROM message m 
        JOIN chats c ON m.chat_id = c.id 
        WHERE m.chat_id = ? 
        ORDER BY m.timestamp";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $chat_id);
$stmt->execute();
$result = $stmt->get_result();

$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = $row;
}

echo json_encode($messages);
?>