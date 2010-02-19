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

/* Entry point: onInit (am-addressing.js) */
var onInitOrig = onInit;
onInit = function() {
    onInitOrig();

    initMultiLDAPGui();
}

/* Entry point: initCompositionAndAddressing (am-identity-edit.js) */
if (typeof initCompositionAndAddressing == "function") {
    var initCompositionAndAddressingOrig = initCompositionAndAddressing;
    initCompositionAndAddressing = function(identity) {
        initCompositionAndAddressingOrig(identity);

        initMultiLDAPGui();
    }
}

/* Entry point: saveAddressingAndCompositionSettings (am-identity-edit.js) */
if (typeof saveAddressingAndCompositionSettings == "function") {
    saveAddressingAndCompositionSettings = function(identity) {
        /* Save fields here instead of saveAddressingAndCompositionSettings in am-identity-edit.js */
        identity.composeHtml = document.getElementById('identity.composeHtml').checked;
        identity.autoQuote = document.getElementById('identity.autoQuote').checked;
        identity.replyOnTop = document.getElementById('identity.replyOnTop').value;
        identity.sigBottom = document.getElementById('identity.sig_bottom').value == 'true';
        identity.sigOnReply = document.getElementById('identity.sig_on_reply').checked;
        identity.sigOnForward = document.getElementById('identity.sig_on_fwd').checked;

        /* Save our LDAP fields */
        onSave(identity);
    }
}

/* Entry point: onSave */
function onSave(identity) {
    var identityKey;
    if (identity !== undefined)
        identityKey = identity.key;
    else
        identityKey = gIdentity.key;

    var listbox = document.getElementById("directoryListMultiLDAP");
    if (listbox) {
        trustedBird_prefService_setBoolPref("mail.identity." + identityKey + ".overrideGlobal_Pref.multi-ldap", (document.getElementById("identity.overrideGlobal_Pref.multi-ldap").value == "true"));
        trustedBird_prefService_setIntPref("mail.identity." + identityKey + ".autoComplete.minStringLength", document.getElementById("autocompleteMinStringLength").value);

        var elements = listbox.getElementsByTagName("checkbox");
        for (var i = 0; i < elements.length; i++)
            trustedBird_prefService_setBoolPref("mail.identity." + identityKey + "." + elements[i].getAttribute("id"), elements[i].checked);
    }
}

function initMultiLDAPGui() {
    var element = document.getElementById("identity.overrideGlobal_Pref");
    if (!element) {
        dump("Multi-LDAP add-on: can't get find \"identity.overrideGlobal_Pref\" node in order to update GUI!\n");
        return;
    }

    var multiLDAPStringBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService).createBundle("chrome://multi-ldap/locale/account/am-addressing.properties");

    if (gIdentity)
        identityKey = gIdentity.key;
    else
        identityKey = "undefined";

    /* Remove current widgets */
    var parent = element.parentNode;
    parent.removeChild(element);

    /* Override global prefs radios */
    var radiogroup = document.createElement("radiogroup");
    radiogroup.setAttribute("id", "identity.overrideGlobal_Pref.multi-ldap");
    radiogroup.setAttribute("oncommand", "enableAutocomplete();");
    radiogroup.setAttribute("value", trustedBird_prefService_getBoolPref("mail.identity." + identityKey + ".overrideGlobal_Pref.multi-ldap") ? "true" : "false");
    radiogroup.setAttribute("class", "indent");
    parent.appendChild(radiogroup);

    var radio1 = document.createElement("radio");
    radio1.setAttribute("label", multiLDAPStringBundle.GetStringFromName("customizeDirectoryListFalse"));
    radio1.setAttribute("selected", !trustedBird_prefService_getBoolPref("mail.identity." + identityKey + ".overrideGlobal_Pref.multi-ldap"));
    radio1.setAttribute("value", "false");
    radio1.setAttribute("accesskey", multiLDAPStringBundle.GetStringFromName("customizeDirectoryListFalse.accesskey"));
    radiogroup.appendChild(radio1);

    var radio2 = document.createElement("radio");
    radio2.setAttribute("label", multiLDAPStringBundle.GetStringFromName("customizeDirectoryListTrue"));
    radio2.setAttribute("selected", trustedBird_prefService_getBoolPref("mail.identity." + identityKey + ".overrideGlobal_Pref.multi-ldap"));
    radio2.setAttribute("value", "true");
    radio2.setAttribute("accesskey", multiLDAPStringBundle.GetStringFromName("customizeDirectoryListTrue.accesskey"));
    radiogroup.appendChild(radio2);

    /* Directory list */
    var listbox = document.createElement("listbox");
    listbox.setAttribute("id", "directoryListMultiLDAP");
    listbox.setAttribute("rows", "3");
    listbox.setAttribute("class", "indent");
    radiogroup.appendChild(listbox);

    var hbox = document.createElement("hbox");
    hbox.setAttribute("align", "center");
    radiogroup.appendChild(hbox);

    var button = document.createElement("button");
    button.setAttribute("id", "editButton");
    button.setAttribute("label", multiLDAPStringBundle.GetStringFromName("editDirectoriesButton"));
    button.setAttribute("oncommand", "onEditDirectories(); fillDirectoryList();");
    button.setAttribute("accesskey", multiLDAPStringBundle.GetStringFromName("editDirectoriesButton.accesskey"));
    hbox.appendChild(button);

    /* autocompleteMinStringLength */
    var hbox2 = document.createElement("hbox");
    hbox2.setAttribute("align", "center");
    radiogroup.appendChild(hbox2);

    var label1 = document.createElement("label");
    label1.setAttribute("value", multiLDAPStringBundle.GetStringFromName("autocompleteFromDirectories"));
    label1.setAttribute("control", "autocompleteMinStringLength");
    hbox2.appendChild(label1);

    var textbox = document.createElement("textbox");
    textbox.setAttribute("id", "autocompleteMinStringLength");
    textbox.setAttribute("size", "3");
    textbox.setAttribute("maxlength", "3");
    var value = trustedBird_prefService_getIntPref("mail.identity." + identityKey + ".autoComplete.minStringLength");
    if (value == 0)
        value = trustedBird_prefService_getIntPref("ldap_2.autoComplete.minStringLength", 1);
    textbox.setAttribute("value", value);
    hbox2.appendChild(textbox);

    var label2 = document.createElement("label");
    label2.setAttribute("value", multiLDAPStringBundle.GetStringFromName("characters"));
    label2.setAttribute("control", "autocompleteMinStringLength");
    hbox2.appendChild(label2);

    /* Fill directory list with checkboxes */
    fillDirectoryList(identityKey);
    enableAutocomplete();
}

function fillDirectoryList(identityKey) {
    var listbox = document.getElementById("directoryListMultiLDAP");

    /* Remove all checkboxes */
    while (listbox.removeItemAt(0)) {
    }

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

        var checkbox = document.createElement("checkbox");
        checkbox.setAttribute("id", ab.dirPrefId + ".multiLDAPSelected");
        checkbox.setAttribute("label", ab.dirName);
        checkbox.setAttribute("checked", trustedBird_prefService_getBoolPref("mail.identity." + identityKey + "." + ab.dirPrefId + ".multiLDAPSelected"));
        listcell.appendChild(checkbox);

        listbox.appendChild(listitem);
    });
}

function enableAutocomplete() {
    var overrideEnabled = (document.getElementById("identity.overrideGlobal_Pref.multi-ldap").value == "true");

    if (overrideEnabled) {
        var listbox = document.getElementById("directoryListMultiLDAP");
        if (listbox) {
            listbox.removeAttribute("disabled");
            var elements = listbox.getElementsByTagName("checkbox");
            for (var i = 0; i < elements.length; i++)
                elements[i].removeAttribute("disabled");
        }

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

        document.getElementById("editButton").setAttribute("disabled", true);

        document.getElementById("autocompleteMinStringLength").setAttribute("disabled", true);

    }
}
