#target Illustrator
#targetengine main

//  script.name = Bottomclipper.jsx;
//  script.required = at least two paths selected, BOTTOM path is the clipping mask;
//  script.parent = Herman van Boeijen, www.nimbling.com // 22-12-2014;
//  Big thanks to CarlosCanto and MuppetMark on the Adobe Illustrator Scripting Forums

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function Main(curDoc, sel, amountofselectedobjects){
    if (amountofselectedobjects){        
        if(curDoc.activeLayer.locked || !curDoc.activeLayer.visible){
            alert("Please select objects on an unlocked and visible layer,\nthen run this script again.");
        }else{
                if (amountofselectedobjects <= 1){
                    sel[0].duplicate(sel[0], ElementPlacement.PLACEAFTER);
                    app.executeMenuCommand("Selection Hat 9");
                    app.executeMenuCommand("Selection Hat 8");
                    return; //AND EXIT
                } else {
                    for (i = amountofselectedobjects-1 ; i >= 0; i--) {
                        sel[i].move(sel[amountofselectedobjects-1], ElementPlacement.PLACEAFTER);
                        }            
                    return; //AND EXIT
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

var sel = curDoc.selection; // get selection Pageitems
var amountofselectedobjects = sel.length;
var myLayers = curDoc.layers;

Main(curDoc, sel, amountofselectedobjects);