// ========== BACK BUTTON FUNCTIONALITY ==========
let pageHistory = ['dashboard'];

function updateBackButton() {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        if (pageHistory.length > 1) {
            backBtn.style.display = 'flex';
        } else {
            backBtn.style.display = 'none';
        }
    }
}

function goBack() {
    if (pageHistory.length > 1) {
        pageHistory.pop();
        const previousPage = pageHistory[pageHistory.length - 1];
        switchTab(previousPage);
        
        // Update nav active state
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
            if (nav.getAttribute('data-page') === previousPage) {
                nav.classList.add('active');
            }
        });
    }
}

// Override switchTab to add to history
const originalSwitchTab = switchTab;
switchTab = function(tabName) {
    const currentPage = document.querySelector('.page.active')?.id?.replace('Page', '');
    if (currentPage && currentPage !== tabName) {
        pageHistory.push(tabName);
    }
    originalSwitchTab(tabName);
    updateBackButton();
};

// Clear reports function
function clearReports() {
    if (confirm(currentLanguage === 'kannada' ? 'ಎಲ್ಲಾ ರಿಪೋರ್ಟ್ಗಳನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?' : 'Are you sure you want to clear all reports?')) {
        localStorage.removeItem('sahayak_recent');
        loadRecentRecommendations();
        alert(currentLanguage === 'kannada' ? 'ರಿಪೋರ್ಟ್ಗಳನ್ನು ಅಳಿಸಲಾಗಿದೆ' : 'Reports cleared');
    }
}

// Update loadRecentRecommendations function
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

// Update displayRecommendations to save correctly
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
    
    html += `</div>
    <button class="btn-secondary" onclick="document.getElementById('results').style.display='none'" style="margin-top: 16px;">✕ Close</button>`;
    
    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
    
    // Update dashboard stats
    if (data.summary) {
        document.getElementById('monthlyIncome').innerHTML = `₹${data.summary.monthly_income}`;
    }
}

// Add event listener for clear reports button
document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...
    
    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', goBack);
    }
    
    // Clear reports button
    const clearBtn = document.getElementById('clearReportsBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearReports);
    }
    
    // Update back button on load
    updateBackButton();
});
