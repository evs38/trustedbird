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
 * The Original Code is mozilla.org Code.
 *
 * The Initial Developer of the Original Code is
 *   BT Global Services / Etat francais Ministere de la Defense
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Raphael Fairise / BT Global Services / Etat francais Ministere de la Defense
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var jsLoader =  Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
jsLoader.loadSubScript("chrome://notifications_viewer/content/libtrustedbird.js");


function notificationDb() {
	this.connection = null;
	
	try {
		var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
		file.append("notifications-viewer.sqlite");
		
		var storageService = Components.classes["@mozilla.org/storage/service;1"].getService(Components.interfaces.mozIStorageService);
		this.connection = storageService.openDatabase(file);
		
		if (!this.connection.connectionReady) this.connection = null;
	} catch (e) {
		trustedBird_dump("Error notificationDb open connection: " + e);
	}
	
	if (this.connection == null) {
		trustedBird_dump("Error notificationDb open connection");
		return;
	}
	
	try {
		this.connection.executeSimpleSQL("CREATE TABLE IF NOT EXISTS notifications (messageId TEXT PRIMARY KEY, notificationData TEXT, lastUpdate TIMESTAMP, checkDelay TEXT);");
	} catch (e) {
		trustedBird_dump("Error notificationDb CREATE TABLE: " + e + "\n" + this.connection.errorString);
	}
}

notificationDb.prototype.updateMessage = function(messageId, notificationData, checkDelay) {
	if (this.connection == null) return false;
	
	trustedBird_dump("notificationDb.updateMessage(" + messageId + ", " + notificationData + ", " + checkDelay + ")");
	
	var update = false;

	/* Check if message already exists in db */
	var statement;
	var error;
	try {
		statement = this.connection.createStatement("SELECT messageId FROM notifications WHERE messageId = ?1;");
		statement.bindUTF8StringParameter(0, messageId);
		
		if (statement.executeStep()) {
			/* Message already exists in db */
			update = true;
		}
	} catch (e) {
		trustedBird_dump("Error notificationDb.updateMessage SELECT: " + e + "\n" + this.connection.errorString);
		error = true;
	} finally {
		statement.reset();
	}
	
	if (error) return false;
	
	
	if (update) {
		/* Update message info */
		try {
			statement = this.connection.createStatement("UPDATE notifications SET notificationData = ?2, lastUpdate = ?3, checkDelay = ?4 WHERE messageId = ?1;");
			statement.bindUTF8StringParameter(0, messageId);
			statement.bindUTF8StringParameter(1, notificationData);
			statement.bindUTF8StringParameter(2, (new Date()).getTime());
			statement.bindUTF8StringParameter(3, checkDelay);
			statement.execute();
		} catch (e) {
			trustedBird_dump("Error notificationDb.updateMessage UPDATE: " + e);
			error = true;
		}
	} else {
		/* Add new message info */
		try {
			statement = this.connection.createStatement("INSERT INTO notifications (messageId, notificationData, lastUpdate, checkDelay) VALUES (?1, ?2, ?3, ?4);");
			statement.bindUTF8StringParameter(0, messageId);
			statement.bindUTF8StringParameter(1, notificationData);
			statement.bindUTF8StringParameter(2, (new Date()).getTime());
			statement.bindUTF8StringParameter(3, checkDelay);
			statement.execute();
		} catch (e) {
			trustedBird_dump("Error notificationDb.updateMessage INSERT: " + e);
			error = true;
		}
	}
	
	if (error) return false;
	return true;
}

notificationDb.prototype.getMessageField = function(messageId, fieldName) {
	if (this.connection == null) return false;
	if (messageId == null || messageId == "") return false;
	if (fieldName == null || fieldName == "") return false;
	
	var data = "";
	
	var statement;
	try {
		statement = this.connection.createStatement("SELECT " + fieldName + " FROM notifications WHERE messageId = ?1;");
		statement.bindUTF8StringParameter(0, messageId);
		
		if (statement.executeStep()) {
			data = statement.getUTF8String(0);
		}
	} catch (e) {
		trustedBird_dump("Error notificationDb.getMessageField SELECT: " + e + "\n" + this.connection.errorString);
	} finally {
		statement.reset();
	}
	
	//trustedBird_dump("notificationDb.getMessageField(" + messageId + ", " + fieldName + ") = " + data);
	
	return data;
}

notificationDb.prototype.getCheckDelayList = function() {
	if (this.connection == null) return false;
	
	var data = new Array();
	
	var statement;
	try {
		statement = this.connection.createStatement("SELECT messageId, notificationData FROM notifications WHERE checkDelay = 'yes';");
		
		while (statement.executeStep()) {
			var result = new Array();
			result["messageId"] = statement.getUTF8String(0);
			result["notificationData"] = statement.getUTF8String(1);
			data.push(result);
		}
	} catch (e) {
		trustedBird_dump("Error notificationDb.getCheckDelayList SELECT: " + e + "\n" + this.connection.errorString);
	} finally {
		statement.reset();
	}
	
	return data;
}
