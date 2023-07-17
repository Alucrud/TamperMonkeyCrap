// ==UserScript==
// @name        Tildes - Remove Youtube Links
// @namespace   Violentmonkey Scripts
// @match       https://tildes.net/
// @grant       GM_addStyle
// @version     1.0
// @author      -
// @description 7/17/2023, 1:07:25 PM
// @updateURL   https://github.com/Alucrud/TamperMonkeyCrap/raw/main/pc/
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
