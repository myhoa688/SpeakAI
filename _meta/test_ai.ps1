$BASE = "http://localhost:5000/api"
$results = @()

function Test-Endpoint {
    param($name, $scriptBlock)
    Write-Host "`n--- TEST: $name ---" -ForegroundColor Cyan
    try {
        $result = & $scriptBlock
        Write-Host "✅ PASS: $result" -ForegroundColor Green
        return @{name=$name; status="PASS"; detail=$result}
    } catch {
        $msg = $_.Exception.Message
        Write-Host "❌ FAIL: $msg" -ForegroundColor Red
        return @{name=$name; status="FAIL"; detail=$msg}
    }
}

# ─── 1. AUTH: Register & Get Token ────────────────────────────────────────────
$TOKEN = ""
$results += Test-Endpoint "1. Auth - Login/Register" {
    $body = '{"email":"test_ai@speakai.local","password":"Test@123456"}'
    $r = Invoke-RestMethod -Uri "$BASE/auth/login" -Method POST -ContentType "application/json" -Body $body
    $script:TOKEN = $r.token
    "Login OK, user: $($r.user.name), onboarding: $($r.user.onboardingCompleted)"
}

$headers = @{ Authorization = "Bearer $TOKEN" }
Write-Host "Token obtained: $($TOKEN -ne '')" -ForegroundColor Yellow

# ─── 2. Onboarding ────────────────────────────────────────────────────────────
$results += Test-Endpoint "2. Onboarding - Set Profile" {
    $body = '{"industryGroup":"CONG_NGHE_THONG_TIN","industry":"Lap trinh vien","specialization":"Backend Developer","experienceLevel":"junior"}'
    $r = Invoke-RestMethod -Uri "$BASE/onboarding" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $script:TOKEN"} -Body $body
    "Onboarding: $($r.message)"
}

# ─── 3. Interview - Start Session (no CV) ─────────────────────────────────────
$INTERVIEW_ID = ""
$results += Test-Endpoint "3. Interview - Start Session (Easy)" {
    $body = '{"difficulty":"easy","language":"vi"}'
    $r = Invoke-RestMethod -Uri "$BASE/interviews/start" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $script:TOKEN"} -Body $body
    $script:INTERVIEW_ID = $r.sessionId
    $q = $r.currentQuestion
    "Session: $($script:INTERVIEW_ID), Q[0]: $($q.question.Substring(0,[Math]::Min(80,$q.question.Length)))..."
}

# ─── 4. Interview - Submit Answer (AI analysis) ─────────────────────────────
$results += Test-Endpoint "4. Interview - Submit Answer (AI Score)" {
    if (-not $script:INTERVIEW_ID) { throw "No interview session ID" }
    $body = '{"answer":"Toi co kinh nghiem 2 nam voi NodeJS va Python, da lam cac du an backend su dung Express, MongoDB, REST API. Toi hieu ro ve cac khai niem OOP, design pattern va clean code."}'
    $r = Invoke-RestMethod -Uri "$BASE/interviews/$($script:INTERVIEW_ID)/answer" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $script:TOKEN"} -Body $body
    "Scored: $($r.score)/100, completed: $($r.completed), nextQ: $(if($r.nextQuestion){'YES - ' + $r.nextQuestion.question.Substring(0,[Math]::Min(60,$r.nextQuestion.question.Length))}else{'N/A'})"
}

# ─── 5. Interview - Get Result ────────────────────────────────────────────────
$results += Test-Endpoint "5. Interview - Get Result/Status" {
    if (-not $script:INTERVIEW_ID) { throw "No interview session ID" }
    $r = Invoke-RestMethod -Uri "$BASE/interviews/$($script:INTERVIEW_ID)/result" -Method GET -Headers @{Authorization="Bearer $script:TOKEN"}
    "Status: $($r.status), Score: $($r.overallScore), Answers: $($r.answers.Count)"
}

# ─── 6. Practice - Analyze Text (no audio) ─────────────────────────────────
$results += Test-Endpoint "6. Practice - Analyze text transcript" {
    $body = '{"transcript":"Toi la mot lap trinh vien co 3 nam kinh nghiem. Toi da lam viec voi nhieu cong nghe khac nhau nhu React, NodeJS, Python. Toi thich hoc cac cong nghe moi.","topic":"Gioi thieu ban than","practiceType":"introduction","targetRole":"Backend Developer"}'
    $r = Invoke-RestMethod -Uri "$BASE/practice/analyze" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $script:TOKEN"} -Body $body
    "Score: $($r.totalScore)/100, Summary: $($r.summary.Substring(0,[Math]::Min(80,$r.summary.Length)))..."
}

# ─── 7. CV Analyzer - Text CV ────────────────────────────────────────────────
$results += Test-Endpoint "7. CV Analyzer - Analyze text CV" {
    $form = [System.Collections.Specialized.NameValueCollection]::new()
    $boundary = [System.Guid]::NewGuid().ToString()
    $bodyStr = "--$boundary`r`nContent-Disposition: form-data; name=`"resumeText`"`r`n`r`nNguyen Van An - Backend Developer`nKinh nghiem: 3 nam NodeJS, Python, MongoDB`nDu an: E-commerce platform, REST API, Microservices`nKy nang: Docker, AWS, CI/CD, Git`r`n--$boundary`r`nContent-Disposition: form-data; name=`"targetRole`"`r`n`r`nBackend Developer`r`n--$boundary--"
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($bodyStr)
    $r = Invoke-RestMethod -Uri "$BASE/cv/analyze" -Method POST -Headers @{Authorization="Bearer $script:TOKEN"; "Content-Type"="multipart/form-data; boundary=$boundary"} -Body $bytes
    "Strengths: $($r.strengths.Count), Improvements: $($r.improvements.Count), Summary: $($r.summary.Substring(0,[Math]::Min(60,$r.summary.Length)))..."
}

# ─── 8. Question Bank ────────────────────────────────────────────────────────
$results += Test-Endpoint "8. Question Bank - Get Questions" {
    $r = Invoke-RestMethod -Uri "$BASE/questions?limit=5" -Method GET -Headers @{Authorization="Bearer $script:TOKEN"}
    "Questions returned: $($r.questions.Count), total: $($r.total)"
}

# ─── 9. Interview History ────────────────────────────────────────────────────
$results += Test-Endpoint "9. Interview - History" {
    $r = Invoke-RestMethod -Uri "$BASE/interviews/history" -Method GET -Headers @{Authorization="Bearer $script:TOKEN"}
    "History sessions: $($r.sessions.Count)"
}

# ─── SUMMARY ─────────────────────────────────────────────────────────────────
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "TEST SUMMARY" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
$pass = ($results | Where-Object { $_.status -eq "PASS" }).Count
$fail = ($results | Where-Object { $_.status -eq "FAIL" }).Count
foreach ($r in $results) {
    $icon = if ($r.status -eq "PASS") { "✅" } else { "❌" }
    $color = if ($r.status -eq "PASS") { "Green" } else { "Red" }
    Write-Host "$icon $($r.name): $($r.detail)" -ForegroundColor $color
}
Write-Host "`nTotal: $($results.Count) | Pass: $pass | Fail: $fail" -ForegroundColor Yellow
