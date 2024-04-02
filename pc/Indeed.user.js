// ==UserScript==
// @name        Indeed Streamliner
// @namespace   https://github.com/Alucrud/TamperMonkeyCrap/
// @match       https://www.indeed.com/jobs*
// @grant       GM_addStyle
// @version     0.1
// @author      Alucrud
// @icon        https://www.indeed.com/images/favicon.ico
// @description 3/27/2024, 4:39:52 AM
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @updateURL    https://github.com/Alucrud/TamperMonkeyCrap/raw/main/pc/Indeed.user.js
// ==/UserScript==

//// Replace contains with a case-insensitive version
jQuery.expr[':'].contains = function(a, i, m) {
  return jQuery(a).text().toUpperCase()
      .indexOf(m[3].toUpperCase()) >= 0;
};

////Variables
//Remove
var removeList = `
  Driver
  CDL
  Nurse
  Nursing
  RN
  LPN
  Physician
  Pediatrician
  Cardio
  Dentist
  Dental
  Supervisor
  General Manager
  Sales
  Electrician
  Therapist
  Mechanic
  Hairstylist
  Engineer
  Plumber
  Automotive Technician
  Military
  Attorney
  Professor
  HVAC
  Owner
  Scientist
  Student
  Paralegal
  Podiatrist
  Machinist
  Kitchen
  Restaurant
  Clinic
  Athletic
  Officer
  Groomer
`;

//Prioritize
var pList = `
  Coordinator
`;

//De-Prioritize
var dpList = `
  Technician
  Manager
  Installer
  Electrical
  Financial
`;

//Exclude
var eList = `
  Project Manager
  Program Manager
`;


//// Returns a Promise that resolves after "ms" Milliseconds
const timer = ms => new Promise(res => setTimeout(res, ms))

async function load () { // We need to wrap the loop into an async function for this to work
  for (var i = 0; i < 50; i++) {
    //Remove
    $.each(removeList.split(/\r?\n/), function(){
      var rep = this.trim();
      if (rep.length > 0){
        $("span:contains('" + rep + "')").closest("li").remove();
      };
    });

    //Prioritize
    $.each(pList.split(/\r?\n/), function(){
      var rep = this.trim();
      if (rep.length > 0){
        $("span:contains('" + rep + "')").css('color', 'yellow');
      };
    });

    //De-prioritize
    $.each(dpList.split(/\r?\n/), function(){
      var rep = this.trim();
      if (rep.length > 0){
        $("span:contains('" + rep + "')").closest(".cardOutline").css('opacity', '0.5');
      };
    });

    //Exclude
    $.each(eList.split(/\r?\n/), function(){
      var rep = this.trim();
      if (rep.length > 0){
        $("span:contains('" + rep + "')").closest(".cardOutline").css('opacity', '1');
      };
    });

    //De-prioritize visited postings
    $("span:contains('Visited')").closest(".cardOutline").css('opacity', '0.8');

      //loop stuff
      if(i<6) //runs 5 times quick, then slows down
      {
          await timer(500); // then the created Promise can be awaited
      }
      else
      {
          await timer(3000); // then the created Promise can be awaited
      }
  }
}

load();
