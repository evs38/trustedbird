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
 * Library to manage UI to configure sieve server settings
 * @author Olivier Brun - BT Global Services / Etat francais Ministere de la Defense
 */


// Load all the Libraries we need...
var jsLoader =  Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);


// Overload Initialization and save function
var onInitOriginal = onInit;
var onSaveOriginal = onSave;


// includes
jsLoader.loadSubScript("chrome://out_of_office/content/libs/preferences.js");
jsLoader.loadSubScript("chrome://out_of_office/content/libs/misc.js");
var globalServices=new Services();


//Global object to configure the Sieve server account
var gSieveServerToConfigure = null;
var gAccount = null;

/**
 * 	Hook function to overload the the onInit function.
 * 	The original function of onInit is called inside with the onInitOriginal function.
 */
onInit = function onInitHook(aPageId, aServerId) 
{
	onInitOriginal(); // Execute original code from service


	globalServices.logSrv("onInitHook for Server='" + gServer.key + "' and for Identity='" + gIdentity.key + "' started.");
	gAccount = getAccountByKey(gServer.key);
	
	// For the first version all functionalities are not used.
	hideControlNotUsed();

	if( gAccount == null ){
		onDialogDisabled(); // Account not found or isn't an IMAP account
	} else {
		onDialogLoad();
		setInformationFields();
	}
	globalServices.logSrv("onInitHook ended.");
}

/**
 * 	Hook function to overload the the onInit function.
 * 	The original function of onInit is called inside with the onSaveOriginal function.
 */
onSave = function onSaveHook(){
	globalServices.logSrv("onSaveHook started.");
	onSaveOriginal(); // Execute original code from service
	
	// Accept user data if account is valid.
	if( gAccount != null ){
		onDialogAccept();
	}
	globalServices.logSrv("onSaveHook ended.");
	return false;
}

/**
 * Disable all user interface control because the account is not valid or not 
 */
function onDialogDisabled()
{
	globalServices.enableCtrlID('cbxHost', false);
	globalServices.enableCtrlID('labelHostname', false);
	globalServices.enableCtrlID('txtHostname', false);
	globalServices.enableCtrlID('labelPort', false);
	globalServices.enableCtrlID('txtPort', false);
	globalServices.enableCtrlID('labelDefaultPort', false);
	globalServices.enableCtrlID('cbxTLS', false);
	globalServices.enableCtrlID('txtUsername', false);
	globalServices.enableCtrlID('txtPassword', false);
	globalServices.enableCtrlID('cbxPassword', false);
}

/**
 * For the first version all functionalities are not used.
 * Control hidden to make configuration simply.
 */
function hideControlNotUsed()
{
	globalServices.showCtrlID('groupLogin', false);
	globalServices.showCtrlID('labelLogin', false);
	globalServices.showCtrlID('rgLogin', false);
	globalServices.showCtrlID('labelUsername', false);
	globalServices.showCtrlID('txtUsername', false);
	globalServices.showCtrlID('labelPassword', false);
	globalServices.showCtrlID('txtPassword', false);
	globalServices.showCtrlID('cbxPassword', false);
}

/**
 * Load data and initialize user interface with the Sieve server account settings
 */
function onDialogLoad()
{
	// Require
	if( gAccount == null ){
		throw "Sieve server account cannot be null";
	}

	jsLoader.loadSubScript("chrome://out_of_office/content/account/OutOfOfficeSieveServerSettingsData.js");

	// Enable global check box
	globalServices.enableCtrlID('cbxHost', true);

	// Initialize UI parameters
	gSieveServerToConfigure = new SieveServerSettingsData(gAccount);
	updateData(false); // Set data to user interface control

	// Enable dialog control
	enableHost(gSieveServerToConfigure.getHostType());
	enableLogin(gSieveServerToConfigure.getLoginIndex());
	enableKeepAlive(gSieveServerToConfigure.isKeepAlive());
	enableCompile(gSieveServerToConfigure.getCompileCheck());
}

/**
 * Set information fields to show current sieve server parameters
 */
function setInformationFields()
{
	if(gAccount == null){
		return; //Invalid account object
	}
	document.getElementById('txtDispHostname').value = gAccount.getHost().getHostname();
	document.getElementById('txtDispPort').value = gAccount.getHost().getPort();
	document.getElementById('txtDispTLS').value = gAccount.getHost().isTLS();
   
	var authType = ""; 	
	switch (gAccount.getLogin().getType())
	{
		case 0: authType = "outofoffice.list.tree.info.login.noauth"; break;
		case 1: authType = "outofoffice.list.tree.info.login.useimap"; break;
		case 2: authType = "outofoffice.list.tree.info.login.custom"; break;
	}
	document.getElementById('txtDispAuth').value = globalServices.localizeString( "out_of_office_locale.properties", "&" + authType + ";" );
	document.getElementById('txtDispUserName').value = gAccount.getLogin().getUsername();     	
}

/**
 * Retrieve and validate data from user interface
 * @return boolean true the data are validated and false for invalid data
 */
function onDialogAccept()
{
	globalServices.logSrv("onDialogAccept..." );
	if( updateData() == true ){ // Retrieve and validate data 
		globalServices.logSrv("onDialogAccept data validated." );
		return true;
	}
	globalServices.warningSrv("onDialogAccept: Invalid data." );
	return false; // Invalid data
}

// Function for the custom authentication
function onLoginSelect(sender)
{
	var type = 0;
	if (sender.selectedItem.id == "rbNoAuth")
		type = 0;
	else if (sender.selectedItem.id == "rbImapAuth")
		type = 1;
	else if (sender.selectedItem.id == "rbCustomAuth")
		type = 2;
	
	gSieveServerToConfigure.setLoginIndex( type );
	enableLogin(type);
}

function enableLogin(type)
{
	switch (type)
	{
	case 0:
	case 1:
		globalServices.enableCtrlID('txtUsername', false);
		globalServices.enableCtrlID('txtPassword', false);
		globalServices.enableCtrlID('cbxPassword', false);
        break;
	case 2: 
		globalServices.enableCtrlID('txtUsername', true);
		globalServices.enableCtrlID('cbxPassword', true);
	        
        var cbxPassword = document.getElementById('cbxPassword');
		globalServices.enableCtrlID('txtPassword', cbxPassword.checked);
		break;
	default:
		globalServices.warningSrv("Invalid login type.");
		break;
	}
}

function onLoginChange(sender)
{
	var cbxPassword = document.getElementById('cbxPassword');
	gSieveServerToConfigure.setUserPasswordCheck(cbxPassword.checked);
	gSieveServerToConfigure.setUserName(document.getElementById('txtUsername').value);
	gSieveServerToConfigure.setUserPassword( ( (cbxPassword.checked == true) ? document.getElementById('txtPassword').value : null ) );
}

function onPasswordFocus(sender)
{
  //  document.getElementById('txtPassword').value = "";
}


function onPasswordCommand(sender)
{
	onLoginChange(sender);    
	enablePassword(sender.checked); 
}

function enablePassword(enabled)
{
	globalServices.enableCtrlID('txtPassword', enabled);
}

// Function for the custom server settings
function onHostCommand(sender)
{
	gSieveServerToConfigure.setHostType(sender.checked);
	enableHost(sender.checked);
}

function enableHost(enabled)
{
	globalServices.enableCtrlID('labelHostname', enabled);
	globalServices.enableCtrlID('txtHostname', enabled);
	globalServices.enableCtrlID('labelPort', enabled);
	globalServices.enableCtrlID('txtPort', enabled);
	globalServices.enableCtrlID('labelDefaultPort', enabled);
	globalServices.enableCtrlID('cbxTLS', enabled);
}

function onHostnameChange(sender)
{
	globalServices.logSrv( sender.value );
	gSieveServerToConfigure.setHostName( sender.value );
}

function onPortChange(sender)
{
	globalServices.logSrv( sender.value );
	gSieveServerToConfigure.setHostPort(sender.value)
}

function onTLSCommand(sender)
{
	gSieveServerToConfigure.setHostTLS(sender.checked);        
}

// Function for the general Settings...
function onKeepAliveCommand(sender)
{
	gSieveServerToConfigure.enableKeepAlive(sender.checked);
	enableKeepAlive(sender.checked);    
}

function enableKeepAlive(enabled)
{
/*
 * Olivier Brun 
	- Options not used in the first version. 
	- These parameters come from sieve extension.
	globalServices.enableCtrlID('txtKeepAlive', enabled);
*/
}

function onKeepAliveChange(sender)
{
	gSieveServerToConfigure.setKeepAliveInterval(sender.value);    
}

function onCompileCommand(sender)
{    
	gSieveServerToConfigure.setCompileCheck(sender.checked); 
	enableCompile(sender.checked);    
}

function enableCompile(enabled)
{
/*
 * Olivier Brun 
	- Options not used in the first version. 
	- These parameters come from sieve extension.
	globalServices.enableCtrlID('txtCompile', enabled);
*/
}

function onCompileChange(sender)
{
	gSieveServerToConfigure.setCompileDelay(sender.value);
}

function onDebugCommand(sender)
{    
	gSieveServerToConfigure.getDebugMode(sender.checked);
}

/*
 * Call this member function to initialize data in a dialog box, or to retrieve and validate dialog data.
 * @param (boolean) bSaveAndValidate Flag that indicates whether dialog box is being initialized (FALSE) or data is being retrieved (TRUE).
 * @return (boolean) Nonzero if the operation is successful; otherwise 0. If bSaveAndValidate is TRUE, then a return value of nonzero means that the data is successfully validated.
 */
function updateData(bSaveAndValidate)
{
    if (gSieveServerToConfigure == null){
        throw "gSieveServerToConfigure: Sieve Account can't be null"; 
	}
	if(bSaveAndValidate == undefined){
		bSaveAndValidate = true;
	}
	if(bSaveAndValidate == true){	// Retrieve and validate value from control ID
		if( checkDataValidity() == false ) { // Check Data validity
			return false; // Invalid data
		}
		SaveData();
	} else {	// Set value to control ID
		LoadData();
	}
	return true;	
}


/*
 * Call this member function to load data from the Sieve account object.
 */
function LoadData()
{
	// get the custom Host settings
	document.getElementById('txtHostname').value = gSieveServerToConfigure.getHostName();
	document.getElementById('txtPort').value = gSieveServerToConfigure.getHostPort();
	document.getElementById('cbxTLS').checked = gSieveServerToConfigure.getHostTLS();
	
	var cbxHost = document.getElementById('cbxHost');
	cbxHost.checked = gSieveServerToConfigure.getHostType();
	
	// Login field.
	document.getElementById('txtUsername').value = gSieveServerToConfigure.getUserName();
	       
	var cbxPassword = document.getElementById('cbxPassword');
	cbxPassword.checked = gSieveServerToConfigure.getUserPasswordCheck();
	document.getElementById('txtPassword').value = ( (cbxPassword.checked == true) ? gSieveServerToConfigure.getUserPassword() : "" );
	
	var rgLogin = document.getElementById('rgLogin');
	rgLogin.selectedIndex = gSieveServerToConfigure.getLoginIndex();
  
/*
 * Olivier Brun 
	- Options not used in the first version. 
	- These parameters come from sieve extension.
	document.getElementById('txtKeepAlive').value = gSieveServerToConfigure.getKeepAlive();
	  
	var cbxKeepAlive = document.getElementById('cbxKeepAlive');
	cbxKeepAlive.checked = gSieveServerToConfigure.isKeepAlive();
	
	document.getElementById('txtCompile').value = gSieveServerToConfigure.getCompileDelay();
	          
	var cbxCompile = document.getElementById('cbxCompile');
	cbxCompile.checked = gSieveServerToConfigure.getCompileCheck();
	
	var cbxDebug = document.getElementById('cbxDebug');
	// * TODO There is not a checkbox anymore then check this code in the future (Flags)
	// * cbxDebug.checked = gSieveServerToConfigure.getDebugFlags();
*/
}

/*
 * Call this member function to check the validity of the data before set the Sieve account object.
 * @return (boolean) True indicate that the data are correct, False indicate an invalid data set.
 */
function checkDataValidity()
{
	var type = gSieveServerToConfigure.getLoginIndex();
	if ((type < 0) || (type > 2)){
		alertDataValidity("&outofoffice.settings.invalid.choice;", 'labelLogin' );
		return false;
	}
	if ( type == 2 ){ // Use username/password
		if( gSieveServerToConfigure.getUserName() == "" ){	// type 2 request a username
			alertDataValidity("&outofoffice.settings.invalid.data;", 'labelUsername' );
			globalServices.setFocusCtrlID('txtUsername');
			return false;
		}
		if( gSieveServerToConfigure.getUserPasswordCheck()==true ){// Remember the password
			if( gSieveServerToConfigure.getUserPassword() == null || gSieveServerToConfigure.getUserPassword() == "" ){	// Then the password cannot be empty
				alertDataValidity("&outofoffice.settings.invalid.data;", 'labelPassword' );
				globalServices.setFocusCtrlID('txtPassword');
				return false;
			}
		}
	}
	type = gSieveServerToConfigure.getHostType();
	if ((type < 0) || (type > 1)){
		alertDataValidity("&outofoffice.settings.invalid.choice;", 'cbxHost' );
		return false;
	}
	if( type == 1 ){
		// retrieve default value if an error occurs
		var account = new SieveImapHost(gAccount.imapKey);
		if( gSieveServerToConfigure.getHostName() == "" ) {
			gSieveServerToConfigure.setHostName( account.getHostname() );
			alertDataValidity("&outofoffice.settings.invalid.data;", 'labelHostname', account.getHostname());
			//globalServices.setFocusCtrlID('txtHostname');
			//return false;
		}

		if( gSieveServerToConfigure.getHostPort() == 0 ){
			gSieveServerToConfigure.setHostPort( account.getPort() );
			alertDataValidity("&outofoffice.settings.invalid.data;", 'labelPort', account.getPort());
		}
		account = null;
	} else { // reset preference to the default value if the user want to use default imap settings
		gSieveServerToConfigure.setHostPort(2000);
		gSieveServerToConfigure.setHostName("");
	}
	return true;
}

/*
 * Display an error popup and set the focus to the UI control on error.
 * @param (string) message String to localize.
 * @param (string) fieldName Label of the UI control id. 
 */
function alertDataValidity( message, fieldName, value )
{
	var values = new Array();
	values.push( globalServices.getStringLabel(fieldName) );
	if( value != undefined && value != null ){
		values.push( value );
	}
	alert( globalServices.localizeString( "out_of_office_locale.properties", message, values) );
}

/*
 * Call this member function to save data to the Sieve account object.
 */
function SaveData()
{
	// TODO Make this attribute accessible to the final user.
	// Hard coded. Activation of the sieve server the current gAccount
	gAccount.setEnabled(true);
	/*
	 * Update gAccount settings
	 */
	gSieveServerToConfigure.updateAccount(gAccount);
}