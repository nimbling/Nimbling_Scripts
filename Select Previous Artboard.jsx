#target "illustrator-19";
if ( app.documents.length > 0) {
    doc = app.activeDocument;
    var TotalArtboards = doc.artboards.length;  
    var activeAB = doc.artboards.getActiveArtboardIndex();
    //Window.alert("activeAB = "+activeAB + "TotalArtboards = " +TotalArtboards);
    if (activeAB == 0){
        NextAB = TotalArtboards-1;
    }else{
        NextAB = activeAB-1;
    }
    doc.artboards.setActiveArtboardIndex(NextAB);

var activeAB = doc.artboards.getActiveArtboardIndex();
var artPoints = doc.artboards[activeAB].artboardRect;

var ul_x = artPoints[0];
var ul_y = artPoints[1];
var lr_x = artPoints[2];
var lr_y = artPoints[3];

//get x,y/x,y Matrix for 100% view
 
activeDocument.views[0].zoom = 1;
ScreenSize = activeDocument.views[0].bounds;
ScreenWidth= ScreenSize[2] - ScreenSize[0];
ScreenHeight=ScreenSize[1] - ScreenSize[3];
screenProportion =ScreenHeight/ScreenWidth;

//Determine upperLeft position of object(s)
 cntrPos = [ul_x,ul_y];
 
     //mySelection[0].position;
//cntrPos[0] += (mySelection[0].width /2);
//cntrPos[1] -= (mySelection[0].height /2);
//offset by half width and height
mySelWidth=(lr_x-ul_x);
mySelHeight=(ul_y-lr_y);
cntrPos[0] = ul_x + (mySelWidth/2);
cntrPos[1] = ul_y - (mySelHeight/2);
//alert("ul point is "+cntrPos);
//center to screen to the object
activeDocument.views[0].centerPoint =  cntrPos;
//alert("objWidth="+mySelection[0].width+", actualWidth="+ActualWidth);
//alert("objHeight="+mySelection[0].height+", actualHeight="+ActualHeight);

//set zoom for height and width
zoomFactorW = ScreenWidth/mySelWidth;
zoomFactorH = ScreenHeight/mySelHeight;
//alert("zoomFactorW = "+zoomFactorW+"\r zoomFactorH = "+zoomFactorH);

//decide which proportion is larger...
if((mySelWidth*screenProportion) >= mySelHeight){
zF = zoomFactorW;
//alert("zoomFactorW = "+zoomFactorW);
}else{
zF = zoomFactorH;
 //alert("zoomFactorH = "+zoomFactorH);
}

//and scale to that proportion minus a little bit.
activeDocument.views[0].zoom = zF *.5;

}else{
//alert("Please select an object on the page.");
activeDocument.activeView.zoom=1;
}

    // var activeAB = doc.artboards[doc.artboards.getActiveArtboardIndex()];
    // var voorzet = activeAB.name;
    // var Newname = prompt("Rename Artboard", voorzet);
    // if (Newname){
    //   activeAB.name = Newname;
    // }
