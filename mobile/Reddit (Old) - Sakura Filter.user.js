// ==UserScript==
// @name         Sakura Reddit - Ultimate Edition with Keyword Filter
// @namespace    https://github.com/Alucrud/TamperMonkeyCrap
// @version      2.4.0
// @description  Clean anime-night app layout with built-in keyword and subreddit filter
// @match        *://old.reddit.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  /* ==========================================================================
     1. FILTER CONFIGURATION
     ========================================================================== */
  var keywords = [
    'feel','CEO says','introduces bill','grok','i asked','cooked','rfk','upvote','slams',
    'Press Secretary','Vance','Marjorie Taylor Greene','Drake','Kendrick','happy birthday',
    'tesla','twitter','kanye','liberal','congress','spider','maga','woke','zuck','musk','elon','trump'
  ];

  var filteredSubreddits = [
    'coaxed','vanderpump','lastofus','Wuthering','clashofclans','lostredditor','playboicarti',
    'imaginary','4you','h3h3','stone','snorkblot','therewasanattempt','rareinsults','kanye','trump',
    'youtube','KendrickLamar','19684','optimistsunite','mains','todayilearned','markmywords',
    'tesla','facebook','cyberstuck','trashy','linkedin','ZZZ','getnoted','musk','joerogan',
    'livestreamfail','nba','nfl','sports','meirl','_irl','meme','anime','shitpost','whenthe',
    'economiccollapse','conservative','democrat','brawlstars','publicfreakout','cringe','funnyandsad',
    'FacePalm','NikkeMobile','antiwork','workreform','spiders','jerk','comics','chainsawfolk',
    'markiplier','AmIOverreacting','workreform','popculture','explainthejoke','bluesky','dank',
    'peterexplains','india','losercity','programmerhumor','fortnite','onepiece','cfb','dandadan',
    'ich_iel','zenless','finance','hololive','stonk','comebacks','ufc','buddy','wallstreet',
    'bywords','twitter','leopards','formula','politic','adviceanimals','genshin','honkai'
  ];

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
    ".content[role='main'], .content { max-width: 520px !important; margin: 0 auto !important; padding: 8px 10px 96px !important; box-sizing: border-box !important; }",
    
    "/* Hidden posts filter rule - High specificity to override #siteTable */",
    "#siteTable .thing.link.sakura-filtered-post { display: none !important; }",

    "/* Header */",
    "#header { position: sticky !important; top: 0 !important; z-index: 100 !important; background: rgba(19, 17, 28, .88) !important; backdrop-filter: blur(14px) saturate(1.4); -webkit-backdrop-filter: blur(14px) saturate(1.4); border-bottom: 1px solid var(--line) !important; height: auto !important; padding: 10px 14px !important; }",
    "#header-img, #header img { height: 28px !important; }",
    "#sr-header-area { background: transparent !important; border: 0 !important; color: var(--mist) !important; font-size: 10px !important; white-space: nowrap !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch; scrollbar-width: none; }",
    "#sr-header-area::-webkit-scrollbar { display: none; }",
    "#sr-header-area a { color: var(--mist) !important; }",
    "#header-bottom-left .tabmenu { display: flex !important; gap: 6px; overflow-x: auto; margin: 8px 0 0 !important; scrollbar-width: none; }",
    "#header-bottom-left .tabmenu::-webkit-scrollbar { display: none; }",
    "#header-bottom-left .tabmenu li a { display: block; background: var(--ink-soft) !important; color: var(--mist) !important; border: 1px solid var(--line) !important; border-radius: 999px !important; padding: 6px 14px !important; font-size: 13px !important; font-weight: 700 !important; }",
    "#header-bottom-left .tabmenu li.selected a { background: var(--sakura) !important; border-color: var(--sakura) !important; color: var(--ink) !important; }",
    "#header-bottom-right { position: static !important; background: transparent !important; border-radius: 0 !important; padding: 6px 0 0 !important; font-size: 12px !important; color: var(--mist) !important; }",
    "#header-bottom-right a { color: var(--glow) !important; }",
    
    "/* Sidebar & Elements to Hide */",
    ".side, .sr-header-area, .rank, .listingsignupbar, .infobar, .spacer > .infobar, .redesign-beta-optin, #redesign-beta-optin-btn, .mobileweb-onboarding-toast { display: none !important; }",
    
    "/* Hide Specific Action Buttons */",
    ".reply-button, .crosspost-button, a[data-event-action='permalink'], a.embed-comment, .flat-list.buttons li.share, .flat-list.buttons li.report-button, .flat-list.buttons li.save-button, .flat-list.buttons li.hide-button { display: none !important; }",
    
    "/* Hide thumbnail inside comments */",
    "body.comments-page .thing.link a.thumbnail { display: none !important; }",
    
    "/* Hide Source Domain */",
    ".thing .domain { display: none !important; }",

    "/* Feed Cards Base */",
    "#siteTable .thing.link { display: block !important; background: var(--ink-soft) !important; border: 1px solid var(--line) !important; border-radius: var(--radius) !important; margin: 0 0 12px !important; padding: 14px 14px 10px !important; transition: transform .15s ease, border-color .15s ease; }",
    "#siteTable .thing.link:active { transform: scale(.985); }",
    "#siteTable .thing.link:hover { border-color: var(--sakura-dim) !important; }",
    
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
    
    "/* Expanded Media */",
    ".thing .expando { clear: left !important; margin-left: 0 !important; padding-top: 10px !important; width: 100% !important; box-sizing: border-box !important; }",
    ".expando *, .media-preview, .media-preview-content, .video-player, .no-constraints-when-pinned { min-width: 0 !important; max-width: 100% !important; box-sizing: border-box !important; }",
    ".expando img, .expando video, .expando iframe { width: 100% !important; height: auto !important; border-radius: 12px; margin: 0 !important; }",

    "/* Expando & Comments */",
    ".commentarea { margin: 0 !important; }",
    ".commentarea .comment { background: var(--ink-soft) !important; border: 1px solid var(--line) !important; border-left: 3px solid var(--sakura-dim) !important; border-radius: 12px !important; margin: 0 0 10px !important; padding: 10px 12px !important; }",
    ".commentarea .comment .comment { background: var(--ink) !important; border-left-color: var(--glow) !important; margin: 10px 0 4px !important; }",
    ".comment .usertext-body .md { color: var(--cream) !important; font-size: 15px !important; }",
    ".md a { color: var(--glow) !important; }",
    ".md blockquote { border-left: 3px solid var(--sakura) !important; color: var(--mist) !important; }",
    ".md code, .md pre { background: #0D0B14 !important; color: #C9F2FF !important; border-radius: 8px; }",
    
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
  var hiddenSubsStyle = document.createElement('style');
  hiddenSubsStyle.id = 'userscript-hidden-subs-css';
  document.head.appendChild(hiddenSubsStyle);

  function updateHiddenSubredditsCss() {
      var subs = [];
      try {
          subs = JSON.parse(localStorage.getItem('userscript_hidden_subs') || '[]');
      } catch(e) {
          subs = [];
      }
      
      var cssRules = '';
      for (var j = 0; j < subs.length; j++) {
          cssRules += '#siteTable .thing.link[data-subreddit="' + subs[j] + '" i] { display: none !important; }\n';
      }
      document.getElementById('userscript-hidden-subs-css').textContent = cssRules;
  }

  updateHiddenSubredditsCss();

  /* ==========================================================================
     5. MAIN POST PROCESSING & FILTERING LOOP
     ========================================================================== */
  function processPosts() {
      var posts = document.querySelectorAll('.thing.link:not(.sakura-processed)');
      
      for (var i = 0; i < posts.length; i++) {
          var post = posts[i];
          post.classList.add('sakura-processed');

          var titleLink = post.querySelector('a.title');
          var titleText = titleLink ? titleLink.innerText.toLowerCase() : '';
          var subName = post.getAttribute('data-subreddit') || '';
          var subNameLower = subName.toLowerCase();

          // A. Keyword & Subreddit Filtering Check
          var matchesKeyword = false;
          for (var k = 0; k < keywords.length; k++) {
              if (titleText.indexOf(keywords[k].toLowerCase()) !== -1) {
                  matchesKeyword = true;
                  break;
              }
          }

          var matchesSub = false;
          for (var s = 0; s < filteredSubreddits.length; s++) {
              if (subNameLower.indexOf(filteredSubreddits[s].toLowerCase()) !== -1) {
                  matchesSub = true;
                  break;
              }
          }

          if (matchesKeyword || matchesSub) {
              post.classList.add('sakura-filtered-post');
              continue; // Skip further layout calculations for hidden posts
          }

          // B. Layout & Dynamic Enhancements
          var commentsLink = post.querySelector('.bylink.comments');
          var postUrl = post.getAttribute('data-url');
          var thumbnailLink = post.querySelector('a.thumbnail');
          var thumbnailImg = post.querySelector('a.thumbnail img');
          var expandoBtn = post.querySelector('.expando-button');
          var isGallery = post.getAttribute('data-is-gallery') === 'true';
          var isVideo = post.getAttribute('data-domain') === 'v.redd.it';
          
          // Mute Subreddit Button Injection
          var buttonsList = post.querySelector('.flat-list.buttons');
          if (buttonsList && subName) {
              if (!buttonsList.querySelector('.mute-sub-btn')) {
                  var hideLi = document.createElement('li');
                  var hideBtn = document.createElement('a');
                  hideBtn.href = 'javascript:void(0);';
                  hideBtn.className = 'mute-sub-btn';
                  hideBtn.innerText = 'mute r/' + subName;
                  
                  hideBtn.onclick = (function(sub) {
                      return function(e) {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          if (confirm('Are you sure you want to permanently mute all posts from r/' + sub + '?')) {
                              var currentHidden = [];
                              try {
                                  currentHidden = JSON.parse(localStorage.getItem('userscript_hidden_subs') || '[]');
                              } catch(err) {
                                  currentHidden = [];
                              }

                              if (currentHidden.indexOf(sub) === -1) {
                                  currentHidden.push(sub);
                                  localStorage.setItem('userscript_hidden_subs', JSON.stringify(currentHidden));
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
              var isImgur = postUrl.indexOf('imgur.com') !== -1 && postUrl.indexOf('/a/') === -1 && postUrl.indexOf('/gallery/') === -1;
              
              if (isDirectImage) {
                  thumbnailImg.src = postUrl;
              } else if (isImgur) {
                  thumbnailImg.src = postUrl + '.jpg';
              } else if (isGallery) {
                  var galleryMatch = thumbnailImg.src.match(/(?:preview|external-preview)\.redd\.it\/([a-zA-Z0-9.\-_]+)\?/);
                  if (galleryMatch) {
                      thumbnailImg.src = 'https://i.redd.it/' + galleryMatch[1];
                  }
              }
          }

          // Link Routing & Expando Logic
          if (titleLink && commentsLink) {
              titleLink.href = commentsLink.href;
              titleLink.removeAttribute('data-outbound-url');
              titleLink.removeAttribute('data-href-url');
          }

          if (thumbnailLink) {
              thumbnailLink.removeAttribute('data-outbound-url');
              thumbnailLink.removeAttribute('data-href-url');
          }

          if (thumbnailImg) {
              if (expandoBtn) {
                  expandoBtn.style.display = 'none';
                  thumbnailLink.href = 'javascript:void(0);';
                  thumbnailLink.onclick = (function(btn) {
                      return function(e) {
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
                  expandoBtn.style.display = 'block';
                  expandoBtn.style.float = 'left';
                  expandoBtn.style.margin = '4px 12px 4px 0';
              }
          }
      }
  }

  /* Run initially on load */
  processPosts();

  /* ==========================================================================
     6. DYNAMIC CONTENT & CLEANUP
     ========================================================================== */
  // Hide "Get New Reddit" links
  var links = document.getElementsByTagName('a');
  for (var k = 0; k < links.length; k++) {
      if (links[k].innerText && links[k].innerText.toLowerCase() === 'get new reddit') {
          links[k].style.display = 'none';
      }
  }

  // Observe page changes for endless scroll / Reddit Enhancement Suite (RES)
  var observer = new MutationObserver(function() {
      processPosts();
  });
  observer.observe(document.body, { childList: true, subtree: true });

})();
