#target Illustrator
/*
 Revision-1
 Author: Shivendra Agarwal
 Year: 2017
 Title: Script to scale-up artwork and artboard above 15 Mpixel
*/

if (app.documents.length > 0)
    alert("ERROR: \n Close all documents before running this script.");

requiredABsize = prompt('Scale artboards to what square size?\nREMEMBER THIS NUMBER TO CREATE ENOUGH SPACE BETWEEN YOUR SCALED ARTBOARDS IN THE NEXT STEP.\n\nThis script uses \"Scale Strokes and Effects\" for you.\n\n', '500', 'Select artboard area');
dir = Folder.selectDialog("Select root folder containing Illustrator assets.");
// If dir variable return null, user most likely canceled the dialog or
// the input folder and it subfolders don't contain any .ai files.
if (dir != null) {
    // returns an array of file paths in the selected folder.
    files = GetFiles(dir);
    alert('Total ' + files.length + ' files (AI/EPS) will be processed.', 'Alert');
    for (var f = 0; f < files.length; f++) {
        var doc = app.open(files[f]);
        resizeArtboardAndArwork();
        doc.close(SaveOptions.SAVECHANGES);
    }
}

function resizeArtboardAndArwork() {
    app.executeMenuCommand("ReArrange Artboards");

    var activeDoc = app.activeDocument;
    var TotalArtboards = activeDoc.artboards.length;
    var originalOrigin = activeDoc.rulerOrigin;

    for (var i = 0; i < TotalArtboards; i++) {
        var _artboards = activeDoc.artboards;
        var abActive = _artboards[i];
        var abProps = getArtboardBounds(abActive);
        var scale = findRequiredScale(abProps);
        // abActive   = activeDoc.artboards[ activeDoc.artboards.getActiveArtboardIndex() ];
        activeDoc.artboards.setActiveArtboardIndex(i);
        // alert(i);
        app.selection = [];
        // app.executeMenuCommand ('deselectall');
        app.executeMenuCommand('selectallinartboard');
        var selection = activeDoc.selection;

        var artboardRight = abActive.artboardRect[2];
        // Get the Height of the Artboard
        var artboardBottom = abActive.artboardRect[3];
        var artboardX = abActive.artboardRect[0];
        var artboardY = abActive.artboardRect[1];

        var horziontalCenterPosition = (artboardRight + (-1 * artboardX)) / 2;
        var verticalCenterPosition = (artboardY - (artboardBottom)) / 2;
        //alert(app.activeDocument.rulerOrigin+"\n left "+artboardX+"\ntop "+artboardY+"\nright "+artboardRight+"\nbottom "+artboardBottom+"\nTheleft: "+horziontalCenterPosition+"\nThevert: "+verticalCenterPosition);

        activeDoc.rulerOrigin = [horziontalCenterPosition, verticalCenterPosition];

        app.selection = [];
        activeDoc.selectObjectsOnActiveArtboard();
        // app.executeMenuCommand ('selectallinartboard');

        // Check if anything is selected:
        if (selection.length > 0) {
            for (j = 0; j < selection.length; j++) {
                selection[j].resize(scale * 100, scale * 100, true, true, true, true, scale * 100, Transformation.DOCUMENTORIGIN);
            }
        }

        var scaledArtboardRect = newRect(-abProps.width / 2 * scale, -abProps.height / 2 * scale, abProps.width * scale, abProps.height * scale);
        activeDoc.artboards[i].artboardRect = scaledArtboardRect;
    }
    activeDoc.rulerOrigin = originalOrigin;
}


function findRequiredScale(props) {
    requiredABarea = 250000; //px
    currentABarea = props.width * props.height;
    scale = (Math.sqrt(requiredABarea / currentABarea));

    if (scale > 1)
        return scale;
    else
        return 1;
}

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

function GetFiles(folder) {
    var i, item,
        // Array to store the files in...
        files = [],
        // Get files...
        items = folder.getFiles();

    // Loop through all files in the given folder
    for (i = 0; i < items.length; i++) {
        item = items[i];
        // Find .ai files
        var aifileformat = item.name.match(/\.ai$/i);
        var epsfileformat = item.name.match(/\.eps$/i);
        // If item is a folder, check the folder for files.
        if (item instanceof Folder) {
            // Combine existing array with files found in the folder
            files = files.concat(GetFiles(item));
        }
        // If the item is a file, push it to the array.
        else if (item instanceof File && (epsfileformat || aifileformat)) {
            // Push files to the array
            files.push(item);
        }
    }
    return files;
}
