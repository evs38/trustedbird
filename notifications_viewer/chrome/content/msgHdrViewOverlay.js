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
	This file implements a listener which will be called only when a message is loaded (for be displayed)
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/


/**
	expand/collapse dsn header view
*/
function ToggleDSNHeaderView() {
	var toggleDSNHeaderViewClosed=document.getElementById("toggleDSNHeaderViewClosed");
	var toggleDSNHeaderViewOpened=document.getElementById("toggleDSNHeaderViewOpened");
	var detailDSN=document.getElementById("detailDSN");
	detailDSN.collapsed=toggleDSNHeaderViewClosed.collapsed;
	toggleDSNHeaderViewOpened.collapsed=toggleDSNHeaderViewClosed.collapsed;
	toggleDSNHeaderViewClosed.collapsed=!toggleDSNHeaderViewClosed.collapsed;
}


/**
	Overlay headers
*/
var msgHdrViewOverlay = {

	DSNBox: null, // the BoxObject in message headers where all rendering is done

	cacheCustomProperties : null,
	cacheDeliveredTo : "",
	cacheStatus : "",
	cacheSummary : "",
	cacheFlags : "",
	strBundleService: null,
	strbundle : null,
	services : null,

	/**
		registers msgHdrViewOverlay components
	*/
	msgHdrViewInit: function() {

		gMessageListeners.push(msgHdrViewOverlay);
		msgHdrViewOverlay.DSNBox = document.getElementById("dsnBox");

		services=new Services();

		// Internationalization
		strBundleService = Components.classes["@mozilla.org/intl/stringbundle;1"].getService().QueryInterface(Components.interfaces.nsIStringBundleService);
		if (strBundleService)
			strbundle=strBundleService.createBundle("chrome://notifications_viewer/locale/default.properties");
	},

	onStartHeaders: function() {
		if (gDBView.msgFolder == null) // true, if this is an opened .eml file
			return;

		// init values
		this.cacheCustomProperties=null;
		this.cacheDeliveredTo="";
		this.cacheStatus="";
		this.cacheSummary="";
		this.cacheFlags="";

		var msgViewIndex=gDBView.currentlyDisplayedMessage;
		var msgKey=gDBView.getKeyAt (msgViewIndex );
		var msgDBHdr=gDBView.msgFolder.GetMessageHeader ( msgKey );

		this.cacheDeliveredTo=msgDBHdr.getStringProperty("x-nviewer-dsn-to");

		if (this.cacheDeliveredTo=="")
			return; // custom properties not present

		this.cacheStatus=msgDBHdr.getStringProperty("x-nviewer-dsn-status");
		this.cacheSummary=msgDBHdr.getStringProperty("x-nviewer-dsn-summary");
		this.cacheFlags=msgDBHdr.getStringProperty("x-nviewer-dsn-flags");

		this.cacheCustomProperties=new customProperties(this.cacheDeliveredTo ,this.cacheStatus, this.cacheSummary, this.cacheFlags );
	},

	/**
		called whenever a message is displayed
	*/
	onEndHeaders: function() {
		if (gDBView.msgFolder == null)
			return;
		this.buildView();
		},

	
	buildView:   function() {
		var enabledTimeout=services.preferences.getBoolPref(services.extensionKey+".enabled_timeout");

		// Summary
		if (! this.cacheSummary) {
			msgHdrViewOverlay.DSNBox.collapsed = true;
			document.getElementById("dsn-summary").value="";
		}
		else {
			msgHdrViewOverlay.DSNBox.collapsed = false;
			document.getElementById("dsn-summary").value=this.cacheSummary;
		}
	
		// Recipients (To)

		var aGrid = document.getElementById("detailDSN");
		var aRows = document.getElementById("rowsDSN");
		if (aRows != null) {
			// remove old Rows
			while (aRows.firstChild)
				aRows.removeChild(aRows.firstChild);
			aGrid.removeChild(aRows);
		}
	
		if (this.cacheDeliveredTo.length>0 && this.cacheCustomProperties) {
			// create rows
			aRows = document.createElement("rows");
			aRows.setAttribute("id","rowsDSN");
			aGrid.appendChild(aRows);
			var dlveryArray=this.cacheCustomProperties.deliveredToArray;

			for (var i =0 ; i < dlveryArray.length ; i++ ) {
				// create row
				var aRow = document.createElement("row");
				aRows.appendChild(aRow);

				var finalRecipient=dlveryArray[i].finalRecipient;
				var actionValue=dlveryArray[i].actionValue;
				var messageId=dlveryArray[i].messageId;
				var flags=dlveryArray[i].flags;

				// Internationalization
				try {       var i18n_actionValue=(strbundle).GetStringFromName("dsn_"+actionValue); }
				catch (e) { var i18n_actionValue=actionValue; }
				try {       var i18n_timeout=strbundle.GetStringFromName("dsn_timeout"); }
				catch (e) { var i18n_timeout="" }


				// command to display DSN message
				var onClickCommand="msgHdrViewOverlay.openMessage('"+messageId+"');";

				var classRecipient="dsn_"+actionValue;
				if (enabledTimeout) {
					// if user want to consider timeout
					if (flags & dlveryArray[i].FLAG_TIMEOUT) { //timeout 
						classRecipient="dsn_timeout";
						i18n_actionValue+=" ("+i18n_timeout+")";
					}
				}

				// create labels
				var labelAddress = document.createElement("label");
				labelAddress.setAttribute("value",finalRecipient);
				if (messageId.length>0)
					labelAddress.setAttribute("onclick",onClickCommand);
				labelAddress.setAttribute("class",classRecipient);
				aRow.appendChild(labelAddress);

				var labelStatus = document.createElement("label");
				labelStatus.setAttribute("value",i18n_actionValue);
				if (messageId.length>0)
					labelStatus.setAttribute("onclick",onClickCommand);
				labelStatus.setAttribute("class",classRecipient);

				aRow.appendChild(labelStatus);
			}

			// change color for Summary
			var classT= this.cacheStatus;
			if (enabledTimeout) {
				// if user want to consider timeout
				if (parseInt(this.cacheFlags) & this.cacheCustomProperties.FLAG_TIMEOUT) //timeout
					classT="timeout";
			}
			document.getElementById("dsn-summary").setAttribute("class",classT);
		}
	},

	/**
		Open a window to display a message
		@param {string} messageId message to display
	*/
	openMessage: function (messageId) {
		SetBusyCursor(window, true);
		// read user preferences
		var includeAllAccounts=services.preferences.getBoolPref(services.extensionKey+".search_original_msgid.include_all_accounts");
		var includeTrashFolders=services.preferences.getBoolPref(services.extensionKey+".search_original_msgid.include_trash_folders");
	
		var findMsg = new findMsgDb(GetFirstSelectedMsgFolder().rootFolder);
		findMsg.includeSubFolders(true);
		findMsg.includeAllAccounts(includeAllAccounts);
		findMsg.includeTrashFolders(includeTrashFolders);
		var msgDBHdrFound=findMsg.searchByMsgId(messageId);
	
		if (msgDBHdrFound) {
			// message found
			var folderUri = msgDBHdrFound.folder.URI;
			var messageUri = msgDBHdrFound.folder.getUriForMsg(msgDBHdrFound);
			window.openDialog("chrome://messenger/content/messageWindow.xul", "_blank","all,chrome,dialog=no,status,toolbar", messageUri, folderUri, null);
			SetBusyCursor(window, false);
		}
		else {
			try {       var i18n_error=strbundle.GetStringFromName("message_not_found"); }
			catch (e) { var i18n_error="" }
			SetBusyCursor(window, false);
			alert(i18n_error);
		}
	}
}



// This method allows the registration of event listeners on the event target
addEventListener('messagepane-loaded', msgHdrViewOverlay.msgHdrViewInit, true);


