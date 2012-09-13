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
 
/* 
 * global variables
 */
var gXimfmailIdentity=null;

/* 
 * new theme selection : load instances of theme
 */
function onCommandTheme(){	
	var themeRef = $("#listTheme").attr("value");	
	ChangeRefAttrRdfElement("instanceCompose", themeRef);
	InitRDFMenuList("instanceComposeList");	
	ChangeRefAttrRdfElement("instanceTreeThread", themeRef);
	InitRDFMenuList("instanceTreeThreadList");
	ChangeRefAttrRdfElement("instanceMailPanel", themeRef);
	InitRDFMenuList("instanceMailPanelList");
};


/*
 * load pref ximfmail settings
 */  
function onInit(aPageId, aServerId){
	
	if(gXimfmailIdentity == null){
		// no account id (local folder)
		$("#checkListTheme").attr("checked", "false");
		UseXimfmail();
		$("#checkListTheme").attr("disabled", "true");		
		return;		
	}
	$("#checkListTheme").removeAttr("disabled");
	
	//get XIMF instances of profile for account
	if(!gXimfCatalog) CreateXimfmailCatalog();
	var listInstances = document.getElementById("listThemPopup");		
	listInstances.database.AddDataSource(gXimfCatalog.getDSCatalog());	
	listInstances.builder.rebuild();
	
	//alert("Informations compte : \r\n\n" + aPageId + "\r\n"+ aServerId + "\r\n" + gXimfIdentity + "\r\n" + gXimfAccount.incomingServer.key);
	UpdateRDFListWithPref(gXimfmailIdentity.key,"ximfmail_theme_ref","listTheme");
	onCommandTheme();
	UpdateRDFListWithPref(gXimfmailIdentity.key,"ximfmail_instance_compose_ref","instanceComposeList");
	UpdateRDFListWithPref(gXimfmailIdentity.key,XIMF_PREF_IDENTITY_TREETHREAD_REF,"instanceTreeThreadList");
	UpdateRDFListWithPref(gXimfmailIdentity.key,XIMF_PREF_IDENTITY_MAIL_PANEL_REF,"instanceMailPanelList");
	
	// determine if user uses ximfmail	
	if(gXimfmailIdentity.getBoolAttribute(XIMF_PREF_IDENTITY_USE_XIMFMAIL)){
		$("#checkListTheme").attr("checked", "true");
	}else{
		$("#checkListTheme").attr("checked", "false");
	}
	
	$("#listTheme").bind('command', onCommandTheme);
	$("#checkListTheme").click(UseXimfmail);
	UseXimfmail();
	
	// determine if user wants XSMTP compatibility
	$("#xsmtpComptibilityBox").attr("checked", gXimfmailIdentity.getBoolAttribute("ximfmail_xsmtp_compatibility_on"));
	//$("#secureHeadersRuleBox").attr("checked", gXimfmailIdentity.getBoolAttribute("ximfmail_secure_header_on"));
	//$("#signMsgAlwaysRuleBox").attr("checked", gXimfmailIdentity.getBoolAttribute("ximfmail_sign_message_always_on"));

}

/*
 * 
 */ 
function UseXimfmail(){
	//IsDisableXimfmailManager("checkListTheme","isUsingXimfail");
	//alert("UseXimfmail " +idCheckElement+"  "+idBroadcaster );
	if($("#checkListTheme").attr("checked") == "true"){
 		$("#isUsingXimfail").attr("disabled","false"); 	 				 		
 		return false;		
 	}else{
 		$("#isUsingXimfail").attr("disabled","true");
 		return true;
 	}
}
 
/*
 *  get pref settings
 */
function onPreInit(account, accountValues){
	gXimfmailIdentity = account.defaultIdentity;
}

/*
 * save all changes on this page
 */
function onSave(){
	if(gXimfmailIdentity == null)return;
	// save ximfmail selection to preferences
	SetXimfmailPref(gXimfmailIdentity.key, "ximfmail_theme_ref", $("#listTheme").attr("value"));
	SetXimfmailPref(gXimfmailIdentity.key, "ximfmail_theme_name", $("#listTheme").attr("label"));
	SetXimfmailPref(gXimfmailIdentity.key, "ximfmail_instance_compose_ref", $("#instanceComposeList").attr("value"));	
	gXimfmailIdentity.setCharAttribute(XIMF_PREF_IDENTITY_TREETHREAD_REF,$("#instanceTreeThreadList").attr("value"));
	gXimfmailIdentity.setCharAttribute(XIMF_PREF_IDENTITY_MAIL_PANEL_REF,$("#instanceMailPanelList").attr("value"));
		
	if($("#checkListTheme").attr("checked") == "true"){	
		gXimfmailIdentity.setBoolAttribute(XIMF_PREF_IDENTITY_USE_XIMFMAIL,true);
		try{CreateSecurityLabelXml()}catch(e){}
	}else{		
		gXimfmailIdentity.setBoolAttribute(XIMF_PREF_IDENTITY_USE_XIMFMAIL,false);
	}
		
	if($("#xsmtpComptibilityBox").attr("checked") == "true"){
		gXimfmailIdentity.setBoolAttribute("ximfmail_xsmtp_compatibility_on",true);		
	}else{
		gXimfmailIdentity.setBoolAttribute("ximfmail_xsmtp_compatibility_on",false);
	} 
}