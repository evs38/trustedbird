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
	@fileoverview Unit Test for Notifications Viewer - Require MozLab add-ons
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/


var TestCase = mozlab.mozunit.TestCase;
var assert = mozlab.mozunit.assertions;



var loader =  Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);

// includes
loader.loadSubScript("chrome://notifications_viewer/content/preferences.js");
loader.loadSubScript("chrome://notifications_viewer/content/misc.js");
loader.loadSubScript("chrome://notifications_viewer/content/deliveryReport.js");
loader.loadSubScript("chrome://notifications_viewer/content/customProperties.js");
loader.loadSubScript("chrome://notifications_viewer/content/unit_test_inc.js");
loader.loadSubScript("chrome://notifications_viewer/content/mailParser.js");
var dsnparser = new Object();
loader.loadSubScript("chrome://notifications_viewer/content/dsnParser.js",dsnparser);


var tc_Preferences = new TestCase('Preferences');
var tc_dsnparser= new TestCase('dsnParser');
var tc_mailparser= new TestCase('mailParser');
var tc_custom_properties= new TestCase('customProperties');


/**
	Compare two arrays
	@param {array} array1
	@param {array} array2
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
	check if deliveredTo objects are equals
	@param {DeliveredTo} deliveredTo1
	@param {DeliveredTo} deliveredTo2
	@return {boolean} true if deliveredTo objects are equals
*/
function isDeliveredToEquals(deliveredTo1,deliveredTo2)
{
	// if is not a DeliveredTo
	if (typeof(deliveredTo1)!="object" || typeof(deliveredTo2)!="object") return false;
	if (!(deliveredTo1 instanceof DeliveredTo) || !(deliveredTo2 instanceof DeliveredTo)) return false;

	// check equality
	if (deliveredTo1.finalRecipient!=deliveredTo2.finalRecipient) return false;
	if (deliveredTo1.actionValue!=deliveredTo2.actionValue) return false;
	if (deliveredTo1.messageId!=deliveredTo2.messageId) return false;
	if (deliveredTo1.flags!=deliveredTo2.flags) return false;
	return true;
}






// create dsnParser Objects
var objParser = new dsnparser.dsnParser(msgDSN.join("")); // a valid delivery report (action=delivered)
var objParser2 = new dsnparser.dsnParser(msgDSN2.join("")); // a valid delivery report (action=failed)
var objParserKo = new dsnparser.dsnParser(msgNoDSN.join("")); // a multipart message (no DSN)
var objParserKo2 = new dsnparser.dsnParser(msgBadDSN.join("")); // an invalid delivery report



/**
	mailParser unit test
	@see mailParser
*/
tc_mailparser.tests = {
	'getHeaders' : function() {
		assert.isTrue(objParser.getHeaders()==msgDSN[0]); //true
		assert.isTrue(objParser2.getHeaders()==msgDSN2[0]); //true
		assert.isTrue(objParserKo.getHeaders()==msgNoDSN[0]); //true
		assert.isTrue(objParserKo2.getHeaders()==msgBadDSN[0]); //true
	},
	'getBody' : function() {
		assert.isTrue(objParser.getBody()==msgDSN.slice(2).join("")); //true
		assert.isTrue(objParser2.getBody()==msgDSN2.slice(2).join("")); //true
		assert.isTrue(objParserKo.getBody()==msgNoDSN.slice(2).join("")); //true
		assert.isTrue(objParserKo2.getBody()==msgBadDSN.slice(2).join("")); //true
	},
	'getMsgId' : function() {
		assert.isTrue(objParser.getMsgId()=="<20080213131118.4DD991FF88@mydesktop.vraimentbidon.org>"); // true
		assert.isTrue(objParser2.getMsgId()=="<20080213135516.54E3C1FF8B@mydesktop.vraimentbidon.org>"); // true
		assert.isTrue(objParserKo.getMsgId()=="<47C2C52F.2080503@vraimentbidon.org>"); // true
		assert.isTrue(objParserKo2.getMsgId()=="<20080213131118.4DD991FF88@mydesktop.vraimentbidon.org>"); // true
	},
	'getParts': function() {
		assert.isTrue(compareArrays(objParser.getParts(),[msgDSN[4],msgDSN[6],msgDSN[8]])); //true
		assert.isTrue(compareArrays(objParser2.getParts(),[msgDSN2[4],msgDSN2[6],msgDSN2[8]])); //true
		assert.isTrue(compareArrays(objParserKo.getParts(),[msgNoDSN[4],msgNoDSN[6]])); //true
		assert.isTrue(compareArrays(objParserKo2.getParts(),[msgBadDSN[3],msgBadDSN[5],msgBadDSN[7]])); //true
	},
	'getValueFromField' : function() {
		var myData="Final-Recipient: rfc822;louisl@larry.slip.umd.edu\n"+
			"Action: failed\n"+
			"Status:\n"+
			 "	4.0.0\n"+
			"Diagnostic-Code: smtp; 426 connection timed out\n";

		assert.isTrue(objParser.getValueFromField("Final-Recipient",myData)=="rfc822;louisl@larry.slip.umd.edu");
		assert.isTrue(objParser.getValueFromField("Status",myData)=="4.0.0");
		assert.isTrue(objParser.getValueFromField("Diagnostic-Code",myData)=="smtp; 426 connection timed out");
		assert.isTrue(objParser.getValueFromField("Action",myData)=="failed");
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
		assert.isTrue(report==null);

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
		assert.isTrue(objParser.getOriginalMsgId()=="<20080213130850.E9AED1FF86@mydesktop.vraimentbidon.org>"); // true
		assert.isTrue(objParser2.getOriginalMsgId()=="<20080213135515.B3C761FF89@mydesktop.vraimentbidon.org>"); // true
		assert.isTrue(objParserKo.getOriginalMsgId()==null); // true
		assert.isTrue(objParserKo2.getOriginalMsgId()=="<20080213130850.E9AED1FF86@mydesktop.vraimentbidon.org>"); // true
	},

	'getDeliveryReports': function() {
		var resu=objParser.getDeliveryReports();
		assert.isTrue(typeof(resu)=="object");
		assert.isTrue(resu instanceof Array);
		// 2 reports in this message
		assert.isTrue(resu.length==2);
		assert.isTrue(resu[0].actionValue=="delivered");
		assert.isTrue(resu[1].actionValue=="delivered");
		assert.isTrue(resu[0].originalRecipient=="rfc822;sertim@vraimentbidon.ORG");
		assert.isTrue(resu[1].originalRecipient=="rfc822;daniel@vraimentbidon.ORG");
		resu=objParserKo.getDeliveryReports();
		assert.isTrue(resu==null);
		resu=objParserKo2.getDeliveryReports();
		assert.isTrue(resu.length==0);
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
customprop= new customProperties("daniel@vraimentbidon.org;;\n\tsertim@vraimentbidon.org;;\n\tdirsim@vraimentbidon.org;;\n\tsersim.fs@vraimentbidon.org;;","","","");
var tmpDeliveredTo1=new DeliveredTo("daniel@vraimentbidon.org","","",0);
var tmpDeliveredTo2=new DeliveredTo("sertim@vraimentbidon.org","","",0);
var tmpDeliveredTo3=new DeliveredTo("dirsim@vraimentbidon.org","","",0);
var tmpDeliveredTo4=new DeliveredTo("sersim.fs@vraimentbidon.org","","",0);

/**
	customProperties unit test
	@see customProperties
*/
tc_custom_properties.tests = {
	'checkInitialValues' : function() {
		assert.equals(customprop.deliveredToProperty,"daniel@vraimentbidon.org;;\n\tsertim@vraimentbidon.org;;\n\tdirsim@vraimentbidon.org;;\n\tsersim.fs@vraimentbidon.org;;");
		assert.equals(customprop.summaryProperty,"0/4");
		assert.equals(customprop.statusProperty,"");
		assert.equals(customprop.flagsProperty,"0");
		assert.isFalse(customprop.allDsnReceived);
	},
	'getReportOf' : function() {
		assert.equals(customprop.getReportOf("noexist@vraimentbidon.org"),null); // no answer
		assert.equals(typeof(customprop.getReportOf("daniel@vraimentbidon.org")),"object");
		assert.isTrue((customprop.getReportOf("daniel@vraimentbidon.org")) instanceof DeliveredTo);
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("sertim@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("dirsim@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("sersim.fs@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isFalse(customprop.allDsnReceived);
	},

	'addDeliveredReport' : function() {
		var dlveryReport=new deliveryReport();
		tmpDeliveredTo1.actionValue="delivered";
		tmpDeliveredTo1.messageId="<123456@vraimentbidon.org>";
		dlveryReport.finalRecipient="rfc822;daniel@vraimentbidon.org";
		dlveryReport.actionValue="delivered";
		assert.isTrue(customprop.addReport(dlveryReport,"<123456@vraimentbidon.org>"));
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;delivered;<123456@vraimentbidon.org>;0\n\tsertim@vraimentbidon.org;;;0\n\tdirsim@vraimentbidon.org;;;0\n\tsersim.fs@vraimentbidon.org;;;0");
		assert.equals(customprop.getSummaryProperty(),"1/4");
		assert.equals(customprop.getStatusProperty(),"");
		assert.equals(customprop.flagsProperty,"0");
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("sertim@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("dirsim@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("sersim.fs@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isFalse(customprop.allDsnReceived);
	},
	'addDelayedDeliveryReport' : function() {
		var dlveryReport=new deliveryReport();
		tmpDeliveredTo2.actionValue="delayed";
		tmpDeliveredTo2.messageId="<91A51045@vraimentbidon.org>";
		dlveryReport.finalRecipient="rfc822;sertim@vraimentbidon.org";
		dlveryReport.actionValue="delayed";
		assert.isTrue(customprop.addReport(dlveryReport,"<91A51045@vraimentbidon.org>"));
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;delivered;<123456@vraimentbidon.org>;0\n\tsertim@vraimentbidon.org;delayed;<91A51045@vraimentbidon.org>;0\n\tdirsim@vraimentbidon.org;;;0\n\tsersim.fs@vraimentbidon.org;;;0");
		assert.equals(customprop.getSummaryProperty(),"1/4");
		assert.equals(customprop.getStatusProperty(),"");
		assert.equals(customprop.flagsProperty,"0");
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("sertim@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("dirsim@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("sersim.fs@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isFalse(customprop.allDsnReceived);
	},
	'addFailedDeliveryReport' : function() {
		var dlveryReport=new deliveryReport();
		tmpDeliveredTo2.actionValue="failed";
		tmpDeliveredTo2.messageId="<91A51049@vraimentbidon.org>";
		dlveryReport.finalRecipient="rfc822;sertim@vraimentbidon.org";
		dlveryReport.actionValue="failed";
		assert.isTrue(customprop.addReport(dlveryReport,"<91A51049@vraimentbidon.org>"));
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;delivered;<123456@vraimentbidon.org>;0\n\tsertim@vraimentbidon.org;failed;<91A51049@vraimentbidon.org>;0\n\tdirsim@vraimentbidon.org;;;0\n\tsersim.fs@vraimentbidon.org;;;0");
		assert.equals(customprop.getSummaryProperty(),"1/4");
		assert.equals(customprop.getStatusProperty(),"bad");
		assert.equals(customprop.flagsProperty,"0");
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("sertim@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("dirsim@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("sersim.fs@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isFalse(customprop.allDsnReceived);
	},
	'addExpandedDeliveryReport' : function() {
		var dlveryReport=new deliveryReport();
		tmpDeliveredTo3.actionValue="expanded";
		tmpDeliveredTo3.messageId="<91E78A09@vraimentbidon.org>";
		dlveryReport.finalRecipient="rfc822;dirsim@vraimentbidon.org";
		dlveryReport.actionValue="expanded";
		assert.isTrue(customprop.addReport(dlveryReport,"<91E78A09@vraimentbidon.org>"));
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;delivered;<123456@vraimentbidon.org>;0\n\tsertim@vraimentbidon.org;failed;<91A51049@vraimentbidon.org>;0\n\tdirsim@vraimentbidon.org;expanded;<91E78A09@vraimentbidon.org>;0\n\tsersim.fs@vraimentbidon.org;;;0");
		assert.equals(customprop.getSummaryProperty(),"2/4");
		assert.equals(customprop.getStatusProperty(),"bad");
		assert.equals(customprop.flagsProperty,"0");
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("sertim@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("dirsim@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("sersim.fs@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isFalse(customprop.allDsnReceived);
	},
	'addRelayedDeliveryReport' : function() {
		var dlveryReport=new deliveryReport();
		tmpDeliveredTo2.actionValue="relayed";
		tmpDeliveredTo2.messageId="<91A51049@vraimentbidon.org>";
		dlveryReport.finalRecipient="rfc822;sertim@vraimentbidon.org";
		dlveryReport.actionValue="relayed";
		assert.isTrue(customprop.addReport(dlveryReport,"<91A51049@vraimentbidon.org>"));
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;delivered;<123456@vraimentbidon.org>;0\n\tsertim@vraimentbidon.org;relayed;<91A51049@vraimentbidon.org>;0\n\tdirsim@vraimentbidon.org;expanded;<91E78A09@vraimentbidon.org>;0\n\tsersim.fs@vraimentbidon.org;;;0");
		assert.equals(customprop.getSummaryProperty(),"2/4");
		assert.equals(customprop.getStatusProperty(),"middle");
		assert.equals(customprop.flagsProperty,"0");
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("sertim@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("dirsim@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("sersim.fs@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isFalse(customprop.allDsnReceived);
	},
	'addDeliveredDeliveryReport2' : function() {
		var dlveryReport=new deliveryReport();
		tmpDeliveredTo2.actionValue="expanded";
		tmpDeliveredTo2.messageId="<91A51049@vraimentbidon.org>";
		tmpDeliveredTo4.actionValue="delivered";
		tmpDeliveredTo4.messageId="<A87CD51@vraimentbidon.org>";
		dlveryReport.finalRecipient="rfc822;sertim@vraimentbidon.org";
		dlveryReport.actionValue="expanded";
		assert.isTrue(customprop.addReport(dlveryReport,"<91A51049@vraimentbidon.org>"));
		dlveryReport.finalRecipient="rfc822;sersim.fs@vraimentbidon.org";
		dlveryReport.actionValue="delivered";
		assert.isTrue(customprop.addReport(dlveryReport,"<A87CD51@vraimentbidon.org>"));
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;delivered;<123456@vraimentbidon.org>;0\n\tsertim@vraimentbidon.org;expanded;<91A51049@vraimentbidon.org>;0\n\tdirsim@vraimentbidon.org;expanded;<91E78A09@vraimentbidon.org>;0\n\tsersim.fs@vraimentbidon.org;delivered;<A87CD51@vraimentbidon.org>;0");
		assert.equals(customprop.getSummaryProperty(),"4/4");
		assert.equals(customprop.getStatusProperty(),"good");
		assert.equals(customprop.flagsProperty,"0");
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("sertim@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("dirsim@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("sersim.fs@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isTrue(customprop.allDsnReceived);
	},
	'setMsgAsExpired' : function() {
		var dlveryReport=new deliveryReport();
		tmpDeliveredTo2.actionValue="delayed";
		tmpDeliveredTo2.messageId="";
		tmpDeliveredTo2.flags=0x1;
		dlveryReport.finalRecipient="rfc822;sertim@vraimentbidon.org";
		dlveryReport.actionValue="delayed";
		assert.isTrue(customprop.addReport(dlveryReport,""));

		// test before setMsgAsExpired()
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;delivered;<123456@vraimentbidon.org>;0\n\tsertim@vraimentbidon.org;delayed;;0\n\tdirsim@vraimentbidon.org;expanded;<91E78A09@vraimentbidon.org>;0\n\tsersim.fs@vraimentbidon.org;delivered;<A87CD51@vraimentbidon.org>;0");
		assert.equals(customprop.flagsProperty,"0");

		// set time out flag
		customprop.setMsgAsExpired();

		// test after setMsgAsExpired()
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;delivered;<123456@vraimentbidon.org>;0\n\tsertim@vraimentbidon.org;delayed;;1\n\tdirsim@vraimentbidon.org;expanded;<91E78A09@vraimentbidon.org>;0\n\tsersim.fs@vraimentbidon.org;delivered;<A87CD51@vraimentbidon.org>;0");
		assert.equals(customprop.getSummaryProperty(),"3/4");
		assert.equals(customprop.getStatusProperty(),"");
		assert.equals(customprop.flagsProperty,"1");
		assert.isFalse(customprop.allDsnReceived);
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("sertim@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("dirsim@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("sersim.fs@vraimentbidon.org"),tmpDeliveredTo4));

		// now, I recieved notification but so later ...
		tmpDeliveredTo2.actionValue="delivered";
		tmpDeliveredTo2.messageId="<91A51049@vraimentbidon.org>";
		dlveryReport.finalRecipient="rfc822;sertim@vraimentbidon.org";
		dlveryReport.actionValue="delivered";
		assert.isTrue(customprop.addReport(dlveryReport,"<91A51049@vraimentbidon.org>"));
		assert.equals(customprop.getDeliveredToProperty(),"daniel@vraimentbidon.org;delivered;<123456@vraimentbidon.org>;0\n\tsertim@vraimentbidon.org;delivered;<91A51049@vraimentbidon.org>;1\n\tdirsim@vraimentbidon.org;expanded;<91E78A09@vraimentbidon.org>;0\n\tsersim.fs@vraimentbidon.org;delivered;<A87CD51@vraimentbidon.org>;0");
		assert.equals(customprop.getSummaryProperty(),"4/4");
		assert.equals(customprop.getStatusProperty(),"good");
		assert.equals(customprop.flagsProperty,"1"); // flags always set

		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("daniel@vraimentbidon.org"),tmpDeliveredTo1));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("sertim@vraimentbidon.org"),tmpDeliveredTo2));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("dirsim@vraimentbidon.org"),tmpDeliveredTo3));
		assert.isTrue(isDeliveredToEquals(customprop.getReportOf("sersim.fs@vraimentbidon.org"),tmpDeliveredTo4));
		assert.isTrue(customprop.allDsnReceived);
	}
}




