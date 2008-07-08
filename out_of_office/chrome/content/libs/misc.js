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
 * Contributor(s):
 *   Olivier Brun BT Global Services / Etat francais Ministere de la Defense
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

/*
 * Constructor of the sieve common class
 * Overload toString method in each class to return the class name
 */
function SieveCommon() 
{
	globalServices.logSrv(this.toString()+ "constructor");
}


/**
	@class Services for this plugin
	@constructor
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/
function Services() {
	/** @type string */
	this.extensionName="out_of_office";
	/** @type string */
	this.extensionNameDisplayable="Out Of Office extension";
	/** @type string */
	this.extensionKey="extensions."+this.extensionName;
	/** define current version for this extension @type string */
	this.extensionVersion="0.0.1";
	/** preferences @type Preferences */
	this.preferences=new Preferences();
	/** set debug mode @type boolean */
	this.modeDebug=this.preferences.getBoolPref(this.extensionKey+".debug");
	/** @type nsIConsoleService */
	this.consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
}

Services.prototype = {
	
	/**
		Retrieve the extension name definition.
		@return (string) The extension name.
	*/
	getExtensionName : function()
	{
		return this.extensionName;
	},

	/**
		Retrieve the displayable pretty extension name definition.
		@return (string) The pretty extension name.
	*/
	getExtensionNameDisplayable : function()
	{
		return this.extensionNameDisplayable;
	},
	
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
		date=new Date();
		return date.toGMTString();
	},
	
	/**
		Select the text that have generate the error and set the focus to the control of User Interface define by his ID.
		@param (string) Label of the UI control id.
	*/
	setFocusCtrlID : function( ctrlID )
	{
		document.getElementById(ctrlID).setSelectionRange ( 0 , document.getElementById(ctrlID).textLength ) 
		document.getElementById(ctrlID).focus();
	},
	
	/**
		Show or hide the User Interface control.
		@param (string) Label of the UI control id.
		@param (boolean) Enabled or disabled (true/false)
	*/
	showCtrlID : function( ctrlID, enabled )
	{
		if (enabled)
			document.getElementById(ctrlID).removeAttribute('hidden');
		else
			document.getElementById(ctrlID).setAttribute('hidden','true'); 
	},
	
	/**
		Enable or disable the User Interface.
		@param (string) Label of the UI control id.
		@param (boolean) Enabled or disabled (true/false)
	*/
	enableCtrlID : function( ctrlID, enabled )
	{
		if (enabled)
			document.getElementById(ctrlID).removeAttribute('disabled');
		else
			document.getElementById(ctrlID).setAttribute('disabled','true'); 
	},
	
	/**
		Retrieve the User Interface value from control.
		@param (string) Label of the UI control id. 
		@return (string) Value of the control as a string.
	*/
	getStringValue : function( ctrlID )
	{
		return document.getElementById(ctrlID).value;
	},
	
	/**
		Retrieve the User Interface value from control.
		@param (string) Label of the UI control id. 
		@return (boolean) Value of the control false/true.
	*/
	getBooleanValue : function( ctrlID )
	{
		return document.getElementById(ctrlID).checked;
	},
	
	
	/**
		Set string value to the control of the User Interface.
		@param (string) Label of the UI control id. 
		@param (string) Value to set to the control as a string. 
	*/
	setStringValue : function( ctrlID, value )
	{
		document.getElementById(ctrlID).value = value;
	},
	
	/**
		Set boolean value to the control of the User Interface.
		@param (string) Label of the UI control id. 
		@param (boolean) Value to set to the control false/true.
	*/
	setBooleanValue : function( ctrlID, value )
	{
		document.getElementById(ctrlID).checked = value;
	},
	
	
	/**
		Retrieve the User Interface value from control.
		@param (string) Label of the UI control id.
		@param (boolean) log Indicate if the log message will be displayed in the console 
		@return (boolean) Value of the control false/true.
	*/
	isAddressMailValid : function( email, log )
	{
		if( log == undefined ){
			log = false;
		}
		if( email == null || email == "" ){
			return false;
		}
   		var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
		if(reg.test(email) == false) {
			if( log == true ) {
				this.warningSrv( "The Email Address is invalid (" + email + ").");
			}
			return false;
		}
		return true;
	},
	
	/**
		Set field in red color to indicate an error to the user.
		@param (string) Label of the UI control id. 
		@param (boolean) True if the field has an error. 
	*/
	displayFieldOnError : function( ctrlID, error )
	{
		if (error == true ) {
			document.getElementById(ctrlID).setAttribute("style", "color:red; font-weight:bold;");
		} else {
			document.getElementById(ctrlID).removeAttribute("style");
		}
	},
	
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

	/**
		Init Preferences Dialog Box
	*/
	initPrefDialog : function () {
		if (!this.services)
			this.services= new Services();
		document.getElementById("considerTimeout").checked = this.services.preferences.getBoolPref(this.services.extensionKey+".enabled_timeout");
		document.getElementById("timeOut").value = this.services.preferences.getIntPref(this.services.extensionKey+".timeout");
		this.enableTimeOut();
		document.getElementById("markRead").checked = this.services.preferences.getBoolPref(this.services.extensionKey+".mark_notifications_as_read");
		document.getElementById("moveNotification").checked = this.services.preferences.getBoolPref(this.services.extensionKey+".thread_on_original_message");
		document.getElementById("notificationsDisplayTextAndIcons").selectedIndex = (this.services.preferences.getIntPref(this.services.extensionKey+".display_text_and_icons"))-1;
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
		globalServices.logSrv("moveMessage - source and target are equals. Exit");
		return true;
	}

	var messagesArray = Components.classes["@mozilla.org/supports-array;1"].createInstance(Components.interfaces.nsISupportsArray);

	messagesArray.AppendElement(msgHdr);

	globalServices.logSrv("moveMessage - from: '" + srcFolder.abbreviatedName + "' to '" + dstFolder.abbreviatedName + "': " + msgHdr.messageId);

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
		globalServices.errorSrv("moveMessage - Error moving messages from '" + srcFolder.abbreviatedName + "' to '" + dstFolder.abbreviatedName + "' - MsgId: " + msgHdr.messageId);
		return false;
	}

	return true;
}

