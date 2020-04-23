#target Illustrator
if ( app.documents.length > 0) {
    var selection = app.activeDocument.selection;
    if (selection.length == 1) {
      var voorzet = selection[0].opacity;
      var NewOpacity = prompt("Set opacity to", voorzet);
      selection[0].opacity = NewOpacity;
    } else if (selection.length > 1) {
      var NewOpacity = prompt("Set opacity to", "100");
      for (var i = 0; i < selection.length; i++) {
        selection[i].opacity = NewOpacity;
      }
    } else {
      alert("no object(s) selected")
    }
}