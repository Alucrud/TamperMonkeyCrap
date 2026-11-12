// ==UserScript==
// @name         Sakura Reddit - Ultimate Edition with Keyword Filter
// @namespace    https://github.com/Alucrud/TamperMonkeyCrap
// @version      2.9.0
// @description  Clean anime-night app layout with remote JSON regex keyword and subreddit filters
// @match        *://old.reddit.com/*
// @updateURL    https://github.com/Alucrud/TamperMonkeyCrap/raw/refs/heads/main/mobile/Reddit%20(Old)%20-%20Sakura%20Filter.user.js
// @downloadURL  https://github.com/Alucrud/TamperMonkeyCrap/raw/refs/heads/main/mobile/Reddit%20(Old)%20-%20Sakura%20Filter.user.js
// @connect      raw.githubusercontent.com
// @connect      github.com
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  "use strict";

  /* ==========================================================================
     1. REMOTE FILTER CONFIGURATION & CSP BYPASS LOADER
     ========================================================================== */
  var REMOTE_FILTERS_URL = "https://raw.githubusercontent.com/Alucrud/TamperMonkeyCrap/main/mobile/RedditFilters.json";
  var REMOTE_CACHE_HOURS = 1;
  var CACHE_DATA_KEY = "sakura_remote_filters_v1";
  var CACHE_TIME_KEY = "sakura_remote_filters_ts_v1";

  var compiledKeywords = [];
  var compiledSubreddits = [];

  function parseJsonSafely(rawText) {
    var clean = (rawText || "").replace(/^\uFEFF/, "").trim();
    try {
      return JSON.parse(clean);
    } catch (firstErr) {
      var repaired = clean.replace(/\\(["\\/bfnrtu])|\\(.)/g, function (match, validEsc, invalidEsc) {
        return validEsc ? match : "\\\\" + invalidEsc;
      });
      return JSON.parse(repaired);
    }
  }

  function extractFilterEntries(source) {
    var list = [];
    if (!source) return list;

    if (Array.isArray(source)) {
      return source;
    }

    if (typeof source === "object") {
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key) && Array.isArray(source[key])) {
          var arr = source[key];
          for (var i = 0; i < arr.length; i++) {
            list.push(arr[i]);
          }
        }
      }
    }
    return list;
  }

  function compileFilters(list) {
    var compiled = [];
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (item instanceof RegExp) {
        compiled.push(item);
      } else if (typeof item === "string" && item.length > 0) {
        var slashMatch = item.match(/^\/(.+)\/([gimsuy]*)$/);
        try {
          if (slashMatch) {
            var flags = slashMatch[2].indexOf("i") === -1 ? slashMatch[2] + "i" : slashMatch[2];
            compiled.push(new RegExp(slashMatch[1], flags));
          } else {
            compiled.push(new RegExp(item, "i"));
          }
        } catch (e) {
          compiled.push(item.toLowerCase());
        }
      }
    }
    return compiled;
  }

  function applyFilterData(data) {
    if (!data || typeof data !== "object") return false;

    var rawKeywords = extractFilterEntries(data.keywordCategories || data.keywords);
    var rawSubreddits = extractFilterEntries(data.subredditCategories || data.subreddits);

    compiledKeywords = compileFilters(rawKeywords);
    compiledSubreddits = compileFilters(rawSubreddits);
    return true;
  }

  function matchesFilter(text, compiledList) {
    if (!text) return false;
    var lowerText = text.toLowerCase();
    for (var i = 0; i < compiledList.length; i++) {
      var rule = compiledList[i];
      if (rule instanceof RegExp) {
        if (rule.test(text)) return true;
      } else if (lowerText.indexOf(rule) !== -1) {
        return true;
      }
    }
    return false;
  }

  try {
    var cachedRaw = localStorage.getItem(CACHE_DATA_KEY);
    if (cachedRaw) {
      applyFilterData(parseJsonSafely(cachedRaw));
    }
  } catch (e) {}

  function fetchRemoteFilters(force, statusBtn) {
    var lastSync = parseInt(localStorage.getItem(CACHE_TIME_KEY) || "0", 10);
    var now = Date.now();
    if (!force && now - lastSync < REMOTE_CACHE_HOURS * 3600 * 1000) {
      return;
    }

    if (statusBtn) {
      statusBtn.innerText = "syncing...";
    }

    var url = REMOTE_FILTERS_URL + (force ? "?t=" + now : "");
    var gmXhr = typeof GM_xmlhttpRequest !== "undefined"
      ? GM_xmlhttpRequest
      : (typeof GM !== "undefined" && GM.xmlHttpRequest ? GM.xmlHttpRequest : null);

    function handleResponseText(responseText) {
      var cleanText = (responseText || "").replace(/^\uFEFF/, "").trim();
      try {
        var parsed = parseJsonSafely(cleanText);
        if (applyFilterData(parsed)) {
          localStorage.setItem(CACHE_DATA_KEY, JSON.stringify(parsed));
          localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
          recheckAllPosts();
          if (statusBtn) {
            statusBtn.innerText = "synced (" + compiledKeywords.length + "k/" + compiledSubreddits.length + "s)";
            setTimeout(function () { statusBtn.innerText = "sync filters"; }, 2500);
          }
          return;
        }
      } catch (err) {
        if (force) {
          var preview = cleanText.slice(0, 140) || "(empty response)";
          alert("Filter JSON Parse Error:\n" + err.message + "\n\nResponse starts with:\n" + preview);
        }
      }

      if (statusBtn) {
        statusBtn.innerText = "json error";
        setTimeout(function () { statusBtn.innerText = "sync filters"; }, 2000);
      }
    }

    function handleError(detail) {
      if (force && detail) {
        alert("Filter Sync Network Error:\n" + detail);
      }
      if (statusBtn) {
        statusBtn.innerText = "sync failed";
        setTimeout(function () { statusBtn.innerText = "sync filters"; }, 2000);
      }
    }

    if (gmXhr) {
      gmXhr({
        method: "GET",
        url: url,
        onload: function (res) {
          if (res.status >= 200 && res.status < 300) {
            handleResponseText(res.responseText);
          } else {
            handleError("HTTP " + res.status + " from " + url);
          }
        },
        onerror: function () {
          handleError("Request blocked or offline.");
        }
      });
    } else if (typeof fetch === "function") {
      fetch(url)
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.text();
        })
        .then(handleResponseText)
        .catch(function (e) { handleError(e.message); });
    }
  }

  /* ==========================================================================
     2. VIEWPORT & FONTS
     ========================================================================== */
  var vp = document.createElement("meta");
  vp.name = "viewport";
  vp.content = "width=device-width, initial-scale=1, viewport-fit=cover";
  document.documentElement.appendChild(vp);

  var font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;800&display=swap";
  document.documentElement.appendChild(font);

  /* ==========================================================================
     3. STYLESHEET INJECTION
     ========================================================================== */
  var css = [
    ":root {",
    "  --ink:         #13111C;",
    "  --ink-soft:    #1C1928;",
    "  --ink-raise:   #262136;",
    "  --sakura:      #FF8FB8;",
    "  --sakura-dim:  #C4688E;",
    "  --glow:        #7FE3FF;",
    "  --cream:       #F4EFEA;",
    "  --mist:        #9A92AD;",
    "  --line:        #2E2940;",
    "  --radius:      16px;",
    "  --font: 'M PLUS Rounded 1c', 'Hiragino Maru Gothic ProN', system-ui, sans-serif;",
    "}",
    "/* Base layout */",
    "html, body { background: var(--ink) !important; color: var(--cream) !important; font-family: var(--font) !important; font-size: 16px !important; line-height: 1.55 !important; margin: 0 !important; }",
    ".content[role='main'], .content { background: var(--ink) !important; max-width: 520px !important; margin: 0 auto !important; padding: 8px 10px 96px !important; box-sizing: border-box !important; }",

    "/* Hidden posts filter rule */",
    "#siteTable .thing.link.sakura-filtered-post { display: none !important; }",

    "/* Compact Sticky Header */",
    "#header { position: sticky !important; top: 0 !important; z-index: 100 !important; background: rgba(19, 17, 28, .92) !important; backdrop-filter: blur(14px) saturate(1.4); -webkit-backdrop-filter: blur(14px) saturate(1.4); border-bottom: 1px solid var(--line) !important; height: auto !important; padding: 6px 12px !important; }",

    "/* Top Feed & Subreddit Bar (Home, Popular, All, Subscriptions) */",
    "#sr-header-area { display: block !important; background: transparent !important; border: 0 !important; height: auto !important; line-height: normal !important; padding: 0 0 6px 0 !important; margin: 0 !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch; scrollbar-width: none; }",
    "#sr-header-area::-webkit-scrollbar { display: none; }",
    "#sr-header-area .width-clip { display: flex !important; align-items: center !important; position: static !important; width: max-content !important; gap: 6px !important; }",
    "#sr-header-area .sr-list { display: flex !important; align-items: center !important; gap: 6px !important; overflow: visible !important; }",
    "#sr-header-area .sr-bar { display: flex !important; align-items: center !important; gap: 6px !important; float: none !important; margin: 0 !important; }",
    "#sr-header-area .sr-bar li { display: inline-flex !important; align-items: center !important; float: none !important; margin: 0 !important; }",
    "#sr-header-area .sr-bar li a.choice { display: inline-block !important; background: var(--ink-soft) !important; color: var(--cream) !important; border: 1px solid var(--line) !important; border-radius: 999px !important; padding: 5px 12px !important; font-size: 12px !important; font-weight: 700 !important; text-transform: lowercase !important; text-decoration: none !important; }",
    "#sr-header-area .sr-bar:first-of-type li:nth-child(-n+3) a.choice { border-color: var(--sakura-dim) !important; color: var(--sakura) !important; }",
    "#sr-header-area .separator, #sr-header-area .dropdown.srdrop, #sr-header-area .drop-choices.srdrop, #sr-more-link { display: none !important; }",

    "/* Hide Logo & Default Sort Bar (Moved inside More Drawer) */",
    "#header-img, #header-img-a, #header-bottom-left { display: none !important; }",

    "/* Compact Account & More Toggle Row */",
    "#header-bottom-right { position: static !important; background: transparent !important; border-radius: 0 !important; padding: 2px 0 0 !important; font-size: 12px !important; color: var(--mist) !important; display: flex !important; flex-wrap: wrap; align-items: center; gap: 6px; }",
    "#header-bottom-right a { color: var(--glow) !important; }",
    "#sakura-current-sub { color: var(--sakura) !important; font-weight: 800 !important; font-size: 12px !important; text-decoration: none !important; margin-right: 2px; }",
    "#sakura-more-toggle { margin-left: auto !important; display: inline-flex !important; align-items: center !important; background: var(--ink-raise) !important; color: var(--sakura) !important; border: 1px solid var(--sakura-dim) !important; border-radius: 999px !important; padding: 4px 12px !important; min-height: 28px; font-size: 12px !important; font-weight: 800 !important; cursor: pointer; text-decoration: none !important; }",

    "/* Thumb-Friendly Collapsible More Drawer */",
    "#sakura-more-drawer { display: none; flex-direction: column; gap: 8px; padding-top: 8px; margin-top: 7px; border-top: 1px solid var(--line); }",
    "#sakura-more-drawer.open { display: flex !important; }",
    ".sakura-drawer-group { display: flex; flex-wrap: wrap; gap: 8px; }",
    ".sakura-drawer-group + .sakura-drawer-group { padding-top: 8px; border-top: 1px dashed var(--line); }",
    "#sakura-more-drawer a, #sakura-more-drawer form.logout a { display: inline-flex !important; align-items: center !important; justify-content: center !important; flex: 1 1 auto !important; min-height: 40px !important; background: var(--ink-soft) !important; color: var(--cream) !important; border: 1px solid var(--line) !important; border-radius: 12px !important; padding: 8px 14px !important; font-size: 13px !important; font-weight: 700 !important; text-transform: lowercase !important; text-decoration: none !important; box-sizing: border-box !important; }",
    "#sakura-more-drawer a.sakura-sort-active, #sakura-more-drawer a.sakura-home-btn { border-color: var(--sakura) !important; color: var(--sakura) !important; }",
    "#sakura-more-drawer form.logout { display: inline-flex !important; flex: 1 1 auto !important; margin: 0 !important; }",
    "#sakura-more-drawer form.logout a { width: 100% !important; color: var(--mist) !important; }",

    "/* Export Muted Modal */",
    "#sakura-export-backdrop { position: fixed; inset: 0; z-index: 9999; background: rgba(10, 9, 15, .82); display: flex; align-items: center; justify-content: center; padding: 16px; }",
    "#sakura-export-box { width: 100%; max-width: 440px; background: var(--ink-soft); border: 1px solid var(--sakura-dim); border-radius: 16px; padding: 16px; box-sizing: border-box; color: var(--cream); }",
    "#sakura-export-box h3 { margin: 0 0 6px; font-size: 16px; color: var(--sakura); }",
    "#sakura-export-box p { margin: 0 0 10px; font-size: 12px; color: var(--mist); }",
    "#sakura-export-text { width: 100%; height: 96px; background: var(--ink); color: var(--glow); border: 1px solid var(--line); border-radius: 10px; padding: 8px; font-family: monospace; font-size: 12px; box-sizing: border-box; resize: vertical; }",
    "#sakura-export-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }",
    "#sakura-export-actions button { padding: 8px 16px !important; min-height: 38px; font-size: 13px !important; cursor: pointer; }",
    "#sakura-export-clear { background: var(--ink-raise) !important; color: var(--mist) !important; border: 1px solid var(--line) !important; }",
    "#sakura-export-close { background: var(--ink-raise) !important; color: var(--cream) !important; border: 1px solid var(--line) !important; margin-left: auto; }",

    "/* Sidebar, Left White Multireddit Bar & Elements to Hide */",
    ".side, .listing-chooser, .sr-header-area, .rank, .listingsignupbar, .infobar, .spacer > .infobar, .redesign-beta-optin, #redesign-beta-optin-btn, .mobileweb-onboarding-toast { display: none !important; }",

    "/* Hide Specific Action Buttons */",
    ".reply-button, .crosspost-button, a[data-event-action='permalink'], a.embed-comment, .flat-list.buttons li.share, .flat-list.buttons li.report-button, .flat-list.buttons li.save-button, .flat-list.buttons li.hide-button { display: none !important; }",

    "/* Restore Save Button on Main Post Inside Comments */",
    "body.comments-page #siteTable .thing.link .flat-list.buttons li.save-button { display: inline-block !important; }",

    "/* Hide thumbnail inside comments */",
    "body.comments-page .thing.link a.thumbnail { display: none !important; }",

    "/* Hide Source Domain */",
    ".thing .domain { display: none !important; }",

    "/* Feed & Post Cards Base */",
    "#siteTable .thing.link { display: block !important; background: var(--ink-soft) !important; border: 1px solid var(--line) !important; border-radius: var(--radius) !important; margin: 0 0 12px !important; padding: 14px 14px 10px !important; transition: transform .15s ease, border-color .15s ease; }",
    "#siteTable .thing.link:active { transform: scale(.985); }",
    "#siteTable .thing.link:hover { border-color: var(--sakura-dim) !important; }",

    "/* Self-Post Text Box Dark Theme Fix */",
    ".link .usertext-body .md { background: var(--ink-raise) !important; border: 1px solid var(--line) !important; color: var(--cream) !important; border-radius: 12px !important; padding: 10px 12px !important; margin-top: 8px !important; }",

    "/* Votes Pill (Top) */",
    ".thing .midcol { float: none !important; display: inline-flex !important; align-items: center; gap: 8px; background: var(--ink-raise) !important; border-radius: 999px !important; padding: 4px 12px !important; margin: 0 0 10px 0 !important; width: auto !important; }",
    ".thing .midcol .score { color: var(--cream) !important; font-weight: 800 !important; font-size: 13px !important; }",
    ".thing .midcol .score.likes { color: var(--sakura) !important; }",
    ".thing .midcol .score.dislikes { color: var(--glow) !important; }",
    ".arrow { transform: scale(1.35); margin: 0 2px !important; }",

    "/* Thumbnail (Floated Left) */",
    ".thing .thumbnail { float: left !important; border-radius: 12px !important; overflow: hidden; margin: 0 12px 4px 0 !important; width: 70px !important; height: auto !important; }",
    ".thing .thumbnail img { border-radius: 12px !important; width: 100% !important; height: auto !important; }",

    "/* Entry Content (Title & Tagline) */",
    ".thing .entry { display: block !important; overflow: visible !important; margin: 0 !important; padding: 0 !important; }",
    ".thing .top-matter { margin-left: 0 !important; }",
    ".thing .title a.title { color: var(--cream) !important; font-size: 17px !important; font-weight: 700 !important; line-height: 1.4 !important; }",
    ".thing .title a.title:visited { color: var(--mist) !important; }",
    ".thing .tagline { color: var(--mist) !important; font-size: 12px !important; margin-top: 4px !important; }",
    ".thing .tagline a { color: var(--sakura) !important; font-weight: 700; }",
    ".thing .tagline a.subreddit { color: var(--glow) !important; }",

    "/* Action Row */",
    ".thing .flat-list.buttons { clear: left !important; margin: 0 !important; padding-top: 10px !important; display: flex; flex-wrap: wrap; gap: 6px; }",
    ".thing .flat-list.buttons li { margin: 0 !important; }",
    ".thing .flat-list.buttons li a { display: inline-block; background: transparent !important; color: var(--mist) !important; border: 1px solid var(--line) !important; border-radius: 999px !important; padding: 5px 12px !important; font-size: 12px !important; font-weight: 700 !important; text-transform: lowercase; }",
    ".thing .flat-list.buttons li.first a { border-color: var(--sakura-dim) !important; color: var(--sakura) !important; }",
    ".thing .flat-list.buttons li a.mute-sub-btn { border-color: var(--glow) !important; color: var(--glow) !important; }",
    ".thing .flat-list.buttons li a.copy-clean-link-btn { border-color: var(--sakura-dim) !important; color: var(--cream) !important; }",

    "/* Expanded Media */",
    ".thing .expando { clear: left !important; margin-left: 0 !important; padding-top: 10px !important; width: 100% !important; box-sizing: border-box !important; }",
    ".expando *, .media-preview, .media-preview-content, .video-player, .no-constraints-when-pinned { min-width: 0 !important; max-width: 100% !important; box-sizing: border-box !important; }",
    ".expando img, .expando video, .expando iframe { width: 100% !important; height: auto !important; border-radius: 12px; margin: 0 !important; }",

    "/* Comments & Compact Mobile Indentation */",
    ".commentarea, .panestack-title, .menuarea { background: transparent !important; border-color: var(--line) !important; margin: 0 !important; }",
    ".commentarea .comment { background: var(--ink-soft) !important; border: 1px solid var(--line) !important; border-left: 3px solid var(--sakura-dim) !important; border-radius: 12px !important; margin: 0 0 8px !important; padding: 10px 10px !important; }",
    ".commentarea .child { margin-left: 4px !important; padding-left: 4px !important; border-left: 1px solid var(--line) !important; }",
    ".commentarea .child .sitetable { margin-left: 0 !important; padding-left: 0 !important; }",
    ".commentarea .comment .comment { background: var(--ink) !important; border-left-color: var(--glow) !important; margin: 6px 0 4px !important; padding: 8px 8px !important; }",
    ".commentarea .comment .comment .comment { background: var(--ink-soft) !important; border-left-color: var(--sakura-dim) !important; }",
    ".commentarea .comment .comment .comment .comment { background: var(--ink) !important; border-left-color: var(--glow) !important; }",
    ".comment .usertext-body .md { color: var(--cream) !important; font-size: 15px !important; overflow-wrap: anywhere; }",
    ".md a { color: var(--glow) !important; }",
    ".md blockquote { border-left: 3px solid var(--sakura) !important; color: var(--mist) !important; margin-left: 4px !important; padding-left: 8px !important; }",
    ".md code, .md pre { background: #0D0B14 !important; color: #C9F2FF !important; border-radius: 8px; }",

    "/* Inline Comment Images */",
    ".sakura-comment-img { display: block; max-width: 100% !important; height: auto !important; border-radius: 10px; margin: 6px 0; }",

    "/* Forms & Misc */",
    ".usertext-edit textarea, input[type='text'], input[type='password'], #search input[type='text'] { background: var(--ink-raise) !important; color: var(--cream) !important; border: 1px solid var(--line) !important; border-radius: 12px !important; padding: 10px 12px !important; font-family: var(--font) !important; }",
    ".morelink, button, .btn { background: var(--sakura) !important; color: var(--ink) !important; border: 0 !important; border-radius: 999px !important; font-weight: 800 !important; font-family: var(--font) !important; }",
    ".footer-parent, .debuginfo, .infobar#classy { display: none !important; }",
    ".nav-buttons { text-align: center; }",
    ".nav-buttons .nextprev a { display: inline-block; background: var(--ink-soft) !important; color: var(--sakura) !important; border: 1px solid var(--line) !important; border-radius: 999px !important; padding: 10px 22px !important; font-weight: 800 !important; }"
  ].join("\n");

  var style = document.createElement("style");
  style.textContent = css;
  document.documentElement.appendChild(style);

  /* ==========================================================================
     4. DYNAMIC SUBREDDIT MUTING SYSTEM (LOCALSTORAGE)
     ========================================================================== */
  var hiddenSubsStyle = document.createElement("style");
  hiddenSubsStyle.id = "userscript-hidden-subs-css";
  document.head.appendChild(hiddenSubsStyle);

  function getMutedSubs() {
    try {
      var list = JSON.parse(localStorage.getItem("userscript_hidden_subs") || "[]");
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function updateHiddenSubredditsCss() {
    var subs = getMutedSubs();
    var cssRules = "";
    for (var j = 0; j < subs.length; j++) {
      cssRules += '#siteTable .thing.link[data-subreddit="' + subs[j] + '" i] { display: none !important; }\n';
    }
    document.getElementById("userscript-hidden-subs-css").textContent = cssRules;
  }

  updateHiddenSubredditsCss();

  /* ==========================================================================
     5. CLIPBOARD & MUTED SUBREDDITS EXPORT MODAL
     ========================================================================== */
  function copyTextToClipboard(text, btnElement) {
    function showFeedback() {
      if (!btnElement) return;
      var orig = btnElement.innerText;
      btnElement.innerText = "copied!";
      setTimeout(function () {
        btnElement.innerText = orig;
      }, 1500);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(showFeedback).catch(function () {
        fallbackCopy(text, showFeedback);
      });
    } else {
      fallbackCopy(text, showFeedback);
    }
  }

  function fallbackCopy(text, callback) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      if (callback) callback();
    } catch (e) {}
    document.body.removeChild(ta);
  }

  function openExportMutedModal() {
    var existing = document.getElementById("sakura-export-backdrop");
    if (existing) existing.remove();

    var subs = getMutedSubs().map(function (s) {
      return String(s).trim().toLowerCase();
    }).filter(Boolean);

    subs.sort();
    var uniqueSubs = [];
    for (var i = 0; i < subs.length; i++) {
      if (uniqueSubs.indexOf(subs[i]) === -1) {
        uniqueSubs.push(subs[i]);
      }
    }

    var formattedOutput = uniqueSubs.length > 0
      ? '"/^(' + uniqueSubs.join("|") + ')$/i"'
      : "No subreddits muted locally yet.";

    var backdrop = document.createElement("div");
    backdrop.id = "sakura-export-backdrop";

    var box = document.createElement("div");
    box.id = "sakura-export-box";

    var title = document.createElement("h3");
    title.innerText = "Muted Subreddits (" + uniqueSubs.length + ")";

    var desc = document.createElement("p");
    desc.innerText = "Copy this JSON-ready regex rule to paste into RedditFilters.json:";

    var textarea = document.createElement("textarea");
    textarea.id = "sakura-export-text";
    textarea.readOnly = true;
    textarea.value = formattedOutput;

    var actions = document.createElement("div");
    actions.id = "sakura-export-actions";

    var copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.innerText = "Copy Regex";
    copyBtn.onclick = function () {
      textarea.select();
      copyTextToClipboard(formattedOutput, copyBtn);
    };

    var clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.id = "sakura-export-clear";
    clearBtn.innerText = "Clear Local List";
    clearBtn.onclick = function () {
      if (confirm("Clear all " + uniqueSubs.length + " locally muted subreddits? (Make sure you copied them first!)")) {
        localStorage.removeItem("userscript_hidden_subs");
        updateHiddenSubredditsCss();
        backdrop.remove();
      }
    };

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.id = "sakura-export-close";
    closeBtn.innerText = "Close";
    closeBtn.onclick = function () {
      backdrop.remove();
    };

    backdrop.onclick = function (e) {
      if (e.target === backdrop) backdrop.remove();
    };

    actions.appendChild(copyBtn);
    if (uniqueSubs.length > 0) {
      actions.appendChild(clearBtn);
    }
    actions.appendChild(closeBtn);

    box.appendChild(title);
    box.appendChild(desc);
    box.appendChild(textarea);
    box.appendChild(actions);
    backdrop.appendChild(box);
    document.body.appendChild(backdrop);
  }

  /* ==========================================================================
     6. MAIN POST PROCESSING & FILTERING LOOP
     ========================================================================== */
  function recheckAllPosts() {
    if (document.body.classList.contains("comments-page")) return;
    var posts = document.querySelectorAll(".thing.link");
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      var titleLink = post.querySelector("a.title");
      var titleText = titleLink ? titleLink.innerText : "";
      var subName = post.getAttribute("data-subreddit") || "";
      if (matchesFilter(titleText, compiledKeywords) || matchesFilter(subName, compiledSubreddits)) {
        post.classList.add("sakura-filtered-post");
      } else {
        post.classList.remove("sakura-filtered-post");
      }
    }
  }

  function processPosts() {
    var isCommentsPage = document.body.classList.contains("comments-page");
    var posts = document.querySelectorAll(".thing.link:not(.sakura-processed)");

    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      post.classList.add("sakura-processed");

      var titleLink = post.querySelector("a.title");
      var titleText = titleLink ? titleLink.innerText : "";
      var subName = post.getAttribute("data-subreddit") || "";

      // A. Regex / Keyword & Subreddit Filtering Check
      if (!isCommentsPage) {
        if (matchesFilter(titleText, compiledKeywords) || matchesFilter(subName, compiledSubreddits)) {
          post.classList.add("sakura-filtered-post");
          continue;
        }
      }

      // B. Layout & Dynamic Enhancements
      var commentsLink = post.querySelector(".bylink.comments");
      var postUrl = post.getAttribute("data-url");
      var thumbnailLink = post.querySelector("a.thumbnail");
      var thumbnailImg = post.querySelector("a.thumbnail img");
      var expandoBtn = post.querySelector(".expando-button");
      var isGallery = post.getAttribute("data-is-gallery") === "true";
      var isVideo = post.getAttribute("data-domain") === "v.redd.it";
      var buttonsList = post.querySelector(".flat-list.buttons");

      // Copy Clean reddit.com Link Button (Comments Page Only)
      if (isCommentsPage && buttonsList && !buttonsList.querySelector(".copy-clean-link-btn")) {
        var copyLi = document.createElement("li");
        var copyBtn = document.createElement("a");
        copyBtn.href = "javascript:void(0);";
        copyBtn.className = "copy-clean-link-btn";
        copyBtn.innerText = "copy link";

        var rawHref = commentsLink ? commentsLink.href : window.location.href;
        var cleanUrl = rawHref
          .split("?")[0]
          .split("#")[0]
          .replace(/^https?:\/\/([a-z0-9-]+\.)?reddit\.com/i, "https://reddit.com");

        copyBtn.onclick = (function (urlToCopy, btn) {
          return function (e) {
            e.preventDefault();
            e.stopPropagation();
            copyTextToClipboard(urlToCopy, btn);
          };
        })(cleanUrl, copyBtn);

        copyLi.appendChild(copyBtn);
        buttonsList.appendChild(copyLi);
      }

      // Mute Subreddit Button Injection
      if (buttonsList && subName) {
        if (!buttonsList.querySelector(".mute-sub-btn")) {
          var hideLi = document.createElement("li");
          var hideBtn = document.createElement("a");
          hideBtn.href = "javascript:void(0);";
          hideBtn.className = "mute-sub-btn";
          hideBtn.innerText = "mute r/" + subName;

          hideBtn.onclick = (function (sub) {
            return function (e) {
              e.preventDefault();
              e.stopPropagation();

              if (confirm("Are you sure you want to permanently mute all posts from r/" + sub + "?")) {
                var currentHidden = getMutedSubs();
                if (currentHidden.indexOf(sub) === -1) {
                  currentHidden.push(sub);
                  localStorage.setItem("userscript_hidden_subs", JSON.stringify(currentHidden));
                  updateHiddenSubredditsCss();
                }
              }
            };
          })(subName);

          hideLi.appendChild(hideBtn);
          buttonsList.appendChild(hideLi);
        }
      }

      // High-res Image Logic
      if (thumbnailImg && postUrl && !isVideo) {
        var isDirectImage = /\.(jpeg|jpg|gif|png|webp)($|\?)/i.test(postUrl);
        var isImgur = postUrl.indexOf("imgur.com") !== -1 && postUrl.indexOf("/a/") === -1 && postUrl.indexOf("/gallery/") === -1;

        if (isDirectImage) {
          thumbnailImg.src = postUrl;
        } else if (isImgur) {
          thumbnailImg.src = postUrl + ".jpg";
        } else if (isGallery) {
          var galleryMatch = thumbnailImg.src.match(/(?:preview|external-preview)\.redd\.it\/([a-zA-Z0-9.\-_]+)\?/);
          if (galleryMatch) {
            thumbnailImg.src = "https://i.redd.it/" + galleryMatch[1];
          }
        }
      }

      // Link Routing & Expando Logic
      if (titleLink && commentsLink) {
        titleLink.href = commentsLink.href;
        titleLink.removeAttribute("data-outbound-url");
        titleLink.removeAttribute("data-href-url");
      }

      if (thumbnailLink) {
        thumbnailLink.removeAttribute("data-outbound-url");
        thumbnailLink.removeAttribute("data-href-url");
      }

      if (thumbnailImg) {
        if (expandoBtn) {
          expandoBtn.style.display = "none";
          thumbnailLink.href = "javascript:void(0);";
          thumbnailLink.onclick = (function (btn) {
            return function (e) {
              e.preventDefault();
              e.stopPropagation();
              btn.click();
            };
          })(expandoBtn);
        } else if (commentsLink && thumbnailLink) {
          thumbnailLink.href = commentsLink.href;
        }
      } else {
        if (expandoBtn) {
          expandoBtn.style.display = "block";
          expandoBtn.style.float = "left";
          expandoBtn.style.margin = "4px 12px 4px 0";
        }
      }
    }
  }

  /* ==========================================================================
     7. INLINE COMMENT IMAGE VIEWING
     ========================================================================== */
  function processCommentImages() {
    var commentLinks = document.querySelectorAll(".comment .usertext-body .md a:not(.sakura-img-checked)");

    for (var i = 0; i < commentLinks.length; i++) {
      var link = commentLinks[i];
      link.classList.add("sakura-img-checked");

      if (link.querySelector("img")) continue;

      var href = link.href || "";
      var imgSrc = null;

      if (/\.(jpe?g|png|gif|webp|avif)(\?.*)?$/i.test(href)) {
        imgSrc = href;
      } else if (/^https?:\/\/(preview|external-preview)\.redd\.it\//i.test(href)) {
        imgSrc = href;
      } else {
        var imgurMatch = href.match(/^https?:\/\/(?:i\.|m\.|www\.)?imgur\.com\/([a-zA-Z0-9]{5,8})\/?$/i);
        if (imgurMatch) {
          imgSrc = "https://i.imgur.com/" + imgurMatch[1] + ".jpg";
        }
      }

      if (imgSrc) {
        var originalText = link.textContent;
        var img = document.createElement("img");
        img.src = imgSrc;
        img.className = "sakura-comment-img";
        img.loading = "lazy";

        img.onerror = (function (anchor, imageEl, fallbackText) {
          return function () {
            if (imageEl.parentNode) {
              imageEl.parentNode.removeChild(imageEl);
            }
            if (!anchor.textContent.trim()) {
              anchor.textContent = fallbackText;
            }
          };
        })(link, img, originalText);

        var trimmedText = originalText.trim();
        if (trimmedText === "<image>" || trimmedText === href || /^https?:\/\//i.test(trimmedText)) {
          link.textContent = "";
        }
        link.appendChild(img);
      }
    }
  }

  /* ==========================================================================
     8. COMPACT HEADER "MORE" MENU & CLEANUP
     ========================================================================== */
  function setupCompactHeaderMenu() {
    var header = document.getElementById("header");
    var headerLeft = document.getElementById("header-bottom-left");
    var headerRight = document.getElementById("header-bottom-right");
    if (!header || !headerRight || document.getElementById("sakura-more-toggle")) return;

    // Show active subreddit badge on compact bar when inside a subreddit
    if (headerLeft) {
      var subLink = headerLeft.querySelector(".pagename a");
      if (subLink) {
        var badge = document.createElement("a");
        badge.id = "sakura-current-sub";
        badge.href = subLink.href;
        badge.textContent = "r/" + subLink.textContent.trim();
        headerRight.insertBefore(badge, headerRight.firstChild);
      }
    }

    var drawer = document.createElement("div");
    drawer.id = "sakura-more-drawer";

    // Group 1: Home + Sort Tabs (hot, new, rising, top, etc.)
    var navGroup = document.createElement("div");
    navGroup.className = "sakura-drawer-group";

    var homeBtn = document.createElement("a");
    homeBtn.href = "https://old.reddit.com/";
    homeBtn.className = "sakura-home-btn";
    homeBtn.innerText = "home";
    navGroup.appendChild(homeBtn);

    if (headerLeft) {
      var tabItems = headerLeft.querySelectorAll(".tabmenu li");
      for (var t = 0; t < tabItems.length; t++) {
        var origLink = tabItems[t].querySelector("a");
        if (origLink) {
          var sortBtn = document.createElement("a");
          sortBtn.href = origLink.href;
          sortBtn.textContent = origLink.textContent.trim();
          if (tabItems[t].classList.contains("selected")) {
            sortBtn.classList.add("sakura-sort-active");
          }
          navGroup.appendChild(sortBtn);
        }
      }
    }
    drawer.appendChild(navGroup);

    // Group 2: Filter Tools & Account Actions
    var toolsGroup = document.createElement("div");
    toolsGroup.className = "sakura-drawer-group";

    var syncBtn = document.createElement("a");
    syncBtn.id = "sakura-sync-filters-btn";
    syncBtn.href = "javascript:void(0);";
    syncBtn.innerText = "sync filters";
    syncBtn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      fetchRemoteFilters(true, syncBtn);
    };
    toolsGroup.appendChild(syncBtn);

    var exportBtn = document.createElement("a");
    exportBtn.id = "sakura-export-muted-btn";
    exportBtn.href = "javascript:void(0);";
    exportBtn.innerText = "export muted";
    exportBtn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      drawer.classList.remove("open");
      toggleBtn.innerText = "more \u25BE";
      openExportMutedModal();
    };
    toolsGroup.appendChild(exportBtn);

    var prefsLink = headerRight.querySelector('a[href*="/prefs"]');
    if (prefsLink) {
      if (prefsLink.previousElementSibling && prefsLink.previousElementSibling.classList.contains("separator")) {
        prefsLink.previousElementSibling.remove();
      }
      toolsGroup.appendChild(prefsLink);
    }

    var logoutForm = headerRight.querySelector("form.logout");
    if (logoutForm) {
      if (logoutForm.previousElementSibling && logoutForm.previousElementSibling.classList.contains("separator")) {
        logoutForm.previousElementSibling.remove();
      }
      toolsGroup.appendChild(logoutForm);
    }
    drawer.appendChild(toolsGroup);

    // Add "more ▾" pill button to the compact top bar
    var toggleBtn = document.createElement("a");
    toggleBtn.id = "sakura-more-toggle";
    toggleBtn.href = "javascript:void(0);";
    toggleBtn.innerText = "more \u25BE";
    toggleBtn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      var isOpen = drawer.classList.toggle("open");
      toggleBtn.innerText = isOpen ? "more \u25B4" : "more \u25BE";
    };

    headerRight.appendChild(toggleBtn);
    header.appendChild(drawer);

    // Close drawer when tapping outside header
    document.addEventListener("click", function (e) {
      if (!header.contains(e.target) && drawer.classList.contains("open")) {
        drawer.classList.remove("open");
        toggleBtn.innerText = "more \u25BE";
      }
    });
  }

  setupCompactHeaderMenu();

  // Hide "Get New Reddit" links
  var links = document.getElementsByTagName("a");
  for (var k = 0; k < links.length; k++) {
    if (links[k].innerText && links[k].innerText.toLowerCase() === "get new reddit") {
      links[k].style.display = "none";
    }
  }

  /* Run initially on load */
  processPosts();
  processCommentImages();
  fetchRemoteFilters(false, null);

  var observer = new MutationObserver(function () {
    processPosts();
    processCommentImages();
  });
  observer.observe(document.body, { childList: true, subtree: true });

})();
