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
 *   BT Global Services / Etat francais Ministere de la Defense
 * Portions created by the Initial Developer are Copyright (C) 1998-2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Eric Ballet Baz BT Global Services / Etat francais Ministere de la Defense
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

const XSMTP_MESSAGE_KEY_VALUE_MANDATORY 			= "xsmtp.validator.value_mandatory";
const XSMTP_MESSAGE_KEY_VALUE_NOT_IN_ALLOWED_LIST 	= "xsmtp.validator.value_not_in_allowed_list";
const XSMTP_MESSAGE_KEY_VALUE_TOO_LONG 				= "xsmtp.validator.value_too_long";
const XSMTP_MESSAGE_KEY_INVALID_FORMAT 			 	= "xsmtp.validator.invalid_format";
const XSMTP_MESSAGE_KEY_INVALID_INTEGER 		 	= "xsmtp.validator.invalid_integer";
const XSMTP_MESSAGE_KEY_INVALID_DATE 			 	= "xsmtp.validator.invalid_date";
const XSMTP_MESSAGE_KEY_INVALID_EMAIL 			 	= "xsmtp.validator.invalid_email";
const XSMTP_MESSAGE_KEY_INVALID_PRINTABLE_STRING 	= "xsmtp.validator.invalid_printable_string";
const XSMTP_MESSAGE_KEY_UNKNOWN_HEADER 			 	= "xsmtp.validator.unknown_header";

function xsmtp_checkHeaderValueFormatAndAlert(header, field) {

    var errors = xsmtp_checkHeaderValueFormat(header, field.value);
    if (errors && errors.length > 0) {
        field.setAttribute("style", "color:red; font-weight:bold;");
    } else {
        field.removeAttribute("style");
    }
}

function xsmtp_checkCompoundHeaderValueFormatAndAlert(header, fieldpart1, fieldpart2) {

	var value = fieldpart1.value;
	if (fieldpart2.value) {
		value += " = " + fieldpart2.value
	}
    var errors = xsmtp_checkHeaderValueFormat(header, value);
    if (errors && errors.length > 0) {
        fieldpart1.setAttribute("style", "color:red; font-weight:bold;");
        fieldpart2.setAttribute("style", "color:red; font-weight:bold;");
    } else {
        fieldpart1.removeAttribute("style");
        fieldpart2.removeAttribute("style");        
    }
}

function xsmtp_checkAllHeadersValueFormat() {
	var errors = new Array(0);
	for (var i = 0; i < ALL_XSMTP_HEADERS.length; i++) {

		var value = "";
		if (ALL_XSMTP_HEADERS[i] == XSMTP_HEADER_X_P772_MESSAGE_TYPE) {
			value = document.getElementById(XSMTP_HEADER_X_P772_MESSAGE_TYPE + "1").value;
			if (document.getElementById(XSMTP_HEADER_X_P772_MESSAGE_TYPE + "2").value) {
				value += " = " + document.getElementById(XSMTP_HEADER_X_P772_MESSAGE_TYPE + "2").value;
			}
		} else {
		
			var field = document.getElementById(ALL_XSMTP_HEADERS[i]);
			if (field.tagName == 'listbox') {
				var selectedItems = field.selectedItems;
				for (var j = 0; j < selectedItems.length; j++) {
					value += (value) ? ";" : "";
					value += selectedItems[j].value;
				}
			} else {
				value = field.value;
			}
		}
		
		errors = errors.concat(xsmtp_checkHeaderValueFormat(ALL_XSMTP_HEADERS[i], value));
	}
	return errors;
}

function xsmtp_checkHeaderValueFormat(header, value) {
    var errors = new Array(0);
    
    switch (header) {
        case XSMTP_HEADER_X_P772_VERSION:
        case XSMTP_HEADER_X_P772_EXTENDED_GRADE_OF_DELIVERY:
        case XSMTP_HEADER_X_P772_ACP_NOTIFICATION_REQUEST:
        case XSMTP_HEADER_X_P772_ACP_NOTIFICATION_RESPONSE:
            errors = xsmtp_checkPrintableString(header, value);
            break;

        case XSMTP_HEADER_X_P772_PRIORITY_LEVEL_QUALIFIER:
            errors = xsmtp_checkLevel(header, value);
            break;

        case XSMTP_HEADER_X_P772_PRIMARY_PRECEDENCE:
        	errors = xsmtp_checkMandatory(header, value);
            errors = errors.concat(xsmtp_checkPriority(header, value));
            break;

        case XSMTP_HEADER_X_P772_COPY_PRECEDENCE:
            errors = xsmtp_checkPriority(header, value);
            break;

        case XSMTP_HEADER_X_P772_MESSAGE_TYPE:
            errors = xsmtp_checkMessageType(header, value);
            break;
            
        case XSMTP_HEADER_X_P772_EXEMPTED_ADDRESS:
        	errors = xsmtp_checkEmail(header, value);
            break;

        case XSMTP_HEADER_X_P772_EXTENDED_AUTHORISATION_INFO:
        	errors = xsmtp_checkMandatory(header, value);
            errors = errors.concat(xsmtp_checkDate(header, value));
            break;

        case XSMTP_HEADER_X_P772_DISTRIBUTION_CODES:
            errors = xsmtp_checkDistributionCodes(header, value);
            break;

        case XSMTP_HEADER_X_P772_MCA:
            errors = xsmtp_checkMCA(header, value);
            break;

        case XSMTP_HEADER_X_P772_HANDLING_INSTRUCTIONS:
        case XSMTP_HEADER_X_P772_MESSAGE_INSTRUCTIONS:
        case XSMTP_HEADER_X_P772_REFERENCE_INDICATION:
        case XSMTP_HEADER_X_P772_ACP_MESSAGE_IDENTIFIER:
        case XSMTP_HEADER_X_P772_ORIGINATOR_PLAD:
            errors = xsmtp_checkPrintableString(header, value);
            errors = errors.concat(xsmtp_checkMaxSize(header, value, 69));
            break;

        case XSMTP_HEADER_X_P772_ORIGINATOR_REFERENCE:
        	errors = xsmtp_checkMandatory(header, value);
            errors = errors.concat(xsmtp_checkPrintableString(header, value));
            errors = errors.concat(xsmtp_checkMaxSize(header, value, 69));
            break;

        case XSMTP_HEADER_X_P772_CODRESS_MESSAGE:
            errors = xsmtp_checkInteger(header, value);
            break;

        case XSMTP_HEADER_X_P772_OTHER_RECIPIENT_INDICATOR:
            errors = xsmtp_checkOtherRecipientIndicator(header, value);
            break;

        case XSMTP_HEADER_X_P772_ADDRESS_LIST_INDICATOR:
            errors = xsmtp_checkAddressListIndicator(header, value);
            break;

        case XSMTP_HEADER_X_P772_SECURITY_CLASSIFICATION:
            errors = xsmtp_checkMandatory(header, value);
            errors = errors.concat(xsmtp_checkSecurityClassification(header, value));
            break;

        case XSMTP_HEADER_X_P772_SPECIAL_HANDLING_INSTRUCTIONS:
        	errors = xsmtp_checkSpecialHandlingInstructions(header, value);
            break;

        default : errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_UNKNOWN_HEADER));
    }

    return errors;
}

function xsmtp_checkMandatory(header, value) {
	var errors = new Array();

    if (!value) {
        errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_VALUE_MANDATORY));
    }
    return errors;
}

function xsmtp_checkPrintableString(header, value) {
	var errors = new Array();

    if (value && !xsmtp_isPrintableString(value)) {
        errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_INVALID_PRINTABLE_STRING));
    }
    return errors;
}

function xsmtp_checkMaxSize(header, value, maxSize) {
	var errors = new Array();

    if (value && value.length > maxSize) {
		errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_VALUE_TOO_LONG));
    }
	return errors;
}

function xsmtp_checkEmail(header, value) {
	var errors = new Array();

    if (value && !xsmtp_isEmail(value)) {
		errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_INVALID_EMAIL));
    }
    return errors;
}

function xsmtp_checkDate(header, value) {
	var errors = new Array();

    if (value && !xsmtp_isDate(value)) {
		errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_INVALID_DATE));
    }
    return errors;
}

function xsmtp_checkInteger(header, value) {
	var errors = new Array();

    if (value && !xsmtp_isInteger(value)) {
		errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_INVALID_INTEGER));
    }
    return errors;
}

function xsmtp_checkLevel(header, value) {
	var errors = new Array();
	var allowedValues = ["low (0)", "high (1)"];
	
	if (value && allowedValues.indexOf(value) == -1) {
		errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_VALUE_NOT_IN_ALLOWED_LIST));
    }
    return errors;
}

function xsmtp_checkPriority(header, value) {
	var errors = new Array();
	var allowedValues = ["routine (1)", "priority (2)", "immediate (3)", "flash (4)"];

	if (value && allowedValues.indexOf(value) == -1) {
		errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_VALUE_NOT_IN_ALLOWED_LIST));
    }
    return errors;
}

function xsmtp_checkSecurityClassification(header, value) {
	var errors = new Array();
	var allowedValues = [
		"NON PROTEGE",
		"UNCLASSIFIED",
		"NATO UNCLASSIFIED",
		"DIFFUSION RESTREINTE",
		"RESTRICTED",
		"NATO RESTRICTED",
		"CONFIDENTIEL DEFENSE",
		"CONFIDENTIAL",
		"NATO CONFIDENTIAL",
		"SECRET DEFENSE",
		"SECRET",
		"NATO SECRET",
		"TOP SECRET",
		"COSMIC TOP SECRET"
	];

	if (value && allowedValues.indexOf(value) == -1) {
		errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_VALUE_NOT_IN_ALLOWED_LIST));
    }
    return errors;
}

function xsmtp_checkSpecialHandlingInstructions(header, value) {
	var errors = new Array();
	var allowedValues = [
		"TENEUR FNS",
		"RESERVE POUR",
		"ACSSI",
		"SPECIAL FRANCE",
		"SOURCE SECRETE",
		"CONFIDENTIEL MEDICAL",
		"CHIFFRE",
		"Sans objet"
	];

	if (value) {
		var specialHandlingInstructions = value.split(';');

		for (var i = 0; i < specialHandlingInstructions.length; i++) {
			if (allowedValues.indexOf(specialHandlingInstructions[i]) == -1 || specialHandlingInstructions[i].length < 1) {
				errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_VALUE_NOT_IN_ALLOWED_LIST));
				return errors;
		    }
		}
	}
    return errors;
}


function xsmtp_checkMessageType(header, value) {
	var errors = new Array();

	if (value) {
		// Start mandatory part
		var allowedStartValues = ["exercise (0)", "operation (1)", "project (2)", "drill (3)"];
		var isFound = false;
		for (var i = 0; i < allowedStartValues.length; i++) {
			if (value.indexOf(allowedStartValues[i]) == 0) {
				isFound = true;
				break;
			}
		}

		if (!isFound) {
			errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_VALUE_NOT_IN_ALLOWED_LIST));
			return errors;
		}

		// End part
		var index = value.indexOf(')');
		if (index != value.length - 1) {
			if (index + 4 >= value.length) {
				errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_INVALID_FORMAT));
				return errors;
			}

			if (value.substr(index + 1, 3) != " = ") {
				errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_INVALID_FORMAT));
				return errors;
			}

			if (!xsmtp_isPrintableString(value.substr(index + 4, value.length + 1))) {
				errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_INVALID_FORMAT));
				return errors;
		    }
		}
	}
	return errors;
}

function xsmtp_checkDistributionCodes(header, value) {
	var errors = new Array();

	if (value) {
		var distributionCodes = value.split(';');

		if (distributionCodes.length > 8 ) {
   		    errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_INVALID_FORMAT));
			return errors;
	    }

		for (var i = 0; i < distributionCodes.length; i++) {
			if (!xsmtp_isPrintableString(distributionCodes[i]) || distributionCodes[i].length < 3 || distributionCodes[i].length > 8 ) {
    		    errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_INVALID_FORMAT));
				return errors;
		    }
		}
	}
	return errors;
}

function xsmtp_checkMCA(header, value) {
	var errors = new Array();

	if (value) {
		var MCAs = value.split(';');

		if (MCAs.length > 4 ) {
   		    errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_INVALID_FORMAT));
			return errors;
	    }

		for (var i = 0; i < MCAs.length; i++) {
			if (!xsmtp_isPrintableString(MCAs[i]) || MCAs[i].length < 1 || MCAs[i].length > 20 ) {
    		    errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_INVALID_FORMAT));
				return errors;
		    }
		}
	}
	return errors;
}

function xsmtp_checkOtherRecipientIndicator(header, value) {
	var errors = new Array();

	if (value) {
		var otherRecipientIndicators = value.split(';');

		for (var i = 0; i < otherRecipientIndicators.length; i++) {
			if (!xsmtp_isPrintableString(otherRecipientIndicators[i]) || otherRecipientIndicators[i].length < 1 || otherRecipientIndicators[i].length > 69 ) {
    		    errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_INVALID_FORMAT));
				return errors;
		    }
		}
	}
	return errors;
}

function xsmtp_checkAddressListIndicator(header, value) {
	var errors = new Array();

	if (value) {
		var addressListIndicators = value.split(';');

		for (var i = 0; i < addressListIndicators.length; i++) {
			if (!xsmtp_isPrintableString(addressListIndicators[i]) || addressListIndicators[i].length < 1) {
    		    errors.push(xsmtp_buildError(header, XSMTP_MESSAGE_KEY_INVALID_FORMAT));
				return errors;
		    }
		}
	}
	return errors;
}

// Helper to build an error message
function xsmtp_buildError(header, errorKey) {
	return xsmtp_getMessageByKey(header + ".label") + ": " + xsmtp_getMessageByKey(errorKey);
}

// Helper to retrieve a message from the string bundle
function xsmtp_getMessageByKey(key) {
	var xsmtp_stringbundle = window.document.getElementById('xsmtp_stringbundle');
	return xsmtp_stringbundle.getString(key);
}

/*
 * Test if the argument is a PrintableString
 * The PrintableString type denotes an arbitrary string of 
 * printable characters from the following character set:
 *
 *   A, B, ..., Z
 *   a, b, ..., z
 *   0, 1, ..., 9
 *   (space) ' ( ) + , - . / : = ? 
 */
function xsmtp_isPrintableString(str) {
    var rgexp = /[^A-Za-z0-9 '()\+,\-\.\/:=\?]/;
    return !rgexp.test(str);
}

// Test if the argument is an email
// The email format used is the one from the RFC 2822
function xsmtp_isEmail(str) {
	var rgexp = /^(("([a-zA-Z\d]+)"\s+(<){1})?([a-zA-Z\d]+((\.|-|_)[a-zA-Z\d]+)*@((?![-\d])[a-zA-Z\d-]{0,62}[a-zA-Z\d]\.){1,4}[a-zA-Z]{2,6})(>)?(;)?)+$/;
	return rgexp.test(str);
}

// Test if the argument is a date
// The date format used is the one from the RFC 2822
function xsmtp_isDate(str) {
	var rgexp = /^(?:(Sun|Mon|Tue|Wed|Thu|Fri|Sat),\s+)?(0[1-9]|[1-2]?[0-9]|3[01])\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(19[0-9]{2}|[2-9][0-9]{3})\s+(2[0-3]|[0-1][0-9]):([0-5][0-9])(?::(60|[0-5][0-9]))?\s+([-\+][0-9]{2}[0-5][0-9]|(?:UT|GMT|(?:E|C|M|P)(?:ST|DT)|[A-IK-Z]))(\s+|\(([^\(\)]+|\\\(|\\\))*\))*$/
	return rgexp.test(str);
}

// Test if the argument is an integer
function xsmtp_isInteger(str) {
	var rgexp = /^[0-9]*$/;
	return rgexp.test(str);
}

function getRFC2822Date(time) {
	return getDayOfWeek(time) + ', ' + getTimeAsDMY(time, ' ', ' ') + ' ' + getDateOfDay(time) + ' ' + getTimeZoneOffset(time, '');
}

function getDayOfWeek(arg) {
	return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][arg.getDay()];
}

function getCutMonth(arg) {
	return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][arg.getMonth()];
}

function toInteger(n){
  return (n < 0 ? - 1 : + 1) * Math.floor(Math.abs(n) + 0.5);
}

function getPad(n) { 
	return n > 9 ? n : '0' + n; 
}

function getTimeZoneOffset(time, HMseparator) {
	var minTimezoneOffset = time.getTimezoneOffset();
	var absMinutes = Math.abs(minTimezoneOffset);
	var H = toInteger(absMinutes / 60);
	var M = absMinutes % 60;
	var WestOfUT = minTimezoneOffset > 0;
	return (WestOfUT ? '-' : '+') + getPad(H) + HMseparator + getPad(M);
}

function getDateOfDay(arg) {
	var h = arg.getHours();
	var m = arg.getMinutes();
	var s = arg.getSeconds();
	return getPad(h) + ':' + getPad(m) + ':' + getPad(s);
}

function getTimeAsDMY(time, DMSeparator, MYseparator) {
	var dayOfMonth = time.getDate();
	var y = time.getFullYear();
	return getPad(dayOfMonth) + DMSeparator + getCutMonth(time) + MYseparator + y;
}
