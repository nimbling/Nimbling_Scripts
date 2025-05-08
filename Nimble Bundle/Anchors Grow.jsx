#target illustrator

// Script to expand anchor point selection by one in every direction.
// Works with multiple anchor points in multiple objects selected.
// Provides an error message if the selection is not exclusively anchor points.

function expandAnchorSelection() {
    if (app.documents.length === 0) {
        return;
    }
    var doc = app.activeDocument;

    var sel = doc.selection;
    if (sel === null || sel.length === 0) {
        alert("Please select one or more anchor points.");
        return;
    }

    var selectionState = {
        hasSelectedAnchorPoints: false,
        hasInvalidSelection: false
    };

    function validateSelectionRecursive(item) {
        if (selectionState.hasInvalidSelection) {
            return;
        }

        if (item.typename === "PathItem") {
            var pathItemHasAnyPointSelectedAsAnchor = false;
            if (item.pathPoints && item.pathPoints.length > 0) {
                for (var i = 0; i < item.pathPoints.length; i++) {
                    if (item.pathPoints[i].selected === PathPointSelection.ANCHORPOINT) {
                        selectionState.hasSelectedAnchorPoints = true;
                        pathItemHasAnyPointSelectedAsAnchor = true;
                    }
                }
            }
            if (item.selected && !pathItemHasAnyPointSelectedAsAnchor) {
                selectionState.hasInvalidSelection = true;
            }
        } else if (item.typename === "GroupItem") {
            if (item.pageItems && item.pageItems.length > 0) {
                for (var i = 0; i < item.pageItems.length; i++) {
                    validateSelectionRecursive(item.pageItems[i]);
                    if (selectionState.hasInvalidSelection) return;
                }
            }
        } else if (item.typename === "CompoundPathItem") {
            var cpiHasAnyPointSelectedAsAnchor = false;
            if (item.pathItems && item.pathItems.length > 0) {
                for (var i = 0; i < item.pathItems.length; i++) {
                    var subPathItem = item.pathItems[i];
                    if (subPathItem.pathPoints && subPathItem.pathPoints.length > 0) {
                        for (var j = 0; j < subPathItem.pathPoints.length; j++) {
                             if (subPathItem.pathPoints[j].selected === PathPointSelection.ANCHORPOINT) {
                                selectionState.hasSelectedAnchorPoints = true;
                                cpiHasAnyPointSelectedAsAnchor = true;
                             }
                        }
                    }
                }
            }
            if (item.selected && !cpiHasAnyPointSelectedAsAnchor) {
                selectionState.hasInvalidSelection = true;
            }
        } else if (item.selected) {
            selectionState.hasInvalidSelection = true;
        }
    }

    for (var i = 0; i < sel.length; i++) {
        validateSelectionRecursive(sel[i]);
        if (selectionState.hasInvalidSelection) {
            break;
        }
    }

    if (selectionState.hasInvalidSelection || !selectionState.hasSelectedAnchorPoints) {
        alert("Please select one or more anchor points.");
        return;
    }

    var pointsToSelectFinally = []; // This should be an array

    // Helper function to check if an array already contains a specific point (by reference)
    function arrayContainsPoint(arr, pointToCheck) {
        if (!arr || typeof arr.length !== 'number') {
            // This would indicate 'arr' (pointsToSelectFinally) is not an array or array-like.
            // This is a safeguard; if this happens, there's a deeper issue with 'arr'.
            // alert("Debug: arrayContainsPoint called with non-array or invalid 'arr'. Type: " + typeof arr);
            return false;
        }
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === pointToCheck) { // Strict reference equality
                return true;
            }
        }
        return false;
    }

    function addPointToFinalList(point) {
        // Ensure pointsToSelectFinally is indeed an array before using array methods.
        // This is more of a diagnostic check; it should always be an array if initialized correctly.
        if (!(pointsToSelectFinally instanceof Array)) {
             // alert("Critical Error: pointsToSelectFinally is not an Array in addPointToFinalList!");
             // If this happens, something has seriously overwritten pointsToSelectFinally.
             // For now, we can try to re-initialize it, but this hides a deeper problem.
             // pointsToSelectFinally = []; // bandaids the problem for this one call, but doesn't fix root cause
             return; // Or simply stop to avoid further errors.
        }

        // *** This is the corrected part that replaces the indexOf call ***
        // Line 93 from your error message would correspond to the logic below.
        if (!arrayContainsPoint(pointsToSelectFinally, point)) {
            pointsToSelectFinally.push(point);
        }
    }

    function gatherPointsRecursive(item) {
        if (item.typename === "PathItem") {
            var pathPoints = item.pathPoints;
            if (!pathPoints || pathPoints.length === 0) return;
            var numPoints = pathPoints.length;

            var originallySelectedIndicesOnThisPath = [];
            for (var j = 0; j < numPoints; j++) {
                if (pathPoints[j].selected === PathPointSelection.ANCHORPOINT) {
                    originallySelectedIndicesOnThisPath.push(j);
                }
            }

            for (var k = 0; k < originallySelectedIndicesOnThisPath.length; k++) {
                var currentIndex = originallySelectedIndicesOnThisPath[k];
                addPointToFinalList(pathPoints[currentIndex]);

                if (numPoints > 1) {
                    var prevIndex = (currentIndex - 1 + numPoints) % numPoints;
                    addPointToFinalList(pathPoints[prevIndex]);

                    var nextIndex = (currentIndex + 1) % numPoints;
                    addPointToFinalList(pathPoints[nextIndex]);
                }
            }
        } else if (item.typename === "GroupItem") {
            if (item.pageItems) {
                for (var j = 0; j < item.pageItems.length; j++) {
                    gatherPointsRecursive(item.pageItems[j]);
                }
            }
        } else if (item.typename === "CompoundPathItem") {
            if (item.pathItems) {
                for (var j = 0; j < item.pathItems.length; j++) {
                    gatherPointsRecursive(item.pathItems[j]);
                }
            }
        }
    }

    var originalSelectionSnapshot = [];
    for(var i=0; i < sel.length; i++) {
        originalSelectionSnapshot.push(sel[i]);
    }

    for (var i = 0; i < originalSelectionSnapshot.length; i++) {
        gatherPointsRecursive(originalSelectionSnapshot[i]);
    }

    function deselectPointsRecursive(item) {
        if (item.typename === "PathItem") {
            if (item.pathPoints) {
                for (var i = 0; i < item.pathPoints.length; i++) {
                    if (item.pathPoints[i].selected !== PathPointSelection.NOSELECTION) {
                        item.pathPoints[i].selected = PathPointSelection.NOSELECTION;
                    }
                }
            }
        } else if (item.typename === "GroupItem") {
            if (item.pageItems) {
                for (var i = 0; i < item.pageItems.length; i++) {
                    deselectPointsRecursive(item.pageItems[i]);
                }
            }
        } else if (item.typename === "CompoundPathItem") {
            if (item.pathItems) {
                for (var i = 0; i < item.pathItems.length; i++) {
                    deselectPointsRecursive(item.pathItems[i]);
                }
            }
        }
    }
    
    for (var i = 0; i < originalSelectionSnapshot.length; i++) {
        deselectPointsRecursive(originalSelectionSnapshot[i]);
    }
    
    // Before this loop, ensure pointsToSelectFinally is an array
    if (!(pointsToSelectFinally instanceof Array)) {
        // alert("Error: pointsToSelectFinally is not an array before final selection loop.");
        return; // Cannot proceed
    }

    for (var i = 0; i < pointsToSelectFinally.length; i++) {
        // Ensure the item is a valid point object before trying to set 'selected'
        if (pointsToSelectFinally[i] && typeof pointsToSelectFinally[i].selected !== "undefined") {
            pointsToSelectFinally[i].selected = PathPointSelection.ANCHORPOINT;
        }
    }
}

try {
    if (app.documents.length > 0) {
        expandAnchorSelection();
    } else {
        alert("Please open a document first.");
    }
} catch (e) {
    alert("Script Error: " + e.name + "\n" + e.message + "\nLine: " + (e.line || 'N/A'));
}