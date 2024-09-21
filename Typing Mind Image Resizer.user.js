// ==UserScript==
// @name         Typing Mind Image Resizer
// @namespace    typingmind.com
// @version      1.1.0
// @description  Automatically resizes the main image in Typing Mind's chat interface, detecting page changes even without URL modifications.
// @author       asgeirtj
// @match        https://www.typingmind.com/*
// @grant        GM_info
// @grant        GM_setValue
// @grant        GM_getValue
// @icon         https://www.typingmind.com/favicon.ico
// @tag          typingmind
// ==/UserScript==

// IMPORTANT: When providing updates to this script, always increment the version number in the metadata block above.

(function() {
    'use strict';

    // ------------------------------
    // Constants and Configuration
    // ------------------------------

    const SCRIPT_VERSION = GM_info.script.version;
    const SCRIPT_NAME = GM_info.script.name;
    const DEBUG_MODE = true; // Set to false in production

    // CSS Selectors
    const SELECTORS = {
        imageContainer: '.flex.items-center.justify-center.gap-4.flex-col',
        mainImage: '[data-element-id="current-character-avatar"]'
    };

    // Resize Configuration
    const RESIZE_CONFIG = {
        removeClasses: ['w-9', 'h-9', 'w-32', 'h-32'],
        addClasses: ['w-41', 'h-41', 'rounded-lg']
    };

    // Retry Configuration
    const RETRY_CONFIG = {
        maxAttempts: 5,
        delayMs: 500
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
        /**
         * Debounce function to limit the rate at which a function can fire.
         * @param {Function} func - The function to debounce.
         * @param {number} wait - The debounce delay in milliseconds.
         * @returns {Function}
         */
        debounce: function(func, wait) {
            let timeout;
            return function(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func.apply(this, args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /**
         * Waits for a DOM element matching the selector to appear within a timeout.
         * @param {string} selector - CSS selector of the target element.
         * @param {number} timeout - Maximum wait time in milliseconds.
         * @returns {Promise<Element>}
         */
        waitForElement: function(selector, timeout = 10000) {
            return new Promise((resolve, reject) => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                    return;
                }

                const observer = new MutationObserver((mutations, obs) => {
                    const el = document.querySelector(selector);
                    if (el) {
                        resolve(el);
                        obs.disconnect();
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });

                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Element not found within timeout: ${selector}`));
                }, timeout);
            });
        },

        /**
         * Applies resizing to the main image by modifying its classes.
         * @param {Element} image - The main image element to resize.
         */
        applyResize: function(image) {
            if (!image) {
                return;
            }

            // Remove existing size classes
            RESIZE_CONFIG.removeClasses.forEach(cls => image.classList.remove(cls));

            // Add desired size and styling classes
            RESIZE_CONFIG.addClasses.forEach(cls => image.classList.add(cls));
        }
    };

    // ------------------------------
    // Image Resizing Logic
    // ------------------------------

    /**
     * Attempts to resize the main image with retry logic.
     * @param {number} attempts - Current attempt count.
     */
    function resizeMainImage(attempts = 0) {
        try {
            const container = document.querySelector(SELECTORS.imageContainer);
            if (container) {
                const image = container.querySelector(SELECTORS.mainImage);
                if (image) {
                    utils.applyResize(image);
                } else {
                    if (attempts < RETRY_CONFIG.maxAttempts) {
                        setTimeout(() => resizeMainImage(attempts + 1), RETRY_CONFIG.delayMs);
                    }
                }
            } else {
                if (attempts < RETRY_CONFIG.maxAttempts) {
                    setTimeout(() => resizeMainImage(attempts + 1), RETRY_CONFIG.delayMs);
                }
            }
        } catch (error) {
            logger.error('Error resizing main image:', error);
        }
    }

    // ------------------------------
    // Mutation Observers for SPA Navigation
    // ------------------------------

    /**
     * Observes DOM mutations to detect page changes in a Single Page Application (SPA).
     */
    function observePageChanges() {
        const observer = new MutationObserver(utils.debounce(() => {
            // Check if the image container exists and resize the image
            const container = document.querySelector(SELECTORS.imageContainer);
            if (container) {
                resizeMainImage();
            }
        }, 500));

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // ------------------------------
    // Initialization Function
    // ------------------------------

    function init() {
        // Initial resize on page load
        window.addEventListener('load', () => {
            setTimeout(resizeMainImage, 1000); // Initial delay to allow content to load
        });

        // Set up MutationObserver to detect SPA navigation
        observePageChanges();
    }

    // ------------------------------
    // Start the Script
    // ------------------------------

    init();

    // ------------------------------
    // Log Success Message
    // ------------------------------

    const scriptInfo = `
    - Automatically resizes the main image in Typing Mind's chat interface
    - Detects page changes even without URL modifications using MutationObserver
    - Applies the following changes to the main image:
      * Removes classes: ${RESIZE_CONFIG.removeClasses.join(', ')}
      * Adds classes: ${RESIZE_CONFIG.addClasses.join(', ')}
    - Uses retry logic with ${RETRY_CONFIG.maxAttempts} attempts and ${RETRY_CONFIG.delayMs}ms delay
    - Targets elements:
      * Image container: ${SELECTORS.imageContainer}
      * Main image: ${SELECTORS.mainImage}
    - Debug mode: ${DEBUG_MODE ? 'Enabled' : 'Disabled'}
    `;

    logger.success(`${SCRIPT_NAME} v${SCRIPT_VERSION} loaded successfully\n\nScript functionality:${scriptInfo}`);

    // ------------------------------
    // Expose Functions for Debugging
    // ------------------------------

    if (DEBUG_MODE) {
        window.typingMindImageResizer = {
            resizeMainImage,
            utils,
            SELECTORS
        };
    }

})();