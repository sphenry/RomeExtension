
	function buildDeviceTable(obj) {
		var select = document.getElementById("devicelist");
		select.length = 0;
		for (var i = 0; i < obj.length; i++) {
			select.options[select.length] =
				new Option(obj[i]["Name"], obj[i]["id"]);
		}
		select.style.display = "block";
	}

	document.addEventListener('DOMContentLoaded', function () {

		var launchButton = document.getElementById('launchButton');

		launchButton.addEventListener('click', function () {
			var e = document.getElementById("devicelist");
			var deviceId = e.options[e.selectedIndex].value;

			var tabUrl = 'http://bing.com';
			chrome.tabs.getSelected(null, function (tab) {
				tabUrl = tab.url;

				launchUri(deviceId, tabUrl, (err, res) => {
					if (err) {
						console.log(err);
						return;
					}
					console.log(res);
				});
			});


		}, false);

    		var activityButton = document.getElementById('activityButton');

		activityButton.addEventListener('click', function () {
			var tabUrl = 'http://bing.com';
			chrome.tabs.getSelected(null, function (tab) {
				tabUrl = tab.url;
				

				createActivity(tabUrl, tab.title,  (err, res) => {
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
			});


		}, false);

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
			getGraph();
		});
	});