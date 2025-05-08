#target illustrator
// DECREASE SCRIPT - Revised "Remove Exposed Ends" Strategy (Index-Based)

function decreaseSelectionRemoveExposed() {
    if (app.documents.length === 0) { return; }
    var doc = app.activeDocument;
    var sel = doc.selection;

    if (sel === null || sel.length === 0) {
        alert("Please select one or more anchor points.");
        return;
    }

    // --- Selection Validation (Essential) ---
    var selectionState = { hasSelectedAnchorPoints: false, hasInvalidSelection: false };
    function validateSelectionRecursive(item) {
        if (selectionState.hasInvalidSelection) { return; }
        if (item.typename === "PathItem") {
            var pathItemHasAnyPointSelectedAsAnchor = false;
            if (item.pathPoints && item.pathPoints.length > 0) {
                for (var i = 0; i < item.pathPoints.length; i++) {
                    if (item.pathPoints[i].selected === PathPointSelection.ANCHORPOINT) {
                        selectionState.hasSelectedAnchorPoints = true; pathItemHasAnyPointSelectedAsAnchor = true;
                    }
                }
            }
            if (item.selected && !pathItemHasAnyPointSelectedAsAnchor) { selectionState.hasInvalidSelection = true; }
        } else if (item.typename === "GroupItem" && item.pageItems) {
            for (var i = 0; i < item.pageItems.length; i++) { validateSelectionRecursive(item.pageItems[i]); if (selectionState.hasInvalidSelection) return; }
        } else if (item.typename === "CompoundPathItem" && item.pathItems) {
            var cpiHasAnyPointSelectedAsAnchor = false;
            if (item.pathItems && item.pathItems.length > 0) {
                for (var i = 0; i < item.pathItems.length; i++) {
                    var subPathItem = item.pathItems[i];
                    if (subPathItem.pathPoints && subPathItem.pathPoints.length > 0) {
                        for (var j = 0; j < subPathItem.pathPoints.length; j++) {
                             if (subPathItem.pathPoints[j].selected === PathPointSelection.ANCHORPOINT) {
                                selectionState.hasSelectedAnchorPoints = true; cpiHasAnyPointSelectedAsAnchor = true;
                             }
                        }
                    }
                }
            }
            if (item.selected && !cpiHasAnyPointSelectedAsAnchor) { selectionState.hasInvalidSelection = true; }
        } else if (item.selected) { selectionState.hasInvalidSelection = true; }
    }
    for (var i = 0; i < sel.length; i++) {
        validateSelectionRecursive(sel[i]);
        if (selectionState.hasInvalidSelection) break;
    }
    if (selectionState.hasInvalidSelection || !selectionState.hasSelectedAnchorPoints) {
        alert("Please select one or more anchor points only.");
        return;
    }

    // --- Helper functions ---
    function arrayContainsPoint(arr, pointToCheck) { 
        if (!arr || typeof arr.length !== 'number') { return false; }
        for (var i = 0; i < arr.length; i++) { if (arr[i] === pointToCheck) { return true; } }
        return false;
    }
    function addPointToUniqueList(point, list) { 
        if (!arrayContainsPoint(list, point)) { list.push(point); }
    }

    // --- Store original selection snapshot & Collect initially selected points AND INDICES ---
    var originalSelectionSnapshot = [];
    for(var i=0; i < sel.length; i++) { originalSelectionSnapshot.push(sel[i]); }

    var masterOriginallySelectedPointsIndices = []; // Store indices instead of points
    function collectAllOriginalPointsRecursive(item) {
        if (item.typename === "PathItem") {
            if (item.pathPoints) {
                for (var k = 0; k < item.pathPoints.length; k++) {
                    var pp = item.pathPoints[k];
                    if (pp.selected === PathPointSelection.ANCHORPOINT) { 
                        masterOriginallySelectedPointsIndices.push({
                            pathItem: item, // Store the PathItem
                            index: k      // Store the index
                        });
                    }
                }
            }
        } else if (item.typename === "GroupItem" && item.pageItems) {
            for (var k = 0; k < item.pageItems.length; k++) { collectAllOriginalPointsRecursive(item.pageItems[k]); }
        } else if (item.typename === "CompoundPathItem" && item.pathItems) {
            for (var k = 0; k < item.pathItems.length; k++) { collectAllOriginalPointsRecursive(item.pathItems[k]); }
        }
    }
    for (var i = 0; i < originalSelectionSnapshot.length; i++) {
        collectAllOriginalPointsRecursive(originalSelectionSnapshot[i]);
    }

    if (masterOriginallySelectedPointsIndices.length === 0) { return; }

    // --- Determine points to REMOVE (using indices) ---
    var pointsToRemoveIndices = [];
    for (var i = 0; i < masterOriginallySelectedPointsIndices.length; i++) {
        var pointInfo = masterOriginallySelectedPointsIndices[i];
        var parentPathItem = pointInfo.pathItem;
        var currentIndex = pointInfo.index;

        if (!parentPathItem || parentPathItem.typename !== "PathItem" || !parentPathItem.pathPoints) {
            pointsToRemoveIndices.push(pointInfo); // Failsafe: remove if context is broken
            continue;
        }
        
        var pathPoints = parentPathItem.pathPoints;
        var numPoints = pathPoints.length;

        var isClosedPath = parentPathItem.closed;
        var isPrevSideExposed = false;
        var isNextSideExposed = false;

        // Determine if the "previous" side is exposed
        if (numPoints === 1) { 
            isPrevSideExposed = true;
        } else if (!isClosedPath && currentIndex === 0) {
            isPrevSideExposed = true;
        } else {
            var prevIndex = (currentIndex - 1 + numPoints) % numPoints;
            var isPrevSelected = false;
            for (var j = 0; j < masterOriginallySelectedPointsIndices.length; j++) {
                if (masterOriginallySelectedPointsIndices[j].pathItem === parentPathItem && 
                    masterOriginallySelectedPointsIndices[j].index === prevIndex) {
                    isPrevSelected = true;
                    break;
                }
            }
            isPrevSideExposed = !isPrevSelected;
        }

        // Determine if the "next" side is exposed
        if (numPoints === 1) {
            isNextSideExposed = true;
        } else if (!isClosedPath && currentIndex === numPoints - 1) {
            isNextSideExposed = true;
        } else {
            var nextIndex = (currentIndex + 1) % numPoints;
            var isNextSelected = false;
            for (var j = 0; j < masterOriginallySelectedPointsIndices.length; j++) {
                if (masterOriginallySelectedPointsIndices[j].pathItem === parentPathItem && 
                    masterOriginallySelectedPointsIndices[j].index === nextIndex) {
                    isNextSelected = true;
                    break;
                }
            }
            isNextSideExposed = !isNextSelected;
        }
        
        if (isPrevSideExposed || isNextSideExposed) {
            pointsToRemoveIndices.push(pointInfo);
        }
    }

    // --- Determine points to KEEP (master list MINUS points to remove) ---
    var pointsToKeepIndices = [];
    for (var i = 0; i < masterOriginallySelectedPointsIndices.length; i++) {
        var isToRemove = false;
        for (var j = 0; j < pointsToRemoveIndices.length; j++) {
            if (masterOriginallySelectedPointsIndices[i].pathItem === pointsToRemoveIndices[j].pathItem &&
                masterOriginallySelectedPointsIndices[i].index === pointsToRemoveIndices[j].index) {
                isToRemove = true;
                break;
            }
        }
        if (!isToRemove) {
            pointsToKeepIndices.push(masterOriginallySelectedPointsIndices[i]);
        }
    }

    // --- Deselect all points ---
    function deselectAllPointsRecursive(item) {
        if (item.typename === "PathItem") {
            if (item.pathPoints) {
                for (var i = 0; i < item.pathPoints.length; i++) {
                    item.pathPoints[i].selected = PathPointSelection.NOSELECTION;
                }
            }
        } else if (item.typename === "GroupItem" && item.pageItems) {
            for (var i = 0; i < item.pageItems.length; i++) { deselectAllPointsRecursive(item.pageItems[i]); }
        } else if (item.typename === "CompoundPathItem" && item.pathItems) {
            for (var i = 0; i < item.pathItems.length; i++) { deselectAllPointsRecursive(item.pathItems[i]); }
        }
    }
    for (var i = 0; i < originalSelectionSnapshot.length; i++) {
        deselectAllPointsRecursive(originalSelectionSnapshot[i]);
    }

    // --- Select the new set of points (using indices) ---
    var reSelectedCount = 0;
    for (var i = 0; i < pointsToKeepIndices.length; i++) {
        var pointInfo = pointsToKeepIndices[i];
        if (pointInfo.pathItem && pointInfo.pathItem.pathPoints && pointInfo.pathItem.pathPoints[pointInfo.index]) {
            try {
                pointInfo.pathItem.pathPoints[pointInfo.index].selected = PathPointSelection.ANCHORPOINT;
                reSelectedCount++;
            } catch (e) { /* ignore error during selection */ }
        }
    }

    // Diagnostic Alert (CONFIRMATION)
//    alert("DECREASE SCRIPT\n---------------------\nInitial selection: " + masterOriginallySelectedPointsIndices.length + 
//          "\nPoints marked for removal: " + pointsToRemoveIndices.length + 
//          "\nFinal points to keep: " + pointsToKeepIndices.length +
//          "\nRe-selected points: " + reSelectedCount);
}

// --- Main execution wrapper ---
try { 
    if (app.documents.length > 0) {
        if (app.activeDocument.selection.length > 0) {
            decreaseSelectionRemoveExposed(); 
        } else { alert("Please select one or more anchor points."); }
    } else { alert("Please open a document first."); }
} catch (e) { alert("Script Error: " + e.name + "\n" + e.message + "\nLine: " + (e.line || 'N/A')); }