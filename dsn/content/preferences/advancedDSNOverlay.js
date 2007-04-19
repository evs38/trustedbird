
var gAdvancedPane = {
  mPane: null,
  mInitialized: false,

  init: function ()
  {
    this.mPane = document.getElementById("paneAdvanced");
    this.updateMarkAsReadTextbox(false);

    if ("arguments" in window && window.arguments[1] && document.getElementById(window.arguments[1]))
      document.getElementById("advancedPrefs").selectedTab = document.getElementById(window.arguments[1]);
    else 
    {    
      var preference = document.getElementById("mail.preferences.advanced.selectedTabIndex");
      if (preference.value)
        document.getElementById("advancedPrefs").selectedIndex = preference.value;
    }

    this.updateAppUpdateItems();
    this.updateAutoItems();
    this.updateModeItems();   

    this.mInitialized = true;
  },

  tabSelectionChanged: function ()
  {
    if (this.mInitialized)
    {
      document.getElementById("mail.preferences.advanced.selectedTabIndex")
              .valueFromPreferences = document.getElementById("advancedPrefs").selectedIndex;
    }
  },

  showConfigEdit: function()
  {
    document.documentElement.openWindow("Preferences:ConfigManager",
                                        "chrome://global/content/config.xul",
                                        "", null);
  },

  updateButtons: function (aButtonID, aPreferenceID)
  {
    var button = document.getElementById(aButtonID);
    var preference = document.getElementById(aPreferenceID);
    // This is actually before the value changes, so the value is not as you expect. 
    button.disabled = preference.value == true;
    return undefined;
  },

  /**
   * UI state matrix for update preference conditions
   * 
   * UI Components:                                     Preferences
   * 1 = Thunderbird checkbox                               i   = app.update.enabled
   * 2 = When updates for Thunderbird are found label       ii  = app.update.auto
   * 3 = Automatic Radiogroup (Ask vs. Automatically)       iii = app.update.mode
   * 4 = Warn before disabling extensions checkbox
   * 
   * States:
   * Element     p   val     locked    Disabled 
   * 1           i   t/f     f         false 
   *             i   t/f     t         true
   *             ii  t/f     t/f       false
   *             iii 0/1/2   t/f       false
   * 2,3         i   t       t/f       false
   *             i   f       t/f       true
   *             ii  t/f     f         false
   *             ii  t/f     t         true
   *             iii 0/1/2   t/f       false
   * 4           i   t       t/f       false
   *             i   f       t/f       true
   *             ii  t       t/f       false
   *             ii  f       t/f       true
   *             iii 0/1/2   f         false
   *             iii 0/1/2   t         true   
   * 
   */
  updateAppUpdateItems: function () 
  {
    var aus = 
        Components.classes["@mozilla.org/updates/update-service;1"].
        getService(Components.interfaces.nsIApplicationUpdateService);

    var enabledPref = document.getElementById("app.update.enabled");
    var enableAppUpdate = document.getElementById("enableAppUpdate");

    enableAppUpdate.disabled = !aus.canUpdate || enabledPref.locked;
  },
  
  updateAutoItems: function () 
  {
    var enabledPref = document.getElementById("app.update.enabled");
    var autoPref = document.getElementById("app.update.auto");
    
    var updateModeLabel = document.getElementById("updateModeLabel");
    var updateMode = document.getElementById("updateMode");
    
    var disable = enabledPref.locked || !enabledPref.value ||
                  autoPref.locked;
    updateModeLabel.disabled = updateMode.disabled = disable;
  },

  updateModeItems: function () 
  {
    var enabledPref = document.getElementById("app.update.enabled");
    var autoPref = document.getElementById("app.update.auto");
    var modePref = document.getElementById("app.update.mode");
    
    var warnIncompatible = document.getElementById("warnIncompatible");
    
    var disable = enabledPref.locked || !enabledPref.value || autoPref.locked ||
                  !autoPref.value || modePref.locked;
    warnIncompatible.disabled = disable;
  },

  /**
   * The Extensions checkbox and button are disabled only if the enable Addon
   * update preference is locked. 
   */
  updateAddonUpdateUI: function ()
  {
    var enabledPref = document.getElementById("extensions.update.enabled");
    var enableAddonUpdate = document.getElementById("enableAddonUpdate");

    enableAddonUpdate.disabled = enabledPref.locked;
  },  

  /**
   * app.update.mode is a three state integer preference, and we have to 
   * express all three values in a single checkbox:
   * "Warn me if this will disable extensions or themes"
   * Preference Value         Checkbox State    Meaning
   * 0                        Unchecked         Do not warn
   * 1                        Checked           Warn if there are incompatibilities
   * 2                        Checked           Warn if there are incompatibilities,
   *                                            or the update is major.
   */
  _modePreference: -1,
  addonWarnSyncFrom: function ()
  {
    var preference = document.getElementById("app.update.mode");
    var doNotWarn = preference.value != 0;
    gAdvancedPane._modePreference = doNotWarn ? preference.value : 1;
    return doNotWarn;
  },
  
  addonWarnSyncTo: function ()
  {
    var warnIncompatible = document.getElementById("warnIncompatible");
    return !warnIncompatible.checked ? 0 : gAdvancedPane._modePreference;
  },
   
  showUpdates: function ()
  {
    var prompter = Components.classes["@mozilla.org/updates/update-prompt;1"]
                             .createInstance(Components.interfaces.nsIUpdatePrompt);
    prompter.showUpdateHistory(window);
  },

  updateMarkAsReadTextbox: function(aFocusTextBox) 
  {
    var textbox = document.getElementById('markAsReadDelay'); 
    textbox.disabled = !document.getElementById('markAsRead').checked;
    if (!textbox.disabled && aFocusTextBox)
        textbox.focus();
  },
  
  /** 
   * open the return receipts configuration dialog 
   */
  showReturnReceipts: function()
  {
    document.documentElement.openSubDialog("chrome://messenger/content/preferences/receipts.xul",
                                           "", null);
  },  
  
  /** 
   * open the Delivery Status Nofification dialog
   */
  showDSN: function()
  {
    document.documentElement.openSubDialog("chrome://milimail-dsn/content/preferences/dsn.xul",
                                           "", null);
  },  
  
  /** 
   * open the connections dialog 
   */
  showConnections: function ()
  {
    document.documentElement
            .openSubDialog("chrome://messenger/content/preferences/connection.xul",
                           "", null);
  },
  
  /** 
   * open the offline settings dialog
   */
  showOffline: function()
  {
    document.documentElement
            .openSubDialog("chrome://messenger/content/preferences/offline.xul",
                           "", null);  
  },
  
  showCertificates: function ()
  {
    document.documentElement.openWindow("mozilla:certmanager", "chrome://pippki/content/certManager.xul",
                                        "width=600,height=400", null);
  },
  
  showCRLs: function ()
  {
    document.documentElement.openWindow("Mozilla:CRLManager", "chrome://pippki/content/crlManager.xul",
                                        "width=600,height=400", null);
  },
  
  showOCSP: function ()
  {
    document.documentElement.openSubDialog("chrome://mozapps/content/preferences/ocsp.xul",
                                           "", null);
  },
  
  showSecurityDevices: function ()
  {
    document.documentElement.openWindow("mozilla:devicemanager", "chrome://pippki/content/device_manager.xul",
                                        "width=600,height=400", null);
  }
};
