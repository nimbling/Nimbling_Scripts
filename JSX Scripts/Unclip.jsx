#target Illustrator
#targetengine main

//  script.name = Bottomclipper.jsx;
//  script.required = at least two paths selected, BOTTOM path is the clipping mask;
//  script.parent = Herman van Boeijen, www.nimbling.com // 22-12-2014;
//  *** LIMITED TO A SINGLE STROKE AND/OR FILL OF THE CLIPPING OBJECT***
//  Big thanks to CarlosCanto and MuppetMark on the Adobe Illustrator Scripting Forums

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function Main(curDoc, sel, amountofselectedobjects, clipobject){
    if (amountofselectedobjects){
        if(curDoc.activeLayer.locked || !curDoc.activeLayer.visible){
            alert("Please select objects on an unlocked and visible layer,\nthen run this script again.");
        }else{

            //IF Compound object, alter appearance SOURCE
            //if (clipobject.typename === "CompoundPathItem") {
            //    clipobject = sel[amountofselectedobjects -1].pathItems[0];
            //}
            //app.executeMenuCommand('deselectall');
            //clipobject = sel[0].pathItems[0];
            //clipobject.selected = true;
            app.executeMenuCommand('ungroup');
            app.executeMenuCommand('copy');
            app.executeMenuCommand('Live Pathfinder Crop');
            app.executeMenuCommand('expandStyle');
            app.executeMenuCommand('ungroup');
            app.executeMenuCommand('pasteBack');
            app.executeMenuCommand('releaseMask');
            sel = curDoc.selection;
            amountofselectedobjects = sel.length;
            app.executeMenuCommand('deselectall');
            for (i = 1; i < amountofselectedobjects ; i++) {
                killobject = sel[i];
                killobject.remove();
            }
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
var origsel = curDoc.selection;
var amountofselectedobjects = sel.length;
var clipobject = sel[amountofselectedobjects -1]; // BOTTOM OBJECT
var clipcolors = [];

Main(curDoc, sel, amountofselectedobjects, clipobject);
