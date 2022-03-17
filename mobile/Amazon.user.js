// ==UserScript==
// @name         Amazon
// @namespace    https://github.com/Alucrud/TamperMonkeyCrap/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        https://*.amazon.com/*/dp/*
// @icon         https://www.google.com/s2/favicons?domain=amazon.com
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    document.getElementById("addToWeddingRegistry").remove(); //Add to wedding registry link
    document.getElementById("add-to-registry-link").remove(); //Add to registry & gifting link
    document.getElementById("sellYoursHere_feature_div").remove(); //Sell on amazon
    document.getElementById("product-image-gallery").remove(); //expanded image gallery on description page
    document.getElementById("valuePick_feature_div").remove(); //similar item to consider
    document.getElementById("vseVideoWidget_cardDeck").remove(); //Videos Related to this product
    document.getElementById("posts-feed-preview").remove(); //related posts
    document.getElementById("nav-ftr").remove(); //footer
    document.getElementById("issuancePriceblockAmabot_feature_div").remove(); //amazon store card
    document.getElementById("twisterPlusWW_feature_div").remove(); //enhance your purchase - warranty
    document.getElementById("productSupportInsideMOBB_feature_div").remove(); //product support
    // alert("hi!");


    //document.getElementsByClassName("celwidget").remove();
    //document.getElementById("similarities_feature_div").remove();
    //document.getElementById("sponsoredProducts_feature_div").remove();
    //document.getElementById("sims-mobile-consolidated-1_csm_instrumentation_wrapper").remove();
    //document.querySelectorAll("[id*=sponsored]");
})();
