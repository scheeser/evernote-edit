var path = require('path'),
    fs = require('fs'),
    // TODO: Cheerio may be a more robust option.
    htmlparser = require('htmlparser2');

module.exports = (function () {
    var guidRegEx = /^\S+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\S*$/,
        authTokenFromFile = null,
        yamlRegEx = /^(\w+):\s*([\S\w ]+?)\s*$/,
        textParserOptions = {
            xmlMode: true,
            recognizeSelfClosing: true,
            lowerCaseTags: true,
            decodeEntities: true
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
         * Parse supported YAML tags from the provided line of text and return as object
         * in the form {key: 'abc', value: 'def'}.
         */
        parseYAML: function (input) {
            var matches = input.match(yamlRegEx);
            if (matches === null || matches.length === 0) {
                return null;
            }

            // The substring matches start at index 1. Pull the two we need.
            return {
                key: matches[1],
                value: matches[2]
            };
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
                    line: null,
                    hasBr: false,

                    onopentag: function (tagname) {
                        // Every opening div is the start of a new line.
                        if (tagname === 'div') {
                            this.line = [];
                        } else if (tagname === 'br') {
                            this.hasBr = true;
                        }
                    },

                    ontext: function (text) {
                        // Push the context of each text node onto the line if one has been created.
                        if (this.line !== null && this.hasBr === false) {
                            this.line.push(text);
                        }
                    },

                    onclosetag: function (tagname) {
                        if (tagname !== 'div') {
                            return;
                        }

                        if (this.hasBr) {
                            // <br> are wrapped in div and represent a blank line.
                            noteLines.push('');
                        } else {
                            // <div> without <br> children have content we want to add to the line.
                            noteLines.push(this.line.join(''));
                        }

                        // Reset stateful variables for the next div
                        this.line = null;
                        this.hasBr = false;
                    }
                }, textParserOptions);
            parser.write(enml);
            parser.parseComplete();
            return noteLines.join('\n');
        }
    };
}());
