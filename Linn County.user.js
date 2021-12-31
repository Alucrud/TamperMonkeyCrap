// ==UserScript==
// @name         Linn County
// @namespace    https://github.com/Alucrud/TamperMonkeyCrap/
// @version      0.2
// @description  Linn County
// @author       Alucrud
// @include      http*://www.linncountyiowa.gov*
// @include      http*://www.linncounty.org*
// @include      http*://www.linncounty-ia.gov*
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @grant        none
// @run-at       document-start
// @updateURL    https://github.com/Alucrud/TamperMonkeyCrap/raw/main/Linn%20County.user.js
// ==/UserScript==

// Returns a Promise that resolves after "ms" Milliseconds
const timer = ms => new Promise(res => setTimeout(res, ms))

async function load () { // We need to wrap the loop into an async function for this to work
  for (var i = 0; i < 1000; i++) {
      $("#1_divAlertBar").remove(); //remove the COVID ALERT bar

      //remove the top massive LINN COUNTY bar - Readjust paddings so the search is closer to the top
      $("#stickyStructuralContainer").hide(); //remove instead of hide breaks the sidebar menu in mobile
      $("#bodyWrapper").css('padding-top','0');
      $("#structuralContainer5").css('padding-top','33px');
      $("#structuralContainer5 > div").css('padding-top','10px');
      $("#structuralContainer5 > div").css('padding-bottom','10px');
      
      $("#contentContainer5b").remove(); //remove the scroll down arrow, which isn't needed if your website doesn't look like shit

      $("#structuralContainer6").remove(); //remove the vertical menu items

      //Deal with the giant circle menu -- MOBILE
      $(".widgetGraphicLinks .text").css('background-image','none');
      $(".widgetGraphicLinks .text").css('padding-top','15px');

      // Remove massive "Linn County News" banner and fix padding
      $("#structuralContainer16 .siteWrap2").remove();
      $("#structuralContainer16").css('padding-top','10px');
      $("#structuralContainer16").css('padding-bottom','10px');

      //fix giant (and useless) news images
      $(".widgetNewsFlash .media").css('height','50px');
      $(".widgetNewsFlash .media").css('width','100%');
      $(".widgetNewsFlash .media").css('object-fit','cover');
      $(".widgetNewsFlash .media").css('object-position','center');

      $("#structuralContainer7 span:contains('Social Media')").parents('#structuralContainer7').remove(); //remove social media stuff

      $("img[alt='Linn County Iowa']").remove() //Another giant linn county logo

      $("section.widgetQuickLinks:contains('Popular Links')").remove(); //how many fucking 'quick links' do you need!?

      //replace civicplus with dumb crap for fun
      $("a:contains('CivicPlus')").attr("href", "#");
      $("a:contains('CivicPlus')").text("I.P. Freely");

      $("#google-translate-container").remove(); //google translate (twice because what!?)

      //loop stuff
      if(i<11) //runs 10 times quick, then slows down
      {
          await timer(500); // then the created Promise can be awaited
      }
      else
      {
          await timer(2000); // then the created Promise can be awaited
      }
  }
}

load();
