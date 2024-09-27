<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuración de CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Manejo de solicitudes preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Leer el contenido JSON de la solicitud
$input = file_get_contents("php://input");
$data = json_decode($input, true); // Decodificar el JSON

// Verificar si 'Id_Chat' y 'nombre' están presentes en el JSON decodificado
if (isset($data['Id_Chat']) && isset($data['nombre'])) {
    $Id = $data['Id_Chat'];
    $nombre = $data['nombre'];

    // Incluir archivo de conexión a la base de datos
    include 'db.php';

    // Preparar la consulta SQL para actualizar el admin_name
    $query = "UPDATE chats SET admin_name = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    
    if ($stmt) {
        // Bind de los parámetros a la consulta
        $stmt->bind_param("si", $nombre, $Id);
        
        // Ejecutar la consulta y verificar si fue exitosa
        if ($stmt->execute()) {
            echo json_encode(array(
                "id" => $Id,
                "nombre_actualizado" => $nombre,
                "success" => true
            ));
        } else {
            echo json_encode(array(
                "error" => "Error al actualizar el admin_name",
                "success" => false
            ));
        }
        
        // Cerrar el statement
        $stmt->close();
    } else {
        echo json_encode(array(
            "error" => "Error en la preparación de la consulta",
            "success" => false
        ));
    }

    // Cerrar la conexión
    $conn->close();
} else {
    // Responder con un error si 'Id_Chat' o 'nombre' no están presentes
    echo json_encode(array(
        "error" => "Id_Chat o nombre no proporcionados",
        "success" => false
    ));
}
?>
