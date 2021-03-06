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
 *   BT Global Services / Etat fran�ais Minist�re de la D�fense
 * Portions created by the Initial Developer are Copyright (C) 1998-2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bruno Lebon BT Global Services / Etat fran�ais Minist�re de la D�fense
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
//initialyse the needed global variables 
var customedHeaders="";
var gContainer=0;

//initialyse the needed global variables 
const MSCOPTIONS_INSERTED_RECORDED_BODY_SIZE = 'chrome://xsmtp/content/xSMTPInsertedRecordSize.xul';

function initialyzeXsmtpGVariables(){
	customedHeaders="";
	gContainer=0;
}
 
//get header from recorded message
function getDraftMessage(){
    var catchHeaderFromURI="";
	catchHeaderFromURI = getXsmtpHeadersFromURI();
	if ((catchHeaderFromURI)){
			//window.customedHeaders = catchHeaderFromURI; //record field value initialization
		return catchHeaderFromURI;
	}else{return "";}
}

//javasscript ovarlay
var GenericSendMessage_ori = GenericSendMessage;
GenericSendMessage = function xSMTPGenericSendMessage(msgType)
{
   if ((gContainer==0) && (customedHeaders=="")){
      customedHeaders=getDraftMessage();
   }
   
    // Check attachments for flash messages
	if (!xsmtp_checkAllowAttachmentForFlashMessage()) {
   		return;
	}
   
  if (!MSCListenerFunction()) return;
  GenericSendMessage_ori(msgType);
  if (msgType == nsIMsgCompDeliverMode.Now ||  msgType == nsIMsgCompDeliverMode.Later){
	initialyzeXsmtpGVariables();
  }
}


/////////////////////////////////////
///////////  Get size function   ////////
/////////////////////////////////////
////get default recipient size
function getPopupElement(row)
	{
    return document.getElementById("addressCol1#" + row);
	}

function getInputElement(row)
	{
    return document.getElementById("addressCol2#" + row);
	}	
	
function getRecipientsSize()
	{
	    var i = 1;
	    var addrTo = "";
	    var addrCc = "";
	    var addrBcc = "";
	    var addrReply = "";
	    var addrNg = "";
	    var addrFollow = "";
	    var addrOther = "";
	    var to_Sep = "";
	    var cc_Sep = "";
	    var bcc_Sep = "";
	    var reply_Sep = "";
	    var ng_Sep = "";
	    var follow_Sep = "";
		

	    var mailMimeHeaderParser = Components.classes["@mozilla.org/messenger/headerparser;1"].getService(Components.interfaces.nsIMsgHeaderParser);

	    var recipientType;
	    var inputField;
	    var fieldValue;
	    var recipient;
		var size = 0;
	    while ((inputField = getInputElement(i)))
	    {
	      fieldValue = inputField.value;

	      if (fieldValue == null)
	        fieldValue = inputField.getAttribute("value");

	      if (fieldValue != "")
	      {
	        recipientType = getPopupElement(i).selectedItem.getAttribute("value");
	        recipient = null;
	        switch (recipientType)
	        {
	          case "addr_to"    :
	          case "addr_cc"    :
	          case "addr_bcc"   :
	          case "addr_reply" :
	            try {
	              recipient = mailMimeHeaderParser.reformatUnquotedAddresses(fieldValue);
	            } catch (ex) {recipient = fieldValue;}
	            break;
	        }

	        switch (recipientType)
	        {
	          case "addr_to"          : addrTo += to_Sep + recipient; to_Sep = ",";               break;
	          case "addr_cc"          : addrCc += cc_Sep + recipient; cc_Sep = ",";               break;
	          case "addr_bcc"         : addrBcc += bcc_Sep + recipient; bcc_Sep = ",";            break;
	          case "addr_reply"       : addrReply += reply_Sep + recipient; reply_Sep = ",";      break; 
	          case "addr_newsgroups"  : addrNg += ng_Sep + fieldValue; ng_Sep = ",";              break;
	          case "addr_followup"    : addrFollow += follow_Sep + fieldValue; follow_Sep = ",";  break;
	          case "addr_other"       : addrOther += getPopupElement(i).selectedItem.getAttribute("label") + " " + fieldValue + "\r\n";break;
	        }
	      }
	      i ++;
	    }
	    
		if (addrTo) size += addrTo.length + 6;
		if (addrCc) size += addrCc.length + 6;
		if (addrBcc) size += addrBcc.length + 7;
		if (addrReply) size += addrReply.length + 12;
		if (addrNg) size += addrNg.length + 14;
		if (addrFollow) size += addrFollow.length + 15;
		if (addrOther) size += addrOther.length;
		
	    mailMimeHeaderParser = null;
		return size;
}

////get customed headers size
function getCustomHeadersSize()
{
	var size=0;
	try{
	var msgCompFields = gMsgCompose.compFields;

	if (msgCompFields.otherRandomHeaders){
		size = msgCompFields.otherRandomHeaders.length;// * 7 / 8;
	//return size;
	}else if (customedHeaders){
		size = customedHeaders.length;
	}
	}catch(ex){}
	return size;
}
	
////get body inserted element size.
//get header what is responsible of the priority
function getPriorityFromHeaders() {
	return xsmtp_getHeaderValue(XSMTP_HEADER_X_P772_PRIMARY_PRECEDENCE);
}

function xsmtp_getHeaderValue(header) {

  	if (customedHeaders) {
		var splittedHeaders = customedHeaders.split("\r\n");
		for (var i = 0; i < splittedHeaders.length; i++) {
			if (splittedHeaders[i]) {
				var headerName = TrimString(splittedHeaders[i].substring(0, splittedHeaders[i].indexOf(':')));
				if (headerName == header) {
					return TrimString(splittedHeaders[i].substring(splittedHeaders[i].indexOf(':') + 1));
				}
			}
		}
	}
	return null;
}

function getInsertBodySize()
{
	var size = 0;
	var numerOfLine =0;
	var fileHandler = Components.classes['@mozilla.org/network/protocol;1?name=file'].getService(Components.interfaces.nsIFileProtocolHandler) ;
	var insertBody = new Array('img','a');
	var insertArrayDraft = new Array();
	for (var i in insertBody){
	
		var field=gMsgCompose.editor.rootElement.getElementsByTagName(insertBody[i]);
	
		if (field){
		
			for (var j = 0; j < field.length;j++){
				var insert="";
				//var field="";
				var realInsertLink="";
				insert = gMsgCompose.editor.rootElement.getElementsByTagName(insertBody[i])[j].src;
				if (insertBody[i]=="a"){
					insert=gMsgCompose.editor.rootElement.getElementsByTagName(insertBody[i])[j];
					try{
						realInsertLink = gMsgCompose.editor.rootElement.getElementsByTagName('a')[j].attributes[2].value;
					}catch(ex){}
				}
	
				if (/^mailbox:\/\/\/\w+[^\%7]/.test(insert)){
						insertArrayDraft.push(insert);					
				}
				if (realInsertLink ==""){
					if (/[^mailbox]:\/\//.test(insert)){
					    
						file = fileHandler.getFileFromURLSpec(insert);
						var mimeSize= 160 + (file.leafName.length * 2);
						size += (file.fileSize*4/3) + mimeSize;
						numerOfLine = ((file.fileSize*4/3) / 72) *2 +1;
						size += numerOfLine;
					}
				}
			}
		}
	}
	if (insertArrayDraft.length > 0){
	    var insertSize=0;
		var xSMTPArg = [insertArrayDraft, insertSize];
        // Open the dialog window that will block the user until body inserted image or link size  are calculate 
        window.openDialog(
            MSCOPTIONS_INSERTED_RECORDED_BODY_SIZE,
            'mSCOptionsInsertedRecordSize', // Dummy name
            'chrome,resizable=0,modal=1,dialog=1', // Modal: block user
            xSMTPArg
        );

        // Fetch the certificate's datas from the dialog window
        insertSize = (xSMTPArg[1]*4/3) + 160 + (((xSMTPArg[1]*4/3)/72)*2) + 1;
		
		size+=insertSize;
	}
	
	return size;
}
//return body size
function getBodySize() {
	var editorBody = GetCurrentEditor();
	var outputMessage = editorBody.outputToString(editorBody.contentsMIMEType, 2);
	outputMessage = outputMessage.replace(/<br>|\/li>|\/ol>|\/ul>/gi,"<br>\r\n");

	var size = outputMessage.length + getInsertBodySize();
	return size;
}

//// get  attachements size	
function getAttachementSize() {
	var bucket = document.getElementById("attachmentBucket");
	var buketSize=0;
	var numerOfLine=0;
	var bundarySize=210;
	if (bucket.childNodes.length !=0){
		buketSize += bundarySize;
	}
	
	for (var index = 0; index < bucket.childNodes.length; index++)
	{
		var item = bucket.childNodes[index];
		var url = item.attachment.url;
		var att_name = item.attachment.name;
		var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
		var fileHandler = ios.getProtocolHandler("file").QueryInterface(Components.interfaces.nsIFileProtocolHandler);
		var file = fileHandler.getFileFromURLSpec(url);
		try 
		{
			if (file.exists())
			{
				var mimeSize= 180 + (att_name.length * 2);
				if (item.attachment.contentType != "text/plain"){
				buketSize += (file.fileSize*4/3) + mimeSize;
				numerOfLine = ((file.fileSize*4/3) / 72) *2 +1;
				buketSize += numerOfLine;
				}else{
				  buketSize += file.fileSize + mimeSize;
				}
			}
		}catch(e){}
	}
	return buketSize;
}

//// get message size	
function getSizeKo(size) {
	var unit = new Array();
	var i = 0;
	
	size = size + 455;
	size = size / 1024;	//size in Ko	
	return size;	
}


// overlay of commandClose function.
var DoCommandClose_ori = DoCommandClose;
DoCommandClose = function xSMTPDoCommandClose() {
	try {
  		initialyzeXsmtpGVariables();
  		DoCommandClose_ori();
  	} catch (ex) {
  	}
}

//////////////////////////
//////////  Main  /////////
/////////////////////////
// message size listener
function MSCListenerFunction() {
	var gPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	var isEnable = false;
	try {
		isEnable = gPrefs.getBoolPref('xsmtp.size.check.enable');
	} catch (ex) {
		// Variable 'xsmtp.size.check.enable' not define then define it and set the default value to false
		gPrefs.setBoolPref('xsmtp.size.check.enable', isEnable);
	}

	if (isEnable) {
		var priority = getPriorityFromHeaders();

		if (priority) {
			var fromSize = document.getElementById("msgIdentity").getAttribute("label").length;
		    var subjectBoxSize = document.getElementById("msgSubject").value.length + 9;
			var recipientsSize = getRecipientsSize();
			var customHeadersSize = getCustomHeadersSize();
			var attachementSize = getAttachementSize();
			var bodySize = getBodySize();
			
			var size = fromSize + subjectBoxSize + recipientsSize + customHeadersSize + attachementSize + bodySize;
			size = getSizeKo(size);
	
			priority = priority.substring(0, priority.indexOf('('));
			var sizeLimit = gPrefs.getIntPref("xsmtp.size." + TrimString(priority));
	
			if (size > sizeLimit){
				var MSCbundle = window.document.getElementById("string-bundle");
				var message = MSCbundle.getString("xsmtp.size.control.messsage")+ " " + (Math.round(size*10)/10) + "ko.\n" + MSCbundle.getString("xsmtp.size.control.error") + sizeLimit + " ko";
				alert (message);
				return false;
			}
		}
	}
	return true;
}

function xsmtp_checkAllowAttachmentForFlashMessage() {
	var gPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	
	var allowAttachment = xsmtp_getBoolPref("xsmtp.flash.allow.attachment", false);
	if (!allowAttachment) {

		var priority = getPriorityFromHeaders();
		if (priority == XSMTP_PRIORITY_FLASH && xsmtp_hasAttachements()) {
			var stringBundle = window.document.getElementById("string-bundle");
			alert(stringBundle.getString("xsmtp.flash.attachment.error"));
			return false;
		}
	}
	return true;
}

function xsmtp_hasAttachements() {
	var bucket = document.getElementById("attachmentBucket");
	return bucket.childNodes.length > 0;
}

//register customed headers
var xSMTPMailSendObserver = {
	observe: function(subject, topic, data) {
		try {
	  		var msgCompFields = gMsgCompose.compFields;
	 
	  		if (customedHeaders) {
				var headers = customedHeaders;	
		  		var priority = "";
				var array1 = headers.split("\r\n");
				for (var i = 0; i < array1.length; i++) {
					var head = array1[i];
					if (head) {
						var regval = new RegExp("^([^:]*):([^:]*)");
						regval.test(array1[i]);
						var value = RegExp.$2;
						var field = RegExp.$1;
						if (/Info$/.test(field)){
							continue;
						}
						if (field == "" || field == " ") {
							continue;
						}
						msgCompFields.otherRandomHeaders += field + ": " + TrimString(value) +"\r\n";
					}
				}
		 		msgCompFields.otherRandomHeaders += XSMTP_HEADER_X_P772_EXTENDED_AUTHORISATION_INFO + ": " + getRFC2822Date(new Date()) + "\r\n";
		 		gContainer = 1;
	  		}  
		} catch (ex) {
		}
  	}
}

var xSMTPObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
xSMTPObserverService.addObserver(xSMTPMailSendObserver, "mail:composeOnSend", false);