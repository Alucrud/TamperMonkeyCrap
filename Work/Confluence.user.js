// ==UserScript==
// @name        Confluence
// @namespace   https://github.com/Alucrud/TamperMonkeyCrap/
// @description Adds a "Clear Checkboxes" button to Confluence
// @match       *://*.atlassian.net/wiki/*
// @version     2
// @updateURL   https://github.com/Alucrud/TamperMonkeyCrap/raw/main/Work/Confluence.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=atlassian.net
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant       GM_addStyle
// ==/UserScript==


//Variables for added elements
var zNode = document.createElement ('div');
zNode.innerHTML = '<p>Custom Functions: '
                + '<button id="myButton" type="button">'
                + 'Uncheck All Boxes</button></p>'
                ;
zNode.setAttribute ('id', 'myContainer');

//Run the function when the edit button appears
waitForKeyElements ("#editPageLink", addButton);

//Add elements and activate button
function addButton() {
    //If the element doesn't already exist...
    var myEle = document.getElementById("#myContainer");
    if(!myEle){
        //Add element
        document.getElementById("AkTopNav").appendChild(zNode);

        //Activate button.
        document.getElementById ("myButton").addEventListener ("click", ButtonClickAction, false);
    }
}

//When button is clicked - uncheck all boxes
function ButtonClickAction (zEvent) {
    Object.values(document.querySelectorAll('input[type=checkbox]')).forEach(function(item) {
        if (item.checked) {
            item.click()
        }
    });
}

//CSS Styles for container / button
GM_addStyle ( `
    #myContainer {
        float: right;
    }
    #myButton {
        cursor: pointer !important;
        color: #fff;
        background-color: #d17338;
        border-color: #c46225;

        padding: 3px;
        padding-left: 10px;
        padding-right: 10px;

        border-radius: 7px;
        shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
        transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }
    #myButton:Hover {
        color: #fff;
        background-color: #f28641;
    }
    #myButton:Focus {
        shadow-rgb: 49, 132, 253;
    }
    #AkTopNav {
        margin-bottom: 25px;
    }
` );
