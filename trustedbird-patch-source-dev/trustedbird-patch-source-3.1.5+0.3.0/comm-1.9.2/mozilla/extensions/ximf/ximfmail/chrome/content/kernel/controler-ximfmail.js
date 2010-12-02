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
 * ***** END LICENSE BLOCK ***** */
 
/* 
 * global variables
 */
var gConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
var gJSLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].createInstance(Components.interfaces.mozIJSSubScriptLoader);
gJSLoader.loadSubScript("chrome://ximfmail/content/jquery.js");


/*
 * 
 */ 
 function IsXimfailActivated(identity){
 	//alert(identity + "(ximfmail_on) = " + GetXimfmailPref(identity,"ximfmail_on"));
 	//if(GetXimfmailPref(identity,"ximfmail_on") == "true")
 	if(identity.getBoolAttribute("ximfmail_on"))
 		return true;
 	else
 		return false;
 }
 
/*
 * get value of ximfmail user preference 
 */
function GetXimfmailPref(idIdentity,key){
	var prefValue = "";	
	var ximfmailPrefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("mail.identity." + idIdentity + ".");
	if(ximfmailPrefBranch.prefHasUserValue(key))		
			prefValue = ximfmailPrefBranch.getCharPref(key);						
	return prefValue;
}

/*
 * set value of ximfmail user preference
 */
function SetXimfmailPref(idIdentity,key,value){	
	try{
		gConsole.logStringMessage("[ximfmail - SetXimfmailPref] key "+key+" : "+value);
		
		var prefSvc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		var ximfmailPrefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("mail.identity." + idIdentity + ".");
		ximfmailPrefBranch.setCharPref(key,value);
		prefSvc.savePrefFile(null);
	}catch(e){
		gConsole.logStringMessage("[ximfmail - SetXimfmailPref] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
	}
}

function ResetXimfmailPref(idIdentity,key){		
	var prefSvc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	var ximfmailPrefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("mail.identity." + idIdentity + ".");
	ximfmailPrefBranch.ClearUserPref(key);
	prefSvc.savePrefFile(null);
}


/*
 * set value to reference attribute of xul element
 * used for RDF resource
 * idElement : id of xul element
 * refValue : value of ref attribute
 */
function ChangeRefAttrRdfElement(idElement,refValue){
	//$("#"+idElement).attr("ref",refValue);
	
	var list = document.getElementById(idElement);		
	list.database.AddDataSource(gXimfCatalog.getDSCatalog());	
	list.setAttribute("ref",refValue);
	list.builder.rebuild();
	
}

/*
 * init default menulist xul element with first menuitem  
 * idMenuList : id of menulist xul element
 */
function InitRDFMenuList(idMenuList){
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
function UpdateRDFListWithPref(identity, idPref,idList){
	var pref = GetXimfmailPref(identity,idPref);
	if(pref){
   		var themeList = $("#"+idList+" > menupopup > menuitem");
		for(var i=0; i<themeList.length; i++){		
			if( pref == $(themeList[i]).attr("value")){
				$("#"+idList).attr("value",$(themeList[i]).attr("value"));
				$("#"+idList).attr("label",$(themeList[i]).attr("label"));								
			}
		}
	}
}