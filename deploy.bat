@echo off
setlocal EnableDelayedExpansion

:: ============================================================
::  deploy.bat ? Auto-deploy Portfolio to GitHub Pages
::  Portfolio: Madan Kumar PC
::  Usage: Double-click this file from File Explorer
:: ============================================================

set REPO_URL=https://github.com/pcmadankumar/pcmadankumar.github.io.git
set REPO_DIR=%~dp0..\pcmadankumar.github.io
set SITE_DIR=%~dp0

echo.
echo  ================================================
echo   Portfolio Deploy to GitHub Pages
echo   Madan Kumar PC
echo  ================================================
echo.

:: ---- Step 1: Check Git is installed ----
git --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Git is not installed on this computer.
    echo.
    echo  Please install Git first:
    echo  1. Open your browser
    echo  2. Go to: https://git-scm.com/download/win
    echo  3. Download and run the installer
    echo  4. Come back and run this script again
    echo.
    pause
    exit /b 1
)
echo  [OK] Git is installed.

:: ---- Step 2: Load GitHub Token from Environment Variable ----
if "!GITHUB_PAT!"=="" (
    echo.
    echo  [ERROR] GITHUB_PAT environment variable is not set.
    echo  Please contact your system administrator.
    pause
    exit /b 1
)

:: Build authenticated URL
set "AUTH_URL=https://!GITHUB_PAT!@github.com/pcmadankumar/pcmadankumar.github.io.git"
echo  [OK] GitHub token loaded.

:: ---- Step 3: Clone repo if not present, otherwise pull ----
echo.
echo  ---- Checking repository ----
if not exist "%REPO_DIR%\" (
    echo  Repository not found locally. Cloning from GitHub...
    git clone "!AUTH_URL!" "%REPO_DIR%"
    if errorlevel 1 (
        echo.
        echo  [ERROR] Could not clone the repository.
        echo  Possible reasons:
        echo    - Your token may be incorrect or expired
        echo    - The repository may not exist on GitHub yet
        echo    - No internet connection
        echo.
        echo  Please check and try again.
        pause
        exit /b 1
    )
    echo  [OK] Repository cloned successfully.
) else (
    echo  [OK] Repository folder found at: %REPO_DIR%
    cd /d "%REPO_DIR%"
    git remote set-url origin "!AUTH_URL!" >nul 2>&1
    echo  Pulling latest changes from GitHub...
    git pull origin main >nul 2>&1
    echo  [OK] Up to date.
)

:: ---- Step 4: Copy all site files to repo ----
echo.
echo  ---- Copying site files ----
if exist "%SITE_DIR%*.html" (
    xcopy /Y /Q "%SITE_DIR%*.html" "%REPO_DIR%\" >nul
    echo  [OK] HTML pages copied.
)
if exist "%SITE_DIR%*.json" (
    xcopy /Y /Q "%SITE_DIR%*.json" "%REPO_DIR%\" >nul
    echo  [OK] JSON data files copied.
)
if exist "%SITE_DIR%css\" (
    xcopy /E /Y /I /Q "%SITE_DIR%css" "%REPO_DIR%\css\" >nul
    echo  [OK] CSS copied.
)
if exist "%SITE_DIR%js\" (
    xcopy /E /Y /I /Q "%SITE_DIR%js" "%REPO_DIR%\js\" >nul
    echo  [OK] JavaScript copied.
)
if exist "%SITE_DIR%assets\" (
    xcopy /E /Y /I /Q "%SITE_DIR%assets" "%REPO_DIR%\assets\" >nul
    echo  [OK] Assets ^(images^) copied.
)
if exist "%SITE_DIR%blog\" (
    xcopy /E /Y /I /Q "%SITE_DIR%blog" "%REPO_DIR%\blog\" >nul
    echo  [OK] Blog copied.
)

:: ---- Step 5: Commit and push ----
echo.
echo  ---- Deploying to GitHub ----
cd /d "%REPO_DIR%"

git add .
git diff --cached --quiet
if errorlevel 1 (
    for /f "tokens=*" %%d in ('powershell -command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set TIMESTAMP=%%d
    git commit -m "Portfolio update: !TIMESTAMP!"
    if errorlevel 1 (
        echo  [ERROR] Commit failed. Please check git configuration.
        pause
        exit /b 1
    )
    echo  [OK] Changes committed.

    git push origin main
    if errorlevel 1 (
        echo.
        echo  [ERROR] Push to GitHub failed.
        echo  Possible reasons:
        echo    - Token may not have 'repo' permission
        echo    - Internet connection issue
        echo.
        pause
        exit /b 1
    )
    echo  [OK] Pushed to GitHub successfully.
) else (
    echo  No changes detected ? nothing new to deploy.
)

:: ---- Done ----
echo.
echo  ================================================
echo   SUCCESS! Your portfolio is live at:
echo   https://pcmadankumar.github.io
echo.
echo   Note: GitHub Pages may take 1-2 minutes
echo   to reflect your latest changes.
echo  ================================================
echo.
pause
