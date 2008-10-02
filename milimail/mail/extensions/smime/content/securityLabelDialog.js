/* 
   ***** BEGIN LICENSE BLOCK *****
   - Version: MPL 1.1/GPL 2.0/LGPL 2.1
   -
   - The contents of this file are subject to the Mozilla Public License Version
   - 1.1 (the "License"); you may not use this file except in compliance with
   - the License. You may obtain a copy of the License at
   - http://www.mozilla.org/MPL/
   -
   - Software distributed under the License is distributed on an "AS IS" basis,
   - WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
   - for the specific language governing rights and limitations under the
   - License.
   -
   - The Original Code is Mozilla Communicator
   -
   - The Initial Developer of the Original Code is
   -   BT Global Services / Etat francais Ministere de la Defense
   - Portions created by the Initial Developer are Copyright (C) 2008
   - the Initial Developer. All Rights Reserved.
   -
   - Contributor(s):
   -
   - Alternatively, the contents of this file may be used under the terms of
   - either the GNU General Public License Version 2 or later (the "GPL"), or
   - the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
   - in which case the provisions of the GPL or the LGPL are applicable instead
   - of those above. If you wish to allow use of your version of this file only
   - under the terms of either the GPL or the LGPL, and not to allow others to
   - use your version of this file under the terms of the MPL, indicate your
   - decision by deleting the provisions above and replace them with the notice
   - and other provisions required by the LGPL or the GPL. If you do not delete
   - the provisions above, a recipient may use your version of this file under
   - the terms of any one of the MPL, the GPL or the LGPL.
   -
   - ***** END LICENSE BLOCK *****
*/

var gSMFields;

function securityLabelDialogOnLoad() {
	var menulist;
	var menupopup;
	
	gSMFields = window.opener.gMsgCompose.compFields.securityInfo;
	if (gSMFields == null) return;


	/* Security Policy Identifier */
	menulist = document.getElementById("securityLabelSecurityPolicyIdentifierMenuList");
	securityLabelDialogCreateMenuItem(menulist, "none", "", gSMFields.securityPolicyIdentifier);
	securityLabelDialogCreateMenuItem(menulist, "default", "1.2.840.113549.1.9.16.7.1", gSMFields.securityPolicyIdentifier);

	/* Security Classification */
	menulist = document.getElementById("securityLabelSecurityClassificationMenuList");
	securityLabelDialogCreateMenuItem(menulist, "top-secret (5)", "5", gSMFields.securityClassification);
	securityLabelDialogCreateMenuItem(menulist, "secret (4)", "4", gSMFields.securityClassification);
	securityLabelDialogCreateMenuItem(menulist, "confidential (3)", "3", gSMFields.securityClassification);
	securityLabelDialogCreateMenuItem(menulist, "restricted (2)", "2", gSMFields.securityClassification);
	securityLabelDialogCreateMenuItem(menulist, "unclassified (1)", "1", gSMFields.securityClassification);
	securityLabelDialogCreateMenuItem(menulist, "unmarked (0)", "0", gSMFields.securityClassification);
	securityLabelDialogCreateMenuItem(menulist, "none", "-1", gSMFields.securityClassification);
	
	/* Privacy Mark */
	document.getElementById("securityLabelPrivacyMarkTextbox").value = gSMFields.privacyMark;
	
	/* Security Categories */

	/* Set controls */
	securityLabelDialogSetControls();
}

function securityLabelDialogCreateMenuItem(menulist, label, value, selectedValue) {
	var menuitem = document.createElement("menuitem");
	menuitem.setAttribute("label", label);
	menuitem.setAttribute("value", value);
	menulist.menupopup.appendChild(menuitem);
	
	if (value == selectedValue) menulist.selectedItem = menuitem;
}

function securityLabelDialogOnAccept() {
	/* Security Policy Identifier */
	gSMFields.securityPolicyIdentifier = document.getElementById("securityLabelSecurityPolicyIdentifierMenuList").selectedItem.value;
	if (gSMFields.securityPolicyIdentifier != "") {
		
		/* Security Classification */
		gSMFields.securityClassification = document.getElementById("securityLabelSecurityClassificationMenuList").selectedItem.value;
		
		/* Privacy Mark */
		gSMFields.privacyMark = document.getElementById("securityLabelPrivacyMarkTextbox").value;
		
		/* Security Categories */
		//.replace("/|/g", "");

	}
}

function securityLabelDialogSetControls() {
	if (document.getElementById("securityLabelSecurityPolicyIdentifierMenuList").selectedItem.value != "") {
		document.getElementById("securityLabelSecurityClassificationMenuList").disabled = false;
		document.getElementById("securityLabelPrivacyMarkTextbox").disabled = false;
		document.getElementById("securityLabelSecurityCategoriesTree").disabled = false;
	} else {
		document.getElementById("securityLabelSecurityClassificationMenuList").disabled = true;
		document.getElementById("securityLabelPrivacyMarkTextbox").disabled = true;
		document.getElementById("securityLabelSecurityCategoriesTree").disabled = true;
	}
}
