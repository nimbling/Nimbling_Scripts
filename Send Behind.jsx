#target Illustrator
#targetengine main

//  script.name = Bottomclipper.jsx;
//  script.required = at least two paths selected, BOTTOM path is the clipping mask;
//  script.parent = Herman van Boeijen, www.nimbling.com // 22-12-2014;
//  Big thanks to CarlosCanto and MuppetMark on the Adobe Illustrator Scripting Forums

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function Main(curDoc, sel, amountofselectedobjects, clipobject, clipcolors){
    if (amountofselectedobjects){
        if(curDoc.activeLayer.locked || !curDoc.activeLayer.visible){
            alert("Please select objects on an unlocked and visible layer,\nthen run this script again.");
        }else{
            for (i = amountofselectedobjects-1 ; i >= 0; i--) {
                bottomsel = amountofselectedobjects-1;
                sel[i].move(sel[bottomsel], ElementPlacement.PLACEAFTER);
            }            
            return; //AND EXIT
            }
        }
    }

//INIT, Is there a document open?
if ( app.documents.length > 0 ) {
    var curDoc = app.activeDocument;
}else{
    Window.alert("You must open at least one document.");
}

var sel = curDoc.selection; // get selection Pageitems
var amountofselectedobjects = sel.length;

Main(curDoc, sel, amountofselectedobjects);