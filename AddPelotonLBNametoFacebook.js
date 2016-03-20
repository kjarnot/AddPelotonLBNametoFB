// ==UserScript==
// @name        AddPelotonLBNametoFB
// @namespace   http://www.jarnot.com
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @require     http://courses.ischool.berkeley.edu/i290-4/f09/resources/gm_jq_xhr.js
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

var jsonNameMapURL = "http://playground.jarnot.com/peloton/peloton_name_map.json";
var jsonNameMap = {};

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

    GM_log("Mutation!");

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
    GM_log("In addLBNames()");

    // Only run on Peloton-related pages
    if (/Peloton/i.test(document.title) === false) {
        return false;
    }

    var fbNames = document.evaluate('//a[@class=" UFICommentActorName"]', document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    GM_log("Found " + fbNames.snapshotLength + " comments");

    for (var i = fbNames.snapshotLength - 1; i >= 0; i--) {
        var fbName = fbNames.snapshotItem(i);
        var nameText = fbName.innerText;
        GM_log("Found FB name: " + nameText);
        var LBName = jsonNameMap[nameText];
        if (LBName) {
            GM_log("Setting name to " + LBName);
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
        //GM_log("Dumping name map...");
        //GM_log(jsonNameMap);

        addLBNames(document.body);

    }
});
