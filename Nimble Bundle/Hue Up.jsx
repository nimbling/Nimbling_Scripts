#target Illustrator
#targetengine main
if ( app.documents.length > 0 ) {
    var curDoc = app.activeDocument;
}else{
    Window.alert("You must open at least one document.");
}
#include "color-conversion-algorithms.jsx"
#include "hueMe.jsx"
increment = 0.025;

var sel = curDoc.selection; // get selection

for (var i = 0; i < sel.length; i++) {
    recurseHelper(sel[i]);
}