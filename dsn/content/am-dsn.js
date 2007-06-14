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
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998-2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): Olivier PARNIERE olivier.parniere@milimail.org
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
 
 //Global variables 
 var account;
 var identity;
 
 //Global State checkbox
 var useCustomPrefs;
 var requestAlwaysDSN;
 var requestDSNOnSuccess;
 var requestDSNOnFailure;
 var requestDSNOnDelay;
 var requestDSNNever;
 
 //This function is executed when am-dsn.xul is displayed
 function onInit()
{
	//Initialize Custom variables
	useCustomPrefs = document.getElementById("identity.dsn_use_custom_prefs");
	dump("function onInit() -> useCustomPrefs : "+ useCustomPrefs.value + "\n");
	
	requestAlwaysDSN = document.getElementById("identity.dsn_always_request_on");

	requestDSNOnSuccess = document.getElementById("identity.dsn_request_on_success_on");
	requestDSNOnFailure = document.getElementById("identity.dsn_request_on_failure_on");
	requestDSNOnDelay = document.getElementById("identity.dsn_request_on_delay_on");
	requestDSNNever = document.getElementById("identity.dsn_request_never");
	enableDisableCustomSettings();
	
	

}

//This function disable or enable the Custom Settings 
function enableDisableCustomSettings()
{	
	dump("function enableCustomSettings() -> Enter" + "\n");
	dump("function enableCustomSettings() -> useCustomPrefs : "+ useCustomPrefs.value + "\n");
	
	if (useCustomPrefs.value == "false"){
		requestAlwaysDSN.setAttribute("disabled",true);
		requestDSNOnSuccess.setAttribute("disabled",true);
		requestDSNOnFailure.setAttribute("disabled",true);
		requestDSNOnDelay.setAttribute("disabled",true);
		requestDSNNever.setAttribute("disabled",true);
	}
	 else {	
		requestAlwaysDSN.removeAttribute("disabled");
		requestDSNOnSuccess.removeAttribute("disabled");
		requestDSNOnFailure.removeAttribute("disabled");
		requestDSNOnDelay.removeAttribute("disabled");
		requestDSNNever.removeAttribute("disabled");
		checkParameters(new Object());
		
		}
	
}

//Load current identity
function onPreInit(account, accountValues)
{
	dump("function onPreInit() -> Enter" + "\n");

	identity = account.defaultIdentity;
	dump("function onPreInit() -> identity : "+ identity.key + "\n");
	
	account = account;
}

//This function is called by Account Manager when OK Button is pushed
function onSave(){
	
	dump("function onSave() -> Enter" + "\n");
	
	//Reset to default if there is not DSN options checked
	if (requestAlwaysDSN.checked && !requestDSNOnSuccess.checked  && !requestDSNOnFailure.checked && !requestDSNOnDelay.checked && !requestDSNNever.checked ){
		
		dump("function onSave() -> Reset to default options	" + "\n");
		requestAlwaysDSN.checked = false;
		requestDSNOnSuccess.checked = false;
		requestDSNOnFailure.checked = false;
		requestDSNOnDelay.checked = false;
		requestDSNNever.checked = false;
	}

}
/** 
* karnaugh map
*--------+--------+--------+--------+--------+---------+--------+--------+-------
*        | 0 0 0  | 0 0 1  | 0 1 1  | 0 1 0  | 1 1 0   | 1 1 1  | 1 0 1  | 1 0 0 
*--------+--------+--------+--------+--------+---------+--------+--------+-------
*  0  0  |   EA   |        |        |        |         |        |        |  EA   
*--------+--------+--------+--------+--------+---------+--------+--------+-------
*  0  1  |        |   EN   |   EN   |   EN   |   EN    |   EN   |        |       
*--------+--------+--------+--------+--------+---------+--------+--------+-------
*  1  1  |   EN   |   EN   |   EN   |   EN   |   EN    |   EN   |  EN    |  EN   
*--------+--------+--------+--------+--------+---------+--------+--------+-------
*  1  0  |        |        |        |        |         |        |        |       
*--------+--------+--------+--------+--------+---------+--------+--------+-------
* 
* First row in order : always request, success option, failure option
* First column in order : delay option, never option
* EA : Error for "always" request checkbox state
* EN : Errr for "Never" request checkbox state
*/ 
function checkParameters(target){
	useCustomPrefs = document.getElementById("identity.dsn_use_custom_prefs")
	
	if (!useCustomPrefs)
		return;
		
	requestAlwaysDSN = document.getElementById("identity.dsn_always_request_on");
	requestDSNOnSuccess = document.getElementById("identity.dsn_request_on_success_on");
	requestDSNOnFailure = document.getElementById("identity.dsn_request_on_failure_on");
	requestDSNOnDelay = document.getElementById("identity.dsn_request_on_delay_on");
	requestDSNNever = document.getElementById("identity.dsn_request_never");
	
	var a = requestAlwaysDSN.checked;
	var s = requestDSNOnSuccess.checked;
	var f = requestDSNOnFailure.checked;
	var d = requestDSNOnDelay.checked;
	var n = requestDSNNever.checked;
	

    //case that the checkbox request always DSN must enabled	
	if ((target != requestAlwaysDSN) && target.checked){
	    requestAlwaysDSN.disabled = false;
	}
	
	//EA State
	if (!d && !n && !s && !f){
	       if ((target != requestAlwaysDSN)){
	           requestAlwaysDSN.checked = false;
	           requestAlwaysDSN.disabled = !requestAlwaysDSN.disabled;
	       } 
	       
	}
	
	//EN State
	if ( n && ( (d  && !s ) || ( s && !f ) || f ) ){
	    if (target == requestDSNNever){
    	    requestDSNOnSuccess.checked = false;
    	    requestDSNOnFailure.checked = false;
    	    requestDSNOnDelay.checked = false;
	    } else if ( (target == requestDSNOnSuccess) || (target == requestDSNOnFailure) || (target == requestDSNOnDelay)){
	        if (target.checked == true)
    	        requestDSNNever.checked = false;
	    }
	}

	
}
 