$BASE = "http://localhost:5000/api"
$results = @()

function Test-Endpoint {
    param($name, $scriptBlock)
    Write-Host "`n--- TEST: $name ---" -ForegroundColor Cyan
    try {
        $result = & $scriptBlock
        Write-Host "PASS: $result" -ForegroundColor Green
        return @{name=$name; status="PASS"; detail=$result}
    } catch {
        $msg = $_.Exception.Message
        # Try to get response body
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $body = $reader.ReadToEnd()
            $msg = "$msg | Body: $body"
        } catch {}
        Write-Host "FAIL: $msg" -ForegroundColor Red
        return @{name=$name; status="FAIL"; detail=$msg}
    }
}

# Get token
$loginBody = '{"email":"test_ai@speakai.local","password":"Test@123456"}'
$authResp = Invoke-RestMethod -Uri "$BASE/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$TOKEN = $authResp.token
Write-Host "Token: OK ($($TOKEN.Substring(0,20))...)" -ForegroundColor Yellow

$H = @{ Authorization = "Bearer $TOKEN" }

# ─── TEST 6 FIX: Practice Analysis via /api/ai/practice-analysis ───────────
$results += Test-Endpoint "6. Practice Analysis (/api/ai/practice-analysis)" {
    $body = @{
        transcript = "Toi la mot lap trinh vien co 3 nam kinh nghiem. Toi da lam viec voi nhieu cong nghe khac nhau nhu React, NodeJS, Python. Toi thich hoc cac cong nghe moi va giai quyet cac van de phuc tap."
        topic = "Gioi thieu ban than"
        practiceType = "interview"
        difficulty = "easy"
        durationSeconds = 45
    } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$BASE/ai/practice-analysis" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $TOKEN"} -Body $body
    "Score: $($r.analysis.totalScore)/100 | Clarity: $($r.analysis.clarityScore) | Summary: $(($r.analysis.summary + '')[0..60] -join '')"
}

# ─── TEST 7 FIX: CV Analysis via /api/ai/cv-analysis ────────────────────────
$results += Test-Endpoint "7. CV Analysis (/api/ai/cv-analysis)" {
    # Build multipart form manually
    $boundary = "boundary$(Get-Random)"
    $cvText = "Nguyen Van An - Backend Developer`n3 nam kinh nghiem NodeJS, Python, MongoDB`nDu an: E-commerce, REST API, Microservices`nKy nang: Docker, AWS, CI/CD, Git, Linux"
    $target = "Backend Developer"
    
    $body = "--$boundary`r`n" +
            "Content-Disposition: form-data; name=`"resumeText`"`r`n`r`n" +
            "$cvText`r`n" +
            "--$boundary`r`n" +
            "Content-Disposition: form-data; name=`"targetRole`"`r`n`r`n" +
            "$target`r`n" +
            "--$boundary--"
    
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
    $r = Invoke-RestMethod -Uri "$BASE/ai/cv-analysis" -Method POST `
        -Headers @{Authorization="Bearer $TOKEN"; "Content-Type"="multipart/form-data; boundary=$boundary"} `
        -Body $bytes
    
    "Strengths: $($r.analysis.strengths.Count) | Improvements: $($r.analysis.improvements.Count) | Summary: $(($r.analysis.summary + '')[0..60] -join '')"
}

# ─── TEST AI Next Question directly ─────────────────────────────────────────
$results += Test-Endpoint "10. AI Generate Interview Question (/api/ai/interview/next-question)" {
    $body = '{"difficulty":"medium","targetRole":"Backend Developer","history":[]}'
    $r = Invoke-RestMethod -Uri "$BASE/ai/interview/next-question" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $TOKEN"} -Body $body
    "Question: $(($r.nextQuestion.question + '')[0..80] -join '')"
}

# ─── TEST Onboarding Status ──────────────────────────────────────────────────
$results += Test-Endpoint "11. Onboarding Status" {
    $r = Invoke-RestMethod -Uri "$BASE/onboarding/status" -Method GET -Headers @{Authorization="Bearer $TOKEN"}
    "onboardingCompleted: $($r.onboardingCompleted)"
}

# ─── TEST Auth /me ────────────────────────────────────────────────────────────
$results += Test-Endpoint "12. Auth /me (Profile data)" {
    $r = Invoke-RestMethod -Uri "$BASE/auth/me" -Method GET -Headers @{Authorization="Bearer $TOKEN"}
    "User: $($r.user.name) | industry: $($r.user.industry) | targetRole: $($r.user.targetRole) | specialization: $($r.user.specialization)"
}

# ─── SUMMARY ─────────────────────────────────────────────────────────────────
Write-Host "`n========================================"
Write-Host "RETEST SUMMARY (AI Endpoints)"
Write-Host "========================================"
$pass = ($results | Where-Object { $_.status -eq "PASS" }).Count
$fail = ($results | Where-Object { $_.status -eq "FAIL" }).Count
foreach ($r in $results) {
    $icon = if ($r.status -eq "PASS") { "OK" } else { "FAIL" }
    $color = if ($r.status -eq "PASS") { "Green" } else { "Red" }
    Write-Host "[$icon] $($r.name): $($r.detail)" -ForegroundColor $color
}
Write-Host "`nPass: $pass | Fail: $fail" -ForegroundColor Yellow
