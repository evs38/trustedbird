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
	cacheDsnSummary : "",
	cacheFlags : "",
	cacheMdnDisplayedSummary : "",
	cacheMdnDeletedSummary : "",
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
		this.cacheDsnSummary="";
		this.cacheFlags="";
		this.cacheMdnDisplayedSummary="";
		this.cacheMdnDeletedSummary="";

		var msgViewIndex=gDBView.currentlyDisplayedMessage;
		var msgKey=gDBView.getKeyAt (msgViewIndex );
		var msgDBHdr=gDBView.msgFolder.GetMessageHeader ( msgKey );

		this.cacheDeliveredTo=msgDBHdr.getStringProperty("x-nviewer-to");

		if (this.cacheDeliveredTo=="")
			return; // custom properties not present

		this.cacheStatus=msgDBHdr.getStringProperty("x-nviewer-status");
		this.cacheDsnSummary=msgDBHdr.getStringProperty("x-nviewer-dsn-summary");
		this.cacheFlags=msgDBHdr.getStringProperty("x-nviewer-flags");
		this.cacheMdnDisplayedSummary=msgDBHdr.getStringProperty("x-nviewer-mdn-displayed-summary");
		this.cacheMdnDeletedSummary=msgDBHdr.getStringProperty("x-nviewer-mdn-deleted-summary");
		this.cacheCustomProperties=new customProperties(this.cacheDeliveredTo ,this.cacheStatus, this.cacheDsnSummary, this.cacheFlags,this.cacheMdnDisplayedSummary,this.cacheMdnDeletedSummary);
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
		var notificationsDisplayTextAndIcons=services.preferences.getIntPref(services.extensionKey+".display_text_and_icons");

		// Summary
		if (this.cacheDsnSummary || this.cacheMdnDisplayedSummary || this.cacheMdnDeletedSummary) {
			msgHdrViewOverlay.DSNBox.collapsed = false;
			document.getElementById("dsn-summary").value=this.cacheDsnSummary;
			document.getElementById("mdn-displayed-summary").value=this.cacheMdnDisplayedSummary;
			document.getElementById("mdn-deleted-summary").value=this.cacheMdnDeletedSummary;
		} else {
			msgHdrViewOverlay.DSNBox.collapsed = true;
			document.getElementById("dsn-summary").value="";
			document.getElementById("mdn-displayed-summary").value="";
			document.getElementById("mdn-deleted-summary").value="";
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
				var flags=dlveryArray[i].flags;

				// create labels
				var labelAddress = document.createElement("label");
				labelAddress.setAttribute("value",finalRecipient);
				aRow.appendChild(labelAddress);

				// create DSN hbox
				var DsnHbox=document.createElement("hbox");
				aRow.appendChild(DsnHbox);

				// create MDN hbox
				var MdnHbox=document.createElement("hbox");
				aRow.appendChild(MdnHbox);

				if (enabledTimeout) {
					// if user want to consider timeout
					var class_timeout="dsn_timeout";
					if (flags & dlveryArray[i].FLAG_TIMEOUT) { //timeout 
						try {       var i18n_timeout=strbundle.GetStringFromName("dsn_timeout"); }
						catch (e) { var i18n_timeout="time out" }
						if (notificationsDisplayTextAndIcons & 0x2) { // if user want icon
							// create image
							var imageTimeOut = document.createElement("image");
							imageTimeOut.setAttribute("class",class_timeout+"_img");
							imageTimeOut.setAttribute("tooltiptext",i18n_timeout);
							DsnHbox.appendChild(imageTimeOut);
						}
		
						if (notificationsDisplayTextAndIcons & 0x1) { // if user want text
							var labelTimeOut = document.createElement("label");
							labelTimeOut.setAttribute("value",i18n_timeout);
							labelTimeOut.setAttribute("class",class_timeout);
							DsnHbox.appendChild(labelTimeOut);
						}
					}
				}

				// DSN
				for (j=0 ; j < dlveryArray[i].dsnList.length ; j++) {
					var actionValue=dlveryArray[i].dsnList[j].actionValue;
					var messageId=dlveryArray[i].dsnList[j].messageId;

					// Internationalization
					try {       var i18n_actionValue=(strbundle).GetStringFromName("dsn_"+actionValue); }
					catch (e) { var i18n_actionValue=actionValue; }

					// command to display DSN message
					var onClickCommand="msgHdrViewOverlay.openMessage('"+messageId+"');";

					var classRecipient="dsn_"+actionValue;

					if (notificationsDisplayTextAndIcons & 0x2) { // if user want icon
						// create image
						var imageStatus = document.createElement("image");
						imageStatus.setAttribute("class",classRecipient+"_img");
						imageStatus.setAttribute("tooltiptext",i18n_actionValue);
						if (messageId.length>0)
							imageStatus.setAttribute("onclick",onClickCommand);
						DsnHbox.appendChild(imageStatus);
					}
	
					if (notificationsDisplayTextAndIcons & 0x1) { // if user want text
						var labelStatus = document.createElement("label");
						labelStatus.setAttribute("value",i18n_actionValue);
						if (messageId.length>0)
							labelStatus.setAttribute("onclick",onClickCommand);
						labelStatus.setAttribute("class",classRecipient);
						DsnHbox.appendChild(labelStatus);
					}
				}
				// MDN
				for (j=0 ; j < dlveryArray[i].mdnList.length ; j++) {
					var dispositionType=dlveryArray[i].mdnList[j].dispositionType;
					var messageId=dlveryArray[i].mdnList[j].messageId;

					// Internationalization
					try {       var i18n_dispositionType=(strbundle).GetStringFromName("mdn_"+dispositionType); }
					catch (e) { var i18n_dispositionType=dispositionType; }

					// command to display MDN message
					var onClickCommand="msgHdrViewOverlay.openMessage('"+messageId+"');";

					var classRecipient="mdn_"+dispositionType;

					if (notificationsDisplayTextAndIcons & 0x2) { // if user want icon
						// create image
						var imageStatus = document.createElement("image");
						imageStatus.setAttribute("class",classRecipient+"_img");
						imageStatus.setAttribute("tooltiptext",i18n_dispositionType);
						if (messageId.length>0)
							imageStatus.setAttribute("onclick",onClickCommand);
						MdnHbox.appendChild(imageStatus);
					}
	
					if (notificationsDisplayTextAndIcons & 0x1) { // if user want text
						var labelStatus = document.createElement("label");
						labelStatus.setAttribute("value",i18n_dispositionType);
						if (messageId.length>0)
							labelStatus.setAttribute("onclick",onClickCommand);
						labelStatus.setAttribute("class",classRecipient);
						MdnHbox.appendChild(labelStatus);
					}
				}
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




