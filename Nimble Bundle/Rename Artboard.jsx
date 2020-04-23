#target Illustrator
if (app.documents.length > 0) {
  doc = app.activeDocument;
  var activeAB = doc.artboards[doc.artboards.getActiveArtboardIndex()];
  var voorzet = activeAB.name;
  var Newname = prompt("Rename Artboard", voorzet);
  if (Newname) {
    activeAB.name = Newname;
  }
}
