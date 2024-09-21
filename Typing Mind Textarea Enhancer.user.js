// ==UserScript==
// @name         Typing Mind Textarea Enhancer
// @version      1.3
// @description  Resizes specific textareas in Typing Mind to fit content using field-sizing
// @match        https://www.typingmind.com/*
// @grant        none
// @tag          typingmind
// @icon         https://www.typingmind.com/favicon.ico
// @author       asgeirtj
// ==/UserScript==

// IMPORTANT: When providing updates to this script, always increment the version number in the metadata block above.

(function() {
    'use strict';

    // Function to apply field-sizing to a textarea
    function applyFieldSizing(textarea) {
        // Apply the field-sizing CSS property
        textarea.style.fieldSizing = 'content';
    }

    // Function to find and enhance specific textareas
    function findAndEnhanceTextareas() {
        // Select the specific textareas
        const textareas = document.querySelectorAll('textarea.w-full.px-3.py-2.border.border-gray-300.dark\\:border-gray-500.dark\\:focus\\:border-blue-500.rounded-md.shadow-sm.focus\\:outline-none.focus\\:ring-blue-500.focus\\:border-blue-500.sm\\:text-sm.dark\\:bg-zinc-700');

        // Select the characters-system-instruction-input
        const charSystemInput = document.querySelector('textarea[data-testid="characters-system-instruction-input"]');

        // Apply field-sizing to each textarea
        textareas.forEach(applyFieldSizing);

        // Apply field-sizing to the characters-system-instruction-input if it exists
        if (charSystemInput) {
            applyFieldSizing(charSystemInput);
        }
    }

    // Initial call to find and enhance textareas
    findAndEnhanceTextareas();

    // Set up a MutationObserver to watch for new textareas
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check if new nodes were added
            if (mutation.addedNodes.length) {
                // Find and enhance any new textareas
                findAndEnhanceTextareas();
            }
        });
    });

    // Configure and start the observer
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
