var Evernote = require('evernote').Evernote,
    util = require('./util');

/*
 * Get the atom grammar using the provided scope name.
 */
function getGrammarFromScopeName(scopeName) {
    var i,
        grammars = atom.syntax.getGrammars(),
        grammar = null;

    for (i = 0; i < grammars.length; i = i + 1) {
        if (grammars[i].scopeName === scopeName) {
            grammar = grammars[i];
            break;
        }
    }

    return grammar;
}

module.exports = function (guid, asENML) {
    // TODO: The authToken could come back as null...handle this.
    var authToken = util.getEvernoteAuthorizationToken(),
        useSandboxAccount = atom.config.get('evernote-edit.useSandboxAccount'),
        client = new Evernote.Client({token: authToken, sandbox: useSandboxAccount}),
        noteStore = client.getNoteStore();

    atom.workspace.open().done(function (editor) {
        noteStore.getNote(guid, true, false, false, false, function (err, note) {
            // TODO: Do something with err in these anonymous function calls.
            var noteText = note.content,
                grammarScopeName = null;
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

            // Determine and set the proper grammar for the retrieved note.
            if (asENML === true) {
                grammarScopeName = 'text.xml';
            } else if (note.attributes !== null && note.attributes.classifications !== null) {
                grammarScopeName = note.attributes.classifications.atom_grammar;
                // Lob the prevfix off the classification if present.
                grammarScopeName = grammarScopeName.replace('CLASSIFICATION_', '');
            }

            if (grammarScopeName !== null) {
                editor.setGrammar(getGrammarFromScopeName(grammarScopeName));
            }
        });
    });
};
