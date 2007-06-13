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
var customedHeaders="";
var gContainer=0;

 
const DATE_VERIF="X-P772-Extended-Authorisation-Info";

//get header from recorded message
function getDraftMessage(){
    var catchHeaderFromURI="";
	catchHeaderFromURI = getXsmtpHeadersFromURI(msgWindow,window);
	if ((catchHeaderFromURI)){
			//window.customedHeaders = catchHeaderFromURI; //record field value initialization
		return catchHeaderFromURI;
	}else{return "";}
}

//trim space before and after the string
function TrimString(string) //ok
{
  if (!string) return "";
  return string.replace(/(^\s+)|(\s+$)/g, '')
}


//register customed headers
var xSMTPMailSendObserver =
{
  observe: function(subject, topic, data)
  {
	  try{
	  var msgCompFields = gMsgCompose.compFields;
	  if ((gContainer == 0) && (gMsgCompose.type != 0)){ 
			customedHeaders=getDraftMessage();
	  }
	  if (customedHeaders){
		  var headers=customedHeaders;	
		  var priority="";
		  var array1=headers.split("\r\n");
		  for (var i = 0; i< array1.length; i++) {
			var head=array1[i];
			if (head){
				var regval = new RegExp("^([^:]*):([^:]*)");
				regval.test(array1[i]);
				var value = RegExp.$2; var field = RegExp.$1;
				if (/Info$/.test(field)){continue;}
				if ((field == "available") || (field == "") || (field == " ")){ continue;}
				msgCompFields.otherRandomHeaders += field+": " + TrimString(value) +"\r\n";
			}
		  }
		 msgCompFields.otherRandomHeaders += DATE_VERIF+": " + setRFC2822Date(new Date()) + "\r\n";
		 gContainer=1;
	  }
	  
	 }catch(ex){}
  }
}

var xSMTPObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
xSMTPObserverService.addObserver(xSMTPMailSendObserver, "mail:composeOnSend", false);