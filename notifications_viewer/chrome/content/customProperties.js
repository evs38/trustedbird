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
	implementation of DeliveredTo and customProperties
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/


/**
	@class A delivered-to property object
	@constructor
	@version 0.9.0
	@author Daniel Rocher / Etat francais Ministere de la Defense
	@param {string} finalRecipient final recipient
	@param {string} actionValue ("failed" / "delayed" / "delivered" / "relayed" / "expanded")
	@param {string} messageId  message-id of notification
	@param {number} flags flags for this object - <b>NOT FROZEN</b>
*/
function DeliveredTo (finalRecipient,actionValue,messageId,flags) {
	/** final recipient @type string */
	this.finalRecipient = finalRecipient;
	/** actionValue @type string */
	this.actionValue = actionValue;
	/** messageId @type string */
	this.messageId = messageId;
	/** flags <b>(NOT FROZEN)</b> @type number */
	this.flags = flags;
	/** <pre>b ...1 Time out </pre> @type number */
	this.FLAG_TIMEOUT= 0x1;
}


/**
	@class manage custom properties
	@constructor
	@version 0.9.2
	@author Daniel Rocher / Etat francais Ministere de la Defense
	@param {string} deliveredToProperty x-dsnviewer-to property
	@param {string} statusProperty x-dsnviewer-status property ("good","middle", "bad")
	@param {string} summaryProperty x-dsnviewer-summary property (number/total)
	@param {string} flagsProperty x-dsnviewer-flags property
*/
function customProperties(deliveredToProperty,statusProperty,summaryProperty,flagsProperty) {

	/**
		x-dsnviewer-to property
		<p>
		Access functions:
		<ul>
			<li>{@link #getDeliveredToProperty}
		</ul>
		@type string
	*/
	this.deliveredToProperty=deliveredToProperty;

	/**
		x-dsnviewer-status property ("good","middle", "bad")
		<p>
		Access functions:
		<ul>
			<li>{@link #getStatusProperty}
		</ul>
		@type string
	*/
	this.statusProperty=statusProperty;

	/**
		x-dsnviewer-summary property (number/total)
		<p>
		Access functions:
		<ul>
			<li>{@link #getSummaryProperty}
		</ul>
		@type string
	*/
	this.summaryProperty=summaryProperty;

	/**
 		List of {@link DeliveredTo} object
		@type Array
	*/
	this.deliveredToArray=new Array();

	flagsProperty=parseInt(flagsProperty);
	if (isNaN(flagsProperty))
		flagsProperty=0;
	/**
		x-dsnviewer-flags property
		@type number
	*/
	this.flagsProperty=flagsProperty;

	/** <pre>b ...1 Time out </pre> @type number */
	this.FLAG_TIMEOUT= 0x1;

	/**
		All DSN were received
		@type boolean
	*/
	this.allDsnReceived=false;

	if (deliveredToProperty.length!=0) {
		var tmpArray = deliveredToProperty.split("\n\t");
		for (var i =0 ; i < tmpArray.length ; i++ ) {
			var finalRecipient="";
			var actionValue="";
			var messageId="";
			var flags=0;
			var Values = tmpArray[i].split(";");

			if (Values.length>0)
				finalRecipient=Values[0];
	
			if (Values.length>1)
				actionValue=Values[1];
	
			if (Values.length>2)
				messageId=Values[2];

			if (Values.length>3)
				flags=Values[3];

			this.addDeliveredTo(finalRecipient,actionValue,messageId,flags);
		}
	}
}



customProperties.prototype = {
	/**
		regular expressions cache
	*/
	regExpCache : {
		validAddr: new RegExp("^(<|).+@.+(>|)$","i"),
		validReport: new RegExp("delivered|delayed|relayed|failed|expanded","i"),
		trim: new RegExp("(?:^\\s*)|(?:\\s*$)","g")
	},

	/**
		create a {@link DeliveredTo} object if finalRecipient doesn't exist, otherwise update data
		@param {string} finalRecipient final recipient
		@param {string} actionValue ("failed" / "delayed" / "delivered" / "relayed" / "expanded")
		@param {string} messageId message-id of notification
		@param {number} flags ( see {@link DeliveredTo})
		@return {boolean} <b>false</b> if an error occured
	*/
	addDeliveredTo: function(finalRecipient,actionValue,messageId,flags) {


		// test if addresses and report are correct
		if (! this.regExpCache.validAddr.test(finalRecipient)) return false;
		if (! this.regExpCache.validReport.test(actionValue)) actionValue="";
		if (! this.regExpCache.validAddr.test(messageId)) messageId="";

		var changed=false;
		// test if finalRecipient exist
		var exist=false
		for (var i =0 ; i < this.deliveredToArray.length ; i++ ) {
			if (this.deliveredToArray[i].finalRecipient==finalRecipient) {
				// exist
				this.deliveredToArray[i].actionValue=actionValue;
				this.deliveredToArray[i].messageId=messageId;
				// set only if flags changed
				if (flags!=0x0)
					this.deliveredToArray[i].flags=flags;
				exist=true;
				changed=true;
				break;
			}
		}

		if (!exist) {
			// create new object
			this.deliveredToArray.push(new DeliveredTo(finalRecipient,actionValue,messageId,flags));
			changed=true;
		}

		// refresh data
		if (changed)
			this.calculateAllProperties();

		return true;
	},


	/**
		Change properties with the {@link deliveryReport} object
		@param {deliveryReport} dveryReport a {@link deliveryReport} object
		@param {string} messageId  message-id of notification
		@return {boolean} <b>false</b> if an error occured
	*/
	addReport: function(dveryReport,messageId) {
		// check type
		if (typeof(dveryReport)!="object") return false;
		if (!dveryReport instanceof deliveryReport) return false;

		var finalRecipient=dveryReport.finalRecipient;
		var actionValue=dveryReport.actionValue;

		// get address from final-recipient fields (see RFC3464)
		// final-recipient-field = 
		//        address-type ";" generic-address
		// example: rfc822;louisl@larry.slip.umd.edu
		var finalRecipientArray=finalRecipient.split(";");

		if (finalRecipientArray.length >1)
			finalRecipient=finalRecipientArray[1].replace(this.regExpCache.trim, "");

		if (! this.addDeliveredTo(finalRecipient,actionValue,messageId,0)) return false; // false if report is invalid

		return true;
	},

	/**
		define all properties
	*/
		
	calculateAllProperties: function() {
		var numFailed=0;
		var numRelayed=0;
		var numDelivered=0;
		var numTimeOut=0;
		var number=0;
		var total=this.deliveredToArray.length;
		var numFinalDsn=0;

		for (var i =0 ; i < this.deliveredToArray.length ; i++ ) {

			// flags
			if (this.deliveredToArray[i].flags & this.deliveredToArray[i].FLAG_TIMEOUT)
				numTimeOut+=1;

			// summary
			var actionValue=this.deliveredToArray[i].actionValue;
			if ( (actionValue == "delivered") || (actionValue=="expanded")) number+=1;

			// status
			switch(this.deliveredToArray[i].actionValue) {
				case "failed":
					numFinalDsn+=1;
					numFailed+=1;
					break;
				case "relayed":
					numFinalDsn+=1;
					numRelayed+=1;
					break;
				case "delivered":
					numFinalDsn+=1;
					numDelivered+=1;
					break;
				case "expanded":
					numFinalDsn+=1;
					numDelivered+=1;
					break;
				case "delayed":
					// ignore
					break;
			}
		}

		// define flags
		if (numTimeOut!=0)
			this.flagsProperty=this.FLAG_TIMEOUT; //UNDO not possible

		// define status
		if (numFailed!=0)
			this.statusProperty="bad";
		else if (numRelayed!=0)
			this.statusProperty="middle";
		else if (total == numDelivered)
			this.statusProperty="good";
		else this.statusProperty="";

		// define summary
		this.summaryProperty= number+"/"+total;

		if (numFinalDsn==total)
			this.allDsnReceived=true; // All DSN were received
		else
			this.allDsnReceived=false;
	},


	/**
		set message as expired. Undo not possible.
	*/
	setMsgAsExpired: function() {
		for (var i =0 ; i < this.deliveredToArray.length ; i++ ) {
			var expire=true;
			// expired if <> failed, relayed, delivered, or expanded
			switch(this.deliveredToArray[i].actionValue) {
				case "failed":
					expire=false;
					break;
				case "relayed":
					expire=false;
					break;
				case "delivered":
					expire=false;
					break;
				case "expanded":
					expire=false;
					break;
				case "delayed":
					expire=true;
					break;
			}
			if (expire)
				this.deliveredToArray[i].flags=this.deliveredToArray[i].FLAG_TIMEOUT;
		}
		this.calculateAllProperties();
	},

	/**
		@param {string} finalRecipient final recipient
		@return {DeliveredTo} a {@link DeliveredTo} object or <b>null</b> if not exist
	*/
	getReportOf: function (finalRecipient) {
		for (var i =0 ; i < this.deliveredToArray.length ; i++ ) {
			if (this.deliveredToArray[i].finalRecipient==finalRecipient) {
				// exist
				return this.deliveredToArray[i];
			}
		}
		return null;
	},


	/**
		@return {string} Return x-dsnviewer-to property
	*/
	getDeliveredToProperty: function() {
		var Values="";
		for (var i =0 ; i < this.deliveredToArray.length ; i++ ) {
			var myDeliveryTo=this.deliveredToArray[i];
			if (i>0) Values+="\n\t";
			Values+=myDeliveryTo.finalRecipient+";"+myDeliveryTo.actionValue+";"+myDeliveryTo.messageId+";"+myDeliveryTo.flags;
		}
		this.deliveredToProperty=Values;
		return this.deliveredToProperty;
	},

	/**
		@return {string} Return x-dsnviewer-status property ("good" ,"bad" , "middle" or "")
	*/
	getStatusProperty: function() {
		return this.statusProperty;
	},

	/**
		@return {string} Return x-dsnviewer-summary property (number/total)
	*/
	getSummaryProperty: function() {
		return this.summaryProperty;
	},

	/**
		@return {string} Return x-dsnviewer-flags property
	*/
	getFlagsProperty: function() {
		return (this.flagsProperty).toString();
	}
}


