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

var gIdentity = null;
var gServer = null;

var globalServices=new Services();

/**
Hook function to overload the the onPreInit function.
This function has been hooked to initialize the gIdentity variable.
*/
function onPreInit(account, accountValues)
{
	gServer = account.incomingServer;
	gIdentity = account.defaultIdentity;
	globalServices.logSrv("onPreInit Server='" + gServer.key + "' and Identity='" + gIdentity.key + "'.");
}

function onInit() 
{
	globalServices.logSrv("onInit Server='" + gServer.key + "' and Identity='" + gIdentity.key + "'.");
}

function onSave()
{
	globalServices.logSrv("onSave Server='" + gServer.key + "' and Identity='" + gIdentity.key + "'.");
}

function onAccept() 
{
	globalServices.logSrv("onAccept Server='" + gServer.key + "' and Identity='" + gIdentity.key + "'.");
	return false;
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


