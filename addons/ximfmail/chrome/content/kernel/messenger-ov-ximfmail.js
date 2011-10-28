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
// global variables
var gCurrentIdentity = null;
var gPreviousIdentity = null;
var gComposeMsgByMenuitem = false;
var gXimfThreadTree = null;

var gConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
var gXBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);

var gChromeXslMsgCompose = "chrome://theme_ximfmail/content/messengerCompose-ximfmail.xsl";
var gChromeXslTreeRcv = "chrome://theme_ximfmail/content/threadTree-ximfmail.xsl";


/*
 * init ximfmail on main panel
 */
$(document).ready(function(){
	// init ximfmail operations
	CreateXimfmailCatalog(); 
    gXimfThreadTree = new XimfThreadTree();
    var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
	observerService.addObserver(XimfThreadTreeDBViewObserver, "MsgCreateDBView", false);        

    OnSelectfolderPane();

	// event manager
	$("#folderTree").select(OnSelectfolderPane);
	//optional-for technical informations $("#threadTree").select(OnSelectMsg);
	//opening message event
	$("#threadTree").dblclick(OnOpenMsg);	
	$("#cmd_openMessage").bind("command",OnOpenMsg);
	$("#key_openMessage").bind("command",OnOpenMsg);
	$("#threadTree").keypress(OnOpenMsgWithKey);	
	//
	$("#threadTree").click(UpdateThreadPane);
	$("#button-newmsg").mousedown(OnSelectfolderPane); // load instances	  
	$("#button-newmsg").bind('command', OnComposeDefaultMsg); // use default instance 
	$("#button-reply").mousedown(OnSelectfolderPane);
	$("#button-reply").bind('command', OnComposeDefaultMsg);
	$("#button-replyall").mousedown(OnSelectfolderPane);
	$("#button-replyall").bind('command', OnComposeDefaultMsg);
	$("#button-forward").mousedown(OnSelectfolderPane);
	$("#button-forward").bind('command', OnComposeDefaultMsg);	
	$("#threadTree").bind('select', OnSelectMsg);
	
	// Security Labels compatibility (RFC2634)
	try{CreateSecurityLabelXml();}catch(e){}
});


/*
 * save state of custom columns
 */
function UpdateThreadPane(){
	if(gXimfThreadTree){	
		gXimfThreadTree.saveColumnToHide();
	}
}

 

/*
 * 
 */
function OnOpenMsgWithKey(evt){ if(evt.keyCode == 13){OnOpenMsg();}}
function OnOpenMsg(){
	if(!gCurrentIdentity) return false;	
	if (IsXimfailActivated(gCurrentIdentity)){		
		pref.setBoolPref("mailnews.headers.showXimfmail",true);	
		// flag on new open message requested
		try{			
			if(!pref.getBoolPref(PREF_MSGWINDOW_REFRESH)){
				pref.setBoolPref(PREF_MSGWINDOW_REFRESH,true);				
			}else{
				pref.setBoolPref(PREF_MSGWINDOW_REFRESH,false);				
			}
		}catch(e){pref.setBoolPref(PREF_MSGWINDOW_REFRESH,true);}
	}else{
		pref.setBoolPref("mailnews.headers.showXimfmail",false);			
	}
	return true;	
}

/*
 * 
 */
function OnSelectMsg(){
	try{
		if(!gCurrentIdentity) return false;	
		if (IsXimfailActivated(gCurrentIdentity)){		
			pref.setBoolPref("mailnews.headers.showXimfmail",true);							
		}else{
			pref.setBoolPref("mailnews.headers.showXimfmail",false);			
		}
	}catch(error){
		gConsole.logStringMessage("ximfmail error - on select message : " + error);
	}
}

/*
 * define instance ximf to use
 */ 
function OnCommandComposeMsgXimfmail(event){
	gComposeMsgByMenuitem=true;	
	var pathXmlXimf = event.currentTarget.getAttribute("value");	
	gXBranch.setCharPref("ximfmail.composeMsg.instance",pathXmlXimf);	
	var prefXsmtpCompatibility = GetXimfmailPref(gCurrentIdentity.key, "ximfmail_xsmtp_compatibility");
 	if(prefXsmtpCompatibility == "true"){ 	
 		gXBranch.setCharPref("ximfmail.composeMsg.xsmtp_on","true");
 	} 
}

/*
 * Inspect account user
 */ 
function OnSelectfolderPane(){
	try{
		GetCurrentUser();
		
		if(!gCurrentIdentity){
			gConsole.logStringMessage("[ximfmail - OnSelectfolderPane ] gCurrentIdentity invalid");
			return;
		}		
				
		// custom-panel update
		var title = GetXimfmailPref(gCurrentIdentity.key, "ximfmail_theme_name");						
		$("#title-custom").attr("value",title);			
		
		// load context of currentUser	
		var refRdf = GetXimfmailPref(gCurrentIdentity.key,"ximfmail_theme_ref");	
		
		ChangeRefAttrRdfElement("menupopup-newmsg", refRdf);
						
		// mailpanel instance : to display received/send messages
		var mailInstance = GetXimfmailPref(gCurrentIdentity.key, "ximfmail_instance_mail_panel_ref");
		gXBranch.setCharPref("mailnews.instance.mailpanel",mailInstance);
		var mailTheme = GetXimfmailPref(gCurrentIdentity.key, "ximfmail_theme_ref");
		gXBranch.setCharPref("mailnews.theme.mailpanel",mailTheme);

		// is ximfail context used		
		if (IsXimfailActivated(gCurrentIdentity)){				
			pref.setBoolPref("mailnews.headers.showXimfmail",true);
			$("#menupopup-newmsg").attr("datasources","chrome://theme_ximfmail/content/ximfCatalog.rdf");
			$("#menupopup-newmsg menuitem").attr("hidden","false");
				$("#ximfmail-custom-panel").attr("hidden","false");				
		}else{
			pref.setBoolPref("mailnews.headers.showXimfmail",false);
			$("#menupopup-newmsg").attr("datasources","");
			$("#menupopup-newmsg menuitem").attr("hidden","true");
			$("#ximfmail-custom-panel").attr("hidden","true");		
		}
		
		// load custom tree
		if( gPreviousIdentity != gCurrentIdentity){	
			gPreviousIdentity = gCurrentIdentity;
			if(gXimfThreadTree){		
				gXimfThreadTree.createThreadTree();
				gXimfThreadTree.addCustomColumnHandler();
			}
		}		
	}catch(e){
		gConsole.logStringMessage("[ximfmail - OnSelectfolderPane ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);		

	}
}

/*
 * 
 */ 
function OnComposeDefaultMsg(evt){
	//alert("OnComposeDefaultMsg")
	if(!gComposeMsgByMenuitem){
		//alert("OnComposeInstanceMsg : " + $("#menupopup-newmsg").attr("ref"));
		//var prefCompose = GetXimfmailPref(gCurrentIdentity.key, "ximfmail_instance_compose_ref");
		
		var idButton = evt.currentTarget.id;
		var prefKey = "";		
		if(idButton == "button-newmsg") prefKey = "ximfmail_instance_compose_ref";
		if(idButton == "button-reply") prefKey = "ximfmail_instance_answer_ref";
		if(idButton == "button-replyall") prefKey = "ximfmail_instance_answer_ref";
		if(idButton == "button-forward") prefKey = "ximfmail_instance_forward_ref";
						
		if (IsXimfailActivated(gCurrentIdentity)){		
 			gXBranch.setCharPref("ximfmail.composeMsg.instance",GetXimfmailPref(gCurrentIdentity.key, prefKey));
 		}else{
			gXBranch.setCharPref("ximfmail.composeMsg.instance","");			
		} 	
	}
	gComposeMsgByMenuitem=false; 	
}

/*
 *  Get account user settings
 */
 function GetCurrentUser() { 	
 	var folder=GetFirstSelectedMsgFolder();
	var identity = null;	
	var server;
	
	try  {
		if (folder){
      	// Get the incoming server associated with this uri.
      	server = folder.server;      
      	identity = getIdentityForServer(server);
    	}    
  	}catch (ex){
		gConsole.logStringMessage("ximfmail error - failed to get an identity to pre-select: " + error);
	    return "";
	}
	if(identity){
  		gCurrentIdentity=identity;
  		var prefName="mail.identity."+identity.key+".useremail";
  		try{
  			if(gXBranch.prefHasUserValue( prefName ))
  			return gXBranch.getCharPref(prefName);  		
  		}catch(exp){  	
			gConsole.logStringMessage("ximfmail error - failed to get the prefence account type : " + error);
	  	}
  	}	
}
