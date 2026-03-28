<?php

// 1. Create temporary writable folders for Laravel in Vercel's /tmp directory
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

// 2. Tell Laravel to use these temporary folders
putenv('VIEW_COMPILED_PATH=/tmp/storage/framework/views');

// 3. Boot Laravel
require __DIR__ . '/../public/index.php';
