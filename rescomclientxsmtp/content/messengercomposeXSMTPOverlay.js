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
* Netscape Communications Corporation.
* Portions created by the Initial Developer are Copyright (C) 1998-2001 
* the Initial Developer. All Rights Reserved.
*
* Contributor(s):
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

var XP772=new Array("X-P772-Version","X-P772-Priority-Level-Qualifier","X-P772-Extended-Grade-Of-Delivery","X-P772-Primary-Precedence","X-P772-Copy-Precedence","X-P772-Message-Type","X-P772-Address-List-Indicator","X-P772-Exempted-Address","X-P772-Extended-Authorisation-Info","X-P772-Distribution-Codes","X-P772-MCA","X-P772-Handling-Instructions","X-P772-Message-Instructions","X-P772-Codress-message-indicator","X-P772-Originator-Reference","X-P772-ReferenceIndication","X-P772-Other-Recipient-Indicator","X-P772-Acp-Message-identifier","X-P772-Originator-PLAD","X-P772-Acp-Notification-Request","X-P772-Acp-Notification-Response","X-P772-Security-Classification","X-P772-Special-Handling-Instructions","available");
var gPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

addCustomPref('mail.compose.other.header');
//addCustomPref('mailnews.customHeaders','yes');
//addCustomPref('mailnews.customDBHeaders','yes');

//add custom headers pref
function addCustomPref(val,lower)
{
   var customedHeaders = "";
   var headrs = gPrefs.getCharPref(val);
   for (var i=0; i< XP772.length; i++){
	 if ( headrs.indexOf(XP772[i]) != -1 ){
	 }else {headrs += XP772[i]+",";}
  }
  if (lower == "yes"){headrs = headrs.toLowerCase();}
  gPrefs.setCharPref(val, headrs);
}

var mailSendObserver =
{
  observe: function(subject, topic, data)
  {
    var window = subject;
    var headers=customedHeaders;
	//currentHeaderData['message-id'].headerValue
	
      var msgCompFields = gMsgCompose.compFields;
	  var array1=headers.split("|");
	  for (var i = 0; i< array1.length; i++) {
		var head=array1[i];
		var field = head.split(":");
		if ((field[0] == "available") || (field[0] == "")){ break;}
		msgCompFields.otherRandomHeaders += field[0]+": " + field[1] +"\r\n";
		var foo = new Object;
		foo.headerValue = field[0];
		foo.headerName = field[1];
		currentHeaderData[foo.headerName] = foo.headValue;
	 }
	window.customedHeaders = "";
  }
}


var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
observerService.addObserver(mailSendObserver, "mail:composeOnSend", false);