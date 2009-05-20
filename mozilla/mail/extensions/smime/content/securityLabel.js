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
 * Raphael Fairise / BT Global Services / Etat francais - Ministere de la Defense
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
var securityLabelPrivacyMarkList = [];
var securityLabelSecurityCategoriesList = [];

var stringBundleService = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
var gStringBundle = stringBundleService.createBundle("chrome://messenger-smime/locale/securityLabel.properties");


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
	
	return gStringBundle.GetStringFromName("unknownSecurityClassification") + " (" + securityClassification + ")";
}


/**
 *  Get Human-readable Security Category value
 *  @param securityPolicyIdentifier String with Policy Identifier OID
 *  @param securityClassification Classification value
 *  @param securityCategoryType Category type
 *  @param securityCategoryValue Category value
 *  @return String with the name of the Security Category
 */
function securityLabelGetSecurityCategoryName(securityPolicyIdentifier, securityClassification, securityCategoryOid, securityCategoryType, securityCategoryValue) {
	if (securityPolicyIdentifier == undefined || securityClassification == undefined || securityCategoryOid == undefined || securityCategoryType == undefined || securityCategoryValue == undefined) return "";
	
	var securityPolicyIdentifierName = securityLabelGetSecurityPolicyIdentifierName(securityPolicyIdentifier);

	if (securityLabelSecurityCategoriesList[securityPolicyIdentifierName] != undefined) {
		for (var i = 0; i < 2; i++) {
			var list;
			/* Security Categories for all classifications */
			if (i == 0) list = securityLabelSecurityCategoriesList[securityPolicyIdentifierName]["all"];
			/* Security Categories for selected classification */
			if (i == 1) list = securityLabelSecurityCategoriesList[securityPolicyIdentifierName][securityClassification.toString()];

			for (securityCategoryName in list) {
				if (list[securityCategoryName][0] == securityCategoryOid && list[securityCategoryName][1] == securityCategoryType && list[securityCategoryName][2] == securityCategoryValue) {
					return securityCategoryName;
				}
			}
		}
	}
	
	return gStringBundle.GetStringFromName("unknownSecurityCategory") + " (" + securityCategoryOid + " | " + securityCategoryValue + ")";
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
		securityLabelPrivacyMarkList = [];
		securityLabelSecurityCategoriesList = [];
		
		/* Get profile directory */
		var dir = Components.classes["@mozilla.org/file/directory_service;1"].createInstance(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
		dir.append("securityLabel");
		
		/* Copy default profile if needed */
		if (!dir.exists()) {
			dir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
			var defaultFile = Components.classes["@mozilla.org/file/directory_service;1"].createInstance(Components.interfaces.nsIProperties).get("ProfDefNoLoc", Components.interfaces.nsIFile);
			defaultFile.append("securityLabelPolicy-sample.xml");
			if (defaultFile.exists()) defaultFile.copyTo(dir, "default.xml");
		}
		
		if (dir.isDirectory()) {
			/* Read directory contents */
			var entries = dir.directoryEntries;
			var dirList = [];
			while (entries.hasMoreElements()) {
				var entry = entries.getNext();
				entry.QueryInterface(Components.interfaces.nsIFile);
				dirList.push(entry);
			}

			for (i in dirList) {
				try {
					if (dirList[i].isFile() && dirList[i].leafName.match(/\.xml$/) != null) {
						dump("S/MIME Security Label: reading profile " + dirList[i].leafName + "...\n");

						/* Read file */
						var fiStream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
						var siStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
						fiStream.init(dirList[i], 1, 0, false);
						siStream.init(fiStream);
						var data = new String();
						data += siStream.read(-1);
						siStream.close();
						fiStream.close();
						var uniConv = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
						uniConv.charset = "UTF-8";
						var fileContents = uniConv.ConvertToUnicode(data);
						
						if (fileContents != false) {
							/* Parse file contents */
							var domParser = new DOMParser();
							var dom = domParser.parseFromString(fileContents, "text/xml");
							if (dom.documentElement.nodeName == "securityLabel") {
								var policy = _parseSecurityPolicyIdentifier(dom);
								if (policy != false) {
									securityLabelSecurityPolicyList[policy[0]] = policy[1];
									securityLabelSecurityClassificationList[policy[0]] = _parseSecurityClassification(dom);
									securityLabelPrivacyMarkList[policy[0]] = _parsePrivacyMark(dom);
									securityLabelSecurityCategoriesList[policy[0]] = _parseSecurityCategories(dom);
								}
							}
						}
					}
				} catch (e) {
					dump("S/MIME Security Label: error while reading " + dirList[i].leafName + "\n");
				}
			}
		}
		_securityLabelReadProfilesDone = true;
	}
}


function _parseSecurityPolicyIdentifier(dom) {
	var nodeList = dom.getElementsByTagName("securityPolicyIdentifier");
	if (nodeList.length == 1) {
		var node = nodeList.item(0);
		var label = _trim(node.getAttribute("label"));
		var value = _trim(node.getAttribute("value"));
		if (label != "" && value != "") return [label, value];
	}
	
	return false;
}


function _parseSecurityClassification(dom) {
	var list = [];
	
	var nodeList1 = dom.getElementsByTagName("securityClassification");
	if (nodeList1.length == 1) {
		var node = nodeList1.item(0);
		var displayValue = node.getAttribute("valueDisplayed");
		if (node.hasChildNodes()) {
			var nodeList2 = node.childNodes;
			for (i = 0; i < nodeList2.length; i++) {
				var itemNode = nodeList2.item(i);
				if (itemNode.nodeName == "item") {
					var label = _trim(itemNode.getAttribute("label"));
					var value = _trim(itemNode.getAttribute("value"));
					value = parseInt(value);
					if (label != "" && value >= 0 && value <= 256) {
						if (displayValue != "false" && displayValue != "0") label += " (" + value + ")";
						list[label] = value;
					}
				}
			}
		}
	}
	
	return list;
}

function _parsePrivacyMark(dom) {
	var list = [];
	
	var nodeList1 = dom.getElementsByTagName("privacyMark");
	if (nodeList1.length == 1) {
		var node = nodeList1.item(0);
		var freeText = node.getAttribute("freeText");
		if (freeText != "false" && freeText != "0")	list["freeText"] = true; else list["freeText"] = false;
		if (node.hasChildNodes()) {
			var nodeList2 = node.childNodes;
			for (i = 0; i < nodeList2.length; i++) {
				var itemNode = nodeList2.item(i);
				if (itemNode.nodeName == "item") {
					var value = _trim(itemNode.getAttribute("value"));
					list.push(value);
				}
			}
		}
	}
	
	return list;
}

function _parseSecurityCategories(dom) {
	var list = [];
	
	var nodeList1 = dom.getElementsByTagName("securityCategories");
	for (var k = 0; k < nodeList1.length; k++) {
		var node = nodeList1.item(k);
		var securityClassificationValue = "all";
		if (node.hasAttribute("securityClassificationValue")) {
			securityClassificationValue = _trim(node.getAttribute("securityClassificationValue"));
		}
		if (node.hasChildNodes()) {
			var nodeList2 = node.childNodes;
			for (i = 0; i < nodeList2.length; i++) {
				var itemNode = nodeList2.item(i);
				if (itemNode.nodeName == "item") {
					var label = _trim(itemNode.getAttribute("label"));
					var oid = _trim(itemNode.getAttribute("oid").replace(/\|/g, ""));
					var type = _trim(itemNode.getAttribute("type").replace(/\|/g, ""));
					var value = _trim(itemNode.getAttribute("value").replace(/\|/g, ""));
					if (label != "" && oid != "" && type != "" && value != "") {
						if (list[securityClassificationValue] == undefined) list[securityClassificationValue] = new Array();
						list[securityClassificationValue][label] = [oid, type, value];
					}
				}
			}
		}
	}
	
	return list;
}

function _trim(s) {
	return s.replace(/^\s+|\s+$/g, "");
}
