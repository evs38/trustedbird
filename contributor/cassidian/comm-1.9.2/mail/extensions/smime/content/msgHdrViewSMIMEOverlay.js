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
  	//gConsole.logStringMessage("[smimeHeaderSink:smimeHeaderSink] nsICMSMessageErrors : " + aSignatureStatus);
    switch (aSignatureStatus) {
      case nsICMSMessageErrors.SUCCESS:
        gSignedUINode.setAttribute("signed", "ok");
        gStatusBar.setAttribute("signed", "ok");
        gSMIMEInfoMsg.setAttribute("value", gSMIMEBundle.getString("secureinfomsg_ok"));  
        gSMIMEInfoMsgMore.value=gSMIMEBundle.getString("secureinfomsgmore_ok").replace(/<BR>/g,"\n");
        setSMIMEInfoMsg("ok");
        document.getElementById("")
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
        setSMIMEInfoMsg("notok");
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
  updateSecureHeadersState: function(msgSrc){
	  var mimeEncoder = Components.classes["@mozilla.org/messenger/mimeconverter;1"].getService(Components.interfaces.nsIMimeConverter);
	  // parse mime msg : extract headers
	  //get MIME headers only
	  var currentMimeHeaderDataArray = {};	 
	  var idxEnd = msgSrc.indexOf("\r\n\r\n",0); // * CRLF DOS : "\r\n"
	  if(idxEnd == -1) idxEnd = msgSrc.indexOf("\n\n",0); // * CRLF UNIX : "\n"
	  if(idxEnd == -1) idxEnd = msgSrc.indexOf("\r\r",0); //CRLF OS : "\r"
	  if(idxEnd != -1) msgSrc = msgSrc.substr(0,idxEnd); //dbg gConsole.logStringMessage("[smime - MessageAnalyser - succes getting mime headers : ] \n" + msgSrc);
	  
	  // extract IMF headers - append data to array
	  var isnewLine = false;
	  var header_line = "";
	  var strTraceline="";
	  for(var i=0 ; i<msgSrc.length ; ++i){
		  header_line += msgSrc[i];
		  // is CRLF separator
		  if(msgSrc[i] === '\r' || msgSrc[i] === '\n'){
			  if(i+1 < msgSrc.length){
				  if(msgSrc[i+1] !== '\r' && msgSrc[i+1] !== '\n'){	
					  isnewLine = true;
				  }
				  // is folding CRLF
				  if(msgSrc[i+1] === '\t' || msgSrc[i+1] === ' '){	  						
					 isnewLine = false;
				  }
			  }
		  }
		  
		  // last line
		  if( i === (msgSrc.length-1)  ){	
			  isnewLine = true;
		  }
		  
		  // save new line if IMF header
		  if(isnewLine){
			  //gConsole.logStringMessage("[ximfmail - createXimfHdrArray - decode header line : ] \n" + header_line);
			  if(header_line.indexOf(":")!=-1){
				  let oEntry = new Object;
				  oEntry.headerName = header_line.substring(0,header_line.indexOf(": ",0)); 
				  oEntry.headerValue = header_line.substring(header_line.indexOf(": ",header_line)+2);
				  if(oEntry.headerName !== ""){ 
					  currentMimeHeaderDataArray[oEntry.headerName] = oEntry;
					  //gConsole.logStringMessage("[smime - MessageAnalyser - push : ] \n[" + oEntry.headerName + "]["+ oEntry.headerValue+"]");
					  strTraceline +=  "[" + oEntry.headerName + " : " +  oEntry.headerValue + "]"; 
				  }		
			}
			header_line = "";
			isnewLine = false;
		}
	  }
	  
	  gConsole.logStringMessage("[smime - updateSecureHeadersState - MIME HEADERS : \n" + strTraceline);
		 
	  
  	// Compute secure headers and mime headers
  	//gConsole.logStringMessage("[smime - updatesecureheaders ] *** secureHeaders analysis begin *** " );
	var secStatus = true; //flag for the global secure headers status, set at true as default means all secure headers were not modified
	gSecureHeadersState=1;		
	for (headerName in gSecureHeadersArray) {	
			//Verify the value validity only in the case where header status is duplicated
			var headerMimeExists = false;
			var tmp_hdrName = gSecureHeadersArray[headerName].hdrName;
			var canonalgo = gSecureHeadersArray[headerName].hdrCanonAlgo;
			if(canonalgo){
				 // RFC 4871 - relaxed header canonicalization algorithm - convert header field names to lowercase
				tmp_hdrName = tmp_hdrName.toLowerCase();
			}
			gConsole.logStringMessage("secureHeadersStatus - \n check for signed header "+tmp_hdrName);
			for(headerMimeName in currentMimeHeaderDataArray){
				var tmp_hdrMimeName = currentMimeHeaderDataArray[headerMimeName].headerName;
				if(canonalgo){
					// RFC 4871 - relaxed header canonicalization algorithm - convert header field names to lowercase
					tmp_hdrMimeName = tmp_hdrMimeName.toLowerCase();
				}						
						
				//gConsole.logStringMessage("secureHeadersStatus - canonalgo : "+ canonalgo +" \nsigned header : "+tmp_hdrName+"\nmime header   : "+tmp_hdrMimeName);	
				if(tmp_hdrName == tmp_hdrMimeName){
					// compare secured value ans MIME value of header
					headerMimeExists = true; // header is in mime		
					var hdrValue = 	gSecureHeadersArray[headerName].hdrSecureValue;													
					var hdrMimeValue = currentMimeHeaderDataArray[headerMimeName].headerValue;																						
					var charset = getMimeValueCharset(hdrMimeValue);							
						
					// body - delete SP/WPS characters before and after body
					hdrMimeValue = deleteFirstAndLastWhiteSpace(hdrMimeValue);
					hdrValue = deleteFirstAndLastWhiteSpace(hdrValue);
														
					if(canonalgo){
						// relaxed canonicalization algorithm
						hdrMimeValue = canonilizeHeaderValue(hdrMimeValue);
						hdrValue = canonilizeHeaderValue(hdrValue);
						gConsole.logStringMessage("secureHeadersStatus - relaxed canonicalization \n mime value:\n>" +hdrMimeValue+ "<\nsecured value:\n>"+hdrValue+"<");
					}else{
						// simple canonicalization algorithm
						//hdrMimeValue = UnfoldingMimeValue(hdrMimeValue);
						hdrMimeValue = deleteLastCRLF(hdrMimeValue);
						//hdrValue = UnfoldingMimeValue(hdrValue);
						hdrValue = deleteLastCRLF(hdrValue);
						gConsole.logStringMessage("secureHeadersStatus - simple canonicalization \n mime value:\n>" +hdrMimeValue+ "<\nsecured value:\n>"+hdrValue+"<");
					}
							
					if(hdrValue!==hdrMimeValue) //test if the header value in the signature and that one in the mime message is the same
					{
						gSecureHeadersArray[headerName].hdrSignedRes = "invalid"; //hdrValidity="invalid"; //header was modified
						secStatus=false;
						//dbg gConsole.logStringMessage("Warning - failed on verifing secured header "+tmp_hdrName+" :\n mime value:\n>" +hdrMimeValue+ "<\nsecured value:\n>"+hdrValue+"<");
						gConsole.logStringMessage("[smimeHeaderSink:updateSecureHeadersState]Warning - failed on verifing secured header ");
					}
							
					// decode values from MIME format
					var tmpDecdodedValue=null;
					tmpDecdodedValue = mimeEncoder.decodeMimeHeader(hdrMimeValue, charset, false, true);//encodeMimePartIIStr(hdrValue, false, "ISO-8859-1" , 0, 72);
					if(tmpDecdodedValue){
						gSecureHeadersArray[headerName].hdrMimeValue = tmpDecdodedValue;
					}else{
						gSecureHeadersArray[headerName].hdrMimeValue = hdrMimeValue;
					}
					tmpDecdodedValue = null;
					tmpDecdodedValue = mimeEncoder.decodeMimeHeader(hdrValue,charset,false,true);
					if(tmpDecdodedValue){
						gSecureHeadersArray[headerName].hdrSecureValue = tmpDecdodedValue;
					}else{
						gSecureHeadersArray[headerName].hdrSecureValue = hdrValue;
					}
					gSecureHeaders = "signedData in";
					//dbg gConsole.logStringMessage("secureHeadersStatus - header "+headerName+" \nmime value:  >" +gSecureHeadersArray[headerName].hdrMimeValue+ "<\nsigned value:>"+gSecureHeadersArray[headerName].hdrSecureValue+"<");	
					break; // header is correctly checked
				}					
			}
					
			// mime header has been lost, deleted...
			if(!headerMimeExists){						
				gSecureHeadersArray[headerName].hdrSignedRes = "invalid"; //header was modified
				secStatus=false;	
			}	
			
		}
	
		// display result to user
		if((!secStatus) && (gSignatureStatus == nsICMSMessageErrors.SUCCESS))
		{
			//At least one secure header was modified, set the signed status to mismastch
			gConsole.logStringMessage("[smimeHeaderSink:updateSecureHeadersState] At least one secure header was modified ");
			gSignedUINode.setAttribute("signed", "mismatch");
			gStatusBar.setAttribute("signed", "mismatch");
			gSecureHeadersState=0;
			gSMIMEInfoMsg.setAttribute("value", gSMIMEBundle.getString("secureinfomsg_hdrnok"));
			gSMIMEInfoMsgMore.value=gSMIMEBundle.getString("secureinfomsgmore_default").replace(/<BR>/g,"\n");
			setSMIMEInfoMsg("notok");
		}
	
		// check signed headers with local rules of secure headers
		// Calls ReadXmlHeadersToSign (see msgCompSMIMESecureHeaders.js) to load the secureHeaders.xml configuration file
		// For each header in the message:
		//    1. check if the header is in the configuration file
		//    2. In this case, check that it was secured in signature
		//    3. If the header was not secured, raise a warning (status change ?)
		try{
			UpdateLocalSecureHeaderList();
			for(localheader in gLocalSecureHeaderList){
				try{
					var oHeader = gSecureHeadersArray[localheader];
					if(!oHeader){
						// try with relaxed canon algo
						oHeader = gSecureHeadersArray[localheader.toLowerCase()];
					}
					if(!oHeader){
						// check if message contains this header
						var oMimeHeader = currentMimeHeaderDataArray[localheader];
						if(oMimeHeader){
							gConsole.logStringMessage(" missing signed header compared to local rules security : " + gLocalSecureHeaderList[localheader].hdrName + " ("+localheader+")");
							
							// decode value from MIME format
							let tmpDecdodedValue="";
							let tmphdrValue=currentMimeHeaderDataArray[localheader].headerValue;
							let charset = getMimeValueCharset(tmphdrValue);						
							tmpDecdodedValue = mimeEncoder.decodeMimeHeader(tmphdrValue, charset, false, true);//encodeMimePartIIStr(hdrValue, false, "ISO-8859-1" , 0, 72);
							
							var oEntry = new Object;
							oEntry.hdrName = localheader.toLowerCase(); // signed header
							oEntry.hdrSecureValue = gSMIMEBundle.getString("securevalue_warning"); 
							oEntry.hdrMimeValue = tmpDecdodedValue;	// value in the MIME message
							oEntry.hdrSignedStatus = "";
							oEntry.hdrCanonAlgo = "";
							oEntry.hdrEncryptStatus = "";
							oEntry.hdrSignedRes = "unsigned";
							gSecureHeadersArray[oEntry.hdrName] = oEntry;
							
							// set to user warning informations 
							if((secStatus) && (gSignatureStatus == nsICMSMessageErrors.SUCCESS)){
								gSignedUINode.setAttribute("signed", "mismatch");
								gStatusBar.setAttribute("signed", "mismatch");
								gSMIMEInfoMsg.setAttribute("value", gSMIMEBundle.getString("secureinfomsg_hdrwarning"));
								gSMIMEInfoMsgMore.value=gSMIMEBundle.getString("secureinfomsgmore_warning").replace(/<BR>/g,"\n");
								setSMIMEInfoMsg("warning");
							}
						}
					}
					/*
					// TODO ???
					// No secure headers: mismatch
					// No secure header was found: Trustedbird's security policy is to have secure headers
					// => Set signed status to mismatch
					//gConsole.logStringMessage("****** No secure header ******");				
					*/
				}catch(e){
					gConsole.logStringMessage(" CLR_575 HEADER ERROR : " + e + "\n " + e.fileName + "\nline : " + e.lineNumber);			
				}
			}
		}catch(e){
			gConsole.logStringMessage(" CLR_575 ERROR : " + e + "\n "+ e.fileName + "\nline : " + e.lineNumber);			
		}		

		
	},//end updateSecureHeadersState	
  secureHeadersStatus: function(aSecureHeaders, aCanonAlgo){  	
	gSecureHeaders = "";	
  	gSecureHeadersArray={}; // clear array	
	if(aSecureHeaders)
	{
		var secureHeadersArray=aSecureHeaders.QueryInterface(nsIArray);
		if(secureHeadersArray.length <= 0 ){
			gConsole.logStringMessage("[smimeHeaderSink:secureHeadersStatus] *** no secure headers in smime signeddata ");
			return;
		}		
		
		for(var i=0;i<secureHeadersArray.length;++i)
		{
			var sHeader = secureHeadersArray.queryElementAt(i,nsIMsgSMIMESecureHeader);
			if(sHeader){	
				var oEntry = new Object;
				oEntry.hdrName = sHeader.headerName; // signed header
				oEntry.hdrSecureValue = sHeader.headerValue; // Value in the signature
				oEntry.hdrMimeValue = "";	// value in the MIME message
				oEntry.hdrSignedStatus = sHeader.headerStatus;
				oEntry.hdrCanonAlgo = aCanonAlgo;
				oEntry.hdrEncryptStatus = "";
				oEntry.hdrSignedRes = "valid";
				gSecureHeadersArray[oEntry.hdrName] = oEntry;				
			}
		}  			
  		getMessageSource(gFolderDisplay.selectedMessageUris[0], this.updateSecureHeadersState); 		
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
{
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
  	//gConsole.logStringMessage("[msgHdrViewSMIMEOnLoad] smimeinfomsg error : " + e);
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
   
   // check if message is signed
   if(checkSignedDataMsg()){
   		//gSMIMEInfoMsg.setAttribute("value", gSMIMEBundle.getString(""));
   		//gSMIMEInfoMsgMore.value=gSMIMEBundle.getString("secureinfomsgmore_nok").replace(/<BR>/g,"\n");
   		gSMIMEInfoMsg.setAttribute("value", gSMIMEBundle.getString("secureinfomsg_default"));  
   		gSMIMEInfoMsgMore.value=gSMIMEBundle.getString("secureinfomsgmore_default").replace(/<BR>/g,"\n");
   		setSMIMEInfoMsg("notok");
   }else{
   		gSMIMEInfoMsg.setAttribute("value", gSMIMEBundle.getString("secureinfomsg_unsecured"));  
        gSMIMEInfoMsgMore.value=gSMIMEBundle.getString("secureinfomsgmore_default").replace(/<BR>/g,"\n");
        setSMIMEInfoMsg("");
    }
}

//
function onSmartCardChange()
{
  // only reload encrypted windows
  if (gMyLastEncryptedURI && gEncryptionStatus != -1) {
    ReloadMessage();
  }
}

//
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
      
    // display security information message    
	gSMIMEInfoMsg = document.getElementById("secureinfomsgl");
   	gSMIMEInfoMsgMore = document.getElementById("secureinfomsgd");
  	if(gSMIMEInfoMsg == undefined){
  		gSMIMEInfoMsg = document.getElementById("secureinfomsgl2");
  		gSMIMEInfoMsgMore = document.getElementById("secureinfomsgd2");
  	}
   	
  	try{
    	if(gCurrentIdentity){   	 	
   	 		//gConsole.logStringMessage("[msgHdrViewSMIMEOnLoad] secureheaders.smimeinfomsg pref = "+setSmimeInfoMsg);
   	 		// save datas of current account for extern windows
    		var prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);
			prefBranch.setBoolPref("smimeinfomsg_on", gCurrentIdentity.getBoolAttribute("secureheaders.smimeinfomsg"));
			prefBranch.setCharPref("smimeinfomsg_localsecurehdrpath", gCurrentIdentity.getCharAttribute(PREF_SECURE_HEADERS_FOLDER_DATAS));
		}	
  	}catch(e){gConsole.logStringMessage("[msgHdrViewSMIMEOnLoad] smimeinfomsg error : " + e);}
  	
  	// new folder selected : collapse gSMIMEInfoMsg container  
  	try{
		var el = document.getElementById("folderTree");
     	el.addEventListener("select", function(){
     		if(document.getElementById("singlemessage") != undefined)
   			document.getElementById("secureinfomsg").setAttribute("collapsed","true");},
   			false);
  	}catch(e){}
  	
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
	val = deleteLastCRLF(val);
	return val;
}

/*
 * 
 */
function checkSignedDataMsg(){
	// 	
	var list="";
	var headerName;
	var regHdrName_contentype = new RegExp("content-type", "ig");
	var regHdrValue_signed = new RegExp("multipart/signed", "ig");
	for (headerName in currentHeaderData) {
		//list += currentHeaderData[headerName].headerName +":"+currentHeaderData[headerName].headerValue + " $$ ";
		if(regHdrName_contentype.test(currentHeaderData[headerName].headerName)){
			if(regHdrValue_signed.test(currentHeaderData[headerName].headerValue)){
				gConsole.logStringMessage("[checkSignedDataSmimeSelectedMsg] Msg Is Signed");
				return true;
			}
    	}
	}
	gConsole.logStringMessage("[checkSignedDataSmimeSelectedMsg] Msg Is Unsigned");
	//dbg gConsole.logStringMessage("[checkSignedDataSmimeSelectedMsg] list : " + list);	
	return false;
}

 /**
Get message source
@param {nsIMsgDBHdr} header
@param {function} callbackFunction Function to call when data are received: callbackFunction(header, receivedData, callbackParam)
@param callbackParam Parameter of callbackFunction
@return {string} Message source or <b>false</b> if an error occurs
*/
function getMessageSource(mailUri, callbackFunction, callbackParam){
	if (!mailUri) return;	
	var streamListener = {
		QueryInterface: function(aIID) {
			if (aIID.equals(Components.interfaces.nsISupports)
				|| aIID.equals(Components.interfaces.nsIStreamListener))
				return this;
			throw Components.results.NS_NOINTERFACE;
		},
		data: "",
		isDataComplete: false,
		onStartRequest: function(request, context) {},
		onDataAvailable: function(request, context, inputStream, offset, available) {
			if(!this.isDataComplete ){
				var stream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
				stream.init(inputStream);
				this.data += stream.read(available);
				stream.close();
				stream = null;
							
				// parse headers only
				var idxEnd = this.data.indexOf("\r\n\r\n",0); // * CRLF DOS : "\r\n"
  				if(idxEnd == -1) idxEnd = this.data.indexOf("\n\n",0); // * CRLF UNIX : "\n"
  				if(idxEnd == -1) idxEnd = this.data.indexOf("\r\r",0); //CRLF OS : "\r"
  				if(idxEnd != -1) this.isDataComplete = true;	// msgSrc = msgSrc.substr(0,idxEnd); //dbg gConsole.logStringMessage("[smime - MessageAnalyser - succes getting mime headers : ] \n" + msgSrc);		
  			}
		},
		onStopRequest: function(request, context, status) {
			if (Components.isSuccessCode(status)) {
				callbackFunction(this.data, callbackParam);
			} else {
				gConsole.logStringMessage("[getMessageSource - streamListener.onStopRequest ] - Error: "+ status);				
				if(this.isDataComplete == true){
					// all mime headers have been parsed 
					gConsole.logStringMessage("[getMessageSource - streamListener.isDataComplete ] all mime headers have been parsed !");					
					callbackFunction( this.data, callbackParam);
				}
			}
		}
	}

	var cmessenger = Components.classes["@mozilla.org/messenger;1"].createInstance(Components.interfaces.nsIMessenger);
	var msgSvc =  cmessenger.messageServiceFromURI(mailUri);
	try { msgSvc.streamMessage(mailUri, streamListener, null, null, false, null); } catch (ex) { return false; }
}

/*
 * set status signature for displaying panel 
 */
function setSMIMEInfoMsg(status){
	//#secureinfomsgh[signed="ok"],
	//#secureinfomsgh2[signed="ok"]
	try{document.getElementById("secureinfomsgh").setAttribute("signed",status)}catch(e){}
	try{document.getElementById("secureinfomsgh2").setAttribute("signed",status)}catch(e){}
}

/*
 * UpdateLocalSecureHeaderList
 * Read the XML secure headers configuration file
 * Add headers to sign with local rules in gLocalSecureHeaderList array {[headername][objectEntry],[headername][objectEntry],...}
*/
var PREF_SECURE_HEADERS_FOLDER_DATAS="secureheaders.folderdata";
var DEFAULT_SECUREHEADERS_XML_DIR = "secureHeaders"
var DEFAULT_SECUREHEADERS_XML_FILE = "secureHeadersDefault.xml"
var gLocalSecureHeaderList = []; // {headerName,headerName,...}
var gPrefLocalSecureheaderXmlPath = "";
var gPrefLocalSecureheaderXmlDate = ""
function UpdateLocalSecureHeaderList(){
	try{
		var strLocalList = ""; // trace list        
       
		// get xml file path
		var file = null;
        //var pref_data = gCurrentIdentity.getCharAttribute(PREF_SECURE_HEADERS_FOLDER_DATAS);
		var pref_data = "";
	  	try{
	    	if(gCurrentIdentity){   	 	
	   	 		//gConsole.logStringMessage("[msgHdrViewSMIMEOnLoad] secureheaders.smimeinfomsg pref = "+setSmimeInfoMsg);
	   	 		// save datas of current account for extern windows
	    		var prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);
	    		pref_data = gCurrentIdentity.getCharAttribute(PREF_SECURE_HEADERS_FOLDER_DATAS);
				prefBranch.setCharPref("smimeinfomsg_localsecurehdrpath", pref_data);
				gConsole.logStringMessage("[_secure_headers - UpdateLocalSecureHeaderList] smimeinfomsg_localsecurehdrpath pref = " + pref_data);
			}	
	  	}catch(e){
	  		// try to get path from current prefs
			var prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);
			pref_data = prefBranch.getCharPref("smimeinfomsg_localsecurehdrpath");
			gConsole.logStringMessage("[_secure_headers - UpdateLocalSecureHeaderList] e : "+ e + " line " + e.lineNumber + " \n smimeinfomsg_localsecurehdrpath pref = " + pref_data);
	  	}	  
		
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
        	gConsole.logStringMessage("[_secure_headers - UpdateLocalSecureHeaderList] Error loading schema file : " + completePath);
        	return;
        }
        
        // is list modified        
        if(gPrefLocalSecureheaderXmlPath === pref_data)
        	if(file.lastModifiedTime === gPrefLocalSecureheaderXmlDate) 
        		return;
        gPrefLocalSecureheaderXmlPath = pref_data;
        gPrefLocalSecureheaderXmlDate = file.lastModifiedTime;
        gLocalSecureHeaderList = [];
    	gConsole.logStringMessage("[_secure_headers - UpdateLocalSecureHeaderList] last modified time file : " + gPrefLocalSecureheaderXmlDate + "\npath :" + gPrefLocalSecureheaderXmlPath);
        
        //	Get Xml Document parser
        var stream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
        stream.init(file, -1, -1, Components.interfaces.nsIFileInputStream.CLOSE_ON_EOF);
        var parser = Components.classes["@mozilla.org/xmlextras/domparser;1"].createInstance(Components.interfaces.nsIDOMParser);
        var xmlDoc = parser.parseFromStream(stream, null, file.fileSize, "text/xml");
        
        // get datas from file
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
	        		if(childNodes[j].hasAttribute("status"))	header_status = parseInt(childNodes[j].getAttribute("status"));
        			/*if(childNodes[j].hasAttribute("encrypted")) header_encrypted = parseInt(childNodes[j].getAttribute("encrypted"));*/
        			
	        		var oEntry = new Object;
					oEntry.hdrName = header_name;
					oEntry.hdrSecureValue = "";
					oEntry.hdrMimeValue = "";
					oEntry.hdrSignedStatus = header_status;
					oEntry.hdrCanonAlgo = ""; //TODO
					oEntry.hdrEncryptStatus = "";
					oEntry.hdrSignedRes = "";
					gLocalSecureHeaderList[oEntry.hdrName] = oEntry;	
					//gConsole.logStringMessage("[CLR_575] local rule header " + header_name);
					strLocalList += header_name + "\n";
        		}
        	}
        }else{
        	gConsole.logStringMessage("[_secure_headers - UpdateLocalSecureHeaderList] no headers tag in file " + completePath);
        }
   } catch (e) {
	   gConsole.logStringMessage("[_secure_headers - UpdateLocalSecureHeaderList ] \n " + e + "\nfile : " + e.fileName+"\nline : "+ e.lineNumber);
   }
   gConsole.logStringMessage("[_secure_headers - UpdateLocalSecureHeaderList ] new local list of secure headers : \n " + strLocalList);
   return gLocalSecureHeaderList;
}

addEventListener('messagepane-loaded', msgHdrViewSMIMEOnLoad, true);
addEventListener('messagepane-unloaded', msgHdrViewSMIMEOnUnload, true);
addEventListener('messagepane-hide', msgHdrViewSMIMEOnMessagePaneHide, true);
addEventListener('messagepane-unhide', msgHdrViewSMIMEOnMessagePaneUnhide, true);
