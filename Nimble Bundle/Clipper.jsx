#target Illustrator
#targetengine main

//  script.name = Bottomclipper.jsx;
//  script.required = at least two paths selected, BOTTOM path is the clipping mask;
//  script.parent = Herman van Boeijen, www.nimbling.com // 22-12-2014;
//  *** LIMITED TO A SINGLE STROKE AND/OR FILL OF THE CLIPPING OBJECT***
//  Big thanks to CarlosCanto and MuppetMark on the Adobe Illustrator Scripting Forums

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function CopyAppearance(clipobject) {
    if(clipobject.filled)  {
        clipcolors.fillColor = clipobject.fillColor;
    }
    if(clipobject.stroked) {
        clipcolors.stroked = clipobject.stroked;
        clipcolors.strokeWidth = clipobject.strokeWidth;
        clipcolors.strokeColor = clipobject.strokeColor;
    }
}

function PasteAppearance(clipobject) {
    if(clipcolors.fillColor)    {
        clipobject.fillColor = clipcolors.fillColor;
    }
    if(clipcolors.stroked){
        clipobject.stroked = clipcolors.stroked;
        clipobject.strokeWidth = clipcolors.strokeWidth;
        clipobject.strokeColor = clipcolors.strokeColor;
    }
}

function Main(curDoc, sel, amountofselectedobjects, clipobject, clipcolors){
    if (amountofselectedobjects){
        if(curDoc.activeLayer.locked || !curDoc.activeLayer.visible){
            alert("Please select objects on an unlocked and visible layer,\nthen run this script again.");
        }else{

            //IF TOP object is already a clipping mask, Add top objects on top.
            if (clipobject.typename === "GroupItem" && clipobject.clipped) {
                for (i = 1; i < amountofselectedobjects; i++) {
                    sel[i].move (clipobject, ElementPlacement.PLACEATEND );
                }
                return; //AND EXIT
            }

            //IF Compound object, alter appearance SOURCE
            if (clipobject.typename === "CompoundPathItem") {
                clipobject = sel[0].pathItems[0];
            }

            CopyAppearance(clipobject);

            //RESET SELECTION
            curDoc.selection = sel;

            //THEN CLIP
            app.executeMenuCommand ('makeMask');

            //IF Compound object, alter appearance TARGET
            if (clipobject.typename === "CompoundPathItem") {
                clipobject = clipobject.pageItems[0].pathItems[0];
            }

            PasteAppearance(clipobject);
        }
    }
}

//INIT, Is there a document open?
if ( app.documents.length > 0 ) {
    var curDoc = app.activeDocument;
}else{
    Window.alert("You must open at least one document.");
}

var sel = curDoc.selection; // get selection
var amountofselectedobjects = sel.length;
var clipobject = sel[0]; // TOP OBJECT
var clipcolors = [];

Main(curDoc, sel, amountofselectedobjects, clipobject, clipcolors);
