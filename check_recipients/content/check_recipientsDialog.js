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

// User preference defining LDAP server.
const CHECK_RECIPIENTS_PREF_LDAP_SERVER = "ldap_2.autoComplete.directoryServer";

// The following variables are needed by the LDAP asynchronous calls.
var check_recipients_LdapServerURL;
var check_recipients_LdapConnection;
var check_recipients_LdapOperation;
var check_recipients_Login;

// List of emails
var check_recipients_listEmails = new Array();

// Initialize fields on onload 
function check_recipients_onLoadDialog() {
    var recipientsList = document.getElementById('check_recipients_recipientsList');
    
    var msgCompFields = window.opener.gMsgCompose.compFields;
    if (msgCompFields) {
        window.opener.Recipients2CompFields(msgCompFields);
        
        var recipients = msgCompFields.to + "," + msgCompFields.cc + "," + msgCompFields.bcc;
        var recipientsArray = recipients.split(",");
        for (var i = 0; i < recipientsArray.length; i++) {
            if (recipientsArray[i]) {
                var email = check_recipients_substring(recipientsArray[i], "<", ">");
                
                if (check_recipients_listEmails.indexOf(email) != -1) {
                    continue;
                }
                var isEmailValid = check_recipients_isEmail(email);
                
                var row = document.createElement("listitem");
                var cell1 = document.createElement("listcell");
                cell1.setAttribute("label", recipientsArray[i]);
                row.appendChild(cell1);
                
                var cell2 = document.createElement("listcell");
                var image = document.createElement("image");
                if (isEmailValid) {
                    image.setAttribute("class", "check_recipients_searching");
                    image.setAttribute("id", email);
                    check_recipients_listEmails.push(email);
                } else {
                    image.setAttribute("class", "check_recipients_notfound");
                }
                cell2.appendChild(image);
                row.appendChild(cell2);

                recipientsList.appendChild(row);
            }
        }

        // Init and process the LDAP search (Delay execution to allow UI to refresh)
        setTimeout(check_recipients_initLDAPAndSearch, 1);
    }
}

// Test if the argument is an email
// The email format used is the one from the RFC 2822
function check_recipients_isEmail(str) {
	var rgexp = /^(("([a-zA-Z\d]+)"\s+(<){1})?([a-zA-Z\d]+((\.|-|_)[a-zA-Z\d]+)*@((?![-\d])[a-zA-Z\d-]{0,62}[a-zA-Z\d]\.){1,4}[a-zA-Z]{2,6})(>)?(;)?)+$/;
	return rgexp.test(str);
}

function check_recipients_substring(str, beginChar, endChar) {
    var beginIndex = str.indexOf(beginChar);
    if (beginIndex == -1) {
        return str;
    }
    var endIndex = str.lastIndexOf(endChar);
    if (endIndex == -1) {
        return str;
    }
    return str.substring(beginIndex + 1, endIndex);
}

// LDAP Messages Listener : called on each LDAP message.
// Implements XPCOM nsILDAPMessageListener.
var check_recipients_LDAPMessageListener = {

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
            check_recipients_initNewLDAPOperation();
            check_recipients_LdapOperation.simpleBind(check_recipients_getPassword());
        } catch (e) {
            alert(e + " exception when binding to ldap\n");
        }
    },

    // LDAP message has been received
    onLDAPMessage: function(aMessage) {
        
        // Search is done
        if (Components.interfaces.nsILDAPMessage.RES_SEARCH_RESULT == aMessage.type) {
            var progressmeter = document.getElementById("card_viewer_extended_progressmeter");
            if (progressmeter) {
                progressmeter.setAttribute("hidden", "true");
            }
            var images = document.getElementsByTagName("image");
            for (var i = 0; i < images.length; i++) {
                if (images[i].getAttribute("class") == "check_recipients_searching") {
                    images[i].setAttribute("class", "check_recipients_notfound");
                }
            }
            return;
        }

        // Binding is done
        if (Components.interfaces.nsILDAPMessage.RES_BIND == aMessage.type) {
            if (Components.interfaces.nsILDAPErrors.SUCCESS != aMessage.errorCode) {
                alert("Error with code " + aMessage.errorCode + " when binding to ldap\n");
            } else {
                // Kick off search ...
                check_recipients_kickOffSearch();
            }
            return;
        }

        // One search result has been received
        if (Components.interfaces.nsILDAPMessage.RES_SEARCH_ENTRY == aMessage.type) {
            check_recipients_handleSearchResultMessage(aMessage);
            return;
        }
    }
}

// Window Dialog has been canceled by the user.
function check_recipients_onDialogCancelFetchingStatuts() {
    if (check_recipients_LdapOperation) {
        try {
            // Cancel the current LDAP operation if any
            check_recipients_LdapOperation.abandon();
        } catch (e) {
            // Silently ignore this exception, since we can't do anything
        }
    }
    return true;
}

// Init and process the LDAP search.
function check_recipients_initLDAPAndSearch() {

    // Retrieve LDAP attributes from user preferences
    var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    var prefs = prefService.getBranch(null);

    // Get the login to authenticate as, if there is one
    var directoryPref = prefs.getCharPref(CHECK_RECIPIENTS_PREF_LDAP_SERVER);

    prefs = prefService.getBranch(directoryPref);
    try {
        check_recipients_Login = prefs.getComplexValue(".auth.dn", Components.interfaces.nsISupportsString).data;
    } catch (e) {
        // if we don't have this pref, no big deal
    }

    // Init and process the LDAP search
    check_recipients_LdapServerURL = 
        Components.classes["@mozilla.org/network/ldap-url;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPURL);

    try {
        check_recipients_LdapServerURL.spec = prefs.getCharPref(".uri");

        check_recipients_LdapConnection = 
            Components.classes["@mozilla.org/network/ldap-connection;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPConnection);

        check_recipients_LdapConnection.init(
            check_recipients_LdapServerURL.asciiHost,
            check_recipients_LdapServerURL.port,
            check_recipients_LdapServerURL.options & check_recipients_LdapServerURL.OPT_SECURE,
            check_recipients_Login,
            check_recipients_getProxyOnUIThread(check_recipients_LDAPMessageListener, Components.interfaces.nsILDAPMessageListener),
            null,
            Components.interfaces.nsILDAPConnection.VERSION3);

        } catch (e) {
            alert(e + " exception when creating ldap connection\n");
    }
}

// Init a new LDAP operation Object
function check_recipients_initNewLDAPOperation()
{
    check_recipients_LdapOperation = 
        Components.classes["@mozilla.org/network/ldap-operation;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPOperation);

    check_recipients_LdapOperation.init(
        check_recipients_LdapConnection,
        check_recipients_getProxyOnUIThread(check_recipients_LDAPMessageListener, Components.interfaces.nsILDAPMessageListener), null);
}

// Retrieve user password from preferences or ask him if not found
function check_recipients_getPassword() {
    // We only need a password if we are using credentials
    if (check_recipients_Login) {
        var windowWatcherSvc = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].getService(Components.interfaces.nsIWindowWatcher);
        var authPrompter = windowWatcherSvc.getNewAuthPrompter(window.QueryInterface(Components.interfaces.nsIDOMWindow));    
        var strBundle = document.getElementById('bundle_ldap');
        var password = { value: "" };

        // nsLDAPAutocompleteSession uses asciiHost instead of host for the prompt text, I think we should be consistent. 
        if (authPrompter.promptPassword(
            strBundle.getString("authPromptTitle"),
            strBundle.getFormattedString("authPromptText", [check_recipients_LdapServerURL.asciiHost]),
            check_recipients_LdapServerURL.spec,
            authPrompter.SAVE_PASSWORD_PERMANENTLY,
            password))
          return password.value;
        }

    return null;
}

// Utils to get a proxy on UI thread : don't freeze the UI will performing the search
function check_recipients_getProxyOnUIThread(aObject, aInterface) {
    var eventQSvc = Components.classes["@mozilla.org/event-queue-service;1"].getService(Components.interfaces.nsIEventQueueService);
    var uiQueue = eventQSvc.getSpecialEventQueue(Components.interfaces.nsIEventQueueService.UI_THREAD_EVENT_QUEUE);
    var proxyMgr = Components.classes["@mozilla.org/xpcomproxy;1"].getService(Components.interfaces.nsIProxyObjectManager);

    return proxyMgr.getProxyForObject(uiQueue, aInterface, aObject, 5); // 5 == PROXY_ALWAYS | PROXY_SYNC
}

// Launch the LDAP search
function check_recipients_kickOffSearch() {
    try {
        // Build the search query
        var prefix1 = "";
        var suffix1 = "";
        var prefix2 = "";
        var suffix2 = "";

        // Build the optionnal URL filter
        var urlFilter = check_recipients_LdapServerURL.filter;
        if (urlFilter != null && urlFilter.length > 0 && urlFilter != "(objectclass=*)") {
            if (urlFilter[0] == '(') {
                prefix1 = "(&" + urlFilter;
            } else {
                prefix1 = "(&(" + urlFilter + ")";
            }
            suffix1 = ")";
        }

         // Build the mail criterion
        var nbRecipients = check_recipients_listEmails.length;
        if (nbRecipients > 1) {
            prefix2 = "(|";
            suffix2 = ")";
        }

        var mailFilter = "";
        for (var i = 0; i < nbRecipients; i++) {
            mailFilter += "(mail=" + check_recipients_listEmails[i] + ")";
        }

        // Concat the search query
        var filter = prefix1 + prefix2 + mailFilter + suffix2 + suffix1;
        
        // Build the array of attributes to look for
        var wanted_attributes = ["mail"];

        // Launch the LDAP search
        check_recipients_initNewLDAPOperation();
        check_recipients_LdapOperation.searchExt(
            check_recipients_LdapServerURL.dn,
            check_recipients_LdapServerURL.scope,
            filter,
            wanted_attributes.length,
            wanted_attributes,
            0,
            nbRecipients); // Max search results
            
    } catch (e) {
        alert(e + " exception when searching on ldap\n");
    }
}

// Handle the search result LDAP message.
function check_recipients_handleSearchResultMessage(aMessage) {

    var outSize = new Object();
    var attributesFound = aMessage.getAttributes(outSize);

    // If attribute has not been returned
    if (attributesFound.indexOf("mail") == -1) {
        return;
    }

    // Remove recipient's mail from recipients list
    var mailValue = aMessage.getValues("mail", outSize);
    if (mailValue && outSize.value > 0) {
        var image = document.getElementById(mailValue);
        if (image) {
            image.setAttribute("class", "check_recipients_found");
        }
        dump(mailValue + " found in ldap\n");
    }
}