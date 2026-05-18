@echo off
echo ========================================
echo AI 沉浸式剧场 - 项目启动脚本
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 检查 Node.js 环境...
node --version
if errorlevel 1 (
    echo [错误] 未找到 Node.js，请先安装：https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [2/3] 安装依赖（首次运行）...
call npm install

echo.
echo [3/3] 启动开发服务器...
echo.
echo 启动后访问: http://localhost:5173
echo 按 Ctrl+C 停止服务器
echo.
call npm run dev

pause
