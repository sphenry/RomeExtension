function createGuid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0,
			v = c === 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

function launchUri(deviceId, uri, callback) {
	superagent
		.post('https://graph.microsoft.com/beta/me/devices/' + deviceId + '/commands')
		.send({
			"type": "launchUri",
			"payload": {
				"uri": uri
			}
		})
		.set('Authorization', 'Bearer ' + SECRETS.ACCESS_TOKEN)
		.set('Content-Type', 'application/json')
		.end((err, res) => {
			callback(err, res);
		});
}

function createActivity(uri, titleString, callback) {
	var uuid = createGuid();
	console.log("Calling CardedURLs");
	superagent.get("http://cardedurls.azurewebsites.net/card?url=" + uri).end((err, res) => {
		var adaptiveCard = res;

		var activity = [{
			"appIdUrl": "https://mmxsdktest.azurewebsites.net/" + uuid,
			//			"appIdUrl": "https://shenryblob.blob.core.windows.net/windowsappidentity",
			"appActivityId": uri,
			"activationUrl": uri,
			"name": titleString,
			"appDisplayName": "Chrome",
			"fallbackUrl": uri,
			"contentUrl": uri,
			"visualElements": {
				"attribution": {
					"iconUrl": "https://cdn.portableapps.com/GoogleChromePortable_256.png",
					"alternativeText": "Chrome",
					"addImageQuery": "false",
				},
				"displayText": titleString,
				"content": res.body
			}
		}];

		var aString = JSON.stringify(activity);

		superagent
			.put('https://graph.microsoft.com/beta/me/activities/' + Math.floor(1 + Math.random() * 10000))
			.send(aString)
			.set('Authorization', 'Bearer ' + SECRETS.ACCESS_TOKEN)
			.set('Content-Type', 'text/json')
			.end((err, res) => {
				callback(err, res);
			});
	});
}

function createEngagement(uri, callback) {

	var now = new Date();
	var prevTime = new Date(now.getTime() - (5 * 60 * 1000)); //-5 mins
	var engagement = [{
		"startedDateTime": prevTime.toISOString(), //"2017-05-09T10:54:04.3457274+00:00",
		"lastActiveDateTime": now.toISOString()
	}]
	var eString = JSON.stringify(engagement);
	var uuid = createGuid();
	var newUri = uri.replace('https://activity.windows.com/V1', 'https://graph.microsoft.com/beta');

	superagent
		.put(newUri + '/historyItems/' + uuid)
		.send(eString)
		.set('Authorization', 'Bearer ' + SECRETS.ACCESS_TOKEN)
		.set('Content-Type', 'text/json')
		//  .set('Content-Length', message.length)
		.end((err, res) => {
			callback(err, res);
		});

}

function getDeviceGraph() {
	var client = MicrosoftGraph.Client.init({
		debugLogging: true,
		authProvider: function (done) {
			done(null, SECRETS.ACCESS_TOKEN);
		}
	});

	client
		.api('/me/devices')
		.version("beta")
		.get((err, res) => {
			if (err) {
				console.log(err);
				return;
			}
			console.log(res);
			deviceList = res.value;
			buildDeviceTable(res.value);
		});
}