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
	implement propertyObj and writePropertiesToHdr
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
	@param {nsIMsgDBHdr} msgDBHdr
	@param {nsIMsgFolder} targetDBFolder target folder
	@param {string} file pathname and filename
	@author Daniel Rocher / Etat francais Ministere de la Defense
	@constructor
*/
function tmpFilesObj(msgDBHdr,targetDBFolder,file) {
	/** @type nsIMsgDBHdr */
	this.msgDBHdr = msgDBHdr;
	/** @type nsIMsgFolder */
	this.targetDBFolder=targetDBFolder;
	/** @type string */
	this.file = file;
	/** @type number */
	this.count = 0;
}


/**
	@class change properties in the source headers (changing the source file).
	<i>thanks go to the author of header tools and tagthebird</i>
	<p>
	example:
	<pre>
		var array=new Array();
		array.push(new propertyObj("X-Permit","yes"));
		array.push(new propertyObj("X-Allow",null)); //<i>null => remove this property</i>
		array.push(new propertyObj("X-Index","50"));
		writePropertiesToHdr.createMsgSrc(msgDBHdr,msgDBHdr.folder,array);
	</pre>
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/
var writePropertiesToHdr = {
	/**
		regular expressions cache
	*/
	regExpCache : {
		removeEOL: new RegExp('\\n','g'),
		removeCR: new RegExp('\\r','g'),
		trim: new RegExp("(?:^\\s*)|(?:\\s*$)","g")
	},
	/** @type boolean */
	lock : false,
	/** List of {@link tmpFilesObj} @type Array */
	filesArray:new Array(),

	/**
		Copy Files to messages
	*/
	CopyFilesMsg : function() {
		if (writePropertiesToHdr.lock) {
			srv.logSrv("writePropertiesToHdr.CopyFilesMsg locked - try later");
		}
		writePropertiesToHdr.lock=true;
		var fArray=writePropertiesToHdr.filesArray;
		for (var i=0; i <fArray.length; i++) {
			var fileSpec = Components.classes["@mozilla.org/filespec;1"].createInstance(Components.interfaces.nsIFileSpec);
			var copyService = Components.classes["@mozilla.org/messenger/messagecopyservice;1"].getService(Components.interfaces.nsIMsgCopyService);

			var msgDBHdr=fArray[i].msgDBHdr;
			var targetFolder=fArray[i].targetDBFolder;
			var count=fArray[i].count++;
			var file=fArray[i].file;
			fileSpec.nativePath =file;

			// test if file exist
			if (fileSpec.exists()) {
				var serviceListener=writePropertiesToHdr.newCopyServiceListener();
				serviceListener.file = file;
				serviceListener.messageId = msgDBHdr.messageId;
				serviceListener.folder = targetFolder;
				serviceListener.isRead = msgDBHdr.isRead;
				serviceListener.flags=msgDBHdr.flags;
				serviceListener.isFlagged=msgDBHdr.isFlagged;

				// remove old msgDbHdr. It's important to do that first
				var list = Components.classes["@mozilla.org/supports-array;1"].createInstance(Components.interfaces.nsISupportsArray);
				list.AppendElement(msgDBHdr);
				msgDBHdr.folder.deleteMessages(list,msgWindow,true,true,null,false);

				srv.logSrv("writePropertiesToHdr.CopyFilesMsg - file: "+file+" - target folder /"+targetFolder.prettyName + "/ (" + targetFolder.rootFolder.prettyName+ ")");

				try {
					copyService.CopyFileMessage(fileSpec, targetFolder, null, false, null, serviceListener, msgWindow);
				}
				catch (e) { // copy failed
					if (count < 5) {
						srv.logSrv("writePropertiesToHdr.CopyFilesMsg - TB's busy, try later");
						break; // try later
					} else {
						// there's probably a loop, copy failed
						srv.errorSrv("writePropertiesToHdr.CopyFilesMsg - Impossible to copy file "+file);
						// remove tmp file
						writePropertiesToHdr.removeFile(file); //TODO perhaps keep the file ?
					}
				}

			} else {
				srv.warningSrv("writePropertiesToHdr.CopyFilesMsg - tmp file "+file+" doesn't exist");
			}

			// remove record
			fArray.splice(i,1);
			i--;
		}

		writePropertiesToHdr.lock=false;
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
			flags:null,
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
				if (status==0)
					setTimeout(writePropertiesToHdr.cleanUp,600,this.file,this.key,this.messageId,this.folder,this.isRead,this.flags,this.isFlagged);
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
		@param {number} key
		@param {string} messageId
		@param {nsIMsgFolder} folder
		@param {boolean} isRead
		@param {number} flags
		@param {boolean} isFlagged
	*/
	cleanUp:  function(file,key,messageId,folder,isRead,flags,isFlagged) {
			srv.logSrv("writePropertiesToHdr.cleanUp");

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
				hdr.flags=flags;
				hdr.markFlagged(isFlagged);
			} else {
				srv.warningSrv("writePropertiesToHdr.cleanUp (MsgId="+messageId+") - notification has not been found");
			}

			// now remove tmp file
			writePropertiesToHdr.removeFile(file);
		},

	/**
		Remove file
		@param {string} fileName file name
		@return {boolean} return <b>false</b> if an error occured
	*/
	removeFile : function (fileName) {
		srv.logSrv("writePropertiesToHdr.removeFile - "+fileName);
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(fileName);
		if (file.exists()) {
			try { file.remove(true); }
			catch (e) {
				srv.errorSrv("writePropertiesToHdr.removeFile - error : \n"+e);
				return false;
			}
		}
		return true;
	},
	
	/**
		create message source. First, get message source.
		@param {nsIMsgDBHdr} msgDBHdr message to change
		@param {nsIMsgFolder} targetDBFolder target folder
		@param {Array} properties list of {@link propertyObj}<p>if property value = <i>null</i>, remove it
	*/
	createMsgSrc : function (msgDBHdr,targetDBFolder,properties) {
		srv.logSrv("writePropertiesToHdr.createMsgSrc - "+msgDBHdr.messageId);
		// get and split the current msgs source

		var MsgURI=msgDBHdr.folder.getUriForMsg (msgDBHdr);

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
					writePropertiesToHdr.makeNewMsgSrc(msgDBHdr,this.data,targetDBFolder,properties);
				} else {
					srv.errorSrv("writePropertiesToHdr.createMsgSrc - "+MsgURI+" - Error: "+status);
				}
			}
		}

		var stream = Components.classes["@mozilla.org/network/sync-stream-listener;1"].createInstance().QueryInterface(Components.interfaces.nsIInputStream);
		var messageService = messenger.messageServiceFromURI(MsgURI);
		try { messageService.streamMessage(MsgURI, streamListener, msgWindow, null, false, null); } catch (ex) { return false; }
		return true;
	},

	/**
		@param {nsIMsgDBHdr} msgDBHdr
		@param {string} msgSrc message source
		@param {nsIMsgFolder} targetDBFolder target folder
		@param {Array} properties list of {@link propertyObj}
		@return {boolean} return <b>false</b> if an error occured
	*/
	makeNewMsgSrc: function (msgDBHdr,msgSrc,targetDBFolder,properties) {

		var headersSrc="";
		var bodySrc=""

		// remove CR
		msgSrc=msgSrc.replace(writePropertiesToHdr.regExpCache.removeCR, "");

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
				srv.logSrv("writePropertiesToHdr.makeNewMsgSrc - change property - "+properties[j].propertyName+": "+properties[j].propertyValue);
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
			var tempFileNativePath = tempDir.path + folderDelimiter +fileName+".eml";
		
			var tmpFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			tmpFile.initWithPath(tempFileNativePath);
			if (tmpFile.exists()) tmpFile.remove(true);
			tmpFile.create(tmpFile.NORMAL_FILE_TYPE, 0666);
			var stream =  Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
			stream.init(tmpFile, 2, 0x200, false);
			stream.write(newSrc, newSrc.length);
			stream.close();

			writePropertiesToHdr.filesArray.push(new tmpFilesObj(msgDBHdr,targetDBFolder,tempFileNativePath));
		}
		catch (e) {
			srv.errorSrv("writePropertiesToHdr.makeNewMsgSrc - "+e);
			return false;
		}
		return true;
	}
}




