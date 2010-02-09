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
var gJSLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].createInstance(Components.interfaces.mozIJSSubScriptLoader);
var gConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
var gPrefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);

gJSLoader.loadSubScript("chrome://ximfmail/content/jquery.js");
gJSLoader.loadSubScript("chrome://ximfmail/content/messengerComposeHeaders-ximfmail.js");
gJSLoader.loadSubScript("chrome://ximfmail/content/constant-ximfmail.js");


//
var gCurrentInstance = "";
var gTimer=null;

/*
 * Init ximfmail document 
 */
$(document).ready(function(){
		
	// ximfmail not requested
	if(!gPrefBranch.getBoolPref("mailnews.headers.showXimfmail")){ 
		$("#isUsingXimfail").attr("hidden","true");
		$("#ximfmailComposeMessageHeadersTablist").empty();
		return;
	}	
	$("#isUsingXimfail").attr("hidden","false");
	
	// ximfmailObserverSvc.addObserver(ximfmailOnReady, "obs_documentCreated", false);
	// $(document).bind("compose-gMsgCompose-init",TestLoadStartup);
	
	// i cant't catch event on completely initialized compose message, so loop on gCurrentIdentity loaded
	gTimer=setInterval("XimfmailStartup()", 20);
	
	// observer on current document
	$(document).bind("compose-window-reopen",XimfmailReopen);

	// observer on sending message
	var ximfmailObserverSvc = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
	ximfmailObserverSvc.addObserver(ximfmailOnSend, "mail:composeOnSend", false);	
	
	MsgComposeCloseWindow=MsgComposeCloseWindow_XIMF;
	
});


// Function rewrite MsgComposeCloseWindow function from MsgComposeCommands.js
// used to rewrite completly message on new message
function MsgComposeCloseWindow_XIMF(recycleIt){
  if (gMsgCompose)
    gMsgCompose.CloseWindow(false);
}

function XimfmailStartup(){
	if(!gCurrentIdentity) return;
	clearInterval(gTimer);
	gTimer=null;
	var currentInstance = null;
	var current_definition = null;
	//is Template or Draft message
	try{
		// get current definition and default instance of account loaded		
		currentInstance = gPrefBranch.getCharPref("ximfmail.composeMsg.instance");
		current_definition =  gPrefBranch.getCharPref("mailnews.theme.mailpanel");
			
		var args = window.arguments[0];
		var typeMsg = -1;
		if(args){
			typeMsg = args.type;
		}
	}catch(e){
		gConsole.logStringMessage("[ximfmail - XimfmailStartup ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);		
	}
	
	try{	
		switch(typeMsg){			
			case nsIMsgCompType.Draft:
			case nsIMsgCompType.Template:				
				//alert("typeMsg = " + args.type + "\nUri of message : " + args.originalMsgURI);
				gJSLoader.loadSubScript("chrome://ximfmail/content/messageAnalyser-ximfmail.js");
				var msgAnalyser = new XimfMessageAnalyser();
				
				// search for template XIMF				
				msgAnalyser.setOriginalURI(args.originalMsgURI); 
				msgAnalyser.createXimfHdrArray();			 	
				var uriXimfInstance = msgAnalyser.hasXimfHeaders(current_definition);
				if(uriXimfInstance){				
					currentInstance = uriXimfInstance;
				}	
				LoadXimfmailPanel(currentInstance);
				ComputeWithForm(msgAnalyser);
				break;
			default :
				//alert("unknown type : " + typeMsg)
				LoadXimfmailPanel(currentInstance);			
				break;
		}
	}catch(e){
		gConsole.logStringMessage("[ximfmail - XimfmailStartup ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);		
	}	
	//gConsole.logStringMessage("DBG [ximfmail - messengerCompose - XimfmailStartup ] \n XIMF instance : "+ currentInstance + "\n XIMF definition : " + current_definition);
}

function XimfmailReopen(){		
	try{
		//reset old ihm
		$("#ximfmailComposeMessageHeadersTablist").empty();
	}catch(e){}
	gTimer=setInterval("XimfmailStartup()", 20);
}


/*
 * 
 */
function LoadXimfmailPanel(currentInstance){	
	try{
		//reset old ihm
		$("#ximfmailComposeMessageHeadersTablist").empty();
	}catch(e){}

	gConsole.logStringMessage("DBG [ximfmail - messengerCompose - LoadXimfmailPanel ] \n XIMF instance : "+ currentInstance);
		
	if(currentInstance){
		InsertXimfmailComposer(currentInstance);
		gCurrentInstance = currentInstance;
	}	
	
}


/*
 * 
 */
var ximfmailOnSend = {	
	observe: function(subject, topic, data) {		
		if(!gCurrentIdentity) return;
				
		var msgCompFields = gMsgCompose.compFields;		
		var charSet = null;
		charSet = msgCompFields.characterSet;
		if(!charSet){
			charSet == msgCompFields.defaultCharacterSet;
		}
		// insert extended headers in sending message
		var headersToSend = ReadMimeHeadersSelection(XIMF_SEPARATOR_HEADER, XIMF_ENDLINE, charSet);
		if(msgCompFields && headersToSend){
			//msgCompFields.otherRandomHeaders += headersToSend;
			msgCompFields.otherRandomHeaders += headersToSend;			
		}
		
		// apply xsmtp rules instances
		if(gCurrentIdentity.getBoolAttribute("ximfmail_xsmtp_compatibility_on")){				
			gConsole.logStringMessage("[ximfmail - ximfmailOnSend ] \n ICI LA COMPATIBILITE XSMTP EST TRAITEE");
			var xsmtpHeadersToSend = ReadXsmptHeadersTranslation(XIMF_SEPARATOR_HEADER, XIMF_ENDLINE,charSet);
			if(msgCompFields && xsmtpHeadersToSend){
				//msgCompFields.otherRandomHeaders += xsmtpHeadersToSend;
				msgCompFields.otherRandomHeaders += xsmtpHeadersToSend;
			}
		}
		
		// append Security labels
		AppendESSSecuityLabel();	
  	}
};