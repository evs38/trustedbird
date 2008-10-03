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

var securityLabelSecurityPolicyList = [];
var securityLabelSecurityClassificationList = [];

var jsLoader =  Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
jsLoader.loadSubScript("chrome://messenger/content/io.js");

var stringBundleService = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
var gStringBundle = stringBundleService.createBundle("chrome://messenger-smime/locale/securityLabel.properties");


/**
 *  Get Human-readable Security Classification value
 *  @param securityPolicyIdentifier String with Policy Identifier OID
 *  @param securityClassification Classification value
 *  @return String with the name and value of the Security Classification
 */
function securityLabelGetSecurityClassificationName(securityPolicyIdentifier, securityClassification) {
	if (securityPolicyIdentifier == undefined || securityClassification == undefined) return "";
	
	var securityPolicyIdentifierName = securityLabelGetSecurityPolicyIdentifierName(securityPolicyIdentifier);

	if (securityLabelSecurityClassificationList[securityPolicyIdentifierName] != undefined) {
		for (classificationName in securityLabelSecurityClassificationList[securityPolicyIdentifierName]) {
			if (securityLabelSecurityClassificationList[securityPolicyIdentifierName][classificationName] == securityClassification) return classificationName;
		}
	}
	
	return gStringBundle.GetStringFromName("unknownSecurityClassification") +" (" + securityClassification + ")";
}


/**
 * Get Human-readable Security Policy Identifier
 * @param securityPolicyIdentifier String with Policy Identifier OID
 * @return String with the name of the Policy Identifier
 */
function securityLabelGetSecurityPolicyIdentifierName(securityPolicyIdentifier) {
	if (securityPolicyIdentifier == undefined || securityPolicyIdentifier == "") return "";

	securityLabelReadProfiles();
	
	for (policyName in securityLabelSecurityPolicyList) {
		if (securityLabelSecurityPolicyList[policyName] == securityPolicyIdentifier) return policyName;
	}
	
	return gStringBundle.GetStringFromName("unknownSecurityPolicyIdentifier") +" (" + securityPolicyIdentifier + ")";
}


var _securityLabelReadProfilesDone = false;

/**
 * Read Security Label profiles in %profile%/securityLabel/ directory
 */
function securityLabelReadProfiles() {
	if (!_securityLabelReadProfilesDone) {

		/* Reset lists */
		securityLabelSecurityPolicyList = [];
		securityLabelSecurityClassificationList = [];
		                                           
		var dir = DirIO.get("ProfD"); /* Profile directory */
		dir.append("securityLabel");
		var dirList = DirIO.read(dir);
		for (i in dirList) {
			var fileContents = FileIO.read(dirList[i], "UTF-8");
			if (fileContents != false) {
				var domParser = new DOMParser();
				var dom = domParser.parseFromString(fileContents, "text/xml");
				if (dom.documentElement.nodeName == "securityLabel") {
					var policy = _parsePolicyIdentifier(dom);
					if (policy != false) {
						securityLabelSecurityPolicyList[policy[0]] = policy[1];
						securityLabelSecurityClassificationList[policy[0]] = _parseSecurityClassification(dom);
					}
				}
			}
		}
		
		_securityLabelReadProfilesDone = true;
	}
}


function _parsePolicyIdentifier(dom) {
	var nodeList = dom.getElementsByTagName("policyIdentifier");
	if (nodeList.length == 1) {
		var node = nodeList.item(0);
		var name = node.getAttribute("name");
		var value = node.firstChild.nodeValue;
		if (name != "" && value != "") return [name, value];
	}
	
	return false;
}


function _parseSecurityClassification(dom) {
	var list = [];
	
	var nodeList = dom.getElementsByTagName("securityClassification");
	if (nodeList.length == 1) {
		var node = nodeList.item(0);
		var displayValue = node.getAttribute("displayValue");
		if (node.hasChildNodes()) {
			var nodeList = node.childNodes;
			for (i = 0; i < nodeList.length; i++) {
				var valueNode = nodeList.item(i);
				if (valueNode.nodeName == "value") {
					var name = valueNode.getAttribute("name");
					var value = valueNode.firstChild.nodeValue;
					if (parseInt(value) >= 0 && parseInt(value) <= 256) {
						if (displayValue != "false" && displayValue != "0") name += " (" + value + ")";
						list[name] = value;
					}
				}
			}
		}
	}
	
	return list;
}
