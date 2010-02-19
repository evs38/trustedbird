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
 
// GLOBALS
//var relativeXimfCatalogPath = "ximf/ximfmail/chrome/content/theme/ximfCatalog.rdf";
var gConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
var gJSLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].createInstance(Components.interfaces.mozIJSSubScriptLoader);

var gRelativeXimfCatalogPath = "extensions/{A627B834-BD9F-4b3f-9AF5-347B5A570402}/chrome/content/theme/ximfCatalogBck.rdf";
var CHROME_XIMFMAIL_CATALOG = "chrome://theme_ximfmail/content/ximfCatalog.rdf";


try{
	gJSLoader.loadSubScript("chrome://ximfmail/content/ximfCatalog.js");
	var gXimfCatalog = new XimfCatalog();
}catch(e){
	gConsole.logStringMessage("[ximfmail - Load XimfCatalog ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);		
}

/*
 * Load informations of ximf extensions in RDF memory 
 */
function CreateXimfmailCatalog(){
	try{		
		var extensionPath = getFilePathInProfile("extensions/");
		var extensionList = getExtensionsList();	
		var sCompletePath;	
		var dir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
  			
		// search for themes extensions
		for(i = 0; i<extensionList.length; i++){
			sCompletePath = getFilePathInProfile("extensions/" + extensionList[i].id + "/chrome/content/ximfmail-profile.xml");
			dir.initWithPath( sCompletePath );			
			if(dir.exists()){												
				// get xml profile	  	
	  			var xmlDoc = GetXmlDocument(sCompletePath); 	  			
				gXimfCatalog.registerXimfmailProfileNode(xmlDoc.documentElement);					
				dump(sCompletePath + " : " + extensionList[i].name);
				//alert(sCompletePath + " : " + extensionList[i].name);						
			}									
		}	
	}catch(e){
			gConsole.logStringMessage("[ximfmail - Create XimfCatalog ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
	}
}

/* 
 * get path profile
 */
 function getFilePathInProfile(aRelativePath) {
    // on récupère un objet nsIFile qui represente le repertoire du profil de l'utilisateur
    var file = Components.classes["@mozilla.org/file/directory_service;1"]
                      .getService(Components.interfaces.nsIProperties)
                      .get("ProfD", Components.interfaces.nsIFile);

    // Add relative data file
    var path = aRelativePath.split("/");
    for (var i = 0, sz = path.length; i < sz; i++) {
        if (path[i] != "")
           file.append(path[i]);
    }
    return file.path;
}

/*
 * List files of 'dir' directory
*/
 function getListFiles(dir){
   // Acces to system directory files
  var dir = Components.classes["@mozilla.org/file/local;1"].
            createInstance(Components.interfaces.nsILocalFile);
  dir.initWithPath( bn );
 	
  // read files of working directory
  var dlst = dir.directoryEntries;
  while(dlst.hasMoreElements()) {
    var file = dlst.getNext().QueryInterface(Components.interfaces.nsIFile);
    if (file.isFile() && file.leafName.substring(file.leafName.lastIndexOf('.'))=='.xul') {
      /* Create html list */
       var html_li = document.createElementNS(HTML_NS, 'li');
       var html_a  = document.createElementNS(HTML_NS, 'a');
       html_a.href = base_chrome + file.leafName;
       html_a.innerHTML = file.leafName;
       html_li.appendChild(html_a);
       html_lst.appendChild(html_li);
     }
  } 	
}

/*
 * List extensions of profile 
 */
function getExtensionsList(){
	try{		
		var em = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
		var rfdSvc = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
		var url = em.datasource.URI;
		return em.getItemList(Components.interfaces.nsIUpdateItem.TYPE_ADDON, { });				
	
	}catch(e){
			gConsole.logStringMessage("[ximfmail - getExtensionsList ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
	}	
}


/* 
 * get XML parser from file
 * sPath : complete path File locate on Disk
 */
function GetXmlDocument(sPath){
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(sPath);
    var stream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
    stream.init(file, -1, -1, Components.interfaces.nsIFileInputStream.CLOSE_ON_EOF);
	var parser = Components.classes["@mozilla.org/xmlextras/domparser;1"].createInstance(Components.interfaces.nsIDOMParser);
		
    return parser.parseFromStream(stream, null, file.fileSize, "text/xml");
}


/*
 *  
 */
function xHeader(headerRef,headerName,valueRef,valueName){
	if(headerRef)
		this._headerRef=headerRef;
	if(headerName)
		this._headerName = headerName;
	if(valueRef)
		this._valueRef = valueRef;
	if(valueName)
		this._valueName = valueName;
	
}

/*
 * Create an array of XIMF headers and XIMF values to use for specific check rules
 * Function returns an array of xHeader objects
 * XIMF values are store in string and separated with '&' character
 */
function CreateRulesArray(instancePath,ruleType){
	
	try{
		var tabHeaders = new Array; // tabHeaders[headerRef][headerName][valueRef][valueName] : headers X à ajouter avec valeurs X
								    // tabHeaders['0'][headerName]['0'][valueName] : headers à ajouter obligatoirement
								    // tabHeaders[headerRef][headerName][valueRef]['0'] : headers X à ajouter avec valeurs XIMF

		// get xml rules
		var dir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
  		
		var urlRules = getFilePathInProfile("extensions/"+gXimfCatalog.getRulesInstance(instancePath));
		dir.initWithPath( urlRules );			
		if(!dir.exists()){			
			gConsole.logStringMessage("[Ximfmail - CreateDOMWithXimfInstance] Error loading dictionary file : " + urlRules);
			return;
		}		
		var xmlDoc = GetXmlDocument(urlRules);		
		//oki var instanceTag = xmlDoc.getElementsByTagName("rules");
		var compatibleTag = xmlDoc.getElementsByTagName(ruleType);
		var sValue="";
		if(compatibleTag.length>0){
			var childNodes = compatibleTag[0].childNodes;
			
			for(var j=0; j <childNodes.length; ++j ){
					var hname = ""; 
					var href = ""; 
					var vname = "";
					var vref = "";								
					if(childNodes[j].localName == "aliasHeader"){
						hname = childNodes[j].getAttribute("headerName");
						href = childNodes[j].getAttribute("headerRef");
						var childHeader = childNodes[j].childNodes;
						for(var k=0; k <childHeader.length; ++k ){
							//get attributes
							if(childHeader[k].localName == "aliasValue"){
								if (vname == ""){
									vname = childHeader[k].getAttribute("valueName");
									vref = childHeader[k].getAttribute("valueRef"); 
								}else{
									vname = vname + "&" + childHeader[k].getAttribute("valueName");
									vref = vref +  "&" + childHeader[k].getAttribute("valueRef"); 
								}
							}
						}						
						
						// load values to array					
						tabHeaders.push(new xHeader(href, hname, vref, vname));		
									
					}				
				}
	
			return tabHeaders;				
		}		
		//log array values		
	}catch(e){
		gConsole.logStringMessage("[ximfmail - CreateRulesArray ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);				
	}	
}


/*
 * Create Dom Node with xml instance schemas
 * Create DOM with XSL transformation 
*/
function CreateDOMWithXimfInstanceRef(instancePath, xslUrl){
	try{
		// create XSLT Processor
		var xslProcessor = new XSLTProcessor();		
		
		//  import XSLT File 
		var myXMLHTTPRequest = new XMLHttpRequest();
  		myXMLHTTPRequest.open("GET", xslUrl, false);
  		myXMLHTTPRequest.send(null);
  		var objXSL = myXMLHTTPRequest.responseXML;			
		xslProcessor.importStylesheet(objXSL);
		
		// get local lang for ilk management
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
		var paramLang = prefs.getCharPref("general.useragent.locale");
		if(paramLang)
			xslProcessor.setParameter("","gLang", paramLang);		  	 	
  	 	
  	 	// get xml schema
  	 	//var gXimfCatalog = new XimfCatalog();
  	 	var dir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
  		var completePath = getFilePathInProfile("extensions/"+gXimfCatalog.getSchemaInstance(instancePath));
	
  		dir.initWithPath( completePath );			
		if(!dir.exists()){	
			gConsole.logStringMessage("[Ximfmail - CreateDOMWithXimfInstance] Error loading schema file : " + completePath);
			return;
		}else{
			//gConsole.logStringMessage("[Ximfmail - CreateDOMWithXimfInstance] loading schema file : " + completePath);
		}		
		var objXML = GetXmlDocument(completePath);
	
		// get xml dictionary
		var urlDictionary = getFilePathInProfile("extensions/"+gXimfCatalog.getDictionaryInstance(instancePath));

		dir.initWithPath( urlDictionary );			
		if(!dir.exists()){			
			gConsole.logStringMessage("[Ximfmail - CreateDOMWithXimfInstance] Error loading dictionary file : " + completePath);
			return;
		}
		
		// get xml ihm
		var urlIhm = getFilePathInProfile("extensions/"+gXimfCatalog.getIhmInstance(instancePath));

		dir.initWithPath( urlIhm );			
		if(!dir.exists()){			
			gConsole.logStringMessage("[Ximfmail - CreateDOMWithXimfInstance] Error loading ihm file : " + completePath);
			return;
		}
		
		// insert dictionary node, ihm node to instance node of xml schema
		var objDicoXML = GetXmlDocument(urlDictionary);
		var oDicoNode = objDicoXML.getElementsByTagName("dictionary");
		var objIhmXML = GetXmlDocument(urlIhm);
		var oIhmNode = objIhmXML.getElementsByTagName("ihm");
		var oSchemaNode = objXML.getElementsByTagName("instance");
		oSchemaNode[0].appendChild( oDicoNode[0] );
		oSchemaNode[0].appendChild( oIhmNode[0] );		
			
		// transform document
		var docResult = xslProcessor.transformToFragment(objXML, document);		
		return docResult;	  	
	}catch(e){
		gConsole.logStringMessage("[Ximfmail - CreateDOMWithXimfInstance] Error on creating instance...\n" + e + " [ " + Error().fileName + Error().lineNumber +"]");
		alert("[Ximfmail] Error on creating instance...\n"  + e+ " [ " + Error().fileName + Error().lineNumber +"]");		
	}
}

function CreateDOMWithXimfInstance(instancePath, xslUrl){
	try{		
		var xml = CreateXMLObjectWithXimfmailInstance(instancePath);		
		return ApplyXimfmailXslt(xslUrl,xml);
	}catch(e){
		gConsole.logStringMessage("[Ximfmail - CreateDOMWithXimfInstance] Error on creating instance...\n" + e + " [ " + Error().fileName + Error().lineNumber +"]");
		alert("[Ximfmail] Error on creating instance...\n"  + e+ " [ " + Error().fileName + Error().lineNumber +"]");		
	}
	return null;
}

function CreateXMLObjectWithXimfmailInstance(instancePath){
	try{
		// get xml schema
	  	var dir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	  	var completePath = getFilePathInProfile("extensions/"+gXimfCatalog.getSchemaInstance(instancePath));
		
	  	dir.initWithPath( completePath );			
		if(!dir.exists()){	
			gConsole.logStringMessage("[Ximfmail - CreateDOMWithXimfInstance] Error loading schema file : " + completePath);
			return null;
		}

		var objXML = GetXmlDocument(completePath);
		
		// get xml dictionary
		var urlDictionary = getFilePathInProfile("extensions/"+gXimfCatalog.getDictionaryInstance(instancePath));
		dir.initWithPath( urlDictionary );			
		if(dir.exists()){			
			var objDicoXML = GetXmlDocument(urlDictionary);
			var oDicoNode = objDicoXML.getElementsByTagName("dictionary");
		}
			
		// get xml ihm
		var urlIhm = getFilePathInProfile("extensions/"+gXimfCatalog.getIhmInstance(instancePath));
	
		dir.initWithPath( urlIhm );			
		if(dir.exists()){			
			var objIhmXML = GetXmlDocument(urlIhm);		
			var oIhmNode = objIhmXML.getElementsByTagName("ihm");
		}
		
		// get xml rules
		var urlRules = getFilePathInProfile("extensions/"+gXimfCatalog.getRulesInstance(instancePath));
	
		dir.initWithPath( urlRules );			
		if(dir.exists()){			
			var objRulesXML = GetXmlDocument(urlRules);
			var oRulesNode = objRulesXML.getElementsByTagName("rule");
		}
			
		// insert dictionary node, ihm node to instance node of xml schema		
		var oSchemaNode = objXML.getElementsByTagName("instance");
		if(oDicoNode.length > 0){
			oSchemaNode[0].appendChild( oDicoNode[0] );
		}
		
		if(oIhmNode.length > 0){
			oSchemaNode[0].appendChild( oIhmNode[0] );
		}		
		
		for(var i=0; i < oRulesNode.length; ++i){
			oSchemaNode[0].appendChild( oRulesNode[i] );
		}
		return objXML;
	}catch(e){
		gConsole.logStringMessage("[Ximfmail - CreateXMLObjectWithXimfmailInstance] \nError : " + e + " \n [ " + Error().fileName + Error().lineNumber +"]");
	}
	return null;
		
}

/*
 * Create DOM node with xslt transformation on xml object
 */
function ApplyXimfmailXslt(xsltUrl,xmlObject){
		
	if(!xmlObject) return null;
	try{	
	//  import XSLT File 
	var myXMLHTTPRequest = new XMLHttpRequest();
  	myXMLHTTPRequest.open("GET", xsltUrl, false);
  	myXMLHTTPRequest.send(null);
  	var objXSL = myXMLHTTPRequest.responseXML;	
	var xslProcessor = new XSLTProcessor();	
	xslProcessor.importStylesheet(objXSL);
	
	// get local lang
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	var paramLang = prefs.getCharPref("general.useragent.locale");
	if(paramLang){	
		xslProcessor.setParameter("","gLang", paramLang);
	}
		
	// transform document
	var docResult = xslProcessor.transformToFragment(xmlObject, document);		
	return docResult;	
	}catch(e){
		gConsole.logStringMessage("[Ximfmail - CreateXMLObjectWithXimfmailInstance] \nError : " + e + " \n [ " + Error().fileName + Error().lineNumber +"]");
	}
	return null;	
} 


/*
 * Sat, 06 Jun 2009 16:10:00 GMT >> 09/06/2009 14:10:55
 */
function ConvertZTimeToLocal(thisdate){
	var new_date = null;
	var reg=new RegExp("[ / :]+", "g"); //eads
	var parts = thisdate.split(reg); // parts[day][date][month][year][hour][minute][sec][gmt+0]
	if(parts.length < 8) return; 
	
	// get date
	new_date = parts[1];	
	// get month
	switch(parts[2].toLowerCase()){
		case "jan":
			new_date += "/01/"; 
			break;
		case "feb":
			new_date += "/02/"; 
			break;
		case "mar":
			new_date += "/03/"; 
			break;
		case "apr":
			new_date += "/04/"; 
			break;
		case "may":
			new_date += "/05/"; 
			break;
		case "jun":
			new_date += "/06/"; 
			break;
		case "jul":
			new_date += "/07/"; 
			break;
		case "aug":
			new_date += "/08/"; 
			break;
		case "sep":
			new_date += "/09/"; 
			break;
		case "oct":
			new_date += "/10/"; 
			break;
		case "nov":
			new_date += "/11/"; 
			break;
		case "dec":
			new_date += "/12/"; 
			break;
		default : new_date += "/??/"; 
	}	
	//get year
	new_date += parts[3];
	//get time, adjust time GMT and LocaleTime
	var cdat = new Date();
	var hour = parts[4];
	var min = parts[5];
	try{
		if(parts[4][0]=="0")
			hour=parts[4][1];
	}catch(e){}
	try{
		if(parts[5][0]=="0")
			min=parts[5][1];
	}catch(e){}
	
	//  get local time
	var time = (parseInt(hour)*60) + parseInt(min) + (cdat.getTimezoneOffset()*-1);
	//gConsole.logStringMessage("DBG [Ximfmail - ConvertZTimeToLocal] Formule \n"+(parseInt(hour)*60)+"+"+parseInt(min)+"+" +cdat.getTimezoneOffset()+"="+time);
	
	var hour = parseInt(parseInt(time)/60);
	if(parseInt(min) < 0){
		
	}
	if(parseInt(min) < 24){
		
	}
	var min = parseInt(parseInt(time)%60);
	if(parseInt(min)<=9) min = "0" + min;	
	
	new_date += " "+ hour +":"+min;
	
	//gConsole.logStringMessage("DBG [Ximfmail - ConvertZTimeToLocal] \n"+hour+":"+min+" >> " +time+"\n"+time+"/60 = "+ parseInt(time)/60 + "\n" + time + "%60 = " + parseInt(time)%60);
	  	
	return new_date;
}							

/*
 * get international value from ximfmail propertie file
 */
function getIlkProperties(key){
	var sLabel = "";
	// internationalisation of ximfmail context popup
	try{				
		var gBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
		var stringBundle = gBundle.createBundle("chrome://ximfmail/locale/ximfmail.properties");	
		sLabel = stringBundle.GetStringFromName(key);		
	}catch(err){}	
	return sLabel;			
}	

function String_trim(s) {
  var c ="";
  var tmp="";
  for (var i = 0; i < s.length; i++) {  
    if(s[i] != " " &&
       s[i] != "\t"){
    	c += s[i];
    }
  }
  return c;
}




/*
 * BUG 4689 - using folding with header 
 * realize mime format convert special character to encoded-word ASCII format (RFC 2047)
 * rule based on RFC222 : Internet Message Format
 */
var IMF_HEADER_LINE_MAX_LENGTH=77; // 78 is max len but it must insert ' ' caracter in folding line
var IMF_HEADER_LINE_FOLDING_SEPARATOR="\r\n ";
function EncodeMimeXimfheader(sHeader, charSet){
	try{
		//mime converter
		var mimeEncoder = Components.classes["@mozilla.org/messenger/mimeconverter;1"].getService(Components.interfaces.nsIMimeConverter);
		try{
		  var newMimeHdr = null;
		  newMimeHdr = mimeEncoder.encodeMimePartIIStr(sHeader, false, charSet , 0, IMF_HEADER_LINE_MAX_LENGTH);
		  sFolding = newMimeHdr;
		  //alert(sHeader);
		}catch (ex){
			sFolding = sHeader;
		}
		 
		/* 
		// encodeMimePartIIStr function apply folding rules
		if(sHeader.length <= IMF_HEADER_LINE_MAX_LENGTH) {			
		    //alert(newHdr)			
			return sHeader;
		}
		
		var sFolding = "";
		var sEndHeader = sHeader;
		
		// fold header line in multi-line header	
		for(var i = IMF_HEADER_LINE_MAX_LENGTH; i <= sHeader.length ; i+=IMF_HEADER_LINE_MAX_LENGTH){			 
			sFolding += sEndHeader.slice(0,IMF_HEADER_LINE_MAX_LENGTH);;			
			sEndHeader = sEndHeader.slice(IMF_HEADER_LINE_MAX_LENGTH,sEndHeader.length);
			if(sEndHeader.length > 0){
				sFolding += IMF_HEADER_LINE_FOLDING_SEPARATOR;
			}					
		}
		
		// copy end of the header
		if(sEndHeader.length > 0){					
			sFolding += sEndHeader;	
		}	
		* */	
	}catch(e){		
		return sHeader;
	}	
	return sFolding;
}

/*
 * Convert mime header value to string value 
 */
function DecodeMimeXimfheader(sHeaderValue){
	 var newHdrValue = null;
	 var charsetDefault =  "LATIN_CHARSET";
	try{
		// convert MIME format (encoded-word ASCII) to String
		var unicodeConverter = Components.classes["@mozilla.org/network/mime-hdrparam;1"].createInstance(Components.interfaces.nsIMIMEHeaderParam);		   
		//var mimeDecoder = Components.classes["@mozilla.org/messenger/mimeconverter;1"].getService(Components.interfaces.nsIMimeConverter);
		//var UnicodeConverter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
	
		if(gLastMailCharset){
			charsetDefault = gLastMailCharset;
		}
		
		//newHdrValue = mimeDecoder.decodeMimeHeader(xhdr._hdrValue, "", false, false);	
	  	newHdrValue = _from_utf8(unicodeConverter.decodeRFC2047Header(sHeaderValue, charsetDefault, false, false));
	}catch(ex){
		newHdrValue = sHeaderValue;
	}
	 return newHdrValue;
}

/*
 * 
 */
function _from_utf8(s) {
  var c, d = "", flag = 0, tmp;
  for (var i = 0; i < s.length; i++) {
    c = s.charCodeAt(i);
    if (flag == 0) {
      if ((c & 0xe0) == 0xe0) {
        flag = 2;
        tmp = (c & 0x0f) << 12;
      } else if ((c & 0xc0) == 0xc0) {
        flag = 1;
        tmp = (c & 0x1f) << 6;
      } else if ((c & 0x80) == 0) {
        d += s.charAt(i);
      } else {
        flag = 0;
      }
    } else if (flag == 1) {
      flag = 0;
      d += String.fromCharCode(tmp | (c & 0x3f));
    } else if (flag == 2) {
      flag = 3;
      tmp |= (c & 0x3f) << 6;
    } else if (flag == 3) {
      flag = 0;
      d += String.fromCharCode(tmp | (c & 0x3f));
    } else {
      flag = 0;
    }
  }
  return d;
}