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
 * The Original Code is Trustedbird/Multi-LDAP.
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

/* Hook original init from compose.js */
gComposePane.initOrig = gComposePane.init;
gComposePane.init = function() {
    this.initOrig();

    this.initMultiLDAPGui();
}

/* Replace LDAP directory selection GUI */
gComposePane.initMultiLDAPGui = function() {
    var box;

    try {
        box = document.getElementById("autocompleteLDAP").parentNode;
    } catch (e) {
        dump("Multi-LDAP add-on: can't get find \"autocompleteLDAP\" node in order to update GUI!\n");
        return;
    }

    var multiLDAPStringBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService).createBundle("chrome://multi-ldap/locale/preferences/compose.properties");

    /* Hide current widgets */
    for (var i = 0; i < box.childNodes.length; i++)
        box.childNodes[i].setAttribute("hidden", true);

    var vbox = document.createElement("vbox");
    vbox.setAttribute("flex", "1");
    box.appendChild(vbox);

    /* Use Directory checkbox */
    var checkbox = document.createElement("checkbox");
    checkbox.setAttribute("id", "autocompleteMultiLDAP");
    checkbox.setAttribute("label", multiLDAPStringBundle.GetStringFromName("useSelectedDirectories"));
    checkbox.setAttribute("preference", "ldap_2.autoComplete.useDirectory");
    checkbox.setAttribute("accesskey", multiLDAPStringBundle.GetStringFromName("useSelectedDirectories.accesskey"));
    vbox.appendChild(checkbox);

    /* Directory Servers list */
    var listbox = document.createElement("listbox");
    listbox.setAttribute("id", "directoryListMultiLDAP");
    listbox.setAttribute("rows", "3");
    listbox.setAttribute("class", "indent");
    vbox.appendChild(listbox);

    var hbox = document.createElement("hbox");
    hbox.setAttribute("align", "center");
    vbox.appendChild(hbox);

    var button = document.createElement("button");
    button.setAttribute("id", "editButton2");
    button.setAttribute("label", multiLDAPStringBundle.GetStringFromName("editDirectories"));
    button.setAttribute("oncommand", "gComposePane.editDirectories(); gComposePane.fillDirectoryList();");
    button.setAttribute("preference", "pref.ldap.disable_button.edit_directories");
    button.setAttribute("accesskey", multiLDAPStringBundle.GetStringFromName("editDirectories.accesskey"));
    hbox.appendChild(button);

    var hbox3 = document.createElement("hbox");
    hbox3.setAttribute("align", "center");
    hbox3.setAttribute("flex", "1");
    hbox.appendChild(hbox3);

    var spacer = document.createElement("spacer");
    spacer.setAttribute("flex", "1");
    hbox3.appendChild(spacer);

    var label3 = document.createElement("label");
    label3.setAttribute("value", "Default directory:");
    label3.setAttribute("tooltiptext", multiLDAPStringBundle.GetStringFromName("defaultDirectoryTooltip"));
    hbox3.appendChild(label3);

    var menulist = document.createElement("menulist");
    menulist.setAttribute("id", "defaultDirectoryList");
    menulist.setAttribute("preference", "ldap_2.autoComplete.directoryServer");
    menulist.setAttribute("value", document.getElementById("ldap_2.autoComplete.directoryServer").value);
    menulist.setAttribute("tooltiptext", multiLDAPStringBundle.GetStringFromName("defaultDirectoryTooltip"));

    var menupopup = document.createElement("menupopup");
    menupopup.setAttribute("id", "defaultDirectoryListPopup");
    menupopup.setAttribute("class", "addrbooksPopup");
    menupopup.setAttribute("none", multiLDAPStringBundle.GetStringFromName("noneDefaultDirectory"));
    menupopup.setAttribute("remoteonly", "true");
    menupopup.setAttribute("value", "dirPrefId");
    menulist.appendChild(menupopup);
    hbox3.appendChild(menulist);

    var hbox2 = document.createElement("hbox");
    hbox2.setAttribute("align", "center");
    vbox.appendChild(hbox2);

    var label1 = document.createElement("label");
    label1.setAttribute("value", multiLDAPStringBundle.GetStringFromName("autocompleteAfter"));
    label1.setAttribute("control", "autocompleteMinStringLength");
    hbox2.appendChild(label1);

    /* minStringLength preference */
    var minStringLengthPreference = document.createElement("preference");
    minStringLengthPreference.setAttribute("id", "ldap_2.autoComplete.minStringLength");
    minStringLengthPreference.setAttribute("name", "ldap_2.autoComplete.minStringLength");
    minStringLengthPreference.setAttribute("type", "int");
    document.getElementById("composePreferences").appendChild(minStringLengthPreference);

    var textbox = document.createElement("textbox");
    textbox.setAttribute("id", "autocompleteMinStringLength");
    textbox.setAttribute("size", "3");
    textbox.setAttribute("maxlength", "3");
    textbox.setAttribute("preference", "ldap_2.autoComplete.minStringLength");
    textbox.setAttribute("value", document.getElementById("ldap_2.autoComplete.minStringLength").value);
    hbox2.appendChild(textbox);

    var label2 = document.createElement("label");
    label2.setAttribute("value", multiLDAPStringBundle.GetStringFromName("characters"));
    label2.setAttribute("control", "autocompleteMinStringLength");
    hbox2.appendChild(label2);

    this.fillDirectoryList();
    this.enableAutocomplete();
}

gComposePane.enableAutocomplete = function() {
    if (document.getElementById("autocompleteMultiLDAP")) {

        var useDirectoryEnabled = document.getElementById("ldap_2.autoComplete.useDirectory").value;

        document.getElementById("autocompleteMultiLDAP").setAttribute("checked", useDirectoryEnabled);

        if (useDirectoryEnabled) {
            var listbox = document.getElementById("directoryListMultiLDAP");
            if (listbox) {
                listbox.removeAttribute("disabled");
                var elements = listbox.getElementsByTagName("checkbox");
                for (var i = 0; i < elements.length; i++)
                    elements[i].removeAttribute("disabled");
            }

            document.getElementById("defaultDirectoryList").removeAttribute("disabled");

            document.getElementById("editButton").removeAttribute("disabled");

            document.getElementById("autocompleteMinStringLength").removeAttribute("disabled");
        } else {
            var listbox = document.getElementById("directoryListMultiLDAP");
            if (listbox) {
                listbox.setAttribute("disabled", true);
                var elements = listbox.getElementsByTagName("checkbox");
                for (var i = 0; i < elements.length; i++)
                    elements[i].setAttribute("disabled", true);
            }

            document.getElementById("defaultDirectoryList").setAttribute("disabled", true);

            document.getElementById("editButton").setAttribute("disabled", true);

            document.getElementById("autocompleteMinStringLength").setAttribute("disabled", true);
        }
    }
}

gComposePane.fillDirectoryList = function() {
    var directoryList = document.getElementById("directoryListMultiLDAP");
    if (!directoryList)
        return;

    /* Remove existing preferences */
    var preferenceList = document.getElementById("composePreferences").getElementsByTagName("preference");
    var preferenceRegexp = /\.multiLDAPSelected$/;
    var trashArray = [];
    for (var i = 0; i < preferenceList.length; i++)
        if (preferenceRegexp.test(preferenceList[i].getAttribute("id")))
            trashArray.push(preferenceList[i]);

    trashArray.forEach(function(a) {
        document.getElementById("composePreferences").removeChild(a);
    });

    /* Remove all checkboxes */
    while (directoryList.removeItemAt(0))
        ;

    var addressBooks = Components.classes["@mozilla.org/abmanager;1"].getService(Components.interfaces.nsIAbManager).directories;

    var holdingArray = [];

    while (addressBooks && addressBooks.hasMoreElements()) {
        var ab = addressBooks.getNext();
        if (ab instanceof Components.interfaces.nsIAbDirectory && ab.isRemote)
            holdingArray.push(ab);
    }

    holdingArray.sort(function(a, b) {
        return a.dirName.localeCompare(b.dirName);
    });

    holdingArray.forEach(function(ab) {
        /* Create a listitem with checkbox for each directory */
        var listitem = document.createElement('listitem');
        listitem.setAttribute("allowevents", "true");

        var listcell = document.createElement("listcell");
        listitem.appendChild(listcell);

        /* Create a preference for each checkbox */
        var preference = document.createElement("preference");
        preference.setAttribute("id", ab.dirPrefId + ".multiLDAPSelected");
        preference.setAttribute("name", ab.dirPrefId + ".multiLDAPSelected");
        preference.setAttribute("type", "bool");
        document.getElementById("composePreferences").appendChild(preference);

        var checkbox = document.createElement("checkbox");
        checkbox.setAttribute("id", ab.dirPrefId + ".checkbox");
        checkbox.setAttribute("label", ab.dirName);
        checkbox.setAttribute("preference", ab.dirPrefId + ".multiLDAPSelected");
        checkbox.setAttribute("checked", document.getElementById(ab.dirPrefId + ".multiLDAPSelected").value);
        listcell.appendChild(checkbox);

        directoryList.appendChild(listitem);
    });
}
