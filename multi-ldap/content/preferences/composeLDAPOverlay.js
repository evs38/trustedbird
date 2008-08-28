/* - ***** BEGIN LICENSE BLOCK *****
   - Version: MPL 1.1/GPL 2.0/LGPL 2.1
   -
   - The contents of this file are subject to the Mozilla Public License Version
   - 1.1 (the "License"); you may not use this file except in compliance with
   - the License. You may obtain a copy of the License at
   - http://www.mozilla.org/MPL/
   -
   - Software distributed under the License is distributed on an "AS IS" basis,
   - WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
   - for the specific language governing rights and limitations under the
   - License.
   -
   - The Original Code is the Thunderbird Preferences System.
   -
   - The Initial Developer of the Original Code is
   - Scott MacGregor.
   - Portions created by the Initial Developer are Copyright (C) 2005
   - the Initial Developer. All Rights Reserved.
   -
   - Contributor(s):
   -   Scott MacGregor <mscott@mozilla.org>
   -   Olivier Parniere BT Global Services / Etat francais Ministere de la Defense
   -   Olivier Brun BT Global Services / Etat francais Ministere de la Defense
   -
   - Alternatively, the contents of this file may be used under the terms of
   - either the GNU General Public License Version 2 or later (the "GPL"), or
   - the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
   - in which case the provisions of the GPL or the LGPL are applicable instead
   - of those above. If you wish to allow use of your version of this file only
   - under the terms of either the GPL or the LGPL, and not to allow others to
   - use your version of this file under the terms of the MPL, indicate your
   - decision by deleting the provisions above and replace them with the notice
   - and other provisions required by the LGPL or the GPL. If you do not delete
   - the provisions above, a recipient may use your version of this file under
   - the terms of any one of the MPL, the GPL or the LGPL.
   -
   - ***** END LICENSE BLOCK ***** */

const kLDAPPrefContractID="@mozilla.org/ldapprefs-service;1";
const MULTI_LDAP_PREF_LDAP_SERVERS = "ldap_2.autoComplete.directoryServers";

var gRefresh = false; // leftover hack from the old preferences dialog

//Set to true to activate traces in console
var bActiveDump = false;

var gComposePane = {
  mInitialized: false,
  mDirectories: null,
  mLDAPPrefsService: null,
  mSpellChecker: null,
  mDictCount : 0,
  // Original preference to save preference with only the valid server
  mOriginalPreference: null,
  // OBr 18/07/07 correction of the entry ID 484
  mAutoCompletePref: null,
  invalidDirectories: new Array(),

  init: function ()
  {
    if (kLDAPPrefContractID in Components.classes)
      this.mLDAPPrefsService = Components.classes[kLDAPPrefContractID].getService(Components.interfaces.nsILDAPPrefsService);

	var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	var prefs = prefService.getBranch(null);

	//Initialize console traces
	bActiveDump = prefs.getBoolPref("javascript.options.showInConsole");

    this.createDirectoriesList();

    // build the local address book menu list. We do this by hand instead of using the xul template
    // builder because of Bug #285076,
    this.createLocalDirectoriesList();

    // build the LDAP address book server list box. We do this by hand instead of using the xul template
 	this.initMultiLDAPDirectoriesList();

    //this.enableAutocomplete();

    this.initLanguageMenu();

    this.populateFonts();

    document.getElementById('downloadDictionaries').setAttribute('href', this.getDictionaryURL());

    var preference = document.getElementById("mail.preferences.compose.selectedTabIndex");
    if (preference.value)
      document.getElementById("composePrefs").selectedIndex = preference.value;
    this.mInitialized = true;
  },

  getDictionaryURL: function()
  {
    var formatter = Components.classes["@mozilla.org/toolkit/URLFormatterService;1"]
                    .getService(Components.interfaces.nsIURLFormatter);

    return formatter.formatURLPref("spellchecker.dictionaries.download.url");
  },

  tabSelectionChanged: function ()
  {
    if (this.mInitialized)
    {
      var preference = document.getElementById("mail.preferences.compose.selectedTabIndex");
      preference.valueFromPreferences = document.getElementById("composePrefs").selectedIndex;
    }
  },

  sendOptionsDialog: function()
  {
    document.documentElement.openSubDialog("chrome://messenger/content/preferences/sendoptions.xul","", null);
  },

  htmlComposeDialog: function()
  {
    document.documentElement.openSubDialog("chrome://messenger/content/preferences/htmlcompose.xul","", null);
  },

  enableAutocomplete: function()
  {
	var list = document.getElementById("LDAPList");
	if (document.getElementById("autocompleteLDAP").checked == false)
	{
		disableListBox(list, true);
		document.getElementById("autocompleteMinStringLength").disabled = true;
		document.getElementById("editButton").disabled = true;
	}
	else
	{
		disableListBox(list, false);
		document.getElementById("autocompleteMinStringLength").disabled = false;
		document.getElementById("editButton").disabled = false;
	}
  },

  createLocalDirectoriesList: function ()
  {
    var abPopup = document.getElementById("abPopup-menupopup");

    if (abPopup)
      this.loadLocalDirectories(abPopup);
  },

  loadLocalDirectories: function (aPopup)
  {
    var rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"]
                     .getService(Components.interfaces.nsIRDFService);

    var parentDir = rdfService.GetResource("moz-abdirectory://").QueryInterface(Components.interfaces.nsIAbDirectory);
    var enumerator = parentDir.childNodes;
    var preference = document.getElementById("mail.collect_addressbook");

    if (enumerator)
    {
      while (enumerator.hasMoreElements())
      {
        var addrbook = enumerator.getNext();
        if (addrbook instanceof Components.interfaces.nsIAbDirectory && !addrbook.isRemote && !addrbook.isMailList)
        {
          var abURI = addrbook.directoryProperties.URI;
          item = document.createElement("menuitem");
          item.setAttribute("label", addrbook.dirName);
          item.setAttribute("value", abURI);
          aPopup.appendChild(item);
          if (preference.value == abURI)
          {
            aPopup.parentNode.value = abURI;
            aPopup.selectedItem = item;
          }
        }
      }
    }
  },

  createDirectoriesList: function()
  {
    var directoriesListPopup = document.getElementById("directoriesListPopup");

    if (directoriesListPopup)
      this.loadDirectories(directoriesListPopup);
  },

  loadDirectories: function(aPopup)
  {
    var prefCount = {value:0};
    var description = "";
    var item;
    var j=0;
    var arrayOfDirectories;
    var position;
    var dirType;
    var prefService;

    prefService = Components.classes["@mozilla.org/preferences-service;1"]
                            .getService(Components.interfaces.nsIPrefBranch);

    if (!this.mDirectories)
    {
      try
      {
        if (this.mLDAPPrefsService)
          arrayOfDirectories = this.mLDAPPrefsService.getServerList(prefService, prefCount);
      }
      catch (ex) {}

      if (arrayOfDirectories)
      {
        this.mDirectories = new Array();
        for (var i = 0; i < prefCount.value; i++)
        {
          if ((arrayOfDirectories[i] != "ldap_2.servers.pab") &&
            (arrayOfDirectories[i] != "ldap_2.servers.history"))
          {
            try
            {
              position = prefService.getIntPref(arrayOfDirectories[i]+".position");
            }
             catch(ex)
            {
              position = 1;
            }

            try
            {
              dirType = prefService.getIntPref(arrayOfDirectories[i]+".dirType");
            }
            catch(ex)
            {
              dirType = 1;
            }

            if ((position != 0) && (dirType == 1))
            {
              try
              {
                description = prefService.getComplexValue(arrayOfDirectories[i]+".description",
                                                       Components.interfaces.nsISupportsString).data;
              }
              catch(ex)
              {
                description="";
              }

              if (description != "")
              {
                if (aPopup)
                {
                  item = document.createElement("menuitem");
                  item.setAttribute("label", description);
                  item.setAttribute("value", arrayOfDirectories[i]);
                  aPopup.appendChild(item);
                }

                this.mDirectories[j++] = {value:arrayOfDirectories[i], label:description};
              }
            }
          }
        }

        if (aPopup)
        {
          // we are in mail/news Account settings
          item = document.createElement("menuitem");
          var addressBookBundle = document.getElementById("bundle_addressBook");
          var directoryName = addressBookBundle.getString("directoriesListItemNone");
          item.setAttribute("label", directoryName);
          item.setAttribute("value", "");
          aPopup.appendChild(item);

          // Now check what we are displaying is valid.
          var directoriesList =  document.getElementById("directoriesList");
          var value = directoriesList.value;
          directoriesList.selectedItem = null;
          directoriesList.value = value;
          if (!directoriesList.selectedItem)
          {
            directoriesList.value = "";
            // If we have no other directories, also disable the popup.
            if (gAvailDirectories.length == 0)
              directoriesList.disabled = true;
          }
          else if (!prefService.prefIsLocked("ldap_2.autoComplete.directoryServer"))
            directoriesList.disabled = false;
        }
      }
    }
  },

  editDirectories: function()
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

    this.mDirectories = null;
    this.loadDirectories(popup);
    
    // Remove LDAP server list to update list box
	this.removeMultiLDAPDirectoriesList();
	// Create LDAP server list with new list
	this.createMultiLDAPDirectoriesList();
	
    gRefresh = false;
  },

  initLanguageMenu: function ()
  {
    var languageMenuList = document.getElementById("languageMenuList");
    this.mSpellChecker = Components.classes['@mozilla.org/spellchecker/myspell;1'].getService(Components.interfaces.mozISpellCheckingEngine);
    var o1 = {};
    var o2 = {};

    // Get the list of dictionaries from
    // the spellchecker.

    this.mSpellChecker.getDictionaryList(o1, o2);

    var dictList = o1.value;
    var count    = o2.value;

    // if we don't have any dictionaries installed, disable the menu list
    languageMenuList.disabled = !count;

    // If dictionary count hasn't changed then no need to update the menu.
    if (this.mDictCount == count)
      return;

    // Store current dictionary count.
    this.mDictCount = count;

    // Load the string bundles that will help us map
    // RFC 1766 strings to UI strings.

    // Load the language string bundle.
    var languageBundle = document.getElementById("languageBundle");
    var regionBundle = null;
    // If we have a language string bundle, load the region string bundle.
    if (languageBundle)
      regionBundle = document.getElementById("regionBundle");

    var menuStr2;
    var isoStrArray;
    var langId;
    var langLabel;
    var i;

    for (i = 0; i < count; i++)
    {
      try {
        langId = dictList[i];
        isoStrArray = dictList[i].split("-");

        if (languageBundle && isoStrArray[0])
          langLabel = languageBundle.getString(isoStrArray[0].toLowerCase());

        if (regionBundle && langLabel && isoStrArray.length > 1 && isoStrArray[1])
        {
          menuStr2 = regionBundle.getString(isoStrArray[1].toLowerCase());
          if (menuStr2)
            langLabel += "/" + menuStr2;
        }

        if (langLabel && isoStrArray.length > 2 && isoStrArray[2])
          langLabel += " (" + isoStrArray[2] + ")";

        if (!langLabel)
          langLabel = langId;
      } catch (ex) {
        // getString throws an exception when a key is not found in the
        // bundle. In that case, just use the original dictList string.
        langLabel = langId;
      }
      dictList[i] = [langLabel, langId];
    }

    // sort by locale-aware collation
    dictList.sort(
      function compareFn(a, b)
      {
        return a[0].localeCompare(b[0]);
      }
    );

    // Remove any languages from the list.
    var languageMenuPopup = languageMenuList.firstChild;
    while (languageMenuPopup.hasChildNodes())
      languageMenuPopup.removeChild(languageMenuPopup.firstChild);

    // append the dictionaries to the menu list...
    for (i = 0; i < count; i++)
      languageMenuList.appendItem(dictList[i][0], dictList[i][1]);

    languageMenuList.setInitialSelection();
  },

  populateFonts: function()
  {
    var fontsList = document.getElementById("FontSelect");
    try
    {
      var enumerator = Components.classes["@mozilla.org/gfx/fontenumerator;1"]
                                 .getService(Components.interfaces.nsIFontEnumerator);
      var localFontCount = { value: 0 }
      var localFonts = enumerator.EnumerateAllFonts(localFontCount);
      for (var i = 0; i < localFonts.length; ++i)
      {
        if (localFonts[i] != "")
          fontsList.appendItem(localFonts[i], localFonts[i]);
      }
    }
    catch(e) { }
   },

   restoreHTMLDefaults: function()
   {
     // reset throws an exception if the pref value is already the default so
     // work around that with some try/catch exception handling
     try {
       document.getElementById('msgcompose.font_face').reset();
     } catch (ex) {}

     try {
       document.getElementById('msgcompose.font_size').reset();
     } catch (ex) {}

     try {
       document.getElementById('msgcompose.text_color').reset();
     } catch (ex) {}

     try {
       document.getElementById('msgcompose.background_color').reset();
     } catch (ex) {}
   },  

	//Init preference string to Create list of the LDAP server in the list box LDAPList
	initMultiLDAPDirectoriesList: function()
	{
		var uri;
		var prefService = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch);
		//URI of All Autocomplete repositories
		var prefLDAPURI = MULTI_LDAP_PREF_LDAP_SERVERS;
		// Initialize global variable. Used to update preference of the LDAP list
		mOriginalPreference = mAutoCompletePref = getSafeCharPref(prefService, prefLDAPURI);
		displayTrace("initMultiLDAPDirectoriesList "+ prefLDAPURI +"='" + mAutoCompletePref + "'.");

		this.createMultiLDAPDirectoriesList();
	},
	
	//Create list of the LDAP server in the list box LDAPList
	createMultiLDAPDirectoriesList: function()
	{
		displayTrace("createMultiLDAPDirectoriesList started.");

		var directoriesListBox = document.getElementById("LDAPList");
		if (directoriesListBox){
			this.createCheckBoxList( directoriesListBox);
		}
		//URI of All Autocomplete repositories
		var prefLDAPURI = MULTI_LDAP_PREF_LDAP_SERVERS;
		var prefService = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch);
		// Update the preferences string and mAutoCompletePref when a server has been deleted
		var tempPref = getSafeCharPref(prefService, prefLDAPURI);
		var tempPrefArray = tempPref.split(',');
		var tempAutoCompletePrefArray = mAutoCompletePref.split(',');
		for (var i = 0; i < invalidDirectories.length; i++) {
			tempPrefArray = removeFromArray(invalidDirectories[i], tempPrefArray);
			//tempAutoCompletePrefArray = removeFromArray(invalidDirectories[i], tempAutoCompletePrefArray);
		}
		prefService.setCharPref(prefLDAPURI, tempPrefArray.join(","));
		mAutoCompletePref = tempAutoCompletePrefArray.join(",");

		//Enable LDAP list control
		this.enableAutocomplete();
		displayTrace("createMultiLDAPDirectoriesList ended.");
	},

	createCheckBoxList: function(aPopup)
	{
		var prefCount = {value:0};
		var description = "";
		var item;
		var j=0;
		var arrayOfDirectories;
		var position;
		var dirType;
		var prefService;

		invalidDirectories = new Array();
		
		displayTrace("\tloadDirectoriesCheckBox started.");
		displayTrace("\t\tInitialize check box with preferences '"+ mAutoCompletePref + "'.");
		if (!this.mDirectories)
			this.loadDirectories();
		{
			prefService = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch);

			try 
			{
				if (this.mLDAPPrefsService)
					arrayOfDirectories = this.mLDAPPrefsService.getServerList(prefService, prefCount);
			}
			catch (ex) {}

			if (arrayOfDirectories) 
			{
			    var arrayPreferences = mAutoCompletePref.split(',');
				for (var i = 0; i < prefCount.value; i++)
				{
					if ((arrayOfDirectories[i] != "ldap_2.servers.pab") && 
						(arrayOfDirectories[i] != "ldap_2.servers.history")) 
					{
						try 
						{
							position = prefService.getIntPref(arrayOfDirectories[i]+".position");
						}
						catch(ex)
						{
							position = 1;
						}

						try
						{
							dirType = prefService.getIntPref(arrayOfDirectories[i]+".dirType");
						}
						catch(ex)
						{
							dirType = 1;
						}

						if ((position != 0) && (dirType == 1)) 
						{
							displayTrace( "\t\tTreat entry name =>'" + arrayOfDirectories[i]+"'" );
							try
							{
								description = prefService.getComplexValue(arrayOfDirectories[i]+".description",
									Components.interfaces.nsISupportsString).data;
							}
							catch(ex)
							{
								description="";
							}

							if (description != "") 
							{
								if (aPopup) 
								{
									var checked = isInPreferenceServerList(arrayOfDirectories[i], arrayPreferences);

									item = this.createCheckBoxItem( i, description, arrayOfDirectories[i], checked );
									if ( item ) 
										aPopup.appendChild(item);
								}
							}
						}
						else
						{
							mOriginalPreference = this.checkPreferenceServerValidity(arrayOfDirectories[i]);
							invalidDirectories.push(arrayOfDirectories[i]);
						}
					}
				}
			}
		}
		displayTrace("\tloadDirectoriesCheckBox ended.");
	},

	/* 
	 * Create an entry for each LDAP server like this
	 *	<listitem allowevents="true">
	 *		<listcell  value="Directory URI">
	 *			<checkbox label="LDAP Name" />
	 *		</listcell>
	 *	</listitem>
	 */
	createCheckBoxItem :function( index, name, value, checked)
	{
		displayTrace("\t\t\tCreate field " + index + " name='" + name + "' value='" + value + "' set to '" + checked + "'.");
		var item = document.createElement('listitem');
	    item.setAttribute("id", "listitem" + index);
	    item.setAttribute("allowevents", "true");
		var listCell = document.createElement( 'listcell');  
	    listCell.setAttribute("id", "listcell" + index);
		listCell.setAttribute('type', "checkbox");
		listCell.setAttribute( 'value', value);
		item.appendChild( listCell);
		var checkBox = document.createElement('checkbox');
		checkBox.setAttribute( 'id', value); // Set the LDAP URI as ID of the check box
		checkBox.setAttribute( 'checked', checked);
		checkBox.setAttribute( 'label', name);
		listCell.appendChild( checkBox );
		return( item);
	},

	removeMultiLDAPDirectoriesList: function()
	{
		displayTrace("removeMultiLDAPDirectoriesList started.");

		var directoriesListBox = document.getElementById("LDAPList");
		if (directoriesListBox){
			this.removeCheckBoxList( directoriesListBox);
		}
		displayTrace("removeMultiLDAPDirectoriesList ended.");
	},

	removeCheckBoxList: function(aPopup)
	{
		var prefCount = {value:0};
		var description = "";
		var item;
		var j=0;
		var arrayOfDirectories;
		var position;
		var dirType;
		var prefService;
		var uri;

		displayTrace("\tremoveCheckBoxList started.");

		if (aPopup) 
		{
			var childs = aPopup.childNodes;
			var tabs = 2;
			if (childs){
				for (var i = 0 ; i< childs.length; i++)
			  	{
			  		if ( (childs[i].localName == "listitem") ){
						this.dumpWithTabs( tabs, "Remove child ID='" + childs[i].id + "'.");
						tabs = this.removeChilds( ++tabs, childs[i] );
						aPopup.removeChild(childs[i]);
						this.dumpWithTabs( tabs, "...");
						i = 0;
					}
			  	}
			} else {
				displayTrace("\t\tNothing to update.");
			}
		}
		displayTrace("\tremoveCheckBoxList ended.");
	},

	removeChilds: function( tabs, child){
		while (child.hasChildNodes()){
			this.dumpWithTabs( tabs, "Remove child ID='" + child.lastChild.id + "'.");
			if(child.lastChild.hasChildNodes()){
				tabs = this.removeChilds( ++tabs, child.lastChild);
			}
			child.removeChild(child.lastChild);
			this.dumpWithTabs( tabs, "..." );
		}
		--tabs;
		return tabs;
	},
	
	/*
	* Rebuild the LDAP list prefernce selected by the user.
	* Return : string that contain all LDAP name separated by coma. This is saved in the 
	* Added for correction of the entry ID 484
	*/
   updateLDAPServerListPreference : function(target)
	{
		displayTrace("Update preference temporary.");
		return buildPreferenceValue(target);
	},
	
	/*
	 * Check the validity of the server list prefernece after an edit of the LDAP server list.
	 * Remove the deleted server in the preference string.
	 */
	checkPreferenceServerValidity : function(serverToCheck)
	{
	    var arrayServerPreference = mOriginalPreference.split(',');
		arrayServerPreference = removeFromArray(serverToCheck, arrayServerPreference);
		return convertPrefArrayToString(arrayServerPreference);
	},
	
	dumpWithTabs : function( tabs, message )
	{
		if( bActiveDump == false )
			return;
		while( tabs > 0 ){
			dump("\t");
			tabs--;
		}
		displayTrace( message );
	}
}

//Function which deal user event on LDAP AutoComplete List
function buildPreferenceValue(target){
	displayTrace("buildPreferenceValue() started.");
	var list = document.getElementById("LDAPList");
	var item = list.currentItem;
	var nameCell = 	item.childNodes.item(0);
	var checkbox = nameCell.firstChild;
	var sMessage = "\t" + nameCell.tagName+" > ";
	sMessage += checkbox.getAttribute("label")+" : ";
	displayTrace(sMessage + nameCell.getAttribute("value")+" is " +checkbox.checked+ ".");
	var newPreference = buildLDAPlistString(nameCell.getAttribute("value"), checkbox.checked);
	displayTrace("buildPreferenceValue() ended.");
	return newPreference;
}

function buildLDAPlistString(LDAPUri, checked){
	displayTrace("\tbuildLDAPlistString() started");

   displayTrace("\t\tCurrent selected item : '" + LDAPUri + "'.");
   // OBr 18/07/07 correction of the entry ID 484
	var autoCompletePref = mAutoCompletePref;
   displayTrace("\t\tOld preference : '" + mAutoCompletePref + "'.");
   
   var allPrefs = autoCompletePref.split(',');
   
   var prefsFiltered = removeFromArray(LDAPUri, allPrefs);
  
  	if (checked)
  		prefsFiltered.push(LDAPUri);
  	
  	mAutoCompletePref = convertPrefArrayToString(prefsFiltered);
	displayTrace("\t\tNew preference : '" + mAutoCompletePref + "'.");
	displayTrace("\tbuildLDAPlistString() ended.");
	return mAutoCompletePref;
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

//Check the name of server if it was found in the preference
function isInPreferenceServerList(nameToCheck, array){
	displayTrace("Check " + nameToCheck );
	for (var i = 0; i < array.length; i++){
		if (array[i] == nameToCheck){
			displayTrace( "\t" + nameToCheck + " found with it " + array[i] );
			return true;
		}
	}
	displayTrace( nameToCheck + " not found");
	return false;
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

/*
* Get preference safety, if preference does not exist it returns true boolean
*/
function getSafeBoolPref(prefService, uri){
	var value = true;
	try {
		value = prefService.getBoolPref(uri);
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

//Display trace in console if bActiveDump is set to true
function displayTrace(pMessage) {
	if( bActiveDump == false )
		return;
	dump(pMessage + "\n");
}

/* Get current value of minStringLength from preferences - text box "autocompleteMinStringLength" */
function multildap_loadAutocompleteMinStringLength(preferenceName) {
	var minStringLength = 2;
	try {
	    var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);
	    minStringLength = prefService.getIntPref(preferenceName);
	    if (!(minStringLength >= 1 && minStringLength <= 99)) minStringLength = 2;
	} catch(e) {}
	
	return minStringLength;
}
