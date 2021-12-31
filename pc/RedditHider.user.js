// ==UserScript==
// @name         Reddit Hider
// @namespace    https://github.com/Alucrud/TamperMonkeyCrap/
// @version      0.2
// @description  Hides stuff on Reddit
// @author       Mark Wilson
// @match        *.reddit.com/*
// @grant        none
// @updateURL    https://github.com/Alucrud/TamperMonkeyCrap/raw/main/pc/RedditHider.user.js
// ==/UserScript==

// de-linkify domains

$('.domain').find("a").each(function(){
    $(this).removeAttr("href");
});

// Hide crap

$('.goldvertisement').remove();
// $(".tabmenu li:nth-child(6)").remove();
$('.giftgold.allminus-link').remove();
$('.sidebox.create').remove();
$('.gilded-link').remove();
$('.give-gold-button').remove();
$(".login-required:after").remove();

// Resize content area

$('.content').width("98%");
$('#siteTable').css("margin-right", "auto");
$(".commentarea > .sitetable > .comment").attr('style','margin-right:2px !important');
$(".commentarea").attr('style','margin-right:2px !important');
$('.comment > .child').attr('style','margin-left:0px')

// Side-bar auto-hide

$(".side > .spacer").children().hide();
$('#search').hide();
$('.side').width(40);

$('.side').mouseleave(function(){
    $(".side > .spacer").children().hide();
    $('#search').hide();
    $('.side').width(40);
});

$('.side').mouseover(function(){
    $(this).width(300);
    $('#search').show();
    $(".side > .spacer").children().show();
});
