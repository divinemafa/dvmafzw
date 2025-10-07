# Security Deployment Script
# Run this to deploy security fixes

Write-Host "🔒 BMC Platform - Security Deployment" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-Not (Test-Path "vercel.json")) {
    Write-Host "❌ Error: vercel.json not found. Are you in the project root?" -ForegroundColor Red
    exit 1
}

# Show what will be deployed
Write-Host "📦 Files to be deployed:" -ForegroundColor Yellow
Write-Host "  ✓ vercel.json (Directory protection)" -ForegroundColor Green
Write-Host "  ✓ next.config.js (Security headers)" -ForegroundColor Green
Write-Host "  ✓ app/not-found.tsx (Custom 404)" -ForegroundColor Green
Write-Host "  ✓ .vercelignore (Sensitive files filter)" -ForegroundColor Green
Write-Host ""

# Git status
Write-Host "📊 Checking git status..." -ForegroundColor Yellow
git status --short

Write-Host ""
$confirm = Read-Host "🚀 Ready to commit and push? (y/n)"

if ($confirm -eq 'y' -or $confirm -eq 'Y') {
    Write-Host ""
    Write-Host "📝 Staging files..." -ForegroundColor Yellow
    git add vercel.json
    git add next.config.js
    git add app/not-found.tsx
    git add .vercelignore
    git add SECURITY_CONFIG.md
    
    Write-Host "💾 Committing changes..." -ForegroundColor Yellow
    git commit -m "🔒 Security: Prevent directory listing and add security headers

- Add vercel.json with directory protection
- Enhance next.config.js with security headers
- Create custom 404 page for unauthorized access
- Add .vercelignore for sensitive files
- Document security measures in SECURITY_CONFIG.md

Fixes: Directory listing vulnerability on production"
    
    Write-Host "🚀 Pushing to remote..." -ForegroundColor Yellow
    git push
    
    Write-Host ""
    Write-Host "✅ Deployment initiated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Wait for Vercel to redeploy (~2-3 minutes)" -ForegroundColor White
    Write-Host "  2. Test protected URLs:" -ForegroundColor White
    Write-Host "     - https://bitcoinmascot.com/app/" -ForegroundColor Gray
    Write-Host "     - https://bitcoinmascot.com/components/" -ForegroundColor Gray
    Write-Host "     - https://bitcoinmascot.com/supabase/" -ForegroundColor Gray
    Write-Host "  3. Verify 404 page appears" -ForegroundColor White
    Write-Host "  4. Check security headers with: curl -I https://bitcoinmascot.com/" -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 Monitor deployment: https://vercel.com/dashboard" -ForegroundColor Cyan
    
} else {
    Write-Host ""
    Write-Host "⏸️  Deployment cancelled. Run this script again when ready." -ForegroundColor Yellow
}
