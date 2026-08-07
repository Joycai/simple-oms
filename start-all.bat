@echo off
echo === Starting infrastructure (PostgreSQL + Redis) ===
docker compose up -d
echo.
echo Waiting for DBs to be ready...
timeout /t 5 /nobreak >nul

echo === IAM Backend (:8080) ===
start "IAM Backend" cmd /c "cd backend && gradlew.bat :iam-service:bootRun"

echo === Order Service Backend (:8081) ===
start "Order Backend" cmd /c "cd backend && gradlew.bat :order-service:bootRun"

echo === Next.js Frontend (:3060) ===
start "Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo All services starting:
echo   IAM DB      localhost:5432
echo   Order DB    localhost:5433
echo   Redis       localhost:6379
echo   IAM API     http://localhost:8080
echo   Order API   http://localhost:8081
echo   Frontend    http://localhost:3060
echo.
echo Close terminal windows to stop individual services.
echo Run 'docker compose down' to stop infrastructure.
pause
