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
var gConnectionActive = -1; // Set to 0 to force the first connection on the first item

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
	
	// Set label of button 
	globalServices.setStringLabel('btnEnable', globalServices.localizeString(  "out_of_office_locale.properties", "&outofoffice.list.tree.button.enable;" ) );

	// Disable control while not initialized
	globalServices.enableCtrlID('btnEdit', false );
	globalServices.enableCtrlID('btnEnable', false );

	// now set our custom TreeView Renderer...
	var tree = document.getElementById('treeAccounts');	
	OutOfOfficeAccountTreeView = new OutOfOfficeAccountTreeView(this);
	tree.view = OutOfOfficeAccountTreeView;
	
	// Force selection to the first item and initialize connection to the first server.
	if ((tree.currentIndex == -1) && (tree.view.rowCount > 0)){
		tree.currentIndex = 0;
		onTreeSelect(tree);
	}
}

/*
 * Function call by the tree view when an item is selected.
 * @param (object) sender Object that call the function
 * @return (boolean) Indicate if the sender can be run action or wait because a connection running 
 */
function onCycleCellActivate(sender)
{
	if( gConnectionActive == -1 ){ // No connection running
		globalServices.logSrv( OOOALV_FILE_HEADER + "onCycleCellActivate");
		gActivateScript = true;
		onTreeSelect(document.getElementById('treeAccounts'));
	}
	return ( gConnectionActive == -1 );
}

var gInternalSelect = false;
function onTreeSelect(tree)
{	
	if( gConnectionActive != -1 ){ // A connection to server is running
		return;
	}
	if( gInternalSelect == true){ // Do not retry connection, two events of select item occurs in same time. Conflict problem.
		globalServices.logSrv( OOOALV_FILE_HEADER + "onTreeSelect internal Select item=" + tree.currentIndex );
		gInternalSelect = false;
		return;
	}
	globalServices.logSrv( OOOALV_FILE_HEADER + "onTreeSelect Select item=" + tree.currentIndex );
	if(gActivateScript == undefined || gActivateScript == null){
		gActivateScript = false;
	}
	gConnectionActive = tree.currentIndex;
	connectionProgress( true ); 
	var account = OutOfOfficeAccountTreeView.getAccount(tree.currentIndex);
	account.setConnectRequest();
	gOutOfOfficeManager.reConnectServerTo(account, gActivateScript);
}

/*
 * Function to update UI control on the dialog box.
 * @param (object) tree object
 */
function onUpdateControl(tree)
{	
	gActivateScript = false;

	globalServices.logSrv( OOOALV_FILE_HEADER + "onUpdateControl Select item=" + tree.currentIndex );
	if (tree.currentIndex == -1 || tree.view.rowCount <= 0 )
	{
		globalServices.enableCtrlID('btnEdit', false );
		globalServices.enableCtrlID('btnEnable', false );
		return;
	}

	var account = OutOfOfficeAccountTreeView.getAccount(tree.currentIndex);
	if( account == null ){ // invalid account
		alert("Invalid account the Out of Office window cannot be opened!");
		close();
		return;
	}
	globalServices.enableCtrlID('btnEdit', account.isEnabledOutOfOffice());
	globalServices.enableCtrlID('btnEnable', true);
	var buttonLabel = globalServices.localizeString( "out_of_office_locale.properties", "&outofoffice.list.tree.button.disable;" );
	if( account.isEnabledOutOfOffice() == false ){
		buttonLabel = globalServices.localizeString( "out_of_office_locale.properties", "&outofoffice.list.tree.button.enable;" );
	}

	globalServices.setStringLabel('btnEnable', buttonLabel );

	setInformationFields( account );
}

/**
 * Set information fields to show current sieve server parameters
 */
function setInformationFields( account )
{
	document.getElementById('txtDispHostname').value = account.getHost().getHostname();
	document.getElementById('txtDispPort').value = account.getHost().getPort();
	document.getElementById('txtDispTLS').value = account.getHost().isTLS();
   
	var authType = ""; 	
	switch (account.getLogin().getType())
	{
		case 0: authType = "outofoffice.list.tree.info.login.noauth"; break;
		case 1: authType = "outofoffice.list.tree.info.login.useimap"; break;
		case 2: authType = "outofoffice.list.tree.info.login.custom"; break;
	}
	document.getElementById('txtDispAuth').value = globalServices.localizeString( "out_of_office_locale.properties", "&" + authType + ";" );
	document.getElementById('txtDispUserName').value = account.getLogin().getUsername();     	
}

/*
 * TODO To be reactivated if this functionality is requested (See file OutOfOfficeSieveServer.js)
 * Function called to check the validity of the current connection.
 */
function onKeepAlive()
{
	globalServices.logSrv( OOOALV_FILE_HEADER + "onKeepAlive");
	gOutOfOfficeManager.keepAlive();
}

/*
 * Function called when user press button key
 */
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

	window.openDialog("chrome://out_of_office/content/editor/OutOfOfficeAccountSettings.xul", "OutOfOfficeScriptGenerator", "chrome,modal,titlebar,centerscreen", args);	        
	globalServices.logSrv( OOOALV_FILE_HEADER + "onEditClick ended return code =" + args["OutOfOfficeSieveAccountReturnCode"] );
	if( args["OutOfOfficeSieveAccountReturnCode"] == true ){
		gOutOfOfficeManager.saveSettings();
	}

	onUpdateControl( document.getElementById('treeAccounts') );
}


function onEnableClick(sender)
{
	var tree = document.getElementById('treeAccounts');

	// should never happen
	if (tree.currentIndex == -1)
		return;				
	
	// Reactivate the account to retry connection
	if( OutOfOfficeAccountTreeView.getAccount(tree.currentIndex).isEnabled() == false ){
		OutOfOfficeAccountTreeView.getAccount(tree.currentIndex).setEnabled(true);
		if( gConnectionActive == -1 ){ // No connection running
			globalServices.logSrv( OOOALV_FILE_HEADER + "onEnableClick retry connection on account number=" + tree.currentIndex);
			gActivateScript = true;
			onTreeSelect(tree);
			return; // The update control will be donne later
		}
	}
//	connectionProgress( true ); 
	gConnectionActive = tree.currentIndex;
	gActivateScript = true;
	var account = OutOfOfficeAccountTreeView.getAccount(tree.currentIndex);
	account.setConnectRequest();
	gOutOfOfficeManager.reConnectServerTo(account, gActivateScript);
//	onUpdateControl( document.getElementById('treeAccounts') );

	return;
}

/*
 * Display status of the connection with the selected Sieve server
 */
function postStatusMessage(message)
{
 	document.getElementById('logger').value = message;
}

/*
 * Update the icon status of the out of office functionality for the current account
 * @param (boolean) Indicate if the script out of office is active 
 */
function postStatusAndUpdateUI(active, connectionError)
{
	// now set our custom TreeView Renderer...
	var tree = document.getElementById('treeAccounts');	
	if( tree == null || tree.view == null ){
		return; // Nothing todo
	}
	var index = tree.currentIndex;
	if (index == -1 || gConnectionActive == -1 ) {
		gConnectionActive = 0;
	}
	// un-select current selection to refresh it later and update icon
	tree.view.selection.clearSelection()

	if( OutOfOfficeAccountTreeView != null ){
		OutOfOfficeAccountTreeView.getAccount(gConnectionActive).setConnectRequest();
		OutOfOfficeAccountTreeView.getAccount(gConnectionActive).setEnabledOutOfOffice( active );
	} else {
		throw new Exception( OOOALV_FILE_HEADER + "Tree view control not valid (null)");
	}
		

	// ... and make sure that an entry is selected.
	// First initialization
	if( gConnectionActive != -1 ){
		if( tree.view.rowCount > 0 ){
			globalServices.logSrv( OOOALV_FILE_HEADER + "Try to select item " + gConnectionActive + " index=" + index);
//			tree.currentIndex = gConnectionActive;
			if( gConnectionActive !=  index )
				gInternalSelect = true;
		    tree.view.selection.select(gConnectionActive);
		}
	}

	if( connectionError == undefined || connectionError == null ){
		connectionError = false;
	}
	// On connection error, reset 
	if( gOutOfOfficeManager != null ){ 
		if( connectionError == true ){
			 // Delete and reset attributes for the next retry
			gOutOfOfficeManager.disconnectServer();
		}
	} else {
		globalServices.warningSrv( OOOALV_FILE_HEADER + "Unable to reset Out of Office manager. The object is null.");
	}
	gConnectionActive = -1;
	connectionProgress( false );
	onUpdateControl(tree);
}

/*
 * Display or not a progress bar during server connection.
 * @param (boolean) Show or hide user interface control 
 */
function connectionProgress( enable )
{
	//Disable progress meter when the connection procedure is done
	globalServices.showCtrlID("out_of_office_connection_progressmeter" , enable);
	
	/*
	 * Disable dialog control while connecting
	 */ 
	globalServices.enableCtrlID( 'treeAccounts' , !enable );
	/*
	 * Disable button control while connecting
	 * Button will enabled by onUpdateControl function with the context result
	 */ 
	if( enable == true ){// Disable button control while connecting
		globalServices.enableCtrlID('btnEdit', false );
		globalServices.enableCtrlID('btnEnable', false );
	}
}