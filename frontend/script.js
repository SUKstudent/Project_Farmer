// ========== API CONFIGURATION ==========
const API_URL = window.location.origin;
let currentLanguage = "english";
let soilLanguage = "english";
let schemesLanguage = "english";
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

// ========== HELPER FUNCTIONS ==========
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div class="loading"><div class="spinner"></div><p>Loading...</p></div>`;
    }
}

function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div class="error">❌ ${message}</div>`;
    }
}

// ========== NAVIGATION FUNCTIONS ==========
function switchTab(tabName) {
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
    
    // Update page visibility
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`${tabName}Page`).classList.add('active');
    
    // Update page title
    const pageTitles = {
        dashboard: 'Dashboard',
        farmer: 'Farmer Details',
        soil: 'Soil Analysis',
        schemes: 'Government Schemes',
        skills: 'Family Skills',
        reports: 'Reports'
    };
    document.getElementById('pageTitle').innerText = pageTitles[tabName] || 'Dashboard';
}

function navigateTo(pageName) {
    switchTab(pageName);
}

// ========== RENDER FUNCTIONS ==========
function renderSkills(containerId, selectedArray, onClickFn, lang) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    
    SKILLS_LIST.forEach(skill => {
        const isSelected = selectedArray.includes(skill.id);
        const chip = document.createElement('div');
        chip.className = `skill-chip ${isSelected ? 'selected' : ''}`;
        chip.onclick = () => onClickFn(skill.id);
        chip.innerHTML = `
            <input type="checkbox" ${isSelected ? 'checked' : ''} readonly>
            <span>${lang === 'kannada' ? skill.kn : skill.name}</span>
        `;
        container.appendChild(chip);
    });
}

function toggleSkill(skillId) {
    const index = selectedSkills.indexOf(skillId);
    if (index === -1) {
        selectedSkills.push(skillId);
    } else {
        selectedSkills.splice(index, 1);
    }
    renderSkills('skillsGrid', selectedSkills, toggleSkill, currentLanguage);
}

function toggleSoilSkill(skillId) {
    const index = selectedSoilSkills.indexOf(skillId);
    if (index === -1) {
        selectedSoilSkills.push(skillId);
    } else {
        selectedSoilSkills.splice(index, 1);
    }
    renderSkills('soilSkillsGrid', selectedSoilSkills, toggleSoilSkill, soilLanguage);
}

// ========== LANGUAGE FUNCTIONS ==========
function setLanguage(lang) {
    currentLanguage = lang;
    
    // Update active button
    document.querySelectorAll('#farmerPage .lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // Update labels
    document.getElementById('label-land').innerHTML = lang === 'kannada' ? '🌍 ಜಮೀನು (ಎಕರೆ)' : '🌍 Land Size (acres)';
    document.getElementById('label-water').innerHTML = lang === 'kannada' ? '💧 ನೀರಿನ ಲಭ್ಯತೆ' : '💧 Water Availability';
    document.getElementById('label-budget').innerHTML = lang === 'kannada' ? '💰 ಬಜೆಟ್ (₹)' : '💰 Budget (₹)';
    document.getElementById('label-skills').innerHTML = lang === 'kannada' ? '👨‍👩‍👧‍👦 ಕುಟುಂಬ ಕೌಶಲ್ಯಗಳು' : '👨‍👩‍👧‍👦 Family Skills';
    document.getElementById('submitBtn').innerHTML = lang === 'kannada' ? '🔍 ಸಲಹೆ ಪಡೆಯಿರಿ' : '🔍 Get Recommendations';
    
    renderSkills('skillsGrid', selectedSkills, toggleSkill, lang);
}

function setSoilLanguage(lang) {
    soilLanguage = lang;
    
    document.querySelectorAll('#soilPage .lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    document.getElementById('soil-label-land').innerHTML = lang === 'kannada' ? '🌍 ಜಮೀನು (ಎಕರೆ)' : '🌍 Land Size (acres)';
    document.getElementById('soil-label-budget').innerHTML = lang === 'kannada' ? '💰 ಬಜೆಟ್ (₹)' : '💰 Budget (₹)';
    document.getElementById('soil-label-skills').innerHTML = lang === 'kannada' ? '👨‍👩‍👧‍👦 ಕುಟುಂಬ ಕೌಶಲ್ಯಗಳು' : '👨‍👩‍👧‍👦 Family Skills';
    document.getElementById('upload-text').innerHTML = lang === 'kannada' ? '📸 ಮಣ್ಣಿನ ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ' : '📸 Click to upload soil photo';
    document.getElementById('soilBtn').innerHTML = lang === 'kannada' ? '📸 ಮಣ್ಣು ವಿಶ್ಲೇಷಿಸಿ' : '📸 Analyze Soil';
    
    renderSkills('soilSkillsGrid', selectedSoilSkills, toggleSoilSkill, lang);
}

function setSchemesLanguage(lang) {
    schemesLanguage = lang;
    
    document.querySelectorAll('#schemesPage .lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    loadSchemes();
}

// ========== API CALLS ==========
async function getRecommendations() {
    const land = document.getElementById('land').value;
    const water = document.getElementById('water').value;
    const budget = document.getElementById('budget').value;
    
    if (!land || !budget) {
        alert(currentLanguage === 'kannada' ? 'ದಯವಿಟ್ಟು ಜಮೀನು ಗಾತ್ರ ಮತ್ತು ಬಜೆಟ್ ನಮೂದಿಸಿ' : 'Please enter land size and budget');
        return;
    }
    
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `<div class="loading"><div class="spinner"></div><p>${currentLanguage === 'kannada' ? 'ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...' : 'Analyzing...'}</p></div>`;
    resultsDiv.style.display = 'block';
    
    try {
        const response = await fetch(`${API_URL}/api/recommend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                land_acres: parseFloat(land),
                water: water,
                budget: parseFloat(budget),
                skills: selectedSkills,
                language: currentLanguage
            })
        });
        
        const data = await response.json();
        displayRecommendations(data);
        
        // Save to recent recommendations
        saveToRecent(data);
        
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = `<div class="error">❌ Error: Could not connect to server. Make sure backend is running.</div>`;
    }
}

function displayRecommendations(data) {
    const resultsDiv = document.getElementById('results');
    const isKn = currentLanguage === 'kannada';
    
    let html = `<div class="result-section">
        <div class="result-title">📋 ${isKn ? 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಯೋಜನೆ' : 'Your Personalized Plan'}</div>`;
    
    // Crops
    if (data.crops && data.crops.length) {
        html += `<div class="result-subsection">
            <div class="result-title">🌽 ${isKn ? 'ಸೂಕ್ತ ಬೆಳೆಗಳು' : 'Recommended Crops'}</div>
            <div class="result-grid">`;
        for (let crop of data.crops) {
            html += `<div class="result-card">
                <h4>${crop.display_name}</h4>
                <p>💰 ${isKn ? 'ಲಾಭ' : 'Profit'}: ₹${crop.profit}/${isKn ? 'ಎಕರೆ' : 'acre'}</p>
                <p>⏱️ ${isKn ? 'ಲಾಭದ ಅವಧಿ' : 'ROI'}: ${crop.roi} ${isKn ? 'ತಿಂಗಳು' : 'months'}</p>
            </div>`;
        }
        html += `</div></div>`;
    }
    
    // Livestock
    if (data.livestock && data.livestock.length) {
        html += `<div class="result-subsection">
            <div class="result-title">🐐 ${isKn ? 'ಜಾನುವಾರು' : 'Livestock Options'}</div>
            <div class="result-grid">`;
        for (let item of data.livestock) {
            html += `<div class="result-card">
                <h4>${item.display_name}</h4>
                <p>💰 ${isKn ? 'ವೆಚ್ಚ' : 'Setup'}: ₹${item.setup}</p>
                <p>📈 ${isKn ? 'ಮಾಸಿಕ ಆದಾಯ' : 'Monthly'}: ₹${item.monthly}</p>
            </div>`;
        }
        html += `</div></div>`;
    }
    
    // Skills
    if (data.skills && data.skills.length) {
        html += `<div class="result-subsection">
            <div class="result-title">👩‍🎨 ${isKn ? 'ಕುಟುಂಬ ಕೌಶಲ್ಯಗಳು' : 'Family Skills'}</div>
            <div class="result-grid">`;
        for (let skill of data.skills) {
            html += `<div class="result-card">
                <h4>${skill.display_name}</h4>
                <p>💰 ${isKn ? 'ವೆಚ್ಚ' : 'Setup'}: ₹${skill.setup}</p>
                <p>📈 ${isKn ? 'ಮಾಸಿಕ ಆದಾಯ' : 'Monthly'}: ₹${skill.monthly}</p>
                ${skill.training ? `<p>🎓 ${isKn ? 'ತರಬೇತಿ ಕೇಂದ್ರ' : 'Training'}: ${skill.training}</p>` : ''}
            </div>`;
        }
        html += `</div></div>`;
    }
    
    // Schemes
    if (data.schemes && data.schemes.length) {
        html += `<div class="result-subsection">
            <div class="result-title">🏦 ${isKn ? 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು' : 'Government Schemes'}</div>
            <div class="result-grid">`;
        for (let scheme of data.schemes) {
            html += `<div class="result-card">
                <h4>${scheme.display_name}</h4>
                <p>🎯 ${isKn ? 'ಸಬ್ಸಿಡಿ' : 'Subsidy'}: ${scheme.subsidy}</p>
                <p>💰 ${isKn ? 'ಗರಿಷ್ಠ ಸಾಲ' : 'Max Loan'}: ₹${scheme.loan}</p>
            </div>`;
        }
        html += `</div></div>`;
    }
    
    // Summary
    if (data.summary) {
        html += `<div class="summary-box">
            <h3>📊 ${isKn ? 'ಸಾರಾಂಶ' : 'Summary'}</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="label">💰 ${isKn ? 'ಒಟ್ಟು ವೆಚ್ಚ' : 'Total Setup'}</div>
                    <div class="value">₹${data.summary.total_setup}</div>
                </div>
                <div class="summary-item">
                    <div class="label">📈 ${isKn ? 'ಮಾಸಿಕ ಆದಾಯ' : 'Monthly Income'}</div>
                    <div class="value">₹${data.summary.monthly_income}</div>
                </div>
                <div class="summary-item">
                    <div class="label">🎯 ${isKn ? 'ಆದಾಯ ಸ್ಥಿರತೆ' : 'Stability'}</div>
                    <div class="value">${data.summary.stability}</div>
                </div>
            </div>
        </div>`;
    }
    
    html += `</div>`;
    resultsDiv.innerHTML = html;
    
    // Update dashboard stats
    if (data.summary) {
        document.getElementById('monthlyIncome').innerHTML = `₹${data.summary.monthly_income}`;
    }
}

function saveToRecent(data) {
    let recent = JSON.parse(localStorage.getItem('sahayak_recent') || '[]');
    recent.unshift({
        date: new Date().toLocaleString(),
        crops: data.crops?.map(c => c.display_name).join(', '),
        monthly_income: data.summary?.monthly_income
    });
    recent = recent.slice(0, 5);
    localStorage.setItem('sahayak_recent', JSON.stringify(recent));
    loadRecentRecommendations();
}

function loadRecentRecommendations() {
    const recent = JSON.parse(localStorage.getItem('sahayak_recent') || '[]');
    const container = document.getElementById('recentRecommendations');
    if (!container) return;
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="empty-state">No recommendations yet. Fill your details to get started.</p>';
        return;
    }
    
    let html = '<div class="recent-list">';
    for (let item of recent) {
        html += `<div class="recent-item">
            <div class="recent-date">📅 ${item.date}</div>
            <div class="recent-crops">🌾 ${item.crops || 'N/A'}</div>
            <div class="recent-income">💰 ₹${item.monthly_income || 0}/month</div>
        </div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

// ========== SOIL ANALYSIS ==========
function previewImage(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

async function analyzeSoil() {
    const fileInput = document.getElementById('soilImage');
    const file = fileInput.files[0];
    const land = document.getElementById('soil-land').value;
    const budget = document.getElementById('soil-budget').value;
    
    if (!file || !land || !budget) {
        alert(soilLanguage === 'kannada' ? 'ದಯವಿಟ್ಟು ಮಣ್ಣಿನ ಫೋಟೋ, ಜಮೀನು ಮತ್ತು ಬಜೆಟ್ ನಮೂದಿಸಿ' : 'Please upload soil photo, enter land and budget');
        return;
    }
    
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `<div class="loading"><div class="spinner"></div><p>${soilLanguage === 'kannada' ? 'ಮಣ್ಣು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...' : 'Analyzing soil...'}</p></div>`;
    resultsDiv.style.display = 'block';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('land_acres', land);
    formData.append('budget', budget);
    formData.append('skills', JSON.stringify(selectedSoilSkills));
    formData.append('language', soilLanguage);
    
    try {
        const response = await fetch(`${API_URL}/api/soil/analyze`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        displaySoilResults(data);
        
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = `<div class="error">❌ Error analyzing soil. Make sure backend is running.</div>`;
    }
}

function displaySoilResults(data) {
    const resultsDiv = document.getElementById('results');
    const isKn = soilLanguage === 'kannada';
    
    let html = `<div class="result-section">
        <div class="result-title">📸 ${isKn ? 'ಮಣ್ಣು ವಿಶ್ಲೇಷಣೆ ಫಲಿತಾಂಶ' : 'Soil Analysis Result'}</div>
        
        <div class="soil-result">
            <div class="soil-type">
                <h3>🌱 ${isKn ? 'ಮಣ್ಣಿನ ಪ್ರಕಾರ' : 'Soil Type'}: ${data.soil_analysis.type}</h3>
                <p>💧 ${isKn ? 'ನೀರು ಧಾರಣ ಸಾಮರ್ಥ್ಯ' : 'Water Holding Capacity'}: ${data.soil_analysis.water_holding}</p>
                <p>📊 ${isKn ? 'ವಿಶ್ವಾಸಾರ್ಹತೆ' : 'Confidence'}: ${data.soil_analysis.confidence}%</p>
            </div>
        </div>`;
    
    if (data.recommendations.crops && data.recommendations.crops.length) {
        html += `<div class="result-subsection">
            <div class="result-title">🌽 ${isKn ? 'ಸೂಕ್ತ ಬೆಳೆಗಳು' : 'Recommended Crops'}</div>
            <div class="result-grid">`;
        for (let crop of data.recommendations.crops) {
            html += `<div class="result-card">
                <h4>${crop.display_name}</h4>
                <p>💰 ${isKn ? 'ಲಾಭ' : 'Profit'}: ₹${crop.profit}/${isKn ? 'ಎಕರೆ' : 'acre'}</p>
            </div>`;
        }
        html += `</div></div>`;
    }
    
    if (data.recommendations.livestock && data.recommendations.livestock.length) {
        html += `<div class="result-subsection">
            <div class="result-title">🐐 ${isKn ? 'ಜಾನುವಾರು' : 'Livestock'}</div>
            <div class="result-grid">`;
        for (let item of data.recommendations.livestock) {
            html += `<div class="result-card">
                <h4>${item.display_name}</h4>
                <p>💰 ${isKn ? 'ವೆಚ್ಚ' : 'Setup'}: ₹${item.setup}</p>
                <p>📈 ${isKn ? 'ಮಾಸಿಕ' : 'Monthly'}: ₹${item.monthly}</p>
            </div>`;
        }
        html += `</div></div>`;
    }
    
    if (data.recommendations.skills && data.recommendations.skills.length) {
        html += `<div class="result-subsection">
            <div class="result-title">👩‍🎨 ${isKn ? 'ಕುಟುಂಬ ಕೌಶಲ್ಯಗಳು' : 'Family Skills'}</div>
            <div class="result-grid">`;
        for (let skill of data.recommendations.skills) {
            html += `<div class="result-card">
                <h4>${skill.display_name}</h4>
                <p>💰 ${isKn ? 'ವೆಚ್ಚ' : 'Setup'}: ₹${skill.setup}</p>
                <p>📈 ${isKn ? 'ಮಾಸಿಕ' : 'Monthly'}: ₹${skill.monthly}</p>
            </div>`;
        }
        html += `</div></div>`;
    }
    
    html += `</div>`;
    resultsDiv.innerHTML = html;
}

// ========== LOAD SCHEMES ==========
async function loadSchemes() {
    const container = document.getElementById('schemesList');
    if (!container) return;
    
    container.innerHTML = `<div class="loading"><div class="spinner"></div><p>Loading schemes...</p></div>`;
    
    try {
        const response = await fetch(`${API_URL}/api/schemes?language=${schemesLanguage}`);
        const data = await response.json();
        
        if (data.success && data.schemes) {
            let html = '<div class="schemes-container">';
            for (let scheme of data.schemes) {
                html += `<div class="scheme-card">
                    <h3>${scheme.display_name}</h3>
                    <div class="subsidy">🎯 ${scheme.subsidy}</div>
                    <div class="loan">💰 Max Loan: ₹${scheme.loan}</div>
                    <p class="desc">${scheme.display_desc || scheme.desc || ''}</p>
                </div>`;
            }
            html += '</div>';
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading schemes:', error);
        container.innerHTML = `<div class="error">❌ Could not load schemes. Make sure backend is running.</div>`;
    }
}

// ========== LOAD SKILLS ==========
async function loadSkills() {
    const container = document.getElementById('skillsShowcase');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/api/skills?language=${currentLanguage}`);
        const data = await response.json();
        
        if (data.success && data.skills) {
            let html = '<div class="skills-showcase-grid">';
            for (let skill of data.skills) {
                html += `<div class="skill-showcase-card">
                    <div class="skill-icon">👩‍🎨</div>
                    <h3>${skill.display_name}</h3>
                    <p>💰 Setup: ₹${skill.setup}</p>
                    <p>📈 Monthly: ₹${skill.monthly}</p>
                    <p>🎓 Training: ${skill.training}</p>
                </div>`;
            }
            html += '</div>';
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading skills:', error);
        container.innerHTML = `<div class="error">❌ Could not load skills.</div>`;
    }
}

// ========== ARYA VOICE ASSISTANT ==========
function toggleArya() {
    const chat = document.getElementById('aryaChat');
    chat.classList.toggle('show');
}

function addAryaMessage(text, isFarmer = false) {
    const messagesDiv = document.getElementById('aryaMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isFarmer ? 'farmer-msg' : 'arya-msg'}`;
    msgDiv.innerHTML = (isFarmer ? '👨‍🌾 ' : '🤖 ') + text;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    if (!isFarmer) {
        speak(text);
    }
}

function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = currentLanguage === 'kannada' ? 'kn-IN' : 'en-IN';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }
}

function startListening() {
    const micBtn = document.getElementById('micBtn');
    
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = currentLanguage === 'kannada' ? 'kn-IN' : 'en-IN';
        
        recognition.onstart = () => {
            isListening = true;
            micBtn.classList.add('recording');
            micBtn.innerHTML = '🎤 Listening...';
        };
        
        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            addAryaMessage(transcript, true);
            
            try {
                const response = await fetch(`${API_URL}/api/voice/respond?question=${encodeURIComponent(transcript)}&language=${currentLanguage}`);
                const data = await response.json();
                addAryaMessage(data.response, false);
            } catch (error) {
                addAryaMessage("Sorry, I couldn't process that.", false);
            }
        };
        
        recognition.onerror = () => {
            micBtn.classList.remove('recording');
            micBtn.innerHTML = '🎤 Press and Speak';
            addAryaMessage("Sorry, I didn't hear you. Please try again.", false);
        };
        
        recognition.onend = () => {
            isListening = false;
            micBtn.classList.remove('recording');
            micBtn.innerHTML = '🎤 Press and Speak';
        };
        
        recognition.start();
    } else {
        alert('Voice input not supported. Please use Chrome browser.');
    }
}

function stopListening() {
    if (recognition && isListening) {
        recognition.stop();
    }
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sahayak AI - Initializing...');
    
    // Tab click handlers
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = tab.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Navigation menu items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            if (page) {
                switchTab(page);
            }
            // Update active nav item
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
    
    // Language buttons for Farmer page
    document.querySelectorAll('#farmerPage .lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.getAttribute('data-lang'));
        });
    });
    
    // Language buttons for Soil page
    document.querySelectorAll('#soilPage .lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setSoilLanguage(btn.getAttribute('data-lang'));
        });
    });
    
    // Language buttons for Schemes page
    document.querySelectorAll('#schemesPage .lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setSchemesLanguage(btn.getAttribute('data-lang'));
        });
    });
    
    // Submit button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', getRecommendations);
    }
    
    // Soil button
    const soilBtn = document.getElementById('soilBtn');
    if (soilBtn) {
        soilBtn.addEventListener('click', analyzeSoil);
    }
    
    // Soil upload
    const uploadArea = document.getElementById('uploadArea');
    const soilImageInput = document.getElementById('soilImage');
    if (uploadArea && soilImageInput) {
        uploadArea.addEventListener('click', () => {
            soilImageInput.click();
        });
        soilImageInput.addEventListener('change', (e) => {
            previewImage(e.target);
        });
    }
    
    // Arya button
    const aryaBtn = document.getElementById('openArya');
    if (aryaBtn) {
        aryaBtn.addEventListener('click', toggleArya);
    }
    
    const aryaClose = document.querySelector('.arya-close');
    if (aryaClose) {
        aryaClose.addEventListener('click', toggleArya);
    }
    
    // Mic button
    const micBtn = document.getElementById('micBtn');
    if (micBtn) {
        micBtn.addEventListener('mousedown', startListening);
        micBtn.addEventListener('mouseup', stopListening);
        micBtn.addEventListener('touchstart', startListening);
        micBtn.addEventListener('touchend', stopListening);
    }
    
    // Initial renders
    renderSkills('skillsGrid', selectedSkills, toggleSkill, 'english');
    renderSkills('soilSkillsGrid', selectedSoilSkills, toggleSoilSkill, 'english');
    
    // Load data
    loadSchemes();
    loadSkills();
    loadRecentRecommendations();
    
    console.log('Sahayak AI - Ready!');
});
