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
 *   BT Global Services / Etat francais Ministere de la Defense
 * Portions created by the Initial Developer are Copyright (C) 1998-2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bruno Lebon BT Global Services / Etat francais Ministere de la Defense
 *   Eric Ballet Baz BT Global Services / Etat francais Ministere de la Defense
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

//global variable
var xSMTPMessenger = Components.classes["@mozilla.org/messenger;1"].createInstance();
xSMTPMessenger = xSMTPMessenger.QueryInterface(Components.interfaces.nsIMessenger);

//get message URI
function GetSelectedMessagesXSMTP()
{
  if (gMsgCompose) {  
	var mailWindow = gMsgCompose.compFields.draftId;
    mailWindow = mailWindow.substring(mailWindow, mailWindow.indexOf('?'));
	if (mailWindow) {
      return mailWindow;
    }
  }

  return null;
} 

//get message headers
function GetHeadersFromURI(messageURI) {  
    var messageService = xSMTPMessenger.messageServiceFromURI(messageURI);
    var messageStream = Components.classes["@mozilla.org/network/sync-stream-listener;1"].createInstance().QueryInterface(Components.interfaces.nsIInputStream);
    var inputStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance().QueryInterface(Components.interfaces.nsIScriptableInputStream);
    inputStream.init(messageStream);
    var newuri = messageService.streamMessage(messageURI,messageStream, null, null, false, null); 

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

//get xsmtp headers
function getXsmtpHeadersFromURI() {
    var messageURI = "";
	if ((gMsgCompose.type == 9) || (gMsgCompose.type == 10)){
	    var regex = gMsgCompose.type + ":uri";
	    var regval = new RegExp("^" + regex);
		var xSMTPHeaders = "";
	 
		messageURI = GetSelectedMessagesXSMTP();
		
		if (/null/.test(messageURI)) {
			return false;
		}

		var head = GetHeadersFromURI(messageURI).allHeaders;
		var allHeaders = head.split('\r\n');
		for (i in allHeaders){ 
			if (!(allHeaders[i].indexOf('X-P772'))) {
				xSMTPHeaders += allHeaders[i]+ "\r\n";
			}
		}
		return xSMTPHeaders;

	} else
		return messageURI;
}
