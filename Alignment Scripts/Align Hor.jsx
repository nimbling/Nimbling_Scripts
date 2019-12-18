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

    sel.left = horziontalCenterPosition;

} else if (selec.length > 1) {
    var alignsH = [];
    var alignsV =[];

    for (var i = 0; i < selec.length; i++) {
        // get selection bounds
        var sel = idoc.selection[i];
        var selHC = sel.left + sel.width / 2;
        var selVC = sel.Top + sel.height / 2;

        alignsH.push(selHC);
    }

    alignLeft = Math.min.apply(null, alignsH);
    alignRight = Math.max.apply(null, alignsH);

    align = (alignLeft + alignRight)/2;

    for (var i = 0; i < selec.length; i++) {
        var sel = idoc.selection[i];

        sel.left = align - (sel.width / 2);
    }
} else {
    alert("no object(s) selected")
}