#target Illustrator #targetengine main
// SETTINGS //
var snapAB = 1;         //Snap All Artboards:
var hidestuff = 1;      //Hide Background layers, listed below:
var hidelayers = ["BGR", "BGRDARK", "BG"];
var hardclose = 1;      //Close document when done
var showresults = 1;    //Show results in Finder
// END OF SETTINGS //

var doc = app.activeDocument;

if(snapAB==1){
    app.activeDocument.selection = app.activeDocument.selection;
    for ( var i = 0; i < doc.artboards.length ; i += 1 ) {
    var ab = i;
    var artPoints = doc.artboards[ab].artboardRect;
    var left = Math.round(artPoints[0]);
    var top = Math.round(artPoints[1]);
    var right = Math.round(artPoints[2]);
    var bottom = Math.round(artPoints[3]);
    doc.artboards[ab].artboardRect = [left,top,right,bottom];
    }
}

if(hidestuff==1){
    function hidetry (item) {
        doc.activeLayer = doc.layers.getByName(item); doc.activeLayer.locked = false; doc.activeLayer.visible = false;     
    } 
    for (var i = 0; i < hidelayers.length; i++ ) {
        try{hidetry(hidelayers[i]);}
        catch(err){}
    }    
}

// MEAT AND POTATOES: Export Each Artboard to .ai file's folder
var numArtboards = doc.artboards.length;
var exportOptions = new ExportOptionsPNG24();
var type = ExportType.PNG24;
exportOptions.artBoardClipping = true;

function exportFileToPNG24 (dest) {
    if ( app.documents.length > 0 ) {
        var artboardName = doc.artboards[i].name;
        destinationAndFilename = String(dest + "/" + artboardName);
        var destFile = new File(destinationAndFilename); // Do NOT include the extension!
        app.activeDocument.exportFile( destFile, type, exportOptions );
    }
}

pathToFile = app.activeDocument.path.fsName;
for (var i = 0; i < numArtboards; i++ ) {
    doc.artboards.setActiveArtboardIndex( i );
    exportFileToPNG24(pathToFile);
}

if(hardclose==1){
    if ( app.documents.length > 0 ) {
        aiDocument = app.activeDocument; aiDocument.close( SaveOptions.DONOTSAVECHANGES ); aiDocument = null;
    }
}

if(showresults==1){
    alert("There they are!");
    openPathCommand = new Folder(pathToFile);
    openPathCommand.execute();
}