/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 * Contributor(s):
 *   Eric Ballet Baz / BT Global Services / Etat francais - Ministere de la Defense
 *   Raphael Fairise / BT Global Services / Etat francais - Ministere de la Defense
 *   Copyright(c) 2011 CASSIDIAN - All rights reserved 
 *   Copyright(c) Airbus Defence and Space 2014 - All rights reserved */

Components.utils.import("resource://gre/modules/Services.jsm");

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
/*
gSecureHeadersArray[o.hdrName]={
	o.hdrName = sHeader.headerName; // signed header
	o.hdrSecureValue = sHeader.headerValue; // value in the signature
	o.hdrMimeValue = "";	// value in the MIME message
	o.hdrSignedStatus = sHeader.headerStatus;
	o.hdrCanonAlgo = aCanonAlgo;
	o.hdrEncryptStatus = "";
	o.hdrSignedRes = "valid";}
*/
const SECURE_HEADER_SEPARATOR = "###HEADER_SEPARATOR###";
const HEADER_VAL_SEPARATOR = "###HEADER_VAL###";
var gSecureHeadersArray={};
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

  if (Services.prompt.confirm(window, brandBundle.getString("brandShortName"),
                              readSmimeBundle.getString("ImapOnDemand")))
  {
    gDBView.reloadMessageWithAllParts();
  }
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
  
  gConsole.logStringMessage("[showMessageReadSecurityInfo] Signature status: " + gSignatureStatus);
  gConsole.logStringMessage("[showMessageReadSecurityInfo] gSecurityPolicyIdentifier: " + gSecurityPolicyIdentifier);
  gConsole.logStringMessage("[showMessageReadSecurityInfo] gPrivacyMark: " + gPrivacyMark);
  gConsole.logStringMessage("[showMessageReadSecurityInfo] gSecurityCategories: " + gSecurityCategories);
  gConsole.logStringMessage("[showMessageReadSecurityInfo] gSecureHeaders: " + gSecureHeaders);
  
  //create string with gSecureHeadersArray
  var arraySecureHeadersString = "";
  for (headerName in gSecureHeadersArray) { 
  	arraySecureHeadersString+=gSecureHeadersArray[headerName].hdrName+HEADER_VAL_SEPARATOR;
	arraySecureHeadersString+=gSecureHeadersArray[headerName].hdrSecureValue+HEADER_VAL_SEPARATOR; //put the value decoded instead of the value in the signature (encoded RFC2047) for the diplay
	arraySecureHeadersString+=gSecureHeadersArray[headerName].hdrMimeValue+HEADER_VAL_SEPARATOR;
	arraySecureHeadersString+=""+gSecureHeadersArray[headerName].hdrSignedStatus+HEADER_VAL_SEPARATOR;	
	arraySecureHeadersString+=gSecureHeadersArray[headerName].hdrCanonAlgo+HEADER_VAL_SEPARATOR;
	//arraySecureHeadersString+=""+gSecureHeadersArray[headerName].hdrEncryptStatus+HEADER_VAL_SEPARATOR;
	arraySecureHeadersString+=""+gSecureHeadersArray[headerName].hdrSignedRes+HEADER_VAL_SEPARATOR;
	arraySecureHeadersString+=SECURE_HEADER_SEPARATOR;
  }  
  params.SetString(13,arraySecureHeadersString);
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
