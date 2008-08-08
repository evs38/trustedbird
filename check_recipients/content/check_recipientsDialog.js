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

// Global variables and constants.


const kPersonalAddressbookUri        = "moz-abmdbdirectory://abook.mab";
const kRDFServiceContractID          = "@mozilla.org/rdf/rdf-service;1";

// User preference defining LDAP servers.
const CHECK_RECIPIENTS_PREF_LDAP_SERVERS = "ldap_2.autoComplete.ldapServers";
var check_recipients_ldapServersArray = new Array();

// The following variables are needed by the LDAP asynchronous calls.
var check_recipients_LdapServerURL;
var check_recipients_LdapServerName;
var check_recipients_LdapConnection;
var check_recipients_LdapOperation;
var check_recipients_Login;

var gPersonalAddressBookDirectory; // used for determining if we want to show just the display name in email address nodes

// Set to true to activate traces in console
var bActiveDump = false;

// List of emails
var check_recipients_listEmails = new Array();

// Initialize fields on onload 
function check_recipients_onLoadDialog() {

	// Retrieve LDAP attributes from user preferences
	var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	var prefs = prefService.getBranch(null);
	//Initialize console traces
	bActiveDump = prefs.getBoolPref("javascript.options.showInConsole");

    var recipientsList = document.getElementById('check_recipients_recipientsList');
    
	displayTrace("check_recipients_onLoadDialog begin." );
    var msgCompFields = window.opener.gMsgCompose.compFields;
    if (msgCompFields) {
        window.opener.Recipients2CompFields(msgCompFields);
        var bListEmpty = true;
        var recipients = msgCompFields.to + "," + msgCompFields.cc + "," + msgCompFields.bcc;
        var recipientsArray = recipients.split(",");
        for (var i = 0; i < recipientsArray.length; i++) {
            if (recipientsArray[i]) {
                var email = check_recipients_substring(recipientsArray[i], "<", ">");
				displayTrace("\tAdd recipient '" + email + "'." );
                if (check_recipients_listEmails.indexOf(email) != -1) {
                    continue;
                }
                var isEmailValid = check_recipients_isEmail(email);
                
		        /* Create the following XUL format
					<listitem>
						<listcell label="mail address" />
						<listcell>
							<image id="user2@test.milimail.org" class="check_recipients_searching" />
							<label id="user2@test.milimail.org" value="LDAP" />
						</listcell>
					</listitem>
				*/
                var row = document.createElement("listitem");
                var cell1 = document.createElement("listcell");
                cell1.setAttribute("label", recipientsArray[i]);
				displayTrace("\tSet cellule label '" + recipientsArray[i] + "'." );
                row.appendChild(cell1);

                var cell2 = document.createElement("listcell");		
                var image = document.createElement("image");
                var textlabel = document.createElement("label");
                if (isEmailValid) {
                    image.setAttribute("class", "check_recipients_searching");
                    image.setAttribute("id", email);
					textlabel.setAttribute("value", "Searching" );
                    textlabel.setAttribute("id", "textlabel_" + email);
                    check_recipients_listEmails.push(email);
                } else {
                    image.setAttribute("class", "check_recipients_notfound");
					textlabel.setAttribute("value", "----" );
				}
                cell2.appendChild(image);
                cell2.appendChild(textlabel);
                row.appendChild(cell2);

                recipientsList.appendChild(row);
				bListEmpty = false;
            }
        }
        
		//Disable progressmeter if no contact to check
		var progressmeter = document.getElementById("check_recipient_extended_progressmeter");
		if (progressmeter && bListEmpty == true) {
			progressmeter.setAttribute("hidden", "true");
		}
		
		//Retrieve ldap server list
		try {
			var ldapServersPref = prefs.getCharPref(CHECK_RECIPIENTS_PREF_LDAP_SERVERS);
			if (ldapServersPref) {
				check_recipients_ldapServersArray = ldapServersPref.split(',');
			}
		} catch (e) {
		}

		// Init and process the LDAP search
        if (!bListEmpty) setTimeout(check_recipients_initLDAPAndSearch, 1);
    }
	displayTrace("check_recipients_onLoadDialog ended." );
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
			displayTrace("onLDAPInit begin");
            check_recipients_initNewLDAPOperation();
			displayTrace("\tConnection=" + check_recipients_LdapOperation.connection);
            check_recipients_LdapOperation.simpleBind(check_recipients_getPassword());
			displayTrace("onLDAPInit ended.");
        } catch (e) {
            //alert("Exception when binding to ldap: " + e);
        	
        	check_recipients_stringbundle = document.getElementById('check_recipients_stringbundle');
        	alert(check_recipients_stringbundle.getString("ldap_connect_error")+" "+check_recipients_LdapServerName);
        	
        	// Continue the search on other LDAP servers/Local
            if (check_recipients_ldapServersArray.length > 0) {
                check_recipients_initLDAPAndSearch();
            } else {
            	check_recipients_local_updateUI();
            }
        }
    },

    // LDAP message has been received
    onLDAPMessage: function(aMessage) {
        
		displayTrace("onLDAPMessage begin message = " + aMessage );
         // Search is done
        if (Components.interfaces.nsILDAPMessage.RES_SEARCH_RESULT == aMessage.type) {
			displayTrace("\tmessage =RES_SEARCH_RESULT" );
            // Is there any other ldap to search on ?
            if (check_recipients_ldapServersArray.length > 0) {
                check_recipients_initLDAPAndSearch();
            } else {
				displayTrace("\tNo more LDAP server to check." );

				check_recipients_local_updateUI();
				
				displayTrace("onLDAPMessage ended.");
            }
            return;
        }

        // Binding is done
        if (Components.interfaces.nsILDAPMessage.RES_BIND == aMessage.type) {
			displayTrace("\tmessage =RES_BIND" );
            if (Components.interfaces.nsILDAPErrors.SUCCESS != aMessage.errorCode) {
                alert("Error with code " + aMessage.errorCode + " when binding to ldap");
            } else {
                // Kick off search ...
                check_recipients_kickOffSearch();
            }
			displayTrace("onLDAPMessage ended.");
            return;
        }

        // One search result has been received
        if (Components.interfaces.nsILDAPMessage.RES_SEARCH_ENTRY == aMessage.type) {
			displayTrace("\tmessage =RES_SEARCH_ENTRY" );

            check_recipients_handleSearchResultMessage(aMessage);
			displayTrace("onLDAPMessage ended.");

            return;
        }
		displayTrace("\tmessage =" + aMessage.type);

		displayTrace("onLDAPMessage ended.");
    }
}

function check_recipients_local_updateUI() {
    var progressmeter = document.getElementById("check_recipient_extended_progressmeter");
    if (progressmeter) {
        progressmeter.setAttribute("hidden", "true");
    }
    var images = document.getElementsByTagName("image");
    var textlabel = document.getElementsByTagName("label");
    for (var i = 0; i < images.length; i++) {
		displayTrace("\tImage attribute class =" + images[i].getAttribute("class") );
        if (images[i].getAttribute("class") == "check_recipients_searching") {
			var email = images[i].getAttribute("id");
			if (check_recipients_IsEmailInDataBase(email)){
				images[i].setAttribute("class", "check_recipients_found");
                images[i].setAttribute("id", email);
				
				var	finalLabel = "Local";
				var label = textlabel[i].getAttribute("value");
	            if (label != "Searching") {
					finalLabel = finalLabel + ", " + label;
				}
				textlabel[i].setAttribute("value", finalLabel );
                textlabel[i].setAttribute("id", "textlabel_" + email);
				}
			else{
				images[i].setAttribute("class", "check_recipients_notfound");
				textlabel[i].setAttribute("value", "----" );
			}
        } else {
            if (images[i].getAttribute("class") == "check_recipients_found") {
				var email = images[i].getAttribute("id");
				if (check_recipients_IsEmailInDataBase(email)){
					textlabel[i].setAttribute("value", "Local, " + textlabel[i].getAttribute("value") );
                    textlabel[i].setAttribute("id", "textlabel_" + email);
					}
            }
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

	displayTrace( "check_recipients_initLDAPAndSearch begin.");

    // Get the login to authenticate as, if there is one
    var directoryPref = check_recipients_ldapServersArray.pop();

    if (!directoryPref) {
	
		var progressmeter = document.getElementById("check_recipient_extended_progressmeter");
		if (progressmeter) {
			progressmeter.setAttribute("hidden", "true");
		}
		var images = document.getElementsByTagName("image");
        var textlabel = document.getElementsByTagName("label");
		for (var i = 0; i < images.length; i++) {
			if (images[i].getAttribute("class") == "check_recipients_searching") {
				var email = images[i].getAttribute("id");
				if (check_recipients_IsEmailInDataBase(email)){
					images[i].setAttribute("class", "check_recipients_found");
					images[i].setAttribute("id", email);
					textlabel[i].setAttribute("value", "Local" );
					textlabel[i].setAttribute("id", "textlabel_" + email);
				}else{
					images[i].setAttribute("class", "check_recipients_notfound");
					textlabel[i].setAttribute("value", "----" );
				}
			}
		}
	
		displayTrace( "check_recipients_initLDAPAndSearch ended : No directory found.");
        return;
    }

    // Retrieve LDAP attributes from user preferences
    var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    var prefs = prefService.getBranch(null);

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
		check_recipients_LdapServerName = prefs.getCharPref(".description");
		displayTrace( 	"\tCheck recipient on LDAP=" + check_recipients_LdapServerName + 
						" Host=" + check_recipients_LdapServerURL.asciiHost +
						" URL=" + check_recipients_LdapServerURL.spec);
		
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
		if( check_recipients_LdapConnection.errorString ){
			displayTrace( "\t\tERROR ==> nsILDAPConnection=" + check_recipients_LdapConnection.errorString);
		}	
	} catch (e) {
		alert("Exception when creating ldap connection:" + e);
    }
	displayTrace( "check_recipients_initLDAPAndSearch ended.");
}

function check_recipients_IsEmailInDataBase(email)
{
	displayTrace("\tcheck_recipients_IsEmailInDataBase begin.");
	if (!gPersonalAddressBookDirectory)
	{
		var RDFService = Components.classes[kRDFServiceContractID].getService(Components.interfaces.nsIRDFService); 
		gPersonalAddressBookDirectory = RDFService.GetResource(kPersonalAddressbookUri).QueryInterface(Components.interfaces.nsIAbMDBDirectory);

		if (!gPersonalAddressBookDirectory){
			displayTrace("\tcheck_recipients_IsEmailInDataBase ended with ERROR gPersonalAddressBookDirectory = " + gPersonalAddressBookDirectory);
			return false;
		}
	}
	// look up the email address in the database
	var bIsPresent = gPersonalAddressBookDirectory.hasCardForEmailAddress(email);
	displayTrace("\t\tIsEmailInDataBase '" + email + "' in local address book = " + bIsPresent +".");
	displayTrace("\tcheck_recipients_IsEmailInDataBase ended.");
	return bIsPresent;
}

// Init a new LDAP operation Object
function check_recipients_initNewLDAPOperation()
{
	displayTrace("\tcheck_recipients_initNewLDAPOperation begin.");
    check_recipients_LdapOperation = 
        Components.classes["@mozilla.org/network/ldap-operation;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPOperation);

    check_recipients_LdapOperation.init(
        check_recipients_LdapConnection,
        check_recipients_getProxyOnUIThread(check_recipients_LDAPMessageListener, Components.interfaces.nsILDAPMessageListener), null);
	displayTrace("\tcheck_recipients_initNewLDAPOperation ended.");
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

    return proxyMgr.getProxyForObject(uiQueue, aInterface, aObject, 5); // 5 == PROXY_ALWAYS | PROXY_SYNC;
}

// Launch the LDAP search
function check_recipients_kickOffSearch() {
    try {
        // Build the search query
        var prefix1 = "";
        var suffix1 = "";
        var prefix2 = "";
        var suffix2 = "";

		displayTrace("check_recipients_kickOffSearch begin.");
		
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

		displayTrace("check_recipients_kickOffSearch ended.");        
    } catch (e) {
        alert("Exception when searching on ldap: " + e);
    }
}

// Handle the search result LDAP message.
function check_recipients_handleSearchResultMessage(aMessage) {

	displayTrace("check_recipients_handleSearchResultMessage begin.");
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
			displayTrace( "\t" + mailValue + " found in ldap " + check_recipients_LdapServerName );
        }
        var textlabel = document.getElementById("textlabel_" + mailValue);
        if (textlabel) {
			var label = textlabel.getAttribute("value");
            if (label == "Searching") {
				label = "";
			} else {
				label = label + ", ";
			}
			label = label + check_recipients_LdapServerName;
			displayTrace( "\tLDAP name=" + check_recipients_LdapServerName );
			textlabel.setAttribute("value", label );
        }
    }
	displayTrace("check_recipients_handleSearchResultMessage ended.");
}

// Display trace in console if bActiveDump is set to true
function displayTrace(pMessage) {
	if( bActiveDump == false )
		return;
	dump(pMessage + "\n");
}
