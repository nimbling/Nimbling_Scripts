// ALIGN FUNCTIONS
function getmyleft(sel){
    if (usePreviewB == 1) {
        var visibounds = sel.visibleBounds;
        var left = visibounds[0];
    } else {
        var geobounds = sel.geometricBounds;
        var left = geobounds[0]; // minus preview bounds
    }
    return left;
}

function getmywidth(sel){
    if (usePreviewB == 1) { // with preview bounds
        var visibounds = sel.visibleBounds;
        var width = visibounds[2] - visibounds[0];
    } else { // minus preview bounds
        var geobounds = sel.geometricBounds;
        var width = geobounds[2] - geobounds[0];
    }
    return width;
}

function getmytop(sel){
    if (usePreviewB == 1) {
        var visibounds = sel.visibleBounds;
        var top = visibounds[1];
    } else {
        var geobounds = sel.geometricBounds;
        var top = geobounds[1]; // minus preview bounds
    }
    return top;
}

function getmyheight(sel){
    if (usePreviewB == 1) { // with preview bounds
        var visibounds = sel.visibleBounds;
        var height = visibounds[3] - visibounds[1];
    } else { // minus preview bounds
        var geobounds = sel.geometricBounds;
        var height = geobounds[3] - geobounds[1];
    }
    return height;
}