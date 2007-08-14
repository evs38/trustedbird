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

// URL of the window dialog to call
const CRL_OVER_LDAP_CRL_FETCHING_DIALOG_WINDOW_URL = 'chrome://crl_over_ldap/content/crlFetchingStatuts.xul';

// Extension Hook : replace the built in ImportCRL function with our own ...
function ImportCRL()
{
  // prompt for the URL to import from
  var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
  
  var CRLLocation = {value:null};
  var dummy = { value: 0 };
  var strBundle = document.getElementById('pippki_bundle');
  var addCRL = promptService.prompt(window, strBundle.getString('crlImportNewCRLTitle'), 
                                    strBundle.getString('crlImportNewCRLLabel'),  CRLLocation, null, dummy);

  if (addCRL) {
    // If import from LDAP is requested, jump to our new handler
    if (CRLLocation.value && CRLLocation.value.indexOf("ldap://") == 0)
        crl_over_ldap_importCRLFromLDAP(CRLLocation.value);
    
    // Else jump to default mechanism
    else 
      crlManager.updateCRLFromURL(CRLLocation.value, "");
  }
}

// Extension Hook : replace the built in UpdateCRL function with our own ...
function UpdateCRL()
{
  var crlEntry;
  var crltree = document.getElementById("crltree");
  var i = crltree.currentIndex;
  if(i<0){
    return;
  }
  crlEntry = crls.queryElementAt(i, nsICRLInfo);

  // If import from LDAP is requested, jump to our new handler
  if (crlEntry.lastFetchURL && crlEntry.lastFetchURL.indexOf("ldap://") == 0)
    crl_over_ldap_importCRLFromLDAP(crlEntry.lastFetchURL);

  // Else jump to default mechanism
  else
    crlManager.updateCRLFromURL(crlEntry.lastFetchURL, crlEntry.nameInDb);
}

function crl_over_ldap_importCRLFromLDAP(ldapURI) {

    var ldapURL = Components.classes["@mozilla.org/network/ldap-url;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPURL);
    try {
        ldapURL.spec = ldapURI;
    } catch (e) {
        alert(e + " exception when creating ldap connection\n");
    }

    // Use an array to pass the argument to the dialog window
    // in order to be able to return a modified value
    var crl_bytes = null;
    var crl_length = 0;
    var argHolder = [ldapURL, crl_bytes, crl_length];

    // Open the dialog window that will block the user until fectching from LDAP is done
    window.openDialog(
        CRL_OVER_LDAP_CRL_FETCHING_DIALOG_WINDOW_URL,
        'crl_over_ldap_crlFetchingStatuts', // Dummy name
        'chrome,resizable=0,modal=1,dialog=1', // Modal: block user
        argHolder
    );

    // Fetch the CRL's datas from the dialog window
    crl_bytes = argHolder[1];
    crl_length = argHolder[2];

    // CRL has been found in LDAP, import it in local storage
    if (crl_bytes) {
        // Import CRL
        crlManager.importCrl(crl_bytes, crl_length.value, ldapURL, 1, false, ldapURI);

    } else {
        alert("No CRL found");
    }
}
