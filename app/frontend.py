import streamlit as st
import requests
import base64

st.set_page_config(page_title="🌾 Sahayak AI", layout="wide")

# ---------------- SESSION ----------------
if "language" not in st.session_state:
    st.session_state.language = "en"
if "choice" not in st.session_state:
    st.session_state.choice = ""

# ---------------- BACKEND ----------------
backend_url = "http://localhost:8000/recommend"

# ---------------- UI ----------------
st.title("🌾 Sahayak AI")
st.subheader("Krishi Mitra – Assistant")

st.markdown("### Select Farm Type")

col1, col2, col3 = st.columns(3)

with col1:
    if st.button("🏜️ Dry Land"):
        st.session_state.choice = "dry"

with col2:
    if st.button("🐄 Dairy"):
        st.session_state.choice = "dairy"

with col3:
    if st.button("🐟 Fish"):
        st.session_state.choice = "fish"

# ---------------- CALL API ----------------
if st.session_state.choice:
    try:
        response = requests.post(
            backend_url,
            json={
                "choice": st.session_state.choice,
                "language": st.session_state.language
            },
            timeout=10
        )

        response.raise_for_status()
        data = response.json()

        st.success("✅ Recommendation Ready")

        st.write("### 🌱 Crops:", data["crops"])
        st.write("### 💰 Income:", data["income"])
        st.write("### 🔄 Value Addition:", data["value_addition"])

        # 🔊 Play audio
        audio_bytes = base64.b64decode(data["audio"])
        st.audio(audio_bytes, format="audio/mp3")

    except Exception as e:
        st.error("⚠️ Failed to connect to backend")