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
 *   Olivier Brun BT Global Services / Etat francais Ministere de la Defense
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
 * @fileoverview misc methods
 * @author Daniel Rocher / Etat francais Ministere de la Defense
 * @author Olivier Brun / Etat francais Ministere de la Defense
 */

/*
 * Constructor of the sieve common class Overload toString method in each class
 * to return the class name
 */
function SieveCommon() 
{
	globalServices.logSrv(this.toString()+ "constructor.");
}


/**
 * @class Services for this plugin
 * @constructor
 * @author Daniel Rocher / Etat francais Ministere de la Defense
 */
function Services() {
	/** @type string */
	this.extensionName="out_of_office";
	/** @type string */
	this.extensionNameDisplayable="Out Of Office extension";
	/** @type string */
	this.extensionKey="extensions."+this.extensionName+".";
	/**
	 * define current version for this extension
	 * 
	 * @type string
	 */
	this.extensionVersion="0.0.5";
	/**
	 * preferences
	 * 
	 * @type Preferences
	 */
	this.preferences=new Preferences();
	/**
	 * set debug mode
	 * 
	 * @type boolean
	 */
	this.modeDebug=this.preferences.getBoolPref(this.getExtensionKey()+"debug");
	/** @type nsIConsoleService */
	this.consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
}

Services.prototype = {
	
	/**
	 * Retrieve the extension name definition.
	 * 
	 * @return (string) The extension name.
	 */
	getExtensionName : function()
	{
		return this.extensionName;
	},

	/**
	 * Retrieve the displayable pretty extension name definition.
	 * 
	 * @return (string) The pretty extension name.
	 */
	getExtensionNameDisplayable : function()
	{
		return this.extensionNameDisplayable;
	},
	
	/**
	 * Retrieve the extension key to access to preference definition.
	 * 
	 * @return (string) The extension key. The string is terminated by dot.
	 */
	getExtensionKey : function()
	{
		return this.extensionKey;
	},

	/**
	 * log message to console (only if debug mode is enabled)
	 * 
	 * @param (string)
	 *            msg Message to log
	 */
	logSrv : function( msg )
	{
		if (!this.modeDebug) return;
		this.consoleService.logStringMessage(this.extensionName+" : "+msg);
		dump(this.extensionName+":..:"+this.currentDate()+": "+msg+"\n");
	},

	/**
	 * reports error to console
	 * 
	 * @param (string)
	 *            err error to report
	 */
	errorSrv : function(err) {
		var scriptError = Components.classes["@mozilla.org/scripterror;1"].createInstance(Components.interfaces.nsIScriptError);
		scriptError.init(this.extensionName+" : "+err, "", "", 0,0,0,0);
		this.consoleService.logMessage(scriptError);
		dump(this.extensionName+":EE:"+this.currentDate()+": "+err+"\n");
	},

	/**
	 * reports warning to console
	 * 
	 * @param (string)
	 *            msg warning to report
	 */
	warningSrv: function(msg)
	{
		var scriptWarning = Components.classes["@mozilla.org/scripterror;1"].createInstance(Components.interfaces.nsIScriptError);
		scriptWarning.init(this.extensionName+" : "+msg, "", "", 0,0,1,0);
		this.consoleService.logMessage(scriptWarning);
		dump(this.extensionName+":WW:"+this.currentDate()+": "+msg+"\n");
	},

	/**
	 * return current date
	 * 
	 * @return {string} current date
	 */
	currentDate: function ()
	{
		date=new Date();
		return date.toGMTString();
	},
	
	/**
	 * Select the text that have generate the error and set the focus to the
	 * control of User Interface define by his ID.
	 * 
	 * @param (string)
	 *            Label of the UI control id.
	 *            
	 * @author Olivier Brun / BT France
	 */
	setFocusCtrlID : function( ctrlID )
	{
		document.getElementById(ctrlID).setSelectionRange( 0 , document.getElementById(ctrlID).textLength );
		document.getElementById(ctrlID).focus();
	},
	
	/**
	 * Show or hide the User Interface control.
	 * 
	 * @param (string)
	 *            ctrlID Label of the UI control id.
	 * @param (boolean)
	 *            enabled Enabled or disabled (true/false)
	 *            
	 * @author Olivier Brun / BT France
	 */
	showCtrlID : function( ctrlID, enabled )
	{
		if (enabled)
			document.getElementById(ctrlID).removeAttribute('hidden');
		else
			document.getElementById(ctrlID).setAttribute('hidden','true'); 
	},
	
	/**
	 * Enable or disable the User Interface.
	 * 
	 * @param (string)
	 *            Label of the UI control id.
	 * @param (boolean)
	 *            Enabled or disabled (true/false)
	 *            
	 * @author Olivier Brun / BT France
	 */
	enableCtrlID : function( ctrlID, enabled )
	{
		if (enabled)
			document.getElementById(ctrlID).removeAttribute('disabled');
		else
			document.getElementById(ctrlID).setAttribute('disabled','true'); 
	},
	
	/**
	 * Retrieve the User Interface label of the control.
	 * 
	 * @param (string)
	 *            Label of the UI control id.
	 * @return (string) Label of the control as a string.
	 *            
	 * @author Olivier Brun / BT France
	 */
	getStringLabel : function( ctrlID )
	{
		label = document.getElementById(ctrlID).label;
		if( label != undefined ){
			return label;
		}
		return this.getStringValue(ctrlID);
	},
	
	/**
	 * Retrieve the User Interface value from control.
	 * 
	 * @param (string)
	 *            Label of the UI control id.
	 * @return (string) Value of the control as a string.
	 *            
	 * @author Olivier Brun / BT France
	 */
	getStringValue : function( ctrlID )
	{
		return document.getElementById(ctrlID).value;
	},
	
	/**
	 * Retrieve the User Interface value from control.
	 * 
	 * @param (string)
	 *            Label of the UI control id.
	 * @return (boolean) Value of the control false/true.
	 *            
	 * @author Olivier Brun / BT France
	 */
	getBooleanValue : function( ctrlID )
	{
		return document.getElementById(ctrlID).checked;
	},
	
	
	/**
	 * Set string value to the control of the User Interface.
	 * 
	 * @param (string)
	 *            Label of the UI control id.
	 * @param (string)
	 *            Value to set to the control as a string.
	 *            
	 * @author Olivier Brun / BT France
	 */
	setStringValue : function( ctrlID, value )
	{
		document.getElementById(ctrlID).value = value;
	},
	
	/**
	 * Set string label to the control of the User Interface.
	 * 
	 * @param (string)
	 *            Label of the UI control id.
	 * @param (string)
	 *            label to set to the control as a string.
	 *            
	 * @author Olivier Brun / BT France
	 */
	setStringLabel : function( ctrlID, label )
	{
		document.getElementById(ctrlID).label = label;
	},
	
	/**
	 * Set boolean value to the control of the User Interface.
	 * 
	 * @param (string)
	 *            Label of the UI control id.
	 * @param (boolean)
	 *            Value to set to the control false/true.
	 */
	setBooleanValue : function( ctrlID, value )
	{
		document.getElementById(ctrlID).checked = value;
	},
	
	
	/**
	 * Localize stringBundle. This function can be insert dynamically parameters
	 * in the string. The user that define the localized string insert tag as
	 * %1, %2 ... The function parse the string and insert each value from the
	 * third parameter arrayValue. If the value is not define the value take the
	 * value undefined. If the array is too small the value stay the tag %7 for
	 * example. If the array is too big nothing append.
	 * 
	 * @param (string)
	 *            localeFileName String bundle label id.
	 * @param (string)
	 *            message String id define in the stringBundle file
	 * @param (array)
	 *            arrayValue Array of the value to replace in string. Value in
	 *            string are defined with tag %x where x is the value index.
	 * @return (string) Localized string message to use by the caller.
	 *            
	 * @author Olivier Brun / BT France
	 */
	localizeString : function( localeFileName, message, arrayValue )
	{
		if( message == undefined || message == null ){
			throw new Exception("localizeString: message cannot be null.");
		}
		/*
		 * Check if the localization requested and the string are valid
		 */
		if( localeFileName == undefined || localeFileName == null ){ // Use default file
			localeFileName = "out_of_office_locale.properties";
		}
		if( message.length < 3 || message[0] != '&' || message[message.length-1] != ';' ){
			return message; // Syntax error id of string to localize must be &<id>;
		}
		
		/*
		 * localization is requested
		 */
        // Initialize the string bundle resource
		
		var stringBundleService = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
    	out_of_office_stringBundle = stringBundleService.createBundle("chrome://out_of_office/locale/" + localeFileName );
	
	    message = message.substring(1,message.length-1);
        try {
        	message = out_of_office_stringBundle.GetStringFromName(message);
        } catch (e){
        	this.errorSrv(e);
        	this.errorSrv( "Exception, unable to get string '" + message + "', it will displayed instead of the localize string.");
        }

	    // Check variables array to replace in string
	    if( arrayValue == undefined || arrayValue == null || arrayValue.length <= 0 )
	    	return message; // No value to replace
	    
        // Replace variables in string
	    for(var count = 0; count < arrayValue.length; count++ ){
			var reg = new RegExp("%"+(count+1), "g");	
			message = message.replace(reg, arrayValue.shift() );
	    }
		return message;
	},
	
	/**
	 * Check the validity of the mail address.
	 * 
	 * @param (string)
	 *            email mail address to be check.
	 * @param (boolean)
	 *            log Indicate if the log message will be displayed in the
	 *            console
	 * @return (boolean) result of the validity false/true.
	 *            
	 * @author Olivier Brun / BT France
	 */
	isAddressMailValid : function( email, log )
	{
		if( log == undefined ){
			log = false;
		}
		if( email == null || email == "" ){
			if( log == true ) {
				this.warningSrv( "The Email Address is null or emty.");
			}
			return false;
		}
		if( emailCheckNew(email) == false ){
			if( log == true ) { 
				this.warningSrv( "The Email Address is invalid (" + email + ")."); 
			}
			return false; 
		}
		return true; 
	},

	
	/**
	 * Check the validity of the message for notification. TODO No restriction
	 * at this time for the message.
	 * 
	 * @param (string)
	 *            notification message to be check.
	 * @param (boolean)
	 *            log Indicate if the log message will be displayed in the
	 *            console
	 * @return (boolean) result of the validity false/true.
	 *            
	 * @author Olivier Brun / BT France
	 */
	isNotificationMessageValid : function( notification, log )
	{
		if( log == undefined ){
			log = false;
		}
		if( notification == null ){
			if( log == true ) {
				this.warningSrv( "The notification message is null.");
			}
			return false;
		}
		// TODO Add restriction notification message when they will defined

		return true;
	},
	
	/**
	 * Set field in red color to indicate an error to the user.
	 * 
	 * @param (string)
	 *            Label of the UI control id.
	 * @param (boolean)
	 *            True if the field has an error.
	 *            
	 * @author Olivier Brun / BT France
	 */
	displayFieldOnError : function( ctrlID, error )
	{
		if (error == true ) {
			document.getElementById(ctrlID).setAttribute("style", "color:red; font-weight:bold;");
		} else {
			document.getElementById(ctrlID).removeAttribute("style");
		}
	},
	
}


function emailCheck2 (emailStr) {
var reg = /^((\"[^\"\f\n\r\t\v\b]+\")|([\w\!\#\$\%\&\'\*\+\-\~\/\^\`\|\{\}]+(\.[\w\!\#\$\%\&\'\*\+\-\~\/\^\`\|\{\}]+)*))@((\[(((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9])))\])|(((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9])))|((([A-Za-z0-9\-])+\.)+[A-Za-z\-]+))$/
	if(reg.test(emailStr) == false) {
		return false;
	}
	return true;
}

/*
 * 
<!-- Original author:  Sandeep V. Tamhankar (stamhankar@hotmail.com) -->
<!-- Code source from http://www.siliconglen.com/software/e-mail-validation.html
<!-- old Source on http://www.jsmadeeasy.com/javascripts/Forms/Email%20Address%20Validation/template.htm -->

<!-- The above address bounces and no current valid address  -->
<!-- can be found. This version has changes by Craig Cockburn -->
<!-- to accommodate top level domains .museum and .name      -->
<!-- plus various other minor corrections and changes -->
*/
/* 1.1.3: Amended error messages and allowed script to deal with new TLDs
   1.1.2: Fixed a bug where trailing . in e-mail address was passing
            (the bug is actually in the weak regexp engine of the browser; I
            simplified the regexps to make it work).
   1.1.1: Removed restriction that countries must be preceded by a domain,
            so abc@host.uk is now legal.  
     1.1: Rewrote most of the function to conform more closely to RFC 822.
     1.0: Original  */

// <!-- Begin
function emailCheck (emailStr) {
	/* The following pattern is used to check if the entered e-mail address
	 * fits the user@domain format.  It also is used to separate the username
	 * from the domain.
	 */
	var emailPat=/^(.+)@(.+)$/
	/*
	 * The following string represents the pattern for matching all special
	 * characters.  We don't want to allow special characters in the address. 
	 * These characters include ( ) < @ , ; : \ " . [ ]
	 */
	var specialChars="\\(\\)<>@,;:\\\\\\\"\\.\\[\\]";
	/*
	 * The following string represents the range of characters allowed in a 
	 * username or domainname.  It really states which chars aren't allowed.
	 */
	var validChars="\[^\\s" + specialChars + "\]";
	/*
	 * The following pattern applies if the "user" is a quoted string (in
	 * which case, there are no rules about which characters are allowed
	 * and which aren't; anything goes).  E.g. "jiminy cricket"@disney.com
	 * is a legal e-mail address.
	 */
	var quotedUser="(\"[^\"]*\")";
	/*
	 * The following pattern applies for domains that are IP addresses,
	 * rather than symbolic names.  E.g. joe@[123.124.233.4] is a legal
	 * e-mail address. NOTE: The square brackets are required.
	 */
	var ipDomainPat=/^\[(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\]$/
	/*
	 * The following string represents an atom (basically a series of non-special characters.) 
	 */
	var atom=validChars + '+';
	/*
	 * The following string represents one word in the typical username.
	 * For example, in john.doe@somewhere.com, john and doe are words.
	 * Basically, a word is either an atom or quoted string. 
	 */
	var word="(" + atom + "|" + quotedUser + ")"
	// The following pattern describes the structure of the user
	var userPat=new RegExp("^" + word + "(\\." + word + ")*$")
	/*
	 * The following pattern describes the structure of a normal symbolic
	 * domain, as opposed to ipDomainPat, shown above.
	 */
	var domainPat=new RegExp("^" + atom + "(\\." + atom +")*$")


	/*
	 * Finally, let's start trying to figure out if the supplied address is valid.
	 */

	/*
	 * Begin with the coarse pattern to simply break up user@domain into
	 * different pieces that are easy to analyze.
	 */
	var matchArray=emailStr.match(emailPat)
	if (matchArray==null) {
		/* 
		 * Too many/few @'s or something; basically, this address doesn't
		 * even fit the general mould of a valid e-mail address.
		 */
		globalServices.warningSrv("Email address seems incorrect (check @ and .'s)");
		return false;
	}
	var user=matchArray[1];
	var domain=matchArray[2];
	globalServices.logSrv("user='" + user + "' userPat='" + userPat +"'");

	// See if "user" is valid 
	if (user.match(userPat)==null) {
		// user is not valid
		globalServices.warningSrv("The part of your email address before the '@' doesn't seem to be valid.");
		return false;
	}

	/* 
	 * if the e-mail address is at an IP address (as opposed to a symbolic
	 * host name) make sure the IP address is valid. 
	 */
	var IPArray=domain.match(ipDomainPat);
	globalServices.logSrv("domain='" + domain +"' ipDomainPat" + ipDomainPat + "'");
	if (IPArray!=null) {
		// this is an IP address
		for (var i=1;i<=4;i++) {
			if (IPArray[i]>255) {
				globalServices.warningSrv("Destination IP address is invalid!");
				return false;
			}
		}
		return true;
	}

	// Domain is symbolic name
	var domainArray=domain.match(domainPat)
	globalServices.logSrv("domain='" + domain +"' domainPat" + domainPat + "'");
	if (domainArray==null) {
		globalServices.warningSrv("Part of your email address after the '@' doesn't seem to be valid");
		return false;
	}

	/* 
	 * domain name seems valid, but now make sure that it ends in a
	 * three-letter word (like com, edu, gov) or a two-letter word,
	 * representing country (uk, nl), and that there's a hostname preceding
	 * the domain or country. 
	 */

	/*
	 * Now we need to break up the domain to get a count of how many atoms
	 * it consists of. 
	 */
	var atomPat=new RegExp(atom,"g");
	var domArr=domain.match(atomPat);
	var len=domArr.length;
	if (domArr[domArr.length-1].length<2 || 
		domArr[domArr.length-1].length>6) {
		// the address must end in a two letter or other TLD including museum
		globalServices.warningSrv("The address must end in a top level domain (e.g. .com), or two letter country.");
		return false;
	}

	// Make sure there's a host name preceding the domain.
	if (len<2) {
		var errStr="This address is missing a hostname!";
		globalServices.warningSrv(errStr);
		return false;
	}

	// If we've got this far, everything's valid!
	return true;
}
//  End -->

//<!-- Begin
function emailCheckNew(emailStr) {
	/* The following pattern is used to check if the entered e-mail address
	 * fits the user@domain format.  It also is used to separate the username
	 * from the domain.
	 */
	var emailPat=/^(.+)@(.+)$/

	/* TODO TEST The following pattern is used to check if the entered e-mail address
	 * fits the user@domain format.  It also is used to separate the username
	 * from the domain.
	 */
	var displayNameAddressPat=/^(.+) <(.+)@(.+)>$/

	/*
	 * The following string represents the pattern for matching all special
	 * characters.  We don't want to allow special characters in the address. 
	 * These characters include ( ) < @ , ; : \ " . [ ]
	 */
	var specialChars="\\(\\)<>@,;:\\\\\\\"\\.\\[\\]";
	/*
	 * The following string represents the range of characters allowed in a 
	 * username or domainname.  It really states which chars aren't allowed.
	 */
	var validChars="\[^\\s" + specialChars + "\]";
	/*
	 * The following pattern applies if the "user" is a quoted string (in
	 * which case, there are no rules about which characters are allowed
	 * and which aren't; anything goes).  E.g. "jiminy cricket"@disney.com
	 * is a legal e-mail address.
	 */
	var quotedUser="(\"[^\"]*\")";
	/*
	 * The following pattern applies for domains that are IP addresses,
	 * rather than symbolic names.  E.g. joe@[123.124.233.4] is a legal
	 * e-mail address. NOTE: The square brackets are required.
	 */
	var ipDomainPat=/^\[(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\]$/
	/*
	 * The following string represents an atom (basically a series of non-special characters.) 
	 */
	var atom=validChars + '+';
	/*
	 * The following string represents one word in the typical username.
	 * For example, in john.doe@somewhere.com, john and doe are words.
	 * Basically, a word is either an atom or quoted string. 
	 */
	var word="(" + atom + "|" + quotedUser + ")"
	// The following pattern describes the structure of the user
	var userPat=new RegExp("^" + word + "(\\." + word + ")*$")
	/*
	 * The following pattern describes the structure of a normal symbolic
	 * domain, as opposed to ipDomainPat, shown above.
	 */
	var domainPat=new RegExp("^" + atom + "(\\." + atom +")*$")


	/*
	 * Finally, let's start trying to figure out if the supplied address is valid.
	 */
        
	/*
	 * Begin with the coarse pattern to break up 'DisplayName <user@domain>' into
	 * different pieces that are easy to analyze.
	 */
	var value = 4;
	var matchArray=emailStr.match(displayNameAddressPat)
	if (matchArray==null) {
		--value; // No display name will extract
		/* 
		 * Email address haven't a display name then check the address part alone
		 * Too many/few @'s or something; basically, this address doesn't
		 * even fit the general mould of a valid e-mail address.
		 */

		/*
		 * Begin with the coarse pattern to simply break up 'user@domain' into
		 * different pieces that are easy to analyze.
		 */
		matchArray=emailStr.match(emailPat)
		if (matchArray==null) {
		/* 
		 * Too many/few @'s or something; basically, this address doesn't
		 * even fit the general mould of a valid e-mail address.
		 */
			globalServices.warningSrv("Email address seems incorrect (check @ and .'s)");
			return false;
	    }
	}

	// dumpArray( matchArray );
	var displayName="";
	if( matchArray.length > 3 ){ // Update the display name value
		displayName = matchArray[matchArray.length - 3];
	}
	if( matchArray.length < 3 ){
		return false; // Not enought parameter in the array then the mail address is not correct.
	}
	var user=matchArray[matchArray.length - 2];
	var domain=matchArray[matchArray.length - 1];
//	globalServices.logSrv("user='" + user + "' emailPat='" + emailPat+"'");
//	globalServices.logSrv("domain='" + domain);

	// See if "user" is valid 
	if (user.match(userPat)==null) {
		// user is not valid
		globalServices.warningSrv("The part of your email address before the '@' doesn't seem to be valid.");
		return false;
	}

	/* 
	 * if the e-mail address is at an IP address (as opposed to a symbolic
	 * host name) make sure the IP address is valid. 
	 */
	var IPArray=domain.match(ipDomainPat);
	globalServices.logSrv("domain='" + domain +"' ipDomainPat" + ipDomainPat + "'");
	if (IPArray!=null) {
		// this is an IP address
		for (var i=1;i<=4;i++) {
			if (IPArray[i]>255) {
				globalServices.warningSrv("Destination IP address is invalid!");
				return false;
			}
		}
		return true;
	}

	// Domain is symbolic name
	var domainArray=domain.match(domainPat)
	globalServices.logSrv("domain='" + domain +"' domainPat" + domainPat + "'");
	if (domainArray==null) {
		globalServices.warningSrv("Part of your email address after the '@' doesn't seem to be valid");
		return false;
	}

	/* 
	 * domain name seems valid, but now make sure that it ends in a
	 * three-letter word (like com, edu, gov) or a two-letter word,
	 * representing country (uk, nl), and that there's a hostname preceding
	 * the domain or country. 
	 */

	/*
	 * Now we need to break up the domain to get a count of how many atoms
	 * it consists of. 
	 */
	var atomPat=new RegExp(atom,"g");
	var domArr=domain.match(atomPat);
	var len=domArr.length;
	if (domArr[domArr.length-1].length<2 || 
		domArr[domArr.length-1].length>6) {
		// the address must end in a two letter or other TLD including museum
		globalServices.warningSrv("The address must end in a top level domain (e.g. .com), or two letter country.");
		return false;
	}

	// Make sure there's a host name preceding the domain.
	if (len<2) {
		var errStr="This address is missing a hostname!";
		globalServices.warningSrv(errStr);
		return false;
	}

	// If we've got this far, everything's valid!
	return true;
}
//  End -->

function dumpArray( dumpData )
{
	globalServices.logSrv( "DUMP ARRAY" );
	globalServices.logSrv( "ArrayLength=" + dumpData.length);
	for (var i = 0; i < dumpData.length; i++)
		globalServices.logSrv("var" + i + "=" + dumpData[i]);
	globalServices.logSrv( "ARRAY STOP" );
}

/*
var addrToTest = new Array ( "user3 <user3@test.milimail.org>", " <user3@test.milimail.org>", "<user3@test.milimail.org>", "user3@test.milimail.org", "c <user3@test.milimail.org>" );
var addrToTest = new Array ( "user3 <user3@test.milimail.org>", " <user3@test.milimail.org>", "<user3@test.milimail.org>", "user3@test.milimail.org", "c <user3@test.milimail.org>" );

print("Addr List=" + addrToTest.length );
for (var i = 0; i < addrToTest.length; i++)
{
    print("var" + i + "=" + addrToTest[i]);
    if( emailCheck ( addrToTest[i] ) == false )
        print("KO for >>>" + addrToTest[i]);
    else
        print("OK for >>>" + addrToTest[i]);
}
*/



/**
 * Encoding/Decoding tools
 *  
 * UTF-8 data encode / decode Function provide by http://www.webtoolkit.info/
 * 
 */

var Utf8 = {

	// public method for url encoding
	encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},

	// public method for url decoding
	decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while ( i < utftext.length ) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;
	}
}

/*******************************************************************************
 * place the metacharacter \ (backslash) in front of the metacharacter that we
 * want to use as a literal
 * 
 * @param {string}
 *            str a string
 * @return {string} str with escape keys
 * 
 */
function escapeRegExp(str) {
	var keys=["\\","$","^","-",".","[","]","{","}","?","*","+","(",")"];
	for (var i=0 ; i < keys.length ; i++)
	{
		var myExp=new RegExp("(\\"+keys[i]+"+)","g");
		str=str.replace(myExp,"\\"+keys[i]);
	}
	return str;
}

/**
 * Preferences Dialog Box
 * 
 * @author Daniel Rocher / Etat francais Ministere de la Defense
 */
var prefDialogBox = {
	services : null,

	/**
	 * Init Preferences Dialog Box
	 */
	initPrefDialog : function () {
		if (!this.services)
			this.services= new Services();
		document.getElementById("considerTimeout").checked = this.services.preferences.getBoolPref(this.services.getExtensionKey()+"enabled_timeout");
		document.getElementById("timeOut").value = this.services.preferences.getIntPref(this.services.getExtensionKey()+"timeout");
		this.enableTimeOut();
		document.getElementById("markRead").checked = this.services.preferences.getBoolPref(this.services.getExtensionKey()+"mark_notifications_as_read");
		document.getElementById("moveNotification").checked = this.services.preferences.getBoolPref(this.services.getExtensionKey()+"thread_on_original_message");
		document.getElementById("notificationsDisplayTextAndIcons").selectedIndex = (this.services.preferences.getIntPref(this.services.getExtensionKey()+"display_text_and_icons"))-1;
	},

	/**
	 * Save Preferences from Dialog Box
	 * 
	 * @return {boolean} <b>false</b> if an error occured
	 */
	savePrefs : function() {
		if (!this.services)
			this.services= new Services();

		var strbundle=document.getElementById("prefStr");

		var timeOutValue=parseInt(document.getElementById("timeOut").value);

		if (isNaN(timeOutValue) || timeOutValue<1 || timeOutValue>3600) {
			alert(strbundle.getString("invalidTimeOutValue"));
			return false;
		}

		this.services.preferences.setBoolPref(this.services.getExtensionKey()+"enabled_timeout",document.getElementById("considerTimeout").checked);
		this.services.preferences.setIntPref(this.services.getExtensionKey()+"timeout",timeOutValue);
		this.services.preferences.setBoolPref(this.services.getExtensionKey()+"mark_notifications_as_read",document.getElementById("markRead").checked);
		this.services.preferences.setBoolPref(this.services.getExtensionKey()+"thread_on_original_message",document.getElementById("moveNotification").checked);
		this.services.preferences.setIntPref(this.services.getExtensionKey()+"display_text_and_icons",(document.getElementById("notificationsDisplayTextAndIcons").selectedIndex)+1);
		return true;
	},

	/**
	 * Enable/disable TimeOut
	 */
	enableTimeOut : function() {
		document.getElementById("timeOut").disabled= !document.getElementById("considerTimeout").checked;
	}
}

/**
 * Move message
 * 
 * @param {nsIMsgDBHdr}
 *            msgHdr message to move
 * @param {nsIMsgFolder}
 *            dstFolder folder destination
 * @return {boolean} return <b>false</b> if an error occured
 */
function moveMessage (msgHdr, dstFolder) {

	var srcFolder=msgHdr.folder;

	// test if srcFolder and dstFolder are equals
	if (srcFolder==dstFolder) {
		globalServices.logSrv("moveMessage - source and target are equals. Exit");
		return true;
	}

	var messagesArray = Components.classes["@mozilla.org/supports-array;1"].createInstance(Components.interfaces.nsISupportsArray);

	messagesArray.AppendElement(msgHdr);

	globalServices.logSrv("moveMessage - from: '" + srcFolder.abbreviatedName + "' to '" + dstFolder.abbreviatedName + "': " + msgHdr.messageId);

	try {
		dstFolder.copyMessages(
			srcFolder,       // srcFolder
			messagesArray,   // nsISupportsArray
			true,            // isMove
			msgWindow,       // nsIMsgWindow
			null,            // nsIMsgCopyServiceListener
			false,           // isFolder
			true             // allowUndo
		);
	} catch (ex) {
		globalServices.errorSrv("moveMessage - Error moving messages from '" + srcFolder.abbreviatedName + "' to '" + dstFolder.abbreviatedName + "' - MsgId: " + msgHdr.messageId);
		return false;
	}

	return true;
}

