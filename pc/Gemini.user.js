// ==UserScript==
// @name         Gemini - Auto Flash - Ctrl 1,2,3,4 to Toggle Models - Ctrl+Enter to Send
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Defaults to Flash with Medium thinking on load/new chat. Enter creates a new line. Ctrl+Enter sends.
// @author       Alucrud
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://gemini.google.com&size=16
// @updateURL    https://github.com/Alucrud/TamperMonkeyCrap/raw/main/pc/Gemini.user.js
// @match        https://gemini.google.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

/* jshint esversion: 11 */

(function() {
    'use strict';

    let isAutoSelecting = false;
    const DEFAULT_THINKING_LEVEL = 'medium';

    // Hotkey listener configuration
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey) {
            var key = e.key;
            if (['1', '2', '3', '4'].includes(key)) {
                e.preventDefault();
                e.stopPropagation();

                if (key === '1') executeSelection('lite', DEFAULT_THINKING_LEVEL);
                else if (key === '2') executeSelection('flash', DEFAULT_THINKING_LEVEL);
                else if (key === '3') executeSelection('pro', DEFAULT_THINKING_LEVEL);
                else if (key === '4') cycleThinkingLevel();
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
        if (['low', 'medium', 'high'].includes(target)) {
            return str.indexOf(target) !== -1;
        }

        return str.indexOf(target) !== -1;
    }

    function getPickerButton() {
        return document.querySelector('button[data-test-id="bard-mode-menu-button"], button.input-area-switch, [data-test-id="logo-pill-label-container"]');
    }

    async function ensureMenuOpen(pickerBtn) {
        if (pickerBtn.getAttribute('aria-expanded') !== 'true') {
            pickerBtn.click();
            var startTime = Date.now();
            while (pickerBtn.getAttribute('aria-expanded') !== 'true' && (Date.now() - startTime) < 1500) {
                await sleep(50);
            }
        }
        return await waitForElement('gem-menu[role="menu"], [data-test-id="gem-mode-menu"], .mat-mdc-menu-panel', 3000);
    }

    async function closeMenuIfOpen(pickerBtn) {
        if (pickerBtn && pickerBtn.getAttribute('aria-expanded') === 'true') {
            document.body.click();
            await waitForMenuClose(pickerBtn, 1000);
        }
    }

    async function setThinkingLevel(targetLevel, pickerBtn) {
        if (!targetLevel) return;
        var menuContainer = await ensureMenuOpen(pickerBtn);
        if (!menuContainer) return;

        var targetItem = await waitForMenuItem(
            menuContainer,
            'gem-menu-item, [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], .mat-mdc-menu-item',
            targetLevel,
            3000
        );

        if (targetItem) {
            targetItem.click();
            await sleep(150);
        }
    }

    async function cycleThinkingLevel() {
        var pickerBtn = getPickerButton();
        if (!pickerBtn) return;

        var currentLabel = pickerBtn.querySelector('.picker-primary-text, [data-test-id="logo-pill-label-container"]') || pickerBtn;
        var currentText = currentLabel ? currentLabel.innerText.toLowerCase() : '';

        // Cycle: Low -> Medium -> High -> Low
        var nextLevel = 'medium';
        if (currentText.indexOf('low') !== -1) {
            nextLevel = 'medium';
        } else if (currentText.indexOf('medium') !== -1) {
            nextLevel = 'high';
        } else if (currentText.indexOf('high') !== -1) {
            nextLevel = 'low';
        }

        await setThinkingLevel(nextLevel, pickerBtn);
        await closeMenuIfOpen(pickerBtn);
        focusChatbox();
    }

    async function executeSelection(targetModel, targetThinkingLevel) {
        var pickerBtn = getPickerButton();
        if (!pickerBtn) return;

        var currentModelLabel = pickerBtn.querySelector('.picker-primary-text, [data-test-id="logo-pill-label-container"]') || pickerBtn;
        var currentText = currentModelLabel ? currentModelLabel.innerText : '';
        var isBaseModelActive = matchesModel(currentText, targetModel);

        if (!isBaseModelActive) {
            var menuContainer = await ensureMenuOpen(pickerBtn);
            if (!menuContainer) return;

            var targetItem = await waitForMenuItem(
                menuContainer,
                'gem-menu-item, [role="menuitem"], .mat-mdc-menu-item, [data-test-id^="bard-mode-option-"]',
                targetModel,
                3000
            );

            if (targetItem) {
                targetItem.click();
                await waitForButtonTextToMatch(pickerBtn, targetModel, 3000);
            }
        }

        if (targetThinkingLevel) {
            currentModelLabel = pickerBtn.querySelector('.picker-primary-text, [data-test-id="logo-pill-label-container"]') || pickerBtn;
            currentText = currentModelLabel ? currentModelLabel.innerText : '';

            if (!matchesModel(currentText, targetThinkingLevel)) {
                await setThinkingLevel(targetThinkingLevel, pickerBtn);
            }
        }

        await closeMenuIfOpen(pickerBtn);
        focusChatbox();
    }

    function focusChatbox() {
        var retries = 8;
        var checkInterval = setInterval(function() {
            var chatbox = document.querySelector('rich-textarea div.ql-editor.textarea[role="textbox"], rich-textarea .ql-editor');
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
                var label = button.querySelector('.picker-primary-text, [data-test-id="logo-pill-label-container"]') || button;
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
            await waitForTabToBeVisible();

            var pickerBtn = await waitForElement('button[data-test-id="bard-mode-menu-button"], button.input-area-switch, [data-test-id="logo-pill-label-container"]', 15000);
            if (!pickerBtn) return;

            var attempts = 0;
            while (attempts < 3) {
                var label = pickerBtn.querySelector('.picker-primary-text, [data-test-id="logo-pill-label-container"]') || pickerBtn;
                var currentText = label ? label.innerText : '';

                if (matchesModel(currentText, 'flash') && matchesModel(currentText, DEFAULT_THINKING_LEVEL)) {
                    break;
                }

                await executeSelection('flash', DEFAULT_THINKING_LEVEL);
                await sleep(300);

                label = pickerBtn.querySelector('.picker-primary-text, [data-test-id="logo-pill-label-container"]') || pickerBtn;
                currentText = label ? label.innerText : '';
                if (matchesModel(currentText, 'flash') && matchesModel(currentText, DEFAULT_THINKING_LEVEL)) {
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
