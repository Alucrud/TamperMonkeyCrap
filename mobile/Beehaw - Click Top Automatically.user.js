// ==UserScript==
// @name        Beehaw - Click 'Top' Automatically
// @namespace   Violentmonkey Scripts
// @match       *://beehaw.org/post/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @version     1.1
// @author      Alucrud
// @description When opening a post, click "top" automatically
// @updateURL   https://github.com/Alucrud/TamperMonkeyCrap/raw/main/mobile/Beehaw%20-%20Click%20Top%20Automatically.user.js
// @icon        https://beehaw.org/favicon.ico
// ==/UserScript==

function clicky () {
  document.querySelectorAll("input[value='Top']").forEach(el=>el.click());
}

waitForKeyElements (".comments", clicky);
