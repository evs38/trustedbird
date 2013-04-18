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

function TRACE_DATE(){
	var ladate=new Date();	
	var h=ladate.getHours();
	if (h<10) {h = "0" + h}
	var m=ladate.getMinutes();
	if (m<10) {m = "0" + m}
	var s=ladate.getSeconds();
	if (s<10) {s = "0" + s};	
	return "\nDATE > "+ladate.getDate()+"/"+(ladate.getMonth()+1)+"/"+ladate.getFullYear()+" "+h+":"+m+":"+s+":"+ladate.getMilliseconds();	
}


/*
 * Load informations of ximf extensions in RDF memory 
 */
var gXimfCatalog = null;
function CreateXimfmailCatalog(aclLevel){
	try{
		if(!gXimfCatalog) gXimfCatalog = XimfCatalog.getInstance();		
	}catch(e){
		gConsole.logStringMessage("[ximfmail - Create XimfCatalog ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
	}
}

/* 
 * get path of user profile
 */
 function getFilePathInProfile(aRelativePath) {    
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
function xHeader(headerRef,headerName,valueRef,valueName,targetName){
	if(headerRef)
		this._headerRef=headerRef;
	if(headerName)
		this._headerName = headerName;
	if(valueRef)
		this._valueRef = valueRef;
	if(valueName)
		this._valueName = valueName;
	//FT3504
	if(targetName)
		this._targetName = targetName;
	
}

/*
 * Create an array of XIMF headers and XIMF values to use for specific check rules
 * Function returns an array of xHeader objects
 * XIMF values are store in string and separated with '&' character
 */
function CreateRulesArray(instancePath,ruleType){
	
	
	var tabHeaders = new Array; // tabHeaders[headerRef][headerName][valueRef][valueName] : headers X to add with values X
							    // tabHeaders['0'][headerName]['0'][valueName] : headers to add necessarily
							    // tabHeaders[headerRef][headerName][valueRef]['0'] : headersto add with XIMF values
	try{
		// get xml rules
		var dir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
  		
		var urlRules = getFilePathInProfile("extensions/"+gXimfCatalog.getRulesInstance(instancePath));
		dir.initWithPath( urlRules );			
		if(!dir.exists()){			
			gConsole.logStringMessage("[Ximfmail - CreateRulesArray] Error loading dictionary file : " + urlRules);
			return;
		}		
		var xmlDoc = GetXmlDocument(urlRules);		
		//oki var instanceTag = xmlDoc.getElementsByTagName("rules");
		var compatibleTag = xmlDoc.getElementsByTagName(ruleType);
		var sValue="";
		//FT3504
		for(var idx=0; idx <compatibleTag.length; ++idx ){
			var childNodes = compatibleTag[idx].childNodes;
			var targetName = compatibleTag[idx].getAttribute("targetName");
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
						tabHeaders.push(new xHeader(href, hname, vref, vname,targetName));		
									
					}				
				}
			}					
				
		//log array values		
	}catch(e){
		gConsole.logStringMessage("[ximfmail - CreateRulesArray ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);				
	}	
	
	return tabHeaders;		
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
			gConsole.logStringMessage("[Ximfmail - CreateDOMWithXimfInstanceRef] Error loading schema file : " + completePath);
			return;
		}else{
			//gConsole.logStringMessage("[Ximfmail - CreateDOMWithXimfInstanceRef] loading schema file : " + completePath);
		}		
		var objXML = GetXmlDocument(completePath);
	
		// get xml dictionary
		var urlDictionary = getFilePathInProfile("extensions/"+gXimfCatalog.getDictionaryInstance(instancePath));

		dir.initWithPath( urlDictionary );			
		if(!dir.exists()){			
			gConsole.logStringMessage("[Ximfmail - CreateDOMWithXimfInstanceRef] Error loading dictionary file : " + completePath);
			return;
		}
		
		// get xml ihm
		var urlIhm = getFilePathInProfile("extensions/"+gXimfCatalog.getIhmInstance(instancePath));

		dir.initWithPath( urlIhm );			
		if(!dir.exists()){			
			gConsole.logStringMessage("[Ximfmail - CreateDOMWithXimfInstanceRef] Error loading ihm file : " + completePath);
			return;
		}
		
		// insert dictionary node, ihm node to instance node of xml schema
		var objDicoXML = GetXmlDocument(urlDictionary);
		var oDicoNode = objDicoXML.getElementsByTagName("ximf:dictionary");
		var objIhmXML = GetXmlDocument(urlIhm);
		var oIhmNode = objIhmXML.getElementsByTagName("ximf:ihm");
		var oSchemaNode = objXML.getElementsByTagName("ximf:instance");
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
		//gConsole.logStringMessage("[Ximfmail - CreateDOMWithXimfInstance] instancepath = " + instancePath +"\n xslurl = " + xslUrl );
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
			gConsole.logStringMessage("[Ximfmail - CreateXMLObjectWithXimfmailInstance] Error loading schema file : " + completePath);
			return null;
		}

		var objXML = GetXmlDocument(completePath);
		
		// get xml dictionary
		var urlDictionary = getFilePathInProfile("extensions/"+gXimfCatalog.getDictionaryInstance(instancePath));
		dir.initWithPath( urlDictionary );			
		if(dir.exists()){			
			var objDicoXML = GetXmlDocument(urlDictionary);
			var oDicoNode = objDicoXML.getElementsByTagName("ximf:dictionary");
		}
			
		// get xml ihm
		var urlIhm = getFilePathInProfile("extensions/"+gXimfCatalog.getIhmInstance(instancePath));
	
		dir.initWithPath( urlIhm );			
		if(dir.exists()){			
			var objIhmXML = GetXmlDocument(urlIhm);		
			var oIhmNode = objIhmXML.getElementsByTagName("ximf:ihm");
		}
		
		// get xml rules
		var urlRules = getFilePathInProfile("extensions/"+gXimfCatalog.getRulesInstance(instancePath));
	
		dir.initWithPath( urlRules );			
		if(dir.exists()){			
			var objRulesXML = GetXmlDocument(urlRules);
			var oRulesNode = objRulesXML.getElementsByTagName("ximf:rule");
		}
			
		// insert dictionary node, ihm node to instance node of xml schema		
		var oSchemaNode = objXML.getElementsByTagName("ximf:instance");
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
	var month = "";
	switch(parts[2].toLowerCase()){
		case "jan":
			new_date += "/01/"; 
			month = "0";
			break;
		case "feb":
			new_date += "/02/"; 
			month = "1";
			break;
		case "mar":
			new_date += "/03/"; 
			month = "2";
			break;
		case "apr":
			new_date += "/04/"; 
			month = "3";
			break;
		case "may":
			new_date += "/05/"; 
			month = "4";
			break;
		case "jun":
			new_date += "/06/"; 
			month = "5";
			break;
		case "jul":
			new_date += "/07/"; 
			month = "6";
			break;
		case "aug":
			new_date += "/08/"; 
			month = "7";
			break;
		case "sep":
			new_date += "/09/"; 
			month = "8";
			break;
		case "oct":
			new_date += "/10/"; 
			month = "9";
			break;
		case "nov":
			new_date += "/11/"; 
			month = "10";
			break;
		case "dec":
			new_date += "/12/"; 
			month = "11";
			break;
		default : new_date += "/??/"; 
	}	
	//get year
	new_date += parts[3];
	//get time, adjust time GMT and LocaleTime
	var cdat = new Date();  
	cdat.setUTCFullYear(parseInt("20"+parts[3], 10));
	cdat.setUTCMonth(parseInt(month, 10));
	cdat.setUTCDate(parseInt(parts[1], 10));
	  
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
	var time = (parseInt(hour, 10)*60) + parseInt(min, 10) + (cdat.getTimezoneOffset()*-1);
	//gConsole.logStringMessage("DBG [Ximfmail - ConvertZTimeToLocal] Formule \n"+(parseInt(hour, 10)*60)+"+"+parseInt(min, 10)+"+" +cdat.getTimezoneOffset()+"="+time);
	
	var hour = parseInt(parseInt(time, 10)/60, 10);
	if(parseInt(hour, 10)<=9) hour = "0" + hour;
	if(parseInt(min, 10) < 0){
		
	}
	if(parseInt(min, 10) < 24){
		
	}
	var min = parseInt(parseInt(time, 10)%60, 10);
	if(parseInt(min, 10)<=9) min = "0" + min;	
	
	new_date += " "+ hour +":"+min;
	
	//gConsole.logStringMessage("DBG [Ximfmail - ConvertZTimeToLocal] \n"+hour+":"+min+" >> " +time+"\n"+time+"/60 = "+ parseInt(time, 10)/60 + "\n" + time + "%60 = " + parseInt(time, 10)%60);
	  	
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
function EncodeMimeXimfheader(sHeader, sValue, charSet){
	try{
		var tmpValue = "";
		var sValueFolding = "";	
		//IMF_HEADER_LINE_MAX_LENGTH=Components.interfaces.nsIMimeConverter.MIME_ENCODED_WORD_SIZE;
	
	  	try{
			// realize mime format convert special character to encoded-word ASCII format (RFC 2047)
			var mimeEncoder = Components.classes["@mozilla.org/messenger/mimeconverter;1"].getService(Components.interfaces.nsIMimeConverter);		
			sValueFolding = mimeEncoder.encodeMimePartIIStr_UTF8(sValue, false, charSet , sHeader.length + 2, Components.interfaces.nsIMimeConverter.MIME_ENCODED_WORD_SIZE);
		}catch (ex){
			sValueFolding = sValue;
		}				
	}catch(e){
		sValueFolding = sValue;
	}				
	return sHeader + ": " + sValueFolding;
}

/*
 * Convert mime header value to string value 
 */
function DecodeMimeXimfheader(sHeaderValue){
	var newHdrValue = null;
	var charsetDefault =  "LATIN_CHARSET";
	try{		
		// convert MIME format (encoded-word ASCII) to String
		if(gLastMailCharset) charsetDefault = gLastMailCharset;		
		var mimeXimfConverter = Components.classes["@mozilla.org/messenger/mimeconverter;1"].getService(Components.interfaces.nsIMimeConverter);
		newHdrValue = mimeXimfConverter.decodeMimeHeader(sHeaderValue,charsetDefault,false,true);
	}catch(ex){
		newHdrValue = sHeaderValue;
	}
	 return newHdrValue;
}

/*
 * Datas class of dialogTree window
 window.arguments = [];
		args[0] id textbox to update
		args[1] reference of catalogue to load
		args[2] title of dialogbox
		args[3] description of dialogbox		
		args[4] title of column 0 of dialogbox
		args[5] title of column 1 of dialogbox
*/
function XimfmailTreedialogArgs(){
	this.idTargetTextbox = ""; // id textbox to update
	this.title = ""; // ttitle of dialogbox
	this.description = ""; // description of dialogbox	
	this.dataSource = ""; // datasource 
	this.titleColKey = "";
	this.titleColLabel = "";
	this.refdataSource = ""; // reference of catalogue to load
	this.currentKeys = []; //
	this.currentLabels = []; //
	this.maxItemsSelected = 1;	
	this.retKeys=[];
	this.retLabels=[];
	this.retIsCancel=false;
}


/**
 * Transform all instances of Ximfmail catalog in xml files
 * Thoses files will be used to display Security Labels (RFC 2634)
 */
function CreateSecurityLabelXml(){	
	try{		
		if(!gXimfCatalog){return;}		
		
		var listRef = "";
		var arrayIstances = gXimfCatalog.getInstanceList();
		var xsltUrl = "chrome://theme_ximfmail/content/instance2SecurityLabel-ximfmail.xsl";			
		for(i=0 ; i< arrayIstances.length ; ++i){
			try{
				var cInstance = arrayIstances[i];
				listRef += cInstance + " \n";		
				var resXsl = CreateDOMWithXimfInstance(arrayIstances[i] , xsltUrl);
				if(resXsl){
					var newFileName = gXimfCatalog.getNameInstance(arrayIstances[i])+".xml";
					var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile); // get profile folder
					var serializer = new XMLSerializer();
					var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
					file.append("securityLabel");
					try{file.create(file.DIRECTORY_TYPE,0);}catch(err){}		
					file.append(newFileName);
					foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);   // write, create, truncate
					serializer.serializeToStream(resXsl, foStream, "");   // rememeber, doc is the DOM tree
					foStream.close();
				}
			}catch(e){
				gConsole.logStringMessage("[ximfmail - CreateSecurityLabelXml ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+ e.lineNumber);
			}		
		}	
	}catch(e){
			gConsole.logStringMessage("[ximfmail - CreateSecurityLabelXml ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+ e.lineNumber);
	}	
}

function ximfAlert(title,message){	
	if(!message){
		message = title;
		title = "";
	}
	var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
  	prompts.alert(window,title, message); 
}

/*
 *  return value of array {[key][value],[key][value],...}
 *  @param key : 
 *  @param array : 
 */
function GetValueFromArrayWithInsensitiveKey(key, array){
	var value = null;
	try{					
		value = array[key];				
		if(value == null){
			// try to get value of array with insensitive case key
			for(akey in array){
				if(akey.toLowerCase() == key.toLowerCase()){						
					value = array[akey];	
					//alert("GetValueFromArrayWithInsensitiveKey - value as insensitive case founded : " +akey+" : "+ value)
					break;
				}
			}					
		}		
	}catch(e){
		gConsole.logStringMessage("[ximfmail - GetValueFromArrayWithInsensitiveKey ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);	
		value=null;
	}
	return value;
}