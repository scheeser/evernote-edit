module.exports = (function () {
    var guidRegEx = /^\S+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\S*$/;

    return {
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
