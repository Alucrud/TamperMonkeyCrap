// ==UserScript==
// @name         HyVee
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  HyVee
// @author       Alucrud
// @match        https://www.hy-vee.com/*
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @grant        none
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