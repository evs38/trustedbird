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
 * The Original Code is Trustedbird/Directory Contact Tabs code.
 *
 * The Initial Developer of the Original Code is
 * BT Global Services / Etat francais Ministere de la Defense.
 * Portions created by the Initial Developer are Copyright (C) 2010
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

var EXPORTED_SYMBOLS = ["ldapQuery"];


/**
 * LDAP query object
 */
function ldapQuery() {
  this.ldapURL = null;
  this.ldapConnection = null;
  this.ldapOperation = null;
  this.messageCallback = null;
  this.messageCallbackParameter = null;
  this.endCallback = null;
  this.endCallbackParameter = null;
  this.error = ldapQuery.DATA_ERROR;
}

/* Error codes */
ldapQuery.NO_ERROR = 0;
ldapQuery.CONNECT_ERROR = 1;
ldapQuery.SEARCH_ERROR = 2;
ldapQuery.DATA_ERROR = 3;

/**
 * Launch a LDAP query
 * @param {nsILDAPURL} aLdapURL
 * @param {function} aMessageCallback Callback function to handle LDAP response. Called with (nsILDAPURL, nsILDAPMessage, aMessageCallbackParameter) and must return true if received data is correct)
 * @param {Object} aMessageCallbackParameter
 * @param {function} aEndCallback Callback function to handle end of query. Called with (error, aEndCallbackParameter)
 * @param {Object} aEndCallbackParameter
 * @return {boolean} True if the query has been successfully launched
 */
ldapQuery.prototype.launch = function(aLdapURL, aMessageCallback, aMessageCallbackParameter, aEndCallback, aEndCallbackParameter) {
  this.messageCallback = aMessageCallback;
  this.messageCallbackParameter = aMessageCallbackParameter;
  this.endCallback = aEndCallback;
  this.endCallbackParameter = aEndCallbackParameter;

  if (!(aLdapURL instanceof Components.interfaces.nsILDAPURL)) {
    var errorMessage = "Error: LDAP URL is invalid! ldapQuery.launch";
    Components.utils.reportError(errorMessage);
    dump(errorMessage + "\n");
    return false;
  }

  this.ldapURL = aLdapURL;

  try {
    this.ldapConnection = Components.classes["@mozilla.org/network/ldap-connection;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPConnection);

    this.ldapConnection.init(
        this.ldapURL,
        null,
        getProxyOnUIThread(this, Components.interfaces.nsILDAPMessageListener),
        null,
        Components.interfaces.nsILDAPConnection.VERSION3);
  } catch (e) {
    var errorMessage = "Error: can't create LDAP connection! ldapQuery.launch: " + e;
    Components.utils.reportError(errorMessage);
    dump(errorMessage + "\n");
    return false;
  }

  return true;
}

/**
 * Launch bind operation
 */
ldapQuery.prototype.bind = function() {
  if (this.ldapConnection == null) return;

  try {
    this.ldapOperation = Components.classes["@mozilla.org/network/ldap-operation;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPOperation);

    this.ldapOperation.init(
      this.ldapConnection,
      getProxyOnUIThread(this, Components.interfaces.nsILDAPMessageListener),
      null);

    this.ldapOperation.simpleBind("");
    return true;
  } catch (e) {
    var errorMessage = "Error: can't bind to the LDAP directory! ldapQuery.bind: " + e;
    Components.utils.reportError(errorMessage);
    dump(errorMessage + "\n");
  }

  return false;
}

/**
 * Launch search operation
 */
ldapQuery.prototype.search = function() {
  if (this.ldapConnection == null) return false;

  try {
    var nbAttributes = new Object;

    delete this.ldapOperation;
    this.ldapOperation = Components.classes["@mozilla.org/network/ldap-operation;1"].createInstance().QueryInterface(Components.interfaces.nsILDAPOperation);
    
    this.ldapOperation.init(
      this.ldapConnection,
      getProxyOnUIThread(this, Components.interfaces.nsILDAPMessageListener),
      null);

    var attrCount = new Object;
    var attributes = this.ldapURL.getAttributes(attrCount);

    this.ldapOperation.searchExt(
      this.ldapURL.dn,
      this.ldapURL.scope,
      this.ldapURL.filter,
      attrCount.value,
      attributes,
      0,
      0);

    return true;
  } catch (e) {
    var errorMessage = "Error: can't search the LDAP directory! ldapQuery.search: " + e;
    Components.utils.reportError(errorMessage);
    dump(errorMessage + "\n");
  }

  return false;
}

ldapQuery.prototype.QueryInterface = function(iid) {
  if (!iid.equals(Components.interfaces.nsISupports) && !iid.equals(Components.interfaces.nsILDAPMessageListener)) {
    throw Components.results.NS_ERROR_NO_INTERFACE;
  }

  return this;
}

ldapQuery.prototype.onLDAPInit = function(aConnection, aStatus) {
  if (aStatus == 0 && this.bind()) return;

  this.release();
  if (this.endCallback) this.endCallback(ldapQuery.CONNECT_ERROR, this.endCallbackParameter);
}

ldapQuery.prototype.onLDAPMessage = function(aMessage) {
  switch (aMessage.type) {
    case Components.interfaces.nsILDAPMessage.RES_BIND:
      if (aMessage.errorCode == Components.interfaces.nsILDAPErrors.SUCCESS) {
        if (this.search()) return;
      } else {
        var errorMessage = "Error: ldapMessageListener.onLDAPMessage RES_BIND: (" + aMessage.errorCode + ") " + aMessage.errorMessage;
        Components.utils.reportError(errorMessage);
        dump(errorMessage + "\n");
      }
      this.release();
      if (this.endCallback) this.endCallback(ldapQuery.SEARCH_ERROR, this.endCallbackParameter);
      return;
      break;

    case Components.interfaces.nsILDAPMessage.RES_SEARCH_ENTRY:
      if (aMessage.errorCode == Components.interfaces.nsILDAPErrors.SUCCESS) {
        if (!this.messageCallback || this.messageCallback(this.ldapURL, aMessage, this.messageCallbackParameter)) {
          this.error = ldapQuery.NO_ERROR;
        }
        return;
      } else {
        var errorMessage = "Error: ldapMessageListener.onLDAPMessage RES_SEARCH_ENTRY: (" + aMessage.errorCode + ") " + aMessage.errorMessage;
        Components.utils.reportError(errorMessage);
        dump(errorMessage + "\n");
      }
      break;

    case Components.interfaces.nsILDAPMessage.RES_SEARCH_RESULT:
      break;
  }

  this.release();
  if (this.endCallback) this.endCallback(this.error, this.endCallbackParameter);
}

/**
 * Try to release the LDAP connection
 */
ldapQuery.prototype.release = function() {
  this.ldapURL = null;
  this.ldapOperation = null;
  this.ldapConnection = null;
}

/**
 * getProxyOnUIThread returns a proxy to aObject on the main (UI) thread
 * @param aObject
 * @param aInterface
 * @return Proxy to aObject
 */
function getProxyOnUIThread(aObject, aInterface) {
  var mainThread = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;

  var proxyMgr = Components.classes["@mozilla.org/xpcomproxy;1"].getService(Components.interfaces.nsIProxyObjectManager);

  return proxyMgr.getProxyForObject(mainThread, aInterface, aObject, 5); // 5 == NS_PROXY_ALWAYS | NS_PROXY_SYNC
}
