// ==UserScript==
// @name         Typing Mind Enhanced Extension 2.0.2
// @namespace    http://tampermonkey.net/
// @version      2.0.2
// @description  Enhances Typing Mind's UI with improved interactions, robust AI agent management, and customizable keyboard shortcuts. Incorporates modern JavaScript practices, centralized configuration, optimized mutation observers, and enhanced error handling.
// @author       asgeirtj
// @match        https://www.typingmind.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ------------------------------
    // Constants and Configuration
    // ------------------------------

    const SCRIPT_VERSION = '2.0.2';
    const SCRIPT_NAME = 'Typing Mind Enhanced Extension';
    const DEBUG_MODE = true; // Set to false in production

    // Centralized CSS Selectors
    const SELECTORS = {
        textarea: [
            '[data-element-id="ai-characters-system-instruction-input"]',
            '[data-element-id="new-system-instruction"]'
        ],
        modal: 'div[data-element-id="pop-up-modal"]',
        aiAgentsButton: 'div[role="option"]',
        aiAgentsButtonText: 'Open AI Agents',
        currentAgentName: 'div[data-element-id="current-character"] div.text-xl.font-semibold',
        aiAgentBlock: 'div[data-element-id="one-ai-character-block"]',
        aiAgentTitle: '.text-lg.font-semibold .line-clamp-1',
        aiAgentEditButton: 'button svg[viewBox="0 0 576 512"]',
        latestPlayButton: 'button[data-element-id="in-message-play-button"]',
        searchShortcutButton: 'button[data-element-id="search-shortcut-button"]'
    };

    // Keyboard Shortcuts Configuration
const SHORTCUTS = {
    'l': 'clickLatestPlayButton',
    '9': 'handleCmd9' // Changed from '4' to '9'
};


    // ------------------------------
    // Logging Utility
    // ------------------------------

    const logger = {
        info: (message) => DEBUG_MODE && console.log(`%c[INFO] ${message}`, 'color: #3498db'),
        success: (message) => DEBUG_MODE && console.log(`%c[SUCCESS] ${message}`, 'color: #2ecc71'),
        warning: (message) => DEBUG_MODE && console.warn(`[WARNING] ${message}`),
        error: (message, error) => console.error(`[ERROR] ${message}`, error)
    };

    // ------------------------------
    // Utility Functions
    // ------------------------------

    const utils = {
        // Waits for a DOM element matching the selector to appear within a timeout
        waitForElement: function(selector, timeout = 10000) {
            return new Promise((resolve, reject) => {
                const element = document.querySelector(selector);
                if (element) {
                    logger.success(`Element found: ${selector}`);
                    resolve(element);
                    return;
                }

                const observer = new MutationObserver((mutations, observer) => {
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

        // Simulates a keyboard event using modern constructors
        simulateKeyEvent: function(eventType, key, code, ctrlKey = false, metaKey = false) {
            const event = new KeyboardEvent(eventType, {
                key,
                code,
                ctrlKey,
                metaKey,
                bubbles: true,
                cancelable: true
            });
            document.dispatchEvent(event);
        },

        // Simulates a mouse event on a given element using modern constructors
        simulateMouseEvent: function(element, eventName) {
            const mouseEvent = new MouseEvent(eventName, {
                view: window,
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(mouseEvent);
        },

        // Clicks an element based on its selector
        clickElementBySelector: function(selector) {
            const element = document.querySelector(selector);
            if (element) {
                element.click();
                logger.success(`Clicked element: ${selector}`);
                return true;
            } else {
                logger.warning(`Element not found: ${selector}`);
                return false;
            }
        },

        // Adds a CSS class to an element based on its selector
        addClassToSelector: function(selector, className) {
            const element = document.querySelector(selector);
            if (element) {
                element.classList.add(className);
                logger.success(`Class '${className}' added to element: ${selector}`);
            } else {
                logger.warning(`Element not found: ${selector}`);
            }
        },

        // Debounces a function to limit its execution rate
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

        // Delays execution for a specified number of milliseconds
        delay: function(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    };

    // ------------------------------
    // UI Interaction Functions
    // ------------------------------

    const uiInteractions = {
        setTextareaRows: function() {
            const textareas = SELECTORS.textarea.map(selector => document.querySelector(selector)).filter(el => el);
            textareas.forEach(textarea => {
                textarea.setAttribute('rows', '15');
                textarea.style.minHeight = '150px'; // Assuming 10px per row
                textarea.style.resize = 'vertical';
                this.makeTextareaAutoExpand(textarea);
                logger.info('Textarea rows set to 15 with auto-expand');
            });
        },

        makeTextareaAutoExpand: function(textarea) {
            function autoExpand() {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            }
            textarea.addEventListener('input', autoExpand);
            // Initial call to set the correct height
            autoExpand();
        },

        adjustModalSize: function() {
            const modal = document.querySelector(SELECTORS.modal);
            if (modal) {
                utils.addClassToSelector(SELECTORS.modal, 'sm:max-w-7xl');
                logger.info('Modal size adjusted');
            }
        }
    };

    // ------------------------------
    // AI Agent Functions
    // ------------------------------

    const aiAgentFunctions = {
        // Finds and clicks the "Open AI Agents" button
        findAndClickButton: function() {
            const buttons = document.querySelectorAll(SELECTORS.aiAgentsButton);
            const button = Array.from(buttons).find(el => {
                const span = el.querySelector('span');
                return span && span.textContent.trim() === SELECTORS.aiAgentsButtonText;
            });

            if (button) {
                const span = button.querySelector('span');
                if (span) {
                    utils.simulateMouseEvent(span, 'mouseover');
                    utils.simulateMouseEvent(span, 'mousedown');
                    utils.simulateMouseEvent(span, 'mouseup');
                    utils.simulateMouseEvent(span, 'click');
                    logger.success('Open AI Agents button clicked');
                    return true;
                }
            } else {
                logger.warning('Open AI Agents button not found');
                return false;
            }
        },

        // Retrieves the name of the currently active AI agent
        getActiveAgentName: function() {
            const activeAgentElement = document.querySelector(SELECTORS.currentAgentName);
            return activeAgentElement ? activeAgentElement.textContent.trim() : null;
        },

        // Finds and clicks the edit button for the active AI agent
        findAndClickEditButtonForActiveAgent: function() {
            const activeAgentName = this.getActiveAgentName();
            if (!activeAgentName) {
                logger.warning('Active agent name not found');
                return false;
            }

            const aiAgentBlocks = document.querySelectorAll(SELECTORS.aiAgentBlock);
            for (const block of aiAgentBlocks) {
                const titleElement = block.querySelector(SELECTORS.aiAgentTitle);
                if (titleElement && titleElement.textContent.trim() === activeAgentName) {
                    const editButtonIcon = block.querySelector(SELECTORS.aiAgentEditButton);
                    if (editButtonIcon && editButtonIcon.parentElement) {
                        utils.simulateMouseEvent(editButtonIcon.parentElement, 'click');
                        logger.success(`Edit button clicked for agent: ${activeAgentName}`);
                        return true;
                    }
                }
            }
            logger.warning(`Edit button not found for ${activeAgentName}`);
            return false;
        }
    };

    // ------------------------------
    // Shortcut Handlers
    // ------------------------------

const shortcutHandlers = {
    // Clicks the latest "Play" button in messages
    clickLatestPlayButton: function() {
        const playButtons = document.querySelectorAll(SELECTORS.latestPlayButton);
        if (playButtons.length > 0) {
            playButtons[playButtons.length - 1].click();
            logger.success("Clicked the latest play button");
        } else {
            logger.warning("No play buttons found");
        }
    },

    // Handles the Cmd+9 shortcut: Clicks the search button and interacts with AI agents
    handleCmd9: async function() {
        try {
            // Step 1: Click the search shortcut button
            const searchButton = document.querySelector(SELECTORS.searchShortcutButton);
            if (searchButton) {
                utils.simulateMouseEvent(searchButton, 'mouseover');
                utils.simulateMouseEvent(searchButton, 'mousedown');
                utils.simulateMouseEvent(searchButton, 'mouseup');
                utils.simulateMouseEvent(searchButton, 'click');
                logger.success('Search shortcut button clicked');
            } else {
                logger.warning('Search shortcut button not found');
                return;
            }

            // Step 2: Wait for any UI updates after clicking the search button
            await utils.delay(500); // Adjust delay as needed based on UI responsiveness

            // Step 3: Interact with AI agents
            if (aiAgentFunctions.findAndClickButton()) {
                await utils.delay(500); // Wait for AI Agents panel to open
                aiAgentFunctions.findAndClickEditButtonForActiveAgent();
            } else {
                logger.warning('Failed to open AI Agents panel');
            }
        } catch (error) {
            logger.error('Error in handleCmd9:', error);
        }
    }
};


    // ------------------------------
    // Keyboard Shortcuts Configuration
    // ------------------------------

const SHORTCUT_FUNCTIONS = {
    'clickLatestPlayButton': shortcutHandlers.clickLatestPlayButton,
    'handleCmd9': shortcutHandlers.handleCmd9 // Changed from handleCmd4 to handleCmd9
};


    // ------------------------------
    // Event Listeners
    // ------------------------------

    function attachEventListeners() {
        document.addEventListener('keydown', function(event) {
            const isMac = navigator.userAgentData
                ? navigator.userAgentData.platform.toLowerCase().includes('mac')
                : navigator.userAgent.toLowerCase().includes('mac');

            const modifierKey = isMac ? event.metaKey : event.ctrlKey;

            if (modifierKey && SHORTCUTS[event.key]) {
                event.preventDefault();
                const handlerKey = SHORTCUTS[event.key];
                const handlerFunction = SHORTCUT_FUNCTIONS[handlerKey];
                if (handlerFunction) {
                    handlerFunction(event);
                } else {
                    logger.warning(`No handler function found for key: ${event.key}`);
                }
            }
        });
    }


    // ------------------------------
    // Initialization Function
    // ------------------------------

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

        const modalObserver = new MutationObserver(utils.debounce(() => {
            uiInteractions.adjustModalSize();
        }, 200));
        modalObserver.observe(document.body, { childList: true, subtree: true });



        logger.success(`${SCRIPT_NAME} v${SCRIPT_VERSION} loaded successfully`);
    }

    // ------------------------------
    // Start the Script
    // ------------------------------

    init();

    // ------------------------------
    // Expose Functions for Debugging
    // ------------------------------

    if (DEBUG_MODE) {
        window.typingMindExt = {
            uiInteractions,
            aiAgentFunctions,
            shortcutHandlers,
            utils,
            logger,
            SELECTORS,
            SHORTCUTS
        };
    }

})();