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
var verif="";
//custom preference initialization
var XP772=new Array("X-P772-Version","X-P772-Priority-Level-Qualifier","X-P772-Extended-Grade-Of-Delivery","X-P772-Primary-Precedence","X-P772-Copy-Precedence","X-P772-Message-Type","X-P772-Address-List-Indicator","X-P772-Exempted-Address","X-P772-Extended-Authorisation-Info","X-P772-Distribution-Codes","X-P772-MCA","X-P772-Handling-Instructions","X-P772-Message-Instructions","X-P772-Codress-Message","X-P772-Originator-Reference","X-P772-ReferenceIndication","X-P772-Other-Recipient-Indicator","X-P772-Acp-Message-Identifier","X-P772-Originator-PLAD","X-P772-Acp-Notification-Request","X-P772-Acp-Notification-Response","X-P772-Security-Classification","X-P772-Special-Handling-Instructions","available");
var gPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
//var gDBView = Components.classes["@mozilla.org/messenger/msgdbview;1?type=search"].createInstance(Components.interfaces.nsIMsgDBView);
//addCustomPref('mail.compose.other.header');

addCustomPref(XP772,'mailnews.customHeaders');
addCustomPref(XP772,'mailnews.customDBHeaders','yes');
gPrefs.setIntPref('xsmtp.size.flash', 10);
gPrefs.setIntPref('xsmtp.size.immediate', 50);
gPrefs.setIntPref('xsmtp.size.priority', 1000);
gPrefs.setIntPref('xsmtp.size.routine', 10000);

//add custom headers pref
function addCustomPref(XP772,val,lower)
{
   var customedHeaders = "";
   var headrs = "";
   try {
		headrs = gPrefs.getCharPref(val);
   }catch(ex){}
   
   for (var i=0; i< XP772.length; i++){
	 if ( (headrs.indexOf(XP772[i]) != -1) || (headrs.indexOf(XP772[i].toLowerCase()) != -1) ){
	 }else {
		if (headrs != ""){headrs +=",";}
			headrs += XP772[i];
	}
  }
  if (lower == "yes"){headrs = headrs.replace(/,/g, " ").toLowerCase();}
  gPrefs.setCharPref(val, headrs);
}
//handler definition
var X_P772_Version =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-version");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-version"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Priority_Level_Qualifier =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-priority-level-qualifier");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-priority-level-qualifier"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Extended_Grade_Of_Delivery =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-extended-grade-of-delivery");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-extended-grade-of-delivery"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Primary_Precedence =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-primary-precedence");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-primary-precedence"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Copy_Precedence =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-copy-precedence");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-copy-precedence"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Message_Type =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-message-type");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-message-type"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Address_List_Indicator =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-address-list-indicator");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-address-list-indicator"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Exempted_Address =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-exempted-address");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-exempted-address"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Extended_Authorisation_Info =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-extended-authorisation-info");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-extended-authorisation-info"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Distribution_Codes =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-distribution-codes");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-distribution-codes"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_MCA =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-mca");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-mca"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Handling_Instructions =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-handling-instructions");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-handling-instructions"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Message_Instructions =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-message-instructions");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-message-instructions"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Codress_Message =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-codress-message");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-codress-message"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Originator_Reference =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-originator-reference");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-originator-reference"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_ReferenceIndication =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-referenceindication");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-referenceindication"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Other_Recipient_Indicator =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-other-recipient-indicator");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-other-recipient-indicator"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Acp_Message_Identifier =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-acp-message-identifier");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-acp-message-identifier"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Originator_PLAD =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-originator-plad");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-originator-plad"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Acp_Notification_Request =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-acp-notification-request");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-acp-notification-request"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Acp_Notification_Response =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-acp-notification-response");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-acp-notification-response"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Security_Classification =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-security-classification");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-security-classification"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

var X_P772_Special_Handling_Instructions =
{
 getCellText: function(row, col)
  {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.db.GetMsgHdrForKey(key);

    return hdr.getStringProperty("x-p772-special-handling-instructions");
  },

 getSortStringForRow:	function(hdr)		       { return hdr.getStringProperty("x-p772-special-handling-instructions"); },
  isString:             function()   { return true; },
  getCellProperties:	function(row, col, props)	{ },
  getRowProperties : 	function(row,props){},
  getImageSrc:          function(row, col) {return null;},
  getSortLongForRow:	function(hdr) { return 0; }

}

//column handler add
function addCustomColumnHandler() 
{ 
    if (gDBView){
		gDBView.addColumnHandler("X-P772-Version", X_P772_Version);
		gDBView.addColumnHandler('X-P772-Priority-Level-Qualifier', X_P772_Priority_Level_Qualifier);
		gDBView.addColumnHandler("X-P772-Extended-Grade-Of-Delivery", X_P772_Extended_Grade_Of_Delivery);
		gDBView.addColumnHandler("X-P772-Primary-Precedence", X_P772_Primary_Precedence);
		gDBView.addColumnHandler("X-P772-Copy-Precedence", X_P772_Copy_Precedence);
		gDBView.addColumnHandler("X-P772-Message-Type", X_P772_Message_Type);
		gDBView.addColumnHandler("X-P772-Address-List-Indicator", X_P772_Address_List_Indicator);
		gDBView.addColumnHandler("X-P772-Exempted-Address", X_P772_Exempted_Address);
		gDBView.addColumnHandler("X-P772-Extended-Authorisation-Info", X_P772_Extended_Authorisation_Info);
		gDBView.addColumnHandler("X-P772-Distribution-Codes", X_P772_Distribution_Codes);
		gDBView.addColumnHandler("X-P772-MCA", X_P772_MCA);
		gDBView.addColumnHandler("X-P772-Handling-Instructions", X_P772_Handling_Instructions);
		gDBView.addColumnHandler("X-P772-Message-Instructions", X_P772_Message_Instructions);
		gDBView.addColumnHandler("X-P772-Codress-Message", X_P772_Codress_Message);
		gDBView.addColumnHandler("X-P772-Originator-Reference", X_P772_Originator_Reference);
		gDBView.addColumnHandler("X-P772-ReferenceIndication", X_P772_ReferenceIndication);
		gDBView.addColumnHandler("X-P772-Other-Recipient-Indicator", X_P772_Other_Recipient_Indicator);
		gDBView.addColumnHandler("X-P772-Acp-Message-Identifier", X_P772_Acp_Message_Identifier);
		gDBView.addColumnHandler("X-P772-Originator-PLAD", X_P772_Originator_PLAD);
		gDBView.addColumnHandler("X-P772-Acp-Notification-Request", X_P772_Acp_Notification_Request);
		gDBView.addColumnHandler("X-P772-Acp-Notification-Response", X_P772_Acp_Notification_Response);
		gDBView.addColumnHandler("X-P772-Security-Classification", X_P772_Security_Classification);
		gDBView.addColumnHandler("X-P772-Special-Handling-Instructions", X_P772_Special_Handling_Instructions);
	}
}

//get event
window.addEventListener("load", doOnceLoaded, false);

function doOnceLoaded() {
  var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  ObserverService.addObserver(CreateDbObserver, "MsgCreateDBView", false);
  window.document.getElementById('folderTree').addEventListener("select",addCustomColumnHandler,false);
}

var CreateDbObserver = {
  // Components.interfaces.nsIObserver
  observe: function(aMsgFolder, aTopic, aData)
  {  
     addCustomColumnHandler();
  }
}