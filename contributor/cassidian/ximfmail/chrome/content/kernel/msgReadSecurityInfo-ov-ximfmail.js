addEventListener('load', onDialogOpenedXimf, true);
function onDialogOpenedXimf(){
	try{
		var pkiParams = window.arguments[0].QueryInterface(Components.interfaces.nsIPKIParamBlock);
  		params = pkiParams.QueryInterface(Components.interfaces.nsIDialogParamBlock);
  		gSignatureStatus = params.GetInt(1);
  		if(gSignatureStatus == -1){
  			var gBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
			var stringBundle = gBundle.createBundle("chrome://ximfmail/locale/ximfmail.properties");	
			var sLabel = stringBundle.GetStringFromName("ximfmail.securityinfo.warning");	
			var labelItem = document.getElementById("signatureLabel");
			labelItem.value = sLabel;
			labelItem.setAttribute("style","color:#b20000");
		}
	}catch(e){}
}