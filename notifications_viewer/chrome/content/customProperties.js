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
	@version 0.9.1
	@author Daniel Rocher / Etat francais Ministere de la Defense
	@param {string} finalRecipient final recipient
	@param {number} flags flags for this object - <b>NOT FROZEN</b>
*/
function DeliveredTo (finalRecipient,flags) {
	/** final recipient @type string */
	this.finalRecipient = finalRecipient;
	/** flags <b>(NOT FROZEN)</b> @type number */
	this.flags = flags;
	/** <pre>b ...1 Time out </pre> @type number */
	this.FLAG_TIMEOUT= 0x1;
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
	row separator: "\n\t"</b>

	<b>fields:                   type</b>
	final recipient           string
	flags                     number
	DSN Count                 number
	DSN                       string
	DSN message-Id            string
	MDN Count                 number
	MDN                       string
	MDN message-Id            string

	final recipient;flags;DSN Count[;DSN;DSN message-Id]*;MDN Count[;MDN;MDN message-Id]*
	</pre>
	example:
	<pre>
	daniel&#64;vraimentbidon.org;0;1;delivered;&#60;123456&#64;vraimentbidon.org&#62;;1;displayed;&#60;AZERG&#64;vraimentbidon.org&#62;\n\t
	sersim&#64;vraimentbidon.org;1;1;delivered;&#60;543211&#64;vraimentbidon.org&#62;;2;displayed;&#60;GBI4E&#64;vraimentbidon.org&#62;;deleted;&#60;AZT564&#64;vraimentbidon.org&#62;
	</pre>
	<p>
	format for flagsProperty (<i>x-nviewer-flags</i>) property:
	<p>
	<b>NOT FROZEN</b>
	<pre>
	b ...x  time out (global)
	b xxx.  customProperties version
	</pre>
	@class manage custom properties
	@constructor
	@version 0.9.4
	@author Daniel Rocher / Etat francais Ministere de la Defense
	@param {string} deliveredToProperty x-nviewer-to property
	@param {string} statusProperty x-nviewer-status property ("good","middle", "bad")
	@param {string} dsnSummaryProperty x-nviewer-dsn-summary property (number/total)
	@param {string} flagsProperty x-nviewer-flags property	
	@param {string} mdnDisplayedSummaryProperty x-nviewer-mdn-displayed-summary property (number/total)
	@param {string} mdnDeletedSummaryProperty x-nviewer-mdn-deleted-summary property (number/total)
*/
function customProperties(deliveredToProperty,statusProperty,dsnSummaryProperty,flagsProperty,mdnDisplayedSummaryProperty,mdnDeletedSummaryProperty) {

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
	this.statusProperty=statusProperty;

	/**
		x-nviewer-dsn-summary property (number/total)
		<p>
		Access functions:
		<ul>
			<li>{@link #getDsnSummaryProperty}
		</ul>
		@type string
	*/
	this.dsnSummaryProperty=dsnSummaryProperty;

	/**
		x-nviewer-mdn-displayed-summary property (number/total)
		<p>
		Access functions:
		<ul>
			<li>{@link #getMdnDisplayedSummaryProperty}
		</ul>
		@type string
	*/
	this.mdnDisplayedSummaryProperty=mdnDisplayedSummaryProperty;

	/**
		x-nviewer-mdn-deleted-summary property (number/total)
		<p>
		Access functions:
		<ul>
			<li>{@link #getMdnDeletedSummaryProperty}
		</ul>
		@type string
	*/
	this.mdnDeletedSummaryProperty=mdnDeletedSummaryProperty;

	/**
		List of {@link DeliveredTo} object
		@type Array
	*/
	this.deliveredToArray=new Array();


	flagsProperty=parseInt(flagsProperty);
	if (isNaN(flagsProperty))
		flagsProperty=0;
	/**
		x-nviewer-flags property
		@type number
	*/
	this.flagsProperty=flagsProperty;

	/** <pre>b ...1 Time out </pre> @type number */
	this.FLAG_TIMEOUT= 0x1;

	/**
		customProperties Version
		<pre>b 001. version 1
		@type number
	*/
	this.FLAG_VERSION=0x2;

	/**
		All DSN were received
		@type boolean
	*/
	this.allDsnReceived=false;

	if (deliveredToProperty.length!=0) {
		var tmpArray = deliveredToProperty.split("\n\t"); // get rows
		for (var i =0 ; i < tmpArray.length ; i++ ) {
			var finalRecipient="";
			var dsnCount=0;
			var mdnCount=0;
			var flags=0;
			var currentIndex=0;
			var Values = tmpArray[i].split(";"); // get fields

			if (Values.length>0)
				finalRecipient=Values[0];
	
			if (Values.length>1)
				flags=Values[1];

			if (this.regExpCache.validAddr.test(finalRecipient)) {
				// create a new object for this recipient
				var newDeliveredTo=this.addDeliveredTo(finalRecipient,flags);
	
				if (newDeliveredTo) { // if object's valid
					// now, get DSN
					currentIndex=2;
					if (Values.length>currentIndex)
						dsnCount=Values[currentIndex];

					dsnCount=parseInt(dsnCount);
					if (isNaN(dsnCount) || dsnCount<=0)
						dsnCount=0;

					for (var j=0; j < dsnCount ; j++ ) {
						currentIndex++;
						var actionValue="";
						var messageId="";
	
						if (Values.length>currentIndex)
							actionValue=Values[currentIndex];

						currentIndex++;
						if (Values.length>currentIndex)
							messageId=Values[currentIndex];

						if (this.regExpCache.validAddr.test(messageId) && this.regExpCache.validDsnReport.test(actionValue))
							newDeliveredTo.dsnList.push(new dsnProperty (actionValue,messageId));
					}
					// now, get mdn
					currentIndex++;
					if (Values.length>currentIndex)
						mdnCount=Values[currentIndex];
		
					mdnCount=parseInt(mdnCount);
					if (isNaN(mdnCount) || mdnCount<=0)
						mdnCount=0;

					for (var j=0; j < mdnCount ; j++ ) {
						currentIndex++;
						var dispositionType="";
						var messageId="";
	
						if (Values.length>currentIndex)
							dispositionType=Values[currentIndex];
	
						currentIndex++;
						if (Values.length>currentIndex)
							messageId=Values[currentIndex];

						if (this.regExpCache.validAddr.test(messageId) && this.regExpCache.validMdnReport.test(dispositionType))
							newDeliveredTo.mdnList.push(new mdnProperty (dispositionType,messageId));
					}
				}
			}
		}
		// refresh data
		this.calculateAllProperties();
	}
}



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
		@param {number} flags ( see {@link DeliveredTo})
		@return {DeliveredTo} a {@link DeliveredTo} object
	*/
	addDeliveredTo: function(finalRecipient,flags) {


		// test if address is correct
		if (! this.regExpCache.validAddr.test(finalRecipient)) return false;

		// test if finalRecipient exist
		for (var i =0 ; i < this.deliveredToArray.length ; i++ ) {
			if (this.deliveredToArray[i].finalRecipient==finalRecipient) {
				// exist
				// set only if flags changed
				if (flags!=0x0)
					this.deliveredToArray[i].flags=flags;
				return this.deliveredToArray[i];
			}
		}

		
		// create new object
		this.deliveredToArray.push(new DeliveredTo(finalRecipient,flags));
		return this.getReportOf(finalRecipient);
	},


	/**
		Change properties with the {@link deliveryReport} object
		@param {deliveryReport} dveryReport a {@link deliveryReport} object
		@param {string} messageId  message-id of notification
		@return {boolean} <b>false</b> if an error occured
	*/
	addDsnReport: function(dveryReport,messageId) {
		// check type
		if (typeof(dveryReport)!="object") return false;
		if (!dveryReport instanceof deliveryReport) return false;

		var finalRecipient=dveryReport.finalRecipient;
		var actionValue=dveryReport.actionValue;

		if (! this.regExpCache.validAddr.test(messageId)) return false;
		if (! this.regExpCache.validDsnReport.test(actionValue)) return false;
		if (! this.regExpCache.validAddr.test(finalRecipient)) return false;

		// get address from final-recipient fields (see RFC3464)
		// final-recipient-field = 
		//        address-type ";" generic-address
		// example: rfc822;louisl@larry.slip.umd.edu
		var finalRecipientArray=finalRecipient.split(";");

		if (finalRecipientArray.length >1)
			finalRecipient=finalRecipientArray[1].replace(this.regExpCache.trim, "");

		var newDeliveredTo=this.addDeliveredTo(finalRecipient,0);

		var result=false;
		if (newDeliveredTo) {
			newDeliveredTo.dsnList.push(new dsnProperty (actionValue,messageId));
			result=true;
		}

		// refresh data
		this.calculateAllProperties();

		return result;
	},

	/**
		Change properties with the {@link mdnReport} object
		@param {mdnReport} report a {@link mdnReport} object
		@param {string} messageId  message-id of notification
		@return {boolean} <b>false</b> if an error occured
	*/
	addMdnReport: function(report,messageId) {
		// check type
		if (typeof(report)!="object") return false;
		if (!report instanceof mdnReport) return false;

		var finalRecipient=report.finalRecipient;
		var dispositionType=report.dispositionType;

		if (! this.regExpCache.validAddr.test(messageId)) return false;
		if (! this.regExpCache.validMdnReport.test(dispositionType)) return false;

		// get address from final-recipient fields (see RFC3464)
		// final-recipient-field = 
		//        address-type ";" generic-address
		// example: rfc822;louisl@larry.slip.umd.edu
		var finalRecipientArray=finalRecipient.split(";");

		if (finalRecipientArray.length >1)
			finalRecipient=finalRecipientArray[1].replace(this.regExpCache.trim, "");

		var newDeliveredTo=this.addDeliveredTo(finalRecipient,0);

		var result=false;
		if (newDeliveredTo) {
			newDeliveredTo.mdnList.push(new mdnProperty (dispositionType,messageId));
			result=true;
		}

		// refresh data
		this.calculateAllProperties();

		return result;
	},



	/**
		define all properties
		@private
	*/
		
	calculateAllProperties: function() {
		var numFailed=0;
		var numRelayed=0;
		var numDelivered=0;
		var numDisplayed=0;
		var numDeleted=0;
		var numTimeOut=0;
		var total=this.deliveredToArray.length;
		var numFinalDsn=0;
		var dsnPresent=false;

		for (var i =0 ; i < this.deliveredToArray.length ; i++ ) {

			// flags
			if (this.deliveredToArray[i].flags & this.deliveredToArray[i].FLAG_TIMEOUT)
				numTimeOut+=1;

			// DSN
			var isFailed=false;
			var isRelayed=false;
			var isDelivered=false;
			var isDelayed=false;
			for (var j=0; j < this.deliveredToArray[i].dsnList.length ; j++) {
				// summary
				var actionValue=this.deliveredToArray[i].dsnList[j].actionValue;
				if ( (actionValue == "delivered") || (actionValue=="expanded")) isDelivered=true;
				else if (actionValue == "failed") isFailed=true;
				else if (actionValue == "relayed") isRelayed=true;
				else if (actionValue == "delayed") isDelayed=true;
			}

			if (isFailed || isRelayed || isDelivered) numFinalDsn+=1; // all DSN received for this recipient
			if (isFailed || isRelayed || isDelivered || isDelayed) dsnPresent=true;
			if (isFailed) numFailed+=1;
			if (isRelayed) numRelayed+=1;
			if (isDelivered) numDelivered+=1;

			// MDN
			var isDisplayed=false;
			var isDeleted=false;
			for (var j=0; j < this.deliveredToArray[i].mdnList.length ; j++) {
				var dispositionType=this.deliveredToArray[i].mdnList[j].dispositionType;
				if (dispositionType == "displayed") isDisplayed=true;
				else if (dispositionType == "deleted") isDeleted=true;
			}
			if (isDisplayed) numDisplayed+=1;
			if (isDeleted) numDeleted+=1;
		}

		// define flags
		if (numTimeOut!=0)
			this.flagsProperty=(this.flagsProperty & 0xE)+this.FLAG_TIMEOUT; //UNDO not possible

		this.flagsProperty=(this.flagsProperty & 0x1)+this.FLAG_VERSION; // current version

		// define status
		if (numFailed!=0)
			this.statusProperty="bad";
		else if (numRelayed!=0)
			this.statusProperty="middle";
		else if (total == numDelivered)
			this.statusProperty="good";
		else this.statusProperty="";

		// define summary
		if (dsnPresent) this.dsnSummaryProperty= numDelivered+"/"+total;
		if (numDisplayed!=0) this.mdnDisplayedSummaryProperty= numDisplayed+"/"+total;
		if (numDeleted!=0) this.mdnDeletedSummaryProperty= numDeleted+"/"+total;

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
			for (var j=0; j < this.deliveredToArray[i].dsnList.length ; j++) {
				// expired if <> failed, relayed, delivered, or expanded
				if ((/delivered|relayed|failed|expanded/i).test(this.deliveredToArray[i].dsnList[j].actionValue)) {
					expire=false;
					break;
				}
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
		@return {string} Return x-nviewer-to property
	*/
	getDeliveredToProperty: function() {
		var Values="";
		for (var i=0 ; i < this.deliveredToArray.length ; i++ ) {
			var myDeliveryTo=this.deliveredToArray[i];
			if (i>0) Values+="\n\t";
			Values+=myDeliveryTo.finalRecipient+";"+myDeliveryTo.flags;

			// DSN count
			Values+=";"+myDeliveryTo.dsnList.length;

			// now, add DSNs
			for (var j=0; j < myDeliveryTo.dsnList.length ; j++) {
				Values+=";"+myDeliveryTo.dsnList[j].actionValue+";"+myDeliveryTo.dsnList[j].messageId;
			}

			// MDN count
			Values+=";"+myDeliveryTo.mdnList.length;

			// now, add MDNs
			for (var j=0; j < myDeliveryTo.mdnList.length ; j++) {
				Values+=";"+myDeliveryTo.mdnList[j].dispositionType+";"+myDeliveryTo.mdnList[j].messageId;
			}
		}
		this.deliveredToProperty=Values;
		return this.deliveredToProperty;
	},

	/**
		@return {string} Return x-nviewer-status property ("good" ,"bad" , "middle" or "")
	*/
	getStatusProperty: function() {
		return this.statusProperty;
	},

	/**
		@return {string} Return x-nviewer-dsn-summary property (number/total)
	*/
	getDsnSummaryProperty: function() {
		return this.dsnSummaryProperty;
	},

	/**
		@return {string} Return x-nviewer-flags property
	*/
	getFlagsProperty: function() {
		return (this.flagsProperty).toString();
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
		var txt="\n\n";
		txt+="Status:      "+this.statusProperty+"\n";
		txt+="Flags:       "+this.flagsProperty+"\n";
		txt+="DSN Summary: "+this.dsnSummaryProperty+"\n";
		for (var i=0 ; i < this.deliveredToArray.length ; i++ ) {
			txt+="\n";
			txt+="   finalRecipient: "+this.deliveredToArray[i].finalRecipient+"\n";
			txt+="   flags:          "+this.deliveredToArray[i].flags+"\n";
			txt+="   DSN Count:      "+this.deliveredToArray[i].dsnList.length+"\n";
			for (var j=0; j < this.deliveredToArray[i].dsnList.length ; j++) {
				txt+="       actionValue:     "+this.deliveredToArray[i].dsnList[j].actionValue+"\n";
				txt+="       messageId:       "+this.deliveredToArray[i].dsnList[j].messageId+"\n";
			}
			txt+="   MDN Count:      "+this.deliveredToArray[i].mdnList.length+"\n";
			for (var j=0; j < this.deliveredToArray[i].mdnList.length ; j++) {
				txt+="       dispositionType: "+this.deliveredToArray[i].mdnList[j].dispositionType+"\n";
				txt+="       messageId:       "+this.deliveredToArray[i].mdnList[j].messageId+"\n";
			}
		}
		txt+="\n";
		txt+="MDN displayed Summary: "+this.mdnDisplayedSummaryProperty+"\n";
		txt+="MDN deleted Summary:   "+this.mdnDeletedSummaryProperty+"\n";
		txt+="\n\n";
		return txt;
	}
}


