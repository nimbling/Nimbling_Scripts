var aDoc = app.activeDocument;

aDoc.activeLayer = aDoc.layers.getByName("BGR");

aDoc.activeLayer.locked = false;
aDoc.activeLayer.visible = false;