 /* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Contributor(s):
 *   Copyright (c) 2008-2009 EADS DEFENCE AND SECURITY - All rights reserved
 *   Copyright(c) Airbus Defence and Space 2014 - All rights reserved */

var gConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);

const PREF_SECURE_HEADERS_FOLDER_DATAS="secureheaders.folderdata";
const PREF_DEFAULT_SECUREHEADERS = "secureheaders.bydefault";
const PROPERTIES_URL = "chrome://messenger/locale/secureheaders.properties";
const SECURE_HEADERS_ATTRIBUTE_CHECK="secureheaders.checked";
const HEADER_SEPARATOR=",";

/*
 * 
 */
//document.addEventListener('load', msgCompSMIMEOnLoad, true);
window.addEventListener("compose-window-init", msgCompSMIMEOnLoad, true);
window.addEventListener("compose-window-reopen", msgCompSMIMEOnLoad, true);
function msgCompSMIMEOnLoad() {
	gConsole.logStringMessage("[msgCompSMIMESecureHeaders : msgCompSMIMEOnLoad]");
		
	/* Get profile directory */
	var dirSecureHeader = Components.classes["@mozilla.org/file/directory_service;1"].createInstance(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
	dirSecureHeader.append("secureHeaders");
	
	/* Copy a default profile if needed */
	if (!dirSecureHeader.exists()) {
		dirSecureHeader.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
		var defaultFile = Components.classes["@mozilla.org/file/directory_service;1"].createInstance(Components.interfaces.nsIProperties).get("ProfDefNoLoc", Components.interfaces.nsIFile);
		defaultFile.append("secureHeadersDefault.xml");
		if (defaultFile.exists())
			defaultFile.copyTo(dirSecureHeader, "secureHeadersDefault.xml");
	}
	
	// observer on sending message
	var secureheaders_ObserverSvc = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
	secureheaders_ObserverSvc.addObserver(secureheaders_OnSend, "mail:composeOnSend", false);						
}


/*
 * 
 */
var secureheaders_OnSend = {
	_ArrayheadersToSign : null,
	observe: function(subject, topic, data) {
		//is HeaderSecure requested
		gConsole.logStringMessage("[msgCompSMIMESecureHeaders : Observe]");
		var elt = document.getElementById("menu_securitySecureHeader1");
		if(elt.hasAttribute("checked")){
			this.AddSecureHeadersArray();
		}
  	},
  	AddSecureHeadersArray: function(){
  		try {
  			if (!gMsgCompose.compFields) return;
			if (!gMsgCompose.compFields.securityInfo) return;
			
			var msgSMimeCompFields = gMsgCompose.compFields.securityInfo;
			if(!msgSMimeCompFields){
				gConsole.logStringMessage("[msgCompSMIMESecureHeaders : AddSecureHeadersArray]  gMsgCompose.compFields.securityInfo not found");
				return;
			}
			gConsole.logStringMessage("[msgCompSMIMESecureHeaders : AddSecureHeadersArray]");
				
			//clear secure headers
			msgSMimeCompFields.clearSecureHeaders();

			// get preferences informations to sign
			var arrayHeaderToSign = ReadXmlHeadersToSign();
			
			// relaxed canon algorithm as default value 
			msgSMimeCompFields.canonAlgorithme = 1;
			
			if(arrayHeaderToSign){
				var secHeader = null;
				
				for(i=0;i<arrayHeaderToSign.length;++i){ 					
					if(arrayHeaderToSign[i]._name == "canonalgo"){
						// is canonalgo value
						msgSMimeCompFields.canonAlgorithme = parseInt(arrayHeaderToSign[i]._status,10);
						//gConsole.logStringMessage("[ _secure_headers - AddSecureHeadersArray] canonAlgorithme = " + msgSMimeCompFields.canonAlgorithme);
					}else{					
						// create Header object
						secHeader = Components.classes["@mozilla.org/messenger-smime/smime-secure-header;1"].createInstance(Components.interfaces.nsIMsgSMIMESecureHeader);
						secHeader.headerName=arrayHeaderToSign[i]._name;
						if(arrayHeaderToSign[i]._status!="")
							secHeader.headerStatus=arrayHeaderToSign[i]._status;
						/*if(arrayHeaderToSign[i]._encrypted!="")
							secHeader.headerEncrypted=arrayHeaderToSign[i]._encrypted;*/
						
						// push Header object to array of msgCompFields object
						msgSMimeCompFields.addSecureHeader(secHeader);
					}
				}
			}
		}catch(e){
			gConsole.logStringMessage("[msgCompSMIMESecureHeaders : AddSecureHeadersArray] Error: " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
		}
	} 
};

/*
 *
 */
var DEFAULT_SECUREHEADERS_XML_DIR = "secureHeaders"
var DEFAULT_SECUREHEADERS_XML_FILE = "secureHeadersDefault.xml"
function ReadXmlHeadersToSign(){
	try{
		//var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		 
		// get xml file path
		if(!gCurrentIdentity){ 
			gConsole.logStringMessage("[msgCompSMIMESecureHeaders : ReadXmlHeadersToSign] no xml files define \n ");
			return;
		}
		var pref_data = gCurrentIdentity.getCharAttribute(PREF_SECURE_HEADERS_FOLDER_DATAS);
		var file = null;
		if(!pref_data){	
			file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile); // get profile folder
			file.append(DEFAULT_SECUREHEADERS_XML_DIR);
			file.append(DEFAULT_SECUREHEADERS_XML_FILE);
			pref_data = file.path;
		}else{
	 		file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath( pref_data );
		}
		
		if(!file.exists()){
			gConsole.logStringMessage("[msgCompSMIMESecureHeaders : ReadXmlHeadersToSign] Error loading schema file : " + completePath);
			return;
		}
		
		//	Get Xml Document parser
		var stream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		stream.init(file, -1, -1, Components.interfaces.nsIFileInputStream.CLOSE_ON_EOF);
		var parser = Components.classes["@mozilla.org/xmlextras/domparser;1"].createInstance(Components.interfaces.nsIDOMParser);
		var xmlDoc = parser.parseFromStream(stream, null, file.fileSize, "text/xml");
		
		// get datas from file
		var tabSecureHeaders = new Array; // tabHeaders[headerName][status][encrypted]
		var compatibleTag = xmlDoc.getElementsByTagName("ximf:headers");
		var sValue="";
		
		if(compatibleTag.length>0){
			// get canonical algorithm
			if(compatibleTag[0].hasAttribute("canonalgo")){
				var canonalgo = compatibleTag[0].getAttribute("canonalgo");				
				tabSecureHeaders.push(new xSecureHeader("canonalgo", canonalgo));
				//gConsole.logStringMessage("[msgCompSMIMESecureHeaders : ReadXmlHeadersToSign] get canonical algorithm : " + canonalgo);
			}
			
			// get headers to sign
			var childNodes = compatibleTag[0].childNodes;
			for(var j=0; j <childNodes.length; ++j ){
					var header_name = ""; 
					var header_status = 0; 
					
					//var header_encrypted = -1;
					if(childNodes[j].localName == "header"){
						header_name = childNodes[j].getAttribute("name");
						if(childNodes[j].hasAttribute("status"))
							header_status = parseInt(childNodes[j].getAttribute("status"),10);
						
						/*if(childNodes[j].hasAttribute("encrypted"))
							header_encrypted = parseInt(childNodes[j].getAttribute("encrypted"),10);*/
						
						// load values to array
						tabSecureHeaders.push(new xSecureHeader(header_name, header_status));
					}
				}
			return tabSecureHeaders;
		}else{
			gConsole.logStringMessage("[msgCompSMIMESecureHeaders : ReadXmlHeadersToSign] no headers tag in file " + completePath);
		}
		} catch (e) {
			gConsole.logStringMessage("[msgCompSMIMESecureHeaders : ReadXmlHeadersToSign] Error: " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
		}
}

/*
 * 
 */
function xSecureHeader(name,status){
	if(name)
		this._name = name;
	if(status)
		this._status = status;
	/*if(encrypted)
		this._encrypted = encrypted;*/
}