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

$user_id = $_POST['user_id'] ?? null;
$area_id = $_POST['area_id'] ?? null;
$current_url = $_POST['current_url'] ?? null;

if ($user_id === null || $area_id === null || $current_url === null) {
    die(json_encode(['error' => 'User ID, Area ID, and Current URL are required.']));
}

// Buscar un chat existente
$sql = "SELECT id FROM chats WHERE user_id = ? AND area_id = ? AND current_url = ? LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iis", $user_id, $area_id, $current_url);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    $stmt->bind_result($chat_id);
    $stmt->fetch();
    echo json_encode(['chat_id' => $chat_id]);
} else {
    echo json_encode(['chat_id' => null]);
}

$stmt->close();
$conn->close();
?>
