var NoteEntryView = require('./note-entry-view');

module.exports.configDefaults = {
    developerAuthToken: ""
};

// TODO: Enable a workflow to set the auth token via a command.
module.exports.activate = function () {

    atom.workspaceView.command('evernote-edit:open-note', function () {
        var view = new NoteEntryView();
        view.attach();
    });
};
