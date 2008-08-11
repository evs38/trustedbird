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
 *   Eric Ballet Baz BT Global Services / Etat francais Ministere de la Defense
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

//User preference defining LDAP server.
var CARDVEXT_PREF_LDAP_SERVER = "ldap_2.autoComplete.directoryServer";
//LDAP attribute to look for retrieving the certificate
var CARDVEXT_LDAP_ATTRIBUTE_CERTIFICATE = "userCertificate;binary";

//String bundle resource
var cardvext_stringBundle;
//The following variables are needed by the LDAP asynchronous calls.
var cardvext_LdapServerURL;
var cardvext_LdapConnection;
var cardvext_LdapOperation;
var cardvext_Login;
var cardvext_EmailToLookFor;
var cardvext_DirectoryToLookFor;

var cardvext_Certificate = null;


var certificate_bytes = null;
var certificate_length = 0;

//LDAP Messages Listener : called on each LDAP message.
//Implements XPCOM nsILDAPMessageListener.
var cardvext_LDAPMessageListener = {

	QueryInterface: function(iid) {
		if (iid.equals(Components.interfaces.nsISupports) || iid.equals(Components.interfaces.nsILDAPMessageListener)) {
			return this;
		}
	
		Components.returnCode = Components.results.NS_ERROR_NO_INTERFACE;
		return null;
	},
	
	// Init has completed
	onLDAPInit: function(aConn, aStatus) {
		// Bind to LDAP
		try {
			cardvext_initNewLDAPOperation();
			cardvext_LdapOperation.simpleBind(cardvext_getPassword());
		} catch (e) {
			dump(e + " exception when binding to ldap\n");
			cardvext_showCurrentCertificateInWindow("card_viewer.error.ldap_server");
		}
	},
	
	// LDAP message has been received
	onLDAPMessage: function(aMessage) {
		// Search is done
		if (Components.interfaces.nsILDAPMessage.RES_SEARCH_RESULT == aMessage.type) {
			cardvext_showCurrentCertificateResult();
			return;
		}
	
		// Binding is done
		if (Components.interfaces.nsILDAPMessage.RES_BIND == aMessage.type) {
			if (Components.interfaces.nsILDAPErrors.SUCCESS != aMessage.errorCode) {
				dump("Error with code " + aMessage.errorCode + " when binding to ldap\n");
				cardvext_showCurrentCertificateInWindow("card_viewer.error.ldap_server");
			} else { // Kick off search ...
				cardvext_kickOffSearch();
			}
			return;
		}
	
		// One search result has been received
		if (Components.interfaces.nsILDAPMessage.RES_SEARCH_ENTRY == aMessage.type) {
			cardvext_handleSearchResultMessage(aMessage);
			return;
		}
	}
}

/**
 * Entry point to retrieve the user certificate from local address book or from LDAP server
 * 
 * @author Olivier Brun 
 */
function cardvext_showCurrentCertificate() {

	// Initialize the string bundle resource
	cardvext_stringBundle = document.getElementById('card_viewer_extended_stringbundle');

	// TODO Stop it now if the progress meter running probably the connection is too long
	// Test hidden attribute if false then stop 
	if( document.getElementById('card_viewer_extended_progressmeter').getAttribute('hidden') == false ){
		cardvext_onStopCertificateFetchingStatuts();
		return;
	}

	// Get the email of the selected user's card
	var email = cardvext_getEmail();
	if (!email) {
		cardvext_showCurrentCertificateInWindow("card_viewer.no_email_found");
		return;
	}

	// Start progress meter control and change the button label's
	document.getElementById("card_viewer_extended_button_id").label = cardvext_stringBundle.getString("card_viewer.button.cancelSearchCertificate.label");
	document.getElementById('card_viewer_extended_progressmeter').removeAttribute('hidden');

	var ldapUrlPrefix = "moz-abldapdirectory://";
	var directoryUrl = null;
	var certDB = Components.classes["@mozilla.org/security/x509certdb;1"].getService(Components.interfaces.nsIX509CertDB);

	if(gEditCard){// Parameters from selected item in the tree from the address book window
		directoryUrl = gEditCard.abURI;
	}
	if ( directoryUrl != null && directoryUrl != "" && (directoryUrl.indexOf(ldapUrlPrefix, 0) == 0)) { // LDAP url found then search to LDAP server
		directoryUrl = directoryUrl.substr(ldapUrlPrefix.length, directoryUrl.length);

		// Retrieve and remind window argument
		cardvext_EmailToLookFor = email;
		// Retrieve directory server selected
		cardvext_DirectoryToLookFor = directoryUrl;

		// Use global variable for parameters
		cardvext_onStartCertificateFetchingStatuts();

	} else { // Search to local address book
		directoryUrl = null; // ensure the search is only from local storage
		// try to retrieve the certificate from local storage
		try {
			cardvext_Certificate = certDB.findCertByEmailAddress(null, email);
		} catch (e) {
			// No certificate found : silently ignore this exception
		}
		// No messageID the default value will be used (certificate not found)
		cardvext_showCurrentCertificateInWindow();
	}
}  

/**
 * Display the certificate after request it to the LDAP server
 * 
 * @author Olivier Brun 
 */
function cardvext_showCurrentCertificateResult() {
	var errorMessage = "card_viewer.no_certificate_found";
	var certDB = Components.classes["@mozilla.org/security/x509certdb;1"].getService(Components.interfaces.nsIX509CertDB);

	if (certificate_bytes) {
		try {
			// Convert certificate to nsIX509Cert
			cardvext_Certificate = certDB.constructX509FromBase64(cardvext_base64encode(certificate_bytes));
		} catch (e) {
			dump(e + " exception while constructing certificate with constructX509FromBase64\n");
			errorMessage = "card_viewer.error.incorrect_certificate";
		}
	}

	cardvext_showCurrentCertificateInWindow(errorMessage);
}

/**
 * Display the certificate in the standard window.
 * The certificate is found if the variable cardvext_Certificate is not null.
 * 
 * @param (string) messageID Information message to display in the user popup.
 * 
 * @author Olivier Brun 
 */
function cardvext_showCurrentCertificateInWindow(messageID) {
	// Stop progress meter bar 
	document.getElementById('card_viewer_extended_progressmeter').setAttribute('hidden','true');
	document.getElementById("card_viewer_extended_button_id").label = cardvext_stringBundle.getString("card_viewer.button.showCurrentCertificate.label");
	if (cardvext_Certificate) {
		cardvext_viewCertHelper(cardvext_Certificate);
	} else { // an error occurs or the certificate has been not found
		var messageToDisplay = cardvext_stringBundle.getString("card_viewer.no_certificate_found"); // Default value
		if(messageID != null && messageID != "" ){
			messageToDisplay = cardvext_stringBundle.getString(messageID);
		}
		alert(messageToDisplay);
	}
}

//Helper to show to the user the specified certificate
function cardvext_viewCertHelper() {
	if (!cardvext_Certificate)
		return;

	var cd = Components.classes["@mozilla.org/nsCertificateDialogs;1"].getService(Components.interfaces.nsICertificateDialogs);
	cd.viewCert(window, cardvext_Certificate);
}

//Retrieve the email of the selected user's card
function cardvext_getEmail() {
	var primaryEmail = document.getElementById("PrimaryEmail");
	return primaryEmail.value;
}

/**
 * Start the connection and request certificate to the LDAP server
 * 
 * @author Olivier Brun
 */
function cardvext_onStartCertificateFetchingStatuts() {

	// If argument is ok
	if (cardvext_EmailToLookFor != null && cardvext_EmailToLookFor != "" &&
			cardvext_DirectoryToLookFor != null	&& cardvext_DirectoryToLookFor != "") {
		// Initialization and process the LDAP search (Delay execution to allow UI to refresh)
		setTimeout(cardvext_initLDAPAndSearch, 1);
	} else {
		cardvext_showCurrentCertificateInWindow("card_viewer.error.start_invalid_data");
	}
}

/**
 * Stop the connection to the LDAP server cancel by the user
 * 
 * @author Olivier Brun
 */
//Window Dialog has been canceled by the user.
function cardvext_onStopCertificateFetchingStatuts() {
	if (cardvext_LdapOperation) {
		try {
			// Cancel the current LDAP operation if any
			cardvext_LdapOperation.abandon();
		} catch (e) {
			// Silently ignore this exception, since we can't do anything
		}
	}

	cardvext_Certificate = null;

	// Stop progress meter bar 
	document.getElementById('card_viewer_extended_progressmeter').setAttribute('hidden','true');
	document.getElementById("card_viewer_extended_button_id").label = cardvext_stringBundle.getString("card_viewer.button.showCurrentCertificate.label");
	return true;
}

//Init and process the LDAP search.
function cardvext_initLDAPAndSearch() {

	// Retrieve LDAP attributes from user preferences
	var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	var prefs = prefService.getBranch(null);

	// Get the login to authenticate as, if there is one.
	var directoryPref = cardvext_DirectoryToLookFor;
	if(directoryPref == null || directoryPref == ""){ // No directory from user card then search to the default directory server.
		directoryPref = prefs.getCharPref(CARDVEXT_PREF_LDAP_SERVER);
	}
	prefs = prefService.getBranch(directoryPref);

	try {
		cardvext_Login = prefs.getComplexValue(".auth.dn", Components.interfaces.nsISupportsString).data;
	} catch (e) {
		// if we don't have this pref, no big deal
	}

	// Init and process the LDAP search
	cardvext_LdapServerURL = 
		Components.classes["@mozilla.org/network/ldap-url;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPURL);
	try {
		cardvext_LdapServerURL.spec = prefs.getCharPref(".uri");

		cardvext_LdapConnection = 
			Components.classes["@mozilla.org/network/ldap-connection;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPConnection);

		cardvext_LdapConnection.init(
				cardvext_LdapServerURL.asciiHost,
				cardvext_LdapServerURL.port,
				cardvext_LdapServerURL.options & cardvext_LdapServerURL.OPT_SECURE,
				cardvext_Login,
				cardvext_getProxyOnUIThread(cardvext_LDAPMessageListener, Components.interfaces.nsILDAPMessageListener),
				null,
				Components.interfaces.nsILDAPConnection.VERSION3);

	} catch (e) {
		dump(e + " exception when creating ldap connection\n");
		cardvext_showCurrentCertificateInWindow("card_viewer.error.ldap_server");
	}
}

//Init a new LDAP operation Object
function cardvext_initNewLDAPOperation() {
	cardvext_LdapOperation = Components.classes["@mozilla.org/network/ldap-operation;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPOperation);

	cardvext_LdapOperation.init( cardvext_LdapConnection, 
			cardvext_getProxyOnUIThread(cardvext_LDAPMessageListener, Components.interfaces.nsILDAPMessageListener), null);
}

//Retrieve user password from preferences or ask him if not found
function cardvext_getPassword() {
	// We only need a password if we are using credentials
	if (cardvext_Login) {
		var windowWatcherSvc = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].getService(Components.interfaces.nsIWindowWatcher);
		var authPrompter = windowWatcherSvc.getNewAuthPrompter(window.QueryInterface(Components.interfaces.nsIDOMWindow));
		var strBundle = document.getElementById('bundle_ldap');
		var password = { value: "" };

		// nsLDAPAutocompleteSession uses asciiHost instead of host for the prompt text, I think we should be consistent.
		if (authPrompter.promptPassword(
				strBundle.getString("authPromptTitle"),
				strBundle.getFormattedString("authPromptText", [cardvext_LdapServerURL.asciiHost]),
				cardvext_LdapServerURL.spec,
				authPrompter.SAVE_PASSWORD_PERMANENTLY,
				password)) 
		{
			return password.value;
		}
	}
	return null;
}

//Utils to get a proxy on UI thread : don't freeze the UI will performing the
//search
function cardvext_getProxyOnUIThread(aObject, aInterface) {
	var eventQSvc = Components.classes["@mozilla.org/event-queue-service;1"].getService(Components.interfaces.nsIEventQueueService);
	var uiQueue = eventQSvc.getSpecialEventQueue(Components.interfaces.nsIEventQueueService.UI_THREAD_EVENT_QUEUE);
	var proxyMgr = Components.classes["@mozilla.org/xpcomproxy;1"].getService(Components.interfaces.nsIProxyObjectManager);

	return proxyMgr.getProxyForObject(uiQueue, aInterface, aObject, 5); // 5 == PROXY_ALWAYS | PROXY_SYNC
}

//Launch the LDAP search
function cardvext_kickOffSearch() {
	try {
		// Build the search query
		var prefix1 = "";
		var suffix1 = "";

		// Build the optionnal URL filter
		var urlFilter = cardvext_LdapServerURL.filter;
		if (urlFilter != null && urlFilter.length > 0 && urlFilter != "(objectclass=*)") {
			if (urlFilter[0] == '(') {
				prefix1 = "(&" + urlFilter;
			} else {
				prefix1 = "(&(" + urlFilter + ")";
			}
			suffix1 = ")";
		}

		// Build the mail criterion
		var mailFilter = "(mail=" + cardvext_EmailToLookFor + ")";

		// Concat the search query
		var filter = prefix1 + mailFilter + suffix1;

		// Launch the LDAP search
		cardvext_initNewLDAPOperation();
		cardvext_LdapOperation.searchExt(
				cardvext_LdapServerURL.dn,
				cardvext_LdapServerURL.scope,
				filter,
				1,
				[CARDVEXT_LDAP_ATTRIBUTE_CERTIFICATE],
				0,		// TODO Timeout parameter 
				1); 	// Max search results

	} catch (e) {
		dump(e + " exception when searching on ldap\n");
		cardvext_showCurrentCertificateInWindow("card_viewer.error.ldap_search");
	}
}

//Handle the search result LDAP message.
function cardvext_handleSearchResultMessage(aMessage) {

	var outSize = new Object();
	var attributesFound = null;
	try {
		attributesFound = aMessage.getAttributes(outSize);
	} catch (e) {
		dump(e + " exception when retrieving attributes of message from LDAP server\n");
	}
	if(attributesFound == null ) {
		return; // Attribute not found
	}
	// If attribute has not been returned, exit ...
	if (attributesFound.indexOf(CARDVEXT_LDAP_ATTRIBUTE_CERTIFICATE) == -1) {
		return;
	}
	// Handle certificate
	var certificates_ber_encoded = aMessage.getBinaryValues(
			CARDVEXT_LDAP_ATTRIBUTE_CERTIFICATE, outSize);
	if (certificates_ber_encoded && outSize.value > 0 && certificates_ber_encoded[0] != null) {
		certificate_length = new Object();
		certificate_bytes = certificates_ber_encoded[0].get(certificate_length);
	}
}

/**
 * Encode an array of bytes into base64
 * @param arrayBytes Array of bytes to encode
 * @return Base64 encoded string
 */
function cardvext_base64encode(arrayBytes) {
	const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var out = "", bits, i;

	while (arrayBytes.length >= 3) {
		bits = 0;
		for (i = 0; i < 3; i++) {
			bits <<= 8;
			bits |= arrayBytes[i];
		}
		for (i = 18; i >= 0; i -= 6) out += B64_CHARS[(bits>>i) & 0x3F];
		arrayBytes.splice(0, 3);
	}

	if (arrayBytes.length == 2) {
		out += B64_CHARS[(arrayBytes[0]>>2) & 0x3F];
		out += B64_CHARS[((arrayBytes[0] & 0x03) << 4) | ((arrayBytes[1] >> 4) & 0x0F)];
		out += B64_CHARS[((arrayBytes[1] & 0x0F) << 2)];
		out += "=";
	} else if (arrayBytes.length == 1) {
		out += B64_CHARS[(arrayBytes[0]>>2) & 0x3F];
		out += B64_CHARS[(arrayBytes[0] & 0x03) << 4];
		out += "==";
	}

	return out;
}
