<?php
// Enable error reporting for debugging (Remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if form is submitted via POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Validate and sanitize input
    $name = isset($_POST["name"]) ? htmlspecialchars(trim($_POST["name"])) : '';
    $email = isset($_POST["email"]) ? htmlspecialchars(trim($_POST["email"])) : '';
    $subject = isset($_POST["subject"]) ? htmlspecialchars(trim($_POST["subject"])) : '';
    $message = isset($_POST["message"]) ? htmlspecialchars(trim($_POST["message"])) : '';

    // Debugging: Check if all data received
    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        echo "missing_fields";
        exit;
    }

    // Prepare email
    $to = "gorurhat0@gmail.com";  // Replace with your email
    $fullMessage = "Name: $name\nEmail: $email\n\n$message";
    $headers = "From: $name <$email>\r\n";
    $headers .= "Reply-To: $email\r\n";

    // Send the email
    if (mail($to, $subject, $fullMessage, $headers)) {
        echo "success";
    } else {
        echo "mail_error";
    }
} else {
    echo "invalid_request";
}
?>
