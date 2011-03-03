/* ***** BEGIN LICENSE BLOCK *****
 * Version: NPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Netscape Public License
 * Version 1.1 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.mozilla.org/NPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is BT Global Services / Etat francais Ministere de la Defense
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *  Olivier PARNIERE <olivier.parniere_AT_gmail.com> <olivier.parniere_AT_bt.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the NPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the NPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
 
const nsIPrefService = Components.interfaces.nsIPrefService;
const PrefServiceContractID = "@mozilla.org/preferences-service;1";
const MessageRemoteServiceID= "@milimail.org/MessageRemoteService;1";

var prefService = Components.classes[PrefServiceContractID]
                                .getService(nsIPrefService);

var stringBundleService=Components.classes["@mozilla.org/intl/stringbundle;1"]
	.getService().QueryInterface(Components.interfaces.nsIStringBundleService);

var stringBundle=stringBundleService.createBundle("chrome://mrs/locale/overlay.properties");

var mrsMustStart ;

var original_OnLoad = OnLoadMessenger;

OnLoadMessenger = function OnLoadExtended() {
	original_OnLoad();
	
	try{
	mrsMustStart = prefService.getBoolPref("mrs.startup.enabled");
} catch(e) {
	//case occured when the preference is not set
	mrsMustStart = false;
}

if (mrsMustStart) {
	try {
		var service = Components.classes[MessageRemoteServiceID].
			getService(Components.interfaces.IMessageRemoteService);
		service.Start();
	}	catch(e) {
		//case occured when there is a problem when loading xpcom from extension
		alert(stringBundle.GetStringFromName("mrs.alert.start.1"));
	}
}
}

var original_Unload = OnUnloadMessenger;

OnUnloadMessenger = function OnUnloadExtended() {
	original_Unload();

	try {
		var service = Components.classes[MessageRemoteServiceID].
			getService(Components.interfaces.IMessageRemoteService);
			
		if (service.IsStarted()) {
			service.Stop();
		}
		
	}	catch(e) {
		//case occured when there is a problem when loading xpcom from extension
		alert(stringBundle.GetStringFromName("mrs.alert.stop.1"));
	}
	
}

