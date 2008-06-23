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
	Library to manage UI list of account out of office to access to the sieve script server
	@author Olivier Brun - BT Global Services / Etat francais Ministere de la Defense
*/

var globalServices=new Services();
var OutOfOfficeAccountTreeView = null;

function onWindowLoad()
{
	// Load all the Libraries we need...
	var jsLoader = Components
	                 .classes["@mozilla.org/moz/jssubscript-loader;1"]
	                 .getService(Components.interfaces.mozIJSSubScriptLoader);
	                 
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveAccounts.js");
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/Sieve.js");
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveRequest.js");
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveResponse.js");    
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveResponseParser.js");        
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveResponseCodes.js");
	
	jsLoader.loadSubScript("chrome://out_of_office/content/editor/OutOfOfficeAccountTreeView.js");
    
	// now set our custom TreeView Renderer...
	var tree = document.getElementById('treeAccounts');	
	OutOfOfficeAccountTreeView = new OutOfOfficeAccountTreeView(this);
	tree.view = OutOfOfficeAccountTreeView;
		
  	// ... and make sure that an entry is selected.
	if ((tree.currentIndex == -1) && (tree.view.rowCount > 0))
	    tree.view.selection.select(0);
}

function onCycleCell(sender)
{
	//@TODO Add connection to the server to activate or deactivate the out of office script 	
	globalServices.logSrv("onCycleCell");
	onTreeSelect(document.getElementById('treeAccounts'));
}

function onTreeSelect(sender)
{	
	//@TODO Remove obsolete code 	
	
	if (sender.currentIndex == -1)
	{
		document.getElementById('btnEdit').setAttribute('disabled','true');
		document.getElementById('btnEnable').setAttribute('disabled','true');		
		return;
	}
	
	var account = OutOfOfficeAccountTreeView.getAccount(sender.currentIndex);
	document.getElementById('btnEnable').removeAttribute('disabled');
	  
	if (account.isEnabled() == false)
	{
		document.getElementById('btnEdit').setAttribute('disabled','true');
		document.getElementById('btnEnable').label = "Enable";
	}
	else
	{
		document.getElementById('btnEdit').removeAttribute('disabled');
		document.getElementById('btnEnable').label = "Disable";	
	}
		
	document.getElementById('txtHostname').value = account.getHost().getHostname();
	document.getElementById('txtPort').value = account.getHost().getPort();
	document.getElementById('txtTLS').value = account.getHost().isTLS();
   
	var authType = ""; 	
	switch (account.getLogin().getType())
	{
		case 0: authType = "No Authentication"; break;
		case 1: authType = "Use login from IMAP Account"; break;
		case 2: authType = "Use custom a custom login"; break;
	}
	document.getElementById('txtAuth').value = authType;
	document.getElementById('txtUserName').value = account.getLogin().getUsername();     	
}

var sieve = null;
// var gCompileTimeout = null;
// var gCompile = null
// var gCompileDelay = null;

function onEditClick(sender)
{
	var tree = document.getElementById('treeAccounts');

	// should never happen
	if (tree.currentIndex == -1)
		return;				
			
	var currentAccount = OutOfOfficeAccountTreeView.getAccount(tree.currentIndex);

	// should never happen
	if (currentAccount == null){
		globalServices.errorSrv("No valid account selected, unable to configure out of office script." );
		return;
	}

	var args = new Array();
	args["OutOfOfficeSieveAccountToConfigure"] = currentAccount;

	window.openDialog("chrome://out_of_office/content/editor/OutOfOfficeAccountSettings.xul",
		"OutOfOfficeScriptGenerator", "chrome,modal,titlebar,centerscreen", args);	        

	onTreeSelect( document.getElementById('treeAccounts') );
}


function onEnableClick(sender)
{
	var tree = document.getElementById('treeAccounts');

	// should never happen
	if (tree.currentIndex == -1)
		return;				
			
	if (sender.label == "Disable")
		OutOfOfficeAccountTreeView.getAccount(tree.currentIndex).setEnabled(false);
	else 	if (sender.label == "Enable")
 		OutOfOfficeAccountTreeView.getAccount(tree.currentIndex).setEnabled(true);
	else
		alert("Fatal error");

	onTreeSelect(tree);		
}