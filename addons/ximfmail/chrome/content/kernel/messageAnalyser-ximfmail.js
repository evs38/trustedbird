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
var gJSLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].createInstance(Components.interfaces.mozIJSSubScriptLoader);
gJSLoader.loadSubScript("chrome://ximfmail/content/constant-ximfmail.js");


/**
Get message source
@param {nsIMsgDBHdr} header
@param {function} callbackFunction Function to call when data are received: callbackFunction(header, receivedData, callbackParam)
@param callbackParam Parameter of callbackFunction
@return {string} Message source or <b>false</b> if an error occurs
*/
function XimfmailGetMessage(mailUri, callbackFunction, callbackParam){
	if (!mailUri) return;	
	var streamListener = {
		QueryInterface: function(aIID) {
			if (aIID.equals(Components.interfaces.nsISupports)
				|| aIID.equals(Components.interfaces.nsIStreamListener))
				return this;
			throw Components.results.NS_NOINTERFACE;
		},
		data: "",
		isDataComplete: false,
		onStartRequest: function(request, context) {},
		onDataAvailable: function(request, context, inputStream, offset, available) {
			if(!this.isDataComplete ){
				var stream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
				stream.init(inputStream);
				this.data += stream.read(available);
				stream.close();
				stream = null;
	
				// parse headers only
				var idxEnd = this.data.indexOf("\r\n\r\n",0); // * CRLF DOS : "\r\n"
  				if(idxEnd == -1) idxEnd = this.data.indexOf("\n\n",0); // * CRLF UNIX : "\n"
  				if(idxEnd == -1) idxEnd = this.data.indexOf("\r\r",0); //CRLF OS : "\r"
  				if(idxEnd != -1) this.isDataComplete = true;	// msgSrc = msgSrc.substr(0,idxEnd); //dbg gConsole.logStringMessage("[smime - MessageAnalyser - succes getting mime headers : ] \n" + msgSrc);		
  			}
		},
		onStopRequest: function(request, context, status) {
			if (Components.isSuccessCode(status)) {				
				callbackFunction( this.data, mailUri, callbackParam);
			} else {
				srv.errorSrv("notifyListener.getMsgSrc - "+mailUri+" - Error: "+status);
	}
		}		
				}	
	
	gConsole.logStringMessage("[ximfmail - XimfmailGetMessage ]");
	$("#ximfmailMailPanel").attr("collapsed","true"); // XIMF headers ihm
	$("#ximfmail-custom-panel").attr("collapsed","true"); //XIMF account profile type ihm
	$("#ximfHeadBox").attr("collapsed","true");	// XIMF pictures ihm	
	var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);
	pref = pref.QueryInterface(Components.interfaces.nsIPrefBranch2);
	if(pref.getBoolPref("mailnews.headers.showXimfmail")){
		// parse message to get XIMF headers
		var cmessenger = Components.classes["@mozilla.org/messenger;1"].createInstance(Components.interfaces.nsIMessenger);
		var msgSvc =  cmessenger.messageServiceFromURI(mailUri);
		try { msgSvc.streamMessage(mailUri, streamListener, null, null, false, null); } catch (ex) { return false; }		
					}else{
		DeleteXimfHeaders();
					} 
}
		  
/*
 * Set Ximf headers of message to array
 * 
 * 
 */	
function XimfmailParseMessage(msgSrc){
				var separator = new RegExp("\\r\\n|\\r|\\n", "i");// end line
	var tab = msgSrc.split(separator);
	var currentXimfHdrArray = [];
				// filter on IMF headers - append data to array
		 		var reg_folding = new RegExp("(  )","g");
		 		var reg_folding2 = new RegExp("(\t)","g");
		 		var idxTab=0;

				for(idxTab=0; idxTab<tab.length; ++idxTab){
					var header_line = tab[idxTab];		
					// search for long header fields (folding) - RFC 2822
					if(header_line[0]!= " "){ 	
						try{			 	
							while( idxTab < tab.length ){
								var next_line = tab[idxTab+1];
								if(next_line){
									if(next_line[0] == " " || next_line[0] == "\t"){																		
										header_line += next_line; //next_line.toLowerCase();
										header_line = header_line.replace(reg_folding," ");
										header_line = header_line.replace(reg_folding2,"");
										++idxTab;
									}else{ break; }
								}else{ break; }
							}
						}catch(e){}
					}						
					 //gConsole.logStringMessage("[ximfmail - createXimfHdrArray - decode header line : ] \n" + header_line);		
					
					// fill _ximfHdrArray			
					//var lowcaseTmp = header_line.toLowerCase();
			
					var lowcaseTmp = header_line; //String_from_utf8(header_line).toLowerCase(); 			
					if(lowcaseTmp.indexOf(":")!=-1){
				var xhdr = new Object;
						xhdr._hdrName = lowcaseTmp.substring(0,lowcaseTmp.indexOf(": ",0));
						xhdr._hdrValue = lowcaseTmp.substring(lowcaseTmp.indexOf(": ",lowcaseTmp)+2);
						
						// decode MIME Header
						xhdr._hdrValue = DecodeMimeXimfheader(xhdr._hdrValue);						
												
				currentXimfHdrArray.push(xhdr);
						//gConsole.logStringMessage("[ximfmail - MessageAnalyser - push : ] \n" + xhdr._hdrName + " :: "+xhdr._hdrValue);		
					}			
				}
			
	return currentXimfHdrArray;
}

	
/*
 * Ximf headers of current message
			 */
function XimfmailMesssage(){	
	this._mailUri = null;	
	this._instanceMsgXimf = null;
	this._current_definition = null;
	this._currentXimfHdrArray = [];
	if(typeof XimfmailMesssage.initialized == "undefined"){
		// set uri of message
		XimfmailMesssage.prototype.set = function(uri){
				try{					
				if(!uri) return;
				if(this._mailUri ==	uri) return;
				this._mailUri =	uri;				
				}catch(e){
				gConsole.logStringMessage("[ximfmail - XimfmailMesssage.set ] " + e +"\nline : " + e.lineNumber + " : "+ e + "\nfile : "+ Error().fileName);
				}
			return false;
		};
		//
		XimfmailMesssage.prototype.init = function(uri,headerArray){
			try{
				if(!uri) return;
				if(this._mailUri ==	uri) return;
				this._mailUri =	uri;
				this._instanceMsgXimf = null;
				
				this._currentXimfHdrArray=headerArray;
				
				// get account XIMF definition
				var prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);
				this._current_definition = "";				
				if(prefBranch.prefHasUserValue("mailnews.instance.mailpanel")){
					if(prefBranch.prefHasUserValue("mailnews.theme.mailpanel"))
						this._current_definition =  prefBranch.getCharPref("mailnews.theme.mailpanel");
				}else{
					gConsole.logStringMessage("DBG [ximfmail - XimfmailMesssage.init ] no ximf preferences ");
					return false;					
			}
												 	
				var uriXimfInstance = this.hasXimfHeaders(this._current_definition);
				if(uriXimfInstance){
					gConsole.logStringMessage("DBG [ximfmail - XimfmailMesssage.init ] mail instance :  " + uriXimfInstance);			
					this._instanceMsgXimf = uriXimfInstance;
					return true;
				}else{
					return false;
			}
				
				
			}catch(e){
				gConsole.logStringMessage("[ximfmail - XimfmailMesssage.init ] " + e +"\nline : " + e.lineNumber + " : "+ e + "\nfile : "+ Error().fileName);
			}
			return false;
		};		
		
		
		// check message with XimfmailCatalog
		XimfmailMesssage.prototype.hasXimfHeaders = function(currentDefinition){
			try{			
				var sversion = null;
				var sname = null;
				
				sversion = this.getHeaderValue(XIMF_VERSION_HEADER);
				sname = this.getHeaderValue(XIMF_NAME_HEADER);				
				gConsole.logStringMessage("DBG [ximfmail - MessageAnalyser - hasXimfHeaders ] \ndefinition uri = "+ currentDefinition +"\nXIMF version = "+ sversion+"\nXIMF name = "+sname );
				
				//if(gXimfCatalog && sname &&	sversion)				
				if(!sname) return null;
				
				// check currentDefinition in XimfmailCatalog
				CreateXimfmailCatalog();
					uriInstanceXimf = gXimfCatalog.getInstanceUri(currentDefinition,sname,sversion);							
							
			}catch(e){
				gConsole.logStringMessage("[ximfmail - XimfmailMesssage.hasXimfHeaders ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
			}
					
				return uriInstanceXimf;
		};
		
		// get XIMF value from message
		XimfmailMesssage.prototype.getHeaderValue = function(headerName){
			var value = null;
			try{					
				var tmpHead = null;
				for(var idx_xHdrArray = 0 ; idx_xHdrArray < this._currentXimfHdrArray.length ; ++idx_xHdrArray){
					tmpHead = this._currentXimfHdrArray[idx_xHdrArray]._hdrName;						
					if(headerName.toLowerCase() == tmpHead.toLowerCase()){
						value = this._currentXimfHdrArray[idx_xHdrArray]._hdrValue;							
						break;
					}
				}
			}catch(e){
				gConsole.logStringMessage("[ximfmail - XimfmailMesssage.getValue ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);	
			}
			return value;
		};
			
		// get XIMF value from message
		XimfmailMesssage.prototype.getCompleteArray = function(){
			return this._currentXimfHdrArray();
		};
		// set XIMF value to message
		XimfmailMesssage.prototype.setXimfHeader = function(headerName,headerValue){		
				try{					
					var isNewHeader = true;
				for(var idx_xHdrArray = 0 ; idx_xHdrArray < this._currentXimfHdrArray.length ; ++idx_xHdrArray){
					var tmpHead = this._currentXimfHdrArray[idx_xHdrArray]._hdrName;						
						if(tmpHead.toLowerCase() == headerName.toLowerCase()){
						this._currentXimfHdrArray[idx_xHdrArray]._hdrValue = headerValue;
							isNewHeader = false;
							break;
						}
					}
					if(isNewHeader){
					var xhdr = new Object;
						xhdr._hdrName = headerName;
						xhdr._hdrValue = headerValue;
					this._currentXimfHdrArray.push(xhdr);
					}
				}catch(e){
					gConsole.logStringMessage("[ximfmail - XimfmailMesssage.setXimfHeader ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);	
				}				
		};
		XimfmailMesssage.initialized = true;
	 }
}