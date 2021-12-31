// ==UserScript==
// @name         Boardgame Geek
// @namespace    https://github.com/Alucrud/TamperMonkeyCrap/
// @version      0.2
// @description  BGG
// @author       Alucrud
// @include      https://boardgamegeek.com/*
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @grant        none
// @updateURL    https://github.com/Alucrud/TamperMonkeyCrap/raw/main/mobile/BoardGameGeek.user.js
// ==/UserScript==

// Returns a Promise that resolves after "ms" Milliseconds
const timer = ms => new Promise(res => setTimeout(res, ms))

async function load () { // We need to wrap the loop into an async function for this to work
  for (var i = 0; i < 1000; i++) {
      $(".support-drive").remove(); //remove support drive crap
      $(".game-header-title-summary").remove(); //remove ratings / comments
      $(".game-header-secondary-actions").remove(); //remove settings / share
      $(".credits").remove(); //remove credits
      $(".game-classification").css("height", "80px"); //resize game classification panel
      $(".game-description-classification.well.ng-scope").css("overflow", "auto"); //scrollable game classification panel
      $(".game-description-ad").remove(); //remove side ad
      $(".toolbar-actions").remove(); //remove buy/collect/log/like/subscribe
      $(".promoted-row").remove(); //remove gamenight/geek tv ads
      $(".game-awards").remove(); //remove game awards list
      $(".fs-responsive-sm").remove(); //remove additional suggestions / community stats
      $("a[ui-sref='geekitem.marketplace']").closest("div").parent().remove(); //remove 'buy a copy'
      $("a[ui-sref='geekitem.forums']").closest("div").parent().remove(); //remove forums posts
      $("a[ui-sref='geekitem.files']").closest("div").parent().remove(); //remove files (bottom)
      $("a:contains('Community Wiki')").closest("div").parent().remove(); //remove community wiki
      $("h3:contains('More of This Game')").closest(".row").remove(); //remove bottom "more of this game" and "news & links"
      $("h4:contains('GeekLists with This Game')").closest(".panel").remove(); //remove geeklists with this game


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
