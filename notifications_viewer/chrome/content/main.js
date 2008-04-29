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

// a list of messages that are associated with one or more DSN. update datas when messages were expired
var mMsgAsDsnReq=new ManageMsgAsDN();

/**
	Check Preferences
*/
function checkPref() {
	srv.preferences.addWordIfNotExist("mailnews.customDBHeaders","x-nviewer-summary");
	srv.preferences.addWordIfNotExist("mailnews.customDBHeaders","x-nviewer-status");
	srv.preferences.addWordIfNotExist("mailnews.customDBHeaders","x-nviewer-to");
	srv.preferences.addWordIfNotExist("mailnews.customDBHeaders","x-nviewer-flags");
	srv.preferences.addWordIfNotExist("mailnews.customDBHeaders","x-nviewer-tags");
	srv.preferences.setCharPref(srv.extensionKey+".version",srv.extensionVersion);
	srv.logSrv("checkPref()");
}


window.addEventListener("load", main, false);


/**
	Test if messages were expired
	@see ManageMsgAsDN#updateList
*/
function updateMsgList() {
	mMsgAsDsnReq.updateList();
}


/**
 	Program entry (first time)
*/
function main() {
	srv.logSrv("Current version: "+srv.extensionVersion);

	// first time, open window preferences
	if (srv.preferences.getCharPref(srv.extensionKey+".version")=="")
		window.openDialog("chrome://notifications_viewer/content/preferences.xul","notifications_viewerPrefsDialog","chrome,modal");

	// check pref
	checkPref();
	// Adds a listener which will be called only when a message is added to the folder
	notifyInit();
	// our column
	columnInit();

	interval=srv.preferences.getIntPref(srv.extensionKey+".check_msg_expired.interval"); // in seconds
	setTimeout("updateMsgList()",10000); // firs time (after 10s)
	window.setInterval(updateMsgList, interval*1000);
}
