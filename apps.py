import streamlit as st
from gtts import gTTS
import io
from pydantic import BaseModel
import tempfile

# For optional voice input
try:
    import speech_recognition as sr
    VOICE_ENABLED = True
except ImportError:
    VOICE_ENABLED = False

# ---------------- Backend logic ----------------
class RequestData(BaseModel):
    choice: str
    language: str

def get_plan(choice, lang):
    plans = {
        "en": {
            "dry": ("Ragi, Jowar, Bajra", "Goat, Poultry", "Ghee, Oil"),
            "dairy": ("Fodder Crops", "Milk, Paneer", "Ghee, Butter"),
            "fish": ("Water Plants", "Fish Farming", "Fish Products")
        },
        "hi": {
            "dry": ("रागी, ज्वार, बाजरा", "बकरी, मुर्गी", "घी, तेल"),
            "dairy": ("चारे की फसलें", "दूध, पनीर", "घी, मक्खन"),
            "fish": ("जल पौधे", "मछली पालन", "मछली उत्पाद")
        },
        "kn": {
            "dry": ("ರಾಗಿ, ಜೋಳ, ಜೋವಾರ", "ಆಡು, ಕೋಳಿ", "ತುಪ್ಪ, ಎಣ್ಣೆ"),
            "dairy": ("ಚಾರೆ ಬೆಳೆಗಳು", "ಹಾಲು, ಪನ್ನೀರ್", "ತುಪ್ಪ, ಬೆಣ್ಣೆ"),
            "fish": ("ನೀರಿನ ಸಸ್ಯಗಳು", "ಮೀನುಗಾರಿಕೆ", "ಮೀನು ಉತ್ಪನ್ನಗಳು")
        }
    }
    return plans[lang][choice]

def generate_audio(text, lang):
    tts = gTTS(text=text, lang=lang)
    audio_bytes = io.BytesIO()
    tts.write_to_fp(audio_bytes)
    audio_bytes.seek(0)
    return audio_bytes

def recommend(choice, language):
    crops, income, value = get_plan(choice, language)
    audio = generate_audio(f"{crops}. {income}. {value}", language)
    return {"crops": crops, "income": income, "value_addition": value, "audio_bytes": audio}

def speak_instruction(text, lang):
    audio_bytes = generate_audio(text, lang)
    st.audio(audio_bytes, format="audio/mp3")

# ---------------- Frontend ----------------
st.set_page_config(page_title="🌾 Sahayak AI", layout="wide")

# Session state
if "page" not in st.session_state:
    st.session_state.page = "language"
if "language" not in st.session_state:
    st.session_state.language = "en"
if "choice" not in st.session_state:
    st.session_state.choice = None

def go_to_page(page_name):
    st.session_state.page = page_name
    st.experimental_rerun()

# ---------------- Language Selection Page ----------------
if st.session_state.page == "language":
    st.title("🌾 Sahayak AI")
    st.subheader("Select Your Language / अपनी भाषा चुनें / ನಿಮ್ಮ ಭಾಷೆ ಆರಿಸಿ")

    col1, col2, col3 = st.columns(3)
    with col1:
        if st.button("🇬🇧 English"):
            st.session_state.language = "en"
            go_to_page("welcome")
    with col2:
        if st.button("🇮🇳 Hindi"):
            st.session_state.language = "hi"
            go_to_page("welcome")
    with col3:
        if st.button("🏴 Kannada"):
            st.session_state.language = "kn"
            go_to_page("welcome")

# ---------------- Welcome Page ----------------
elif st.session_state.page == "welcome":
    lang = st.session_state.language
    titles = {"en": "🌾 Welcome to Sahayak AI",
              "hi": "🌾 सहायक एआई में आपका स्वागत है",
              "kn": "🌾 ಸಹಾಯಕ ಎಐ ಗೆ ಸುಸ್ವಾಗತ"}
    descriptions = {"en": "Your assistant for climate-resilient crops and secondary income.",
                    "hi": "जलवायु-प्रतिरोधी फसल और वैकल्पिक आय के लिए आपका सहायक।",
                    "kn": "ಹವಾಮಾನ-ತಡೆಗಟ್ಟಿದ ಬೆಳೆ ಮತ್ತು ಪರ್ಯಾಯ ಆದಾಯಕ್ಕಾಗಿ ನಿಮ್ಮ ಸಹಾಯಕ."}
    st.title(titles[lang])
    st.write(descriptions[lang])
    speak_instruction(descriptions[lang], lang)

    if st.button({"en": "Start", "hi": "शुरू करें", "kn": "ಪ್ರಾರಂಭಿಸಿ"}[lang]):
        go_to_page("farm_type")

# ---------------- Farm Type Page ----------------
elif st.session_state.page == "farm_type":
    lang = st.session_state.language
    st.header({"en": "Select Your Farm Type", "hi": "अपना फ़ार्म प्रकार चुनें", "kn": "ನಿಮ್ಮ ಫಾರ್ಮ್ ಪ್ರಕಾರವನ್ನು ಆರಿಸಿ"}[lang])
    st.write({"en": "Click or say your farm type.", 
              "hi": "अपने फ़ार्म प्रकार पर क्लिक करें या बोलें।",
              "kn": "ನಿಮ್ಮ ಫಾರ್ಮ್ ಪ್ರಕಾರ ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ಹೇಳಿ."}[lang])

    # Voice input
    if VOICE_ENABLED:
        st.write("🎤 Speak your farm type (Dry Land, Dairy, Fish)")
        audio_file = st.file_uploader("Record your voice here", type=["wav", "mp3"])
        if audio_file is not None:
            r = sr.Recognizer()
            with sr.AudioFile(audio_file) as source:
                audio_data = r.record(source)
                try:
                    text = r.recognize_google(audio_data, language={"en": "en-US", "hi": "hi-IN", "kn": "kn-IN"}[lang])
                    st.write(f"You said: {text}")
                    if "dry" in text.lower() or "रागी" in text.lower() or "ರಾಗಿ" in text:
                        st.session_state.choice = "dry"
                    elif "dairy" in text.lower() or "दूध" in text.lower() or "ಹಾಲು" in text:
                        st.session_state.choice = "dairy"
                    elif "fish" in text.lower() or "मछली" in text.lower() or "ಮೀನು" in text:
                        st.session_state.choice = "fish"
                    if st.session_state.choice:
                        go_to_page("recommendation")
                except Exception as e:
                    st.error("Could not recognize speech. Please try again or use buttons.")

    # Fallback buttons
    col1, col2, col3 = st.columns(3)
    with col1:
        if st.button("🏜️ Dry Land", key="dry"):
            st.session_state.choice = "dry"
            go_to_page("recommendation")
    with col2:
        if st.button("🐄 Dairy", key="dairy"):
            st.session_state.choice = "dairy"
            go_to_page("recommendation")
    with col3:
        if st.button("🐟 Fish", key="fish"):
            st.session_state.choice = "fish"
            go_to_page("recommendation")

# ---------------- Recommendation Page ----------------
elif st.session_state.page == "recommendation":
    lang = st.session_state.language
    if st.session_state.choice is None:
        go_to_page("farm_type")

    st.header({"en": "Your Recommendations", "hi": "आपकी अनुशंसाएँ", "kn": "ನಿಮ್ಮ ಶಿಫಾರಸುಗಳು"}[lang])

    try:
        data = recommend(st.session_state.choice, lang)
        st.markdown(f"### 🌱 Crops: {data['crops']}")
        st.markdown(f"### 💰 Income: {data['income']}")
        st.markdown(f"### 🔄 Value Addition: {data['value_addition']}")
        st.audio(data["audio_bytes"], format="audio/mp3")

        if st.button({"en": "Go Back", "hi": "वापस जाएँ", "kn": "ಹಿಂತಿರುಗಿ"}[lang]):
            go_to_page("farm_type")

    except Exception as e:
        st.error(f"⚠️ Something went wrong: {e}")
