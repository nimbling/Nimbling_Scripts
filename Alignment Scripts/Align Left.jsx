#target Illustrator
//  script.grandparent = carlos canto
//  script.parent = Herman van Boeijen
//  script.elegant = false;
oldcoordinateSystem = app.coordinateSystem;
app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

var idoc = app.activeDocument;
var selec = idoc.selection;
var usePreviewB = app.preferences.getIntegerPreference('includeStrokeInBounds');
var aligns = [];

#include "AlignFunctions.jsx"

function alignleft(idoc, selec, usePreviewB, aligns){
    if (selec.length > 0) {
        var aligns = [];
        for (var i = 0; i < selec.length; i++) {
            if (selec[i].typename === "GroupItem" && selec[i].clipped) {
                left = getmyleft(selec[i].pathItems[0]);
            } else {
                left = getmyleft(selec[i]);
            } //FILL LEFTS
            var thedif = left - selec[i].left;
            var theleft = selec[i].left + thedif;
            if (selec.length > 1) {
                aligns.push(theleft);     
            } else { // Align to artboard
                var activeAB = idoc.artboards[idoc.artboards.getActiveArtboardIndex()];
                var docLeft = activeAB.artboardRect[0], docTop = activeAB.artboardRect[1], docRight = activeAB.artboardRect[2], docBottom = activeAB.artboardRect[3];
                aligns.push(docLeft);
            }
        }

        aligned = Math.min.apply(null, aligns);

        for (var i = 0; i < selec.length; i++) {   
            if (selec[i].typename === "GroupItem" && selec[i].clipped) {
                left = getmyleft(selec[i].pathItems[0]);
            } else {
                left = getmyleft(selec[i]);
            }
        //ALIGN MULTIPLE OBJECTS
        var thedif = left - selec[i].left;
        selec[i].left = aligned - thedif;
        }    
    } else {
    alert("no object(s) selected")
    }
}
alignleft(idoc, selec, usePreviewB, aligns);

app.coordinateSystem = oldcoordinateSystem;