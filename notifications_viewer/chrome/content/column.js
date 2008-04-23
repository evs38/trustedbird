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
	Sort the messages from the property "x-nviewer-dsn-status" and "x-nviewer-dsn-flags"
	@param {string} Status ("bad", "middle", "good", or "");
	@param {string} flags (timeout, ...)
	@return {number}
*/
function sortColumn(Status,flags) {
	if (srv.preferences.getBoolPref(srv.extensionKey+".enabled_timeout"))
		if (parseInt(flags) & 0x1) //timeout
			return 5;
	switch(Status) {
		case "bad": return 4;
		case "middle": return 2;
		case "good": return 1;
		default: return 0;
	}
}



/**
	Custom Column Handler
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/
var columnHandlerDSN = {
	getCellText: function(row, column) {
		var key = gDBView.getKeyAt(row);
		var hdr = gDBView.db.GetMsgHdrForKey(key);
		return hdr.getStringProperty("x-nviewer-dsn-summary");
	},

	getSortStringForRow: function(hdr) {
		// Sort the messages from the property "x-nviewer-dsn-status" and "x-nviewer-dsn-flags"
		return sortColumn(hdr.getStringProperty("x-nviewer-dsn-status"),hdr.getStringProperty("x-nviewer-dsn-flags"));
	},
	isString: function() {return true;},

	getCellProperties: function(row, col, props){ },

	getRowProperties:  function(row, props){
		var key = gDBView.getKeyAt(row);
		var hdr = gDBView.db.GetMsgHdrForKey(key);
		var statusP=hdr.getStringProperty("x-nviewer-dsn-status");
		if (srv.preferences.getBoolPref(srv.extensionKey+".enabled_timeout")) {
			// if user want to consider timeout
			var timeOutP=hdr.getStringProperty("x-nviewer-dsn-flags");
			if (parseInt(timeOutP) & 0x1) //timeout
				statusP="timeout";
		}

		if (statusP!=""){
			var aserv=Components.classes["@mozilla.org/atom-service;1"].
			getService(Components.interfaces.nsIAtomService);
			props.AppendElement(aserv.getAtom(statusP)); // CSS
		}
	},

	getImageSrc:         function(row, col) {return null;},
	getSortLongForRow:   function(hdr) {return 0;}
}



/**
	Setting the Custom Column Handler
*/
function columnInit() {
	srv.logSrv("columnInit()");
	var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
	ObserverService.addObserver(createDbObserver, "MsgCreateDBView", false);
}

/**
	addColumnHandler takes a column ID and a handler object
*/
var createDbObserver = {
	// Components.interfaces.nsIObserver
	observe: function(aMsgFolder, aTopic, aData) {
		gDBView.addColumnHandler("colDSN", columnHandlerDSN);
	}
}

