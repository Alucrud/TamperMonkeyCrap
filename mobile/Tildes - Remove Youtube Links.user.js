// ==UserScript==
// @name        Tildes - Remove Youtube Links
// @namespace   Violentmonkey Scripts
// @match       *://tildes.net/*
// @grant       GM_addStyle
// @version     1.2
// @author      -
// @description Hides any submitted links that point to youtube.
// @updateURL   https://github.com/Alucrud/TamperMonkeyCrap/raw/main/mobile/Tildes%20-%20Remove%20Youtube%20Links.user.js
// @icon        https://tildes.net/favicon.ico
// ==/UserScript==


GM_addStyle ( `

/* Block any article that contains a topic with youtube links  */
article:has([href^="https://www.youtube.com/watch"]) {
  display: none;
}
article:has([href^="https://youtu.be/"]) {
  display: none;
}

` );
