#target Illustrator
//  script.grandparent = carlos canto
//  script.parent = Herman van Boeijen
//  script.elegant = false;

var idoc = app.activeDocument;
selec = idoc.selection;

// get document bounds
var docw = idoc.width;
var doch = idoc.height;

if (selec.length == 1) {
    // Align to artboard

    var activeAB = idoc.artboards[idoc.artboards.getActiveArtboardIndex()]; // get active AB
    docLeft = activeAB.artboardRect[0];
    docTop = activeAB.artboardRect[1];
    docRight = activeAB.artboardRect[2];
    docBottom = activeAB.artboardRect[3];

    // get selection bounds
    var sel = idoc.selection[0];

    sel.left = docRight-sel.width;

} else if (selec.length > 1) {
    var aligns = [];

    for (var i = 0; i < selec.length; i++) {
        // get selection bounds
        var sel = idoc.selection[i];

        right = selec[i].left + sel.width;
        aligns.push(right);
    }
    aligned = Math.max.apply(null, aligns);

    for (var i = 0; i < selec.length; i++) {
        var sel = idoc.selection[i];

        selec[i].left = aligned-sel.width;
    }    
} else {
  alert("no object(s) selected")
}