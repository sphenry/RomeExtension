	
function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[#?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}

function getQueryParams2(qs) {
	var query_string = {};
  var vars = qs.split("#");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
  return query_string;
}

function getGraph() {
    	var client = MicrosoftGraph.Client.init({
			debugLogging: true,
			authProvider: function(done) {
				done(null, SECRETS.ACCESS_TOKEN);
			}
		});

		client
			.api('/me')
			.select("displayName")
			.get((err, res) => {
				if (err) {
					console.log(err);
					return;
				}
				console.log(res);
			});

		// Example of downloading the user's profile photo and displaying it in an img tag
		client
			.api('/me/photo/$value')
			.responseType('blob')
			.get((err, res, rawResponse) => {
				if (err) throw err;

				const url = window.URL;
				const blobUrl = url.createObjectURL(rawResponse.xhr.response);
				document.getElementById("profileImg").setAttribute("src", blobUrl);
			});
}

    
    document.addEventListener('DOMContentLoaded', function() {
     console.log("Hello!");
	 var redirectUri = chrome.identity.getRedirectURL('oauth2');
	 STACK_APP = {
    id           : 'f7360ed3-fb64-4e37-8cc7-ecd1eedb5269',
    scope        : 'https://graph.microsoft.com/ccs.readWrite https://graph.microsoft.com/user.read',

    request_uri  : 'https://login.live.com/oauth20_authorize.srf',
    redirect_uri : redirectUri
};
//ES6 template string!
var requestUrl = `${STACK_APP.request_uri}?client_id=${STACK_APP.id}&response_type=token&scope=${STACK_APP.scope}&redirect_uri=${STACK_APP.redirect_uri}`;
//https://developer.chrome.com/extensions/identity
//https://developer.chrome.com/extensions/app_identity#update_manifest
chrome.identity.launchWebAuthFlow({
    url         : requestUrl,
    interactive : true
}, function (url) {
	
    console.log('redirected to: ' + url);
var query = getQueryParams2(url);
SECRETS.ACCESS_TOKEN = query.access_token;
getGraph();
});
    


		function updateProfilePicture() {
			var file = document.querySelector('input[type=file]').files[0];
			var reader = new FileReader();

			reader.addEventListener("load", function () {
				client
					.api('/me/photo/$value')
					.put(file, (err, res) => {
						if (err) {
							console.log(err);
							return;
						}
						console.log("We've updated your picture!");
					});
			}, false);

			if (file) {
				reader.readAsDataURL(file);
			}
		}
});
    
