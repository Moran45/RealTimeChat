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
$name = $_POST['name'] ?? null;

if ($user_id === null) {
    die("User ID is required.");
}
if ($area_id === null) {
    die("Area ID is required.");
}
if ($current_url === null) {
    die("Current URL is required.");
}
if ($name === null) {
    die("Name is required.");
}

// Buscar un chat existente
$sql = "SELECT id FROM chats WHERE user_id = ? AND area_id = ? AND current_url = ? AND user_name = ? LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iiss", $user_id, $area_id, $current_url, $name); // 's' para current_url y name
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // Chat existente encontrado
    echo json_encode([
        'chat_id' => $row['id'],
        'area_id' => $area_id // Se incluye el area_id en el JSON de respuesta
    ]);
} else {
    // Crear un nuevo chat si no existe uno abierto
    $sql = "INSERT INTO chats (user_id, area_id, created_at, updated_at, current_url, user_name) VALUES (?, ?, NOW(), NOW(), ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiss", $user_id, $area_id, $current_url, $name); // 's' para current_url y name

    if ($stmt->execute()) {
        echo json_encode([
            'chat_id' => $stmt->insert_id,
            'area_id' => $area_id // Se incluye el area_id en el JSON al crear un nuevo chat
        ]);
    } else {
        echo json_encode(['error' => 'Error al iniciar el chat']);
    }
}
?>
