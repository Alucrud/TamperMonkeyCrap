// ==UserScript==
// @name         Amazon to CamelCamelCamel Link + Synced Add to List
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Adds CamelCamelCamel link and synced Add to List button on Amazon product pages
// @match        https://www.amazon.com/dp/*
// @match        https://www.amazon.com/*/dp/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function getASIN() {
        const match = window.location.pathname.match(/\/dp\/([A-Z0-9]{10})/);
        return match ? match[1] : null;
    }

    function cloneAndBindButton(originalBtn) {
        const cloned = originalBtn.cloneNode(true);

        // Keep the button constrained to the screen width and allow text to wrap
        cloned.style.maxWidth = '100%';
        cloned.style.boxSizing = 'border-box';
        cloned.style.whiteSpace = 'normal';
        cloned.style.height = 'auto';

        // Forward clicks
        cloned.addEventListener('click', function(e) {
            e.preventDefault();
            originalBtn.click();
        });

        return cloned;
    }

    function insertUI(asin) {
        const wrapper = document.createElement('div');
        wrapper.id = 'camel-list-wrapper';
        wrapper.style.marginTop = '15px';
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.gap = '12px';
        // Prevent wrapper from pushing past the viewport
        wrapper.style.maxWidth = '100%';
        wrapper.style.overflow = 'hidden';

        const camelLink = document.createElement('a');
        camelLink.href = 'https://camelcamelcamel.com/product/' + asin;
        camelLink.textContent = 'View Price History on CamelCamelCamel';
        camelLink.style.color = '#B12704';
        camelLink.style.fontWeight = 'bold';
        camelLink.style.fontSize = '16px';
        camelLink.target = '_blank';

        const clonedBtnContainer = document.createElement('div');
        clonedBtnContainer.id = 'cloned-add-to-list-container';
        clonedBtnContainer.style.maxWidth = '100%';

        wrapper.appendChild(clonedBtnContainer);
        wrapper.appendChild(camelLink);

        const target = document.querySelector('#titleSection') || document.querySelector('#title') || document.body;
        if (target && target.parentNode) {
            target.parentNode.insertBefore(wrapper, target.nextSibling);
        }

        observeAndSyncButton(clonedBtnContainer);
    }

    function observeAndSyncButton(container) {
        const tryAttach = function() {
            const realBtn = document.querySelector('#add-to-wishlist-button-submit');
            if (!realBtn) return;

            container.innerHTML = ''; // Clear previous clone
            const cloned = cloneAndBindButton(realBtn);
            container.appendChild(cloned);
        };

        // Initial
        tryAttach();

        // Observe button parent for DOM replacement
        const realBtnNode = document.querySelector('#add-to-wishlist-button-submit');
        const parent = realBtnNode && realBtnNode.parentElement ? realBtnNode.parentElement.parentElement : null;
        if (!parent) return;

        const observer = new MutationObserver(tryAttach);
        observer.observe(parent, { childList: true, subtree: true });
    }

    // Wait for both title and add-to-list button to load
    const asin = getASIN();
    if (asin) {
        const interval = setInterval(function() {
            const btn = document.querySelector('#add-to-wishlist-button-submit');
            const title = document.querySelector('#title') || document.querySelector('#titleSection');
            if (btn && title) {
                clearInterval(interval);
                insertUI(asin);
            }
        }, 300);
    }
})();
