// ==UserScript==
// @name D2 Runewords - Close Nag
// @version 0.0.1
// @match https://d2runewords.com/*
// @grant none
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @noframes
// @run-at document-idle
// @updateURL https://raw.githubusercontent.com/Alucrud/TamperMonkeyCrap/main/mobile/D2%20Runewords%20-%20Close%20Nag.user.js
// ==/UserScript==

// #community-note .note
$("#community-note").remove();
