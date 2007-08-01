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

var gComposePane = {
	mInitialized: false,
	mDirectories: null,
	mLDAPPrefsService: null,
	mSpellChecker: null,
	// Original preference to save preference with only the valid server
	mOriginalPreference: null,
	// OBr 18/07/07 correction of the entry ID 484
	mAutoCompletePref: null,
	mDictCount : 0,

  init: function ()
  {
    if (kLDAPPrefContractID in Components.classes)
      this.mLDAPPrefsService = Components.classes[kLDAPPrefContractID].getService(Components.interfaces.nsILDAPPrefsService);

    this.createDirectoriesList();
    
    // build the local address book menu list. We do this by hand instead of using the xul template
    // builder because of Bug #285076, 
    this.createLocalDirectoriesList();
    
    // build the LDAP address book server list box. We do this by hand instead of using the xul template
 	this.initMultiLDAPDirectoriesList();

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
    
    var prefService = Components.classes["@mozilla.org/preferences-service;1"]
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
    this.mSpellChecker = Components.classes['@mozilla.org/spellchecker/myspell;1'].getService(Components.interfaces.mozISpellCheckingEngine);
    var o1 = {};
    var o2 = {};

    // Get the list of dictionaries from
    // the spellchecker.

    this.mSpellChecker.getDictionaryList(o1, o2);

    var dictList = o1.value;
    var count    = o2.value;

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

    var languageMenuList = document.getElementById("languageMenuList");
    // Remove any languages from the list.
    var languageMenuPopup = languageMenuList.firstChild;
    while (languageMenuPopup.hasChildNodes())
      languageMenuPopup.removeChild(languageMenuPopup.firstChild);

    var curLang  = languageMenuList.value;
    var defaultItem = null;

    for (i = 0; i < count; i++)
    {
      var item = languageMenuList.appendItem(dictList[i][0], dictList[i][1]);
      if (curLang && dictList[i][1] == curLang)
        defaultItem = item;
    }

    // Now make sure the correct item in the menu list is selected.
    if (defaultItem)
      languageMenuList.selectedItem = defaultItem;
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
	
	//Init prefernce string to Create list of the LDAP server in the list box LDAPList
	initMultiLDAPDirectoriesList: function()
	{
		var uri;
		var prefService = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch);
		//URI of All Autocomplete repositories
		var prefLDAPURI = "ldap_2.autoComplete.ldapServers";
		// Initialize global variable. Used to update preference of the LDAP list
		mOriginalPreference = mAutoCompletePref = getSafeCharPref(prefService, prefLDAPURI);
		dump("initMultiLDAPDirectoriesList "+ prefLDAPURI +"='" + mAutoCompletePref + "'.\n");

		this.createMultiLDAPDirectoriesList();
	},
	
	//Create list of the LDAP server in the list box LDAPList
	createMultiLDAPDirectoriesList: function()
	{
		dump("createMultiLDAPDirectoriesList started.\n");

		var directoriesListBox = document.getElementById("LDAPList");
		if (directoriesListBox){
			this.createCheckBoxList( directoriesListBox);
		}
		//URI of All Autocomplete repositories
		var prefLDAPURI = "ldap_2.autoComplete.ldapServers";
		var prefService = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch);
		// Update the preferences string when a server has been deleted
		prefService.setCharPref(prefLDAPURI, mOriginalPreference);

		//Enable LDAP list control
		this.enableAutocomplete();
		dump("createMultiLDAPDirectoriesList ended.\n");
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

		dump("\tloadDirectoriesCheckBox started.\n");
		dump("\t\tInitialize check box with preferences '"+ mAutoCompletePref + "'.\n");
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
							dump( "\t\tTreat entry name =>'" + arrayOfDirectories[i]+"'\n" );
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
									var checked = isInPreferenceSeverList(arrayOfDirectories[i], arrayPreferences);

									item = this.createCheckBoxItem( i, description, arrayOfDirectories[i], checked );
									if ( item ) 
										aPopup.appendChild(item);
								}
							}
						}
						else
						{
							mOriginalPreference = this.checkPreferenceServerValidity(arrayOfDirectories[i]);
						}
					}
				}
			}
		}
		dump("\tloadDirectoriesCheckBox ended.\n");
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
		dump("\t\t\tCreate field " + index + " name='" + name + "' value='" + value + "' set to '" + checked + "'.\n");
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
		dump("removeMultiLDAPDirectoriesList started.\n");

		var directoriesListBox = document.getElementById("LDAPList");
		if (directoriesListBox){
			this.removeCheckBoxList( directoriesListBox);
		}
		dump("removeMultiLDAPDirectoriesList ended.\n");
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

		dump("\tremoveCheckBoxList started.\n");

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
				dump("\t\tNothing to update.\n");
			}
		}
		dump("\tremoveCheckBoxList ended.\n");
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
	
	dumpWithTabs : function( tabs, message ){
		while( tabs > 0 ){
			dump("\t");
			tabs--;
		}
		dump( message + "\n" );
	},

	// Enable or disable the LDAPList control
	enableAutocomplete: function() 
	{
		var list = document.getElementById("LDAPList");
		if (document.getElementById("autocompleteLDAP").checked == false) 
		{
			disableListBox(list, true);
		}
		else
		{
			disableListBox(list, false);
		}
		// if we do not have any directories disable the dropdown list box
		if (!this.mDirectories || (this.mDirectories < 1))
			directoriesList.setAttribute("disabled", true);  
	},
 
	/*
	* Rebuild the LDAP list prefernce selected by the user.
	* Return : string that contain all LDAP name separated by coma. This is saved in the 
	* Added for correction of the entry ID 484
	*/
    updateLDAPServerListPreference : function(target)
	{
		dump("Update preference temporary.\n");
		return buildPreferenceValue(target);
	},
	
	/*
	 * Check the validity of the server list prefernece after an edit of the LDAP server list.
	 * Remove the deleted server in the preference string.
	 */
	checkPreferenceServerValidity : function(serverToCheck)
	{
	    var arraySeverPreference = mOriginalPreference.split(',');
		arraySeverPreference = removeFromArray(serverToCheck, arraySeverPreference);
		return convertPrefArrayToString(arraySeverPreference);
	}

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

function buildLDAPlistString(LDAPUri, checked){
	dump("\tbuildLDAPlistString() started\n");

    dump("\t\tCurrent selected item : '" + LDAPUri + "'.\n");
    // OBr 18/07/07 correction of the entry ID 484
	var autoCompletePref = mAutoCompletePref;
    dump("\t\tOld preference : '" + mAutoCompletePref + "'.\n");
    
    var allPrefs = autoCompletePref.split(',');
    
    var prefsFiltered = removeFromArray(LDAPUri, allPrefs);
   
   	if (checked)
   		prefsFiltered.push(LDAPUri);
   	
   	mAutoCompletePref = convertPrefArrayToString(prefsFiltered);
	dump("\t\tNew preference : '" + mAutoCompletePref + "'.\n");
	dump("\tbuildLDAPlistString() ended.\n");
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

// Check the name of server if it was found in the preference
function isInPreferenceSeverList(nameToCheck, array){
	dump("Check " + nameToCheck + "\n");
	for (var i = 0; i < array.length; i++){
		if (array[i] == nameToCheck){
			dump( "\t" + nameToCheck + " found with it " + array[i] + "\n");
			return true;
		}
	}
	dump( nameToCheck + " not found\n");
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