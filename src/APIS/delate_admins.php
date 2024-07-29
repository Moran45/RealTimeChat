<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Establecer la zona horaria correcta
date_default_timezone_set('America/Mexico_City');

header("Access-Control-Allow-Origin: http://localhost:3000"); // Cambia esto según sea necesario
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

include 'db.php'; // Asegúrate de tener tu conexión a la base de datos configurada aquí

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    echo json_encode(['error' => 'El parámetro id es requerido']);
    exit;
}

$id = (int)$data['id']; // Identificador del registro a eliminar

// Consulta de eliminación
$sql = "DELETE FROM admin WHERE id = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['error' => 'Error en la preparación de la consulta: ' . $conn->error]);
    exit;
}

// Asignar el parámetro (campo entero)
$stmt->bind_param('i', $id);

if ($stmt->execute()) {
    // Comprobar si se eliminó alguna fila
    if ($stmt->affected_rows > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Admin eliminado exitosamente'
        ]);
    } else {
        echo json_encode(['error' => 'No se encontró el admin con el ID especificado']);
    }
} else {
    echo json_encode(['error' => 'Error al eliminar el admin: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
