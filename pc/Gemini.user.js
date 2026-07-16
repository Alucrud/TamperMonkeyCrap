// ==UserScript==
// @name         Gemini - Auto 3.5 Flash - Ctrl 1,2,3,4 to Toggle Models - Ctrl+Enter to Send
// @namespace    http://tampermonkey.net/
// @version      2
// @description  Defaults to 3.5 Flash on load/new chat, but allows manual switching. Enter will create a new line. Ctrl+Enter will send the message
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

                if (key === '1') executeSelection('lite', false);
                else if (key === '2') executeSelection('3.5 flash', false);
                else if (key === '3') executeSelection('pro', false);
                else if (key === '4') executeSelection('extended thinking', true);
            }
        }
    }, true);

    async function executeSelection(targetText, isToggleAction) {
        var pickerBtn = document.querySelector('button[data-test-id="bard-mode-menu-button"]');
        if (!pickerBtn) return;

        // Open the menu panel if closed
        if (pickerBtn.getAttribute('aria-expanded') !== 'true') {
            pickerBtn.click();
        }

        // Precision wait: dynamically loops until the element container exists (Max 1500ms timeout)
        var menuContainer = await waitForElement('gem-menu[role="menu"], [data-test-id="gem-mode-menu"]', 1500);
        if (!menuContainer) return;

        // Search for the specific item strictly confined to the interior of the menu panel
        var targetItem = findElementByTextWithin(menuContainer, 'gem-menu-item, [role="menuitem"]', targetText);
        if (targetItem) {
            targetItem.click();
        }

        // Brief programmatic cushion delay to let Angular register clicks before dismissal
        await sleep(150);

        // Safely dismiss menu structure if it remains present in active view state
        if (pickerBtn.getAttribute('aria-expanded') === 'true') {
            document.body.click();
        }

        // Return focus state control to primary chat element field
        setTimeout(function() {
            var chatbox = document.querySelector('.ql-editor, rich-textarea, textarea');
            if (chatbox) chatbox.focus();
        }, 100);
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
            }, 30); // Check every 30ms for maximum speed/responsiveness
        });
    }

    // Contextually-scoped element lookup engine
    function findElementByTextWithin(contextElement, selector, textContent) {
        var elements = contextElement.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++) {
            var currentElement = elements[i];
            if (currentElement.innerText && currentElement.innerText.toLowerCase().indexOf(textContent.toLowerCase()) !== -1) {
                return currentElement;
            }
        }
        return null;
    }

    function sleep(ms) {
        return new Promise(function(resolve) {
            setTimeout(resolve, ms);
        });
    }

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
