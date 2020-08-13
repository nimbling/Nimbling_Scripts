#target Illustrator
#targetengine main

if ( app.documents.length > 0 ) {
    var curDoc = app.activeDocument;
}else{
    Window.alert("This script needs an open document to work.");
}

try{
app.executeMenuCommand ('edge');
app.executeMenuCommand ('AI Bounding Box Toggle');
}
catch(err){}