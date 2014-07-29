###
Will display a dialog box requesting the URL to an evernote link.

Modified from https://github.com/atom/package-generator/blob/master/lib/package-generator-view.coffee
###
{$, EditorView, View} = require('atom')
openNote = require('./open-note')
util = require('./util')

module.exports =
class NoteEntryView extends View
  previouslyFocusedElement: null

  constructor: (@asENML) ->
    super

  @content: ->
    @div class: 'package-generator overlay from-top', =>
      @div class: 'text-error', outlet: 'error'
      @div class: 'text-info', outlet: 'message'
      @subview 'miniEditor', new EditorView(mini: true)

  initialize: ->
    @miniEditor.hiddenInput.on 'focusout', => @detach()
    @on 'core:confirm', => @confirm()
    @on 'core:cancel', => @detach()

  attach: ->
    @previouslyFocusedElement = $(':focus')
    @message.text("Enter note link or GUID")
    atom.workspaceView.append(this)
    @miniEditor.focus()

  detach: ->
    return unless @hasParent()
    @previouslyFocusedElement?.focus()
    super

  confirm: ->
    guid = util.parseGuid(@miniEditor.getText())
    if guid
      openNote(guid, @asENML)
      @detach()
    else
      @error.text("Unable to prase identifier from provided input")
      @error.show()
