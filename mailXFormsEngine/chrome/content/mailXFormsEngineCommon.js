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
 * The Original Code is Trustedbird/Mail XForms code.
 *
 * The Initial Developer of the Original Code is
 * BT Global Services / Etat francais Ministere de la Defense.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Raphael Fairise / BT Global Services / Etat francais Ministere de la Defense
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

/**
 * Common data and functions
 */

var mailXFormsEnginePrefRoot = "extensions.mailXFormsEngine.";

var mailXFormsEngineFormList = new Array();
var mailXFormsEngineDefaultForm = "";


/**
 * Read form list from preferences
 */
function mailXFormsEngineCommonLoadFormList() {
  var prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(mailXFormsEnginePrefRoot);

  var count = new Object;
  var formPrefList = prefBranch.getChildList("forms.", count);

  /* Clear list */
  mailXFormsEngineFormList = new Array();

  /* Read default form */
  try {
    mailXFormsEngineDefaultForm = prefBranch.getCharPref("defaultForm");
  } catch (e) {}

  /* Read preferences values */
  var formPrefRegexp = /^forms\.([^.]+)\.(.+)\.url$/;
  var defaultFormSelected = false;
  for (var i = 0; i < count.value; i++) {
    var formPrefParsed = formPrefRegexp.exec(formPrefList[i]);
    if (formPrefParsed && formPrefParsed.length == 3) {
      var newForm = new Object();

      newForm.name = formPrefParsed[1];
      newForm.version = formPrefParsed[2];
      newForm.url = prefBranch.getCharPref("forms." + newForm.name + "." + newForm.version + ".url");
      try {
        newForm.title = prefBranch.getComplexValue("forms." + newForm.name + "." + newForm.version + ".title", Components.interfaces.nsISupportsString).data;
      } catch (e) {
        newForm.title = newForm.name; /* default value */
      }
      try {
        newForm.composeEnabled = prefBranch.getBoolPref("forms." + newForm.name + "." + newForm.version + ".composeEnabled");
      } catch (e) {
        newForm.composeEnabled = true; /* default value */
        prefBranch.setBoolPref("forms." + newForm.name + "." + newForm.version + ".composeEnabled", newForm.composeEnabled);
      }
      if (newForm.composeEnabled && ((newForm.name + "." + newForm.version) == mailXFormsEngineDefaultForm)) defaultFormSelected = true;

      mailXFormsEngineFormList.push(newForm);
    }
  }


  /* Sort form list */
  var versionComparator = Components.classes["@mozilla.org/xpcom/version-comparator;1"].getService(Components.interfaces.nsIVersionComparator);

  function sortFormList(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;

    return versionComparator.compare(a.version, b.version);
  }

  mailXFormsEngineFormList.sort(sortFormList);


  /* If no form is selected by default, make sure settings are valid */
  if (!defaultFormSelected) {
    mailXFormsEngineDefaultForm = "";
    prefBranch.setCharPref("defaultForm", "");
  }

}


/**
 * Returns an array of all the child elements of the element that have the attribute
 * given by the second argument set to the value given by the third argument
 * @param rootElement Begin the search by this element
 * @param attributeName Attribute name
 * @param attributeValue Attribute value or "*" to ignore
 * @return Array of child elements
 */
function mailXFormsEngineGetElementsByAttribute(rootElement, attributeName, attributeValue) {
  /* XUL */
  if ('function' == typeof(rootElement.getElementsByAttribute)) return rootElement.getElementsByAttribute(attributeName, attributeValue);

  /* XHTML */
  var elementList = new Array();
  var allElements = rootElement.getElementsByTagName("*");
  for (let i = 0; i < allElements.length; i++) {
    if ('function' == typeof(allElements[i].hasAttribute)) {
      if (allElements[i].hasAttribute(attributeName)) {
        if (attributeValue == "*" || allElements[i].getAttribute(attributeName) == attributeValue) elementList.push(allElements[i]);
      }
    }
  }

  return elementList;
}
