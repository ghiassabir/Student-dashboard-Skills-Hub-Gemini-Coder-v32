// --- DUMMY DATA ---
// This object now includes richer data points like subject, difficulty, explanations,
// and class performance ratios to power the new features.
let currentStudentData = {
    name: "Alex Johnson",
    targetScore: 1400,
    latestScores: { total: 1250, rw: 620, math: 630, avgEocKhan: 78 },
    timeSpent: { studentAvg: 120, studentUnit: "min / day", classAvg: 130, classUnit: "min / day"},
    scoreTrend: { labels: ['Diag', 'Test 1', 'Test 2'], studentScores: [1130, 1220, 1250], classAvgScores: [1050, 1150, 1180] },
    overallSkillPerformance: { labels: ['Reading', 'Writing', 'Math'], studentAccuracy: [78, 82, 75], classAvgAccuracy: [75, 79, 72] },
    
    // Test data now includes a full list of questions
    cbPracticeTests: [
        { 
            name: "Diagnostic Test", date: "2024-03-01", rw: "550", math: "580", total: "1130", 
            questions: [
                { id: 101, subject: "math", skill: "Linear Equations", difficulty: "Easy", yourAnswer: "x = 4", correctAnswer: "x = 4", isCorrect: true, explanation: "To solve 3x - 7 = 5, add 7 to both sides to get 3x = 12, then divide by 3.", yourTime: 40, classAvgTime: 45, classPerformance: { correct: 85, incorrect: 10, unanswered: 5 } },
                { id: 102, subject: "reading", skill: "Command of Evidence", difficulty: "Medium", yourAnswer: "Lines 20-25", correctAnswer: "Lines 30-35", isCorrect: false, explanation: "The best evidence is in the third paragraph, which directly discusses the author's main counter-argument.", yourTime: 90, classAvgTime: 75, classPerformance: { correct: 65, incorrect: 30, unanswered: 5 } }
            ]
        },
        { name: "Official Practice Test 2", date: "Not Attempted", rw: "-", math: "-", total: "-"},
    ],
    
    eocQuizzes: {
        reading: [{ 
            name: "Vocabulary in Context", date: "2024-05-01", latestScore: "85% (17/20)",
            questions: [
                { id: 201, subject: "reading", skill: "Words in Context", difficulty: "Easy", yourAnswer: "expand", correctAnswer: "expand", isCorrect: true, explanation: "Given the context of growth, 'expand' is the most appropriate word.", classPerformance: { correct: 90, incorrect: 8, unanswered: 2 } }
            ]
        }],
        math: []
    },
    khanAcademy: { reading: [] },
    
    // Skills are now the primary source for the skills list
    skills: {
        reading: [
            { name: "Command of Evidence", score: 55, classAvg: 65, attempted: true },
            { name: "Words in Context", score: 92, classAvg: 80, attempted: true },
        ],
        writing: [
            { name: "Transitions", score: 48, classAvg: 70, attempted: true }
        ],
        math: [
            { name: "Linear Equations", score: 95, classAvg: 85, attempted: true },
            { name: "Advanced Math", score: 45, classAvg: 72, attempted: true }
        ]
    },
};
// This function will be called once the page is loaded
document.addEventListener('DOMContentLoaded', function () {
    // --- Chart.js Global Configuration ---
    Chart.defaults.font.family = 'Inter';
    Chart.defaults.plugins.legend.position = 'bottom';
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;

    loadAndDisplayData();
    setupEventListeners();
});
/**
 * Sets up all the interactive elements like tabs and the mobile menu.
 */
function setupEventListeners() {
    const mainTabs = document.querySelectorAll('.main-tab-button');
    const mainTabContents = document.querySelectorAll('.main-tab-content');
    const hamburgerButton = document.getElementById('hamburgerButton');
    const mobileMenu = document.getElementById('mobileMenu');
    
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    hamburgerButton?.addEventListener('click', () => mobileMenu?.classList.toggle('hidden'));

    const switchTab = (tabElement) => {
        const targetTabName = tabElement.getAttribute('data-main-tab');
        
        mainTabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.mobile-nav-link').forEach(link => link.classList.remove('active'));
        mainTabContents.forEach(content => content.classList.add('hidden'));

        document.querySelector(`.main-tab-button[data-main-tab="${targetTabName}"]`)?.classList.add('active');
        document.querySelector(`.mobile-nav-link[data-main-tab="${targetTabName}"]`)?.classList.add('active');
        document.getElementById(targetTabName + '-content')?.classList.remove('hidden');

        if (targetTabName === 'overview') initializeOverviewCharts(currentStudentData);

        const firstSubTab = document.querySelector(`#${targetTabName}-content .sub-tab-button`);
        firstSubTab?.click();
        
        mobileMenu?.classList.add('hidden');
    };

    mainTabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab)));
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(link);
        });
    });

    document.querySelectorAll('.sub-tab-button').forEach(subTab => {
        subTab.addEventListener('click', () => {
            const parent = subTab.closest('.main-tab-content');
            parent.querySelectorAll('.sub-tab-button').forEach(st => st.classList.remove('active'));
            parent.querySelectorAll('.sub-tab-content-panel').forEach(panel => panel.classList.add('hidden'));
            
            subTab.classList.add('active');
            document.getElementById(subTab.getAttribute('data-sub-tab') + '-content')?.classList.remove('hidden');
        });
    });

    document.querySelector('.main-tab-button[data-main-tab="overview"]')?.click();
}
/**
 * Main function to load and display all dashboard data.
 */
function loadAndDisplayData() {
    document.getElementById('studentNameDisplay').textContent = `Welcome, ${currentStudentData.name}!`;
    
    populateOverview(currentStudentData);
    populatePracticeTestsTable(currentStudentData.cbPracticeTests);
    
    const allQuestions = [...(currentStudentData.cbPracticeTests.flatMap(t => t.questions || [])), ...(Object.values(currentStudentData.eocQuizzes).flat().flatMap(q => q.questions || []))];

    ['reading', 'writing', 'math'].forEach(subject => {
        populateSubjectSkills(subject, currentStudentData.skills[subject] || [], allQuestions);
        populateSkillsHub(subject, allQuestions);
        // Add EOC & Khan populating functions here if needed
    });
}
/**
 * Populates the entire overview tab, including KPIs and dynamic strengths/weaknesses.
 */
function populateOverview(data) {
    // Populate KPI cards
    const kpiContainer = document.getElementById('overview-kpis');
    kpiContainer.innerHTML = `
        <div class="score-card"><h3 class="text-md font-medium text-gray-600">Latest Total Score</h3><p class="text-3xl font-bold score-value">${data.latestScores.total} <span class="text-lg text-gray-500">/ 1600</span></p></div>
        <div class="score-card"><h3 class="text-md font-medium text-gray-600">Latest R&W Score</h3><p class="text-3xl font-bold score-value">${data.latestScores.rw} <span class="text-lg text-gray-500">/ 800</span></p></div>
        <div class="score-card"><h3 class="text-md font-medium text-gray-600">Latest Math Score</h3><p class="text-3xl font-bold score-value">${data.latestScores.math} <span class="text-lg text-gray-500">/ 800</span></p></div>
        <div class="score-card"><h3 class="text-md font-medium text-gray-600">Avg EOC Score</h3><p class="text-3xl font-bold score-value">${data.latestScores.avgEocKhan}%</p></div>
        <div class="score-card"><h3 class="text-md font-medium text-gray-600">Your Target Score</h3><p class="text-3xl font-bold" style="color: #8a3ffc;">${data.targetScore}</p></div>`;

    // Populate Strengths & Weaknesses
    const allSkills = Object.values(data.skills).flat().filter(s => s.attempted);
    const strengths = [...allSkills].sort((a, b) => b.score - a.score).slice(0, 3);
    const weaknesses = [...allSkills].sort((a, b) => a.score - b.score).slice(0, 3);

    const renderList = (items) => items.map(item => `<li>${item.name} (${item.score}%)</li>`).join('');
    document.getElementById('overviewStrengthsContainer').innerHTML = `<ul class="list-disc list-inside space-y-1 text-gray-600">${renderList(strengths)}</ul>`;
    document.getElementById('overviewImprovementsContainer').innerHTML = `<ul class="list-disc list-inside space-y-1 text-gray-600">${renderList(weaknesses)}</ul>`;

    // Populate Time Spent
    document.getElementById('timeSpentOverview').innerHTML = `<p class="text-gray-600">Your Avg: <span class="font-semibold">${data.timeSpent.studentAvg} ${data.timeSpent.studentUnit}</span></p><p class="text-gray-600">Class Avg: <span class="font-semibold">${data.timeSpent.classAvg} ${data.timeSpent.classUnit}</span></p>`;
}
/**
 * Renders the main overview charts.
 */
function initializeOverviewCharts(data) {
    ['scoreTrendChart', 'overallSkillChart'].forEach(id => {
        const instance = Chart.getChart(id);
        if (instance) instance.destroy();
    });

    new Chart('scoreTrendChart', { type: 'line', data: { labels: data.scoreTrend.labels, datasets: [{ label: 'Your Score', data: data.scoreTrend.studentScores, borderColor: '#2a5266', tension: 0.1 }, { label: 'Class Average', data: data.scoreTrend.classAvgScores, borderColor: '#757575', borderDash: [5, 5], tension: 0.1 }] } });
    new Chart('overallSkillChart', { type: 'bar', data: { labels: data.overallSkillPerformance.labels, datasets: [{ label: 'Your Accuracy', data: data.overallSkillPerformance.studentAccuracy, backgroundColor: 'rgba(42, 82, 102, 0.8)' }, { label: 'Class Average', data: data.overallSkillPerformance.classAvgAccuracy, backgroundColor: 'rgba(117, 117, 117, 0.7)' }] }, options: { scales: { y: { beginAtZero: true, max: 100 } } } });
}

// --- NEW: Subject-Specific Functions ---

/**
 * Populates the Skills tab, sorting by weakest first and making them clickable.
 * @param {string} subject - The subject ('reading', 'writing', 'math').
 * @param {Array} skills - The list of skills for that subject.
 * @param {Array} allQuestions - A flat list of all questions from all sources.
 */
function populateSubjectSkills(subject, skills, allQuestions) {
    const container = document.getElementById(`${subject}-cb-skills-data`);
    if (!container) return;
    
    skills.sort((a, b) => a.score - b.score); // Sort by weakest first
    
    container.innerHTML = skills.map(skill => {
        const performanceClass = skill.attempted ? (skill.score >= 85 ? 'performance-good' : skill.score >= 70 ? 'performance-average' : 'performance-poor') : 'performance-na';
        return `
        <div class="p-3 bg-gray-50 rounded-md border border-gray-200 mb-2 skill-item-container" onclick="openSkillModal('${skill.name}')">
            <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium text-gray-800">${skill.name}</span>
                <span class="text-xs font-semibold">${skill.attempted ? skill.score + '%' : 'N/A'}</span>
            </div>
            <div class="progress-bar-container"><div class="progress-bar ${performanceClass}" style="width: ${skill.attempted ? skill.score : 0}%"></div></div>
            <p class="text-xs text-gray-500 mt-1">Class Avg: ${skill.classAvg}%</p>
        </div>`;
    }).join('');
}

/**
 * Populates the new "Skills Hub" tab with incorrect questions for that subject.
 * @param {string} subject - The subject to filter by.
 * @param {Array} allQuestions - A flat list of all questions.
 */
function populateSkillsHub(subject, allQuestions) {
    const container = document.getElementById(`${subject}-skills-hub-body`);
    if (!container) return;
    
    const incorrectQuestions = allQuestions.filter(q => q.subject === subject && !q.isCorrect);
    
    if (incorrectQuestions.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center p-4">No incorrect questions found for this subject. Great work!</p>';
        return;
    }
    
    container.innerHTML = incorrectQuestions.map(q => renderQuestionAnalysisCard(q, false)).join('');
}
/**
 * Populates the main table of CB Practice Tests.
 */
function populatePracticeTestsTable(tests) {
    const tableBody = document.getElementById('cb-practice-tests-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = tests.map(test => {
        const isAttempted = test.date !== "Not Attempted";
        return `
        <tr class="${isAttempted ? 'clickable-row' : 'opacity-60'}" ${isAttempted ? `onclick="openTestModal('${test.name}')"` : ''}>
            <td>${test.name}</td>
            <td>${formatDate(test.date)}</td>
            <td>${test.rw}</td>
            <td>${test.math}</td>
            <td>${test.total}</td>
        </tr>`;
    }).join('');
}

// --- NEW: Modal Trigger Functions ---

const modal = document.getElementById('detailModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

/**
 * Opens the modal to show all questions for a specific skill.
 */
function openSkillModal(skillName) {
    modalTitle.textContent = `Reviewing Skill: ${skillName}`;
    const allQuestions = currentStudentData.cbPracticeTests.flatMap(t => t.questions || []);
    const incorrect = allQuestions.filter(q => q.skill === skillName && !q.isCorrect);
    
    // Sort by difficulty: Hard > Medium > Easy
    const difficultyOrder = { "Hard": 1, "Medium": 2, "Easy": 3 };
    incorrect.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    
    if (incorrect.length > 0) {
        modalBody.innerHTML = incorrect.map(q => renderQuestionAnalysisCard(q, true)).join('');
    } else {
        modalBody.innerHTML = `<p class="text-center p-5">No incorrect questions found for "${skillName}".</p>`;
    }
    modal.style.display = "block";
}
/**
 * Opens the modal to show all questions and pacing for a CB Test.
 */
function openTestModal(testName) {
    modalTitle.textContent = `Reviewing: ${testName}`;
    const test = currentStudentData.cbPracticeTests.find(t => t.name === testName);
    if (!test || !test.questions) return;
    
    let content = test.questions.map(q => renderQuestionAnalysisCard(q, true)).join('');
    
    // Append pacing analysis at the bottom if it exists
    if (test.questions.some(q => q.yourTime !== undefined)) {
        const pacingRows = test.questions.map(p => {
            const diff = p.yourTime - p.classAvgTime;
            const status = diff > 15 ? 'Slower' : diff < -15 ? 'Faster' : 'On Pace';
            const statusClass = `pacing-${status.toLowerCase().replace(' ', '-')}`;
            return `<tr><td>${test.questions.indexOf(p) + 1}</td><td>${p.yourTime}s</td><td>${p.classAvgTime}s</td><td><span class="pacing-badge ${statusClass}">${status}</span></td><td class="${p.isCorrect ? 'text-good' : 'text-poor'} font-semibold">${p.isCorrect ? 'Correct' : 'Incorrect'}</td></tr>`;
        }).join('');
        content += `<h3 class="text-lg font-semibold text-gray-800 border-t pt-4 mt-6">Pacing Analysis</h3><div class="overflow-x-auto"><table class="min-w-full table"><thead><tr><th>Q#</th><th>Your Time</th><th>Class Avg</th><th>Pacing</th><th>Result</th></tr></thead><tbody>${pacingRows}</tbody></table></div>`;
    }
    
    modalBody.innerHTML = content;
    modal.style.display = "block";
}
/**
 * Closes the modal and cleans up any chart instances.
 */
function closeModal() {
    modal.style.display = "none";
    modalBody.innerHTML = ''; // Clear content to prevent old data flashing
}
window.onclick = (event) => { if (event.target == modal) closeModal(); };

// --- NEW: Reusable HTML Renderer ---

/**
 * Renders a self-contained card for a single question's analysis.
 * @param {object} q - The question object.
 * @param {boolean} includeExplanation - Whether to show the full answer explanation.
 * @returns {string} - The HTML string for the card.
 */
function renderQuestionAnalysisCard(q, includeExplanation) {
    const resultText = q.isCorrect ? "Correct" : "Incorrect";
    const resultClass = q.isCorrect ? "text-good" : "text-poor";
    const sourceInfo = q.source ? `<p class="text-xs text-gray-500">Source: ${q.source}</p>` : '';
    
    return `
    <div class="question-analysis-card" id="q-${q.id}">
        <div class="question-analysis-header flex justify-between items-center">
            <p class="font-semibold text-gray-700">${q.skill}</p>
            <span class="difficulty-badge difficulty-${q.difficulty}">${q.difficulty}</span>
        </div>
        <div class="question-analysis-body">
            <div>
                <p class="mb-2 text-gray-800">${q.text}</p>
                <p>Your Answer: <span class="font-semibold ${resultClass}">${q.yourAnswer}</span> <span class="font-bold">(${resultText})</span></p>
                ${!q.isCorrect ? `<p>Correct Answer: <span class="font-semibold text-good">${q.correctAnswer}</span></p>` : ''}
                ${includeExplanation ? `<div class="mt-3 answer-explanation"><p class="font-semibold text-sm">Explanation</p><p class="text-sm">${q.explanation}</p></div>` : ''}
            </div>
            <div>
                <canvas id="chart-q-${q.id}" height="180"></canvas>
                ${q.yourTime ? `<p class="text-center text-sm mt-2">Pacing: <strong>${q.yourTime}s</strong> (Avg: ${q.classAvgTime}s)</p>` : ''}
            </div>
        </div>
        ${sourceInfo}
    </div>`;
}

// After rendering a question card, this function would be called to draw its chart.
// This is a simplified example; a real implementation would use MutationObserver or similar.
// For this prototype, we'll call it after setting innerHTML.
function renderDynamicCharts() {
    const canvases = modalBody.querySelectorAll('canvas');
    canvases.forEach(canvas => {
        const qId = canvas.id.split('-')[2];
        // Find the question data... this is complex. A better way is needed for a real app.
        // But for prototype:
        const qData = currentStudentData.cbPracticeTests.flatMap(t => t.questions || []).find(q => q.id == qId);
        if (qData) {
            new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: ['Class Correct', 'Class Incorrect'],
                    datasets: [{
                        data: [qData.classPerformance.correct, qData.classPerformance.incorrect],
                        backgroundColor: ['#28a745', '#dc3545'],
                        borderWidth: 1
                    }]
                },
                options: { plugins: { legend: { display: true, labels: { boxWidth: 12 } } } }
            });
        }
    });
}