// ===== CUSTOM LANGUAGES HUB =====

const customLanguages = {
    
    'Simple Uni-Shapes': {
        // Uppercase
        'A': '◯', 'B': '●', 'C': '◓', 'D': '◠', 'E': '◒', 'F': '◡',
        'G': '△', 'H': '▲', 'I': '∧', 'J': '▽', 'K': '▼', 'L': '∨',
        'M': '◁', 'N': '◀', 'O': '＜', 'P': '▷', 'Q': '▶', 'R': '＞',
        'S': '┏', 'T': '┓', 'U': '┗', 'V': '┛', 'W': '□', 'X': '■',
        'Y': '◇', 'Z': '◆',
        
        // Lowercase
        'a': '○', 'b': '•', 'c': '◓', 'd': '◠', 'e': '◒', 'f': '◡',
        'g': '▵', 'h': '▴', 'i': '⌃', 'j': '▿', 'k': '▾', 'l': '⌄',
        'm': '◃', 'n': '◂', 'o': '<', 'p': '▹', 'q': '▸', 'r': '>',
        's': '┌', 't': '┐', 'u': '└', 'v': '┘', 'w': '▫', 'x': '▪',
        'y': '⋄', 'z': '⬩',

        // Numbers
        '1': '↑', '2': '↓', '3': '←', '4': '→', '5': '／', 
        '6': '＼', '7': '＋', '8': '✕', '9': '‖', '0': '⧺'
    }

    // When you make a new language, you can add it right here! Example:
    /*
    , 'Alien Script': {
        'A': '⍙', 'B': '⍚', 'C': '⍜'
    }
    */
};

// This master listener handles ALL languages listed above automatically!
document.addEventListener('keydown', function(e) {
    const fontSelector = document.getElementById('font-selector');
    const editor = document.getElementById('editor-content');
    const activeLanguage = fontSelector.value;
    
    // If we are typing in the editor AND the selected mode is in our dictionary hub
    if (document.activeElement === editor && customLanguages[activeLanguage]) {
        
        const currentDictionary = customLanguages[activeLanguage];
        
        // Check if the key pressed is in the active dictionary
        if (currentDictionary[e.key] && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault(); 
            document.execCommand('insertText', false, currentDictionary[e.key]);
        }
    }
});
