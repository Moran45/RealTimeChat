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
// Establecer la zona horaria correcta
date_default_timezone_set('America/Mexico_City');
// Verificar y sanitizar entradas
$chat_id = isset($_POST['chat_id']) ? intval($_POST['chat_id']) : null;
$text = isset($_POST['text']) ? htmlspecialchars($_POST['text'], ENT_QUOTES, 'UTF-8') : null;
$owner_id = isset($_POST['owner_id']);
$IsAdmin = isset($_POST['IsAdmin']) ? intval($_POST['IsAdmin']) : null;
$chat_finalized = isset($_POST['chat_finalized']) ? intval($_POST['chat_finalized']) : 0;
// Validar que los parámetros necesarios no estén vacíos
if ($chat_id === null || $text === null || $owner_id === null || $IsAdmin === null) {
    echo json_encode(['error' => 'Parámetros incompletos']);
    http_response_code(400);
    exit;
}
// Establecer el valor de status basado en IsAdmin
$status = $IsAdmin === 1 ? 'read' : 'unread';
$sql = "INSERT INTO message (chat_id, text, owner_id, timestamp, status, IsAdmin, chat_finalized) VALUES (?, ?, ?, NOW(), ?, ?, ?)";
$stmt = $conn->prepare($sql);
if ($stmt === false) {
    echo json_encode(['error' => 'Error en la preparación de la consulta']);
    http_response_code(500);
    exit;
}
$stmt->bind_param("isisii", $chat_id, $text, $owner_id, $status, $IsAdmin, $chat_finalized);
if ($stmt->execute()) {
    // Si chat_finalized es igual a 1, actualizar la tabla chats
    if ($chat_finalized === 1) {
        $updateSql = "UPDATE chats SET Finalizado = '1', IsAssigned = '0', admin_name = null WHERE id = ?";
        $updateStmt = $conn->prepare($updateSql);
        if ($updateStmt === false) {
            echo json_encode(['error' => 'Error en la preparación de la consulta de actualización']);
            http_response_code(500);
            exit;
        }
        $updateStmt->bind_param("i", $chat_id);
        if (!$updateStmt->execute()) {
            echo json_encode(['error' => 'Error al actualizar el estado del chat']);
            http_response_code(500);
            exit;
        }
        $updateStmt->close();
    }
    
    echo json_encode([
        'id' => $stmt->insert_id,
        'chat_id' => $chat_id,
        'text' => $text,
        'owner_id' => $owner_id,
        'timestamp' => date('Y-m-d H:i:s'),
        'status' => $status,
        'IsAdmin' => $IsAdmin,
        'chat_finalized' => $chat_finalized
    ]);
} else {
    echo json_encode(['error' => 'Error al guardar el mensaje']);
    http_response_code(500);
}
$stmt->close();
$conn->close();
?>