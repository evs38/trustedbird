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
	var _urlCatalog = null
	
	
	// public:
	if(typeof XimfCatalog.initialized == "undefined"){
		// init datasources
		try{						
			// init RDF XPCOM Services	
			_rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);		
			_dsCatalog = Components.classes["@mozilla.org/rdf/datasource;1?name=in-memory-datasource"].createInstance(Components.interfaces.nsIRDFDataSource);
			_rdfCUtils = Components.classes["@mozilla.org/rdf/container-utils;1"].getService(Components.interfaces.nsIRDFContainerUtils);
		}catch(e){
			gConsole.logStringMessage("[ximfmail - XimfCatalog construct ] \n " + e + "\nfile : " + e.fileName+"\nline : "+ e.lineNumber);		
		}
		
		/*
		 * get datasource object
		 */
		XimfCatalog.prototype.getDSCatalog = function(){			
			return _dsCatalog;
		};
		
		/*
		 * read infomations from catalog
		 */
		XimfCatalog.prototype.getTarget = function(instance,predicate){
			try{
				var resource = _rdfService.GetResource(instance);
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
				}
			}catch(e){	
				gConsole.logStringMessage("[ximfmail - XimfCatalog ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);		
			}
			return null;
		};
		/*
		 * create catalog with profile xml informations
		 */
		XimfCatalog.prototype.registerXimfmailProfileNode = function(domProfile,aclLevel){
			try{
				// default title of smtp message
				var smtpXimfVersion = DEFAULT_XIMF_VERSION;
				var smtpVersion = "1.0";
				var smtpInstance = "smtp";
				var smtpInstanceLabel = "";
				try{
					if(gPrefBranch){		
						var val = gPrefBranch.getCharPref("ximfmail.smtp_msg.name");
						if(val){ smtpInstance = val; }						
					}
				}catch(e){}
				
				// create Seq container				
				var RDFCUtils = Components.classes["@mozilla.org/rdf/container-utils;1"].createInstance(Components.interfaces.nsIRDFContainerUtils);
								
				// create RDF resources
				var seqNode = _rdfService.GetResource("http://www.ximfmail.com/catalog");								
				var RDFC = null;	
				try{			
					RDFC = _rdfCUtils.MakeSeq(_dsCatalog, seqNode);					
				}catch(e){
						gConsole.logStringMessage("[ximfmail - XimfCatalog.registerXimfmailProfileNode ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
				}
						
				// add datas from xml profile to RDF file		
				// Create theme List
				var themeTag = domProfile.getElementsByTagName("theme");				
				var theme = "";				
				var uriThemeDefinition = "http://www.ximfmail.com/catalog/" + themeTag[0].getAttribute("name");
				if(themeTag.length > 0){					
					//var adate = new Date();						
					//theme = themeTag[0].getAttribute("name")+"-" + parseInt(adate.getTime())+ parseInt(Math.round(Math.random()*1000));
					theme = themeTag[0].getAttribute("name");								
					var newURI = "http://www.ximfmail.com/catalog/" + theme;			
					
					// get acl default level					
					var defaultacl=-1;				
					if(themeTag[0].hasAttribute("defaultacl")){
						defaultacl = themeTag[0].getAttribute("defaultacl");
						gConsole.logStringMessage("[ximfmail - XimfCatalog.registerXimfmailProfileNode ] Default ACL level of profile " + newURI + " : " + defaultacl);		
					}
									
					if( RDFC.IndexOf(_rdfService.GetResource(newURI)) == -1){							
					RDFC.AppendElement(_rdfService.GetResource(newURI));
						
					_dsCatalog.Assert(_rdfService.GetResource(newURI),
						_rdfService.GetResource("http://www.ximfmail.com/RDF#name"),
						_rdfService.GetLiteral(theme), true);		
					
					_dsCatalog.Assert(_rdfService.GetResource(newURI),
						_rdfService.GetResource("http://www.ximfmail.com/RDF#refSeq"),
						_rdfService.GetLiteral("http://www.ximfmail.com/catalog/instance_"+theme), true);							
						
						_dsCatalog.Assert(_rdfService.GetResource(newURI),
							_rdfService.GetResource("http://www.ximfmail.com/RDF#defaultacl"),
							_rdfService.GetLiteral(defaultacl), true);						
						
					}else{						
						_dsCatalog.Change(_rdfService.GetResource(newURI), 
							_rdfService.GetResource("http://www.ximfmail.com/RDF#name"),
							_rdfService.GetLiteral( this.getTarget(newURI,"http://www.ximfmail.com/RDF#name")), 
							_rdfService.GetLiteral(theme));				
									
						_dsCatalog.Change(_rdfService.GetResource(newURI), 
							_rdfService.GetResource("http://www.ximfmail.com/RDF#refSeq"),
							_rdfService.GetLiteral(this.getTarget(newURI,"http://www.ximfmail.com/RDF#refSeq")), 
							_rdfService.GetLiteral("http://www.ximfmail.com/catalog/instance_"+theme));						
							
						_dsCatalog.Change(_rdfService.GetResource(newURI), 
							_rdfService.GetResource("http://www.ximfmail.com/RDF#defaultacl"),
							_rdfService.GetLiteral(this.getTarget(newURI,"http://www.ximfmail.com/RDF#defaultacl")), 
							_rdfService.GetLiteral(defaultacl));
				}
					
				
				}				
				
				// Create instance List
				var	RDFCI = RDFCUtils.MakeSeq(_dsCatalog, _rdfService.GetResource("http://www.ximfmail.com/catalog/instance_"+theme));
												
				// create definitions entries	
				var instanceTag = themeTag[0].getElementsByTagName("instance");
				//alert(instanceTag.length + " instances in profile xml " + theme)
				
				var sValue="";									
				var bHasSmtpInstance=false;	
				for(var i = 0; i < instanceTag.length; i++){
					try{
						// default instance message, continue
						if(instanceTag[i].getAttribute("id") == "smtp"){	
							bHasSmtpInstance = true;				 
							smtpInstance = instanceTag[i].getAttribute("name");
							smtpVersion = instanceTag[i].getAttribute("version");		
							smtpXimfVersion = instanceTag[i].getAttribute("ximfVersion");	
							try{
								smtpInstanceLabel = instanceTag[i].getAttribute("label");
							}catch(ex){}
							if(!smtpInstanceLabel) smtpInstanceLabel = smtpInstance;
							continue; 
						}
					}catch(e){}
					// append resource element to sequence
					var newURI = "http://www.ximfmail.com/catalog/instance_"+theme +"/"+instanceTag[i].getAttribute("name");
					var newResource = _rdfService.GetResource(newURI);
					var isNewItem = false;					
								
					if( RDFCI.IndexOf(newResource) == -1){
						RDFCI.AppendElement(newResource);	
						isNewItem = true;					
					}
						
					// append ximfVersion of instance
					if(isNewItem){
						_dsCatalog.Assert(newResource,
					_rdfService.GetResource("http://www.ximfmail.com/RDF#ximfVersion"),
					_rdfService.GetLiteral(instanceTag[i].getAttribute("ximfVersion")), true);
					}else{							
						_dsCatalog.Change(newResource, 
							_rdfService.GetResource("http://www.ximfmail.com/RDF#ximfVersion"),
							_rdfService.GetLiteral(this.getTarget(newURI,"http://www.ximfmail.com/RDF#ximfVersion")),
							_rdfService.GetLiteral(instanceTag[i].getAttribute("ximfVersion")));							
					}
					
					// 	append name of instance
					if(isNewItem){
						_dsCatalog.Assert(newResource,
					_rdfService.GetResource("http://www.ximfmail.com/RDF#instance"),
					_rdfService.GetLiteral(instanceTag[i].getAttribute("name")), true);					
					}else{							
						_dsCatalog.Change(newResource, 
							_rdfService.GetResource("http://www.ximfmail.com/RDF#instance"),
							_rdfService.GetLiteral(this.getTarget(newURI,"http://www.ximfmail.com/RDF#instance")),
							_rdfService.GetLiteral(instanceTag[i].getAttribute("name")));							
					}
					
					// 	append label of instance
					try{
						var instLabel = instanceTag[i].getAttribute("label");
						if(!instLabel) instLabel = instanceTag[i].getAttribute("name");
						//gConsole.logStringMessage("instLabel" + instLabel);
						if(isNewItem){
							_dsCatalog.Assert(newResource,
						_rdfService.GetResource("http://www.ximfmail.com/RDF#instanceLabel"),
						_rdfService.GetLiteral(instLabel), true);
						}else{							
							_dsCatalog.Change(newResource, 
								_rdfService.GetResource("http://www.ximfmail.com/RDF#instanceLabel"),
								_rdfService.GetLiteral(this.getTarget(newURI,"http://www.ximfmail.com/RDF#instanceLabel")),
								_rdfService.GetLiteral(instanceTag[i].getAttribute("instanceLabel")));							
						}
					}catch(ex){}
					
					// append version of instance
					if(isNewItem){
						_dsCatalog.Assert(newResource,
					_rdfService.GetResource("http://www.ximfmail.com/RDF#version"),
					_rdfService.GetLiteral(instanceTag[i].getAttribute("version")), true);
					}else{							
						_dsCatalog.Change(newResource, 
							_rdfService.GetResource("http://www.ximfmail.com/RDF#version"),
							_rdfService.GetLiteral(this.getTarget(newURI,"http://www.ximfmail.com/RDF#version")),
							_rdfService.GetLiteral(instanceTag[i].getAttribute("version")));							
					}
					// append id of instance
					try{						
						if(isNewItem){					
							_dsCatalog.Assert(newResource,
						_rdfService.GetResource("http://www.ximfmail.com/RDF#id"),
						_rdfService.GetLiteral(instanceTag[i].getAttribute("id")), true);
						}else{							
							_dsCatalog.Change(newResource, 
								_rdfService.GetResource("http://www.ximfmail.com/RDF#id"),
								_rdfService.GetLiteral(this.getTarget(newURI,"http://www.ximfmail.com/RDF#id")),
								_rdfService.GetLiteral(instanceTag[i].getAttribute("id")));							
						}
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
						if(isNewItem){
							_dsCatalog.Assert(newResource,
						_rdfService.GetResource("http://www.ximfmail.com/RDF#pathSchema"),
						_rdfService.GetLiteral(instanceTag[i].getAttribute("directory")+sValue), true);
						}else{							
							_dsCatalog.Change(newResource, 
								_rdfService.GetResource("http://www.ximfmail.com/RDF#pathSchema"),
								_rdfService.GetLiteral(this.getTarget(newURI,"http://www.ximfmail.com/RDF#pathSchema")),
								_rdfService.GetLiteral(instanceTag[i].getAttribute("directory")+sValue));							
						}
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
						if(isNewItem){
							_dsCatalog.Assert(newResource,
						_rdfService.GetResource("http://www.ximfmail.com/RDF#pathIhm"),
						_rdfService.GetLiteral(instanceTag[i].getAttribute("directory")+sValue), true);
						}else{
							_dsCatalog.Change(newResource, 
								_rdfService.GetResource("http://www.ximfmail.com/RDF#pathIhm"),
								_rdfService.GetLiteral(this.getTarget(newURI,"http://www.ximfmail.com/RDF#pathIhm")),
								_rdfService.GetLiteral(instanceTag[i].getAttribute("directory")+sValue));	
						}
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
						if(isNewItem){
							_dsCatalog.Assert(newResource,
						_rdfService.GetResource("http://www.ximfmail.com/RDF#pathRules"),
						_rdfService.GetLiteral(instanceTag[i].getAttribute("directory")+sValue), true);
						}else{
							_dsCatalog.Change(newResource, 
								_rdfService.GetResource("http://www.ximfmail.com/RDF#pathRules"),
								_rdfService.GetLiteral(this.getTarget(newURI,"http://www.ximfmail.com/RDF#pathRules")),
								_rdfService.GetLiteral(instanceTag[i].getAttribute("directory")+sValue));	
						}
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
						if(isNewItem){
							_dsCatalog.Assert(newResource,
						_rdfService.GetResource("http://www.ximfmail.com/RDF#pathDictionary"),
						_rdfService.GetLiteral(instanceTag[i].getAttribute("directory")+sValue), true);
						}else{
							_dsCatalog.Change(newResource, 
								_rdfService.GetResource("http://www.ximfmail.com/RDF#pathDictionary"),
								_rdfService.GetLiteral(this.getTarget(newURI,"http://www.ximfmail.com/RDF#pathDictionary")),
								_rdfService.GetLiteral(instanceTag[i].getAttribute("directory")+sValue));	
						}
						}catch(e){
							gConsole.logStringMessage("[ximfmail - XimfCatalog.registerXimfmailProfileNode ] \n " + e + "\nfile : " + e.fileName+"\nline : "+e.lineNumber);		
						}
					
					if(isNewItem){
						_dsCatalog.Assert(newResource,
					_rdfService.GetResource("http://www.ximfmail.com/RDF#theme"),
					_rdfService.GetLiteral(theme), true);									
					}else{							
						_dsCatalog.Change(newResource, 
							_rdfService.GetResource("http://www.ximfmail.com/RDF#theme"),
							_rdfService.GetLiteral(this.getTarget(newURI,"http://www.ximfmail.com/RDF#theme")),
							_rdfService.GetLiteral(theme));							
					}
					
					try{
						// aclLevel of instance to hide/unhide it on account
						sValue="true";						
						var iAclLevel = -1;
						var acltag = instanceTag[i].getElementsByTagName("acl");
						if(acltag.length>0)iAclLevel = acltag[0].textContent;						
						if(aclLevel){							
							if(parseInt(iAclLevel, 10) > parseInt(aclLevel, 10)) sValue = "false";							
						}else{
							if(parseInt(iAclLevel, 10) > parseInt(this.getTarget(uriThemeDefinition,"http://www.ximfmail.com/RDF#defaultacl"), 10))sValue = "false";
						}
						
						if(isNewItem){
							_dsCatalog.Assert(newResource,
							_rdfService.GetResource("http://www.ximfmail.com/RDF#active"),
							_rdfService.GetLiteral(sValue), true);
						}else{							
							_dsCatalog.Change(newResource, 
								_rdfService.GetResource("http://www.ximfmail.com/RDF#active"),
								_rdfService.GetLiteral(this.getTarget(newURI,"http://www.ximfmail.com/RDF#active")),
								_rdfService.GetLiteral(sValue));							
						}
						}catch(e){													
							gConsole.logStringMessage("[ximfmail - XimfCatalog.registerXimfmailProfileNode ] \n " + e + "\nfile : " + e.fileName+"\nline : "+e.lineNumber);		
						}									
				}
				// insert smtp entry
				if(bHasSmtpInstance){
					var smtpURI = "http://www.ximfmail.com/catalog/instance_"+theme +"/smtp";
					var smtpResource = _rdfService.GetResource(smtpURI);					
					RDFCI.AppendElement(smtpResource);
					_dsCatalog.Assert(smtpResource,_rdfService.GetResource("http://www.ximfmail.com/RDF#ximfVersion"), _rdfService.GetLiteral(smtpXimfVersion), true);
					_dsCatalog.Assert(smtpResource,_rdfService.GetResource("http://www.ximfmail.com/RDF#instance"),_rdfService.GetLiteral(smtpInstance), true);
					_dsCatalog.Assert(smtpResource,_rdfService.GetResource("http://www.ximfmail.com/RDF#version"), _rdfService.GetLiteral(smtpVersion), true);
					_dsCatalog.Assert(smtpResource,_rdfService.GetResource("http://www.ximfmail.com/RDF#pathSchema"),_rdfService.GetLiteral(smtpInstance), true);
					_dsCatalog.Assert(smtpResource,_rdfService.GetResource("http://www.ximfmail.com/RDF#pathIhm"),_rdfService.GetLiteral(smtpInstance), true);
					_dsCatalog.Assert(smtpResource,_rdfService.GetResource("http://www.ximfmail.com/RDF#pathRules"),_rdfService.GetLiteral(smtpInstance), true);
					_dsCatalog.Assert(smtpResource,_rdfService.GetResource("http://www.ximfmail.com/RDF#pathDictionary"),_rdfService.GetLiteral(smtpInstance), true);
					_dsCatalog.Assert(smtpResource,_rdfService.GetResource("http://www.ximfmail.com/RDF#theme"),_rdfService.GetLiteral(smtpInstance), true);	
					_dsCatalog.Assert(smtpResource, _rdfService.GetResource("http://www.ximfmail.com/RDF#active"), _rdfService.GetLiteral("true"), true);
					// 	append label of instance
						try{
						_dsCatalog.Assert(smtpResource,_rdfService.GetResource("http://www.ximfmail.com/RDF#instanceLabel"),_rdfService.GetLiteral(smtpInstanceLabel), true);
						}catch(ex){}				
				}
				// save datas to file DBG
				//_dsCatalog.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
				//var rdfXimfCatalogPath = getFilePathInProfile("extensions/{A627B834-BD9F-4b3f-9AF5-347B5A570402}/chrome/content/theme/ximfCatalogBck.rdf");	
				//_dsCatalog.FlushTo("file:///" + rdfXimfCatalogPath);	
				gConsole.logStringMessage("[ximfmail - XimfCatalog.registerXimfmailProfileNode ] - " + RDFC.GetCount() + " XIMF instances have been saved");
			}catch(e){	
				gConsole.logStringMessage("[ximfmail - XimfCatalog.registerXimfmailProfileNode ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
			}		
		};
		XimfCatalog.prototype.RemoveSeqCatalog = function(seqNode){
			try{
				// create RDF resources
				
				//var seqNode = _rdfService.GetResource("http://www.ximfmail.com/catalog");								
				var rSeqCatalog = null;	
				try{			
					rSeqCatalog = _rdfCUtils.MakeSeq(_dsCatalog, seqNode);					
				}catch(e){
						gConsole.logStringMessage("[ximfmail - XimfCatalog.registerXimfmailProfileNode ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
				}
				
				
				
				if(rSeqCatalog){
	          		/*
	          		var numEntri = rSeqCatalog.GetCount();
	          		for (var indexCur = numEntri; indexCur >0; indexCur--){
	            		rSeqCatalog.RemoveElementAt(indexCur,true);
	            		alert("remove " + rSeqCatalog)
	            	} 	
	            	*/
	            	
				    var tseq = rSeqCatalog.GetElements();
				     alert(seqNode.ValueUTF8+"\nnb elements to remove = " + rSeqCatalog.GetCount())
				    var uriResource = "";
				    while (tseq.hasMoreElements()){
				    	var element = tseq.getNext();
				        if (element instanceof Components.interfaces.nsIRDFResource){
				        	uriResource = element.ValueUTF8;
				            alert("remove " + uriResource)
				            var resource = _rdfService.GetResource(uriResource);
				            rSeqCatalog.RemoveElementAt(rSeqCatalog.IndexOf(resource),true);
				        }else{
				        	alert("remove " + uriResource)
				        }	          
				    }
				    alert("nb elements = " + rSeqCatalog.GetCount())
				  } 
	      	}catch(e){	    
	      		alert(e)  
	        	gConsole.logStringMessage("[ximfmail - XimfCatalog - RemoveSeqCatalog  ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);    
	      	}
		};
		
		XimfCatalog.prototype.getNameInstance = function(instance){
			return this.getTarget(instance,"http://www.ximfmail.com/RDF#instance");
		};
		
		XimfCatalog.prototype.getLabelInstance = function(instance){
			return this.getTarget(instance,"http://www.ximfmail.com/RDF#instanceLabel");
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
				var RDFCUtils = Components.classes["@mozilla.org/rdf/container-utils;1"].createInstance(Components.interfaces.nsIRDFContainerUtils);
				//alert("getInstanceUri - ximfDefUri = " + ximfDefUri)
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
						if(thisName && thisVersion){
							thisName = String_trim(thisName).toLowerCase();
							if(thisName == String_trim(ximfName).toLowerCase()){
								/*
								if(thisVersion == ximfVersion){
									//alert("instance path found >>"+instance_resource);
									return instance_resource;
								}*/
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
				
				// search for instance in others definitions of catalog				
				var completeCatalog = _rdfService.GetResource("http://www.ximfmail.com/catalog");
				var containerDefinitions = RDFCUtils.MakeSeq(_dsCatalog, completeCatalog);
				var children = containerDefinitions.GetElements();					
				while (children.hasMoreElements()){
					try{
						// search uri instance with ximfVersion and ximfName	
						var child = children.getNext();
						if (child instanceof Components.interfaces.nsIRDFResource){	
							var def_resource = child.ValueUTF8;
							// get uri of definition container							
							var seqUriInstance = this.getTarget(def_resource,"http://www.ximfmail.com/RDF#refSeq");							
							if(seqUriInstance != ximfDefUri){								
								var rs_seqInstance2 = _rdfService.GetResource(seqUriInstance);				
								var containerInstances2 = RDFCUtils.MakeSeq(_dsCatalog, rs_seqInstance2);
								var children2 = containerInstances2.GetElements();		
								//alert("inspect uri in :\n" + def_resource+"\nref:\n"+ximfDefUri+"\n elments count = " + containerInstances2.GetCount())						
								while (children2.hasMoreElements()){
									// search uri instance with ximfVersion and ximfName	
									var child2 = children2.getNext();
									if (child2 instanceof Components.interfaces.nsIRDFResource){	
										var instance_resource2 = child2.ValueUTF8;									
										var thisName2 = this.getNameInstance(instance_resource2);										
										if(thisName2){
											thisName2 = String_trim(thisName2).toLowerCase();
											if(thisName2 == String_trim(ximfName).toLowerCase()){	
												//alert("instance_resource matched = "+instance_resource2);						
												return instance_resource2;
											}		
										}
									}
								}	
							}
						}	
					}catch(e){
						gConsole.logStringMessage("[ximfmail - XimfCatalog - getInstanceUri] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);	
					}					  
				}					
			}catch(e){
				gConsole.logStringMessage("[ximfmail - XimfCatalog - getInstanceUri] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);	
			}
			return null;
		}
		
		// array of instances of one definition
		XimfCatalog.prototype.getInstanceList = function(){
			var arrayInstancesUri = [];
			try{				
				// search for instance in others definitions of catalog
				var RDFCUtils = Components.classes["@mozilla.org/rdf/container-utils;1"].createInstance(Components.interfaces.nsIRDFContainerUtils);
				var completeCatalog = _rdfService.GetResource("http://www.ximfmail.com/catalog");
				var containerDefinitions = RDFCUtils.MakeSeq(_dsCatalog, completeCatalog);
				var children = containerDefinitions.GetElements();					
				while (children.hasMoreElements()){
					try{
						// search uri instance with ximfVersion and ximfName	
						var child = children.getNext();
						if (child instanceof Components.interfaces.nsIRDFResource){	
							var def_resource = child.ValueUTF8;
							// get uri of definition container							
							var seqUriInstance = this.getTarget(def_resource,"http://www.ximfmail.com/RDF#refSeq");	
							//arrayInstancesUri.push(seqUriInstance);
													
							var rs_seqInstance2 = _rdfService.GetResource(seqUriInstance);				
							var containerInstances2 = RDFCUtils.MakeSeq(_dsCatalog, rs_seqInstance2);
							var children2 = containerInstances2.GetElements();		
							//alert("inspect uri in :\n" + def_resource+"\nref:\n"+ximfDefUri+"\n elments count = " + containerInstances2.GetCount())						
							while (children2.hasMoreElements()){
								// search uri instance with ximfVersion and ximfName	
								var child2 = children2.getNext();
								if (child2 instanceof Components.interfaces.nsIRDFResource){
									var instance_resource2 = child2.ValueUTF8;				
									arrayInstancesUri.push(instance_resource2);								
								}								
							}
							
						}	
					}catch(e){
						gConsole.logStringMessage("[ximfmail - XimfCatalog - getInstanceUri] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);	
					}					  
				}
			}catch(e){
//				alert("[XimfCatalog]error instance loading...." + e);
				gConsole.logStringMessage("[ximfmail - XimfCatalog ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);		
			}
			
			return arrayInstancesUri;
		};
		
		XimfCatalog.initialized = true;
	}
}