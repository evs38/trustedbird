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
#	EADS Defence and Security Systems Copyright 2008 – All Rights Reserved
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

  secureHeadersStatus: function(aSecureHeaders, aCanonAlgo)
  {

	var secStatus = true; //flag for the global secure headers status, set at true as default means all secure headers were not modified
	gSecureHeaders="";
	if(aSecureHeaders)
	{
		gSecureHeadersState=1;
		var secureHeaders=aSecureHeaders.QueryInterface(nsIArray);
		var hdrArray=getMsgHdr(); //get selected mime message headers list 
		for(var i=0;i<secureHeaders.length;++i)
		{
			var sHeader = secureHeaders.queryElementAt(i,nsIMsgSMIMESecureHeader);
			if(sHeader){
				var hdrName = sHeader.headerName;
				var hdrValue = sHeader.headerValue; // Value in the signature
				var hdrStatus = ""+sHeader.headerStatus;
				var hdrValidity = "ok" //set the default header validity to ok, it means the header was not modified
				//var headerEncrypted = sHeader.headerEncrypted;
				if(hdrStatus == "0") //Verify the value validity only in the case where header status is duplicated
				{
					for(var j=0;j<hdrArray.length;++j)
					{
						if(aCanonAlgo)
						{
							hdrArray[j]._hdrName = canonilizeHeaderName(hdrArray[j]._hdrName);
							hdrArray[j]._hdrValue = canonilizeHeaderValue(hdrArray[j]._hdrValue);
						}
						if(hdrName==hdrArray[j]._hdrName)
						{
							var mimeValue=hdrArray[j]._hdrValue; //Value in the mime
							var mimeParam = Components.classes["@mozilla.org/network/mime-hdrparam;1"].createInstance(nsIMIMEHeaderParam);
							var charset = getMimeValueCharset(mimeValue);
							var valdecoded = _from_utf8(mimeParam.decodeRFC2047Header(hdrValue,charset,false,true)); //decode the value to display
							reg=new RegExp("\r\n", "g");
							hdrValue=hdrValue.replace(reg,"");
							mimeValue=mimeValue.replace(reg,"");
							if(hdrValue!=mimeValue) //test if the header value in the signature and that one in the mime message is the same
							{
								hdrValidity="nok"; //header was modified
								secStatus=false;
							}
						}
					}
				}
				
				//set the display secure headers information in the string to parse after in the GUI
				gSecureHeaders+=hdrName+HEADER_VAL_SEPARATOR;
				gSecureHeaders+=valdecoded+HEADER_VAL_SEPARATOR; //put the value decoded instead of the value in the signature (encoded RFC2047) for the diplay
				gSecureHeaders+=""+hdrStatus+HEADER_VAL_SEPARATOR;
				gSecureHeaders+=""+hdrValidity+HEADER_VAL_SEPARATOR;
				//gSecureHeaders+=""+headerEncrypted+HEADER_VAL_SEPARATOR;
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
		
	}
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

function MsgHdrObj(){
		this._hdrName;
		this._hdrValue;
}

/**
* Get the Message header list
*/
function getMsgHdr(){
		var _HdrArray = new Array;
		var msgURI = GetLoadedMessage();
		var cmessenger = Components.classes["@mozilla.org/messenger;1"].createInstance(Components.interfaces.nsIMessenger);
		var msgSvc =  cmessenger.messageServiceFromURI(msgURI);
		//var xmsgHdr = _messenger.msgHdrFromURI(gCurrentMessageUri); // ok, entetes basic de messages
		var MsgStream =  Components.classes["@mozilla.org/network/sync-stream-listener;1"].createInstance();
 		var consumer = MsgStream.QueryInterface(Components.interfaces.nsIInputStream);
 		var ScriptInput = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance();
 		var ScriptInputStream = ScriptInput.QueryInterface(Components.interfaces.nsIScriptableInputStream);
 		ScriptInputStream.init(consumer);
 		try{
   			msgSvc.streamMessage(msgURI, MsgStream, msgWindow, null, false, null);
 		}catch (e){
   			dump("Error line " + Error().lineNumber + " : "+ e + " - file "+ Error().fileName);
 		}
		
		// analyse des donnees du message selectionné
 		ScriptInputStream.available();
 		var content = "";
 		var tmpBuf = "";
 		while (ScriptInputStream .available()) {
 			tmpBuf = ScriptInputStream.read(512);
 			content = content + tmpBuf;
 			// extrac headers
 			// RFC 2822 :  The body is simply a sequence of characters that
   			// follows the header and is separated from the header by an empty line
   			// (i.e., a line with nothing preceding the CRLF). 			
 			if(tmpBuf.indexOf("\r\n\r\n",0) != -1){ 				
 				break;
 			}
		}
		

		var cur_pos_CRLF = 0; //position courante du caractere CRLF
		var cur_pos_str = 0; //posistion courante de la chaine
		var ligne_header = "";
		while((cur_pos_CRLF=content.indexOf("\r\n",cur_pos_str))!=-1)
		{
			
			if(content.charAt(cur_pos_CRLF+2)==" ")
			{
				ligne_header+=content.substring(cur_pos_str,cur_pos_CRLF);
				cur_pos_str=cur_pos_CRLF+3;
				continue;
			}
			else
			{
				ligne_header+=content.substring(cur_pos_str,cur_pos_CRLF+2);
				var msghdr = new MsgHdrObj();
				msghdr._hdrName = ligne_header.substring(0,ligne_header.indexOf(": ",0));
				msghdr._hdrValue = ligne_header.substring(ligne_header.indexOf(": ",ligne_header)+2);
				ligne_header="";
				cur_pos_str=cur_pos_CRLF+2;
				_HdrArray.push(msghdr);
			}

		}

		/*var separator = new RegExp("[\r\n]+","g"); // fin de ligne
		var tab = content.split(separator);
		for(i=0;i<tab.length;i++){		
				var msghdr = new MsgHdrObj();
				msghdr._hdrName = tab[i].substring(0,tab[i].indexOf(": ",0));
				msghdr._hdrValue = tab[i].substring(tab[i].indexOf(": ",tab[i])+2);
				_HdrArray.push(msghdr);				
		}*/
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
 * Supprime les sauts de ligne.
 */
function removeJumpSymb( str )
{
	var rv=str;
	var reg=new RegExp("\n\r", "g");
	rv=rv.replace(reg, "");
	reg=new RegExp("\r\n", "g");
	rv=rv.replace(reg, "");
	reg=new RegExp("\r", "g");
	rv=rv.replace(reg, "");
	reg=new RegExp("\n", "g");
	rv=rv.replace(reg, "");
	rv+="\r\n";
	return rv;
}

/*
 * Transforme les tabulations et les occurences multiples d'espace en un espace unique.
 */
function onlyOneWhiteSpace(str)
{
	var rv=str;
	var reg=new RegExp("\t", "g");
	rv=rv.replace(reg, " ");
	reg=new RegExp("  ", "g");
	rv=rv.replace(reg, " ");
	return rv;
}

function canonilizeHeaderValue(hdrval)
{
	var val=removeJumpSymb(hdrval);
	val=onlyOneWhiteSpace(val);
	return val;
}

function canonilizeHeaderName(hdrname)
{
	var val=hdrname.toLowerCase();
	val=onlyOneWhiteSpace(val);
	return val;
}


addEventListener('messagepane-loaded', msgHdrViewSMIMEOnLoad, true);
addEventListener('messagepane-unloaded', msgHdrViewSMIMEOnUnload, true);
addEventListener('messagepane-hide', msgHdrViewSMIMEOnMessagePaneHide, true);
addEventListener('messagepane-unhide', msgHdrViewSMIMEOnMessagePaneUnhide, true);
