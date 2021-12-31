// ==UserScript==
// @name Dayforce Sign In
// @namespace    https://github.com/Alucrud/TamperMonkeyCrap/
// @version      0.2
// @match        https://adfs.linncounty.org/adfs/ls/idpinitiatedSignOn.aspx
// @grant        none
// @noframes
// @run-at       document-idle
// @updateURL    https://github.com/Alucrud/TamperMonkeyCrap/raw/main/mobile/Dayforce.user.js
// ==/UserScript==

document.getElementById("idp_OtherRpRadioButton").click();

//click "sign in to one of the following sites"
var objSelect = document.getElementById("idp_RelyingPartyDropDownList");

//Set selected
setSelectedValue(objSelect, "Dayforce");

//function to find specific dropdown text
function setSelectedValue(selectObj, valueToSet) {
    for (var i = 0; i < selectObj.options.length; i++) {
        if (selectObj.options[i].text== valueToSet) {
            selectObj.options[i].selected = true;
            return;
        }
    }
}

//Click "sign in"
document.getElementById("idp_GoButton").click();
