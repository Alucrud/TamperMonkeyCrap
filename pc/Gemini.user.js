// ==UserScript==
// @name         Gemini - Select Pro - Ctrl+Enter to Send
// @namespace    http://tampermonkey.net/
// @version      1.22
// @description  Defaults to Pro on load/new chat, but allows manual switching. Enter will create a new line. Ctrl+Enter will send the message
// @author       Alucrud
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://gemini.google.com&size=16
// @updateURL    https://github.com/Alucrud/TamperMonkeyCrap/raw/main/pc/Gemini.user.js
// @match        https://gemini.google.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- CONFIGURATION ---
    const TRIGGER_SELECTOR = '[aria-label="Open mode picker"]';
    const PRO_BUTTON_SELECTOR = 'button[data-test-id="bard-mode-option-pro"]';
    const NEW_CHAT_SELECTOR = '[aria-label="New chat"], [data-test-id="new-chat-button"]';
    const CHATBOX_SELECTOR = '.ql-editor';

    // --- STATE MANAGEMENT ---
    let hasSwitched = false;
    let lastUrl = window.location.href;
    let isSwitching = false;

    // --- MAIN OBSERVER ---
    const observer = new MutationObserver((mutations) => {
        if (window.location.href !== lastUrl) {
            console.log("Gemini Switcher: URL changed. Resetting switch state.");
            lastUrl = window.location.href;
            hasSwitched = false;
        }

        if (!isSwitching) checkStateAndSwitch();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // --- CLICK LISTENER ---
    document.addEventListener('click', (e) => {
        if (e.target.closest(NEW_CHAT_SELECTOR)) {
            console.log("Gemini Switcher: New Chat clicked. Resetting switch state.");
            setTimeout(() => { hasSwitched = false; }, 500);
        }
    }, true);

    // --- LOGIC ---
    async function checkStateAndSwitch() {
        const pickerBtn = document.querySelector(TRIGGER_SELECTOR);
        if (!pickerBtn) return;

        const buttonText = pickerBtn.innerText || "";
        const isPro = buttonText.includes("Pro") || buttonText.includes("Advanced");

        if (isPro) {
            if (!hasSwitched) {
                console.log("Gemini Switcher: Pro detected. Locking state.");
                hasSwitched = true;
            }
            return;
        }

        if (!isPro && !hasSwitched) {
            console.log("Gemini Switcher: Defaulting to Pro...");
            await performSwitch(pickerBtn);
        }
    }

    async function performSwitch(pickerBtn) {
        isSwitching = true;
        pickerBtn.click(); // Open Menu

        try {
            const proButton = await waitForElement(PRO_BUTTON_SELECTOR);
            if (proButton) {
                proButton.click();
                console.log("Gemini Switcher: Switched to Pro.");

                // Focus the chatbox shortly after clicking Pro
                setTimeout(() => {
                    const chatbox = document.querySelector(CHATBOX_SELECTOR);
                    if (chatbox) chatbox.focus();
                }, 150);

            } else {
                document.body.click();
            }
        } catch (e) {
            document.body.click();
        }

        setTimeout(() => { isSwitching = false; }, 1000);
    }

    function waitForElement(selector, timeout = 2000) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(selector)) return resolve(document.querySelector(selector));
            const obs = new MutationObserver(() => {
                const el = document.querySelector(selector);
                if (el) { obs.disconnect(); resolve(el); }
            });
            obs.observe(document.body, { childList: true, subtree: true });
            setTimeout(() => { obs.disconnect(); reject(null); }, timeout);
        });
    }
})();

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
