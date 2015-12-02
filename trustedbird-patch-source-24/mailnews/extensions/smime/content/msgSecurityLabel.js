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
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * BT Global Services / Etat francais - Ministere de la Defense.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Raphael Fairise / BT Global Services / Etat francais - Ministere de la Defense
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


function securityLabelConf() {
  this.readProfiles();
}

securityLabelConf.prototype = {

  mSecurityPolicyList: [],
  mSecurityClassificationList: [],
  mPrivacyMarkList: [],
  mSecurityCategoriesList: [],

  stringBundle: Components.classes["@mozilla.org/intl/stringbundle;1"]
                           .getService(Components.interfaces.nsIStringBundleService)
                           .createBundle("chrome://messenger-smime/locale/msgSecurityLabel.properties"),

  /**
   * Read Security Label profiles in %profile%/securityLabel/ directory
   */
  readProfiles: function() {

    /* Reset lists */
    this.mSecurityPolicyList = [];
    this.mSecurityClassificationList = [];
    this.mPrivacyMarkList = [];
    this.mSecurityCategoriesList = [];

    /* Get profile directory */
    var dir = Components.classes["@mozilla.org/file/directory_service;1"]
                        .createInstance(Components.interfaces.nsIProperties)
                        .get("ProfD", Components.interfaces.nsIFile);
    dir.append("securityLabel");

    /* Copy a default profile if needed */
    if (!dir.exists()) {
      dir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
      var defaultFile = Components.classes["@mozilla.org/file/directory_service;1"]
                                  .createInstance(Components.interfaces.nsIProperties)
                                  .get("ProfDefNoLoc", Components.interfaces.nsIFile);
      defaultFile.append("securityLabelPolicy-sample.xml");
      if (defaultFile.exists())
        defaultFile.copyTo(dir, "default.xml");
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

      for (var i in dirList) {
        try {
          if (dirList[i].isFile() && dirList[i].leafName.match(/\.xml$/) != null) {

            /* Read file */
            var fiStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                                     .createInstance(Components.interfaces.nsIFileInputStream);
            var siStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
                                     .createInstance(Components.interfaces.nsIScriptableInputStream);
            fiStream.init(dirList[i], 1, 0, false);
            siStream.init(fiStream);
            var data = new String();
            data += siStream.read(-1);
            siStream.close();
            fiStream.close();
            var uniConv = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
                                    .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
            uniConv.charset = "UTF-8";
            var fileContents = uniConv.ConvertToUnicode(data);

            if (fileContents != false) {
              /* Parse file contents */
              var domParser = new DOMParser();
              var dom = domParser.parseFromString(fileContents, "text/xml");
              if (dom.documentElement.nodeName == "securityLabel") {
                var policy = this.parseSecurityPolicyIdentifier(dom);
                if (policy) {
                  this.mSecurityPolicyList[policy[0]] = policy[1];
                  this.mSecurityClassificationList[policy[0]] = this.parseSecurityClassification(dom);
                  this.mPrivacyMarkList[policy[0]] = this.parsePrivacyMark(dom);
                  this.mSecurityCategoriesList[policy[0]] = this.parseSecurityCategories(dom);
                }
              }
            }
          }
        } catch (e) {
          dump("S/MIME Security Label: error while reading " + dirList[i].leafName + "\n");
        }
      }
    }
  },

  parseSecurityPolicyIdentifier: function(aDom) {
    var nodeList = aDom.getElementsByTagName("securityPolicyIdentifier");
    if (nodeList.length == 1) {
      var node = nodeList.item(0);
      var label = node.getAttribute("label").trim();
      var value = node.getAttribute("value").trim();
      if (label != "" && value != "")
        return [label, value];
    }

    return false;
  },

  parseSecurityClassification: function(aDom) {
    var list = [];

    var nodeList1 = aDom.getElementsByTagName("securityClassification");
    if (nodeList1.length == 1) {
      var node = nodeList1.item(0);
      var displayValue = node.getAttribute("valueDisplayed");
      if (node.hasChildNodes()) {
        var nodeList2 = node.childNodes;
        for (var i = 0; i < nodeList2.length; i++) {
          var itemNode = nodeList2.item(i);
          if (itemNode.nodeName == "item") {
            var label = itemNode.getAttribute("label").trim();
            var value = itemNode.getAttribute("value").trim();
            value = parseInt(value,10);
            if (label != "" && value >= 0 && value <= 256) {
              if (displayValue != "false" && displayValue != "0")
                label += " (" + value + ")";
              list[label] = value;
            }
          }
        }
      }
    }

    return list;
  },

  parsePrivacyMark: function(aDom) {
    var list = [];

    var nodeList1 = aDom.getElementsByTagName("privacyMark");
    if (nodeList1.length == 1) {
      var node = nodeList1.item(0);
      var freeText = node.getAttribute("freeText");
      if (freeText != "false" && freeText != "0")
        list["freeText"] = true;
      else
        list["freeText"] = false;
      if (node.hasChildNodes()) {
        var nodeList2 = node.childNodes;
        for (var i = 0; i < nodeList2.length; i++) {
          var itemNode = nodeList2.item(i);
          if (itemNode.nodeName == "item") {
            var value = itemNode.getAttribute("value").trim();
            list.push(value);
          }
        }
      }
    }

    return list;
  },

  parseSecurityCategories: function(aDom) {
    var list = [];

    var nodeList1 = aDom.getElementsByTagName("securityCategories");
    for (var k = 0; k < nodeList1.length; k++) {
      var node = nodeList1.item(k);
      var securityClassificationValue = "all";
      if (node.hasAttribute("securityClassificationValue"))
        securityClassificationValue = node.getAttribute("securityClassificationValue").trim();

      if (node.hasChildNodes()) {
        var nodeList2 = node.childNodes;
        for (var i = 0; i < nodeList2.length; i++) {
          var itemNode = nodeList2.item(i);
          if (itemNode.nodeName == "item") {
            var label = itemNode.getAttribute("label").trim();
            var oid = itemNode.getAttribute("oid").replace(/\|/g, "").trim();
            var type = itemNode.getAttribute("type").replace(/\|/g, "").trim();
            var value = itemNode.getAttribute("value").replace(/\|/g, "").trim();
            if (label != "" && oid != "" && type != "" && value != "") {
              if (list[securityClassificationValue] == undefined)
                list[securityClassificationValue] = new Array();
              list[securityClassificationValue][label] = [oid, type, value];
            }
          }
        }
      }
    }

    return list;
  },

  /**
   * Get Human-readable Security Policy Identifier
   * @param aSecurityPolicyIdentifier String with Policy Identifier OID
   * @return String with the name of the Policy Identifier
   */
  getSecurityPolicyIdentifierName: function(aSecurityPolicyIdentifier) {
    if (aSecurityPolicyIdentifier == undefined || aSecurityPolicyIdentifier == "")
      return "";

    for (policyName in this.mSecurityPolicyList)
      if (this.mSecurityPolicyList[policyName] == aSecurityPolicyIdentifier)
        return policyName;

    return this.stringBundle.GetStringFromName("unknownSecurityPolicyIdentifier") +" (" + aSecurityPolicyIdentifier + ")";
  },

  /**
   * Get Human-readable Security Classification value
   * @param aSecurityPolicyIdentifier String with Policy Identifier OID
   * @param aSecurityClassification Classification value
   * @return String with the name and value of the Security Classification
   */
  getSecurityClassificationName: function(aSecurityPolicyIdentifier, aSecurityClassification) {
    if (aSecurityPolicyIdentifier == undefined || aSecurityClassification == undefined)
      return "";

    var securityPolicyIdentifierName = this.getSecurityPolicyIdentifierName(aSecurityPolicyIdentifier);
  
    if (this.mSecurityClassificationList[securityPolicyIdentifierName] != undefined)
      for (classificationName in this.mSecurityClassificationList[securityPolicyIdentifierName])
        if (this.mSecurityClassificationList[securityPolicyIdentifierName][classificationName] == aSecurityClassification)
          return classificationName;

    return this.stringBundle.GetStringFromName("unknownSecurityClassification") + " (" + aSecurityClassification + ")";
  },

  /**
   * Get Human-readable Security Category value
   * @param aSecurityPolicyIdentifier String with Policy Identifier OID
   * @param aSecurityClassification Classification value
   * @param aSecurityCategoryOid Category OID
   * @param aSecurityCategoryType Category type
   * @param aSecurityCategoryValue Category value
   * @return String with the name of the Security Category
   */
  getSecurityCategoryName: function(aSecurityPolicyIdentifier, aSecurityClassification, aSecurityCategoryOid, aSecurityCategoryType, aSecurityCategoryValue) {
    if (aSecurityPolicyIdentifier == undefined || aSecurityClassification == undefined || aSecurityCategoryOid == undefined || aSecurityCategoryType == undefined || aSecurityCategoryValue == undefined)
      return "";

    var securityPolicyIdentifierName = this.getSecurityPolicyIdentifierName(aSecurityPolicyIdentifier);

    if (this.mSecurityCategoriesList[securityPolicyIdentifierName] != undefined) {
      for (var i = 0; i < 2; i++) {
        var list;
        /* Security Categories for all classifications */
        if (i == 0)
          list = this.mSecurityCategoriesList[securityPolicyIdentifierName]["all"];
        /* Security Categories for selected classification */
        if (i == 1)
          list = this.mSecurityCategoriesList[securityPolicyIdentifierName][aSecurityClassification.toString()];

        for (securityCategoryName in list)
          if (list[securityCategoryName][0] == aSecurityCategoryOid && list[securityCategoryName][1] == aSecurityCategoryType && list[securityCategoryName][2] == aSecurityCategoryValue)
            return securityCategoryName;
      }
    }

    return this.stringBundle.GetStringFromName("unknownSecurityCategory") + " (" + aSecurityCategoryOid + " | " + aSecurityCategoryValue + ")";
  }
}
