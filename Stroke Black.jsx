#target Illustrator
if ( app.documents.length > 0 ) {
	mySelection = activeDocument.selection;
	if (mySelection.length>0){
	    var doc = app.activeDocument;                   //current document
	    var sel    = doc.selection;                       //current slection
	    var sl   = sel.length;                            //number of selected objects

			var newRGBColor = new RGBColor();
			newRGBColor.red = 0;
			newRGBColor.green = 0;
			newRGBColor.blue = 0;

      for (var i = 0 ; i < sl; i++){
        var clearme = sel[i];
        clearme.strokeColor = newRGBColor;
      }
      app.redraw();
	}else{
	    alert("Nothing selected!")
	}
}
