#target Illustrator
#targetengine main

//  script.name = Bottomclipper.jsx;
//  script.required = at least two paths selected, BOTTOM path is the clipping mask;
//  script.parent = Herman van Boeijen, https://github.com/nimbling/Nimbling_Scripts || www.nimbling.com // 22-12-2014;
//  script.step.parent = Sergey Osokin, https://github.com/creold/ // 15-04-2021;
//  *** LIMITED TO A SINGLE STROKE AND/OR FILL OF THE CLIPPING OBJECT***
//  Big thanks to CarlosCanto and MuppetMark on the Adobe Illustrator Scripting Forums

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function CopyAppearance(clipobject, appearance) {
    if (clipobject.filled) {
        appearance.fillColor = clipobject.fillColor;
    }
    if (clipobject.stroked) {
        appearance.stroked = clipobject.stroked;
        appearance.strokeWidth = clipobject.strokeWidth;
        appearance.strokeColor = clipobject.strokeColor;
    }
}

function PasteAppearance(clipobject, appearance) {
    if (appearance.fillColor) {
        clipobject.fillColor = appearance.fillColor;
    }
    if (appearance.stroked) {
        clipobject.stroked = appearance.stroked;
        clipobject.strokeWidth = appearance.strokeWidth;
        clipobject.strokeColor = appearance.strokeColor;
    }
}

function Main(curDoc, sel, amountofselectedobjects, clipobject, appearance) {
    if (!amountofselectedobjects) return;

	if (curDoc.activeLayer.locked || !curDoc.activeLayer.visible) {
		alert("Please select objects on an unlocked and visible layer,\nthen run this script again.");
		return;
	}

    //IF Bottom object is already a clipping mask, Add top objects on top.
    if (clipobject.typename === "GroupItem" && clipobject.clipped) {
        for (i = amountofselectedobjects - 2; i >= 0; i--) {
            sel[i].move(clipobject, ElementPlacement.PLACEATBEGINNING);
        }
        return; //AND EXIT
    }

    // Get the right mask if the top object was a raster, mesh, or other type
    var oldPos = 0;
    for (j = amountofselectedobjects - 1; j >= 0; j--) {
        if (sel[j].typename === "PathItem" || 
            sel[j].typename === "CompoundPathItem" ||
            sel[j].typename === "TextFrame") {
            clipobject = sel[j];
            if (j <= amountofselectedobjects - 1) { 
                oldPos = j;
                clipobject.move(sel[0], ElementPlacement.PLACEBEFORE);
            }
            break;
        }
    }

    //IF Compound object, alter appearance SOURCE
    if (clipobject.typename === "CompoundPathItem") {
        clipobject = clipobject.pathItems[0];
    }

    CopyAppearance(clipobject, appearance);

    //THEN CLIP
    app.executeMenuCommand('makeMask');

    //IF Compound object, alter appearance TARGET
    if (clipobject.typename === "CompoundPathItem") {
        clipobject = clipobject.pageItems[0].pathItems[0];
    }

    PasteAppearance(clipobject, appearance);

    // Return clipobject position in selection
    clipobject.move(selection[0].pageItems[oldPos], ElementPlacement.PLACEAFTER);

    // Notify about problems restoring the appearance of the current version of the Illustrator
    if (appearance.filled && !clipobject.filled) {
        alert("Sorry. Clipping mask's FILL was not restored due to problems in the Adobe Illustrator version");
    }
    if (appearance.stroked && !clipobject.stroked) {
        alert("Sorry. Clipping mask's STROKE was not restored due to problems in the Adobe Illustrator version");
    }
}

//INIT, Is there a document open?
if (app.documents.length > 0) {
    var curDoc = app.activeDocument;
} else {
    Window.alert("You must open at least one document.");
}

var sel = curDoc.selection; // get selection
var amountofselectedobjects = sel.length;
var clipobject = sel[amountofselectedobjects - 1]; // BOTTOM OBJECT
var clipcolors = [];

Main(curDoc, sel, amountofselectedobjects, clipobject, clipcolors);
