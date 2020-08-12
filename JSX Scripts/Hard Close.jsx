if ( app.documents.length > 0 ) {
    aiDocument = app.activeDocument; aiDocument.close( SaveOptions.DONOTSAVECHANGES ); aiDocument = null;
}
