/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * ***** BEGIN LICENSE BLOCK *****
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
 *   BT Global Services / Etat français Ministère de la Défense
 * Portions created by the Initial Developer are Copyright (C) 1998-2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Eric Ballet Baz BT Global Services / Etat français Ministère de la Défense
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

const XSMTP_HEADER_X_P772_VERSION                       = "X-P772-Version";
const XSMTP_HEADER_X_P772_PRIORITY_LEVEL_QUALIFIER      = "X-P772-Priority-Level-Qualifier";
const XSMTP_HEADER_X_P772_EXTENDED_GRADE_OF_DELIVERY    = "X-P772-Extended-Grade-Of-Delivery";
const XSMTP_HEADER_X_P772_PRIMARY_PRECEDENCE            = "X-P772-Primary-Precedence";
const XSMTP_HEADER_X_P772_COPY_PRECEDENCE               = "X-P772-Copy-Precedence";
const XSMTP_HEADER_X_P772_MESSAGE_TYPE                  = "X-P772-Message-Type";
const XSMTP_HEADER_X_P772_EXEMPTED_ADDRESS              = "X-P772-Exempted-Address";
const XSMTP_HEADER_X_P772_EXTENDED_AUTHORISATION_INFO   = "X-P772-Extended-Authorisation-Info";
const XSMTP_HEADER_X_P772_DISTRIBUTION_CODES            = "X-P772-Distribution-Codes";
const XSMTP_HEADER_X_P772_MCA                           = "X-P772-MCA";
const XSMTP_HEADER_X_P772_HANDLING_INSTRUCTIONS         = "X-P772-Handling-Instructions";
const XSMTP_HEADER_X_P772_MESSAGE_INSTRUCTIONS          = "X-P772-Message-Instructions";
const XSMTP_HEADER_X_P772_CODRESS_MESSAGE               = "X-P772-Codress-Message";
const XSMTP_HEADER_X_P772_ORIGINATOR_REFERENCE          = "X-P772-Originator-Reference";
const XSMTP_HEADER_X_P772_REFERENCE_INDICATION          = "X-P772-ReferenceIndication";
const XSMTP_HEADER_X_P772_OTHER_RECIPIENT_INDICATOR     = "X-P772-Other-Recipient-Indicator";
const XSMTP_HEADER_X_P772_ADDRESS_LIST_INDICATOR        = "X-P772-Address-List-Indicator";
const XSMTP_HEADER_X_P772_ACP_MESSAGE_IDENTIFIER        = "X-P772-Acp-Message-Identifier";
const XSMTP_HEADER_X_P772_ORIGINATOR_PLAD               = "X-P772-Originator-PLAD";
const XSMTP_HEADER_X_P772_ACP_NOTIFICATION_REQUEST      = "X-P772-Acp-Notification-Request";
const XSMTP_HEADER_X_P772_ACP_NOTIFICATION_RESPONSE     = "X-P772-Acp-Notification-Response";
const XSMTP_HEADER_X_P772_SECURITY_CLASSIFICATION       = "X-P772-Security-Classification";
const XSMTP_HEADER_X_P772_SPECIAL_HANDLING_INSTRUCTIONS = "X-P772-Special-Handling-Instructions";

const ALL_XSMTP_HEADERS = [
	XSMTP_HEADER_X_P772_VERSION,
	XSMTP_HEADER_X_P772_PRIORITY_LEVEL_QUALIFIER,
	XSMTP_HEADER_X_P772_EXTENDED_GRADE_OF_DELIVERY,
	XSMTP_HEADER_X_P772_PRIMARY_PRECEDENCE,
	XSMTP_HEADER_X_P772_COPY_PRECEDENCE,
	XSMTP_HEADER_X_P772_MESSAGE_TYPE,
	XSMTP_HEADER_X_P772_EXEMPTED_ADDRESS,
	XSMTP_HEADER_X_P772_EXTENDED_AUTHORISATION_INFO,
	XSMTP_HEADER_X_P772_DISTRIBUTION_CODES,
	XSMTP_HEADER_X_P772_MCA,
	XSMTP_HEADER_X_P772_HANDLING_INSTRUCTIONS,
	XSMTP_HEADER_X_P772_MESSAGE_INSTRUCTIONS,
	XSMTP_HEADER_X_P772_CODRESS_MESSAGE,
	XSMTP_HEADER_X_P772_ORIGINATOR_REFERENCE,
	XSMTP_HEADER_X_P772_REFERENCE_INDICATION,
	XSMTP_HEADER_X_P772_OTHER_RECIPIENT_INDICATOR,
	XSMTP_HEADER_X_P772_ADDRESS_LIST_INDICATOR,
	XSMTP_HEADER_X_P772_ACP_MESSAGE_IDENTIFIER,
	XSMTP_HEADER_X_P772_ORIGINATOR_PLAD,
	XSMTP_HEADER_X_P772_ACP_NOTIFICATION_REQUEST,
	XSMTP_HEADER_X_P772_ACP_NOTIFICATION_RESPONSE,
	XSMTP_HEADER_X_P772_SECURITY_CLASSIFICATION,
	XSMTP_HEADER_X_P772_SPECIAL_HANDLING_INSTRUCTIONS
];

const XSMTP_PRIORITY_FLASH = "flash (4)";

// Remove whitespace from both ends of a string
function TrimString(string) {
  if (!string) return "";
  return string.replace(/(^\s+)|(\s+$)/g, '')
}

function xsmtp_getBoolPref(preference, defaultValue) {
	var preferences = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	try {
		return preferences.getBoolPref(preference);
	} catch (e) {
		// Preference doesn't exists
	}
	return defaultValue;
}
