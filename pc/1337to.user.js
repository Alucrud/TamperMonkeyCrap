// ==UserScript==
// @name         1337x.to
// @namespace    https://github.com/Alucrud/TamperMonkeyCrap/
// @version      0.22
// @description  1337x.to
// @author       Alucrud
// @include      https://www.1337x.to/home/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @grant        none
// ==/UserScript==

// Returns a Promise that resolves after "ms" Milliseconds
const timer = ms => new Promise(res => setTimeout(res, ms))

async function load () { // We need to wrap the loop into an async function for this to work
  for (var i = 0; i < 1000; i++) {
      //$(".box-info").remove(); //remove network status box - This removes the torrent info window too
      $(".banner-box.movie").remove(); //remove scrolling movie torrents
      $("h3:contains('Most Popular Torrents this week')").closest("div").remove(); //remove top torrents
      $("a[title='Most Popular Foreign Movies This Week']").closest("div").remove(); //remove foreign movie torrents
      $("a[title='Most Popular Applications This Week']").closest("div").remove(); //remove application torrents
      $("a[title='Most Popular Music This Week']").closest("div").remove(); //remove Music torrents

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
