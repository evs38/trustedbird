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
var gCurrentAutocompleteDirectoryList;
var gLDAPSessions;
var gLDAPSessionList;
var gSessionsAdded;
var bActiveDump;

// Replace the built in ComposeLoad function with our own...
var multildap_OriginalComposeLoad = ComposeLoad;
ComposeLoad = function multildap_ComposeLoad() {
	// Enable display of source address book in autocomplete popup
	trustedBird_prefService_setIntPref("mail.autoComplete.commentColumn", 1);

	// Call built in ComposeLoad function
	multildap_OriginalComposeLoad();

	trustedBird_dump("ComposeLoad Multi-LDAP done.");
}

// Replace the built in InitializeGlobalVariables function with our own...
var multildap_OriginalInitializeGlobalVariables = InitializeGlobalVariables;
InitializeGlobalVariables = function multildap_InitializeGlobalVariables() {

    // Call built in InitializeGlobalVariables function
    multildap_OriginalInitializeGlobalVariables();

    gCurrentAutocompleteDirectoryList = null;
    gLDAPSessionList = null;
    gSessionsAdded = new Array();
}

InitializeGlobalVariables();

// Replace the built in ReleaseGlobalVariables function with our own...
var multildap_OriginalReleaseGlobalVariables = ReleaseGlobalVariables;
ReleaseGlobalVariables = function multildap_ReleaseGlobalVariables() {

    // Call built in ReleaseGlobalVariables function
    multildap_OriginalReleaseGlobalVariables();

    gCurrentAutocompleteDirectoryList = null;
    gLDAPSessionList = null;
    gSessionsAdded = null;
}

function AddDirectorySettingsObserver(autocompleteDirectoryList) {
	for(var i = 0; i < autocompleteDirectoryList.length; i++){
		trustedBird_prefService_addObserver(autocompleteDirectoryList[i], directoryServerObserver, false);
		trustedBird_dump("\tAddDirectorySettingsObserver='" + autocompleteDirectoryList[i] + "'.");
	}
}

function RemoveDirectorySettingsObserver(autocompleteDirectoryList) {
	for(var i = 0; i < autocompleteDirectoryList.length; i++){
		trustedBird_prefService_removeObserver(autocompleteDirectoryList[i], directoryServerObserver);
		trustedBird_dump("\tRemoveDirectorySettingsObserver='" + autocompleteDirectoryList[i] + "'.");
	}
}

function setupLdapAutocompleteSession() {
    var prevAutocompleteDirectoryList = gCurrentAutocompleteDirectoryList;
    var directoryNb = 0;

  	var autocompleteDirectoryList = trustedBird_LDAP_getDirectoryList(gCurrentIdentity.key);
  	trustedBird_dump("\tautocompleteDirectoryList = " + autocompleteDirectoryList);
	
    // Stop if there is no directory
    if (autocompleteDirectoryList.length == 0) return;

	directoryNb = autocompleteDirectoryList.length;

	
	// Get autoComplete.minStringLength and autoComplete.cjkMinStringLength

    // don't search on non-CJK strings shorter than this
	var minStringLength = 0;
   	var tempMinStringLength = trustedBird_prefService_getIntPref("ldap_2.autoComplete.minStringLength");
   	if (tempMinStringLength >= 1 && tempMinStringLength <= 99) minStringLength = tempMinStringLength;

    if (trustedBird_prefService_getBoolPref("mail.identity." + gCurrentIdentity.key + ".overrideGlobal_Pref.multi-ldap")) {
       	var tempMinStringLength = trustedBird_prefService_getIntPref("mail.identity." + gCurrentIdentity.key + ".autoComplete.minStringLength");
       	if (tempMinStringLength >= 1 && tempMinStringLength <= 99) minStringLength = tempMinStringLength;
    }
    
    // don't search on CJK strings shorter than this
	var cjkMinStringLength = 0;
   	var tempCjkMinStringLength = trustedBird_prefService_getIntPref("ldap_2.autoComplete.cjkMinStringLength");
   	if (tempCjkMinStringLength >= 1 && tempCjkMinStringLength <= 99) cjkMinStringLength = tempCjkMinStringLength;

    if (trustedBird_prefService_getBoolPref("mail.identity." + gCurrentIdentity.key + ".overrideGlobal_Pref.multi-ldap")) {
       	var tempCjkMinStringLength = trustedBird_prefService_getIntPref("mail.identity." + gCurrentIdentity.key + ".autoComplete.cjkMinStringLength");
       	if (tempCjkMinStringLength >= 1 && tempCjkMinStringLength <= 99) cjkMinStringLength = tempCjkMinStringLength;
    }
    
    // use a temporary to do the setup so that we don't overwrite the
    // global, then have some problem and throw an exception, and leave the
    // global with a partially setup session.  we'll assign the temp
    // into the global after we're done setting up the session
    //
    var LDAPSessions = new Array();
    var LDAPSession;
    if (gLDAPSessionList) {
       LDAPSessions = gLDAPSessionsList;
    } else {
        for (var i = 0; i < directoryNb; i++){
	        LDAPSession = Components
	            .classes["@mozilla.org/autocompleteSession;1?type=ldap"];
	        if (LDAPSession) {
	          try {
	            LDAPSession = LDAPSession.createInstance()
	                .QueryInterface(Components.interfaces.nsILDAPAutoCompleteSession);
	          } catch (ex) {dump ("ERROR: Cannot get the LDAP autocomplete session\n" + ex + "\n");}
	        }
	        LDAPSessions.push(LDAPSession);
        }
    }

    if (autocompleteDirectoryList && !gIsOffline) { 
        // Add observer on the directory server we are autocompleting against
        // only if current server is different from previous.
        // Remove observer if current server is different from previous       
        gCurrentAutocompleteDirectoryList = autocompleteDirectoryList;
        if (prevAutocompleteDirectoryList) {
          if (prevAutocompleteDirectoryList != gCurrentAutocompleteDirectoryList) { 
            RemoveDirectorySettingsObserver(prevAutocompleteDirectoryList);
            AddDirectorySettingsObserver(gCurrentAutocompleteDirectoryList);
          }
        }
       	else
          AddDirectorySettingsObserver(gCurrentAutocompleteDirectoryList);

        // fill in the session params if there is a session
        //
        if (LDAPSessions) {
        for (var k = 0; k < directoryNb; k++){
        	var LDAPSession = LDAPSessions[k];
            var serverURL = Components.classes[
                "@mozilla.org/network/ldap-url;1"].
                createInstance().QueryInterface(
                    Components.interfaces.nsILDAPURL);

            serverURL.spec = trustedBird_prefService_getComplexPref(autocompleteDirectoryList[k] + ".uri", Components.interfaces.nsISupportsString);
            LDAPSession.serverURL = serverURL;

            // get the login to authenticate as, if there is one
            var login = trustedBird_prefService_getComplexPref(autocompleteDirectoryList[k] + ".auth.dn", Components.interfaces.nsISupportsString);

            // set the LDAP protocol version
            var protocolVersion = trustedBird_prefService_getCharPref(autocompleteDirectoryList[k] + ".protocolVersion");
            if (protocolVersion == "2") LDAPSession.version = Components.interfaces.nsILDAPConnection.VERSION2;

            // find out if we need to authenticate, and if so, tell the LDAP
            // autocomplete session how to prompt for a password.  This window
            // (the compose window) is being used to parent the authprompter.
            //
            LDAPSession.login = login;
            if (login != "") {
                var windowWatcherSvc = Components.classes[
                    "@mozilla.org/embedcomp/window-watcher;1"]
                    .getService(Components.interfaces.nsIWindowWatcher);
                var domWin = 
                    window.QueryInterface(Components.interfaces.nsIDOMWindow);
                var authPrompter = 
                    windowWatcherSvc.getNewAuthPrompter(domWin);

                LDAPSession.authPrompter = authPrompter;
            }

            // don't search on non-CJK strings shorter than this
            if (minStringLength > 0) LDAPSession.minStringLength = minStringLength;
            
            // don't search on CJK strings shorter than this
            if (cjkMinStringLength > 0) LDAPSession.cjkMinStringLength = cjkMinStringLength;

            // we don't try/catch here, because if this fails, we're outta luck
            //
            var ldapFormatter = Components.classes[
                "@mozilla.org/ldap-autocomplete-formatter;1?type=addrbook"]
                .createInstance().QueryInterface(
                    Components.interfaces.nsIAbLDAPAutoCompFormatter);

            // override autocomplete name format?
            var nameFormat = trustedBird_prefService_getComplexPref(autocompleteDirectoryList[k] + ".autoComplete.nameFormat", Components.interfaces.nsISupportsString);
            if (nameFormat != "") ldapFormatter.nameFormat = nameFormat;
            
            // override autocomplete mail address format?
           	var addressFormat = trustedBird_prefService_getComplexPref(autocompleteDirectoryList[k] + ".autoComplete.addressFormat", Components.interfaces.nsISupportsString);
           	if (addressFormat != "") ldapFormatter.addressFormat = addressFormat;

           	
           	var sPrefs = trustedBird_prefService_getBranch();
           	
            try {
                // figure out what goes in the comment column, if anything
                //
                // 0 = none
                // 1 = name of addressbook this card came from
                // 2 = other per-addressbook format
                //
                var showComments = 0;
                showComments = sPrefs.getIntPref("mail.autoComplete.commentColumn");

                switch (showComments) {

                case 1:
                    // use the name of this directory
                    //
                    ldapFormatter.commentFormat = sPrefs.getComplexValue(
                                autocompleteDirectoryList[k] + ".description",
                                Components.interfaces.nsISupportsString).data;
                    break;

                case 2:
                    // override ldap-specific autocomplete entry?
                    //
                    try {
                        ldapFormatter.commentFormat = 
                            sPrefs.getComplexValue(autocompleteDirectoryList[k] + 
                                        ".autoComplete.commentFormat",
                                        Components.interfaces.nsISupportsString).data;
                    } catch (innerException) {
                        // if nothing has been specified, use the ldap
                        // organization field
                        ldapFormatter.commentFormat = "[o]";
                    }
                    break;

                case 0:
                default:
                    // do nothing
                }
            } catch (ex) {
                // if something went wrong while setting up comments, try and
                // proceed anyway
            }

            // set the session's formatter, which also happens to
            // force a call to the formatter's getAttributes() method
            // -- which is why this needs to happen after we've set the
            // various formats
            //
            LDAPSession.formatter = ldapFormatter;

            // override autocomplete entry formatting?
            //
            try {
                LDAPSession.outputFormat = 
                    sPrefs.getComplexValue(autocompleteDirectoryList[k] + 
                                      ".autoComplete.outputFormat",
                                      Components.interfaces.nsISupportsString).data;

            } catch (ex) {
                // if this pref isn't there, no big deal.  just let
                // nsLDAPAutoCompleteSession use its default.
            }

            // override default search filter template?
            //
            try { 
                LDAPSession.filterTemplate = sPrefs.getComplexValue(
                    autocompleteDirectoryList[k] + ".autoComplete.filterTemplate",
                    Components.interfaces.nsISupportsString).data;

            } catch (ex) {
                // if this pref isn't there, no big deal.  just let
                // nsLDAPAutoCompleteSession use its default
            }

            // override default maxHits (currently 100)
            //
            try { 
                // XXXdmose should really use .autocomplete.maxHits,
                // but there's no UI for that yet
                // 
                LDAPSession.maxHits = 
                    sPrefs.getIntPref(autocompleteDirectoryList[k] + ".maxHits");
            } catch (ex) {
                // if this pref isn't there, or is out of range, no big deal. 
                // just let nsLDAPAutoCompleteSession use its default.
            }

            if (!gSessionsAdded[k]) {
                // if we make it here, we know that session initialization has
                // succeeded; add the session for all recipients, and 
                // remember that we've done so
                var autoCompleteWidget;
                for (var i = 1; i <= awGetMaxRecipients(); i++)
                {
                    autoCompleteWidget = document.getElementById("addressCol2#" + i);
                    if (autoCompleteWidget)
                    {
                      autoCompleteWidget.addSession(LDAPSession);
                      // ldap searches don't insert a default entry with the default domain appended to it
                      // so reduce the minimum results for a popup to 2 in this case. 
                      autoCompleteWidget.minResultsForPopup = 2;

                    }
                 }
                gSessionsAdded[k]=true;
            }
           }
        }
    } else {
      if (gCurrentAutocompleteDirectoryList) {
        // Remove observer on the directory server since we are not doing Ldap
        // autocompletion.
        RemoveDirectorySettingsObserver(gCurrentAutocompleteDirectoryList);
        gCurrentAutocompleteDirectoryList = null;
      }
      if (gLDAPSessions) {
        
        for (var k = 0; k < gLDAPSessions.Length; k++){  
            if (gSessionsAdded[k]){
                  for (var i = 1; i <= awGetMaxRecipients(); i++) 
                        document.getElementById("addressCol2#" + i).
                        removeSession(gLDAPSessions[k]);
                        gSessionsAdded[k] = false;
            }
      }
      }
    }

    gLDAPSessions = LDAPSessions;
    gSetupLdapAutocomplete = true;
}
