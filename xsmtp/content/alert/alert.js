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

// Alert listener for flash messages
var xsmtp_flashAlertFolderListener = {
   	OnItemAdded: function(parentItem, item) {
   		var hdr = item.QueryInterface(Components.interfaces.nsIMsgDBHdr);
   		var key = hdr.messageKey;

    	if (!hdr.isRead) {
    		// If this is a flash message
        	if (hdr.getStringProperty(XSMTP_HEADER_X_P772_PRIMARY_PRECEDENCE.toLowerCase()) == XSMTP_PRIORITY_FLASH) {
    			// Set focus on the message just current added
       			gDBView.selectMsgByKey(key);

       			// Open alert popup
        		window.openDialog("chrome://xsmtp/content/alert/alert.xul", "_blank", "all,chrome,dialog=no,modal,centerscreen", hdr.folder.getUriForMsg(hdr), hdr.folder.URI);
        	}
    	}
	},

    OnItemBoolPropertyChanged:		function(item, property, oldValue, newValue) {},
    OnItemEvent:					function(item, event) {},
    OnItemIntPropertyChanged:		function(item, property, oldValue, newValue) {},
    OnItemPropertyChanged:			function(item, property, oldValue, newValue) {},
    OnItemPropertyFlagChanged:		function(item, property, oldFlag, newFlag) {},
    OnItemRemoved:					function(parentItem, item) {},
    OnItemUnicharPropertyChanged:	function(item, property, oldValue, newValue) {}
};

// Add folder listener
var xsmtp_mailSession = Components.classes["@mozilla.org/messenger/services/session;1"].getService(Components.interfaces.nsIMsgMailSession);
xsmtp_mailSession.AddFolderListener(xsmtp_flashAlertFolderListener, Components.interfaces.nsIFolderListener.all);

// Sound player
function xsmtp_playSoundAlert() {
   	var soundUri = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURI);
   	soundUri.spec = "chrome://xsmtp/content/alert/alert.wav";

   	var sound = Components.classes["@mozilla.org/sound;1"].createInstance(Components.interfaces.nsISound);
   	sound.init();
   	sound.play(soundUri);

   	// Loop
	setTimeout("xsmtp_playSoundAlert()", 2000);
}

var xsmtp_blink = true;

function xsmtp_blinkAlertMessage() {

  	if (xsmtp_blink) {
    	document.getElementById("xsmtp.alert.message").style.background = "black";
    	document.getElementById("xsmtp.alert.message").style.color = "red";

  	} else {
    	document.getElementById("xsmtp.alert.message").style.background = "red";
    	document.getElementById("xsmtp.alert.message").style.color = "white";
  	}
  	xsmtp_blink = !xsmtp_blink;
  	
  	// Loop
  	setTimeout("xsmtp_blinkAlertMessage()", 250);
}
