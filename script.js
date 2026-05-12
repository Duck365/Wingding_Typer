// Global State
let currentTab = 0;
let tabs = [
    { id: 0, name: 'Tab 1', content: '' }
];
let nextTabId = 1;
let hasUnsavedContent = false;
let glitchMode = 'normal'; // 'normal' or 'subtle'
let glitchCooldown = 0;

// Initialize glitch effect with 10% chance for subtle mode
function initializeGlitch() {
    const random = Math.random();
    if (random < 0.1) {
        glitchMode = 'subtle';
    } else {
        glitchMode = 'normal';
    }
}

// Screen Navigation
function goToScreen2() {
    document.getElementById('screen-1').style.display = 'none';
    document.getElementById('screen-2').style.display = 'flex';
}

function goBack() {
    document.getElementById('screen-2').style.display = 'none';
    document.getElementById('screen-1').style.display = 'flex';
}

function startEditor() {
    document.getElementById('screen-2').style.display = 'none';
    document.getElementById('screen-3').style.display = 'flex';
    initializeEditor();
}

function goBackToMenu() {
    document.getElementById('screen-3').style.display = 'none';
    document.getElementById('screen-1').style.display = 'flex';
    // Reset editor state
    tabs = [{ id: 0, name: 'Tab 1', content: '' }];
    currentTab = 0;
    nextTabId = 1;
    hasUnsavedContent = false;
}

// Editor Initialization
function initializeEditor() {
    renderTabs();
    loadTab(0);
    document.getElementById('editor-textarea').focus();
    document.getElementById('editor-textarea').addEventListener('input', handleEditorInput);
}

// Tab Management
function renderTabs() {
    const tabsList = document.getElementById('tabs-list');
    tabsList.innerHTML = '';

    tabs.forEach((tab, index) => {
        const tabElement = document.createElement('div');
        tabElement.className = `tab-item ${index === currentTab ? 'active' : ''}`;
        tabElement.onclick = () => switchTab(index);

        const label = document.createElement('span');
        label.className = 'tab-label';
        label.textContent = tab.name;

        const menuBtn = document.createElement('button');
        menuBtn.className = 'tab-menu-btn';
        menuBtn.textContent = '⋮';
        menuBtn.onclick = (e) => {
            e.stopPropagation();
            openTabMenu(index);
        };

        tabElement.appendChild(label);
        tabElement.appendChild(menuBtn);
        tabsList.appendChild(tabElement);
    });

    // Check if we can add more tabs
    if (tabs.length < 15) {
        const addBtn = document.querySelector('.add-tab-btn');
        addBtn.style.opacity = '1';
        addBtn.style.pointerEvents = 'auto';
    } else {
        const addBtn = document.querySelector('.add-tab-btn');
        addBtn.style.opacity = '0.5';
        addBtn.style.pointerEvents = 'none';
    }
}

function switchTab(tabIndex) {
    // Save current tab content
    tabs[currentTab].content = document.getElementById('editor-textarea').value;

    // Load new tab
    currentTab = tabIndex;
    loadTab(tabIndex);
    renderTabs();
}

function loadTab(tabIndex) {
    const textarea = document.getElementById('editor-textarea');
    textarea.value = tabs[tabIndex].content;
    textarea.focus();
}

function addNewTab() {
    if (tabs.length >= 15) {
        alert('Maximum 15 tabs allowed!');
        return;
    }

    const newTab = {
        id: nextTabId,
        name: `Tab ${tabs.length + 1}`,
        content: ''
    };

    tabs.push(newTab);
    nextTabId++;
    switchTab(tabs.length - 1);
}

function openTabMenu(tabIndex) {
    // Simple menu - delete or rename
    const action = prompt(`Tab: ${tabs[tabIndex].name}\n\nEnter new name (or press Cancel to delete):`);
    
    if (action === null) {
        // Delete tab
        if (tabs.length === 1) {
            alert('Cannot delete the last tab!');
            return;
        }
        tabs.splice(tabIndex, 1);
        if (currentTab >= tabs.length) currentTab = tabs.length - 1;
        switchTab(currentTab);
    } else if (action.trim() !== '') {
        // Rename tab
        tabs[tabIndex].name = action.trim();
        renderTabs();
    }
}

// Editor Input Handling
function handleEditorInput() {
    tabs[currentTab].content = document.getElementById('editor-textarea').value;
    hasUnsavedContent = checkHasContent();
}

function checkHasContent() {
    return tabs.some(tab => tab.content.trim().length > 0);
}

// Font Family Change
function changeFontFamily() {
    const fontFamily = document.getElementById('font-selector').value;
    const textarea = document.getElementById('editor-textarea');
    textarea.style.fontFamily = fontFamily;
}

// Import/Export Modal
function openImportExportMenu() {
    document.getElementById('import-export-modal').style.display = 'block';
}

function closeImportExportMenu() {
    document.getElementById('import-export-modal').style.display = 'none';
    document.getElementById('import-file').value = '';
}

// Export Document
function exportDocument(format) {
    const documentData = {
        tabs: tabs,
        currentTab: currentTab,
        timestamp: new Date().toISOString()
    };

    let content, filename, mimeType;

    if (format === 'json') {
        content = JSON.stringify(documentData, null, 2);
        filename = 'wingding_document.json';
        mimeType = 'application/json';
    } else if (format === 'txt') {
        // Combine all tabs content
        content = tabs.map(tab => `=== ${tab.name} ===\n${tab.content}`).join('\n\n');
        filename = 'wingding_document.txt';
        mimeType = 'text/plain';
    } else if (format === 'pdf') {
        // Simple PDF generation using a library approach
        content = generatePDF(documentData);
        filename = 'wingding_document.pdf';
        mimeType = 'application/pdf';
    } else if (format === 'docx') {
        // For now, export as formatted text (a real .docx would need a library)
        content = generateDocx(documentData);
        filename = 'wingding_document.docx';
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    downloadFile(content, filename, mimeType);
    closeImportExportMenu();
}

function generatePDF(documentData) {
    // Simple PDF text content - in a real app, you'd use a library like pdfkit or jsPDF
    let pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>
endobj
4 0 obj
<< /Length 500 >>
stream
BT
/F1 12 Tf
50 750 Td
(Wingding Document) Tj
0 -20 Td
(${documentData.tabs.map(t => `${t.name}: ${t.content.substring(0, 50)}`).join(' | ')}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000273 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
823
%%EOF`;
    return pdfContent;
}

function generateDocx(documentData) {
    // For a simple approach, we'll create a basic Word document structure
    // A real implementation would need a library like docx.js
    const text = tabs.map(tab => `${tab.name}\n${tab.content}`).join('\n\n');
    return text;
}

function downloadFile(content, filename, mimeType) {
    let blob;
    if (mimeType.includes('json') || mimeType.includes('plain') || mimeType.includes('word')) {
        blob = new Blob([content], { type: mimeType });
    } else if (mimeType === 'application/pdf') {
        blob = new Blob([content], { type: 'application/pdf' });
    } else {
        blob = new Blob([content], { type: mimeType });
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Import Document
function importDocument() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            let importedData;

            if (file.name.endsWith('.json')) {
                importedData = JSON.parse(e.target.result);
            } else if (file.name.endsWith('.txt')) {
                // Parse text format
                const content = e.target.result;
                const tabSections = content.split(/^===\s*(.+?)\s*===/m);
                importedData = { tabs: [] };

                for (let i = 1; i < tabSections.length; i += 2) {
                    importedData.tabs.push({
                        id: i,
                        name: tabSections[i].trim(),
                        content: tabSections[i + 1]?.trim() || ''
                    });
                }
            }

            // Check if there's unsaved content
            if (hasUnsavedContent) {
                const confirmed = confirm(
                    'You have unsaved changes. Are you sure you want to replace this document?'
                );
                if (!confirmed) {
                    fileInput.value = '';
                    return;
                }
            }

            // Load imported data
            tabs = importedData.tabs || [];
            currentTab = importedData.currentTab || 0;
            nextTabId = Math.max(...tabs.map(t => t.id || 0)) + 1;
            hasUnsavedContent = false;

            renderTabs();
            loadTab(currentTab);
            closeImportExportMenu();

            alert('Document imported successfully!');
        } catch (error) {
            alert('Error importing document: ' + error.message);
        }

        fileInput.value = '';
    };

    reader.readAsText(file);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('import-export-modal');
    if (event.target === modal) {
        closeImportExportMenu();
    }
};

// Initialize glitch effect on page load
window.addEventListener('load', initializeGlitch);
