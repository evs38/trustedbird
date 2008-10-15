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
var gStringBundle;
var currentSecurityPolicyIdentifier;
var currentSecurityClassification;
var currentPrivacyMark;
var currentSecurityCategories;

function securityLabelDialogOnLoad() {
	gSMFields = window.opener.gMsgCompose.compFields.securityInfo;
	if (gSMFields == null) return;
	
	gStringBundle = document.getElementById("securityLabelDialogStringbundle");
	var stringBundleService = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
	gStringBundle = stringBundleService.createBundle("chrome://messenger-smime/locale/securityLabel.properties");
	
	
	/* Read Security Label profiles */
	securityLabelReadProfiles();
	
	
	/* Get current values */
	currentSecurityPolicyIdentifier = gSMFields.securityPolicyIdentifier;
	currentSecurityClassification = gSMFields.securityClassification;
	currentPrivacyMark = gSMFields.privacyMark;
	currentSecurityCategories = gSMFields.securityCategories;
	
	
	/* Build Security Policy menulist */
	var securityPolicyIdentifierMenulist = document.getElementById("securityLabelSecurityPolicyIdentifierMenuList");
	
	/* Clear list */
	while (securityPolicyIdentifierMenulist.menupopup.firstChild) securityPolicyIdentifierMenulist.menupopup.removeChild(securityPolicyIdentifierMenulist.menupopup.firstChild);
	
	/* Construct list */
	securityLabelDialogCreateMenuItem(securityPolicyIdentifierMenulist, gStringBundle.GetStringFromName("noSecurityPolicyIdentifier"), "", "");
	for (policyName in securityLabelSecurityPolicyList) {
		securityLabelDialogCreateMenuItem(securityPolicyIdentifierMenulist, policyName, securityLabelSecurityPolicyList[policyName], currentSecurityPolicyIdentifier);
	}
	
	
	/* Init UI */
	securityLabelDialogInitUI();
}

function securityLabelDialogOnSecurityPolicyIdentifier() {
	currentSecurityClassification = -1;
	currentPrivacyMark = "";
	currentSecurityCategories = "";

	securityLabelDialogInitUI();
}

function securityLabelDialogInitUI() {
	var selectedPolicyIdentifier = document.getElementById("securityLabelSecurityPolicyIdentifierMenuList").label;

	
	/* Build Security Classification menulist */
	var securityClassificationMenulist = document.getElementById("securityLabelSecurityClassificationMenuList");

	/* Clear list */
	while (securityClassificationMenulist.menupopup.firstChild) securityClassificationMenulist.menupopup.removeChild(securityClassificationMenulist.menupopup.firstChild);

	/* Construct list */
	securityLabelDialogCreateMenuItem(securityClassificationMenulist, gStringBundle.GetStringFromName("noSecurityClassification"), "-1", "-1");
	for (classificationName in securityLabelSecurityClassificationList[selectedPolicyIdentifier]) {
		securityLabelDialogCreateMenuItem(securityClassificationMenulist, classificationName, securityLabelSecurityClassificationList[selectedPolicyIdentifier][classificationName], currentSecurityClassification);
	}
	
	
	/* Build Privacy Mark menulist */
	var privacyMarkMenulist = document.getElementById("securityLabelPrivacyMarkMenuList");

	/* Clear list */
	while (privacyMarkMenulist.menupopup.firstChild) privacyMarkMenulist.menupopup.removeChild(privacyMarkMenulist.menupopup.firstChild);
	privacyMarkMenulist.removeAttribute("editable");
	
	/* Construct list */
	securityLabelDialogCreateMenuItem(privacyMarkMenulist, "", "", "");
	for (privacyMarkName in securityLabelPrivacyMarkList[selectedPolicyIdentifier]) {
		if (privacyMarkName != "freeText") securityLabelDialogCreateMenuItem(privacyMarkMenulist, securityLabelPrivacyMarkList[selectedPolicyIdentifier][privacyMarkName], securityLabelPrivacyMarkList[selectedPolicyIdentifier][privacyMarkName], currentPrivacyMark);
	}
	if (securityLabelPrivacyMarkList[selectedPolicyIdentifier] && securityLabelPrivacyMarkList[selectedPolicyIdentifier]["freeText"]) privacyMarkMenulist.setAttribute("editable", true); 

	document.getElementById("securityLabelPrivacyMarkTextbox").value = currentPrivacyMark;
	document.getElementById("securityLabelPrivacyMarkMenuList").value = currentPrivacyMark;

	
	/* Security Categories */
	securityLabelDialogSecurityCategoriesClearList();
	if (currentSecurityCategories != "") {
		var s = currentSecurityCategories.split("|");
		if (s.length % 2 == 0) {
			for (var i = 0; i < s.length; i += 2) {
				securityLabelDialogSecurityCategoriesAddItem(s[i] + "|" + s[i+1]);
			}
			var securityLabelSecurityCategoriesListbox = document.getElementById("securityLabelSecurityCategoriesListbox");
			securityLabelSecurityCategoriesListbox.selectedItem = securityLabelSecurityCategoriesListbox.firstChild;
		}
	}
	
	/* Enable/disable widgets */
	securityLabelDialogSetControls();
}

function securityLabelDialogOnSecurityClassification() {
	securityLabelDialogSecurityCategoriesClearList();
}

function securityLabelDialogCreateMenuItem(menulist, label, value, selectedValue) {
	var menuitem = menulist.appendItem(label, value);
	if (value == selectedValue) menulist.selectedItem = menuitem;
}

function securityLabelDialogSecurityCategoriesOnButtonAdd() {
	securityLabelDialogSecurityCategoriesAddItem("");
}

function securityLabelDialogSecurityCategoriesAddItem(selectedValue) {
	var securityLabelSecurityCategoriesListbox = document.getElementById("securityLabelSecurityCategoriesListbox");
	
	var n = 0;
	while (document.getElementById("securityLabelSecurityCategoriesMenuList" + n) != null) n++;
	
	var menulist = document.createElement("menulist");
	menulist.setAttribute("id", "securityLabelSecurityCategoriesMenuList" + n);
	menulist.setAttribute("flex", "1");

	var listitem = document.createElement("listitem");
	listitem.setAttribute("id", "securityLabelSecurityCategoriesListitem" + n);
	listitem.setAttribute("allowevents", true);
	listitem.appendChild(menulist);
	securityLabelSecurityCategoriesListbox.appendChild(listitem);
	securityLabelSecurityCategoriesListbox.ensureIndexIsVisible(securityLabelSecurityCategoriesListbox.getRowCount() - 1);
	securityLabelSecurityCategoriesListbox.selectedItem = listitem;
	
	/* Construct menulist */
	securityLabelDialogCreateMenuItem(menulist, "", "", selectedValue);
	var selectedPolicyIdentifier = document.getElementById("securityLabelSecurityPolicyIdentifierMenuList").label;
	for (var i = 0; i < 2; i++) {
		if (securityLabelSecurityCategoriesList[selectedPolicyIdentifier]) {
			var list;
			/* Security Categories for all classifications */
			if (i == 0) list = securityLabelSecurityCategoriesList[selectedPolicyIdentifier]["all"];
			/* Security Categories for selected classification */
			if (i == 1) list = securityLabelSecurityCategoriesList[selectedPolicyIdentifier][document.getElementById("securityLabelSecurityClassificationMenuList").value];
	                
			for (securityCategoryName in list) {
				securityLabelDialogCreateMenuItem(menulist, securityCategoryName, list[securityCategoryName][0] + "|" + list[securityCategoryName][1], selectedValue);
			}
		}
	}
	
	/* Enable/disable widgets */
	securityLabelDialogSetControls();
}

function securityLabelDialogSecurityCategoriesOnButtonRemove() {
	var securityLabelSecurityCategoriesListbox = document.getElementById("securityLabelSecurityCategoriesListbox");

	if (securityLabelSecurityCategoriesListbox.selectedItem != null) {
		var nextNode = securityLabelSecurityCategoriesListbox.selectedItem.nextSibling;
		if (nextNode == null) nextNode = securityLabelSecurityCategoriesListbox.selectedItem.previousSibling;
		securityLabelSecurityCategoriesListbox.removeChild(securityLabelSecurityCategoriesListbox.selectedItem);
		securityLabelSecurityCategoriesListbox.selectedItem = nextNode;
	}

	/* Enable/disable widgets */
	securityLabelDialogSetControls();
}

function securityLabelDialogSecurityCategoriesClearList() {
	var securityLabelSecurityCategoriesListbox = document.getElementById("securityLabelSecurityCategoriesListbox");

	while (securityLabelSecurityCategoriesListbox.hasChildNodes()) {
		securityLabelSecurityCategoriesListbox.removeChild(securityLabelSecurityCategoriesListbox.firstChild);
	}

	/* Enable/disable widgets */
	securityLabelDialogSetControls();
}

function securityLabelDialogOnAccept() {
	/* Security Policy Identifier */
	gSMFields.securityPolicyIdentifier = document.getElementById("securityLabelSecurityPolicyIdentifierMenuList").value;
	if (gSMFields.securityPolicyIdentifier != "") {
		
		/* Security Classification */
		gSMFields.securityClassification = document.getElementById("securityLabelSecurityClassificationMenuList").value;
		
		/* Privacy Mark */
		var selectedPolicyIdentifier = document.getElementById("securityLabelSecurityPolicyIdentifierMenuList").label;
		if (securityLabelPrivacyMarkList[selectedPolicyIdentifier] && securityLabelPrivacyMarkList[selectedPolicyIdentifier].length > 0) {
			gSMFields.privacyMark = document.getElementById("securityLabelPrivacyMarkMenuList").value;
		} else {
			gSMFields.privacyMark = document.getElementById("securityLabelPrivacyMarkTextbox").value;
		}
		
		/* Security Categories */
		var securityLabelSecurityCategoriesListbox = document.getElementById("securityLabelSecurityCategoriesListbox");
		var securityCategories = "";
		if (securityLabelSecurityCategoriesListbox.hasChildNodes()) {
			for (var i = 0; i < securityLabelSecurityCategoriesListbox.childNodes.length; i++) {
				var value = securityLabelSecurityCategoriesListbox.childNodes[i].firstChild.value;
				
				if (value != undefined && value != "") {
					if (securityCategories != "") securityCategories += "|";
					securityCategories += value;
				}
			}
		}
		gSMFields.securityCategories = securityCategories;
	
	} else {
		gSMFields.securityClassification = -1;
		gSMFields.privacyMark = "";
		gSMFields.securityCategories = "";
	}
}

function securityLabelDialogSetControls() {
	var selectedPolicyIdentifier = document.getElementById("securityLabelSecurityPolicyIdentifierMenuList").label;
	if (securityLabelPrivacyMarkList[selectedPolicyIdentifier] && securityLabelPrivacyMarkList[selectedPolicyIdentifier].length > 0) {
		document.getElementById("securityLabelPrivacyMarkTextbox").hidden = true;
		document.getElementById("securityLabelPrivacyMarkMenuList").hidden = false;
	} else {
		document.getElementById("securityLabelPrivacyMarkTextbox").hidden = false;
		document.getElementById("securityLabelPrivacyMarkMenuList").hidden = true;
	}

	if (document.getElementById("securityLabelSecurityPolicyIdentifierMenuList").value != "") {
		document.getElementById("securityLabelSecurityClassificationMenuList").disabled = false;

		if (securityLabelPrivacyMarkList[selectedPolicyIdentifier] && securityLabelPrivacyMarkList[selectedPolicyIdentifier]["freeText"]) {
			document.getElementById("securityLabelPrivacyMarkTextbox").disabled = false;
		} else {
			document.getElementById("securityLabelPrivacyMarkTextbox").disabled = true;
		}

		document.getElementById("securityLabelPrivacyMarkMenuList").disabled = false;
		document.getElementById("securityLabelSecurityCategoriesListbox").disabled = false;

		/* Security Categories for all classifications */
		var list1 = securityLabelSecurityCategoriesList[selectedPolicyIdentifier]["all"];
		/* Security Categories for selected classification */
		var list2 = securityLabelSecurityCategoriesList[selectedPolicyIdentifier][document.getElementById("securityLabelSecurityClassificationMenuList").value];
		if (list1 != undefined || list2 != undefined) {
			document.getElementById("securityLabelSecurityCategoriesButtonAdd").disabled = false;
		} else {
			document.getElementById("securityLabelSecurityCategoriesButtonAdd").disabled = true;
		}
		
		if (document.getElementById("securityLabelSecurityCategoriesListbox").getRowCount() > 0 && document.getElementById("securityLabelSecurityCategoriesListbox").getRowCount() < 64) {
			document.getElementById("securityLabelSecurityCategoriesButtonRemove").disabled = false;
		} else {
			document.getElementById("securityLabelSecurityCategoriesButtonRemove").disabled = true;
		}
	} else {
		document.getElementById("securityLabelSecurityClassificationMenuList").disabled = true;
		document.getElementById("securityLabelPrivacyMarkTextbox").disabled = true;
		document.getElementById("securityLabelPrivacyMarkMenuList").disabled = true;
		document.getElementById("securityLabelSecurityCategoriesListbox").disabled = true;
		document.getElementById("securityLabelSecurityCategoriesButtonAdd").disabled = true;
		document.getElementById("securityLabelSecurityCategoriesButtonRemove").disabled = true;
	}
}
