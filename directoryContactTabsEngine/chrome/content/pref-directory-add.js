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
 * The Original Code is Trustedbird/Directory Contact Tabs code.
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

Components.utils.import("resource://directoryContactTabs/readPrefs.js");


var directoryContactTabsBoxId = "directoryContactTabsPrefBox";
var directoryContactTabsTabList = new Array();

/* Hook existing Startup function */
if (typeof Startup == "function") {
  var StartupOrig = Startup;

  function Startup() {
    StartupOrig();

    directoryContactTabsCreateList();
  }
}

/* Hook existing onAccept function */
if (typeof onAccept == "function") {
  var onAcceptOrig = onAccept;

  function onAccept() {
    directoryContactTabsSaveList();
    return onAcceptOrig();
  }
}

/**
 * Create checkbox list
 */
function directoryContactTabsCreateList() {
  /* Read preferences */
  directoryContactTabsTabList = directoryContactTabsReadPreferences();

  var box = document.getElementById(directoryContactTabsBoxId);

  for (let i = 0; i < directoryContactTabsTabList.length; i++) {
    var checkbox = document.createElement("checkbox");
    checkbox.setAttribute("label", directoryContactTabsTabList[i].title);
    checkbox.setAttribute("id", directoryContactTabsBoxId + "Checkbox" + i);

    var checked = true;
    try {
      if (gCurrentDirectory.dirPrefId in directoryContactTabsTabList[i] && directoryContactTabsTabList[i][gCurrentDirectory.dirPrefId] == false) checked = false;
    } catch (e) {}

    checkbox.setAttribute("checked", checked);
    box.appendChild(checkbox);
  }

  /* Disable settings if directory settings don't already exist */
  var newDirectory = true;
  try {
    if (gCurrentDirectory) newDirectory = false;
  } catch (e) {dump(e+"\n");}
  if (newDirectory) document.getElementById("directoryContactTabsTab").setAttribute("disabled", true);
}

/**
 * Save checkbox values
 */
function directoryContactTabsSaveList() {
  var prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");

  for (let i = 0; i < directoryContactTabsTabList.length; i++) {
    try {
      prefBranch.setBoolPref(directoryContactTabsTabList[i].rootPreference + "directory." + gCurrentDirectory.dirPrefId, document.getElementById(directoryContactTabsBoxId + "Checkbox" + i).checked);
    } catch (e) {}
  }
}
