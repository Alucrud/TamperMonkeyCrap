// ==UserScript==
// @name         Gemini - Auto Flash - Ctrl 1,2,3,4 to Toggle Models - Ctrl+Enter to Send
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Defaults to Flash on load/new chat, but allows manual switching. Enter will create a new line. Ctrl+Enter will send the message
// @author       Alucrud
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://gemini.google.com&size=16
// @updateURL    https://github.com/Alucrud/TamperMonkeyCrap/raw/main/pc/Gemini.user.js
// @match        https://gemini.google.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Hotkey listener configuration
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey) {
            var key = e.key;
            if (['1', '2', '3', '4'].includes(key)) {
                e.preventDefault();
                e.stopPropagation();

                if (key === '1') executeSelection('lite', true);
                else if (key === '2') executeSelection('flash', true);
                else if (key === '3') executeSelection('pro', true);
                else if (key === '4') executeSelection('extended thinking', false);
            }
        }
    }, true);

    // Dynamic model identification engine
    function matchesModel(text, targetKey) {
        if (!text) return false;
        var str = text.toLowerCase();
        var target = targetKey.toLowerCase();

        if (target === 'flash') {
            // Must contain "flash", but MUST NOT contain "lite"
            return str.indexOf('flash') !== -1 && str.indexOf('lite') === -1;
        }
        if (target === 'lite') {
            return str.indexOf('lite') !== -1;
        }
        if (target === 'pro') {
            return str.indexOf('pro') !== -1;
        }
        if (target === 'extended thinking' || target === 'extend') {
            return str.indexOf('extend') !== -1 || str.indexOf('thinking') !== -1;
        }

        return str.indexOf(target) !== -1;
    }

    async function executeSelection(targetText, defaultToExtended) {
        var pickerBtn = document.querySelector('button[data-test-id="bard-mode-menu-button"]');
        if (!pickerBtn) return;

        // Isolated handling for Ctrl+4 manual toggle switch
        if (targetText === 'extended thinking') {
            await toggleExtendedThinkingDirectly(pickerBtn);
            focusChatbox();
            return;
        }

        var currentModelLabel = pickerBtn.querySelector('.picker-primary-text, [data-test-id="logo-pill-label-container"]');
        var currentText = currentModelLabel ? currentModelLabel.innerText : '';
        var isBaseModelActive = matchesModel(currentText, targetText);

        // Step 1: Switch the base model if it isn't already active
        if (!isBaseModelActive) {
            if (pickerBtn.getAttribute('aria-expanded') !== 'true') {
                pickerBtn.click();
                await sleep(50);
            }

            var menuContainer = await waitForElement('gem-menu[role="menu"], [data-test-id="gem-mode-menu"]', 1500);
            if (!menuContainer) return;

            var targetItem = findElementByModelMatch(menuContainer, 'gem-menu-item, [role="menuitem"]', targetText);
            if (targetItem) {
                targetItem.click();
                // Wait until the UI button updates to reflect the new base model selection
                await waitForButtonTextToMatch(pickerBtn, targetText, 2000);
            }
        }

        // Step 2: Verify and enforce the Extended Thinking requirement
        if (defaultToExtended) {
            currentModelLabel = pickerBtn.querySelector('.picker-primary-text, [data-test-id="logo-pill-label-container"]');
            currentText = currentModelLabel ? currentModelLabel.innerText : '';

            // If the updated text does not contain "extend", open the menu and toggle it
            if (!matchesModel(currentText, 'extend')) {
                if (pickerBtn.getAttribute('aria-expanded') !== 'true') {
                    pickerBtn.click();
                    await sleep(100);
                }

                var extendedMenuContainer = await waitForElement('gem-menu[role="menu"], [data-test-id="gem-mode-menu"]', 1500);
                if (extendedMenuContainer) {
                    var extendedItem = findElementByModelMatch(extendedMenuContainer, 'gem-menu-item, [role="menuitem"], [role="menuitemcheckbox"]', 'extended thinking');
                    if (extendedItem) {
                        extendedItem.click();
                        // Wait until the main button reflects that extended thinking is active
                        await waitForButtonTextToMatch(pickerBtn, 'extend', 2000);
                    }
                }
            }
        }

        // Step 3: Clean up and dismiss menu layers
        if (pickerBtn.getAttribute('aria-expanded') === 'true') {
            document.body.click();
            await waitForMenuClose(pickerBtn, 1000);
        }

        focusChatbox();
    }

    async function toggleExtendedThinkingDirectly(pickerBtn) {
        if (pickerBtn.getAttribute('aria-expanded') !== 'true') {
            pickerBtn.click();
            await sleep(100);
        }
        var menuContainer = await waitForElement('gem-menu[role="menu"], [data-test-id="gem-mode-menu"]', 1500);
        if (!menuContainer) return;

        var extendedItem = findElementByModelMatch(menuContainer, 'gem-menu-item, [role="menuitem"], [role="menuitemcheckbox"]', 'extended thinking');
        if (extendedItem) {
            extendedItem.click();
            await sleep(150);
        }

        if (pickerBtn.getAttribute('aria-expanded') === 'true') {
            document.body.click();
            await waitForMenuClose(pickerBtn, 1000);
        }
    }

    // High-precision focus loop to counteract Angular framework focus-stealing lifecycles
    function focusChatbox() {
        var retries = 6;
        var checkInterval = setInterval(function() {
            var chatbox = document.querySelector('rich-textarea div.ql-editor.textarea[role="textbox"]');
            if (chatbox) {
                chatbox.focus();

                if (document.activeElement === chatbox) {
                    if (typeof window.getSelection !== 'undefined' && typeof document.createRange !== 'undefined') {
                        var range = document.createRange();
                        range.selectNodeContents(chatbox);
                        range.collapse(false);
                        var sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                    clearInterval(checkInterval);
                }
            }
            retries--;
            if (retries <= 0) {
                clearInterval(checkInterval);
            }
        }, 50);
    }

    // Polling engine to track model updates on the parent button label
    function waitForButtonTextToMatch(button, targetKey, timeoutMs) {
        return new Promise(function(resolve) {
            var startTime = Date.now();
            var checkInterval = setInterval(function() {
                var label = button.querySelector('.picker-primary-text, [data-test-id="logo-pill-label-container"]');
                var currentText = label ? label.innerText : '';
                if (matchesModel(currentText, targetKey)) {
                    clearInterval(checkInterval);
                    resolve(true);
                } else if ((Date.now() - startTime) > timeoutMs) {
                    clearInterval(checkInterval);
                    resolve(false);
                }
            }, 30);
        });
    }

    // Dynamic polling engine: replaces standard blind sleep delays
    function waitForElement(selector, timeoutMs) {
        return new Promise(function(resolve) {
            var startTime = Date.now();
            var checkInterval = setInterval(function() {
                var element = document.querySelector(selector);
                if (element) {
                    clearInterval(checkInterval);
                    resolve(element);
                } else if ((Date.now() - startTime) > timeoutMs) {
                    clearInterval(checkInterval);
                    resolve(null);
                }
            }, 30);
        });
    }

    // Block execution until the menu transition signals a full close state
    function waitForMenuClose(button, timeoutMs) {
        return new Promise(function(resolve) {
            var startTime = Date.now();
            var checkInterval = setInterval(function() {
                if (!button || button.getAttribute('aria-expanded') !== 'true' || (Date.now() - startTime) > timeoutMs) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 20);
        });
    }

    // Contextually-scoped element lookup engine using model matching rules
    function findElementByModelMatch(contextElement, selector, targetKey) {
        var elements = contextElement.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++) {
            var currentElement = elements[i];
            if (currentElement.innerText && matchesModel(currentElement.innerText, targetKey)) {
                return currentElement;
            }
        }
        return null;
    }

    var sleep = function(ms) {
        return new Promise(function(resolve) {
            setTimeout(resolve, ms);
        });
    };

    // --- Automated Initialization Engine ---
    async function initAutoModel() {
        var pickerBtn = await waitForElement('button[data-test-id="bard-mode-menu-button"]', 5000);
        if (pickerBtn) {
            // Buffer wait to allow Angular listeners/text hydration to complete
            await sleep(300);
            // Select Flash AND enforce Extended Thinking (second parameter = true)
            await executeSelection('flash', true);
        }
    }

    // Execute automation on core script load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAutoModel);
    } else {
        initAutoModel();
    }

    // Single Page Application (SPA) tracking to trigger automation on fresh chats
    var lastUrl = location.href;
    var urlObserver = new MutationObserver(function() {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            if (location.pathname === '/app' || location.pathname === '/app/') {
                initAutoModel();
            }
        }
    });
    urlObserver.observe(document, { subtree: true, childList: true });

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
})();
