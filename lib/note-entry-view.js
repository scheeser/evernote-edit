// https://github.com/atom/package-generator/blob/master/lib/package-generator-view.coffee

var $, EditorView, NoteEntryView, View, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ref = require('atom'), $ = _ref.$, EditorView = _ref.EditorView, View = _ref.View;

module.exports = NoteEntryView = (function(_super) {
  __extends(NoteEntryView, _super);

  function NoteEntryView() {
    return NoteEntryView.__super__.constructor.apply(this, arguments);
  }

  NoteEntryView.prototype.previouslyFocusedElement = null;

  NoteEntryView.content = function() {
    return this.div({
      "class": 'package-generator overlay from-top'
    }, (function(_this) {
      return function() {
        _this.div('message');
        return _this.subview('miniEditor', new EditorView({
          mini: true
        }));
      };
    })(this));
  };

  NoteEntryView.prototype.initialize = function() {
    this.miniEditor.hiddenInput.on('focusout', (function(_this) {
      return function() {
        return _this.detach();
      };
    })(this));
    this.on('core:confirm', (function(_this) {
      return function() {
        return _this.confirm();
      };
    })(this));
    return this.on('core:cancel', (function(_this) {
      return function() {
        return _this.detach();
      };
    })(this));
  };

  NoteEntryView.prototype.attach = function(mode) {
    this.mode = mode;
    this.previouslyFocusedElement = $(':focus');
    atom.workspaceView.append(this);
    return this.miniEditor.focus();
  };

  NoteEntryView.prototype.detach = function() {
    var _ref1;
    if (!this.hasParent()) {
      return;
    }
    if ((_ref1 = this.previouslyFocusedElement) != null) {
      _ref1.focus();
    }
    return NoteEntryView.__super__.detach.apply(this, arguments);
  };

  NoteEntryView.prototype.confirm = function() {
    console.log(this.miniEditor.getText());
    return this.detach();
  };

  return NoteEntryView;

})(View);
