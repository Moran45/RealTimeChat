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

// Verificar si 'Id_Chat' y 'name' están presentes en el JSON decodificado
if (isset($data['Id_Chat']) && isset($data['name'])) {
    $Id = $data['Id_Chat'];
    $name = $data['name']; 

    // Incluir archivo de conexión a la base de datos
    include 'db.php';

    // Verificar si el chat no está finalizado (Finalizado = 0)
    $checkQuery = "SELECT Finalizado, admin_name FROM chats WHERE id = ?";
    $checkStmt = $conn->prepare($checkQuery);
    
    if ($checkStmt) {
        $checkStmt->bind_param("i", $Id);
        $checkStmt->execute();
        $checkStmt->bind_result($finalizado, $admin_name);
        $checkStmt->fetch();
        $checkStmt->close();

        // Convertir a entero por seguridad
        $finalizado = (int)$finalizado;

        // Solo proceder si Finalizado es 0 y admin_name es null
        if ($finalizado === 0 && $admin_name === null) {
            // Preparar la consulta SQL para actualizar el admin_name
            $updateQuery = "UPDATE chats SET admin_name = ?, IsAssigned = 1 WHERE id = ?";
            $stmt = $conn->prepare($updateQuery);
            
            if ($stmt) {
                // Bind de los parámetros a la consulta
                $stmt->bind_param("si", $name, $Id);
                
                // Ejecutar la consulta y verificar si fue exitosa
                if ($stmt->execute()) {
                    echo json_encode(array(
                        "id" => $Id,
                        "nombre_actualizado" => $name,
                        "success" => true
                    ));
                } else {
                    echo json_encode(array(
                        "error" => "Error al ejecutar la actualización",
                        "success" => false
                    ));
                }

                // Cerrar el statement
                $stmt->close();
            } else {
                echo json_encode(array(
                    "error" => "Error al preparar la consulta de actualización",
                    "success" => false
                ));
            }
        } else {
            echo json_encode(array(
                "message" => "El chat ya está finalizado o ya esta asignado a un admin",
                "success" => true
            ));
        }
    } else {
        echo json_encode(array(
            "error" => "Error al preparar la consulta de verificación",
            "success" => false
        ));
    }

    // Cerrar la conexión
    $conn->close();
} else {
    // Responder con un error si 'Id_Chat' o 'name' no están presentes
    echo json_encode(array(
        "error" => "Id_Chat o name no proporcionados",
        "success" => false
    ));
}
?>
