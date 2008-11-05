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
	This file implements the class findMsgDb
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/ 


/**
	@class This Class extract a message from a message-id or a message-key.<br>
	Enter a message-id or a message-key and get a <b>nsIMsgDBHdr</b> object.
	<p>
	Example 1:
	<pre>
	var findmessage=new findMsgDb(null);
	findmessage.includeSubFolders(true);
	findmessage.includeAllAccounts(true);
	var message=findmessage.searchByMsgKey(2070);
	if (message) alert("found : "+message.messageId+" "+message.subject);
	</pre>
	<p>
	Example 2:
	<pre>
	var findmessage=new findMsgDb(GetFirstSelectedMsgFolder());
	findmessage.includeSubFolders(true);
	findmessage.includeAllAccounts(false);
	var message=findmessage.searchByMsgId("20080213131118.4DD991FF88&#64;mydomain.org");
	if (message) alert("found : "+message.messageId+" "+message.subject);
	</pre>
	@version 0.9.3
	@author Daniel Rocher / Etat francais Ministere de la Defense
	@constructor
	@param {nsIMsgFolder} startFolder start search in this folder
*/
function findMsgDb(startFolder) {
	/**
		start folder
		@type nsIMsgFolder
	*/
	this.startFolder=startFolder;

	/**
		this property holds message-Id
		<p>
		see:
		<ul>
			<li>{@link #searchByMsgId}
		</ul>
		@type string
	*/
	this.messageId="";

	/**
		this property holds message key
		<p>
		see:
		<ul>
			<li>{@link #searchByMsgKey}
		</ul>
		@type number
	*/
	this.messageKey=0;

	/**
		list of accounts
		<p>
		Access functions:
		<ul>
			<li>{@link #getAccountsURI}
		</ul>
		@type Array
	*/
	this.cacheAccountsURI=null;
	
	/**
		Search type
		<pre>
		b...00 search from message ID
		b...01 search from message Key
		</pre>
		@type number
	*/
	this.FLAG_TYPE_SEARCH = 0x3;

	/**
		include sub-folders
		<pre>
		b..1..
		</pre>
		@type number
	*/
	this.FLAG_SUB_FOLDERS = 0x4;

	/**
		include all accounts
		<pre>
		b.1...
		</pre>
		@type number
	*/
	this.FLAG_ALL_ACCOUNTS = 0x8;

	/**
		include trash folders
		<pre>
		b1....
		</pre>
		@type number
	*/
	this.FLAG_TRASH = 0x10;

	/**
		flags for this object.
		<b> default:</b> include sub-folders
		@type number
	*/
	this.flags = this.FLAG_SUB_FOLDERS;

	/** @type Services */
	this.services=new Services();
}


findMsgDb.prototype = {
	/**
		regular expressions cache
	*/
	regExpCache : {
		validURI: new RegExp("^(imap://|mailbox://)","i"),
		validMsgId: new RegExp("^(<|).+@.+(>|)$","i")
	},

	/**
		Search message by message-Id
		<p>
		Examples:
		<pre>
		searchByMsgId("20080213131118.4DD991FF88&#64;mydomain.org");
		// or
		searchByMsgId("&#60;20080213131118.4DD991FF88&#64;mydomain.org&#62;");
		</pre>
		@param {string} messageId message-Id
		@return {nsIMsgDBHdr} nsIMsgDBHdr object or <b>null</b> if doesn't found
		@see #searchByMsgKey
	*/
	searchByMsgId: function(messageId) {
		var MASK=this.FLAG_SUB_FOLDERS | this.FLAG_ALL_ACCOUNTS | this.FLAG_TRASH;
		this.flags=(this.flags & MASK);

		if (! this.regExpCache.validMsgId.test(messageId))
			return null;
		this.messageId=messageId.replace(/>|</ig,"");

		this.services.logSrv("findMsgDb - searchByMsgId: "+this.messageId+" - flags: "+this.flags);

		// now, search
		return this.getMsgDBHdr();
	},

	/**
		Search message by message key
		<p>
		Example:
		<Pre>
		searchByMsgKey(4410);
		</pre>
		@param {number} messageKey message key
		@return {nsIMsgDBHdr} nsIMsgDBHdr object or <b>null</b> if doesn't found
		@see #searchByMsgId
	*/
	searchByMsgKey: function(messageKey) {
		var MASK=this.FLAG_SUB_FOLDERS | this.FLAG_ALL_ACCOUNTS | this.FLAG_TRASH;
		this.flags=(this.flags & MASK) | 0x1;

		// test if is not a number
		if (typeof(messageKey)!="number")
			return null;
		this.messageKey=messageKey;

		this.services.logSrv("findMsgDb - searchByMsgKey: "+this.messageKey+" - flags: "+this.flags);
		// now, search
		return this.getMsgDBHdr();
	},

	/**
		include (or not) sub-folders
		@param {boolean} val include sub-folders
	*/
	includeSubFolders: function(val) {
		var MASK=this.FLAG_TYPE_SEARCH | this.FLAG_ALL_ACCOUNTS | this.FLAG_TRASH;
		if (val)
			this.flags=(this.flags & MASK) | this.FLAG_SUB_FOLDERS;
		else
			this.flags=(this.flags & MASK);
	},


	/**
		include (or not) all accounts
		@param {boolean} val include all accounts
	*/
	includeAllAccounts: function(val) {
		var MASK=this.FLAG_TYPE_SEARCH | this.FLAG_SUB_FOLDERS | this.FLAG_TRASH;
		if (val) {
			this.getAccountsURI();
			this.flags=(this.flags & MASK) | this.FLAG_ALL_ACCOUNTS;
		}
		else
			this.flags=(this.flags & MASK);
	},

	/**
		include (or not) trash folders
		@param {boolean} val include trash folders
	*/
	includeTrashFolders: function(val) {
		var MASK=this.FLAG_TYPE_SEARCH | this.FLAG_SUB_FOLDERS | this.FLAG_ALL_ACCOUNTS;
		if (val)
			this.flags=(this.flags & MASK) | this.FLAG_TRASH;
		else
			this.flags=(this.flags & MASK);
	},

	/**
		Searchs all mail accounts
		@return {Array} list of mail accounts
	*/
	getAccountsURI: function() {
		if (this.cacheAccountsURI!=null)
			return this.cacheAccountsURI;
		this.cacheAccountsURI = new Array();

		//read preferences to get accounts
		
		var accounts = this.services.preferences.getCharPref("mail.accountmanager.accounts");
		if (accounts!="") {
			var accountsKeyArray = accounts.split(",");
			var accountServer;
			var accountType;
			var accountHostname;
			var accountUsername;
			var accountURI;
			for (var i = 0; i < accountsKeyArray.length; i++) {
				accountServer = this.services.preferences.getCharPref("mail.account."+accountsKeyArray[i]+".server");
				accountType = this.services.preferences.getCharPref("mail.server." +accountServer+".type");
				accountHostname = this.services.preferences.getCharPref("mail.server."+accountServer+".hostname");
				accountUsername = this.services.preferences.getCharPref("mail.server."+accountServer+".userName");
	
				if (accountType == "imap")
					accountURI = "imap://";
				else if (accountType == "pop3")
					accountURI = "mailbox://";
				else continue;
				accountURI=accountURI+escape(accountUsername)+"@"+ escape(accountHostname);
				this.cacheAccountsURI.push(accountURI);
			}
		}
		this.services.logSrv("findMsgDb - getAccountsURI: "+this.cacheAccountsURI);
		return this.cacheAccountsURI;
	},



	/**
		Search a message in folder
		@param {nsIMsgFolder} folder search in this folder
		@return {nsIMsgDBHdr} nsIMsgDBHdr object or <b>null</b> if doesn't found
		@private
		@see #searchByMsgId
		@see #searchByMsgKey
	*/
	searchInFolder: function (folder) {
		// check type
		if (typeof(folder)!="object") return null;
		try {
			if (!folder instanceof nsIMsgFolder) return null; // FIXME fix when used in new window
		} catch(e) {}

		var msgHdr = null;
		var msgDB = null;
		var currentFolderURI = folder.URI;

		if (! this.regExpCache.validURI.test(currentFolderURI))
			return null;

		// trash folder
		if (!(this.flags & this.FLAG_TRASH) && (/\/Trash$/i).test(currentFolderURI))
			return null;

		this.services.logSrv("findMsgDb - Current folder: "+currentFolderURI);

		// include sub-folders
		if ((this.flags & this.FLAG_SUB_FOLDERS) && (folder.hasSubFolders)) {
			try {
				// TB 2.0.0.*
				var subfolders = folder.GetSubFolders();
			} catch (e) {
				// TB 3.0.* (XPCOM 1.9)
				var subfolders = folder.subFolders;
			}
			var subfolder = null;
			var subFolderURI = "";
		
			var done = false;
			
			while(!done) {
				try {
					// TB 2.0.0.*
					subFolderURI = subfolders.currentItem().QueryInterface(Components.interfaces.nsIRDFResource).Value;
				} catch (e) {
					// TB 3.0.* (XPCOM 1.9)
					subFolderURI = subfolders.getNext().QueryInterface(Components.interfaces.nsIRDFResource).Value;
				}
				subfolder = folder.getChildWithURI (subFolderURI,false,false);
	
				msgHdr = this.searchInFolder(subfolder);

				if (msgHdr) return msgHdr;
				
				try {
					// TB 3.0.* (XPCOM 1.9)
					if (! subfolders.hasMoreElements())
						done = true;
				} catch(e) {
					// TB 2.0.0.*
					try {
						subfolders.next();
					} catch(e) {
						done = true;
					}
				}
			}
		}

		try {
			msgDB = folder.getMsgDatabase(null);
		} catch (ex) {
			// update folder
			try {
				folder.startFolderLoading();
				folder.updateFolder(null);
				msgDB = folder.getMsgDatabase(null);
			}
			catch (ex) {
				return null;
			}
		}
	
		// search from message-id or message-key ?
		switch (this.flags & this.FLAG_TYPE_SEARCH) {
			case 0x0:
				try { msgHdr = msgDB.getMsgHdrForMessageID(this.messageId); } catch(e) {}
				break;
			case 0x1:
				try { msgHdr = msgDB.GetMsgHdrForKey(this.messageKey); } catch(e) {}
				if (msgHdr) {
					if (msgHdr.date==0 && msgHdr.messageSize==0) {
						// this key exist in Database but this message is probably removed (or moved)
						this.services.logSrv("findMsgDb - key exist in db but message probably removed - Key: "+this.messageKey);
						return null;
					}
				}
				break;
		}
	
		if (msgHdr) return msgHdr;
	
		return null;
	},

	/**
		search a message from key or msg-id and return a nsIMsgDBHdr object
		@return {nsIMsgDBHdr} nsIMsgDBHdr object or <b>null</b> if doesn't found
		@private
		@see #searchByMsgId
		@see #searchByMsgKey
	*/
	getMsgDBHdr: function () {
		var msgHdr = null;
		var folder = null;
		// All accounts
		if (this.flags & this.FLAG_ALL_ACCOUNTS) {
			this.getAccountsURI();
			for(var i = 0; i < this.cacheAccountsURI.length ; i++) {
				this.services.logSrv("findMsgDb - Current account: "+this.cacheAccountsURI[i]);
				folder = GetMsgFolderFromUri(this.cacheAccountsURI[i]).rootFolder;
				msgHdr = this.searchInFolder(folder);
				if (msgHdr) break; // found
			}
		}
		else
			msgHdr = this.searchInFolder(this.startFolder);
	return msgHdr;
	}
}



