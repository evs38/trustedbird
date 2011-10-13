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

var CHROME_XIMFMAIL_TREEDATA = "chrome://theme_ximfmail/content/ximfTreeData.rdf";
var gRelativeXimfTreePath = "extensions/{A627B834-BD9F-4b3f-9AF5-347B5A570402}/chrome/content/theme/ximfTreeDataBck.rdf";

/*
 * 
 */
function XimfTreeData(){
	// private:
	var _rdfService = null;
	var _rdfCUtils = null;
	
	var _dsCatalog = null;
	var _rootNode = null;
	var _urlCatalog = CHROME_XIMFMAIL_TREEDATA;
	var _instanceCounter = 0; // instance counter for index RDF file
	
	function init(){
		try{
			if(!_rdfService)
				_rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
			
			if(!_dsCatalog){
				//_dsCatalog = _rdfService.GetDataSource(CHROME_XIMFMAIL_TREEDATA);
				//_dsCatalog.RegisterDataSource(); 
				_dsCatalog = Components.classes["@mozilla.org/rdf/datasource;1?name=in-memory-datasource"].createInstance(Components.interfaces.nsIRDFDataSource);
			 	//_dsCatalog = _rdfService.GetDataSource("rdf:ximfTree");		
			}
				
					
				//_dsCatalog = Components.classes["@mozilla.org/rdf/datasource;1?name=in-memory-datasource"].createInstance(Components.interfaces.nsIRDFDataSource);
			
			if(!_rdfCUtils)
				_rdfCUtils = Components.classes["@mozilla.org/rdf/container-utils;1"].getService(Components.interfaces.nsIRDFContainerUtils);
		}catch(e){
			gConsole.logStringMessage("[ximfmail - XimfTreeData.init ] \n " + e + "\nfile : " + e.fileName+"\nline : "+e.lineNumber);			
			return false;
		}									 
		return true;
	}
	
	// public:
	if(typeof XimfTreeData.initialized == "undefined"){
		/*
		 * read infomations from catalog
		 */
		XimfTreeData.prototype.getTarget = function(instance,predicate){
			try{
				init();
				var resource = _rdfService.GetResource(instance);
				var targets = _dsCatalog.ArcLabelsOut(resource);
				while (targets.hasMoreElements()){	
					var newpredicate = targets.getNext();
					if (newpredicate instanceof Components.interfaces.nsIRDFResource){
    					var target = _dsCatalog.GetTarget(resource, newpredicate, true);
					    /*if (target instanceof Components.interfaces.nsIRDFResource){
      						alert("Resource is: " + target.Value);
    					}else*/
    					if (target instanceof Components.interfaces.nsIRDFLiteral){
      						//alert(newpredicate.Value + " : \n\r" + target.Value);
      						if(newpredicate.Value == predicate)
      							return target.Value;
    					}
  					}
				}
			}catch(e){
				//alert("[XimfTreeData]error instance loading...." + e);
				gConsole.logStringMessage("[ximfmail - XimfTreeData.getTarget ] \n " + e + "\nfile : " + e.fileName+"\nline : "+e.lineNumber);			
			}
		};
		/*
		 * create catalog with profile xml informations
		 */
		XimfTreeData.prototype.registerXimfmailProfileNode = function(domProfile){
			try{
				// create Seq container
				init();
				
				// create our root nodes
				//_rootNode = RDF.GetResource("urn:root"); 
				//var seqNode = RDF.GetResource("urn:root:seq"); 
				
				var seqCatalog = _rdfService.GetResource("http://www.ximfmail.com/catalog");
				var RDFC_Cat = null;
				try{
					RDFC_Cat = _rdfCUtils.MakeSeq(_dsCatalog, seqCatalog);	
				}catch(e){
					gConsole.logStringMessage("[ximfmail - XimfTreeData.registerXimfmailProfileNode ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
				}	
				
				//alert("RDFC_Cat count= "+RDFC_Cat.GetCount());
								
				/* */
				var baseTag = domProfile.getElementsByTagName("base");			
				if(baseTag.length <= 0) return;				
				//alert(baseTag[0].getAttribute("name"))
				var tname = baseTag[0].getAttribute("name");				
				var baseURI = "http://www.ximfmail.com/catalog/" + tname;
				//alert("baseURI = " + baseURI);			
				//_rdfContainer.AppendElement(_rdfService.GetResource(baseURI));
				try{
					//var RDFC_Cat = Components.classes["@mozilla.org/rdf/container;1"].createInstance(Components.interfaces.nsIRDFContainer);
					//RDFC_Cat.Init(_dsCatalog, seqCatalog);
					RDFC_Cat.AppendElement(_rdfService.GetResource(baseURI));
				}catch(e){
					gConsole.logStringMessage("[ximfmail - XimfTreeData.registerXimfmailProfileNode ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
				}
							
				_dsCatalog.Assert(_rdfService.GetResource(baseURI),
					_rdfService.GetResource("http://www.ximfmail.com/RDF#name"),
					_rdfService.GetLiteral(tname), true);		
					
					
				_dsCatalog.Assert(_rdfService.GetResource(baseURI),
					_rdfService.GetResource("http://www.ximfmail.com/RDF#dialogheader"),
					_rdfService.GetLiteral(baseURI+"/dialogheader"), true);							
					
				_dsCatalog.Assert(_rdfService.GetResource(baseURI),
					_rdfService.GetResource("http://www.ximfmail.com/RDF#datas"),
					_rdfService.GetLiteral(baseURI+"/datas"), true);
										
				// Create dialogheader description
				var dlgUri = baseURI + "/dialogheader";		
				var seqNode = _rdfService.GetResource(dlgUri);		
				var RDFC_Dgh = null;		
				RDFC_Dgh = _rdfCUtils.MakeSeq(_dsCatalog, seqNode);
				//RDFC.Init(_dsCatalog, seqNode);
				RDFC_Dgh.AppendElement(_rdfService.GetResource(dlgUri));
				
				var headerTag = baseTag[0].getElementsByTagName("header");				
				// append tiltle element <ximf:title>MCA</ximf:title>
				var title = headerTag[0].getElementsByTagName("title");	
				_dsCatalog.Assert(_rdfService.GetResource(dlgUri),
					_rdfService.GetResource("http://www.ximfmail.com/RDF#title"),
					_rdfService.GetLiteral(title[0].textContent), true);
					
				// append description element <ximf:descritpion>Mentions et clés d'attribution</ximf:descritpion>
				var descritpion = headerTag[0].getElementsByTagName("description");
					_dsCatalog.Assert(_rdfService.GetResource(dlgUri),
					_rdfService.GetResource("http://www.ximfmail.com/RDF#description"),
					_rdfService.GetLiteral(descritpion[0].textContent), true);
				
				// append title colonne <ximf:column>clé</ximf:column>
				var columnTag = headerTag[0].getElementsByTagName("column");
				for(var x = 0; x < columnTag.length; ++x){
					// append description element
					_dsCatalog.Assert(_rdfService.GetResource(dlgUri),
					_rdfService.GetResource("http://www.ximfmail.com/RDF#column"+x),
					_rdfService.GetLiteral(columnTag[x].textContent), true);		
				}
				
			
				/*  */
				// Create datas descritpion
				var datasUri = baseURI + "/datas";
				var seqNode = _rdfService.GetResource(datasUri);
				var RDFC_data = null;	
				try{			
					RDFC_data = _rdfCUtils.MakeSeq(_dsCatalog, seqNode);
				}catch(e){
						gConsole.logStringMessage("[ximfmail - XimfTreeData.registerXimfmailProfileNode ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
				}				
				//_rdfContainer.Init(_dsCatalog, seqNode);
				//var RDFC_Dat = Components.classes["@mozilla.org/rdf/container;1"].createInstance(Components.interfaces.nsIRDFContainer);
				//try{
				//	RDFC_Dat.Init(_dsCatalog, seqNode);					
				//}catch(e){
				//	gConsole.logStringMessage("[ximfmail - XimfTreeData.registerXimfmailProfileNode ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
				//}
				// add datas from xml profile to RDF file	
				var treeTag = baseTag[0].getElementsByTagName("tree");		
				var instanceTag = treeTag[0].getElementsByTagName("description");
				for(var i = 0; i < instanceTag.length; ++i){
					// append resource element to sequence
					var newURI = datasUri + "/data" + i;			
					//_rdfContainer.AppendElement(_rdfService.GetResource(newURI));
					RDFC_data.AppendElement(_rdfService.GetResource(newURI));
						
					var instanceTagData = instanceTag[i].getElementsByTagName("data");
					for(var j = 0; j < instanceTagData.length; ++j){
						// append description element
						_dsCatalog.Assert(_rdfService.GetResource(newURI),
						_rdfService.GetResource("http://www.ximfmail.com/RDF#column"+j),
						_rdfService.GetLiteral(instanceTagData[j].textContent), true);		
					}
				}
				
				//_dsCatalog.RegisterDataSource();			
			}catch(e){	
				gConsole.logStringMessage("[ximfmail - XimfTreeData.registerXimfmailProfileNode ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
			}		
			
			// save datas to file	
			/*
			_dsCatalog.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
			var rdfXimfTreeDataPath = getFilePathInProfile(gRelativeXimfTreePath);	
			_dsCatalog.FlushTo("file:///" + rdfXimfTreeDataPath);	*/			
		};
		
		XimfTreeData.prototype.getTitleHeader = function(key){
			var uri = "http://www.ximfmail.com/catalog/"+ key + "/dialogheader";
			return this.getTarget(uri,"http://www.ximfmail.com/RDF#title");
		};
		
		XimfTreeData.prototype.getDescriptionHeader = function(key){
			var uri = "http://www.ximfmail.com/catalog/"+ key + "/dialogheader";
			return this.getTarget(uri,"http://www.ximfmail.com/RDF#description");
		};
		
		XimfTreeData.prototype.getTitleColumn = function(key,idx){
			var uri = "http://www.ximfmail.com/catalog/"+ key + "/dialogheader";
			return this.getTarget(uri,"http://www.ximfmail.com/RDF#column"+idx);
		};
		
		XimfTreeData.initialized = true;
	}
}