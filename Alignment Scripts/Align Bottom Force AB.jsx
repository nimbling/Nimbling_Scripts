#target Illustrator
//  script.grandparent = carlos canto
//  script.parent = Herman van Boeijen
//  script.elegant = false;

var idoc = app.activeDocument;
selec = idoc.selection;

// get document bounds
var docw = idoc.width;
var doch = idoc.height;

if (selec.length > 0) {

    var activeAB = idoc.artboards[idoc.artboards.getActiveArtboardIndex()]; // get active AB
    docLeft = activeAB.artboardRect[0];
    docTop = activeAB.artboardRect[1];
    docRight = activeAB.artboardRect[2];
    docBottom = activeAB.artboardRect[3];

    for (var i = 0; i < selec.length; i++) {
        var sel = idoc.selection[i];
        var selGB = sel.geometricBounds;
        var selGw = selGB[2] - selGB[0];
        var selGh = selGB[1] - selGB[3];

        selec[i].top = docBottom+selGh;
    }    
} else {
  alert("no object(s) selected")
}