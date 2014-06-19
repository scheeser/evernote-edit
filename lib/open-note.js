var Evernote = require('evernote').Evernote;

module.exports = function (guid) {
    var authToken = atom.config.get('evernote-edit.developerAuthToken'),
        grammars = atom.syntax.getGrammars(),
        grammar = null,
        // TODO: Can this be setup as a global and passed around?
        client = new Evernote.Client({token: authToken, sandbox: false}),
        noteStore = client.getNoteStore(),
        i;

    // TODO: Can probably do this on activation and store it somewhere globally
    for (i = 0; i < grammars.length; i = i + 1) {
        if (grammars[i].name === 'XML') {
            grammar = grammars[i];
            break;
        }
    }

    atom.workspace.open().done(function (editor) {
        noteStore.getNote(guid, true, false, false, false, function (err, note) {
            // TODO: Do something with err
            editor.insertText(note.content);
            editor.setGrammar(grammar);
        });
    });
};
