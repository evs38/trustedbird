/* ***** BEGIN LICENSE BLOCK *****
Copyright (c) 2008-2009 EADS DEFENCE AND SECURITY - All rights reserved.
secure header is under the triple license  MPL 1.1/GPL 2.0/LGPL 2.1.


Redistribution and use, in source and binary forms, with or without modification, are permitted provided that the following conditons are met :

1. Redistributions of source code must retain the above copyright notice,
2.MPL 1.1/GPL 2.0/LGPL 2.1. license agreements must be attached in the redistribution of the source code.
3. Neither the names of the copyright holders nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from EADS Defence and Security.

Alternatively, the contents of this file may be used under the terms of
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

REMINDER  :
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR  A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 
EADS Defence and Security - 1 Boulevard Jean Moulin -  ZAC de la Clef Saint Pierre - 78990 Elancourt - FRANCE (IDDN.FR.001.480012.002.S.P.2008.000.10000)
 * ***** END LICENSE BLOCK ***** */


var gConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);

const PREF_SECURE_HEADERS_FOLDER_DATAS="secureheaders.folderdata";
const PREF_DEFAULT_SECUREHEADERS = "secureheaders.bydefault";
const PROPERTIES_URL = "chrome://messenger/locale/secureheaders.properties";
const SECURE_HEADERS_ATTRIBUTE_CHECK="secureheaders.checked";
const HEADER_SEPARATOR=",";



/*
 * 
 */
document.addEventListener('load', msgCompSMIMEOnLoad, true);
function msgCompSMIMEOnLoad(){
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
	
	// observer on current document	
	//document.addEventListener('compose-window-reopen', onComposerOpen_SecureHeaders, true);
	onComposerOpen_SecureHeaders();
	
	// observer on sending message
	var secureheaders_ObserverSvc = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
	secureheaders_ObserverSvc.addObserver(secureheaders_OnSend, "mail:composeOnSend", false);						
	
	// ihm events and update
	var item1 = document.getElementById("idItemSecureHeaders_1");
	item1.addEventListener('command', SetCheck_1, true);
	var item2 = document.getElementById("idItemSecureHeaders_2");
	item2.addEventListener('command', SetCheck_2, true);
	
	var item3 = document.getElementById("menu_securitySign1");
	item3.addEventListener('command', SetCheckSecurity_1, true);
	var item4 = document.getElementById("menu_securitySign2");
	item4.addEventListener('command', SetCheckSecurity_2, true);
	
	document.addEventListener("compose-window-close", msgCompSMIMEOnUnLoad, true);
}

function msgCompSMIMEOnUnLoad(){
	document.getElementById("idItemSecureHeaders_1").setAttribute("checked","false");
	document.getElementById("idItemSecureHeaders_2").setAttribute("checked","false");
	UpdateSecureRequest();
}

/*
 * Init ihm sign headers
 */
function onComposerOpen_SecureHeaders(){
	try{
		// get international label for new line
		var gBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
		var stringBundle = gBundle.createBundle(PROPERTIES_URL);
		var sLabel = stringBundle.GetStringFromName("menu.secureheaders.label");
		
		var elt_menu_to_sign = document.getElementById("idItemSecureHeaders_1");
		// if null, create it
		if(elt_menu_to_sign == null){
			// insert item SecureHeaders in menu composer
			var itemSecureHeaders = document.createElement("menuitem");
			itemSecureHeaders.setAttribute("label",sLabel);
			itemSecureHeaders.setAttribute("id","idItemSecureHeaders_1");
			itemSecureHeaders.setAttribute("type","checkbox");
			itemSecureHeaders.setAttribute("checked","false");
			var itemSecurity = document.getElementById("menu_securitySign1"); 
			itemSecurity.parentNode.appendChild(itemSecureHeaders);
			
			// insert item Securitylabel in toolbar composer
			var itemSecureHeaders2 = document.createElement("menuitem");
			itemSecureHeaders2.setAttribute("label",sLabel);
			itemSecureHeaders2.setAttribute("id","idItemSecureHeaders_2");
			itemSecureHeaders2.setAttribute("type","checkbox");
			itemSecureHeaders2.setAttribute("checked","false");
			itemSecurity = document.getElementById("menu_securitySign2"); 
			itemSecurity.parentNode.appendChild(itemSecureHeaders2);
		}else{
			UpdateSecureRequest();
		}

		//Loaded SecureHeader Preference
		/*if(gCurrentIdentity){
			gCurrentIdentity.setBoolAttribute(SECURE_HEADERS_ATTRIBUTE_CHECK, false);
		}*/
	}catch(e){
	 	gConsole.logStringMessage("[_secure_headers - onComposerOpen_SecureHeaders ] \n " + e + "\nfile : " + e.fileName+"\nline : "+ e.lineNumber);	
	}
}

/*
 * 
 */
function SetCheck_1(){
	var checked_1="false";
	var checked_2="false";
	if(document.getElementById("idItemSecureHeaders_2").hasAttribute("checked")){
		checked_2=document.getElementById("idItemSecureHeaders_2").getAttribute("checked");
	}
	if(document.getElementById("idItemSecureHeaders_1").hasAttribute("checked")){
		checked_1=document.getElementById("idItemSecureHeaders_1").getAttribute("checked");
	}
	
	if(checked_2 != checked_1){
		document.getElementById("idItemSecureHeaders_2").setAttribute("checked",checked_1);
		UpdateSecureRequest();
	}
}

function SetCheck_2(){
	var checked_1="false";
	var checked_2="false";
	if(document.getElementById("idItemSecureHeaders_2").hasAttribute("checked")){
		checked_2=document.getElementById("idItemSecureHeaders_2").getAttribute("checked");
	}
	if(document.getElementById("idItemSecureHeaders_1").hasAttribute("checked")){
		checked_1=document.getElementById("idItemSecureHeaders_1").getAttribute("checked");
	}
	
	if(checked_2 != checked_1){
		document.getElementById("idItemSecureHeaders_1").setAttribute("checked",checked_2);
		UpdateSecureRequest();
	}
}

/*
 * 
 */
function SetCheckSecurity_1(){
	var checked_1="false";
	var checked_2="false";
	if(document.getElementById("menu_securitySign1").hasAttribute("checked")){
		checked_2=document.getElementById("menu_securitySign1").getAttribute("checked");
	}
		
	if(checked_2 == checked_1){
		document.getElementById("idItemSecureHeaders_1").setAttribute("checked",checked_1);
		document.getElementById("idItemSecureHeaders_2").setAttribute("checked",checked_1);
		UpdateSecureRequest();
	}
}

/*
 * 
 */
function SetCheckSecurity_2(){
	var checked_1="false";
	var checked_2="false";
	if(document.getElementById("menu_securitySign2").hasAttribute("checked")){
		checked_2=document.getElementById("menu_securitySign2").getAttribute("checked");
	}
	
	if(checked_2 == checked_1){
		document.getElementById("idItemSecureHeaders_1").setAttribute("checked",checked_1);
		document.getElementById("idItemSecureHeaders_2").setAttribute("checked",checked_1);
		UpdateSecureRequest();
	}
}

function UpdateSecureRequest(){

	var checked="false";
	if(document.getElementById("idItemSecureHeaders_1").hasAttribute("checked")){
		checked=document.getElementById("idItemSecureHeaders_1").getAttribute("checked");
	}
	if(checked=="true"){
		document.getElementById("menu_securitySign1").setAttribute("checked","true");
		document.getElementById("menu_securitySign2").setAttribute("checked","true");	
		if(gSMFields && !gSMFields.signMessage)
		{
			setNextCommand('signMessage');
		}
		//gCurrentIdentity.setBoolAttribute(SECURE_HEADERS_ATTRIBUTE_CHECK,true);
	}
	else{
		document.getElementById("menu_securitySign1").setAttribute("checked","false");
		document.getElementById("menu_securitySign2").setAttribute("checked","false");
		//gCurrentIdentity.setBoolAttribute(SECURE_HEADERS_ATTRIBUTE_CHECK,false);
	}
}

/*
 * 
 */
var secureheaders_OnSend = {
	_ArrayheadersToSign : null,
	observe: function(subject, topic, data) {
		//is HeaderSecure requested
		var elt = document.getElementById("idItemSecureHeaders_1");
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
				gConsole.logStringMessage("[ _secure_headers - AddSecureHeadersArray] : gMsgCompose.compFields.securityInfo not found");
				return;
			}
			//clear secure headers
			msgSMimeCompFields.clearSecureHeaders();

			// get preferences informations to sign
			var arrayHeaderToSign = ReadXmlHeadersToSign();
			
			//always apply relaxed canon algorithm 
			msgSMimeCompFields.canonAlgorithme = 1;
			
			if(arrayHeaderToSign){
				var secHeader = null;
				
				for(i=0;i<arrayHeaderToSign.length;++i){ 
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
		}catch(e){
			gConsole.logStringMessage("[ _secure_headers - AddSecureHeadersArray] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
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
			gConsole.logStringMessage("[_secure_headers - ReadXmlHeadersToSign ] no xml files define \n ");
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
			gConsole.logStringMessage("[_secure_headers - ReadXmlHeadersToSign] Error loading schema file : " + completePath);
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
			// get headers to sign
			var childNodes = compatibleTag[0].childNodes;
			for(var j=0; j <childNodes.length; ++j ){
					var header_name = ""; 
					var header_status = 0; 
					
					//var header_encrypted = -1;
					if(childNodes[j].localName == "header"){
						header_name = childNodes[j].getAttribute("name");
						if(childNodes[j].hasAttribute("status"))
							header_status = parseInt(childNodes[j].getAttribute("status"));
						
						/*if(childNodes[j].hasAttribute("encrypted"))
							header_encrypted = parseInt(childNodes[j].getAttribute("encrypted"));*/
						// load values to array
						tabSecureHeaders.push(new xSecureHeader(header_name, header_status));
					}
				}
			return tabSecureHeaders;
		}else{
			gConsole.logStringMessage("[_secure_headers - ReadXmlHeadersToSign] no headers tag in file " + completePath);
		}
		} catch (e) {
			gConsole.logStringMessage("[_secure_headers - ReadXmlHeadersToSign ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
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

function setNoSecureHeaderUI()
{
	document.getElementById("idItemSecureHeaders_2").removeAttribute("checked");
	document.getElementById("idItemSecureHeaders_1").removeAttribute("checked");
	//gCurrentIdentity.setBoolAttribute(SECURE_HEADERS_ATTRIBUTE_CHECK,false);
}

function setSecureHeaderUI()
{
	document.getElementById("idItemSecureHeaders_1").setAttribute("checked","true");
	document.getElementById("idItemSecureHeaders_2").setAttribute("checked","true");
	//gCurrentIdentity.setBoolAttribute(SECURE_HEADERS_ATTRIBUTE_CHECK,true);
}
