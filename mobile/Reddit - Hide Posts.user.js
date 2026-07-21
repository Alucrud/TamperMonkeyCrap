// ==UserScript==
// @name         Hide Multiple Keywords on Reddit (Improved)
// @namespace    
// @version      0.7
// @description  Hides posts with specific keywords or subreddits on all Reddit pages, avoiding embedded content
// @author       Your Name
// @match        *://*.reddit.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const keywords = ['feel','CEO says','introduces bill','grok','i asked','cooked','rfk','upvote','slams','Press Secretary','Vance','Marjorie Taylor Greene','Drake','Kendrick','happy birthday','tesla','twitter','kanye','liberal','congress','spider','maga','woke','zuck','musk','elon','trump'];
    const subreddits = ['coaxed','vanderpump','lastofus','Wuthering','clashofclans','lostredditor','playboicarti','imaginary','4you','h3h3','stone','snorkblot','therewasanattempt','rareinsults','kanye','trump','youtube','KendrickLamar','19684','optimistsunite','mains','todayilearned','markmywords','tesla','facebook','cyberstuck','trashy','linkedin','ZZZ','getnoted','musk','joerogan','livestreamfail','nba','nfl','sports','meirl','_irl','meme','anime','shitpost','whenthe','economiccollapse','conservative','democrat','brawlstars','publicfreakout','cringe','funnyandsad','FacePalm','NikkeMobile','antiwork','workreform','spiders','jerk','comics','chainsawfolk','markiplier','AmIOverreacting','workreform','popculture','explainthejoke','bluesky','dank','peterexplains','india','losercity','programmerhumor','fortnite','onepiece','cfb','dandadan','ich_iel','zenless','finance','hololive','stonk','comebacks','ufc','buddy','wallstreet','bywords','twitter','leopards','formula','politic','adviceanimals','genshin','honkai'];

    function hidePosts() {
        // New Reddit
        const allPosts = Array.from(document.querySelectorAll('div[data-testid="post-container"], shreddit-post'))
            .filter(post => post.querySelector('h3, a[slot="title"]')); // Ensure it has a title

        allPosts.forEach(post => {
            const title = post.querySelector('h3, a[slot="title"]');
            const sub = post.querySelector('div[slot="credit-bar"]') || post.querySelector('a[data-click-id="subreddit"]');

            const matchesKeyword = title && keywords.some(k => title.innerText.toLowerCase().includes(k.toLowerCase()));
            const matchesSub = sub && subreddits.some(s => sub.innerText.toLowerCase().includes(s.toLowerCase()));

            if (matchesKeyword || matchesSub) {
                post.style.display = 'none';
            }
        });

        // Old Reddit
        const oldPosts = document.querySelectorAll('.thing');
        oldPosts.forEach(post => {
            const title = post.querySelector('a.title');
            const subreddit = post.getAttribute('data-subreddit');
            const matchesKeyword = title && keywords.some(k => title.innerText.toLowerCase().includes(k.toLowerCase()));
            const matchesSub = subreddit && subreddits.some(s => subreddit.toLowerCase().includes(s.toLowerCase()));

            if (matchesKeyword || matchesSub) {
                post.style.display = 'none';
            }
        });
    }

    hidePosts();

    const observer = new MutationObserver(() => hidePosts());
    observer.observe(document.body, { childList: true, subtree: true });
})();
