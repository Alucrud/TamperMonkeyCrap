// ==UserScript==
// @name Open Imgur Links in New Tab
// @version 0.0.1
// @include *://*imgur*/*
// @grant none
// @require http://code.jquery.com/jquery-3.4.1.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @noframes
// @run-at document-idle
// ==/UserScript==


function newTab (jNode) {
    //***** YOUR CODE HERE *****
    jNode.attr('target', '_blank');
}

waitForKeyElements ("a", newTab);
