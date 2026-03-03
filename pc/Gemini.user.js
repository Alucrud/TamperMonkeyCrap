// ==UserScript==
// @name         Gemini - Select Pro - Ctrl+Enter to Send
// @namespace    http://tampermonkey.net/
// @version      1.21
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

    // --- STATE MANAGEMENT ---
    let hasSwitched = false; // Prevents the script from fighting you
    let lastUrl = window.location.href;
    let isSwitching = false; // Prevents overlapping clicks

    // --- MAIN OBSERVER ---
    const observer = new MutationObserver((mutations) => {
        // 1. Check for URL changes (Navigation to new chat)
        if (window.location.href !== lastUrl) {
            console.log("Gemini Switcher: URL changed. Resetting switch state.");
            lastUrl = window.location.href;
            hasSwitched = false;
        }

        if (!isSwitching) checkStateAndSwitch();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // --- CLICK LISTENER (For "New Chat" resets without URL change) ---
    document.addEventListener('click', (e) => {
        // If user clicks "New Chat", force a reset of the switch state
        if (e.target.closest(NEW_CHAT_SELECTOR)) {
            console.log("Gemini Switcher: New Chat clicked. Resetting switch state.");
            setTimeout(() => { hasSwitched = false; }, 500); // Small delay to allow UI to reset first
        }
    }, true);

    // --- LOGIC ---
    async function checkStateAndSwitch() {
        const pickerBtn = document.querySelector(TRIGGER_SELECTOR);
        if (!pickerBtn) return;

        const buttonText = pickerBtn.innerText || "";
        const isPro = buttonText.includes("Pro") || buttonText.includes("Advanced");

        // STATE 1: We are already on Pro.
        // Mark as switched so we don't fight the user if they manually downgrade later.
        if (isPro) {
            if (!hasSwitched) {
                console.log("Gemini Switcher: Pro detected. Locking state.");
                hasSwitched = true;
            }
            return;
        }

        // STATE 2: We are on Fast/Gemini, and we haven't fixed it yet.
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
            } else {
                document.body.click(); // Close menu if button missing
            }
        } catch (e) {
            document.body.click(); // Close menu on timeout
        }

        // Add a delay before unlocking to ensure the UI text updates
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
    // Prevent infinite loops from our own dispatched events
    if (!e.isTrusted) return;

    // Only run inside text areas or chat boxes
    if (e.target.tagName !== 'TEXTAREA' && !e.target.isContentEditable) return;

    if (e.key === 'Enter') {
        if (!e.ctrlKey && !e.shiftKey) {
            // Stop the standard Enter
            e.preventDefault();
            e.stopPropagation();
            
            // Dispatch a fake Shift + Enter
            e.target.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
                bubbles: true, cancelable: true, ctrlKey: false, shiftKey: true
            }));
        } else if (e.ctrlKey) {
            // Ctrl + Enter: Hide the Ctrl modifier and trigger a standard Enter press
            e.stopPropagation();
            e.target.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
                bubbles: true, cancelable: true, ctrlKey: false, shiftKey: false
            }));
        }
    }
}, true);
