
const nsIPrefService = Components.interfaces.nsIPrefService;
const PrefServiceContractID = "@mozilla.org/preferences-service;1";
const MessageRemoteServiceID= "@milimail.org/MessageRemoteService;1";

var prefService = Components.classes[PrefServiceContractID]
                                .getService(nsIPrefService);

var mrsMustStart ;

try{
	mrsMustStart = prefService.getBoolPref("mrs.startup.enabled");
} catch(e) {
	//case occured when the preference is not set
	mrsMustStart = false;
}

if (mrsMustStart) {
	var service = Components.classes[MessageRemoteServiceID].getService(Components.interfaces.IMessageRemoteService);
	service.Start();
}