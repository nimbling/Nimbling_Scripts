#target "illustrator-19";

if ( app.documents.length > 0) {
    doc = app.activeDocument;
    var activeAB = doc.artboards[doc.artboards.getActiveArtboardIndex()];
    var voorzet = activeAB.name;
    
    i = doc.artboards.getActiveArtboardIndex();
    var CurrentArtboard = doc.artboards[i];
    doc.artboards.setActiveArtboardIndex(i);

    //var Newname = prompt("Rename Artboard", voorzet);
    
    var sizes = voorzet.split(" - ")[1];
    var width = voorzet.split(" x ")[0];
    var height = voorzet.split(" x ")[1];
    // alert (width +" "+ height);

    var artPoints = doc.artboards[i].artboardRect;
    var left = Math.round(artPoints[0]);
    var top = Math.round(artPoints[1]);
    var right = Math.round(artPoints[2]);
    var bottom = Math.round(artPoints[3]);
    
    var newright = +left + +width;
    var newbottom = +top - +height;
    // alert (left + " " + top +" "+ newright +" "+ newbottom);
    doc.artboards[i].artboardRect = [+left,+top,+newright,+newbottom];
}