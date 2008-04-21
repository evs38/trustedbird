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
 * The Original Code is Mozilla Communicator
 * 
 * The Initial Developer of the Original Code is
 *    Daniel Rocher <daniel.rocher@marine.defense.gouv.fr>
 *       Etat francais Ministere de la Defense
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 * 
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the LGPL or the GPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK ***** */


/**
	@fileoverview
	This file implements a listener which will be called only when a message is added to the folder and test if this message is a delivery reports.
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/



const MSG_FLAG_NEW =  0x10000;


/**
	Move message
	@param {nsIMsgDBHdr} msgHdr message to move
	@param {nsIMsgFolder} srcFolder folder source
	@param {nsIMsgFolder} dstFolder folder destination
	@return {boolean} return <b>false</b> if an error occured
*/
function moveMessage (msgHdr, srcFolder, dstFolder) {

	// test if srcFolder and dstFolder are equals
	if (srcFolder==dstFolder) {
		srv.logSrv("moveMessage - source and target are equals. Exit");
		return true;
	}

	var messagesArray = Components.classes["@mozilla.org/supports-array;1"].createInstance(Components.interfaces.nsISupportsArray);

	messagesArray.AppendElement(msgHdr);

	srv.logSrv("moveMessage - from: '" + srcFolder.abbreviatedName + "' to '" + dstFolder.abbreviatedName + "': " + msgHdr.messageId);

	try {
		dstFolder.copyMessages(
			srcFolder,       // srcFolder
			messagesArray,   // nsISupportsArray
			true,            // isMove
			msgWindow,       // nsIMsgWindow
			null,            // nsIMsgCopyServiceListener
			false,           // isFolder
			true             // allowUndo
		);
	} catch (ex) {
		srv.errorSrv("moveMessage - Error moving messages from '" + srcFolder.abbreviatedName + "' to '" + dstFolder.abbreviatedName + "' - MsgId: " + msgHdr.messageId);
		return false;
	}

	return true;
}



/**
	listener which will be called when a message is added to the folder
	@version 0.9.2
	@author Daniel Rocher / Etat francais Ministere de la Defense
	@see GLOBALS#notifyInit

*/
var notifyListener = {
	/**
		regular expressions cache
	*/
	regExpCache : {
		removeEOL: new RegExp('\\n','g'),
		removeCR: new RegExp('\\r','g'),
		trim: new RegExp("(?:^\\s*)|(?:\\s*$)","g")
	},
	/**
		called when a message is added to the folder
	*/
	OnItemAdded: function(parentItem, item) {
		try {
			var header = item.QueryInterface(Components.interfaces.nsIMsgDBHdr);
			var folder = header.folder.QueryInterface(Components.interfaces.nsIMsgFolder);
		}
		catch (e) {
			// item is not a message
			return;
		}
		
		// Check if this message is new
		if (header.flags & MSG_FLAG_NEW) {
			// test if already parsed
			if (header.getStringProperty("x-notifications_viewer-type")=="DSN")
				return;

			this.getMsgSrc(header);
		}
	},
	OnItemBoolPropertyChanged: function(item, property, oldValue, newValue) {},
	OnItemEvent: function(item, event) {},
	OnItemIntPropertyChanged: function(item, property, oldValue, newValue) {},
	OnItemPropertyChanged: function(item, property, oldValue, newValue) {},
	OnItemPropertyFlagChanged: function(item, property, oldFlag, newFlag) {},
	OnItemRemoved: function(parentItem, item, view) {},
	OnItemUnicharPropertyChanged: function(item, property, oldValue, newValue) {},
	/**
		Get message source
		@param {nsIMsgDBHdr} header
		@return {boolean} return <b>false</b> if an error occured
	*/
	getMsgSrc: function(header) {

		var MsgURI=header.folder.getUriForMsg (header);

		var streamListener = {
			QueryInterface: function(aIID) {
				if (aIID.equals(Components.interfaces.nsISupports)
					|| aIID.equals(Components.interfaces.nsIStreamListener))
					return this;
				throw Components.results.NS_NOINTERFACE;
			},
			data: "",
			onStartRequest: function(request, context) {},
			onDataAvailable: function(request, context, inputStream, offset, available) {
				var stream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
				stream.init(inputStream);
				this.data += stream.read(available);
				stream = null;
			},
			onStopRequest: function(request, context, status) {
				if (Components.isSuccessCode(status)) {
					notifyListener.parseMsg(header,this.data);
				} else {
					srv.errorSrv("notifyListener.getMsgSrc - "+MsgURI+" - Error: "+status);
				}
			}
		}

		var stream = Components.classes["@mozilla.org/network/sync-stream-listener;1"].createInstance().QueryInterface(Components.interfaces.nsIInputStream);
		var messageService = messenger.messageServiceFromURI(MsgURI);
		try { messageService.streamMessage(MsgURI, streamListener, msgWindow, null, false, null); } catch (ex) { return false; }
		return true;
	},

	/**
		Get message source is finished
		@param {nsIMsgDBHdr} header
		@param {string} msgSrc message source
		@return {boolean} return <b>false</b> if an error occured
	*/
	parseMsg: function (header,msgSrc) {

		var folder=header.folder;
		var headersSrc="";
		var bodySrc=""

		// remove CR
		msgSrc=msgSrc.replace(notifyListener.regExpCache.removeCR, "");

		// the  body  is separated from the headers by a null line (RFC 822)
		var separator="\n\n";
		var Index=msgSrc.indexOf(separator);
		if (Index!= -1)
		{
			headersSrc=msgSrc.substring(0,Index);
			bodySrc=msgSrc.substring(Index+separator.length);
		}

		var mimeHeaders = Components.classes["@mozilla.org/messenger/mimeheaders;1"].createInstance().QueryInterface(Components.interfaces.nsIMimeHeaders);
		
		mimeHeaders.initialize(headersSrc, headersSrc.length);
		var contentT=mimeHeaders.extractHeader( "content-type" , false );

		// found Content type
		if ((/multipart\/report/i).test(contentT) && (/report\-type[ \\s]*=[ \\s]*delivery\-status/i).test(contentT))
		{
			// It's a new DSN
			SetBusyCursor(window, true);

			// tag this message
			header.setStringProperty("x-notifications_viewer-type","DSN");

			srv.logSrv("DSN (MsgKey="+header.messageKey+") - in /"+folder.prettyName + "/ folder (" + folder.rootFolder.prettyName+ ")");
			// parse DSN
			dsnparser= new dsnParser(msgSrc);

			// get delivery reports
			var deliveryReports=dsnparser.getDeliveryReports();

			if (deliveryReports==null || deliveryReports=="") {
				srv.warningSrv("DSN (MsgKey="+header.messageKey+") - This message doesn't contain delivery reports");
				SetBusyCursor(window, false);
				return;
			}

			// get original Message-ID
			var originalMsgId=dsnparser.getOriginalMsgId();
			srv.logSrv("DSN (MsgKey="+header.messageKey+") - Original message-Id: "+originalMsgId);

			// read user preferences
			var includeAllAccounts=srv.preferences.getBoolPref(srv.extensionKey+".search_original_msgid.include_all_accounts");
			var includeTrashFolders=srv.preferences.getBoolPref(srv.extensionKey+".search_original_msgid.include_trash_folders");


			// search original message by message-id
			findMsg = new findMsgDb(folder.rootFolder);
			findMsg.includeSubFolders(true);
			findMsg.includeAllAccounts(includeAllAccounts);
			findMsg.includeTrashFolders(includeTrashFolders);
			var msgDBHdrOrigin=findMsg.searchByMsgId(originalMsgId);

			if (msgDBHdrOrigin) {
				// message found
				srv.logSrv("DSN (MsgKey="+header.messageKey+") - found original message: "+msgDBHdrOrigin.messageId+" "+msgDBHdrOrigin.subject);

				// add to the list
				mMsgAsDsnReq.addElement(msgDBHdrOrigin.messageId);

				// If user wants the notification is marked as read
				var notifAsReadPref=srv.preferences.getBoolPref(srv.extensionKey+".mark_notifications_as_read");
				if (notifAsReadPref)
					header.markRead ( true );

				// now, tag header

				// get properties for notifications_viewer
				var deliveredToP=msgDBHdrOrigin.getStringProperty("x-notifications_viewer-to");
				var statusP=msgDBHdrOrigin.getStringProperty("x-notifications_viewer-status");
				var summaryP=msgDBHdrOrigin.getStringProperty("x-notifications_viewer-summary");
				var flagsP=msgDBHdrOrigin.getStringProperty("x-notifications_viewer-flags");

				srv.logSrv("DSN (MsgKey="+header.messageKey+") - current notifications_viewer properties - "+statusP+" "+summaryP+" "+flagsP+"\n\t"+deliveredToP);

				// first delivery notification received for this message
				if (deliveredToP=="") {
					var recipientsArray=msgDBHdrOrigin.recipients.split(",");
					var CCArray=msgDBHdrOrigin.ccList.split(",");
					// concat with CClist because recipients not always include CC addresses (why ???)
					// if addresses are duplicated, just one address is includes in customProperties
					recipientsArray=recipientsArray.concat(CCArray); //concat
					
					// get recipients
					var regExp=new RegExp("([^,<> ]+@[^,<> ]+)","ig");
					for (var i=0 ; i < recipientsArray.length ; i++) {
						regExp.lastIndex=0;
						var oneRecipient=regExp.exec(recipientsArray[i]);
						if (oneRecipient && oneRecipient.length>1) {
							// a valid address
							// add to x-notifications_viewer-to string property
							if (i>0) deliveredToP+="\n\t";
							deliveredToP+=oneRecipient[1]+";;;0";
						}
					}
				}

				var customProp=new customProperties(deliveredToP,statusP,summaryP,flagsP);

				// read delivery Reports
				for (var i=0; i < deliveryReports.length ; i++) {
					srv.logSrv("DSN (MsgKey="+header.messageKey+") - "+deliveryReports[i].finalRecipient+" "+deliveryReports[i].actionValue);
					// test if it's a valid report
					if (dsnparser.isValidReport(deliveryReports[i].actionValue))
						customProp.addReport(deliveryReports[i],header.messageId);
				}

				deliveredToP=customProp.getDeliveredToProperty();
				statusP=customProp.getStatusProperty();
				summaryP=customProp.getSummaryProperty();
				flagsP=customProp.getFlagsProperty();

				srv.logSrv("DSN (MsgKey="+header.messageKey+") - new notifications_viewer properties - "+statusP+" "+summaryP+" "+flagsP+"\n\t"+deliveredToP);

				// save properties in the original message
				msgDBHdrOrigin.setStringProperty("x-notifications_viewer-to",deliveredToP);
				msgDBHdrOrigin.setStringProperty("x-notifications_viewer-status",statusP);
				msgDBHdrOrigin.setStringProperty("x-notifications_viewer-summary",summaryP);
				msgDBHdrOrigin.setStringProperty("x-notifications_viewer-flags",flagsP);

				// If user want to create a thread on the original message, move DSN message
				var threadPref=srv.preferences.getBoolPref(srv.extensionKey+".thread_on_original_message");
				if (threadPref) {
					var targetFolder = RDF.GetResource(msgDBHdrOrigin.folder.URI).QueryInterface(Components.interfaces.nsIMsgFolder);
					// add References and In-Reply-To properties
					var arrayProperties=new Array();
					// tag this message
					arrayProperties.push(new propertyObj("X-Notifications_viewer-Type","DSN"));
					arrayProperties.push(new propertyObj("References","<"+msgDBHdrOrigin.messageId+">"));
					arrayProperties.push(new propertyObj("In-Reply-To","<"+msgDBHdrOrigin.messageId+">"));
					writePropertiesToHdr.createMsgSrc(header,targetFolder,arrayProperties);
				}
			}
			else {
				srv.warningSrv("DSN (MsgKey="+header.messageKey+") - Original message has not been found");
			}

			SetBusyCursor(window, false);
		}
	}
};



/**
	Adds a listener which will be called only when a message is added to the folder
*/
function notifyInit() {
	srv.logSrv("notifyInit()");
	var mailSession = Components.classes["@mozilla.org/messenger/services/session;1"].getService(Components.interfaces.nsIMsgMailSession);
	mailSession.AddFolderListener(notifyListener, Components.interfaces.nsIFolderListener.added);
}

