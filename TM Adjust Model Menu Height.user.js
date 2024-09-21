// ==UserScript==
// @name         TM Adjust Model Menu Height
// @version      1.0
// @description  Adjusts the height of the model menu in Typing Mind
// @author       asgeirtj
// @match        https://www.typingmind.com/*
// @grant        GM_info
// @tag          typingmind
// @icon         https://www.typingmind.com/favicon.ico
// @require      https://raw.githubusercontent.com/asgeirtj/tampermonkey-scripts/main/TM Adjust Model Menu Height.user.js
// ==/UserScript==

// IMPORTANT: When providing updates to this script, always increment the version number in the metadata block above

(function() {
    'use strict';

    const SCRIPT_NAME = GM_info.script.name;
    const SCRIPT_VERSION = GM_info.script.version;

    // Logging Utility
    const logger = {
        success: (message) => console.log(`%c[SUCCESS] ${message}`, 'color: #2ecc71'),
        warning: (message) => console.warn(`[WARNING] ${message}`),
        error: (message, error) => console.error(`[ERROR] ${message}`, error)
    };

    // Utility Functions
    const utils = {
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };

    // Function to adjust model menu height
    function adjustModelMenuHeight() {
        const modelMenu = document.querySelector('div[role="menu"] .py-2.max-h-\\[300px\\].overflow-auto');
        if (modelMenu) {
            modelMenu.style.maxHeight = '700px';
            logger.success('Model menu height adjusted');
        }
    }

    // Observer to adjust model menu height dynamically
    const menuObserver = new MutationObserver(utils.debounce(() => {
        adjustModelMenuHeight();
    }, 200));
    menuObserver.observe(document.body, { childList: true, subtree: true });

    // Initial adjustment
    adjustModelMenuHeight();

    // Log success message with script details
    const scriptInfo = `
    - Increases the max height of the model menu from 300px to 700px
    - Uses a MutationObserver to dynamically adjust the height when the menu appears
    - Applies the change to elements matching: div[role="menu"] .py-2.max-h-\\[300px\\].overflow-auto
    `;

    logger.success(`${SCRIPT_NAME} v${SCRIPT_VERSION} loaded successfully\n\nScript functionality:${scriptInfo}`);
})();
