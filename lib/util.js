var path = require('path'),
    fs = require('fs');

module.exports = (function () {
    var guidRegEx = /^\S+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\S*$/,
        authTokenFromFile = null;

    return {
        getEvernoteAuthorizationToken: function () {
            var authToken = atom.config.get('evernote-edit.developerAuthToken').trim(),
                authTokenPath;

            // Try to pull the auth token from a file or cache if the configuration isn't set.
            if (authToken === null || authToken.length === 0) {
                if (authTokenFromFile === null) {
                    authTokenPath = path.join(atom.getConfigDirPath(), 'evernote-edit.txt');

                    if (!fs.existsSync(authTokenPath)) {
                        return null;
                    }

                    authToken = fs.readFileSync(authTokenPath);
                    if (authToken === null) {
                        return null;
                    }

                    console.log('cache');
                    authTokenFromFile = authToken.toString().trim();
                }

                authToken = authTokenFromFile;
            }

            if (authToken === null || authToken.length === 0) {
                return null;
            }

            return authToken;
        },

        /*
         * Parses a GUID [1][2] from the provided input and return it.
         *
         * [1] http://dev.evernote.com/doc/reference/Types.html#Typedef_Guid
         * [2] https://dev.evernote.com/doc/articles/note_links.php
         */
        parseGuid: function (input) {
            var matches = input.match(guidRegEx);
            if (matches === null || matches.length === 0) {
                return null;
            }

            // The substring matches start at index 1. Pull the first.
            return matches[1];
        }
    };
}());
