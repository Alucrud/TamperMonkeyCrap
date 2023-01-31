// ==UserScript==
// @name        Confluence
// @namespace   https://github.com/Alucrud/TamperMonkeyCrap/
// @description Adds a "Clear Checkboxes" button to Confluence
// @match       *://*.atlassian.net/wiki/*
// @version     1.01
// @updateURL   https://github.com/Alucrud/TamperMonkeyCrap/raw/main/work/Confluence.user.js
// @grant       GM_addStyle
// ==/UserScript==

//Variables for added elements
var zNode = document.createElement ('div');
zNode.innerHTML = '<button id="myButton" type="button">'
                + 'Uncheck All Boxes</button>'
                ;
zNode.setAttribute ('id', 'myContainer');

//Run the function when the page is loaded
document.addEventListener ("load", addButton);

//...also when clicking because it doesn't trigger when you navigate to other pages otherwise...
document.addEventListener ("click", addButton);

//Add elements and activate button
function addButton() {
    //Add element
    document.getElementById("AkTopNav").appendChild(zNode);

    //Activate button.
    document.getElementById ("myButton").addEventListener ("click", ButtonClickAction, false);
}

//Uncheck all boxes, when button is clicked
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
