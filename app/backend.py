# backend.py
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from gtts import gTTS
import io
import base64
import random

app = FastAPI(title="Sahayak AI Backend")

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RequestData(BaseModel):
    farm_type: str       # dry, dairy, fish
    language: str        # en, hi, kn
    farm_size: float     # in acres or pond size
    water_availability: str  # low, medium, high

# Secondary income realistic options
secondary_income_options = {
    "dry": [
        {"name": {"en": "Goat Rearing", "hi": "बकरी पालन", "kn": "ಮೇಡ ಕೇಳುವಿಕೆ"},
         "income_range": (15000, 40000)},
        {"name": {"en": "Millet Flour Production", "hi": "बाजरे का आटा उत्पादन", "kn": "ಜೋಳ ಹಿಟ್ಟು ಉತ್ಪಾದನೆ"},
         "income_range": (5000, 15000)},
        {"name": {"en": "Organic Compost Sales", "hi": "कार्बनिक खाद बिक्री", "kn": "ಸेंद्रಿಯ ಹುಲ್ಲು ಮಾರಾಟ"},
         "income_range": (3000, 10000)}
    ],
    "dairy": [
        {"name": {"en": "Paneer Production", "hi": "पनीर उत्पादन", "kn": "ಪನೀರ್ ತಯಾರಿ"},
         "income_range": (10000, 30000)},
        {"name": {"en": "Ghee Production", "hi": "घी उत्पादन", "kn": "ತುಪ್ಪ ತಯಾರಿ"},
         "income_range": (15000, 40000)},
        {"name": {"en": "Poultry Farming", "hi": "मुर्गी पालन", "kn": "ಕೊಳಿ ಪಾಲನೆ"},
         "income_range": (10000, 25000)}
    ],
    "fish": [
        {"name": {"en": "Fish Processing", "hi": "मछली प्रसंस्करण", "kn": "ಮೀನು ಪ್ರಕ್ರಿಯೆ"},
         "income_range": (15000, 40000)},
        {"name": {"en": "Water Plant Farming", "hi": "जल पौधे खेती", "kn": "ನೀటి ಸಸ್ಯಗಳು ಬೆಳೆಸುವುದು"},
         "income_range": (5000, 15000)},
        {"name": {"en": "Goat Rearing", "hi": "बकरी पालन", "kn": "ಮೇಡ ಕೇಳುವಿಕೆ"},
         "income_range": (10000, 25000)}
    ]
}

main_crops = {
    "dry": {
        "en": ["Ragi", "Jowar", "Bajra", "Millets"],
        "hi": ["रागी", "ज्वार", "बाजरा", "मिलेट्स"],
        "kn": ["ರಾಗಿ", "ಜೋಳ", "ಜೋವಾರ", "ಮಿಲೆಟ್ಸ್"]
    },
    "dairy": {
        "en": ["Fodder Crops"],
        "hi": ["चारे की फसलें"],
        "kn": ["ಚಾರೆ ಬೆಳೆಗಳು"]
    },
    "fish": {
        "en": ["Water Plants"],
        "hi": ["जल पौधे"],
        "kn": ["ನೀರಿನ ಸಸ್ಯಗಳು"]
    }
}

lang_map = {"en": "en", "hi": "hi", "kn": "kn"}

def speak(text, lang="en"):
    tts = gTTS(text=text, lang=lang)
    audio_bytes = io.BytesIO()
    tts.write_to_fp(audio_bytes)
    audio_bytes.seek(0)
    return base64.b64encode(audio_bytes.read()).decode()

@app.post("/recommend")
def recommend(data: RequestData):
    crops = main_crops.get(data.farm_type, {}).get(data.language, [])
    options_raw = secondary_income_options.get(data.farm_type, [])
    options = random.sample(options_raw, 2)

    sec_income_list = []
    sec_income_text_list = []
    for o in options:
        low, high = o["income_range"]
        est_low = int(low * data.farm_size)
        est_high = int(high * data.farm_size)
        income_text = f"₹{est_low} - ₹{est_high}"
        name = o["name"].get(data.language, o["name"]["en"])
        sec_income_list.append(f"{name} ({income_text})")
        sec_income_text_list.append(f"{name} estimated income between {income_text}")

    main_income_low = int(30000 * data.farm_size)
    main_income_high = int(70000 * data.farm_size)
    main_income_text = f"₹{main_income_low} - ₹{main_income_high}"
    main_crops_text = ", ".join(crops)

    # Audio text for TTS - simple and clear
    audio_text = (
        f"Main crops are {main_crops_text}. "
        f"Estimated income is {main_income_text}. "
        f"Secondary income options are {', '.join(sec_income_text_list)}."
    )

    audio_b64 = speak(audio_text, lang_map.get(data.language, "en"))

    return {
        "main_crops": crops,
        "main_income": main_income_text,
        "secondary_income": sec_income_list,
        "audio": audio_b64
    }
