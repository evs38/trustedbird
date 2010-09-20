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
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * BT Global Services / Etat francais - Ministere de la Defense.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Raphael Fairise / BT Global Services / Etat francais - Ministere de la Defense
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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

var gSMFields;
var gSecurityLabelDialogStringBundle;
var currentSecurityPolicyIdentifier;
var currentSecurityClassification;
var currentPrivacyMark;
var currentSecurityCategories;

var gSecurityLabelConf;

function securityLabelDialogOnLoad() {
  gSMFields = window.opener.gMsgCompose.compFields.securityInfo;
  if (gSMFields == null)
    return;

  gSecurityLabelDialogStringBundle = Components.classes["@mozilla.org/intl/stringbundle;1"]
                                               .getService(Components.interfaces.nsIStringBundleService)
                                               .createBundle("chrome://messenger-smime/locale/msgSecurityLabel.properties");

  /* Read Security Label profiles */
  gSecurityLabelConf = new securityLabelConf();

  /* Get current values */
  currentSecurityPolicyIdentifier = gSMFields.securityPolicyIdentifier;
  currentSecurityClassification = gSMFields.securityClassification;
  currentPrivacyMark = gSMFields.privacyMark;
  currentSecurityCategories = gSMFields.securityCategories;

  /* Build Security Policy menulist */
  var securityPolicyIdentifierMenuList = document.getElementById("securityLabelSecurityPolicyIdentifierMenuList");

  /* Clear list */
  while (securityPolicyIdentifierMenuList.menupopup.firstChild)
    securityPolicyIdentifierMenuList.menupopup.removeChild(securityPolicyIdentifierMenuList.menupopup.firstChild);

  /* Construct list */
  securityLabelDialogCreateMenuItem(securityPolicyIdentifierMenuList, gSecurityLabelDialogStringBundle.GetStringFromName("noSecurityPolicyIdentifier"), "", "");
  for (policyName in gSecurityLabelConf.mSecurityPolicyList)
    securityLabelDialogCreateMenuItem(securityPolicyIdentifierMenuList, policyName, gSecurityLabelConf.mSecurityPolicyList[policyName], currentSecurityPolicyIdentifier);

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
  var securityClassificationMenuList = document.getElementById("securityLabelSecurityClassificationMenuList");

  /* Clear list */
  while (securityClassificationMenuList.menupopup.firstChild)
    securityClassificationMenuList.menupopup.removeChild(securityClassificationMenuList.menupopup.firstChild);

  /* Construct list */
  securityLabelDialogCreateMenuItem(securityClassificationMenuList, gSecurityLabelDialogStringBundle.GetStringFromName("noSecurityClassification"), "-1", "-1");
  for (classificationName in gSecurityLabelConf.mSecurityClassificationList[selectedPolicyIdentifier])
    securityLabelDialogCreateMenuItem(securityClassificationMenuList, classificationName, gSecurityLabelConf.mSecurityClassificationList[selectedPolicyIdentifier][classificationName], currentSecurityClassification);

  /* Build Privacy Mark menulist */
  var privacyMarkMenuList = document.getElementById("securityLabelPrivacyMarkMenuList");

  /* Clear list */
  while (privacyMarkMenuList.menupopup.firstChild)
    privacyMarkMenuList.menupopup.removeChild(privacyMarkMenuList.menupopup.firstChild);
  privacyMarkMenuList.removeAttribute("editable");

  /* Construct list */
  securityLabelDialogCreateMenuItem(privacyMarkMenuList, "", "", "");
  for (privacyMarkName in gSecurityLabelConf.mPrivacyMarkList[selectedPolicyIdentifier])
    if (privacyMarkName != "freeText")
      securityLabelDialogCreateMenuItem(privacyMarkMenuList, gSecurityLabelConf.mPrivacyMarkList[selectedPolicyIdentifier][privacyMarkName], gSecurityLabelConf.mPrivacyMarkList[selectedPolicyIdentifier][privacyMarkName], currentPrivacyMark);

  if (gSecurityLabelConf.mPrivacyMarkList[selectedPolicyIdentifier] && gSecurityLabelConf.mPrivacyMarkList[selectedPolicyIdentifier]["freeText"])
    privacyMarkMenuList.setAttribute("editable", true);

  document.getElementById("securityLabelPrivacyMarkTextBox").value = currentPrivacyMark;
  document.getElementById("securityLabelPrivacyMarkMenuList").value = currentPrivacyMark;

  /* Security Categories */
  securityLabelDialogSecurityCategoriesClearList();
  if (currentSecurityCategories != "") {
    var s = currentSecurityCategories.split("|");
    if (s.length % 3 == 0) {
      for (var i = 0; i < s.length; i += 3)
        securityLabelDialogSecurityCategoriesAddItem(s[i] + "|" + s[i + 1] + "|" + s[i + 2]);

      var securityLabelSecurityCategoriesListBox = document.getElementById("securityLabelSecurityCategoriesListBox");
      securityLabelSecurityCategoriesListBox.selectedItem = securityLabelSecurityCategoriesListBox.firstChild;
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
  if (value == selectedValue)
    menulist.selectedItem = menuitem;
}

function securityLabelDialogSecurityCategoriesOnButtonAdd() {
  securityLabelDialogSecurityCategoriesAddItem("");
}

function securityLabelDialogSecurityCategoriesAddItem(selectedValue) {
  var securityLabelSecurityCategoriesListBox = document.getElementById("securityLabelSecurityCategoriesListBox");
  var n = 0;
  while (document.getElementById("securityLabelSecurityCategoriesMenuList" + n) != null)
    n++;

  var menulist = document.createElement("menulist");
  menulist.setAttribute("id", "securityLabelSecurityCategoriesMenuList" + n);
  menulist.setAttribute("flex", "1");

  var listitem = document.createElement("listitem");
  listitem.setAttribute("id", "securityLabelSecurityCategoriesListitem" + n);
  listitem.setAttribute("allowevents", true);
  listitem.appendChild(menulist);
  securityLabelSecurityCategoriesListBox.appendChild(listitem);
  securityLabelSecurityCategoriesListBox.ensureIndexIsVisible(securityLabelSecurityCategoriesListBox.getRowCount() - 1);
  securityLabelSecurityCategoriesListBox.selectedItem = listitem;

  /* Construct menulist */
  securityLabelDialogCreateMenuItem(menulist, "", "", selectedValue);
  var selectedPolicyIdentifier = document.getElementById("securityLabelSecurityPolicyIdentifierMenuList").label;
  for (var i = 0; i < 2; i++) {
    if (gSecurityLabelConf.mSecurityCategoriesList[selectedPolicyIdentifier]) {
      var list;
      /* Security Categories for all classifications */
      if (i == 0)
        list = gSecurityLabelConf.mSecurityCategoriesList[selectedPolicyIdentifier]["all"];
      /* Security Categories for selected classification */
      if (i == 1)
        list = gSecurityLabelConf.mSecurityCategoriesList[selectedPolicyIdentifier][document.getElementById("securityLabelSecurityClassificationMenuList").value];

      for (securityCategoryName in list)
        securityLabelDialogCreateMenuItem(menulist, securityCategoryName, list[securityCategoryName][0] + "|" + list[securityCategoryName][1] + "|" + list[securityCategoryName][2], selectedValue);
    }
  }

  /* Enable/disable widgets */
  securityLabelDialogSetControls();
}

function securityLabelDialogSecurityCategoriesOnButtonRemove() {
  var securityLabelSecurityCategoriesListBox = document.getElementById("securityLabelSecurityCategoriesListBox");

  if (securityLabelSecurityCategoriesListBox.selectedItem != null) {
    var nextNode = securityLabelSecurityCategoriesListBox.selectedItem.nextSibling;
    if (nextNode == null)
      nextNode = securityLabelSecurityCategoriesListBox.selectedItem.previousSibling;
    securityLabelSecurityCategoriesListBox.removeChild(securityLabelSecurityCategoriesListBox.selectedItem);
    securityLabelSecurityCategoriesListBox.selectedItem = nextNode;
  }

  /* Enable/disable widgets */
  securityLabelDialogSetControls();
}

function securityLabelDialogSecurityCategoriesClearList() {
  var securityLabelSecurityCategoriesListBox = document.getElementById("securityLabelSecurityCategoriesListBox");

  while (securityLabelSecurityCategoriesListBox.hasChildNodes())
    securityLabelSecurityCategoriesListBox.removeChild(securityLabelSecurityCategoriesListBox.firstChild);

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
    if (gSecurityLabelConf.mPrivacyMarkList[selectedPolicyIdentifier] && gSecurityLabelConf.mPrivacyMarkList[selectedPolicyIdentifier].length > 0)
      gSMFields.privacyMark = document.getElementById("securityLabelPrivacyMarkMenuList").value;
    else
      gSMFields.privacyMark = document.getElementById("securityLabelPrivacyMarkTextBox").value;

    /* Security Categories */
    var securityLabelSecurityCategoriesListBox = document.getElementById("securityLabelSecurityCategoriesListBox");
    var securityCategories = "";
    if (securityLabelSecurityCategoriesListBox.hasChildNodes()) {
      for (var i = 0; i < securityLabelSecurityCategoriesListBox.childNodes.length; i++) {
        var value = securityLabelSecurityCategoriesListBox.childNodes[i].firstChild.value;

        if (value != undefined && value != "") {
          if (securityCategories != "")
            securityCategories += "|";
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
  if (gSecurityLabelConf.mPrivacyMarkList[selectedPolicyIdentifier] && gSecurityLabelConf.mPrivacyMarkList[selectedPolicyIdentifier].length > 0) {
    document.getElementById("securityLabelPrivacyMarkTextBox").hidden = true;
    document.getElementById("securityLabelPrivacyMarkMenuList").hidden = false;
  } else {
    document.getElementById("securityLabelPrivacyMarkTextBox").hidden = false;
    document.getElementById("securityLabelPrivacyMarkMenuList").hidden = true;
  }

  if (document.getElementById("securityLabelSecurityPolicyIdentifierMenuList").value != "") {
    document.getElementById("securityLabelSecurityClassificationMenuList").disabled = false;

    if (gSecurityLabelConf.mPrivacyMarkList[selectedPolicyIdentifier] && gSecurityLabelConf.mPrivacyMarkList[selectedPolicyIdentifier]["freeText"])
      document.getElementById("securityLabelPrivacyMarkTextBox").disabled = false;
    else
      document.getElementById("securityLabelPrivacyMarkTextBox").disabled = true;

    document.getElementById("securityLabelPrivacyMarkMenuList").disabled = false;
    document.getElementById("securityLabelSecurityCategoriesListBox").disabled = false;

    /* Security Categories for all classifications */
    var list1;
    if (gSecurityLabelConf.mSecurityCategoriesList[selectedPolicyIdentifier])
      list1 = gSecurityLabelConf.mSecurityCategoriesList[selectedPolicyIdentifier]["all"];

    /* Security Categories for selected classification */
    var list2;
    if (gSecurityLabelConf.mSecurityCategoriesList[selectedPolicyIdentifier])
      list2 = gSecurityLabelConf.mSecurityCategoriesList[selectedPolicyIdentifier][document.getElementById("securityLabelSecurityClassificationMenuList").value];

    if (list1 != undefined || list2 != undefined)
      document.getElementById("securityLabelSecurityCategoriesButtonAdd").disabled = false;
    else
      document.getElementById("securityLabelSecurityCategoriesButtonAdd").disabled = true;

    if (document.getElementById("securityLabelSecurityCategoriesListBox").getRowCount() > 0 && document.getElementById("securityLabelSecurityCategoriesListBox").getRowCount() < 64)
      document.getElementById("securityLabelSecurityCategoriesButtonRemove").disabled = false;
    else
      document.getElementById("securityLabelSecurityCategoriesButtonRemove").disabled = true;

  } else {
    document.getElementById("securityLabelSecurityClassificationMenuList").disabled = true;
    document.getElementById("securityLabelPrivacyMarkTextBox").disabled = true;
    document.getElementById("securityLabelPrivacyMarkMenuList").disabled = true;
    document.getElementById("securityLabelSecurityCategoriesListBox").disabled = true;
    document.getElementById("securityLabelSecurityCategoriesButtonAdd").disabled = true;
    document.getElementById("securityLabelSecurityCategoriesButtonRemove").disabled = true;
  }
}
