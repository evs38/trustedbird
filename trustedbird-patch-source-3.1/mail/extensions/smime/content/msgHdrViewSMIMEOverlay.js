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
var gSMIMEInfoMsg = null;
var gSMIMEInfoMsgMore = null;

var gEncryptedURIService = null;
var gMyLastEncryptedURI = null;

var gSMIMEBundle = null;
//var gBrandBundle; -- defined in mailWindow.js

// manipulates some globals from msgReadSMIMEOverlay.js

const SECURE_HEADER_SEPARATOR = "###HEADER_SEPARATOR###";
const HEADER_VAL_SEPARATOR = "###HEADER_VAL###";

const nsICMSMessageErrors = Components.interfaces.nsICMSMessageErrors;

// Push signer header into existing header list
gExpandedHeaderList.push({name:"signer"});

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
        gSMIMEInfoMsg.setAttribute("value", gSMIMEBundle.getString("secureinfomsg_ok"));  
        gSMIMEInfoMsgMore.value=gSMIMEBundle.getString("secureinfomsgmore_ok").replace(/<BR>/g,"\n");
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
        gSMIMEInfoMsg.setAttribute("value", gSMIMEBundle.getString("secureinfomsg_notok"));
        gSMIMEInfoMsgMore.value=gSMIMEBundle.getString("secureinfomsgmore_notok").replace(/<BR>/g,"\n");
        break;
    }
	
	// If certificate is not null, display subject name
	if(gSignerCert != null) {
		var signerValueField = document.getElementById("expandedsignerBox");
		if(signerValueField != null) {
			//gConsole.logStringMessage("Set subject name: " + gSignerCert.subjectName);
			signerValueField.headerValue = gSignerCert.subjectName;
		}
		else {
			gConsole.logStringMessage("Cannot find UI signer box");
		}
	}
	else {
		gConsole.logStringMessage("No certificate");
		signerValueField.headerValue = "";
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
							//gConsole.logStringMessage("secureHeadersStatus - relaxed canonicalization \n mime value:\n>" +hdrMimeValue+ "<\nsigend value:\n>"+hdrValue+"<");
						}else{
							hdrMimeValue = UnfoldingMimeValue(hdrMimeValue);
							hdrMimeValue = deleteLastCRLF(hdrMimeValue);
							hdrValue = UnfoldingMimeValue(hdrValue);
							hdrValue = deleteLastCRLF(hdrValue);
						}												
						
						if(hdrValue!=hdrMimeValue) //test if the header value in the signature and that one in the mime message is the same
						{
							hdrValidity="invalid"; //header was modified
							secStatus=false;
						//gConsole.logStringMessage("Warning - failed on verifing secured header "+hdrName+" :\n mime value:\n>" +hdrMimeValue+ "<\nsecured value:\n>"+hdrValue+"<");
					}
					else {
						// secure and mime header have same value 
								
						// TCA
						// In case gSignatureStatus == nsICMSMessageErrors.VERIFY_CERT_WITHOUT_ADDRESS, 
						// if 'from' secure header value, is the same as 'from' mime header value, then
						// change status icon to ok
						if(secStatus && gSignatureStatus == nsICMSMessageErrors.VERIFY_CERT_WITHOUT_ADDRESS) {
							if(hdrName == "from" ) {
								gSignedUINode.setAttribute("signed", "ok");
								gStatusBar.setAttribute("signed", "ok");
							}
						}
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
		
		if((!secStatus))
		{
			// TCA I don't see why we shouldn't override signed status in the case of succesful signature check
			// if(gSignatureStatus == nsICMSMessageErrors.SUCCESS) {
			//At least one secure header was modified, set the signed status to "not ok"
			gSignedUINode.setAttribute("signed", "notok");
			gStatusBar.setAttribute("signed", "notok");
			//}
			gSecureHeadersState=0;
			
		}
		//gConsole.logStringMessage("*** secureHeaders analysis end ***");
		
		
		// Calls ReadXmlHeadersToSign (see msgCompSMIMESecureHeaders.js) to load the secureHeaders.xml configuration file
		// For each header in the message:
		//    1°) check if the header is in the configuration file
		//    2°) In this case, check that it was secured in signature
		//    3°) If the header was not secured, raise a warning (status change ?)
		gConsole.logStringMessage("Checking secure headers");
		var arrayHeaderInConf = ReadXmlHeadersToSign();
		if(arrayHeaderInConf) {
			for(var j=0;j<hdrArray.length;++j){
				var tmp_hdrMimeName = hdrArray[j]._hdrName;
				//gConsole.logStringMessage("Header in message: " + tmp_hdrMimeName);
				if(aCanonAlgo){
					// RFC 4871 - relaxed header canonicalization algorithm - convert header field names to lowercase
					tmp_hdrMimeName = tmp_hdrMimeName.toLowerCase();
				}
				for(i=0;i<arrayHeaderInConf.length;++i){ 
					// Check if header is in message
					var confHdrName = arrayHeaderInConf[i]._name;
					//gConsole.logStringMessage("Header in conf: " + confHdrName);
					confHdrName = confHdrName.toLowerCase();
					if(confHdrName == tmp_hdrMimeName) {
						// gConsole.logStringMessage("****** Header found in conf and message: " + confHdrName);
						var hdrSecured = false;
						for(var i=0;i<secureHeaders.length;++i)
						{
							var sHeader = secureHeaders.queryElementAt(i,nsIMsgSMIMESecureHeader);
							if(sHeader){								
								var hdrName = sHeader.headerName; // signed header
								if(aCanonAlgo){
									hdrName = hdrName.toLowerCase();
								}
								if(hdrName == confHdrName) {
									//gConsole.logStringMessage("****** Header found in conf, message and signature: " + confHdrName);
									hdrSecured = true;
									break;
								}
							}
						}
						if(!hdrSecured) {
							//gConsole.logStringMessage("****** Header found in conf, message but NOT in secure headers: " + confHdrName);
							
							
							gSecureHeaders+=confHdrName+HEADER_VAL_SEPARATOR;
							gSecureHeaders+=""+HEADER_VAL_SEPARATOR;
							gSecureHeaders+=""+""+HEADER_VAL_SEPARATOR; 
							gSecureHeaders+=""+"invalid"+HEADER_VAL_SEPARATOR;
							gSecureHeaders+=hdrArray[j]._hdrName+HEADER_VAL_SEPARATOR;
							gSecureHeaders+=aCanonAlgo+HEADER_VAL_SEPARATOR;
							gSecureHeaders+=SECURE_HEADER_SEPARATOR;
							
							// TODO 
							// A header that should be secured was not found in the secure header structure
							// => Set signed status to mismatch
							gSignedUINode.setAttribute("signed", "mismatch");
							gStatusBar.setAttribute("signed", "mismatch");
							gSecureHeadersState=2;
							gSMIMEInfoMsg.setAttribute("value", gSMIMEBundle.getString("secureinfomsg_hdrnok"));
							gSMIMEInfoMsgMore.value=gSMIMEBundle.getString("secureinfomsgmore_default").replace(/<BR>/g,"\n");

							
							
						}

						break;
					}
				}
			}
		}
	}
	else {
		// TODO 
		// No secure headers: mismatch
		// No secure header was found: Trustedbird's security policy is to have secure headers
		// => Set signed status to mismatch
		//gConsole.logStringMessage("****** No secure header ******");
		gSignedUINode.setAttribute("signed", "mismatch");
		gStatusBar.setAttribute("signed", "mismatch");
		gSecureHeadersState=3;
		gSMIMEInfoMsg.setAttribute("value", gSMIMEBundle.getString("secureinfomsg_hdrnok"));
		gSMIMEInfoMsgMore.value=gSMIMEBundle.getString("secureinfomsgmore_default").replace(/<BR>/g,"\n");
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

const PREF_SECURE_HEADERS_FOLDER_DATAS="secureheaders.folderdata";
var DEFAULT_SECUREHEADERS_XML_DIR = "secureHeaders"
var DEFAULT_SECUREHEADERS_XML_FILE = "secureHeadersDefault.xml"
/*
Read the XML secure headers configuration file
*/
// This function is a copy-paste of the one from msgCompSMIMESecureHeaders.js
// TODO Find a way to factorize those functions
function ReadXmlHeadersToSign(){
	try{
		//var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		 
		// get xml file path
		if(!gCurrentIdentity){ 
			gConsole.logStringMessage("[_secure_headers - ReadXmlHeadersToSign ] no xml files define \n ");
			return;
		}
		var pref_data = gCurrentIdentity.getCharAttribute(PREF_SECURE_HEADERS_FOLDER_DATAS);
		var file = null;
		if(!pref_data){	
			file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile); // get profile folder
			file.append(DEFAULT_SECUREHEADERS_XML_DIR);
			file.append(DEFAULT_SECUREHEADERS_XML_FILE);
			pref_data = file.path;
		}else{
	 		file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath( pref_data );
		}
		
		if(!file.exists()){
			gConsole.logStringMessage("[_secure_headers - ReadXmlHeadersToSign] Error loading schema file : " + completePath);
			return;
		}
		
		//	Get Xml Document parser
		var stream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		stream.init(file, -1, -1, Components.interfaces.nsIFileInputStream.CLOSE_ON_EOF);
		var parser = Components.classes["@mozilla.org/xmlextras/domparser;1"].createInstance(Components.interfaces.nsIDOMParser);
		var xmlDoc = parser.parseFromStream(stream, null, file.fileSize, "text/xml");
		
		// get datas from file
		var tabSecureHeaders = new Array; // tabHeaders[headerName][status][encrypted]
		var compatibleTag = xmlDoc.getElementsByTagName("ximf:headers");
		var sValue="";
		
		if(compatibleTag.length>0){
			// get headers to sign
			var childNodes = compatibleTag[0].childNodes;
			for(var j=0; j <childNodes.length; ++j ){
					var header_name = ""; 
					var header_status = 0; 
					
					//var header_encrypted = -1;
					if(childNodes[j].localName == "header"){
						header_name = childNodes[j].getAttribute("name");
						if(childNodes[j].hasAttribute("status"))
							header_status = parseInt(childNodes[j].getAttribute("status"));
						
						/*if(childNodes[j].hasAttribute("encrypted"))
							header_encrypted = parseInt(childNodes[j].getAttribute("encrypted"));*/
						// load values to array
						tabSecureHeaders.push(new xSecureHeader(header_name, header_status));
					}
				}
			return tabSecureHeaders;
		}else{
			gConsole.logStringMessage("[_secure_headers - ReadXmlHeadersToSign] no headers tag in file " + completePath);
		}
	} catch (e) {
		gConsole.logStringMessage("[_secure_headers - ReadXmlHeadersToSign ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
	}
}

function xSecureHeader(name,status){
	if(name)
		this._name = name;
	if(status)
		this._status = status;
	/*if(encrypted)
		this._encrypted = encrypted;*/
}


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

var messageHeaderSinkImpl = {
 onStartHeaders: function()
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
	},

	onEndHeaders: function()
	{
	  gSMIMEInfoMsg.setAttribute("value", gSMIMEBundle.getString("secureinfomsg_default"));
	  
	  // display secure info message panel
	  var setSmimeInfoMsg = true;
	  var prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);
	  try{  	
		if(gCurrentIdentity){
			setSmimeInfoMsg =  gCurrentIdentity.getBoolAttribute("secureheaders.smimeinfomsg");
			//gConsole.logStringMessage("[msgHdrViewSMIMEOnLoad] secureheaders.smimeinfomsg pref = "+setSmimeInfoMsg);
			prefBranch.setBoolPref("smimeinfomsg_on", setSmimeInfoMsg);		
		}	
	  }catch(e){
		gConsole.logStringMessage("[msgHdrViewSMIMEOnLoad] smimeinfomsg error : " + e);
		var prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);
		if(prefBranch.prefHasUserValue("smimeinfomsg_on")){
			setSmimeInfoMsg = prefBranch.getBoolPref("smimeinfomsg_on");
			//gConsole.logStringMessage("[msgHdrViewSMIMEOnLoad] smimeinfomsg used : " + setSmimeInfoMsg);
		}
	  }
	  if(document.getElementById("singlemessage")== undefined){
		if(setSmimeInfoMsg){
			document.getElementById("secureinfomsg2").setAttribute("collapsed","false");
		}else{
			document.getElementById("secureinfomsg2").setAttribute("collapsed","true");
		}
	   }else{
		if(setSmimeInfoMsg){
			document.getElementById("secureinfomsg").setAttribute("collapsed","false");
		}else{
			document.getElementById("secureinfomsg").setAttribute("collapsed","true");
		}
	   }    	
	},

	onBeforeShowHeaderPane: function() {
		gConsole.logStringMessage("onBeforeShowHeaderPane: " + gSignerCert);
		currentHeaderData["signer"] = {headerName:"Signer", headerValue:""};
		for (headerName in currentHeaderData) {
			var headerField = currentHeaderData[headerName];
		}
	}
};

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
  gMessageListeners.push(messageHeaderSinkImpl);

  gEncryptedURIService = 
    Components.classes["@mozilla.org/messenger-smime/smime-encrypted-uris-service;1"]
    .getService(Components.interfaces.nsIEncryptedSMIMEURIsService);
    
    // display security information message    
	gSMIMEInfoMsg = document.getElementById("secureinfomsgl");
   	gSMIMEInfoMsgMore = document.getElementById("secureinfomsgd");
  	if(gSMIMEInfoMsg == undefined){
  		gSMIMEInfoMsg = document.getElementById("secureinfomsgl2");
  		gSMIMEInfoMsgMore = document.getElementById("secureinfomsgd2");
  	}
  	gSMIMEInfoMsg.setAttribute("value", gSMIMEBundle.getString("secureinfomsg_default"));  
  	gSMIMEInfoMsgMore.value=gSMIMEBundle.getString("secureinfomsgmore_default").replace(/<BR>/g,"\n");
  	
  	try{
    	if(gCurrentIdentity){   	 	
   	 		//gConsole.logStringMessage("[msgHdrViewSMIMEOnLoad] secureheaders.smimeinfomsg pref = "+setSmimeInfoMsg);
   	 		var prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);
			prefBranch.setBoolPref("smimeinfomsg_on", gCurrentIdentity.getBoolAttribute("secureheaders.smimeinfomsg"));
		}	
  	}catch(e){gConsole.logStringMessage("[msgHdrViewSMIMEOnLoad] smimeinfomsg error : " + e);}
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
			if(ligne_header.indexOf(":",0)!=-1){
				var msghdr = new MsgHdrObj();
				// header
				msghdr._hdrName = ligne_header.substring(0,ligne_header.indexOf(":",0));				
				msghdr._hdrValue = ligne_header.substring(ligne_header.indexOf(":",0)+1);
                //gConsole.logStringMessage("msghdr._hdrName: " + msghdr._hdrName);
                //gConsole.logStringMessage("msghdr._hdrValue: " + msghdr._hdrValue);
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
 * Delete CRLF at end of sequence str
 * CRLF DOS : "\r\n"
 * CRLF UNIX : "\n"
 * CRLF OS : "\r"
 */
function deleteLastCRLF(str){
	var rv=str;	
	var imax=rv.length;
	if(rv[imax-1] == "\n")
		rv = rv.slice(0,imax-1);
	imax=rv.length;
	if(rv[imax-1] == "\r")
		rv = rv.slice(0,imax-1);		
	return rv;	
}

/*
 * RFC 4871 - relaxed header canonicalization algorithm
 */
function canonilizeHeaderValue(hdrval){	
	// Unfold all header field continuation lines as described in [RFC2822]
	var val = UnfoldingMimeValue(hdrval);
	
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
