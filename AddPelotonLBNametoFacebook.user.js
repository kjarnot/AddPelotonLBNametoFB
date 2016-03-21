// ==UserScript==
// @name        AddPelotonLBNametoFB
// @downloadURL https://github.com/kjarnot/AddPelotonLBNametoFB/raw/master/AddPelotonLBNametoFacebook.user.js
// @namespace   http://www.jarnot.com
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @require     http://courses.ischool.berkeley.edu/i290-4/f09/resources/console.jq_xhr.js
// @require     https://github.com/kjarnot/AddPelotonLBNametoFB/raw/master/peloton_name_map.json
// @description Display LB name next to Facebook full user name
// @include     http://facebook.com/*
// @include     http://*.facebook.com/*
// @include     https://facebook.com/*
// @include     https://*.facebook.com/*
// @exclude     http://*.facebook.com/plugins/*
// @exclude     https://*.facebook.com/plugins/*
// @author      Kevin Jarnot
// @timestamp   1458051466388
// @version     0.9.0
// ==/UserScript==

var version = '1.0.0';
var version_timestamp = 1458051466388; // javascript:window.alert(new Date().getTime());
var release_date = 20160316;

var jsonNameMapURL = "https://github.com/kjarnot/AddPelotonLBNametoFB/raw/master/peloton_name_map.json";
var jsonNameMap = {};

// Global variable to track # of FB names found in DOM
var numFBNames = 0;

function checkMutationForNewComments(mutation) {
    if ((mutation === null) || (mutation.addedNodes === null)) {
        return false;
    }

    for (var index = 0; index < mutation.addedNodes.length; ++index) {
        var addedNode = mutation.addedNodes[index];
        if (addedNode === null) {
            continue;
        }
        addLBNames(addedNode);
    }

    console.log("Mutation!");

    return false;
}


var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
if (typeof MutationObserver !== 'undefined') {
    var mutationObserver = new MutationObserver(function (mutations) {
        mutations.some(checkMutationForNewComments);
    });
    mutationObserver.observe(window.document, { childList: true, subtree: true });
}

function addLBNames(root) {
    var updatedNumFBNames = 0;

    console.log("In addLBNames()");

    // Only run on Peloton-related pages
    if (/Peloton/i.test(document.title) === false) {
        return false;
    }

    var fbNames = document.evaluate('//a[@class=" UFICommentActorName"]', document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    console.log("Found " + fbNames.snapshotLength + " comments");

    updatedNumFBNames = fbNames.snapshotLength;
    if (updatedNumFBNames == numFBNames) {
        console.log("# of FB names has not changed.  Exiting addLBNames()...");
        return false;
    }

    for (var i = fbNames.snapshotLength - 1; i >= 0; i--) {
        var fbName = fbNames.snapshotItem(i);
        var nameText = fbName.innerText;
        console.log("Found FB name: " + nameText);
        var LBName = jsonNameMap[nameText];
        if (LBName) {
            console.log("Setting name to " + LBName);
            var newName = nameText + " (#" + LBName + ")";
            fbName.innerText = newName;
        }
    }

    return true;
}




$.ajax({
    url: jsonNameMapURL,
    async: true,
    dataType: 'json',
    success: function(data) {
        jsonNameMap = data;
        //console.log("Dumping name map...");
        //console.log(jsonNameMap);

        addLBNames(document.body);

    }
});
