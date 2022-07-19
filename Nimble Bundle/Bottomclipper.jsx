#target Illustrator
#targetengine main

//  script.name = Bottomclipper.jsx;
//  script.required = at least two paths selected, BOTTOM path is the clipping mask;
//  script.parent = Herman van Boeijen, https://github.com/nimbling/Nimbling_Scripts || www.nimbling.com // 22-12-2014;
//  script.step.parent = Sergey Osokin, https://github.com/creold/ // 15-04-2021;
//  *** LIMITED TO A SINGLE STROKE AND/OR FILL OF THE CLIPPING OBJECT***
//  Big thanks to CarlosCanto and MuppetMark on the Adobe Illustrator Scripting Forums

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function CopyAppearance(clipObj, appearance) {
    if (clipObj.filled) {
        appearance.fillColor = clipObj.fillColor;
    }
    if (clipObj.stroked) {
        appearance.stroked = clipObj.stroked;
        appearance.strokeWidth = clipObj.strokeWidth;
        appearance.strokeColor = clipObj.strokeColor;
    }
}

function PasteAppearance(clipObj, appearance) {
    if (appearance.fillColor) {
        clipObj.fillColor = appearance.fillColor;
    }
    if (appearance.stroked) {
        clipObj.stroked = appearance.stroked;
        clipObj.strokeWidth = appearance.strokeWidth;
        clipObj.strokeColor = appearance.strokeColor;
    }
}

function Main(doc, sel, selLength, clipObj, isMakeCP) {
  if (!selLength) return;

  var appearance = [];

	if (doc.activeLayer.locked || !doc.activeLayer.visible) {
		alert("Please select objects on an unlocked and visible layer,\nthen run this script again.");
		return;
	}

    //IF Bottom object is already a clipping mask, Add top objects on top.
    if (clipObj.typename === "GroupItem" && clipObj.clipped) {
        for (i = selLength - 2; i >= 0; i--) {
            sel[i].move(clipObj, ElementPlacement.PLACEATBEGINNING);
        }
        return; //AND EXIT
    }

    // Get the right mask if the top object was a raster, mesh, or other type
    var oldPos = 0;
    for (j = selLength - 1; j >= 0; j--) {
        if (sel[j].typename === "PathItem" || 
            sel[j].typename === "CompoundPathItem" ||
            sel[j].typename === "TextFrame") {
            clipObj = sel[j];
            if (j <= selLength - 1) { 
                oldPos = j;
                clipObj.move(sel[0], ElementPlacement.PLACEBEFORE);
            }
            break;
        }
    }

    //IF Compound object, alter appearance SOURCE
    if (clipObj.typename === "CompoundPathItem") {
        clipObj = clipObj.pathItems[0];
    }

    CopyAppearance(clipObj, appearance);

    //THEN CLIP
    app.executeMenuCommand("makeMask");

    //IF Compound object, alter appearance TARGET
    if (clipObj.typename === "CompoundPathItem") {
        clipObj = clipObj.pageItems[0].pathItems[0];
    }

    PasteAppearance(clipObj, appearance);

    // Return clipObj position in selection
    var parent = (clipObj.parent.typename === "CompoundPathItem") ? clipObj.parent : clipObj;
    parent.move(selection[0].pageItems[oldPos], ElementPlacement.PLACEAFTER);
    
    if (isMakeCP && parent.typename === "PathItem") {
      var curSel = selection;
      selection = [parent];
      app.executeMenuCommand("compoundPath");
      selection = curSel;
    }

    // Notify about problems restoring the appearance of the current version of the Illustrator
    if (appearance.filled && !clipObj.filled) {
        alert("Sorry. Clipping mask's FILL was not restored due to problems in the Adobe Illustrator version");
    }
    if (appearance.stroked && !clipObj.stroked) {
        alert("Sorry. Clipping mask's STROKE was not restored due to problems in the Adobe Illustrator version");
    }
}

//INIT, Is there a document open?
if (app.documents.length > 0) {
    var doc = app.activeDocument;
} else {
    Window.alert("You must open at least one document.");
}

var sel = doc.selection; // get selection
var selLength = sel.length;
var clipObj = sel[selLength - 1]; // BOTTOM OBJECT
// Illustrator does not allow to select a clip group by clicking the fill of the clipping path or allow to drag it by this fill.
// However, for some another broken reason, it is allowed if a clipping path is a compound path.
// When enabled, this flag auto-converts every clipping path into a compound one.
var isMakeCP = true;

Main(doc, sel, selLength, clipObj, isMakeCP);
