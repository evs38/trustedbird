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
#   Copyright (c) 2010 CASSIDIAN - All rights reserved
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
const nsIMsgSMIMESecureHeader = Components.interfaces.nsIMsgSMIMESecureHeader;
const nsIMimeConverter = Components.interfaces.nsIMimeConverter;
const nsIMIMEHeaderParam = Components.interfaces.nsIMIMEHeaderParam;
const nsIArray = Components.interfaces.nsIArray;

var gConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
var gSignedUINode = null;
var gEncryptedUINode = null;
var gSMIMEContainer = null;
var gStatusBar = null;

var gEncryptedURIService = null;
var gMyLastEncryptedURI = null;

var gSMIMEBundle = null;
//var gBrandBundle; -- defined in mailWindow.js

// manipulates some globals from msgReadSMIMEOverlay.js

const SECURE_HEADER_SEPARATOR = "###HEADER_SEPARATOR###";
const HEADER_VAL_SEPARATOR = "###HEADER_VAL###";

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
  secureHeadersStatus: function(aSecureHeaders, aCanonAlgo)
  {

	var secStatus = true; //flag for the global secure headers status, set at true as default means all secure headers were not modified
	gSecureHeaders="";	

	if(aSecureHeaders)
	{
		// gConsole.logStringMessage("*** secureHeaders analysis begin ***\ncanonization Algorithm : " + aCanonAlgo);
		gSecureHeadersState=1;
		var secureHeaders=aSecureHeaders.QueryInterface(nsIArray);
		var hdrArray=getMsgHdr(); //get selected mime message headers list 
		for(var i=0;i<secureHeaders.length;++i)
		{
			var sHeader = secureHeaders.queryElementAt(i,nsIMsgSMIMESecureHeader);
			if(sHeader){								
				var hdrName = sHeader.headerName; // signed header
				var hdrValue = sHeader.headerValue; // Value in the signature
				var hdrMimeValue = "";	// value in the MIME message				
				var hdrStatus = ""+sHeader.headerStatus;
				var hdrValidity = "valid" //set the default header validity to ok, it means the header was not modified
				var hdrCanonizValue=aCanonAlgo;
				var headerMimeExists = false;
				var tmp_hdrName = "";
				var tmp_hdrMimeName = "";
				//var headerEncrypted = sHeader.headerEncrypted;
				if(hdrStatus == "0") 
				{
					//Verify the value validity only in the case where header status is duplicated
					tmp_hdrName = hdrName;
					if(aCanonAlgo){
						 // RFC 4871 - relaxed header canonicalization algorithm - convert header field names to lowercase
						tmp_hdrName = tmp_hdrName.toLowerCase();
					}
					// gConsole.logStringMessage("secureHeadersStatus - \n check for signed header "+tmp_hdrName);
					for(var j=0;j<hdrArray.length;++j){
						tmp_hdrMimeName = hdrArray[j]._hdrName;
						if(aCanonAlgo){
							// RFC 4871 - relaxed header canonicalization algorithm - convert header field names to lowercase
							tmp_hdrMimeName = tmp_hdrMimeName.toLowerCase();
						}						
						
						// gConsole.logStringMessage("secureHeadersStatus - \nsigned header : "+tmp_hdrName+"\nmime header   : "+tmp_hdrMimeName);	
							
						if(tmp_hdrName==tmp_hdrMimeName){
							// compare secured value ans MIME value of header
							headerMimeExists = true; // header is in mime																
							hdrMimeValue=hdrArray[j]._hdrValue;																						
							var charset = getMimeValueCharset(hdrMimeValue);							
						
							// body - delete SP/WPS characters before and after body
							hdrMimeValue = deleteFirstAndLastWhiteSpace(hdrMimeValue);
							hdrValue = deleteFirstAndLastWhiteSpace(hdrValue);
														
							if(aCanonAlgo){
								hdrMimeValue = canonilizeHeaderValue(hdrMimeValue);
								hdrValue = canonilizeHeaderValue(hdrValue);
								// gConsole.logStringMessage("secureHeadersStatus - relaxed canonicalization \n mime value:\n>" +hdrMimeValue+ "<\nsigend value:\n>"+hdrValue+"<");
							}												
							
							if(hdrValue!=hdrMimeValue) //test if the header value in the signature and that one in the mime message is the same
							{
								hdrValidity="invalid"; //header was modified
								secStatus=false;
								// gConsole.logStringMessage("Warning - failed on verifing secured header "+hdrName+" :\n mime value:\n>" +hdrMimeValue+ "<\nsecured value:\n>"+hdrValue+"<");
							}
							
							// decode values from MIME format
							var mimeEncoder = Components.classes["@mozilla.org/messenger/mimeconverter;1"].getService(Components.interfaces.nsIMimeConverter);
							hdrMimeValue = mimeEncoder.decodeMimeHeader(hdrMimeValue, charset, false, true);//encodeMimePartIIStr(hdrValue, false, "ISO-8859-1" , 0, 72);
							hdrValue = mimeEncoder.decodeMimeHeader(hdrValue,charset,false,true);
							// gConsole.logStringMessage("secureHeadersStatus - header "+hdrName+" \nmime value:  >" +hdrMimeValue+ "<\nsigned value:>"+hdrValue+"<");	
							
							
							break; // header is correctly checked
						}					
					}
					
					// mime header has been lost, deleted...
					if(!headerMimeExists){						
						hdrValidity="invalid"; //header was modified
						secStatus=false;	
					}
				}
				
				//set the display secure headers information in the string to parse after in the GUI
				gSecureHeaders+=hdrName+HEADER_VAL_SEPARATOR;
				gSecureHeaders+=hdrValue+HEADER_VAL_SEPARATOR; //put the value decoded instead of the value in the signature (encoded RFC2047) for the diplay
				gSecureHeaders+=""+hdrStatus+HEADER_VAL_SEPARATOR;
				gSecureHeaders+=""+hdrValidity+HEADER_VAL_SEPARATOR;
				//gSecureHeaders+=""+headerEncrypted+HEADER_VAL_SEPARATOR;
				gSecureHeaders+=hdrMimeValue+HEADER_VAL_SEPARATOR;
				gSecureHeaders+=hdrCanonizValue+HEADER_VAL_SEPARATOR;
				gSecureHeaders+=SECURE_HEADER_SEPARATOR;
			}
		}
		
		if((!secStatus) && (gSignatureStatus == nsICMSMessageErrors.SUCCESS))
		{
			//At least one secure header was modified, set the signed status to mismastch
			gSignedUINode.setAttribute("signed", "mismatch");
			gStatusBar.setAttribute("signed", "mismatch");
			gSecureHeadersState=0;
		}
		//gConsole.logStringMessage("*** secureHeaders analysis end ***");
		
	} 
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
      if (p > 0) {
        content = content.substring(0, p);
        break;
      }
      var p1 = content.indexOf("\r\r");
      if (p1 > 0) {
        content = content.substring(0, p1);
        break;
      }
      var p2 = content.indexOf("\n\n");
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

function MsgHdrObj(){
		this._hdrName;
		this._hdrValue;
}


/**
* Get the Message header list
*/
function getMsgHdr(){
		var _HdrArray = new Array;
		var msgURI = gFolderDisplay.selectedMessageUris[0];
		var cmessenger = Components.classes["@mozilla.org/messenger;1"].createInstance(Components.interfaces.nsIMessenger);
		var msgSvc =  cmessenger.messageServiceFromURI(msgURI);
		var MsgStream =  Components.classes["@mozilla.org/network/sync-stream-listener;1"].createInstance();
 		var consumer = MsgStream.QueryInterface(Components.interfaces.nsIInputStream);
 		var ScriptInput = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance();
 		var ScriptInputStream = ScriptInput.QueryInterface(Components.interfaces.nsIScriptableInputStream);
 		ScriptInputStream.init(consumer);
 		try{
   			msgSvc.streamMessage(msgURI, MsgStream, msgWindow, null, false, null);
 		}catch (e){
   			dump("Error line " + Error().lineNumber + " : "+ e + " - file "+ Error().fileName);
   			return _HdrArray;
 		}

		// analyse des donnees du message selectionne
 		ScriptInputStream.available();
 		var content = "";
 		//var tmpBuf = "";

        // extrac headers
		// RFC 2822 :  The body is simply a sequence of characters that
		// follows the header and is separated from the header by an empty line
		// (i.e., a line with nothing preceding the CRLF).
        // TCN: in nsImapProtocol.cpp is mentioned a conversion to native line feed
        var linefeedStr = ""; // native line feed in this message (used later while retrieving headers line by line)
        while (ScriptInputStream.available()) {
          content += ScriptInputStream.read(512);
          var p = content.indexOf("\r\n\r\n");
          if (p > 0) {
            linefeedStr = "\r\n";
            content = content.substring(0, p);
            break;
          }
          var p1 = content.indexOf("\r\r");
          if (p1 > 0) {
            linefeedStr = "\r";
            content = content.substring(0, p1);
            break;
          }
          var p2 = content.indexOf("\n\n");
          if (p2 > 0) {
            linefeedStr = "\n";
            content = content.substring(0, p2);
            break;
          }
        }
		
		// unfolding mime headers
		content = UnfoldingMimeValue(content);
		
		// create array oh MIME headers
		var cur_pos_CRLF = 0; //current position of line feed (CR, CRLF or LF)
		var cur_pos_str = 0; // current position of string
		var ligne_header = "";
        //gConsole.logStringMessage("Content: " + content);
		while((cur_pos_CRLF=content.indexOf(linefeedStr,cur_pos_str))!=-1)
		{
   			ligne_header+=content.substring(cur_pos_str,cur_pos_CRLF);

            //gConsole.logStringMessage("ligne_header: " + ligne_header);
			if(ligne_header.indexOf(":",0)!=-1){
				var msghdr = new MsgHdrObj();
				// header
				msghdr._hdrName = ligne_header.substring(0,ligne_header.indexOf(":",0));				
				msghdr._hdrValue = ligne_header.substring(ligne_header.indexOf(":",0)+1);
                gConsole.logStringMessage("msghdr._hdrName: " + msghdr._hdrName);
                gConsole.logStringMessage("msghdr._hdrValue: " + msghdr._hdrValue);
				_HdrArray.push(msghdr);				
			}
			ligne_header="";
   			cur_pos_str=cur_pos_CRLF + linefeedStr.length;
		}
		return _HdrArray;
}

function getMimeValueCharset(val)
{
	var res="";
	if(val.indexOf("=?")!=-1)
	{
		val=val.substring(val.indexOf("=?")+2);
		if(val.indexOf("?")!=-1)
		{
			res=val.substring(0,val.indexOf("?"));
		}
	}
	return res;
}

function _to_utf8(s) {
  var c, d = "";
  for (var i = 0; i < s.length; i++) {
    c = s.charCodeAt(i);
    if (c <= 0x7f) {
      d += s.charAt(i);
    } else if (c >= 0x80 && c <= 0x7ff) {
      d += String.fromCharCode(((c >> 6) & 0x1f) | 0xc0);
      d += String.fromCharCode((c & 0x3f) | 0x80);
    } else {
      d += String.fromCharCode((c >> 12) | 0xe0);
      d += String.fromCharCode(((c >> 6) & 0x3f) | 0x80);
      d += String.fromCharCode((c & 0x3f) | 0x80);
    }
  }
  return d;
}

function _from_utf8(s) {
  var c, d = "", flag = 0, tmp;
  for (var i = 0; i < s.length; i++) {
    c = s.charCodeAt(i);
    if (flag == 0) {
      if ((c & 0xe0) == 0xe0) {
        flag = 2;
        tmp = (c & 0x0f) << 12;
      } else if ((c & 0xc0) == 0xc0) {
        flag = 1;
        tmp = (c & 0x1f) << 6;
      } else if ((c & 0x80) == 0) {
        d += s.charAt(i);
      } else {
        flag = 0;
      }
    } else if (flag == 1) {
      flag = 0;
      d += String.fromCharCode(tmp | (c & 0x3f));
    } else if (flag == 2) {
      flag = 3;
      tmp |= (c & 0x3f) << 6;
    } else if (flag == 3) {
      flag = 0;
      d += String.fromCharCode(tmp | (c & 0x3f));
    } else {
      flag = 0;
    }
  }
  return d;
}

/*
 * 
 */
function ReplaceStr(expr,a,b){
	var i=0
	while (i!=-1) {
		i=expr.indexOf(a,0);
		if (i>=0) {
			expr=expr.substring(0,i)+b+expr.substring(i+a.length);
			i+=b.length;
		}
	}
	return expr;
}

/*
 * Unfolding string from mime value
 * RFC 822 : unfolding is accomplished by removing any CRLF that is immediately followed by WSP
 */
function UnfoldingMimeValue(str){
	// CRLF DOS : "\r\n"
	// CRLF UNIX : "\n"
	var rv = ReplaceStr(str,"\r\n\t","\t");
	rv = ReplaceStr(rv,"\n\t","\t");
	rv = ReplaceStr(rv,"\r\n "," ");		
	return ReplaceStr(rv,"\n "," ");
}


/*
 * RFC 4871 - relaxed header canonicalization algorithm
 * Delete WSP at the begining and and of field
 */
function deleteFirstAndLastWhiteSpace(str){
	var rv=str;	
	var imax=rv.length;
	for(var i=0; i<imax; ++i){
		var nochange1=true;
		var nochange2=true;
		
		//delete all WSP at the end of each unfolded header field value		
		if(rv[rv.length-1]==' ' || rv[rv.length-1]=='\t'){
			rv = rv.slice(0,rv.length-1);			
			nochange1=false;
		}
		
		//delete any WSP remaining before and after the colon separating field name form value
		if(rv[0]==' ' || rv[0]=='\t'){
			rv = rv.slice(1,rv.length);
			nochange2=false;
		}
		
		if(nochange1==true && nochange2==true) break;		
	}	
	return rv;
}


/*
 * RFC 4871 - relaxed header canonicalization algorithm
 */
function canonilizeHeaderValue(hdrval){	
	// Unfold all header field continuation lines as described in [RFC2822]
	var val = UnfoldingMimeValue(hdrval);
	
	// delete CRLF
	//val = ReplaceStr(val,"\r\n"," ");	
	
	// Convert all sequences of one or more WSP characters to a single SP character
	val = ReplaceStr(val,"\t"," ");
	val = ReplaceStr(val,"  "," ");
	
	// Delete all WSP characters at the end of each unfolded value
	// Delete any WSP characters remaining before and after the colon separating header field
	val=deleteFirstAndLastWhiteSpace(val);	
	return val;
}

addEventListener('messagepane-loaded', msgHdrViewSMIMEOnLoad, true);
addEventListener('messagepane-unloaded', msgHdrViewSMIMEOnUnload, true);
addEventListener('messagepane-hide', msgHdrViewSMIMEOnMessagePaneHide, true);
addEventListener('messagepane-unhide', msgHdrViewSMIMEOnMessagePaneUnhide, true);
