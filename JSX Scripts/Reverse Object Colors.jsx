#target Illustrator
#targetengine main

//  script.name = Reverse Object Colors.jsx;
//  script.required = At least two paths selected;
//  script.parent = Herman van Boeijen, www.nimbling.com // 07/12/13;
//  Modified by OpenAI GPT-4 // 07/25/24;

if (app.documents.length > 0) {
    var curDoc = app.activeDocument;
} else {
    Window.alert("You must open at least one document.");
}

var sel = curDoc.selection; // get selection

function Main(sel) {
    if (sel && sel.length > 0) {
        if (isContainerLockedOrInvisible(curDoc.activeLayer)) {
            alert("Please select objects on an unlocked and visible layer,\nthen run this script again.");
        } else {
            var flatSelection = flattenSelection(sel);
            if (flatSelection.length >= 2) {
                ReverseObjAppearance(flatSelection);
            } else {
                alert("The selection must contain at least two non-group items.");
            }
        }
    } else {
        alert("Please select at least two objects,\nthen run this script again.");
    }
}

function isContainerLockedOrInvisible(container) {
    return container.locked || !container.visible;
}

function flattenSelection(selection) {
    var objects = [];
    for (var i = 0; i < selection.length; i++) {
        var item = selection[i];
        if (item.typename === "GroupItem") {
            objects = objects.concat(flattenSelection(item.pageItems));
        } else {
            objects.push(item);
        }
    }
    return objects;
}

function ReverseObjAppearance(sel) {
    var appearances = [];

    for (var i = 0; i < sel.length; i++) {
        var obj = sel[i];
        if (obj.typename === "CompoundPathItem") {
            obj = obj.pathItems[0];
        }
        appearances.push(CopyAppearance(obj));
    }

    for (var j = 0; j < Math.floor(sel.length / 2); j++) {
        var targetIndex = sel.length - 1 - j;
        SwapAppearance(sel[j], sel[targetIndex]);
    }
}

function CopyAppearance(obj) {
    return {
        fillColor: obj.filled ? obj.fillColor : null,
        stroked: obj.stroked,
        strokeWidth: obj.stroked ? obj.strokeWidth : null,
        strokeColor: obj.stroked ? obj.strokeColor : null
    };
}

function PasteAppearance(obj, appearance) {
    if (appearance.fillColor !== null) {
        obj.fillColor = appearance.fillColor;
    } else {
        obj.fillColor = new NoColor();
    }
    if (appearance.stroked) {
        obj.stroked = true;
        obj.strokeWidth = appearance.strokeWidth;
        obj.strokeColor = appearance.strokeColor;
    } else {
        obj.stroked = false;
    }
}

function SwapAppearance(obj1, obj2) {
    var tempAppearance = CopyAppearance(obj1);
    PasteAppearance(obj1, CopyAppearance(obj2));
    PasteAppearance(obj2, tempAppearance);
}

Main(sel);
