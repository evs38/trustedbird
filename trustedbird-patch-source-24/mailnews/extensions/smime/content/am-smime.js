/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

Components.utils.import("resource://gre/modules/Services.jsm");

const nsIX509CertDB = Components.interfaces.nsIX509CertDB;
const nsX509CertDBContractID = "@mozilla.org/security/x509certdb;1";
const nsIX509Cert = Components.interfaces.nsIX509Cert;

const email_recipient_cert_usage = 5;
const email_signing_cert_usage = 4;

var gIdentity;
var gPref = null;
var gEncryptionCertName = null;
var gHiddenEncryptionPolicy = null;
var gEncryptionChoices = null;
var gSignCertName  = null;
var gSignMessages  = null;
var gEncryptAlways = null;
var gNeverEncrypt = null;
var gSMIMEReceiptRequest = null;
var gSMIMEReceiptSendPolicy = null;
var gBundle = null;
var gBrandBundle;
var gSmimePrefbranch;
var gEncryptionChoicesLocked;
var gSigningChoicesLocked;
const kEncryptionCertPref = "identity.encryption_cert_name";
const kSigningCertPref = "identity.signing_cert_name";

function onInit() 
{
  smimeInitializeFields();
  secureHeadersInitialize();
}

function smimeInitializeFields()
{
  // initialize all of our elements based on the current identity values....
  gEncryptionCertName = document.getElementById(kEncryptionCertPref);
  gHiddenEncryptionPolicy = document.getElementById("identity.encryptionpolicy");
  gEncryptionChoices = document.getElementById("encryptionChoices");
  gSignCertName       = document.getElementById(kSigningCertPref);
  gSignMessages       = document.getElementById("identity.sign_mail");
  gEncryptAlways      = document.getElementById("encrypt_mail_always");
  gNeverEncrypt       = document.getElementById("encrypt_mail_never");
  gSMIMEReceiptRequest    = document.getElementById("identity.smime_receipt_request");
  gSMIMEReceiptSendPolicy = document.getElementById("identity.smime_receipt_send_policy");
  gBundle             = document.getElementById("bundle_smime");
  gBrandBundle        = document.getElementById("bundle_brand");

  gEncryptionChoicesLocked = false;
  gSigningChoicesLocked = false;

  if (!gIdentity) {
    // The user is going to create a new identity.
    // Set everything to default values.
    // Do not take over the values from gAccount.defaultIdentity
    // as the new identity is going to have a different mail address.

    gEncryptionCertName.value = "";
    gSignCertName.value = "";

    gEncryptAlways.setAttribute("disabled", true);
    gNeverEncrypt.setAttribute("disabled", true);
    gSignMessages.setAttribute("disabled", true);
    gSMIMEReceiptRequest.setAttribute("disabled", true);
    gSMIMEReceiptSendPolicy.setAttribute("disabled", true);

    gSignMessages.checked = false;
    gEncryptionChoices.value = 0;

    gSMIMEReceiptRequest.checked = false;
    gSMIMEReceiptSendPolicy.value = 0;
  }
  else {
    gEncryptionCertName.value = gIdentity.getUnicharAttribute("encryption_cert_name");

    gEncryptionChoices.value = gIdentity.getIntAttribute("encryptionpolicy");

    if (!gEncryptionCertName.value) {
      gEncryptAlways.setAttribute("disabled", true);
      gNeverEncrypt.setAttribute("disabled", true);
    }
    else {
      enableEncryptionControls(true);
    }

    gSignCertName.value = gIdentity.getUnicharAttribute("signing_cert_name");
    gSignMessages.checked = gIdentity.getBoolAttribute("sign_mail");
    gSMIMEReceiptRequest.checked = gIdentity.getBoolAttribute("smime_receipt_request");
    gSMIMEReceiptSendPolicy.value = gIdentity.getIntAttribute("smime_receipt_send_policy");
    if (!gSignCertName.value)
    {
      gSignMessages.setAttribute("disabled", true);
      gSMIMEReceiptRequest.setAttribute("disabled", true);
      gSMIMEReceiptSendPolicy.setAttribute("disabled", true);
    }
    else {
      enableSigningControls(true);
    }
  }

  // Always start with enabling signing and encryption cert select buttons.
  // This will keep the visibility of buttons in a sane state as user
  // jumps from security panel of one account to another.
  enableCertSelectButtons();

  // Disable all locked elements on the panel
  if (gIdentity)
    onLockPreference();
}

function onPreInit(account, accountValues)
{
  gIdentity = account.defaultIdentity;
}

function onSave()
{
  smimeSave();
  secureHeadersSave();
}

function smimeSave()
{
  // find out which radio for the encryption radio group is selected and set that on our hidden encryptionChoice pref....
  var newValue = gEncryptionChoices.value;
  gHiddenEncryptionPolicy.setAttribute('value', newValue);
  gIdentity.setIntAttribute("encryptionpolicy", newValue);
  gIdentity.setUnicharAttribute("encryption_cert_name", gEncryptionCertName.value);

  gIdentity.setBoolAttribute("sign_mail", gSignMessages.checked);
  gIdentity.setUnicharAttribute("signing_cert_name", gSignCertName.value);

  gIdentity.setBoolAttribute("smime_receipt_request", gSMIMEReceiptRequest.checked);
  gIdentity.setIntAttribute("smime_receipt_send_policy", gSMIMEReceiptSendPolicy.value);
}

function smimeOnAcceptEditor()
{
  try {
    if (!onOk())
      return false;
  }
  catch (ex) {}

  smimeSave();

  return true;
}

function onLockPreference()
{
  var initPrefString = "mail.identity";
  var finalPrefString;

  var allPrefElements = [
    { prefstring:"signingCertSelectButton", id:"signingCertSelectButton"},
    { prefstring:"encryptionCertSelectButton", id:"encryptionCertSelectButton"},
    { prefstring:"sign_mail", id:"identity.sign_mail"},
    { prefstring:"encryptionpolicy", id:"encryptionChoices"}
  ];

  finalPrefString = initPrefString + "." + gIdentity.key + ".";
  gSmimePrefbranch = Services.prefs.getBranch(finalPrefString);

  disableIfLocked( allPrefElements );
}


// Does the work of disabling an element given the array which contains xul id/prefstring pairs.
// Also saves the id/locked state in an array so that other areas of the code can avoid
// stomping on the disabled state indiscriminately.
function disableIfLocked( prefstrArray )
{
  var i;
  for (i=0; i<prefstrArray.length; i++) {
    var id = prefstrArray[i].id;
    var element = document.getElementById(id);
    if (gSmimePrefbranch.prefIsLocked(prefstrArray[i].prefstring)) {
      // If encryption choices radio group is locked, make sure the individual 
      // choices in the group are locked. Set a global (gEncryptionChoicesLocked) 
      // indicating the status so that locking can be maintained further.
      if (id == "encryptionChoices") {
        document.getElementById("encrypt_mail_never").setAttribute("disabled", "true");
        document.getElementById("encrypt_mail_always").setAttribute("disabled", "true");
        gEncryptionChoicesLocked = true;
      }
      // If option to sign mail is locked (with true/false set in config file), disable
      // the corresponding checkbox and set a global (gSigningChoicesLocked) in order to
      // honor the locking as user changes other elements on the panel. 
      if (id == "identity.sign_mail") {
        document.getElementById("identity.sign_mail").setAttribute("disabled", "true");
        gSigningChoicesLocked = true;
      }
      else {
        element.setAttribute("disabled", "true");
        if (id == "signingCertSelectButton") {
          document.getElementById("signingCertClearButton").setAttribute("disabled", "true");
        }
        else if (id == "encryptionCertSelectButton") {
          document.getElementById("encryptionCertClearButton").setAttribute("disabled", "true");
        }
      }
    }
  }
}

function alertUser(message)
{
  Services.prompt.alert(window,
                        gBrandBundle.getString("brandShortName"),
                        message);
}

function askUser(message)
{
  let button = Services.prompt.confirmEx(
    window,
    gBrandBundle.getString("brandShortName"),
    message,
    Services.prompt.STD_YES_NO_BUTTONS,
    null,
    null,
    null,
    null,
    {});
  // confirmEx returns button index:
  return (button == 0);
}

function checkOtherCert(nickname, pref, usage, msgNeedCertWantSame, msgWantSame, msgNeedCertWantToSelect, enabler)
{
  var otherCertInfo = document.getElementById(pref);
  if (!otherCertInfo)
    return;

  if (otherCertInfo.value == nickname)
    // all is fine, same cert is now selected for both purposes
    return;

  var certdb = Components.classes[nsX509CertDBContractID].getService(nsIX509CertDB);
  if (!certdb)
    return;
  
  if (email_recipient_cert_usage == usage) {
    matchingOtherCert = certdb.findEmailEncryptionCert(nickname);
  }
  else if (email_signing_cert_usage == usage) {
    matchingOtherCert = certdb.findEmailSigningCert(nickname);
  }
  else
    return;

  var userWantsSameCert = false;

  if (!otherCertInfo.value.length) {
    if (matchingOtherCert) {
      userWantsSameCert = askUser(gBundle.getString(msgNeedCertWantSame));
    }
    else {
      if (askUser(gBundle.getString(msgNeedCertWantToSelect))) {
        smimeSelectCert(pref);
      }
    }
  }
  else {
    if (matchingOtherCert) {
      userWantsSameCert = askUser(gBundle.getString(msgWantSame));
    }
  }

  if (userWantsSameCert) {
    otherCertInfo.value = nickname;
    enabler(true);
  }
}

function smimeSelectCert(smime_cert)
{
  var certInfo = document.getElementById(smime_cert);
  if (!certInfo)
    return;

  var picker = Components.classes["@mozilla.org/user_cert_picker;1"]
               .createInstance(Components.interfaces.nsIUserCertPicker);
  var canceled = new Object;
  var x509cert = 0;
  var certUsage;
  var selectEncryptionCert;

  if (smime_cert == kEncryptionCertPref) {
    selectEncryptionCert = true;
    certUsage = email_recipient_cert_usage;
  } else if (smime_cert == kSigningCertPref) {
    selectEncryptionCert = false;
    certUsage = email_signing_cert_usage;
  }

  try {
    x509cert = picker.pickByUsage(window,
      certInfo.value,
      certUsage, // this is from enum SECCertUsage
      false, false, canceled);
  } catch(e) {
    canceled.value = false;
    x509cert = null;
  }

  if (!canceled.value) {
    if (!x509cert) {
      var errorString;
      if (selectEncryptionCert) {
        errorString = "NoEncryptionCert";
      }
      else {
        errorString = "NoSigningCert";
      }
      alertUser(gBundle.getString(errorString));
    }
    else {
      certInfo.removeAttribute("disabled");
      certInfo.value = x509cert.nickname;

      if (selectEncryptionCert) {
        enableEncryptionControls(true);

        checkOtherCert(certInfo.value,
          kSigningCertPref, email_signing_cert_usage, 
          "signing_needCertWantSame", 
          "signing_wantSame", 
          "signing_needCertWantToSelect",
          enableSigningControls);
      } else {
        enableSigningControls(true);

        checkOtherCert(certInfo.value,
          kEncryptionCertPref, email_recipient_cert_usage, 
          "encryption_needCertWantSame", 
          "encryption_wantSame", 
          "encryption_needCertWantToSelect",
          enableEncryptionControls);
      }
    }
  }

  enableCertSelectButtons();
}

function enableEncryptionControls(do_enable)
{
  if (gEncryptionChoicesLocked)
    return;

  if (do_enable) {
    gEncryptAlways.removeAttribute("disabled");
    gNeverEncrypt.removeAttribute("disabled");
  }
  else {
    gEncryptAlways.setAttribute("disabled", "true");
    gNeverEncrypt.setAttribute("disabled", "true");
    gEncryptionChoices.value = 0;
  }
}

function enableSigningControls(do_enable)
{
  if (gSigningChoicesLocked)
    return;

  if (do_enable) {
    gSignMessages.removeAttribute("disabled");

    gSMIMEReceiptRequest.removeAttribute("disabled");
    gSMIMEReceiptSendPolicy.removeAttribute("disabled");
  }
  else {
    gSignMessages.setAttribute("disabled", "true");
    gSignMessages.checked = false;

    gSMIMEReceiptRequest.setAttribute("disabled", "true");
    gSMIMEReceiptRequest.checked = false;
    gSMIMEReceiptSendPolicy.setAttribute("disabled", "true");
    gSMIMEReceiptSendPolicy.value = 0;
  }
}

function enableCertSelectButtons()
{
  document.getElementById("signingCertSelectButton").removeAttribute("disabled");

  if (document.getElementById('identity.signing_cert_name').value.length)
    document.getElementById("signingCertClearButton").removeAttribute("disabled");
  else
    document.getElementById("signingCertClearButton").setAttribute("disabled", "true");

  document.getElementById("encryptionCertSelectButton").removeAttribute("disabled");

  if (document.getElementById('identity.encryption_cert_name').value.length)
    document.getElementById("encryptionCertClearButton").removeAttribute("disabled");
  else
    document.getElementById("encryptionCertClearButton").setAttribute("disabled", "true");
}

function smimeClearCert(smime_cert)
{
  var certInfo = document.getElementById(smime_cert);
  if (!certInfo)
    return;

  certInfo.setAttribute("disabled", "true");
  certInfo.value = "";

  if (smime_cert == kEncryptionCertPref) {
    enableEncryptionControls(false);
  } else if (smime_cert == kSigningCertPref) {
    enableSigningControls(false);
  }

  enableCertSelectButtons();
}

function openCertManager()
{
  // Check for an existing certManager window and focus it; it's not
  // application modal.
  let lastCertManager = Services.wm.getMostRecentWindow("mozilla:certmanager");
  if (lastCertManager)
    lastCertManager.focus();
  else
    window.openDialog("chrome://pippki/content/certManager.xul", "",
                      "centerscreen,resizable=yes,dialog=no");
}

function openDeviceManager()
{
  // Check for an existing deviceManager window and focus it; it's not
  // application modal.
  let lastCertManager = Services.wm.getMostRecentWindow("mozilla:devicemanager");
  if (lastCertManager)
    lastCertManager.focus();
  else
    window.openDialog("chrome://pippki/content/device_manager.xul", "",
                      "centerscreen,resizable=yes,dialog=no");
}

function smimeOnLoadEditor()
{
  smimeInitializeFields();

  document.documentElement.setAttribute("ondialogaccept",
                                        "return smimeOnAcceptEditor();");
}
/**
 * OnInit() : Secureheaders process
 */
const PREF_SECUREHEADERS_FOLDER_DATAS = "secureheaders.folderdata";
const DEFAULT_SECUREHEADERS_XML_DIR = "secureHeaders"
const PREF_SECUREHEADERS_SMIMEINFO = "secureheaders.smimeinfomsg";
const DEFAULT_SECUREHEADERS_XML_FILE = "secureHeadersDefault.xml";
function secureHeadersInitialize() {	
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
		var pref_data = gIdentity.getCharAttribute(PREF_SECUREHEADERS_FOLDER_DATAS)	 	;
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
			gIdentity.setCharAttribute(PREF_SECUREHEADERS_FOLDER_DATAS,currentFolderTextBox.value);
	 	}
  } 
 
	if(gIdentity.getBoolAttribute(PREF_SECUREHEADERS_SMIMEINFO)){
		document.getElementById("smimeinfomsgcheck").setAttribute("checked", "true");
	}else{
		document.getElementById("smimeinfomsgcheck").setAttribute("checked", "false");
	}	
}
function secureHeadersSave() {
	// save secure headers selection to preferences
	 var currentFolderTextBox = document.getElementById("secureheaders.xmlPath");	
	gIdentity.setCharAttribute(PREF_SECUREHEADERS_FOLDER_DATAS,currentFolderTextBox.value);
	if(document.getElementById("smimeinfomsgcheck").getAttribute("checked") == "true"){	
		gIdentity.setBoolAttribute(PREF_SECUREHEADERS_SMIMEINFO,true);		
	}else{		
		gIdentity.setBoolAttribute(PREF_SECUREHEADERS_SMIMEINFO,false);
	}
}
/**
 * Secure-headers : browser to select file
 */
function BrowseForXmlFile() {
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
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
