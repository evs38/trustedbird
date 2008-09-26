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
 * The Original Code is Mozilla.
 *
 * The Initial Developer of the Original Code is
 * BT Global Services / Etat francais Ministere de la Defense.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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

/**
 *  Get Human-readable Security Classification value
 *  @param securityPolicyIdentifier String with Policy Identifier OID
 *  @param securityClassification Classification value
 *  @return String with the name and value of the Security Classification
 */
function getSecurityLabelSecurityClassificationName(securityPolicyIdentifier, securityClassification) {
	switch (parseInt(securityClassification)) {
		case 0:	return "unmarked (0)";
		case 1:	return "unclassified (1)";
		case 2:	return "restricted (2)";
		case 3:	return "confidential (3)";
		case 4:	return "secret (4)";
		case 5:	return "top-secret (5)";
	}
	
	return "unknown (" + securityClassification + ")";
}

/**
 * Get Human-readable Security Policy Identifier
 * @param securityPolicyIdentifier String with Policy Identifier OID
 * @return String with the name of the Policy Identifier
 */
function getSecurityLabelSecurityPolicyIdentifierName(securityPolicyIdentifier) {
	switch (securityPolicyIdentifier) {
		case "1.2.840.113549.1.9.16.7.1": return "default";
	}
	
	return "unknown (" + securityPolicyIdentifier + ")";
}
