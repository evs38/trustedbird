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
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998-2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): Olivier PARNIERE olivier.parniere@milimail.org
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
 
//Hook to override the LoadIdentity function from MsgComposeCommands.js
var LoadIdentityHookOriginal = LoadIdentity;
var identityKey;
var prefService;
var isDSNEnabled;


//Oberser to set DSN State to the compFields
var mailSendObserver =

{

  observe: function(subject, topic, data)

  {
  
	dump("DSN mailSendObserver Enter" + "\n");
	setDSNState();
    	
  }

}

//Hook's Definition  
LoadIdentity = function LoadIdentityHook(startup){
	LoadIdentityHookOriginal(startup);
	dump("LoadIdentiy hooked " + "\n");
	
	if (gCurrentIdentity == null){
		throw 'DSN Extension : LoadIdentityHook cannot access identity';
		
	}
	else {
		identityKey = gCurrentIdentity.key;
		dump('LoadIdentityHook -> identity : '+ identityKey + '\n');
	}
	
	//define the DSN Menu item state
	defineDSNMenu(identityKey);
}


//This function defines the state of the DSN Menu Item on Load
function defineDSNMenu(identityKey)
{	
	dump("defineDSNMenu -> Enter" + "\n");
	//Get Service which read / write preferences
	prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	
	
	var isCustomPrefsEnabled ;
	
	try {
		isCustomPrefsEnabled = prefService.getBoolPref("mail.identity." + identityKey + ".dsn_use_custom_prefs");
	} catch (ex) {
		isCustomPrefsEnabled = false;
	}
	
	var isAlwaysEnabled;
	
	if (isCustomPrefsEnabled){
		dump("defineDSNMenu -> set account DSN Always request" + "\n");
		
		try  {
			isAlwaysEnabled = prefService.getBoolPref("mail.identity." + identityKey + ".dsn_always_request_on");
		} catch (ex) {
			isAlwaysEnabled = false;
		}
	} else {
		
		dump("defineDSNMenu -> set general DSN Always request" + "\n");
		
		try {
			isAlwaysEnabled = prefService.getBoolPref("mail.dsn_always_request_on");
		}
		catch (ex) {
			isAlwaysEnabled = false;
		}
		dump("defineDSNMenu -> isAlwaysEnabled : " + isAlwaysEnabled + "\n");
	}
	
	
	//Setting state for DSN Menu
	document.getElementById("requestDSNMenu").setAttribute('checked',isAlwaysEnabled);
	isDSNEnabled = isAlwaysEnabled;
	
}

//Setting DSN State to message's compFields
function setDSNState(){
	var onSuccess = false, onFailure = false, onDelay = false, never = false;
	
	var isCustomPrefsEnabled = false ;
	
	try {
		isCustomPrefsEnabled = prefService.getBoolPref("mail.identity." + identityKey + ".dsn_use_custom_prefs");
	} catch (ex) {
		isCustomPrefsEnabled = false;
	}
	
	if (isDSNEnabled == true) { // else DSN msCompFields are initialized to false in XPCOM
		if (isCustomPrefsEnabled == true){
			onSuccess = prefService.getBoolPref("mail.identity." + identityKey + ".dsn_request_on_success_on");
			onFailure = prefService.getBoolPref("mail.identity." + identityKey + ".dsn_request_on_failure_on");
			onDelay = prefService.getBoolPref("mail.identity." + identityKey + ".dsn_request_on_delay_on");
			never = prefService.getBoolPref("mail.identity." + identityKey + ".dsn_request_never");
		
		} else {
			onSuccess = prefService.getBoolPref("mail.dsn_request_on_success_on");
			onFailure = prefService.getBoolPref("mail.dsn_request_on_failure_on");
			onDelay = prefService.getBoolPref("mail.dsn_request_on_delay_on");
			never = prefService.getBoolPref("mail.dsn_request_never");
		}
	}
	
	//Setting DSN nsMsgCompFields attributes
	
	var msgCompFields = gMsgCompose.compFields;
	
	if (msgCompFields)
    {
    
    	dump("setDSNState() -> Old msgCompFields.returnDSN = " + msgCompFields.returnDSN + "\n");
		msgCompFields.returnDSN = isDSNEnabled;
		dump("setDSNState() -> New msgCompFields.returnDSN = " + msgCompFields.returnDSN  + "\n");
		
		dump("setDSNState() -> Old msgCompFields.returnDSNOnSuccess = " + msgCompFields.returnDSNOnSuccess + "\n");
		msgCompFields.returnDSNOnSuccess = onSuccess;
		dump("setDSNState() -> New msgCompFields.returnDSNOnSuccess = " + msgCompFields.returnDSNOnSuccess + "\n");
		
		dump("setDSNState() -> Old msgCompFields.returnDSNOnFailure = " + msgCompFields.returnDSNOnFailure + "\n");
		msgCompFields.returnDSNOnFailure = onFailure;
		dump("setDSNState() -> New msgCompFields.returnDSNOnFailure = " + msgCompFields.returnDSNOnFailure + "\n");
		
		dump("setDSNState() -> Old msgCompFields.returnDSNOnDelay = " + msgCompFields.returnDSNOnDelay + "\n");
		msgCompFields.returnDSNOnDelay = onDelay;
		dump("setDSNState() -> New msgCompFields.returnDSNOnDelay = " + msgCompFields.returnDSNOnDelay + "\n");
		
		dump("setDSNState() -> Old msgCompFields.returnDSNNever = " + msgCompFields.returnDSNNever + "\n");
		msgCompFields.returnDSNNever = never;
		dump("setDSNState() -> New msgCompFields.returnDSNNever = " + msgCompFields.returnDSNNever + "\n");
	}
	
}

//Setting state for DSN in CompFields
function toggleDSN(target){
	dump("toggleDSN() -> Enter " + "\n");
	
	isDSNEnabled = !isDSNEnabled;
	target.setAttribute('checked', isDSNEnabled);

}

var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
observerService.addObserver(mailSendObserver, "mail:composeOnSend", false);
