<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>多媒体播放器</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: Arial, sans-serif;
            overflow-x: hidden; /* 防止横向滚动 */
        }
        .container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            padding-top: 2%;  
            padding-bottom: 2%;  
            box-sizing: border-box; 
        }
        .player {
            flex: 3;
            max-height: 60vh; 
            background-color: #000;
            position: relative; 
        }
        .player video, .player img {
            width: 100%;
            height: 100%;
            object-fit: contain; 
        }
        .download-button {
            position: fixed; /* 固定定位 */
            bottom: 20px; 
            right: 20px; 
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #007bff;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            font-size: 1.2em;
            z-index: 1000;
            user-select: none; /* 禁止选择文本 */
            touch-action: none; /* 确保在移动端也能顺利拖动 */
        }
        .playlist {
            flex: 1;
            overflow-y: auto;
            background-color: #f4f4f4;
            padding: 10px;
            position: relative; 
        }
        .media-item {
            padding: 5px 0;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .media-item:hover {
            background-color: #ddd;
        }
        .media-item.active {
            color: blue; 
        }
        .media-item.image {
            color: green; 
        }
        .current-info {
            padding: 10px;
            background-color: #f4f4f4;
            text-align: center;
            margin-bottom: 10px;
        }
        /* 禁用全屏按钮 */
        video::-webkit-media-controls-fullscreen-button {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="current-info" id="currentInfo">
            <!-- 当前文件信息 -->
        </div>
        <div class="player" id="player">
            <video controls playsinline muted id="videoPlayer"></video>
            <img id="imgPlayer" style="display: none;" alt="Image Player">
        </div>
        <div class="playlist" id="playlist">
            <!-- 多媒体列表 -->
        </div>
    </div>
    <div class="download-button" id="downloadButton"></div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const player = document.getElementById('player');
            const videoPlayer = document.getElementById('videoPlayer');
            const imgPlayer = document.getElementById('imgPlayer');
            const playlist = document.getElementById('playlist');
            const currentInfo = document.getElementById('currentInfo');
            const downloadButton = document.getElementById('downloadButton');
            let currentPlaying = null;
            let mediaItems = [];
            let isDragging = false;
            let startX, startY, offsetLeft, offsetTop;

            // 假设这里有一个PHP脚本生成多媒体项目
            <?php
                $directory = '.'; // 当前目录
                $files = scandir($directory);
                $files = array_diff($files, array('.', '..')); 
                usort($files, function($a, $b) {
                    return strcmp($a, $b); 
                });
                foreach ($files as $index => $file) {
                    $extension = pathinfo($file, PATHINFO_EXTENSION);
                    if (in_array($extension, ['mp4', 'jpg', 'png'])) { 
                        echo "createMediaItem('$file', $index + 1, '$extension');\n";
                    }
                }
            ?>

            function createMediaItem(file, index, type) {
                const item = document.createElement('div');
                item.className = 'media-item ' + (type === 'mp4' ? '' : 'image');
                item.innerHTML = `<span>${index}. ${file}</span>`;
                item.onclick = function() {
                    if (currentPlaying) {
                        currentPlaying.classList.remove('active');
                    }
                    item.classList.add('active');
                    currentPlaying = item;
                    loadMedia(file, type);
                    updateCurrentInfo(index);
                };
                playlist.appendChild(item);
                mediaItems.push({ element: item, file: file, index: index, type: type });
            }

            function loadMedia(file, type) {
                if (type === 'mp4') {
                    videoPlayer.src = file;
                    videoPlayer.play();
                    videoPlayer.style.display = 'block';
                    imgPlayer.style.display = 'none';
                    videoPlayer.muted = true; // 设置视频默认静音
                } else {
                    imgPlayer.src = file;
                    imgPlayer.onload = function() {
                        imgPlayer.style.display = 'block';
                        videoPlayer.style.display = 'none';
                    };
                }
                downloadButton.dataset.file = file;
            }

            function updateCurrentInfo(index) {
                currentInfo.textContent = `总文件数: ${mediaItems.length} | 当前播放第 ${index} 个文件`;
            }

            videoPlayer.addEventListener('ended', function() {
                if (currentPlaying) {
                    currentPlaying.classList.remove('active');
                    currentPlaying = null;
                    currentInfo.textContent = `总文件数: ${mediaItems.length} | 当前无播放文件`;
                }
            });

            // 监听 muted 状态变化
            videoPlayer.addEventListener('volumechange', function() {
                if (!this.muted) {
                    console.log('用户已取消静音');
                } else {
                    console.log('用户已设置为静音');
                }
            });

            videoPlayer.addEventListener('play', function() {
                if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                    this.setAttribute('webkit-playsinline', 'true');
                    this.setAttribute('playsinline', 'true');
                    this.controlsList = 'nodownload noremoteplayback';

                    // 移除默认的双击和右键菜单行为
                    this.addEventListener('dblclick', function(event) {
                        event.preventDefault();
                    });

                    this.addEventListener('contextmenu', function(event) {
                        event.preventDefault();
                    });
                }
            });

            // 添加下载按钮可移动功能
            function handleStart(e) {
                e.preventDefault(); // 阻止默认行为，比如选中文字
                isDragging = true;
                const touch = e.touches ? e.touches[0] : e;
                startX = touch.clientX - downloadButton.offsetLeft;
                startY = touch.clientY - downloadButton.offsetTop;
                document.body.style.cursor = 'grabbing'; // 改变鼠标指针样式
            }

            function handleMove(e) {
                if (isDragging) {
                    const touch = e.touches ? e.touches[0] : e;
                    const x = Math.max(0, Math.min(touch.clientX - startX, window.innerWidth - downloadButton.offsetWidth));
                    const y = Math.max(0, Math.min(touch.clientY - startY, window.innerHeight - downloadButton.offsetHeight));
                    downloadButton.style.left = `${x}px`;
                    downloadButton.style.top = `${y}px`;
                }
            }

            function handleEnd() {
                isDragging = false;
                document.body.style.cursor = ''; // 恢复默认鼠标指针样式
            }

            downloadButton.addEventListener('touchstart', handleStart);
            downloadButton.addEventListener('mousedown', handleStart);

            document.addEventListener('touchmove', handleMove);
            document.addEventListener('mousemove', handleMove);

            document.addEventListener('touchend', handleEnd);
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('mouseleave', handleEnd);

            downloadButton.addEventListener('click', function(e) {
                // 如果没有拖动，则执行点击下载操作
                if (!isDragging) {
                    const file = this.dataset.file;
                    if (file) {
                        const link = document.createElement('a');
                        link.href = file;
                        link.download = file;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                }
            });

            // 确保下载按钮在首次加载时有初始位置
            downloadButton.style.left = `${window.innerWidth - downloadButton.offsetWidth - 20}px`;
            downloadButton.style.top = `${window.innerHeight - downloadButton.offsetHeight - 20}px`;

            // 监听窗口大小改变事件，以调整下载按钮位置
            window.addEventListener('resize', function() {
                if (!isDragging) {
                    downloadButton.style.left = `${window.innerWidth - downloadButton.offsetWidth - 20}px`;
                    downloadButton.style.top = `${window.innerHeight - downloadButton.offsetHeight - 20}px`;
                }
            });
        });
    </script>
</body>
</html>