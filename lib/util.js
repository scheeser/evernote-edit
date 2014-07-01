var path = require('path'),
    fs = require('fs')
    htmlparser = require('htmlparser2');

module.exports = (function () {
    var guidRegEx = /^\S+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\S*$/,
        authTokenFromFile = null,
        textParserOptions = {
            xmlMode: true,
            recognizeSelfClosing: true
        };

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
        },

        /*
         * Take an string in ENML and convert it to plaintext according to the Evernote
         * developer documents [1]. ENML is expexcted to be in the format described
         * in the developer documentation.
         *
         * [1] http://dev.evernote.com/doc/articles/enml.php#plaintext
         */
        parsePlaintextNote: function (enml) {
            var noteLines = [],
                parser = new htmlparser.Parser({
                    ontext: function (text) {
                        // Only non-empty text contributes a line to the body of text.
                        if (text !== null && text.trim().length > 0) {
                            noteLines.push(text);
                        }
                    },

                    onclosetag: function (tagname) {
                        // <br /> is equivalent to a blank line.
                        if (tagname === 'br'){
                            noteLines.push('');
                        }
                    }
                }, textParserOptions);
            parser.write(enml);
            parser.parseComplete();
            return noteLines.join('\n');
        }
    };
}());
