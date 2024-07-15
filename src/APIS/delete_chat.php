<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

include 'db.php';

$chat_id = $_POST['chat_id'] ?? null;

if ($chat_id === null) {
    die(json_encode(['error' => 'Chat ID is required.']));
}

// Eliminar mensajes asociados al chat
$sql_delete_messages = "DELETE FROM message WHERE chat_id = ?";
$stmt_delete_messages = $conn->prepare($sql_delete_messages);
$stmt_delete_messages->bind_param("i", $chat_id);
$stmt_delete_messages->execute();
$stmt_delete_messages->close();

// Eliminar el chat
$sql_delete_chat = "DELETE FROM chats WHERE id = ?";
$stmt_delete_chat = $conn->prepare($sql_delete_chat);
$stmt_delete_chat->bind_param("i", $chat_id);
$stmt_delete_chat->execute();
$stmt_delete_chat->close();

$conn->close();

echo json_encode(['success' => 'Chat deleted successfully.']);
?>
