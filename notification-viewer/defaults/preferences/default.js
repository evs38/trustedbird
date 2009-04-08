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
	Default pref values for notifications viewer
*/

// the last configured notifications_viewer version
pref("extensions.notifications_viewer.version","");

// debug
pref("extensions.notifications_viewer.debug",false);

// include all accounts when searching original message-ID
pref("extensions.notifications_viewer.search_original_msgid.include_all_accounts",true);

// include trash folders when searching original message-ID
pref("extensions.notifications_viewer.search_original_msgid.include_trash_folders",false);

// create a thread on the original message
pref("extensions.notifications_viewer.thread_on_original_message",true);

// mark notification message as read
pref("extensions.notifications_viewer.mark_notifications_as_read",true);

// enabled or not message received timeout
pref("extensions.notifications_viewer.enabled_timeout",false);

// timeout for DSN (minutes)
pref("extensions.notifications_viewer.timeout",1);

// interval, in seconds, between two requests to ManageMsgAsDN
pref("extensions.notifications_viewer.check_msg_expired.interval",60);

/* display notifications with icons and/or text
	b.1 text (0x1)
	b1. icon (0x2)
*/
pref("extensions.notifications_viewer.display_text_and_icons",3);

// parse or not DSN
pref("extensions.notifications_viewer.parse_dsn",true);

// parse or not MDN
pref("extensions.notifications_viewer.parse_mdn",true);


// show/hide notifications on headerView
pref("extensions.notifications_viewer.display_headerview",true);

// Ask again
pref("extensions.notifications_viewer.ask_again.mail_incorporate_return_receipt",true);


