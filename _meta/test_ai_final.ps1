# ═══════════════════════════════════════════════════════════
# FINAL AI TEST - All 12 Endpoints
# ═══════════════════════════════════════════════════════════
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
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $msg += " | $($reader.ReadToEnd())"
        } catch {}
        Write-Host "FAIL: $msg" -ForegroundColor Red
        return @{name=$name; status="FAIL"; detail=$msg}
    }
}

# Auth
$authResp = Invoke-RestMethod -Uri "$BASE/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test_ai@speakai.local","password":"Test@123456"}'
$TOKEN = $authResp.token
$H = @{ Authorization = "Bearer $TOKEN" }
Write-Host "Auth Token: OK" -ForegroundColor Yellow

# 1. Auth /me
$results += Test-Endpoint "1. Auth /me" {
    $r = Invoke-RestMethod -Uri "$BASE/auth/me" -Method GET -Headers $H
    "User: $($r.user.name), industry: $($r.user.industry), specialization: $($r.user.specialization)"
}

# 2. Onboarding status
$results += Test-Endpoint "2. Onboarding status" {
    $r = Invoke-RestMethod -Uri "$BASE/onboarding/status" -Method GET -Headers $H
    "onboardingCompleted: $($r.onboardingCompleted)"
}

# 3. Question Bank (now seeded)
$results += Test-Endpoint "3. Question Bank (seeded)" {
    $r = Invoke-RestMethod -Uri "$BASE/questions?limit=5" -Method GET -Headers $H
    "Returned: $($r.questions.Count), total: $($r.total)"
}

# 4. Interview Sets
$results += Test-Endpoint "4. Interview Sets" {
    $r = Invoke-RestMethod -Uri "$BASE/interview-sets" -Method GET -Headers $H
    "Sets: $($r.interviewSets.Count)"
}

# 5. Interview - Start (Easy = 5 questions)
$SESS_ID = ""
$results += Test-Endpoint "5. Interview Start (easy=5q)" {
    $r = Invoke-RestMethod -Uri "$BASE/interviews/start" -Method POST -ContentType "application/json" -Headers $H -Body '{"difficulty":"easy","language":"vi"}'
    $script:SESS_ID = $r.sessionId
    $q = $r.currentQuestion
    "ID: $($script:SESS_ID.Substring(0,12))... | Q[0/$($q.total)]: $($q.question.Substring(0,[Math]::Min(70,$q.question.Length)))..."
}

# 6. Interview - Submit Answer 
$results += Test-Endpoint "6. Interview Submit Answer (AI scores)" {
    $body = '{"answer":"Toi co kinh nghiem su dung NodeJS va Python. Da xay dung REST API voi Express, MongoDB. Quen thuoc voi Docker va AWS EC2 de trien khai ung dung."}'
    $r = Invoke-RestMethod -Uri "$BASE/interviews/$($script:SESS_ID)/answer" -Method POST -ContentType "application/json" -Headers $H -Body $body
    "Score: $($r.score)/100, completed: $($r.completed), has_nextQ: $($null -ne $r.nextQuestion)"
}

# 7. Practice Analysis (AI)
$results += Test-Endpoint "7. Practice Analysis AI (/api/ai/practice-analysis)" {
    $body = '{"transcript":"Toi la Backend Developer voi kinh nghiem NodeJS, Python, REST API, Docker. Toi da lam viec trong nhieu du an lon va nho, quen voi Agile va CI/CD.","topic":"Gioi thieu ban than","practiceType":"interview","difficulty":"medium","durationSeconds":60}'
    $r = Invoke-RestMethod -Uri "$BASE/ai/practice-analysis" -Method POST -ContentType "application/json" -Headers $H -Body $body
    "Score: $($r.analysis.totalScore)/100, Clarity: $($r.analysis.clarityScore), hasToken: $($r.analysisToken -ne '')"
}

# 8. CV Analysis (AI)
$results += Test-Endpoint "8. CV Analysis AI (/api/ai/cv-analysis)" {
    $boundary = "b$(Get-Random)"
    $cv = "Nguyen Van An - Backend Developer\n3 nam kinh nghiem NodeJS, Python, MongoDB\nDu an: E-commerce REST API, Microservices\nKy nang: Docker, AWS, CI/CD, Git"
    $bodyStr = "--$boundary`r`nContent-Disposition: form-data; name=`"resumeText`"`r`n`r`n$cv`r`n--$boundary`r`nContent-Disposition: form-data; name=`"targetRole`"`r`n`r`nBackend Developer`r`n--$boundary--"
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($bodyStr)
    $r = Invoke-RestMethod -Uri "$BASE/ai/cv-analysis" -Method POST -Headers @{Authorization="Bearer $TOKEN";"Content-Type"="multipart/form-data; boundary=$boundary"} -Body $bytes
    "Strengths: $($r.analysis.strengths.Count), Improvements: $($r.analysis.improvements.Count), Questions: $($r.analysis.interviewQuestions.Count)"
}

# 9. AI Next Interview Question
$results += Test-Endpoint "9. AI Generate Next Question (/api/ai/interview/next-question)" {
    $body = '{"difficulty":"hard","targetRole":"Backend Developer NodeJS","history":[{"question":"Ban co kinh nghiem gi?","answer":"Toi co 3 nam kinh nghiem NodeJS"}]}'
    $r = Invoke-RestMethod -Uri "$BASE/ai/interview/next-question" -Method POST -ContentType "application/json" -Headers $H -Body $body
    "Q: $($r.nextQuestion.question.Substring(0,[Math]::Min(80,$r.nextQuestion.question.Length)))..."
}

# 10. Interview History
$results += Test-Endpoint "10. Interview History" {
    $r = Invoke-RestMethod -Uri "$BASE/interviews/history" -Method GET -Headers $H
    "History sessions: $($r.sessions.Count)"
}

# 11. Practice sessions list
$results += Test-Endpoint "11. Practice Sessions" {
    $r = Invoke-RestMethod -Uri "$BASE/practice/sessions" -Method GET -Headers $H
    "Sessions: $($r.sessions.Count)"
}

# 12. User profile with AI fields
$results += Test-Endpoint "12. User AI Profile fields" {
    $r = Invoke-RestMethod -Uri "$BASE/auth/me" -Method GET -Headers $H
    "targetRole: '$($r.user.targetRole)', specialization: '$($r.user.specialization)', industry: '$($r.user.industry)', experienceLevel: '$($r.user.experienceLevel)'"
}

# ─── FINAL SUMMARY ───────────────────────────────────────────────────────────
Write-Host "`n============================================================" -ForegroundColor Magenta
Write-Host "FINAL AI TEST REPORT - SpeakAI" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
$pass = ($results | Where-Object { $_.status -eq "PASS" }).Count
$fail = ($results | Where-Object { $_.status -eq "FAIL" }).Count
foreach ($r in $results) {
    $icon = if ($r.status -eq "PASS") { "[OK]" } else { "[FAIL]" }
    $color = if ($r.status -eq "PASS") { "Green" } else { "Red" }
    Write-Host "$icon $($r.name)" -ForegroundColor $color
    Write-Host "     $($r.detail)" -ForegroundColor Gray
}
$color = if($fail -eq 0){"Green"}else{"Yellow"}
Write-Host "`nRESULT: $pass/$($results.Count) PASSED" -ForegroundColor $color
