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

// User preference defining LDAP attributes to look for finding if one recipient supports HTML format.
const SNDFMTLDAP_PREF_LDAP_ATTRIBUTE_PREFER_MAIL_FORMAT = "ldap_2.servers.default.attrmap.PreferMailFormat";

// URL of the window dialog to call
const SNDFMTLDAP_DIALOG_WINDOW_URL = 'chrome://send_format_ldap/content/formatFetchingStatuts.xul';

// The following are needed by the LDAP asynchronous calls.
var sndfmtldap_LdapServerURL;
var sndfmtldap_LdapConnection;
var sndfmtldap_LdapOperation;
var sndfmtldap_Login;

// LDAP attributes to look for finding if one recipient supports HTML format.
// Its value will be retrieve from user preferences.
var sndfmtldap_ArrayOfAttributes_IsHTMLSupported;

// Holder for the list of recipients to filter.
var sndfmtldap_FilteredRecipients;

var sndfmtldap_directoryListArray;

// Extension Hook : replace the built in DetermineHTMLAction function defined in MsgComposeCommands.js with our own ...
// The only update done to the built in function is the call of our extension (see the tag "hook for send_format_ldap" inside the body).
// This is the less intrusive way we have found to hook this extension, please feel free to propose any other way.
function DetermineHTMLAction(convertible)
{
    var obj;
    if (! gMsgCompose.composeHTML)
    {
        try {
            obj = new Object;
            gMsgCompose.CheckAndPopulateRecipients(true, false, obj);
        } catch(ex) { dump("gMsgCompose.CheckAndPopulateRecipients failed: " + ex + "\n"); }
        return nsIMsgCompSendFormat.PlainText;
    }

    if (gSendFormat == nsIMsgCompSendFormat.AskUser)
    {
        //Well, before we ask, see if we can figure out what to do for ourselves

        var noHtmlRecipients;
        var noHtmlnewsgroups;
        var preferFormat;

        //Check the address book for the HTML property for each recipient
        try {
            obj = new Object;
            preferFormat = gMsgCompose.CheckAndPopulateRecipients(true, true, obj);
            noHtmlRecipients = obj.value;
        } catch(ex)
        {
            dump("gMsgCompose.CheckAndPopulateRecipients failed: " + ex + "\n");
            var msgCompFields = gMsgCompose.compFields;
            noHtmlRecipients = msgCompFields.to + "," + msgCompFields.cc + "," + msgCompFields.bcc;
            preferFormat = nsIAbPreferMailFormat.unknown;
        }
        dump("DetermineHTMLAction: preferFormat = " + preferFormat + ", noHtmlRecipients are " + noHtmlRecipients + "\n");

        // Begin hook for send_format_ldap
        noHtmlRecipients = sndfmtldap_FilterHtmlRecipientsFromLDAP(noHtmlRecipients);
        // End hook for send_format_ldap
        
        //Check newsgroups now...
        noHtmlnewsgroups = gMsgCompose.compFields.newsgroups;

        if (noHtmlRecipients != "" || noHtmlnewsgroups != "")
        {
            if (convertible == nsIMsgCompConvertible.Plain)
              return nsIMsgCompSendFormat.PlainText;

            if (noHtmlnewsgroups == "")
            {
                switch (preferFormat)
                {
                  case nsIAbPreferMailFormat.plaintext :
                    return nsIMsgCompSendFormat.PlainText;

                  default :
                    //See if a preference has been set to tell us what to do. Note that we do not honor that
                    //preference for newsgroups. Only for e-mail addresses.
                    var action = sPrefs.getIntPref("mail.default_html_action");
                    switch (action)
                    {
                        case nsIMsgCompSendFormat.PlainText    :
                        case nsIMsgCompSendFormat.HTML         :
                        case nsIMsgCompSendFormat.Both         :
                            return action;
                    }
                }
            }
            return nsIMsgCompSendFormat.AskUser;
        }
        else
            return nsIMsgCompSendFormat.HTML;
    }
    else
    {
      try {
                       obj = new Object;
                       gMsgCompose.CheckAndPopulateRecipients(true, false, obj);
      } catch(ex) { dump("gMsgCompose.CheckAndPopulateRecipients failed: " + ex + "\n"); }
    }

    return gSendFormat;
}

// Main entry point, hooked in the built in DetermineHTMLAction function.
// Filter the given recipients, excluding ones that supports HTML mail format.
// We look up in the LDAP directory to retrieve the mail format.
function sndfmtldap_FilterHtmlRecipientsFromLDAP(recipients) {
    if (recipients != null && recipients != "") {

        // Log call of our extension
    	trustedBird_dump("sndfmtldap_FilterHtmlRecipientsFromLDAP: noHtmlRecipients = " + recipients);
        
        // Use an array to pass the argument to the dialog window
        // in order to be able to return a modified value
        var argHolder = [recipients];
        
        // Open the dialog window that will block the user until fetching from LDAP is done
        window.openDialog(
            SNDFMTLDAP_DIALOG_WINDOW_URL,
            'send_format_ldap_formatFetchingStatuts', // Dummy name
            'chrome,resizable=0,modal=1,dialog=1', // Modal: block user
            argHolder
        );
        
        // Fetch the filtered recipients from the dialog window
        recipients = argHolder[0];
        
        // Log result of our extension
        if (recipients != "") {
        	trustedBird_dump("sndfmtldap_FilterHtmlRecipientsFromLDAP: noHtmlRecipients = " + recipients);
        } else {
        	trustedBird_dump("sndfmtldap_FilterHtmlRecipientsFromLDAP: all recipients accept HTML");
        }
    }
    return recipients;
}

// LDAP Messages Listener : called on each LDAP message.
// Implements XPCOM nsILDAPMessageListener.
var sndfmtldap_LDAPMessageListener = {

    QueryInterface: function(iid) {
        if (iid.equals(Components.interfaces.nsISupports) || iid.equals(Components.interfaces.nsILDAPMessageListener)) {
            return this;
        }

        Components.returnCode = Components.results.NS_ERROR_NO_INTERFACE;
        return null;
    },

    // Init has completed
    onLDAPInit: function (aConn, aStatus) {
        // Bind to LDAP
        try {
            sndfmtldap_initNewLDAPOperation();
            sndfmtldap_LdapOperation.simpleBind(sndfmtldap_getPassword());
        } catch (e) {
            dump(e + " exception when binding to ldap\n");
            window.close();
        }
    },
        
    // LDAP message has been received
    onLDAPMessage: function(aMessage) {
        
        // Search is done
        if (Components.interfaces.nsILDAPMessage.RES_SEARCH_RESULT == aMessage.type) {
        	if (sndfmtldap_directoryListArray.length > 0 && sndfmtldap_FilteredRecipients != '') {
        		sndfmtldap_initLDAPAndSearch();
        	} else {
        		window.close();
        	}
          return;
        }

        // Binding is done
        if (Components.interfaces.nsILDAPMessage.RES_BIND == aMessage.type) {
            if (Components.interfaces.nsILDAPErrors.SUCCESS != aMessage.errorCode) {
                window.close();
            } else {
                // Kick off search ...
                sndfmtldap_kickOffSearch();
            }
            return;
        }

        // One search result has been received
        if (Components.interfaces.nsILDAPMessage.RES_SEARCH_ENTRY == aMessage.type) {
            sndfmtldap_handleSearchResultMessage(aMessage);
            return;
        }
    }
}

// Window Dialog has been loaded.
function sndfmtldap_onLoadFormatFetchingStatuts() {

	// Get directory list
	sndfmtldap_directoryListArray = trustedBird_LDAP_getDirectoryList(window.opener.gCurrentIdentity.key);
	
    // Retrieve window arguments
    sndfmtldap_FilteredRecipients = window.arguments[0][0];
    
    // If arguments are ok
    if (sndfmtldap_directoryListArray.length > 0 && sndfmtldap_FilteredRecipients != null && sndfmtldap_FilteredRecipients != '') {

        // Init and process the LDAP search (Delay execution to allow UI to refresh)
        setTimeout(sndfmtldap_initLDAPAndSearch, 1);

    } else {
        window.close();
    }
}

// Window Dialog has been canceled by the user.
function sndfmtldap_onDialogCancelFetchingStatuts() {
    if (sndfmtldap_LdapOperation) {
        try {
            // Cancel the current LDAP operation if any
            sndfmtldap_LdapOperation.abandon();
        } catch (e) {
        }
    }
    return true;
}

// Init and process the LDAP search.
function sndfmtldap_initLDAPAndSearch() {
    // Retrieve LDAP attributes which define if HTML format is supported
    sndfmtldap_ArrayOfAttributes_IsHTMLSupported = trustedBird_prefService_getCharPref(SNDFMTLDAP_PREF_LDAP_ATTRIBUTE_PREFER_MAIL_FORMAT).split(',');
    
    var directoryPref = "";
    if (sndfmtldap_directoryListArray.length > 0) directoryPref = sndfmtldap_directoryListArray.pop();
    if (directoryPref != "") {
    	
    	trustedBird_dump("Searching directory " + trustedBird_prefService_getCharPref(directoryPref + ".description") + "...");
    	
	    // Get the login to authenticate as, if there is one
	    try {
	        sndfmtldap_Login = trustedBird_prefService_getComplexPref(directoryPref + ".auth.dn", Components.interfaces.nsISupportsString);
	    } catch (e) {
	        // if we don't have this pref, no big deal
	    }
	
	    // Init and process the LDAP search
	    sndfmtldap_LdapServerURL = 
	        Components.classes["@mozilla.org/network/ldap-url;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPURL);
	    try {
	        sndfmtldap_LdapServerURL.spec = trustedBird_prefService_getCharPref(directoryPref + ".uri");
	
	        sndfmtldap_LdapConnection = 
	            Components.classes["@mozilla.org/network/ldap-connection;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPConnection);
	
	        sndfmtldap_LdapConnection.init(
	            sndfmtldap_LdapServerURL.asciiHost,
	            sndfmtldap_LdapServerURL.port,
	            sndfmtldap_LdapServerURL.options & sndfmtldap_LdapServerURL.OPT_SECURE,
	            sndfmtldap_Login,
	            sndfmtldap_getProxyOnUIThread(sndfmtldap_LDAPMessageListener, Components.interfaces.nsILDAPMessageListener),
	            null,
	            Components.interfaces.nsILDAPConnection.VERSION3);
	
	        } catch (e) {
	            dump(e + " exception when creating ldap connection\n");
	            window.close();
	    }
    }
}

// Init a new LDAP operation Object
function sndfmtldap_initNewLDAPOperation()
{
    sndfmtldap_LdapOperation = 
        Components.classes["@mozilla.org/network/ldap-operation;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPOperation);

    sndfmtldap_LdapOperation.init(
        sndfmtldap_LdapConnection,
        sndfmtldap_getProxyOnUIThread(sndfmtldap_LDAPMessageListener, Components.interfaces.nsILDAPMessageListener), null);
}

// Retrieve user password from preferences or ask him if not found
function sndfmtldap_getPassword() {
    // We only need a password if we are using credentials
    if (sndfmtldap_Login) {
        var windowWatcherSvc = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].getService(Components.interfaces.nsIWindowWatcher);
        var authPrompter = windowWatcherSvc.getNewAuthPrompter(window.QueryInterface(Components.interfaces.nsIDOMWindow));    
        var strBundle = document.getElementById('bundle_ldap');
        var password = { value: "" };

        // nsLDAPAutocompleteSession uses asciiHost instead of host for the prompt text, I think we should be consistent. 
        if (authPrompter.promptPassword(
            strBundle.getString("authPromptTitle"),  
            strBundle.getFormattedString("authPromptText", [sndfmtldap_LdapServerURL.asciiHost]),
            sndfmtldap_LdapServerURL.spec,
            authPrompter.SAVE_PASSWORD_PERMANENTLY,
            password))
          return password.value;       
        }

    return null;
}

// Utils to get a proxy on UI thread : don't freeze the UI will performing the search
function sndfmtldap_getProxyOnUIThread(aObject, aInterface) {
    var eventQSvc = Components.classes["@mozilla.org/event-queue-service;1"].getService(Components.interfaces.nsIEventQueueService);
    var uiQueue = eventQSvc.getSpecialEventQueue(Components.interfaces.nsIEventQueueService.UI_THREAD_EVENT_QUEUE);
    var proxyMgr = Components.classes["@mozilla.org/xpcomproxy;1"].getService(Components.interfaces.nsIProxyObjectManager);
    
    return proxyMgr.getProxyForObject(uiQueue, aInterface, aObject, 5); // 5 == PROXY_ALWAYS | PROXY_SYNC
}

// Launch the LDAP search
function sndfmtldap_kickOffSearch() {
    try {
        // Build the search query
        var prefix1 = "";
        var suffix1 = "";
        var prefix2 = "";
        var suffix2 = "";
        
        // Build the optional URL filter
        var urlFilter = sndfmtldap_LdapServerURL.filter;
        if (urlFilter != null && urlFilter.length > 0 && urlFilter != "(objectclass=*)") {
            if (urlFilter[0] == '(') {
                prefix1 = "(&" + urlFilter;
            } else {
                prefix1 = "(&(" + urlFilter + ")";
            }
            suffix1 = ")";
        }
        
         // Build the mail criterion
        var arrayOfRecipients = sndfmtldap_FilteredRecipients.split(",");
        var nbRecipients = arrayOfRecipients.length;
        if (nbRecipients > 1) {
            prefix2 = "(|";
            suffix2 = ")";
        }

        var mailFilter = "";
        for (var i = 0; i < nbRecipients; i++) {
            mailFilter += "(mail=" + arrayOfRecipients[i] + ")";
        }

        // Concat the search query
        var filter = prefix1 + prefix2 + mailFilter + suffix2 + suffix1;
        
        // Build the array of attributes to look for
        var wanted_attributes = ["mail"].concat(sndfmtldap_ArrayOfAttributes_IsHTMLSupported);

        // Launch the LDAP search
        sndfmtldap_initNewLDAPOperation();
        sndfmtldap_LdapOperation.searchExt(
            sndfmtldap_LdapServerURL.dn,
            sndfmtldap_LdapServerURL.scope,
            filter,
            wanted_attributes.length,
            wanted_attributes,
            0,
            nbRecipients); // Max search results
            
    } catch (e) {
        dump(e + " exception when searching on ldap\n");
        window.close();
    }
}

// Handle the search result LDAP message.
// If recipient supports HTML format remove his mail from the list
function sndfmtldap_handleSearchResultMessage(aMessage) {
    
    var outSize = new Object();
    var attributesFound = aMessage.getAttributes(outSize);

    // For each LDAP attribute to look for   
    for (var i = 0; i < sndfmtldap_ArrayOfAttributes_IsHTMLSupported.length; i++) {
    
        // If attribute has not been returned, try with the next attribute
        if (attributesFound.indexOf(sndfmtldap_ArrayOfAttributes_IsHTMLSupported[i]) == -1) {
            continue;
        }

        // Check if this recipient support HTML format
        var isHTMLValue = aMessage.getValues(sndfmtldap_ArrayOfAttributes_IsHTMLSupported[i], outSize);        
        // If this recipient support HTML format
        if (isHTMLValue && outSize.value > 0 && isHTMLValue[0] != null && isHTMLValue[0].toLowerCase() == 'true') {
        
            // Remove recipient's mail from recipients list
            var mailValue = aMessage.getValues("mail", outSize);
            if (mailValue && outSize.value > 0) {
                var arrayOfRecipients = sndfmtldap_FilteredRecipients.split(",");
                sndfmtldap_FilteredRecipients = "";
                
                var nbRecipients = arrayOfRecipients.length;
                for (var i = 0; i < nbRecipients; i++) {
                    if (arrayOfRecipients[i] != mailValue[0]) {
                        if (sndfmtldap_FilteredRecipients != "") {
                        	sndfmtldap_FilteredRecipients += ",";
                        }
                        sndfmtldap_FilteredRecipients += arrayOfRecipients[i];
                    }
                }

                // Return list
                window.arguments[0][0] = sndfmtldap_FilteredRecipients;
                
                trustedBird_dump("sndfmtldap_handleSearchResultMessage: noHtmlRecipients = " + sndfmtldap_FilteredRecipients);
                
                // Exit loop because recipient has been found
                break;
            }
        }
    }
}
