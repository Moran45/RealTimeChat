<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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

$sql = "UPDATE chats SET unread_count = unread_count + 1 WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $chat_id);

if ($stmt->execute()) {
  echo json_encode(['success' => true]);
} else {
  echo json_encode(['error' => 'Error incrementing unread count']);
}

$stmt->close();
$conn->close();
?>
