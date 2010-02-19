/*
 # ***** BEGIN LICENSE BLOCK *****
 # Version: MPL 1.1/GPL 2.0/LGPL 2.1
 #
 # The contents of this file are subject to the Mozilla Public License Version
 # 1.1 (the "License"); you may not use this file except in compliance with
 # the License. You may obtain a copy of the License at
 # http://www.mozilla.org/MPL/
 #
 # Software distributed under the License is distributed on an "AS IS" basis,
 # WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 # for the specific language governing rights and limitations under the
 # License.
 #
 # The Original Code is Mozilla
 #
 # The Initial Developer of the Original Code is
 # Netscape Communications Corp..
 # Portions created by the Initial Developer are Copyright (C) 2008
 # the Initial Developer. All Rights Reserved.
 #
 # Contributor(s):
 #
 # Alternatively, the contents of this file may be used under the terms of
 # either the GNU General Public License Version 2 or later (the "GPL"), or
 # the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 # in which case the provisions of the GPL or the LGPL are applicable instead
 # of those above. If you wish to allow use of your version of this file only
 # under the terms of either the GPL or the LGPL, and not to allow others to
 # use your version of this file under the terms of the MPL, indicate your
 # decision by deleting the provisions above and replace them with the notice
 # and other provisions required by the LGPL or the GPL. If you do not delete
 # the provisions above, a recipient may use your version of this file under
 # the terms of any one of the MPL, the GPL or the LGPL.
 #
 # ***** END LICENSE BLOCK *****
 */

/* Hook to launch multi-LDAP certificate fetching before onLoad function */
var originalOnLoad = onLoad;
onLoad = function() {
    fetchMissingCertificates();
    originalOnLoad();
}

function fetchMissingCertificates() {
    /* This function is taken from onload() in msgCompSecurityInfo.js */
    var gSMimeContractID = "@mozilla.org/messenger-smime/smimejshelper;1";
    var gISMimeJSHelper = Components.interfaces.nsISMimeJSHelper;

    var params = window.arguments[0];
    if (!params)
        return;

    var helper = Components.classes[gSMimeContractID].createInstance(gISMimeJSHelper);

    if (!helper)
        return;

    var gEmailAddresses = new Object();
    var gCertStatusSummaries = new Object();
    var gCertIssuedInfos = new Object();
    var gCertExpiresInfos = new Object();
    var gCerts = new Object();
    var gCount = new Object();
    var canEncrypt = new Object();

    var allow_ldap_cert_fetching = false;

    try {
        if (params.compFields.securityInfo.requireEncryptMessage) {
            allow_ldap_cert_fetching = true;
        }
    }
    catch (e)
    {
    }

    while (true)
    {
        try
        {
            helper.getRecipientCertsInfo(
                    params.compFields,
                    gCount,
                    gEmailAddresses,
                    gCertStatusSummaries,
                    gCertIssuedInfos,
                    gCertExpiresInfos,
                    gCerts,
                    canEncrypt);
        }
        catch (e)
        {
            dump(e);
            return;
        }

        if (!allow_ldap_cert_fetching)
            break;

        allow_ldap_cert_fetching = false;

        var missing = new Array();

        for (var j = gCount.value - 1; j >= 0; --j)
        {
            if (!gCerts.value[j])
            {
                missing[missing.length] = gEmailAddresses.value[j];
            }
        }

        if (missing.length > 0)
        {
            /* Get LDAP directory list */
            var autocompleteDirectoryList = trustedBird_LDAP_getDirectoryList(params.currentIdentity.key);

            for (var i in autocompleteDirectoryList) {
                window.openDialog('chrome://messenger-smime/content/certFetchingStatus.xul',
                        '',
                        'chrome,resizable=1,modal=1,dialog=1',
                        autocompleteDirectoryList[i],
                        missing
                        );
            }

        }
    }
}
