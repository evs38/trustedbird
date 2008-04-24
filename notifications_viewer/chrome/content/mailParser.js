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
	Library for parsing messages
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/




/**
	@class This Class is a mail Parser
	@version 0.9.3
	@author Daniel Rocher / Etat francais Ministere de la Defense
	@constructor
	@param {string} message message source
*/
function mailParser(message) {
	/**
		message source
		@type string
	*/
	this.message=message;
}

mailParser.prototype = {
	/**
		regular expressions cache
	*/
	regExpCache : {
		removeEOL: new RegExp('\\n','g'),
		removeCR: new RegExp('\\r','g'),
		findBoundary: new RegExp("boundary=\"([^\"]+)\"","ig"),
		trim: new RegExp("(?:^\\s*)|(?:\\s*$)","g")
	},

	/**
		this property holds parts for this message
		<p>
		Access functions:
		<ul>
			<li>{@link #getParts}
		</ul>
		 @type Array
	*/

	cacheParts : null,
	/**
		this property holds headers for this message
		<p>
		Access functions:
		<ul>
			<li>{@link #getHeaders}
		</ul>
		@type string
	*/

	cacheHeaders : null,
	/**
		this property holds body for this message
		<p>
		Access functions:
		<ul>
			<li>{@link #getBody}
		</ul>
		@type string
	*/
	cacheBody : null,


	/**
		this property holds message-id for this message
		<p>
		Access functions:
		<ul>
			<li>{@link #getMsgId}
		</ul>
		@type string
		
	*/
	cacheMsgId : null,

	/**
		Get headers for this message
		@return {string} return headers for this message
	*/
	getHeaders: function() {
		if (this.cacheHeaders!=null)
			return this.cacheHeaders;

		this.cacheHeaders="";
		this.cacheBody="";
		// remove CR
		this.message=(this.message).replace(this.regExpCache.removeCR, "");

		// the  body  is separated from the headers by a null line (RFC 822)
		var separator="\n\n";
		var Index=(this.message).indexOf(separator);
		if (Index!= -1)
		{
			this.cacheHeaders=(this.message).substring(0,Index);
			this.cacheBody=(this.message).substring(Index+separator.length);
		}
		return this.cacheHeaders;
	},

	/**
		Get body for this message
		@return {string} return body for this message
	*/
	getBody: function() {
		if (this.cacheBody!=null)
			return this.cacheBody;
		// use getHeaders to get body
		this.getHeaders();
		return this.cacheBody;
	},


	/**
		Get message-id for this message.
		@return {string} return message-id for this message
		<p>
		In order to conform to RFC 822, the Message-ID must have the format
		<pre>"<" "unique" "&#64;" "full domain name" ">"</pre>
		<p>
		Example: <Pre>&#60;20080213131118.4DD991FF88&#64;mydomain.org&#62;</pre>
	*/
	getMsgId: function() {
		if (this.cacheMsgId!=null)
			return this.cacheMsgId;
		this.cacheMsgId=this.getValueFromField("Message-id",this.getHeaders());
		return this.cacheMsgId;
	},


	/**
		Get parts for this message (see multipart rfc2046)
		@return {array} return parts or null if there is not
	*/
	getParts: function() {
		// return cache if initialised
		if (this.cacheParts!=null)
			return this.cacheParts;

		this.cacheParts=new Array();

		// get boundary
		this.regExpCache.findBoundary.lastIndex = 0;
		var boundary=(this.regExpCache.findBoundary).exec(this.getHeaders());

		if ((boundary!=null) && (boundary.length>1)) {
			boundary=boundary[1];
		}
		else
			return new Array(); // no part

		// get part(s)

		var begin = (this.getBody()).indexOf("--"+boundary);

		var myArray = new Array();
		while (begin != -1) {
			myArray.push(begin);
			begin = (this.getBody()).indexOf("--"+boundary,++begin);
		}

		// add metacharacter \ (backslash) escape keys
		var boundaryExpReg=escapeRegExp(boundary);

		// extract parts
		var partExpReg=new RegExp(boundaryExpReg+"\\n((.*|\\n)*)","ig");
		for (var i=0 ; i < (myArray.length)-1 ; i++)
		{
			var beg=myArray[i];
			var end=myArray[i+1];
			partExpReg.lastIndex = 0;
			var part=partExpReg.exec((this.getBody()).substring(beg,end));

			if ((part!=null) && (part.length>1)) {
				if (part[1].length>0) this.cacheParts.push(part[1]);
			}
		}
		return this.cacheParts;
	},

	/**
		find field from a string and return his value
		@param {string} tField field to find
		<p>
		example:<pre>"content-type"</Pre>
		@param {string} tData data to parse
		@return {string} value for this field
		<p>
		example:<pre>"multipart/report"</pre>
	*/
	getValueFromField : function(tField,tData) {

		// add metacharacter \ (backslash) escape keys
		tField=escapeRegExp(tField);
		tData+="\n";
		var regexp=new RegExp(tField+":(.*(?:\\n[ \\t].*){0,2}\\n)","ig");
		regexp.lastIndex = 0;
		var Value=regexp.exec(tData);
		if ((Value!=null) && (Value.length>1))
			Value=Value[1].replace(this.regExpCache.trim, "");
		else
			Value="";
		return Value;
	}
}



