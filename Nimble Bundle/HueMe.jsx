function hueMe(fillColor, increment){
    r = fillColor.red;
    g = fillColor.green;
    b = fillColor.blue;
    inihsv = rgbToHsv(r,g,b).toString();
    interhsv = inihsv.split(",");
    newh = parseFloat(interhsv[0]) + increment;
    if (newh > 1) {
        newh = newh - 1;
    }
    if (newh < 0) {
        newh = newh + 1;
    }
    newrgb = hsvToRgb(newh,interhsv[1],interhsv[2]).toString();
    freshrgb = newrgb.split(",");
    var freshRGBColor = new RGBColor();
    freshRGBColor.red = freshrgb[0];
    freshRGBColor.green = freshrgb[1];
    freshRGBColor.blue = freshrgb[2];
    return freshRGBColor;    
}

function recurseHelper(parent){
    if (parent.typename === "GroupItem" && parent.clipped){
        for (var j = 0; j < parent.pathItems.length; j++) {
            recurseHelper(parent.pathItems[j]);
        }
        for (var j = 0; j < parent.groupItems.length; j++) {
            recurseHelper(parent.groupItems[j]);
        }
    }
    else if (parent.typename == 'GroupItem'){
        for (var j = 0; j < parent.pathItems.length; j++) {
            recurseHelper(parent.pathItems[j]);
        }
        for (var j = 0; j < parent.groupItems.length; j++) {
            recurseHelper(parent.groupItems[j]);
        }          
    }
    else if (parent.typename == 'CompoundPathItem'){
        for (var j = 0; j < parent.pathItems.length; j++) {
            recurseHelper(parent.pathItems[j]);
        }     
    }
    else if (parent.typename == 'PathItem'){
        if (parent.filled == true){
            if (parent.fillColor.spot){
                spotconv = parent.fillColor.spot.getInternalColor().toString();
                spotsplit = spotconv.split(",");
                var torgb = new RGBColor();
                torgb.red = spotsplit[0];
                torgb.green = spotsplit[1];
                torgb.blue = spotsplit[2];
                parent.fillColor=hueMe(torgb, increment);
            } else {
                parent.fillColor=hueMe(parent.fillColor, increment);
            }
        }
        if (parent.stroked == true){
            if (parent.strokeColor.spot){
                spotconv = parent.strokeColor.spot.getInternalColor().toString();
                spotsplit = spotconv.split(",");
                var torgb = new RGBColor();
                torgb.red = spotsplit[0];
                torgb.green = spotsplit[1];
                torgb.blue = spotsplit[2];
                parent.strokeColor=hueMe(torgb, increment);
            } else {
                parent.strokeColor=hueMe(parent.strokeColor, increment);
            }            
        }
    }
}