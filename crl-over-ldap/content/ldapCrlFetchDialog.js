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


var jsLoader =  Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
jsLoader.loadSubScript("chrome://crl_over_ldap/content/ldapCrlAutoUpdateManager.js");

var stringBundleService = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
stringBundle = stringBundleService.createBundle("chrome://crl_over_ldap/locale/ldapCrlFetchDialog.properties");


/* Entry point: launched by window onload */
function ldapCrlFetchDialogOnLoad() {
	/* Get URL from window parameter */
	var url = window.arguments[0];
	
	if (url != null) {
		var ldapQuery = new trustedBird_ldapQuery();
		if (!ldapQuery.launch(url, ldapCrlFetchDialogEnd, null, ldapCrlFetchDialogHandleLdapMessage, url)) {
			trustedBird_dump("Error launching LDAP query " + url);
			alert(stringBundle.GetStringFromName("ldapcrlfetchdialog.error.url"));
			window.close();
		}
	}
}

function ldapCrlFetchDialogOnCancel() {
	window.close();
}

function ldapCrlFetchDialogEnd(aError) {
	if (aError != trustedBird_ldapQuery.NO_ERROR) {
		var errorMessage;
		switch (aError) {
			case trustedBird_ldapQuery.CONNECT_ERROR:
				errorMessage = stringBundle.GetStringFromName("ldapcrlfetchdialog.error.connect");
				break;
			case trustedBird_ldapQuery.SEARCH_ERROR:
				errorMessage = stringBundle.GetStringFromName("ldapcrlfetchdialog.error.search");
				break;
			case trustedBird_ldapQuery.DATA_ERROR:
				errorMessage = stringBundle.GetStringFromName("ldapcrlfetchdialog.error.data");
				break;
		}
		if (errorMessage != "") alert(errorMessage);
	}
	window.close();
}

function ldapCrlFetchDialogHandleLdapMessage(aLdapURL, aLdapMessage, aNameInDb) {
	return importCrlFromLdapMessage(aLdapURL, aLdapMessage, aNameInDb, false);
}
