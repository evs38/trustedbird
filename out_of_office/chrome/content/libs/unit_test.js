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
 *   Olivier Brun BT Global Services / Etat francais Ministere de la Defense
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

/**
	@fileoverview Unit Test for Notifications Viewer - Require MozLab add-ons
	@author Olivier Brun BT Global Services / Etat francais Ministere de la Defense
*/


var TestCase = mozlab.mozunit.TestCase;
var assert = mozlab.mozunit.assertions;



var loader =  Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);

// includes
loader.loadSubScript("chrome://notifications_viewer/content/preferences.js");
loader.loadSubScript("chrome://notifications_viewer/content/misc.js");
loader.loadSubScript("chrome://notifications_viewer/content/unit_test_data.js");
loader.loadSubScript("chrome://notifications_viewer/content/mailParser.js");
loader.loadSubScript("chrome://notifications_viewer/content/dsnParser.js");
loader.loadSubScript("chrome://notifications_viewer/content/mdnParser.js");


var tc_Preferences = new TestCase('Preferences');
var tc_dsnparser= new TestCase('dsnParser');
var tc_mdnparser= new TestCase('mdnParser');
var tc_mailparser= new TestCase('mailParser');
var tc_custom_properties_DSN= new TestCase('customProperties DSN');
var tc_custom_properties_MDN= new TestCase('customProperties MDN');

/**
	Compare two arrays
	@param {array} array1
	@param {array} array2
	@private
	@return {boolean} true if arrays are egals
*/
function compareArrays(array1,array2) {
		// if is not an Array
		if (typeof(array1)!="object" || typeof(array2)!="object") return false;
		if (!(array1 instanceof Array) || !(array2 instanceof Array)) return false;
		// compare length
		if (array1.length != array2.length)
			return false;
		for (var i=0; i<array1.length ; i++)
			if (array1[i]!=array2[i]) return false;
		return true;
}



/**
	check if reports are equals
	@param {deliveryReport} delivery1
	@param {deliveryReport} delivery2
	@private
	@return {boolean} true if reports are equals
*/
function isDeliveryReportsEquals(delivery1,delivery2)
{
	// if is not a deliveryReport
	if (typeof(delivery1)!="object" || typeof(delivery2)!="object") return false;
	if (!(delivery1 instanceof deliveryReport) || !(delivery2 instanceof deliveryReport)) return false;

	// check equality
	if (delivery1.actionValue!=delivery2.actionValue) return false;
	if (delivery1.finalRecipient!=delivery2.finalRecipient) return false;
	if (delivery1.originalRecipient!=delivery2.originalRecipient) return false;
	if (delivery1.statusValue!=delivery2.statusValue) return false;
	if (delivery1.diagnosticCode!=delivery2.diagnosticCode) return false;
	return true;
}



/**
	check if dsnProperty objects are equals
	@param {dsnProperty} dsnProperty1
	@param {dsnProperty} dsnProperty2
	@private
	@return {boolean} true if dsnProperty objects are equals
*/
function isDsnPropertyEquals(dsnProperty1,dsnProperty2) {
	// if is not a dsnProperty
	if (typeof(dsnProperty1)!="object" || typeof(dsnProperty2)!="object") return false;
	if (!(dsnProperty1 instanceof dsnProperty) || !(dsnProperty2 instanceof dsnProperty)) return false;
	// check equality
	if (dsnProperty1.messageId!=dsnProperty2.messageId) return false;
	if (dsnProperty1.actionValue!=dsnProperty2.actionValue) return false;
	return true;
}


/**
	check if mdnProperty objects are equals
	@param {mdnProperty} mdnProperty1
	@param {mdnProperty} mdnProperty2
	@private
	@return {boolean} true if mdnProperty objects are equals
*/
function isMdnPropertyEquals(mdnProperty1,mdnProperty2) {
	// if is not a mdnProperty
	if (typeof(mdnProperty1)!="object" || typeof(mdnProperty2)!="object") return false;
	if (!(mdnProperty1 instanceof mdnProperty) || !(mdnProperty2 instanceof mdnProperty)) return false;
	// check equality
	if (mdnProperty1.messageId!=mdnProperty2.messageId) return false;
	if (mdnProperty1.dispositionType!=mdnProperty2.dispositionType) return false;
	return true;
}



/**
	check if deliveredTo objects are equals
	@param {DeliveredTo} deliveredTo1
	@param {DeliveredTo} deliveredTo2
	@private
	@return {boolean} true if deliveredTo objects are equals
*/
function isDeliveredToEquals(deliveredTo1,deliveredTo2)
{
	// if is not a DeliveredTo
	if (typeof(deliveredTo1)!="object" || typeof(deliveredTo2)!="object") return false;
	if (!(deliveredTo1 instanceof DeliveredTo) || !(deliveredTo2 instanceof DeliveredTo)) return false;

	// check equality
	if (deliveredTo1.finalRecipient!=deliveredTo2.finalRecipient) return false;
	if (deliveredTo1.flags!=deliveredTo2.flags) return false;

	if (deliveredTo1.dsnList.length != deliveredTo2.dsnList.length)
		return false;
	for (var i=0 ; i < deliveredTo1.dsnList.length; i++) {
		if (! isDsnPropertyEquals(deliveredTo1.dsnList[i],deliveredTo2.dsnList[i])) return false;
	}

	if (deliveredTo1.mdnList.length != deliveredTo2.mdnList.length)
		return false;

	for (var i=0 ; i < deliveredTo1.mdnList.length ; i++) {
		if (! isMdnPropertyEquals(deliveredTo1.mdnList[i],deliveredTo2.mdnList[i])) return false;
	}

	return true;
}


/**
	check if mdnReport objects are equals
	@param {mdnReport} mdnReport1
	@param {mdnReport} mdnReport2
	@private
	@return {boolean} true if mdnReport objects are equals
*/
function isMdnReportEquals(mdnReport1,mdnReport2)
{
	// if is not a mdnReport
	if (typeof(mdnReport1)!="object" || typeof(mdnReport2)!="object") return false;
	if (!(mdnReport1 instanceof mdnReport) || !(mdnReport2 instanceof mdnReport)) return false;

	// check equality
	if (mdnReport1.reportingUA!=mdnReport2.reportingUA) return false;
	if (mdnReport1.mdnGateway!=mdnReport2.mdnGateway) return false;
	if (mdnReport1.originalRecipient!=mdnReport2.originalRecipient) return false;
	if (mdnReport1.finalRecipient!=mdnReport2.finalRecipient) return false;
	if (mdnReport1.originalMessageId!=mdnReport2.originalMessageId) return false;
	if (mdnReport1.dispositionMode!=mdnReport2.dispositionMode) return false;
	if (mdnReport1.dispositionType!=mdnReport2.dispositionType) return false;
	return true;
}



// create dsnParser Objects
var objParser = new dsnParser(msgDSN.join("")); // a valid delivery report (action=delivered)
var objParser2 = new dsnParser(msgDSN2.join("")); // a valid delivery report (action=failed)
var objParserKo = new dsnParser(msgNoDSN.join("")); // a multipart message (no DSN)
var objParserKo2 = new dsnParser(msgBadDSN.join("")); // an invalid delivery report

// create mdnParser Objects
var objMdnParser= new mdnParser(MdnDisplayed); // a displayed message
var objMdnParser2= new mdnParser(MdnDenied); // a Denied message
var objMdnParser3= new mdnParser(msgDSN.join("")); // a DSN !

/**
	mailParser unit test
	@see mailParser
*/
tc_mailparser.tests = {
	'getHeaders' : function() {
		assert.equals(objParser.getHeaders(),msgDSN[0]); //true
		assert.equals(objParser2.getHeaders(),msgDSN2[0]); //true
		assert.equals(objParserKo.getHeaders(),msgNoDSN[0]); //true
		assert.equals(objParserKo2.getHeaders(),msgBadDSN[0]); //true
	},
	'getBody' : function() {
		assert.equals(objParser.getBody(),msgDSN.slice(2).join("")); //true
		assert.equals(objParser2.getBody(),msgDSN2.slice(2).join("")); //true
		assert.equals(objParserKo.getBody(),msgNoDSN.slice(2).join("")); //true
		assert.equals(objParserKo2.getBody(),msgBadDSN.slice(2).join("")); //true
	},
	'getMsgId' : function() {
		assert.equals(objParser.getMsgId(),"<20080213131118.4DD991FF88@mydesktop.vraimentbidon.org>"); // true
		assert.equals(objParser2.getMsgId(),"<20080213135516.54E3C1FF8B@mydesktop.vraimentbidon.org>"); // true
		assert.equals(objParserKo.getMsgId(),"<47C2C52F.2080503@vraimentbidon.org>"); // true
		assert.equals(objParserKo2.getMsgId(),"<20080213131118.4DD991FF88@mydesktop.vraimentbidon.org>"); // true
	},
	'getParts': function() {
		assert.isTrue(compareArrays(objParser.getParts(),[msgDSN[4],msgDSN[6],msgDSN[8]])); //true
		assert.isTrue(compareArrays(objParser2.getParts(),[msgDSN2[4],msgDSN2[6],msgDSN2[8]])); //true
		assert.isTrue(compareArrays(objParserKo.getParts(),[msgNoDSN[4],msgNoDSN[6]])); //true
		assert.isTrue(compareArrays(objParserKo2.getParts(),[msgBadDSN[3],msgBadDSN[5],msgBadDSN[7]])); //true
	},
	'getValueFromField' : function() {
		var myData="In-Reply-To: <14584@vraimentbidon.org>\n"+
			"Diagnostic: je suis\n"+
			" sur plusieurs\n"+
			" lignes\n"+
			"MIME-Version: 1.0\n"+
			"Final-Recipient: rfc822;louisl@larry.slip.umd.edu\n"+
			"Action: failed\n"+
			"Status:\n"+
			 "	4.0.0\n"+
			"Diagnostic-Code: smtp; 426 connection timed out\n";

		assert.equals(objParser.getValueFromField("Final-Recipient",myData),"rfc822;louisl@larry.slip.umd.edu");
		assert.equals(objParser.getValueFromField("Status",myData),"4.0.0");
		assert.equals(objParser.getValueFromField("Diagnostic-Code",myData),"smtp; 426 connection timed out");
		assert.equals(objParser.getValueFromField("Action",myData),"failed");
		assert.equals(objParser.getValueFromField("Diagnostic",myData),"je suis\n sur plusieurs\n lignes");
		assert.equals(objParser.getValueFromField("MIME-Version",myData),"1.0");
		assert.equals(objParser.getValueFromField("In-Reply-To",myData),"<14584@vraimentbidon.org>");
	}
}


/**
	dsnParser unit test
	@see dsnParser
*/
tc_dsnparser.tests = {
	'isValidReport': function() {
		assert.isTrue(objParser.isValidReport("delivered")); //true
		assert.isTrue(objParser.isValidReport("failed")); //true
		assert.isTrue(objParser.isValidReport("relayed")); //true
		assert.isTrue(objParser.isValidReport("expanded")); //true
		assert.isTrue(objParser.isValidReport("delayed")); //true
		assert.isFalse(objParser.isValidReport("other")); //false
	},
	'isDeliveryStatus': function() {
		assert.isTrue(objParser.isDeliveryStatus()); //true
		assert.isTrue(objParser2.isDeliveryStatus()); //true
		assert.isFalse(objParserKo.isDeliveryStatus()); //false
		assert.isTrue(objParserKo2.isDeliveryStatus()); //true
	},
	'getReportFromFields': function() {
		var myDeliveryReport=new deliveryReport();
		myDeliveryReport.actionValue="delivered";
		myDeliveryReport.finalRecipient="rfc822; daniel@vraimentbidon.ORG";
		myDeliveryReport.originalRecipient="rfc822;daniel@vraimentbidon.ORG";
		myDeliveryReport.statusValue="2.0.0";
		myDeliveryReport.diagnosticCode="X-Postfix; delivery via local: delivered to mailbox";

		var report=objParser.getReportFromFields("Final-Recipient: rfc822; daniel@vraimentbidon.ORG\n"+
				"Original-Recipient: rfc822;daniel@vraimentbidon.ORG\n"+
				"Action: delivered\n"+
				"Status: 2.0.0\n"+
				"Diagnostic-Code: X-Postfix; delivery via local: delivered to mailbox\n\n");


		// check equality
		assert.isTrue(isDeliveryReportsEquals(report,myDeliveryReport));

		// test if no report
		report=objParser.getReportFromFields("a bad report \nAction: value");
		assert.equals(report,null);

		// an other delivery
		myDeliveryReport.actionValue="failed";
		myDeliveryReport.finalRecipient="rfc822; autre.compte@vraimentbidon.org";
		myDeliveryReport.originalRecipient="";
		myDeliveryReport.statusValue="5.1.1";
		myDeliveryReport.diagnosticCode="X-Postfix; unknown user: \"autre.compte\"";

		report=objParser.getReportFromFields("Final-Recipient: rfc822; autre.compte@vraimentbidon.org\n"+
				"Action: failed\n"+
				"Status: 5.1.1\n"+
				"Diagnostic-Code: X-Postfix; unknown user: \"autre.compte\"\n\n");

		// check equality
		assert.isTrue(isDeliveryReportsEquals(report,myDeliveryReport));
	},

	'getOriginalMsgId': function() {
		assert.equals(objParser.getOriginalMsgId(),"<20080213130850.E9AED1FF86@mydesktop.vraimentbidon.org>"); // true
		assert.equals(objParser2.getOriginalMsgId(),"<20080213135515.B3C761FF89@mydesktop.vraimentbidon.org>"); // true
		assert.equals(objParserKo.getOriginalMsgId(),null); // true
		assert.equals(objParserKo2.getOriginalMsgId(),"<20080213130850.E9AED1FF86@mydesktop.vraimentbidon.org>"); // true
	},

	'getDeliveryReports': function() {
		var resu=objParser.getDeliveryReports();
		assert.equals(typeof(resu),"object");
		assert.isTrue(resu instanceof Array);
		// 2 reports in this message
		assert.equals(resu.length,2);
		assert.equals(resu[0].actionValue,"delivered");
		assert.equals(resu[1].actionValue,"delivered");
		assert.equals(resu[0].originalRecipient,"rfc822;sertim@vraimentbidon.ORG");
		assert.equals(resu[1].originalRecipient,"rfc822;daniel@vraimentbidon.ORG");
		resu=objParserKo.getDeliveryReports();
		assert.equals(resu,null);
		resu=objParserKo2.getDeliveryReports();
		assert.equals(resu.length,0);
	}
}

/**
	mdnParser unit test
	@see mdnParser
*/
tc_mdnparser.tests = {
	'isValidDisposition': function() {
		assert.isTrue(objMdnParser.isValidDisposition("displayed"));
		assert.isTrue(objMdnParser.isValidDisposition("deleted"));
		assert.isTrue(objMdnParser.isValidDisposition("dispatched"));
		assert.isTrue(objMdnParser.isValidDisposition("processed"));
		assert.isTrue(objMdnParser.isValidDisposition("denied"));
		assert.isTrue(objMdnParser.isValidDisposition("failed"));
		assert.isFalse(objMdnParser.isValidDisposition("bad"));
	},
	'isMessageDisposition': function() {
		assert.isTrue(objMdnParser.isMessageDisposition());
		assert.isTrue(objMdnParser2.isMessageDisposition());
		assert.isFalse(objMdnParser3.isMessageDisposition());
	},
	'getMdnReport': function() {
		var resu=objMdnParser.getMdnReport();
		assert.equals(typeof(resu),"object");
		assert.isTrue(resu instanceof mdnReport);
		myMdnReport=new mdnReport();
		myMdnReport.reportingUA="villou-gutsy; KMime 0.1.0";
		myMdnReport.finalRecipient="rfc822; Daniel Rocher <daniel@vraimentbidon.org>";
		myMdnReport.originalMessageId="<200804242037.54209.daniel@vraimentbidon.org>";
		myMdnReport.dispositionMode="manual-action/MDN-sent-manually";
		myMdnReport.dispositionType="displayed";

		// check equality
		assert.isTrue(isMdnReportEquals(resu,myMdnReport));

		resu=objMdnParser2.getMdnReport();
		assert.equals(typeof(resu),"object");
		assert.isTrue(resu instanceof mdnReport);
		myMdnReport.originalMessageId="<200804242037.37481.daniel@vraimentbidon.org>";
		myMdnReport.dispositionType="denied";

		// check equality
		assert.isTrue(isMdnReportEquals(resu,myMdnReport));

		resu=objMdnParser3.getMdnReport(); //not a MDN
		assert.equals(resu,null);
	},
	'getReportFromFields': function() {
		myMdnReport=new mdnReport();
		myMdnReport.reportingUA="villou-gutsy; KMime 0.1.0";
		myMdnReport.finalRecipient="rfc822; Daniel Rocher <daniel@vraimentbidon.org>";
		myMdnReport.originalMessageId="<200804242037.54209.daniel@vraimentbidon.org>";
		myMdnReport.dispositionMode="manual-action/MDN-sent-manually";
		myMdnReport.dispositionType="displayed";

		var report=objMdnParser.getReportFromFields("Reporting-UA: villou-gutsy; KMime 0.1.0\n"+
			"Final-Recipient: rfc822; Daniel Rocher <daniel@vraimentbidon.org>\n"+
			"Original-Message-ID: <200804242037.54209.daniel@vraimentbidon.org>\n"+
			"Disposition: manual-action/MDN-sent-manually; displayed\n\n");
		// check equality
		assert.isTrue(isMdnReportEquals(report,myMdnReport))
;
		myMdnReport.originalMessageId="<200804242037.37481.daniel@vraimentbidon.org>";
		myMdnReport.dispositionType="denied";

		report=objMdnParser2.getReportFromFields("Reporting-UA: villou-gutsy; KMime 0.1.0\n"+
			"Final-Recipient: rfc822; Daniel Rocher <daniel@vraimentbidon.org>\n"+
			"Original-Message-ID: <200804242037.37481.daniel@vraimentbidon.org>\n"+
			"Disposition: manual-action/MDN-sent-manually; denied\n\n");
		// check equality
		assert.isTrue(isMdnReportEquals(report,myMdnReport));
	}
}

var preferences=new Preferences();
var wordList = ["erable","chaine","bouleau"];
var keyCharTest="extensions.notifications_viewer.unittestchar";
var keyBoolTest="extensions.notifications_viewer.unittestbool";
var keyIntTest="extensions.notifications_viewer.unittestint";

/**
	Preferences unit test
	@see Preferences
*/
tc_Preferences.tests = {

	'charPrefExist': function() {
		assert.isTrue(preferences.charPrefExist("mailnews.customDBHeaders")); //true
		assert.isFalse(preferences.charPrefExist("noExist")); // false
	},

	'createCharPref': function() {
		assert.isTrue(preferences.createCharPref(keyCharTest)); // true
		assert.isTrue(preferences.charPrefExist(keyCharTest)); //true
	},
	'addWordIfNotExist wordExist': function() {
		// add
		for (var i=0 ; i < wordList.length ; i++)
		{
			assert.isTrue(preferences.addWordIfNotExist(keyCharTest,wordList[i])); //true
			// test if exist
			for (var j=0 ; j <= i ; j++) {
				assert.isTrue(preferences.wordExist(keyCharTest,wordList[j])); //true
			}
		}
	},
	'getCharPrefFromKey': function() {
		// get an array
		var myTab=preferences.getCharPrefFromKey(keyCharTest);
		// test length
		assert.equals(myTab.length,wordList.length);
		// test equal
		for (var i=0 ; i < myTab.length ; i++) {
			assert.equals(myTab[i],wordList[i]);
		}
	},

	'removeWord wordExist': function() {
		//now remove
		for (var i=0 ; i < wordList.length ; i++)
		{
			assert.isTrue(preferences.removeWord(keyCharTest,wordList[i])); //true
			for (var j=0 ; j < wordList.length ; j++) {
				// test if exist (or not)
				if (j<=i)
					assert.isFalse(preferences.wordExist(keyCharTest,wordList[j])); //false
				else
					assert.isTrue(preferences.wordExist(keyCharTest,wordList[j])); //true
			}
		}
	},

	'setCharPref getCharPref': function() {
		var val="unittest";
		assert.isTrue(preferences.setCharPref(keyCharTest,val)); //true
		assert.equals(preferences.getCharPref(keyCharTest),val); //true
	},

	'setBoolPref getBoolPref': function() {
		var val=true;
		assert.isTrue(preferences.setBoolPref(keyBoolTest,val)); //true
		assert.equals(preferences.getBoolPref(keyBoolTest),val); //true
	},

	'boolPrefExist': function() {
		assert.isTrue(preferences.boolPrefExist(keyBoolTest)); //true
		assert.isFalse(preferences.boolPrefExist("noExist")); //false
	},

	'setIntPref getIntPref': function() {
		var val=575;
		assert.isTrue(preferences.setIntPref(keyIntTest,val)); //true
		assert.equals(preferences.getIntPref(keyIntTest),val); //true
	},

	'intPrefExist': function() {
		assert.isTrue(preferences.intPrefExist(keyIntTest)); //true
		assert.isFalse(preferences.intPrefExist("noExist")); //false
	},
	

	'clean': function() {
		preferences.pref.clearUserPref (keyCharTest);
		preferences.pref.clearUserPref (keyBoolTest);
		preferences.pref.clearUserPref (keyIntTest);
		assert.isFalse(preferences.charPrefExist(keyCharTest)); // false
		assert.isFalse(preferences.boolPrefExist(keyBoolTest)); // false
		assert.isFalse(preferences.intPrefExist(keyIntTest)); // false
	}
}


// create a customProperties object
customprop= new customProperties("daniel@vraimentbidon.org;0\n\traymond@vraimentbidon.org;0\n\tpatrick@vraimentbidon.org;0\n\tpierre@vraimentbidon.org;0","","","2","","");
var tmpDeliveredTo1=new DeliveredTo("daniel@vraimentbidon.org",0);
var tmpDeliveredTo2=new DeliveredTo("raymond@vraimentbidon.org",0);
var tmpDeliveredTo3=new DeliveredTo("patrick@vraimentbidon.org",0);
var tmpDeliveredTo4=new DeliveredTo("pierre@vraimentbidon.org",0);
var tmpDeliveredTo5=new DeliveredTo("admin@vraimentbidon.org",0);


/**
	customProperties unit test for DSN
	@see customProperties
*/
tc_custom_properties_DSN.tests = {
	'checkInitialValues' : function() {
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;0;0;0\n\traymond@vraimentbidon.org;0;0;0\n\tpatrick@vraimentbidon.org;0;0;0\n\tpierre@vraimentbidon.org;0;0;0");
		assert.equals(customprop.dsnSummaryProperty,"");
		assert.equals(customprop.statusProperty,"");
		assert.equals(customprop.flagsProperty,"2");
		assert.equals(customprop.mdnDisplayedSummaryProperty,"");
		assert.equals(customprop.mdnDeletedSummaryProperty,"");
		assert.isFalse(customprop.allDsnReceived);
	},
	'getReportOf' : function() {
		assert.equals(customprop.getReportOf("noexist@vraimentbidon.org"),null); // no answer
		assert.equals(typeof(customprop.getReportOf("daniel@vraimentbidon.org")),"object");
		assert.isTrue((customprop.getReportOf("daniel@vraimentbidon.org")) instanceof DeliveredTo);
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("raymond@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("patrick@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("pierre@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isFalse(customprop.allDsnReceived);
	},

	'addDelayedReport' : function() {
		var report=new deliveryReport();
		tmpDeliveredTo1.dsnList.push (new dsnProperty("delayed","<123456@vraimentbidon.org>"));
		report.finalRecipient="rfc822;daniel@vraimentbidon.org";
		report.actionValue="delayed";
		assert.isTrue(customprop.addDsnReport(report,"<123456@vraimentbidon.org>"));
		dump(customprop.getTxtProperties());
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;0;1;delayed;<123456@vraimentbidon.org>;0\n\traymond@vraimentbidon.org;0;0;0\n\tpatrick@vraimentbidon.org;0;0;0\n\tpierre@vraimentbidon.org;0;0;0");
		assert.equals(customprop.getDsnSummaryProperty(),"0/4");
		assert.equals(customprop.getStatusProperty(),"");
		assert.equals(customprop.getFlagsProperty(),"2");
		assert.equals(customprop.getMdnDisplayedSummaryProperty(),"");
		assert.equals(customprop.getMdnDeletedSummaryProperty(),"");
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("raymond@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("patrick@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("pierre@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isFalse(customprop.allDsnReceived);
	},
	'addDeliveredReport' : function() {
		var report=new deliveryReport();
		tmpDeliveredTo1.dsnList.push (new dsnProperty("delivered","<654321@vraimentbidon.org>"));
		report.finalRecipient="rfc822;daniel@vraimentbidon.org";
		report.actionValue="delivered";
		assert.isTrue(customprop.addDsnReport(report,"<654321@vraimentbidon.org>"));
		dump(customprop.getTxtProperties());
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;0;2;delayed;<123456@vraimentbidon.org>;delivered;<654321@vraimentbidon.org>;0\n\traymond@vraimentbidon.org;0;0;0\n\tpatrick@vraimentbidon.org;0;0;0\n\tpierre@vraimentbidon.org;0;0;0");
		assert.equals(customprop.getDsnSummaryProperty(),"1/4");
		assert.equals(customprop.getStatusProperty(),"");
		assert.equals(customprop.getFlagsProperty(),"2");
		assert.equals(customprop.getMdnDisplayedSummaryProperty(),"");
		assert.equals(customprop.getMdnDeletedSummaryProperty(),"");
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("raymond@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("patrick@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("pierre@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isFalse(customprop.allDsnReceived);
	},
	'addRelayedReport' : function() {
		var report=new deliveryReport();
		tmpDeliveredTo2.dsnList.push (new dsnProperty("relayed","<98765@vraimentbidon.org>"));
		report.finalRecipient="rfc822;raymond@vraimentbidon.org";
		report.actionValue="relayed";
		assert.isTrue(customprop.addDsnReport(report,"<98765@vraimentbidon.org>"));
		dump(customprop.getTxtProperties());
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;0;2;delayed;<123456@vraimentbidon.org>;delivered;<654321@vraimentbidon.org>;0\n\traymond@vraimentbidon.org;0;1;relayed;<98765@vraimentbidon.org>;0\n\tpatrick@vraimentbidon.org;0;0;0\n\tpierre@vraimentbidon.org;0;0;0");
		assert.equals(customprop.getDsnSummaryProperty(),"1/4");
		assert.equals(customprop.getStatusProperty(),"middle");
		assert.equals(customprop.getFlagsProperty(),"2");
		assert.equals(customprop.getMdnDisplayedSummaryProperty(),"");
		assert.equals(customprop.getMdnDeletedSummaryProperty(),"");
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("raymond@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("patrick@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("pierre@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isFalse(customprop.allDsnReceived);
	},
	'addExpendedReport' : function() {
		var report=new deliveryReport();
		tmpDeliveredTo3.dsnList.push (new dsnProperty("expanded","<741258@vraimentbidon.org>"));
		report.finalRecipient="rfc822;patrick@vraimentbidon.org";
		report.actionValue="expanded";
		assert.isTrue(customprop.addDsnReport(report,"<741258@vraimentbidon.org>"));
		dump(customprop.getTxtProperties());
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;0;2;delayed;<123456@vraimentbidon.org>;delivered;<654321@vraimentbidon.org>;0\n\traymond@vraimentbidon.org;0;1;relayed;<98765@vraimentbidon.org>;0\n\tpatrick@vraimentbidon.org;0;1;expanded;<741258@vraimentbidon.org>;0\n\tpierre@vraimentbidon.org;0;0;0");
		assert.equals(customprop.getDsnSummaryProperty(),"2/4");
		assert.equals(customprop.getStatusProperty(),"middle");
		assert.equals(customprop.getFlagsProperty(),"2");
		assert.equals(customprop.getMdnDisplayedSummaryProperty(),"");
		assert.equals(customprop.getMdnDeletedSummaryProperty(),"");
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("raymond@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("patrick@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("pierre@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isFalse(customprop.allDsnReceived);
	},
	'addFailedReport' : function() {
		var report=new deliveryReport();
		tmpDeliveredTo4.dsnList.push (new dsnProperty("failed","<963258@vraimentbidon.org>"));
		report.finalRecipient="rfc822;pierre@vraimentbidon.org";
		report.actionValue="failed";
		assert.isTrue(customprop.addDsnReport(report,"<963258@vraimentbidon.org>"));
		dump(customprop.getTxtProperties());
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;0;2;delayed;<123456@vraimentbidon.org>;delivered;<654321@vraimentbidon.org>;0\n\traymond@vraimentbidon.org;0;1;relayed;<98765@vraimentbidon.org>;0\n\tpatrick@vraimentbidon.org;0;1;expanded;<741258@vraimentbidon.org>;0\n\tpierre@vraimentbidon.org;0;1;failed;<963258@vraimentbidon.org>;0");
		assert.equals(customprop.getDsnSummaryProperty(),"2/4");
		assert.equals(customprop.getStatusProperty(),"bad");
		assert.equals(customprop.getFlagsProperty(),"2");
		assert.equals(customprop.getMdnDisplayedSummaryProperty(),"");
		assert.equals(customprop.getMdnDeletedSummaryProperty(),"");
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("raymond@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("patrick@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("pierre@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isTrue(customprop.allDsnReceived);
	},
	'allDsnReceived' : function() {
		var report=new deliveryReport();
		tmpDeliveredTo5.dsnList.push (new dsnProperty("delayed","<7412369@vraimentbidon.org>"));
		report.finalRecipient="rfc822;admin@vraimentbidon.org";
		report.actionValue="delayed";
		assert.isTrue(customprop.allDsnReceived);
		assert.isTrue(customprop.addDsnReport(report,"<7412369@vraimentbidon.org>"));
		dump(customprop.getTxtProperties());
		assert.isFalse(customprop.allDsnReceived);
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;0;2;delayed;<123456@vraimentbidon.org>;delivered;<654321@vraimentbidon.org>;0\n\traymond@vraimentbidon.org;0;1;relayed;<98765@vraimentbidon.org>;0\n\tpatrick@vraimentbidon.org;0;1;expanded;<741258@vraimentbidon.org>;0\n\tpierre@vraimentbidon.org;0;1;failed;<963258@vraimentbidon.org>;0\n\tadmin@vraimentbidon.org;0;1;delayed;<7412369@vraimentbidon.org>;0");
		assert.equals(customprop.getDsnSummaryProperty(),"2/5");
		assert.equals(customprop.getStatusProperty(),"bad");
		assert.equals(customprop.getFlagsProperty(),"2");
		assert.equals(customprop.getMdnDisplayedSummaryProperty(),"");
		assert.equals(customprop.getMdnDeletedSummaryProperty(),"");
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("raymond@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("patrick@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("pierre@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("admin@vraimentbidon.org"),tmpDeliveredTo5));


		tmpDeliveredTo5.dsnList.push (new dsnProperty("delivered","<963248@vraimentbidon.org>"));
		report.finalRecipient="rfc822;admin@vraimentbidon.org";
		report.actionValue="delivered";
		assert.isTrue(customprop.addDsnReport(report,"<963248@vraimentbidon.org>"));
		dump(customprop.getTxtProperties());
		assert.isTrue(customprop.allDsnReceived);
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;0;2;delayed;<123456@vraimentbidon.org>;delivered;<654321@vraimentbidon.org>;0\n\traymond@vraimentbidon.org;0;1;relayed;<98765@vraimentbidon.org>;0\n\tpatrick@vraimentbidon.org;0;1;expanded;<741258@vraimentbidon.org>;0\n\tpierre@vraimentbidon.org;0;1;failed;<963258@vraimentbidon.org>;0\n\tadmin@vraimentbidon.org;0;2;delayed;<7412369@vraimentbidon.org>;delivered;<963248@vraimentbidon.org>;0");
		assert.equals(customprop.getDsnSummaryProperty(),"3/5");
		assert.equals(customprop.getStatusProperty(),"bad");
		assert.equals(customprop.getFlagsProperty(),"2");
		assert.equals(customprop.getMdnDisplayedSummaryProperty(),"");
		assert.equals(customprop.getMdnDeletedSummaryProperty(),"");
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("raymond@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("patrick@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("pierre@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("admin@vraimentbidon.org"),tmpDeliveredTo5));
	},
	'goodStatus' : function() {
		// changed it artificially
		tmpDeliveredTo2.dsnList[0].actionValue="delivered";
		tmpDeliveredTo4.dsnList[0].actionValue="delivered";
		customprop.deliveredToArray[1].dsnList[0].actionValue="delivered";
		customprop.deliveredToArray[3].dsnList[0].actionValue="delivered";
		customprop.calculateAllProperties(); // refresh
		dump(customprop.getTxtProperties());
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;0;2;delayed;<123456@vraimentbidon.org>;delivered;<654321@vraimentbidon.org>;0\n\traymond@vraimentbidon.org;0;1;delivered;<98765@vraimentbidon.org>;0\n\tpatrick@vraimentbidon.org;0;1;expanded;<741258@vraimentbidon.org>;0\n\tpierre@vraimentbidon.org;0;1;delivered;<963258@vraimentbidon.org>;0\n\tadmin@vraimentbidon.org;0;2;delayed;<7412369@vraimentbidon.org>;delivered;<963248@vraimentbidon.org>;0");
		assert.equals(customprop.getDsnSummaryProperty(),"5/5");
		assert.equals(customprop.getStatusProperty(),"good");
		assert.equals(customprop.getFlagsProperty(),"2");
		assert.equals(customprop.getMdnDisplayedSummaryProperty(),"");
		assert.equals(customprop.getMdnDeletedSummaryProperty(),"");
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("raymond@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("patrick@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("pierre@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("admin@vraimentbidon.org"),tmpDeliveredTo5));
		assert.isTrue(customprop.allDsnReceived);
	},
	'setMsgAsExpired' : function() {
		// changed it artificially
		tmpDeliveredTo2.dsnList[0].actionValue="delayed";
		tmpDeliveredTo2.flags=0x1;
		tmpDeliveredTo4.dsnList.pop();
		tmpDeliveredTo4.flags=0x1;
		customprop.deliveredToArray[1].dsnList[0].actionValue="delayed";
		customprop.deliveredToArray[3].dsnList.pop();
		customprop.calculateAllProperties(); // refresh
		dump(customprop.getTxtProperties());

		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;0;2;delayed;<123456@vraimentbidon.org>;delivered;<654321@vraimentbidon.org>;0\n\traymond@vraimentbidon.org;0;1;delayed;<98765@vraimentbidon.org>;0\n\tpatrick@vraimentbidon.org;0;1;expanded;<741258@vraimentbidon.org>;0\n\tpierre@vraimentbidon.org;0;0;0\n\tadmin@vraimentbidon.org;0;2;delayed;<7412369@vraimentbidon.org>;delivered;<963248@vraimentbidon.org>;0");
		assert.equals(customprop.getDsnSummaryProperty(),"3/5");
		assert.equals(customprop.getStatusProperty(),"");
		assert.equals(customprop.getFlagsProperty(),"2");
		assert.equals(customprop.getMdnDisplayedSummaryProperty(),"");
		assert.equals(customprop.getMdnDeletedSummaryProperty(),"");
		// set time out flag
		customprop.setMsgAsExpired();

		dump(customprop.getTxtProperties());
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;0;2;delayed;<123456@vraimentbidon.org>;delivered;<654321@vraimentbidon.org>;0\n\traymond@vraimentbidon.org;1;1;delayed;<98765@vraimentbidon.org>;0\n\tpatrick@vraimentbidon.org;0;1;expanded;<741258@vraimentbidon.org>;0\n\tpierre@vraimentbidon.org;1;0;0\n\tadmin@vraimentbidon.org;0;2;delayed;<7412369@vraimentbidon.org>;delivered;<963248@vraimentbidon.org>;0");
		assert.equals(customprop.getDsnSummaryProperty(),"3/5");
		assert.equals(customprop.getStatusProperty(),"");
		assert.equals(customprop.getFlagsProperty(),"3");
		assert.equals(customprop.getMdnDisplayedSummaryProperty(),"");
		assert.equals(customprop.getMdnDeletedSummaryProperty(),"");
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("raymond@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("patrick@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("pierre@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("admin@vraimentbidon.org"),tmpDeliveredTo5));
		assert.isFalse(customprop.allDsnReceived);
	}
}


/**
	customProperties unit test for MDN
	@see customProperties
*/
tc_custom_properties_MDN.tests = {
	'addDisplayedReport' : function() {
		var report=new mdnReport();
		tmpDeliveredTo4.mdnList.push (new mdnProperty("displayed","<AQWXSZ@vraimentbidon.org>"));
		report.finalRecipient="rfc822;pierre@vraimentbidon.org";
		report.dispositionType="displayed";
		assert.isTrue(customprop.addMdnReport(report,"<AQWXSZ@vraimentbidon.org>"));
		dump(customprop.getTxtProperties());
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;0;2;delayed;<123456@vraimentbidon.org>;delivered;<654321@vraimentbidon.org>;0\n\traymond@vraimentbidon.org;1;1;delayed;<98765@vraimentbidon.org>;0\n\tpatrick@vraimentbidon.org;0;1;expanded;<741258@vraimentbidon.org>;0\n\tpierre@vraimentbidon.org;1;0;1;displayed;<AQWXSZ@vraimentbidon.org>\n\tadmin@vraimentbidon.org;0;2;delayed;<7412369@vraimentbidon.org>;delivered;<963248@vraimentbidon.org>;0");
		assert.equals(customprop.getDsnSummaryProperty(),"3/5");
		assert.equals(customprop.getStatusProperty(),"");
		assert.equals(customprop.getFlagsProperty(),"3");
		assert.equals(customprop.getMdnDisplayedSummaryProperty(),"1/5");
		assert.equals(customprop.getMdnDeletedSummaryProperty(),"");
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("raymond@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("patrick@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("pierre@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("admin@vraimentbidon.org"),tmpDeliveredTo5));
	},
	'addDeletedReport' : function() {
		var report=new mdnReport();
		tmpDeliveredTo1.mdnList.push (new mdnProperty("deleted","<MLKJH@vraimentbidon.org>"));
		tmpDeliveredTo4.mdnList.push (new mdnProperty("deleted","<EDCVFR@vraimentbidon.org>"));
		report.finalRecipient="rfc822;daniel@vraimentbidon.org";
		report.dispositionType="deleted";
		assert.isTrue(customprop.addMdnReport(report,"<MLKJH@vraimentbidon.org>"));
		report.finalRecipient="rfc822;pierre@vraimentbidon.org";
		report.dispositionType="deleted";
		assert.isTrue(customprop.addMdnReport(report,"<EDCVFR@vraimentbidon.org>"));
		dump(customprop.getTxtProperties());
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;0;2;delayed;<123456@vraimentbidon.org>;delivered;<654321@vraimentbidon.org>;1;deleted;<MLKJH@vraimentbidon.org>\n\traymond@vraimentbidon.org;1;1;delayed;<98765@vraimentbidon.org>;0\n\tpatrick@vraimentbidon.org;0;1;expanded;<741258@vraimentbidon.org>;0\n\tpierre@vraimentbidon.org;1;0;2;displayed;<AQWXSZ@vraimentbidon.org>;deleted;<EDCVFR@vraimentbidon.org>\n\tadmin@vraimentbidon.org;0;2;delayed;<7412369@vraimentbidon.org>;delivered;<963248@vraimentbidon.org>;0");
		assert.equals(customprop.getDsnSummaryProperty(),"3/5");
		assert.equals(customprop.getStatusProperty(),"");
		assert.equals(customprop.getFlagsProperty(),"3");
		assert.equals(customprop.getMdnDisplayedSummaryProperty(),"1/5");
		assert.equals(customprop.getMdnDeletedSummaryProperty(),"2/5");
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("raymond@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("patrick@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("pierre@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("admin@vraimentbidon.org"),tmpDeliveredTo5));
	},
	'addInvalidReport' : function() {
		var report=new mdnReport();
		report.finalRecipient="rfc822;daniel@vraimentbidon.org";
		report.dispositionType="bad";
		assert.isFalse(customprop.addMdnReport(report,"<MLKJH@vraimentbidon.org>")); // return false
		// properties unchanged
		dump(customprop.getTxtProperties());
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;0;2;delayed;<123456@vraimentbidon.org>;delivered;<654321@vraimentbidon.org>;1;deleted;<MLKJH@vraimentbidon.org>\n\traymond@vraimentbidon.org;1;1;delayed;<98765@vraimentbidon.org>;0\n\tpatrick@vraimentbidon.org;0;1;expanded;<741258@vraimentbidon.org>;0\n\tpierre@vraimentbidon.org;1;0;2;displayed;<AQWXSZ@vraimentbidon.org>;deleted;<EDCVFR@vraimentbidon.org>\n\tadmin@vraimentbidon.org;0;2;delayed;<7412369@vraimentbidon.org>;delivered;<963248@vraimentbidon.org>;0");
		assert.equals(customprop.getDsnSummaryProperty(),"3/5");
		assert.equals(customprop.getStatusProperty(),"");
		assert.equals(customprop.getFlagsProperty(),"3");
		assert.equals(customprop.getMdnDisplayedSummaryProperty(),"1/5");
		assert.equals(customprop.getMdnDeletedSummaryProperty(),"2/5");
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("raymond@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("patrick@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("pierre@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("admin@vraimentbidon.org"),tmpDeliveredTo5));
	}
}



