// ==UserScript==
// @name         Bing Cleaner
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Bing is full of trash. Clean it up!
// @author       Alucrud
// @match        https://www.bing.com/search?*
// @icon         https://www.bing.com/favicon.ico
// @grant        GM_addStyle
// @updateURL    https://github.com/Alucrud/TamperMonkeyCrap/raw/main/pc/Bing.user.js
// ==/UserScript==

GM_addStyle ( `

/* Fix link colors for dark mode */
a {
    color: #5b8fcb !important;
}

/* Remove left side widget */
#textDeeplinksWidgetContainer{
    display:none;
}

/* Adjust results to fill the space with some margins for readability */
#b_content {
    padding-left: 0px;
    margin: auto;
    width: 85%;
}

/* Remove any extra search results sidebars */
#b_content > aside {
    display: none;
}

/* Resize results to fit without sidebars */
#b_results {
    display: block;
    width: auto;
}

/* Auto-size the top options bar */
#b_tween {
    width: auto;
}

/*  */
` );
