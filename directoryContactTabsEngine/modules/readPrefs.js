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

var EXPORTED_SYMBOLS = ["directoryContactTabsReadPreferences"];


/**
 * Read preferences
 * @return {Array} Array of tabs
 */
function directoryContactTabsReadPreferences() {
  var rootPref = "extensions.directoryContactTabs.";

  var prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(rootPref);

  var tabList = new Array();

  var tabPrefRegexp = /^(.+)\.tab\.url$/;

  var tabPrefCount = new Object();
  var tabPrefList = prefBranch.getChildList("", tabPrefCount);

  for (var i = 0; i < tabPrefCount.value; i++) {
    var prefParsed = tabPrefRegexp.exec(tabPrefList[i]);
    if (prefParsed && prefParsed.length == 2) {
      var newTab = new Object();

      newTab.rootPreference = rootPref + prefParsed[1] + ".";

      /* Tab URL */
      newTab.url = prefBranch.getCharPref(prefParsed[1] + ".tab.url");
      if (newTab.url == "") continue;

      /* Tab title */
      try {
        newTab.title = prefBranch.getCharPref(prefParsed[1] + ".tab.title");
      } catch (e) {
        newTab.title = "Tab " + (tabList.length + 1);
      }

      /* Directories */
      var directoryPrefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(rootPref + prefParsed[1] + ".directory.");
      var directoryPrefCount = new Object();
      var directoryPrefList = directoryPrefBranch.getChildList("", directoryPrefCount);

      for (var j = 0; j < directoryPrefCount.value; j++) {
        if (directoryPrefBranch.getBoolPref(directoryPrefList[j]) == false) {
          newTab[directoryPrefList[j]] = false;
        }
      }

      tabList.push(newTab);
    }
  }

  /* Sort list */
  tabList.sort(function (a, b) {
    if (a.title < b.title) return -1;
    return 1;
  });

  return tabList;
}
