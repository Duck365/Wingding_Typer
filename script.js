// ===== GLITCH EFFECT =====
let glitchIntensity = 'continuous';
let lastGlitchChange = 0;

// 1. Break the title into individual letters so we can target them
const titleElement = document.getElementById('glitch-title');
if (titleElement && !titleElement.hasAttribute('data-split')) {
    const text = titleElement.innerText;
    titleElement.innerHTML = ''; // Clear the original text
    
    for (let char of text) {
        const span = document.createElement('span');
        span.innerText = char;
        titleElement.appendChild(span);
    }
    titleElement.setAttribute('data-split', 'true'); // Prevents running this loop twice
}

function updateGlitchEffect() {
    const glitchTitle = document.getElementById('glitch-title');
    if (!glitchTitle) return;

    const now = Date.now();
    const letters = glitchTitle.querySelectorAll('span');
    
    // 2. Randomly pick ONE letter to glitch into Wingdings (about 15% chance every 100ms)
    if (letters.length > 0 && Math.random() < 0.15) { 
        const randomIdx = Math.floor(Math.random() * letters.length);
        const targetLetter = letters[randomIdx];
        
        // Make sure it doesn't try to change the font of a blank space
        if (targetLetter.innerText !== ' ') {
            targetLetter.style.fontFamily = 'Wingdings';
            
            // Snap it back to the normal Courier font after a split second
            setTimeout(() => {
                targetLetter.style.fontFamily = "inherit";
            }, 150);
        }
    }

    // 3. Keep the main shaking animation running on the whole title
    if (glitchIntensity === 'continuous' && Math.random() < 0.1) {
        glitchIntensity = 'subtle';
        lastGlitchChange = now;
    }
    if (glitchIntensity === 'subtle' && (now - lastGlitchChange) > (500 + Math.random() * 500)) {
        glitchIntensity = 'continuous';
    }
    
    if (glitchIntensity === 'subtle') {
        glitchTitle.style.animation = 'glitch-subtle 0.15s infinite';
    } else {
        glitchTitle.style.animation = 'glitch-continuous 0.1s infinite';
    }
}
setInterval(updateGlitchEffect, 100);

// Just in case you didn't keep the style block from last time, here it is:
const style = document.createElement('style');
style.textContent = `
    /* The reality-breaking, aggressive glitch */
    @keyframes glitch-continuous {
        0% { text-shadow: 3px 0 #ff0000, -3px 0 #00ffff; transform: translate(0) skew(0deg); clip-path: inset(10% 0 80% 0); }
        10% { text-shadow: -5px 0 #ff0000, 4px 0 #00ffff; transform: translate(-5px, 2px) skew(-15deg); clip-path: inset(40% 0 43% 0); }
        20% { text-shadow: 5px 0 #39ff14, -5px 0 #ff00ff; transform: translate(5px, -3px) skew(20deg); clip-path: inset(80% 0 5% 0); }
        30% { text-shadow: -4px 0 #ff0000, 3px 0 #00ffff; transform: translate(0) skew(0deg); clip-path: inset(20% 0 50% 0); }
        40% { text-shadow: 4px 3px #39ff14, -4px -3px #ff00ff; transform: translate(3px, 3px) skew(10deg); clip-path: inset(60% 0 10% 0); }
        50% { text-shadow: -5px -3px #ff0000, 5px 3px #00ffff; transform: translate(-3px, -3px) skew(-10deg); clip-path: inset(15% 0 70% 0); }
        60% { text-shadow: 3px 0 #39ff14, -3px 0 #ff00ff; transform: translate(5px, 0) skew(25deg); clip-path: inset(90% 0 0% 0); }
        70% { text-shadow: -4px 0 #ff0000, 4px 0 #00ffff; transform: translate(-4px, 4px) skew(-20deg); clip-path: inset(30% 0 40% 0); }
        80% { text-shadow: 5px -3px #39ff14, -5px 3px #ff00ff; transform: translate(3px, -5px) skew(15deg); clip-path: inset(5% 0 80% 0); }
        90% { text-shadow: -3px 3px #ff0000, 3px -3px #00ffff; transform: translate(-5px, 0) skew(-25deg); clip-path: inset(50% 0 30% 0); }
        100% { text-shadow: 3px 0 #39ff14, -3px 0 #ff00ff; transform: translate(0) skew(0deg); clip-path: inset(10% 0 80% 0); }
    }

    /* The "calm before the storm" subtle glitch */
    @keyframes glitch-subtle {
        0%, 100% { text-shadow: 2px 0 #ff3333, -2px 0 #00ff00; transform: translate(0) skew(0deg); clip-path: inset(0 0 0 0); }
        25% { transform: translate(1px, -1px) skew(2deg); }
        50% { text-shadow: -2px 0 #ff3333, 2px 0 #00ff00; transform: translate(-1px, 1px) skew(-2deg); }
        75% { transform: translate(-1px, -1px) skew(1deg); }
    }
`;
if (!document.querySelector('style[data-glitch]')) {
    style.setAttribute('data-glitch', 'true');
    document.head.appendChild(style);
}

// ===== SCREEN NAVIGATION =====
function showScreen(screenNum) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${screenNum}`).classList.add('active');
}
function goToScreen1() { showScreen(1); }
function goToScreen2() { showScreen(2); }

// Updated to know WHICH language you picked from the menu
function goToEditor(mode) {
    showScreen(3);
    document.getElementById('font-selector').value = mode;
    initializeEditor();
    applyFont(); 
}

// ===== DOCUMENT & TAB MANAGEMENT =====
let documents = [
    { id: 1, name: 'Tab 1', emoji: '📄', content: '' }
];
let currentTabId = 1;

function initializeEditor() {
    renderTabs();
    loadTabContent(currentTabId);
}

function renderTabs() {
    const tabsList = document.getElementById('tabs-list');
    tabsList.innerHTML = '';
    
    documents.forEach(doc => {
        const tabItem = document.createElement('div');
        tabItem.className = `tab-item ${doc.id === currentTabId ? 'active' : ''}`;
        tabItem.onclick = () => switchTab(doc.id);
        
        tabItem.innerHTML = `
            <span>${doc.emoji || '📄'} ${doc.name}</span>
            <button class="tab-menu-btn" onclick="toggleTabMenu(${doc.id}, event)">⋮</button>
            <div class="tab-dropdown" id="tab-menu-${doc.id}">
                <button class="tab-dropdown-item" onclick="renameTab(${doc.id}, event)">✏️ Rename</button>
                <button class="tab-dropdown-item" onclick="changeTabEmoji(${doc.id}, event)">😀 Choose Emoji</button>
                <button class="tab-dropdown-item delete-item" onclick="deleteTab(${doc.id}, event)">🗑️ Delete</button>
            </div>
        `;
        tabsList.appendChild(tabItem);
    });
}

function toggleTabMenu(tabId, event) {
    event.stopPropagation();
    
    // Close all other menus first
    document.querySelectorAll('.tab-dropdown').forEach(menu => {
        if (menu.id !== `tab-menu-${tabId}`) menu.classList.remove('show');
    });
    
    const menu = document.getElementById(`tab-menu-${tabId}`);
    const btn = event.target;
    
    // THE FIX: Calculate exactly where the 3-dots button is on the screen
    const rect = btn.getBoundingClientRect();
    
    // Force the menu to stick to the screen relative to the button, bypassing the overflow trap
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + 5}px`; // Drops it 5px below the button
    menu.style.left = `${rect.left}px`;
    
    menu.classList.toggle('show');
}

document.addEventListener('click', () => {
    document.querySelectorAll('.tab-dropdown').forEach(menu => menu.classList.remove('show'));
});

function renameTab(tabId, event) {
    event.stopPropagation();
    const doc = documents.find(d => d.id === tabId);
    const newName = prompt("Enter new name for the tab:", doc.name);
    if (newName !== null && newName.trim() !== '') {
        doc.name = newName.trim();
        renderTabs();
    }
}

function changeTabEmoji(tabId, event) {
    event.stopPropagation();
    const doc = documents.find(d => d.id === tabId);
    const newEmoji = prompt("Paste an emoji for this tab:", doc.emoji || "📄");
    if (newEmoji !== null && newEmoji.trim() !== '') {
        doc.emoji = newEmoji.trim();
        renderTabs();
    }
}

function switchTab(tabId) {
    if (currentTabId === tabId) return;
    saveCurrentTab();
    currentTabId = tabId;
    loadTabContent(tabId);
    renderTabs();
}

function loadTabContent(tabId) {
    const doc = documents.find(d => d.id === tabId);
    const editor = document.getElementById('editor-content');
    if (doc) {
        editor.innerHTML = doc.content; 
    }
}

function addTab() {
    if (documents.length >= 15) {
        alert('Maximum 15 tabs allowed!');
        return;
    }
    const newId = Math.max(...documents.map(d => d.id), 0) + 1;
    documents.push({ id: newId, name: `Tab ${documents.length + 1}`, emoji: '📄', content: '' });
    switchTab(newId);
}

function deleteTab(tabId, event) {
    event.stopPropagation();
    if (documents.length <= 1) {
        alert('You must keep at least one tab!');
        return;
    }
    if (!confirm("Are you sure you want to delete this tab?")) return;
    
    documents = documents.filter(d => d.id !== tabId);
    if (currentTabId === tabId) {
        currentTabId = documents[0].id;
        loadTabContent(currentTabId);
    }
    renderTabs();
}

function saveCurrentTab() {
    const editor = document.getElementById('editor-content');
    const currentDoc = documents.find(d => d.id === currentTabId);
    if (currentDoc) currentDoc.content = editor.innerHTML; 
}

// ===== FONT HIGHLIGHTING / RICH TEXT =====
let savedRange = null;

document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    const editor = document.getElementById('editor-content');
    
    if (selection.rangeCount > 0 && document.activeElement === editor) {
        savedRange = selection.getRangeAt(0);
    }
});

function applyFont() {
    const fontSelector = document.getElementById('font-selector');
    const editor = document.getElementById('editor-content');
    
    editor.focus();
    
    if (savedRange) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange);
    }
    
    // If it is our custom language, switch to Arial so the shapes render perfectly
    if (fontSelector.value === 'Simple Uni-Shapes') {
        document.execCommand('fontName', false, 'Arial');
    } else {
        document.execCommand('fontName', false, fontSelector.value);
    }
}

// ===== IMPORT/EXPORT MODAL =====
function openImportExportModal() {
    document.getElementById('import-export-modal').classList.remove('hidden');
}
function closeImportExportModal() {
    document.getElementById('import-export-modal').classList.add('hidden');
}

// ===== DOWNLOAD EXPORTS =====
function downloadAs(format) {
    saveCurrentTab();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `wingding_typer_${timestamp}`;
    
    if (format === 'json') downloadJSON(filename);
    else if (format === 'txt') downloadTXT(filename);
    else if (format === 'pdf') downloadPDF(filename);
    else if (format === 'docx') alert("DOCX export requires complex rich-text parsing. JSON/PDF recommended for now!");
    
    closeImportExportModal();
}

function downloadJSON(filename) {
    const data = { version: '2.0', tabs: documents };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `${filename}.json`);
}

function downloadTXT(filename) {
    let textContent = '';
    documents.forEach((doc, index) => {
        textContent += `\n===== ${doc.name} =====\n`;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = doc.content;
        textContent += tempDiv.innerText || tempDiv.textContent;
        if (index < documents.length - 1) textContent += '\n\n';
    });
    const blob = new Blob([textContent], { type: 'text/plain' });
    downloadBlob(blob, `${filename}.txt`);
}

function downloadPDF(filename) {
    // 1. THE FIX: We add a "Font Stack". If Arial doesn't have the shape, 
    // it moves down the list to Apple Emoji, then Windows Emoji, etc., until it finds it!
    const fontStack = "'Arial', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif";
    
    let htmlContent = `<div style="font-family: ${fontStack}; padding: 20px; color: #000000; background-color: #ffffff;">`;
    
    documents.forEach((doc, index) => {
        htmlContent += `<h2>${doc.emoji || '📄'} ${doc.name}</h2>`;
        // Added white-space: pre-wrap so your spaces and line breaks export perfectly too!
        htmlContent += `<div style="color: #000000; white-space: pre-wrap; word-wrap: break-word;">${doc.content}</div>`;
        if (index < documents.length - 1) htmlContent += '<hr style="margin: 30px 0;">';
    });
    htmlContent += '</div>';
    
    const opt = {
        margin: 10,
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        // 2. THE FIX: We turn on 'letterRendering' and 'useCORS' to force the canvas engine 
        // to draw complex Unicode shapes as exact images before making the PDF.
        html2canvas: { scale: 2, useCORS: true, letterRendering: true }, 
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    html2pdf().set(opt).from(htmlContent).save();
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ===== IMPORT FUNCTIONALITY =====
document.getElementById('import-file').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            let importedData = JSON.parse(e.target.result);
            if (importedData && importedData.tabs) {
                documents = importedData.tabs;
                currentTabId = documents[0].id;
                initializeEditor();
            }
        } catch (error) {
            alert('Error importing JSON file. Ensure it is a valid backup.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
});
