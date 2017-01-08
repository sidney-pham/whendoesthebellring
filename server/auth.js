// Based off Classes' server - Ram Kaniyur (https://github.com/quadrupleslap/classes).
// Uses cookies instead of stupid databases, with a newer version of simple-oauth2.
// Also, you're welcome future me and all other non-geniuses in the world for the 'internal documentation'.

module.exports = function(app, clientId, clientSecret, host) {
    'use strict';

    const callbackPath = '/callback',
          loginPath = '/login',
          logoutPath = '/logout',
          tokenPath = '/token',
          redirectUri = 'http://' + host + callbackPath;

    // Set the configuration settings.
    const credentials = {
        client: {
            id: clientId,
            secret: clientSecret
        },
        auth: {
            tokenHost: 'https://student.sbhs.net.au',
            tokenPath: '/api/token',
            authorizePath: '/api/authorize'
        }
    };

    // Initialize the OAuth2 Library.
    const oauth2 = require('simple-oauth2').create(credentials);

    // Authorization OAuth2 URI.
    const authorizationUri = oauth2.authorizationCode.authorizeURL({
        redirect_uri: redirectUri,
        scope: 'all-ro',
        state: 'sweeeeeet' // What do I do with this?
    });

    // Redirect login to SBHS Authorization endpoint.
    app.get(loginPath, function(req, res) {
        console.log(`Redirecting to: ${authorizationUri} for auth.`);
        res.redirect(authorizationUri);
    });

    // Remove token cookie for user.
    app.get(logoutPath, function(req, res) {
        res.clearCookie('token');
        res.redirect('/');
    });

    // Parse authorization token and request access token on callback.
    app.get(callbackPath, function(req, res) {
        // The code in the query parameter from authorization endpoint.
        const code = req.query.code;

        const options = {
            code: code,
            redirect_uri: redirectUri
        };

        // Save the access token as a cookie.
        function saveToken(error, result) {
            if (error) {
                console.error('Access Token Error', error.message);
                return res.status(500).json('Authentication failed');
            }

            // Use raw result from SBHS token endpoint and just add expiry.
            const cookieToken = Object.assign({
                expires_at: Date.now() + (result.expires_in * 1000)
            }, result);

            // Tell the browser to set the 'token' cookie.
            res.cookie('token', cookieToken, {
                maxAge: 90 * 24 * 60 * 60 * 100,
                httpOnly: true
            });

            return res.redirect('/');
        }

        /// Contact token endpoint to get token.
        oauth2.authorizationCode.getToken(options, saveToken);
    });

    // Whenever called, returns a valid access_token (if token cookie exists).
    app.get(tokenPath, function(req, res) {
        // Use cookie-parser to get the token cookie.
        const cookieToken = req.cookies.token;

        if (cookieToken) {
            // Create the access token wrapper to use simple-oauth2's methods.
            // cookieToken has no cool methods like expired() and refresh(),
            // so let's use simple-oauth2 to encapsulate better than Classes.
            const token = oauth2.accessToken.create(cookieToken);

            // Check if the token is expired. If expired it is refreshed.
            if (!token.expired()) {
                // Save your damn internet by not sending over unnecessary stuff every time.
                // Probably... I just copied Classes.
                res.json({
                    access_token: token.token.access_token,
                    expires_at: token.token.expires_at
                });
            } else {
                token.refresh(function(error, result) {
                    // Mostly duplication of saveToken.
                    if (error) {
                        console.error('Token Refresh Error', error.message);
                        return res.status(500).json('Token Refresh failed');
                    }

                    // Use raw result from SBHS token endpoint and just add expiry.
                    const cookieToken = Object.assign({
                        expires_at: Date.now() + (result.expires_in * 1000)
                    }, result);

                    // Tell the browser to set the 'token' cookie.
                    res.cookie('token', cookieToken, {
                        maxAge: 90 * 24 * 60 * 60 * 100,
                        httpOnly: true
                    });

                    // Your router says thanks.
                    res.json({
                        access_token: cookieToken.access_token,
                        expires_at: cookieToken.expires_at
                    });
                });
            }
        } else {
            res.status(401).json('Token cookie doesn\'t exist.');
        }
    });
};