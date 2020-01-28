#target Illustrator
//  script.grandparent = carlos canto
//  script.parent = Herman van Boeijen
//  script.elegant = false;

var idoc = app.activeDocument;
var selec = idoc.selection;
var usePreviewB = app.preferences.getIntegerPreference('includeStrokeInBounds');
var aligns = [];

#include "AlignFunctions.jsx"

function alignvertforceab(idoc, selec, usePreviewB, aligns){
    if (selec.length > 0) {
        for (var i = 0; i < selec.length; i++) {
            if (selec[i].typename === "GroupItem" && selec[i].clipped) {
                top = getmytop(selec[i].pathItems[0]);
                height = getmyheight(selec[i].pathItems[0]);
            } else {
                top = getmytop(selec[i]);
                height = getmyheight(selec[i]);
            }
            fakeheight = selec[i].height;
            faketop = selec[i].top;
            fakebottom = faketop + fakeheight;
            actualbottom = top + height;
            thedif = faketop - actualbottom;
            thebottom = actualbottom;
            activeAB = idoc.artboards[idoc.artboards.getActiveArtboardIndex()];
            docLeft = activeAB.artboardRect[0], docTop = activeAB.artboardRect[1], docRight = activeAB.artboardRect[2], docBottom = activeAB.artboardRect[3];
            aligns.push((docBottom-docTop)/2);
        }

        alignedtop = Math.min.apply(null, aligns);
        alignedbottom = Math.max.apply(null, aligns);
        aligned = ((alignedtop + alignedbottom)/2);

        for (var i = 0; i < selec.length; i++) {   
            if (selec[i].typename === "GroupItem" && selec[i].clipped) {
                top = getmytop(selec[i].pathItems[0]);
                height = getmyheight(selec[i].pathItems[0]);
            } else {
                top = getmytop(selec[i]);
                height = getmyheight(selec[i]);
            }
            fakeheight = selec[i].height;
            faketop = selec[i].top;
            fakebottom = faketop + fakeheight;
            actualbottom = top + height;
            thedif = top - faketop + height/2;
            selec[i].top = aligned - thedif;
        }
    } else {
    alert("no object(s) selected")
    }
}
alignvertforceab(idoc, selec, usePreviewB, aligns);