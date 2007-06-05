
var identitykey ;
var onLoadOriginal = onLoad;
var onSaveOriginal = onSave;
var useCustomPref;
var prefService ;
//Hook original OnLoad function
onLoad = function onLoadHook(){
	onLoadOriginal();
	identitykey = gIdentity.key;
	removeOldAddressing();
	loadPreferences();
	setupUI();
	initLDAPAutocompleteList()
  }
  
  
  onSave = function onSaveHook(){
	savePreferences();
  }

//Load Preferences
function loadPreferences(){
	prefService = Components.classes["@mozilla.org/preferences-service;1"].
                getService(Components.interfaces.nsIPrefBranch);
	try  {
		useCustomPref = prefService.getBoolPref("ldap_2.identity." + identitykey + ".multi_ldap_use_custom_preferences");
	} catch (e){
		dump("loadPreferences() -> Setting default useCustomPref\n");
		prefService.setBoolPref("ldap_2.identity." + identitykey + ".multi_ldap_use_custom_preferences",false);
		useCustomPref = false;
	}
	
}

function savePreferences(){
		//Save use Custom Preference choice to preference
		var checkBoxUseCustomPref = document.getElementById("ldap_2.identity.id.multi_ldap_use_custom_preferences");
		prefService.setBoolPref("ldap_2.identity." + identitykey + ".multi_ldap_use_custom_preferences",checkBoxUseCustomPref.checked);
		
}
//Setup UI Control From Preferences
function setupUI(){
	var checkBoxUseCustomPref = document.getElementById("ldap_2.identity.id.multi_ldap_use_custom_preferences");
	checkBoxUseCustomPref.checked = useCustomPref;
	enableCustomPreferences(checkBoxUseCustomPref);

}
//Set old compositionAndAddressing UI to hidden
function removeOldAddressing(){
var element = document.getElementById("compositionAndAddressing");
 	var childs = element.childNodes;
  	
	var n = 0;
  	for ( i = 0 ; i< childs.length; i++)
  	{
  		if (childs[i].tagName == "groupbox")
  			n++;
  		if (n == 2){
  			childs[i].setAttribute("hidden","true");
  		}
  	}
  	

}
 //Function which deal user event on LDAP AutoComplete List
function updateLDAPList(target){
	
	var list = document.getElementById("LDAPList");
	var item = list.currentItem;
	
	var nameCell = 	item.childNodes.item(0);
	var checkBoxCell = item.childNodes.item(1);
	dump(nameCell.tagName+"\n");
	dump(nameCell.getAttribute("label")+" : ");
	dump(nameCell.getAttribute("value")+"\n");
	var checkbox = checkBoxCell.firstChild;
	dump(checkbox.checked+"\n");
	
	updateLDAPAutocompletePref(nameCell.getAttribute("value"), checkbox.checked);
	
}

//Helper function return an array minus an value
function removeFromArray(value, allPrefs){
	var prefs = new Array();
	
	for (i = 0; i < allPrefs.length; i++){
		if (allPrefs[i] != value)
			prefs.push(allPrefs[i]);
	}
	
	return prefs;
}

//Convert an Array to an String with coma
function convertPrefArrayToString(array){
	var s = "";
	
	for (i = 0 ; i < array.length ; i++){
		if (array[i].length != 0)
			{
				s+=array[i];
				s +=',';
			}
	}
	
	
	return s.slice(0,-1);
}

/*
 * Get preference safety, if preference does not exist it returns empty string
 */
function getSafeCharPref(prefService, uri){
	var value = "";
	try {
		value = prefService.getCharPref(uri);
	} catch(e){}
	return value;
}


function updateLDAPAutocompletePref(LDAPUri, checked){
	dump("Enter saveLDAPList()" + "\n");
	var prefLDAPURI = "ldap_2.identity."+identitykey+".autoComplete.ldapServers";
	var prefLocalDirectoriesURI = "ldap_2.identity."+identitykey+".autoComplete.ldapLocalDirectories";
	
	var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                            .getService(Components.interfaces.nsIPrefBranch);
    
    var LDAPPrefValue = LDAPUri.split("//")[1];
    dump("saveLDAPList() LDAPPrefValue : " + LDAPPrefValue + "\n");
    
    var uri = "";
    if (LDAPPrefValue.search("ldap_2") != -1){
    	uri=prefLDAPURI;
    } else
    	uri=prefLocalDirectoriesURI;
                 
    var autoCompletePref = getSafeCharPref(prefService, uri);
    dump("saveLDAPList() old autoCompletePref : " + autoCompletePref + "\n");
    
    var allPrefs = autoCompletePref.split(',');
    
    var prefsFiltered = removeFromArray(LDAPPrefValue, allPrefs);
   
   	if (checked)
   		prefsFiltered.push(LDAPPrefValue);
   	
   	var newPref = convertPrefArrayToString(prefsFiltered);
  
    prefService.setCharPref(uri, newPref);
    
    autoCompletePref = getSafeCharPref(prefService, uri);
    dump("saveLDAPList() new autoCompletePref : " + autoCompletePref + "\n");
}

//Init AutoComplete List Box LDAP
function initLDAPAutocompleteList(){
	var list = document.getElementById("LDAPList");
	var count = list.getRowCount();
	var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                            .getService(Components.interfaces.nsIPrefBranch);
    
    var prefLDAPURI = "ldap_2.identity."+identitykey+".autoComplete.ldapServers";
    var prefLocalDirectoriesURI = "ldap_2.identity."+identitykey+".autoComplete.ldapLocalDirectories";
    
    //Get all LDAP where AutoComplete is set from User Prefs
    var prefLDAP = getSafeCharPref(prefService, prefLDAPURI);
    var prefLocalDirectories = getSafeCharPref(prefService, prefLocalDirectoriesURI);
    
	//Loop over all LDAP servers                       
	for ( i = 0; i < count ; i++){
		item = list.getItemAtIndex(i);
		var ldapUri = item.childNodes.item(0).getAttribute("value");
		var ldapPrefValue = ldapUri.split("//")[1];
		var checkBox = item.childNodes.item(1).firstChild;
		
		//Test if pref contains ldapPrefValue to initialize checkboxes
		if (( prefLDAP.indexOf(ldapPrefValue) >= 0) || (prefLocalDirectories.indexOf(ldapPrefValue) >= 0))
			checkBox.checked = true;
		else
			checkBox.checked = false;
	}
}


function disableListBox(list, bool){
	//see Bugzilla Bug 338156
	var childs = list.childNodes;
	if (!childs)
		return;	

	for ( i = 0 ; i< childs.length; i++)
  	{	
  		dump(childs[i].localName + " : " + childs[i].childNodes.length + "\n");
  		 
  		 if ( (childs[i].localName == "listitem") ){
  			
  			if (bool == true){
  				var c = childs[i].childNodes;
  				c[0].setAttribute("disabled", "true");
  				var checkbox = c[1].childNodes;
  				checkbox[0].setAttribute("disabled", "true");
  			}
  		 	else{
  		 		var c = childs[i].childNodes;
  				c[0].removeAttribute("disabled");
  				var checkbox = c[1].childNodes;
  				checkbox[0].removeAttribute("disabled");
  		 	}
  		 
  		 }	
  		
  	}
  	
	
}

function enableCustomPreferences(target){
	
	dump("enableCustomPreferences() -> Enter " + 	"\n");
	var list = document.getElementById("LDAPList");
	dump("enableCustomPreferences() -> checkbox state " + target.checked + "\n");
	
	if (target.checked == false)
		disableListBox(list,true);
	else
		disableListBox(list,false);
}

