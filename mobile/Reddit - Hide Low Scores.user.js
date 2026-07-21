// ==UserScript==
// @name         Hide Low Score Reddit Posts
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Hides Reddit posts with a score less than 20.
// @match        *://*.reddit.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function hideLowScorePosts() {
        // Target modern Reddit (shreddit)
        var newPosts = document.querySelectorAll('shreddit-post');
        for (var i = 0; i < newPosts.length; i++) {
            var newScore = parseInt(newPosts[i].getAttribute('score'), 10);
            if (!isNaN(newScore) && newScore < 20) {
                newPosts[i].style.display = 'none';
            }
        }

        // Target old Reddit
        var oldPosts = document.querySelectorAll('.thing');
        for (var j = 0; j < oldPosts.length; j++) {
            var oldScore = parseInt(oldPosts[j].getAttribute('data-score'), 10);
            if (!isNaN(oldScore) && oldScore < 20) {
                oldPosts[j].style.display = 'none';
            }
        }
    }

    hideLowScorePosts();

    // Re-run when new posts load via infinite scrolling
    var observer = new MutationObserver(hideLowScorePosts);
    observer.observe(document.body, { childList: true, subtree: true });
})();
