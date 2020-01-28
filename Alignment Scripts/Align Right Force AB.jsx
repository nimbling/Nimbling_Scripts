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

if (selec.length > 0) {
    for (var i = 0; i < selec.length; i++) {
        if (selec[i].typename === "GroupItem" && selec[i].clipped) { //CLIP
            left = getmyleft(selec[i].pathItems[0]);
            width = getmywidth(selec[i].pathItems[0]);
        } else {
            left = getmyleft(selec[i]);
            width = getmywidth(selec[i]);
        }
        fakewidth = selec[i].width;
        fakeleft = selec[i].left;
        fakeright = fakeleft + fakewidth;
        actualright = left + width;
        thedif = fakeleft - actualright;
        theright = actualright;    
        activeAB = idoc.artboards[idoc.artboards.getActiveArtboardIndex()];
        docLeft = activeAB.artboardRect[0], docTop = activeAB.artboardRect[1], docRight = activeAB.artboardRect[2], docBottom = activeAB.artboardRect[3];
        aligns.push(docRight);
    }

    aligned = Math.max.apply(null, aligns);

    for (var i = 0; i < selec.length; i++) {   
        if (selec[i].typename === "GroupItem" && selec[i].clipped) {
            left = getmyleft(selec[i].pathItems[0]);
            width = getmywidth(selec[i].pathItems[0]);
        } else {
            left = getmyleft(selec[i]);
            width = getmywidth(selec[i]);
        }
        fakewidth = selec[i].width;
        fakeleft = selec[i].left;
        fakeright = fakeleft + fakewidth;
        actualright = left + width;
        thedif = fakeleft - actualright;
        theright = actualright;
        selec[i].left = aligned + thedif;
    }
} else {
  alert("no object(s) selected")
}

app.coordinateSystem = oldcoordinateSystem;