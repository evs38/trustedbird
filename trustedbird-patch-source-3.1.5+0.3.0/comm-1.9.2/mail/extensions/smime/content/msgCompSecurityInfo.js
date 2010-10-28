/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla Communicator.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2002
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Eric Ballet Baz / BT Global Services / Etat francais - Ministere de la Defense
 *   Raphael Fairise / BT Global Services / Etat francais - Ministere de la Defense
 *   Copyright (c) 2010 CASSIDIAN - All rights reserved
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var gListBox;
var gViewButton;
var gBundle;

var gEmailAddresses;
var gCertStatusSummaries;
var gCertIssuedInfos;
var gCertExpiresInfos;
var gCerts;
var gCount;

var gSMimeContractID = "@mozilla.org/messenger-smime/smimejshelper;1";
var gISMimeJSHelper = Components.interfaces.nsISMimeJSHelper;
var gIX509Cert = Components.interfaces.nsIX509Cert;
const nsICertificateDialogs = Components.interfaces.nsICertificateDialogs;
const nsCertificateDialogs = "@mozilla.org/nsCertificateDialogs;1"

const PREF_SECURE_HEADERS_FOLDER_DATAS="secureheaders.folderdata";
const SECURE_HEADER_PROPERTIES_URL = "chrome://messenger/locale/secureheaders.properties";
var gConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);


function getStatusExplanation(value)
{
  switch (value)
  {
    case gIX509Cert.VERIFIED_OK:
      return gBundle.getString("StatusValid");

    case gIX509Cert.NOT_VERIFIED_UNKNOWN:
    case gIX509Cert.INVALID_CA:
    case gIX509Cert.USAGE_NOT_ALLOWED:
      return gBundle.getString("StatusInvalid");

    case gIX509Cert.CERT_REVOKED:
      return gBundle.getString("StatusRevoked");

    case gIX509Cert.CERT_EXPIRED:
      return gBundle.getString("StatusExpired");

    case gIX509Cert.CERT_NOT_TRUSTED:
    case gIX509Cert.ISSUER_NOT_TRUSTED:
    case gIX509Cert.ISSUER_UNKNOWN:
      return gBundle.getString("StatusUntrusted");
  }

  return "";
}

function onLoad()
{
  var params = window.arguments[0];
  if (!params)
    return;

  var helper = Components.classes[gSMimeContractID].createInstance(gISMimeJSHelper);

  if (!helper)
    return;

  gListBox = document.getElementById("infolist");
  gViewButton = document.getElementById("viewCertButton");
  gBundle = document.getElementById("bundle_smime_comp_info");

  gEmailAddresses = new Object();
  gCertStatusSummaries = new Object();
  gCertIssuedInfos = new Object();
  gCertExpiresInfos = new Object();
  gCerts = new Object();
  gCount = new Object();
  var canEncrypt = new Object();

  var allow_ldap_cert_fetching = false;

  try {  
    if (params.compFields.securityInfo.requireEncryptMessage) {
      allow_ldap_cert_fetching = true;
    }
  }
  catch (e)
  {
  }

  while (true)
  {
    try
    {
      helper.getRecipientCertsInfo(
        params.compFields,
        gCount,
        gEmailAddresses,
        gCertStatusSummaries,
        gCertIssuedInfos,
        gCertExpiresInfos,
        gCerts,
        canEncrypt);
    }
    catch (e)
    {
      dump(e);
      return;
    }

    if (!allow_ldap_cert_fetching)
      break;

    allow_ldap_cert_fetching = false;

    var missing = new Array();

    for (var j = gCount.value - 1; j >= 0; --j)
    {
      if (!gCerts.value[j])
      {
        missing[missing.length] = gEmailAddresses.value[j];
      }
    }

    if (missing.length > 0)
    {
      var prefService = 
        Components.classes["@mozilla.org/preferences-service;1"]
          .getService(Components.interfaces.nsIPrefService);
      var sPrefs = prefService.getBranch(null);

      var autocompleteLdap = false;
      autocompleteLdap = sPrefs.getBoolPref("ldap_2.autoComplete.useDirectory");

      if (autocompleteLdap)
      {
        var autocompleteDirectory = null;
        autocompleteDirectory = sPrefs.getCharPref(
          "ldap_2.autoComplete.directoryServer");

        if(params.currentIdentity.overrideGlobalPref) {
          autocompleteDirectory = params.currentIdentity.directoryServer;
        }

        if (autocompleteDirectory)
        {
          window.openDialog('chrome://messenger-smime/content/certFetchingStatus.xul',
            '',
            'chrome,resizable=1,modal=1,dialog=1', 
            autocompleteDirectory,
            missing
          );
        }
      }
    }
  }

  if (gBundle)
  {
    var yes_string = gBundle.getString("StatusYes");
    var no_string = gBundle.getString("StatusNo");
    var not_possible_string = gBundle.getString("StatusNotPossible");

    var signed_element = document.getElementById("signed");
    var encrypted_element = document.getElementById("encrypted");
    var signedReceiptRequest_element = document.getElementById("signedReceiptRequest");
    var tripleWrapped_element = document.getElementById("tripleWrapped");
    var securityLabel_element = document.getElementById("securityLabel");

    if (params.smFields.requireEncryptMessage)
    {
      if (params.isEncryptionCertAvailable && canEncrypt.value)
      {
        encrypted_element.value = yes_string;
      }
      else
      {
        encrypted_element.value = not_possible_string;
      }
    }
    else
    {
      encrypted_element.value = no_string;
    }

    if (params.smFields.signMessage)
    {
      if (params.isSigningCertAvailable)
      {
        signed_element.value = yes_string;
      }
      else
      {
        signed_element.value = not_possible_string;
      }
    }
    else
    {
      signed_element.value = no_string;
    }

    if (params.smFields.signedReceiptRequest)
    {
      if (params.isSigningCertAvailable)
        signedReceiptRequest_element.value = yes_string;
      else
        signedReceiptRequest_element.value = not_possible_string;
    }
    else
      signedReceiptRequest_element.value = no_string;

    if (params.smFields.tripleWrapMessage)
    {
      if (params.isEncryptionCertAvailable && canEncrypt.value && params.isSigningCertAvailable)
      {
        tripleWrapped_element.value = yes_string;
      }
      else
      {
        tripleWrapped_element.value = not_possible_string;
      }
    }
    else
    {
      tripleWrapped_element.value = no_string;
    }
    
    /* Security Label */
    if (params.smFields.securityPolicyIdentifier != "") {
      if (params.smFields.securityClassification != -1) {
    	securityLabel_element.value = securityLabelGetSecurityClassificationName(params.smFields.securityPolicyIdentifier, params.smFields.securityClassification)
    								+ " [" + securityLabelGetSecurityPolicyIdentifierName(params.smFields.securityPolicyIdentifier) + "]";
      } else {
        securityLabel_element.value = "[" + securityLabelGetSecurityPolicyIdentifierName(params.smFields.securityPolicyIdentifier) + "]";
      }
    } else {
      securityLabel_element.value = no_string;
    }
  }

  var imax = gCount.value;
  
  for (var i = 0; i < imax; ++i)
  {
    var listitem  = document.createElement("listitem");

    listitem.appendChild(createCell(gEmailAddresses.value[i]));
    
    if (!gCerts.value[i])
    {
      listitem.appendChild(createCell(gBundle.getString("StatusNotFound")));
    }
    else
    {
      listitem.appendChild(createCell(getStatusExplanation(gCertStatusSummaries.value[i])));
      listitem.appendChild(createCell(gCertIssuedInfos.value[i]));
      listitem.appendChild(createCell(gCertExpiresInfos.value[i]));
    }

    gListBox.appendChild(listitem);
  }

  //Secure Headers
  var gSecureBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
  var secureBundle = gSecureBundle.createBundle(SECURE_HEADER_PROPERTIES_URL);
  var sLabel;
  if(params.isSecureHeaderAvailable){
	// get international label for new line
	sLabel = secureBundle.GetStringFromName("yes.label");
	document.getElementById("headerSecured").setAttribute("value",sLabel);
	ReadSecureHeaders(params);
  }
  else{
	sLabel = secureBundle.GetStringFromName("no.label");
	document.getElementById("headerSecured").setAttribute("value",sLabel);
  }
}

function onSelectionChange(event)
{
  if (gListBox.selectedItems.length <= 0)
  {
    gViewButton.setAttribute("disabled", "true");
  }
  else
  {
    gViewButton.removeAttribute("disabled");
  }
}

function viewCertHelper(parent, cert) {
  var cd = Components.classes[nsCertificateDialogs].getService(nsICertificateDialogs);
  cd.viewCert(parent, cert);
}

function viewSelectedCert()
{
  if (gListBox.selectedItems.length > 0)
  {
    var selected = gListBox.selectedIndex;
    var cert = gCerts.value[selected];
    if (cert)
    {
      viewCertHelper(window, cert);
    }
  }
}

function doHelpButton()
{
  openHelp('compose_security');
}

function createCell(label)
{
  var cell = document.createElement("listcell");
  cell.setAttribute("label", label)
  return cell;
}

function ReadSecureHeaders(params){


		// get international label for new line
		var gSecureBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
		var secureBundle = gSecureBundle.createBundle(SECURE_HEADER_PROPERTIES_URL);

		var arrayHeaderSecure=ReadXmlHeadersToSecure(params);
		if(arrayHeaderSecure && params.isSecureHeaderAvailable)
		{
			document.getElementById("secureheaderbox").collapsed = false;
			var treechild = document.getElementById("secHeader_treechild_id");
			for(var i=0;i<arrayHeaderSecure.length;++i)
			{
					var label;
					//read the current header property
					var headerName = arrayHeaderSecure[i]._name;
					var headerStatus = arrayHeaderSecure[i]._status;
					var headerEncrypted = arrayHeaderSecure[i]._encrypted;

					//create each element for the tree
					var treeitem=document.createElement("treeitem");
					var treerow=document.createElement("treerow");
					var namecell=document.createElement("treecell");
					var statuscell=document.createElement("treecell");
					var encryptedcell=document.createElement("treecell");
					
					//set the header name
					namecell.setAttribute("label",headerName);
					
					//set the header status
					switch(headerStatus)
					{
						case "-1":
							label=secureBundle.GetStringFromName("notdefine.label");
						break;
						case "0" :
							label=secureBundle.GetStringFromName("headerstatus.duplicated.label");
						break;
						case "1" :
							label=secureBundle.GetStringFromName("headerstatus.deleted.label");
						break;
						case "2":
							label=secureBundle.GetStringFromName("headerstatus.modified.label");
						break;
						default:
							label="ERROR";
						break;
					}
					statuscell.setAttribute("label",label);
					
					//set the header encrypted
					switch(headerEncrypted)
					{
						case "-1":
							label=secureBundle.GetStringFromName("notdefine.label");
						break;
						case "0" :
							label=secureBundle.GetStringFromName("no.label");
						break;
						case "1" :
							label=secureBundle.GetStringFromName("yes.label");
						break;
						default:
							label="ERROR";
						break;
					}
					encryptedcell.setAttribute("label",label);

					//append all element in the tree
					treerow.appendChild(namecell);
					treerow.appendChild(statuscell);
					treerow.appendChild(encryptedcell);
					treeitem.appendChild(treerow);
					treechild.appendChild(treeitem);
			}
		}

}


/*
 * 
 */
var DEFAULT_SECUREHEADERS_XML_DIR = "secureHeaders"
var DEFAULT_SECUREHEADERS_XML_FILE = "secureHeadersDefault.xml"
function ReadXmlHeadersToSecure(params){
	try{  	 	 
  		// get xml file path
  		if(!params.currentIdentity){ 
  			gConsole.logStringMessage("[msgCompSecurityInfo.js - ReadXmlHeadersToSecure ] no xml files define \n ");
  			return;
  		}
  		
		var pref_data = params.currentIdentity.getCharAttribute(PREF_SECURE_HEADERS_FOLDER_DATAS);
	 	var file = null;
	 	
		if(!pref_data){					
			file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile); // get profile folder
			file.append(DEFAULT_SECUREHEADERS_XML_DIR);
			file.append(DEFAULT_SECUREHEADERS_XML_FILE);					
		}else{
	 		file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath( pref_data );	
		}	
			
		if(!file.exists()){
			gConsole.logStringMessage("[msgCompSecurityInfo.js - ReadXmlHeadersToSecure] Error loading schema file : " + pref_data);
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
			var childNodes = compatibleTag[0].childNodes;
			for(var j=0; j <childNodes.length; ++j ){
					var header_name = ""; 
					var header_status = "-1"; 
					var header_encrypted = "-1"; 											
					if(childNodes[j].localName == "header"){
						header_name = childNodes[j].getAttribute("name");
						if(childNodes[j].hasAttribute("status"))
						{
							header_status = childNodes[j].getAttribute("status");
						}
						if(childNodes[j].hasAttribute("encrypted"))
							header_encrypted = parseInt(childNodes[j].getAttribute("encrypted"));
						// load values to array
						tabSecureHeaders.push(new xSecureHeader(header_name, header_status,header_encrypted));									
					}				
				}	
			return tabSecureHeaders;				
		}else{
			gConsole.logStringMessage("[msgCompSecurityInfo.js - ReadXmlHeadersToSecure] no headers tag in file " + pref_data);
		}	
		} catch (e) {
			gConsole.logStringMessage("[msgCompSecurityInfo.js - ReadXmlHeadersToSecure ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
		}
}

/*
 * 
 */
function xSecureHeader(name,status,encrypted){
	if(name)
		this._name = name;
	if(status)
		this._status = status;
	if(encrypted)
		this._encrypted = encrypted;
}
