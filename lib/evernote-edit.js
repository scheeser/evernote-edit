var Evernote = require('evernote').Evernote;
var NoteEntryView = require('./note-entry-view');

// TODO: Can do this on activiation and store it off somewhere pull from external file
var authToken = 'REPLACE';
var client = new Evernote.Client({token: authToken, sandbox: false});

module.exports.activate = function (state) {
    console.log('activate');

    return atom.workspaceView.command('evernote-edit:toggle', function () {
        console.log('command');
        // This assumes the active pane item is an editor
        // editor = atom.workspace.activePaneItem
        // editor.insertText('Hello, World!')

        // TODO: Can probably do this on activation and store it off somewhere
        var grammars = atom.syntax.getGrammars();
        var grammar = null;
        for (var i = 0; i< grammars.length; i++) {
            if (grammars[i].name === 'XML') {
                grammar = grammars[i];
                break;
            }
        }

        atom.workspace.open().done(function (editor) {
            view = new NoteEntryView(atom.workspace.getActiveEditor());
            view.attach();

            var noteStore = client.getNoteStore();
            // List all of the notebooks in the user's account
            // var notebooks = noteStore.listNotebooks(function (err, notebooks) {
            //     console.log('Found ' + notebooks.length + ' notebooks:');
            //     for (var i in notebooks) {
            //         console.log('  * ' + notebooks[i].name);
            //     }
            // });

            // http://dev.evernote.com/doc/articles/note_links.php
            // https://www.evernote.com/shard/s41/nl/4928747/75ab848a-5017-4baf-b6fc-f039c10a7300/ (mac)
            // https://www.evernote.com/shard/s41/nl/4928747/75ab848a-5017-4baf-b6fc-f039c10a7300?title=June%2017%2C%202014%20Year%20End%20Design (web copy to clipboard)
            // https://www.evernote.com/Home.action#st=p&n=75ab848a-5017-4baf-b6fc-f039c10a7300 (web toolbar)
            // https://www.evernote.com/shard/s41/view/notebook/75ab848a-5017-4baf-b6fc-f039c10a7300?locale=en#st=p&n=75ab848a-5017-4baf-b6fc-f039c10a7300 (open in separate window)
            var re = /^.+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}).*$/;
            var noteLink = 'https://www.evernote.com/shard/s41/nl/4928747/75ab848a-5017-4baf-b6fc-f039c10a7300/'
            var matches = noteLink.match(re);
            console.log(matches);
            if (matches == null || matches.length == 0) {
                return;
            } else {
                console.log(matches[1]);
            }
            noteStore.getNote(matches[1], true, false, false, false, function (err, note) {
                console.log(note.title);
                editor.insertText(note.content);
                editor.setGrammar(grammar);
            });
        });
    });
};
