# 🚀 Groq API Integration Guide

## ✅ What's Been Done:

1. ✅ Installed `groq-sdk` package
2. ✅ Added `askGroq()` function to chatController.js
3. ✅ Configured to use `llama3-8b-8192` model
4. ✅ Set up automatic fallback: Groq → Gemini
5. ✅ Added environment variables to `.env`

---

## 🔑 STEP 1: Get Your FREE Groq API Key

### **Quick Setup (Takes 2 Minutes):**

1. **Go to:** https://console.groq.com/keys
2. **Sign up/Login** with your Google or GitHub account
3. **Click "Create API Key"**
4. **Copy your API key** (starts with `gsk_`)
5. **Done!** ✅

**Groq is 100% FREE** with generous limits:
- ✅ 30 requests/minute
- ✅ No daily limit
- ✅ Much faster than Gemini
- ✅ No credit card required

---

## ⚙️ STEP 2: Add API Key to Your Project

### **Open:** `d:\HealthTech\Backend\.env`

### **Find this line:**
```env
GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
```

### **Replace with your actual key:**
```env
GROQ_API_KEY=gsk_your_actual_key_here
```

### **Example:**
```env
GROQ_API_KEY=gsk_ABC123DEF456GHI789JKL
```

---

## 🔄 STEP 3: Restart Backend

```bash
cd d:\HealthTech\Backend

# Stop the server (Ctrl + C)

# Start it again
npm run dev
```

---

## 🧪 STEP 4: Test Your Chatbot

1. **Login to your app**
2. **Go to chatbot page**
3. **Send a message** like: "Hello, suggest a workout"
4. **You should get a response!** ✅

---

## 📊 How It Works Now:

```
User sends message
    ↓
Try Groq API (llama3-8b-8192)
    ↓
✅ Success → Return response
    ↓
❌ Failed → Try Gemini API
    ↓
✅ Success → Return response
    ↓
❌ Both failed → Show fallback message
```

---

## 🎯 Groq Configuration:

**Model:** `llama3-8b-8192`
**Temperature:** `0.5` (balanced creativity)
**Max Tokens:** `220` (short responses)
**System Prompt:** Fitness coach mode

### **What the AI Knows:**
- ✅ Posture Score
- ✅ Activity Level  
- ✅ Mood/Emotion
- ✅ Sleep Quality
- ✅ Health Score
- ✅ Recent workout history

---

## 💡 Groq vs Gemini:

| Feature | Groq | Gemini |
|---------|------|--------|
| Speed | ⚡ Super Fast | 🐌 Normal |
| Free Tier | ✅ 30 req/min | ✅ 15 req/min |
| Daily Limit | ✅ Unlimited | ❌ 1,500/day |
| Credit Card | ❌ Not needed | ❌ Not needed |
| Models | Llama 3, Mixtral | Gemini Pro |

---

## 🔧 Environment Variables:

```env
# Groq API (Primary - Fast & Free)
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama3-8b-8192

# Gemini API (Backup)
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-2.0-flash
```

---

## 🐛 Troubleshooting:

### **Error: "GROQ_API_KEY is missing"**
- Check `.env` file has the key
- Restart backend server
- Make sure there are no spaces

### **Still getting fallback message?**
- Check backend terminal for errors
- Verify Groq API key is valid
- Test at: https://console.groq.com/playground

### **Want to use Groq ONLY (no Gemini fallback)?**
Change line 275 in `chatController.js`:
```javascript
// Remove the fallback if block
```

---

## 🎉 You're Done!

Once you add your Groq API key and restart the backend, your chatbot will:

✅ **Work faster** than before  
✅ **Have higher rate limits**  
✅ **Be completely free**  
✅ **Fallback to Gemini** if Groq fails  
✅ **Give fitness-focused responses**  
✅ **Support Hindi/English**  

---

## 📝 Get Your Groq API Key NOW:

👉 **https://console.groq.com/keys**

It takes 2 minutes and is 100% FREE! 🚀
