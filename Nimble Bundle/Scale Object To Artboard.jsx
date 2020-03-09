﻿#target Illustrator
//  script.name = fitObjectToArtboardBounds.jsx;

//  script.required = select ONE object before running; CS4 & CS5 Only.

//  01/25/12;
//  script.elegant = false;
var idoc = app.activeDocument; selec = idoc.selection;
if (selec.length==1)
  
  var docw = idoc.width;
  var doch = idoc.height;
  
  docLeft = activeAB.artboardRect[0];
  docTop = activeAB.artboardRect[1];
  // get selection bounds
  var sel = idoc.selection[0];
  var selVB = sel.visibleBounds;
  var selVw = selVB[2]-selVB[0];
  var selVh = selVB[1]-selVB[3];
  var selGB = sel.geometricBounds;
  var selGw = selGB[2]-selGB[0];
  
  // get the difference between Visible & Geometric Bounds
  var deltaX = selVw-selGw;
  var deltaY = selVh-selGh;
  sel.width = docw-deltaX; // width is Geometric width, so we need to make it smaller...to accomodate the visible portion.
  sel.height = doch-deltaY;
  sel.top = docTop; // Top is actually Visible top
  sel.left = docLeft; // dito for Left
}
  alert("select ONE object before running");
}