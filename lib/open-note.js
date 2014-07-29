var Evernote = require('evernote').Evernote,
    util = require('./util');

module.exports = function (guid, asENML) {
    var grammar = null,
        // TODO: The authToken could come back as null...handle this.
        authToken = util.getEvernoteAuthorizationToken(),
        useSandboxAccount = atom.config.get('evernote-edit.useSandboxAccount'),
        client = new Evernote.Client({token: authToken, sandbox: useSandboxAccount}),
        noteStore = client.getNoteStore();

    if (asENML === true) {
        grammar = util.getGrammar('XML');
    }

    atom.workspace.open().done(function (editor) {
        noteStore.getNote(guid, true, false, false, false, function (err, note) {
            // TODO: Do something with err in these anonymous function calls.
            var noteText = note.content;

            /*
             * Replace occurances of the non-breaking space (unicode 160) from the note
             * with the standard space character (unicode 32). Ensures space can be
             * searched when opening note in Atom.
             *
             * https://github.com/scheeser/evernote-edit/issues/12
             */
            noteText = noteText.replace(/\u00A0/g, String.fromCharCode(32));

            if (asENML === false) {
                noteText = util.parsePlaintextNote(noteText);
            }
            editor.setText(noteText);
            editor.setCursorBufferPosition([0, 0]);
            util.setNoteYAML(editor, note);

            if (grammar !== null) {
                editor.setGrammar(grammar);
            }
        });
    });
};
