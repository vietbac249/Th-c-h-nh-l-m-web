
import { PHPFile } from '../types';

export const PHP_FILES: PHPFile[] = [
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    content: `# HƯỚNG DẪN KHẮC PHỤC LỖI KHI TRIỂN KHAI

Nếu bạn đẩy lên hosting và gặp lỗi (Trang trắng, Lỗi 500, hoặc 404), hãy kiểm tra theo các bước sau:

## 1. Lỗi Trang Trắng hoặc 500 (Internal Server Error)
*   **Nguyên nhân 1: Chưa có thư mục \`vendor\`**. Bạn phải chạy \`composer install\` ở máy local rồi mới up cả thư mục \`vendor\` lên. Code không thể chạy nếu thiếu autoload.
*   **Nguyên nhân 2: Phiên bản PHP thấp**. Hãy vào cPanel -> **Select PHP Version** và chọn ít nhất là **8.1** hoặc **8.2**.
*   **Nguyên nhân 3: File \`.htaccess\` lỗi**. Một số hosting yêu cầu thêm dòng \`RewriteBase /\` ngay sau \`RewriteEngine On\`.

## 2. Lỗi "Lỗi kết nối cơ sở dữ liệu"
*   Hãy kiểm tra file \`.env\`. Đảm bảo tên database và user có tiền tố của hosting (Ví dụ: \`u12345_ecommerce\` chứ không phải chỉ là \`ecommerce\`).
*   Đảm bảo bạn đã Gán User vào Database trong MySQL Wizard.

## 3. Lỗi 404 khi bấm vào sản phẩm
*   Đảm bảo file \`.htaccess\` trong thư mục \`public/\` đã được tải lên. Trên hosting, các file có dấu chấm (.) thường bị ẩn, bạn cần bật "Show Hidden Files" trong File Manager để thấy nó.

## 4. Công cụ tự kiểm tra
Tôi đã viết sẵn file \`public/check.php\`. Bạn hãy truy cập \`tên-miền-của-bạn.com/check.php\` để xem báo cáo tình trạng hệ thống.`
  },
  {
    path: 'public/check.php',
    name: 'check.php',
    language: 'php',
    content: `<?php
/**
 * Công cụ chẩn đoán hệ thống dành cho Architect
 */
echo "<h1>Hệ thống chẩn đoán E-commerce</h1>";

$errors = [];
$success = [];

// 1. Kiểm tra phiên bản PHP
if (version_compare(PHP_VERSION, '8.0.0', '>=')) {
    $success[] = "Phiên bản PHP hiện tại: " . PHP_VERSION . " (Hợp lệ)";
} else {
    $errors[] = "Phiên bản PHP quá thấp: " . PHP_VERSION . ". Vui lòng nâng cấp lên ít nhất 8.0";
}

// 2. Kiểm tra các Extension cần thiết
$extensions = ['pdo_mysql', 'mbstring', 'openssl', 'curl'];
foreach ($extensions as $ext) {
    if (extension_loaded($ext)) {
        $success[] = "Extension '$ext': Đã cài đặt";
    } else {
        $errors[] = "Thiếu Extension: '$ext'. Hãy bật nó trong PHP Selector trên cPanel";
    }
}

// 3. Kiểm tra thư mục vendor
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    $success[] = "Thư mục vendor: Đã tìm thấy (Autoload hoạt động)";
} else {
    $errors[] = "Không tìm thấy thư mục 'vendor'. Bạn cần chạy 'composer install' và upload nó lên";
}

// 4. Kiểm tra file .env
if (file_exists(__DIR__ . '/../.env')) {
    $success[] = "File .env: Đã tồn tại";
} else {
    $errors[] = "Không tìm thấy file '.env'. Hãy đổi tên '.env.example' thành '.env'";
}

// Hiển thị kết quả
echo "<h2>Kết quả:</h2>";
if (!empty($errors)) {
    echo "<ul style='color: red;'>";
    foreach ($errors as $err) echo "<li>❌ $err</li>";
    echo "</ul>";
}

if (!empty($success)) {
    echo "<ul style='color: green;'>";
    foreach ($success as $succ) echo "<li>✅ $succ</li>";
    echo "</ul>";
}

if (empty($errors)) {
    echo "<p><b>Chúc mừng! Môi trường của bạn đã sẵn sàng. Nếu vẫn lỗi, hãy kiểm tra log lỗi trong file 'error_log' tại thư mục gốc.</b></p>";
}`
  },
  {
    path: 'public/.htaccess',
    name: 'public/.htaccess',
    language: 'apache',
    content: `RewriteEngine On
# Nếu hosting của bạn nằm trong thư mục con, hãy bỏ comment dòng dưới và sửa đúng tên thư mục
# RewriteBase /

RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [L]`
  },
  {
    path: 'public/index.php',
    name: 'index.php',
    language: 'php',
    content: `<?php
/**
 * Entry Point cho ứng dụng
 */
$autoload = __DIR__ . '/../vendor/autoload.php';

if (!file_exists($autoload)) {
    die("Lỗi: Không tìm thấy thư mục vendor. Hãy chạy 'composer install' và upload lên hosting.");
}

require_once $autoload;

// Khởi tạo Session an toàn
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
session_start();

// Tải file .env
$envPath = __DIR__ . '/../.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $_ENV[trim($name)] = trim($value);
        }
    }
}

// Router đơn giản
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Xử lý loại bỏ tên thư mục nếu install trong thư mục con
$scriptName = dirname($_SERVER['SCRIPT_NAME']);
$uri = str_replace($scriptName, '', $uri);
if ($uri == '') $uri = '/';

try {
    if ($uri === '/' || $uri === '/home') {
        echo "<h1>Trang chủ - Hệ thống đang hoạt động!</h1><p>Vui lòng cấu hình Database để xem sản phẩm.</p>";
    } else {
        http_response_code(404);
        echo "<h1>404 - Không tìm thấy trang</h1>";
    }
} catch (\Exception $e) {
    echo "Lỗi hệ thống: " . $e->getMessage();
}
`
  }
];
