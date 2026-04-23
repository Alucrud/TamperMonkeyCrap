// ==UserScript==
// @name        TheWindowsClub Layout Cleaner
// @namespace   Violentmonkey Scripts
// @match       https://www.thewindowsclub.com/*
// @grant       none
// @version     1
// @description Removes sidebars, centers content, and limits max-width for readability.
// @run-at      document-start
// ==/UserScript==

(function() {
    'use strict';

    const customCSS = `
        .widget-area.sidebar-primary.sidebar,
        .a2a_vertical_style {
            display: none !important;
        }

        .content {
            width: 90% !important;
            max-width: 1000px !important;
            margin: 0 auto !important;
            float: none !important;
        }
    `;

    const injectStyles = () => {
        if (document.head) {
            const styleNode = document.createElement('style');
            styleNode.textContent = customCSS;
            document.head.appendChild(styleNode);
        } else {
            requestAnimationFrame(injectStyles);
        }
    };

    injectStyles();
})();
