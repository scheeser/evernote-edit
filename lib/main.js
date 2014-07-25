var NoteEntryView = require('./note-entry-view'),
    saveNote = require('./save-note');

module.exports.configDefaults = {
    developerAuthToken: "",
    useSandboxAccount: false
};

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
