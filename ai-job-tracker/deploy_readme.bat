@echo off
echo [1/3] Creating assets directory...
if not exist "docs\assets" mkdir "docs\assets"

echo [2/3] Moving banner image...
copy "C:\Users\ddhpa\.gemini\antigravity\brain\0d56b206-3d55-469c-b104-d4b8ac8490a1\ai_job_tracker_banner_1778485425432.png" "docs\assets\banner.png"

echo [3/3] Committing to Git...
git add .
git commit -m "docs: overhaul README with professional design and hero banner"
git push

echo.
echo Done! Your professional README and banner are now live.
pause
