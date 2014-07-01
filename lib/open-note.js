var Evernote = require('evernote').Evernote,
    util = require('./util');

module.exports = function (guid) {
    var grammars = atom.syntax.getGrammars(),
        grammar = null,
        // TODO: The authToken could come back as null...handle this.
        authToken = util.getEvernoteAuthorizationToken(),
        client = new Evernote.Client({token: authToken, sandbox: false}),
        // TODO: Can this be setup as a global and passed around?
        noteStore = client.getNoteStore(),
        i;

    // TODO: Can probably do this on activation and store it somewhere globally.
    // TODO: Possible that the XML grammar isn't present
    // TODO: New action to open a note as ENML
    // for (i = 0; i < grammars.length; i = i + 1) {
    //     if (grammars[i].name === 'XML') {
    //         grammar = grammars[i];
    //         break;
    //     }
    // }

    atom.workspace.open().done(function (editor) {
        noteStore.getNote(guid, true, false, false, false, function (err, note) {
            // TODO: Do something with err in these anonymous function calls.
            noteStore.getNotebook(note.notebookGuid, function (err, notebook) {
                var content = [
                    util.parsePlaintextNote(note.content), '\n---',
                    '\nguid: ', note.guid,
                    '\nnotebook: ', notebook.name,
                    '\ntitle: ', note.title];
                editor.insertText(content.join(''));
                // editor.setGrammar(grammar);
            });
        });
    });
};
