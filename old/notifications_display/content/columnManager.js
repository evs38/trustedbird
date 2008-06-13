// Custom preference initialization
var gPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
gPrefs.setCharPref("mailnews.customDBHeaders",MSG_MDN_PROPERTY_BOOL_DISPLAYED);
gPrefs.setCharPref("mailnews.customHeaders",MSG_MDN_PROPERTY_BOOL_DISPLAYED);

// Column handler template definition
function n_StringColumnHandler(property) {
  // Properties
  this.property = property;
 

  // Functions
  this.getSortStringForRow = n_ColumnHandler_getSortStringForRow;
  this.isString            = n_ColumnHandler_isString;
  this.getCellProperties   = n_ColumnHandler_getCellProperties;
  this.getRowProperties    = n_ColumnHandler_getRowProperties;
  this.getImageSrc         = n_ColumnHandler_getImageSrc;
  this.getSortLongForRow   = n_ColumnHandler_getSortLongForRow;
  this.getCellText         = n_ColumnHandler_getCellText;
}

function n_ColumnHandler_getSortStringForRow(hdr) {
	return hdr.getStringProperty(this.property) ;
}
function n_ColumnHandler_isString() {
	return true;
}
function n_ColumnHandler_getCellProperties(row, col, props) {
}
function n_ColumnHandler_getRowProperties(row, props) {
}
function n_ColumnHandler_getImageSrc(row, col) {
	return null;
}
function n_ColumnHandler_getSortLongForRow(hdr) {
	return 0;
}

function n_ColumnHandler_getCellText(row, col) {
	var key = gDBView.getKeyAt(row);
	var hdr = gDBView.db.GetMsgHdrForKey(key);
   
	return hdr.getStringProperty(this.property);
}
// Column handler registration
function n_addCustomColumnHandler() {
	if (gDBView) {
        
		gDBView.addColumnHandler("MDN",
				new n_StringColumnHandler(MSG_MDN_PROPERTY_BOOL_DISPLAYED));

	}
}

// DBView observer
var n_msgCreateDBViewObserver = {
	// Components.interfaces.nsIObserver
	observe : function(aMsgFolder, aTopic, aData) {
		// Add custom ColumnHandlers
		n_addCustomColumnHandler();
	}
}

// Onload event
function n_doOnceLoaded() {
	var observerService = Components.classes["@mozilla.org/observer-service;1"]
			.getService(Components.interfaces.nsIObserverService);
	observerService.addObserver(n_msgCreateDBViewObserver, "MsgCreateDBView",
			false);
	window.document.getElementById('folderTree').addEventListener("select",
			n_addCustomColumnHandler, false);
  
}

// Register onload event
window.addEventListener("load", n_doOnceLoaded, false);