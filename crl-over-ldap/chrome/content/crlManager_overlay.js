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
 *   Eric Ballet Baz / BT Global Services / Etat francais Ministere de la Defense
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

/* Add-on hook: replace the original function */
function ImportCRL() {
	// prompt for the URL to import from
	var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
	
	var CRLLocation = {value:null};
	var dummy = { value: 0 };
	var strBundle = document.getElementById('pippki_bundle');
	var addCRL = promptService.prompt(window, strBundle.getString('crlImportNewCRLTitle'), 
		strBundle.getString('crlImportNewCRLLabel'),  CRLLocation, null, dummy);
	
	if (addCRL) {
		/* Check if this is a LDAP URL */
		if (CRLLocation.value && CRLLocation.value.indexOf("ldap://") == 0) {
			openLdapCrlFetchDialog(CRLLocation.value);
		} else {
			crlManager.updateCRLFromURL(CRLLocation.value, "");
		}
	}
}

/* Add-on hook: replace the original function */
function UpdateCRL() {
	var crlEntry;
	var crltree = document.getElementById("crltree");
	var i = crltree.currentIndex;
	if(i<0){
		return;
	}
	crlEntry = crls.queryElementAt(i, nsICRLInfo);

	/* Check if this is a LDAP URL */
	if (crlEntry.lastFetchURL && crlEntry.lastFetchURL.indexOf("ldap://") == 0) {
		openLdapCrlFetchDialog(crlEntry.lastFetchURL);
	} else {
		crlManager.updateCRLFromURL(crlEntry.lastFetchURL, crlEntry.nameInDb);
	}
}

/* Add-on hook: replace the original function */
document.getElementById("deleteCrl").setAttribute("oncommand", "DeleteCrlSelected_ldap();");
function DeleteCrlSelected_ldap() {
	var crlEntry;
	
	// delete selected item
	var crltree = document.getElementById("crltree");
	var i = crltree.currentIndex;
	if(i<0){
		return;
	}
	crlEntry = crls.queryElementAt(i, nsICRLInfo);
	  
	var id = crlEntry.nameInDb;
	
	try {
		prefBranch.clearUserPref("security.crl.autoupdate.enableLdap." + id);
	} catch(e) {}
	
	/* Call original function */
	DeleteCrlSelected();
}

function openLdapCrlFetchDialog(ldapURI) {
    window.openDialog(
		'chrome://crl_over_ldap/content/ldapCrlFetchDialog.xul',
		'ldapCrlFetchDialog',
		'chrome,resizable=0,modal=1,dialog=1',
		ldapURI
    );
}
