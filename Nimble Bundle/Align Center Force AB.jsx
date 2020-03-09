#target Illustrator
//  script.grandparent = carlos canto
//  script.parent = Herman van Boeijen
//  script.elegant = false;
oldcoordinateSystem = app.coordinateSystem;
app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

var idoc = app.activeDocument;
var selec = idoc.selection;
var usePreviewB = app.preferences.getIntegerPreference('includeStrokeInBounds');
var aligns = [];

#include "Align Hor Force AB.jsx"
alignhorforceab(idoc, selec, usePreviewB, aligns);

#include "Align Vert Force AB.jsx"
alignvertforceab(idoc, selec, usePreviewB, aligns);

app.coordinateSystem = oldcoordinateSystem;