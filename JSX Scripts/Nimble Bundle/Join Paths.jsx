#target Illustrator
// Uses the anchor distance comparing function from Hiroyuki Sato's "Join reasonably" - Thank you!
// Needs two actions called "Join Paths" and "Close Path" in an action group called "Helpers" - these should call the AG functions.
if ( app.documents.length > 0 ) {
    var curDoc = app.activeDocument;
}else{
    Window.alert("You must open at least one document.");
}
var sel = curDoc.selection;
var amountofselectedobjects = sel.length;

main();

function main(){
    if (amountofselectedobjects == 1) {
        app.doScript("Close Path", "Helpers");
    } else if (amountofselectedobjects > 2) {
        // alert ("Join Paths needs exactly 2 paths");
        return;
    } else if (amountofselectedobjects == 2) {
        if(sel[0].closed == true){
            // alert ("Both paths need to be open");
            return;
        }
        if (sel[1].closed == true){
            // alert ("Both paths need to be open");
            return;
        }
    //Get path points
    A = sel[0].pathPoints;
    B = sel[1].pathPoints;
    Alength = A.length;
    Blength = B.length;
    A1 = sel[0].pathPoints[0];
    A2 = sel[0].pathPoints[Alength-1];
    B1 = sel[1].pathPoints[0];
    B2 = sel[1].pathPoints[Blength-1];

    //compare all point locations
    var distances = [];
    A1B1dist = dist(A1.anchor,B1.anchor);
    distances[0] = A1B1dist;
    A1B2dist = dist(A1.anchor,B2.anchor);
    distances[1] = A1B2dist;
    B1A2dist = dist(B1.anchor,A2.anchor);
    distances[2] = B1A2dist;
    B2A2dist = dist(B2.anchor,A2.anchor);
    distances[3] = B2A2dist;

    var index = 0;
    var value = distances[0];
    for (var i = 1; i < distances.length; i++) {
    if (distances[i] < value) {
        value = distances[i];
        index = i;
    }
    }
    // unselect full objects
    sel[0].selected = false;
    sel[1].selected = false;

    //Select shortest distance
    if (index == 0) {
        A1.selected = PathPointSelection.ANCHORPOINT;
        B1.selected = PathPointSelection.ANCHORPOINT;
    } else if (index == 1){
        A1.selected = PathPointSelection.ANCHORPOINT;
        B2.selected = PathPointSelection.ANCHORPOINT;
    } else if (index == 2){
        B1.selected = PathPointSelection.ANCHORPOINT;
        A2.selected = PathPointSelection.ANCHORPOINT;
    } else if (index == 3){
        B2.selected = PathPointSelection.ANCHORPOINT;
        A2.selected = PathPointSelection.ANCHORPOINT;
    }

    app.doScript("Join Paths", "Helpers");
    }
}

function dist(p1,p2){
    return Math.sqrt(Math.pow(p1[0] - p2[0],2) + Math.pow(p1[1] - p2[1],2));
}
