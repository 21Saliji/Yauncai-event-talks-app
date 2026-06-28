// State management
let allNotes = [];
let filteredNotes = [];
let currentFilterType = 'all';
let currentSearchQuery = '';

// DOM Elements
const feedList = document.getElementById('feed-list');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const refreshBtn = document.getElementById('refresh-btn');
const refreshIcon = document.getElementById('refresh-icon');
const retryBtn = document.getElementById('retry-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const searchInput = document.getElementById('search-input');
const filterTags = document.querySelectorAll('.filter-tag');

// Stat elements
const statTotal = document.getElementById('stat-total');
const statFeatures = document.getElementById('stat-features');
const statFixes = document.getElementById('stat-fixes');
const statDeprecations = document.getElementById('stat-deprecations');

// Modal elements
const tweetModal = document.getElementById('tweet-modal');
const closeModalBtn = document.getElementById('close-modal');
const cancelTweetBtn = document.getElementById('cancel-tweet');
const publishTweetBtn = document.getElementById('publish-tweet');
const tweetTextarea = document.getElementById('tweet-textarea');
const charCounter = document.getElementById('char-counter');
const modalNoteType = document.getElementById('modal-note-type');
const modalNoteTitle = document.getElementById('modal-note-title');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    fetchNotes();

    // Event Listeners
    refreshBtn.addEventListener('click', fetchNotes);
    retryBtn.addEventListener('click', fetchNotes);
    themeToggleBtn.addEventListener('click', toggleTheme);
    document.getElementById('export-csv-btn').addEventListener('click', exportToCSV);
    
    searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.toLowerCase();
        applyFilters();
    });

    filterTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            currentFilterType = tag.getAttribute('data-type');
            applyFilters();
        });
    });

    // Modal listeners
    closeModalBtn.addEventListener('click', closeTweetModal);
    cancelTweetBtn.addEventListener('click', closeTweetModal);
    tweetTextarea.addEventListener('input', updateCharCount);
    publishTweetBtn.addEventListener('click', submitTweet);

    // Close modal on click outside
    window.addEventListener('click', (e) => {
        if (e.target === tweetModal) {
            closeTweetModal();
        }
    });
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        document.body.classList.remove('light-theme');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

function toggleTheme() {
    if (document.body.classList.contains('light-theme')) {
        document.body.classList.remove('light-theme');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.add('light-theme');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        localStorage.setItem('theme', 'light');
    }
}

// Fetch notes API
async function fetchNotes() {
    showLoading(true);
    showError(false);

    try {
        const response = await fetch('/api/notes');
        const data = await response.json();

        if (data.success) {
            allNotes = data.notes;
            updateStats();
            applyFilters();
        } else {
            throw new Error(data.error || 'Failed to fetch release notes.');
        }
    } catch (err) {
        console.error(err);
        errorMessage.textContent = err.message || 'Check your connection and try again.';
        showError(true);
    } finally {
        showLoading(false);
    }
}

// Filter and Search logic
function applyFilters() {
    filteredNotes = allNotes.filter(note => {
        const matchesType = currentFilterType === 'all' || note.type === currentFilterType;
        
        // Clean text content for searching
        const textContent = note.content.replace(/<[^>]*>/g, '').toLowerCase();
        const matchesSearch = note.title.toLowerCase().includes(currentSearchQuery) || 
                              textContent.includes(currentSearchQuery);
        
        return matchesType && matchesSearch;
    });

    renderFeed();
}

// Render components
function renderFeed() {
    feedList.innerHTML = '';

    if (filteredNotes.length === 0) {
        feedList.innerHTML = `
            <div class="error-state" style="padding: 2rem;">
                <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; color: var(--text-muted);"></i>
                <p style="color: var(--text-secondary);">No release notes match your filter criteria.</p>
            </div>
        `;
        return;
    }

    filteredNotes.forEach(note => {
        const card = document.createElement('div');
        card.className = `feed-card type-${getBadgeClass(note.type)}`;
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-meta">
                    <span class="badge badge-${getBadgeClass(note.type)}">${note.type}</span>
                    <span class="card-date"><i class="fa-regular fa-calendar"></i> ${note.published}</span>
                </div>
                <div class="card-actions">
                    <button class="btn btn-icon btn-copy-card" title="Copy text to clipboard">
                        <i class="fa-regular fa-copy"></i>
                    </button>
                    <button class="btn btn-icon btn-tweet-card" title="Tweet about this update">
                        <i class="fa-brands fa-x-twitter"></i>
                    </button>
                    ${note.link ? `
                        <a href="${note.link}" target="_blank" class="btn btn-icon" title="View official release documentation">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                    ` : ''}
                </div>
            </div>
            <h3 class="card-title">${note.title}</h3>
            <div class="card-content">${note.content}</div>
        `;

        // Wire tweet action
        const tweetBtn = card.querySelector('.btn-tweet-card');
        tweetBtn.addEventListener('click', () => openTweetModal(note));

        // Wire copy action
        const copyBtn = card.querySelector('.btn-copy-card');
        copyBtn.addEventListener('click', () => copyToClipboard(note, copyBtn));

        feedList.appendChild(card);
    });
}

function updateStats() {
    statTotal.textContent = allNotes.length;
    statFeatures.textContent = allNotes.filter(n => n.type === 'Feature').length;
    statFixes.textContent = allNotes.filter(n => n.type === 'Bug Fix').length;
    statDeprecations.textContent = allNotes.filter(n => n.type === 'Deprecation').length;
}

function getBadgeClass(type) {
    switch (type) {
        case 'Feature': return 'feature';
        case 'Bug Fix': return 'fix';
        case 'Deprecation': return 'deprecation';
        case 'Pricing/Billing': return 'billing';
        default: return 'update';
    }
}

// Loading and Error element control
function showLoading(isLoading) {
    if (isLoading) {
        loadingState.classList.remove('hidden');
        refreshIcon.classList.add('spinning');
        refreshBtn.disabled = true;
    } else {
        loadingState.classList.add('hidden');
        refreshIcon.classList.remove('spinning');
        refreshBtn.disabled = false;
    }
}

function showError(isError) {
    if (isError) {
        errorState.classList.remove('hidden');
        feedList.classList.add('hidden');
    } else {
        errorState.classList.add('hidden');
        feedList.classList.remove('hidden');
    }
}

// Tweet Modal logic
function openTweetModal(note) {
    modalNoteType.className = `badge badge-${getBadgeClass(note.type)}`;
    modalNoteType.textContent = note.type;
    modalNoteTitle.textContent = note.title;

    // Create a recommended tweet format
    const cleanedTitle = note.title.trim().replace(/^BigQuery\s+/i, '');
    const docLink = note.link || 'https://cloud.google.com/bigquery';
    
    // Auto craft message
    let tweetTemplate = `🚀 New BigQuery Update: ${cleanedTitle}\n\nRead more details here: ${docLink} #BigQuery #GoogleCloud`;
    
    // If it's a bug fix or deprecation, adjust prefix slightly
    if (note.type === 'Bug Fix') {
        tweetTemplate = `🔧 BigQuery Bug Fix: ${cleanedTitle}\n\nDetails: ${docLink} #BigQuery #GoogleCloud`;
    } else if (note.type === 'Deprecation') {
        tweetTemplate = `⚠️ BigQuery Deprecation Alert: ${cleanedTitle}\n\nDetails: ${docLink} #BigQuery #GoogleCloud`;
    }

    tweetTextarea.value = tweetTemplate;
    tweetModal.classList.remove('hidden');
    updateCharCount();
    tweetTextarea.focus();
}

function closeTweetModal() {
    tweetModal.classList.add('hidden');
}

function updateCharCount() {
    const count = tweetTextarea.value.length;
    charCounter.textContent = `${count} / 280`;
    
    if (count > 280) {
        charCounter.style.color = '#ef4444';
        publishTweetBtn.disabled = true;
    } else {
        charCounter.style.color = 'var(--text-muted)';
        publishTweetBtn.disabled = false;
    }
}

function submitTweet() {
    const text = tweetTextarea.value;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(tweetUrl, '_blank', 'width=550,height=420');
    closeTweetModal();
}

// Copy to Clipboard Utility
async function copyToClipboard(note, buttonElement) {
    // Extract plain text from summary HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.content;
    const plainTextContent = tempDiv.textContent || tempDiv.innerText || '';

    const formattedCopyText = `BigQuery Release Note [${note.published}] - ${note.type.toUpperCase()}\n\nTitle: ${note.title}\n\nDetails:\n${plainTextContent.trim()}\n\nLink: ${note.link || 'N/A'}`;
    
    try {
        await navigator.clipboard.writeText(formattedCopyText);
        
        // Show visual feedback
        const icon = buttonElement.querySelector('i');
        icon.className = 'fa-solid fa-check';
        icon.style.color = '#10b981';
        
        setTimeout(() => {
            icon.className = 'fa-regular fa-copy';
            icon.style.color = '';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        alert('Could not copy to clipboard. Please select and copy manually.');
    }
}

// Export list to CSV
function exportToCSV() {
    if (filteredNotes.length === 0) {
        alert('No notes available to export.');
        return;
    }

    const headers = ['Date', 'Type', 'Title', 'Content', 'Link'];
    
    const rows = filteredNotes.map(note => {
        // Strip HTML, escape quotes for CSV compatibility
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = note.content;
        const plainTextContent = (tempDiv.textContent || tempDiv.innerText || '').replace(/"/g, '""');
        const escapedTitle = note.title.replace(/"/g, '""');
        
        return [
            `"${note.published}"`,
            `"${note.type}"`,
            `"${escapedTitle}"`,
            `"${plainTextContent.trim()}"`,
            `"${note.link || ''}"`
        ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bigquery_release_notes_${dateStr}.csv`);
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
}

