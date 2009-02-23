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
 * It launches, just after Thunderbird start and periodically, a module to
 * fetch CRLs from LDAP directories.
 */

var jsLoader =  Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
jsLoader.loadSubScript("chrome://crl_over_ldap/content/libtrustedbird.js");


/* Add-on hook: replace the original function */
var OnLoadMessenger_orig = OnLoadMessenger;
OnLoadMessenger = function() {
	
	/* Call original function */
	OnLoadMessenger_orig();
	
	var autoUpdateLauncher = new ldapCrlAutoUpdateLauncher();
	
	/* Launch first update */
	setTimeout(function() {autoUpdateLauncher.launchManager()}, 1000);
}


function ldapCrlAutoUpdateLauncher() {
	this.ldapCrlAutoUpdateManagerWindow = null;
}

ldapCrlAutoUpdateLauncher.prototype.launchManager = function() {
	var objThis = this;
	trustedBird_dump("ldapCrlAutoUpdateLauncher.launchManager");

	/* Launch update manager in a hidden window */
	if (this.ldapCrlAutoUpdateManagerWindow) this.ldapCrlAutoUpdateManagerWindow.close();
	this.ldapCrlAutoUpdateManagerWindow = window.openDialog("chrome://crl_over_ldap/content/ldapCrlAutoUpdateManager.xul", "ldapCrlAutoUpdateManager", "dependent=yes");

	/* Close hidden window to free memory used by ldap-connection component */
	setTimeout(function() {objThis.ldapCrlAutoUpdateManagerWindow.close();}, 60000);

	/* Schedule next check (one day later) */
	setTimeout(function() {objThis.launchManager();}, 86400000);
}
