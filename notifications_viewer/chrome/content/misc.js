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
	this.extensionVersion="0.6.3";
	/** preferences @type Preferences */
	this.preferences=new Preferences();
	/** set debug mode @type boolean */
	this.modeDebug=this.preferences.getBoolPref(this.extensionKey+".debug");
	/** @type nsIConsoleService */
	this.consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);

	/** Internationalization @type  nsIStringBundle */
	this.strbundle=null;
	/** Internationalization @type nsIStringBundleService */
	this.strBundleService=Components.classes["@mozilla.org/intl/stringbundle;1"].getService().QueryInterface(Components.interfaces.nsIStringBundleService);
	if (this.strBundleService)
		this.strbundle=this.strBundleService.createBundle("chrome://notifications_viewer/locale/default.properties");
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
	},

	/**
		Translate (language)
		@param {string} str text to translate
		@return {string}
	*/
	tr: function (str)
	{
		try {
			return this.strbundle.GetStringFromName(str);
		} catch(e) {
			this.warningSrv("Impossible to translate: "+str);
			return "";
		}
	}
}


/**
	@class The messageBox class provides a modal dialog with a short message
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/
var messageBox = {
	/**
		Opens a question message box with the title sTitle and the text sText
		@param {string} sTitle title
		@param {string} sText text
		@param {string} checkboxLabel Checkbox label
		@param {Object} check
		@return {number} 0=yes, 1=No
	*/
	question: function (sTitle,sText,checkboxLabel,check) {
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		var flags = prompts.BUTTON_TITLE_YES      * prompts.BUTTON_POS_0 +
			prompts.BUTTON_TITLE_NO           * prompts.BUTTON_POS_1;
		return prompts.confirmEx(window,sTitle ,sText,flags,null,null,null,checkboxLabel, check);
	},

	/**
		Opens a warning message box with the title sTitle and the text sText
		@param {string} sTitle title
		@param {string} sText text
	*/
	warning:  function (sTitle,sText) {
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		prompts.alert(window,sTitle,sText);
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

		document.getElementById("parseDSN").checked = this.services.preferences.getBoolPref(this.services.extensionKey+".parse_dsn");
		document.getElementById("parseMDN").checked = this.services.preferences.getBoolPref(this.services.extensionKey+".parse_mdn");
		document.getElementById("considerTimeout").checked = this.services.preferences.getBoolPref(this.services.extensionKey+".enabled_timeout");
		document.getElementById("timeOut").value = this.services.preferences.getIntPref(this.services.extensionKey+".timeout");
		this.enableTimeOut();
		this.parseMdnDsn();
		document.getElementById("markRead").checked = this.services.preferences.getBoolPref(this.services.extensionKey+".mark_notifications_as_read");
		document.getElementById("moveNotification").checked = this.services.preferences.getBoolPref(this.services.extensionKey+".thread_on_original_message");
		document.getElementById("notificationsDisplayTextAndIcons").selectedIndex = (this.services.preferences.getIntPref(this.services.extensionKey+".display_text_and_icons"))-1;
		document.getElementById("showOnHeaderView").checked = this.services.preferences.getBoolPref(this.services.extensionKey+".display_headerview");
	},

	/**
		Save Preferences from Dialog Box
		@return {boolean} <b>false</b> if an error occurs
	*/
	savePrefs : function() {
		if (!this.services)
			this.services= new Services();

		var strbundle=document.getElementById("prefStr");

		var timeOutValue=parseInt(document.getElementById("timeOut").value);

		if (isNaN(timeOutValue) || timeOutValue<1 || timeOutValue>3600) {
			messageBox.warning(this.services.extensionName,strbundle.getString("invalidTimeOutValue"));
			return false;
		}

		this.services.preferences.setBoolPref(this.services.extensionKey+".parse_dsn",document.getElementById("parseDSN").checked);
		this.services.preferences.setBoolPref(this.services.extensionKey+".parse_mdn",document.getElementById("parseMDN").checked);
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
	},

	/**
		correlate or not MDN/DSN
	*/
	parseMdnDsn: function() {
		var parseDSN=document.getElementById("parseDSN").checked;
		var parseMDN=document.getElementById("parseMDN").checked;
		document.getElementById("timeOut").disabled=!(parseDSN && document.getElementById("considerTimeout").checked);
		document.getElementById("considerTimeout").disabled=!parseDSN;
		document.getElementById("columnDelivered").disabled=!parseDSN;

		document.getElementById("columnDisplayed").disabled=!parseMDN;
		document.getElementById("columnDeleted").disabled=!parseMDN;
		if (! parseDSN) {
			document.getElementById("columnDelivered").checked=false;
		}

		if (! parseMDN) {
			document.getElementById("columnDisplayed").checked=false;
			document.getElementById("columnDeleted").checked=false;
		}
	}
}


/**
	Move message
	@param {nsIMsgDBHdr} msgHdr message to move
	@param {nsIMsgFolder} dstFolder folder destination
	@return {boolean} return <b>false</b> if an error occurs
*/
function moveMessage (msgHdr, dstFolder) {

	var srcFolder=msgHdr.folder;

	// test if srcFolder and dstFolder are equals
	if (srcFolder==dstFolder) {
		srv.logSrv("moveMessage - source and target are equals. Exit");
		return true;
	}

	var messagesArray = Components.classes["@mozilla.org/supports-array;1"].createInstance(Components.interfaces.nsISupportsArray);

	var copyService = Components.classes["@mozilla.org/messenger/messagecopyservice;1"].getService(Components.interfaces.nsIMsgCopyService);

	messagesArray.AppendElement(msgHdr);

	srv.logSrv("moveMessage - from: '" + srcFolder.abbreviatedName + "' to '" + dstFolder.abbreviatedName + "': " + msgHdr.messageId);

	try {
		copyService.CopyMessages(
			srcFolder,       // srcFolder
			messagesArray,   // nsISupportsArray
			dstFolder,       // dstFolder
			true,            // isMove
			null,            // nsIMsgCopyServiceListener
			msgWindow,       // nsIMsgWindow
			false            // allowUndo
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




