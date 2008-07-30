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
	User interface to set out of office parameters to a user account.
	This file is called by the OutOfOfficeAccountListView
	@author Olivier Brun BT Global Services / Etat francais Ministere de la Defense
*/


var globalServices=new Services();
var gOutOfOfficeManager = null;
    
function onDialogLoad(sender)
{
	enableCheckboxControls( false );
		
	// Load all the Libraries we need...
	var jsLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);                 
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveAccounts.js");
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/Sieve.js");
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveRequest.js");
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveResponse.js");    
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveResponseParser.js");        
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveResponseCodes.js");

	// Retrieve selected account and create OutOfOffice manager 
 	gOutOfOfficeManager = window.arguments[0]["OutOfOfficeSieveAccountToConfigure"];
 	// new OutOfOfficeManager(window.arguments[0]["OutOfOfficeSieveAccountToConfigure"]);
	window.arguments[0]["OutOfOfficeSieveAccountReturnCode"] = false;
	if( gOutOfOfficeManager == null ){
		// @TODO Error
	}
	gOutOfOfficeManager.loadSettings(this);	
}

function onConnectFinish(success)
{
	globalServices.logSrv("onConnectFinish("+ success +") Begin to update user interface control..." );
	// Retrieve out of office settings from server Cyrus for the out of office file
	if( gOutOfOfficeManager.getSettings() == null ){	// No account selected
		globalServices.errorSrv("No account selected to configure" );
		return;
	}
	enableCheckboxControls( success );
	enableOutOfOfficeRedirectionCtrl(gOutOfOfficeManager.getSettings().getRedirection());
	enableOutOfOfficeNotificationCtrl(gOutOfOfficeManager.getSettings().getNotification());
	updateData(false); // Set data to user interface control
	globalServices.logSrv("onConnectFinish ended");
}

function onDialogAccept(sender)
{
	globalServices.logSrv("onDialogAccept..." );
	window.arguments[0]["OutOfOfficeSieveAccountReturnCode"] = false;
	if( gOutOfOfficeManager.getSettings() == null ){ // No account selected
		globalServices.errorSrv("No account selected : unable to configure out of office parameters." );
		return false;
	}

	if( updateData() == true ){
		window.arguments[0]["OutOfOfficeSieveAccountReturnCode"] = true;
		// gOutOfOfficeManager.saveSettings();
		gOutOfOfficeManager = null;
		return true;
	}

	return false;
}

/**
	Manage the redirection UI control
*/
function onOutOfOfficeRedirectionCommand(sender)
{
	globalServices.logSrv("Redirection activated='" + sender.checked + "'.");
	enableOutOfOfficeRedirectionCtrl(sender.checked);
}

/**
	Manage UI control associate to redirection field.
	Control associated is Destination address and Keep message fields.
*/
function enableOutOfOfficeRedirectionCtrl(enabled)
{
	globalServices.enableCtrlID('labelOutOfOfficeDestinationAddress', enabled);
	globalServices.enableCtrlID('addressCol2#1', enabled);
//	globalServices.enableCtrlID('txtOutOfOfficeDestinationAddress', enabled);
	globalServices.enableCtrlID('outofofficeKeepMessageCheckbox', enabled);
}

/**
	Function called when the user type a character in the text field.
*/
function onOutOfOfficeDestinationAddressInput(sender)
{
	globalServices.displayFieldOnError( 'addressCol2#1', !globalServices.isAddressMailValid( globalServices.getStringValue('addressCol2#1') ) );
	globalServices.displayFieldOnError( 'textcol-addressingWidget', !globalServices.isAddressMailValid( globalServices.getStringValue('addressCol2#1') ) );
//	globalServices.displayFieldOnError( 'txtOutOfOfficeDestinationAddress', !globalServices.isAddressMailValid( globalServices.getStringValue('txtOutOfOfficeDestinationAddress') ) );
	globalServices.logSrv("Destination address have changed.");
}

/**
	Function called when the destination address fields has changed.
*/
function onOutOfOfficeDestinationAddressChange(sender)
{
	globalServices.displayFieldOnError( 'addressCol2#1', !globalServices.isAddressMailValid( globalServices.getStringValue('addressCol2#1') ) );
	globalServices.displayFieldOnError( 'textcol-addressingWidget', !globalServices.isAddressMailValid( globalServices.getStringValue('addressCol2#1') ) );
//	globalServices.displayFieldOnError( 'txtOutOfOfficeDestinationAddress', !globalServices.isAddressMailValid( globalServices.getStringValue('txtOutOfOfficeDestinationAddress') ) );
	globalServices.logSrv("Destination address have changed.");
}

/**
	Manage the keep message UI control
*/
function onOutOfOfficeKeepMessageCommand(sender)
{   
	globalServices.logSrv("Keep message='" + sender.checked + "'.");
}

/**
	Manage the activation of the notification UI control
*/
function onOutOfOfficeNotificationCommand(sender)
{
	globalServices.logSrv("Notification message='" + sender.checked + "'.");
	enableOutOfOfficeNotificationCtrl(sender.checked);
}

/*
 * Manage UI control associate to notification field.
 * Control associated is the notification message fields.
 */
function enableOutOfOfficeNotificationCtrl(enabled)
{
	globalServices.enableCtrlID('txtOutOfOfficeNotification', enabled);
}

/*
 * Function called when the notification message fields has changed
 */
function onOutOfOfficeNotificationChange(sender)
{
	globalServices.logSrv("Notification message has changed.");
}

/*
 * Manage the activation of the out of office UI control
 */
function onOutOfOfficeActivationCommand(sender)
{
	globalServices.logSrv("Activate my out of office parameters='" + sender.checked + "'.");
	gOutOfOfficeManager.activate( sender.checked );
}

/*
 * Display status of the connection with the selected Sieve server
 */
function postStatusMessage(message)
{
  document.getElementById('logger').value = message;
}

/*
 * enable controls when the connection to the server is done.
 */
function enableCheckboxControls(enabled)
{
	globalServices.enableCtrlID('outofofficeRedirectionCheckbox', enabled);
	globalServices.enableCtrlID('outofofficeNotificationCheckbox', enabled);
}

/*
 * Call this member function to initialize data in a dialog box, or to retrieve and validate dialog data.
 * @param (boolean) bSaveAndValidate Flag that indicates whether dialog box is being initialized (FALSE) or data is being retrieved (TRUE).
 * @return (boolean) Nonzero if the operation is successful; otherwise 0. If bSaveAndValidate is TRUE, then a return value of nonzero means that the data is successfully validated.
 */
function updateData(bSaveAndValidate)
{
	if(bSaveAndValidate == undefined){
		bSaveAndValidate = true;
	}
	if(bSaveAndValidate == true){	// Retrieve and validate value from control ID
		gOutOfOfficeManager.getSettings().setDataFromFields(	
			globalServices.getBooleanValue('outofofficeRedirectionCheckbox') ,
			globalServices.getStringValue('addressCol2#1') ,
		//	globalServices.getStringValue('txtOutOfOfficeDestinationAddress') ,
			globalServices.getBooleanValue('outofofficeKeepMessageCheckbox') ,
			globalServices.getBooleanValue('outofofficeNotificationCheckbox') ,
			Utf8.encode( globalServices.getStringValue('txtOutOfOfficeNotification') )	
		);
		switch( gOutOfOfficeManager.getSettings().checkDataValidity() ) { // Check Data validity
		case 1 :	// Data for address mail are invalid
			globalServices.setFocusCtrlID( 'addressCol2#1' );
			globalServices.setFocusCtrlID( 'textcol-addressingWidget' );
	//		globalServices.setFocusCtrlID( 'txtOutOfOfficeDestinationAddress' );
			globalServices.warningSrv( "Invalid address " + globalServices.getStringValue('addressCol2#1') );
			return false;
		case 2 :	// Data for message notification are invalid
			globalServices.warningSrv( "Invalid notification " + globalServices.getStringValue('txtOutOfOfficeNotification') );
			return false;
		default :	// 0 or other value, the data are valid
			globalServices.logSrv( "Data valid.");
			break;
		}
	} else {	// Set value to control ID
		globalServices.setBooleanValue('outofofficeRedirectionCheckbox', gOutOfOfficeManager.getSettings().getRedirection() );
		globalServices.setStringValue('addressCol2#1', gOutOfOfficeManager.getSettings().getRedirectionAddress() );
	//	globalServices.setStringValue('txtOutOfOfficeDestinationAddress', gOutOfOfficeManager.getSettings().getRedirectionAddress() );
		globalServices.setBooleanValue('outofofficeKeepMessageCheckbox', gOutOfOfficeManager.getSettings().getRedirectionKeepMessage() );
		globalServices.setBooleanValue('outofofficeNotificationCheckbox', gOutOfOfficeManager.getSettings().getNotification() );
		globalServices.setStringValue('txtOutOfOfficeNotification', Utf8.decode(gOutOfOfficeManager.getSettings().getNotificationMessage()));
	}
	return true;	
}