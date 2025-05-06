<?php
header('Content-Type: application/json');

// 获取请求参数中的目录路径
$dir = isset($_GET['dir']) ? $_GET['dir'] : '.';

if (!is_dir($dir)) {
    echo json_encode(['error' => 'Directory does not exist']);
    exit;
}

// 初始化数组用于存储目录和文件
$directories = [];
$files = [];

// 打开目录句柄
if ($dh = opendir($dir)) {
    while (($file = readdir($dh)) !== false) {
        if ($file === '.' || $file === '..') continue; // 跳过当前和父目录链接

        $fullPath = "$dir/$file";
        
        if (is_dir($fullPath)) {
            // 如果是目录，则添加到目录数组
            $directories[] = $file;
        } else {
            // 如果是文件，则添加到文件数组并记录文件大小
            $files[] = [
                'name' => $file,
                'size' => filesize($fullPath)
            ];
        }
    }
    closedir($dh);
} else {
    echo json_encode(['error' => 'Could not open directory']);
    exit;
}

// 对结果进行排序
sort($directories);
usort($files, function($a, $b) {
    return strcmp($a['name'], $b['name']);
});

// 返回JSON格式的数据
echo json_encode([
    'directories' => $directories,
    'files' => $files
]);
?>