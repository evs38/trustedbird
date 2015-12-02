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
gConsole.logStringMessage("[ximfmail] messengerCompose-ov-ximfmail.js file loaded ");
var gCurrentInstance = "";
var gcounterStarter = 1;
/**
 * mail:composeOnSend observer
 * Add XIMF Headers to MIME message
 */
var XimfMsgSend = XimfMsgSend || {};
XimfMsgSend = {
	observe: function(subject, topic, data) {
		if (!gCurrentIdentity) {
			return;
		}
		try {
			var msgCompFields = gMsgCompose.compFields;
			var charSet = null;
			charSet = msgCompFields.characterSet;
			if(!charSet){
				charSet === msgCompFields.defaultCharacterSet;
			}
			var currCompfieldsotherHeaders = msgCompFields.otherRandomHeaders;
		   	// add headers of ximf instance
			var addCompfieldsotherHeaders = "";
			var ximfCatalog = XimfCatalog.getInstance();
			if (ximfCatalog) {
				var ximfName = ximfConst.DEFAULT_XIMF_NAME;
				ximfName = ximfCatalog.getNameInstance(gXimfHdrs.getXimfInstanceResource());
				try {
					if (ximfName.toLowerCase() === ximfConst.SMTP_INSTANCE_KEY) {
						// FT INT_FT3970
						gConsole.logStringMessage("[ximfmail - ximfmailOnSend ] Send non XIMF message - instance  " + ximfName);
					} else {
						addCompfieldsotherHeaders += EncodeMimeXimfheader(ximfConst.XIMF_NAME_HEADER, ximfName, charSet) + ximfConst.XIMF_ENDLINE;
						// insert XIMF-Version - B4521
						var ximfVersion = ximfConst.DEFAULT_XIMF_VERSION;
						ximfVersion = ximfCatalog.getVersionInstance(gXimfHdrs.getXimfInstanceResource());
						addCompfieldsotherHeaders += EncodeMimeXimfheader(ximfConst.XIMF_VERSION_HEADER, ximfVersion, charSet) + ximfConst.XIMF_ENDLINE;
						// insert extended headers in sending message
						var headersToSend = ReadMimeHeadersSelection(ximfConst.XIMF_ENDLINE, charSet);
						if (headersToSend) {
							addCompfieldsotherHeaders += headersToSend;
							gConsole.logStringMessage("[XimfMsgSend] Ximf header added to send message!");
						}
					}
				} catch(ex) {
					gConsole.logStringMessage("[XimfMsgSend]Exception : " + ex + "\nfile : " + Error().fileName + "\nline : " + Error().lineNumber);
				}
			}
			// apply xsmtp rules instances
			if (gCurrentIdentity.getBoolAttribute("ximfmail_xsmtp_compatibility_on")) {
				var xsmtpHeadersToSend = ReadXsmptHeadersTranslation(ximfConst.XIMF_SEPARATOR_HEADER, ximfConst.XIMF_ENDLINE,charSet);
				if (xsmtpHeadersToSend) {
					addCompfieldsotherHeaders += xsmtpHeadersToSend;
					gConsole.logStringMessage("[XimfMsgSend]XSMTP compatibility process");
				}
			}
			// add ximf headers 1 time - copy last XIMF entries
			if (currCompfieldsotherHeaders.length <= 0 ) {
				msgCompFields.otherRandomHeaders = addCompfieldsotherHeaders;
			} else {
				var regCRLF = new RegExp(ximfConst.XIMF_ENDLINE, "g");
				var arrayAddCompfieldsotherHeaders = addCompfieldsotherHeaders.split(regCRLF);
				var arrayCurrCompfieldsotherHeaders = currCompfieldsotherHeaders.split(regCRLF);
				for (var i=0; i < arrayAddCompfieldsotherHeaders.length; ++i) {
					var tmpAdd = arrayAddCompfieldsotherHeaders[i].slice(0,arrayAddCompfieldsotherHeaders[i].indexOf(":",0));
					if (tmpAdd !=="") {
						for (j=0 ; j<arrayCurrCompfieldsotherHeaders.length ; ++j) {
							var tmpCurr = arrayCurrCompfieldsotherHeaders[j].slice(0,arrayCurrCompfieldsotherHeaders[j].indexOf(":",0));
							if (tmpCurr !== "" && tmpCurr === tmpAdd) {
								arrayCurrCompfieldsotherHeaders[j] = arrayAddCompfieldsotherHeaders[i];
								arrayAddCompfieldsotherHeaders[i] = "";
								break;
							}
						}
					}
				}
				//update new selection
				var arrayAddCompfieldsotherHeaders2 = new Array();
				for (var i=0 ; i<arrayAddCompfieldsotherHeaders.length ; ++i) {;
					if (arrayAddCompfieldsotherHeaders[i]!== "") {
						arrayAddCompfieldsotherHeaders2.push(arrayAddCompfieldsotherHeaders[i]);
					}
				}
				// insert header
				msgCompFields.otherRandomHeaders = arrayCurrCompfieldsotherHeaders.join(ximfConst.XIMF_ENDLINE);
				if (arrayAddCompfieldsotherHeaders2.length>0) {
					msgCompFields.otherRandomHeaders += arrayAddCompfieldsotherHeaders2.join(ximfConst.XIMF_ENDLINE);
				}
			}
			// append Security labels
			AppendESSSecuityLabel();
		}catch(e){
			gConsole.logStringMessage("[XimfMsgSend] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
		}
  	}
};
/**
 * (Re)open message composer with XIMF instance
 */
var XimfMsgCompose = XimfMsgCompose || {};
XimfMsgCompose = {	
	maxNbStarter : 20,
	counterStarter : 0,
	catalog: null,
	currentInstance : undefined,
	preinit: function(){
		var objMsgCompose = this;
		XimfCatalogFactory.getIntance(function (instance) {
			gConsole.logStringMessage("[ximfmail - XimfMsgCompose ] instance of catalog ready to use, init composer...");
			objMsgCompose.catalog = instance;
			objMsgCompose.init();
		});
	},
	init: function () {
		// ximfmail not requested
		gConsole.logStringMessage("[ximfmail - XimfMsgCompose ] init begin...");
		var prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);
		var showXimfmail = prefBranch.getBoolPref("mailnews.headers.showXimfmail");
		//ResetXimfhdrsDom();
		if (showXimfmail === false) {
			gConsole.logStringMessage("[ximfmail - XimfMsgCompose ] no ximfmail composerfor this message");
			$("#isUsingXimfail").attr("hidden","true");
			try{
				//remove ximf events ...
				HideSendMessageElements(true);
				$("#addressingWidget").unbind("command",SpecialXimfRule_CheckAddress);
				ReloadSecurityAccess();
			}catch(e){
			}
			return;
		}
		// let's compose ximf message
		gConsole.logStringMessage("[ximfmail - XimfMsgCompose ] instance of ximfmail has to be loaded");
		var o = this;
		$("#isUsingXimfail").attr("hidden","false");
		// observer on sending message
		var ximfmailObserverSvc = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		ximfmailObserverSvc.addObserver(XimfMsgSend, "mail:composeOnSend", false);
		// add catalog
		XimfMsgSend.ximfCatalog = o.catalog;
		// check message type
		try {
			// is Template or Draft message
			var typeMsg = -1;
			var args = window.arguments[0];
			if (args) {
				typeMsg = args.type;
			} else {
				if (gMsgCompose) {
					typeMsg = gMsgCompose.type;
				}
			}
			switch (typeMsg) {
				case nsIMsgCompType.Draft:
				case nsIMsgCompType.Template:
				case nsIMsgCompType.Reply:
	        	case nsIMsgCompType.ReplyAll:
	        	case nsIMsgCompType.ReplyToSender:
	        	case nsIMsgCompType.ForwardInline:
	        	case nsIMsgCompType.ForwardAsAttachment:
					var uriMsg = null;
					if (args) {
						uriMsg = args.originalMsgURI;
					} else {
						if (gMsgCompose) {
							uriMsg = gMsgCompose.originalMsgURI;
						}
					}					
					ResetXimfhdrsDom();
					XimfmailGetMessage(uriMsg, function (msgSrc,uriSrc) {
						// Get Extended headers of messages and display known instances
						var currentXimfHdrArray = XimfmailParseMessage(msgSrc);
						var ximfMsg = new XimfmailMesssage();
						if (ximfMsg.init(uriSrc,currentXimfHdrArray)) {
							gConsole.logStringMessage("[ximfmail - XimfMsgCompose ] parse original message and load Ximf instance " + ximfMsg._instanceMsgXimf);
							o.currentInstance = ximfMsg._instanceMsgXimf;
							o.loadPanel();
							ComputeWithForm(ximfMsg);
						} else {
							$("#ximfmailComposeMessageTitle").attr("value","");
							$("#isUsingXimfail").attr("hidden","false");
							HideSendMessageElements(true);
							$("#addressingWidget").unbind("command",SpecialXimfRule_CheckAddress);
							ReloadSecurityAccess();
						}
					});
					break;
				default :
					// default instance of account loaded
					o.currentInstance = prefBranch.getCharPref("ximfmail.composeMsg.instance");
					gConsole.logStringMessage("[ximfmail - XimfMsgCompose ] load Ximf instance " + o.currentInstance);
					o.loadPanel();
					break;
			}
		} catch(e) {
			gConsole.logStringMessage("[ximfmail - XimfMsgCompose ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
		}	
	},
	loadPanel : function () {
		gConsole.logStringMessage("[XimfMsgCompose:loadPanel ] XIMF instance : " + this.currentInstance);
		try{
			// reload security user functions
			ReloadSecurityAccess();
		}catch(e){}
		
		if (this.currentInstance) {
			try {
				gCurrentInstance = this.currentInstance;
				if (null !== gXimfHdrs) {
					gXimfHdrs = null;
				}
				gXimfHdrs = new XimfmailInstanceHeaders();
				gXimfHdrs.init(gCurrentInstance);
				gXimfHdrs.loadXimfSecurityRules(gCurrentIdentity);
				InsertXimfhdrsDom(gXimfHdrs.getXimfInstanceResource(), ximfConst.CHROME_XSL_MSG_COMPOSE, this.catalog);
				// controler init
				LoadXimfhdrsEventObserver();
				ExecuteXimfHdrsDefaultValuesRule();
				InitSpecialXimfRules();
				CheckXimfhdrsSelection();
			}catch(e){
				gConsole.logStringMessage("[ximfmail - InsertXimfmailComposer ] " + e +"\nline : " + e.lineNumber + " : "+ e + "\nfile : "+ Error().fileName);
			}
		}
		// ximfmail composer is initialized, event-it
		var event = document.createEvent('Events');
	    event.initEvent('compose-ximfmail-init', false, true);
	    document.getElementById("msgcomposeWindow").dispatchEvent(event);
	}
};
/**
 * wait for thunderbird context before initializing ximfmail composer
 * @returns
 */
function ximfMsgComposeStarter() {
	var maxNbStarter = 20;
	gConsole.logStringMessage("[ximfmail - ximfMsgComposeStarter ]start try " + gcounterStarter + "/" + maxNbStarter + " - gCurrentIdentity = " + gCurrentIdentity.key);
	if (!gCurrentIdentity) {
		try{
			// try to get identity
			// copy code from LoadIdentity(startup) function of MsgComposeCommand.js file
			var identityElement = document.getElementById("msgIdentity");
			if (identityElement) {
				gCurrentIdentity = MailServices.accounts.getIdentity(identityElement.value);
	        }
		}catch(e){
			gConsole.logStringMessage("[ximfmail - ximfMsgComposeStarter ] error : " + e);
		}
		gConsole.logStringMessage("[ximfmail - ximfMsgComposeStarter ] get gCurrentIdentity = " + gCurrentIdentity.key);
		// I can't catch event on completely initialized compose message, so loop on gCurrentIdentity loaded
		if (gcounterStarter < maxNbStarter) {
			gcounterStarter++;
			setTimeout(function() {
				ximfMsgComposeStarter();
			}, 50);
			return;
		}
	}
	// init XimfMsgCompose
	gConsole.logStringMessage("[ximfmail - ximfMsgComposeStarter ] Init XimfMsgCompose with identity " + gCurrentIdentity.key);
	XimfMsgCompose.preinit();
}
//init ximfmail document
window.addEventListener("compose-window-reopen", function() {
		XimfMsgCompose.init();	
	}, true);
window.addEventListener("compose-window-init", function() {
		gConsole.logStringMessage("[ximfmail - ximfMsgComposeStarter ] compose-window-init event catched! ");
		gcounterStarter = 1;
		ximfMsgComposeStarter();	
	}, true);
// overload Trustedbird function : add verifications on security message
SendMessage = function(){
	if (CheckIfMustBSigned()) {
		return false;
	}
	GenericSendMessage(nsIMsgCompDeliverMode.Now);
};
// overload Trustedbird function : add verifications on security message
SendMessageLater = function() {
	if(CheckIfMustBSigned()){
		return false;
	}
	GenericSendMessage(nsIMsgCompDeliverMode.Later);
};
/*
 * is XIMFMAIL message ?
 * yes : check if message must be signed
 * no : continue
 */
function CheckIfMustBSigned() {
	try {
		var arrSecureHdrs = CreateRulesArray(gCurrentInstance,"ximf:secureHeaders");
		var arrSecurityLabelHdrs = CreateRulesArray(gCurrentInstance,"ximf:securityLabel");
		if ((arrSecureHdrs.length > 0 || arrSecurityLabelHdrs.length > 0) && !gSMFields.signMessage) {
			// current message must be secured
			toggleSignMessage();
			if (!gCurrentIdentity.getUnicharAttribute("signing_cert_name")) {
				return true;
			} else {
				if (!gSMFields.signMessage) {
					// certificate is set by user
					toggleSignMessage();
				}
			}
		}
	} catch(e) {
		gConsole.logStringMessage("[ximfmail - SendMessage_Ximf ]  not a ximf message... \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
	}
	return false;
}