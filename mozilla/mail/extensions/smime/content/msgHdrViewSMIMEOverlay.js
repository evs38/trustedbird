# -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
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
# The Original Code is mozilla.org Code.
#
# The Initial Developer of the Original Code is
# Netscape Communications Corporation.
# Portions created by the Initial Developer are Copyright (C) 1998-2001
# the Initial Developer. All Rights Reserved.
#
# Contributor(s):
#   Scott MacGreogr <mscott@netscape.com>
#   Eric Ballet Baz / BT Global Services / Etat francais - Ministere de la Defense
#   Raphael Fairise / BT Global Services / Etat francais - Ministere de la Defense
#
# Alternatively, the contents of this file may be used under the terms of
# either the GNU General Public License Version 2 or later (the "GPL"), or
# the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
# in which case the provisions of the GPL or the LGPL are applicable instead
# of those above. If you wish to allow use of your version of this file only
# under the terms of either the GPL or the LGPL, and not to allow others to
# use your version of this file under the terms of the MPL, indicate your
# decision by deleting the provisions above and replace them with the notice
# and other provisions required by the GPL or the LGPL. If you do not delete
# the provisions above, a recipient may use your version of this file under
# the terms of any one of the MPL, the GPL or the LGPL.
#
# ***** END LICENSE BLOCK *****

const MSG_FLAG_SIGNED_RECEIPT_SENT = 0x2000000;

var gSignedUINode = null;
var gEncryptedUINode = null;
var gTripleWrappedUINode = null;
var gIsDoubleSigned = false;
var gSMIMEContainer = null;
var gStatusBar = null;

var gEncryptedURIService = null;
var gMyLastEncryptedURI = null;

var gSMIMEBundle = null;
//var gBrandBundle; -- defined in mailWindow.js

// manipulates some globals from msgReadSMIMEOverlay.js

const nsICMSMessageErrors = Components.interfaces.nsICMSMessageErrors;

var smimeHeaderSink = 
{ 
  maxWantedNesting: function()
  {
    return 1;
  },

  signedStatus: function(aNestingLevel, aSignatureStatus, aSignerCert)
  {
    if (aNestingLevel > 1) {
      // we are not interested
      return;
    }

    // Handle triple wrapping
    if (gSignatureStatus != -1) {
      gIsDoubleSigned = true;

      if (gEncryptionStatus != -1) {
        if (gSignatureStatus == nsICMSMessageErrors.SUCCESS && aSignatureStatus == nsICMSMessageErrors.SUCCESS && gEncryptionStatus == nsICMSMessageErrors.SUCCESS) {
          gTripleWrapStatus = nsICMSMessageErrors.SUCCESS;
          gTripleWrappedUINode.setAttribute("tripleWrapped", "ok");
          gStatusBar.setAttribute("tripleWrapped", "ok");
        }
        else
        {
          gTripleWrapStatus = nsICMSMessageErrors.GENERAL_ERROR;
          gTripleWrappedUINode.setAttribute("tripleWrapped", "notok");
          gStatusBar.setAttribute("tripleWrapped", "notok");
        }
      }
    }

    gSignatureStatus = aSignatureStatus;
    gSignerCert = aSignerCert;

    gSmimeReceiptType = null;
    gSignedContentIdentifier = null;
    gOriginatorSignatureValue = null;
    gOriginatorContentType = null;

    gSMIMEContainer.collapsed = false;
    gSignedUINode.collapsed = false;
  
    switch (aSignatureStatus) {
      case nsICMSMessageErrors.SUCCESS:
        gSignedUINode.setAttribute("signed", "ok");
        gStatusBar.setAttribute("signed", "ok");
        break;

      case nsICMSMessageErrors.VERIFY_NOT_YET_ATTEMPTED:
        gSignedUINode.setAttribute("signed", "unknown");
        gStatusBar.setAttribute("signed", "unknown");
        break;

      case nsICMSMessageErrors.VERIFY_CERT_WITHOUT_ADDRESS:
      case nsICMSMessageErrors.VERIFY_HEADER_MISMATCH:
        gSignedUINode.setAttribute("signed", "mismatch");
        gStatusBar.setAttribute("signed", "mismatch");
        break;

      default:
        gSignedUINode.setAttribute("signed", "notok");
        gStatusBar.setAttribute("signed", "notok");
        break;
    }
  },

  encryptionStatus: function(aNestingLevel, aEncryptionStatus, aRecipientCert)
  {
    if (aNestingLevel > 1) {
      // we are not interested
      return;
    }

    // Handle triple wrapping
    if (gIsDoubleSigned) {
      if (aEncryptionStatus == nsICMSMessageErrors.SUCCESS) {
        gTripleWrapStatus = nsICMSMessageErrors.SUCCESS;
        gTripleWrappedUINode.setAttribute("tripleWrapped", "ok");
        gStatusBar.setAttribute("tripleWrapped", "ok");
      }
      else
      {
        gTripleWrapStatus = nsICMSMessageErrors.GENERAL_ERROR;
        gTripleWrappedUINode.setAttribute("tripleWrapped", "notok");
        gStatusBar.setAttribute("tripleWrapped", "notok");
      }
    }

    gEncryptionStatus = aEncryptionStatus;
    gEncryptionCert = aRecipientCert;

    gSMIMEContainer.collapsed = false; 
    gEncryptedUINode.collapsed = false;

    if (nsICMSMessageErrors.SUCCESS == aEncryptionStatus)
    {
      gEncryptedUINode.setAttribute("encrypted", "ok");
      gStatusBar.setAttribute("encrypted", "ok");
    }
    else
    {
      gEncryptedUINode.setAttribute("encrypted", "notok");
      gStatusBar.setAttribute("encrypted", "notok");
    }
    
    if (gEncryptedURIService)
    {
      gMyLastEncryptedURI = GetLoadedMessage();
      gEncryptedURIService.rememberEncrypted(gMyLastEncryptedURI);
    }

    switch (aEncryptionStatus)
    {
    case nsICMSMessageErrors.SUCCESS:
    case nsICMSMessageErrors.ENCRYPT_INCOMPLETE:
      break;
    default:
      var brand = gBrandBundle.getString("brandShortName");
      var title = gSMIMEBundle.getString("CantDecryptTitle").replace(/%brand%/g,brand);
      var body = gSMIMEBundle.getString("CantDecryptBody").replace(/%brand%/g,brand);

      // insert our message
      msgWindow.displayHTMLInMessagePane(title,
       "<html>\n"+
       "<body bgcolor=\"#fafaee\">\n"+
       "<center><br><br><br>\n"+
       "<table>\n"+
       "<tr><td>\n"+
       "<center><strong><font size=\"+3\">\n"+
       title+"</font></center><br>\n"+
       body+"\n"+
       "</td></tr></table></center></body></html>", false);
      break;
    }
  },

  securityLabelStatus: function(aSecurityPolicyIdentifier, aSecurityClassification, aPrivacyMark, aSecurityCategories)
  {
    gSecurityPolicyIdentifier = aSecurityPolicyIdentifier;
    gSecurityClassification = aSecurityClassification;
    gPrivacyMark = aPrivacyMark;
    gSecurityCategories = aSecurityCategories;

    /* Add Security Label info in message database to be displayed in a column */
    var msgURI = GetLoadedMessage();
    if (msgURI) {
      var msgHdr = messenger.msgHdrFromURI(msgURI);
      if (gSecurityPolicyIdentifier != "") {
        /* Write Security Label in message database */
        msgHdr.setStringProperty("securityLabelSecurityPolicyIdentifier", gSecurityPolicyIdentifier);
        msgHdr.setStringProperty("securityLabelSecurityClassification", gSecurityClassification);
        msgHdr.setStringProperty("securityLabelPrivacyMark", gPrivacyMark);
        msgHdr.setStringProperty("securityLabelSecurityCategories", gSecurityCategories);

        /* Refresh tree view */
        SelectMessage(msgURI);
      }
    }
  },

  // Check the signed receipt request and send a receipt
  signedReceiptRequestStatus: function(aSignedContentIdentifier, aSignedContentIdentifierLen, aOriginatorSignatureValue, aOriginatorSignatureValueLen, aOriginatorContentType, aOriginatorContentTypeLen, aReceiptsFrom, aReceiptsTo)
  {
    var msgURI = GetLoadedMessage();
    if (!msgURI)
      return;

    var URL = createURLFromURI(msgURI);
    var msgFolder = URL.folder;

    if (!msgFolder || IsNewsMessage(msgURI))
      return;

    var msgHdr = messenger.msgHdrFromURI(msgURI);
    var mimeHdr = createHeadersFromURI(msgURI);

    gSmimeReceiptType = "request";
    gSignedContentIdentifier = aSignedContentIdentifier;
    gOriginatorSignatureValue = aOriginatorSignatureValue;
    gOriginatorContentType = aOriginatorContentType;

    // Write signed receipt request properties in message db
    msgHdr.setStringProperty("smimeReceiptType", gSmimeReceiptType);
    msgHdr.setStringProperty("smimeReceiptSignedContentIdentifier", gSignedContentIdentifier);
    msgHdr.setStringProperty("smimeReceiptOriginatorSignatureValue", gOriginatorSignatureValue);
    msgHdr.setStringProperty("smimeReceiptOriginatorContentType", gOriginatorContentType);

    // If the folder is drafts, sent, or send later don't send a receipt
    if (IsSpecialFolder(msgFolder, MSG_FOLDER_FLAG_SENTMAIL | MSG_FOLDER_FLAG_DRAFTS | MSG_FOLDER_FLAG_QUEUE, true))
      return;

    // if the message is marked as junk, do NOT attempt to process a return receipt
    // in order to better protect the user
    if (SelectedMessagesAreJunk())
      return;

    // Check if a receipt has already been sent.
    var msgFlags = msgHdr.flags;
    if ((msgFlags & MSG_FLAG_IMAP_DELETED) || (msgFlags & MSG_FLAG_SIGNED_RECEIPT_SENT))
      return;

    var signedReceiptGenerator = Components.classes["@mozilla.org/messenger/signedreceiptgenerator;1"]
      .createInstance(Components.interfaces.nsIMsgSignedReceiptGenerator);

    // Create and send a receipt
    signedReceiptGenerator.process(msgWindow, msgFolder, msgHdr.messageKey, mimeHdr, aSignedContentIdentifier, aSignedContentIdentifierLen, aOriginatorSignatureValue, aOriginatorSignatureValueLen, aOriginatorContentType, aOriginatorContentTypeLen, aReceiptsFrom, aReceiptsTo);

    // Flag message
    msgHdr.OrFlags(MSG_FLAG_SIGNED_RECEIPT_SENT);

    // Commit db changes.
    var msgdb = msgFolder.getMsgDatabase(msgWindow);
    if (msgdb)
      msgdb.Commit(ADDR_DB_LARGE_COMMIT);
  },

  signedReceiptStatus: function(aSignedContentIdentifier, aSignedContentIdentifierLen, aOriginatorSignatureValue, aOriginatorSignatureValueLen, aOriginatorContentType, aOriginatorContentTypeLen, aReceiptsFrom, aReceiptsTo)
  {
    var msgURI = GetLoadedMessage();
    if (!msgURI)
      return;

    var URL = createURLFromURI(msgURI);
    var msgFolder = URL.folder;

    if (!msgFolder || IsNewsMessage(msgURI))
      return;

    var msgHdr = messenger.msgHdrFromURI(msgURI);
    var mimeHdr = createHeadersFromURI(msgURI);

    gSmimeReceiptType = "receipt";
    gSignedContentIdentifier = aSignedContentIdentifier;
    gOriginatorSignatureValue = aOriginatorSignatureValue;
    gOriginatorContentType = aOriginatorContentType;

    // Write signed receipt properties in message db
    msgHdr.setStringProperty("smimeReceiptType", gSmimeReceiptType);
    msgHdr.setStringProperty("smimeReceiptSignedContentIdentifier", gSignedContentIdentifier);
    msgHdr.setStringProperty("smimeReceiptOriginatorSignatureValue", gOriginatorSignatureValue);
    msgHdr.setStringProperty("smimeReceiptOriginatorContentType", gOriginatorContentType);
  },

  QueryInterface : function(iid)
  {
    if (iid.equals(Components.interfaces.nsIMsgSMIMEHeaderSink) || iid.equals(Components.interfaces.nsISupports))
      return this;
    throw Components.results.NS_NOINTERFACE;
  }
};

function createHeadersFromURI(messageURI) {  
    var messageService = messenger.messageServiceFromURI(messageURI);
    var messageStream = Components.classes["@mozilla.org/network/sync-stream-listener;1"].createInstance().QueryInterface(Components.interfaces.nsIInputStream);
    var inputStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance().QueryInterface(Components.interfaces.nsIScriptableInputStream);
    inputStream.init(messageStream);
    var newuri = messageService.streamMessage(messageURI,messageStream, msgWindow, null, false, null);

    var content = "";
    inputStream.available();
    while (inputStream.available()) {
        content = content + inputStream.read(512);
        var p = content.indexOf("\r\n\r\n");
        var p1 = content.indexOf("\r\r");
        var p2 = content.indexOf("\n\n");
        if (p > 0) {
          content = content.substring(0, p);
          break;
        }
        if (p1 > 0) {
          content = content.substring(0, p1);
          break;
        }
        if (p2 > 0) {
          content = content.substring(0, p2);
          break;
        }
        if (content.length > 512 * 8)
        {
          throw "Could not find end-of-headers line.";
          return null;
        }
    }
    content = content + "\r\n";

    var headers = Components.classes["@mozilla.org/messenger/mimeheaders;1"].createInstance().QueryInterface(Components.interfaces.nsIMimeHeaders);
    headers.initialize(content, content.length);
    return headers;
}

function createURLFromURI(messageURI) {
    var messageService = messenger.messageServiceFromURI(messageURI);
    var holder = new Object();
    messageService.GetUrlForUri(messageURI, holder, null);

    holder.value.QueryInterface(Components.interfaces.nsIMsgMailNewsUrl);
    return holder.value;
}

function forgetEncryptedURI()
{
  if (gMyLastEncryptedURI && gEncryptedURIService)
  {
    gEncryptedURIService.forgetEncrypted(gMyLastEncryptedURI);
    gMyLastEncryptedURI = null;
  }
}

function onSMIMEStartHeaders()
{
  gEncryptionStatus = -1;
  gSignatureStatus = -1;
  gTripleWrapStatus = -1;
  gIsDoubleSigned = false;
  
  gSecurityPolicyIdentifier = null;
  gSecurityClassification = -1;
  gPrivacyMark = null;
  gSecurityCategories = null;

  gSignerCert = null;
  gEncryptionCert = null;
  
  gSMIMEContainer.collapsed = true;

  gSignedUINode.collapsed = true;
  gSignedUINode.removeAttribute("signed");
  gStatusBar.removeAttribute("signed");

  gEncryptedUINode.collapsed = true;
  gEncryptedUINode.removeAttribute("encrypted");
  gStatusBar.removeAttribute("encrypted");

  gTripleWrappedUINode.collapsed = true;
  gTripleWrappedUINode.removeAttribute("tripleWrapped");
  gStatusBar.removeAttribute("tripleWrapped");

  forgetEncryptedURI();
}

function onSMIMEEndHeaders()
{}

function onSmartCardChange()
{
  // only reload encrypted windows
  if (gMyLastEncryptedURI && gEncryptionStatus != -1) {
    ReloadMessage();
  }
}

function msgHdrViewSMIMEOnLoad(event)
{
  window.crypto.enableSmartCardEvents = true;
  document.addEventListener("smartcard-insert", onSmartCardChange, false);
  document.addEventListener("smartcard-remove", onSmartCardChange, false);
  if (!gSMIMEBundle)
    gSMIMEBundle = document.getElementById("bundle_read_smime");

  // we want to register our security header sink as an opaque nsISupports
  // on the msgHdrSink used by mail.....
  msgWindow.msgHeaderSink.securityInfo = smimeHeaderSink;

  gSignedUINode = document.getElementById('signedHdrIcon');
  gEncryptedUINode = document.getElementById('encryptedHdrIcon');
  gTripleWrappedUINode = document.getElementById('tripleWrappedHdrIcon');
  gSMIMEContainer = document.getElementById('smimeBox');
  gStatusBar = document.getElementById('status-bar');

  // add ourself to the list of message display listeners so we get notified when we are about to display a
  // message.
  var listener = {};
  listener.onStartHeaders = onSMIMEStartHeaders;
  listener.onEndHeaders = onSMIMEEndHeaders;
  gMessageListeners.push(listener);

  gEncryptedURIService = 
    Components.classes["@mozilla.org/messenger-smime/smime-encrypted-uris-service;1"]
    .getService(Components.interfaces.nsIEncryptedSMIMEURIsService);
}

function msgHdrViewSMIMEOnUnload(event)
{
  window.crypto.enableSmartCardEvents = false;
  document.removeEventListener("smartcard-insert", onSmartCardChange, false);
  document.removeEventListener("smartcard-remove", onSmartCardChange, false);
  forgetEncryptedURI();
}

function msgHdrViewSMIMEOnMessagePaneHide()
{
  gSMIMEContainer.collapsed = true;
  gSignedUINode.collapsed = true;
  gEncryptedUINode.collapsed = true;
  gTripleWrappedUINode.collapsed = true;
}

function msgHdrViewSMIMEOnMessagePaneUnhide()
{
  if (gEncryptionStatus != -1 || gSignatureStatus != -1 || gTripleWrapStatus != -1)
  {
    gSMIMEContainer.collapsed = false;

    if (gSignatureStatus != -1)
    {
      gSignedUINode.collapsed = false;
    }

    if (gEncryptionStatus != -1)
    {
      gEncryptedUINode.collapsed = false;
    }

    if (gTripleWrapStatus != -1)
    {
      gTripleWrappedUINode.collapsed = false;
    }
  }
}

addEventListener('messagepane-loaded', msgHdrViewSMIMEOnLoad, true);
addEventListener('messagepane-unloaded', msgHdrViewSMIMEOnUnload, true);
addEventListener('messagepane-hide', msgHdrViewSMIMEOnMessagePaneHide, true);
addEventListener('messagepane-unhide', msgHdrViewSMIMEOnMessagePaneUnhide, true);
