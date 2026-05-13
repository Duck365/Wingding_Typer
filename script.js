// ===== GLITCH EFFECT (Unchanged) =====
let glitchIntensity = 'continuous';
let lastGlitchChange = 0;

function updateGlitchEffect() {
    const glitchTitle = document.getElementById('glitch-title');
    if (!glitchTitle) return;

    const now = Date.now();
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

const style = document.createElement('style');
style.textContent = `
    @keyframes glitch-subtle {
        0%, 100% { text-shadow: 1px 0 #ff3333, -1px 0 #00ff00; transform: translate(0); }
        50% { text-shadow: -1px 0 #ff3333, 1px 0 #00ff00; transform: translate(1px, 0); }
    }
`;
document.head.appendChild(style);

// ===== SCREEN NAVIGATION =====
function showScreen(screenNum) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${screenNum}`).classList.add('active');
}
function goToScreen1() { showScreen(1); }
function goToScreen2() { showScreen(2); }
function goToEditor() {
    showScreen(3);
    initializeEditor();
    // Default the editor page to the currently selected font upon opening
    applyFont(); 
}

// ===== DOCUMENT & TAB MANAGEMENT =====
let documents = [
    { id: 1, name: 'Tab 1', content: '' }
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
            <span>${doc.name}</span>
            <button class="tab-delete-btn" onclick="deleteTab(${doc.id}, event)">×</button>
        `;
        tabsList.appendChild(tabItem);
    });
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
        // We use innerHTML because it's a rich text div now
        editor.innerHTML = doc.content; 
    }
}

function addTab() {
    if (documents.length >= 15) {
        alert('Maximum 15 tabs allowed!');
        return;
    }
    const newId = Math.max(...documents.map(d => d.id), 0) + 1;
    documents.push({ id: newId, name: `Tab ${documents.length + 1}`, content: '' });
    switchTab(newId);
}

function deleteTab(tabId, event) {
    event.stopPropagation();
    if (documents.length <= 1) {
        alert('You must keep at least one tab!');
        return;
    }
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
    // Save the rich HTML formatting, not just raw text
    if (currentDoc) currentDoc.content = editor.innerHTML; 
}

// ===== FONT HIGHLIGHTING / RICH TEXT =====
function applyFont() {
    const fontSelector = document.getElementById('font-selector');
    const editor = document.getElementById('editor-content');
    
    // This command applies the font to highlighted text OR the current cursor position
    document.execCommand('fontName', false, fontSelector.value);
    
    // Keep focus on the editor so you can keep typing
    editor.focus();
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
    // For TXT, we strip the HTML tags out to just get raw text
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
    let htmlContent = '<div style="font-family: Arial; padding: 20px;">';
    documents.forEach((doc, index) => {
        htmlContent += `<h2>${doc.name}</h2>`;
        htmlContent += `<div>${doc.content}</div>`;
        if (index < documents.length - 1) htmlContent += '<hr style="margin: 30px 0;">';
    });
    htmlContent += '</div>';
    
    const opt = {
        margin: 10,
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
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
