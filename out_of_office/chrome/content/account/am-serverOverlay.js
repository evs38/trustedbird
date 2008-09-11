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
 * 	@fileoverview
 * 	This file overlay the am-server.xul and am-server.js to add a Sieve settings button in the server properties
 * 	This file implements functions to overlay the am-server.xul and am-server.js
 * 	@author Olivier Brun BT Global Services / Etat francais Ministere de la Defense
 */

var gIdentity = null;
var gServer = null;

var onInitOriginal = onInit;
var onSaveOriginal = onSave;

var globalServices=new Services();

/**
	Hook function to overload the the onPreInit function.
	This function has been hooked to initialize the gIdentity variable.
*/
function onPreInit(account, accountValues)
{
	gIdentity = account.defaultIdentity;
	globalServices.logSrv( "onPreInit=" + gIdentity ) ;

/**
 * Original code from file am-server.js
 */
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
 * 	Hook function to overload the the onInit function.
 * 	The original function of onInit is called inside with the onInitOriginal function.
 */
onInit = function onInitHook(aPageId, aServerId) 
{
	globalServices.logSrv("onInitHook for Server='" + gServer.key + "' and for Identity='" + gIdentity.key + "' started.");
	onInitOriginal();
	addSieveSettingsButton();
	globalServices.logSrv("onInitHook ended.");
}

/**
 * 
 * 	Hook function to overload the the onInit function.
 * 	The original function of onInit is called inside with the onSaveOriginal function.
 */
onSave = function onSaveHook(){
	onSaveOriginal();
	globalServices.logSrv("onSaveHook ended.");
}


/**
 * 		Add a new user button to configure Sieve connection parameters. It insert the button after the username field.
 * 		This function generate dynamically the following XUL code to the am-server.xul UI file.
 * 			<hbox align="center" >
 * 				<button id="server.sieve.settings"
 *						label="ButtonLabel"
 *						accesskey="ShortKey"
 *						oncommand="OnClickFunction()"
 *						wsm_persist="true" />
 *			</hbox>
 *
 */
var CONST_SIEVE_SETTINGS_BUTTON_ID = "server.sieve.settings";
function addSieveSettingsButton()
{
	try{

		var btn = document.getElementById(CONST_SIEVE_SETTINGS_BUTTON_ID);  
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
        	buttonLabel = globalServices.localizeString( "out_of_office_locale.properties", "&outofoffice.button.label;" );
        } catch (e){
        	globalServices.errorSrv( "Exception, unable to get string '" + message + "', it will displayed instead of the localize string.");
        }
		
		btn.setAttribute("label", buttonLabel );
		btn.setAttribute("id",CONST_SIEVE_SETTINGS_BUTTON_ID);
		btn.setAttribute("accesskey","S");
		btn.setAttribute("oncommand",'onAccountEditClick();');

		rows.appendChild(row);
		globalServices.logSrv("addSieveSettingsButton ended.");
	}
	catch(e){
		alert("Exception: " + e);
	}
}

/**
 * Access to sieve server settings on button pressed
 * @param sender Object with context of the caller
 */
function onAccountEditClick(sender)
{
	globalServices.logSrv( "onAccountEditClick=" + gIdentity + " started." ) ;

	// DumpIdentity( gIdentity );
	var args = new Array();
	args["SieveAccount"] = getAccountByKey(gIdentity);
	if(args["SieveAccount"] == null) 
	{
		globalServices.warningSrv( "    Account "+ gIdentity.fullName +" not found!");
		globalServices.logSrv( "onAccountEditClick=" + gIdentity + " ended." ) ;
		return;
	}
    
	window.openDialog("chrome://out_of_office/content/options/OutOfOfficeSieveServerUserInterface.xul", "FilterEditor", "chrome,modal,titlebar,centerscreen", args);	        
	globalServices.logSrv( "onAccountEditClick=" + gIdentity + " ended." ) ;
}

/**
 * Retrieve sieve server account parameters from account list built with OutOfOfficeSieveServerTreeView
 * @param searchAccount Account parameter to search from account list
 * @return account found in the sieve server list.
 */
function getAccountByKey(searchAccount) 
{ 
	var jsLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);

	jsLoader.loadSubScript("chrome://out_of_office/content/options/OutOfOfficeSieveServerTreeView.js");

	globalServices.logSrv( "getAccountByKey started : search " + gServer.key + "." ) ;

	// Use the SievePrefTreeView object to retrieve the account list (Only account kind of imap)
	// @TODO Optimization will be to retrieve only the account used (not important).
	var sieveAccountTreeView = new SievePrefTreeView(this);
	for (var i = 0; i < sieveAccountTreeView.rowCount; i++)
  	{
		var account = sieveAccountTreeView.getAccount(i);

		globalServices.logSrv( "    Account key=" + account.getImapKey() + " description=" + account.getDescription() );
		// Retrieve each incoming server to find the right account to configure
		if( account.getImapKey() == gServer.key )
		{
			globalServices.logSrv( "getAccountByKey ended: Account found=" + account + "." ) ;
			return account;
		}
	}
	globalServices.logSrv( "getAccountByKey ended: account not found.." ) ;
	return null; // Not found
}

/**
 * Function to debug selected identity
 * @param gIdentity
 */
function DumpIdentity( gIdentity )
{
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

