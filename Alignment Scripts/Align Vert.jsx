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

    var horziontalCenterPosition = docLeft + ((docRight - sel.width) / 2);
    var verticalCenterPosition = docTop + ((docBottom + sel.height) / 2);

    sel.position = [sel.left, verticalCenterPosition];

} else if (selec.length > 1) {
    var alignsH = [];
    var alignsV =[];
    var alignsT =[];
    var alignsB =[];
    

    for (var i = 0; i < selec.length; i++) {
        // get selection bounds
        var sel = idoc.selection[i];
        var selHC = sel.left + sel.width / 2;
        var selVC = sel.Top + sel.height / 2;

        alignsV.push(selVC);
    }

    for (var i = 0; i < selec.length; i++) {
        alignsT.push(selec[i].top);
    }
    aligntop = Math.max.apply(null, alignsT);

    for (var i = 0; i < selec.length; i++) {
        // get selection bounds
        var sel = idoc.selection[i];
        bottom = selec[i].top - sel.height;
        alignsB.push(bottom);
    }
    alignbot = Math.min.apply(null, alignsB);

    var align = (aligntop + alignbot)/2;

    for (var i = 0; i < selec.length; i++) {
        var sel = idoc.selection[i];

        sel.top = align + (sel.height / 2);
    }
} else {
    alert("no object(s) selected")
}