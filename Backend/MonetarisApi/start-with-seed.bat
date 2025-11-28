@echo off
cd /d "%~dp0"
set ASPNETCORE_ENVIRONMENT=Development
set ALLOW_DB_SEED=true
dotnet run --urls "http://localhost:5002"
