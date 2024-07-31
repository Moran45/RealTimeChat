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

// Obtener el parámetro user_mom_id de la solicitud
$user_mom_id = isset($_GET['user_mom_id']) ? $_GET['user_mom_id'] : '';

// Validar el parámetro
if (empty($user_mom_id)) {
    echo json_encode(['error' => 'El parámetro user_mom_id es requerido']);
    $conn->close();
    exit;
}

// Preparar la consulta con la cláusula WHERE
$sql = "SELECT id, name, email, area_id, contrasena, type_admin FROM admin WHERE user_mom_id = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['error' => 'Error en la preparación de la consulta: ' . $conn->error]);
    $conn->close();
    exit;
}

// Asignar el parámetro y ejecutar la consulta
$stmt->bind_param('s', $user_mom_id);
$stmt->execute();

$result = $stmt->get_result();
$admins = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $admins[] = $row;
    }
}

// Devolver los resultados en formato JSON
echo json_encode([ $admins]);

$stmt->close();
$conn->close();
?>
