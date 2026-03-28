<?php

// 1. Create temporary folders
$tmpDirs = [
    '/tmp/storage/framework/views',
    '/tmp/storage/framework/cache/data',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/logs'
];

foreach ($tmpDirs as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
}
putenv('VIEW_COMPILED_PATH=/tmp/storage/framework/views');

// 2. The Nuclear Error Catcher
try {
    require __DIR__ . '/../public/index.php';
} catch (\Throwable $e) {
    echo "<div style='font-family: sans-serif; padding: 40px; background: #ffebee; color: #c62828;'>";
    echo "<h1>🚨 We caught the error!</h1>";
    echo "<h2>Exact Message: " . $e->getMessage() . "</h2>";
    echo "<p><strong>Where it crashed:</strong> " . $e->getFile() . " on line " . $e->getLine() . "</p>";
    echo "</div>";
}
