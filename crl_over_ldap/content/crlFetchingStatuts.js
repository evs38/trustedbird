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

// Global variables and constants.

// The following variables are needed by the LDAP asynchronous calls.
var crl_over_ldap_LdapServerURL;
var crl_over_ldap_LdapConnection;
var crl_over_ldap_LdapOperation;

// LDAP Messages Listener : called on each LDAP message.
// Implements XPCOM nsILDAPMessageListener.
var crl_over_ldap_LDAPMessageListener = {

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
            crl_over_ldap_initNewLDAPOperation();
            crl_over_ldap_LdapOperation.simpleBind("");
        } catch (e) {
            dump(e + " exception when binding to ldap\n");
            window.close();
        }
    },

    // LDAP message has been received
    onLDAPMessage: function(aMessage) {
        
        // Search is done
        if (Components.interfaces.nsILDAPMessage.RES_SEARCH_RESULT == aMessage.type) {
            window.close();
            return;
        }

        // Binding is done
        if (Components.interfaces.nsILDAPMessage.RES_BIND == aMessage.type) {
            if (Components.interfaces.nsILDAPErrors.SUCCESS != aMessage.errorCode) {
                dump("Error with code " + aMessage.errorCode + " when binding to ldap\n");
                window.close();
            } else {
                // Kick off search ...
                crl_over_ldap_kickOffSearch();
            }
            return;
        }

        // One search result has been received
        if (Components.interfaces.nsILDAPMessage.RES_SEARCH_ENTRY == aMessage.type) {
            crl_over_ldap_handleSearchResultMessage(aMessage);
            return;
        }
    }
}

// Window Dialog has been loaded.
function crl_over_ldap_onLoadCrlFetchingStatuts() {

    // Retrieve and remind window argument
    crl_over_ldap_LdapServerURL = window.arguments[0][0];

    // If argument is ok
    if (crl_over_ldap_LdapServerURL != null) {
    
        // Init and process the LDAP search (Delay execution to allow UI to refresh)
        setTimeout(crl_over_ldap_initLDAPAndSearch, 1);
    
    } else {
        window.close();
        dump("No URL provided\n");
    }
}

// Window Dialog has been canceled by the user.
function crl_over_ldap_onDialogCancelFetchingStatuts() {
    if (crl_over_ldap_LdapOperation) {
        try {
            // Cancel the current LDAP operation if any
            crl_over_ldap_LdapOperation.abandon();
        } catch (e) {
            // Silently ignore this exception, since we can't do anything
        }
    }
    return true;
}

// Init and process the LDAP search.
function crl_over_ldap_initLDAPAndSearch() {

    // Init and process the LDAP search
    try {
        crl_over_ldap_LdapConnection = 
            Components.classes["@mozilla.org/network/ldap-connection;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPConnection);

        crl_over_ldap_LdapConnection.init(
            crl_over_ldap_LdapServerURL.asciiHost,
            crl_over_ldap_LdapServerURL.port,
            crl_over_ldap_LdapServerURL.options & crl_over_ldap_LdapServerURL.OPT_SECURE,
            null,
            crl_over_ldap_getProxyOnUIThread(crl_over_ldap_LDAPMessageListener, Components.interfaces.nsILDAPMessageListener),
            null,
            Components.interfaces.nsILDAPConnection.VERSION3);

    } catch (e) {
        dump(e + " exception when creating ldap connection\n");
        window.close();
    }
}

// Init a new LDAP operation Object
function crl_over_ldap_initNewLDAPOperation()
{
    crl_over_ldap_LdapOperation = 
        Components.classes["@mozilla.org/network/ldap-operation;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPOperation);

    crl_over_ldap_LdapOperation.init(
        crl_over_ldap_LdapConnection,
        crl_over_ldap_getProxyOnUIThread(crl_over_ldap_LDAPMessageListener, Components.interfaces.nsILDAPMessageListener), null);
}

// Utils to get a proxy on UI thread : don't freeze the UI will performing the search
function crl_over_ldap_getProxyOnUIThread(aObject, aInterface) {
    var eventQSvc = Components.classes["@mozilla.org/event-queue-service;1"].getService(Components.interfaces.nsIEventQueueService);
    var uiQueue = eventQSvc.getSpecialEventQueue(Components.interfaces.nsIEventQueueService.UI_THREAD_EVENT_QUEUE);
    var proxyMgr = Components.classes["@mozilla.org/xpcomproxy;1"].getService(Components.interfaces.nsIProxyObjectManager);

    return proxyMgr.getProxyForObject(uiQueue, aInterface, aObject, 5); // 5 == PROXY_ALWAYS | PROXY_SYNC
}

// Launch the LDAP search
function crl_over_ldap_kickOffSearch() {
    try {
        var nbAttributes = new Object();
        var attributes = crl_over_ldap_LdapServerURL.getAttributes(nbAttributes);

        if (nbAttributes.value != 1) {
            alert(nbAttributes.value + " attribute(s) requested. It must be only one.\n");
            window.close();
        }

        // Launch the LDAP search
        crl_over_ldap_initNewLDAPOperation();
        crl_over_ldap_LdapOperation.searchExt(
            crl_over_ldap_LdapServerURL.dn,
            crl_over_ldap_LdapServerURL.scope,
            crl_over_ldap_LdapServerURL.filter,
            1,
            attributes,
            0,
            1); // Max search results

    } catch (e) {
        dump(e + " exception when searching on ldap\n");
        window.close();
    }
}

// Handle the search result LDAP message.
function crl_over_ldap_handleSearchResultMessage(aMessage) {

    var outSize = new Object();
    var attributesFound = aMessage.getAttributes(outSize);

    // If attribute has not been returned, exit ...
    var nbAttributes = new Object();
    var attributes = crl_over_ldap_LdapServerURL.getAttributes(nbAttributes);
    if (attributesFound.indexOf(attributes[0]) == -1) {
        return;
    }

    // Handle CRL
    var crl_ber_encoded = aMessage.getBinaryValues(attributes[0], outSize);
    if (crl_ber_encoded && outSize.value > 0 && crl_ber_encoded[0] != null) {
        var crl_length = new Object();
        var crl_bytes = crl_ber_encoded[0].get(crl_length);
        window.arguments[0][1] = crl_bytes;
        window.arguments[0][2] = crl_length;
    }
}
