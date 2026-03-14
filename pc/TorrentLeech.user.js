// ==UserScript==
// @name         Highlight Seeding ≥6 Days and Ratio > 1.00 - TorrentLeech
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Highlights torrents seeding 6 days or more and ratio > 1.00 on TorrentLeech
// @match        https://www.torrentleech.org/profile/*/seeding
// @grant        none
// @author       Alucrud
// @updateURL    https://github.com/Alucrud/TamperMonkeyCrap/raw/main/pc/TorrentLeech.user.js
// ==/UserScript==

(function() {
    'use strict';

    function parseDays(text) {
        const match = text.match(/(\d+)\s*d/);
        return match ? parseInt(match[1], 10) : 0;
    }

    const tds = Array.from(document.querySelectorAll("td"));

    for (const td of tds) {
        // Highlight seeding time ≥ 7 days
        if (/(\d+\s*d)/.test(td.textContent)) {
            const days = parseDays(td.textContent.trim());
            if (days >= 6) {
                td.style.backgroundColor = "rgba(144, 238, 144, 0.4)"; // light green
            }
        }

        // Highlight ratio > 1.00
        if (td.title === "Ratio") {
            const ratio = parseFloat(td.textContent.trim());
            if (!isNaN(ratio) && ratio > 1.00) {
                td.style.backgroundColor = "rgba(144, 238, 144, 0.4)"; // light green
            }
        }
    }
})();
