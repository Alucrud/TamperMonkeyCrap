// ==UserScript==
// @name         Gemini - Select Pro - Ctrl+Enter to Send
// @namespace    http://tampermonkey.net/
// @version      1.24
// @description  Defaults to Pro on load/new chat, but allows manual switching. Enter will create a new line. Ctrl+Enter will send the message
// @author       Alucrud
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://gemini.google.com&size=16
// @updateURL    https://github.com/Alucrud/TamperMonkeyCrap/raw/main/pc/Gemini.user.js
// @match        https://gemini.google.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const TRIGGER_SELECTOR = '[aria-label="Open mode picker"]';
    const CHATBOX_SELECTOR = '.ql-editor';

    const MODE_SELECTORS = {
        '1': 'button[data-test-id="bard-mode-option-fast"]',
        '2': 'button[data-test-id="bard-mode-option-thinking"]',
        '3': 'button[data-test-id="bard-mode-option-pro"]'
    };

    let hasSwitched = false;
    let lastUrl = window.location.href;
    let isSwitching = false;
    let switchCooldown;

    const observer = new MutationObserver(() => {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            hasSwitched = false;
        }
        if (!isSwitching) checkStateAndSwitch();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('keydown', async (e) => {
        if (e.ctrlKey && ['1', '2', '3'].includes(e.key)) {
            e.preventDefault();
            e.stopPropagation();

            // The Lock: Prevent overlapping executions
            if (isSwitching) return;

            const pickerBtn = document.querySelector(TRIGGER_SELECTOR);
            if (pickerBtn) await performSwitch(pickerBtn, MODE_SELECTORS[e.key]);
        }
    }, true);

    async function checkStateAndSwitch() {
        const pickerBtn = document.querySelector(TRIGGER_SELECTOR);
        if (!pickerBtn || hasSwitched) return;

        const buttonText = pickerBtn.innerText || "";
        if (buttonText.includes("Pro") || buttonText.includes("Advanced")) {
            hasSwitched = true;
            return;
        }

        await performSwitch(pickerBtn, MODE_SELECTORS['3']);
    }

    async function performSwitch(pickerBtn, specificSelector) {
        isSwitching = true;
        clearTimeout(switchCooldown);

        // Only click if the menu isn't already open
        if (pickerBtn.getAttribute('aria-expanded') !== 'true') {
            pickerBtn.click();
        }

        await new Promise(r => setTimeout(r, 150));

        try {
            const targetButton = await waitForElement(specificSelector, 800);
            if (targetButton) {
                targetButton.click();
                hasSwitched = true;

                setTimeout(() => {
                    const chatbox = document.querySelector(CHATBOX_SELECTOR);
                    if (chatbox) chatbox.focus();
                }, 200);
            } else if (pickerBtn.getAttribute('aria-expanded') === 'true') {
                document.body.click(); // Cleanup if failed
            }
        } catch (e) {
            if (pickerBtn.getAttribute('aria-expanded') === 'true') {
                document.body.click();
            }
        }

        // Unlock the script faster
        switchCooldown = setTimeout(() => { isSwitching = false; }, 250);
    }

    function waitForElement(selector, timeout = 1000) {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(selector);
            if (el) return resolve(el);
            const obs = new MutationObserver(() => {
                const target = document.querySelector(selector);
                if (target) { obs.disconnect(); resolve(target); }
            });
            obs.observe(document.body, { childList: true, subtree: true });
            setTimeout(() => { obs.disconnect(); reject(null); }, timeout);
        });
    }
})();

// --- Original Enter Key Logic ---
document.addEventListener('keydown', function(e) {
    if (!e.isTrusted) return;
    if (e.target.tagName !== 'TEXTAREA' && !e.target.isContentEditable) return;

    if (e.key === 'Enter') {
        if (!e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();

            e.target.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
                bubbles: true, cancelable: true, ctrlKey: false, shiftKey: true
            }));
        } else if (e.ctrlKey) {
            e.stopPropagation();
            e.target.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
                bubbles: true, cancelable: true, ctrlKey: false, shiftKey: false
            }));
        }
    }
}, true);
