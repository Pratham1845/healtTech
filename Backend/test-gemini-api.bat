@echo off
echo ====================================
echo Gemini API Key Diagnostic Tool
echo ====================================
echo.

echo Testing your Gemini API key...
echo.

node -e "const key = require('fs').readFileSync('.env', 'utf8').match(/GEMINI_API_KEY=(.+)/)?.[1]?.trim(); if(!key || key === 'YOUR_NEW_API_KEY_HERE') { console.log('❌ ERROR: No valid API key found in .env file'); console.log('Please add your API key to Backend/.env'); process.exit(1); } console.log('API Key found:', key.substring(0, 10) + '...'); console.log('Testing API key...'); fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({contents: [{role: 'user', parts: [{text: 'Hello test'}]}], generationConfig: {temperature: 0.5, maxOutputTokens: 50}})}).then(r => {console.log('Response Status:', r.status); if(r.status === 200) {console.log('✅ API key is working!'); return r.json().then(d => console.log('Response:', d.candidates?.[0]?.content?.parts?.[0]?.text));} else if(r.status === 429) {console.log('❌ API quota exceeded (429)'); console.log('Your API key has run out of free tier usage'); console.log(''); console.log('SOLUTIONS:'); console.log('1. Get a new API key from: https://aistudio.google.com/app/apikey'); console.log('2. Wait 24 hours for quota reset'); console.log('3. Enable billing on Google Cloud'); return r.json();} else if(r.status === 401 || r.status === 403) {console.log('❌ API key is invalid or restricted'); return r.json();} else {console.log('❌ Unexpected error:', r.status); return r.json();}}).then(d => {if(d && d.error) console.log('Error details:', d.error.message);}).catch(e => console.log('❌ Network error:', e.message));"

echo.
echo ====================================
pause
