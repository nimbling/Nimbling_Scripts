#target Illustrator

//  script.name = fitObjectToArtboardBounds.jsx;
//  script.description = resizes selected object to fit exactly to Active Artboard Bounds;
//  script.required = select ONE object before running; CS4 & CS5 Only.
//  script.parent = carlos canto // 01/25/12;
//  script.elegant = false;


var idoc = app.activeDocument;
selec = idoc.selection;
if (selec.length==1)
  {
    // get selection bounds
    var sel = idoc.selection[0];
    sel.filled = false;
  }
else
  {
            alert("select ONE object before running");
  }
