<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Establecer la zona horaria correcta
date_default_timezone_set('America/Mexico_City');

header("Access-Control-Allow-Origin: http://localhost:3000"); // Cambia esto según sea necesario
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

include 'db.php'; // Asegúrate de tener tu conexión a la base de datos configurada aquí

$data = json_decode(file_get_contents('php://input'), true);

// Validar los parámetros requeridos
if (!isset($data['area_id'], $data['id'])) {
    echo json_encode(['error' => 'Todos los parámetros son requeridos']);
    exit;
}

$id = (int)$data['id']; // Identificador del registro a actualizar
$area_id = (int)$data['area_id']; // Convertir a entero si es necesario

// Consulta de actualización
$sql = "UPDATE admin SET area_id = ? WHERE id = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(['error' => 'Error en la preparación de la consulta: ' . $conn->error]);
    exit;
}

// Asignar los parámetros correctamente (ambos son enteros)
$stmt->bind_param('ii', $area_id, $id);

if ($stmt->execute()) {
    // Devolver los datos actualizados
    echo json_encode([
        'success' => true,
        'message' => 'Área actualizada',
        'data' => [
            'id' => $id,
            'area_id' => $area_id,
        ]
    ]);
} else {
    echo json_encode(['error' => 'Error al actualizar el admin: ' . $stmt->error]);
}

// Cerrar la declaración y la conexión
$stmt->close();
$conn->close();
?>
