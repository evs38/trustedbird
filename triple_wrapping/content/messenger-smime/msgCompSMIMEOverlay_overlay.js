/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * ***** BEGIN LICENSE BLOCK *****
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
 * The Original Code is mozilla.org Code.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998-2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents o    f this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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

// Global variables and constants.

// Properties bundle
const TRIPLE_WRAPPING_BUNDLE = "triple_wrapping_bundle";

// Register event listeners
window.addEventListener("load", trpwrp_OnLoadMsgComposeWindow, false);
window.addEventListener('compose-window-close', trpwrp_onComposerClose, true);
window.addEventListener('compose-window-reopen', trpwrp_onComposerReOpen, true);

// This function gets called multiple times, but only on first open, not on composer recycling
function trpwrp_OnLoadMsgComposeWindow() {

    var trpwrp_bundle = document.getElementById(TRIPLE_WRAPPING_BUNDLE);

    // Build the UI
    // Add the triple wrapping menuitem to the existing security menus
    var existing_menuitems = ["menu_securitySign1", "menu_securitySign2"];
    for (var i = 0; i < existing_menuitems.length; i++){
        var menu = document.getElementById(existing_menuitems[i]);
        if (menu) {
            // Build the menu item to add
            var newMenuItem = document.createElement("menuitem");
            newMenuItem.setAttribute("id", "menu_securityTrippleWrap" + (i + 1));
            newMenuItem.setAttribute("label", trpwrp_bundle.getString("triple_wrapping.label"));
            newMenuItem.setAttribute("type", "checkbox");
            newMenuItem.setAttribute("oncommand", "trpwrp_ToggleTrippleWrapMessage(event)");
            
            // Add the new menu item
            menu.parentNode.insertBefore(newMenuItem, menu.nextSibling);
            menu.parentNode.insertBefore(document.createElement("menuseparator"), newMenuItem);
        }
    }
    
    // Refresh the UI
    trpwrp_onComposerReOpen();
}

// Handler for 'compose-window-reopen' event sent by MsgComposeCommands.js
function trpwrp_onComposerReOpen() {
    // Load preferences
    gSMFields.tripleWrapMessage = gCurrentIdentity.getBoolAttribute("triple_wrap_mail");
    trpwrp_setTrippleWrapUI(gSMFields.tripleWrapMessage);
}

// Handler for 'compose-window-close' event sent by MsgComposeCommands.js
function trpwrp_onComposerClose() {
    trpwrp_setTrippleWrapUI(false);
}

// Toggle triple wrap flag and update UI
function trpwrp_ToggleTrippleWrapMessage(event) {
    if (!gSMFields) {
        return;
    }

    // Toggle trippleWrap flag
    gSMFields.tripleWrapMessage = !gSMFields.tripleWrapMessage;

    // make sure we have a cert name for encrypting and one for signing ...
    if (gSMFields.tripleWrapMessage) {
        var signingCertName = gCurrentIdentity.getUnicharAttribute("signing_cert_name");
        var encryptionCertName = gCurrentIdentity.getUnicharAttribute("encryption_cert_name");

        if (!signingCertName || !encryptionCertName) {
            gSMFields.tripleWrapMessage = false;
            showNeedSetupInfo();
            
            // Stop even propagation to prevent default security menu handler
            event.stopPropagation();
            return;
        }

        // Enable encryption
        encryptMessage();
        
        // Enable signing if disable
        if (!gSMFields.signMessage) {
            signMessage();
        }
        
        trpwrp_setTrippleWrapUI(true);
        
    } else {
        trpwrp_setTrippleWrapUI(false);
    }
    
    // Stop even propagation to prevent default security menu handler
    event.stopPropagation();
}
  
// Update the UI
function trpwrp_setTrippleWrapUI(isEnable) {
    top.document.getElementById("securityStatus").setAttribute("triple_wrapping", (isEnable) ? "ok" : "");
    top.document.getElementById("triple_wrapping-status").collapsed = isEnable;
}

// Replace the built in setSecuritySettings function defined in msgCompSMIMEOverlay.js with our own ...
// This is done to add some code, but then we still call the original function.
trpwrp_OriginalSetSecuritySettings = setSecuritySettings;
setSecuritySettings = function trpwrp_setSecuritySettings(menu_id) {
    
    // Call built in setSecuritySettings function
    trpwrp_OriginalSetSecuritySettings(menu_id);
    
    // Enable or disable menuitem "sign" and "encrypt" according to trippleWrapMessage flag
    document.getElementById("menu_securityEncryptRequire" + menu_id).setAttribute("disabled", gSMFields.tripleWrapMessage);
    document.getElementById("menu_securityNoEncryption" + menu_id).setAttribute("disabled", gSMFields.tripleWrapMessage);
    document.getElementById("menu_securitySign" + menu_id).setAttribute("disabled", gSMFields.tripleWrapMessage);
  
    // Set checked status for trippleWrapMessage menuitem
    document.getElementById("menu_securityTrippleWrap" + menu_id).setAttribute("checked", gSMFields.tripleWrapMessage);
}