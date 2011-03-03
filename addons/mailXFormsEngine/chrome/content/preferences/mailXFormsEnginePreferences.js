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
 * Preferences
 */

var jsLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
jsLoader.loadSubScript("chrome://mailXFormsEngine/content/mailXFormsEngineCommon.js");

var mailXFormsEnginePreferencesStringBundle = null;


/**
 * Initialization
 */
function mailXFormsEnginePreferencesInit() {
  /* Get string bundle */
  mailXFormsEnginePreferencesStringBundle = document.getElementById("mailXFormsEnginePreferencesStringBundle");

  /* Read form list from preferences */
  mailXFormsEngineCommonLoadFormList();

  /* Create control in order to choose default form */
  mailXFormsEnginePreferencesDefaultFormCreateMenu();

  /* Create controls with the list of available forms */
  mailXFormsEnginePreferencesActiveFormsCreateList();
}


/**
 * Create a menulist in order to choose default form
 */
function mailXFormsEnginePreferencesDefaultFormCreateMenu() {
  var id = "mailXFormsEnginePreferencesDefaultFormMenu";
  var menu = document.getElementById(id);
  var menuPopup = document.getElementById(id + "Popup");

  if (!menu || !menuPopup) return;

  /* Remove all entries */
  while (menuPopup.hasChildNodes()) menuPopup.removeChild(menuPopup.childNodes[0]);

  /* Create preference */
  if (!(document.getElementById(id + "Preference"))) {
    var preferences = document.getElementById("mailXFormsEnginePreferences");
    var preference = document.createElement("preference");
    preference.setAttribute("id", id + "Preference");
    preference.setAttribute("name", mailXFormsEnginePrefRoot + "defaultForm");
    preference.setAttribute("type", "string");
    preferences.appendChild(preference);
  }

  /* Register preference name associated with the menu */
  menu.setAttribute("preference", id + "Preference");
  menu.setAttribute("oncommand", "mailXFormsEngineDefaultForm = this.selectedItem.value;");

  /* Create first menu items */
  var menuItem = document.createElement("menuitem");
  menuItem.setAttribute("label", mailXFormsEnginePreferencesStringBundle.getString("listItemNone"));
  menuItem.setAttribute("id", id + "MenuItemNone");
  menuItem.setAttribute("value", "");
  menuPopup.appendChild(menuItem);

  /* Select item */
  menu.selectedItem = menuItem;

  /* Create all menu items */
  var defaultFormSelected = false;
  for (let i = 0; i < mailXFormsEngineFormList.length; i++) {
    if (!mailXFormsEngineFormList[i].composeEnabled) continue;

    var menuItem = document.createElement("menuitem");
    menuItem.setAttribute("label", mailXFormsEngineFormList[i].title + " (" + mailXFormsEngineFormList[i].version + ")");
    menuItem.setAttribute("id", id + "MenuItem" + i);
    menuItem.setAttribute("value", mailXFormsEngineFormList[i].name + "." + mailXFormsEngineFormList[i].version);
    menuPopup.appendChild(menuItem);

    /* Select default item */
    if ((mailXFormsEngineFormList[i].name + "." + mailXFormsEngineFormList[i].version) == mailXFormsEngineDefaultForm) {
      menu.selectedItem = menuItem;
      defaultFormSelected = true;
    }
  }
}


/**
 * Create checkboxes with the list of available forms
 */
function mailXFormsEnginePreferencesActiveFormsCreateList() {
  var id = "mailXFormsEnginePreferencesActiveFormsBox";
  var box = document.getElementById(id);

  var preferences = document.getElementById("mailXFormsEnginePreferences");

  /* Create a checkbox linked to a preference for each installed form */
  for (let i = 0; i < mailXFormsEngineFormList.length; i++) {
    var preference = document.createElement("preference");
    preference.setAttribute("id", id + "Preference" + i);
    preference.setAttribute("name", mailXFormsEnginePrefRoot + "forms." + mailXFormsEngineFormList[i].name + "." + mailXFormsEngineFormList[i].version + ".composeEnabled");
    preference.setAttribute("type", "bool");
    preferences.appendChild(preference);

    var checkbox = document.createElement("checkbox");
    checkbox.setAttribute("label", mailXFormsEngineFormList[i].title + " (" + mailXFormsEngineFormList[i].version + ")");
    checkbox.setAttribute("id", id + "Checkbox" + i);
    checkbox.setAttribute("preference", id + "Preference" + i);
    checkbox.setAttribute("checked", mailXFormsEngineFormList[i].composeEnabled);
    checkbox.setAttribute("oncommand", "mailXFormsEngineFormList[" + i + "].composeEnabled = this.checked; mailXFormsEnginePreferencesDefaultFormCreateMenu();");
    box.appendChild(checkbox);
  }

  /* Message when no form installed */
  if (mailXFormsEngineFormList.length == 0) {
    var label = document.createElement("label");
    label.setAttribute("value", mailXFormsEnginePreferencesStringBundle.getString("noFormInstalled"));
    box.appendChild(label);
  }
}
