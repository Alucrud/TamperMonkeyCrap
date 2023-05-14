// ==UserScript==
// @name         Steam Cleaner
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Clean the front page of steam
// @author       Alucrud
// @match        https://store.steampowered.com/
// @match        https://store.steampowered.com/?*
// @icon         https://www.steam.com/favicon.ico
// @grant        GM_addStyle
// @updateURL    https://github.com/Alucrud/TamperMonkeyCrap/raw/main/pc/Steam.user.js
// ==/UserScript==

GM_addStyle ( `

/* Get rid of the takeover add at the top */
.fullscreen-bg {
    display: none;
}

.static_takeover_ctn {
    display: none;
}

.home_page_takeover_link {
    display: none;
}

/* Hide hardware ads */
.home_hardware_banner {
    display: none;
}

/* Hide "Browse by category" */
div:has(> .content_hub_carousel_ctn) {
    display: none;
}

/* Hide "Because you played..." */
#module_deep_dive {
    display: none;
}

/* Hide "Recently updated" */
.recently_updated_block {
    display: none;
}

/* Remove unnecessary padding */
.home_ctn {
    margin-top: 0px !important;
    margin-bottom: 15px !important;
}

#module_special_offers {
    height: 425px;
}

/*  */
` );
