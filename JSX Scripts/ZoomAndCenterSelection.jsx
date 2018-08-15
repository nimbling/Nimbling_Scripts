/////////////////////////////////////////////////////////////////
//Zoom and Center to Selection v2. -- CS, CS2
//>=--------------------------------------
//
//	Zooms active view to selected object(s).
//  
//  New in v.2:
//  If nothing is selected; sets view to 100% at current location.
//
//	Simple but REALLY cool!
//
//>=--------------------------------------
// JS code (c) copyright: John Wundes ( john@wundes.com ) www.wundes.com
//copyright full text here:  http://www.wundes.com/js4ai/copyright.txt
////////////////////////////////////////////////////////////////// 
amountofsteps=60.000;
waittime = 2.000;
Zoomfudge = 0.10;
CPStepX = 0.000;
CPStepY = 0.000;
currentstep = 0.000;
zF = 0.000;

function setTheZoom(activeDocument, zF, Zoomstep, CPStepX, CPStepY, currentstep){
    activeDocument.views[0].zoom = ZoomSRC + (Zoomstep*currentstep);
    
 	cntrPos[0] = cntrPosXsrc+(CPStepX*currentstep);
    cntrPos[1] = cntrPosYsrc+(CPStepY*currentstep);
    activeDocument.views[0].centerPoint =  cntrPos;
}

function wait(ms)
{
var d = new Date();
var d2 = null;
do { d2 = new Date(); }
while(d2-d < ms);
}

function tweenQuadOut(t, b, c, d){ //QUADRATIC EASE OUT

	t = t/d;
	value = -1*c*t*(t-2)+b;
	return value;
}

function tweenLinear(t, b, c, d){ //LINEAR EASE
	value = c*t/d+b;
	return value;
}

function tweenCubicInOut(t, b, c, d){ //QUARTIC EASE IN/OUT - accel halfway, decel other half
	t = t/(d/2);
	if(t<1){
		value = c/2*t*t*t*t+b;
	} else {
	t=t-2;
	value = -c/2*(t*t*t*t-2)+b;
	}
	return value;
}


if ( documents.length > 0)
{
	if(activeDocument.selection.length >0){
		mySelection = activeDocument.selection;
		//if object is a (collection of) object(s) not a text field.
		if (mySelection instanceof Array) {
			//initialize vars
			initBounds = mySelection[0].visibleBounds;
			ul_x = initBounds[0];
			ul_y = initBounds[1];
			lr_x = initBounds[2];
			lr_y = initBounds[3];
			//check rest of group if any
			for (i=1; i<mySelection.length; i++) {
			groupBounds = mySelection[i].visibleBounds;
			if (groupBounds[0]<ul_x){ul_x=groupBounds[0]}
			if (groupBounds[1]>ul_y){ul_y=groupBounds[1]}
			if (groupBounds[2]>lr_x){lr_x=groupBounds[2]}
			if (groupBounds[3]<lr_y){lr_y=groupBounds[3]}
			}

 
		}
	 
		//get x,y/x,y Matrix for 100% view

		ScreenSize = activeDocument.views[0].bounds;
		ScreenWidth= ScreenSize[2] - ScreenSize[0];
		ScreenHeight=ScreenSize[1] - ScreenSize[3];
		screenProportion =ScreenHeight/ScreenWidth;

		//Determine upperLeft position of object(s)
		cntrPos = [ul_x,ul_y];

		mySelWidth=(lr_x-ul_x);
		mySelHeight=(ul_y-lr_y);
		
		//offset by half width and height		
		cntrPosXTarg  = ul_x + (mySelWidth/2);
		cntrPosYTarg = ul_y - (mySelHeight/2);
		
		cntrPosXsrc = activeDocument.views[0].centerPoint[0];
		cntrPosYsrc = activeDocument.views[0].centerPoint[1];
		
		cntrPosXDif = cntrPosXTarg - cntrPosXsrc;
		cntrPosYDif = cntrPosYTarg - cntrPosYsrc;
		
		//set zoom for height and width
		zoomFactorW = ScreenWidth/mySelWidth;
		zoomFactorH = ScreenHeight/mySelHeight;
		
		//decide which proportion is larger...
    	if((mySelWidth*screenProportion) >= mySelHeight){
    		zF = zoomFactorW*Zoomfudge;
    	}else{
    		zF = zoomFactorH*Zoomfudge;
    	}
    	
    	ZoomSRC = activeDocument.views[0].zoom;
        ZoomDif = zF - ZoomSRC;
	//and scale to that proportion minus a little bit.

	for (i = 0; i < amountofsteps; i++) {
        Zoomstep = ZoomDif/amountofsteps;
		CPStepX = cntrPosXDif/amountofsteps;
		CPStepY = cntrPosYDif/amountofsteps;
        currentstep = i;
		setTheZoom(activeDocument, zF, Zoomstep, CPStepX, CPStepY, currentstep);
		wait(waittime);
	}


	}else{
		//alert("Please select an object on the page.");
		activeDocument.activeView.zoom=1;
	}
}