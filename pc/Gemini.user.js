// ==UserScript==
// @name         Gemini - Auto Flash - Ctrl 1,2,3,4 to Toggle Models - Ctrl+Enter to Send
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  Defaults to Flash on load/new chat, but allows manual switching. Enter will create a new line. Ctrl+Enter will send the message
// @author       Alucrud
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://gemini.google.com&size=16
// @updateURL    https://github.com/Alucrud/TamperMonkeyCrap/raw/main/pc/Gemini.user.js
// @match        https://gemini.google.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    let isAutoSelecting = false;

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

    function matchesModel(text, targetKey) {
        if (!text) return false;
        var str = text.toLowerCase();
        var target = targetKey.toLowerCase();

        if (target === 'flash') {
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

    async function ensureMenuOpen(pickerBtn) {
        if (pickerBtn.getAttribute('aria-expanded') !== 'true') {
            pickerBtn.click();
            var startTime = Date.now();
            while (pickerBtn.getAttribute('aria-expanded') !== 'true' && (Date.now() - startTime) < 1500) {
                await sleep(50);
            }
        }
        return await waitForElement('gem-menu[role="menu"], [data-test-id="gem-mode-menu"]', 3000);
    }

    async function executeSelection(targetText, defaultToExtended) {
        var pickerBtn = document.querySelector('button[data-test-id="bard-mode-menu-button"]');
        if (!pickerBtn) return;

        if (targetText === 'extended thinking') {
            await toggleExtendedThinkingDirectly(pickerBtn);
            focusChatbox();
            return;
        }

        var currentModelLabel = pickerBtn.querySelector('.picker-primary-text, [data-test-id="logo-pill-label-container"]');
        var currentText = currentModelLabel ? currentModelLabel.innerText : '';
        var isBaseModelActive = matchesModel(currentText, targetText);

        if (!isBaseModelActive) {
            var menuContainer = await ensureMenuOpen(pickerBtn);
            if (!menuContainer) return;

            var targetItem = await waitForMenuItem(menuContainer, 'gem-menu-item, [role="menuitem"]', targetText, 3000);
            if (targetItem) {
                targetItem.click();
                await waitForButtonTextToMatch(pickerBtn, targetText, 3000);
            }
        }

        if (defaultToExtended) {
            currentModelLabel = pickerBtn.querySelector('.picker-primary-text, [data-test-id="logo-pill-label-container"]');
            currentText = currentModelLabel ? currentModelLabel.innerText : '';

            if (!matchesModel(currentText, 'extend')) {
                var extendedMenuContainer = await ensureMenuOpen(pickerBtn);
                if (extendedMenuContainer) {
                    var extendedItem = await waitForMenuItem(extendedMenuContainer, 'gem-menu-item, [role="menuitem"], [role="menuitemcheckbox"]', 'extended thinking', 3000);
                    if (extendedItem) {
                        extendedItem.click();
                        await waitForButtonTextToMatch(pickerBtn, 'extend', 3000);
                    }
                }
            }
        }

        if (pickerBtn.getAttribute('aria-expanded') === 'true') {
            document.body.click();
            await waitForMenuClose(pickerBtn, 1000);
        }

        focusChatbox();
    }

    async function toggleExtendedThinkingDirectly(pickerBtn) {
        var menuContainer = await ensureMenuOpen(pickerBtn);
        if (!menuContainer) return;

        var extendedItem = await waitForMenuItem(menuContainer, 'gem-menu-item, [role="menuitem"], [role="menuitemcheckbox"]', 'extended thinking', 3000);
        if (extendedItem) {
            extendedItem.click();
            await sleep(150);
        }

        if (pickerBtn.getAttribute('aria-expanded') === 'true') {
            document.body.click();
            await waitForMenuClose(pickerBtn, 1000);
        }
    }

    function focusChatbox() {
        var retries = 8;
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
            }, 50);
        });
    }

    function waitForElement(selector, timeoutMs) {
        return new Promise(function(resolve) {
            var el = document.querySelector(selector);
            if (el) return resolve(el);

            var startTime = Date.now();
            var observer = new MutationObserver(function() {
                var element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                } else if (timeoutMs && (Date.now() - startTime) > timeoutMs) {
                    observer.disconnect();
                    resolve(null);
                }
            });
            observer.observe(document.body || document.documentElement, { childList: true, subtree: true });

            if (timeoutMs) {
                setTimeout(function() {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }, timeoutMs);
            }
        });
    }

    function waitForMenuItem(contextElement, selector, targetKey, timeoutMs) {
        return new Promise(function(resolve) {
            var startTime = Date.now();
            var checkInterval = setInterval(function() {
                var item = findElementByModelMatch(contextElement, selector, targetKey);
                if (item) {
                    clearInterval(checkInterval);
                    resolve(item);
                } else if ((Date.now() - startTime) > timeoutMs) {
                    clearInterval(checkInterval);
                    resolve(null);
                }
            }, 50);
        });
    }

    function waitForMenuClose(button, timeoutMs) {
        return new Promise(function(resolve) {
            var startTime = Date.now();
            var checkInterval = setInterval(function() {
                if (!button || button.getAttribute('aria-expanded') !== 'true' || (Date.now() - startTime) > timeoutMs) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 30);
        });
    }

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

    async function waitForTabToBeVisible() {
        if (!document.hidden) return;
        return new Promise(function(resolve) {
            function onVisibilityChange() {
                if (!document.hidden) {
                    document.removeEventListener('visibilitychange', onVisibilityChange);
                    resolve();
                }
            }
            document.addEventListener('visibilitychange', onVisibilityChange);
        });
    }

    async function initAutoModel() {
        if (isAutoSelecting) return;
        isAutoSelecting = true;

        try {
            // Pause execution if the tab was opened in the background until the user switches to it
            await waitForTabToBeVisible();

            // Wait up to 15s for cold start element rendering via MutationObserver
            var pickerBtn = await waitForElement('button[data-test-id="bard-mode-menu-button"]', 15000);
            if (!pickerBtn) return;

            // Retry up to 3 times to account for Angular hydration delays on cold start
            var attempts = 0;
            while (attempts < 3) {
                var label = pickerBtn.querySelector('.picker-primary-text, [data-test-id="logo-pill-label-container"]');
                var currentText = label ? label.innerText : '';

                if (matchesModel(currentText, 'flash') && matchesModel(currentText, 'extend')) {
                    break;
                }

                await executeSelection('flash', true);
                await sleep(300);

                label = pickerBtn.querySelector('.picker-primary-text, [data-test-id="logo-pill-label-container"]');
                currentText = label ? label.innerText : '';
                if (matchesModel(currentText, 'flash') && matchesModel(currentText, 'extend')) {
                    break;
                }
                attempts++;
            }
        } finally {
            isAutoSelecting = false;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAutoModel);
    } else {
        initAutoModel();
    }

    window.addEventListener('load', initAutoModel);

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

    // Enter Key Logic
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
