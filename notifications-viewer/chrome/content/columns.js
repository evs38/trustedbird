/* ***** BEGIN LICENSE BLOCK *****
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
 * The Original Code is Mozilla Communicator
 * 
 * The Initial Developer of the Original Code is
 *    Daniel Rocher <daniel.rocher@marine.defense.gouv.fr>
 *       Etat francais Ministere de la Defense
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 * 
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the LGPL or the GPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK ***** */


/**
	@fileoverview
	Custom Column Handler
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/


/**
	Custom DSN Column Handler
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/
var columnHandlerDSN = {
	getCellText: function(row, column) {
		var key = gDBView.getKeyAt(row);
		var hdr = gDBView.db.GetMsgHdrForKey(key);
		
		/* Parse message if unknown */
		if (hdr.getStringProperty("x-nviewer-seen") == "") notifyListener.getMsgSrc(hdr, notifyListener.parseMsg);
		
		/* Sync message db if needed */
		syncMessageDb(hdr);
		
		return hdr.getStringProperty("x-nviewer-dsn-summary");
	},

	getSortStringForRow: function(hdr) {
		var level = "0";
		if (hdr.getStringProperty("x-nviewer-timedout") != "yes") {
			switch (hdr.getStringProperty("x-nviewer-status")) {
				case "bad": level = "1"; break;
				case "middle": level = "2"; break;
				case "good": level = "3"; break;
				default: level = "4";
			}
		}
		
		return level + "-" + hdr.getStringProperty("x-nviewer-dsn-summary");
	},
	isString: function() {return true;},

	getCellProperties: function(row, col, props){ },

	getRowProperties:  function(row, props){
		var key = gDBView.getKeyAt(row);
		var hdr = gDBView.db.GetMsgHdrForKey(key);
		
		var statusP = hdr.getStringProperty("x-nviewer-status");
		if (srv.preferences.getBoolPref(srv.extensionKey + ".enabled_timeout")) {
			// if user want to consider timeout
			var timedOut = hdr.getStringProperty("x-nviewer-timedout");
			if (timedOut == "yes") statusP = "timeout";
		}

		if (statusP != "") {
			var aserv=Components.classes["@mozilla.org/atom-service;1"].
			getService(Components.interfaces.nsIAtomService);
			props.AppendElement(aserv.getAtom(statusP)); // CSS
		}
	},

	getImageSrc:         function(row, col) {return null;},
	getSortLongForRow:   function(hdr) {return 0;}
}

/**
	Custom MDN Displayed Column Handler
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/
var columnHandlerMDNDisplayed = {
	getCellText: function(row, column) {
		var key = gDBView.getKeyAt(row);
		var hdr = gDBView.db.GetMsgHdrForKey(key);
		
		/* Parse message if unknown */
		if (hdr.getStringProperty("x-nviewer-seen") == "") notifyListener.getMsgSrc(hdr, notifyListener.parseMsg);
		
		/* Sync message db if needed */
		syncMessageDb(hdr);
		
		return hdr.getStringProperty("x-nviewer-mdn-displayed-summary");
	},
	getSortStringForRow: function(hdr) {
		return hdr.getStringProperty("x-nviewer-mdn-displayed-summary");
	},
	isString: function() {return true;},
	getCellProperties: function(row, col, props){ },
	getRowProperties:  function(row, props){ },
	getImageSrc:         function(row, col) {return null;},
	getSortLongForRow:   function(hdr) {return 0;}
}

/**
	Custom MDN Deleted Column Handler
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/
var columnHandlerMDNDeleted = {
	getCellText: function(row, column) {
		var key = gDBView.getKeyAt(row);
		var hdr = gDBView.db.GetMsgHdrForKey(key);
		
		/* Parse message if unknown */
		if (hdr.getStringProperty("x-nviewer-seen") == "") notifyListener.getMsgSrc(hdr, notifyListener.parseMsg);
		
		/* Sync message db if needed */
		syncMessageDb(hdr);
		
		return hdr.getStringProperty("x-nviewer-mdn-deleted-summary");
	},
	getSortStringForRow: function(hdr) {
		return hdr.getStringProperty("x-nviewer-mdn-deleted-summary");
	},
	isString: function() {return true;},
	getCellProperties: function(row, col, props){ },
	getRowProperties:  function(row, props){ },
	getImageSrc:         function(row, col) {return null;},
	getSortLongForRow:   function(hdr) {return 0;}
}

/**
	Setting the Custom Column Handler.
	add a popupshowing event listener for the menu.
*/
function columnInit() {
	srv.logSrv("columnInit()");
	var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
	ObserverService.addObserver(notificationsViewerCreateDbObserver, "MsgCreateDBView", false);

	// add a popupshowing event listener for menus
	if (document.getElementById("threadPaneContext")) document.getElementById("threadPaneContext").addEventListener("popupshowing", contextPopupShowing, false); // context menu Thunderbird 2
	if (document.getElementById("mailContext")) document.getElementById("mailContext").addEventListener("popupshowing", contextPopupShowing, false); // context menu Thunderbird 3
	document.getElementById("messageMenuPopup").addEventListener("popupshowing", contextPopupShowing, false); // message menu
}

/**
	every time the popup menu is about to show
*/
function contextPopupShowing() {
	try {
		var header=gDBView.hdrForFirstSelectedMessage;
		if (header) {
			var xNviewer=header.getStringProperty("x-nviewer-to");
			if (xNviewer.length>0) {
				if (document.getElementById("notificationsContextMenuTb2")) document.getElementById("notificationsContextMenuTb2").removeAttribute("hidden");
				if (document.getElementById("notificationsContextMenuTb3")) document.getElementById("notificationsContextMenuTb3").removeAttribute("hidden");
				document.getElementById("notificationsMenu").removeAttribute("hidden");
				return;
			}
		}
	} catch(e) {}
	
	if (document.getElementById("notificationsContextMenuTb2")) document.getElementById("notificationsContextMenuTb2").setAttribute("hidden","true");
	if (document.getElementById("notificationsContextMenuTb3")) document.getElementById("notificationsContextMenuTb3").setAttribute("hidden","true");
	document.getElementById("notificationsMenu").setAttribute("hidden","true");
}

/**
	addColumnHandler takes a column ID and a handler object
*/
var notificationsViewerCreateDbObserver = {
	// Components.interfaces.nsIObserver
	observe: function(aMsgFolder, aTopic, aData) {
		gDBView.addColumnHandler("colDSN", columnHandlerDSN);
		gDBView.addColumnHandler("colMDNDisplayed", columnHandlerMDNDisplayed);
		gDBView.addColumnHandler("colMDNDeleted", columnHandlerMDNDeleted);
	}
}

