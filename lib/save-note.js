var Evernote = require('evernote').Evernote,
    util = require('./util'),
    builder = require('xmlbuilder');

/*
 * Using the provided yaml object {key: x, value: y} set
 * the associated values on the provided note.
 */
function setNoteDetails(note, yaml) {
    switch (yaml.key) {
    case 'guid':
        note.guid = yaml.value;
        break;
    case 'title':
        note.title = yaml.value;
        break;
    }
}

function buildNoteAttributes(editor, existingNote) {
    var noteAttributes,
        grammar = editor.getGrammar();

    if (grammar === null) {
        return null;
    }

    if (existingNote === null || existingNote === undefined) {
        noteAttributes = new Evernote.NoteAttributes();
        noteAttributes.sourceApplication = 'Atom';
        noteAttributes.source = 'evernote-edit plugin';
    } else if (existingNote.noteAttributes === null) {
        noteAttributes = new Evernote.NoteAttributes();
    }

    if (noteAttributes.classifications === null) {
        noteAttributes.classifications = {};
    }

    /*
     * Classifications should be prefixed with 'CLASSIFICATION_' according to evernote docs.
     *
     * https://dev.evernote.com/doc/reference/Types.html#Struct_NoteAttributes
     */
    noteAttributes.classifications.atomGrammar = 'CLASSIFICATION_' + grammar.scopeName;

    return noteAttributes;
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
            sysID: 'http://xml.evernote.com/pub/enml2.dtd'
        }),
        i,
        authToken = util.getEvernoteAuthorizationToken(),
        useSandboxAccount = atom.config.get('evernote-edit.useSandboxAccount'),
        client = new Evernote.Client({token: authToken, sandbox: useSandboxAccount}),
        noteStore = client.getNoteStore(),
        note = new Evernote.Note(),
        hasYAML = false,
        parsedYAML,
        noteAttributes;

    for (i = 0; i < lines.length; i = i + 1) {
        line = lines[i];
        if (line !== null) {
            if (hasYAML === true) {
                parsedYAML = util.parseYAML(line);
                if (parsedYAML !== null) {
                    setNoteDetails(note, parsedYAML);
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
                        /*
                         * Replace unicode character 32 (space) with 160 (non-breaking space) for each
                         * line. Corrects the display of whitespace characters in Evernote applications.
                         *
                         * https://github.com/scheeser/evernote-edit/issues/12
                         */
                        line = line.replace(/\u0020/g, String.fromCharCode(160));
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

    // Save or update the note depending on the presence of the unique guid in the YAML
    if (note.guid === null) {
        note.attributes = buildNoteAttributes(activeEditor);

        noteStore.createNote(note, function (err, createdNote) {
            // TODO: Should do something if err is not null.
            util.setNoteYAML(activeEditor, createdNote);
        });
    } else {
        noteStore.getNote(note.guid, false, false, false, false, function (readErr, existingNote) {
            // TODO: Do something with readErr
            note.attributes = buildNoteAttributes(activeEditor, existingNote);

            noteStore.updateNote(note, function (saveErr, updatedNote) {
                // TODO: Should do something if saveErr is not null.
                util.setNoteYAML(activeEditor, updatedNote);
            });
        });
    }
};
