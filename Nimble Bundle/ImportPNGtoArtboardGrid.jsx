#target Illustrator #targetengine main

// ASSUMES PNG'S OF 500x500 PX IN SAME FOLDER AS .AI File
// RENAMES ARTBOARDS TO NAME OF PNG FOUND
// Written by Robert Moggach & Qwertyfly
// Frankensteined together by Herman van Boeijen

function getFolder() {	// Frankensteined to just get the folder this file is in
	pathToFile = app.activeDocument.path;
	var selectedFolder = new Folder(pathToFile);
	return selectedFolder;
}

function newRect(x, y, width, height) {
    var l = 0;
    var t = 1;
    var r = 2;
    var b = 3;

    var rect = [];

    rect[l] = x;
    rect[t] = y;
    rect[r] = width + x;
    rect[b] = -(height - rect[t]);

    return rect;
};

function importFolderAsLayers(selectedFolder) {
	// if a folder was selected continue with action, otherwise quit
	var doc;
  	
	app.coordinateSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM;  
  
	if (selectedFolder) {
	  doc  = app.activeDocument;
	  var firstImageLayer = true;
	  var newLayer;
	  var posX=0;
	  var posY=0;
	  var count=0;
	  var prettyname = "";
	  var rectside = 512;
	  var margin = 200;
		
	  // create document list from files in selected folder
	  var imageList = selectedFolder.getFiles();
  
	  for (var i = 0; i < imageList.length; i++) {
		if (imageList[i] instanceof File) {
		  var fileName = imageList[i].name.toLowerCase();
		  if( (fileName.indexOf(".png") == -1) ) {
			continue;
		  } else {
			prettyname = fileName.substring(0, fileName.indexOf(".") );
			if( firstImageLayer ) {
			  newLayer = doc.layers[0];
			  firstImageLayer = false;
			  var activeAB = doc.artboards[doc.artboards.getActiveArtboardIndex()];
			  activeAB.name = prettyname;
			} else {
			  newLayer = doc.layers.add();
			  box = newRect(posX, posY, rectside, rectside)
			  var AB = doc.artboards.add(box);
			  AB.name = prettyname;
			}
			// Name the Layer after the image file
			newLayer.name = prettyname;
  
			// Place the image
			newGroup = newLayer.groupItems.createFromFile( imageList[i] );
			newGroup.position = [ posX , posY ];
			var activeAB = doc.artboards[doc.artboards.getActiveArtboardIndex()];
			box = newRect(posX, posY, rectside, rectside)
			activeAB.artboardRect = box;
		  }
		}
		
		posX += rectside + margin;
		if(posX >= (612*5)) {
		  posX = 0;
		  posY -= (rectside + margin);
		}
	  }
	  	  
	  if( firstImageLayer ) {
		// alert("The action has been cancelled.");
		// display error message if no supported documents were found in the designated folder
		alert("Sorry, but the designated folder does not contain any recognized image formats.\n\nPlease choose another folder.");
		doc.close();
		importFolderAsLayers(getFolder());
	  }
	} else {
	  // alert("The action has been cancelled.");
	  // display error message if no supported documents were found in the designated folder
	  alert("Rerun the script and choose a folder with images.");
	  //importFolderAsLayers(getFolder());
	}
  }							
  
  // Start the script off
  importFolderAsLayers( getFolder() );

  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  function ScaleToArtboard(){
	var docw = doc.width;
	var doch = doc.height;
	
	var activeAB = doc.artboards[doc.artboards.getActiveArtboardIndex()]; // get active AB
	docLeft = activeAB.artboardRect[0];
	docTop = activeAB.artboardRect[1];
	// get selection bounds
	var sel = doc.selection[0];
	var selVB = sel.visibleBounds;
	var selVw = selVB[2]-selVB[0];
	var selVh = selVB[1]-selVB[3];
	var selGB = sel.geometricBounds;
	var selGw = selGB[2]-selGB[0];
	
	var selGh = selGB[1]-selGB[3];
	// get the difference between Visible & Geometric Bounds
	var deltaX = selVw-selGw;
	var deltaY = selVh-selGh;
	sel.width = docw-deltaX; // width is Geometric width, so we need to make it smaller...to accomodate the visible portion.
	sel.height = doch-deltaY;
	sel.top = docTop; // Top is actually Visible top
	sel.left = docLeft; // dito for Left
  }


  function CenterEverythingToArtboards(doc){
    //Get total amount of groups
    var TotalArtboards = doc.artboards.length;

//iterate all Artboards
    for (var i = 0 ; i < TotalArtboards ; i++){
        var CurrentArtboard = doc.artboards[i];
        doc.artboards.setActiveArtboardIndex(i);

        //Select everything on artboard
        doc.selectObjectsOnActiveArtboard(i);
		ScaleToArtboard();
        }
}
doc  = app.activeDocument;
CenterEverythingToArtboards(doc);

// app.executeMenuCommand ('save');
// app.executeMenuCommand ('close');