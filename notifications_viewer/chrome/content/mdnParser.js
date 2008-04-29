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
	Library for parsing messages type MDN
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/ 


/**
	@class A MDN report object.
	@constructor
*/
function mdnReport () {
	/**
		Reporting-UA field
		@type string
	*/
	this.reportingUA = "";

	/**
		The MDN-Gateway field indicates the name of the gateway or MTA that
		translated a foreign (non-Internet) message disposition notification
		into this MDN.  This field MUST appear in any MDN that was translated
		by a gateway from a foreign system into MDN format, and MUST NOT
		appear otherwise.
		@type string
	*/
	this.mdnGateway = "";
	/**
		The Original-Recipient field indicates the original recipient address
		as specified by the sender of the message for which the MDN is being
		issued.  For Internet Mail messages, the value of the Original-
		Recipient field is obtained from the Original-Recipient header from
		the message for which the MDN is being generated.  If there is no
		Original-Recipient header in the message, then the Original-Recipient
		field MUST be omitted, unless the same information is reliably
		available some other way.  If there is an Original-Recipient header
		in the original message (or original recipient information is
		reliably available some other way), then the Original-Recipient field
		must be supplied.  If there is more than one Original-Recipient
		header in the message, the MUA may choose the one to use, or act as
		if no Original-Recipient header is present.
		@type string
	*/
	this.originalRecipient = "";
	/**
		The Final-Recipient field indicates the recipient for which the MDN
		is being issued.  This field MUST be present.
		@type string
	*/
	this.finalRecipient = "";
	/**
		The Original-Message-ID field indicates the message-ID of the message
		for which the MDN is being issued.  It is obtained from the Message-
		ID header of the message for which the MDN is issued.  This field
		MUST be present if the original message contained a Message-ID
		header.
		@type string
	*/
	this.originalMessageId = "";
	/**
  		disposition-mode = action-mode "/" sending-mode. 
		The following disposition modes are defined:
		<ul>
			<li>"manual-action"
			The disposition described by the disposition
			type was a result of an explicit instruction
			by the user rather than some sort of
			automatically performed action.
		
			<li>"automatic-action"
			The disposition described by the disposition
			type was a result of an automatic action,
			rather than an explicit instruction by the
			user for this message.
		</ul>
		"Manual-action" and "automatic-action" are mutually exclusive.  One
		or the other MUST be specified.
		<ul>
			<li>"MDN-sent-manually"
			The user explicitly gave permission for this
			particular MDN to be sent.
	
			<li>"MDN-sent-automatically"
			The MDN was sent because the MUA had
			previously been configured to do so
			automatically.
		</ul>
		@type string
	*/
	this.dispositionMode = "";
	/**
		disposition-type = "displayed" / "deleted"
		<ul>
			<li>"displayed"
			The message has been displayed by the MUA
			to someone reading the recipient's mailbox.
			There is no guarantee that the content has
			been read or understood.
	
			<li>"deleted"
			The message has been deleted.  The
			recipient may or may not have seen the
			message.  The recipient might "undelete"
			the message at a later time and read the
			message.
		</ul>
		@type string
	*/
	this.dispositionType = "";
}


/**
	@class This Class is a MDN Parser (see rfc3798).
	@version 0.9.0
	@author Daniel Rocher / Etat francais Ministere de la Defense
	@constructor
	@param {string} message message source
*/
function mdnParser(message) {
	mailParser.call(this, message);

	/**
		cache of MDN Report
		<p>
		Access functions:
		<ul>
			<li>{@link #getMdnReport}
		</ul>
		@type mdnReport
	*/
	this.cacheMdnReport = null;

	/**
		this property holds whether the message contains message disposition notification
		<p>
		Access functions:
		<ul>
			<li>{@link #isMessageDisposition}
		</ul>
		@type boolean
	*/
	this.mdnAvailable=false;

	// search if this message is a MDN
	var contentT=this.getValueFromField("content-type",this.getHeaders());
	if ((contentT!="")) {
		// found Content type
		if (this.mdnRegExpCache.multipartReport.test(contentT) && this.mdnRegExpCache.findMdnContent.test(contentT))
			this.mdnAvailable=true;
	}
}



mdnParser.prototype = new mailParser();

/**
	regular expressions cache
*/
mdnParser.prototype.mdnRegExpCache = {
	validDisposition: new RegExp("displayed|deleted|dispatched|processed|denied|failed","i"),
	multipartReport: new RegExp("multipart/report","i"),
	findMdnContent: new RegExp("report\-type[ \\s]*=[ \\s]*\"?disposition\-notification\"?","i")
}


/**
	Test if this message is a MDN
	@return {boolean} <b>true</b> if this message is a message disposition notification
*/
mdnParser.prototype.isMessageDisposition = function() {
	return this.mdnAvailable;
}

/**
	Get MDN report
	@return {mdnReport} a {@link mdnReport} Object or null if is not a MDN message
	@see mdnReport
*/
mdnParser.prototype.getMdnReport = function() {
	if (!this.mdnAvailable) return null;
	// return cache if initialised
	if (this.cacheMdnReport!=null)
		return this.cacheMdnReport;

	var parts=this.getParts();
	// read parts
	for (var i=0 ; i < parts.length ; i++)
	{
		var part=parts[i];
		var contentT=this.getValueFromField("content-type",part);
		if (contentT!="") {
			// found Content type

			// test if type is Message/disposition-notification
			if ((/Message\/disposition\-notification/i).test(contentT))
			{
				// now, get disposition type,  final recipient...
				var result=this.getReportFromFields(part);
				if (result!=null)
					this.cacheMdnReport=result;
			}
		}
	}
	return this.cacheMdnReport;
}



/**
	Test if report is valid
	<p>
	examples:
	<pre>
	isValidDisposition("displayed");
	// return true
	isValidDisposition("deleted");
	// return true
	isValidDisposition("not");
	// return false
	</pre>
	@param {string} report report (<i>displayed, deleted</i>)
	@return {boolean} <b>true</b> if this report is valid

*/
mdnParser.prototype.isValidDisposition = function(report) {
	return this.mdnRegExpCache.validDisposition.test(report);
}


/**
	Return a MDN Report.

	@param {string} mdnFieds group of per-recipient fields.
	<p>
	The syntax for the group of per-recipient fields is as follows (RFC 3798)
	@return {mdnReport} a {@link mdnReport} object or null if is not a MDN

*/
mdnParser.prototype.getReportFromFields = function(mdnFieds) {
	// reporting UA field
	var reportingUA=this.getValueFromField("Reporting-UA",mdnFieds);

	// MDN Gateway
	var mdnGateway=this.getValueFromField("MDN-Gateway",mdnFieds);

	// Original Recipient
	var originalRecipient=this.getValueFromField("Original-Recipient",mdnFieds);

	// Final Recipient
	var finalRecipient=this.getValueFromField("Final-Recipient",mdnFieds);

	// Original Message-ID
	var originalMessageId=this.getValueFromField("Original-Message-ID",mdnFieds);

	// Disposition
	var dispositionMode="";
	var dispositionType="";
	var disposition=(this.getValueFromField("Disposition",mdnFieds)).split(";");
	if (disposition.length >0) dispositionMode=disposition[0].replace(this.regExpCache.trim, "");
	if (disposition.length >1) dispositionType=disposition[1].replace(this.regExpCache.trim, "");

	// minimum required (disposition field and final-recipient field)
	if (dispositionType.length!=0 && finalRecipient.length!=0 && this.isValidDisposition(dispositionType))
	{
		//create new object
		var report=new mdnReport();
		report.reportingUA=reportingUA;
		report.mdnGateway=mdnGateway;
		report.originalRecipient=originalRecipient;
		report.finalRecipient=finalRecipient;
		report.originalMessageId=originalMessageId;
		report.dispositionMode=dispositionMode;
		report.dispositionType=dispositionType;
		return report;
	}
	else
		return null;
}




