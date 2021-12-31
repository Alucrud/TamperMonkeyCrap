// ==UserScript==
// @name         HyVee
// @namespace    https://github.com/Alucrud/TamperMonkeyCrap/
// @version      0.2
// @description  HyVee
// @author       Alucrud
// @match        https://www.hy-vee.com/*
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @grant        none
// @updateURL    https://github.com/Alucrud/TamperMonkeyCrap/raw/main/HyVee.user.js
// ==/UserScript==


function gtfo() {
    $("[data-testid*='ad-banner']").remove(); //removes banner ads
    $(".hyvee-footer").remove(); //remove footer
    $("[data-testid*='featured']").remove(); //removes banner ads
    $("div[class*='cart-shopping-suggestions']").remove(); //removes banner ads

    console.log('removed');
    //Repeat
    setTimeout(gtfo, 5000);
}

//Initial Run
setTimeout(function(){
    gtfo();
}, 3000);
