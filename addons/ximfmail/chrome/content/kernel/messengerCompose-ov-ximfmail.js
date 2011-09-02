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

var gConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
var gPrefBranch = null;
var gCurrentInstance = "";


/* Init ximfmail document */ 
window.addEventListener("compose-window-init", XimfmailComposeInit, true);
//window.addEventListener("compose-window-reopen", XimfmailReOpen, true); function XimfmailReOpen(){alert("compose-window-reopen")}

/*
 * (Re)open message composer with XIMF instance
 */
function XimfmailComposeInit(){
	// ximfmail not requested
	if(!gPrefBranch) gPrefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);
	if(!gPrefBranch.getBoolPref("mailnews.headers.showXimfmail")){ 
		$("#isUsingXimfail").attr("hidden","true");
		$("#ximfmailComposeMessageHeadersTablist").empty();	
		try{
			//remove ximf events ...
			HideSendMessageElements(true);
			$("#addressingWidget").unbind("command",SpecialXimfRule_CheckAddress);			
			ReloadSecurityAccess();
		}catch(e){}
	}else{
		CreateXimfmailCatalog();	
		$("#isUsingXimfail").attr("hidden","false");
		
		// observer on sending message
		var ximfmailObserverSvc = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		ximfmailObserverSvc.addObserver(ximfmailOnSend, "mail:composeOnSend", false);	
		
		// I can't catch event on completely initialized compose message, so loop on gCurrentIdentity loaded
		setTimeout("XimfmailStartup()", 50);
	}	
}


var gMaxTimeoutXimfmail=0;
function XimfmailStartup(){
	if(!gCurrentIdentity){ 
		if(gMaxTimeoutXimfmail<20){
			setTimeout("XimfmailStartup()", 100);
			++gMaxTimeoutXimfmail;
		}	
		return;
	}
	
	var currentInstance = null;
	var current_definition = null;
	//is Template or Draft message
	var typeMsg = -1;
	try{
		// get current definition and default instance of account loaded		
		currentInstance = gPrefBranch.getCharPref("ximfmail.composeMsg.instance");
		current_definition =  gPrefBranch.getCharPref("mailnews.theme.mailpanel");
		var args = window.arguments[0];
		if(args){
			typeMsg = args.type;
		}else{			
			if(gMsgCompose) typeMsg = gMsgCompose.type;			
		}
	}catch(e){
		gConsole.logStringMessage("[ximfmail - XimfmailStartup ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);		
	}
	
	try{	
		switch(typeMsg){			
			case nsIMsgCompType.Draft:
			case nsIMsgCompType.Template:
			case nsIMsgCompType.Reply:
        	case nsIMsgCompType.ReplyAll:
        	case nsIMsgCompType.ReplyToSender:	
        	case nsIMsgCompType.ForwardInline:		
        	case nsIMsgCompType.ForwardAsAttachment: 	
				//alert("typeMsg = " + args.type + "\nUri of message : " + args.originalMsgURI);
				gJSLoader.loadSubScript("chrome://ximfmail/content/messageAnalyser-ximfmail.js");
					
				var msgAnalyser = new XimfMessageAnalyser();
				
				// search for template XIMF	
				if( args){			
					msgAnalyser.setOriginalURI(args.originalMsgURI); 
				}else{
					if(gMsgCompose) msgAnalyser.setOriginalURI(gMsgCompose.originalMsgURI); 	
				}
				msgAnalyser.createXimfHdrArray();			 	
				
				// get instance of message	
				var uriXimfInstance = msgAnalyser.hasXimfHeaders(current_definition);
				if(uriXimfInstance){				
					currentInstance = uriXimfInstance;
				LoadXimfmailPanel(currentInstance);
				ComputeWithForm(msgAnalyser);				
				}else{					
					$("#ximfmailComposeMessageHeadersTablist").empty();
					$("#ximfmailComposeMessageTitle").attr("value","");
					$("#isUsingXimfail").attr("hidden","false");						
					gXimfHdrs=null;						
					//remove ximf events ...
					HideSendMessageElements(true);
					$("#addressingWidget").unbind("command",SpecialXimfRule_CheckAddress);			
					ReloadSecurityAccess();					
				}			
				break;
			default :				
				LoadXimfmailPanel(currentInstance);							
				break;
		}
	}catch(e){
		gConsole.logStringMessage("[ximfmail - XimfmailStartup ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
	}	
	//gConsole.logStringMessage("DBG [ximfmail - messengerCompose - XimfmailStartup ] \n XIMF instance : "+ currentInstance + "\n XIMF definition : " + current_definition);
}

/*
 * 
 */
function LoadXimfmailPanel(currentInstance){	
	try{
		//reset old ihm
		$("#ximfmailComposeMessageHeadersTablist").empty();
		ReloadSecurityAccess(); // reload security user functions
	}catch(e){}
	gConsole.logStringMessage("DBG [ximfmail - messengerCompose - LoadXimfmailPanel ] \n XIMF instance : "+ currentInstance);
	if(currentInstance){
		InsertXimfmailComposer(currentInstance);
		gCurrentInstance = currentInstance;
		// ximfmail composer is initialized, event-it 		
		var event = document.createEvent('Events');
      	event.initEvent('compose-ximfmail-init', false, true);
      	document.getElementById("msgcomposeWindow").dispatchEvent(event);
	}		
}


/*
 * 
 */
var ximfmailOnSend = {	
	observe: function(subject, topic, data) {		
		if(!gCurrentIdentity) return;							
		try{
			var msgCompFields = gMsgCompose.compFields;		
			var charSet = null;
			charSet = msgCompFields.characterSet;
			if(!charSet){
				charSet == msgCompFields.defaultCharacterSet;
			}
			
			var currCompfieldsotherHeaders = msgCompFields.otherRandomHeaders;
		    var addCompfieldsotherHeaders = "";
			//alert("currCompfieldsotherHeaders = " + currCompfieldsotherHeaders)
			// insert extended headers in sending message
			var headersToSend = ReadMimeHeadersSelection( XIMF_ENDLINE, charSet);
			if(msgCompFields && headersToSend){			
				//msgCompFields.otherRandomHeaders += headersToSend;		
				addCompfieldsotherHeaders += headersToSend;
			}
			
			// apply xsmtp rules instances
			if(gCurrentIdentity.getBoolAttribute("ximfmail_xsmtp_compatibility_on")){				
				var xsmtpHeadersToSend = ReadXsmptHeadersTranslation(XIMF_SEPARATOR_HEADER, XIMF_ENDLINE,charSet);
				if(msgCompFields && xsmtpHeadersToSend){
					//msgCompFields.otherRandomHeaders += xsmtpHeadersToSend;
					addCompfieldsotherHeaders += xsmtpHeadersToSend;
					gConsole.logStringMessage("[ximfmail - ximfmailOnSend ] \n compatibility xsmtp process");
				}
			}
			
			// add ximf headers 1 time - copy last XIMF entries
			if(currCompfieldsotherHeaders.length <= 0 ){
				msgCompFields.otherRandomHeaders = addCompfieldsotherHeaders;
			}else{
				var regCRLF = new RegExp(XIMF_ENDLINE, "g");			
				var arrayAddCompfieldsotherHeaders = addCompfieldsotherHeaders.split(regCRLF);
				var arrayCurrCompfieldsotherHeaders = currCompfieldsotherHeaders.split(regCRLF);
				for(i=0 ; i<arrayAddCompfieldsotherHeaders.length ; ++i){
					var tmpAdd = arrayAddCompfieldsotherHeaders[i].slice(0,arrayAddCompfieldsotherHeaders[i].indexOf(":",0));
					if(tmpAdd !=""){
						for(j=0 ; j<arrayCurrCompfieldsotherHeaders.length ; ++j){
							var tmpCurr = arrayCurrCompfieldsotherHeaders[j].slice(0,arrayCurrCompfieldsotherHeaders[j].indexOf(":",0));
							if(tmpCurr != ""){
								if(tmpCurr == tmpAdd){										
									arrayCurrCompfieldsotherHeaders[j] = arrayAddCompfieldsotherHeaders[i];
									arrayAddCompfieldsotherHeaders[i] = "";
									break;
								}
							}
						}
					}
				}
				
				//update new selection
				var arrayAddCompfieldsotherHeaders2 = new Array();
				for(i=0 ; i<arrayAddCompfieldsotherHeaders.length ; ++i){;
					if(arrayAddCompfieldsotherHeaders[i]!= ""){
						arrayAddCompfieldsotherHeaders2.push(arrayAddCompfieldsotherHeaders[i]);
					}
				}				
				// insert header				
				msgCompFields.otherRandomHeaders = arrayCurrCompfieldsotherHeaders.join(XIMF_ENDLINE);
				if(arrayAddCompfieldsotherHeaders2.length>0){
					msgCompFields.otherRandomHeaders += arrayAddCompfieldsotherHeaders2.join(XIMF_ENDLINE);
				}
			}
			
			// append Security labels
			AppendESSSecuityLabel();	
		}catch(e){
		gConsole.logStringMessage("[ximfmail - XimfmailStartup ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);		
	}	
  	}
};