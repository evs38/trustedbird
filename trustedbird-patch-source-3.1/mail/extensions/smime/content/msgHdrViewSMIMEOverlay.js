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
#   Scott MacGregor <mscott@netscape.com>
#   ESS Signed Receipts: Raphael Fairise / BT Global Services / Etat francais - Ministere de la Defense
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

var gSignedUINode = null;
var gEncryptedUINode = null;
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

    gSignatureStatus = aSignatureStatus;
    gSignerCert = aSignerCert;

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
      gMyLastEncryptedURI = gFolderDisplay.selectedMessageUris[0];
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

  // Check the SMIME receipt request and send a receipt
  SMIMEReceiptRequestStatus: function(aSignedContentIdentifier,
                                      aSignedContentIdentifierLen,
                                      aReceiptsFrom,
                                      aReceiptsTo,
                                      aOriginatorSignatureValue,
                                      aOriginatorSignatureValueLen,
                                      aOriginatorContentType,
                                      aOriginatorContentTypeLen,
                                      aMsgSigDigest,
                                      aMsgSigDigestLen)
  {
    var msgHdr = gMessageDisplay.displayedMessage;
    var msgFolder = gFolderDisplay.displayedFolder;

    if (!msgFolder || !(msgFolder.isSpecialFolder(Components.interfaces.nsMsgFolderFlags.Mail, true)))
      return;

    if (msgFolder.isSpecialFolder(Components.interfaces.nsMsgFolderFlags.Trash, true) ||
        msgFolder.isSpecialFolder(Components.interfaces.nsMsgFolderFlags.Queue, true) ||
        msgFolder.isSpecialFolder(Components.interfaces.nsMsgFolderFlags.Junk, true) ||
        msgFolder.isSpecialFolder(Components.interfaces.nsMsgFolderFlags.Templates, true) ||
        msgFolder.isSpecialFolder(Components.interfaces.nsMsgFolderFlags.Drafts, true))
      return;

    // Check if message has been deleted
    if (msgHdr.flags & Components.interfaces.nsMsgMessageFlags.IMAPDeleted)
      return;

    // Check if message is marked as junk
    var junkScore = msgHdr.getStringProperty("junkscore");
    if (junkScore != "" && junkScore != "0")
      return;

    // Write S/MIME receipt request properties in message db
    if (msgHdr.getStringProperty("SMIMEReceiptType") == "") {
      msgHdr.setStringProperty("SMIMEReceiptType", "request");
      msgHdr.setStringProperty("SMIMEReceiptSignedContentIdentifier", aSignedContentIdentifier);
      msgHdr.setStringProperty("SMIMEReceiptOriginatorSignatureValue", aOriginatorSignatureValue);
      msgHdr.setStringProperty("SMIMEReceiptOriginatorContentType", aOriginatorContentType);
      msgHdr.setStringProperty("SMIMEReceiptMsgSigDigest", aMsgSigDigest);
    }

    // Check in local message database if this request has already been processed
    if (msgHdr.getStringProperty("SMIMEReceiptRequestProcessed") != "")
      return;

    // Check in IMAP if this request has already been processed
    var keywords = msgHdr.getStringProperty("keywords");
    if (keywords != "" && keywords.indexOf("smimereceiptrequestprocessed") != -1)
    {
      // If IMAP flag is set, write it in local message db
      msgHdr.setStringProperty("SMIMEReceiptRequestProcessed", "true");
      return;
    }

    mimeHeaders = getMessageHeaders(msgHdr);
    if (!mimeHeaders)
      return;

    // Create and send a receipt
    var SMIMEReceiptGenerator = Components.classes["@mozilla.org/messenger-smime/smimereceiptgenerator;1"]
                                          .createInstance(Components.interfaces.nsIMsgSMIMEReceiptGenerator);
    var askUser = SMIMEReceiptGenerator.process(msgWindow,
                                                msgFolder,
                                                msgHdr.messageKey,
                                                mimeHeaders,
                                                aSignedContentIdentifier,
                                                aSignedContentIdentifierLen,
                                                aReceiptsFrom,
                                                aReceiptsTo,
                                                aOriginatorSignatureValue,
                                                aOriginatorSignatureValueLen,
                                                aOriginatorContentType,
                                                aOriginatorContentTypeLen,
                                                aMsgSigDigest,
                                                aMsgSigDigestLen);

    if (askUser)
      gMessageNotificationBar.setSMIMEReceiptRequestMsg(SMIMEReceiptGenerator, aReceiptsTo);
  },

  // Check the SMIME receipt with the request
  SMIMEReceiptStatus: function(aSignedContentIdentifier,
                               aSignedContentIdentifierLen,
                               aOriginatorSignatureValue,
                               aOriginatorSignatureValueLen,
                               aOriginatorContentType,
                               aOriginatorContentTypeLen,
                               aMsgSigDigest,
                               aMsgSigDigestLen)
  {
    var msgHdr = gMessageDisplay.displayedMessage;

    // Write S/MIME receipt properties in message db
    if (msgHdr.getStringProperty("SMIMEReceiptType") == "") {
      msgHdr.setStringProperty("SMIMEReceiptType", "receipt");
      msgHdr.setStringProperty("SMIMEReceiptSignedContentIdentifier", aSignedContentIdentifier);
      msgHdr.setStringProperty("SMIMEReceiptOriginatorSignatureValue", aOriginatorSignatureValue);
      msgHdr.setStringProperty("SMIMEReceiptOriginatorContentType", aOriginatorContentType);
      msgHdr.setStringProperty("SMIMEReceiptMsgSigDigest", aMsgSigDigest);
    }

    var requestMsgHdr = null;

    // Find and compare the request properties with this receipt
    try {
      let allFolders = Components.classes["@mozilla.org/supports-array;1"]
                                 .createInstance(Components.interfaces.nsISupportsArray);
      msgHdr.folder.rootFolder.ListDescendents(allFolders);

      // Search the request in all folders
      for each (let folder in fixIterator(allFolders, Components.interfaces.nsIMsgFolder)) {

        if (folder.isSpecialFolder(Components.interfaces.nsMsgFolderFlags.Trash, true) ||
            folder.isSpecialFolder(Components.interfaces.nsMsgFolderFlags.Queue, true) ||
            folder.isSpecialFolder(Components.interfaces.nsMsgFolderFlags.Junk, true) ||
            folder.isSpecialFolder(Components.interfaces.nsMsgFolderFlags.Templates, true) ||
            folder.isSpecialFolder(Components.interfaces.nsMsgFolderFlags.Drafts, true))
          continue;

        var enumerator = folder.getDBFolderInfoAndDB({}).EnumerateMessages();
        while (enumerator.hasMoreElements()) {
          let itemMsgHdr = enumerator.getNext().QueryInterface(Components.interfaces.nsIMsgDBHdr);

          if (itemMsgHdr.getStringProperty("SMIMEReceiptType") == "request") {
            if (itemMsgHdr.getStringProperty("SMIMEReceiptSignedContentIdentifier") == aSignedContentIdentifier &&
                itemMsgHdr.getStringProperty("SMIMEReceiptOriginatorSignatureValue") == aOriginatorSignatureValue &&
                itemMsgHdr.getStringProperty("SMIMEReceiptOriginatorContentType") == aOriginatorContentType &&
                itemMsgHdr.getStringProperty("SMIMEReceiptMsgSigDigest") == aMsgSigDigest) {
              requestMsgHdr = itemMsgHdr;
              break;
            }
          }
        }

        if (requestMsgHdr)
          break;

      }
    } catch (e) {}

    gMessageNotificationBar.setSMIMEReceiptMsg(requestMsgHdr);
  },

  securityLabelStatus: function(aSecurityPolicyIdentifier, aSecurityClassification, aPrivacyMark, aSecurityCategories)
  {
    gSecurityPolicyIdentifier = aSecurityPolicyIdentifier;
    gSecurityClassification = aSecurityClassification;
    gPrivacyMark = aPrivacyMark;
    gSecurityCategories = aSecurityCategories;

    /* Add Security Label info in message database so as to be displayed in a column */
    var msgHdr = gMessageDisplay.displayedMessage;
    if (msgHdr && gSecurityPolicyIdentifier != "") {
      /* Write Security Label in message database */
      msgHdr.setStringProperty("securityLabelSecurityPolicyIdentifier", gSecurityPolicyIdentifier);
      msgHdr.setStringProperty("securityLabelSecurityClassification", gSecurityClassification);
      msgHdr.setStringProperty("securityLabelPrivacyMark", gPrivacyMark);
      msgHdr.setStringProperty("securityLabelSecurityCategories", gSecurityCategories);
    }
  },

  QueryInterface : function(iid)
  {
    if (iid.equals(Components.interfaces.nsIMsgSMIMEHeaderSink) || iid.equals(Components.interfaces.nsISupports))
      return this;
    throw Components.results.NS_NOINTERFACE;
  }
};

function getMessageHeaders(aMsgDBHdr) {
  if (!aMsgDBHdr) return null;

  try {

    var streamListener = Components.classes["@mozilla.org/network/sync-stream-listener;1"].createInstance(Components.interfaces.nsISyncStreamListener);
    var msgURI = aMsgDBHdr.folder.getUriForMsg(aMsgDBHdr);
    var inputStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance().QueryInterface(Components.interfaces.nsIScriptableInputStream);
    inputStream.init(streamListener);
    messenger.messageServiceFromURI(msgURI).streamMessage(msgURI, streamListener, null, null, false, null);

    var content = "";

    while (inputStream.available()) {
      content += inputStream.read(512);
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
    }
    content += "\r\n";

    var headers = content.split(/\r\n\r\n|\r\r|\n\n/, 1)[0];
    var mimeHeaders = Components.classes["@mozilla.org/messenger/mimeheaders;1"]
                                .createInstance(Components.interfaces.nsIMimeHeaders);
    mimeHeaders.initialize(headers, headers.length);

    return mimeHeaders;

  } catch (e) {
    dump("getMessageHeaders exception: " + e + "\n");
  }

  return null;
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
  removeEventListener('messagepane-loaded', msgHdrViewSMIMEOnLoad, true);
  removeEventListener('messagepane-unloaded', msgHdrViewSMIMEOnUnload, true);
  removeEventListener('messagepane-hide', msgHdrViewSMIMEOnMessagePaneHide, true);
  removeEventListener('messagepane-unhide', msgHdrViewSMIMEOnMessagePaneUnhide, true);
}

function msgHdrViewSMIMEOnMessagePaneHide()
{
  gSMIMEContainer.collapsed = true;
  gSignedUINode.collapsed = true;
  gEncryptedUINode.collapsed = true;
}

function msgHdrViewSMIMEOnMessagePaneUnhide()
{
  if (gEncryptionStatus != -1 || gSignatureStatus != -1)
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
  }
}

addEventListener('messagepane-loaded', msgHdrViewSMIMEOnLoad, true);
addEventListener('messagepane-unloaded', msgHdrViewSMIMEOnUnload, true);
addEventListener('messagepane-hide', msgHdrViewSMIMEOnMessagePaneHide, true);
addEventListener('messagepane-unhide', msgHdrViewSMIMEOnMessagePaneUnhide, true);
