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
 * 
 */
function XimfCatalog(){
	// private:
	var _rdfService = null;
	var _dsCatalog = null;
	var _urlCatalog = CHROME_XIMFMAIL_CATALOG;
	var _instanceCounter = 0; // instance counter for index RDF file
	
	function init(){
		_rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
		_dsCatalog = _rdfService.GetDataSource(CHROME_XIMFMAIL_CATALOG);				 
		return true;
	}
	
	// public:
	if(typeof XimfCatalog.initialized == "undefined"){
		/*
		 * read infomations from catalog
		 */
		XimfCatalog.prototype.getTarget = function(instance,predicate){
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
//			alert("[XimfCatalog]error instance loading...." + e);
			gConsole.logStringMessage("[ximfmail - XimfCatalog ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);		
						
		}
		};
		/*
		 * create catalog with profile xml informations
		 */
		XimfCatalog.prototype.registerXimfmailProfileNode = function(domProfile){
			try{
				// default title of smtp message
				try{
					if(gPrefBranch){		
						var val = gPrefBranch.getCharPref("ximfmail.smtp_msg.name");
						if(val){ SMTP_INSTANCE = val; }						
					}
				}catch(e){}
				
				// create Seq container
				init();
				var RDFCUtils = Components.classes["@mozilla.org/rdf/container-utils;1"].createInstance(Components.interfaces.nsIRDFContainerUtils);
				var RDFC = Components.classes["@mozilla.org/rdf/container;1"].createInstance(Components.interfaces.nsIRDFContainer);
				
				var seqNode = _rdfService.GetResource("http://www.ximfmail.com/catalog");
				//alert("_urlCatalog"+_urlCatalog+"-_dsCatalog:"+_dsCatalog.toString()+"-seqNode:"+seqNode);
				RDFCUtils.MakeSeq(_dsCatalog, seqNode);
				RDFC.Init(_dsCatalog, seqNode); 

				// add datas from xml profile to RDF file
		
				// Create theme List
				var themeTag = domProfile.getElementsByTagName("theme");
				var theme = "";				
				if(themeTag.length > 0){
					//alert(themeTag[0].getAttribute("name"))
					theme = themeTag[0].getAttribute("name");
					theme = theme.toLowerCase();					
					var newURI = "http://www.ximfmail.com/catalog/" + theme;			
					RDFC.AppendElement(_rdfService.GetResource(newURI));
					_dsCatalog.Assert(_rdfService.GetResource(newURI),
						_rdfService.GetResource("http://www.ximfmail.com/RDF#name"),
						_rdfService.GetLiteral(theme), true);		
					
					_dsCatalog.Assert(_rdfService.GetResource(newURI),
						_rdfService.GetResource("http://www.ximfmail.com/RDF#refSeq"),
						_rdfService.GetLiteral("http://www.ximfmail.com/catalog/instance_"+theme), true);							
				}
					
				
				// Create instance List
				var seqNode = _rdfService.GetResource("http://www.ximfmail.com/catalog/instance_"+theme);
				RDFCUtils.MakeSeq(_dsCatalog, seqNode);
				RDFC.Init(_dsCatalog, seqNode);
				var instanceTag = themeTag[0].getElementsByTagName("instance");
				var sValue="";	
				
				// create smtp entry, to not use extended headers
				for(var i = 0; i < instanceTag.length; i++){
					var idValue = instanceTag[i].getAttribute("id");
					if(idValue == "smtp"){
						SMTP_INSTANCE = instanceTag[i].getAttribute("name");
						SMTP_VERSION = instanceTag[i].getAttribute("version");
					}
				}
				
				var sURI = "http://www.ximfmail.com/catalog/instance_"+theme +"/" +  _instanceCounter;			
				RDFC.AppendElement(_rdfService.GetResource(sURI));
				_dsCatalog.Assert(_rdfService.GetResource(sURI),_rdfService.GetResource("http://www.ximfmail.com/RDF#ximfVersion"), _rdfService.GetLiteral(SMTP_VERSION), true);
				_dsCatalog.Assert(_rdfService.GetResource(sURI),_rdfService.GetResource("http://www.ximfmail.com/RDF#instance"),_rdfService.GetLiteral(SMTP_INSTANCE), true);
				_dsCatalog.Assert(_rdfService.GetResource(sURI),_rdfService.GetResource("http://www.ximfmail.com/RDF#version"), _rdfService.GetLiteral(SMTP_VERSION), true);
				_dsCatalog.Assert(_rdfService.GetResource(sURI),_rdfService.GetResource("http://www.ximfmail.com/RDF#pathSchema"),_rdfService.GetLiteral(SMTP_INSTANCE), true);
				_dsCatalog.Assert(_rdfService.GetResource(sURI),_rdfService.GetResource("http://www.ximfmail.com/RDF#pathIhm"),_rdfService.GetLiteral(SMTP_INSTANCE), true);
				_dsCatalog.Assert(_rdfService.GetResource(sURI),_rdfService.GetResource("http://www.ximfmail.com/RDF#pathRules"),_rdfService.GetLiteral(SMTP_INSTANCE), true);
				_dsCatalog.Assert(_rdfService.GetResource(sURI),_rdfService.GetResource("http://www.ximfmail.com/RDF#pathDictionary"),_rdfService.GetLiteral(SMTP_INSTANCE), true);
				_dsCatalog.Assert(_rdfService.GetResource(sURI),_rdfService.GetResource("http://www.ximfmail.com/RDF#theme"),_rdfService.GetLiteral(SMTP_INSTANCE), true);	
					
				// create definitions entries				
				for(var i = 0; i < instanceTag.length; i++){
					try{
						// default instance message, continue
						if(instanceTag[i].getAttribute("id") == "smtp"){ continue; }
					}catch(e){}
					//alert("instance : " + schemaTag[0].getAttribute("name") +" && "+ schemaTag[0].textContent);
					// append resource element to sequence
					var newURI = "http://www.ximfmail.com/catalog/instance_"+theme +"/" + (i + 1 + _instanceCounter);			
					RDFC.AppendElement(_rdfService.GetResource(newURI));
						
					// append ximfVersion of instance
					_dsCatalog.Assert(_rdfService.GetResource(newURI),
					_rdfService.GetResource("http://www.ximfmail.com/RDF#ximfVersion"),
					_rdfService.GetLiteral(instanceTag[i].getAttribute("ximfVersion")), true);
					
					// 	append name of instance
					_dsCatalog.Assert(_rdfService.GetResource(newURI),
					_rdfService.GetResource("http://www.ximfmail.com/RDF#instance"),
					_rdfService.GetLiteral(instanceTag[i].getAttribute("name").toLowerCase()), true);
					
					// append version of instance
					_dsCatalog.Assert(_rdfService.GetResource(newURI),
					_rdfService.GetResource("http://www.ximfmail.com/RDF#version"),
					_rdfService.GetLiteral(instanceTag[i].getAttribute("version")), true);
					
					// append id of instance
					try{						
						_dsCatalog.Assert(_rdfService.GetResource(newURI),
						_rdfService.GetResource("http://www.ximfmail.com/RDF#id"),
						_rdfService.GetLiteral(instanceTag[i].getAttribute("id")), true);
					}catch(e){
						gConsole.logStringMessage("[ximfmail - XimfCatalog.registerXimfmailProfileNode ] \n " + e + "\nfile : " + e.fileName+"\nline : "+e.lineNumber);		
					}
										
					// schema path value
					try{						
						var schemaElt = instanceTag[i].getElementsByTagName("schema");
						sValue="";
						if(schemaElt){
							sValue = schemaElt[0].textContent;	
						}
						_dsCatalog.Assert(_rdfService.GetResource(newURI),
						_rdfService.GetResource("http://www.ximfmail.com/RDF#pathSchema"),
						_rdfService.GetLiteral(instanceTag[i].getAttribute("directory")+sValue), true);
					}catch(e){
						gConsole.logStringMessage("[ximfmail - XimfCatalog.registerXimfmailProfileNode ] \n " + e + "\nfile : " + e.fileName+"\nline : "+e.lineNumber);		
					}						
					
					try{
						// ihm path value
						var ihmElt = instanceTag[i].getElementsByTagName("ihm");
						sValue="";
						if(ihmElt){
							sValue = ihmElt[0].textContent;	
						}
						_dsCatalog.Assert(_rdfService.GetResource(newURI),
						_rdfService.GetResource("http://www.ximfmail.com/RDF#pathIhm"),
						_rdfService.GetLiteral(instanceTag[i].getAttribute("directory")+sValue), true);
					}catch(e){					
						gConsole.logStringMessage("[ximfmail - XimfCatalog.registerXimfmailProfileNode ] \n " + e + "\nfile : " + e.fileName+"\nline : "+e.lineNumber);		
					}
					
					try{
						// rules path value
						var rulesDico = instanceTag[i].getElementsByTagName("rule");
						sValue="";
						if(rulesDico){
							sValue = rulesDico[0].textContent;	
						}	
						_dsCatalog.Assert(_rdfService.GetResource(newURI),
						_rdfService.GetResource("http://www.ximfmail.com/RDF#pathRules"),
						_rdfService.GetLiteral(instanceTag[i].getAttribute("directory")+sValue), true);
					}catch(e){
						gConsole.logStringMessage("[ximfmail - XimfCatalog.registerXimfmailProfileNode ] \n " + e + "\nfile : " + e.fileName+"\nline : "+e.lineNumber);		
					}	
					
					try{
						// dictionary path value
						var ihmDico = instanceTag[i].getElementsByTagName("dictionary");
						sValue="";
						if(ihmDico){
							sValue = ihmDico[0].textContent;	
						}	
						_dsCatalog.Assert(_rdfService.GetResource(newURI),
						_rdfService.GetResource("http://www.ximfmail.com/RDF#pathDictionary"),
						_rdfService.GetLiteral(instanceTag[i].getAttribute("directory")+sValue), true);
						}catch(e){
							gConsole.logStringMessage("[ximfmail - XimfCatalog.registerXimfmailProfileNode ] \n " + e + "\nfile : " + e.fileName+"\nline : "+e.lineNumber);		
						}
					
					_dsCatalog.Assert(_rdfService.GetResource(newURI),
					_rdfService.GetResource("http://www.ximfmail.com/RDF#theme"),
					_rdfService.GetLiteral(theme), true);									
				}
				_instanceCounter = _instanceCounter + instanceTag.length + 1;
					
				
				// save datas to file DBG
				_dsCatalog.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
				var rdfXimfCatalogPath = getFilePathInProfile(gRelativeXimfCatalogPath);	
				_dsCatalog.FlushTo("file:///" + rdfXimfCatalogPath);	
				
			}catch(e){	
				gConsole.logStringMessage("[ximfmail - XimfCatalog.registerXimfmailProfileNode ] \n " + e + "\nfile : " + e.fileName+"\nline : "+e.lineNumber);		
			}		
		};
		XimfCatalog.prototype.getNameInstance = function(instance){
			return this.getTarget(instance,"http://www.ximfmail.com/RDF#instance");
		};
		
		XimfCatalog.prototype.getVersionInstance = function(instance){
			return this.getTarget(instance,"http://www.ximfmail.com/RDF#ximfVersion");
		};
		
		XimfCatalog.prototype.getDefinitonInstance = function(instance){
			return this.getTarget(instance,"http://www.ximfmail.com/RDF#theme");
		};
		
		XimfCatalog.prototype.getSchemaInstance = function(instance){
			return this.getTarget(instance,"http://www.ximfmail.com/RDF#pathSchema");
		};
		
		XimfCatalog.prototype.getDictionaryInstance = function(instance){
			return this.getTarget(instance,"http://www.ximfmail.com/RDF#pathDictionary");
		};
		
		XimfCatalog.prototype.getIDInstance = function(instance){
			return this.getTarget(instance,"http://www.ximfmail.com/RDF#id");
		};
						
		XimfCatalog.prototype.getIhmInstance = function(instance){
			return this.getTarget(instance,"http://www.ximfmail.com/RDF#pathIhm");
		};
		
		XimfCatalog.prototype.getRulesInstance = function(instance){
			return this.getTarget(instance,"http://www.ximfmail.com/RDF#pathRules");
		};
		
		
		XimfCatalog.prototype.getInstanceUri = function(ximfDefUri,ximfName,ximfVersion){
			try{
				/// get container of instance resources of current definition	
				init();		
				var RDFCUtils = Components.classes["@mozilla.org/rdf/container-utils;1"].createInstance(Components.interfaces.nsIRDFContainerUtils);
				
				var rs_seqInstance = _rdfService.GetResource(ximfDefUri);				
				var containerInstances = RDFCUtils.MakeSeq(_dsCatalog, rs_seqInstance);
				var children = containerInstances.GetElements();			
				while (children.hasMoreElements()){
					// search uri instance with ximfVersion and ximfName	
					var child = children.getNext();
					if (child instanceof Components.interfaces.nsIRDFResource){	
						var instance_resource = child.Value;
						//alert("instance_resource = "+instance_resource);
						var thisName = this.getNameInstance(instance_resource);
						var thisVersion = this.getVersionInstance(instance_resource);		
						//alert("<"+thisName+"><"+thisVersion+">\n<"+ximfName+"><"+ximfVersion+">")
						thisName = String_trim(thisName).toLowerCase();
						if(thisName == String_trim(ximfName).toLowerCase()){
							if(thisVersion == ximfVersion){
								//alert("instance path found >>"+instance_resource);
								return instance_resource;
							}
						}		
					}					  
							  /*
							  DEBUG loop : list of predicats
							  var resource = _rdfService.GetResource(instance_resource);
							  var targets = _dsCatalog.ArcLabelsOut(resource);
							  while (targets.hasMoreElements()){	
							  	var newpredicate = targets.getNext();
								if (newpredicate instanceof Components.interfaces.nsIRDFResource){
									  alert("Resource is: " + newpredicate.Value);
								 }else if (newpredicate instanceof Components.interfaces.nsIRDFLiteral){
								      alert("Literal is: " + newpredicate.Value);
								 }
							}*/
				}			
			}catch(e){
				gConsole.logStringMessage("[ximfmail - XimfCatalog - getInstanceUri] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);	
				
			}
			return null;
		}
		
		// array of instances of one definition
		XimfCatalog.prototype.getInstanceList = function(definition){
			try{/*
				init();
				var resource = _rdfService.GetResource(definition);
				var targets = _dsCatalog.ArcLabelsOut(resource);
				while (targets.hasMoreElements()){	
					var newpredicate = targets.getNext();
					if (newpredicate instanceof Components.interfaces.nsIRDFResource){
    					var target = _dsCatalog.GetTarget(resource, newpredicate, true);					  
    					if (target instanceof Components.interfaces.nsIRDFLiteral){
      						//alert(newpredicate.Value + " : \n\r" + target.Value);
      						if(newpredicate.Value == predicate)
      							return target.Value;
    					}
  					}
				}*/
			}catch(e){
//			alert("[XimfCatalog]error instance loading...." + e);
			gConsole.logStringMessage("[ximfmail - XimfCatalog ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);		
						
		}
			return "";
		};
		
		XimfCatalog.initialized = true;
	}
}