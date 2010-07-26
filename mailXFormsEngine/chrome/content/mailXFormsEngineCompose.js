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
 * The Original Code is Trustedbird/Mail XForms code.
 *
 * The Initial Developer of the Original Code is
 * BT Global Services / Etat francais Ministere de la Defense.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Raphael Fairise / BT Global Services / Etat francais Ministere de la Defense
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
 * Display a form in the compose window and add mail headers when sending a message
 */

var jsLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
jsLoader.loadSubScript("chrome://mailXFormsEngine/content/mailXFormsEngineCommon.js");

var mailXFormsEngineComposeStringBundle = null;
var mailXFormsEngineComposeFrameCollapsed = false;
var mailXFormsEngineComposeCurrentFormNb = -1;


/* Register a listener to the event dispatched when a compose window is opened/reopened */
window.addEventListener("compose-window-init", mailXFormsEngineComposeInit, true);

/* Register a listener to the event dispatched when a compose window is closed */
window.addEventListener("compose-window-close", mailXFormsEngineComposeExit, true);

/* Register a listener to the event dispatched from GenericSendMessage in order to add the new headers */
window.addEventListener("compose-send-message", mailXFormsEngineComposeAddNewHeaders, true);


/**
 * Initialize engine: create menus and display the form in the compose window
 */
function mailXFormsEngineComposeInit() {
  /* Get string bundle */
  mailXFormsEngineComposeStringBundle = document.getElementById("mailXFormsEngineComposeStringBundle");

  /* Read form list from preferences */
  mailXFormsEngineCommonLoadFormList();

  /* Register a listener in order to toggle form frame visibility */
  document.getElementById("mailXFormsEngineComposeTitleBox").addEventListener("click", mailXFormsEngineComposeFrameToggleCollapse, true);

  /* Register a listener in order to set form height when the frame is loaded */
  document.getElementById("mailXFormsEngineComposeFrame").addEventListener("load", mailXFormsEngineComposeFrameSetFormHeight, true);


  /* Force adding the toolbar button on first run */
  var prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).getBranch(mailXFormsEnginePrefRoot);
  var composeToolbarButtonMenuAdded = false;
  try {
    composeToolbarButtonMenuAdded = prefBranch.getBoolPref("composeToolbarButtonMenuAdded");
  } catch (e) {}
  if (!composeToolbarButtonMenuAdded) {
    var toolbarCurrentSet = document.getElementById("composeToolbar2").currentSet;
    if (toolbarCurrentSet == "") toolbarCurrentSet = document.getElementById("composeToolbar2").getAttribute("defaultset");
    if (!(toolbarCurrentSet.match(/mailXFormsEngineComposeToolbarButtonMenu/))) {
      document.getElementById("composeToolbar2").setAttribute("currentset", toolbarCurrentSet + ",separator,mailXFormsEngineComposeToolbarButtonMenu");
      document.getElementById("composeToolbar2").currentSet = toolbarCurrentSet + ",separator,mailXFormsEngineComposeToolbarButtonMenu";
      document.persist("composeToolbar2", "currentset");
    }
    prefBranch.setBoolPref("composeToolbarButtonMenuAdded", true);
  }


  mailXFormsEngineComposeCurrentFormNb = -1;

  /* Create menus */
  mailXFormsEngineComposeCreateMenu("mailXFormsEngineComposeOptionsMenu");
  mailXFormsEngineComposeCreateMenu("mailXFormsEngineComposeToolbarButtonMenu");

  /* Load default form */
  for (let i = 0; i < mailXFormsEngineFormList.length; i++) {
    if (!mailXFormsEngineFormList[i].composeEnabled) continue;
    if ((mailXFormsEngineFormList[i].name + "." + mailXFormsEngineFormList[i].version) == mailXFormsEngineDefaultForm) mailXFormsEngineComposeSetForm(i);
  }

}


/**
 * Create XUL elements of a menu to choose forms
 * @param id Id of the XUL menu element
 */
function mailXFormsEngineComposeCreateMenu(id) {
  var menu = document.getElementById(id);
  var menuPopup = document.getElementById(id + "Popup");

  if (!menu || !menuPopup) return;

  /* Get string bundle */
  if (!mailXFormsEngineComposeStringBundle) mailXFormsEngineComposeStringBundle = document.getElementById("mailXFormsEngineComposeStringBundle");

  menu.setAttribute("oncommand", "mailXFormsEngineComposeSetForm(event.target.value);");

  /* Remove all entries */
  while (menuPopup.hasChildNodes()) menuPopup.removeChild(menuPopup.childNodes[0]);

  /* Create first menu items */
  var menuItem = document.createElement("menuitem");
  menuItem.setAttribute("type", "radio");
  menuItem.setAttribute("label", mailXFormsEngineComposeStringBundle.getString("listItemNone"));
  menuItem.setAttribute("id", id + "MenuItemNone");
  menuItem.setAttribute("name", id + "MenuName");
  menuItem.setAttribute("value", -1);
  menuItem.setAttribute("checked", true);
  menuPopup.appendChild(menuItem);

  /* Create all menu items */
  for (let i = 0; i < mailXFormsEngineFormList.length; i++) {
    if (!mailXFormsEngineFormList[i].composeEnabled) continue;

    var menuItem = document.createElement("menuitem");
    menuItem.setAttribute("type", "radio");
    menuItem.setAttribute("label", mailXFormsEngineFormList[i].title + " (" + mailXFormsEngineFormList[i].version + ")");
    menuItem.setAttribute("id", id + "MenuItem" + i);
    menuItem.setAttribute("name", id + "MenuName");
    menuItem.setAttribute("value", i);
    menuPopup.appendChild(menuItem);

  }

  /* Select current item */
  mailXFormsEngineComposeUpdateMenu(id);
}


/**
 * Select current item in a menu
 * @param id Id of the menu element
 */
function mailXFormsEngineComposeUpdateMenu(id) {
  var menu = document.getElementById(id);
  if (!menu) return;

  try {
    menu.getElementsByAttribute("checked", "*")[0].removeAttribute("checked");
  } catch(e) {}
  menu.getElementsByAttribute("value", mailXFormsEngineComposeCurrentFormNb)[0].setAttribute("checked", "true");
}


/**
 * Hide form before closing the compose window
 */
function mailXFormsEngineComposeExit() {
  document.getElementById("mailXFormsEngineComposeTitleBox").setAttribute("collapsed", true);
  document.getElementById("mailXFormsEngineComposeFrameBox").setAttribute("collapsed", true);
  document.getElementById("mailXFormsEngineComposeFrame").setAttribute("src", "");
}


/**
 * Override GenericSendMessage function in order to check form fields before sending
 */
var GenericSendMessageOriginal = GenericSendMessage;
var GenericSendMessage = function(msgType) {
  /* Check form fields if message has to be sent (not when just saving a draft) */
  if ((msgType == nsIMsgCompDeliverMode.Now ||
       msgType == nsIMsgCompDeliverMode.Later ||
       msgType == nsIMsgCompDeliverMode.Background) &&
       !mailXFormsEngineComposeCheckFormFields()) {

    /* Stop sending process if some form fields are invalid */
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
    promptService.alert(null, document.getElementById("mailXFormsEngineComposeOptionsMenu").label, mailXFormsEngineComposeStringBundle.getString("invalidValues"));

    return;
  }

  /* Call original function */
  GenericSendMessageOriginal.apply(this, arguments);
};


/**
 * Display a form in the compose window
 * @param formNb Form item to display
 */
function mailXFormsEngineComposeSetForm(formNb) {
  /* Load form */
  if (formNb == -1 || !mailXFormsEngineFormList[formNb]) {
    mailXFormsEngineComposeCurrentFormNb = -1;
    document.getElementById("mailXFormsEngineComposeTitleText").value = "";
    document.getElementById("mailXFormsEngineComposeFrame").setAttribute("src", "");
  } else {
    mailXFormsEngineComposeCurrentFormNb = formNb;
    document.getElementById("mailXFormsEngineComposeTitleText").value = mailXFormsEngineFormList[mailXFormsEngineComposeCurrentFormNb].title + " (" + mailXFormsEngineFormList[mailXFormsEngineComposeCurrentFormNb].version + ")";
    document.getElementById("mailXFormsEngineComposeFrame").setAttribute("src", mailXFormsEngineFormList[mailXFormsEngineComposeCurrentFormNb].url);
  }

  mailXFormsEngineComposeUpdateVisibility();

  /* Update selected menu items */
  mailXFormsEngineComposeUpdateMenu("mailXFormsEngineComposeOptionsMenu");
  mailXFormsEngineComposeUpdateMenu("mailXFormsEngineComposeToolbarButtonMenu");
}


/**
 * Set form height
 */
function mailXFormsEngineComposeFrameSetFormHeight() {
  try {
    var frame = document.getElementById("mailXFormsEngineComposeFrame");
    if (!frame) return;

    /* XHTML: get html element */
    var box = frame.contentDocument.getElementsByTagName("html")[0];

    /* XUL: get first child inside window element */
    if (!box) box = frame.contentDocument.getElementsByTagName("window")[0].firstChild;

    if (!box) return;

    frame.style.height = box.getBoundingClientRect().height + "px";
    frame.style.maxHeight = box.getBoundingClientRect().height + "px";
  } catch (e) {dump(e+"\n");}

}


/**
 * Collapse form frame
 */
function mailXFormsEngineComposeFrameToggleCollapse() {
  mailXFormsEngineComposeFrameCollapsed = !mailXFormsEngineComposeFrameCollapsed;
  mailXFormsEngineComposeUpdateVisibility();
  mailXFormsEngineComposeFrameSetFormHeight();
}


/**
 * Set visibility of panels
 */
function mailXFormsEngineComposeUpdateVisibility() {
  document.getElementById("mailXFormsEngineComposeTitleBox").setAttribute("collapsed", (document.getElementById("mailXFormsEngineComposeTitleText").value == ""));
  document.getElementById('mailXFormsEngineComposeTitleBox').setAttribute("frameCollapsed", mailXFormsEngineComposeFrameCollapsed);
  document.getElementById("mailXFormsEngineComposeFrameBox").setAttribute("collapsed", mailXFormsEngineComposeFrameCollapsed || (document.getElementById("mailXFormsEngineComposeFrame").getAttribute("src") == ""));
}

/**
 * Check validity of the form fields
 * @return true if all fields are valid
 */
function mailXFormsEngineComposeCheckFormFields() {
  if (!mailXFormsEngineFormList[mailXFormsEngineComposeCurrentFormNb]) return true;

  try {
    var frame = document.getElementById("mailXFormsEngineComposeFrame");

    /* Remove focus from XForms elements in order to force XForms to process all fields */
    frame.focus();

    /* Get list of elements with "mailXFormsHeaderName" attribute */
    var elementList = mailXFormsEngineGetElementsByAttribute(frame.contentDocument, "mailXFormsHeaderName", "*");

    var isValid = true;
    for (let i = 0; i < elementList.length; i++) {
      /* Check validity */
      if (!elementList[i].accessors.isValid()) {
        isValid = false;
        elementList[i].focus();
        dump("Field " + elementList[i].getAttribute("mailXFormsHeaderName") + " is invalid!\n");
        break;
      }
    }

    return isValid;

  } catch (ex) {
    dump("mailXFormsEngineComposeCheckFormFields exception: " + ex + "\n");
  }

  return false;
}


/**
 * Add new mail headers based on fields in the form
 * @return true if headers have been successfully added
 */
function mailXFormsEngineComposeAddNewHeaders() {
  if (!mailXFormsEngineFormList[mailXFormsEngineComposeCurrentFormNb]) return;

  /* Check again form control validity and don't add any headers if invalid */
  if (!mailXFormsEngineComposeCheckFormFields()) return;


  mailXFormsEngineComposeAddHeader("X-MailXFormsData-Name", mailXFormsEngineFormList[mailXFormsEngineComposeCurrentFormNb].name);
  mailXFormsEngineComposeAddHeader("X-MailXFormsData-Version", mailXFormsEngineFormList[mailXFormsEngineComposeCurrentFormNb].version);

  try {
    var frame = document.getElementById("mailXFormsEngineComposeFrame");

    var mimeConverter = Components.classes["@mozilla.org/messenger/mimeconverter;1"].getService(Components.interfaces.nsIMimeConverter);

    /* Get list of elements with "mailXFormsHeaderName" attribute */
    var elementList = mailXFormsEngineGetElementsByAttribute(frame.contentDocument, "mailXFormsHeaderName", "*");

    for (var i = 0; i < elementList.length; i++) {
      /* Get value from form element */
      var value = elementList[i].accessors.getValue();

      if (value == "")
        continue;

      /* Encode newline characters */
      value = value.replace(/\n|\r\n/g, "##BR##");

      /* Encode value */
      var encodedValue = "";
      if (value) encodedValue = mimeConverter.encodeMimePartIIStr_UTF8(value, false, "UTF-8", elementList[i].getAttribute("mailXFormsHeaderName").length + 2, mimeConverter.MIME_ENCODED_WORD_SIZE);

      /* Add new header */
      mailXFormsEngineComposeAddHeader(elementList[i].getAttribute("mailXFormsHeaderName"), encodedValue);
    }

  } catch (ex) {
    dump("mailXFormsEngineComposeAddNewHeaders exception: " + ex + "\n");
  }
}


/**
 * Add a mail header to current message
 * @param headerName Name of the header
 * @param headerValue Value of the header
 */
function mailXFormsEngineComposeAddHeader(headerName, headerValue) {
  if (headerName == "" && headerValue == "") return;

  gMsgCompose.compFields.otherRandomHeaders += headerName + ": " + headerValue + "\r\n";
}
