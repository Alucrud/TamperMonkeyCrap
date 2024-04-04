// ==UserScript==
// @name Imgur
// @namespace   https://github.com/Alucrud/TamperMonkeyCrap/
// @author      Alucrud
// @description Open links in new tabs and remove junk posts
// @icon        https://imgur.com/favicon.ico
// @version     0.0.2
// @include     *://*imgur*/*
// @grant       none
// @require     http://code.jquery.com/jquery-3.4.1.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL   https://github.com/Alucrud/TamperMonkeyCrap/raw/main/mobile/Imgur.user.js
// @noframes
// @run-at document-idle
// ==/UserScript==

//// Replace contains with a case-insensitive version
jQuery.expr[':'].contains = function(a, i, m) {
  return jQuery(a).text().toUpperCase()
      .indexOf(m[3].toUpperCase()) >= 0;
};

////Variables
//Remove
var removeList = `
  memes
  dump
  wholesome
  politics
  political
  shitpost
  cakeday
`;



waitForKeyElements (".TagPill", filter);

waitForKeyElements ("a", newTab);

function newTab (jNode) {
  jNode.attr('target', '_blank');
};

function filter (jNode) {
  $.each(removeList.split(/\r?\n/), function(){
      var rep = this.trim();
      if (rep.length > 0){
        $(".TagPill:contains('" + rep + "')").closest(".Post-item").parent().hide();
      };
    });
};

