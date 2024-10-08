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

// Verificar si chat_id está presente en la solicitud
if (!isset($_GET['chat_id'])) {
    echo json_encode(['error' => 'Falta el parámetro chat_id']);
    exit;
}

$chat_id = $_GET['chat_id'];

// Consulta para obtener los mensajes del chat desde el último chat finalizado con los campos especificados
$sql = "SELECT m.text, m.timestamp, m.status, m.IsAdmin,
       IF(m.IsAdmin = 0, 'Cliente', 'Admin') AS role 
FROM message m 
WHERE m.chat_id = ?
  AND m.timestamp >= NOW() - INTERVAL 1 WEEK
ORDER BY m.timestamp;";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $chat_id);  // Solo se enlaza un parámetro ya que solo se usa $chat_id una vez
$stmt->execute();
$result = $stmt->get_result();

$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = $row;
}

// Asegurar que solo se devuelve JSON
header('Content-Type: application/json');
echo json_encode($messages);
?>
