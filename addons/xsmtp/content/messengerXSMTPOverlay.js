/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is mozilla.org Code.
 *
 * The Initial Developer of the Original Code is
 *   BT Global Services / Etat francais Ministere de la Defense
 * Portions created by the Initial Developer are Copyright (C) 1998-2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bruno Lebon BT Global Services / Etat francais Ministere de la Defense
 *   Eric Ballet Baz BT Global Services / Etat francais Ministere de la Defense
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// Custom preference initialization
var gPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

xsmtp_registerCustomPreferences('mailnews.customHeaders', ALL_XSMTP_HEADERS, false);
xsmtp_registerCustomPreferences('mailnews.customDBHeaders', ALL_XSMTP_HEADERS, true);

/*
gPrefs.setCharPref('xsmtp.size.flash', 10);
gPrefs.setIntPref('xsmtp.size.immediate', 50);
gPrefs.setIntPref('xsmtp.size.priority', 1000);
gPrefs.setCharPref('xsmtp.size.routine', 10000);
*/
//add custom headers pref
function xsmtp_registerCustomPreferences(preference, values, lower) {
	var headrs = "";
	try {
		headrs = gPrefs.getCharPref(preference);
	} catch(ex) {
	}
   
   	for (var i = 0; i < values.length; i++) {
     	if (headrs.indexOf(values[i]) == -1 && headrs.indexOf(values[i].toLowerCase()) == -1) {
        	if (headrs != "") {
        		headrs += ",";
        	}
            headrs += values[i];
    	}
  	}
  	if (lower) {
  		headrs = headrs.replace(/,/g, " ").toLowerCase();
  	}
  	gPrefs.setCharPref(preference, headrs);
}

// Column handler template definition
function xsmtp_StringColumnHandler(property) {
	// Properties
	this.property = property;
	this.isString = true;

	// Functions
	this.getSortStringForRow = xsmtp_ColumnHandler_getSortStringForRow;
	this.isString            = xsmtp_ColumnHandler_isString;
	this.getCellProperties   = xsmtp_ColumnHandler_getCellProperties;
	this.getRowProperties    = xsmtp_ColumnHandler_getRowProperties;
	this.getImageSrc         = xsmtp_ColumnHandler_getImageSrc;
	this.getSortLongForRow   = xsmtp_ColumnHandler_getSortLongForRow;
	this.getCellText         = xsmtp_ColumnHandler_getCellText;
}

// Column handler template definition
function xsmtp_LongColumnHandler(property) {
	// Properties
	this.property = property;
	this.isString = false;

	// Functions
	this.getSortStringForRow = xsmtp_ColumnHandler_getSortStringForRow;
	this.isString            = xsmtp_ColumnHandler_isString;
	this.getCellProperties   = xsmtp_ColumnHandler_getCellProperties;
	this.getRowProperties    = xsmtp_ColumnHandler_getRowProperties;
	this.getImageSrc         = xsmtp_ColumnHandler_getImageSrc;
	this.getSortLongForRow   = xsmtp_ColumnHandler_getSortLongForRow;
	this.getCellText         = xsmtp_ColumnHandler_getCellText;
}

function xsmtp_ColumnHandler_getSortStringForRow(hdr)           { return (this.isString) ? hdr.getStringProperty(this.property) : ""; }
function xsmtp_ColumnHandler_isString()                         { return this.isString; }
function xsmtp_ColumnHandler_getCellProperties(row, col, props) {}
function xsmtp_ColumnHandler_getRowProperties(row, props)       {}
function xsmtp_ColumnHandler_getImageSrc(row, col)              {return null; }
function xsmtp_ColumnHandler_getSortLongForRow(hdr)             { return (this.isString) ? 0 : new Number(hdr.getStringProperty(this.property)).value; }

function xsmtp_ColumnHandler_getCellText(row, col) {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);
    return hdr.getStringProperty(this.property);
}

// Column handler registration
function xsmtp_addCustomColumnHandler() {
    if (gDBView) {
    	for (var i = 0; i < ALL_XSMTP_HEADERS.length; i++) {
    		if (ALL_XSMTP_HEADERS[i] == XSMTP_HEADER_X_P772_CODRESS_MESSAGE) {
    			gDBView.addColumnHandler(ALL_XSMTP_HEADERS[i], new xsmtp_LongColumnHandler(ALL_XSMTP_HEADERS[i].toLowerCase()));
    		} else {
	    		gDBView.addColumnHandler(ALL_XSMTP_HEADERS[i], new xsmtp_StringColumnHandler(ALL_XSMTP_HEADERS[i].toLowerCase()));
	    	}
    	}
    }
}

// Alert listener for flash messages
var xsmtp_flashAlertFolderListener = {
  itemAdded: function(item) {
    var hdr;
    try {
      hdr = item.QueryInterface(Components.interfaces.nsIMsgDBHdr);
    } catch (ex) {
      // This could happen if item is a folder instead of a message
    }

    if (hdr && !hdr.isRead) {
        // If this is a flash message
        if (hdr.getStringProperty(XSMTP_HEADER_X_P772_PRIMARY_PRECEDENCE.toLowerCase()) == XSMTP_PRIORITY_FLASH) {
            // Set focus on the message just current added
            gDBView.selectMsgByKey(hdr.messageKey);

            // Open alert popup
            window.openDialog("chrome://xsmtp/content/alert/alert.xul", "_blank", "all,chrome,dialog=no,modal,centerscreen", hdr.folder.getUriForMsg(hdr), hdr.folder.URI);
        }
    }
  },

  itemDeleted:           function(aMove, aSrcItems, aDestFolder) {},
  itemMoveCopyCompleted: function(item, property, oldValue, newValue) {},
  folderRenamed:         function(aOrigFolder, aNewFolder) {}
}

// MsgCreateDBView observer
var xsmtp_MsgCreateDBViewObserver = {
	// Components.interfaces.nsIObserver
	observe: function(aMsgFolder, aTopic, aData) {
		// Add custom ColumnHandlers
		xsmtp_addCustomColumnHandler();
	}
}

// Add folder listener
var xsmtp_msgFolderNotificationService = Components.classes["@mozilla.org/messenger/msgnotificationservice;1"].getService(Components.interfaces.nsIMsgFolderNotificationService);
xsmtp_msgFolderNotificationService.addListener(xsmtp_flashAlertFolderListener);

// Onload event
function xsmtp_doOnceLoaded() {
	var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
	observerService.addObserver(xsmtp_MsgCreateDBViewObserver, "MsgCreateDBView", false);
	window.document.getElementById('folderTree').addEventListener("select", xsmtp_addCustomColumnHandler, false);
}

// Register onload event
window.addEventListener("load", xsmtp_doOnceLoaded, false);
