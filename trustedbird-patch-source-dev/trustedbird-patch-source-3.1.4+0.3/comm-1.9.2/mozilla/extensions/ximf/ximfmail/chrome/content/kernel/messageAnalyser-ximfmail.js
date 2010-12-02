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


/*
 * read datas of a message from an valid URI
 */
function XimfMessageAnalyser(){
	var _mailUri = null;
	var _xHdrArray =[]; // array of ximfHdr : _ximfHdrArray[ximfHdr]
	
	function xHdr(){
		this._hdrName;
		this._hdrValue;
	}
		
	if(typeof XimfMessageAnalyser.initialized == "undefined"){		
		
		XimfMessageAnalyser.prototype.setOriginalURI = function(uri){
			 _mailUri = uri;
		}		
		/*
		 * Extract Headers fields from mail
		 * Create array of {[headerName][headerValue],[headerName][headerValue],...}
		 */
		XimfMessageAnalyser.prototype.createXimfHdrArray = function(){
			try{
				var cmessenger = Components.classes["@mozilla.org/messenger;1"].createInstance(Components.interfaces.nsIMessenger);
				var msgSvc =  cmessenger.messageServiceFromURI(_mailUri);
		
				//var xmsgHdr = _messenger.msgHdrFromURI(gCurrentMessageUri); // ok, entetes basic de messages
				var MsgStream =  Components.classes["@mozilla.org/network/sync-stream-listener;1"].createInstance();
		 		var consumer = MsgStream.QueryInterface(Components.interfaces.nsIInputStream);
		 		var ScriptInput = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance();
		 		var ScriptInputStream = ScriptInput.QueryInterface(Components.interfaces.nsIScriptableInputStream);
		 		ScriptInputStream.init(consumer);
		
		 		try{
		   			msgSvc.streamMessage(_mailUri, MsgStream, msgWindow, null, false, null);
		 		}catch (e){
		 			// can't read heafer message (bad uri...)		   		
					gConsole.logStringMessage("[ximfmail - MessageAnalyser - createXimfHdrArray ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
					return;	
				}	 			
						
				if(!ScriptInputStream)	return;
				// extract headers datas of selected message		 	
		 		var content = "";		 		 		
				var nbBytes = ScriptInputStream.available();
				var tmpBuf = ScriptInputStream.read(nbBytes);

				// RFC 2822 :  The body is simply a sequence of characters that
		   		// follows the header and is separated from the header by an empty line
		   		// (i.e., a line with nothing preceding the CRLF). 		
				var endHdrsNlock = tmpBuf.indexOf("\r\n\r\n",0);
				if(endHdrsNlock != -1){					
			 		content = tmpBuf.substring(0,endHdrsNlock);
				}else{
					content = tmpBuf;
				}	
	
				//alert(content);
				tmpBuf = null;
				ScriptInputStream.close();
				consumer.close();
				//msgSvc
				var separator = new RegExp("[\r\n]+","g"); // end line
				var tab = content.split(separator);
		
				// filter on IMF headers - append data to array
				if(_xHdrArray.length > 0)
					_xHdrArray.splice(0,_xHdrArray.length);
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
						var xhdr = new xHdr();
						xhdr._hdrName = lowcaseTmp.substring(0,lowcaseTmp.indexOf(": ",0));
						xhdr._hdrValue = lowcaseTmp.substring(lowcaseTmp.indexOf(": ",lowcaseTmp)+2);
						
						// decode MIME Header
						xhdr._hdrValue = DecodeMimeXimfheader(xhdr._hdrValue);						
												
						_xHdrArray.push(xhdr);
						//gConsole.logStringMessage("[ximfmail - MessageAnalyser - push : ] \n" + xhdr._hdrName + " :: "+xhdr._hdrValue);		
					}			
				}
			}catch(e){
				gConsole.logStringMessage("[ximfmail - MessageAnalyser - createXimfHdrArray ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);	
			}
		}
			
			/*
			 * 
			 */
			XimfMessageAnalyser.prototype.getHeaderValue = function(headerName){	
				var value = null;
				try{					
					var tmpHead = null;
					for(var idx_xHdrArray = 0 ; idx_xHdrArray < _xHdrArray.length ; ++idx_xHdrArray){
						tmpHead = _xHdrArray[idx_xHdrArray]._hdrName;						
						if(headerName.toLowerCase() == tmpHead.toLowerCase()){
							value = _xHdrArray[idx_xHdrArray]._hdrValue;							
							break;
						}
					}
				}catch(e){
					gConsole.logStringMessage("[ximfmail - MessageAnalyser - getHeaderValue ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);	
				}
				return value;
			}
			/*
			 * 
			 */
			XimfMessageAnalyser.prototype.getCompleteArray = function(){
				return _xHdrArray;
			}
			/*
			 * search for associated XIMF INSTANCE of account definition
			 */
			XimfMessageAnalyser.prototype.hasXimfHeaders = function(currentDefinition){			
				var uriInstanceXimf = null;
				var sdefinition = null;
				var sversion = null;
				var sname = null;
				sversion = this.getHeaderValue(XIMF_VERSION_HEADER);
				sname = this.getHeaderValue(XIMF_NAME_HEADER);				
				gConsole.logStringMessage("DBG [ximfmail - MessageAnalyser - hasXimfHeaders ] \ndefinition uri = "+ currentDefinition +"\nXIMF version = "+ sversion+"\nXIMF name = "+sname );
				
				if(gXimfCatalog && sname &&	sversion)				
					uriInstanceXimf = gXimfCatalog.getInstanceUri(currentDefinition,sname,sversion);					
							
				return uriInstanceXimf;
			}
			
			/*
			 * add or replace Ximfheader in _xHdrArray
			 */
			XimfMessageAnalyser.prototype.setHeaderValue = function(headerName, headerValue){	
				try{					
					var isNewHeader = true;
					for(var idx_xHdrArray = 0 ; idx_xHdrArray < _xHdrArray.length ; ++idx_xHdrArray){
						var tmpHead = _xHdrArray[idx_xHdrArray]._hdrName;						
						if(tmpHead.toLowerCase() == headerName.toLowerCase()){
							_xHdrArray[idx_xHdrArray]._hdrValue = headerValue;
							isNewHeader = false;
							break;
						}
					}
					if(isNewHeader){
						var xhdr = new xHdr();
						xhdr._hdrName = headerName;
						xhdr._hdrValue = headerValue;
						_xHdrArray.push(xhdr);
					}
				}catch(e){
					gConsole.logStringMessage("[ximfmail - MessageAnalyser - setHeaderValue ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);	
				}				
			}
		
		// MessageAnalyser
	 	XimfMessageAnalyser.initialized = true;
	 }
}