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
 * The Original Code is Trustedbird/DSN Settings code.
 *
 * The Initial Developer of the Original Code is
 * BT Global Services / Etat francais Ministere de la Defense.
 * Portions created by the Initial Developer are Copyright (C) 2010
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

document.getElementById("paneAdvanced").addEventListener("paneload", dsnSettingsDisplayUI, true);

/**
 * Create and display user interface for Delivery Status Notifications
 */
function dsnSettingsDisplayUI() {
  /* Get tab panel */
  var tabpanel;
  try {
    tabpanel = document.getElementById("systemDefaultsGroup").parentNode;
  } catch (e) {
    var errorMessage = "Can't find tabpanel in order to add DSN settings!";
    Components.utils.reportError(errorMessage);
    dump(errorMessage + "\n");
    return;
  }

  /* Create string bundle */
  var stringBundleService = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
  var stringBundle = stringBundleService.createBundle("chrome://dsn-settings/locale/dsn-settings.properties");

  /* Create preference */
  var preference = document.createElement("preference");
  preference.setAttribute("id", "mail.dsn.always_request_on");
  preference.setAttribute("name", "mail.dsn.always_request_on");
  preference.setAttribute("type", "bool");
  document.getElementById("advancedPreferences").appendChild(preference);

  /* Create user interface */
  var groupbox = document.createElement("groupbox");
  groupbox.setAttribute("id", "dsnGroupbox");
  var caption = document.createElement("caption");
  caption.setAttribute("label", stringBundle.GetStringFromName("dsn-settings.caption"));
  groupbox.appendChild(caption);
  var hbox = document.createElement("hbox");
  hbox.setAttribute("flex", "1");
  hbox.setAttribute("align", "center");

  var checkbox = document.createElement("checkbox");
  checkbox.setAttribute("id", "dsnAlwaysRequestCheckbox");
  checkbox.setAttribute("label", stringBundle.GetStringFromName("dsn-settings.alwaysRequestDSNCheckbox"));
  checkbox.setAttribute("flex", "1");
  checkbox.setAttribute("preference", "mail.dsn.always_request_on");
  checkbox.setAttribute("checked", dsnSettingsGetBoolPref("mail.dsn.always_request_on"));
  hbox.appendChild(checkbox);

  var button = document.createElement("button");
  button.setAttribute("id", "dsnAdvancedSettingsButton");
  button.setAttribute("label", stringBundle.GetStringFromName("dsn-settings.advancedSettings"));
  button.setAttribute("accesskey", stringBundle.GetStringFromName("dsn-settings.advancedSettings.accessKey"));
  button.setAttribute("oncommand", 'document.documentElement.openSubDialog("chrome://dsn-settings/content/advanced-dsn.xul", "", null);');
  hbox.appendChild(button);

  groupbox.appendChild(hbox);
  tabpanel.insertBefore(groupbox, document.getElementById("systemDefaultsGroup"));
}

/**
 * Read a boolean preference
 * @param {string} preference Preference name
 * @return {bool} Preference value
 */
function dsnSettingsGetBoolPref(preference) {
  var prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);

  var result = false;
  try {
    result = prefBranch.getBoolPref(preference);
  } catch (e) {}

  return result;
}
