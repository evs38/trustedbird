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

// MDN Disposition Type for Deletion
const MDN_DISPOSE_TYPE_DELETED = 3;

// Controller object that will handle deletion commands : used to override default controller
var mdn_extended_MDN_DeleteController = {
    supportsCommand: function(command) {
        switch (command) {
            case "cmd_delete":
            case "button_delete":
            case "cmd_shiftDelete":
                return true;
            default:
                return false;
        }
    },

    isCommandEnabled: function(command) {
        // Delegate this call to the default controller
        top.controllers.removeController(this);
        var defaultController = CommandUpdater._getControllerForCommand(command);
        top.controllers.insertControllerAt(0, this);
        
        return defaultController.isCommandEnabled(command);
    },

    doCommand: function(command) {
        // if the user invoked a key short cut then it is possible that we got here for a command which is really disabled. kick out if the command should be disabled.
        if (!this.isCommandEnabled(command)) {
            return;
        }
        
        // HandleMDNDeleteResponse for each message to delete
        var selectedMessages = GetSelectedMessages();
        if (selectedMessages) {
           var nbSelectedMessages = selectedMessages.length;
           for (var i = 0; i < nbSelectedMessages; i++) {
                var URL = mdn_extended_createURLFromURI(selectedMessages[i]);
                var headers = mdn_extended_createHeadersFromURI(selectedMessages[i]);
                mdn_extended_HandleMDNDeleteResponse(URL, headers);
           }
        }

        // Delegate deletion to the default controller
        top.controllers.removeController(this);
        var defaultController = CommandUpdater._getControllerForCommand(command);
        top.controllers.insertControllerAt(0, this);

        defaultController.doCommand(command);
    },
    
    onEvent: function(event) {
    }
};

function mdn_extended_createHeadersFromURI(messageURI) {  
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

function mdn_extended_createURLFromURI(messageURI) {
    var messageService = messenger.messageServiceFromURI(messageURI);
    var holder = new Object();
    messageService.GetUrlForUri(messageURI, holder, null);

    holder.value.QueryInterface(Components.interfaces.nsIMsgMailNewsUrl);
    return holder.value;
}


// This function handles all mdn delete response generation
function mdn_extended_HandleMDNDeleteResponse(aUrl, headers) {
    if (!aUrl) {
        return;
    }

    var msgFolder = aUrl.folder;
    var msgURI = GetLoadedMessage();

    if (!msgFolder || !msgURI || IsNewsMessage(msgURI)) {
        return;
    }
    
    // If the message is already in the Trash don't send a MDN delete report
    if (IsSpecialFolder(msgFolder, MSG_FOLDER_FLAG_TRASH, true)) {
        return;
    }    

    // if the message is marked as junk, do NOT attempt to process a return receipt in order to better protect the user
    if (SelectedMessagesAreJunk()) {
        return;
    }

    var msgHdr = messenger.msgHdrFromURI(msgURI);
    var mimeHdr = headers;

    // If we didn't get the message id when we downloaded the message header,
    // we cons up an md5: message id. If we've done that, we'll try to extract
    // the message id out of the mime headers for the whole message.
    var msgId = msgHdr.messageId;
    if (msgId.split(":")[0] == "md5") {
        var mimeMsgId = mimeHdr.extractHeader("Message-Id", false);
        if (mimeMsgId) {
            msgHdr.messageId = mimeMsgId;
        }
    }

    // Check if the message has already been delete (IMAP)
    var msgFlags = msgHdr.flags;
    if ((msgFlags & MSG_FLAG_IMAP_DELETED)) {
        return;
    }

    // Check if the msg has a "Disposition-Notification-To" header.
    var DNTHeader = mimeHdr.extractHeader("Disposition-Notification-To", false);
    var oldDNTHeader = mimeHdr.extractHeader("Return-Receipt-To", false);
    if (!DNTHeader && !oldDNTHeader) {
        return;
    }

    // Everything looks good so far, let's generate the MDN delete response.
    var mdnGenerator = Components.classes["@mozilla.org/messenger-mdn/generator;1"].createInstance(Components.interfaces.nsIMsgMdnGenerator);
    mdnGenerator.process(MDN_DISPOSE_TYPE_DELETED, msgWindow, msgFolder, msgHdr.messageKey, mimeHdr, false);
}

// Extension Hook : replace the built in SetupCommandUpdateHandlers functions defined in mail3PaneWindowCommands.js and in messageWindow.js with our own.. 
mdn_extended_OriginalSetupCommandUpdateHandlers = SetupCommandUpdateHandlers;
SetupCommandUpdateHandlers = function mdn_extended_SetupCommandUpdateHandlers() {

    // Call built in SetupCommandUpdateHandlers function
    mdn_extended_OriginalSetupCommandUpdateHandlers();
    
    // Register our  MDN_DeleteController as the first controller in the list
    top.controllers.insertControllerAt(0, mdn_extended_MDN_DeleteController);
    dump("MDN_DeleteController Registered\n");
}

