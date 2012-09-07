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
 *  XimfThreadTreeDBViewObserver
 *  'MsgCreateDBView' : Special event that gets fired whenever a view is created. 
 *  When that event fires, set up the custom column handler on the new view.
 */
var XimfThreadTreeDBViewObserver = {
	// Components.interfaces.nsIObserver
	observe: function(aMsgFolder, aTopic, aData){	
		gConsole.logStringMessage("ximfmail - XimfThreadTreeDBViewObserver:observe");
		XimfThreadTree.getInstance().create();
	}
}

/*
 * Column handler template definition	
 */
function XimfCustomColumnHandler(property){
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
	this.getCellText = function (row, col){
		// get cell informations
		var key = gDBView.getKeyAt(row);
    	var hdr = gDBView.db.GetMsgHdrForKey(key);
    	var value = hdr.getStringProperty(this.property);    	
    	// get ilk value if exists    	
    	var ilklabel = XimfThreadTree.getInstance().getIlkColumnArray()[this.property.toLowerCase()][value.toLowerCase()];
    	if(ilklabel == undefined) ilklabel = value;
    	//gConsole.logStringMessage("[ximfmail - XimfCustomColumnHandler ] getCellText "+this.property+" = "  + ilklabel );	
    	return ilklabel; 	
	};
};

/*
 * XimfThreadTree 
 * Custom Columns with XIMF headers
 * Get XIMF headers in xml containers <ihm> of Ximfmail instances : 
 * 	<ximf:treeRcv>
 *  	<ximf:headerRef>header-reference</ximf:headerRef>	
 *  	<ximf:headerRef>header-reference-other</ximf:headerRef>
 *  </ximf:treeRcv>
 */
var XimfThreadTree = (function(){
	// private:
	var instantiated;	
	var _chromeXslTreeRcv = "chrome://theme_ximfmail/content/threadTree-ximfmail.xsl";
	var _ximfHdrArrayByID = [];
	var _refAccountArray = [];	
	var _ximfIlilkCustomColumnArray = [];
	
	// add DOM element to tree
	function addColumn(domTreecol,idTreecol){
		$("#threadCols").append(domTreecol); // istancedom_treecol is mofified by append jquery function is called
		var splitter_dom = document.createElement("splitter");
		$(splitter_dom).attr("reftreecol",idTreecol);
		$(splitter_dom).attr("class","tree-splitter");
		$(splitter_dom).attr("ximfheadtree","1");	
		$("#threadCols").append(splitter_dom);
		gConsole.logStringMessage("[ximfmail - XimfThreadTree:addColumn] add new ximf column to Dom - id = " + idTreecol);
	};
	// attach handler object to custom column. addColumnHandler that takes a column ID
	function addColumnHandler(idTreecol){
		if (gDBView){			
			gDBView.addColumnHandler(idTreecol, new XimfCustomColumnHandler(idTreecol.toLowerCase()));	
			gConsole.logStringMessage("[ximfmail - XimfThreadTree:addColumnHandler] load new XimfCustomColumnHandler for column " + idTreecol);
		}
	};
	// remove DOM element from tree
	function deleteColummn(idTreeCol){			
		for(var i = 0 ; i < _ximfHdrArrayByID.length ; ++i){
			if(_ximfHdrArrayByID[i] === idTreeCol){
				_ximfHdrArrayByID.splice(i,1);
				$("#"+idTreeCol).remove();
				$("splitter[reftreecol='"+idTreeCol+"']").remove();
				gConsole.logStringMessage("[ximfmail - XimfThreadTree:deleteColummn] remove ximf column from Dom - id = " + idTreeCol);			
			}
		}		
	};
	// update Ximfmail column
	function updateXimfHdrArrayByID(idToUpdate){
		gConsole.logStringMessage("[ximfmail - XimfThreadTree:updateXimfHdrArrayByID] update Ximfmail column " + idToUpdate);		
		var isIdExist = false;
		for(var i = 0 ; i < _ximfHdrArrayByID.length ; ++i){
			if(_ximfHdrArrayByID[i] === idToUpdate){				
				isIdExist = true;
				break;
			}
		}
		if(!isIdExist){
			_ximfHdrArrayByID.push(idToUpdate);
		}
	}
	// set Ximf headers to display to Thunderbird to check for x-headers
	function addCustomPreferences(preference){
		gConsole.logStringMessage("[ximfmail - XimfThreadTree:updateColumnToHide] Set Ximf headers to display to Thunderbird pref : " + preference);
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
		
		function isDataInArray(data,array){			
			for(var i=0; i<array.length; ++i){
				if(data == array[i]){
					return true;
				}
			}
			return false;
		};	
		
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
	// obsolete?
	function updateColumnToHide(){		
		try{
			if(_ximfHdrArrayByID.length <= 0 ) return;
			if(gCurrentIdentity){					
				var prefList = gCurrentIdentity.getCharAttribute("ximfmail_context_DBHeaders");
				if(prefList == undefined) return;
				for(var i=0; i<_ximfHdrArrayByID.length; ++i){
					if(prefList.lastIndexOf(_ximfHdrArrayByID[i]) != -1){
						$("treecol[id='"+_ximfHdrArrayByID[i]+"']").attr("hidden","true");
					}
				}
			}
		}catch(e){
			gConsole.logStringMessage("[ximfmail - XimfThreadTree:updateColumnToHide ] " + e +"\nline : " + Error().lineNumber + " : "+ e + "\nfile : "+ Error().fileName);
		}			
	};	
	// get ilk values from instance
	function updateXimfIlkCustomColumnArray(currentInstance){
		try{
			gConsole.logStringMessage("[ximfmail - XimfThreadTree:updateXimfIlkCustomColumnArray ] create ilk array for Ximf values of instance : "+currentInstance);
			
			// get xml schema for instance
			gXimfCatalog = XimfCatalog.getInstance();
			
			var dir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			var completePath = getFilePathInProfile("extensions/"+gXimfCatalog.getSchemaInstance(currentInstance));
			dir.initWithPath( completePath );			
			if(!dir.exists()){	
				gConsole.logStringMessage("[ximfmail - XimfThreadTree:updateXimfIlkCustomColumnArray] Error on loading schema file : " + completePath);
				return;
			}	
			var objXML = GetXmlDocument(completePath);
			var headers = objXML.getElementsByTagName("ximf:header");
			
			// get xml dictionary parser
			var urlDictionary = getFilePathInProfile("extensions/"+gXimfCatalog.getDictionaryInstance(currentInstance));
			dir.initWithPath( urlDictionary );			
			if(!dir.exists()){			
				gConsole.logStringMessage("[ximfmail - XimfThreadTree:updateXimfIlkCustomColumnArray] Error on loading dictionary file : " + completePath);
				return;
			}		
			var dicoXML = GetXmlDocument(urlDictionary);
			var dicoElements = dicoXML.getElementsByTagName("ximf:locale");
			
			// get local lang				
			var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
			var refLang = prefs.getCharPref("general.useragent.locale");
			if(!refLang) refLang = "fr";			
			var ilkEntities = null;
			for(var idxLang=0 ; idxLang < dicoElements.length ; ++idxLang){		
				if(dicoElements[idxLang].getAttribute("lang") == refLang){
					ilkEntities = dicoElements[idxLang].getElementsByTagName("ximf:ilk");
					break;
				}
			}
			
			// parse XML and get ilk values
			for(var i=0 ; i < _ximfHdrArrayByID.length ; ++i){
				var currentTreeColId = _ximfHdrArrayByID[i];
				for(var idxH = 0 ; idxH < headers.length; ++idxH){				
					var attrHeaderList = headers[idxH].attributes;				
					var headerName = headers[idxH].getAttribute("headerName");				
					if(headerName.toLowerCase() == currentTreeColId.toLowerCase()){
						var stringListElt = headers[idxH].getElementsByTagName("ximf:string");					
						var tmparray = new Array();				
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
											break;
										}
									}
								}
								
								// push array
								tmparray[sContent.toLowerCase()]=sIlk;
						
							}catch(e){
								gConsole.logStringMessage("[ximfmail - XimfThreadTree:updateXimfIlkCustomColumnArray ] " + e +"\nline : " + e.lineNumber + " : "+ e + "\nfile : "+ Error().fileName);
							}			
						}
						// save ilk values for an ximf header						
						if(tmparray) _ximfIlilkCustomColumnArray[headerName.toLowerCase()] = tmparray;
					}
				}
			}
		}catch(e){			
			gConsole.logStringMessage("[ximfmail - XimfThreadTree:updateXimfIlkCustomColumnArray] " + e +"\nline : " + e.lineNumber + " : "+ e + "\nfile : "+ Error().fileName);
		}	
	};
	function init(){		
		// singleton here
		return{
			// create : create Ximf columns if don't exist and/or add handler on Ximf columns
			// return true if success / false if failed
			create : function(){
				try{
					gConsole.logStringMessage("[ximfmail - XimfThreadTree:create ] create begin - _ximfHdrArrayByID len : "+_ximfHdrArrayByID.length);
					GetCurrentUser();
					if(!gCurrentIdentity) return false;
					var refIdentityKey = gCurrentIdentity.key;
					var currentlistID = $("#threadCols treecol[ximfheadtree='1']");	// get existing Ximf columns 
						
					// check if Ximf columns of account already created 				
					for(var i = 0 ; i < _refAccountArray.length ; ++i){
						if(_refAccountArray[i] === refIdentityKey){
							// account already updated for this session, don't do it again,
							// handler Ximfmail columns headers must be fired 
							for(var idx =0 ; idx < currentlistID.length ; ++idx){
								addColumnHandler(currentlistID[idx].id);					
							}	
							gConsole.logStringMessage("[ximfmail - XimfThreadTree:create ] account already updated for this session  - handler Ximfmail columns");
							return true;								
						}							
					}
					_refAccountArray.push(refIdentityKey);
												
					// get Ximfmail instance with headers to custom							
					var currentInstance = gCurrentIdentity.getCharAttribute("ximfmail_instance_treethread_ref");					
					var instancedom = CreateDOMWithXimfInstance(currentInstance,_chromeXslTreeRcv);
					var istancedom_treecol = instancedom.childNodes;
										
					// add new headers to tree
					gConsole.logStringMessage("[ximfmail - XimfThreadTree:create ] " + istancedom_treecol.length + " elements in Ximfmail instance to custom");
					for(var k = istancedom_treecol.length - 1 ; k >= 0 ; --k){
						try{
							var instanceId = $(istancedom_treecol[k]).attr("id");							
							var isCurrentIdInInstance = false;
							for(var l = 0 ; l < currentlistID.length ; ++l){
								if( instanceId === $(currentlistID[l]).attr("id")){
									isCurrentIdInInstance = true;			
									gConsole.logStringMessage("[ximfmail - XimfThreadTree:create ] instance " + instanceId + " exists"); 
									break;
								}
							}
							if(!isCurrentIdInInstance){
								updateXimfHdrArrayByID(instanceId);
								addColumn(istancedom_treecol[k],instanceId); // add DOM element to tree
								addColumnHandler(instanceId); // load handler
								gConsole.logStringMessage("[ximfmail - XimfThreadTree:create ] instance " + instanceId + " created"); 
								//updateColumnToHide(); ???
							}
						}catch(e){
							gConsole.logStringMessage("[ximfmail - XimfThreadTree:create ] compute error - id = " + k + " : " + e);							
						}
					}
					
					// used by Thunderbird to check for x-headers
					addCustomPreferences('mailnews.customDBHeaders');	
					
					// load ilk array for Ximf values of tree cells
					updateXimfIlkCustomColumnArray(currentInstance);
					
					// trace ilk array  
					var string = "";
					for(xh in _ximfIlilkCustomColumnArray){
						for(ilk in _ximfIlilkCustomColumnArray[xh]){
							string += "["+ xh +"]["+ ilk +"]["+ _ximfIlilkCustomColumnArray[xh][ilk] + "]\n";
						}
					}
					gConsole.logStringMessage("[ximfmail - XimfThreadTree:create ] array of ilk of ximf value" + string);	
					return true;						
				}catch(e){					
					gConsole.logStringMessage("[ximfmail - XimfThreadTree:create] " + e +"\nline : " + e.lineNumber + " : "+ e + "\nfile : "+ Error().fileName);
					return false;
				}		
			},
			// delete all custom columns of XIMF headers
			deleteXimfColummns : function(){				
				$("treecol[ximfheadtree='1']").remove();
				$("splitter[ximfheadtree='1']").remove();		
				gConsole.logStringMessage("[ximfmail - XimfThreadTree:deleteXimfColummns ] delete all custom columns of XIMF headers");					
			},
			// attach customColumnHandler for all columns of XIMF headers
			addCustomColumnHandler : function(){
				var currentlistID = $("#threadCols treecol[ximfheadtree='1']");
				for(var i =0 ; i < currentlistID.length ; ++i){					
					addColumnHandler();					
				}
				gConsole.logStringMessage("[ximfmail - XimfThreadTree:addCustomColumnHandler ] attach customColumnHandler for all columns of XIMF headers");	
			},
			// get ilk array for Ximf values of tree cells
			getIlkColumnArray  : function(){				
				return _ximfIlilkCustomColumnArray;
			},
			//obsolete?
			saveColumnToHide : function(){
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
					gConsole.logStringMessage("[ximfmail - saveColumnToHide ] " + e +"\nline : " + Error().lineNumber + " : "+ e + "\nfile : "+ Error().fileName);
				}
			}
		}		
	}
	return{
		getInstance : function(){
			if(!instantiated){
				instantiated = init();
			}
			return instantiated;
		}
	};	
})(); // one shot on XimfThreadTree