#target Illustrator


// requiredABsize = prompt('Resize artboard to?\n\nSize first, Side second\n\nThis script uses \"Scale Strokes and Effects\" for you.\n\n', '500', 'Select artboard area');

var win = new Window ("dialog", "Scale Artboard with contents", undefined );  
win.alignChildren = "center";
win.minimumSize.width = 150;
win.Maxsize = win.add ("radiobutton", undefined, "Smallest Side is:");  
win.Minsize = win.add ("radiobutton", undefined, "Largest Side is:");
win.Maxsize.value = true;

win.requiredABsize = win.add ("edittext", undefined, "500");
win.requiredABsize.minimumSize.width = 110;
win.requiredABsize.active = true;

win.cancelBtn = win.add("button", undefined, "Cancel");    
win.quitBtn = win.add("button", undefined, "OK");    
win.defaultElement = win.quitBtn;    
win.cancelElement = win.cancelBtn;  




var activeDoc = app.activeDocument;
var originalOrigin = activeDoc.rulerOrigin;
var abActive = activeDoc.artboards[activeDoc.artboards.getActiveArtboardIndex()];
var abProps = getArtboardBounds(abActive);



if (win.show() == 1){  
 if (win.Minsize.value == true)  
 {
    var requiredABsize = parseInt(win.requiredABsize.text,10);
    var scale = Math.min(requiredABsize / abProps.height, requiredABsize / abProps.width);
 };  
 if (win.Maxsize.value == true)  
 {
    var requiredABsize = parseInt(win.requiredABsize.text,10);
    var scale = Math.max(requiredABsize / abProps.height, requiredABsize / abProps.width);
 };  
} 
// var scale = findRequiredScale(abProps);

app.selection = [];
// app.executeMenuCommand ('deselectall');
app.executeMenuCommand('selectallinartboard');
var selection = activeDoc.selection;

var artboardRight = abActive.artboardRect[2];
var artboardBottom = abActive.artboardRect[3];
var artboardX = abActive.artboardRect[0];
var artboardY = abActive.artboardRect[1];
var horziontalCenterPosition = (artboardRight + (-1 * artboardX)) / 2;
var verticalCenterPosition = (artboardY - (artboardBottom)) / 2;
activeDoc.rulerOrigin = [horziontalCenterPosition, verticalCenterPosition];
app.selection = [];
activeDoc.selectObjectsOnActiveArtboard();
if (selection.length > 0) {
    for (j = 0; j < selection.length; j++) {
        selection[j].resize(scale * 100, scale * 100, true, true, true, true, scale * 100, Transformation.DOCUMENTORIGIN);
    }
}

var scaledArtboardRect = newRect(-abProps.width / 2 * scale, -abProps.height / 2 * scale, abProps.width * scale, abProps.height * scale);
abActive.artboardRect = scaledArtboardRect;
activeDoc.rulerOrigin = originalOrigin;

// Artboard bounds helper (used above):
function getArtboardBounds(artboard) {

    var bounds = artboard.artboardRect,

        left = bounds[0],
        top = bounds[1],
        right = bounds[2],
        bottom = bounds[3],

        width = right - left,
        height = top - bottom,

        props = {
            left: left,
            top: top,
            width: width,
            height: height
        };

    return props;
}

function findRequiredScale(props) {
    var scale = Math.max(requiredABsize / props.height, requiredABsize / props.width);
    // if (scale > 1)
        return scale;
    // else
        // return 1;
}

function newRect(x, y, width, height) {
    var l = 0;
    var t = 1;
    var r = 2;
    var b = 3;

    var rect = [];

    rect[l] = x;
    rect[t] = -y;
    rect[r] = width + x;
    rect[b] = -(height - rect[t]);

    return rect;
};