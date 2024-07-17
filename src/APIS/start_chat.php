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

if ($user_id === null) {
    die("User ID are required.");
}
if ($area_id === null) {
    die("Area ID are required.");
}

// Buscar un chat existente
$sql = "SELECT id FROM chats WHERE user_id = ? AND area_id = ? LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $user_id, $area_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // Chat existente encontrado
    echo json_encode(['chat_id' => $row['id']]);
} else {
    // Crear un nuevo chat si no existe uno abierto
    $sql = "INSERT INTO chats (user_id, area_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $user_id, $area_id);

    if ($stmt->execute()) {
        echo json_encode(['chat_id' => $stmt->insert_id]);
    } else {
        echo json_encode(['error' => 'Error al iniciar el chat']);
    }
}
?>
