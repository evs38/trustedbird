/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function SecureHeadersService() {};

SecureHeadersService.prototype = {
  name: "secureheaders",
  chromePackageName: "messenger",
  showPanel: function(server) {
    // don't show the panel for news, rss, or local accounts
    return (server.type != "nntp" && server.type != "rss" &&
            server.type != "none");
  },

  QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIMsgAccountManagerExtension]),
  classDescription: "Secure Headers Account Manager Extension Service",
  classID: Components.ID("{470139E3-7ADD-43e4-954F-CA997B68657C}"),
//  contractID: "@mozilla.org/accountmanager/extension;1?name=secureheaders",

//  _xpcom_categories: [{category: "mailnews-accountmanager-extensions",
//                       entry: "secureheaders account manager extension"}]
};

const NSGetFactory = XPCOMUtils.generateNSGetFactory([SecureHeadersService]);

//function NSGetModule(compMgr, fileSpec) {
//  return XPCOMUtils.generateModule([SecureHeadersService]);
//}
