/* ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2008-2009 EADS DEFENCE AND SECURITY - All rights reserved.
 *  secure headers is under the triple license  MPL 1.1/GPL 2.0/LGPL 2.1.
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
// components defined in this file
const AM_XIMF_SECURE_HEADERS_EXTENSION_SERVICE_CONTRACTID =
    "@mozilla.org/accountmanager/extension;1?name=secureheaders";
const AM_XIMF_SECURE_HEADERS_EXTENSION_SERVICE_CID =
    Components.ID("{470139E3-7ADD-43e4-954F-CA997B68657C}");
				   
	 
// interfaces used in this file
const nsIMsgAccountManagerExtension = Components.interfaces.nsIMsgAccountManagerExtension;
const nsICategoryManager = Components.interfaces.nsICategoryManager;
const nsISupports        = Components.interfaces.nsISupports;

function SecureHeadersPrefService(){}

SecureHeadersPrefService.prototype.name = "secureheaders";
SecureHeadersPrefService.prototype.chromePackageName = "messenger"
SecureHeadersPrefService.prototype.showPanel =
function (server){
  // show ximf_signed_headers panel for all account types 
  return (server.type != "nntp");
}

// factory for command line handler service (XimfMailService)
var secureheadersPrefFactory = new Object();

secureheadersPrefFactory.createInstance =
function (outer, iid) {
  if (outer != null)
    throw Components.results.NS_ERROR_NO_AGGREGATION;

  if (!iid.equals(nsIMsgAccountManagerExtension) && !iid.equals(nsISupports))
    throw Components.results.NS_ERROR_INVALID_ARG;

  return new SecureHeadersPrefService();
}

var secureheadersPrefsModule = new Object();

secureheadersPrefsModule.registerSelf =
function (compMgr, fileSpec, location, type)
{
  dump("Registering secure_headers account manager extension.\n");

  compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
  compMgr.registerFactoryLocation(AM_XIMF_SECURE_HEADERS_EXTENSION_SERVICE_CID,
                                  "secureheaders Account Manager Extension Service",
                                  AM_XIMF_SECURE_HEADERS_EXTENSION_SERVICE_CONTRACTID,
                                  fileSpec,
                                  location,
                                  type);
  catman = Components.classes["@mozilla.org/categorymanager;1"].getService(nsICategoryManager);
  catman.addCategoryEntry("mailnews-accountmanager-extensions",
                            "secureheaders-accountmanager-extension",
                            AM_XIMF_SECURE_HEADERS_EXTENSION_SERVICE_CONTRACTID, true, true);
  dump("secureheaders account manager extension registered.\n");
}

secureheadersPrefsModule.unregisterSelf =
function(compMgr, fileSpec, location)
{
  compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
  compMgr.unregisterFactoryLocation(AM_XIMF_SECURE_HEADERS_EXTENSION_SERVICE_CID, fileSpec);
  catman = Components.classes["@mozilla.org/categorymanager;1"].getService(nsICategoryManager);
  catman.deleteCategoryEntry("mailnews-accountmanager-extensions",
                             AM_XIMF_SECURE_HEADERS_EXTENSION_SERVICE_CONTRACTID, true);
}

secureheadersPrefsModule.getClassObject =
function (compMgr, cid, iid) {
  if (cid.equals(AM_XIMF_SECURE_HEADERS_EXTENSION_SERVICE_CID))
    return secureheadersPrefFactory;


  if (!iid.equals(Components.interfaces.nsIFactory))
    throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

  throw Components.results.NS_ERROR_NO_INTERFACE;    
}

secureheadersPrefsModule.canUnload =
function(compMgr)
{
  return true;
}

// entrypoint
function NSGetModule(compMgr, fileSpec) {
  return secureheadersPrefsModule;
}
