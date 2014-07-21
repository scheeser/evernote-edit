var Evernote = require('evernote').Evernote,
    util = require('./util'),
    builder = require('xmlbuilder');

function setNoteAttributes(note, yaml) {
    // TODO: Update to support notebook and tags
    switch (yaml.key) {
    case 'guid':
        note.guid = yaml.value;
        break;
    case 'title':
        note.title = yaml.value;
        break;
    }
}

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
        note = new Evernote.Note(),
        hasYAML = false,
        parsedYAML;

    // TODO: Support output of note content to Markdown. Implies I can go ENML -> Markdown
    for (i = 0; i < lines.length; i = i + 1) {
        line = lines[i];
        if (line !== null) {
            if (hasYAML === true) {
                parsedYAML = util.parseYAML(line);
                if (parsedYAML !== null) {
                    setNoteAttributes(note, parsedYAML);
                }
            } else {
                // Determine if given line is the start of the YAML block
                if (line === '---') {
                    hasYAML = true;
                } else {
                    // http://dev.evernote.com/doc/articles/enml.php#plaintext
                    container = enml.ele('div');

                    if (line.trim().length === 0) {
                        container.ele('br');
                    } else {
                        container.txt(line);
                    }
                }
            }
        }
    }

    // If the title is not defined in the YAML then set it to something.
    if (note.title === null) {
        note.title = activeEditor.getTitle();
    }
    note.content = enml.end({pretty: true, indent: '    ', newline: '\n'});

    if (note.guid === null) {
        noteStore.createNote(note, function (err, createdNote) {
            // TODO: Should do something if err is not null.
            // TODO: Append the guid and title of the saved note to the end of the note.
        });
    } else {
        // TODO: More robust checking around the guid could pre-emptively verify the guid is valid.
        noteStore.updateNote(note, function (err, updatedNote) {
            // TODO: Should do soemthing if err is not null.
        });
    }
};
