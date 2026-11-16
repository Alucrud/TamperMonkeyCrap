// ==UserScript==
// @name         Gemini - Auto Model - Ctrl 1,2,3,4 to Toggle Models - Ctrl+Enter to Send
// @namespace    http://tampermonkey.net/
// @version      3.4.0
// @description  Defaults to configured model/thinking level on load. Uses native Ctrl+Shift+M for fast model switching. Enter = newline, Ctrl+Enter = send.
// @author       Alucrud
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://gemini.google.com&size=16
// @match        https://gemini.google.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // =========================================================================
    // CONFIGURATION: Update model names, aliases, and hotkeys here only
    // =========================================================================
    var CONFIG = {
        defaultModelKey: 'fast',
        defaultThinkingKey: 'medium',
        thinkingCycleHotkey: '4',
        thinkingCycleOrder: ['low', 'medium', 'high'],
        useNativeModelCycleShortcut: true, // Uses Ctrl+Shift+M to switch base models without opening the menu

        models: {
            lite: {
                hotkey: '1',
                keywords: ['lite'],
                exclude: []
            },
            fast: {
                hotkey: '2',
                keywords: ['hydrogen', 'flash'],
                exclude: ['lite']
            },
            pro: {
                hotkey: '3',
                keywords: ['pro', 'argon', 'carbon'],
                exclude: []
            }
        },

        thinkingLevels: {
            low: {
                keywords: ['low'],
                isHiddenOnButton: true
            },
            medium: {
                keywords: ['medium']
            },
            high: {
                keywords: ['high']
            }
        }
    };
    // =========================================================================

    var isBusy = false;
    var lastKnownThinkingKey = null;

    function matchesConfigEntry(text, entry) {
        if (!text || !entry || !entry.keywords) return false;
        var str = text.toLowerCase();

        if (entry.exclude && entry.exclude.length > 0) {
            for (var i = 0; i < entry.exclude.length; i++) {
                if (str.indexOf(entry.exclude[i].toLowerCase()) !== -1) {
                    return false;
                }
            }
        }

        for (var j = 0; j < entry.keywords.length; j++) {
            if (str.indexOf(entry.keywords[j].toLowerCase()) !== -1) {
                return true;
            }
        }

        return false;
    }

    function getActiveThinkingKey(buttonText) {
        var keys = Object.keys(CONFIG.thinkingLevels);
        var hiddenFallbackKey = null;

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var entry = CONFIG.thinkingLevels[key];
            if (entry.isHiddenOnButton) {
                hiddenFallbackKey = key;
            }
            if (matchesConfigEntry(buttonText, entry)) {
                lastKnownThinkingKey = key;
                return key;
            }
        }

        return hiddenFallbackKey || lastKnownThinkingKey;
    }

    function getModelKeyByHotkey(pressedKey) {
        var keys = Object.keys(CONFIG.models);
        for (var i = 0; i < keys.length; i++) {
            if (CONFIG.models[keys[i]].hotkey === pressedKey) {
                return keys[i];
            }
        }
        return null;
    }

    // Hotkey listener configuration
    document.addEventListener('keydown', function(e) {
        if (!e.isTrusted) return;
        if (!e.ctrlKey || e.altKey || e.shiftKey) return;

        var key = e.key;
        if (key === CONFIG.thinkingCycleHotkey) {
            e.preventDefault();
            e.stopPropagation();
            cycleThinkingLevel();
            return;
        }

        var matchedModelKey = getModelKeyByHotkey(key);
        if (matchedModelKey) {
            e.preventDefault();
            e.stopPropagation();
            executeSelection(matchedModelKey, CONFIG.defaultThinkingKey);
        }
    }, true);

    function getPickerButton() {
        return document.querySelector('button[data-test-id="bard-mode-menu-button"], button.input-area-switch, [data-test-id="logo-pill-label-container"]');
    }

    function getPickerLabelText(pickerBtn) {
        if (!pickerBtn) return '';
        var label = pickerBtn.querySelector('.picker-primary-text, [data-test-id="logo-pill-label-container"]') || pickerBtn;
        return label ? label.innerText.trim() : '';
    }

    function isMenuOpen(pickerBtn) {
        return (pickerBtn && pickerBtn.getAttribute('aria-expanded') === 'true') ||
               !!document.querySelector('gem-menu[role="menu"], [data-test-id="gem-mode-menu"], .mat-mdc-menu-panel');
    }

    async function ensureMenuOpen(pickerBtn) {
        if (!isMenuOpen(pickerBtn)) {
            pickerBtn.click();
            var startTime = Date.now();
            while (!isMenuOpen(pickerBtn) && (Date.now() - startTime) < 1500) {
                await sleep(40);
            }
        }
        return await waitForElement('gem-menu[role="menu"], [data-test-id="gem-mode-menu"], .mat-mdc-menu-panel', 2500);
    }

    async function closeMenuIfOpen(pickerBtn) {
        if (!isMenuOpen(pickerBtn)) return;

        // Dispatch Escape to cleanly close Angular Material / CDK overlay menus
        document.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Escape',
            code: 'Escape',
            keyCode: 27,
            which: 27,
            bubbles: true,
            cancelable: true
        }));

        await waitForMenuClose(pickerBtn, 800);

        // Fallback click if still open
        if (isMenuOpen(pickerBtn)) {
            var backdrop = document.querySelector('.cdk-overlay-backdrop');
            if (backdrop) {
                backdrop.click();
            } else {
                document.body.click();
            }
            await waitForMenuClose(pickerBtn, 600);
        }
    }

    // Dispatches Gemini's native Ctrl+Shift+M shortcut to cycle base models without opening the menu
    async function cycleModelViaNativeShortcut(pickerBtn, targetModelEntry) {
        var maxCycles = Object.keys(CONFIG.models).length + 1;

        for (var i = 0; i < maxCycles; i++) {
            var beforeText = getPickerLabelText(pickerBtn);
            if (matchesConfigEntry(beforeText, targetModelEntry)) {
                return true;
            }

            var target = document.activeElement || document.body;
            target.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'M',
                code: 'KeyM',
                keyCode: 77,
                which: 77,
                ctrlKey: true,
                shiftKey: true,
                bubbles: true,
                cancelable: true
            }));

            // Wait briefly for label text to change
            var startTime = Date.now();
            var changed = false;
            while ((Date.now() - startTime) < 500) {
                var nowText = getPickerLabelText(pickerBtn);
                if (nowText && nowText !== beforeText) {
                    changed = true;
                    break;
                }
                await sleep(30);
            }

            if (!changed) {
                // Native shortcut didn't trigger a change (e.g. focus context issue), fall back to menu click
                return false;
            }
        }

        return matchesConfigEntry(getPickerLabelText(pickerBtn), targetModelEntry);
    }

    async function setThinkingLevel(thinkingKey, pickerBtn) {
        var thinkingEntry = CONFIG.thinkingLevels[thinkingKey];
        if (!thinkingEntry) return false;

        var menuContainer = await ensureMenuOpen(pickerBtn);
        if (!menuContainer) return false;

        var targetItem = await waitForMenuItem(
            menuContainer,
            'gem-menu-item, [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], .mat-mdc-menu-item',
            thinkingEntry,
            2500
        );

        if (targetItem) {
            targetItem.click();
            lastKnownThinkingKey = thinkingKey;
            await sleep(120);
            return true;
        }
        return false;
    }

    async function cycleThinkingLevel() {
        if (isBusy) return;
        isBusy = true;

        try {
            var pickerBtn = getPickerButton();
            if (!pickerBtn) return;

            var currentText = getPickerLabelText(pickerBtn);
            var activeKey = getActiveThinkingKey(currentText);
            var order = CONFIG.thinkingCycleOrder;
            var currentIndex = activeKey ? order.indexOf(activeKey) : -1;

            var nextIndex = (currentIndex === -1) ? 0 : (currentIndex + 1) % order.length;
            var nextLevelKey = order[nextIndex];

            await setThinkingLevel(nextLevelKey, pickerBtn);
            await closeMenuIfOpen(pickerBtn);
            focusChatbox();
        } finally {
            isBusy = false;
        }
    }

    async function executeSelection(modelKey, thinkingKey) {
        if (isBusy) return;
        isBusy = true;

        try {
            var modelEntry = CONFIG.models[modelKey];
            if (!modelEntry) return;

            var pickerBtn = getPickerButton();
            if (!pickerBtn) return;

            var currentText = getPickerLabelText(pickerBtn);
            var isBaseModelActive = matchesConfigEntry(currentText, modelEntry);

            if (!isBaseModelActive) {
                var switchedViaShortcut = false;

                if (CONFIG.useNativeModelCycleShortcut && !isMenuOpen(pickerBtn)) {
                    switchedViaShortcut = await cycleModelViaNativeShortcut(pickerBtn, modelEntry);
                }

                if (!switchedViaShortcut) {
                    var menuContainer = await ensureMenuOpen(pickerBtn);
                    if (!menuContainer) return;

                    var targetItem = await waitForMenuItem(
                        menuContainer,
                        'gem-menu-item, [role="menuitem"], .mat-mdc-menu-item, [data-test-id^="bard-mode-option-"]',
                        modelEntry,
                        2500
                    );

                    if (targetItem) {
                        targetItem.click();
                        await waitForButtonTextToMatch(pickerBtn, modelEntry, 2500);
                    }
                }
            }

            if (thinkingKey && CONFIG.thinkingLevels[thinkingKey]) {
                currentText = getPickerLabelText(pickerBtn);
                if (getActiveThinkingKey(currentText) !== thinkingKey) {
                    await setThinkingLevel(thinkingKey, pickerBtn);
                }
            }

            await closeMenuIfOpen(pickerBtn);
            focusChatbox();
        } finally {
            isBusy = false;
        }
    }

    function focusChatbox() {
        var retries = 8;
        var checkInterval = setInterval(function() {
            var chatbox = document.querySelector('rich-textarea div.ql-editor.textarea[role="textbox"], rich-textarea .ql-editor');
            if (chatbox) {
                chatbox.focus();
                if (document.activeElement === chatbox) {
                    var sel = window.getSelection();
                    if (sel && typeof document.createRange !== 'undefined') {
                        var range = document.createRange();
                        var targetNode = chatbox.lastElementChild || chatbox;
                        range.selectNodeContents(targetNode);
                        range.collapse(false);
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

    function waitForButtonTextToMatch(button, configEntry, timeoutMs) {
        return new Promise(function(resolve) {
            var startTime = Date.now();
            var checkInterval = setInterval(function() {
                var currentText = getPickerLabelText(button);
                if (matchesConfigEntry(currentText, configEntry)) {
                    clearInterval(checkInterval);
                    resolve(true);
                } else if ((Date.now() - startTime) > timeoutMs) {
                    clearInterval(checkInterval);
                    resolve(false);
                }
            }, 40);
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

    function waitForMenuItem(contextElement, selector, configEntry, timeoutMs) {
        return new Promise(function(resolve) {
            var startTime = Date.now();
            var checkInterval = setInterval(function() {
                var item = findElementByConfigMatch(contextElement, selector, configEntry);
                if (item) {
                    clearInterval(checkInterval);
                    resolve(item);
                } else if ((Date.now() - startTime) > timeoutMs) {
                    clearInterval(checkInterval);
                    resolve(null);
                }
            }, 40);
        });
    }

    function waitForMenuClose(button, timeoutMs) {
        return new Promise(function(resolve) {
            var startTime = Date.now();
            var checkInterval = setInterval(function() {
                if (!isMenuOpen(button) || (Date.now() - startTime) > timeoutMs) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 30);
        });
    }

    function findElementByConfigMatch(contextElement, selector, configEntry) {
        var elements = contextElement.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++) {
            var currentElement = elements[i];
            if (currentElement.innerText && matchesConfigEntry(currentElement.innerText, configEntry)) {
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
        if (isBusy) return;

        await waitForTabToBeVisible();

        var pickerBtn = await waitForElement('button[data-test-id="bard-mode-menu-button"], button.input-area-switch, [data-test-id="logo-pill-label-container"]', 15000);
        if (!pickerBtn) return;

        var defaultModel = CONFIG.models[CONFIG.defaultModelKey];

        var attempts = 0;
        while (attempts < 3) {
            var currentText = getPickerLabelText(pickerBtn);

            if (matchesConfigEntry(currentText, defaultModel) && getActiveThinkingKey(currentText) === CONFIG.defaultThinkingKey) {
                break;
            }

            await executeSelection(CONFIG.defaultModelKey, CONFIG.defaultThinkingKey);
            await sleep(300);

            currentText = getPickerLabelText(pickerBtn);
            if (matchesConfigEntry(currentText, defaultModel) && getActiveThinkingKey(currentText) === CONFIG.defaultThinkingKey) {
                break;
            }
            attempts++;
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
                e.preventDefault();
                e.stopPropagation();

                var inputContainer = e.target.closest('.input-area-container, .bottom-container, [class*="input-area"]') ||
                                     document.querySelector('.input-area-container, .bottom-container, [class*="input-area"]');
                var root = inputContainer || document;

                var sendButton = root.querySelector(
                    'button[aria-label="Send message"], ' +
                    'button.send-button, ' +
                    '.send-button-container button, ' +
                    '[data-test-id="send-button"]'
                );

                if (sendButton && !sendButton.disabled) {
                    sendButton.click();
                }
            }
        }
    }, true);
})();
