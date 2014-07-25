var NoteEntryView = require('./note-entry-view'),
    saveNote = require('./save-note');

module.exports.configDefaults = {
    developerAuthToken: ""
};

// TODO: Enable a workflow to set the auth token via a command.
module.exports.activate = function () {

    atom.workspaceView.command('evernote-edit:open-note', function () {
        var view = new NoteEntryView(false);
        view.attach();
    });

    atom.workspaceView.command('evernote-edit:open-note-as-enml', function () {
        var view = new NoteEntryView(true);
        view.attach();
    });

    atom.workspaceView.command('evernote-edit:save-note', function () {
        saveNote();
    });
};
