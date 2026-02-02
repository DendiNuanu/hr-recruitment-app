@echo off
cls
color 0b
echo ============================================================
echo   HR RECRUITMENT - AUTOMATIC PRODUCTION DEPLOYER
echo ============================================================
echo.
echo [1/3] Syncing latest fixes to GitHub...
git add .
git commit -m "Final Production Fix: Excel Support & UI Cleanup"
git push origin main --force
git push origin import-export --force
echo.
echo [2/3] Connecting to Vercel Production...
echo (Please follow any login prompts in your browser if they appear)
echo.
call npx vercel link --yes
echo.
echo [3/3] Deploying New Features Live...
call npx vercel deploy --prod --now --yes
echo.
echo ============================================================
echo   SUCCESS! Your update is being processed by Vercel.
echo   Live URL: https://hrr-ecruitment-javascript.vercel.app/HRadmin
echo   (Wait 1-2 minutes for the build to finish)
echo ============================================================
echo.
pause
