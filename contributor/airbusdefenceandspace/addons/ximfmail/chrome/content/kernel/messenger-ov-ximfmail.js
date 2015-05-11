/* ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2008-2009 EADS DEFENCE AND SECURITY - All rights reserved.
 * ximfmail is under the triple license  MPL 1.1/GPL 2.0/LGPL 2.1.
 *
 *
 * Redistribution and use, in source and binary forms, with or without modification,
 * are permitted provided that the following conditons are met :
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * 2. MPL 1.1/GPL 2.0/LGPL 2.1. license agreements must be attached
 *    in the redistribution of the source code.
 * 3. Neither the names of the copyright holders nor the names of any contributors
 *    may be used to endorse or promote products derived from this software without specific
 *    prior written permission from EADS Defence and Security.
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
 * REMINDER  :
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR  A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * EADS Defence and Security - 1 Boulevard Jean Moulin -
 * ZAC de la Clef Saint Pierre - 78990 Elancourt - FRANCE (IDDN.FR.001.480012.002.S.P.2008.000.10000)
 * ***** END LICENSE BLOCK ***** */
/**
 * messenger-ov-ximfmail.js
 *
 */
// global variables
var gCurrentIdentity = null;
var gPreviousIdentity = null;
var gComposeMsgByMenuitem = false;
var gConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
gConsole.logStringMessage("[messenger-ov-ximfmail] file loaded");
/*
 *  Get account user settings
 */
function GetCurrentXimfUser() {
	try  {
		var folders = GetSelectedMsgFolders();
		var identity = null;
		var server = null;
		var ximfUser = "";
		if (folders.length > 0){
			// Get the incoming server associated with this uri.
			identity = getIdentityForServer(folders[0].server);
    	}
		if (!identity) {
			identity = MailServices.accounts.defaultAccount.defaultIdentity;
		}
		if (identity) {
	  		gCurrentIdentity = identity;
	  		var prefName="mail.identity."+identity.key+".useremail";
	  		if (Services.prefs.prefHasUserValue( prefName )) {
	  			ximfUser =  Services.prefs.getCharPref(prefName);
	  		}
	  	}
	}catch (ex){
		gConsole.logStringMessage("[messenger-ov-ximfmail - GetCurrentXimfUser]  failed to get an identity to pre-select: " + ex);
	}
	return ximfUser;
};
/**
 * Compute DOM user folder with XIMF account user informations
 */
function OnSelectfolderPane() {
	try{
		// get current identity
		GetCurrentXimfUser();
		if (!gCurrentIdentity) {
			gConsole.logStringMessage("[messenger-ov-ximfmail - OnSelectfolderPane ] gCurrentIdentity invalid");
			return;
		}
		// custom-panel update
		var title = ximfPref.get(gCurrentIdentity.key, "ximfmail_theme_name");
		$("#title-custom").attr("value",title);
		// load context of currentUser
		var refRdf = ximfPref.get(gCurrentIdentity.key,"ximfmail_theme_ref");
		AddRdfDataSce2domList("menupopup-newmsg", refRdf);
		// mailpanel instance : to display compose messages
		var mailTheme = ximfPref.get(gCurrentIdentity.key, "ximfmail_theme_ref");
		Services.prefs.setCharPref("mailnews.theme.mailpanel",mailTheme);
		// is ximfail context used
		if (ximfPref.isXimfAccountOn(gCurrentIdentity)) {
			Services.prefs.setBoolPref("mailnews.headers.showXimfmail",true);
			$("#menupopup-newmsg").attr("datasources","chrome://theme_ximfmail/content/ximfCatalog.rdf");
			$("#menupopup-newmsg menuitem").attr("hidden","false");
			$("#ximfmail-custom-panel").removeAttr("collapsed");
			$("#button-newmsg").attr("type","menu-button");
			try {
				// 	update secure headers settings file with ximf instance
				var currentInstance = ximfPref.get(gCurrentIdentity.key, "ximfmail_instance_compose_ref");
				gConsole.logStringMessage("[messenger-ov-ximfmail - OnSelectfolderPane - UpdateSecureHeadersFileSettings]currentInstance = " + currentInstance );
				UpdateSecureHeadersFileSettings (currentInstance, gCurrentIdentity);
				gConsole.logStringMessage("[messenger-ov-ximfmail - OnSelectfolderPane - UpdateSecureHeadersFileSettings] Succes updating secure headers file settings");
			} catch (e) {
				gConsole.logStringMessage("[messenger-ov-ximfmail - OnSelectfolderPane - UpdateSecureHeadersFileSettings] Problem updating secure headers file settings : " + e);
			}
		} else {
			Services.prefs.setBoolPref("mailnews.headers.showXimfmail",false);
			$("#menupopup-newmsg").attr("datasources","");
			$("#menupopup-newmsg menuitem").attr("hidden","true");
			$("#ximfmail-custom-panel").attr("collapsed","true");
			$("#button-newmsg").attr("type","");
		}
	}catch(e){
		gConsole.logStringMessage("[messenger-ov-ximfmail - OnSelectfolderPane ] " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
	}
}
/**
 * Set/Unset XIMFMAIL flag on opening message
 * @returns {Boolean}
 */
function OnOpenMsg(){
	if (!gCurrentIdentity) {
		return false;
	}
	if (ximfPref.isXimfAccountOn(gCurrentIdentity)){
		Services.prefs.setBoolPref("mailnews.headers.showXimfmail",true);
		// flag on new open message requested
		try{
			if(!Services.prefs.getBoolPref(ximfConst.PREF_MSGWINDOW_REFRESH)){
				Services.prefs.setBoolPref(ximfConst.PREF_MSGWINDOW_REFRESH,true);
			}else{
				Services.prefs.setBoolPref(ximfConst.PREF_MSGWINDOW_REFRESH,false);
			}
		}catch(e){Services.prefs.setBoolPref(ximfConst.PREF_MSGWINDOW_REFRESH,true);}
	}else{
		Services.prefs.setBoolPref("mailnews.headers.showXimfmail",false);
	}
	return true;
}
/**
 * Set/Unset XIMFMAIL flag on selected message
 * @returns {Boolean}
 */
function OnSelectMsg(){
	try{
		if (!gCurrentIdentity) {
			return false;
		}
		if (ximfPref.isXimfAccountOn(gCurrentIdentity)){
			Services.prefs.setBoolPref("mailnews.headers.showXimfmail",true);
		}else{
			Services.prefs.setBoolPref("mailnews.headers.showXimfmail",false);
		}
	}catch(e){
		gConsole.logStringMessage("[messenger-ov-ximfmail - OnSelectMsg ] " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
	}
}
/**
 * Set instance ximf to use on composing message.
 * Called on press new message button.
 */
function OnCommandComposeMsgXimfmail(event){
	gComposeMsgByMenuitem=true;
	var pathXmlXimf = event.currentTarget.getAttribute("value");
	Services.prefs.setCharPref("ximfmail.composeMsg.instance",pathXmlXimf);
	var prefXsmtpCompatibility = ximfPref.get(gCurrentIdentity.key, "ximfmail_xsmtp_compatibility");
 	if (prefXsmtpCompatibility === "true") {
 		Services.prefs.setCharPref("ximfmail.composeMsg.xsmtp_on", "true");
 	}
}
/**
 * Set XIMF instance to use on composing message.
 * @param evt
 */
function OnComposeDefaultMsg(evt){
	if(!gComposeMsgByMenuitem){
		var idButton = evt.currentTarget.id;
		var prefKey = "";
		if (idButton === "button-newmsg") {
			prefKey = "ximfmail_instance_compose_ref";}
		if (idButton === "button-reply") {
			prefKey = "ximfmail_instance_answer_ref";
		}
		if (idButton === "button-replyall") {
			prefKey = "ximfmail_instance_answer_ref";
		}
		if (idButton === "button-forward") {
			prefKey = "ximfmail_instance_forward_ref";
		}
		if (ximfPref.isXimfAccountOn(gCurrentIdentity)) {
 			Services.prefs.setCharPref("ximfmail.composeMsg.instance", ximfPref.get(gCurrentIdentity.key, prefKey));
 		} else {
			Services.prefs.setCharPref("ximfmail.composeMsg.instance","");
		}
	}
	gComposeMsgByMenuitem=false;
}
/**
 * Update main panel with XIMF environment
 */
$(document).ready(function(){
	// event manager
	$("#folderTree").select(OnSelectfolderPane);
	$("#threadTree").dblclick(OnOpenMsg);
	$("#cmd_openMessage").bind("command",OnOpenMsg);
	$("#key_openMessage").bind("command",OnOpenMsg);
	$("#threadTree").keypress(function(evt){
		if(evt.keyCode === 13){
			OnOpenMsg();
		}
	});
	// load instances
	$("#button-newmsg").mousedown(OnSelectfolderPane);
	// use default instance
	$("#button-newmsg").bind('command', OnComposeDefaultMsg);
	$("#button-reply").mousedown(OnSelectfolderPane);
	$("#button-reply").bind('command', OnComposeDefaultMsg);
	$("#button-replyall").mousedown(OnSelectfolderPane);
	$("#button-replyall").bind('command', OnComposeDefaultMsg);
	$("#button-forward").mousedown(OnSelectfolderPane);
	$("#button-forward").bind('command', OnComposeDefaultMsg);
	$("#threadTree").bind('select', OnSelectMsg);
	// Creating Ximf Custom Columns
	var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
	observerService.addObserver(XimfThreadTreeDBViewObserver, "MsgCreateDBView", false);
	// switch to current folder
	OnSelectfolderPane();
	try{
		// Security Labels compatibility (RFC2634)
		CreateSecurityLabelXml();
	} catch(e) {
		gConsole.logStringMessage("[messenger-ov-ximfmail] Warning - Security Label compatibility : " + e);
	}
});