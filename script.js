// ===== FONT HIGHLIGHTING / RICH TEXT =====
let savedRange = null;

// Listen to the document to keep track of the cursor position
document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    const editor = document.getElementById('editor-content');
    
    // Only save the cursor location if we are currently clicking inside the editor
    if (selection.rangeCount > 0 && document.activeElement === editor) {
        savedRange = selection.getRangeAt(0);
    }
});

function applyFont() {
    const fontSelector = document.getElementById('font-selector');
    const editor = document.getElementById('editor-content');
    
    // 1. Force the focus back onto the text editor
    editor.focus();
    
    // 2. Restore the exact highlight/cursor position we memorized earlier
    if (savedRange) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange);
    }
    
    // 3. NOW apply the font!
    document.execCommand('fontName', false, fontSelector.value);
}
