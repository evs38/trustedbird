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
jsLoader.loadSubScript("chrome://crl_over_ldap/content/libtrustedbird.js");


/**
 * Import (and update if necessary) a CRL contained in a LDAP message into the database
 * @param aLdapURL LDAP URL used to fetch the CRL
 * @param aLdapMessage LDAP message with the CRL
 * @param aNameInDb Name of the CRL in CRL database
 * @param aSilent False if import into database should open a window to setup auto-update (default: true)
 * @return True if received CRL has been correctly imported
 */
function importCrlFromLdapMessage(aLdapURL, aLdapMessage, aNameInDb, aSilent) {
	trustedBird_dump("* importCrlFromLdapMessage (" + aLdapURL.spec + ")");

	if (aSilent == undefined) aSilent = true;
	
	/* Check number of attributes in URL */
	var requestAttributesNb = new Object();
	var requestAttributes = aLdapURL.getAttributes(requestAttributesNb);
	if (requestAttributesNb.value != 1) return false;
	
	/* Check if requested attribute is found in LDAP message */
    var responseAttributes = aLdapMessage.getAttributes(new Object());
    if (responseAttributes.indexOf(requestAttributes[0]) == -1) {
    	trustedBird_dump("Error importCrlFromLdapMessage: can't find requested attribute in LDAP message!");
    	return false;
    }
    

    /* Get and import CRL */
    var crlObj = aLdapMessage.getBinaryValues(requestAttributes[0], new Object());    
    
    if (crlObj && crlObj[0]) {
        var crlLength = new Object();
        var crlBytes = crlObj[0].get(crlLength);

        if (crlLength.value > 0) {
        	try {
        		var crlManager = Components.classes["@mozilla.org/security/crlmanager;1"].getService(Components.interfaces.nsICRLManager);
        		/* There may be a memory leak in importCrl */
        		crlManager.importCrl(crlBytes, crlLength.value, aLdapURL, 1, aSilent, aNameInDb);
        		return true;
        	} catch (e) {
        		trustedBird_dump("Error importCrlFromLdapMessage: " + e);
        	}
        }
    }
    
    return false;
}
