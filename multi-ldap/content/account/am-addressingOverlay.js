/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * ***** BEGIN LICENSE BLOCK *****
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
 * The Original Code is mozilla.org Code.
 *
 * The Initial Developer of the Original Code is
 *   BT Global Services / Etat francais Ministere de la Defense
 * Portions created by the Initial Developer are Copyright (C) 1998-2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Olivier Parniere BT Global Services / Etat francais Ministere de la Defense
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
 * ***** END LICENSE BLOCK ***** */

const kLDAPPrefContractID="@mozilla.org/ldapprefs-service;1";
var gRefresh = false; // leftover hack from the old preferences dialog
// Original preference to save preference with only the valid server
var gOriginalPreference = null;
// OBr 18/07/07 correction of the entry ID 484
var	gAutoCompletePref = null;
var gIdentity = null;
var onInitOriginal = onInit;
var onLoadOriginal = onLoad;
var onSaveOriginal = onSave;
var useCustomPref;
var gPreferenceService = null;
var gDirectories = null;
var gLDAPPrefsService = null;

onInit = function onInitHook(aPageId, aServerId) 
{
	onInitOriginal();
	dump("onInit for Identity key='" + gIdentity.key + "' started.\n");
	loadPreferences();
	setupUI();
	if (gDirectories){
		//update checkbox control with data from the new user
		updateMultiLDAPDirectoriesList();
	} else {
		if( gAutoCompletePref == null ){
			initMultiLDAPDirectoriesList(); // Initialize user preference string before create LDAP list
		}
		// build the LDAP address book server list box. We do this by hand instead of using the xul template
		createMultiLDAPDirectoriesList();
	}
	dump("onInit ended.\n");
}

//Hook original OnLoad function
onLoad = function onLoadHook(){
	if (kLDAPPrefContractID in Components.classes)
		gLDAPPrefsService = Components.classes[kLDAPPrefContractID].getService(Components.interfaces.nsILDAPPrefsService);

	onLoadOriginal();
	removeOldAddressing();
  }


onSave = function onSaveHook(){
	savePreferences();
  }

//Load Preferences
function loadPreferences(){
	gPreferenceService = Components.classes["@mozilla.org/preferences-service;1"].
                getService(Components.interfaces.nsIPrefBranch);
	try  {
		useCustomPref = gPreferenceService.getBoolPref("ldap_2.identity." + gIdentity.key + ".multi_ldap_use_custom_preferences");
		dump("loadPreferences for user " + gIdentity.key +" value=" + useCustomPref + ".\n");
	} catch (e){
		dump("loadPreferences() -> Setting default useCustomPref\n");
		gPreferenceService.setBoolPref("ldap_2.identity." + gIdentity.key + ".multi_ldap_use_custom_preferences",false);
		useCustomPref = false;
	}
}

function savePreferences(){
	//Save use Custom Preference choice to preference
	var checkBoxUseCustomPref = document.getElementById("ldap_2.identity.id.multi_ldap_use_custom_preferences");
	gPreferenceService.setBoolPref("ldap_2.identity." + gIdentity.key + ".autoComplete.overrideGlobalPref",checkBoxUseCustomPref.checked);
	gPreferenceService.setBoolPref("ldap_2.identity." + gIdentity.key + ".multi_ldap_use_custom_preferences",checkBoxUseCustomPref.checked);
    gPreferenceService.setCharPref("ldap_2.identity." + gIdentity.key + ".autoComplete.ldapServers", gAutoCompletePref );
	dump("savePreferences for user " + gIdentity.key +".\n");
}

//Setup UI Control From Preferences
function setupUI(){
	var checkBoxUseCustomPref = document.getElementById("ldap_2.identity.id.multi_ldap_use_custom_preferences");
	checkBoxUseCustomPref.checked = useCustomPref;
	enableCustomPreferences(checkBoxUseCustomPref);
	dump("setupUI for user " + gIdentity.key +" value=" + useCustomPref + ".\n");
}

function editDirectories()
{
	var args = {fromGlobalPref: true};
	window.openDialog("chrome://messenger/content/addressbook/pref-editdirectories.xul",
						"editDirectories", "chrome,modal=yes,resizable=no", args);
	if (gRefresh)
	{
		var popup = document.getElementById("directoriesListPopup");
		if (popup) 
			while (popup.hasChildNodes())
				popup.removeChild(popup.lastChild);
	}
	gDirectories = null;
	//loadDirectories(popup);
	if (gRefresh)
	{	// Remove LDAP server list to update list box
		removeMultiLDAPDirectoriesList();
		// Create LDAP server list with new list
		createMultiLDAPDirectoriesList();
	}
	gRefresh = false;
}

//Set old compositionAndAddressing UI to hidden
function removeOldAddressing(){
var element = document.getElementById("compositionAndAddressing");
 	var childs = element.childNodes;

	var n = 0;
  	for (var i = 0 ; i< childs.length; i++)
  	{
  		if (childs[i].tagName == "groupbox")
  			n++;
  		if (n == 2){
  			childs[i].setAttribute("hidden","true");
  		}
  	}
}

//Init prefernce string to Create list of the LDAP server in the list box LDAPList
function initMultiLDAPDirectoriesList()
{
	var uri;
	gPreferenceService = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefBranch);
	//URI of All Autocomplete repositories
	var prefLDAPURI = "ldap_2.identity." + gIdentity.key + ".autoComplete.ldapServers";
	// Initialize global variable. Used to update preference of the LDAP list
	gOriginalPreference = gAutoCompletePref = getSafeCharPref(gPreferenceService, prefLDAPURI);
	dump("initMultiLDAPDirectoriesList="+ prefLDAPURI +"='" + gAutoCompletePref + "'.\n");
}

//Create list of the LDAP server in the list box LDAPList
function createMultiLDAPDirectoriesList()
{
	dump("createMultiLDAPDirectoriesList started.\n");

	var directoriesListBox = document.getElementById("LDAPList");
	if (directoriesListBox){
		createCheckBoxList( directoriesListBox);
	}
	// Save the preference to update the string when a server has been deleted
    gPreferenceService.setCharPref("ldap_2.identity." + gIdentity.key + ".autoComplete.ldapServers", gOriginalPreference );

	//Enable LDAP list control
	enableCustomPreferences();
	dump("createMultiLDAPDirectoriesList ended.\n");
}

function createCheckBoxList(aPopup)
{
	var prefCount = {value:0};
	var description = "";
	var item;
	var j=0;
	var arrayOfDirectories;
	var position;
	var dirType;
	var uri;

	dump("\tcreateCheckBoxList started.\n");
	dump("\t\tInitialize check box with preferences '"+ gAutoCompletePref + "'.\n");
	if (!gDirectories) 
	{
		gPreferenceService = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch);
		try 
		{
			if (gLDAPPrefsService)
				arrayOfDirectories = gLDAPPrefsService.getServerList(gPreferenceService, prefCount);
		}
		catch (ex) {}

		if (arrayOfDirectories) 
		{
		    var arrayPreferences = gAutoCompletePref.split(',');
			gDirectories = new Array();
			for (var i = 0; i < prefCount.value; i++)
			{
				if ((arrayOfDirectories[i] != "ldap_2.servers.pab") && 
					(arrayOfDirectories[i] != "ldap_2.servers.history")) 
				{
					try 
					{
						position = gPreferenceService.getIntPref(arrayOfDirectories[i]+".position");
					}
					catch(ex)
					{
						position = 1;
					}

					try
					{
						dirType = gPreferenceService.getIntPref(arrayOfDirectories[i]+".dirType");
					}
					catch(ex)
					{
						dirType = 1;
					}

					if ((position != 0) && (dirType == 1)) 
					{
						dump( "\t\tTreat entry name =>'" + arrayOfDirectories[i]+"'\n" );
						try
						{
							description = gPreferenceService.getComplexValue(arrayOfDirectories[i]+".description",
								Components.interfaces.nsISupportsString).data;
						}
						catch(ex)
						{
							description="";
						}

						if (description != "") 
						{
							if (aPopup) 
							{	//Test if pref contains ldapPrefValue to initialize checkboxes
								var checked = isInPreferenceSeverList(arrayOfDirectories[i], arrayPreferences);

								item = createCheckBoxItem( i, description, arrayOfDirectories[i], checked );
								if ( item ) 
									aPopup.appendChild(item);
							}
							gDirectories[j++] = {value:arrayOfDirectories[i], label:description};
						}
					}
					else
					{
						gOriginalPreference = checkPreferenceServerValidity(arrayOfDirectories[i]);
					}
				}
			}
		}
	} else {
		dump("\t\tDirectory already loaded.\n");
	}
	dump("\tcreateCheckBoxList ended.\n");
}

/* 
 * Create an entry for each LDAP server like this
 *	<listitem allowevents="true">
 *		<listcell  value="Directory URI">
 *			<checkbox id="Directory URI" label="LDAP Name" />
 *		</listcell>
 *	</listitem>
 */
function createCheckBoxItem( index, name, value, checked)
{
	// add 	<listitem allowevents="true">
	var item = document.createElement('listitem');
	item.setAttribute("allowevents", "true");
	// add 	<listcell  value="Directory URI">
	var listCell = document.createElement( 'listcell');  
	listCell.setAttribute( 'value', value);
	item.appendChild( listCell);
	// add 	<checkbox id="Directory URI" label="LDAP Name" />
	var checkBox = document.createElement('checkbox');
	checkBox.setAttribute( 'id', value); // Set the LDAP URI as ID of the check box
	checkBox.setAttribute( 'checked', checked);
	checkBox.setAttribute( 'label', name);
	listCell.appendChild( checkBox );
	dump("\t\t\tCreate check box ID='" + value + " name='" + name + "' set to '" + checked + "'.\n");
	return( item);
}

function updateMultiLDAPDirectoriesList()
{
	dump("updateMultiLDAPDirectoriesList started.\n");

	var directoriesListBox = document.getElementById("LDAPList");
	if (directoriesListBox){
		updateCheckBoxList( directoriesListBox);
	}
	//Enable LDAP list control
	enableCustomPreferences();
	dump("updateMultiLDAPDirectoriesList ended.\n");
}

function updateCheckBoxList(aPopup)
{
	var prefCount = {value:0};
	var description = "";
	var item;
	var j=0;
	var arrayOfDirectories;
	var position;
	var dirType;
	var uri;

	dump("\tupdateCheckBoxList started.\n");
	
	gPreferenceService = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefBranch);
	
	//URI of All Autocomplete repositories
	var prefLDAPURI = "ldap_2.identity." + gIdentity.key + ".autoComplete.ldapServers";
	//Get all LDAP where AutoComplete is set from User Prefs
	var prefLDAP = getSafeCharPref(gPreferenceService, prefLDAPURI);
	// Initialize global variable. Used to update preference of the LDAP list
	gAutoCompletePref = prefLDAP;
	dump("\t\tGet preferences value for "+ prefLDAPURI +"='" + prefLDAP + "'.\n");
	if (aPopup) 
	{
		var childs = aPopup.childNodes;
		if (childs){
		    var arrayPreferences = gAutoCompletePref.split(',');
			for (var i = 0 ; i< childs.length; i++)
		  	{
		  		if ( (childs[i].localName == "listitem") ){
		  			var listCell = childs[i].childNodes;
		  			var checkBox = listCell[0].childNodes;
					// Retrieve the LDAP URI from check box ID
		  			var checkBoxID = checkBox[0].getAttribute("id");
					{//Update check control value, Test if pref contains ldapPrefValue to initialize checkboxes
						checkBox[0].checked = isInPreferenceSeverList(checkBoxID, arrayPreferences);
					}
					dump("\t\tUpdate check box ID='" + checkBoxID + "' set to '" + checkBox[0].checked + "'.\n");
				}
		  	}
		} else {
			dump("\t\tNothing to update.\n");
		}
	}
	dump("\tupdateCheckBoxList ended.\n");
}

function removeMultiLDAPDirectoriesList()
{
	dump("removeMultiLDAPDirectoriesList started.\n");

	var directoriesListBox = document.getElementById("LDAPList");
	if (directoriesListBox){
		removeCheckBoxList( directoriesListBox);
	}
	dump("removeMultiLDAPDirectoriesList ended.\n");
}

function removeCheckBoxList(aPopup)
{
	var prefCount = {value:0};
	var description = "";
	var item;
	var j=0;
	var arrayOfDirectories;
	var position;
	var dirType;
	var uri;

	dump("\tremoveCheckBoxList started.\n");

	if (aPopup) 
	{
		var childs = aPopup.childNodes;
		var tabs = 2;
		if (childs){
			for (var i = 0 ; i< childs.length; i++)
			{
				if ( (childs[i].localName == "listitem") ){
					dumpWithTabs( tabs, "Remove child ID='" + childs[i].id + "'.");
					tabs = removeChilds( ++tabs, childs[i] );
					aPopup.removeChild(childs[i]);
					dumpWithTabs( tabs, "...");
					i = 0;
				}
			}
		} else {
			dump("\t\tNothing to update.\n");
		}
	}
	dump("\tremoveCheckBoxList ended.\n");
}

function removeChilds( tabs, child){
	while (child.hasChildNodes()){
		dumpWithTabs( tabs, "Remove child ID='" + child.lastChild.id + "'.");
		if(child.lastChild.hasChildNodes()){
			tabs = removeChilds( ++tabs, child.lastChild);
		}
		child.removeChild(child.lastChild);
		dumpWithTabs( tabs, "..." );
	}
	--tabs;
	return tabs;
}
	
function dumpWithTabs( tabs, message ){
	while( tabs > 0 ){
		dump("\t");
		tabs--;
	}
	dump( message + "\n" );
}

// Enable or disable the LDAPList control
function enableCustomPreferences(target) 
{
	var list = document.getElementById("LDAPList");
	if (document.getElementById("ldap_2.identity.id.multi_ldap_use_custom_preferences").checked == false) 
	{
		disableListBox(list, true);
	}
	else
	{
		disableListBox(list, false);
	}
}

/*
* Rebuild the LDAP list prefernce selected by the user.
* Return : string that contain all LDAP name separated by coma. This is saved in the 
* Added for correction of the entry ID 484
*/
function updateLDAPServerListPreference(target)
{
	dump("Update preference temporary.\n");
	return buildPreferenceValue(target);
}
	
//Function which deal user event on LDAP AutoComplete List
function buildPreferenceValue(target){
	dump("buildPreferenceValue() started.\n");
	var list = document.getElementById("LDAPList");
	var item = list.currentItem;
	var nameCell = 	item.childNodes.item(0);
	var checkbox = nameCell.firstChild;
	dump("\t" + nameCell.tagName+" > ");
	dump(checkbox.getAttribute("label")+" : ");
	dump(nameCell.getAttribute("value")+" is " +checkbox.checked+ ".\n");
	var newPreference = buildLDAPlistString(nameCell.getAttribute("value"), checkbox.checked);
	dump("buildPreferenceValue() ended.\n");
	return newPreference;
}

/*
 * Get preference safety, if preference does not exist it returns empty string
 */
function buildLDAPlistString(LDAPUri, checked){
	dump("\tbuildLDAPlistString() started\n");

    dump("\t\tCurrent selected item : '" + LDAPUri + "'.\n");
    // OBr 18/07/07 correction of the entry ID 484
	var autoCompletePref = gAutoCompletePref;
    dump("\t\tOld preference : '" + gAutoCompletePref + "'.\n");
    
    var allPrefs = autoCompletePref.split(',');
    
    var prefsFiltered = removeFromArray(LDAPUri, allPrefs);
   
   	if (checked)
   		prefsFiltered.push(LDAPUri);
   	
	gAutoCompletePref = convertPrefArrayToString(prefsFiltered);
	dump("\t\tNew preference : '" + gAutoCompletePref + "'.\n");
	dump("\tbuildLDAPlistString() ended.\n");
	return gAutoCompletePref;
}

//Helper function return an array minus an value
function removeFromArray(value, allPrefs){
	var prefs = new Array();
	
	for (var i = 0; i < allPrefs.length; i++){
		if (allPrefs[i] != value)
			prefs.push(allPrefs[i]);
	}
	return prefs;
}

//Convert an Array to an String with coma
function convertPrefArrayToString(array){
	var s = "";
	
	for (var i = 0 ; i < array.length ; i++){
		if (array[i].length != 0){
			s+=array[i];
			s +=',';
		}
	}
	return s.slice(0,-1);
}

// Check the name of server if it was found in the preference
function isInPreferenceSeverList(nameToCheck, array){
	for (var i = 0; i < array.length; i++){
		if (array[i] == nameToCheck)
			return true;
	}
	return false;
}

/*
 * Check the validity of the server list prefernece after an edit of the LDAP server list.
 * Remove the deleted server in the preference string.
 */
function checkPreferenceServerValidity(serverToCheck){
	var arraySeverPreference = gOriginalPreference.split(',');
	arraySeverPreference = removeFromArray(serverToCheck, arraySeverPreference);
	return convertPrefArrayToString(arraySeverPreference);
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

function disableListBox(list, bool){
	//see Bugzilla Bug 338156
	var childs = list.childNodes;
	if (!childs)
		return;	

	for (var i = 0 ; i< childs.length; i++)
  	{
  		 if ( (childs[i].localName == "listitem") ){
  			if (bool == true){
  				var c = childs[i].childNodes;
  				c[0].setAttribute("disabled", "true");
  				var checkbox = c[0].childNodes;
  				checkbox[0].setAttribute("disabled", "true");
  			}
  		 	else{
  		 		var c = childs[i].childNodes;
  				c[0].removeAttribute("disabled");
  				var checkbox = c[0].childNodes;
  				checkbox[0].removeAttribute("disabled");
  		 	}
  		 }
  	}
}