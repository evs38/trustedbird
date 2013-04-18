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
  * 
  */
function XRDFDataSource(){	
	this._dataSource;
	this._refDataSource;				
}


/*
 * create DataSource RDF with xml file of values
 * xmlDataPath of xml format recognized : 
   <ximf:base name="MCA_List">
		<ximf:header>
			<ximf:title>Saaa</ximf:title>
			<description>Subject ....</description>
			<ximf:column>CODE</ximf:column>
			<ximf:column>Description</ximf:column>
		</ximf:header>
		<ximf:tree>
			<ximf:description>
    			<ximf:data>ZZZ</ximf:data>
    			<ximf:data>My description for this value</ximf:data>
			</ximf:description>
		</ximf:tree>
	</ximf:base>
 */
function CreateRdfDatasSource(xmlDataPath){
	try{		
		
		if(!xmlDataPath) return;
		
		var domProfile = null;
		
		var xDataSource = new XRDFDataSource();
		var xmlDoc = GetXmlDocument(xmlDataPath);
		if(xmlDoc){		  							 										  		  			
			domProfile = xmlDoc.documentElement;						
		}else{
			gConsole.logStringMessage("[ximfmail - ximfTreeDialog ] \n " + Error.description + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
			return;
		}
		
		// is valid xml document?
		var baseTag = domProfile.getElementsByTagName("ximf:base");			
		if(baseTag.length <= 0) return;		
		
		// init RDF XPCOM Services	
		var _rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);		
		var _dsCatalog = Components.classes["@mozilla.org/rdf/datasource;1?name=in-memory-datasource"].createInstance(Components.interfaces.nsIRDFDataSource);
		var _rdfCUtils = Components.classes["@mozilla.org/rdf/container-utils;1"].getService(Components.interfaces.nsIRDFContainerUtils);
			
		// parse XML file and create RDF resources				
		var tname = baseTag[0].getAttribute("name");			
		var baseURI = "http://www.ximfmail.com/catalog/" + tname;				
		var datasUri = baseURI + "/datas";		
		
		var seqNode = _rdfService.GetResource(datasUri);
		var RDFC_data = null;	
		try{			
			RDFC_data = _rdfCUtils.MakeSeq(_dsCatalog, seqNode);
			
		}catch(e){
				gConsole.logStringMessage("[ximfmail - CreateRdfDatasSource ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
		}			
		
		var treeTag = baseTag[0].getElementsByTagName("ximf:tree");		
		var instanceTag = treeTag[0].getElementsByTagName("ximf:description");
		for(var i = 0; i < instanceTag.length; ++i){
			// append resource element to sequence
			var newURI = datasUri + "/data" + i;			
			//_rdfContainer.AppendElement(_rdfService.GetResource(newURI));
			RDFC_data.AppendElement(_rdfService.GetResource(newURI));
				
			var instanceTagData = instanceTag[i].getElementsByTagName("ximf:data");
			for(var j = 0; j < instanceTagData.length; ++j){
				// append description element
				_dsCatalog.Assert(_rdfService.GetResource(newURI),
				_rdfService.GetResource("http://www.ximfmail.com/RDF#column"+j),
				_rdfService.GetLiteral(instanceTagData[j].textContent), true);		
			}
		}
		//create objet result
		//alert("CreateRdfDatasSource new ref : "+datasUri);
		xDataSource._dataSource = _dsCatalog;
		xDataSource._refDataSource = datasUri;
		return xDataSource; 
	}catch(e){	
		gConsole.logStringMessage("[ximfmail - CreateRdfDatasSource ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
	}	
}

/*
 * create DataSource RDF with array of values
 * arrayDatas = [[col0][col1][coln], [col0][col1][coln], [col0][col1][coln], ...]
 * nameSvc = title of box selection
 */
function CreateRdfDatasSource_array(arrayDatas, strTitle){
	try{			
		// is valid array document?			
		if(arrayDatas.length <= 0){			
			 return;
		}		
		
		// init RDF XPCOM Services	
		var xDataSource = new XRDFDataSource();
		var _rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);		
		var _dsCatalog = Components.classes["@mozilla.org/rdf/datasource;1?name=in-memory-datasource"].createInstance(Components.interfaces.nsIRDFDataSource);
		var _rdfCUtils = Components.classes["@mozilla.org/rdf/container-utils;1"].getService(Components.interfaces.nsIRDFContainerUtils);
			
		// parse XML file and create RDF resources				
		var baseURI = "http://www.ximfmail.com/catalog/" + strTitle;				
		var datasUri = baseURI + "/datas";		
		
		var seqNode = _rdfService.GetResource(datasUri);
		var RDFC_data = null;	
		try{			
			RDFC_data = _rdfCUtils.MakeSeq(_dsCatalog, seqNode);
			
		}catch(e){
				gConsole.logStringMessage("[ximfmail - XimfTreeData.registerXimfmailProfileNode ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
		}			
						
		for(var i = 0; i < arrayDatas.length; ++i){
			// append resource element to sequence
			var newURI = datasUri + "/data" + i;					
			RDFC_data.AppendElement(_rdfService.GetResource(newURI));
				
			var arrayCols = arrayDatas[i];
			for(var j = 0; j < arrayCols.length; ++j){
				var valData = arrayCols[j];
				if (valData == "")
					valData = " ";
				// append description element
				_dsCatalog.Assert(_rdfService.GetResource(newURI), 
					_rdfService.GetResource("http://www.ximfmail.com/RDF#column"+j), 
					_rdfService.GetLiteral(valData), 
					true
				);		
			}
		}
		
		//create objet result
		//alert("CreateRdfDatasSource new ref : "+datasUri);
		xDataSource._dataSource = _dsCatalog;
		xDataSource._refDataSource = datasUri;
		return xDataSource; 
	}catch(e){	
		gConsole.logStringMessage("[ximfmail - XimfTreeData.CreateRdfDatasSource ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
	}	
}
