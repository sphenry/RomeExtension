	function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
	

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

	function createGuid()
	{
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
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
			//  .set('Content-Length', message.length)
			.end((err, res) => {
				callback(err, res);
			});
	}

	function createActivity(uri, titleString, callback) {
		var uuid = uuidv4();

		superagent.get("http://cardedurls.azurewebsites.net/card?url=" + uri).end((err, res) =>  {
				//callback(err, res);
			var adaptiveCard = res;
				
			var activity = [{
				"appIdUrl": "https://mmxsdktest.azurewebsites.net/" + uuid,
				"appActivityId": uuid,		
				"activationUrl": uri,
				"name": titleString,
				"appDisplayName": "Continue from your phone",
				"backgroundColor": "black",
			"fallbackUrl": uri,
			"contentUrl": uri,
			"visualElements": {
				"attribution": {
					"iconUrl": "http://www.contoso.com/icon",
					"alternativeText": "Contoso, Ltd.",
					"addImageQuery": "false",
				},
        		"displayText": titleString,
        		"content": res.body
   			},
			"contentInfo": {
				"actionStatus": {
				"identifier": "crossDeviceTask",
				"name": "resumeTask"
				},
				"@context": "http://schema.org",
				"target": {
				"EntryPoint": {
					"actionPlatform": "desktop"
				}
				},
				"@type": "Action"
			}
			}];
			// {
			// 		"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
			// 		"type": "AdaptiveCard",
			// 		"body":
			// 		[{
			// 			"type": "TextBlock",
			// 			"text": "Contoso MainPage"
			// 		}]
       	 	// 	}


			var aString = JSON.stringify(activity);

			superagent
				.put('https://graph.microsoft.com/beta/me/activities/'+Math.floor(1 + Math.random() * 10000))
				.send(aString)
				.set('Authorization', 'Bearer ' + SECRETS.ACCESS_TOKEN)
				.set('Content-Type', 'text/plain')
				//  .set('Content-Length', message.length)
				.end((err, res) => {
					callback(err, res);
				});
		});
	}

		function createEngagement(uri, callback) {

		var now = new Date();
		var prevTime = new Date(now.getTime() - (5*60*1000)); //-5 mins
		var engagement = [{
    "startDateTime": prevTime.toISOString(),//"2017-05-09T10:54:04.3457274+00:00",
    "lastActiveDateTime": now.toISOString()
}]
		var eString = JSON.stringify(engagement);
		var uuid = createGuid();
		var newUri = uri.replace('https://activity.windows.com/V1', 'https://graph.microsoft.com/beta');

		superagent
			.put(newUri + '/historyItems/' + uuid)
			.send(eString)
			.set('Authorization', 'Bearer ' + SECRETS.ACCESS_TOKEN)
			.set('Content-Type', 'text/plain')
			//  .set('Content-Length', message.length)
			.end((err, res) => {
				callback(err, res);
			});
		
	}

	function getGraph() {
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
