var NoteEntryView = require('./note-entry-view');

module.exports.configDefaults = {
    developerAuthToken: ""
};

module.exports.activate = function () {

    atom.workspaceView.command('evernote-edit:open-note', function () {
        var view = new NoteEntryView();
        view.attach();
    });
};
