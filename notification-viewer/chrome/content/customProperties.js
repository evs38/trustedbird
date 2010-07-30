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
 * Contributor(s):
 *    Raphael Fairise / BT Global Services / Etat francais Ministere de la Defense
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
	implementation of DeliveredTo and customProperties
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/


/**
	@class A delivered-to property object
	@constructor
	@version 0.9.2
	@author Daniel Rocher / Etat francais Ministere de la Defense
	@param {string} finalRecipient Final recipient
	@param {number} timeoutDelay Timeout for this recipient
	@param {number} requests Notifications requested
*/
function DeliveredTo (finalRecipient, timeoutDelay, requests) {
	/** final recipient @type string */
	this.finalRecipient = finalRecipient;
	this.timeoutDelay = timeoutDelay;
	this.requests = requests;
	/** a DSN list @type Array */
	this.dsnList = new Array();
	/** a MDN list @type Array */
	this.mdnList = new Array();
}

/**
	@class A DSN property object
	@constructor
	@version 0.9.0
	@author Daniel Rocher / Etat francais Ministere de la Defense
	@param {string} actionValue ("failed" / "delayed" / "delivered" / "relayed" / "expanded")
	@param {string} messageId  message-id of notification
*/
function dsnProperty (actionValue,messageId) {
	/** actionValue @type string */
	this.actionValue = actionValue;
	/** messageId @type string */
	this.messageId = messageId;
}

/**
	@class A MDN property object
	@constructor
	@version 0.9.0
	@author Daniel Rocher / Etat francais Ministere de la Defense
	@param {string} dispositionType ("displayed" / "deleted" / "dispatched" / "processed" / "denied" / "failed")
	@param {string} messageId  message-id of notification
*/
function mdnProperty (dispositionType,messageId) {
	/** dispositionType @type string */
	this.dispositionType = dispositionType;
	/** messageId @type string */
	this.messageId = messageId;
}


/**
	format for deliveredToProperty (<i>x-nviewer-to</i>) property:
	<p>
	<pre>
	<b>field separator: ";"
	row separator: ":"</b>

	First row: messageDate
	<b>Next rows fields:                   type</b>
	final recipient           string
	timeout                   number
	requests                  number
	DSN Count                 number
	DSN                       string
	DSN message-Id            string
	MDN Count                 number
	MDN                       string
	MDN message-Id            string

	final recipient;timeout;requests;DSN Count[;DSN;DSN message-Id]*;MDN Count[;MDN;MDN message-Id]*
	</pre>
	example:
	<pre>
	1238073625:
	daniel&#64;vraimentbidon.org;0;3;1;delivered;&#60;123456&#64;vraimentbidon.org&#62;;1;displayed;&#60;AZERG&#64;vraimentbidon.org&#62;:
	sersim&#64;vraimentbidon.org;0;3;1;delivered;&#60;543211&#64;vraimentbidon.org&#62;;2;displayed;&#60;GBI4E&#64;vraimentbidon.org&#62;;deleted;&#60;AZT564&#64;vraimentbidon.org&#62;
	</pre>
	@class manage custom properties
	@constructor
	@version 0.9.4
	@author Daniel Rocher / Etat francais Ministere de la Defense
	@param {string} deliveredToProperty x-nviewer-to property
*/
function customProperties(deliveredToProperty) {
	/**
		x-nviewer-to property
		<p>
		Access functions:
		<ul>
			<li>{@link #getDeliveredToProperty}
		</ul>
		@type string
	*/
	this.deliveredToProperty=deliveredToProperty;

	/**
		x-nviewer-status property ("good","middle", "bad")
		<p>
		Access functions:
		<ul>
			<li>{@link #getStatusProperty}
		</ul>
		@type string
	*/
	this.status = "";

	/**
		x-nviewer-dsn-summary property (number/total)
		<p>
		Access functions:
		<ul>
			<li>{@link #getDsnSummaryProperty}
		</ul>
		@type string
	*/
	this.dsnSummaryProperty = "";

	/**
		x-nviewer-mdn-displayed-summary property (number/total)
		<p>
		Access functions:
		<ul>
			<li>{@link #getMdnDisplayedSummaryProperty}
		</ul>
		@type string
	*/
	this.mdnDisplayedSummaryProperty = "";

	/**
		x-nviewer-mdn-deleted-summary property (number/total)
		<p>
		Access functions:
		<ul>
			<li>{@link #getMdnDeletedSummaryProperty}
		</ul>
		@type string
	*/
	this.mdnDeletedSummaryProperty = "";

	/**
		List of {@link DeliveredTo} object
		@type Array
	*/
	this.deliveredToArray = new Array();


	this.checkDelay = false;
	this.timedOut = false;
	
	this.messageDate = 0;
	
	if (deliveredToProperty && deliveredToProperty.length > 0) {
		var tmpArray = deliveredToProperty.split(":"); // get rows
		
		this.messageDate = tmpArray[0];
		
		for (var i = 1 ; i < tmpArray.length; i++) {
			var finalRecipient="";
			var dsnCount=0;
			var mdnCount=0;
			var timeoutDelay=0;
			var requests=0;
			var currentIndex=0;
			var Values = tmpArray[i].split(";"); // get fields

			if (Values.length > 0) finalRecipient = Values[0];
			if (Values.length > 1) timeoutDelay = Values[1];
			if (Values.length > 2) requests = Values[2];
			
			if (this.regExpCache.validAddr.test(finalRecipient)) {
				// create a new object for this recipient
				var newDeliveredTo = this.addDeliveredTo(finalRecipient, timeoutDelay, requests);
	
				if (newDeliveredTo) {
					// now, get DSN
					currentIndex=3;
					if (Values.length>currentIndex)
						dsnCount=Values[currentIndex];

					dsnCount=parseInt(dsnCount);
					if (isNaN(dsnCount) || dsnCount<=0)
						dsnCount=0;

					for (var j = 0; j < dsnCount; j++) {
						currentIndex++;
						var actionValue="";
						var messageId="";
	
						if (Values.length>currentIndex)
							actionValue=Values[currentIndex];

						currentIndex++;
						if (Values.length>currentIndex)
							messageId=Values[currentIndex];

						if (this.regExpCache.validDsnReport.test(actionValue))
							newDeliveredTo.dsnList.push(new dsnProperty(actionValue, messageId));
					}
					// now, get mdn
					currentIndex++;
					if (Values.length>currentIndex)
						mdnCount=Values[currentIndex];
		
					mdnCount=parseInt(mdnCount);
					if (isNaN(mdnCount) || mdnCount<=0)
						mdnCount=0;

					for (var j = 0; j < mdnCount; j++) {
						currentIndex++;
						var dispositionType="";
						var messageId="";
	
						if (Values.length>currentIndex)
							dispositionType=Values[currentIndex];
	
						currentIndex++;
						if (Values.length>currentIndex)
							messageId=Values[currentIndex];

						if (this.regExpCache.validMdnReport.test(dispositionType))
							newDeliveredTo.mdnList.push(new mdnProperty(dispositionType, messageId));
					}
				}
			}
		}
		// refresh data
		this.updateProperties();
	}
}


/* Requests */
customProperties.NO_REQUEST = 0x0;
customProperties.DSN_REQUEST = 0x1;
customProperties.MDN_REQUEST = 0x2;


customProperties.prototype = {
	/**
		regular expressions cache
	*/
	regExpCache : {
		validAddr: new RegExp("^(<|).+@.+(>|)$","i"),
		validDsnReport: new RegExp("delivered|delayed|relayed|failed|expanded","i"),
		validMdnReport: new RegExp("displayed|deleted|dispatched|processed|denied|failed","i"),
		trim: new RegExp("(?:^\\s*)|(?:\\s*$)","g")
	},

	/**
		create a {@link DeliveredTo} object if finalRecipient doesn't exist, otherwise update data
		@param {string} finalRecipient final recipient
		@param {number} timeoutDelay ( see {@link DeliveredTo})
		@param {number} requests ( see {@link DeliveredTo})
		@return {DeliveredTo} a {@link DeliveredTo} object
	*/
	addDeliveredTo: function(finalRecipient, timeoutDelay, requests) {

		// Check if address is correct
		finalRecipient = getValidAddress(finalRecipient);
		if (!finalRecipient) return false;

		// Check if finalRecipient already exists
		for (var i in this.deliveredToArray) {
			if (this.deliveredToArray[i].finalRecipient == finalRecipient) {
				// Already exists: update data
				if (timeoutDelay > 0) this.deliveredToArray[i].timeoutDelay = timeoutDelay;
				this.deliveredToArray[i].requests |= requests;
				return this.deliveredToArray[i];
			}
		}

		
		// Insert new recipient
		this.deliveredToArray.push(new DeliveredTo(finalRecipient, timeoutDelay, requests));
		
		this.updateProperties();
		
		return this.getReportOf(finalRecipient);
	},


	/**
		Change properties with the {@link deliveryReport} object
		@param {deliveryReport} dveryReport a {@link deliveryReport} object
		@param {string} messageId  message-id of notification
		@return {boolean} <b>false</b> if an error occurs
	*/
	addDsnReport: function(dveryReport, messageId) {
		// check type
		if (typeof(dveryReport)!="object") return false;
		if (!dveryReport instanceof deliveryReport) return false;

		var finalRecipient=dveryReport.finalRecipient;
		var actionValue=dveryReport.actionValue;

		if (! this.regExpCache.validDsnReport.test(actionValue)) return false;
		if (! this.regExpCache.validAddr.test(finalRecipient)) return false;

		// get address from final-recipient fields (see RFC3464)
		// final-recipient-field = 
		//        address-type ";" generic-address
		// example: rfc822;louisl@larry.slip.umd.edu
		var finalRecipientArray=finalRecipient.split(";");

		if (finalRecipientArray.length >1)
			finalRecipient=finalRecipientArray[1].replace(this.regExpCache.trim, "");

		var newDeliveredTo=this.addDeliveredTo(finalRecipient, 0, customProperties.NO_REQUEST);

		if (newDeliveredTo) {
			for (var i in newDeliveredTo.dsnList) {
				if (newDeliveredTo.dsnList[i].actionValue == actionValue && newDeliveredTo.dsnList[i].messageId == messageId) {
					/* Notification already exists */
					return false;
				}
			}
			newDeliveredTo.dsnList.push(new dsnProperty(actionValue, messageId));
			this.updateProperties();
			return true;
		}
		
		return false;
	},

	/**
		Change properties with the {@link mdnReport} object
		@param {mdnReport} report a {@link mdnReport} object
		@param {string} messageId  message-id of notification
		@return {boolean} <b>false</b> if an error occurs
	*/
	addMdnReport: function(report, messageId) {
		// check type
		if (typeof(report)!="object") return false;
		if (!report instanceof mdnReport) return false;

		var finalRecipient=report.finalRecipient;
		var dispositionType=report.dispositionType;

		if (! this.regExpCache.validMdnReport.test(dispositionType)) return false;

		// get address from final-recipient fields (see RFC3464)
		// final-recipient-field = 
		//        address-type ";" generic-address
		// example: rfc822;louisl@larry.slip.umd.edu
		var finalRecipientArray=finalRecipient.split(";");

		if (finalRecipientArray.length >1)
			finalRecipient=finalRecipientArray[1].replace(this.regExpCache.trim, "");

		var newDeliveredTo=this.addDeliveredTo(finalRecipient, 0, customProperties.NO_REQUEST);

		var result=false;
		if (newDeliveredTo) {
			for (var i in newDeliveredTo.mdnList) {
				if (newDeliveredTo.mdnList[i].dispositionType == dispositionType && newDeliveredTo.mdnList[i].messageId == messageId) {
					/* Notification already exists */
					return false;
				}
			}
			newDeliveredTo.mdnList.push(new mdnProperty(dispositionType, messageId));
			this.updateProperties();
			return true;
		}
		
		return false;
	},



	/**
		define all properties
		@private
	*/
		
	updateProperties: function() {
		var numFailed=0;
		var numRelayed=0;
		var numDelivered=0;
		var numDisplayed=0;
		var numDeleted=0;
		var total=this.deliveredToArray.length;
		
		var dsnRequest = false;
		var mdnRequest = false;
		
		this.timedOut = false;
		this.checkDelay = false;
		
		for (var i in this.deliveredToArray) {

			if (this.deliveredToArray[i].requests & customProperties.DSN_REQUEST) dsnRequest = true;
			if (this.deliveredToArray[i].requests & customProperties.MDN_REQUEST) mdnRequest = true;
			
			/* DSN */
			var isFailed=false;
			var isRelayed=false;
			var isDelivered=false;
			var isDelayed=false;
			for (var j in this.deliveredToArray[i].dsnList) {
				var actionValue = this.deliveredToArray[i].dsnList[j].actionValue;
				if ((actionValue == "delivered") || (actionValue == "expanded")) isDelivered=true;
				else if (actionValue == "failed") isFailed=true;
				else if (actionValue == "relayed") isRelayed=true;
				else if (actionValue == "delayed") isDelayed=true;
			}
			
			/* Check if DSN has been received for this recipient */
			if ((dsnRequest && (isFailed || isRelayed || isDelivered)) || !dsnRequest) {
				/* DSN received or no DSN requested: stop waiting for this recipient */
				this.deliveredToArray[i].timeoutDelay = 0;
			}
			
			
			/* Check if a timeout is reached */
			if (this.messageDate > 0 && this.deliveredToArray[i].timeoutDelay > 0) {
				var now = parseInt((new Date()).getTime() / 1000);
				if ((now - this.messageDate) > this.deliveredToArray[i].timeoutDelay) {
					/* Delay expired for this recipient: set message as timed out */
					this.timedOut = true;
				} else {
					/* Delay not expired for this recipient: check again later */
					this.checkDelay = true;
				}
			}
			
			if (isFailed) numFailed+=1;
			if (isRelayed) numRelayed+=1;
			if (isDelivered) numDelivered+=1;

			/* MDN */
			var isDisplayed=false;
			var isDeleted=false;
			for (var j in this.deliveredToArray[i].mdnList) {
				var dispositionType=this.deliveredToArray[i].mdnList[j].dispositionType;
				if (dispositionType == "displayed") isDisplayed=true;
				else if (dispositionType == "deleted") isDeleted=true;
			}
			if (isDisplayed) numDisplayed+=1;
			if (isDeleted) numDeleted+=1;
		}

		/* Define status */
		if (numFailed > 0) this.status = "bad";
		else if (numRelayed > 0) this.status = "middle";
		else if (total == numDelivered) this.status = "good";
		else this.status = "";

		/* Define summary */
		if (dsnRequest) {
			this.dsnSummaryProperty = (numDelivered + numRelayed) + "/" + total;
		}
		if (mdnRequest) {
			this.mdnDisplayedSummaryProperty = numDisplayed + "/" + total;
			if (numDeleted != 0) this.mdnDeletedSummaryProperty = numDeleted + "/" + total;
		}

	},


	/**
		@param {string} finalRecipient final recipient
		@return {DeliveredTo} a {@link DeliveredTo} object or <b>null</b> if not exist
	*/
	getReportOf: function (finalRecipient) {
		for (var i = 0; i < this.deliveredToArray.length; i++) {
			if (this.deliveredToArray[i].finalRecipient==finalRecipient) {
				// Recipient exists
				return this.deliveredToArray[i];
			}
		}
		return null;
	},


	/**
		@return {string} Return x-nviewer-to property
	*/
	getDeliveredToProperty: function() {
		this.updateProperties();
		
		var Values = this.messageDate;
		for (var i = 0; i < this.deliveredToArray.length; i++) {
			var myDeliveryTo = this.deliveredToArray[i];
			Values += ":";
			Values += myDeliveryTo.finalRecipient;
			Values += ";" + myDeliveryTo.timeoutDelay;
			Values += ";" + myDeliveryTo.requests;

			// DSN count
			Values += ";" + myDeliveryTo.dsnList.length;

			// now, add DSNs
			for (var j = 0; j < myDeliveryTo.dsnList.length; j++) {
				Values += ";" + myDeliveryTo.dsnList[j].actionValue + ";" + myDeliveryTo.dsnList[j].messageId;
			}

			// MDN count
			Values += ";" + myDeliveryTo.mdnList.length;

			// now, add MDNs
			for (var j = 0; j < myDeliveryTo.mdnList.length; j++) {
				Values += ";" + myDeliveryTo.mdnList[j].dispositionType + ";" + myDeliveryTo.mdnList[j].messageId;
			}
		}
		
		this.deliveredToProperty = Values;
		return this.deliveredToProperty;
	},

	/**
	 * @return Array of notifications messageId
	 */
	getAllNotificationsMessageId: function() {
		var list = new Array();
		
		for (var i in this.deliveredToArray) {
			for (var j in this.deliveredToArray[i].dsnList) {
				if (list.indexOf(this.deliveredToArray[i].dsnList[j].messageId) == -1) list.push(this.deliveredToArray[i].dsnList[j].messageId);
			}
			for (var j in this.deliveredToArray[i].mdnList) {
				if (list.indexOf(this.deliveredToArray[i].mdnList[j].messageId) == -1) list.push(this.deliveredToArray[i].mdnList[j].messageId);
			}
		}
		return list;
	},

	/**
		@return {string} Return x-nviewer-status property ("good" ,"bad" , "middle" or "")
	*/
	getStatusProperty: function() {
		return this.status;
	},

	/**
		@return {string} Return x-nviewer-dsn-summary property (number/total)
	*/
	getDsnSummaryProperty: function() {
		return this.dsnSummaryProperty;
	},

	/**
		@return {string} 
	*/
	getTimedOut: function() {
		if (this.timedOut) return "yes"; else return "no";
	},

	/**
	@return {string} 
	*/
	getCheckDelay: function() {
		if (this.checkDelay) return "yes"; else return "no";
	},

	/**
		@return {string} Return x-nviewer-mdn-displayed-summary property
	*/
	getMdnDisplayedSummaryProperty: function() {
		return this.mdnDisplayedSummaryProperty;
	},

	/**
		@return {string} Return x-nviewer-mdn-deleted-summary property
	*/
	getMdnDeletedSummaryProperty: function() {
		return this.mdnDeletedSummaryProperty;
	},

	/**
		get custom Properties (for debug)
		@private
		@return {string}
	*/
	getTxtProperties: function() {
		this.updateProperties();
		
		var txt="\n\n";
		txt+="Send date:   "+this.messageDate+"\n";
		txt+="Status:      "+this.status+"\n";
		txt+="Timeout:     "+this.timedOut+"\n";
		txt+="Check delay: "+this.checkDelay+"\n";
		txt+="DSN Summary: "+this.dsnSummaryProperty+"\n";
		for (var i in this.deliveredToArray) {
			txt += "\n";
			txt += "   finalRecipient: " + this.deliveredToArray[i].finalRecipient + "\n";
			txt += "   timeout:        " + this.deliveredToArray[i].timeoutDelay + "\n";
			txt += "   requests:       ";
			if (this.deliveredToArray[i].requests & customProperties.DSN_REQUEST) txt += "DSN ";
			if (this.deliveredToArray[i].requests & customProperties.MDN_REQUEST) txt += "MDN ";
			txt += "\n";
			txt += "   DSN Count:      " + this.deliveredToArray[i].dsnList.length+"\n";
			for (var j = 0; j < this.deliveredToArray[i].dsnList.length; j++) {
				txt += "       actionValue:     " + this.deliveredToArray[i].dsnList[j].actionValue + "\n";
				txt += "       messageId:       " + this.deliveredToArray[i].dsnList[j].messageId + "\n";
			}
			txt += "   MDN Count:      " + this.deliveredToArray[i].mdnList.length+"\n";
			for (var j = 0; j < this.deliveredToArray[i].mdnList.length; j++) {
				txt += "       dispositionType: " + this.deliveredToArray[i].mdnList[j].dispositionType + "\n";
				txt += "       messageId:       " + this.deliveredToArray[i].mdnList[j].messageId + "\n";
			}
		}
		txt += "\n";
		txt += "MDN displayed Summary: " + this.mdnDisplayedSummaryProperty + "\n";
		txt += "MDN deleted Summary:   " + this.mdnDeletedSummaryProperty + "\n";
		txt += "\n\n";
		return txt;
	}
}
