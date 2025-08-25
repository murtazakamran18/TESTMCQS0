// Global variables
let currentRole = '';
let currentQuestionIndex = 0;
let questions = [];
let userAnswers = [];
let studentName = '';
let editingQuestionId = null;

// API Configuration
const API_BASE_URL = window.location.origin;

// Password verification
let TEACHER_PASSWORD = 'teacher123'; // This will be moved to backend
let STUDENT_PASSWORD = 'student123'; // This will be moved to backend

// Utility Functions
function showElement(elementId) {
    document.getElementById(elementId)?.classList.remove('hidden');
}

function hideElement(elementId) {
    document.getElementById(elementId)?.classList.add('hidden');
}

function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(messageDiv, container.firstChild);
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Landing Page Functions
function showPasswordForm(role) {
    currentRole = role;
    const form = document.getElementById('password-form');
    const title = document.getElementById('password-title');
    const input = document.getElementById('password-input');
    
    title.textContent = `Enter ${role.charAt(0).toUpperCase() + role.slice(1)} Password`;
    input.placeholder = `Enter ${role} password`;
    input.value = '';
    
    hideElement('password-error');
    showElement('password-form');
    input.focus();
    
    // Add enter key listener
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyPassword();
        }
    });
}

function hidePasswordForm() {
    hideElement('password-form');
    hideElement('password-error');
    document.getElementById('password-input').value = '';
}

function verifyPassword() {
    const password = document.getElementById('password-input').value;
    const errorDiv = document.getElementById('password-error');
    
    let isValid = false;
    
    if (currentRole === 'teacher' && password === TEACHER_PASSWORD) {
        isValid = true;
        // Store teacher session
        localStorage.setItem('teacherAuth', 'true');
        localStorage.setItem('teacherPassword', password);
        window.location.href = 'teacher.html';
    } else if (currentRole === 'student' && password === STUDENT_PASSWORD) {
        isValid = true;
        // Store student session
        localStorage.setItem('studentAuth', 'true');
        localStorage.setItem('studentPassword', password);
        window.location.href = 'student.html';
    }
    
    if (!isValid) {
        showElement('password-error');
        document.getElementById('password-input').value = '';
    }
}

// Authentication Check
function checkAuth() {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('teacher.html')) {
        if (!localStorage.getItem('teacherAuth')) {
            window.location.href = 'index.html';
            return false;
        }
        loadQuestions();
        return true;
    } else if (currentPage.includes('student.html')) {
        if (!localStorage.getItem('studentAuth')) {
            window.location.href = 'index.html';
            return false;
        }
        loadStudentQuestions();
        return true;
    }
    return true;
}

function logout() {
    localStorage.removeItem('teacherAuth');
    localStorage.removeItem('studentAuth');
    localStorage.removeItem('teacherPassword');
    localStorage.removeItem('studentPassword');
    window.location.href = 'index.html';
}

// API Functions
async function apiCall(endpoint, method = 'GET', data = null, authType = 'student') {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        // Add authentication headers
        if (authType === 'teacher') {
            headers['x-teacher-pass'] = localStorage.getItem('teacherPassword') || TEACHER_PASSWORD;
        } else {
            headers['x-class-pass'] = localStorage.getItem('studentPassword') || STUDENT_PASSWORD;
        }
        
        const config = {
            method,
            headers,
        };
        
        if (data) {
            config.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, config);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        // Fallback to localStorage for development
        return handleAPIFallback(endpoint, method, data);
    }
}

// Fallback to localStorage when API is not available
function handleAPIFallback(endpoint, method, data) {
    const localStorage_key = 'quiz_questions';
    const results_key = 'quiz_results';
    
    switch (endpoint) {
        case 'get-questions-full':
            const stored = localStorage.getItem(localStorage_key);
            return { questions: stored ? JSON.parse(stored) : getSampleQuestions() };
            
        case 'add-question':
            if (method === 'POST' && data) {
                const existing = JSON.parse(localStorage.getItem(localStorage_key) || '[]');
                const newQuestion = {
                    _id: Date.now().toString(),
                    ...data,
                    createdAt: new Date().toISOString()
                };
                existing.push(newQuestion);
                localStorage.setItem(localStorage_key, JSON.stringify(existing));
                return { success: true, question: newQuestion };
            }
            break;
            
        case 'edit-question':
            if (method === 'POST' && data) {
                const existing = JSON.parse(localStorage.getItem(localStorage_key) || '[]');
                const index = existing.findIndex(q => q._id === data.id);
                if (index !== -1) {
                    existing[index] = { ...existing[index], ...data };
                    localStorage.setItem(localStorage_key, JSON.stringify(existing));
                    return { success: true };
                }
            }
            break;
            
        case 'delete-question':
            if (method === 'POST' && data) {
                const existing = JSON.parse(localStorage.getItem(localStorage_key) || '[]');
                const filtered = existing.filter(q => q._id !== data.id);
                localStorage.setItem(localStorage_key, JSON.stringify(filtered));
                return { success: true };
            }
            break;
            
        case 'save-result':
            if (method === 'POST' && data) {
                const existing = JSON.parse(localStorage.getItem(results_key) || '[]');
                const newResult = {
                    _id: Date.now().toString(),
                    ...data,
                    createdAt: new Date().toISOString()
                };
                existing.push(newResult);
                localStorage.setItem(results_key, JSON.stringify(existing));
                return { success: true };
            }
            break;
    }
    
    return { error: 'Endpoint not found' };
}

// Sample questions for development
function getSampleQuestions() {
    return [
        {
            _id: '1',
            question: 'What is the capital of France?',
            options: ['London', 'Berlin', 'Paris', 'Madrid'],
            answer: 2,
            createdAt: new Date().toISOString()
        },
        {
            _id: '2',
            question: 'Which planet is known as the Red Planet?',
            options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
            answer: 1,
            createdAt: new Date().toISOString()
        },
        {
            _id: '3',
            question: 'What is 15 + 27?',
            options: ['40', '41', '42', '43'],
            answer: 2,
            createdAt: new Date().toISOString()
        }
    ];
}

// Teacher Functions
async function addQuestion(event) {
    event.preventDefault();
    
    const questionData = {
        question: document.getElementById('question').value.trim(),
        options: [
            document.getElementById('option1').value.trim(),
            document.getElementById('option2').value.trim(),
            document.getElementById('option3').value.trim(),
            document.getElementById('option4').value.trim()
        ],
        answer: parseInt(document.getElementById('correct-answer').value)
    };
    
    // Validation
    if (!questionData.question) {
        showMessage('Please enter a question', 'error');
        return;
    }
    
    if (questionData.options.some(opt => !opt)) {
        showMessage('Please fill all options', 'error');
        return;
    }
    
    if (isNaN(questionData.answer)) {
        showMessage('Please select the correct answer', 'error');
        return;
    }
    
    try {
        const result = await apiCall('add-question', 'POST', questionData, 'teacher');
        
        if (result.success || result.question) {
            showMessage('Question added successfully!');
            document.getElementById('add-question-form').reset();
            loadQuestions();
        } else {
            throw new Error('Failed to add question');
        }
    } catch (error) {
        showMessage('Error adding question: ' + error.message, 'error');
    }
}

async function loadQuestions() {
    try {
        const result = await apiCall('get-questions-full', 'GET', null, 'teacher');
        questions = result.questions || [];
        
        displayQuestions();
        updateQuestionsCount();
    } catch (error) {
        showMessage('Error loading questions: ' + error.message, 'error');
        questions = [];
        displayQuestions();
    }
}

function displayQuestions() {
    const container = document.getElementById('questions-list');
    
    if (!questions.length) {
        container.innerHTML = '<p class="loading">No questions found. Add your first question above!</p>';
        return;
    }
    
    container.innerHTML = questions.map(question => `
        <div class="question-item">
            <div class="question-header">
                <div class="question-text">${question.question}</div>
                <div class="question-actions">
                    <button class="btn btn-secondary" onclick="openEditModal('${question._id}')" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Edit</button>
                    <button class="btn btn-danger" onclick="deleteQuestion('${question._id}')">Delete</button>
                </div>
            </div>
            <div class="question-options">
                ${question.options.map((option, index) => `
                    <div class="option ${index === question.answer ? 'correct' : ''}">
                        ${String.fromCharCode(65 + index)}. ${option}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function updateQuestionsCount() {
    const countElement = document.getElementById('questions-count');
    if (countElement) {
        countElement.textContent = questions.length;
    }
}

function openEditModal(questionId) {
    const question = questions.find(q => q._id === questionId);
    if (!question) return;
    
    editingQuestionId = questionId;
    
    document.getElementById('edit-question-id').value = questionId;
    document.getElementById('edit-question').value = question.question;
    document.getElementById('edit-option1').value = question.options[0];
    document.getElementById('edit-option2').value = question.options[1];
    document.getElementById('edit-option3').value = question.options[2];
    document.getElementById('edit-option4').value = question.options[3];
    document.getElementById('edit-correct-answer').value = question.answer;
    
    showElement('edit-modal');
}

function closeEditModal() {
    hideElement('edit-modal');
    editingQuestionId = null;
    document.getElementById('edit-question-form').reset();
}

async function updateQuestion(event) {
    event.preventDefault();
    
    if (!editingQuestionId) return;
    
    const questionData = {
        id: editingQuestionId,
        question: document.getElementById('edit-question').value.trim(),
        options: [
            document.getElementById('edit-option1').value.trim(),
            document.getElementById('edit-option2').value.trim(),
            document.getElementById('edit-option3').value.trim(),
            document.getElementById('edit-option4').value.trim()
        ],
        answer: parseInt(document.getElementById('edit-correct-answer').value)
    };
    
    // Validation
    if (!questionData.question) {
        showMessage('Please enter a question', 'error');
        return;
    }
    
    if (questionData.options.some(opt => !opt)) {
        showMessage('Please fill all options', 'error');
        return;
    }
    
    if (isNaN(questionData.answer)) {
        showMessage('Please select the correct answer', 'error');
        return;
    }
    
    try {
        const result = await apiCall('edit-question', 'POST', questionData, 'teacher');
        
        if (result.success) {
            showMessage('Question updated successfully!');
            closeEditModal();
            loadQuestions();
        } else {
            throw new Error('Failed to update question');
        }
    } catch (error) {
        showMessage('Error updating question: ' + error.message, 'error');
    }
}

async function deleteQuestion(questionId) {
    if (!confirm('Are you sure you want to delete this question?')) {
        return;
    }
    
    try {
        const result = await apiCall('delete-question', 'POST', { id: questionId }, 'teacher');
        
        if (result.success) {
            showMessage('Question deleted successfully!');
            loadQuestions();
        } else {
            throw new Error('Failed to delete question');
        }
    } catch (error) {
        showMessage('Error deleting question: ' + error.message, 'error');
    }
}

// Student Functions
async function loadStudentQuestions() {
    try {
        const result = await apiCall('get-questions-full', 'GET', null, 'student');
        questions = shuffleArray(result.questions || []);
        
        if (!questions.length) {
            showMessage('No questions available. Please contact your teacher.', 'error');
            return;
        }
        
        // Initialize user answers array
        userAnswers = new Array(questions.length).fill(-1);
        
        document.getElementById('total-questions').textContent = questions.length;
    } catch (error) {
        showMessage('Error loading questions: ' + error.message, 'error');
        // Use sample questions for development
        questions = shuffleArray(getSampleQuestions());
        userAnswers = new Array(questions.length).fill(-1);
        document.getElementById('total-questions').textContent = questions.length;
    }
}

function startQuiz() {
    const nameInput = document.getElementById('student-name');
    studentName = nameInput.value.trim();
    
    if (!studentName) {
        nameInput.focus();
        showMessage('Please enter your name to start the quiz', 'error');
        return;
    }
    
    if (!questions.length) {
        showMessage('No questions available', 'error');
        return;
    }
    
    currentQuestionIndex = 0;
    hideElement('welcome-section');
    showElement('quiz-section');
    displayQuestion();
}

function displayQuestion() {
    if (currentQuestionIndex >= questions.length) return;
    
    const question = questions[currentQuestionIndex];
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const currentQuestionSpan = document.getElementById('current-question');
    const progressFill = document.getElementById('progress-fill');
    
    // Update question number and progress
    currentQuestionSpan.textContent = currentQuestionIndex + 1;
    const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressFill.style.width = progressPercentage + '%';
    
    // Display question
    questionText.textContent = question.question;
    
    // Display options
    optionsContainer.innerHTML = question.options.map((option, index) => `
        <button class="option-btn ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}" 
                onclick="selectOption(${index})">
            ${String.fromCharCode(65 + index)}. ${option}
        </button>
    `).join('');
    
    // Update navigation buttons
    updateNavigationButtons();
}

function selectOption(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    
    // Update UI
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach((btn, index) => {
        btn.classList.toggle('selected', index === optionIndex);
    });
    
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    // Previous button
    prevBtn.disabled = currentQuestionIndex === 0;
    
    // Next/Submit button
    if (currentQuestionIndex === questions.length - 1) {
        hideElement('next-btn');
        showElement('submit-btn');
    } else {
        showElement('next-btn');
        hideElement('submit-btn');
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

async function submitQuiz() {
    if (userAnswers.includes(-1)) {
        if (!confirm('You have unanswered questions. Are you sure you want to submit?')) {
            return;
        }
    }
    
    // Calculate score
    let correctCount = 0;
    userAnswers.forEach((answer, index) => {
        if (answer === questions[index].answer) {
            correctCount++;
        }
    });
    
    const totalQuestions = questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    
    const resultData = {
        name: studentName,
        score: correctCount,
        total: totalQuestions,
        percentage: percentage
    };
    
    // Save result
    try {
        await apiCall('save-result', 'POST', resultData, 'student');
    } catch (error) {
        console.error('Error saving result:', error);
        // Continue to show results even if saving fails
    }
    
    // Display results
    displayResults(resultData);
}

function displayResults(resultData) {
    hideElement('quiz-section');
    showElement('results-section');
    
    document.getElementById('result-name').textContent = resultData.name;
    document.getElementById('score-percentage').textContent = resultData.percentage + '%';
    document.getElementById('score-fraction').textContent = `${resultData.score}/${resultData.total}`;
    document.getElementById('correct-count').textContent = resultData.score;
    document.getElementById('wrong-count').textContent = resultData.total - resultData.score;
}

function retakeQuiz() {
    // Reset quiz state
    currentQuestionIndex = 0;
    userAnswers = new Array(questions.length).fill(-1);
    
    // Shuffle questions again
    questions = shuffleArray(questions);
    
    hideElement('results-section');
    hideElement('review-section');
    showElement('welcome-section');
    
    // Clear student name to allow change
    document.getElementById('student-name').value = studentName;
}

function viewAnswers() {
    hideElement('results-section');
    showElement('review-section');
    
    const reviewContent = document.getElementById('review-content');
    reviewContent.innerHTML = questions.map((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.answer;
        
        return `
            <div class="review-item">
                <div class="review-question">
                    ${index + 1}. ${question.question}
                </div>
                <div class="review-options">
                    ${question.options.map((option, optIndex) => {
                        let className = 'review-option';
                        if (optIndex === question.answer) {
                            className += ' correct';
                        }
                        if (optIndex === userAnswer && userAnswer !== question.answer) {
                            className += ' selected';
                        }
                        return `<div class="${className}">${String.fromCharCode(65 + optIndex)}. ${option}</div>`;
                    }).join('')}
                </div>
                <div class="review-result ${isCorrect ? 'correct' : 'wrong'}">
                    ${isCorrect ? '✓ Correct' : '✗ Wrong'} 
                    ${userAnswer === -1 ? '(Not answered)' : ''}
                </div>
            </div>
        `;
    }).join('');
}

function backToResults() {
    hideElement('review-section');
    showElement('results-section');
}

// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication on page load
    checkAuth();
    
    // Add modal click handlers
    const modal = document.getElementById('edit-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeEditModal();
            }
        });
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Close modal with Escape key
        if (e.key === 'Escape') {
            closeEditModal();
        }
        
        // Quiz navigation with arrow keys
        if (document.getElementById('quiz-section') && !document.getElementById('quiz-section').classList.contains('hidden')) {
            if (e.key === 'ArrowLeft') {
                previousQuestion();
            } else if (e.key === 'ArrowRight') {
                nextQuestion();
            }
        }
    });
});