@echo off
chcp 65001 >nul
title SkyMap Weather
echo.
echo  Dang mo SkyMap...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0mo-skymap.ps1"
pause
