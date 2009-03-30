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
 * Contributor(s):
 *    Olivier Parniere / BT Global Services / Etat francais Ministere de la Defense
 *    Raphael Fairise / BT Global Services / Etat francais Ministere de la Defense
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



/**
	@class A property object
	@param {string} propertyName property name
	@param {string} propertyValue property value
	@author Daniel Rocher / Etat francais Ministere de la Defense
	@constructor
*/
function propertyObj(propertyName,propertyValue) {
	/** property name @type string */
	this.propertyName = propertyName;
	/** property value @type string */
	this.propertyValue = propertyValue;
}


/**
	listener which will be called when a message is added to the folder
	@version 0.9.5
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
		@return {Array} list of accounts
	*/
	listAllSentBox : function() {
		var idArray = new Array();
		var msgAccountManager = Components.classes["@mozilla.org/messenger/account-manager;1"]
				.getService(Components.interfaces.nsIMsgAccountManager);
		var identities = msgAccountManager.allIdentities;

		for (var i = 0;i < identities.Count(); i++) {
			var id = identities.QueryElementAt(i,
					Components.interfaces.nsIMsgIdentity);
			idArray.push(id.fccFolder);
		}
		return idArray;
	},
	/**
		Update all sent box
	*/
	updateAllSentBox : function() {

		var RDF = Components.classes['@mozilla.org/rdf/rdf-service;1']
				.getService();
		RDF = RDF.QueryInterface(Components.interfaces.nsIRDFService);
		var sentboxArray = this.listAllSentBox();

		//loop over all Sent Box
		for (var index = 0;index < sentboxArray.length; index++) {
			var folderRessource = RDF.GetResource(sentboxArray[index]);
			var folder = folderRessource
					.QueryInterface(Components.interfaces.nsIMsgFolder);
			try {
				folder.startFolderLoading();
				folder.updateFolder(null);
			} catch(e) {}
		}
	},
	/**
		called when a message is added to the folder
	*/
	itemAdded: function(item) {
		this.updateAllSentBox();
		
		try {
			var header = item.QueryInterface(Components.interfaces.nsIMsgDBHdr);
			var folder = header.folder.QueryInterface(Components.interfaces.nsIMsgFolder);
		}
		catch (e) {
			// item is not a message
			return;
		}

		
		var nViewerSeen = header.getStringProperty("x-nviewer-seen");
		if (nViewerSeen == "") {
			/* Message has not been already analyzed */
			SetBusyCursor(window, true);
			
			/* Get message source and parse it */
			notifyListener.getMsgSrc(header, notifyListener.parseMsg);
			
			SetBusyCursor(window, false);
		}
	},
	itemDeleted : function(item) {},
	itemMoveCopyCompleted : function(aMove, aSrcItems, aDestFolder) {
		for (var i = 0; i < aSrcItems.Count(); i++) {
			var item = aSrcItems.GetElementAt(i);
			var header = item.QueryInterface(Components.interfaces.nsIMsgDBHdr);
			var findMsg = new findMsgDb(aDestFolder);
			var newHeader = findMsg.searchByMsgId(header.messageId);
			if (newHeader != null) this.itemAdded(newHeader);
		}
	},
	folderRenamed : function(aOrigFolder, aNewFolder) {},

	/**
		Get message source
		@param {nsIMsgDBHdr} header
		@param {function} callbackFunction Function to call when data are received: callbackFunction(header, receivedData, callbackParam)
		@param callbackParam Parameter of callbackFunction
		@return {string} Message source or <b>false</b> if an error occurs
	*/
	getMsgSrc: function(header, callbackFunction, callbackParam) {
		if (!header) return;
		
		var MsgURI = header.folder.getUriForMsg(header);

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
					callbackFunction(header, this.data, callbackParam);
				} else {
					srv.errorSrv("notifyListener.getMsgSrc - "+MsgURI+" - Error: "+status);
				}
			}
		}

		var messageService = messenger.messageServiceFromURI(MsgURI);
		try { messageService.streamMessage(MsgURI, streamListener, null, null, false, null); } catch (ex) { return false; }
	},
	
	
	/**
		Get message source is finished
		@param {nsIMsgDBHdr} header
		@param {string} msgSrc message source
		@return {boolean} return <b>false</b> if an error occurs
	*/
	parseMsg: function (header, msgSrc) {
		if (!header) return false;
		if (header.getStringProperty("x-nviewer-seen") != "") return false;
		
		header.setStringProperty("x-nviewer-seen", "yes");
		srv.logSrv("Parsing message " + header.messageId + "...");
		
		
		/* Don't parse message if it's in trash folder */
		const MSG_FOLDER_FLAG_TRASH = 0x0100;
		if (header.folder.flags & MSG_FOLDER_FLAG_TRASH) return false;
		
		
		/* Remove CR in message source */
		msgSrc = msgSrc.replace(notifyListener.regExpCache.removeCR, "");
		
		/* Extract headers from message source */
		var bodyIndex = msgSrc.indexOf("\n\n");
		if (bodyIndex == -1) return false;
		var headersSrc = msgSrc.substring(0, bodyIndex) + "\n";
		var mimeHeaders = Components.classes["@mozilla.org/messenger/mimeheaders;1"].createInstance().QueryInterface(Components.interfaces.nsIMimeHeaders);
		mimeHeaders.initialize(headersSrc, headersSrc.length);
		
		/* Read user preferences to determine if DSN and MDN should be taken into account */
		var parseDsn = srv.preferences.getBoolPref(srv.extensionKey + ".parse_dsn");
		var parseMdn = srv.preferences.getBoolPref(srv.extensionKey + ".parse_mdn");

		
		/* Get current notification data from notification db and save it to the message db */
		var data = notificationDbHandler.getMessageField(header.messageId, "notificationData");
		var notificationData = new customProperties(header.dateInSeconds + ":" + data);
		if (data != "") {
			srv.logSrv("Saved notification data found in notification db for message " + header.messageId + "! Saving into message db...");
			/* Save notification data into message db */
			saveNotificationDataInMessageDb(notificationData, header);
		}
		
		/* Move already received notifications to the thread of current message if needed */	
		var notificationList = notificationData.getAllNotificationsMessageId();
		for (var i in notificationList) {
			/* Search notification in message db */
			var findMsg = new findMsgDb(header.folder.rootFolder);
			findMsg.includeSubFolders(true);
			findMsg.includeAllAccounts(srv.preferences.getBoolPref(srv.extensionKey + ".search_original_msgid.include_all_accounts"));
			findMsg.includeTrashFolders(srv.preferences.getBoolPref(srv.extensionKey + ".search_original_msgid.include_trash_folders"));
			var notificationHeader = findMsg.searchByMsgId(notificationList[i]);
			
			if (notificationHeader) {
				var nViewerMoveTo = notificationHeader.getStringProperty("x-nviewer-moveto");
				if (nViewerMoveTo != "" && nViewerMoveTo == header.messageId) {
					/* Move notification to original message thread */
					notifyListener.moveNotification(notificationHeader, header.messageId);
				}
			}
		}	
		
		/* Check if the message is a sent message from this account with notification requests */
		var dsnRequestHeader = mimeHeaders.extractHeader("X-DSN", false); /* X-DSN header is added by this add-on when a message is sent with a DSN SUCCESS request */
		var mdnRequestHeader = mimeHeaders.extractHeader("Disposition-Notification-To", false);
		if ((dsnRequestHeader != null || mdnRequestHeader != null) && isSentMessage(header)) {
			srv.logSrv("Processing message with notification requests...");
			
			/* Set flags with types of requested notifications */
			var requests = customProperties.NO_REQUEST;
			if (parseDsn && dsnRequestHeader != null) requests += customProperties.DSN_REQUEST;
			if (parseMdn && mdnRequestHeader != null) requests += customProperties.MDN_REQUEST;
			
			if (requests == customProperties.NO_REQUEST) return true;
			
			/* Get recipient list from message headers (To + CC + BCC) */
			var recipientsList = header.recipients + "," + header.ccList;
			var bccList = mimeHeaders.extractHeader("BCC", false);
			if (bccList) recipientsList += "," + bccList;
			var recipientsListArray = recipientsList.split(",");
			
			/* Get timeout value */
			var timeout = 0;
			//if (srv.preferences.getBoolPref(srv.extensionKey + ".enabled_timeout")) {
				timeout = parseInt(srv.preferences.getIntPref(srv.extensionKey + ".timeout"));
				timeout *= 60; /* Convert in seconds */
				if (timeout < 0) timeout = 0;
			//}
			
			/* Initialize or update notification data with recipient list */
			for (var i in recipientsListArray) {
				notificationData.addDeliveredTo(recipientsListArray[i], timeout, requests);
			}
			
			/* Save notification data into db */
			saveNotificationData(notificationData, header.messageId, header);
						
			return true;
		}
		
		
		/* Check if message is a notification report */
		var contentTypeHeader = mimeHeaders.extractHeader("content-type", false);
		var notificationType = "";
		if ((/multipart\/report/i).test(contentTypeHeader)) {
			/* Check if message is a DSN */
			if ((/report\-type[ \\s]*=[ \\s]*"?delivery\-status"?/i).test(contentTypeHeader)) {
				if (!parseDsn) return true; /* Ignore this message: user doesn't want to parse DSN */
				notificationType = "DSN";
			}
			
			/* Check if message is a MDN */
			if ((/report\-type[ \\s]*=[ \\s]*"?disposition\-notification"?/i).test(contentTypeHeader)) {
				if (!parseMdn) return true; /* Ignore this message: user doesn't want to parse MDN */
				notificationType = "MDN";
			}
		}
		
		/* Stop here if message is not a notification */
		if (notificationType == "") return true;
		
		
		srv.logSrv(notificationType + " (MsgKey="+header.messageKey + ") - in /" + header.folder.prettyName + "/ folder (" + header.folder.rootFolder.prettyName+ ")");
		var originalMsgId;
		var originalMsgNotificationData;
		
		/* Parse DSN message */
		if (notificationType == "DSN") {
			var dsnParserObj = new dsnParser(msgSrc);

			/* Read delivery reports */
			var deliveryReports = dsnParserObj.getDeliveryReports();

			if (deliveryReports == null || deliveryReports == "") {
				srv.warningSrv(notificationType + " (MsgKey=" + header.messageKey + ") - This message doesn't contain any DSN reports");
				return false;
			}

			/* Read original Message-ID */
			originalMsgId = dsnParserObj.getOriginalMsgId();
			if (originalMsgId == null) return false;
			originalMsgId = originalMsgId.replace(/<|>/g, "");
			srv.logSrv(notificationType + " (MsgKey=" + header.messageKey + ") - Original message-Id: " + originalMsgId);

			/* Get current notification data from notification db */
			var data = notificationDbHandler.getMessageField(originalMsgId, "notificationData");
			originalMsgNotificationData = new customProperties(data);

			/* Update notification data with new reports */
			for (var i in deliveryReports) {
				srv.logSrv(notificationType + " (MsgKey=" + header.messageKey + ") - " + deliveryReports[i].finalRecipient + " " + deliveryReports[i].actionValue);
				/* Add report to notification data */
				if (dsnParserObj.isValidReport(deliveryReports[i].actionValue)) originalMsgNotificationData.addDsnReport(deliveryReports[i], header.messageId);
			}

		}

		/* Parse MDN message */
		if (notificationType == "MDN") {
			var mdnParserObj = new mdnParser(msgSrc);

			/* Read MDN report */
			var mdnReport = mdnParserObj.getMdnReport();

			if (mdnReport == null || mdnReport == "") {
				srv.warningSrv(notificationType + " (MsgKey=" + header.messageKey + ") - This message doesn't contain a MDN report");
				return false;
			}

			/* Read original Message-ID */
			originalMsgId = mdnReport.originalMessageId;
			if (originalMsgId == null) return false;
			originalMsgId = originalMsgId.replace(/<|>/g, "");
			srv.logSrv(notificationType + " (MsgKey=" + header.messageKey + ") - Original message-Id: " + originalMsgId);
			
			/* Get current notification data from notification db */
			var data = notificationDbHandler.getMessageField(originalMsgId, "notificationData");
			originalMsgNotificationData = new customProperties(data);

			/* Update notification data with new report */
			srv.logSrv(notificationType + " (MsgKey=" + header.messageKey + ") - " + mdnReport.finalRecipient + " " + mdnReport.dispositionMode + " " + mdnReport.dispositionType + " " + mdnReport.originalMessageId);
			if (mdnParserObj.isValidDisposition(mdnReport.dispositionType)) originalMsgNotificationData.addMdnReport(mdnReport, header.messageId);
		}
		
		
		/* Mark the notification as read if needed */
		var markAsReadPref = srv.preferences.getBoolPref(srv.extensionKey + ".mark_notifications_as_read");
		if (markAsReadPref) {
			/* Mark as read in message db */
			header.markRead(true);
			
			/* Mark as read in IMAP */
			try {
				var imapFolder = header.folder.QueryInterface(Components.interfaces.nsIMsgImapMailFolder);
				var imapUids = [];
				imapUids.push(header.messageKey);
				imapFolder.storeCustomKeywords(null, "\\Seen", "", imapUids, 1);
			} catch (e) {}
		}
		
		/* Move notification to original thread if needed */
		var originalMsgDBHdr = notifyListener.moveNotificationWithSource(header, msgSrc, originalMsgId);
		
		/* Save notification data into database */
		saveNotificationData(originalMsgNotificationData, originalMsgId, originalMsgDBHdr);
		
		return true;
	},
	
	/**
	 * Move notification to original message thread if needed
	 * @param {nsIMsgDBHdr} header Notification header
	 * @param {string} originalMsgId Original message Id
	 */
	moveNotification : function(header, originalMsgId) {
		notifyListener.getMsgSrc(header, notifyListener.moveNotificationWithSource, originalMsgId);
	},
	
	moveNotificationWithSource : function(header, msgSrc, originalMsgId) {
		if (!header) return;
		if (header.messageId == "") return;
		

		/* Search original message in message db */
		findMsg = new findMsgDb(header.folder.rootFolder);
		findMsg.includeSubFolders(true);
		findMsg.includeAllAccounts(srv.preferences.getBoolPref(srv.extensionKey + ".search_original_msgid.include_all_accounts"));
		findMsg.includeTrashFolders(srv.preferences.getBoolPref(srv.extensionKey + ".search_original_msgid.include_trash_folders"));
		var originalHeader = findMsg.searchByMsgId(originalMsgId);
		
		if (srv.preferences.getBoolPref(srv.extensionKey + ".thread_on_original_message")) {
			if (originalHeader) {
				/* If notification is not already in correct thread */
				if (header.folder.folderURL != originalHeader.folder.folderURL || header.threadParent != originalHeader.messageKey) {
					var targetFolder = RDF.GetResource(originalHeader.folder.URI).QueryInterface(Components.interfaces.nsIMsgFolder);
					var properties = new Array();					
					
					
					/* Mark this message as already seen by this add-on */
					//properties.push(new propertyObj("X-NViewer-Seen", "yes"));
					
					/* Add notification in the thread of original message */
					properties.push(new propertyObj("References", "<" + originalHeader.messageId + ">"));
					properties.push(new propertyObj("In-Reply-To", "<" + originalHeader.messageId + ">"));
					
					/* Move notification */
					notifyListener.threadNotification(header, msgSrc, targetFolder, properties);
				}
				
				header.setStringProperty("x-nviewer-moveto", "");
			} else {
				/* Mark the notification so as to be moved later to the thread of the original message */
				header.setStringProperty("x-nviewer-moveto", originalMsgId);
			}
		}
		
		return originalHeader;
	},
	
	/**
		Thread notification
		@param {nsIMsgDBHdr} msgDBHdr notification
		@param {string} msgSrc message source
		@param {nsIMsgFolder} targetDBFolder target folder
		@param {Array} properties list of {@link propertyObj}
	*/
	threadNotification : function(msgDBHdr,msgSrc,targetDBFolder,properties) {
		if (!msgDBHdr) return;
		if (!targetDBFolder) return;

		// create temporary file (.eml) with new header fields
		var file=notifyListener.makeNewMsgSrc(msgDBHdr,msgSrc,properties);

		var flags=msgDBHdr.flags;
		var messageId = msgDBHdr.messageId;
		var isRead = msgDBHdr.isRead;
		var isFlagged=msgDBHdr.isFlagged;
		
		if (file) {
			// remove old msgDbHdr. It's important to do that first
			var list = Components.classes["@mozilla.org/supports-array;1"].createInstance(Components.interfaces.nsISupportsArray);
			list.AppendElement(msgDBHdr);
			msgDBHdr.folder.deleteMessages(list,msgWindow,true,true,null,false);

			// copy temporary file to folder
			notifyListener.copyFileMessage(file,flags,messageId,targetDBFolder,isRead,isFlagged,0);
		} else
			srv.warningSrv("notifyListener.threadNotification - temporary file "+file+" doesn't exist");
	},

	/**
		Copy temporary file to folder
		@param {string} file file name
		@param {number} flags
		@param {string} messageId message Id
		@param {nsIMsgFolder} targetDBFolder
		@param {boolean} isRead
		@param {boolean} isFlagged
		@param {number} count number of attempt
	*/
	copyFileMessage: function (file,flags,messageId,targetDBFolder,isRead,isFlagged,count) {
		srv.logSrv("notifyListener.copyFileMessage - file: "+file+" - target folder /"+targetDBFolder.prettyName + "/ (" + targetDBFolder.rootFolder.prettyName+ ")");

		try {
			// TB 2.0.0.*
			var fileSpec = Components.classes["@mozilla.org/filespec;1"].createInstance(Components.interfaces.nsIFileSpec);
			fileSpec.nativePath =file;
		} catch (e) {
			// TB 3.0.* (XPCOM 1.9)
			var fileSpec = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			fileSpec.initWithPath(file);
		}
		var copyService = Components.classes["@mozilla.org/messenger/messagecopyservice;1"].getService(Components.interfaces.nsIMsgCopyService);

		count++;

		// test if file exist
		if (fileSpec.exists()) {
			var serviceListener=notifyListener.newCopyServiceListener();
			serviceListener.file = file;
			serviceListener.messageId = messageId;
			serviceListener.folder = targetDBFolder;
			serviceListener.isRead = isRead;
			serviceListener.isFlagged= isFlagged;

			try {
				copyService.CopyFileMessage(fileSpec, targetDBFolder, null, false, flags, serviceListener, msgWindow);
			}
			catch (e) { // copy failed
				if (count<10) { // try later, TB's busy
					var delay=Math.round(1000*Math.random()+1500)*count; // a random delays
					srv.warningSrv("notifyListener.copyFileMessage - TB's busy, try later (->"+delay+"ms). temporary file: "+file+" count : "+count);
					setTimeout(notifyListener.copyFileMessage,delay,file,flags,messageId,targetDBFolder,isRead,isFlagged,count);
				} else {
					srv.errorSrv("notifyListener.copyFileMessage - Impossible to copy file "+file);
					// remove temporary file
					notifyListener.removeFile(file); //TODO perhaps keep this file ?
				}
			}
		} else
			srv.warningSrv("notifyListener.copyFileMessage - temporary file "+file+" doesn't exist");
	},

	/**
		Create a <i>nsIMsgCopyServiceListener</i> object
		@return {nsIMsgCopyServiceListener} A copyServiceListener
	*/
	newCopyServiceListener: function() {
		var copyServiceListener = {
			file:null,
			key:null,
			messageId:null,
			folder:null,
			isRead:null,
			isFlagged:null,
			QueryInterface : function(iid)  {
				if (iid.equals(Components.interfaces.nsIMsgCopyServiceListener) ||
					iid.equals(Components.interfaces.nsISupports))
						return this;
				throw Components.results.NS_NOINTERFACE;
				return 0;
			},
			OnProgress: function (progress, progressMax) {},
			OnStartCopy: function () {},
			OnStopCopy: function (status) {
				if (Components.isSuccessCode(status)) notifyListener.removeFile(this.file);
			},
			SetMessageKey: function (key) {
				this.key=key; // doesn't work with IMAP protocol
			}
		}
		return copyServiceListener;
	},

	/**
		Remove file
		@param {string} fileName file name
		@return {boolean} return <b>false</b> if an error occurs
	*/
	removeFile : function (fileName) {
		srv.logSrv("notifyListener.removeFile - "+fileName);
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(fileName);
		if (file.exists()) {
			try { file.remove(true); }
			catch (e) {
				srv.errorSrv("notifyListener.removeFile - error : \n"+e);
				return false;
			}
		}
		return true;
	},

	/**
		create temporary file (.eml) with new header fields.
		@param {nsIMsgDBHdr} msgDBHdr
		@param {string} msgSrc message source
		@param {Array} properties list of {@link propertyObj}
		@return {string} filePath or <b>null</b> if an error occurs
	*/
	makeNewMsgSrc: function (msgDBHdr,msgSrc,properties) {

		var headersSrc="";
		var bodySrc="";
		var tempFileNativePath=null;

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

		try {
			var hdrLineArray = headersSrc.split("\n");
	
			for (var j=0; j < properties.length; j++) {
				var newHdrLineArray = new Array();
	
				var propertyExist=false;
				// add metacharacter \ (backslash) escape keys
				var propertyNameExpReg=escapeRegExp(properties[j].propertyName);
				srv.logSrv("notifyListener.makeNewMsgSrc - change property - "+properties[j].propertyName+": "+properties[j].propertyValue);
				var regExp=new RegExp("^"+propertyNameExpReg+": ","i");
		
				for (var i=0; i < hdrLineArray.length; i++) {
					// remove X-Mozilla tags
					if ((/^X-Mozilla-/gi).test(hdrLineArray[i])) continue;

					if ((/^From -/gi).test(hdrLineArray[i])) continue;

					if (regExp.test(hdrLineArray[i])) {
						// property exist, replace it
	
						// if value=null, remove
						if (properties[j].propertyValue!=null)
							newHdrLineArray.push(properties[j].propertyName+": "+properties[j].propertyValue);
						propertyExist=true;
						continue;
					}
					newHdrLineArray.push(hdrLineArray[i]);
				}
			
				if (!propertyExist && properties[j].propertyValue!=null)
					newHdrLineArray.push(properties[j].propertyName+": "+properties[j].propertyValue);
				hdrLineArray=newHdrLineArray;
			}
			
			// replace LF -> CRLF
			bodySrc=bodySrc.replace(/\n/ig,"\r\n");
		
			// compile the new source
			var newSrc = newHdrLineArray.join("\r\n") +"\r\n\r\n" +bodySrc;
		
			// write the new source to a temporary file
			var tmpFile =  Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("TmpD", Components.interfaces.nsIFile);
			var fileName = (msgDBHdr.messageId).replace(/[^0-9a-zA-Z]/ig, "_");
			tmpFile.append(fileName);
			tmpFile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0644);

			tempFileNativePath = tmpFile.path;
			
			var stream =  Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
			stream.init(tmpFile, 2, 0x200, false);
			stream.write(newSrc, newSrc.length);
			stream.close();
		}
		catch (e) {
			return null;
		}
		return tempFileNativePath;
	}
};



/**
 * Adds a listener which will be called only when a message is added to the folder
 */
function notifyInit() {
	srv.logSrv("notifyInit()");
	var notificationService = Components.classes["@mozilla.org/messenger/msgnotificationservice;1"].getService(Components.interfaces.nsIMsgFolderNotificationService);
	notificationService.addListener(notifyListener);
}
