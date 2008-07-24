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
 *   Olivier Brun BT Global Services / Etat francais Ministere de la Defense
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

/**
	@fileoverview
	This file overlay the am-server.xul and am-server.js to add a Sieve settings button in the server properties
	This file implements functions to overlay the am-server.xul and am-server.js
	@author Olivier Brun BT Global Services / Etat francais Ministere de la Defense
*/


const kLDAPPrefContractID="@mozilla.org/ldapprefs-service;1";
var gRefresh = false; // leftover hack from the old preferences dialog
// Original preference to save preference with only the valid server
var gOriginalPreference = null;
// OBr 18/07/07 correction of the entry ID 484
var	gAutoCompletePref = null;
var gIdentity = null;
var gServer = null;

var onInitOriginal = onInit;
var onLoadOriginal = onLoad;
var onSaveOriginal = onSave;
var useCustomPref;
var gPreferenceService = null;
var gDirectories = null;
var gLDAPPrefsService = null;


var globalServices=new Services();

/**
		Hook function to overload the the onPreInit function.
		This function has been hooked to initialize the gIdentity variable.
*/
function onPreInit(account, accountValues)
{
	gIdentity = account.defaultIdentity;
	globalServices.logSrv( "onPreInit=" + gIdentity ) ;


  // Bug 134238
  // Make sure server.isSecure will be saved before server.port preference
  parent.getAccountValue(account, accountValues, "server", "isSecure", null, false);

  var type = parent.getAccountValue(account, accountValues, "server", "type", null, false);
  gRedirectorType = parent.getAccountValue(account, accountValues, "server", "redirectorType", null, false);
  hideShowControls(type);

  gObserver= Components.classes["@mozilla.org/observer-service;1"].
             getService(Components.interfaces.nsIObserverService);
  gObserver.notifyObservers(null, "charsetmenu-selected", "other");

  gServer = account.incomingServer;
  
  if(!account.incomingServer.canEmptyTrashOnExit)
  {
    document.getElementById("server.emptyTrashOnExit").setAttribute("hidden", "true");
    document.getElementById("imap.deleteModel.box").setAttribute("hidden", "true");
  }
  var hideButton = false;

  try {
    if (gRedirectorType) {
      var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
      var prefString = "mail.accountmanager." + gRedirectorType + ".hide_advanced_button";
      hideButton = prefs.getBoolPref(prefString);
    }
  }
  catch (ex) { }
  if (hideButton)
    document.getElementById("server.advancedbutton").setAttribute("hidden", "true");  
  // otherwise let hideShowControls decide
}


/**
		Hook function to overload the the onInit function.
		The original function of onInit is called inside with the onInitOriginal function.
*/
onInit = function onInitHook(aPageId, aServerId) 
{
//	loadPreferences();
	globalServices.logSrv("onInitHook for Identity='" + gIdentity.key + "' started.");
	globalServices.logSrv("onInitHook for Server='" + gServer.key + "' started.");
	onInitOriginal();
	addSieveSettingsButton();
	globalServices.logSrv("onInitHook ended.");
}

/**
		Add a new user button to configure Sieve connection parameters. It insert the button after the username field.
		This function generate dynamically the following XUL code to the am-server.xul UI file.
			<hbox align="center" >
				<button id="server.sieve.settings" 
						label="ButtonLabel"
						accesskey="ShortKey"
						oncommand="OnClickFunction()"
						wsm_persist="true" />
			</hbox>
*/
function addSieveSettingsButton()
{
	try{

		var btn = document.getElementById("server.sieve.settings");  
		if( btn != null ){
			globalServices.logSrv("addSieveSettingsButton button already installed.");
			return;
		}

		globalServices.logSrv("addSieveSettingsButton started.");

		var grid = document.getElementsByTagName("grid").item(0);
		// alert("return grid=" + grid + " id=" + grid.id );

		var rows = document.getElementsByTagName("rows").item(0);
		// alert("return rows=" + rows + " length=" + rows.length);
		
		var row = document.createElement("row");
		row.setAttribute("id","mySieveId");
		row.setAttribute("align","center");
		// alert("return row=" + row + " id=" + row.id );

		var hbox = document.createElement("hbox");
		hbox.setAttribute("align","center");
		row.appendChild(hbox);
		// alert("return hbox=" + hbox  );

		btn = document.createElement("button");
		hbox.appendChild(btn);
	
		var buttonLabel = "";
	 
        try {
        	buttonLabel = globalServices.localizeString( "out_of_office_stringbundle", "&outofoffice.button.label;");
        } catch (e){
        	globalServices.errorSrv( "Exception, unable to get string '" + message + "', it will displayed instead of the localize string.");
        }
		
		btn.setAttribute("label", buttonLabel );
		btn.setAttribute("id","server.sieve.settings");
		btn.setAttribute("accesskey","S");
		btn.setAttribute("oncommand",'onAccountEditClick();');

		rows.appendChild(row);
		globalServices.logSrv("addSieveSettingsButton ended.");
		return rows;
	}
	catch(e){
		alert("Exception: " + e);
	}
}


//Hook original OnLoad function
onLoad = function onLoadHook(){
	if (kLDAPPrefContractID in Components.classes)
		gLDAPPrefsService = Components.classes[kLDAPPrefContractID].getService(Components.interfaces.nsILDAPPrefsService);

	onLoadOriginal();
	removeOldAddressing();
  }


onSave = function onSaveHook(){
//	savePreferences();
	onSaveOriginal();
  }

//Load Preferences
function loadPreferences(){
	gPreferenceService = Components.classes["@mozilla.org/preferences-service;1"].
                getService(Components.interfaces.nsIPrefBranch);
	try  {
        var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
        var prefs = prefService.getBranch(null);

        // Retrieve LDAP attributes from user preferences
		useCustomPref = gPreferenceService.getBoolPref("ldap_2.identity." + gIdentity.key + ".multi_ldap_use_custom_preferences");
		globalServices.logSrv("loadPreferences for user " + gIdentity.key +" value=" + useCustomPref + ".");
	} catch (e){
		dump("loadPreferences() -> Setting default useCustomPref\n");
		useCustomPref = false;
	}
}

function onAccountEditClick(sender)
{
	globalServices.logSrv( "onAccountEditClick=" + gIdentity + " started." ) ;

	// DumpIdentity( gIdentity );
	var args = new Array();
	args["SieveAccount"] = getAccountByName(gIdentity);
	if(args["SieveAccount"] == null) 
	{
		globalServices.warningSrv( "    Account "+ gIdentity.fullName +" not found!");
		globalServices.logSrv( "onAccountEditClick=" + gIdentity + " ended." ) ;
		return;
	}
    
	window.openDialog("chrome://out_of_office/content/options/OutOfOfficeSieveServerSettings.xul", "FilterEditor", "chrome,modal,titlebar,centerscreen", args);	        
	globalServices.logSrv( "onAccountEditClick=" + gIdentity + " ended." ) ;
}

function getAccountByName(searchAccount) 
{ 
	var jsLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);

	jsLoader.loadSubScript("chrome://out_of_office/content/options/OutOfOfficeSieveServerTreeView.js");

	globalServices.logSrv( "getAccountByName started : search " + gServer.key + "." ) ;

	// Use the SievePrefTreeView object to retrieve the account list (Only account kindof imap
	// @TODO Optimisation will be to retrieve only the account used (not important).
	var sieveAccountTreeView = new SievePrefTreeView(this);
	for (var i = 0; i < sieveAccountTreeView.rowCount; i++)
  	{
		var account = sieveAccountTreeView.getAccount(i);

		globalServices.logSrv( "Account key=" + account.getKeyID() + " description=" + account.getDescription() );
		// Retrieve each incoming server to find the right account to configure
		if( account.getKeyID() == gServer.key )
		{
			globalServices.logSrv( "    Account found=" + account + " ended." ) ;
			return account;
		}
	}
	globalServices.logSrv( "getAccountByName: account not found. Function ended." ) ;
	return null; // Not found
}
	

function DumpIdentity( gIdentity )
{
return ; //don't use

globalServices.logSrv( "DumpIdentity " + gIdentity + " Started..." );

globalServices.logSrv( "    gIdentity.directoryServer =" + gIdentity.directoryServer );

globalServices.logSrv( "    gIdentity.email =" + gIdentity.email );

globalServices.logSrv( "    gIdentity.fullName =" + gIdentity.fullName );

globalServices.logSrv( "    gIdentity.identityName =" + gIdentity.identityName );

globalServices.logSrv( "    gIdentity.key =" + gIdentity.key );

globalServices.logSrv( "    gIdentity.signature =" + gIdentity.signature );

globalServices.logSrv( "    gIdentity.smtpServerKey =" + gIdentity.smtpServerKey );

globalServices.logSrv( "DumpIdentity " + gIdentity + " Ended" );
}

function savePreferences(){
	//Save use Custom Preference choice to preference
	var checkBoxUseCustomPref = document.getElementById("ldap_2.identity.id.multi_ldap_use_custom_preferences");
	gPreferenceService.setBoolPref("ldap_2.identity." + gIdentity.key + ".autoComplete.overrideGlobalPref",checkBoxUseCustomPref.checked);
	gPreferenceService.setBoolPref("ldap_2.identity." + gIdentity.key + ".multi_ldap_use_custom_preferences",checkBoxUseCustomPref.checked);
    gPreferenceService.setCharPref("ldap_2.identity." + gIdentity.key + ".autoComplete.ldapServers", gAutoCompletePref );
	globalServices.logSrv("savePreferences for user " + gIdentity.key +".");
}

function editDirectories()
{
	var args = {fromGlobalPref: true};
	window.openDialog("chrome://messenger/content/addressbook/pref-editdirectories.xul",
						"editDirectories", "chrome,modal=yes,resizable=no", args);
	if (gRefresh)
	{
		var popup = document.getElementById("directoriesListPopup");
		if (popup) 
			while (popup.hasChildNodes())
				popup.removeChild(popup.lastChild);
	}
	gDirectories = null;
	//loadDirectories(popup);
	if (gRefresh)
	{	// Remove LDAP server list to update list box
		removeMultiLDAPDirectoriesList();
		// Create LDAP server list with new list
		createMultiLDAPDirectoriesList();
	}
	gRefresh = false;
}

//Set old compositionAndAddressing UI to hidden
function removeOldAddressing(){
var element = document.getElementById("compositionAndAddressing");
 	var childs = element.childNodes;

	var n = 0;
  	for (var i = 0 ; i< childs.length; i++)
  	{
  		if (childs[i].tagName == "groupbox")
  			n++;
  		if (n == 2){
  			childs[i].setAttribute("hidden","true");
  		}
  	}
}


//Helper function return an array minus an value
function removeFromArray(value, allPrefs){
	var prefs = new Array();
	
	for (var i = 0; i < allPrefs.length; i++){
		if (allPrefs[i] != value)
			prefs.push(allPrefs[i]);
	}
	return prefs;
}

//Convert an Array to an String with coma
function convertPrefArrayToString(array){
	var s = "";
	
	for (var i = 0 ; i < array.length ; i++){
		if (array[i].length != 0){
			s+=array[i];
			s +=',';
		}
	}
	return s.slice(0,-1);
}

// Check the name of server if it was found in the preference
function isInPreferenceSeverList(nameToCheck, array){
	for (var i = 0; i < array.length; i++){
		if (array[i] == nameToCheck)
			return true;
	}
	return false;
}

/*
 * Check the validity of the server list prefernece after an edit of the LDAP server list.
 * Remove the deleted server in the preference string.
 */
function checkPreferenceServerValidity(serverToCheck){
	var arraySeverPreference = gOriginalPreference.split(',');
	arraySeverPreference = removeFromArray(serverToCheck, arraySeverPreference);
	return convertPrefArrayToString(arraySeverPreference);
}

/*
 * Get preference safety, if preference does not exist it returns empty string
 */
function getSafeCharPref(prefService, uri){
	var value = "";
	try {
		value = prefService.getCharPref(uri);
	} catch(e){}
	return value;
}