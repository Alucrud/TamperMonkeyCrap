// ==UserScript==
// @name         Gemini - Select Pro - Ctrl+Enter to Send
// @namespace    http://tampermonkey.net/
// @version      1.23
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
    const NEW_CHAT_SELECTOR = '[aria-label="New chat"], [data-test-id="new-chat-button"]';
    const CHATBOX_SELECTOR = '.ql-editor';

    const MODE_SELECTORS = {
        '1': 'button[data-test-id="bard-mode-option-fast"]',
        '2': 'button[data-test-id="bard-mode-option-thinking"]',
        '3': 'button[data-test-id="bard-mode-option-pro"]'
    };

    let hasSwitched = false;
    let lastUrl = window.location.href;
    let isSwitching = false;

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
        pickerBtn.click();

        // Wait a moment for the overlay menu to inject into the DOM
        await new Promise(r => setTimeout(r, 150));

        try {
            const targetButton = await waitForElement(specificSelector);
            if (targetButton) {
                targetButton.click();
                hasSwitched = true;

                setTimeout(() => {
                    const chatbox = document.querySelector(CHATBOX_SELECTOR);
                    if (chatbox) chatbox.focus();
                }, 200);
            } else {
                document.body.click();
            }
        } catch (e) {
            document.body.click();
        }

        setTimeout(() => { isSwitching = false; }, 1000);
    }

    function waitForElement(selector, timeout = 1500) {
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
