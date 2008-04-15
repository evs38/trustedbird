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
	deliveryReport implementation
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/


/**
	@class A delivery report object
	@constructor
*/
function deliveryReport () {
	/**
		The Final-Recipient field indicates the recipient for which this set
		of per-recipient fields applies.  This field MUST be present in each
		set of per-recipient data.
		@type string
	*/
	this.finalRecipient = "";
	/**
		Indicates the original recipient address as specified by the sender
		of the message for which the DSN is being issued.
		@type string
	*/
	this.originalRecipient = "";
	/**
		Indicates the action performed by the Reporting-MTA
		as a result of its attempt to deliver the message to this recipient
		address.
		<b>action-value</b> = <i>"failed" / "delayed" / "delivered" / "relayed" / "expanded"</i>
		@type string
	*/
	this.actionValue = "";
	/**
		The per-recipient Status field contains a transport-independent
		status code that indicates the delivery status of the message to that
		recipient.
		@type string
	*/
	this.statusValue = "";
	/**
		For a "failed" or "delayed" recipient, the Diagnostic-Code DSN field
		contains the actual diagnostic code issued by the mail transport.
		@type string
	*/
	this.diagnosticCode = "";
}
