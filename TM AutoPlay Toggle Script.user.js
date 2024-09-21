// ==UserScript==
// @name         TM AutoPlay Toggle Script
// @namespace    http://tampermonkey.net/
// @version      1.0.3
// @description  Toggles the Auto Play Assistant Messages setting in Typing Mind's UI using cmd+u or ctrl+u shortcut and ensures the Done button is clicked correctly.
// @author       Owsgair
// @match        https://www.typingmind.com/*
// @grant        none
// @icon         https://www.typingmind.com/favicon.ico
// ==/UserScript==

(function() {
    'use strict';

    const SCRIPT_VERSION = '1.0.3';
    const SCRIPT_NAME = 'TM AutoPlay Toggle Script';
    const DEBUG_MODE = true; // Set to false in production

    // Logging Utility
    const logger = {
        info: (message) => DEBUG_MODE && console.log(`%c[INFO] ${message}`, 'color: #3498db'),
        success: (message) => DEBUG_MODE && console.log(`%c[SUCCESS] ${message}`, 'color: #2ecc71'),
        warning: (message) => DEBUG_MODE && console.warn(`[WARNING] ${message}`),
        error: (message, error) => console.error(`[ERROR] ${message}`, error)
    };

    // Utility Functions
    const utils = {
        waitForElement: function(selector, timeout = 2000) {
            return new Promise((resolve, reject) => {
                const element = document.querySelector(selector);
                if (element) {
                    logger.success(`Element found: ${selector}`);
                    resolve(element);
                    return;
                }

                const observer = new MutationObserver(() => {
                    const element = document.querySelector(selector);
                    if (element) {
                        logger.success(`Element found after waiting: ${selector}`);
                        resolve(element);
                        observer.disconnect();
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });

                setTimeout(() => {
                    observer.disconnect();
                    logger.error(`Element not found within timeout: ${selector}`);
                    reject(new Error(`Element not found within timeout: ${selector}`));
                }, timeout);
            });
        },

        simulateMouseEvent: function(element, eventName) {
            const mouseEvent = new MouseEvent(eventName, {
                view: window,
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(mouseEvent);
        },

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
        },

        addClassToSelector: function(selector, className) {
            const element = document.querySelector(selector);
            if (element) {
                element.classList.add(className);
                logger.success(`Class '${className}' added to element: ${selector}`);
            } else {
                logger.warning(`Element not found for adding class: ${selector}`);
            }
        }
    };

    // UI Interaction Functions
    const uiInteractions = {
        toggleAutoPlaySetting: async function() {
            try {
                // Hover over the settings container to make the settings button visible
                const settingsContainer = document.querySelector('div.flex.items-center.justify-center.sm\\:justify-start.gap-2.flex-wrap.w-full.group');
                if (settingsContainer) {
                    utils.simulateMouseEvent(settingsContainer, 'mouseover');
                    logger.info('Hovered over settings container');

                    // Click the settings button
                    const settingsButton = document.querySelector('button.group-hover\\:inline-block.sm\\:hidden.font-semibold.text-gray-500.hover\\:underline');
                    if (settingsButton) {
                        settingsButton.click();
                        logger.info('Settings button clicked');

                        // Wait for the modal to appear
                        const modal = await utils.waitForElement('[data-element-id="pop-up-modal"]', 2000);
                        if (modal) {
                            // Find and toggle the Auto Play setting
                            const sections = Array.from(document.querySelectorAll('button[data-element-id="plugins-switch-disabled"], button[data-element-id="plugins-switch-enabled"]')).filter(button => {
                                return button.nextElementSibling && button.nextElementSibling.textContent.includes('Auto play assistant messages');
                            });

                            if (sections.length > 0) {
                                const toggleButton = sections[0];
                                toggleButton.click();
                                logger.success('Auto play setting toggled');

                                // Click the Done button
                                const doneButton = await utils.waitForElement('button[type="submit"].inline-flex.items-center.px-4.py-2.border.border-transparent.text-base.font-medium.rounded-md.shadow-sm.text-white.bg-blue-600.hover\\:bg-blue-700.focus\\:outline-none.focus\\:ring-2.focus\\:ring-offset-2.focus\\:ring-blue-500.disabled\\:bg-gray-400.gap-2', 2000);
                                if (doneButton) {
                                    doneButton.click();
                                    logger.info('Done button clicked');
                                } else {
                                    logger.warning('Done button not found');
                                }
                            } else {
                                logger.warning('Auto play switch not found');
                            }
                        } else {
                            logger.warning('Modal not found');
                        }
                    } else {
                        logger.warning('Settings button not found');
                    }
                } else {
                    logger.warning('Settings container not found');
                }
            } catch (error) {
                logger.error('Error in toggling autoplay setting:', error);
            }
        },

        setTextareaRows: function() {
            const textareas = [
                document.querySelector('[data-element-id="ai-characters-system-instruction-input"]'),
                document.querySelector('[data-element-id="new-system-instruction"]')
            ];

            textareas.forEach(textarea => {
                if (textarea) {
                    textarea.setAttribute('rows', '30');
                    logger.info('Textarea rows set to 30');
                }
            });
        },

        adjustModalSize: function() {
            const observer = new MutationObserver(() => {
                const modal = document.querySelector('div[data-element-id="pop-up-modal"]');
                if (modal) {
                    utils.addClassToSelector('div[data-element-id="pop-up-modal"]', 'sm:max-w-7xl');
                    logger.info('Modal size adjusted');
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    };

    // Shortcut Handlers Configuration
    const SHORTCUTS = {
        'u': uiInteractions.toggleAutoPlaySetting // Bind cmd+u or ctrl+u to toggle auto-play setting
    };

    // Page Type Detection
    function getPageType() {
        if (document.querySelector('.flex.items-center.justify-center.gap-4.flex-col')) {
            return 'chat';
        } else if (document.querySelector('.grid.grid-cols-2.gap-4.sm\\:grid-cols-3.lg\\:grid-cols-4')) {
            return 'agents';
        } else {
            return 'other';
        }
    }

    // Event Listeners
    function attachEventListeners() {
        document.addEventListener('keydown', function(event) {
            if ((event.metaKey || event.ctrlKey) && SHORTCUTS[event.key]) {
                event.preventDefault();
                SHORTCUTS[event.key](event);
            }
        });
    }

    // Initialization Function
    function init() {
        logger.info('Script initialization started...');
        attachEventListeners();
        uiInteractions.setTextareaRows();
        uiInteractions.adjustModalSize();

        // Setup observers for dynamically loaded content
        const textareaObserver = new MutationObserver(utils.debounce(() => {
            uiInteractions.setTextareaRows();
        }, 200));
        textareaObserver.observe(document.body, { childList: true, subtree: true });

        // Initial page type check
        logger.info(`Initial page type: ${getPageType()}`);

        logger.success(`${SCRIPT_NAME} v${SCRIPT_VERSION} loaded successfully`);
    }

    // Start the script
    init();

    // Expose some functions for debugging if in DEBUG_MODE
    if (DEBUG_MODE) {
        window.typingMindExt = {
            getPageType,
            uiInteractions
        };
    }
})();