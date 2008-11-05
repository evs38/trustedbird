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
	this file implements ManageMsgAsDN class
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/ 



/**
	@class Manage a list of messages that are associated with one or more DSN.
	Check if messages were expired.
	@version 0.9.1
	@author Daniel Rocher / Etat francais Ministere de la Defense
	@constructor
*/
function ManageMsgAsDN() {
	/**
		file name
		@type string
	*/
	this.fileName="notifications_viewer_listofmsg.cache";
	/** @type number */
	this.MODE_RDWR= 0x20 | 0x04;
	/** @type number */
	this.MODE_RDONLY= 0x01;
	/**
		messageId List
		@type Array
	*/
	this.msgList= null;
	// get path for this extension
	var id="notificationsviewer@milimail.org";
	var file = Components.classes["@mozilla.org/extensions/manager;1"]
		.getService(Components.interfaces.nsIExtensionManager)
		.getInstallLocation(id)
		.getItemLocation(id);

	file.append(this.fileName);
	/**
		@type nsIFile
	*/
	this.file=file;

	/**
		File is valid
		@type boolean
	*/
	this.fileIsValid=true;

	if(!file.exists()) {
		try{
			file.create(0,0666);
			this.msgList=new Array();
		}
		catch(e) {
			this.fileIsValid=false;
			srv.errorSrv("Impossible to create file "+this.fileName);
		}
	}

	/**
		Output stream
		@type nsIFileOutputStream
	*/
	this.osstream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);

	/**
		Input stream
		@type nsIFileInputStream
	*/
	this.isstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);

	this.loadFile();
}

ManageMsgAsDN.prototype = {

	/**
		Save file to disk
	*/
	saveFile : function(){
		if(this.fileIsValid){
			this.osstream.init(this.file,this.MODE_RDWR, 0666, 0 );
			for(m in this.msgList){	
				var msg=this.msgList[m];
				if(msg.length>0){
					this.osstream.write(msg,msg.length);
					this.osstream.write("\n",1);
				}
			}
			this.osstream.close();
		}
	},
	
	/**
		Load file from disk
	*/
	loadFile : function(){
		if(this.fileIsValid){
			this.isstream.init(this.file,this.MODE_RDONLY,0444,0);
			this.isstream.QueryInterface(Components.interfaces.nsILineInputStream);

			var line = {};
			this.msgList=new Array();
			var hasmore;
			do {
				hasmore = this.isstream.readLine(line);
				if (line.value.length>0)
					this.msgList.push(line.value);
			} while(hasmore);
			
			this.isstream.close();
		}
	},

	/**
		add messageId to the list if not exist
		@param {string} messageId messageId
	*/
	addElement: function(messageId) {
		if (messageId.length<=0)
			return;
		for (var i=0; i < this.msgList.length; i++) {
			if (this.msgList[i]==messageId)
				return; //exist, nothing to do
		}
		this.msgList.push(messageId);
		this.saveFile();
	},

	/**
		remove messageId from the list if exist
		@param {string} messageId messageId
	*/
	removeElement: function(messageId) {
		for (var i=0; i < this.msgList.length; i++) {
			if (this.msgList[i]==messageId) {
				this.msgList.splice(i,1); //remove
				this.saveFile();
				return;
			}
		}
	},

	/**
		Check if messages were expired (timeout). In this case, update x-nviewer properties.
		Read list of messages, search message and if necessary update datas.
	*/
	updateList: function() {
		srv.logSrv("ManageMsgAsDN.updateList()");

		var timeout=srv.preferences.getIntPref(srv.extensionKey+".timeout");
		var includeTrashFolders=srv.preferences.getBoolPref(srv.extensionKey+".search_original_msgid.include_trash_folders");

		var currentDate = new Date();
		var currentDateInSeconds=parseInt((currentDate.getTime())/1000);

		// not work directly from the list. First, clone it
		var cloneMsgList=this.msgList.slice();
		
		for (var i=0; i < cloneMsgList.length; i++) {
			// search message
			var findmessage=new findMsgDb(null);
			findmessage.includeSubFolders(true);
			findmessage.includeAllAccounts(true);
			findmessage.includeTrashFolders(includeTrashFolders);
			var messageHdr=findmessage.searchByMsgId(cloneMsgList[i]);
			if (messageHdr) {
				// message found

				// get properties from message
				var deliveredToP=messageHdr.getStringProperty("x-nviewer-to");
				var statusP=messageHdr.getStringProperty("x-nviewer-status");
				var dsnSummaryP=messageHdr.getStringProperty("x-nviewer-dsn-summary");
				var flagsP=messageHdr.getStringProperty("x-nviewer-flags");
				var mdnDisplayedSummaryP=messageHdr.getStringProperty("x-nviewer-mdn-displayed-summary");
				var mdnDeletedSummaryP=messageHdr.getStringProperty("x-nviewer-mdn-deleted-summary");

				srv.logSrv("ManageMsgAsDN - current notifications_viewer properties - "+statusP+" "+dsnSummaryP+" "+flagsP+"\n\t"+deliveredToP);

				if (deliveredToP=="" && dsnSummaryP=="") {
					 // No DSNViewer properties present
					srv.logSrv("ManageMsgAsDN - No notifications_viewer properties present, remove from the list");
					this.removeElement(cloneMsgList[i]);
					continue;
				}

				var customProp=new customProperties(deliveredToP,statusP,dsnSummaryP,flagsP,mdnDisplayedSummaryP,mdnDeletedSummaryP);

				if (customProp.allDsnReceived) {
					srv.logSrv("ManageMsgAsDN - all DSN were received, remove from the list");
					// remove from the list
					this.removeElement(cloneMsgList[i]);
					continue;
				}

				var dateInSeconds=messageHdr.dateInSeconds;
				var diffInHours=parseInt((currentDateInSeconds-dateInSeconds)/3600); // diff in hours
				srv.logSrv("ManageMsgAsDN - diff in hours: "+diffInHours);

				if (diffInHours>=timeout) {
					// expired
					customProp.setMsgAsExpired(); // set as expired
					deliveredToP=customProp.getDeliveredToProperty();
					statusP=customProp.getStatusProperty();
					dsnSummaryP=customProp.getDsnSummaryProperty();
					flagsP=customProp.getFlagsProperty();
					mdnDisplayedSummaryP=customProp.getMdnDisplayedSummaryProperty();
					mdnDeletedSummaryP=customProp.getMdnDeletedSummaryProperty();

					srv.logSrv("ManageMsgAsDN - new notifications_viewer properties - "+statusP+" "+dsnSummaryP+" "+flagsP+"\n\t"+deliveredToP);

					// save properties
					messageHdr.setStringProperty("x-nviewer-to",deliveredToP);
					messageHdr.setStringProperty("x-nviewer-status",statusP);
					messageHdr.setStringProperty("x-nviewer-dsn-summary",dsnSummaryP);
					messageHdr.setStringProperty("x-nviewer-flags",flagsP);
					messageHdr.setStringProperty("x-nviewer-mdn-displayed-summary",mdnDisplayedSummaryP);
					messageHdr.setStringProperty("x-nviewer-mdn-deleted-summary",mdnDeletedSummaryP);

					srv.logSrv("ManageMsgAsDN - this message expired, remove from the list");
					// remove from the list
					this.removeElement(cloneMsgList[i]);
				}
			}
			else {
				// message not found
				srv.warningSrv("ManageMsgAsDN - Message not found, it's probably removed");
				// remove it from the list
				this.removeElement(cloneMsgList[i]);
			}
		}
	}
}



