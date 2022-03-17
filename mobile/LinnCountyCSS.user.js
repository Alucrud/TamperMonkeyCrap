// ==UserScript==
// @name        Linn CSS
// @description Attempting to fix the Linn County website
// @include     https://www.linncountyiowa.gov/*
// @grant       GM_addStyle
// @run-at      document-start
// @version     0.1
// ==/UserScript==

GM_addStyle ( `
div.alertToolbar.cpToolbar {
  display: none;
}

.widgetSearchBox {
  border-radius: 10px;
}

.searchTS {
  border-radius: 10px;
}

#structuralContainer6 {
  display: none;
}

.stickyStructuralContainer {
  top: 35px;
  height: 80px;
}

#contentContainer5b {
  display: none;
}

#structuralContainer5 {
  padding-top: 0px;
  margin-top: 80px;
}

#structuralContainer5>div.inner {
  padding: 10px 0 10px 0;
}

#structuralContainer16 {
  padding-top: 5px;
}

img.media {
  width: 175px
}

#contentContainer16a {
  height: 50px;
}

.goog-te-combo {
  display:none;
}

.siteSidebar {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

#structuralContainer10 {
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}

.siteSidebar .navMainItem {
  padding-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #9cf;
  font-weight: 300;
  font-size: .95em;
}

.siteSidebar .navMenuItem {
  padding-top: 10px;
  padding-bottom: 10px;
  font-weight: 200;
  font-size: 1em;
}

.siteHeader .navMainItem {
  text-transform: none;
}

h1, h2, h3, h4, h5 {
  text-transform: none;
  color: #0076be;
}

h4 a {
  text-transform: none;
}

.breadCrumbs a {
  color: #0076be;
}

#featureColumn .h-card::after {
    content: "";
    display: block;
    margin: 0 auto;
    width: 85%;
    padding-top: 20px;
    border-bottom: 1px solid #bbb;
}

#page .row.outer::after {
    content: "";
    display: block;
    margin: 0 auto;
    width: 85%;
    padding-top: 20px;
    border-bottom: 1px solid #bbb;
}

.secondaryContent .widgetViewAll {
  padding: 6px;
  text-transform: none;
  font-size: 1em;
  color: white;
  background-color: #0076be;
  border-radius: 10px;
  font-weight: 300;
}

.secondaryContent {
  background-color: #e5e5e5;
  border-bottom-left-radius: 10px;
  border-top-right-radius: 10px;
}

iframe[src*="facebook"] {
  display:none;
}

a {
  text-decoration: none;
}

#moduleContent a {
  color: #0076be;
}

.secondaryContent a {
  color: #0076be;
}

.tabName {
  color: black;
}

.cpTabs>li:first-of-type>a {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

.cpTabs>li:last-of-type>a {
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}

.contentTools {
  display: none;
}

.megaMenu {
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
  border-color: #000000;
  top: 90px;
}

.widgetTitle:hover {
  text-decoration: none;
}

.megaMenu .col {
  border-right: 1px solid #555;
}

.megaMenuItem .widgetTitle a:active {
  color: #dd0;
}

.megaMenuItem a {
  font-weight: 300;
}

img {
  border-radius: 10px;
}

.miniCalendar a {
  border-radius: 10px;
}
` );
