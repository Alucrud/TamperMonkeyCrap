// ==UserScript==
// @name        Linn CSS
// @namespace    https://github.com/Alucrud/TamperMonkeyCrap/
// @description Attempting to fix the Linn County website
// @include     https://www.linncountyiowa.gov/*
// @grant       GM_addStyle
// @run-at      document-start
// @version     2
// ==/UserScript==

GM_addStyle ( `
/* Remove covid alert */
.alertToolbar {
  display: none;
}

/* Remove language select */
#google-translate-container {
  display: none;
}

/* MAIN PAGE STUFF */
/* HEADER STUFF */
/* Resize Linn County Logo */
#bannerLogoTS img {
  max-height:50px;
  width: auto;
  height: auto;
}

/* header padding */
#bannerLogoTS {
  padding-top: 0;
  padding-bottom: 0;
}

/* Nav menu padding */
.navMainItem {
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}

/* Search button padding */
#searchToggleTS {
  padding-top: 0;
  padding-bottom: 0;
}


/* TOP MENU STUFF */
/* delete this */
#mainNavMegaMenu31 {
  display:block;
}

/* padding */
.megaMenuItem {
  padding: 0;
}

/* padding after lists */
.megaMenuItem > ol {
  margin-bottom: 20px;
}

/* color elections to find it quicker */
.megaMenuItem a[href*="Election"] {
  color: #bbbb14;
}


/* MAIN PAGE STUFF */
/* Remove "welcome to linn county" section */
#bannerContentTS {
  padding-top: 0px;
  padding-bottom: 0px;
  display: none;
}

/* Remove "Stay informed" */
#homeContainer1 {
  display:none;
}


/* Padding for titles */
[id*="homeContainer"] {
  padding: 0;
}


/* POPULAR SERVICES SECTION */
/* Padding  */
#bannerSizing2TS {
  padding: 0;
}

/* Link height*/
.widgetQuickLinksLink {
  min-height: 50px;
}


/* FOOTER STUFF */
/* Remove massive logo footer  */
#footerTS {
  display: none;
}

/* 2nd footer padding */
#footer2TS {
  padding: 0;
}





/* NON-MAIN PAGE STUFF */
/* Remove social media crap from sidebar */
#sidebarContainer1TS {
  display: none;
}
` );
