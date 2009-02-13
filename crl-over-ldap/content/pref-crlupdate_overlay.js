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
var initializeSelection_orig = initializeSelection;
initializeSelection = function() {
	/* Call original function */
	initializeSelection_orig();
	
	/* Increase input box size */
	document.getElementById("nextUpdateDay").setAttribute("width", "40");
	document.getElementById("nextUpdateFreq").setAttribute("width", "40");
	
	if (crl && crl.lastFetchURL && crl.lastFetchURL.indexOf("ldap://") == 0) {
		/* Create new checkbox for LDAP URL auto-update */
		var node = document.getElementById("enableCheckBox").cloneNode(false);
		node.id = "enableCheckBoxLdap";
		document.getElementById("enableCheckBox").parentNode.insertBefore(node, document.getElementById("enableCheckBox"));
		document.getElementById("enableCheckBox").setAttribute("hidden", "true");
		
		try {
			var isEnabled = prefBranch.getBoolPref("security.crl.autoupdate.enableLdap." + crl.nameInDb);
			document.getElementById("enableCheckBoxLdap").checked = isEnabled;
		} catch(exception) {
			document.getElementById("enableCheckBoxLdap").checked = false;
		}

		/* Allow only frequency-based update timing */
		document.getElementById("timeBasedBox").setAttribute("hidden", "true");
		document.getElementById("nextUpdateFreq").removeAttribute("disabled");
		updateTypeRadio.selectedItem = freqBasedRadio;
	}
}


/* Add-on hook: replace the original function */
var onAccept_orig = onAccept;
onAccept = function() {
	/* Call original function */
	onAccept_orig();
	
	if (document.getElementById("enableCheckBoxLdap")) {
		prefBranch.setBoolPref("security.crl.autoupdate.enableLdap." + crl.nameInDb, document.getElementById("enableCheckBoxLdap").checked);
		prefBranch.setBoolPref("security.crl.autoupdate.enable." + crl.nameInDb, document.getElementById("enableCheckBoxLdap").checked);
	}
}

/* Add-on hook: replace the original function to fix a crash */
function validatePrefs() {
	var dayCnt = (document.getElementById("nextUpdateDay")).value;
	var freqCnt = (document.getElementById("nextUpdateFreq")).value;
	
	var tmp = parseFloat(dayCnt);
	if(!(tmp > 0.0)){
		alert(bundle.GetStringFromName("crlAutoUpdateDayCntError"));
		return false;
	}
	/* Crash fixed: replace current value with float value */
	document.getElementById("nextUpdateDay").value = tmp;
	
	tmp = parseFloat(freqCnt);
	if(!(tmp > 0.0)){
		alert(bundle.GetStringFromName("crlAutoUpdtaeFreqCntError"));
		return false;
	}
	/* Crash fixed: replace current value with float value */
	document.getElementById("nextUpdateFreq").value = tmp;
	
	return true;
}
