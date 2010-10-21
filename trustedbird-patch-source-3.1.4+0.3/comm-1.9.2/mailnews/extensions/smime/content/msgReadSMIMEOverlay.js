/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
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
 * The Original Code is Netscape Communicator.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2002
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Eric Ballet Baz / BT Global Services / Etat francais - Ministere de la Defense
 *   Raphael Fairise / BT Global Services / Etat francais - Ministere de la Defense
 *   Copyright (c) 2010 CASSIDIAN - All rights reserved
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

var gEncryptionStatus = -1;
var gSignatureStatus = -1;
var gSignerCert = null;
var gEncryptionCert = null;
var gSecurityPolicyIdentifier = null;
var gSecurityClassification = -1;
var gPrivacyMark = null;
var gSecurityCategories = null;
var gSecurityLabelConf = null;
var gSecureHeaders = "";
var gSecureHeadersState=-1;

addEventListener("load", smimeReadOnLoad, false);

function smimeReadOnLoad()
{
  removeEventListener("load", smimeReadOnLoad, false);

  top.controllers.appendController(SecurityController);

  addEventListener("unload", smimeReadOnUnload, false);

  Components.classes["@mozilla.org/observer-service;1"]
            .getService(Components.interfaces.nsIObserverService)
            .addObserver(securityLabelCreateDbObserver, "MsgCreateDBView", false);

  if (!gSecurityLabelConf)
    gSecurityLabelConf = new securityLabelConf();
}

function smimeReadOnUnload()
{
  removeEventListener("unload", smimeReadOnUnload, false);

  top.controllers.removeController(SecurityController);

  Components.classes["@mozilla.org/observer-service;1"]
            .getService(Components.interfaces.nsIObserverService)
            .removeObserver(securityLabelCreateDbObserver, "MsgCreateDBView");
}

function showImapSignatureUnknown()
{
  let readSmimeBundle = document.getElementById("bundle_read_smime");
  let brandBundle = document.getElementById("bundle_brand");
  if (!readSmimeBundle || !brandBundle)
    return;

  let promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                .getService(Components.interfaces.nsIPromptService);
  if (promptService &&
      promptService.confirm(window, brandBundle.getString("brandShortName"),
                                    readSmimeBundle.getString("ImapOnDemand")))
    gDBView.reloadMessageWithAllParts();
}

function showMessageReadSecurityInfo()
{
  let gSignedUINode = document.getElementById("signedHdrIcon");
  if (gSignedUINode && gSignedUINode.getAttribute("signed") == "unknown")
  {
    showImapSignatureUnknown();
    return;
  }

  let pkiParams = Components.classes["@mozilla.org/security/pkiparamblock;1"]
                            .createInstance(Components.interfaces.nsIPKIParamBlock);

  // isupport array starts with index 1
  pkiParams.setISupportAtIndex(1, gSignerCert);
  pkiParams.setISupportAtIndex(2, gEncryptionCert);

  var params = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);
  // int array starts with index 0, but that is used for window exit status
  params.SetInt(1, gSignatureStatus);
  params.SetInt(2, gEncryptionStatus);
  params.SetInt(3, gSecurityClassification);
  params.SetInt(4,gSecureHeadersState);

  params.SetString(0, gSecurityPolicyIdentifier);
  params.SetString(1, gPrivacyMark);
  params.SetString(2, gSecurityCategories);
  params.SetString(12,gSecureHeaders);

  window.openDialog("chrome://messenger-smime/content/msgReadSecurityInfo.xul",
                    "", "chrome,resizable=1,modal=1,dialog=1", pkiParams);
}

var SecurityController =
{
  supportsCommand: function(command)
  {
    switch (command)
    {
      case "cmd_viewSecurityStatus":
        return true;

      default:
        return false;
    }
  },

  isCommandEnabled: function(command)
  {
    switch (command)
    {
      case "cmd_viewSecurityStatus":
        if (document.documentElement.getAttribute('windowtype') == "mail:messageWindow")
          return GetNumSelectedMessages() > 0;

        if (GetNumSelectedMessages() > 0 && gDBView)
        {
          let enabled = {value: false};
          let checkStatus = {};
          gDBView.getCommandStatus(nsMsgViewCommandType.cmdRequiringMsgBody,
                                   enabled, checkStatus);
          return enabled.value;
        }
        // else: fall through.

      default:
        return false;
    }
  }
};

/* Add Security Label column */
var securityLabelCreateDbObserver = {
  observe: function(aMsgFolder, aTopic, aData) {
    try {
      if (gDBView != undefined && gDBView.addColumnHandler)
        gDBView.addColumnHandler("securityLabelSecurityClassificationColumn", securityLabelSecurityClassificationColumnHandler);
    } catch(e) {}
  }
}

var securityLabelSecurityClassificationColumnHandler = {
  getCellText: function(row, column) {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);
    var securityLabelSecurityPolicyIdentifier = hdr.getStringProperty("securityLabelSecurityPolicyIdentifier");
    var securityLabelSecurityClassification = hdr.getStringProperty("securityLabelSecurityClassification");

    if (securityLabelSecurityPolicyIdentifier != "" && securityLabelSecurityClassification != "" && securityLabelSecurityClassification != "-1")
      return gSecurityLabelConf.getSecurityClassificationName(securityLabelSecurityPolicyIdentifier, securityLabelSecurityClassification);

    return "";
  },
  getSortStringForRow: function(hdr) {
    var securityLabelSecurityPolicyIdentifier = hdr.getStringProperty("securityLabelSecurityPolicyIdentifier");
    var securityLabelSecurityClassification = hdr.getStringProperty("securityLabelSecurityClassification");

    if (securityLabelSecurityPolicyIdentifier != "") {
      if (securityLabelSecurityClassification != "" && securityLabelSecurityClassification != "-1") {
        if (securityLabelSecurityClassification < 10)
          return "00" + securityLabelSecurityClassification;
        else if (securityLabelSecurityClassification < 100)
          return "0" + securityLabelSecurityClassification;
        else
          return securityLabelSecurityClassification;
      }
    }
    return "";
  },
  isString:          function() {return true;},
  getCellProperties: function(row, col, props){ },
  getRowProperties:  function(row, props){ },
  getImageSrc:       function(row, col) {return null;},
  getSortLongForRow: function(hdr) {return 0;}
}
