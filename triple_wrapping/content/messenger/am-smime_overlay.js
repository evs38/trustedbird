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
 * Alternatively, the contents of this file may be used under the terms of
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

// Pointer to the GUI element for the triple wrapping selection.
var trpwrp_tripleWrapMessages  = null;
 
// Replace the built in onInit function defined in am-smime.js with our own ... 
// This is done to add some code, but then we still call the original function.
trpwrp_OriginalOnInit = onInit;
onInit = function trpwrp_onInit() {

    // Call the built in function
    trpwrp_OriginalOnInit();
    
    // Initialize our elements based on the current identity values ...
    trpwrp_tripleWrapMessages = document.getElementById("identity.triple_wrap_mail");
    trpwrp_tripleWrapMessages.checked = gIdentity.getBoolAttribute("triple_wrap_mail");
    
    // Update UI to match selected choice
    trpwrp_updateTrippleWrapUI();
}

// Replace the built in onSave function defined in am-smime.js with our own ... 
// This is done to add some code, but then we still call the original function.
trpwrp_OriginalOnSave = onSave;
onSave = function trpwrp_onSave() {
   
    // Call the built in function
    trpwrp_OriginalOnSave();
    
    // Save the preferences
    gIdentity.setBoolAttribute("triple_wrap_mail",  trpwrp_tripleWrapMessages.checked);
}

// Replace the built in smimeClearCert function defined in am-smime.js with our own ... 
// This is done to add some code, but then we still call the original function.
trpwrp_OriginalSmimeClearCert = smimeClearCert;
smimeClearCert = function trpwrp_smimeClearCert(smime_cert) {
    // Call the built in function
    trpwrp_OriginalSmimeClearCert(smime_cert);
    
    // Update UI to match selected choice
    trpwrp_updateTrippleWrapUI();
}

// Replace the built in smimeClearCert function defined in am-smime.js with our own ... 
// This is done to add some code, but then we still call the original function.
trpwrp_OriginalSmimeSelectCert = smimeSelectCert;
smimeSelectCert = function trpwrp_smimeSelectCert(smime_cert) {
    // Call the built in function
    trpwrp_OriginalSmimeSelectCert(smime_cert);
    
    // Update UI to match selected choice
    trpwrp_updateTrippleWrapUI();
}

// Toggle triple wrap flag and update UI
function trpwrp_ToggleTripleWrapMail() {
    // Toggle triple wrap flag
    trpwrp_tripleWrapMessages.checked != trpwrp_tripleWrapMessages.checked;
    
    // If triple wrapping is enable, force signing and encryption
    if (trpwrp_tripleWrapMessages.checked) {
        gSignMessages.checked = true;
        gEncryptionChoices.value = gEncryptAlways.value;
    }
    
    // Update UI to match selected choice
    trpwrp_updateTrippleWrapUI();
}

// Update UI to match selected choice
function trpwrp_updateTrippleWrapUI() {
    // Disable or enable signing and encryption part
    gSignMessages.setAttribute("disabled", trpwrp_tripleWrapMessages.checked || !gSignCertName.value);
    document.getElementById("signingCertClearButton").setAttribute("disabled", trpwrp_tripleWrapMessages.checked || !gSignCertName.value);
    document.getElementById("signingCertSelectButton").setAttribute("disabled", trpwrp_tripleWrapMessages.checked);
    
    gEncryptAlways.setAttribute("disabled", trpwrp_tripleWrapMessages.checked || !gEncryptionCertName.value);
    gNeverEncrypt.setAttribute("disabled", trpwrp_tripleWrapMessages.checked || !gEncryptionCertName.value);
    document.getElementById("encryptionCertClearButton").setAttribute("disabled", trpwrp_tripleWrapMessages.checked || !gEncryptionCertName.value);
    document.getElementById("encryptionCertSelectButton").setAttribute("disabled", trpwrp_tripleWrapMessages.checked);
    
    // Disable triple wrapping if certificates for signing and encryption are not both defined
    if (!gSignCertName.value || !gEncryptionCertName.value) {
        trpwrp_tripleWrapMessages.setAttribute("disabled", true);
        trpwrp_tripleWrapMessages.checked = false;
    } else {
        trpwrp_tripleWrapMessages.setAttribute("disabled", false);
    }
}