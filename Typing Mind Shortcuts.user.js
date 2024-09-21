// ==UserScript==
// @name         Typing Mind Shortcuts
// @version      2.9
// @description  Shortcuts including ESC for stop/cancel button, option+down for model selection, Cmd+1-5 for various tabs and actions, with modal and settings exceptions for ESC key.
// @author       asgeirtj
// @match        https://www.typingmind.com/*
// @grant        GM_info
// @tag          typingmind
// @icon         https://www.typingmind.com/favicon.ico
// ==/UserScript==

// IMPORTANT: When providing updates to this script, always increment the version number in the metadata block above.

(function() {
    'use strict';

    const SCRIPT_NAME = GM_info.script.name;
    const SCRIPT_VERSION = GM_info.script.version;


    const keyBindings = {
        'cmd+1': 'workspace-tab-chat',
        'cmd+2': 'workspace-tab-agents',
        'cmd+3': 'workspace-tab-plugins',
        'cmd+4': 'workspace-tab-models',
        'cmd+5': 'workspace-profile-button',
        'cmd+,': 'workspace-tab-settings',
        'f5': 'workspace-tab-plugins',
        'alt+arrowdown': 'model-selector'
    };

    function simulateClick(elementId) {
        let element;
        if (elementId === 'model-selector') {
            element = document.querySelector('button.inline-flex.items-center.justify-center.gap-2.p-2.rounded-md') ||
                      document.querySelector('div[data-element-id="current-model-selector"] button:first-child');
        } else {
            element = document.querySelector(`[data-element-id="${elementId}"]`) || document.getElementById(elementId);
        }

        if (element) {
            element.click();
        }
    }

    function isModalActive() {
        const modal = document.querySelector('div[data-element-id="pop-up-modal"]');
        return modal && modal.offsetParent !== null;
    }

    function isSettingsMenuActive() {
        const settingsMenu = document.querySelector('div[data-element-id="nav-container"]');
        return settingsMenu && settingsMenu.offsetParent !== null;
    }

    function handleEscKey() {
        if (isModalActive() || isSettingsMenuActive()) {
            return false;
        }

        const stopButton = [...document.querySelectorAll('button')].find(btn => btn.textContent.trim().toLowerCase() === 'stop');
        if (stopButton) {
            stopButton.click();
            return true;
        }

        const cancelButton = [...document.querySelectorAll('button')].find(btn =>
            btn.textContent.trim().toLowerCase() === 'cancel' &&
            !btn.classList.contains('bg-red-500')
        );
        if (cancelButton) {
            cancelButton.click();
            return true;
        }

        return false;
    }

    function handleCmd5() {
        simulateClick('workspace-profile-button');
        setTimeout(() => {
            const manageCloudSyncButton = [...document.querySelectorAll('button')].find(btn => btn.textContent.trim() === 'Manage Cloud Sync');
            if (manageCloudSyncButton) {
                manageCloudSyncButton.click();
            }
        }, 500);
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            if (handleEscKey()) {
                event.preventDefault();
            }
            return;
        }

        const key = (event.altKey ? 'alt+' : '') + (event.metaKey ? 'cmd+' : '') + (event.ctrlKey ? 'ctrl+' : '') + (event.shiftKey ? 'shift+' : '') + event.key.toLowerCase();

        if (keyBindings[key]) {
            event.preventDefault();
            if (key === 'cmd+5') {
                handleCmd5();
            } else {
                simulateClick(keyBindings[key]);
            }
        }
    });

    const hotkeyInfo = Object.entries(keyBindings).map(([key, action]) => `${key}: ${action}`).join('\n');
    const escInfo = 'ESC: stop/cancel button (with modal and settings exceptions)';

    console.log(`%c[SUCCESS] ${SCRIPT_NAME} v${SCRIPT_VERSION} loaded successfully\n\nHotkeys:\n${escInfo}\n${hotkeyInfo}`, 'color: #2ecc71');
})();