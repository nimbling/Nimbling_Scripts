if ( app.documents.length > 0) {
    doc = app.activeDocument;
    var currentlayer = doc.activeLayer;
    var currentlayernum = currentlayer.zOrderPosition;
    
    if (currentlayer.opacity == 100) {  
        currentlayer.opacity = 30;
        currentlayer.locked = true;
    } else { 
        currentlayer.locked = false;
        currentlayer.opacity = 100;
    }
}

