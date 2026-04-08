# frontend.py
import streamlit as st
import requests
import base64

st.set_page_config(page_title="🌾 Sahayak AI", layout="wide")

# UI text dictionary for multilingual support
UI_TEXTS = {
    "en": {
        "title": "🌾 Sahayak AI",
        "subtitle": "Your Farm’s Best Friend",
        "select_farm": "Select Farm Type",
        "dry_land": "🏜️ Dry Land",
        "dairy": "🐄 Dairy",
        "fish": "🐟 Fish Farming",
        "farm_size": "Farm Size (acres / pond size)",
        "water_availability": "💧 Water Availability",
        "low": "Low",
        "medium": "Medium",
        "high": "High",
        "get_recommendations": "🎯 Get Recommendations",
        "audio_instruction": "🔊 Play Instruction Audio"
    },
    "hi": {
        "title": "🌾 सहायाक एआई",
        "subtitle": "आपके खेत का साथी",
        "select_farm": "कृषि प्रकार चुनें",
        "dry_land": "🏜️ शुष्क भूमि",
        "dairy": "🐄 डेयरी",
        "fish": "🐟 मछली पालन",
        "farm_size": "खेती का क्षेत्रफल (एकड़ / तालाब आकार)",
        "water_availability": "💧 जल उपलब्धता",
        "low": "कम",
        "medium": "मध्यम",
        "high": "उच्च",
        "get_recommendations": "🎯 सिफारिशें प्राप्त करें",
        "audio_instruction": "🔊 निर्देश ऑडियो चलाएं"
    },
    "kn": {
        "title": "🌾 ಸಹಾಯಕ AI",
        "subtitle": "ನಿಮ್ಮ ಹೊಲದ ಗೆಳೆಯ",
        "select_farm": "ಕೃಷಿ ಪ್ರಕಾರ ಆಯ್ಕೆಮಾಡಿ",
        "dry_land": "🏜️ ಒಣ ಭೂಮಿ",
        "dairy": "🐄 ಹಸುಗಾರಿಕೆ",
        "fish": "🐟 ಮೀನುಗಾರಿಕೆ",
        "farm_size": "ಹೊಳದ ಗಾತ್ರ (ಎಕರೆ / ತೋಟದ ಗಾತ್ರ)",
        "water_availability": "💧 ನೀರಿನ ಲಭ್ಯತೆ",
        "low": "ಕಡಿಮೆ",
        "medium": "ಮಧ್ಯಮ",
        "high": "ಹೆಚ್ಚು",
        "get_recommendations": "🎯 ಶಿಫಾರಸು ಪಡೆಯಿರಿ",
        "audio_instruction": "🔊 ಆಡಿಯೋ ಸೂಚನೆ ಕೇಳಿ"
    }
}

def play_audio_from_base64(b64_audio):
    audio_bytes = base64.b64decode(b64_audio)
    st.audio(audio_bytes, format="audio/mp3")

# Sidebar for language selection
language = st.sidebar.selectbox(
    "Select Language / भाषा चुनें / ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
    options=["English", "Hindi", "Kannada"]
)

lang_code_map = {"English": "en", "Hindi": "hi", "Kannada": "kn"}
lang_code = lang_code_map[language]
texts = UI_TEXTS[lang_code]

# Page Header
st.markdown(f"<h1 style='text-align:center;'>{texts['title']}</h1>", unsafe_allow_html=True)
st.markdown(f"<h3 style='text-align:center;'>{texts['subtitle']}</h3>", unsafe_allow_html=True)

# Audio instruction button
if st.button(texts["audio_instruction"]):
    # Play simple instruction audio in selected language
    from gtts import gTTS
    import io
    tts = gTTS(text=texts["select_farm"], lang=lang_code)
    audio_bytes = io.BytesIO()
    tts.write_to_fp(audio_bytes)
    audio_bytes.seek(0)
    st.audio(audio_bytes.read(), format="audio/mp3")

# Farm type selection with big buttons and icons
col1, col2, col3 = st.columns(3)
farm_type = None
if col1.button(texts["dry_land"]):
    farm_type = "dry"
if col2.button(texts["dairy"]):
    farm_type = "dairy"
if col3.button(texts["fish"]):
    farm_type = "fish"

if farm_type:
    st.session_state["farm_type"] = farm_type
    st.markdown(f"### {texts['select_farm']}: {farm_type.capitalize()}")

    farm_size = st.slider(texts["farm_size"], 0.1, 10.0, 1.0, step=0.1)

    water_options = [texts["low"], texts["medium"], texts["high"]]
    water_availability = st.radio(texts["water_availability"], options=water_options)

    if st.button(texts["get_recommendations"]):
        try:
            response = requests.post(
                "http://localhost:8000/recommend",
                json={
                    "farm_type": farm_type,
                    "farm_size": farm_size,
                    "water_availability": water_availability.lower(),
                    "language": lang_code
                },
                timeout=15
            )
            response.raise_for_status()
            data = response.json()

            st.success("✅ Recommendations Ready!")

            st.markdown(f"### {texts['result_main_crop']}")
            st.write(", ".join(data["main_crops"]))
            st.write(f"Estimated Income: {data['main_income']}")

            st.markdown(f"### {texts['result_secondary']}")
            for option in data["secondary_income"]:
                st.write(f"- {option}")

            # Play audio guidance
            play_audio_from_base64(data["audio"])

        except Exception as e:
            st.error(f"Failed to fetch recommendations: {e}")
