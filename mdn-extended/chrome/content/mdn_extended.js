/* ***** BEGIN LICENSE BLOCK *****
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
 * The Original Code is Trustedbird/MDN Extended code.
 *
 * The Initial Developer of the Original Code is
 * BT Global Services / Etat francais Ministere de la Defense.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Eric Ballet Baz / BT Global Services / Etat francais Ministere de la Defense
 *   Raphael Fairise / BT Global Services / Etat francais Ministere de la Defense
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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


/**
 * Controller object that will handle deletion commands
 */
var MDNExtendedDeleteController = {
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

    isCommandEnabled: function(aCommand) {
      var enabled = false;

      /* Call default controller action */
      top.controllers.removeController(this);
      var controller = top.document.commandDispatcher.getControllerForCommand(aCommand);
      top.controllers.insertControllerAt(0, this);
      if (controller) enabled = controller.isCommandEnabled(aCommand);

      return enabled;
    },

    doCommand: function(command) {
      if (!this.isCommandEnabled(command)) return;

      var selectedMessages = null;
      var mailWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService().QueryInterface(Components.interfaces.nsIWindowMediator).getMostRecentWindow("mail:3pane");
      if (mailWindow) selectedMessages = mailWindow.gFolderDisplay.selectedMessageUris;

      if (selectedMessages) {
        for (var i = 0; i < selectedMessages.length; i++) {
          var msgHdr = messenger.messageServiceFromURI(selectedMessages[i]).messageURIToMsgHdr(selectedMessages[i]);
          if (msgHdr) MDNExtendedHandleMDNDeleteResponse(msgHdr, MDNExtendedGetMessageHeaders(msgHdr));
        }
      }

      /* Call default controller action */
      top.controllers.removeController(this);
      goDoCommand(command);
      top.controllers.insertControllerAt(0, this);
    },

    onEvent: function(event) {
    }
};

/**
 * Return mime headers of a message
 * @param {nsIMsgDBHdr} aMsgDBHdr Message handler
 * @return {nsIMimeHeaders} Message headers
 */
function MDNExtendedGetMessageHeaders(aMsgDBHdr) {
  if (!aMsgDBHdr) return;

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
    var mimeHeaders = Components.classes["@mozilla.org/messenger/mimeheaders;1"].createInstance(Components.interfaces.nsIMimeHeaders);
    mimeHeaders.initialize(headers, headers.length);

    return mimeHeaders;

  } catch (e) {
    var errorMessage = "MDNExtendedGetMessageHeaders exception: " + e;
    Components.utils.reportError(errorMessage);
    dump(errorMessage + "\n");
  }
}

/**
 * Handle MDN delete response
 * based on HandleMDNResponse() from mailWindowOverlay.js
 * @param {nsIMsgDBHdr} aMsgDBHdr Message handler
 * @param {nsIMimeHeaders} Message headers
 */
function MDNExtendedHandleMDNDeleteResponse(aMsgDBHdr, aMimeHeaders) {
  if (!aMsgDBHdr) return;

  var msgFolder = aMsgDBHdr.folder;
  if (!msgFolder) return;

  /* If the message is marked as junk, do NOT attempt to process a return receipt */
  try {
    var junkScore = aMsgDBHdr.getStringProperty("junkscore");
    if ((junkScore != "") && (junkScore != "0")) return;
  } catch (ex) {}

  /* If the message is a news message, do NOT attempt to process a return receipt */
  const MSG_FOLDER_FLAG_NEWSGROUP = 0x00000001; /* from nsMsgFolderFlags.h */
  if (msgFolder.getFlag(MSG_FOLDER_FLAG_NEWSGROUP)) return;

  /* If the message is in trash, do NOT attempt to process a return receipt */
  const MSG_FOLDER_FLAG_TRASH = 0x00000100; /* from nsMsgFolderFlags.h */
  if (msgFolder.getFlag(MSG_FOLDER_FLAG_TRASH)) return;

  /* If the message is already deleted, do NOT attempt to process a return receipt */
  var msgFlags = aMsgDBHdr.flags;
  if (msgFlags & Components.interfaces.nsMsgMessageFlags.IMAPDeleted) return;

  var DNTHeader = aMimeHeaders.extractHeader("Disposition-Notification-To", false);
  var oldDNTHeader = aMimeHeaders.extractHeader("Return-Receipt-To", false);
  if (!DNTHeader && !oldDNTHeader) return;

  /* Everything looks good so far, let's generate the MDN response */
  var mdnGenerator = Components.classes["@mozilla.org/messenger-mdn/generator;1"].createInstance(Components.interfaces.nsIMsgMdnGenerator);
  const MDN_DISPOSE_TYPE_DELETED = 3;
  let askUser = mdnGenerator.process(MDN_DISPOSE_TYPE_DELETED, msgWindow, msgFolder, aMsgDBHdr.messageKey, aMimeHeaders, false);

  /* Since Thunderbird 3.1, process function doesn't send directly the MDN but rely on a question through the notification bar */
  if (typeof mdnGenerator.userAgreed == "function" && askUser) {
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                  .getService(Components.interfaces.nsIPromptService);

    var mdnDeleteStringBundle = Components.classes["@mozilla.org/intl/stringbundle;1"]
                                    .getService(Components.interfaces.nsIStringBundleService)
                                    .createBundle("chrome://mdn_extended/locale/mdn_extended.properties");

    const nsIPS = Components.interfaces.nsIPromptService;
    var result = promptService.confirmEx(null,
                                         null,
                                         mdnDeleteStringBundle.GetStringFromName("mdnDeletePromptMessage"),
                                         nsIPS.BUTTON_POS_1_DEFAULT + nsIPS.BUTTON_POS_0 * nsIPS.BUTTON_TITLE_IS_STRING + nsIPS.BUTTON_POS_1 * nsIPS.BUTTON_TITLE_IS_STRING,
                                         mdnDeleteStringBundle.GetStringFromName("mdnDeletePromptSendReceipt"),
                                         mdnDeleteStringBundle.GetStringFromName("mdnDeletePromptIgnoreRequest"),
                                         "", "", {});
    if (result == 0)
      mdnGenerator.userAgreed();
    else
      mdnGenerator.userDeclined();
  }
}

/**
 * Override SetupCommandUpdateHandlers function
 */
var SetupCommandUpdateHandlersOriginal = SetupCommandUpdateHandlers;
SetupCommandUpdateHandlers = function() {
  /* Call built-in SetupCommandUpdateHandlers function */
  SetupCommandUpdateHandlersOriginal();

  /* Register our controller as the first controller in the list */
  top.controllers.insertControllerAt(0, MDNExtendedDeleteController);


  /* Change delete button command when several messages are selected
     in chrome://messenger/content/multimessageview.xhtml:
       onclick = if (event.button == 0) window.top.DefaultController.doCommand('cmd_delete');
   */
  try {
    element = document.getElementById("multimessage").contentDocument.getElementById("trash");
    element.setAttribute("onclick", "if (event.button == 0) window.top.goDoCommand('cmd_delete');");
  } catch (e) {}

}
