<?php
// Configuración de la base de datos
$servername = "localhost";
$username = "u826891407_ChatVhneUser";
$password = "C123456789a.";
$dbname = "u826891407_ChatVhne";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

?>
