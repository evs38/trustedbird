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

/*
 * This module manages auto-update of LDAP CRLs.
 * It is launched in a hidden window to prevent memory and CPU usage leaks.
 * It fetches CRLs from LDAP directories and import them in the database.
 */

var jsLoader =  Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
jsLoader.loadSubScript("chrome://crl_over_ldap/content/ldapCrlManager.js");


/**
 * Update all LDAP CRL already in database
 * - check if update is needed for all CRLs with LDAP URLs
 * - query LDAP directories
 * - import updated CRL in database
 */
function ldapCrlAutoUpdateManagerOnLoad() {
	trustedBird_dump("ldapCrlAutoUpdateManagerOnLoad");
	
	var crlManager = Components.classes["@mozilla.org/security/crlmanager;1"].getService(Components.interfaces.nsICRLManager);
	var crls = crlManager.getCrls();
	
	var queryLaunched = false;
	
	for (var i = 0; i < crls.length; i++) {
		var crlEntry = crls.queryElementAt(i, Components.interfaces.nsICRLInfo);
		
		/*
		 * Mozilla/NSS bug 371522 temporary workaround until fix is integrated into NSS
		 * Verify all URLs prefs and replace them with their copy if empty
		 * (LDAP URLs and HTTP/FTP ones)
		 */
		var currentUrl;
		var urlCopy;
		currentUrl = trustedBird_prefService_getCharPref("security.crl.autoupdate.url." + crlEntry.nameInDb);
		if (currentUrl == "") {
			var urlCopy = trustedBird_prefService_getCharPref("security.crl.autoupdate.urlCopy." + crlEntry.nameInDb);
			if (urlCopy != "") {
				trustedBird_dump("Fixing URL for CRL \"" + crlEntry.nameInDb + "\" (see Mozilla/NSS bug 371522)");
				trustedBird_prefService_setCharPref("security.crl.autoupdate.url." + crlEntry.nameInDb, urlCopy);
			}
		}
		
		
		var ldapAutoUpdateEnabledString = "security.crl.autoupdate.enableLdap." + crlEntry.nameInDb;
		
		if (trustedBird_prefService_getBoolPref(ldapAutoUpdateEnabledString)) {
			/* Compute difference between current time and nextInstant preference value */
			var nextInstant = trustedBird_prefService_getCharPref("security.crl.autoupdate.nextInstant." + crlEntry.nameInDb);
			var nextInstantYear = nextInstant.substr(6, 4);
			var nextInstantMonth = nextInstant.substr(0, 2);
			var nextInstantDay = nextInstant.substr(3, 2);
			var nextInstantDate = new Date();
			nextInstantDate.setFullYear(nextInstantYear);
			nextInstantDate.setMonth(nextInstantMonth - 1);
			nextInstantDate.setDate(nextInstantDay);
			nextInstantDate.setHours(23);
			nextInstantDate.setMinutes(59);
			nextInstantDate.setSeconds(59);
			var now = new Date();
			var diff = now.getTime() - nextInstantDate.getTime();
			
			/* Try to update only if current time is after preference value written by previous update */
			if (isNaN(diff) || diff > 0) {
				/* Get URL from preferences */
				var url = trustedBird_prefService_getCharPref("security.crl.autoupdate.url." + crlEntry.nameInDb);
				if (url == "") continue;
				trustedBird_dump("ldapCrlAutoUpdateManagerOnLoad URL=" + url);
				
				var ldapQuery = new trustedBird_ldapQuery();
				if (!ldapQuery.launch(url, ldapCrlAutoUpdateManagerEndCallback, crlEntry.nameInDb, importCrlFromLdapMessage, "." + crlEntry.nameInDb)) {
					trustedBird_dump("Error launching LDAP query " + url);
				}
				queryLaunched = true;
			}
		}
	}
	
	if (!queryLaunched) window.close();
}

/**
 * Set error message in preferences
 * @param aError LDAP query error value
 * @param preferenceName Part of preference name specific to current CRL
 */
function ldapCrlAutoUpdateManagerEndCallback(aError, preferenceName) {
	if (aError != trustedBird_ldapQuery.NO_ERROR) {
		/* Strings are not localized because there are stored in a Char preference */
		var errorMessage;
		switch (aError) {
			case trustedBird_ldapQuery.CONNECT_ERROR:
				errorMessage = "Error: can't connect to LDAP directory!";
				break;
			case trustedBird_ldapQuery.SEARCH_ERROR:
				errorMessage = "Error: search in LDAP directory failed!";
				break;
			case trustedBird_ldapQuery.DATA_ERROR:
				errorMessage = "Error: can't find the CRL in LDAP directory!";
				break;
		}
		if (errorMessage != "") {
			trustedBird_prefService_setCharPref("security.crl.autoupdate.errDetail." + preferenceName, errorMessage);
			trustedBird_prefService_setIntPref("security.crl.autoupdate.errCount." + preferenceName, 1 + trustedBird_prefService_getIntPref("security.crl.autoupdate.errCount." + preferenceName));
		}
	} else {
		trustedBird_prefService_setCharPref("security.crl.autoupdate.errDetail." + preferenceName, "");
		trustedBird_prefService_setIntPref("security.crl.autoupdate.errCount." + preferenceName, 0);
	}
}
