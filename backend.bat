@echo off
title LUXE Backend
echo.
echo  ================================
echo   LUXE Backend - Starting...
echo  ================================
echo.

cd /d E:\commerce\luxe_backend
call venv\Scripts\activate

echo  [OK] Virtual environment activated
echo  [OK] Starting Django server at http://127.0.0.1:8000
echo.

python manage.py runserver

pause
