// ==UserScript==
// @name        REMEMBER ME
// @namespace   https://github.com/Alucrud/TamperMonkeyCrap/
// @description Auto-check "remember me"
// @include     https://*
// @include     http://*
// @run-at      document-idle
// @grant       none
// @version     0.1
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @updateURL   :)
// ==/UserScript==

function clunk() {
    $("label:contains('Remember')").click();
}

const clunkTimer = setTimeout(clunk, 1000);
