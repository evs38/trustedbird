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
 *     Olivier Parniere BT Global Services / Etat francais Ministere de la Defense
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
	@version 0.9.4
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

		// Check if this message is new
		if (header.flags & MSG_FLAG_NEW) {
			var nViewerTag=header.getStringProperty("x-nviewer-tags");
			// if not already parsed
			if (nViewerTag.length==0) { // parse message source only if this header is not tagged
				header.setStringProperty("x-nviewer-tags","WORKING"); // tag
				this.getMsgSrc(header);
			}
		}
	},
	itemDeleted : function(aMove, aSrcItems, aDestFolder) {},
	itemMoveCopyCompleted : function(item, property, oldValue, newValue) {},
	folderRenamed : function(aOrigFolder, aNewFolder) {},

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
		var bodySrc="";

		// remove CR
		msgSrc=msgSrc.replace(notifyListener.regExpCache.removeCR, "");

		// the  body  is separated from the headers by a null line (RFC 822)
		var separator="\n\n";
		var Index=msgSrc.indexOf(separator);
		if (Index!= -1)
		{
			headersSrc=msgSrc.substring(0,Index)+"\n";
			bodySrc=msgSrc.substring(Index+separator.length);
		}

		var mimeHeaders = Components.classes["@mozilla.org/messenger/mimeheaders;1"].createInstance().QueryInterface(Components.interfaces.nsIMimeHeaders);
		
		mimeHeaders.initialize(headersSrc, headersSrc.length);
		var contentT=mimeHeaders.extractHeader( "content-type" , false );

		var strTypeNotification="";

		// enum
		var enumOfNotification = {
			unknown : 0,
			DSN : 1,
			MDN : 2
		}

		var typeOfMsg=enumOfNotification.unknown;

		// read user preferences
		var parseDSN=srv.preferences.getBoolPref(srv.extensionKey+".parse_dsn");
		var parseMDN=srv.preferences.getBoolPref(srv.extensionKey+".parse_mdn");


		// found Content type
		if ((/multipart\/report/i).test(contentT)) {
			if ((/report\-type[ \\s]*=[ \\s]*"?delivery\-status"?/i).test(contentT)) {
				// It's a DSN message, tag this message
				header.setStringProperty("x-nviewer-tags","DSN");
				if (! parseDSN)
					return; // user doesn't want to parse DSN
				typeOfMsg=enumOfNotification.DSN;
				strTypeNotification="DSN";
			}
			if ((/report\-type[ \\s]*=[ \\s]*"?disposition\-notification"?/i).test(contentT)) {
				// It's a MDN message, tag this message
				header.setStringProperty("x-nviewer-tags","MDN");
				if (! parseMDN)
					return; // user doesn't want to parse MDN
				typeOfMsg=enumOfNotification.MDN;
				strTypeNotification="MDN";
			}
		}

		if (typeOfMsg!=enumOfNotification.unknown)
		{
			// It's a new notification
			SetBusyCursor(window, true);

			var dsnparser=null;
			var mdnparser=null;
			var deliveryReports=null;
			var mdnReport=null;
			var originalMsgId="";

			srv.logSrv(strTypeNotification+" (MsgKey="+header.messageKey+") - in /"+folder.prettyName + "/ folder (" + folder.rootFolder.prettyName+ ")");

			if (typeOfMsg==enumOfNotification.DSN) {
				// parse DSN
				dsnparser= new dsnParser(msgSrc);

				// get delivery reports
				deliveryReports=dsnparser.getDeliveryReports();

				if (deliveryReports==null || deliveryReports=="") {
					srv.warningSrv(strTypeNotification+" (MsgKey="+header.messageKey+") - This message doesn't contain delivery reports");
					SetBusyCursor(window, false);
					return;
				}

				// get original Message-ID
				originalMsgId=dsnparser.getOriginalMsgId();
			}


			if (typeOfMsg==enumOfNotification.MDN) {
				// parse MDN
				mdnparser= new mdnParser(msgSrc);

				// get MDN report
				mdnReport=mdnparser.getMdnReport();

				if (mdnReport==null || mdnReport=="") {
					srv.warningSrv(strTypeNotification+" (MsgKey="+header.messageKey+") - This message doesn't contain report");
					SetBusyCursor(window, false);
					return;
				}

				// get original Message-ID
				originalMsgId=mdnReport.originalMessageId;
			}


			srv.logSrv(strTypeNotification+" (MsgKey="+header.messageKey+") - Original message-Id: "+originalMsgId);

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
				srv.logSrv(strTypeNotification+" (MsgKey="+header.messageKey+") - found original message: "+msgDBHdrOrigin.messageId+" "+msgDBHdrOrigin.subject);

				// DSN: add to the list
				if (typeOfMsg==enumOfNotification.DSN)
					mMsgAsDsnReq.addElement(msgDBHdrOrigin.messageId);

				// If user wants the notification is marked as read
				var notifAsReadPref=srv.preferences.getBoolPref(srv.extensionKey+".mark_notifications_as_read");
				if (notifAsReadPref)
					header.markRead ( true );

				// now, tag original message header

				// get properties
				var deliveredToP=msgDBHdrOrigin.getStringProperty("x-nviewer-to");
				var statusP=msgDBHdrOrigin.getStringProperty("x-nviewer-status");
				var dsnSummaryP=msgDBHdrOrigin.getStringProperty("x-nviewer-dsn-summary");
				var flagsP=msgDBHdrOrigin.getStringProperty("x-nviewer-flags");
				var mdnDisplayedSummaryP=msgDBHdrOrigin.getStringProperty("x-nviewer-mdn-displayed-summary");
				var mdnDeletedSummaryP=msgDBHdrOrigin.getStringProperty("x-nviewer-mdn-deleted-summary");

				srv.logSrv(strTypeNotification+" (MsgKey="+header.messageKey+") - current notifications_viewer properties - "+statusP+" "+dsnSummaryP+" "+flagsP+"\n\t"+deliveredToP);

				// first delivery notification received for this message
				if (deliveredToP=="") {
					var recipientsArray=msgDBHdrOrigin.recipients.split(",");
					var CCArray=msgDBHdrOrigin.ccList.split(",");
					// concat with CClist because recipients not always include CC addresses (why ???)
					// if addresses are duplicated, just one address is includes in customProperties
					recipientsArray=recipientsArray.concat(CCArray); //concat
					
					// get recipients
					for (var i=0 ; i < recipientsArray.length ; i++) {
						// test if address is correct
						var oneRecipient=getValidAddress(recipientsArray[i]);
						if (oneRecipient) {
							// a valid address
							// add to x-nviewer-to string property
							if (i>0) deliveredToP+="\n\t";
							deliveredToP+=oneRecipient+";0";
						}
					}
				}

				var customProp=new customProperties(deliveredToP,statusP,dsnSummaryP,flagsP,mdnDisplayedSummaryP,mdnDeletedSummaryP);


				if (typeOfMsg==enumOfNotification.DSN && deliveryReports) {
					// read delivery Reports
					for (var i=0; i < deliveryReports.length ; i++) {
						srv.logSrv(strTypeNotification+" (MsgKey="+header.messageKey+") - "+deliveryReports[i].finalRecipient+" "+deliveryReports[i].actionValue);
						// test if it's a valid report
						if (dsnparser.isValidReport(deliveryReports[i].actionValue))
							customProp.addDsnReport(deliveryReports[i],header.messageId);
					}
				}

				if (typeOfMsg==enumOfNotification.MDN && mdnReport) {
					// read MDN report
					srv.logSrv(strTypeNotification+" (MsgKey="+header.messageKey+") - "+mdnReport.finalRecipient+" "+mdnReport.dispositionMode+" "+mdnReport.dispositionType+" "+mdnReport.originalMessageId);
					if (mdnparser.isValidDisposition(mdnReport.dispositionType))
						customProp.addMdnReport(mdnReport,header.messageId);
				}

				deliveredToP=customProp.getDeliveredToProperty();
				statusP=customProp.getStatusProperty();
				dsnSummaryP=customProp.getDsnSummaryProperty();
				flagsP=customProp.getFlagsProperty();
				mdnDisplayedSummaryP=customProp.getMdnDisplayedSummaryProperty();
				mdnDeletedSummaryP=customProp.getMdnDeletedSummaryProperty();

				srv.logSrv(strTypeNotification+" (MsgKey="+header.messageKey+") - new notifications_viewer properties - "+statusP+" "+dsnSummaryP+" "+flagsP+"\n\t"+deliveredToP);

				// save properties in the original message
				msgDBHdrOrigin.setStringProperty("x-nviewer-to",deliveredToP);
				msgDBHdrOrigin.setStringProperty("x-nviewer-status",statusP);
				msgDBHdrOrigin.setStringProperty("x-nviewer-dsn-summary",dsnSummaryP);
				msgDBHdrOrigin.setStringProperty("x-nviewer-flags",flagsP);
				msgDBHdrOrigin.setStringProperty("x-nviewer-mdn-displayed-summary",mdnDisplayedSummaryP);
				msgDBHdrOrigin.setStringProperty("x-nviewer-mdn-deleted-summary",mdnDeletedSummaryP);

				// If user want to create a thread on the original message, move Notification message
				var threadPref=srv.preferences.getBoolPref(srv.extensionKey+".thread_on_original_message");

				if (threadPref) {
					var targetFolder = RDF.GetResource(msgDBHdrOrigin.folder.URI).QueryInterface(Components.interfaces.nsIMsgFolder);
					// add References and In-Reply-To properties
					var arrayProperties=new Array();
					// tag this message
					arrayProperties.push(new propertyObj("X-NViewer-Tags",strTypeNotification));
					arrayProperties.push(new propertyObj("References","<"+msgDBHdrOrigin.messageId+">"));
					arrayProperties.push(new propertyObj("In-Reply-To","<"+msgDBHdrOrigin.messageId+">"));
					notifyListener.threadNotification(header,msgSrc,targetFolder,arrayProperties);
				}
			}
			else {
				srv.warningSrv(strTypeNotification+" (MsgKey="+header.messageKey+") - Original message has not been found");
			}

			SetBusyCursor(window, false);
		}
		else
			header.setStringProperty("x-nviewer-tags","CHECKED"); // tag this message
	},

	/**
		Thread notification
		@param {nsIMsgDBHdr} msgDBHdr notification
		@param {string} msgSrc message source
		@param {nsIMsgFolder} targetDBFolder target folder
		@param {Array} properties list of {@link propertyObj}
	*/
	threadNotification : function(msgDBHdr,msgSrc,targetDBFolder,properties) {

		// create tmp file (.eml) with new header fields
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

			// copy tmp file to folder
			notifyListener.copyFileMessage(file,flags,messageId,targetDBFolder,isRead,isFlagged,0);
		} else
			srv.warningSrv("notifyListener.threadNotification - tmp file "+file+" doesn't exist");
	},

	/**
		Copy tmp file to folder
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

		var fileSpec = Components.classes["@mozilla.org/filespec;1"].createInstance(Components.interfaces.nsIFileSpec);
		var copyService = Components.classes["@mozilla.org/messenger/messagecopyservice;1"].getService(Components.interfaces.nsIMsgCopyService);
		fileSpec.nativePath =file;

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
					srv.warningSrv("notifyListener.copyFileMessage - TB's busy, try later (->"+delay+"ms). tmp file: "+file+" count : "+count);
					setTimeout(notifyListener.copyFileMessage,delay,file,flags,messageId,targetDBFolder,isRead,isFlagged,count);
				} else {
					srv.errorSrv("notifyListener.copyFileMessage - Impossible to copy file "+file);
					// remove tmp file
					notifyListener.removeFile(file); //TODO perhaps keep this file ?
				}
			}
		} else
			srv.warningSrv("notifyListener.copyFileMessage - tmp file "+file+" doesn't exist");
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
				if (Components.isSuccessCode(status))
					setTimeout(notifyListener.cleanUp,800,this.file,this.key,this.messageId,this.folder,this.isRead,this.isFlagged);
			},
			SetMessageKey: function (key) {
				this.key=key; // doesn't work with IMAP protocol
			}
		}
		return copyServiceListener;
	},

	/**
		after a message has been copied this method cleans up things. Remove tmp file.
		@param {string} file file name
		@param {number} key message key
		@param {string} messageId message Id
		@param {nsIMsgFolder} folder
		@param {boolean} isRead
		@param {boolean} isFlagged
	*/
	cleanUp:  function(file,key,messageId,folder,isRead,isFlagged) {
			srv.logSrv("notifyListener.cleanUp");

			var hdr=null;

			if (key) {
				// get message header by key (no key returned for IMAP)
				hdr=folder.GetMessageHeader(key);
			} else {
				// only IMAP here
				var findMsg=new findMsgDb(folder);
				findMsg.includeSubFolders(false);
				findMsg.includeAllAccounts(false);
				var hdr=findMsg.searchByMsgId(messageId);
			}

			if (hdr) {
				// message found
				hdr.markRead (isRead);
				hdr.markFlagged(isFlagged);
			} else {
				srv.warningSrv("notifyListener.cleanUp (MsgId="+messageId+") - notification has not been found");
			}

			// now remove tmp file
			notifyListener.removeFile(file);
		},

	/**
		Remove file
		@param {string} fileName file name
		@return {boolean} return <b>false</b> if an error occured
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
		create tmp file (.eml) with new header fields.
		@param {nsIMsgDBHdr} msgDBHdr
		@param {string} msgSrc message source
		@param {Array} properties list of {@link propertyObj}
		@return {string} filePath or <b>null</b> if an error occured
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
					if ((/^X-Mozilla-/gi).test(hdrLineArray[i]))
						continue;

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
			var dirService =  Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
			var tempDir = dirService.get("TmpD", Components.interfaces.nsIFile);
			var folderDelimiter = (navigator.platform.toLowerCase().indexOf("win") != -1) ? "\\" : "/";
			var fileName=(msgDBHdr.messageId).replace(/\.|@|,|;|\/|\\|:/ig,"_");
			tempFileNativePath = tempDir.path + folderDelimiter +fileName+".eml";
		
			var tmpFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			tmpFile.initWithPath(tempFileNativePath);
			if (tmpFile.exists()) tmpFile.remove(true);
			tmpFile.create(tmpFile.NORMAL_FILE_TYPE, 0666);
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
	Adds a listener which will be called only when a message is added to the folder
*/
function notifyInit() {
	srv.logSrv("notifyInit()");
	var notificationService = Components.classes["@mozilla.org/messenger/msgnotificationservice;1"]
		.getService(Components.interfaces.nsIMsgFolderNotificationService);
	notificationService.addListener(notifyListener);
}

