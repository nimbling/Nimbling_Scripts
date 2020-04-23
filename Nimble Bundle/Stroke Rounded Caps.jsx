#target Illustrator
if (app.documents.length > 0) {
	mySelection = activeDocument.selection;
	if (mySelection.length > 0) {
		var doc = app.activeDocument;                   //current document
		var sel = doc.selection;                       //current slection
		var sl = sel.length;                            //number of selected objects
		for (var i = 0; i < sl; i++) {
			var strokeMe = sel[i];
			if (strokeMe.typename === "CompoundPathItem") {
				strokeMe = sel[i].pathItems[0];
			}
			if (strokeMe.strokeCap != StrokeCap.ROUNDENDCAP) {
				strokeMe.strokeCap = StrokeCap.ROUNDENDCAP;
				strokeMe.strokeJoin = StrokeJoin.ROUNDENDJOIN;
			} else {
				strokeMe.strokeCap = StrokeCap.BUTTENDCAP;
				strokeMe.strokeJoin = StrokeJoin.MITERENDJOIN;
			}
		}
		app.redraw();
	} else {
		alert("Nothing selected!")
	}
}
