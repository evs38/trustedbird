/* ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2008-2009 EADS DEFENCE AND SECURITY - All rights reserved.
 * ximfmail is under the triple license  MPL 1.1/GPL 2.0/LGPL 2.1.
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
 *
 * Contributor(s):
 *   Copyright(c) Airbus Defence and Space 2014 - All rights reserved
 * ***** END LICENSE BLOCK ***** */
// get pref settings
function onPreInit(account, accountValues) {
	XimfmailAccountPage.getInstance().setIdentity(account.defaultIdentity);
}
function onInit(aPageId, aServerId) {
	XimfmailAccountPage.getInstance().init();
}
// save all changes on this page
function onSave() {
	XimfmailAccountPage.getInstance().save();
}
/**
 * Ximfmail settings account page
 */
var XimfmailAccountPage = ( function () {
	var instantiated = null;
	var accountIdentity = null;
	var log = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
	// enable/disable ximfmail settings
	function toogle(){
		if ($("#checkListTheme").attr("checked") === "true") {
	 		$("#isUsingXimfail").attr("disabled", "false");
	 	} else {
	 		$("#isUsingXimfail").attr("disabled", "true");
	 	}
	}
	/*
	 * init default menulist xul element with first menuitem
	 * idMenuList : id of menulist xul element
	 */
	function initEntryMenu(idMenuList){
		var itemlist = $("#"+ idMenuList +" > menupopup > menuitem");
		$("#"+idMenuList).attr("value",$(itemlist[0]).attr("value"));
		$("#"+idMenuList).attr("label",$(itemlist[0]).attr("label"));
	}
	/*
	 * display user pref value in menulist if exists
	 * manage RDF Catalog list in accountWizard, accountManager
	 * identity : user identity key
	 * idPref : user preference key
	 * idList : id of menulist xul element
	 */
	function initEntryMenuWithPref(idPref,idList){
		var pref = ximfPref.get(accountIdentity.key,idPref);
		log.logStringMessage("[am-ximfmail - initEntryMenuWithPref] pref : " + pref);
		if (pref) {
			var entry = document.getElementById(idList);
			if(!entry){
				log.logStringMessage("[am-ximfmail - initEntryMenuWithPref] unloaded entry : " + entry);
				return;
			}
	   		var themeList = entry.menupopup.childNodes;
			for (var i=0; i<themeList.length; ++i) {
				if(themeList[i].localName === "menuitem") {
					var themeListval = themeList[i].value;
					if( pref === themeListval){
						entry.value = themeListval;
						entry.label = themeList[i].label;
						break;
					}
				}
			}
		}
	}
	// load instances of selected theme
	function loadTheme() {
		var themeRef = $("#listTheme").attr("value");
		AddRdfDataSce2domList("instanceCompose", themeRef);
		initEntryMenu("instanceComposeList");
		AddRdfDataSce2domList("instanceTreeThread", themeRef);
		initEntryMenu("instanceTreeThreadList");
	};
	/**
	 * Listener on datasources of istance definitions menu
	 */
	var treebuilderListener = {
		item: null,
		willRebuild : function(builder) {
		},
		didRebuild : function(builder) {
			// determine if user uses ximfmail
			$("#checkListTheme").attr("checked", "false");
			if (ximfPref.getBool(accountIdentity.key, ximfConst.XIMF_PREF_IDENTITY_USE_XIMFMAIL)) {
				$("#checkListTheme").attr("checked", "true");
			}
			initEntryMenuWithPref("ximfmail_theme_ref","listTheme");
			loadTheme();
			initEntryMenuWithPref("ximfmail_instance_compose_ref","instanceComposeList");
			initEntryMenuWithPref(ximfConst.XIMF_PREF_IDENTITY_TREETHREAD_REF,"instanceTreeThreadList");
			$("#listTheme").bind('command', loadTheme);
			$("#checkListTheme").click(toogle);
			toogle();
			// determine if user wants XSMTP compatibility
			$("#xsmtpComptibilityBox").attr("checked", ximfPref.getBool(accountIdentity.key, "ximfmail_xsmtp_compatibility_on").toString());
		}
	};
	//
	function instantiate() {
		return {
			setIdentity : function (aIdentity) {
				accountIdentity = aIdentity;
			},
			init : function () {
				try {
					if (!accountIdentity) {
						// no account id (local folder)
						$("#checkListTheme").attr("checked", "false");
						toogle();
						$("#checkListTheme").attr("disabled", "true");
						return;
					}
					$("#checkListTheme").removeAttr("disabled");
					//load XIMF instances of profile for account
					XimfCatalogFactory.getIntance(function(instance){
						var listInstances = document.getElementById("listThemPopup");
						listInstances.database.AddDataSource(instance.getDSCatalog());
						listInstances.builder.addListener(treebuilderListener);
						listInstances.builder.rebuild();
					});
				} catch (ex) {
					log.logStringMessage("[am-ximfmail] Error on init settings for account " + accountIdentity.key + " : " + ex);
				}
			},
			save : function () {
				try {
					if (!accountIdentity) {
						return;
					}
					// save ximfmail selection to preferences
					ximfPref.set(accountIdentity.key, "ximfmail_theme_ref", $("#listTheme").attr("value"));
					ximfPref.set(accountIdentity.key, "ximfmail_theme_name", $("#listTheme").attr("label"));
					ximfPref.set(accountIdentity.key, "ximfmail_instance_compose_ref", $("#instanceComposeList").attr("value"));
					ximfPref.set(accountIdentity.key, ximfConst.XIMF_PREF_IDENTITY_TREETHREAD_REF,$("#instanceTreeThreadList").attr("value"));
					if($("#checkListTheme").attr("checked") === "true"){
						ximfPref.setBool(accountIdentity.key, ximfConst.XIMF_PREF_IDENTITY_USE_XIMFMAIL,true);
						try{
							CreateSecurityLabelXml();
						}catch(e){}
					}else{
						ximfPref.setBool(accountIdentity.key, ximfConst.XIMF_PREF_IDENTITY_USE_XIMFMAIL,false);
					}
					if($("#xsmtpComptibilityBox").attr("checked") === "true"){
						ximfPref.setBool(accountIdentity.key, "ximfmail_xsmtp_compatibility_on",true);
					}else{
						ximfPref.setBool(accountIdentity.key, "ximfmail_xsmtp_compatibility_on",false);
					}
					log.logStringMessage("[am-ximfmail] Save settings for account " + accountIdentity.key);
				} catch (ex) {
					log.logStringMessage("[am-ximfmail] Error on saving settings for account " + accountIdentity.key + " : " + ex);
				}
			}
		};
	};
	//
	return {
		getInstance : function(){
			if(!instantiated){
				instantiated = instantiate();
			}
			return instantiated;
		}
	};
})();