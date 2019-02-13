//Zoom And Center Selection Animated Outline Mode.jsx
//	Zooms active view to selected object(s), eased
//  Hacked together by Herman van Boeijen, www.nimbling.com 02-2019
//  Big thanks to Akinuri for the version I based this on, John Wundes for the initial concept, and Robert Penner for his easing equations

function wait(ms) {
    var d = new Date();
    var d2 = null;
    do { d2 = new Date(); }
    while (d2 - d < ms);
}


function tweenQuadOut(t, b, c, d) { //QUADRATIC EASE OUT

    t = t / d;
    value = -1 * c * t * (t - 2) + b;
    return value;
}

function tweenLinear(t, b, c, d) { //LINEAR EASE
    value = c * t / d + b;
    return value;
}

function easeInOutCubic(t, b, c, d) { // cubic easing in/out - acceleration until halfway, then deceleration 
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t + b;
    t -= 2;
    return c / 2 * (t * t * t + 2) + b;
};

function easeInQuad(t, b, c, d) { // quadratic easing in - accelerating from zero velocity
    t /= d;
    return c * t * t + b;
};

function easeOutQuad(t, b, c, d) { // quadratic easing out - decelerating to zero velocity
    t /= d;
    return -c * t * (t - 2) + b;
};

function easeInOutQuad(t, b, c, d) { // quadratic easing in/out - acceleration until halfway, then deceleration
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
};

function easeInQuart(t, b, c, d) { // quartic easing in - accelerating from zero velocity
    t /= d;
    return c * t * t * t * t + b;
};

function easeOutQuart(t, b, c, d) { // quartic easing out - decelerating to zero velocity
    t /= d;
    t--;
    return -c * (t * t * t * t - 1) + b;
};

function easeInOutQuart(t, b, c, d) { // quartic easing in/out - acceleration until halfway, then deceleration
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t * t + b;
    t -= 2;
    return -c / 2 * (t * t * t * t - 2) + b;
};

function easeInCubic(t, b, c, d) { // cubic easing in - accelerating from zero velocity
    t /= d;
    return c * t * t * t + b;
};


function easeOutCubic(t, b, c, d) { // cubic easing out - decelerating to zero velocity
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
};

function tweenCubicInOut(t, b, c, d) { //QUARTIC EASE IN/OUT - accel halfway, decel other half
    t = t / (d / 2);
    if (t < 1) {
        value = c / 2 * t * t * t * t + b;
    } else {
        t = t - 2;
        value = -c / 2 * (t * t * t * t - 2) + b;
    }
    return value;
}

function easeInOutQuad(t, b, c, d) { // quadratic easing in/out - acceleration until halfway, then deceleration
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
};

function calcRect(rectArray) {
    var rect = {
        rect  : rectArray.join(", "),
        topLeft : {
            x : rectArray[0],
            y : rectArray[1],
        },
        bottomRight : {
            x : rectArray[2],
            y : rectArray[3],
        },
    };
    rect.width  = Math.abs(rect.bottomRight.x - rect.topLeft.x);
    rect.height = Math.abs(rect.bottomRight.y - rect.topLeft.y);
    rect.center = [
        rect.topLeft.x + (rect.width / 2),
        rect.topLeft.y - (rect.height / 2)
    ];
    rect.aspectRatio = rect.width / rect.height;
    return rect;
}

function calcViewRect(rectArray, zoom) {
    var rect = {
        rect: rectArray.join(", "),
        topLeft: {
            x: rectArray[0],
            y: rectArray[1],
        },
        bottomRight: {
            x: rectArray[2],
            y: rectArray[3],
        },
    };
    rect.width = Math.abs(rect.bottomRight.x - rect.topLeft.x);
    rect.height = Math.abs(rect.bottomRight.y - rect.topLeft.y);
    rect.zoom = zoom || 1;
    rect.actualWidth = rect.width * zoom;
    rect.actualHeight = rect.height * zoom;
    rect.aspectRatio = rect.width / rect.height;
    return rect;
}

function getSelectionBounds(selection) {
    var rect = {
        topLeft: {
            x: null,
            y: null,
        },
        bottomRight: {
            x: null,
            y: null,
        },
    };
    
    var goToRect = calcRect(selection.goToRect);

    if (rect.topLeft.x == null) {
        rect.topLeft.x = goToRect.topLeft.x;
    } else {
        if (goToRect.topLeft.x < rect.topLeft.x) {
            rect.topLeft.x = goToRect.topLeft.x;
        }
    }

    if (rect.topLeft.y == null) {
        rect.topLeft.y = goToRect.topLeft.y;
    } else {
        if (goToRect.topLeft.y > rect.topLeft.y) {
            rect.topLeft.y = goToRect.topLeft.y;
        }
    }

    if (rect.bottomRight.x == null) {
        rect.bottomRight.x = goToRect.bottomRight.x;
    } else {
        if (goToRect.bottomRight.x > rect.bottomRight.x) {
            rect.bottomRight.x = goToRect.bottomRight.x;
        }
    }

    if (rect.bottomRight.y == null) {
        rect.bottomRight.y = goToRect.bottomRight.y;
    } else {
        if (goToRect.bottomRight.y < rect.bottomRight.y) {
            rect.bottomRight.y = goToRect.bottomRight.y;
        }
    }

    rect.rect = [rect.topLeft.x, rect.topLeft.y, rect.bottomRight.x, rect.bottomRight.y];
    return rect;
}

function getDocumentBounds(artboards) {
    var rect = {
        topLeft: {
            x: null,
            y: null,
        },
        bottomRight: {
            x: null,
            y: null,
        },
    };

    for (var i = 0; i < artboards.length; i++) {
        var artboardRect = calcRect(artboards[i].artboardRect);

        if (rect.topLeft.x == null) {
            rect.topLeft.x = artboardRect.topLeft.x;
        } else {
            if (artboardRect.topLeft.x < rect.topLeft.x) {
                rect.topLeft.x = artboardRect.topLeft.x;
            }
        }

        if (rect.topLeft.y == null) {
            rect.topLeft.y = artboardRect.topLeft.y;
        } else {
            if (artboardRect.topLeft.y > rect.topLeft.y) {
                rect.topLeft.y = artboardRect.topLeft.y;
            }
        }

        if (rect.bottomRight.x == null) {
            rect.bottomRight.x = artboardRect.bottomRight.x;
        } else {
            if (artboardRect.bottomRight.x > rect.bottomRight.x) {
                rect.bottomRight.x = artboardRect.bottomRight.x;
            }
        }

        if (rect.bottomRight.y == null) {
            rect.bottomRight.y = artboardRect.bottomRight.y;
        } else {
            if (artboardRect.bottomRight.y < rect.bottomRight.y) {
                rect.bottomRight.y = artboardRect.bottomRight.y;
            }
        }
    }
    rect.rect = [rect.topLeft.x, rect.topLeft.y, rect.bottomRight.x, rect.bottomRight.y];
    return rect;
}

function calcZoom(viewRect, goToRect, margin) {
    if (goToRect.aspectRatio > viewRect.aspectRatio) {
        return parseFloat((viewRect.actualWidth - (2 * margin)) / goToRect.width);//.toFixed(5)
    } else {
        return parseFloat((viewRect.actualHeight - (2 * margin)) / goToRect.height);//.toFixed(5)
    }
}


function fitSel(document) {

    if (activeDocument.selection.length > 0) {
        mySelection = activeDocument.selection;
        //if object is a (collection of) object(s) not a text field.
        if (mySelection instanceof Array) {
            //initialize vars
            initBounds = mySelection[0].visibleBounds;
            ul_x = initBounds[0];
            ul_y = initBounds[1];
            lr_x = initBounds[2];
            lr_y = initBounds[3];
            //check rest of group if any
            for (i = 1; i < mySelection.length; i++) {
                groupBounds = mySelection[i].visibleBounds;
                if (groupBounds[0] < ul_x) { ul_x = groupBounds[0] }
                if (groupBounds[1] > ul_y) { ul_y = groupBounds[1] }
                if (groupBounds[2] > lr_x) { lr_x = groupBounds[2] }
                if (groupBounds[3] < lr_y) { lr_y = groupBounds[3] }
            }
            var goToRect = calcRect([ul_x, ul_y, lr_x, lr_y]);
        }
    } else {
        // Extents of Artboards
        // var goToRect = calcRect(getDocumentBounds(document.artboards).rect);
        
        //Extents of EVERYTHING
        // var goToRect = calcRect(app.activeDocument.geometricBounds);
        var goToRect = calcRect(app.activeDocument.geometricBounds);
    }

    var view = document.views[0];

    var viewRect = calcViewRect(view.bounds, view.zoom);
   
    var startzoom = app.activeDocument.views[0].zoom*0.666666;
    
    
    if (activeDocument.selection.length > 0) {
        var targetZoom = calcZoom(viewRect, goToRect, 500);}
    else {
        var targetZoom = 0.1;
    }

    var startpoint = activeDocument.views[0].centerPoint;
    var endpoint = goToRect.center;

    amountofsteps = 50;
    Xdelta = endpoint[0] - startpoint[0];
    Ydelta = endpoint[1] - startpoint[1];
    zoomDelta = targetZoom - startzoom;
    // alert(zoomDelta);

    for (i = 1; i < amountofsteps; i++) {
        // Time - Value - Delta - Duration

        centerX = easeInOutQuad(i, startpoint[0], Xdelta, amountofsteps);
        centerY = easeInOutQuad(i, startpoint[1], Ydelta, amountofsteps);
        activeDocument.views[0].centerPoint = [centerX, centerY];
        view.centerPoint = [centerX, centerY];

        if (zoomDelta > 0) {
            zoomie = easeInQuart(i, startzoom, zoomDelta, amountofsteps); //easeInCubic
        } else {
            zoomie = easeOutQuart(i, startzoom, zoomDelta, amountofsteps); //easeOutQuart
        }
        view.zoom = zoomie;
        wait(7);
    }
}

app.executeMenuCommand('preview');
fitSel(app.activeDocument);
app.executeMenuCommand('preview');