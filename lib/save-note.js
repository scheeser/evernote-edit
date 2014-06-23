var Evernote = require('evernote').Evernote,
    util = require('./util'),
    builder = require('xmlbuilder');

module.exports = function () {
    var activeEditor = atom.workspace.getActiveEditor(),
        // TODO: Text could be empty.
        lines = activeEditor.getText().split(/\r\n?|\n/),
        line,
        container,
        enml = builder.create('en-note', {
            version: '1.0',
            encoding: 'UTF-8',
            standalone: false,
            sysID: 'http://xml.evernote.com/pub/enml2.dtd'
        }),
        i,
        authToken = util.getEvernoteAuthorizationToken(),
        client = new Evernote.Client({token: authToken, sandbox: false}),
        noteStore = client.getNoteStore(),
        note
        title = activeEditor.getPath();

    for (i = 0; i < lines.length; i = i + 1) {
        line = lines[i];
        if (line !== null) {
            // http://dev.evernote.com/doc/articles/enml.php#plaintext
            container = enml.ele('div');

            if (line.trim().length === 0) {
                container.ele('br');
            } else {
                container.txt(line);
            }
        }
    }

    if (title === null || title === undefined) {
        title = 'untitled';
    }

    note = new Evernote.Note();
    note.title = title;
    note.content = enml.end({pretty: true, indent: '    ', newline: '\n'});

    noteStore.createNote(note, function (err, createdNote) {
        // console.log("Successfully created a new note with GUID: " + createdNote.guid);
        // TODO: Build and copy a note URL to the clipboard
        // https://dev.evernote.com/doc/articles/note_links.php
        // https://atom.io/docs/api/v0.106.0/api/classes/Clipboard.html
    });
};
