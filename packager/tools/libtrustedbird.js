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
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Raphael Fairise / BT Global Services / Etat francais Ministere de la Defense
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


/*******************
 ****** Debug ******
 *******************/

/* private */
var _trustedBird_dump_showInConsole = false;
var _trustedBird_dump_showInConsole_loaded = false;
function _trustedBird_dump_load() {
	_trustedBird_dump_showInConsole = trustedBird_prefService_getBoolPref("javascript.options.showInConsole")
	_trustedBird_dump_showInConsole_loaded = true;
}

/**
 * Print a message in the console if preference javascript.options.showInConsole is true
 * @param message The message to print
 */
function trustedBird_dump(message) {
	if (!_trustedBird_dump_showInConsole_loaded) _trustedBird_dump_load();
	
	if (_trustedBird_dump_showInConsole) dump(message + "\n");
}

/**
 * Print human-readable information about a variable
 * @param obj Variable to print 
 */
function trustedBird_print_r(obj) {
	var label = 'unknown';

	function is_array(o) {
		if (o != null && typeof o == 'object') {
			return (typeof o.push == 'undefined') ? false : true;
		}
		return false;
	}

	if (obj == null) {
		return 'null';
	} else if (is_array(obj)) {
		label = 'Array{' + obj.length + '}';
	} else if (typeof obj == 'object' && obj.prototype) {
		obj = obj.prototype;
		label = 'Object';
	} else if (typeof obj == 'object' && !obj.prototype) {
		label = 'Object';
	}

	var base = (typeof arguments[1] == 'undefined') ? '' : arguments[1];

	var r = '';
	var ret_val = '';
	for (var key in obj) {
		if (typeof obj[key] == 'object') {
			if (label.indexOf('Array') > -1 || label == 'Object') {
				r += base + '\t[' + key + '] => '
					+ trustedBird_print_r(obj[key], (base + '\t')) + '\n';
			} else if (label == 'HTMLObject') {
				var element_id = '';
				if (typeof obj[key].id != 'undefined') {
					element_id += base + '\t\t\t[className] => '
							+ typeof (obj[key].className) + '{'
							+ obj[key].className.length + '}: ' + '"'
							+ obj[key].className + '"' + '\n';
					element_id += base + '\t\t\t[id] => '
							+ typeof (obj[key].id) + '{' + obj[key].id.length
							+ '}: ' + '"' + obj[key].id + '"' + '\n';
					element_id += base + '\t\t\t[innerText] => '
							+ typeof (obj[key].innerText) + '{'
							+ obj[key].innerText.length + '}: ' + '"'
							+ obj[key].innerText + '"' + '\n';
					element_id += base + '\t\t\t[parentElement] => '
							+ typeof (obj[key].parentElement.id) + '{'
							+ obj[key].parentElement.id.length + '}: ' + '"'
							+ obj[key].parentElement.id + '"' + '\n';
					element_id += base + '\t\t\t[tagName] => '
							+ typeof (obj[key].tagName) + '{'
							+ obj[key].tagName.length + '}: ' + '"'
							+ obj[key].tagName + '"' + '\n';
				}

				r += base + '\t[' + key + '] => '
						+ trustedBird_print_r(obj[key].children, (base + '\t')) + '\n'
						+ base + '\t\tHTMLObj {\n' + element_id + base
						+ '\t\t}\n';
			}
		} else {
			if (typeof obj[key] == 'string') {
				r += base
						+ '\t['
						+ key
						+ '] => '
						+ (typeof obj[key] + '{' + obj[key].length + '}: '
								+ '"' + obj[key] + '"' + '\n');
			} else {
				r += base
						+ '\t['
						+ key
						+ '] => '
						+ (typeof obj[key] + ': ' + '"' + obj[key] + '"' + '\n');
			}
		}
	}

	trustedBird_dump(label + ' { \n' + r + base + '} \n');
}


/********************************
 ****** Preference service ******
 ********************************/

/* private */
var trustedBird_prefService_branch = null;
function _trustedBird_prefService_load() {
	trustedBird_prefService_branch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);
	trustedBird_prefService_branch.QueryInterface(Components.interfaces.nsIPrefBranch2);
}

/**
 * Get preference service branch
 * @return Preference service branch
 */
function trustedBird_prefService_getBranch() {
	if (trustedBird_prefService_branch == null) _trustedBird_prefService_load();
	
	return trustedBird_prefService_branch;
}

/**
 * Get a boolean preference
 * @param preferenceName Name of the preference
 * @param defaultValue Default value to return if preference doesn't exist (optional)
 * @return Value of the preference
 */
function trustedBird_prefService_getBoolPref(preferenceName, defaultValue) {
	if (trustedBird_prefService_branch == null) _trustedBird_prefService_load();
	
	var value = false;
	if (defaultValue !== undefined) value = defaultValue;
	try {
		value = trustedBird_prefService_branch.getBoolPref(preferenceName);
	} catch(e) {}
	
	return value;
}

/**
 * Set a boolean preference
 * @param preferenceName Name of the preference
 * @param value Value to set
 * @return True if the operation was successful, false otherwise
 */
function trustedBird_prefService_setBoolPref(preferenceName, value) {
	if (trustedBird_prefService_branch == null) _trustedBird_prefService_load();
	
	try {
		trustedBird_prefService_branch.setBoolPref(preferenceName, value);
		return true;
	} catch(e) {}
	
	return false;
}

/**
 * Get an integer preference
 * @param preferenceName Name of the preference
 * @param defaultValue Default value to return if preference doesn't exist (optional)
 * @return Value of the preference
 */
function trustedBird_prefService_getIntPref(preferenceName, defaultValue) {
	if (trustedBird_prefService_branch == null) trustedBird_prefService_load();
	
	var value = 0;
	if (defaultValue !== undefined) value = defaultValue;
	try {
		value = trustedBird_prefService_branch.getIntPref(preferenceName);
	} catch(e) {}
	
	return value;
}

/**
 * Set an integer preference
 * @param preferenceName Name of the preference
 * @param value Value to set
 * @return True if the operation was successful, false otherwise
 */
function trustedBird_prefService_setIntPref(preferenceName, value) {
	if (trustedBird_prefService_branch == null) _trustedBird_prefService_load();
	
	try {
		trustedBird_prefService_branch.setIntPref(preferenceName, value);
		return true;
	} catch(e) {}
	
	return false;
}

/**
 * Get a string preference
 * @param preferenceName Name of the preference
 * @param defaultValue Default value to return if preference doesn't exist (optional)
 * @return Value of the preference
 */
function trustedBird_prefService_getCharPref(preferenceName, defaultValue) {
	if (trustedBird_prefService_branch == null) trustedBird_prefService_load();
	
	var value = "";
	if (defaultValue !== undefined) value = defaultValue;
	try {
		value = trustedBird_prefService_branch.getCharPref(preferenceName);
	} catch(e) {}
	
	return value;
}

/**
 * Set a string preference
 * @param preferenceName Name of the preference
 * @param value Value to set
 * @return True if the operation was successful, false otherwise
 */
function trustedBird_prefService_setCharPref(preferenceName, value) {
	if (trustedBird_prefService_branch == null) _trustedBird_prefService_load();
	
	try {
		trustedBird_prefService_branch.setCharPref(preferenceName, value);
		return true;
	} catch(e) {}
	
	return false;
}

/**
 * Get a complex preference
 * @param preferenceName Name of the preference
 * @param preferenceType Type of the preference
 * @param defaultValue Default value to return if preference doesn't exist (optional)
 * @return Value of the preference
 */
function trustedBird_prefService_getComplexPref(preferenceName, preferenceType, defaultValue) {
	if (trustedBird_prefService_branch == null) _trustedBird_prefService_load();
	
	var value = "";
	if (defaultValue !== undefined) value = defaultValue;
	try {
		value = trustedBird_prefService_branch.getComplexValue(preferenceName, preferenceType).data;
	} catch(e) {}
	
	return value;
}

/**
 * Set a complex preference
 * @param preferenceName Name of the preference
 * @param preferenceType Type of the preference
 * @param value Value to set
 * @return True if the operation is successful, false otherwise
 */
function trustedBird_prefService_setComplexPref(preferenceName, preferenceType, value) {
	if (trustedBird_prefService_branch == null) _trustedBird_prefService_load();
	
	try {
		trustedBird_prefService_branch.setComplexValue(preferenceName, preferenceType, value);
		return true;
	} catch(e) {}
	
	return false;
}

/**
 * Add a preference change observer
 * @param domain The preference on which to listen for changes
 * @param observer The object to be notified if the preference changes
 * @param holdWeak If true, hold a weak reference to observer
 */
function trustedBird_prefService_addObserver(domain, observer, holdWeak) {
	if (trustedBird_prefService_branch == null) _trustedBird_prefService_load();
	
	try {
		trustedBird_prefService_branch.addObserver(domain, observer, holdWeak);
	} catch(e) {
		trustedBird_dump("Error trustedBird_prefService_addObserver()");
	}
}

/**
 * Remove a preference change observer
 * @param domain The preference which is being observed for changes
 * @param observer An observer previously registered with trustedBird_prefService_addObserver
 */
function trustedBird_prefService_removeObserver(domain, observer) {
	if (trustedBird_prefService_branch == null) _trustedBird_prefService_load();
	
	try {
		trustedBird_prefService_branch.removeObserver(domain, observer);
	} catch(e) {
		trustedBird_dump("Error trustedBird_prefService_removeObserver()");
	}
}

/**********************************
 ****** LDAP: directory list ******
 **********************************/

/**
 * Get global or account-specific LDAP directory list from preferences database
 * Works with or without Multi-LDAP add-on
 * @param identityKey Key of current account identity (optional)
 * @return Array of directories
 */
function trustedBird_LDAP_getDirectoryList(identityKey) {
	const PREF_MULTI_LDAP_ENABLED = "extensions.multi-ldap.enabled";
	
	const PREF_MULTI_LDAP_USE_LDAP = "ldap_2.autoComplete.useDirectory";

	const PREF_MULTI_LDAP_0_LIST = "ldap_2.autoComplete.directoryServer";

	const PREF_MULTI_LDAP_0_OVERRIDE_LDAP_ACCOUNT_BEGIN = "mail.identity.";
	const PREF_MULTI_LDAP_0_OVERRIDE_LDAP_ACCOUNT_END = ".overrideGlobal_Pref";

	const PREF_MULTI_LDAP_0_LIST_ACCOUNT_BEGIN = "mail.identity.";
	const PREF_MULTI_LDAP_0_LIST_ACCOUNT_END = ".directoryServer";

	const PREF_MULTI_LDAP_1_LIST = "ldap_2.autoComplete.directoryServers";

	const PREF_MULTI_LDAP_1_OVERRIDE_ACCOUNT_BEGIN = "mail.identity.";
	const PREF_MULTI_LDAP_1_OVERRIDE_ACCOUNT_END = ".overrideGlobal_Pref.multi-ldap";

	const PREF_MULTI_LDAP_1_LIST_ACCOUNT_BEGIN = "mail.identity.";
	const PREF_MULTI_LDAP_1_LIST_ACCOUNT_END = ".directoryServers";

	var directoryList = "";

	/* Check if Multi-LDAP add-on is installed */
	if (trustedBird_prefService_getBoolPref(PREF_MULTI_LDAP_ENABLED)) {
		/* With Multi-LDAP add-on */
		if (identityKey !== undefined && trustedBird_prefService_getBoolPref(PREF_MULTI_LDAP_1_OVERRIDE_ACCOUNT_BEGIN + identityKey + PREF_MULTI_LDAP_1_OVERRIDE_ACCOUNT_END)) {
			/* Account-specific settings */
			directoryList = trustedBird_prefService_getCharPref(PREF_MULTI_LDAP_1_LIST_ACCOUNT_BEGIN + identityKey + PREF_MULTI_LDAP_1_LIST_ACCOUNT_END);
		} else if (trustedBird_prefService_getBoolPref(PREF_MULTI_LDAP_USE_LDAP)) {
			/* Global settings */
			directoryList = trustedBird_prefService_getCharPref(PREF_MULTI_LDAP_1_LIST);
		}
	} else {
		/* Without Multi-LDAP add-on */
		if (identityKey !== undefined && trustedBird_prefService_getBoolPref(PREF_MULTI_LDAP_0_OVERRIDE_LDAP_ACCOUNT_BEGIN + identityKey + PREF_MULTI_LDAP_0_OVERRIDE_LDAP_ACCOUNT_END)) {
			/* Account-specific settings */
			directoryList = trustedBird_prefService_getCharPref(PREF_MULTI_LDAP_0_LIST_ACCOUNT_BEGIN + identityKey + PREF_MULTI_LDAP_0_LIST_ACCOUNT_END);
		} else if (trustedBird_prefService_getBoolPref(PREF_MULTI_LDAP_USE_LDAP)) {
			/* Global settings */
			directoryList = trustedBird_prefService_getCharPref(PREF_MULTI_LDAP_0_LIST);
		}
	}
	
	/* Convert string to array */
	var directoryListArray = new Array();
	if (directoryList != "") directoryListArray = directoryList.split(',');
	
	return directoryListArray;
}

/**
 * getProxyOnUIThread
 * @param aObject
 * @param aInterface
 * @return Proxy for aObject
 */
function trustedBird_getProxyOnUIThread(aObject, aInterface) {
	var eventQSvc = Components.classes["@mozilla.org/event-queue-service;1"].getService(Components.interfaces.nsIEventQueueService);
	var uiQueue = eventQSvc.getSpecialEventQueue(Components.interfaces.nsIEventQueueService.UI_THREAD_EVENT_QUEUE);
	var proxyMgr = Components.classes["@mozilla.org/xpcomproxy;1"].getService(Components.interfaces.nsIProxyObjectManager);
	
	return proxyMgr.getProxyForObject(uiQueue, aInterface, aObject, 5); // 5 == PROXY_ALWAYS | PROXY_SYNC
}

/**
 * LDAP query object 
 */
function trustedBird_ldapQuery() {
	this.ldapURL = null;
	this.ldapConnection = null;
	this.ldapOperation = null;
	this.ldapEndCallback = null;
	this.ldapEndCallbackParameter = null;
	this.ldapMessageCallback = null;
	this.ldapMessageCallbackParameter = null;
	this.error = trustedBird_ldapQuery.DATA_ERROR;
}

/* Error codes */
trustedBird_ldapQuery.NO_ERROR = 0;
trustedBird_ldapQuery.CONNECT_ERROR = 1;
trustedBird_ldapQuery.SEARCH_ERROR = 2;
trustedBird_ldapQuery.DATA_ERROR = 3;

/**
 * Launch a LDAP query
 * @param aLdapUri LDAP URI
 * @param aLdapEndCallback Callback function to handle end of query (error, aLdapEndCallbackParameter)
 * @param aLdapEndCallbackParameter
 * @param aLdapMessageCallback Callback function to handle LDAP response (nsILDAPURL, nsILDAPMessage, aLdapMessageCallbackParameter, return true if received data is correct)
 * @param aLdapMessageCallbackParameter
 * @return True if query has been successfully launched
 */
trustedBird_ldapQuery.prototype.launch = function(aLdapUri, aLdapEndCallback, aLdapEndCallbackParameter, aLdapMessageCallback, aLdapMessageCallbackParameter) {
	this.ldapEndCallback = aLdapEndCallback;
	this.ldapEndCallbackParameter = aLdapEndCallbackParameter;
	this.ldapMessageCallback = aLdapMessageCallback;
	this.ldapMessageCallbackParameter = aLdapMessageCallbackParameter;
	
	try {
		this.ldapURL = Components.classes["@mozilla.org/network/ldap-url;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPURL);
		this.ldapURL.spec = aLdapUri;
	} catch (e) {
		trustedBird_dump("Error trustedBird_ldapQuery.launch incorrect URI:" + e);
		return false;
	}
	
	try {
		this.ldapConnection = Components.classes["@mozilla.org/network/ldap-connection;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPConnection);
		this.ldapConnection.init(
			this.ldapURL.asciiHost,
			this.ldapURL.port,
			this.ldapURL.options & this.ldapURL.OPT_SECURE,
			null,
			trustedBird_getProxyOnUIThread(this, Components.interfaces.nsILDAPMessageListener),
			null,
			Components.interfaces.nsILDAPConnection.VERSION3);
		
	} catch (e) {
		trustedBird_dump("Error trustedBird_ldapQuery.launch: " + e);
		return false;
	}
	
	return true;
}

/**
 * Launch bind operation
 */
trustedBird_ldapQuery.prototype.bind = function() {
	if (this.ldapConnection == null) return;
	
	try {
		this.ldapOperation = Components.classes["@mozilla.org/network/ldap-operation;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPOperation);
		
		this.ldapOperation.init(
			this.ldapConnection,
			trustedBird_getProxyOnUIThread(this, Components.interfaces.nsILDAPMessageListener),
			null);
	
		this.ldapOperation.simpleBind("");
		return true;
	} catch (e) {
		trustedBird_dump("Error trustedBird_ldapQuery.search: " + e);
	}
	
	return false;
}

/**
 * Launch search operation
 */
trustedBird_ldapQuery.prototype.search = function() {
	if (this.ldapConnection == null) return false;

	try {
		var nbAttributes = new Object;
		
		delete this.ldapOperation;
		this.ldapOperation = Components.classes["@mozilla.org/network/ldap-operation;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPOperation);
		
		this.ldapOperation.init(
			this.ldapConnection,
			trustedBird_getProxyOnUIThread(this, Components.interfaces.nsILDAPMessageListener),
			null);

		this.ldapOperation.searchExt(
    		this.ldapURL.dn,
    		this.ldapURL.scope,
    		this.ldapURL.filter,
			0,
			this.ldapURL.getAttributes(new Object),
			0,
			0);

		return true;
    } catch (e) {
    	trustedBird_dump("Error trustedBird_ldapQuery.search: " + e);
    }
    
    return false;
}

trustedBird_ldapQuery.prototype.QueryInterface = function(iid) {
	if (iid.equals(Components.interfaces.nsISupports) || iid.equals(Components.interfaces.nsILDAPMessageListener)) return this;

    Components.returnCode = Components.results.NS_ERROR_NO_INTERFACE;
    return null;
}

trustedBird_ldapQuery.prototype.onLDAPInit = function(aConnection, aStatus) {
	if (this.bind()) return;
	
	if (this.ldapEndCallback) this.ldapEndCallback(trustedBird_ldapQuery.CONNECT_ERROR, this.ldapEndCallbackParameter);
}

trustedBird_ldapQuery.prototype.onLDAPMessage = function(aMessage) {
	switch (aMessage.type) {
		case Components.interfaces.nsILDAPMessage.RES_BIND:
			trustedBird_dump("trustedBird_ldapMessageListener.onLDAPMessage: RES_BIND");
			if (aMessage.errorCode == Components.interfaces.nsILDAPErrors.SUCCESS) {
				if (this.search()) return;
			} else {
				trustedBird_dump("Error trustedBird_ldapMessageListener.onLDAPMessage RES_BIND: (" + aMessage.errorCode + ") " + aMessage.errorMessage);
			}
			if (this.ldapEndCallback) this.ldapEndCallback(trustedBird_ldapQuery.SEARCH_ERROR, this.ldapEndCallbackParameter);
			return;
			break;
		
		case Components.interfaces.nsILDAPMessage.RES_SEARCH_ENTRY:
			trustedBird_dump("trustedBird_ldapMessageListener.onLDAPMessage: RES_SEARCH_ENTRY");
			if (aMessage.errorCode == Components.interfaces.nsILDAPErrors.SUCCESS) {
				if (!this.ldapMessageCallback || this.ldapMessageCallback(this.ldapURL, aMessage, this.ldapMessageCallbackParameter)) {
					this.error = trustedBird_ldapQuery.NO_ERROR;
				}
				return;
			} else {
				trustedBird_dump("Error trustedBird_ldapMessageListener.onLDAPMessage RES_SEARCH_ENTRY: (" + aMessage.errorCode + ") " + aMessage.errorMessage);
			}
			break;

		case Components.interfaces.nsILDAPMessage.RES_SEARCH_RESULT:
			trustedBird_dump("trustedBird_ldapMessageListener.onLDAPMessage: RES_SEARCH_RESULT");
			break;
	}
	
	if (this.ldapEndCallback) this.ldapEndCallback(this.error, this.ldapEndCallbackParameter);
}


/********************
 ****** Base64 ******
 ********************/

/**
 * Encode an array of bytes into base64
 * @param arrayBytes Array of bytes to encode
 * @return Base64 encoded string
 */
function trustedBird_base64encode(arrayBytes) {
	const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var out = "", bits;

	while (arrayBytes.length >= 3) {
		bits = 0;
		for (var i = 0; i < 3; i++) {
			bits <<= 8;
			bits |= arrayBytes[i];
		}
		for (var i = 18; i >= 0; i -= 6) out += B64_CHARS[(bits>>i) & 0x3F];
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
