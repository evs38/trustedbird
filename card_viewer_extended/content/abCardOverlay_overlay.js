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
 *   BT Global Services / Etat francais Ministere de la Defense
 * Portions created by the Initial Developer are Copyright (C) 1998-2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Eric Ballet Baz BT Global Services / Etat francais Ministere de la Defense
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

// URL of the window dialog to call
const CARDVEXT_CERTIFICATE_FETCHING_DIALOG_WINDOW_URL = 'chrome://card_viewer_extended/content/certificateFetchingStatuts.xul';

// String bundle resource
var cardvext_stringBundle;

// Main entry point : show to the user the certificate of the current card
function cardvext_showCurrentCertificate() {

    // Init the string bundle resource
    cardvext_stringBundle = document.getElementById('card_viewer_extended_stringbundle');

    // Get the email of the selected user's card
    var email = cardvext_getEmail();
    if (!email) {
        alert(cardvext_stringBundle.getString("no_email_found"));
        return;
    }

    // First try to retrieve the certificate from local storage
    var certificate = null;
    var certDB = Components.classes["@mozilla.org/security/x509certdb;1"].getService(Components.interfaces.nsIX509CertDB);
    try {
        certificate = certDB.findCertByEmailAddress(null, email);

    } catch (e) {
        // No certificate found : silently ignore this exception
    }

    // if certificate isn't found try to retrieve it from LDAP
    if (!certificate) {
        // Use an array to pass the argument to the dialog window
        // in order to be able to return a modified value
        var certificate_bytes = null;
        var certificate_length = 0;
        var argHolder = [email, certificate_bytes, certificate_length];

        // Open the dialog window that will block the user until fectching from LDAP is done
        window.openDialog(
            CARDVEXT_CERTIFICATE_FETCHING_DIALOG_WINDOW_URL,
            'cardvext_certificateFetchingStatuts', // Dummy name
            'chrome,resizable=0,modal=1,dialog=1', // Modal: block user
            argHolder
        );

        // Fetch the certificate's datas from the dialog window
        certificate_bytes = argHolder[1];
        certificate_length = argHolder[2];

        // Certificate has been found in LDAP, import it in local storage
        if (certificate_bytes) {
            // Import certificate
            certDB.importEmailCertificate(certificate_bytes, certificate_length.value, null);

            // Reload the certificate as a X509 object
            try {
                certificate = certDB.findCertByEmailAddress(null, email);
            } catch (e) {
                // No certificate found : silently ignore this exception
                // This could happen for example if certificate doesn't contains the same email as the one defined in LDAP !
            }
        }
    }

    // Display the certificate if found 
    if (certificate) {
        cardvext_viewCertHelper(certificate);

    // Else alert the user
    } else {
        alert(cardvext_stringBundle.getString("no_certificate_found"));
    }
}

// Helper to show to the user the specified certificate
function cardvext_viewCertHelper(certificate) {
    if (!certificate)
        return;

    var cd = Components.classes["@mozilla.org/nsCertificateDialogs;1"].getService(Components.interfaces.nsICertificateDialogs);
    cd.viewCert(window, certificate);
}

// Retrieve the email of the selected user's card
function cardvext_getEmail() {
    var primaryEmail = document.getElementById("PrimaryEmail");
    return primaryEmail.value;
}