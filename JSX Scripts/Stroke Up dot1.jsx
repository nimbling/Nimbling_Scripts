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
       	newstrokewidth = currentstrokewidth + 0.1;
				pgitem.strokeWidth = newstrokewidth;
        // alert (currentstrokewidth);
				// alert (pgitem.StrokeAlignment);

        // clearme.strokeColor = newRGBColor;
      }
      app.redraw();
	}else{
	    alert("Nothing selected!")
	}
}
