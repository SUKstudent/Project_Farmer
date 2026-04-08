from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from gtts import gTTS
import io
import base64

app = FastAPI(title="Sahayak AI Backend")

# ✅ CORS (important for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- MODEL ----------------
class RequestData(BaseModel):
    choice: str
    language: str

# ---------------- LOGIC ----------------
def get_plan(choice, lang):
    if lang == "kn":
        if choice == "dry":
            return "ರಾಗಿ, ಜೋಳ, ಜೋವಾರ", "ಆಡು, ಕೋಳಿ", "ತುಪ್ಪ, ಎಣ್ಣೆ"
        elif choice == "dairy":
            return "ಚಾರೆ ಬೆಳೆಗಳು", "ಹಾಲು, ಪನ್ನೀರ್", "ತುಪ್ಪ, ಬೆಣ್ಣೆ"
        elif choice == "fish":
            return "ನೀರಿನ ಸಸ್ಯಗಳು", "ಮೀನುಗಾರಿಕೆ", "ಮೀನು ಉತ್ಪನ್ನಗಳು"

    elif lang == "hi":
        if choice == "dry":
            return "रागी, ज्वार, बाजरा", "बकरी, मुर्गी", "घी, तेल"
        elif choice == "dairy":
            return "चारे की फसलें", "दूध, पनीर", "घी, मक्खन"
        elif choice == "fish":
            return "जल पौधे", "मछली पालन", "मछली उत्पाद"

    else:  # English
        if choice == "dry":
            return "Ragi, Jowar, Bajra", "Goat, Poultry", "Ghee, Oil"
        elif choice == "dairy":
            return "Fodder Crops", "Milk, Paneer", "Ghee, Butter"
        elif choice == "fish":
            return "Water Plants", "Fish Farming", "Fish Products"

    return "", "", ""

# ---------------- TTS ----------------
def speak(text, lang):
    tts = gTTS(text=text, lang=lang)
    audio_bytes = io.BytesIO()
    tts.write_to_fp(audio_bytes)
    audio_bytes.seek(0)
    return base64.b64encode(audio_bytes.read()).decode()

# ---------------- API ----------------
@app.post("/recommend")
def recommend(data: RequestData):
    crops, income, value = get_plan(data.choice, data.language)

    audio = speak(f"{crops}. {income}. {value}", data.language)

    return {
        "crops": crops,
        "income": income,
        "value_addition": value,
        "audio": audio
    }