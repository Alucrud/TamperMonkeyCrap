// ==UserScript==
// @name        Beehaw - Remove Youtube Links
// @namespace   Violentmonkey Scripts
// @match       *://beehaw.org/*
// @grant       GM_addStyle
// @version     1.1
// @author      Alucrud
// @description Hides any submitted links that point to youtube.
// @updateURL   https://github.com/Alucrud/TamperMonkeyCrap/raw/main/mobile/Beehaw%20-%20Remove%20Youtube%20Links.user.js
// @icon        https://beehaw.org/favicon.ico
// ==/UserScript==


GM_addStyle ( `

/* Block any post that contains a topic with youtube links  */
.post-listing:has([href^="https://www.youtube.com/watch"]) {
  display: none;
}
.post-listing:has([href^="https://youtu.be/"]) {
  display: none;
}

/* Removes a horizontal line for formatting  */
.post-listing:has([href^="https://www.youtube.com/watch"]) + hr {
  display: none;
}
.post-listing:has([href^="https://youtu.be/"]) + hr {
  display: none;
}

` );
