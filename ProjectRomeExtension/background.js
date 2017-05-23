// Copyright (c) 2009 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var selectedId = -1;

function getQueryParams(qs) {
    var query_string = {};
    var vars = qs.split("#");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}

function launchUri(deviceId, uri, callback) {
    superagent
        .post('https://graph.microsoft.com/beta/me/devices/' + deviceId + '/commands')
        .send({
            "Type": "LaunchUri",
            "Payload": {
                "uri": uri
            }
        })
        .set('Authorization', 'Bearer ' + SECRETS.ACCESS_TOKEN)
        .set('Content-Type', 'application/json')
        //  .set('Content-Length', message.length)
        .end((err, res) => {
            callback(err, res);
        });
}

function refreshLanguage() {
  chrome.tabs.detectLanguage(null, function(language) {
    console.log(language);
    if (language == " invalid_language_code")
      language = "???";

    chrome.browserAction.setBadgeText({"text": language, tabId: selectedId});

      return;



    var redirectUri = chrome.identity.getRedirectURL('oauth2');
    GRAPH_APP = {
        id: 'f7360ed3-fb64-4e37-8cc7-ecd1eedb5269',
        scope: 'https://graph.microsoft.com/ccs.readWrite https://graph.microsoft.com/user.read',

        request_uri: 'https://login.live.com/oauth20_authorize.srf',
        redirect_uri: redirectUri
    };

    //ES6 template string!
    var requestUrl = `${GRAPH_APP.request_uri}?client_id=${GRAPH_APP.id}&response_type=token&scope=${GRAPH_APP.scope}&redirect_uri=${GRAPH_APP.redirect_uri}`;

    chrome.identity.launchWebAuthFlow({
        url: requestUrl,
        interactive: true
    }, function (url) {

        console.log('redirected to: ' + url);
        var query = getQueryParams(url);
        SECRETS.ACCESS_TOKEN = query.access_token;
         var tabUrl = 'http://bing.com';

         chrome.tabs.get(selectedId, function(tab) {
             console.log(tab.url);
              tabUrl = tab.url;
    //<option value="b2afd7e0-c5d6-5e24-be33-8cfe676d16e9">DESKTOP-DORLJT1</option>
            launchUri('b2afd7e0-c5d6-5e24-be33-8cfe676d16e9', tabUrl, (err, res) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log(res);
            });
        });
    });

   
    
  });
}

chrome.tabs.onUpdated.addListener(function(tabId, props) {
  if (props.status == "complete" && tabId == selectedId)
    refreshLanguage();
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, props) {
  selectedId = tabId;
  refreshLanguage();
});

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  selectedId = tabs[0].id;
  refreshLanguage();
});