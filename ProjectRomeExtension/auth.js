
var redirectUri = chrome.identity.getRedirectURL('oauth2');
OAUTH_APP = {
    id: 'f7360ed3-fb64-4e37-8cc7-ecd1eedb5269',
    scope: 'user.read Device.Read Device.Command UserTimelineActivity.Write.CreatedByApp offline_access',
    //scope: 'https://graph.microsoft.com/ccs.readWrite https://graph.microsoft.com/UserTimelineActivity.Write.CreatedByApp https://graph.microsoft.com/user.read',

    request_uri: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    redirect_uri: redirectUri
};



function login()
{
    return new Promise(function(resolve, reject) {

        var token = localStorage.getItem('ACCESS_TOKEN');
        var refresh_token = localStorage.getItem('REFRESH_TOKEN');

        var expire_date = Date.parse(localStorage.getItem('TOKEN_EXPIRE'));
        var expired = isNaN(expire_date) ||  new Date() > expire_date;
        
        if(expired && refresh_token)
        {
            //use refresh token
            superagent
                .post('https://login.microsoftonline.com/common/oauth2/v2.0/token')
                .send('client_id=' + OAUTH_APP.id)
                .send('scope=' + OAUTH_APP.scope)
                .send('redirect_uri=' + OAUTH_APP.redirect_uri)
                .send('grant_type=refresh_token')
                .send('client_secret=njsjZCV749@-;zssPQDZ24%')
                .send('refresh_token=' + refresh_token)
                .end((err, res) => {
                    SECRETS.ACCESS_TOKEN = res.body.access_token;
                    localStorage.setItem('ACCESS_TOKEN', res.body.access_token);
                    SECRETS.REFRESH_TOKEN = res.body.refresh_token;
                    localStorage.setItem('REFRESH_TOKEN', res.body.refresh_token);
                    
                    var t = new Date();
                    t.setSeconds(t.getSeconds() + res.body.expires_in);
                    localStorage.setItem('TOKEN_EXPIRE', t);
                    
                    resolve(true);
                    //getGraph();
                });
        }
        else if(token == null) // get new access token
        {
            var redirectUri = chrome.identity.getRedirectURL('oauth2');


            //ES6 template string!
            var requestUrl = `${OAUTH_APP.request_uri}?client_id=${OAUTH_APP.id}&response_type=code&scope=${OAUTH_APP.scope}&redirect_uri=${OAUTH_APP.redirect_uri}`;

            chrome.identity.launchWebAuthFlow({
                url: requestUrl,
                interactive: true
            }, function (url) {

                console.log('redirected to: ' + url);
                var query = getQueryParams(url);
                var code = getParameterByName('code', url);
                superagent
                .post('https://login.microsoftonline.com/common/oauth2/v2.0/token')
                .send('client_id=' + OAUTH_APP.id)
                .send('scope=' + OAUTH_APP.scope)
                .send('redirect_uri=' + OAUTH_APP.redirect_uri)
                .send('grant_type=authorization_code')
                .send('client_secret=njsjZCV749@-;zssPQDZ24%')
                .send('code=' + code)
                .end((err, res) => {
                    SECRETS.ACCESS_TOKEN = res.body.access_token;
                    localStorage.setItem('ACCESS_TOKEN', res.body.access_token);
                    SECRETS.REFRESH_TOKEN = res.body.refresh_token;
                    localStorage.setItem('REFRESH_TOKEN', res.body.refresh_token);
                    
                    var t = new Date();
                    t.setSeconds(t.getSeconds() + res.body.expires_in);
                    localStorage.setItem('TOKEN_EXPIRE', t);
                    
                    resolve(true);
                    //getGraph();
                });


                //SECRETS.ACCESS_TOKEN = query.access_token;
                resolve(true);
                //getGraph();
            });
        }
        else
        {
            SECRETS.ACCESS_TOKEN =  token;
            resolve(true);
            //getGraph();
        }
    });
}