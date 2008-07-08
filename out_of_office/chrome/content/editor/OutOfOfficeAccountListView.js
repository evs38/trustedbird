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


/*
 * @fileoverview
 * Library to manage UI list of account out of office to access to the sieve script server
 * @author Olivier Brun - BT Global Services / Etat francais Ministere de la Defense
 */

var globalServices=new Services();
var OutOfOfficeAccountTreeView = null;
var gOutOfOfficeManager = null;
var gActivateScript = false;
var gConnectionActive = false; // Set to false to force the first connection on the first item

var OOOALV_FILE_HEADER = new String("OutOfOfficeAccountListView: "); 

function onWindowLoad()
{
	// Load all the Libraries we need...
	var jsLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);                 
	                 
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveAccounts.js");
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/Sieve.js");
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveRequest.js");
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveResponse.js");    
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveResponseParser.js");        
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveResponseCodes.js");
	
	jsLoader.loadSubScript("chrome://out_of_office/content/editor/OutOfOfficeAccountTreeView.js");

	// Retrieve selected account and create OutOfOffice manager 
 	gOutOfOfficeManager = new OutOfOfficeManager(null);

	// Retrieve out of office settings from server Cyrus for the out of office file
	if( gOutOfOfficeManager.getSettings() == null ){	// No account selected
		globalServices.errorSrv( OOOALV_FILE_HEADER + "No account selected to configure" );
		return;
	}
   
	// now set our custom TreeView Renderer...
	var tree = document.getElementById('treeAccounts');	
	OutOfOfficeAccountTreeView = new OutOfOfficeAccountTreeView(this);
	tree.view = OutOfOfficeAccountTreeView;
	
	if ((tree.currentIndex == -1) && (tree.view.rowCount > 0)){ // Force selection to the fisrt item.
//		var account = OutOfOfficeAccountTreeView.getAccount(0);
//		gOutOfOfficeManager.reConnectServerTo(account, gActivateScript);
		tree.currentIndex = 0;
		onTreeSelect(tree);
	}
			
	// ... and make sure that an entry is selected.
/*	if ((tree.currentIndex == -1) && (tree.view.rowCount > 0)){
		globalServices.logSrv( OOOALV_FILE_HEADER + "\tSelect item 0");
	    tree.view.selection.select(0);
	}
	*/
}
 
function onCycleCellActivate(sender)
{
	if( gConnectionActive == false ){ // No connection to running
		globalServices.logSrv( OOOALV_FILE_HEADER + "onCycleCellActivate");
		gActivateScript = true;
		onTreeSelect(document.getElementById('treeAccounts'));
	}
}
/*
function  onCycleCell(row,col,script,active)
{
	globalServices.logSrv( OOOALV_FILE_HEADER + "onCycleCell " + script + " script is active=" + active);
	if( gOutOfOfficeManager == null ){
		throw (OOOALV_FILE_HEADER + "Out of Office manager cannot be null." );
	}
	if( gOutOfOfficeManager.getSettings() == null ){
		throw (OOOALV_FILE_HEADER + "Settings object from Out of Office manager cannot be null." );
	}
	if( script !=  gOutOfOfficeManager.getSettings().getScriptName() ){
		return; // Don't modify symbolic link to the script that is not out of office script. 
	}
	var request = null;
	if (active == true)
		request = new SieveSetActiveRequest();
	else
		request = new SieveSetActiveRequest(script)
	  
	request.addSetScriptListener(event);
	request.addErrorListener(event);
	
	sieve.addRequest(request);
}
*/
function onTreeSelect(treeView)
{	
	if( gConnectionActive == true ) // A connection to serveur is running
		return;
	if(gActivateScript == undefined || gActivateScript == null){
		gActivateScript = false;
	}
	connectionProgress( true ); 
	var account = OutOfOfficeAccountTreeView.getAccount(treeView.currentIndex);
	gConnectionActive = true;
	account.setConnectRequest();
	gOutOfOfficeManager.reConnectServerTo(account, gActivateScript);
}

function onTreeSelect2(treeView)
{	
//	if(gActivateScript == undefined || gActivateScript == null){
//		gActivateScript = false;
//	}
	//@TODO Remove obsolete code 	

	gConnectionActive = false;
	gActivateScript = false;

	globalServices.logSrv( OOOALV_FILE_HEADER + "onTreeSelect Select item=" + treeView.currentIndex );
	if (treeView.currentIndex == -1)
	{
		globalServices.enableCtrlID('btnEdit', false );
		globalServices.enableCtrlID('btnEnable', false );
		return;
	}
	
	var account = OutOfOfficeAccountTreeView.getAccount(treeView.currentIndex);
	
//	gOutOfOfficeManager.activate(account.isEnabledOutOfOffice());
//	gOutOfOfficeManager.reConnectServerTo(account, gActivateScript);

	gActivateScript = false;
	  
	globalServices.enableCtrlID('btnEdit', account.isEnabledOutOfOffice());
	globalServices.enableCtrlID('btnEnable', true);
	globalServices.setStringValue('btnEnable', ((account.isEnabledOutOfOffice()==true) ? "Enable" : "Disable" ) );
	
/*	if (account.isEnabledOutOfOffice() == false)
	{
		document.getElementById('btnEdit').setAttribute('disabled','true');
		document.getElementById('btnEnable').label = "Enable";
		
	}
	else
	{
		document.getElementById('btnEdit').removeAttribute('disabled');
		document.getElementById('btnEnable').label = "Disable";	
	}
	*/	
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

function onKeepAlive()
{
	globalServices.logSrv( OOOALV_FILE_HEADER + "onKeepAlive");
	gOutOfOfficeManager.keepAlive();
}

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
	// args["OutOfOfficeSieveAccountToConfigure"] = currentAccount;
	args["OutOfOfficeSieveAccountToConfigure"] = gOutOfOfficeManager;
	args["OutOfOfficeSieveAccountReturnCode"] = null;
	globalServices.logSrv( OOOALV_FILE_HEADER + "onEditClick open account settings dialog" );

	var returnCode = window.openDialog("chrome://out_of_office/content/editor/OutOfOfficeAccountSettings.xul",
		"OutOfOfficeScriptGenerator", "chrome,modal,titlebar,centerscreen", args);	        
	globalServices.logSrv( OOOALV_FILE_HEADER + "onEditClick ended return code =" + args["OutOfOfficeSieveAccountReturnCode"] );
	
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

	// @TODO Check this code
	onTreeSelect(tree);		
}

/*
 * Display status of the connection step with the Sieve server
 */
function postStatus(progress)
{
 	document.getElementById('logger').value = progress;
}

/*
 * Update the icon status of the out of office functionnality for the current account
 * @param (boolean) Indicate if the script out of office is active 
 */
function postScriptStatus(active)
{	
	// now set our custom TreeView Renderer...
	var tree = document.getElementById('treeAccounts');	
	if( tree == null || tree.view == null ){
		return; // Nothing todo
	}
	var index = tree.currentIndex;
	if (index == -1) {
		index = 0;
	}
	// Unselect current selection to refresh it later and update icon
	tree.view.selection.clearSelection()

	if( OutOfOfficeAccountTreeView != null ){
		OutOfOfficeAccountTreeView.getAccount(index).setConnectRequest();
		OutOfOfficeAccountTreeView.getAccount(index).setEnabledOutOfOffice( active );
	} else {
		throw new Exception( OOOALV_FILE_HEADER + "Tree view control not valid (null)");
	}
		
	// ... and make sure that an entry is selected.
	// First initialisation
	if( gConnectionActive == true ){
		if( tree.view.rowCount > 0 ){
			globalServices.logSrv( OOOALV_FILE_HEADER + "postScriptStatus for item " + tree.currentIndex);
		    tree.view.selection.select(index);
		}

// 		gConnectionActive = true;
	}
	connectionProgress( false );
	onTreeSelect2(tree);
}

/*
 * Display or not a progress bar during server connection.
 * @param (boolean) Show or hide user interface control 
 */
function connectionProgress( enable )
{	//Disable progressmeter when the connection procedure is done
	globalServices.showCtrlID("out_of_office_connection_progressmeter" , enable);
}