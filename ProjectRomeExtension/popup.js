
	function buildDeviceTable(obj) {
		var select = document.getElementById("devicelist");
		select.length = 0;
		for (var i = 0; i < obj.length; i++) {
			select.options[select.length] =
				new Option(obj[i]["Name"], obj[i]["id"]);
		}
		select.style.display = "block";
	}

	function getParameterByName(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
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
				var tabTitle = tab.title;

				if (!tabTitle) {
					tabTitle = tabUrl;
				}

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
			});
		}, false);

		login().then(function(response) {
			console.log("Success!", response);
			getGraph();
		  }, function(error) {
			console.error("Failed!", error);
		  })
	});