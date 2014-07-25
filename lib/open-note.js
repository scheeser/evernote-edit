var Evernote = require('evernote').Evernote,
    util = require('./util');

module.exports = function (guid, asENML) {
    var grammars,
        grammar = null,
        // TODO: The authToken could come back as null...handle this.
        authToken = util.getEvernoteAuthorizationToken(),
        client = new Evernote.Client({token: authToken, sandbox: false}),
        // TODO: Can this be setup as a global and passed around?
        noteStore = client.getNoteStore(),
        i;

    if (asENML === true) {
        // TODO: Can probably do this on activation and store it somewhere globally.
        // TODO: Possible that the XML grammar isn't present
        grammars = atom.syntax.getGrammars();
        for (i = 0; i < grammars.length; i = i + 1) {
            if (grammars[i].name === 'XML') {
                grammar = grammars[i];
                break;
            }
        }
    }

    atom.workspace.open().done(function (editor) {
        noteStore.getNote(guid, true, false, false, false, function (err, note) {
            // TODO: Do something with err in these anonymous function calls.
            var noteText;

            if (asENML) {
                noteText = note.content;
            } else {
                noteText = util.parsePlaintextNote(note.content)
            }
            editor.setText(noteText);
            util.setNoteYAML(editor, note);

            if (grammar !== null) {
                editor.setGrammar(grammar);
            }
        });
    });
};
