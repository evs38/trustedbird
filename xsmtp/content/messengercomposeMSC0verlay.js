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
 *   BT Global Services / Etat français Ministère de la Défense
 * Portions created by the Initial Developer are Copyright (C) 1998-2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bruno Lebon BT Global Services / Etat français Ministère de la Défense
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
const MSCOPTIONS_INSERTED_RECORDED_BODY_SIZE = 'chrome://rescomclientxsmtp/content/xSMTPInsertedRecordSize.xul';

function initialyzeXsmtpGVariables(){
	customedHeaders="";
	gContainer=0;
}
 
//get header from recorded message
function TrimString(string) //ok
{
  if (!string) return "";
  return string.replace(/(^\s+)|(\s+$)/g, '')
}


// overlay of sending and saving functions 
var SendMessage_ori = SendMessage;
SendMessage = function xSMTPSendMessage()
{
	if (!MSCListenerFunction()) return;
	SendMessage_ori();
	initialyzeXsmtpGVariables();
}

//Overlay Ctrl-Enter
var SendMessageWithCheck_ori = SendMessageWithCheck;
SendMessageWithCheck = function xSMTPSendMessageWithCheck()
{
	if (!MSCListenerFunction()) return;
	SendMessageWithCheck_ori();
	initialyzeXsmtpGVariables();
}

var SendMessageLater_ori = SendMessageLater;
SendMessageLater = function xSMTPSendMessageLater()
{
	if (!MSCListenerFunction()) return;
	SendMessageLater_ori();
	initialyzeXsmtpGVariables();
}

var Save_ori = Save;
Save = function xSMTPSave()
{
  if (!MSCListenerFunction()) return;
  Save_ori();
}

var SaveAsDraft_ori = SaveAsDraft;
SaveAsDraft = function xSMTPSaveAsDraft()
{
  if (!MSCListenerFunction()) return;
  SaveAsDraft_ori();
}

var SaveAsTemplate_ori = SaveAsTemplate;
SaveAsTemplate = function xSMTPSaveAsTemplate()
{
  if (!MSCListenerFunction()) return;
  SaveAsTemplate_ori();
}

var AutoSave_ori = AutoSave;
AutoSave = function xSMTPAutoSave()
{
  if (!MSCListenerFunction()) return;
  AutoSave_ori();
}
//end of the overlay

//get body inserted element size.
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
	
				if (/^mailbox:/.test(insert)){
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
        insertSize = (xSMTPArg[1]*4/3);// + 160 + (((xSMTPArg[1]*4/3)/72)*2) + 1;
		
		size+=insertSize;
		
	}
	
	return size;
}

//return body size
function getBodySize()
{
	var  editorBody = GetCurrentEditor();
	var outputMessage = editorBody.outputToString(editorBody.contentsMIMEType,2);
	outputMessage =outputMessage.replace(/<br>|\/li>|\/ol>|\/ul>/gi,"<br>\r\n");

	var size = outputMessage.length + getInsertBodySize();
	return size;
}

// return  attachements size	
function getAttachementSize()
{
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
				buketSize += (file.fileSize*4/3) + mimeSize;
				numerOfLine = ((file.fileSize*4/3) / 72) *2 +1;
				buketSize += numerOfLine;
			}
		}catch(e){}
	}
	return buketSize;
}

// body + attachements size	
function getSizeKo(size)
{
	var unit = new Array();
	var i = 0;
	
	size = size;
	size = size / 1024;	//size  in Ko	
	return size;	
}

//get  header what is responsible of the priority
function getHeader()
{
      var headers=customedHeaders;	
      var copyPrecedence="";
	  var xSMTPHeadersHash = new Array(); 
	  if (customedHeaders){
		  var headers=customedHeaders;	
		  var array1=headers.split("\r\n");
		  for (var i = 0; i< array1.length; i++) {
			var head=array1[i];
			if (head){
				var regval = new RegExp("^([^:]*):([^:]*)");
				regval.test(array1[i]);
				xSMTPHeadersHash[RegExp.$1] = RegExp.$2;
			}
		  }
		 if (TrimString(xSMTPHeadersHash['X-P772-Copy-Precedence'])){
		    var copyPrecedence = xSMTPHeadersHash['X-P772-Copy-Precedence'];
			copyPrecedence = copyPrecedence.substring(0,copyPrecedence.indexOf('('));
			copyPrecedence = 'xsmtp.size.'+TrimString(copyPrecedence);
		}
	  }
	  return copyPrecedence;  
}

// overlay of commandClose function.
var DoCommandClose_ori = DoCommandClose;
DoCommandClose = function xSMTPDoCommandClose()
{ 
  try{
  initialyzeXsmtpGVariables();
  DoCommandClose_ori();
  }catch(ex){}
}


// message size listener
function MSCListenerFunction()
{
	var MSCbundle = window.document.getElementById("string-bundle");
	var size=0;	
	var sizeControl=0;
	var gPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	if (getHeader() != ''){
		var attachementSize=getAttachementSize();
		var bodySize=getBodySize();
		size = size + bodySize + attachementSize;
		size = getSizeKo(size);
		sizeControl = gPrefs.getIntPref(TrimString(getHeader()));
		var isEnable = gPrefs.getBoolPref('xsmtp.size.check.enable');
	
		if ((size > sizeControl) && (isEnable)){
			var message = MSCbundle.getString("message.title")+" "+(Math.round(size*10)/10)+"ko.\n"+MSCbundle.getString("message.error")+sizeControl+" ko";
			alert (message);
			return false;
		}
	}
	return true;
}

window.addEventListener('compose-send-message', MSCListenerFunction, true);