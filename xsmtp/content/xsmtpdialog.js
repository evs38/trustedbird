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
 *   Bruno Lebon BT Global Services / Etat francais Ministere de la Defense
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

// Global variables
var xsmtp_msgCompFields = window.opener['gMsgCompose'].compFields;

// window first initialisation
window.opener.customedHeaders = xsmtp_msgCompFields.otherRandomHeaders;

// Initialize fields on onload
function xsmtp_onDialogLoad() {
	// Use a deffered fields initialization to prevent a strange bug : 
	// the list items are sometimes not available ...
	window.setTimeout(xsmtp_onDialogDeferredLoad, 100);
}
	
function xsmtp_onDialogDeferredLoad() {
	// Get concatenated headers (Format is header1:value1\r\nheader2:value2\r\nheader3:value3)
	var concatenatedHeaders = window.opener.customedHeaders;
	concatenatedHeaders = xsmtp_retrieveHeadersFromDraft(concatenatedHeaders);
	
	dump("XSMTP: loading headers:\n" + concatenatedHeaders + "\n");
	
	// Split concatenated headers
	var splittedHeaders = concatenatedHeaders.split("\r\n");

	for (var i = 0; i < splittedHeaders.length; i++) {
		if (splittedHeaders[i]) {
			var header = TrimString(splittedHeaders[i].substring(0, splittedHeaders[i].indexOf(':')));
			var value = TrimString(splittedHeaders[i].substring(splittedHeaders[i].indexOf(':') + 1));

			if (header && value) {
				xsmtp_setHeaderValueToMatchingField(header, value);

			} else {
				dump("XSMTP: wrong format for header " + splittedHeaders[i] + "\n");
			}
		}
	}
}

// Retrieve headers from draft
function xsmtp_retrieveHeadersFromDraft(defaultHeaders) {
	var headersFromDraft = getXsmtpHeadersFromURI(window.opener['msgWindow'], window.opener);
	if (headersFromDraft && window.opener.gContainer != 1) {
		return headersFromDraft;
	}
	return defaultHeaders;
}

// Set the value of the specified header into the matching field
function xsmtp_setHeaderValueToMatchingField(header, value) {

	// Handle special case for compound fields (XSMTP_HEADER_X_P772_MESSAGE_TYPE)
	if (header == XSMTP_HEADER_X_P772_MESSAGE_TYPE) {
		var splittedValue = value.split(" = ");
		document.getElementById(header + "1").value = TrimString(splittedValue[0]);
		document.getElementById(header + "2").removeAttribute('disabled');

		if (splittedValue.length == 2) {
			document.getElementById(header + "2").value = TrimString(splittedValue[1]);	
		}
		return;
	}

	var field = document.getElementById(header);

	if (!field) {
		dump("XSMTP: unknown matching field for header " + header + "\n");
		return;
	}

	field.value = value;

	// Toggle exclusive fields (XSMTP_HEADER_X_P772_MCA et XSMTP_HEADER_X_P772_DISTRIBUTION_CODES)
	if (header == XSMTP_HEADER_X_P772_MCA) {
		document.getElementById(XSMTP_HEADER_X_P772_DISTRIBUTION_CODES).setAttribute('disabled', true);

    } else if (header == XSMTP_HEADER_X_P772_DISTRIBUTION_CODES) {
        document.getElementById(XSMTP_HEADER_X_P772_MCA).setAttribute('disabled', true);
	
	} else if (field.tagName == 'menulist' || field.tagName == 'listbox') {
		field.setAttribute('label', value);

		// Handle multiple selections
		if (field.getAttribute("seltype") == "multiple") {
			var splittedValue = value.split(';');
			for (var i = 0; i < field.getRowCount(); i++) {
				var item = field.getItemAtIndex(i);

				if (splittedValue.indexOf(item.value) != -1) {
					field.addItemToSelection(item);
				}
			}
		}
    }
}

function xsmtp_onDialogAccept()
{
	// Fill computed fields
	document.getElementById(XSMTP_HEADER_X_P772_EXTENDED_AUTHORISATION_INFO).value = getRFC2822Date(new Date());

 	// Validate all fields
 	var errors = xsmtp_checkAllHeadersValueFormat();
	if (errors.length > 0) {
		alert(xsmtp_getMessageByKey("xsmtp.prompt.resolve_errors") + ":\n\n" + errors.join('\n') + "\n");
		return false;
	}

	// Build header list
	var allValues = "";
	for (var i = 0; i < ALL_XSMTP_HEADERS.length; i++) {

		var value = "";

		// Handle special case for compound fields (XSMTP_HEADER_X_P772_MESSAGE_TYPE)
		if (ALL_XSMTP_HEADERS[i] == XSMTP_HEADER_X_P772_MESSAGE_TYPE) {
			value = document.getElementById(XSMTP_HEADER_X_P772_MESSAGE_TYPE + "1").value;
			if (document.getElementById(XSMTP_HEADER_X_P772_MESSAGE_TYPE + "2").value) {
				value += " = " + document.getElementById(XSMTP_HEADER_X_P772_MESSAGE_TYPE + "2").value;
			}

		} else {
		
			var field = document.getElementById(ALL_XSMTP_HEADERS[i]);

			// Handle case for list with multiple selections
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

		if (value) {
			allValues += ALL_XSMTP_HEADERS[i] + ":" + value + "\r\n";
		}
	}
	dump("XSMTP: Setting headers:\n" + allValues + "\n")

	// Affect header list
	window.opener.customedHeaders = allValues;
	xsmtp_msgCompFields.otherRandomHeaders = allValues;

  	window.opener.gContainer = 1;
  	return true;
}

// UI script to handle exclusive elements : only one of two exclusive elements can be enabled
function xsmtp_toggleExclusiveElements(firstElement, secondElement) {

	var firstElementValue = TrimString(firstElement.value);
	if (firstElementValue) {
		secondElement.setAttribute('disabled', true);
		secondElement.value = '';

	} else {
		secondElement.removeAttribute('disabled');
	}
}

// UI script to handle dependent elements : second element is enabled only if first element is filled
function xsmtp_toggleDependentElements(firstElement, secondElement) {

	var firstElementValue = TrimString(firstElement.value);
	if (firstElementValue) {
		secondElement.removeAttribute('disabled');

	} else {
		secondElement.setAttribute('disabled', true);
		secondElement.value = '';
	}
}