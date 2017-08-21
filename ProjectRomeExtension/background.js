

var selectedId = -1;

function createActivityForTab(tabId) {
    chrome.tabs.get(tabId, function (tab) {
        var startingTabUrl = tab.url;
        setTimeout(function(){ //ignore re-directs
            chrome.tabs.get(tabId, function (tab) {
                var tabUrl = tab.url;
                
                if(startingTabUrl == tabUrl)
                {
                    var tabTitle = tab.title;
                    if (!tabTitle) {
                        tabTitle = tabUrl;
                    }

                    if(tabUrl.startsWith("http"))
                    {
                        createActivity(tabUrl, tabTitle, (err, res) => {
                            if (err) {
                                console.log(err);
                                
                                return;
                            }
                            console.log(res);
                            createEngagement(res.header.location, (err, res) => {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                console.log(res);
                            });
                        });

                    } 
                }
            });
        }, 10000);
    });
}

document.addEventListener('DOMContentLoaded', function () {

    var redirectUri = chrome.identity.getRedirectURL('oauth2');
    STACK_APP = {
        id: 'f7360ed3-fb64-4e37-8cc7-ecd1eedb5269',
        scope: 'https://graph.microsoft.com/ccs.readWrite https://graph.microsoft.com/UserTimelineActivity.Write.CreatedByApp https://graph.microsoft.com/user.read',

        request_uri: 'https://login.live.com/oauth20_authorize.srf',
        redirect_uri: redirectUri
    };

    //ES6 template string!
    var requestUrl = `${STACK_APP.request_uri}?client_id=${STACK_APP.id}&response_type=token&scope=${STACK_APP.scope}&redirect_uri=${STACK_APP.redirect_uri}`;

    chrome.identity.launchWebAuthFlow({
        url: requestUrl,
        interactive: true
    }, function (url) {

        console.log('redirected to: ' + url);
        var query = getQueryParams(url);
        SECRETS.ACCESS_TOKEN = query.access_token;
        // getGraph();
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, props) {
  if (props.status == "complete" && tabId == selectedId)
    createActivityForTab(tabId);
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, props) {
  selectedId = tabId;
  
});

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  if(tabs.length > 0)
  {
      selectedId = tabs[0].id;
    
  }
});