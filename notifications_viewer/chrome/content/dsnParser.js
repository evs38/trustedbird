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
	Library for parsing messages type DSN
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



/**
	@class This Class is a DSN Parser (see rfc3464).
	@version 0.9.2
	@author Daniel Rocher / Etat francais Ministere de la Defense
	@constructor
	@param {string} message message source
*/
function dsnParser(message) {
	mailParser.call(this, message);

	/**
		cache of delivery Reports
		<p>
		Access functions:
		<ul>
			<li>{@link #getDeliveryReports}
		</ul>
		@type Array
	*/
	this.cacheDeliveryReports = null;
	/**
		this property holds whether the message contains delivery status notifications
		<p>
		Access functions:
		<ul>
			<li>{@link #isDeliveryStatus}
		</ul>
		@type boolean
	*/
	this.dsnAvailable=false;

	/**
		this property holds original message-id for this DSN
		<p>
		Access functions:
		<ul>
			<li>{@link #getOriginalMsgId}
		</ul>
		@type string
	*/
	this.cacheOriginalMsgId = null;

	// search if this message is a delivery notification
	var contentT=this.getValueFromField("content-type",this.getHeaders());
	if ((contentT!="")) {
		// found Content type
		if (this.dsnRegExpCache.multipartReport.test(contentT) && this.dsnRegExpCache.findDeliveryStatus.test(contentT))
			this.dsnAvailable=true;
	}
}



dsnParser.prototype = new mailParser();

/**
	regular expressions cache
*/
dsnParser.prototype.dsnRegExpCache = {
	validReport: new RegExp("delivered|delayed|relayed|failed|expanded","i"),
	multipartReport: new RegExp("multipart/report","i"),
	findDeliveryStatus: new RegExp("report\-type[ \\s]*=[ \\s]*\"?delivery\-status\"?","i")
}


/**
	Test if this message is a delivery status
	@return {boolean} <b>true</b> if this message is a delivery status
*/
dsnParser.prototype.isDeliveryStatus = function() {
	return this.dsnAvailable;
}

/**
	Get delivery reports
	@return {Array} <b>Array of {@link deliveryReport}</b> or null if is not a DSN message
	@see deliveryReport
*/
dsnParser.prototype.getDeliveryReports = function() {
	if (!this.dsnAvailable) return null;
	// return cache if initialised
	if (this.cacheDeliveryReports!=null)
		return this.cacheDeliveryReports;

	this.cacheDeliveryReports=new Array();
	this.cacheOriginalMsgId="";

	var parts=this.getParts();
	// read parts
	for (var i=0 ; i < parts.length ; i++)
	{
		var part=parts[i];
		var contentT=this.getValueFromField("content-type",part);
		if (contentT!="") {
			// found Content type

			// test if type is message/delivery-status
			if ((/message\/delivery\-status/i).test(contentT))
			{
				// get one ore more fields of this delivery status
				
				var myArray = new Array();
				// separator fields (see RFC 822)
				var separator="\n\n";
				var begin = (part).indexOf(separator);
				while (begin != -1) {
					myArray.push(begin);
					begin = (part).indexOf(separator,++begin);
				}

				// read fields
				for (var j=0 ; j < (myArray.length)-1 ; j++)
				{
					var beg=myArray[j];
					var end=myArray[j+1];
					var fields=part.substring(beg,end);
					// now, get Original-Recipient, Action field ...
					var result=this.getReportFromFields(fields);
					if (result!=null)
						this.cacheDeliveryReports.push(result);
				}
			}

			/*
				test if type is message/rfc822 (normally,it appears as the third component of the multipart/report - see rfc 3464) or type is text/rfc822-headers (RFC 3462 - contain all the RFC822 header lines from the message which caused the report).
				Note: A delay report from a multiprotocol MTA.  Note that there is no returned content, so no third body part appears in the DSN.
			*/
			if ((/message\/rfc822/i).test(contentT) || (/text\/rfc822\-headers/i).test(contentT))
			{
				this.cacheOriginalMsgId=this.getValueFromField("Message-ID",part);
			}
		}
	}
	return this.cacheDeliveryReports;
}



/**
	Get original message-id for this DSN.
	@return {string} return message-id fields from the original message
	<p>
	In order to conform to RFC 822, the Message-ID must have the format
	<pre>"<" "unique" "&#64;" "full domain name" ">"</pre>
	<p>
	Example: <Pre>&#60;20080213131118.4DD991FF88&#64;mydomain.org&#62;</pre>
*/
dsnParser.prototype.getOriginalMsgId = function() {
	if (!this.dsnAvailable) return null;
	// return cache if initialised
	if (this.cacheOriginalMsgId!=null)
		return this.cacheOriginalMsgId;

	// use getDeliveryReports to get original message-id
	this.getDeliveryReports();

	return this.cacheOriginalMsgId;
}


/**
	Test if a report is valid
	<p>
	examples:
	<pre>
	isValidReport("delivered");
	// return true
	isValidReport("failed");
	// return true
	isValidReport("not");
	// return false
	</pre>
	@param {string} report report (<i>delivered, delayed, relayed, failed </i>or<i> expanded</i>)
	@return {boolean} <b>true</b> if this report is valid

*/
dsnParser.prototype.isValidReport = function(report) {
	return this.dsnRegExpCache.validReport.test(report);
}


/**
	Return one delivery Report.

	@param {string} dsnFieds group of per-recipient fields.
	<p>
	The syntax for the group of per-recipient fields is as follows (RFC 3464):
	<p>
	<ul>
		<li>[ original-recipient-field CRLF ]
		<li>final-recipient-field CRLF
		<li>action-field CRLF
		<li>status-field CRLF
	</ul>
	example:
	<pre>
	Original-Recipient: rfc822;louisl&#64;larry.slip.umd.edu<br>
	Final-Recipient: rfc822;louisl&#64;larry.slip.umd.edu<br>
	Action: failed<br>
	Status: 4.0.0<br>
	Diagnostic-Code: smtp; 426 connection timed out<br>
	</pre>
	@return {deliveryReport} A {@link deliveryReport} object or null if is not a DSN

*/
dsnParser.prototype.getReportFromFields = function(dsnFieds) {
	// Action field
	var actionF=this.getValueFromField("Action",dsnFieds);

	// Final Recipient
	var finalRecipientF=this.getValueFromField("Final-Recipient",dsnFieds);

	// Original Recipient
	var originalRecipientF=this.getValueFromField("Original-Recipient",dsnFieds);

	// Status
	var statusF=this.getValueFromField("Status",dsnFieds);

	// Diagnostic Code
	var diagnosticCodeF=this.getValueFromField("Diagnostic-Code",dsnFieds);

	// minimum required (action field and final-recipient field)
	if (actionF.length!=0 && finalRecipientF.length!=0 && this.isValidReport(actionF))
	{
		//create new object
		var report=new deliveryReport();
		report.actionValue=actionF;
		report.finalRecipient=finalRecipientF;
		report.originalRecipient=originalRecipientF;
		report.statusValue=statusF;
		report.diagnosticCode=diagnosticCodeF;
		return report;
	}
	else
		return null;
}




