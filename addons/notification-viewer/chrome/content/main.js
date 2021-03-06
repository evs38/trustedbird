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
	@fileoverview Program entry
	<ul>
		<li>run services
		<li>read preferences
	</ul>
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/


var srv=new Services();

var notificationDbHandler;

window.addEventListener("load", main, false);


/**
	Check Preferences
*/
function notificationsViewerCheckPref() {
	srv.preferences.addWordIfNotExist("mailnews.customDBHeaders","x-nviewer-sync-date");
	srv.preferences.addWordIfNotExist("mailnews.customDBHeaders","x-nviewer-to");
	srv.preferences.addWordIfNotExist("mailnews.customDBHeaders","x-nviewer-dsn-summary");
	srv.preferences.addWordIfNotExist("mailnews.customDBHeaders","x-nviewer-mdn-displayed-summary");
	srv.preferences.addWordIfNotExist("mailnews.customDBHeaders","x-nviewer-mdn-deleted-summary");
	srv.preferences.addWordIfNotExist("mailnews.customDBHeaders","x-nviewer-status");
	srv.preferences.addWordIfNotExist("mailnews.customDBHeaders","x-nviewer-timedout");
	srv.preferences.addWordIfNotExist("mailnews.customDBHeaders","x-nviewer-seen");
	srv.preferences.setCharPref(srv.extensionKey + ".version", srv.extensionVersion);
	srv.logSrv("notificationsViewerCheckPref()");

	// Fix incompatibility with thunderbird configuration( "Move message to Sent Folder")
	var key="mail.incorporate.return_receipt";

	if (srv.preferences.intPrefExist(key)) {
		if (srv.preferences.getIntPref(key)!=0 &&
				 srv.preferences.getBoolPref(srv.extensionKey+".ask_again.mail_incorporate_return_receipt")) {

			var check = {value: false};
			var result=messageBox.question(srv.extensionName,srv.tr("fix_mail_incorporate_return_receipt"),srv.tr("do_not_ask_again"),check);

			// fix it
			if (result==0) srv.preferences.setIntPref(key,0);
			// ask me again ?
			srv.preferences.setBoolPref(srv.extensionKey+".ask_again.mail_incorporate_return_receipt",!check.value);
		}
	}
}


/**
	to do when plugin has been updated
	@param {string} oldVersionNumber
	@param {string} currentVersionNumber
*/
function pluginUpdated(oldVersionNumber,currentVersionNumber) {
	srv.logSrv("pluginUpdated() - old version: "+oldVersionNumber+" - current version: "+currentVersionNumber);
	var oldVersion=0;
	var currentVersion=0;
	var regexp=/([\d]+\.[\d]+)/gi;

	// find major and minor number only (ignore revisions)
	oldVersionNumber=(regexp).exec(oldVersionNumber);
	if (oldVersionNumber && oldVersionNumber.length>1)
		oldVersion=parseFloat(oldVersionNumber[1]);

	regexp.lastIndex=0;
	currentVersionNumber=(regexp).exec(currentVersionNumber);
	if (currentVersionNumber && currentVersionNumber.length>1)
		currentVersion=parseFloat(currentVersionNumber[1]);

	// first time
	if (oldVersion==0) {
		// hide 'MDN deleted' column
		document.getElementById("colMDNDeleted").hidden = true;
	}

	if (currentVersion!=oldVersion) {
		// version number changed, open window preferences
		window.openDialog("chrome://notifications_viewer/content/preferences.xul","notifications_viewerPrefsDialog","chrome,modal");
	}
}

/**
 	Program entry (first time)
*/
function main() {
	srv.logSrv("Current version: "+srv.extensionVersion);

	// check if plugin has been updated
	if (srv.preferences.getCharPref(srv.extensionKey+".version")!=srv.extensionVersion)
		pluginUpdated(srv.preferences.getCharPref(srv.extensionKey+".version"),srv.extensionVersion);

	// check pref
	notificationsViewerCheckPref();
	// Adds a listener which will be called only when a message is added to the folder
	notifyInit();

	/* Define new columns in message list */
	columnInit();

	/* Open notification database */
	notificationDbHandler = new notificationDb();

	/* Start a background task to check delays when all DSN have not been received */
	var checkDelayInterval = parseInt(srv.preferences.getIntPref(srv.extensionKey + ".check_msg_expired.interval")); // in seconds
	if (checkDelayInterval < 60) checkDelayInterval = 60;
	setInterval(checkDelay, checkDelayInterval * 1000);
}

function checkDelay() {
	var list = notificationDbHandler.getCheckDelayList();
	for (var i in list) {
		var notificationData = new customProperties(list[i]["notificationData"]);
		if (notificationData.getCheckDelay()) {
			saveNotificationData(notificationData, list[i]["messageId"]);
		}
	}
}
