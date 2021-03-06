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
	This file implements a listener which will be called only when a message is loaded (to be displayed)
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/


/**
	expand/collapse dsn header view
*/
function ToggleDSNHeaderView() {
	var toggleDSNHeaderViewClosed=document.getElementById("toggleDSNHeaderViewClosed");
	var toggleDSNHeaderViewOpened=document.getElementById("toggleDSNHeaderViewOpened");
	var detailNotifications=document.getElementById("detailNotifications");
	detailNotifications.collapsed=toggleDSNHeaderViewClosed.collapsed;
	toggleDSNHeaderViewOpened.collapsed=toggleDSNHeaderViewClosed.collapsed;
	toggleDSNHeaderViewClosed.collapsed=!toggleDSNHeaderViewClosed.collapsed;
}


/**
	Overlay headers
*/
var msgHdrViewOverlay = {

	DSNBox: null, // the BoxObject in message headers where all rendering is done
	isNotifications : false,
	displayHeadersView: null,
	services: null,

	/**
		registers msgHdrViewOverlay components
	*/
	msgHdrViewInit: function() {

		gMessageListeners.push(msgHdrViewOverlay);
		msgHdrViewOverlay.DSNBox = document.getElementById("dsnBox");
	},

	onStartHeaders: function() {
		this.isNotifications=false;

		if (!this.services)
			this.services= new Services();

		// read user preferences
		this.displayHeadersView=this.services.preferences.getBoolPref(this.services.extensionKey+".display_headerview");

		if (! this.displayHeadersView)
			return;

		try {
			var msgDBHdr = gDBView.hdrForFirstSelectedMessage;

			if (msgDBHdr) {
				if (msgDBHdr.getStringProperty("x-nviewer-to") == "") return;

				this.isNotifications = notificationsWidgets.init(msgDBHdr, false);
			}
		} catch (e) {}
	},

	/**
		called whenever a message is displayed
	*/
	onEndHeaders: function() {
		if (this.isNotifications && this.displayHeadersView) {
			msgHdrViewOverlay.DSNBox.collapsed = false;
			// Summary
			notificationsWidgets.createNotificationsWidgetsSummaries(document.getElementById("SummaryNotifications"));
			// details
			notificationsWidgets.createNotificationsWidgetsDetails(document.getElementById("detailNotifications"));
		} else {
			msgHdrViewOverlay.DSNBox.collapsed = true;
			notificationsWidgets.removeChilds(document.getElementById("SummaryNotifications"));
			notificationsWidgets.removeChilds(document.getElementById("detailNotifications"));
		}
	}
}


// This method allows the registration of event listeners on the event target
addEventListener('messagepane-loaded', msgHdrViewOverlay.msgHdrViewInit, true);
