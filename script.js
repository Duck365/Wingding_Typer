// ===== GLITCH EFFECT WITH 10% CHANCE FOR SUBTLE MODE =====
let glitchIntensity = 'continuous';
let lastGlitchChange = 0;

function updateGlitchEffect() {
    const glitchTitle = document.getElementById('glitch-title');
    if (!glitchTitle) return;

    const now = Date.now();
    
    // 10% chance to switch to subtle mode
    if (glitchIntensity === 'continuous' && Math.random() < 0.1) {
        glitchIntensity = 'subtle';
        lastGlitchChange = now;
    }
    
    // Cooldown: 0.5-1 second for subtle mode
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

// Add subtle glitch keyframes dynamically
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

function goToScreen1() {
    showScreen(1);
}

function goToScreen2() {
    showScreen(2);
}

function goToEditor() {
    showScreen(3);
    initializeEditor();
}

// ===== DOCUMENT & TAB MANAGEMENT =====
let documents = [
    {
        id: 1,
        name: 'Tab 1',
        content: ''
    }
];

let currentTabId = 1;
let hasUnsavedContent = false;

function initializeEditor() {
    renderTabs();
    loadTabContent(currentTabId);
}

function renderTabs() {
    const tabsList = document.getElementById('tabs-list');
    tabsList.innerHTML = '';
    
    documents.forEach(doc => {
        const tabItem = document.createElement('button');
        tabItem.className = `tab-item ${doc.id === currentTabId ? 'active' : ''}`;
        tabItem.innerHTML = `
            <span>${doc.name}</span>
            <button class="tab-delete-btn" onclick="deleteTab(${doc.id}, event)">×</button>
        `;
        tabItem.onclick = () => switchTab(doc.id);
        tabsList.appendChild(tabItem);
    });
}

function switchTab(tabId) {
    if (currentTabId === tabId) return;
    
    // Save current tab content
    const textarea = document.getElementById('editor-textarea');
    const currentDoc = documents.find(d => d.id === currentTabId);
    if (currentDoc) currentDoc.content = textarea.value;
    
    currentTabId = tabId;
    loadTabContent(tabId);
    renderTabs();
}

function loadTabContent(tabId) {
    const doc = documents.find(d => d.id === tabId);
    const textarea = document.getElementById('editor-textarea');
    if (doc) {
        textarea.value = doc.content;
        hasUnsavedContent = doc.content.length > 0;
    }
}

function addTab() {
    if (documents.length >= 15) {
        alert('Maximum 15 tabs allowed!');
        return;
    }
    
    const newId = Math.max(...documents.map(d => d.id), 0) + 1;
    const tabCount = documents.length + 1;
    
    documents.push({
        id: newId,
        name: `Tab ${tabCount}`,
        content: ''
    });
    
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

// ===== FONT SWITCHING =====
function changeFont() {
    const fontSelector = document.getElementById('font-selector');
    const textarea = document.getElementById('editor-textarea');
    textarea.style.fontFamily = `'${fontSelector.value}', sans-serif`;
}

// ===== CONTENT TRACKING =====
const textarea = document.getElementById('editor-textarea');
if (textarea) {
    textarea.addEventListener('input', () => {
        hasUnsavedContent = textarea.value.trim().length > 0;
    });
}

// ===== IMPORT/EXPORT MODAL =====
function openImportExportModal() {
    document.getElementById('import-export-modal').classList.remove('hidden');
}

function closeImportExportModal() {
    document.getElementById('import-export-modal').classList.add('hidden');
}

function saveCurrentTabBeforeExport() {
    const textarea = document.getElementById('editor-textarea');
    const currentDoc = documents.find(d => d.id === currentTabId);
    if (currentDoc) currentDoc.content = textarea.value;
}

// ===== DOWNLOAD AS DIFFERENT FORMATS =====
function downloadAs(format) {
    saveCurrentTabBeforeExport();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `wingding_typer_${timestamp}`;
    
    if (format === 'json') {
        downloadJSON(filename);
    } else if (format === 'txt') {
        downloadTXT(filename);
    } else if (format === 'pdf') {
        downloadPDF(filename);
    } else if (format === 'docx') {
        downloadDOCX(filename);
    }
    
    closeImportExportModal();
}

function downloadJSON(filename) {
    const data = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        currentTabId: currentTabId,
        currentFont: document.getElementById('font-selector').value,
        tabs: documents
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    downloadBlob(blob, `${filename}.json`);
}

function downloadTXT(filename) {
    let textContent = '';
    
    documents.forEach((doc, index) => {
        textContent += `\n===== ${doc.name} =====\n`;
        textContent += doc.content;
        if (index < documents.length - 1) {
            textContent += '\n\n';
        }
    });
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    downloadBlob(blob, `${filename}.txt`);
}

function downloadPDF(filename) {
    saveCurrentTabBeforeExport();
    
    let htmlContent = '<html><body style="font-family: Wingdings; margin: 20px;">';
    
    documents.forEach((doc, index) => {
        htmlContent += `<h2>${doc.name}</h2>`;
        htmlContent += `<p>${doc.content.replace(/\n/g, '<br>')}</p>`;
        if (index < documents.length - 1) {
            htmlContent += '<hr style="margin: 30px 0;">';
        }
    });
    
    htmlContent += '</body></html>';
    
    const opt = {
        margin: 10,
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    html2pdf().set(opt).from(htmlContent).save();
}

function downloadDOCX(filename) {
    const sections = documents.map(doc => {
        const paragraphs = [new docx.Paragraph({ text: doc.name, bold: true, size: 28 })];
        
        doc.content.split('\n').forEach(line => {
            paragraphs.push(new docx.Paragraph({
                text: line || ' ',
                size: 24,
                font: 'Wingdings'
            }));
        });
        
        paragraphs.push(new docx.Paragraph({ text: '' }));
        
        return paragraphs;
    }).flat();
    
    const doc = new docx.Document({
        sections: [{
            children: sections
        }]
    });
    
    docx.Packer.toBlob(doc).then(blob => {
        downloadBlob(blob, `${filename}.docx`);
    });
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ===== IMPORT FUNCTIONALITY =====
const importFileInput = document.getElementById('import-file');
if (importFileInput) {
    importFileInput.addEventListener('change', handleImport);
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            let importedData = null;
            
            if (file.name.endsWith('.json')) {
                importedData = JSON.parse(e.target.result);
            } else if (file.name.endsWith('.txt')) {
                importedData = parseTXTFile(e.target.result);
            }
            
            if (importedData && importedData.tabs) {
                // Check if ANY tab has content
                const hasContent = documents.some(doc => doc.content.trim().length > 0);
                
                if (hasContent) {
                    if (confirm('Replace current document with imported file? This cannot be undone.')) {
                        documents = importedData.tabs;
                        currentTabId = importedData.currentTabId || documents[0].id;
                        
                        if (importedData.currentFont) {
                            document.getElementById('font-selector').value = importedData.currentFont;
                        }
                        
                        initializeEditor();
                    }
                } else {
                    // No content, just override
                    documents = importedData.tabs;
                    currentTabId = importedData.currentTabId || documents[0].id;
                    
                    if (importedData.currentFont) {
                        document.getElementById('font-selector').value = importedData.currentFont;
                    }
                    
                    initializeEditor();
                }
            }
        } catch (error) {
            alert('Error importing file: ' + error.message);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function parseTXTFile(content) {
    const tabs = [];
    const tabRegex = /===== (.+?) =====\n([\s\S]*?)(?=\n===== |$)/g;
    let match;
    let tabId = 1;
    
    while ((match = tabRegex.exec(content)) !== null) {
        tabs.push({
            id: tabId,
            name: match[1],
            content: match[2].trim()
        });
        tabId++;
    }
    
    return {
        version: '1.0',
        tabs: tabs.length > 0 ? tabs : [
            { id: 1, name: 'Tab 1', content: content }
        ]
    };
}
