 #target Illustrator
if ( app.documents.length > 0 ) {
	mySelection = activeDocument.selection;
	if (mySelection.length>0){
	    var doc = app.activeDocument;                   //current document
	    var sel    = doc.selection;                       //current slection
	    var sl   = sel.length;                            //number of selected objects

      for (var i = 0 ; i < sl; i++){
        var pgitem = sel[i];
        var currentstrokewidth;
        var newstrokewidth;
        currentstrokewidth = pgitem.strokeWidth;
        if (currentstrokewidth <= 1){
        	newstrokewidth = currentstrokewidth - 0.1;
        } else {
        	newstrokewidth = currentstrokewidth - 1;
        }
        if (newstrokewidth <= 0) {
            newstrokewidth = 0.1;
        }
        pgitem.strokeWidth = newstrokewidth;

        // alert (currentstrokewidth);
        // clearme.strokeColor = newRGBColor;
      }
      app.redraw();
	}else{
	    alert("Nothing selected!")
	}
}
