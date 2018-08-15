#target "illustrator-19";
if ( app.documents.length > 0) {
    doc = app.activeDocument;
    var activeLayer = doc.activeLayer;
    
    var voorzet = activeLayer.name;
    var Newname = prompt("Rename Layer", voorzet);
    if (Newname){
      activeLayer.name = Newname;
    }
}