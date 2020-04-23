#target Illustrator
if (app.documents.length > 0) {
  mySelection = activeDocument.selection;
  if (mySelection.length > 0) {
    var doc = app.activeDocument;                   //current document
    var sel = doc.selection;                       //current slection
    var sl = sel.length;                            //number of selected objects

    for (var i = 0; i < sl; i++) {
      var pgitem = sel[i];
      if (pgitem.typename === "CompoundPathItem") {
        pgitem = sel[i].pathItems[0];
      }
      var currentstrokewidth;
      var newstrokewidth;
      currentstrokewidth = pgitem.strokeWidth;
      newstrokewidth = Math.round(currentstrokewidth + 10);
      pgitem.strokeWidth = newstrokewidth;
    }
    app.redraw();
  } else {
    alert("Nothing selected!")
  }
}
