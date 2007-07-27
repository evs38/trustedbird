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

// Unit tests
function xsmtp_unit_tests() {
	var OK = "OK";
	var KO = "KO";
	var hasErrors = false;
	
	var tests = [
		[XSMTP_HEADER_X_P772_VERSION, "", OK],
		[XSMTP_HEADER_X_P772_VERSION, "test.test/test", OK],
		[XSMTP_HEADER_X_P772_VERSION, "foo@bar", KO], // Not PrintableString
		
		[XSMTP_HEADER_X_P772_PRIORITY_LEVEL_QUALIFIER, "", OK],
		[XSMTP_HEADER_X_P772_PRIORITY_LEVEL_QUALIFIER, "low (0)", OK],
		[XSMTP_HEADER_X_P772_PRIORITY_LEVEL_QUALIFIER, "low (12)", KO],
		
		[XSMTP_HEADER_X_P772_EXTENDED_GRADE_OF_DELIVERY, "", OK],
		[XSMTP_HEADER_X_P772_EXTENDED_GRADE_OF_DELIVERY, "test.test/test", OK],
		[XSMTP_HEADER_X_P772_EXTENDED_GRADE_OF_DELIVERY, "foo@bar", KO], // Not PrintableString

		[XSMTP_HEADER_X_P772_PRIMARY_PRECEDENCE, "routine (1)", OK],
		[XSMTP_HEADER_X_P772_PRIMARY_PRECEDENCE, "", KO],
		[XSMTP_HEADER_X_P772_PRIMARY_PRECEDENCE, "routine (12)", KO],

		[XSMTP_HEADER_X_P772_COPY_PRECEDENCE, "", OK],
		[XSMTP_HEADER_X_P772_COPY_PRECEDENCE, "routine (1)", OK],
		[XSMTP_HEADER_X_P772_COPY_PRECEDENCE, "routine (12)", KO],

		[XSMTP_HEADER_X_P772_MESSAGE_TYPE, "", OK],
		[XSMTP_HEADER_X_P772_MESSAGE_TYPE, "exercise (0) = manoeuvre", OK],
		[XSMTP_HEADER_X_P772_MESSAGE_TYPE, "operation (1)", OK],
		[XSMTP_HEADER_X_P772_MESSAGE_TYPE, "exercise (0)= manoeuvre", KO],

		[XSMTP_HEADER_X_P772_EXEMPTED_ADDRESS, "", OK],
		[XSMTP_HEADER_X_P772_EXEMPTED_ADDRESS, "foo@bar.com", OK],
		[XSMTP_HEADER_X_P772_EXEMPTED_ADDRESS, "foo@bar.com;bar@foo.com", OK],
		[XSMTP_HEADER_X_P772_EXEMPTED_ADDRESS, "foo@bar", KO],
		[XSMTP_HEADER_X_P772_EXEMPTED_ADDRESS, "foo@bar.com;bar@foo", KO],

		[XSMTP_HEADER_X_P772_EXTENDED_AUTHORISATION_INFO, "Mon, 25 Apr 2005 10:00:01 +0100", OK],
		[XSMTP_HEADER_X_P772_EXTENDED_AUTHORISATION_INFO, "Thu, 6 Jan 2005 18:44:56 -0500", OK],
		[XSMTP_HEADER_X_P772_EXTENDED_AUTHORISATION_INFO, "6 Jan 2005 18:44:56 -0500", OK],
		[XSMTP_HEADER_X_P772_EXTENDED_AUTHORISATION_INFO, "", KO],
		[XSMTP_HEADER_X_P772_EXTENDED_AUTHORISATION_INFO, "Thu, 6 XXX 2005 18:44:56 -0500", KO],
		[XSMTP_HEADER_X_P772_EXTENDED_AUTHORISATION_INFO, "Thu, 0 Jan 1856 18:44:56 -0500", KO],
		[XSMTP_HEADER_X_P772_EXTENDED_AUTHORISATION_INFO, "0 Jan 1856 18:44:56 -0500", KO],
		[XSMTP_HEADER_X_P772_EXTENDED_AUTHORISATION_INFO, "18:44:56", KO],

		[XSMTP_HEADER_X_P772_DISTRIBUTION_CODES, "", OK],		
		[XSMTP_HEADER_X_P772_DISTRIBUTION_CODES, "ABC;BA123;BA127", OK],
		[XSMTP_HEADER_X_P772_DISTRIBUTION_CODES, "BA127", OK],
		[XSMTP_HEADER_X_P772_DISTRIBUTION_CODES, ";", KO], 			// Size < 3
		[XSMTP_HEADER_X_P772_DISTRIBUTION_CODES, "AB", KO], 		// Size < 3
		[XSMTP_HEADER_X_P772_DISTRIBUTION_CODES, "123456789", KO], 	// Size > 8
		[XSMTP_HEADER_X_P772_DISTRIBUTION_CODES, "ABC;DEF;GHI;JKL;MNO;PQR;STU;VWX;YZA", KO], // NB > 8
		[XSMTP_HEADER_X_P772_DISTRIBUTION_CODES, "ABC;BA123;BA@127", KO], // Not PrintableString
		
		[XSMTP_HEADER_X_P772_MCA, "", OK],		
		[XSMTP_HEADER_X_P772_MCA, "Transport;Ravitaillement", OK],
		[XSMTP_HEADER_X_P772_MCA, "Transport", OK],
		[XSMTP_HEADER_X_P772_MCA, ";", KO], 			// Size < 1
		[XSMTP_HEADER_X_P772_MCA, "012345678901234567890", KO], 	// Size > 20
		[XSMTP_HEADER_X_P772_MCA, "Transport;Ravitaillement;Test1;Test2;Test3", KO], // NB > 4
		[XSMTP_HEADER_X_P772_MCA, "Transport;Ravit@illement", KO], // Not PrintableString
		
		[XSMTP_HEADER_X_P772_HANDLING_INSTRUCTIONS, "", OK],
		[XSMTP_HEADER_X_P772_HANDLING_INSTRUCTIONS, "test.test/test", OK],
		[XSMTP_HEADER_X_P772_HANDLING_INSTRUCTIONS, "foo@bar", KO], // Not PrintableString
		[XSMTP_HEADER_X_P772_HANDLING_INSTRUCTIONS, "0123456789012345678901234567890123456789012345678901234567890123456789", KO], // Size > 69

		[XSMTP_HEADER_X_P772_MESSAGE_INSTRUCTIONS, "", OK],
		[XSMTP_HEADER_X_P772_MESSAGE_INSTRUCTIONS, "test.test/test", OK],
		[XSMTP_HEADER_X_P772_MESSAGE_INSTRUCTIONS, "foo@bar", KO], // Not PrintableString
		[XSMTP_HEADER_X_P772_MESSAGE_INSTRUCTIONS, "0123456789012345678901234567890123456789012345678901234567890123456789", KO], // Size > 69

		[XSMTP_HEADER_X_P772_CODRESS_MESSAGE, "", OK],
		[XSMTP_HEADER_X_P772_CODRESS_MESSAGE, "18", OK],
		[XSMTP_HEADER_X_P772_CODRESS_MESSAGE, "A", KO],

		[XSMTP_HEADER_X_P772_ORIGINATOR_REFERENCE, "test.test/test", OK],
		[XSMTP_HEADER_X_P772_ORIGINATOR_REFERENCE, "", KO],
		[XSMTP_HEADER_X_P772_ORIGINATOR_REFERENCE, "foo@bar", KO], // Not PrintableString
		[XSMTP_HEADER_X_P772_ORIGINATOR_REFERENCE, "0123456789012345678901234567890123456789012345678901234567890123456789", KO], // Size > 69

		[XSMTP_HEADER_X_P772_REFERENCE_INDICATION, "", OK],
		[XSMTP_HEADER_X_P772_REFERENCE_INDICATION, "test.test/test", OK],
		[XSMTP_HEADER_X_P772_REFERENCE_INDICATION, "foo@bar", KO], // Not PrintableString
		[XSMTP_HEADER_X_P772_REFERENCE_INDICATION, "0123456789012345678901234567890123456789012345678901234567890123456789", KO], // Size > 69

		[XSMTP_HEADER_X_P772_OTHER_RECIPIENT_INDICATOR, "", OK],		
		[XSMTP_HEADER_X_P772_OTHER_RECIPIENT_INDICATOR, "Cdt BA;ORSEC", OK],
		[XSMTP_HEADER_X_P772_OTHER_RECIPIENT_INDICATOR, "Cdt BA", OK],
		[XSMTP_HEADER_X_P772_OTHER_RECIPIENT_INDICATOR, ";", KO], 			// Size < 1
		[XSMTP_HEADER_X_P772_OTHER_RECIPIENT_INDICATOR, "0123456789012345678901234567890123456789012345678901234567890123456789", KO], 	// Size > 69
		[XSMTP_HEADER_X_P772_OTHER_RECIPIENT_INDICATOR, "Cdt BA;@RSEC", KO], // Not PrintableString

		[XSMTP_HEADER_X_P772_ADDRESS_LIST_INDICATOR, "", OK],		
		[XSMTP_HEADER_X_P772_ADDRESS_LIST_INDICATOR, "DET;ORSEC", OK],
		[XSMTP_HEADER_X_P772_ADDRESS_LIST_INDICATOR, "DET", OK],
		[XSMTP_HEADER_X_P772_ADDRESS_LIST_INDICATOR, ";", KO], 		   // Size < 1
		[XSMTP_HEADER_X_P772_ADDRESS_LIST_INDICATOR, "DET;@RSEC", KO], // Not PrintableString

		[XSMTP_HEADER_X_P772_ACP_MESSAGE_IDENTIFIER, "", OK],
		[XSMTP_HEADER_X_P772_ACP_MESSAGE_IDENTIFIER, "test.test/test", OK],
		[XSMTP_HEADER_X_P772_ACP_MESSAGE_IDENTIFIER, "foo@bar", KO], // Not PrintableString
		[XSMTP_HEADER_X_P772_ACP_MESSAGE_IDENTIFIER, "0123456789012345678901234567890123456789012345678901234567890123456789", KO], // Size > 69

		[XSMTP_HEADER_X_P772_ORIGINATOR_PLAD, "", OK],
		[XSMTP_HEADER_X_P772_ORIGINATOR_PLAD, "test.test/test", OK],
		[XSMTP_HEADER_X_P772_ORIGINATOR_PLAD, "foo@bar", KO], // Not PrintableString
		[XSMTP_HEADER_X_P772_ORIGINATOR_PLAD, "0123456789012345678901234567890123456789012345678901234567890123456789", KO], // Size > 69

		[XSMTP_HEADER_X_P772_ACP_NOTIFICATION_REQUEST, "", OK],
		[XSMTP_HEADER_X_P772_ACP_NOTIFICATION_REQUEST, "test.test/test", OK],
		[XSMTP_HEADER_X_P772_ACP_NOTIFICATION_REQUEST, "foo@bar", KO], // Not PrintableString

		[XSMTP_HEADER_X_P772_ACP_NOTIFICATION_RESPONSE, "", OK],
		[XSMTP_HEADER_X_P772_ACP_NOTIFICATION_RESPONSE, "test.test/test", OK],
		[XSMTP_HEADER_X_P772_ACP_NOTIFICATION_RESPONSE, "foo@bar", KO], // Not PrintableString

		[XSMTP_HEADER_X_P772_SECURITY_CLASSIFICATION, "SECRET DEFENSE", OK],
		[XSMTP_HEADER_X_P772_SECURITY_CLASSIFICATION, "", KO],
		[XSMTP_HEADER_X_P772_SECURITY_CLASSIFICATION, "UNKNOWN", KO],

		[XSMTP_HEADER_X_P772_SPECIAL_HANDLING_INSTRUCTIONS, "", OK],
		[XSMTP_HEADER_X_P772_SPECIAL_HANDLING_INSTRUCTIONS, "RESERVE POUR", OK],
		[XSMTP_HEADER_X_P772_SPECIAL_HANDLING_INSTRUCTIONS, "SPECIAL FRANCE;ACSSI", OK],
		[XSMTP_HEADER_X_P772_SPECIAL_HANDLING_INSTRUCTIONS, ";", KO], 		   // Size < 1
		[XSMTP_HEADER_X_P772_SPECIAL_HANDLING_INSTRUCTIONS, "UNKNOWN", KO]

	]
	
	dump("Starting xsmtp_unit_tests ...\n");
	for (var i = 0; i < tests.length; i++) {
		var errors = xsmtp_checkHeaderValueFormat(tests[i][0], tests[i][1]);
		if (tests[i][2] == OK && errors.length > 0) {
			hasErrors = true;
			dump("Failed: " + tests[i][0] + " = " + tests[i][1] + " => " + tests[i][2] + "\nWith errors: " + errors + "\n");
			
		} else if (tests[i][2] == KO && errors.length == 0) {
			hasErrors = true;
			dump("Failed: " + tests[i][0] + " = " + tests[i][1] + " => " + tests[i][2] + "\n");

		} else {
			dump("Success: " + tests[i][0] + " = " + tests[i][1] + " => " + tests[i][2] + "\n");
		}
	}
	
	if (hasErrors) {
		alert("Errors when running tests !");
	} else {
		alert("Tests runs ok");
	}
}
