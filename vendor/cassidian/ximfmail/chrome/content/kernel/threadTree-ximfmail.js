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
 *  TreeThread observer
 */
var XimfThreadTreeDBViewObserver = {
	// Components.interfaces.nsIObserver
	observe: function(aMsgFolder, aTopic, aData) {		
		if(gXimfThreadTree) gXimfThreadTree.addCustomColumnHandler();
	}
}

/* 
 * XimfThreadTree class
 */
function XimfThreadTree(){
	// private:
	var _ximfHdrArrayByID = [];
	
	//
	function isDataInArray(data,array){
		for(var i=0; i<array.length; ++i){
			if(data == array[i]){
				return true;
			}
		}
		return false;
	}
	
	/*
	 * Get ilk values from instance
	 */
	function LoadIlkColumnsValues2(currentInstance){
		try{
			var ilkArray = [];
		// get xml schema for instance
		if(!gXimfCatalog){			
			gXimfCatalog = new XimfCatalog();
		}
  	 	var dir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
  		var completePath = getFilePathInProfile("extensions/"+gXimfCatalog.getSchemaInstance(currentInstance));
		dir.initWithPath( completePath );			
		if(!dir.exists()){	
			gConsole.logStringMessage("[Ximfmail - createThreadTree - LoadIlkColumnsValues2] Error loading schema file : " + completePath);
			return;
		}	
		var objXML = GetXmlDocument(completePath);
		var headers = objXML.getElementsByTagName("ximf:header");
		
		// get xml dictionary parser
		var urlDictionary = getFilePathInProfile("extensions/"+gXimfCatalog.getDictionaryInstance(currentInstance));
		dir.initWithPath( urlDictionary );			
		if(!dir.exists()){			
			gConsole.logStringMessage("[Ximfmail - LoadIlkColumnsValues2] Error loading dictionary file : " + completePath);
			return;
		}		
		var dicoXML = GetXmlDocument(urlDictionary);
		var dicoElements = dicoXML.getElementsByTagName("ximf:locale");
		
		// get local lang				
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
		var refLang = prefs.getCharPref("general.useragent.locale");
		if(!refLang) refLang = "fr-FR";			
		var ilkEntities = null;
		for(var idxLang=0 ; idxLang < dicoElements.length ; ++idxLang){		
			if(dicoElements[idxLang].getAttribute("lang") == refLang){
				ilkEntities = dicoElements[idxLang].getElementsByTagName("ximf:ilk");
				break;
			}
		}
		
		// parse XML and get labels
		for(var i=0 ; i < _ximfHdrArrayByID.length ; ++i){
			var currentTreeColId = _ximfHdrArrayByID[i];
			for(var idxH = 0 ; idxH < headers.length; ++idxH){				
				var attrHeaderList = headers[idxH].attributes;				
				var headerName = headers[idxH].getAttribute("headerName");
				
				if(headerName.toLowerCase() == currentTreeColId.toLowerCase()){										
					var stringListElt = headers[idxH].getElementsByTagName("ximf:string");
					var treeElement = document.getElementById(currentTreeColId);
					
					var reg=new RegExp(' ', "gi");
					for(var j=0 ; j< stringListElt.length ; j++){
						try{						
							// get values from instance headers
							var sContent = stringListElt[j].getAttribute("content");						
							var sIlk = stringListElt[j].getAttribute("ilk")
							
							// get ilk entity from instance dictionay
							if(ilkEntities){
								for(var idxIlk = 0 ; idxIlk < ilkEntities.length ; ++idxIlk){
									if(ilkEntities[idxIlk].getAttribute("entity") == sIlk){
										sIlk = ilkEntities[idxIlk].textContent;
										//gConsole.logStringMessage("[Ximfmail - LoadIlkColumnsValues2] sIlk : " + sIlk);				
										break;
									}
								}
							}
							// set values to tree column						
							var ilkid = "ximfkey_"+sContent;
							ilkid = ilkid.replace(reg,"_");
							//gConsole.logStringMessage("[Ximfmail - LoadIlkColumnsValues2] ]"+ilkid +":"+sIlk+"[");				
							treeElement.setAttribute(ilkid,sIlk);			
						}catch(e){}			
					}
					break;
				}
			}
		}

		}catch(e){
			gConsole.logStringMessage("[ximfmail - LoadIlkColumnsValues ] " + e +"\nline : " + e.lineNumber + " : "+ e + "\nfile : "+ Error().fileName);
		}
		return ilkArray;
	}
	
	//
	function addCustomPreferences(preference, lower){
			var xListHdr = "";
			var prefList = [];
			var prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);
					
			try {
				xListHdr = prefBranch.getCharPref(preference);
				if((xListHdr) != ""){
					var reg=new RegExp("[ ]+", "g");
					prefList=xListHdr.split(reg);					
				}
			} catch(ex) {}

			// add only new headers
   			for (var i = 0; i < _ximfHdrArrayByID.length; i++) {   
   				if (!isDataInArray(_ximfHdrArrayByID[i].toLowerCase(),prefList)){
        			if (xListHdr != "") {
	        			xListHdr += " ";
    	    		}        	   	
        	   		xListHdr += _ximfHdrArrayByID[i].toLowerCase();
        	   	}
			}  			
  			prefBranch.setCharPref(preference, xListHdr);
		};
	//Column handler template definition	
	function XimfCustomColumnHandler(property) {
		// Properties
		this.property = property;
		this.isString = true;		
	
		// Functions
		this.getSortStringForRow = function (hdr){ return (this.isString) ? hdr.getStringProperty(this.property) : ""; };
		this.isString            = function (){ return this.isString; };
		this.getCellProperties   = function (row, col, props) {};
		this.getRowProperties    = function(row, props){};
		this.getImageSrc         = function (row, col){return null; };
		this.getSortLongForRow   = function(hdr){ return (this.isString) ? 0 : new Number(hdr.getStringProperty(this.property)).value; };
		this.getIlkValue = function(value){
			var newValue = value;
			listTreecol = $("treecol[ximfheadtree='1']");
			var reg=new RegExp(' ', "gi");
			for(var i=0; i<listTreecol.length; ++i){
				if(listTreecol[i].getAttribute("id").toLowerCase()== this.property){
					// set values to tree column
					var ilkid = "ximfkey_"+value;
					ilkid = ilkid.replace(reg,"_");						
					newValue = listTreecol[i].getAttribute(ilkid);
					if (newValue == ""){ 
						newValue = value;
					}
					break;
				}
			}
			return newValue;
		};
		this.getCellText = function (row, col){
			var key = gDBView.getKeyAt(row);
	    	var hdr = gDBView.db.GetMsgHdrForKey(key);
	    	var value = hdr.getStringProperty(this.property);
	    	//return hdr.getStringProperty(this.property);
			//return value.toLowerCase();
			return this.getIlkValue(value);;
		};		
	};
	
	function updateColumnToHide(){
		try{
			if(_ximfHdrArrayByID.length <= 0 ) return;
			if(gCurrentIdentity){					
				var prefList = gCurrentIdentity.getCharAttribute("ximfmail_context_DBHeaders");
				if(prefList == "undefined") return;
				for(var i=0; i<_ximfHdrArrayByID.length; ++i){
					if(prefList.lastIndexOf(_ximfHdrArrayByID[i]) != -1){
						$("treecol[id='"+_ximfHdrArrayByID[i]+"']").attr("hidden","true");
					}
				}
			}
		}catch(e){
			gConsole.logStringMessage("[ximfmail - createThreadTree ] " + e +"\nline : " + Error().lineNumber + " : "+ e + "\nfile : "+ Error().fileName);
		}			
	};	
	
	// public:
	if(typeof XimfThreadTree.initialized == "undefined"){
		//load tree cells with ximf headers
	 	XimfThreadTree.prototype.createThreadTree = function(){
			try{
				if(gCurrentIdentity){
					var currentInstance = gCurrentIdentity.getCharAttribute("ximfmail_instance_treethread_ref");
					// delete previous ximfmail columns
					$("splitter[ximfheadtree='1']").remove();
					$("treecol[ximfheadtree='1']").remove();
					_ximfHdrArrayByID.splice(0,_ximfHdrArrayByID.length);
						// new instance -> new ximf columns
					if(gCurrentIdentity.getBoolAttribute(XIMF_PREF_IDENTITY_USE_XIMFMAIL)){
						$("#threadCols").append(CreateDOMWithXimfInstance(currentInstance,gChromeXslTreeRcv));
										
						// save list of ximf columns
						var listID = $("#threadCols treecol[ximfheadtree='1']");
										
						if(!listID) return;
						for(var idx=0; idx<listID.length; ++idx){
							_ximfHdrArrayByID.push(listID[idx].id);												
						}
						updateColumnToHide();
						//LoadIlkColumnsValues(currentInstance);
						LoadIlkColumnsValues2(currentInstance);		
										
						// use by Thunderbird to check for x-headers
						addCustomPreferences('mailnews.customDBHeaders', true);						
					}
				}	
			}catch(e){
				gConsole.logStringMessage("[ximfmail - createThreadTree ] " + e +"\nline : " + Error().lineNumber + " : "+ e + "\nfile : "+ Error().fileName);
			}
		};		
		XimfThreadTree.prototype.addCustomColumnHandler = function(){
			if(_ximfHdrArrayByID.length <= 0 ) return;
			if (gDBView) {				
				for(var i=0; i<_ximfHdrArrayByID.length; ++i){
					gDBView.addColumnHandler(_ximfHdrArrayByID[i], new XimfCustomColumnHandler(_ximfHdrArrayByID[i].toLowerCase()));
				}
			}
		};
		XimfThreadTree.prototype.saveColumnToHide = function(){
			var listID = $("#threadCols treecol[ximfheadtree='1']");//
			try{
				if(gCurrentIdentity){					
					prefList = ""
					for(var i=0; i<listID.length; ++i){
						if(listID[i].getAttribute("hidden") == "true"){
							if(prefList != "") prefList +=",";
							prefList += listID[i].id;
						}
					}					
					gCurrentIdentity.setCharAttribute("ximfmail_context_DBHeaders",prefList);
				}
			}catch(e){
				gConsole.logStringMessage("[ximfmail - createThreadTree ] " + e +"\nline : " + Error().lineNumber + " : "+ e + "\nfile : "+ Error().fileName);
			}			
		};							
		// loaded object
		XimfThreadTree.initialized = true;
	}
}