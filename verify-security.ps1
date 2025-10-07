# Security Verification Script
# Run this AFTER deployment to verify security measures

Write-Host "🔍 BMC Platform - Security Verification" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://bitcoinmascot.com"
$testPaths = @(
    "/app/",
    "/components/",
    "/contexts/",
    "/libs/",
    "/providers/",
    "/supabase/",
    "/specs/"
)

$requiredHeaders = @{
    "X-Content-Type-Options" = "nosniff"
    "X-Frame-Options" = @("DENY", "SAMEORIGIN")
    "X-XSS-Protection" = "1; mode=block"
    "Referrer-Policy" = "strict-origin-when-cross-origin"
}

Write-Host "Testing protected directories..." -ForegroundColor Yellow
Write-Host ""

$allPassed = $true

foreach ($path in $testPaths) {
    $url = $baseUrl + $path
    Write-Host "Testing: $url" -ForegroundColor White
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -ErrorAction SilentlyContinue -MaximumRedirection 0
        
        if ($response.StatusCode -eq 404 -or $response.StatusCode -eq 403) {
            Write-Host "  ✅ Protected (Status: $($response.StatusCode))" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Not protected (Status: $($response.StatusCode))" -ForegroundColor Red
            $allPassed = $false
        }
    } catch {
        # 404 or 403 might throw an exception
        if ($_.Exception.Response.StatusCode -eq 404 -or $_.Exception.Response.StatusCode -eq 403) {
            Write-Host "  ✅ Protected (Status: $($_.Exception.Response.StatusCode))" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
            $allPassed = $false
        }
    }
}

Write-Host ""
Write-Host "Checking security headers on home page..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method Head
    $foundHeaders = 0
    $totalHeaders = $requiredHeaders.Count
    
    foreach ($header in $requiredHeaders.Keys) {
        $expectedValue = $requiredHeaders[$header]
        $actualValue = $response.Headers[$header]
        
        if ($actualValue) {
            if ($expectedValue -is [array]) {
                if ($expectedValue -contains $actualValue) {
                    Write-Host "  ✅ $header`: $actualValue" -ForegroundColor Green
                    $foundHeaders++
                } else {
                    Write-Host "  ⚠️  $header`: $actualValue (expected one of: $($expectedValue -join ', '))" -ForegroundColor Yellow
                }
            } elseif ($actualValue -eq $expectedValue) {
                Write-Host "  ✅ $header`: $actualValue" -ForegroundColor Green
                $foundHeaders++
            } else {
                Write-Host "  ⚠️  $header`: $actualValue (expected: $expectedValue)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ❌ $header`: Missing" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Headers found: $foundHeaders/$totalHeaders" -ForegroundColor Cyan
    
} catch {
    Write-Host "  ❌ Error checking headers: $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

if ($allPassed -and $foundHeaders -eq $totalHeaders) {
    Write-Host "✅ All security measures verified!" -ForegroundColor Green
    Write-Host "🎉 Your site is protected!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some security measures need attention" -ForegroundColor Yellow
    Write-Host "💡 Tip: Wait a few minutes for CDN cache to clear" -ForegroundColor Cyan
    Write-Host "    Then run this script again" -ForegroundColor Cyan
}

Write-Host ""
