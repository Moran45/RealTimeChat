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

$chat_id = $_POST['chat_id'];
$new_area_id = $_POST['new_area_id'];

$sql = "UPDATE chats SET area_id = ?, updated_at = NOW() WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $new_area_id, $chat_id);

if ($stmt->execute()) {
    echo json_encode(['chat_id' => $chat_id, 'new_area_id' => $new_area_id]);
} else {
    echo json_encode(['error' => 'Error al redirigir el chat']);
}
?>
