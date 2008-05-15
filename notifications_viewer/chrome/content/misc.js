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
	misc methods
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/


/**
	@class Services for this plugin
	@constructor
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/
function Services() {
	/** @type string */
	this.extensionName="notifications_viewer";
	/** @type string */
	this.extensionKey="extensions."+this.extensionName;
	/** define current version for this extension @type string */
	this.extensionVersion="0.6.1";
	/** preferences @type Preferences */
	this.preferences=new Preferences();
	/** set debug mode @type boolean */
	this.modeDebug=this.preferences.getBoolPref(this.extensionKey+".debug");
	/** @type nsIConsoleService */
	this.consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
}

Services.prototype = {
/**
	log message to console (only if debug mode is enabled)
	@param {string} msg Message to log
*/
	logSrv : function( msg )
	{
		if (!this.modeDebug) return;
		this.consoleService.logStringMessage(this.extensionName+" : "+msg);
		dump(this.extensionName+":..:"+this.currentDate()+": "+msg+"\n");
	},

	/**
		reports error to console
		@param err error to report
	*/
	errorSrv : function(err) {
		var scriptError = Components.classes["@mozilla.org/scripterror;1"].createInstance(Components.interfaces.nsIScriptError);
		scriptError.init(this.extensionName+" : "+err, "", "", 0,0,0,0);
		this.consoleService.logMessage(scriptError);
		dump(this.extensionName+":EE:"+this.currentDate()+": "+err+"\n");
	},

	/**
		reports warning to console
		@param msg warning to report
	*/
	warningSrv: function(msg)
	{
		var scriptWarning = Components.classes["@mozilla.org/scripterror;1"].createInstance(Components.interfaces.nsIScriptError);
		scriptWarning.init(this.extensionName+" : "+msg, "", "", 0,0,1,0);
		this.consoleService.logMessage(scriptWarning);
		dump(this.extensionName+":WW:"+this.currentDate()+": "+msg+"\n");
	},

	/**
		return current date
		@return {string} current date
	*/
	currentDate: function ()
	{
		var date=new Date();
		return date.toGMTString();
	}
}








/***
	place the metacharacter \ (backslash) in front of the metacharacter that we want to use as a literal
	@param {string} str a string
	@return {string} str with escape keys

*/
function escapeRegExp(str) {
	var keys=["\\","$","^","-",".","[","]","{","}","?","*","+","(",")"];
	for (var i=0 ; i < keys.length ; i++)
	{
		var myExp=new RegExp("(\\"+keys[i]+"+)","g");
		str=str.replace(myExp,"\\"+keys[i]);
	}
	return str;
}


/**
	Preferences Dialog Box
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/
var prefDialogBox = {
	services : null,
	windowParent : null,

	/**
		Init Preferences Dialog Box
	*/
	initPrefDialog : function () {
		if (!this.services)
			this.services= new Services();

		// get window parent
		this.windowParent=window.opener;
		while (this.windowParent) {
			var resu=this.windowParent.document.getElementById("colDSN");
			if (resu)
				break; // it's messengerWindow
			this.windowParent=this.windowParent.opener;
		}

		document.getElementById("considerTimeout").checked = this.services.preferences.getBoolPref(this.services.extensionKey+".enabled_timeout");
		document.getElementById("timeOut").value = this.services.preferences.getIntPref(this.services.extensionKey+".timeout");
		this.enableTimeOut();
		document.getElementById("markRead").checked = this.services.preferences.getBoolPref(this.services.extensionKey+".mark_notifications_as_read");
		document.getElementById("moveNotification").checked = this.services.preferences.getBoolPref(this.services.extensionKey+".thread_on_original_message");
		document.getElementById("notificationsDisplayTextAndIcons").selectedIndex = (this.services.preferences.getIntPref(this.services.extensionKey+".display_text_and_icons"))-1;
		document.getElementById("showOnHeaderView").checked = this.services.preferences.getBoolPref(this.services.extensionKey+".display_headerview");

		// columns
		if (this.windowParent) {
			document.getElementById("columnDelivered").checked = ! this.windowParent.document.getElementById("colDSN").hidden;
			document.getElementById("columnDisplayed").checked = ! this.windowParent.document.getElementById("colMDNDisplayed").hidden;
			document.getElementById("columnDeleted").checked = ! this.windowParent.document.getElementById("colMDNDeleted").hidden;
		} else {
			document.getElementById("columnDelivered").disabled=true;
			document.getElementById("columnDisplayed").disabled=true;
			document.getElementById("columnDeleted").disabled=true;
			this.services.warningSrv("prefDialogBox.initPrefDialog - Impossible to hide/show columns with this window preferences");
		}
	},

	/**
		Save Preferences from Dialog Box
		@return {boolean} <b>false</b> if an error occured
	*/
	savePrefs : function() {
		if (!this.services)
			this.services= new Services();

		var strbundle=document.getElementById("prefStr");

		var timeOutValue=parseInt(document.getElementById("timeOut").value);

		if (isNaN(timeOutValue) || timeOutValue<1 || timeOutValue>3600) {
			alert(strbundle.getString("invalidTimeOutValue"));
			return false;
		}

		this.services.preferences.setBoolPref(this.services.extensionKey+".enabled_timeout",document.getElementById("considerTimeout").checked);
		this.services.preferences.setIntPref(this.services.extensionKey+".timeout",timeOutValue);
		this.services.preferences.setBoolPref(this.services.extensionKey+".mark_notifications_as_read",document.getElementById("markRead").checked);
		this.services.preferences.setBoolPref(this.services.extensionKey+".thread_on_original_message",document.getElementById("moveNotification").checked);
		this.services.preferences.setIntPref(this.services.extensionKey+".display_text_and_icons",(document.getElementById("notificationsDisplayTextAndIcons").selectedIndex)+1);
		this.services.preferences.setBoolPref(this.services.extensionKey+".display_headerview",document.getElementById("showOnHeaderView").checked);

		// columns
		if (this.windowParent) {
			this.windowParent.document.getElementById("colDSN").hidden = ! document.getElementById("columnDelivered").checked;
			this.windowParent.document.getElementById("colMDNDisplayed").hidden = ! document.getElementById("columnDisplayed").checked;
			this.windowParent.document.getElementById("colMDNDeleted").hidden = ! document.getElementById("columnDeleted").checked;
		}
		return true;
	},

	/**
		Enable/disable TimeOut
	*/
	enableTimeOut : function() {
		document.getElementById("timeOut").disabled= !document.getElementById("considerTimeout").checked;
	}
}


/**
	Move message
	@param {nsIMsgDBHdr} msgHdr message to move
	@param {nsIMsgFolder} dstFolder folder destination
	@return {boolean} return <b>false</b> if an error occured
*/
function moveMessage (msgHdr, dstFolder) {

	var srcFolder=msgHdr.folder;

	// test if srcFolder and dstFolder are equals
	if (srcFolder==dstFolder) {
		srv.logSrv("moveMessage - source and target are equals. Exit");
		return true;
	}

	var messagesArray = Components.classes["@mozilla.org/supports-array;1"].createInstance(Components.interfaces.nsISupportsArray);

	messagesArray.AppendElement(msgHdr);

	srv.logSrv("moveMessage - from: '" + srcFolder.abbreviatedName + "' to '" + dstFolder.abbreviatedName + "': " + msgHdr.messageId);

	try {
		dstFolder.copyMessages(
			srcFolder,       // srcFolder
			messagesArray,   // nsISupportsArray
			true,            // isMove
			msgWindow,       // nsIMsgWindow
			null,            // nsIMsgCopyServiceListener
			false,           // isFolder
			true             // allowUndo
		);
	} catch (ex) {
		srv.errorSrv("moveMessage - Error moving messages from '" + srcFolder.abbreviatedName + "' to '" + dstFolder.abbreviatedName + "' - MsgId: " + msgHdr.messageId);
		return false;
	}

	return true;
}

/**
	return a valid address mail
	<p>
	Example: <Pre>getValidAddress("My Name&#60;my.name&#64;mydomain.org&#62;") // return my.name&#64;mydomain.org</pre>
	@param {string} address address to check
	@return {string} return a valid address mail or <b>null</b>
*/
function getValidAddress(address) {
	var regExp=new RegExp("([^,<> ]+@[^,<> ]+)","ig");
	regExp.lastIndex=0;
	address=regExp.exec(address);
	if (address && address.length>1) {
		// a valid address
		return address[1];
	}
	return null;
}




