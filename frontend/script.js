// API Configuration
const API_URL = window.location.origin;
let currentLanguage = "english";
let selectedSkills = [];
let selectedSoilSkills = [];
let recognition = null;
let isListening = false;

// Skills List
const SKILLS_LIST = [
    { id: "bidri", name: "Bidri Work", kn: "ಬಿದ್ರಿ ಕೆಲಸ" },
    { id: "kasuti", name: "Kasuti Embroidery", kn: "ಕಸೂತಿ" },
    { id: "diya", name: "Diya Making", kn: "ದೀಪ ಮಾಡುವುದು" },
    { id: "pickle", name: "Pickle Making", kn: "ಉಪ್ಪಿನಕಾಯಿ" },
    { id: "agarbatti", name: "Agarbatti Making", kn: "ಅಗರಬತ್ತಿ" }
];

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });

    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            const parent = btn.closest('.card');
            if (parent.id === 'formTab' || parent.closest('#formTab')) {
                setLanguage(lang);
            } else if (parent.id === 'soilTab' || parent.closest('#soilTab')) {
                setSoilLanguage(lang);
            } else {
                setSchemesLanguage(lang);
            }
        });
    });

    // Submit buttons
    document.getElementById('submitBtn').addEventListener('click', getRecommendations);
    document.getElementById('soilBtn').addEventListener('click', analyzeSoil);

    // Soil upload
    const uploadArea = document.getElementById('uploadArea');
    const soilImage = document.getElementById('soilImage
