var path = require('path'),
    fs = require('fs'),
    cheerio = require('cheerio');

module.exports = (function () {
    var guidRegEx = /^\S+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\S*$/,
        authTokenFromFile = null,
        yamlRegEx = /^(\w+):\s*([\S\w ]+?)\s*$/;

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
         * Append the note attributes in YAML format to the end of the buffer associated to the
         * provided editor. Only note attributes not present in the text will be appended.
         */
        setNoteYAML: function (editor, note) {
            var textBuffer = editor.getBuffer(),
                cursorPosition = editor.getCursorBufferPosition(),
                yamlStartPoint = null,
                yamlEndPoint = textBuffer.getEndPosition(),
                yamlEndRow,
                yamlRange,
                yamlBlock = [],
                hasGuid = false,
                hasTitle = false;

            // Find the buffer range of any existing YAML blocks appended to the note
            textBuffer.backwardsScan(/^\-\-\-$/, function (match) {
                yamlStartPoint = match.range.start;
                match.stop();
            });

            // If there is no YAML block add one to the end of the file.
            if (yamlStartPoint === null) {
                yamlBlock = ['\n---', '\nguid: ', note.guid, '\ntitle: ', note.title];

                textBuffer.append(yamlBlock.join(''));

                // Reset cursor buffer position back to location prior to the text modification
                editor.setCursorBufferPosition(cursorPosition);
                return;
            }

            // Determine where the YAML block ends accounting for any trailing blank lines.
            if (textBuffer.isRowBlank(yamlEndPoint.row)) {
                yamlEndRow = textBuffer.previousNonBlankRow(yamlEndPoint.row);
                yamlEndPoint = textBuffer.rangeForRow(yamlEndRow, false).end;
            }
            yamlRange = [yamlStartPoint, yamlEndPoint];

            // Determine the missing note attributes.
            textBuffer.backwardsScanInRange(/^guid:\s*[\S\w ]+?\s*$/, yamlRange, function (match) {
                hasGuid = true;
                match.stop();
            });
            textBuffer.backwardsScanInRange(/^title:\s*[\S\w ]+?\s*$/, yamlRange, function (match) {
                hasTitle = true;
                match.stop();
            });

            if (hasGuid !== true) {
                yamlBlock.push('\nguid: ', note.guid);
            }
            if (hasTitle !== true) {
                yamlBlock.push('\ntitle: ', note.title);
            }

            if (yamlBlock.length === 0) {
                // All the supported fields are present. Nothing to do.
                return;
            }

            textBuffer.insert(yamlEndPoint, yamlBlock.join(''));

            // Reset cursor buffer position back to what it was prior to the text insert
            editor.setCursorBufferPosition(cursorPosition);
        },

        /*
         * Take an string in ENML and convert it to plaintext according to the Evernote
         * developer documents [1]. ENML is expexcted to be in the format described
         * in the developer documentation.
         *
         * [1] http://dev.evernote.com/doc/articles/enml.php#plaintext
         */
        parsePlaintextNote: function (enml) {
            var $ = cheerio.load(enml),
                noteLines = [];

            // Iterate through the top most div in the parent document.
            $('en-note').children('div').each(function () {
                var $element = $(this);

                if ($element.find('br').length !== 0) {
                    /*
                     * The div contains a <br /> add an empty line to the note body.
                     * There should not be any text when a <br /> is in the div.
                     */
                    noteLines.push('');
                } else {
                    // Add the text of the div element as a newline.
                    noteLines.push($element.text());
                }
            });

            return noteLines.join('\n');
        }
    };
}());
