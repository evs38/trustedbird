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
	Display notifications in a window
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/

/* Load utils in order to open a window in Thunderbird 3 */
if (typeof Components.utils.import == "function") Components.utils.import("resource://app/modules/MailUtils.js");

/**
	@class open a window and display notifications
	@version 0.9.0
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/
var displayNotifications = {
	/**
		open window
	*/
	openWindow : function() {
		try {
			var hdr=gDBView.hdrForFirstSelectedMessage;
			if (hdr)
				window.openDialog("chrome://notifications_viewer/content/windowDetailNotifications.xul","windowDetailNotifications","chrome,modal,resizable",hdr);
		} catch(e) {}
	},

	/**
		on load window
	*/
	onload : function() {
		var  header= window.arguments[0];
		if (header) {
			if (notificationsWidgets.init(header,true)) {
				// Summary
				notificationsWidgets.createNotificationsWidgetsSummaries(document.getElementById("SummaryNotifications"));
				// details
				notificationsWidgets.createNotificationsWidgetsDetails(document.getElementById("detailNotifications"));
			}
		}
	}
}



/**
	@class Create XUL elements for notifications
	@version 0.9.0
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/

var notificationsWidgets = {
	header : null,
	cacheCustomProperties : null,
	services : null,
	cacheDeliveredTo : "",
	cacheStatus : "",
	cacheDsnSummary : "",
	cacheMdnDisplayedSummary : "",
	cacheMdnDeletedSummary : "",
	enabledTimeout: null,
	notificationsDisplayTextAndIcons: null,
	viewBackgroundColor: false,

	/**
		Init
		@param {nsIMsgDBHdr} header
		@param {boolean} viewBackgroundColor
		@return {boolean} return <b>false</b> if is no notification
	*/
	init: function (header,viewBackgroundColor) {
		this.services=new Services();
		this.header=header;
		this.viewBackgroundColor=viewBackgroundColor;

		// get properties
		this.cacheDeliveredTo=header.getStringProperty("x-nviewer-to");

		if (this.cacheDeliveredTo=="")
			return false; // custom properties not present

		this.cacheStatus=header.getStringProperty("x-nviewer-status");
		this.cacheCustomProperties = new customProperties(this.cacheDeliveredTo);
		this.cacheDsnSummary = this.cacheCustomProperties.getDsnSummaryProperty();
		this.cacheMdnDisplayedSummary = this.cacheCustomProperties.getMdnDisplayedSummaryProperty();
		this.cacheMdnDeletedSummary = this.cacheCustomProperties.getMdnDeletedSummaryProperty();
			
		// read user preferences
		this.enabledTimeout=this.services.preferences.getBoolPref(this.services.extensionKey+".enabled_timeout");
		this.notificationsDisplayTextAndIcons=this.services.preferences.getIntPref(this.services.extensionKey+".display_text_and_icons");
		return true;
	},


	/**
		create label (XUL element)
		@param {string} lId
		@param {string} lValue
		@param {string} lClass
		@return {Object} XUL element
	*/
	createLabel: function (lId,lValue,lClass) {
		var label=document.createElement("label");
		if (lId.length>0) label.setAttribute("id",lId);
		label.setAttribute("value",lValue);
		if (lClass.length>0) label.setAttribute("class",lClass);
		return label;
	},

	/**
		remove all child of XUL Element
		@param {Object} parentWidget
	*/
	removeChilds: function (parentWidget) {
		while(parentWidget.hasChildNodes())
  			parentWidget.removeChild(parentWidget.firstChild);
	},

	/**
		create DSN and MDN summaries
		@param {Object} parentWidget parent of widgets
	*/
	createNotificationsWidgetsSummaries: function (parentWidget) {
		if (! this.header)
			return;

		// remove childs
		this.removeChilds(parentWidget);

		var headerView_labelTitle=this.services.tr("headerView_labelTitle");
		var headerView_labelDSN=this.services.tr("headerView_labelDSN");
		var headerView_labelMDNDisplayed=this.services.tr("headerView_labelMDNDisplayed");
		var headerView_labelMDNDeleted=this.services.tr("headerView_labelMDNDeleted");
		
		var headerView_labelDeliveryDelayExpired=this.services.tr("headerView_labelDeliveryDelayExpired");

		var dsnHbox=document.createElement("hbox");
		parentWidget.appendChild(dsnHbox);
		var mdnDisplayedHbox=document.createElement("hbox");
		parentWidget.appendChild(mdnDisplayedHbox);
		var mdnDeletedHbox=document.createElement("hbox");
		parentWidget.appendChild(mdnDeletedHbox);

		dsnHbox.appendChild(this.createLabel("titleHeader", "[" + headerView_labelTitle + "]   ", "nvHeaderName headerName"));
		
		// create labels
		if (this.cacheDsnSummary.length>0) {
			dsnHbox.appendChild(this.createLabel("dsnHeader", headerView_labelDSN, "nvHeaderName headerName"));
			
			var classT= this.cacheStatus;
			
			var message = this.cacheDsnSummary;
			if (this.enabledTimeout && this.cacheCustomProperties.getTimedOut() == "yes") {
				message += " (" + headerView_labelDeliveryDelayExpired + ")";
				classT = "timeout";
			}
			
			dsnHbox.appendChild(this.createLabel("dsn-summary", message, "nvHeaderValue headerValue"));
			document.getElementById("dsn-summary").setAttribute("class", classT + " nvHeaderValue headerValue");
		}
		if (this.cacheMdnDisplayedSummary.length>0) {
			mdnDisplayedHbox.appendChild(this.createLabel("mdnDisplayedHeader", "  " + headerView_labelMDNDisplayed, "nvHeaderName headerName"));
			mdnDisplayedHbox.appendChild(this.createLabel("mdn-displayed-summary",this.cacheMdnDisplayedSummary,"nvHeaderValue headerValue"));
		}
		if (this.cacheMdnDeletedSummary.length>0) {
			mdnDeletedHbox.appendChild(this.createLabel("mdnDeletedHeader", "  " + headerView_labelMDNDeleted, "nvHeaderName headerName"));
			mdnDeletedHbox.appendChild(this.createLabel("mdn-deleted-summary", this.cacheMdnDeletedSummary, "nvHeaderValue headerValue"));
		}
	},

	/**
		create rows and columns to display details of notifications
		@param {Object} parentWidget parent of widgets
	*/
	createNotificationsWidgetsDetails: function (parentWidget) {
		if (! this.header)
			return;

		// remove childs
		this.removeChilds(parentWidget);

		// create rows
		var aRows = document.createElement("rows");
		
		var dlveryArray=this.cacheCustomProperties.deliveredToArray;
	
		for (var i =0 ; i < dlveryArray.length ; i++ ) {
			// create row
			var aRow = document.createElement("row");
			aRows.appendChild(aRow);

			if (this.viewBackgroundColor) {
				// set background
				if (i%2)
					var background="white";
				else
					var background="#D0D0D0";
				aRow.setAttribute("style","background-color:"+background+";");
			}

			aRow.setAttribute("class","rowDetailNotifications");
	
			var finalRecipient=dlveryArray[i].finalRecipient;
	
			// create label of recipient
			aRow.appendChild(this.createLabel("",finalRecipient,""));

			// create DSN hbox
			var DsnHbox=document.createElement("hbox");
			aRow.appendChild(DsnHbox);
	
			// create MDN hbox
			var MdnHbox=document.createElement("hbox");
			aRow.appendChild(MdnHbox);
	
			// DSN
			for (var j=0 ; j < dlveryArray[i].dsnList.length ; j++) {
				var actionValue=dlveryArray[i].dsnList[j].actionValue;
				var messageId=dlveryArray[i].dsnList[j].messageId;
	
				var i18n_actionValue=this.services.tr("dsn_"+actionValue);
				if (i18n_actionValue=="") i18n_actionValue=actionValue;
	
				// command to display DSN message
				var onClickCommand="notificationsWidgets.openMessage('"+messageId+"');";
	
				var classRecipient="dsn_"+actionValue;
	
				if (this.notificationsDisplayTextAndIcons & 0x2) { // if user want icon
					// create image
					var imageStatus = document.createElement("image");
					imageStatus.setAttribute("class",classRecipient+"_img notifications_icones");
					imageStatus.setAttribute("tooltiptext",i18n_actionValue);
					if (messageId.length>0)
						imageStatus.setAttribute("onclick",onClickCommand);
					DsnHbox.appendChild(imageStatus);
				}
	
				if (this.notificationsDisplayTextAndIcons & 0x1) { // if user want text
					var labelStatus = this.createLabel("",i18n_actionValue,classRecipient+" notifications_txt");
					if (messageId.length>0)
						labelStatus.setAttribute("onclick",onClickCommand);
					DsnHbox.appendChild(labelStatus);
				}
			}
			// MDN
			for (var j=0 ; j < dlveryArray[i].mdnList.length ; j++) {
				var dispositionType=dlveryArray[i].mdnList[j].dispositionType;
				var messageId=dlveryArray[i].mdnList[j].messageId;
	
				var i18n_dispositionType=this.services.tr("mdn_"+dispositionType);
				if (i18n_dispositionType=="") i18n_dispositionType=dispositionType;
	
				// command to display MDN message
				var onClickCommand="notificationsWidgets.openMessage('"+messageId+"');";
	
				var classRecipient="mdn_"+dispositionType;
	
				if (this.notificationsDisplayTextAndIcons & 0x2) { // if user want icon
					// create image
					var imageStatus = document.createElement("image");
					imageStatus.setAttribute("class",classRecipient+"_img notifications_icones");
					imageStatus.setAttribute("tooltiptext",i18n_dispositionType);
					if (messageId.length>0)
						imageStatus.setAttribute("onclick",onClickCommand);
					MdnHbox.appendChild(imageStatus);
				}
	
				if (this.notificationsDisplayTextAndIcons & 0x1) { // if user want text
					var labelStatus = this.createLabel("",i18n_dispositionType,classRecipient+" notifications_txt");
					if (messageId.length>0)
						labelStatus.setAttribute("onclick",onClickCommand);
					MdnHbox.appendChild(labelStatus);
				}
			}
		}

		parentWidget.appendChild(aRows);
	},

	/**
		Open a window to display a message
		@param {string} messageId message to display
	*/
	openMessage: function (messageId) {
		if (! this.header)
			return;

		window.setCursor("wait");
	
		// read user preferences
		var includeAllAccounts=this.services.preferences.getBoolPref(this.services.extensionKey+".search_original_msgid.include_all_accounts");
		var includeTrashFolders=this.services.preferences.getBoolPref(this.services.extensionKey+".search_original_msgid.include_trash_folders");
	
		var findMsg = new findMsgDb(this.header.folder.rootFolder);
		findMsg.includeSubFolders(true);
		findMsg.includeAllAccounts(includeAllAccounts);
		findMsg.includeTrashFolders(includeTrashFolders);
		var msgDBHdrFound=findMsg.searchByMsgId(messageId);
	
		if (msgDBHdrFound) {
			// message found
			var folderUri = msgDBHdrFound.folder.URI;
			var messageUri = msgDBHdrFound.folder.getUriForMsg(msgDBHdrFound);
			if (typeof MailUtils == "object") {
				/* Thunderbird 3 */
				MailUtils.displayMessages([msgDBHdrFound], null, document.getElementById("tabmail"));
			} else {
				/* Thunderbird 2 */
				window.openDialog("chrome://messenger/content/messageWindow.xul", "_blank", "all,chrome,dialog=no,status,toolbar", messageUri, folderUri, null);
			}
		} else {
			messageBox.warning(this.services.tr("Error"),this.services.tr("message_not_found"));
		}
		
		window.setCursor("auto");
	}
}
