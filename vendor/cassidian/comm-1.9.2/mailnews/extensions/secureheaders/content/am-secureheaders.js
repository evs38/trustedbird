/*
 * ***** BEGIN LICENSE BLOCK *****
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

var gJSLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].createInstance(Components.interfaces.mozIJSSubScriptLoader);
var gConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);

var gCurrentIdentity=null;

const nsIFilePicker = Components.interfaces.nsIFilePicker;
const PREF_SECUREHEADERS_FOLDER_DATAS="secureheaders.folderdata";
//const DEFAULT_SECUREHEADERS_XML_DIR = "\\secureHeader\\";
//const DEFAULT_SECUREHEADERS_XML_RELATIVE_DIR = "secureHeader/";
const DEFAULT_SECUREHEADERS_XML_DIR = "secureHeaders"
const DEFAULT_SECUREHEADERS_XML_FILE = "secureHeadersDefault.xml"
const PREF_SECUREHEADERS_SMIMEINFO = "secureheaders.smimeinfomsg";

function onPreInit(account, accountValues){
	gCurrentIdentity = account.defaultIdentity;
}


function onInit(aPageId, aServerId){
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
	
	var currentFolderTextBox = document.getElementById("secureheaders.xmlPath");
	if(currentFolderTextBox.value==""){	 	
		var pref_data = gCurrentIdentity.getCharAttribute(PREF_SECUREHEADERS_FOLDER_DATAS)	 	;
		if(pref_data){	 		
			currentFolderTextBox.value = pref_data;
		}else{
			//
			var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
			file.append(DEFAULT_SECUREHEADERS_XML_DIR);
			file.append(DEFAULT_SECUREHEADERS_XML_FILE);
			//
			var currentFolderTextBox = document.getElementById("secureheaders.xmlPath");
			currentFolderTextBox.value = file.path;
			//currentFolderTextBox.value = file.path + DEFAULT_SECUREHEADERS_XML_DIR+DEFAULT_SECUREHEADERS_XML_FILE;
			gCurrentIdentity.setCharAttribute(PREF_SECUREHEADERS_FOLDER_DATAS,currentFolderTextBox.value);
	 	}
  } 
 
	if(gCurrentIdentity.getBoolAttribute(PREF_SECUREHEADERS_SMIMEINFO)){
		document.getElementById("smimeinfomsgcheck").setAttribute("checked", "true");
	}else{
		document.getElementById("smimeinfomsgcheck").setAttribute("checked", "false");
	}
}

function onSave(){
	// save secure headers selection to preferences
	 var currentFolderTextBox = document.getElementById("secureheaders.xmlPath");	
	gCurrentIdentity.setCharAttribute(PREF_SECUREHEADERS_FOLDER_DATAS,currentFolderTextBox.value);
	if(document.getElementById("smimeinfomsgcheck").getAttribute("checked") == "true"){	
		gCurrentIdentity.setBoolAttribute(PREF_SECUREHEADERS_SMIMEINFO,true);		
	}else{		
		gCurrentIdentity.setBoolAttribute(PREF_SECUREHEADERS_SMIMEINFO,false);
	}
}


function BrowseForXmlFile(){
  var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
  var currentFolder = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
  var currentFolderTextBox = document.getElementById("secureheaders.xmlPath");

	if(currentFolderTextBox.value!=""){
		currentFolder.initWithPath(currentFolderTextBox.value);
	}else{
		// var extensionPath = getFilePathInProfile(DEFAULT_SECUREHEADERS_XML_RELATIVE_DIR);
		var dirProfile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
		dirProfile.append(DEFAULT_SECUREHEADERS_XML_DIR);
		currentFolder.initWithPath(dirProfile.path);
	}
  //fp.init(window, document.getElementById("browseForXmlFolder").getAttribute("filepickertitle"), nsIFilePicker.modeOpen);
  //fp.appendFilters(nsIFilePicker.filterXML);
  fp.init(window, document.getElementById("browseForXmlFolder").getAttribute("filepickertitle"), nsIFilePicker.modeOpen);
  fp.displayDirectory = currentFolder;

  var ret = fp.show();
  if (ret == nsIFilePicker.returnOK) 
  {
  	// convert the nsILocalFile into a nsIFileSpec 
  	currentFolderTextBox.value = fp.file.path;
  }
}
