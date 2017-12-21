

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

    login().then(function(response) {
        console.log("Background Success!", response);
      }, function(error) {
        console.error("Background Failed!", error);
      })
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