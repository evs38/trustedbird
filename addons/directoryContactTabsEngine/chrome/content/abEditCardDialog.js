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

Components.utils.import("resource://directoryContactTabs/common.js");
Components.utils.import("resource://directoryContactTabs/readPrefs.js");
Components.utils.import("resource://directoryContactTabs/ldapQuery.js");


var directoryContactTabsDirectory = null;
var directoryContactTabsTabList = new Array();
var directoryContactTabsTabLoadedCount = 0;
var directoryContactTabsElementList = new Array();
var directoryContactTabsStringBundle;

/* Hook existing OnLoadEditCard function */
if (typeof OnLoadEditCard == "function") {
  var OnLoadEditCardOrig = OnLoadEditCard;

  function OnLoadEditCard() {
    OnLoadEditCardOrig();

    document.getElementById("abcardWindow").addEventListener("unload", OnUnLoadEditCard, true);

    directoryContactTabsDirectory = getLdapDirectory();
    if (directoryContactTabsDirectory != null) loadCustomTabs();
  }
}

/**
 * Unload function called when the contact window is closed
 */
function OnUnLoadEditCard() {
  document.getElementById("abcardWindow").removeEventListener("unload", OnUnLoadEditCard, true);

  for (let j = 0; j < directoryContactTabsElementList.length; j++) {
    directoryContactTabsElementList[j].removeEventListener("CheckboxStateChange", CheckboxStateChangeTrue, true);
    directoryContactTabsElementList[j].removeEventListener("CheckboxStateChange", CheckboxStateChangeFalse, true);
  }
}

function CheckboxStateChangeTrue(event) {
  event.target.checked = true;
  event.target.blur();
}

function CheckboxStateChangeFalse(event) {
  event.target.checked = false;
  event.target.blur();
}

/**
 * Get current LDAP directory for selected card
 * @return {nsIAbLDAPDirectory}
 */
function getLdapDirectory() {
  if ("arguments" in window && window.arguments[0]) {
    if ("abURI" in window.arguments[0]) {
      var abURI = window.arguments[0].abURI;
      var directory = GetDirectoryFromURI(abURI);

      /* Check if current address book is a LDAP directory */
      if (directory instanceof Components.interfaces.nsIAbLDAPDirectory) {
        return directory;
      }
    }
  }

  return null;
}

/**
 * Load new tabs into current card
 */
function loadCustomTabs() {
  /* Get string bundle */
  directoryContactTabsStringBundle = document.getElementById("directoryContactTabsStringBundle");

  /* Load preferences */
  var tabList = directoryContactTabsReadPreferences();

  /* Create tab list */
  for (let i = 0; i < tabList.length; i++) {
    var enabled = true;
    try {
      if (directoryContactTabsDirectory.dirPrefId in tabList[i] && tabList[i][directoryContactTabsDirectory.dirPrefId] == false) enabled = false;
    } catch (e) {}
    if (enabled) directoryContactTabsTabList.push(tabList[i]);
  }

  /* Display new tabs */
  for (let i = 0; i < directoryContactTabsTabList.length; i++) {
    var tab = document.createElement("tab");
    tab.setAttribute("id", "directoryContactTabsTab" + i);
    tab.setAttribute("label", directoryContactTabsStringBundle.getString("directoryContactTabs.loading"));
    document.getElementById("abTabs").appendChild(tab);

    var tabContent = document.createElement("iframe");
    tabContent.setAttribute("id", "directoryContactTabsTabContent" + i);
    tabContent.setAttribute("src", directoryContactTabsTabList[i].url);
    document.getElementById("abTabPanels").appendChild(tabContent);

    tabContent.addEventListener("load", newTabLoaded, true);
  }
}

/**
 * Callback when a panel is loaded
 */
function newTabLoaded() {
  /* Count loaded tabs */
  directoryContactTabsTabLoadedCount++;

  /* When all tabs are loaded */
  if (directoryContactTabsTabLoadedCount == directoryContactTabsTabList.length) {

    for (let i = 0; i < directoryContactTabsTabList.length; i++) {
      var currentWindow = document.getElementById("directoryContactTabsTabContent" + i).contentDocument.documentElement;

      /* Move all elements inside a box in order to set the background color */
      var rootBox = document.createElement("vbox");
      rootBox.setAttribute("flex", 1);
      rootBox.setAttribute("style", "-moz-appearance: tabpanels; padding: 3px;");

      while (currentWindow.firstChild) {
        var element = currentWindow.removeChild(currentWindow.firstChild);
        rootBox.appendChild(element);
      }
      currentWindow.appendChild(rootBox);

      /* Search elements with the special LDAP attribute in current tab */
      fillElementList(currentWindow);
    }

    /* Set all widgets readonly */
    disableControls();

    /* Query LDAP directory and fill the widgets */
    queryDirectory();

  }
}

/**
 * Search for elements with the special LDAP attribute and add them to the list
 * @param {Element} rootElement
 */
function fillElementList(rootElement) {
  var list = rootElement.getElementsByAttribute("dctLdapAttribute", "*");

  for (let i = 0; i < list.length; i++) {
    if (list[i].getAttribute("dctLdapAttribute") != "") {
      directoryContactTabsElementList.push(list[i]);
    }
  }
}

/**
 * Set all widgets readonly
 */
function disableControls() {
  for (let i = 0; i < directoryContactTabsElementList.length; i++) {
    switch (directoryContactTabsElementList[i].nodeName) {

      case "checkbox":
        /* readonly does not work and disabled is not displayed correctly */
        directoryContactTabsElementList[i].setAttribute("disabled", true);
        directoryContactTabsElementList[i].onclick = function() { return false; };
        break;

      case "radiogroup":
        directoryContactTabsElementList[i].selectedIndex = -1;
        var childNodes = directoryContactTabsElementList[i].getElementsByTagName("radio");
        for (let k = 0; k < childNodes.length; k++) {
          /* readonly does not work on radio */
          childNodes[k].setAttribute("disabled", true);
        }
        break;

      default:
        directoryContactTabsElementList[i].setAttribute("readonly", true);

    }
  }
}

/**
 * Query LDAP directory
 */
function queryDirectory() {
  if ("arguments" in window && window.arguments[0]) {
    if ("abURI" in window.arguments[0]) {
      var abURI = window.arguments[0].abURI;
      var directory = GetDirectoryFromURI(abURI);

      /* Check if current address book is a LDAP directory */
      if (directory instanceof Components.interfaces.nsIAbLDAPDirectory) {
        var url = directory.lDAPURL;

        /* Define attributes to include in the request */
        for (let i = 0; i < directoryContactTabsElementList.length; i++) {
          url.addAttribute(directoryContactTabsElementList[i].getAttribute("dctLdapAttribute"));
        }

        /* Set filter on current card (with PrimaryEmail attribute) */
        url.filter = "(" + directory.attributeMap.getFirstAttribute("PrimaryEmail") + "=" + gEditCard.card.primaryEmail + ")";

        /* Launch LDAP query */
        var directoryContactTabsQuery = new ldapQuery();
        directoryContactTabsQuery.launch(url, messageCallback, null, endCallback, null);
      }
    }
  }
}

/**
 * Callback for each LDAP response
 * @param {nsILDAPURL} aLdapURL
 * @param {nsILDAPMessage} aLdapMessage
 * @param {function} aMessageCallbackParameter
 * @return {boolean} True if data are valid
 */
function messageCallback(aLdapURL, aLdapMessage, aMessageCallbackParameter) {
  /* Read attribute list in response message */
  try {
    var responseAttributes = aLdapMessage.getAttributes(new Object());
  } catch (e) {
    return false;
  }

  /* For each attribute in response message, read its values */
  for (i in responseAttributes) {

    /* Search element with current attribute value */
    for (let j = 0; j < directoryContactTabsElementList.length; j++) {
      if (directoryContactTabsElementList[j].getAttribute("dctLdapAttribute") == responseAttributes[i]) {
        switch (directoryContactTabsElementList[j].nodeName) {

          case "image":
            /* Image data: set source as data URI */
            var value = aLdapMessage.getBinaryValues(responseAttributes[i], new Object());
            var dataLength = new Object();
            var dataBytes = value[0].get(dataLength);

            directoryContactTabsElementList[j].src = "data:image/jpeg;base64," + base64encode(dataBytes);
            break;

          case "checkbox":
            var valueList = aLdapMessage.getValues(responseAttributes[i], new Object());

            /* Read dctValue attribute in XUL file in order to identify the value for the "checked" state */
            var dctValue = directoryContactTabsElementList[j].getAttribute("dctValue");

            var stateChanged = false;
            /* For each value, check if the checkbox should be checked */
            for (let k = 0; k < valueList.length; k++) {
              if ((dctValue != "" && valueList[k] == dctValue) || (dctValue == "" && (valueList[k] == "TRUE" || valueList[k] == "true"))) {
                directoryContactTabsElementList[j].setAttribute("checked", true);
                /* Disable state change */
                directoryContactTabsElementList[j].addEventListener("CheckboxStateChange", CheckboxStateChangeTrue, true);
                directoryContactTabsElementList[j].removeAttribute("disabled");

                stateChanged = true;
                break;
              }
            }

            if (!stateChanged) {
              /* Disable state change */
              directoryContactTabsElementList[j].addEventListener("CheckboxStateChange", CheckboxStateChangeFalse, true);
              directoryContactTabsElementList[j].removeAttribute("disabled");
            }
            break;

          case "radiogroup":
            var value = aLdapMessage.getValues(responseAttributes[i], new Object());
            var stringValue = value.toString();

            /* Select radio which has the correct value */
            var childNodes = directoryContactTabsElementList[j].getElementsByTagName("radio");
            for (let k = 0; k < childNodes.length; k++) {
              if (value == childNodes[k].getAttribute("dctValue")) {
                directoryContactTabsElementList[j].selectedItem = childNodes[k];
                /* Enable selected radio so as to make it more visible */
                childNodes[k].removeAttribute("disabled");
                break;
              }
            }
            break;

          case "listbox":
            var valueList = aLdapMessage.getValues(responseAttributes[i], new Object());

            /* Create a listitem for each value */
            for (let k = 0; k < valueList.length; k++) {
              var listitem = document.createElement("listitem");
              listitem.setAttribute("label", valueList[k]);
              directoryContactTabsElementList[j].appendChild(listitem);
            }
            break;

          default:
            /* textbox/label/... (widgets set with their value attribute) */
            var value = aLdapMessage.getValues(responseAttributes[i], new Object());
            directoryContactTabsElementList[j].setAttribute("value", value);
        }
      }
    }

  }

  return true;
}

/**
 * Callback at the end of the LDAP query
 */
function endCallback(aError) {
  /* Set titles of all tabs */
  for (let i = 0; i < directoryContactTabsTabList.length; i++) {
    document.getElementById("directoryContactTabsTab" + i).setAttribute("label", directoryContactTabsTabList[i].title);
  }

  /* Display error prompt if needed */
  var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
  switch (aError) {
    case ldapQuery.CONNECT_ERROR:
      promptService.alert(null, "Directory Contact Tabs", directoryContactTabsStringBundle.getString("directoryContactTabs.CONNECT_ERROR"));
      break;
    case ldapQuery.SEARCH_ERROR:
      promptService.alert(null, "Directory Contact Tabs", directoryContactTabsStringBundle.getString("directoryContactTabs.SEARCH_ERROR"));
      break;
    case ldapQuery.DATA_ERROR:
      promptService.alert(null, "Directory Contact Tabs", directoryContactTabsStringBundle.getString("directoryContactTabs.DATA_ERROR"));
      break;
    default:
      break;
  }
}
