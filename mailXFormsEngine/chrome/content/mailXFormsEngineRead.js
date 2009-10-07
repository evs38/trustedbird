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
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * BT Global Services / Etat francais Ministere de la Defense.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
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

/**
 * Read mail headers in a received message and display them in a form
 */

var jsLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
jsLoader.loadSubScript("chrome://mailXFormsEngine/content/mailXFormsEngineCommon.js");

var mailXFormsEngineReadStringBundle = null;

var mailXFormsEngineMimeHeaders = null;
var mailXFormsEngineReadFrameBoxCollapsed = false;
var mailXFormsEngineReadCurrentFormNb = -1;


/* Register a listener to the event dispatched when the message pane is loaded */
window.addEventListener("messagepane-loaded", mailXFormsEngineReadInit, true);


/**
 * Override ClearMessagePane function in order to hide XForms panels when browsing in mail folders
 */
var ClearMessagePaneOriginal = ClearMessagePane;
var ClearMessagePane = function() {
  /* Hide XForms panels */
  document.getElementById("mailXFormsEngineReadTitleBox").setAttribute("collapsed", true);
  document.getElementById("mailXFormsEngineReadFrameBox").setAttribute("collapsed", true);

  /* Call original function */
  ClearMessagePaneOriginal.apply(this, arguments);
}


/**
 * Initialization
 */
function mailXFormsEngineReadInit() {
  /* Get string bundle */
  mailXFormsEngineReadStringBundle = document.getElementById("mailXFormsEngineReadStringBundle");

  /* Read form list from preferences */
  mailXFormsEngineCommonLoadFormList();

  /* Read frame collapsed status from preferences */
  var prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).getBranch(mailXFormsEnginePrefRoot);
  try {
    mailXFormsEngineReadFrameBoxCollapsed = prefBranch.getBoolPref("readFrameBoxCollapsed");
  } catch (e) {}

  /* Register a listener to the event dispatched when form iframe is loaded */
  document.getElementById("mailXFormsEngineReadFrame").addEventListener("load", mailXFormsEngineReadFillForm, true);

  /* Register a listener in order to toggle form frame visibility */
  document.getElementById("mailXFormsEngineReadTitleBox").addEventListener("click", mailXFormsEngineReadFrameToggleCollapse, true);

  /* Register a listener to the event dispatched when a message is displayed */
  var mailXFormsEngineReadListener = {
    onStartHeaders: function() {
    },

    onEndHeaders: function() {
      var msgDBHdr = gFolderDisplay.selectedMessage;
      if (!msgDBHdr) return;

      /* Get message source of selected message and parse its headers */
      mailXFormsEngineReadMessageSource(msgDBHdr, mailXFormsEngineReadParseMessageHeaders);
    }
  }

  gMessageListeners.push(mailXFormsEngineReadListener);
}


/**
 * Parse headers from message source - callback function
 * @param msgDBHdr A reference to the message
 * @param messageSource Message source
 */
function mailXFormsEngineReadParseMessageHeaders(msgDBHdr, messageSource) {
  let headers = messageSource.split(/\r\n\r\n|\r\r|\n\n/, 1)[0];
  let mimeHeaders = Components.classes["@mozilla.org/messenger/mimeheaders;1"].createInstance(Components.interfaces.nsIMimeHeaders);
  mimeHeaders.initialize(headers, headers.length);

  mailXFormsEngineReadDisplayForm(mimeHeaders);
}


/**
 * Read a message source and call a callback function
 * @param msgDBHdr nsIMsgDBHdr of the message
 * @param callback Function called with the result: callback(msgDBHdr, messageSource)
 */
function mailXFormsEngineReadMessageSource(msgDBHdr, callback) {
  if (!msgDBHdr) return;

  var msgURI = msgDBHdr.folder.getUriForMsg(msgDBHdr);

  var streamListener = {
    QueryInterface: function(aIID) {
      if (aIID.equals(Components.interfaces.nsISupports) || aIID.equals(Components.interfaces.nsIStreamListener)) return this;
      throw Components.results.NS_NOINTERFACE;
    },
    data: "",
    onStartRequest: function(request, context) {},
    onDataAvailable: function(request, context, inputStream, offset, available) {
      var stream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
      stream.init(inputStream);
      this.data += stream.read(available);
      stream = null;
    },
    onStopRequest: function(request, context, status) {
      if (Components.isSuccessCode(status)) {
        callback(msgDBHdr, this.data);
      } else {
        dump("mailXFormsEngineReadMessageSource streamListener error with " + msgURI + " status: " + status + "\n");
      }
    }
  }

  var messageService = messenger.messageServiceFromURI(msgURI);
  try {
    messageService.streamMessage(msgURI, streamListener, null, null, false, null);
  } catch (e) {
    dump("mailXFormsEngineReadMessageSource exception: " + e + "\n");
    return;
  }
}


/**
 * Display the form based on message headers
 * @param mimeHeaders nsIMimeHeaders
 */
function mailXFormsEngineReadDisplayForm(mimeHeaders) {
  /* Read main headers */
  let mailXFormsDataName = mimeHeaders.extractHeader("X-MailXFormsData-Name", false);
  let mailXFormsDataVersion = mimeHeaders.extractHeader("X-MailXFormsData-Version", false);

  /* Load version comparator */
  var mailXFormsEngineVersionComparator = Components.classes["@mozilla.org/xpcom/version-comparator;1"].getService(Components.interfaces.nsIVersionComparator);

  mailXFormsEngineReadCurrentFormNb = -1;

  /* Find best match form */
  var errorMessage = "";
  if (mailXFormsDataName && mailXFormsDataVersion) {
    errorMessage = mailXFormsEngineReadStringBundle.getFormattedString("formNotAvailable", [ mailXFormsDataName ]);
    for (let i = 0; i < mailXFormsEngineFormList.length; i++) {
      if (mailXFormsEngineFormList[i].name == mailXFormsDataName) {
        if (mailXFormsEngineReadCurrentFormNb == -1 ||
            (mailXFormsEngineReadCurrentFormNb != -1 &&
             mailXFormsEngineVersionComparator.compare(mailXFormsEngineFormList[i].version, mailXFormsEngineFormList[mailXFormsEngineReadCurrentFormNb].version) > 0)) {
          mailXFormsEngineReadCurrentFormNb = i;
        }

        if (mailXFormsEngineFormList[i].version == mailXFormsDataVersion) {
          errorMessage = "";
          break;
        } else {
          errorMessage = "[" + mailXFormsEngineReadStringBundle.getFormattedString("versionNotAvailable", [ mailXFormsDataVersion, mailXFormsEngineFormList[mailXFormsEngineReadCurrentFormNb].version ]) + "]";
        }
      }
    }
  }

  /* Display information */
  mailXFormsEngineReadSetTitleText("");
  mailXFormsEngineReadSetTitleError(errorMessage);

  if (mailXFormsEngineReadCurrentFormNb != -1) {
    /* Display form */
    mailXFormsEngineMimeHeaders = mimeHeaders;
    if (document.getElementById("mailXFormsEngineReadFrame").getAttribute("src") == mailXFormsEngineFormList[mailXFormsEngineReadCurrentFormNb].url) {
      mailXFormsEngineReadFillForm();
    } else {
      document.getElementById("mailXFormsEngineReadFrame").setAttribute("src", mailXFormsEngineFormList[mailXFormsEngineReadCurrentFormNb].url);
    }
  } else {
    /* Hide form */
    mailXFormsEngineMimeHeaders = null;
    document.getElementById("mailXFormsEngineReadFrame").setAttribute("src", "");
    mailXFormsEngineReadUpdateVisibility();
  }
}


/**
 * Display a message in the title bar
 * @param message Message to display
 */
function mailXFormsEngineReadSetTitleText(message) {
  document.getElementById("mailXFormsEngineReadTitleText").value = message;
}


/**
 * Display an error message in the title bar
 * @param message Error message to display
 */
function mailXFormsEngineReadSetTitleError(message) {
  document.getElementById("mailXFormsEngineReadTitleError").value = message;
}


/**
 * Collapse form frame
 */
function mailXFormsEngineReadFrameToggleCollapse() {
  mailXFormsEngineReadFrameBoxCollapsed = !mailXFormsEngineReadFrameBoxCollapsed;

  /* Write preference */
  var prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).getBranch(mailXFormsEnginePrefRoot);
  prefBranch.setBoolPref("readFrameBoxCollapsed", mailXFormsEngineReadFrameBoxCollapsed);

  mailXFormsEngineReadUpdateVisibility();
}


/**
 * Set visibility of panels
 */
function mailXFormsEngineReadUpdateVisibility() {

  document.getElementById("mailXFormsEngineReadTitleBox").setAttribute("collapsed", (document.getElementById("mailXFormsEngineReadTitleText").value == "" && document.getElementById("mailXFormsEngineReadTitleError").value == ""));
  document.getElementById('mailXFormsEngineReadTitleBox').setAttribute("frameCollapsed", mailXFormsEngineReadFrameBoxCollapsed || (document.getElementById("mailXFormsEngineReadFrame").getAttribute("src") == ""));

  document.getElementById("mailXFormsEngineReadFrameBox").setAttribute("collapsed", mailXFormsEngineReadFrameBoxCollapsed || (document.getElementById("mailXFormsEngineReadFrame").getAttribute("src") == ""));


  var frame = document.getElementById("mailXFormsEngineReadFrame");

  /* Set height of the frame as box content height */
  try {
    var box = frame.contentDocument.getElementsByTagName("html")[0];

    /* XUL: get first child inside window element */
    if (!box) box = frame.contentDocument.getElementsByTagName("window")[0].firstChild;

    if (box) {
      frame.style.height = box.getBoundingClientRect().height + "px";
      frame.style.maxHeight = box.getBoundingClientRect().height + "px";
    }
  } catch (e) {}
}


/**
 * Fill form controls with message headers
 */
function mailXFormsEngineReadFillForm() {
  if (!mailXFormsEngineMimeHeaders) return;
  if (!mailXFormsEngineFormList[mailXFormsEngineReadCurrentFormNb]) return;

  var frame = document.getElementById("mailXFormsEngineReadFrame");

  /* Set form title */
  mailXFormsEngineReadSetTitleText(mailXFormsEngineFormList[mailXFormsEngineReadCurrentFormNb].title + " (" + mailXFormsEngineFormList[mailXFormsEngineReadCurrentFormNb].version + ")");

  var mimeConverter = Components.classes["@mozilla.org/messenger/mimeconverter;1"].getService(Components.interfaces.nsIMimeConverter);

  /* Get list of elements with "mailXFormsHeaderName" attribute */
  try {
    var elementList = mailXFormsEngineGetElementsByAttribute(frame.contentDocument, "mailXFormsHeaderName", "*");
  } catch (e) {
    return;
  }

  for (let i = 0; i < elementList.length; i++) {

    let headerValue = mailXFormsEngineMimeHeaders.extractHeader(elementList[i].getAttribute("mailXFormsHeaderName"), false);
    try {
      /* Decode value */
      var decodedHeaderValue = "";
      if (headerValue) decodedHeaderValue = mimeConverter.decodeMimeHeader(headerValue, "UTF-8", false, true);

      /* Decode newline characters */
      decodedHeaderValue = decodedHeaderValue.replace(/##BR##/g, "\n");

      /* Set control value */
      elementList[i].accessors.setValue(decodedHeaderValue);
    } catch (e) {}

    /* Set control as read-only */
    let list = frame.contentDocument.getAnonymousNodes(elementList[i]);
    for (let j = 0; list && j < list.length; j++) mailXFormsEngineReadSetSubTreeReadOnly(list[j]);

  }


  /* Display or hide panels */
  mailXFormsEngineReadUpdateVisibility();
}


/**
 * Set XUL sub-tree nodes as read-only
 * @param node Root of the tree
 */
function mailXFormsEngineReadSetSubTreeReadOnly(node) {
  if ('function' == typeof(node.setAttribute)) node.setAttribute("readonly", "true");
  if (node.hasChildNodes()) {
    for (let i = 0; i < node.childNodes.length; i++) mailXFormsEngineReadSetSubTreeReadOnly(node.childNodes[i]);
  }
}
