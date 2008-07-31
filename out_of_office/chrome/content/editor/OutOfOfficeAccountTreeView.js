/* ***** BEGIN LICENSE BLOCK *****
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
 *   Olivier Brun BT Global Services / Etat francais Ministere de la Defense
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

/**
	@fileoverview
	This is our custom view, based on the treeview interface
	@author Olivier Brun BT Global Services / Etat francais Ministere de la Defense
*/

// Load all the Libraries we need...
var jsLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
// includes
jsLoader.loadSubScript("chrome://out_of_office/content/libs/preferences.js");
jsLoader.loadSubScript("chrome://out_of_office/content/libs/misc.js");

var globalServices=new Services();

function OutOfOfficeAccountTreeView(listener)
{
	// includes SieveAccount class
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveAccounts.js");
	
	this.CONST_HEADER = new String("OutOfOfficeAccountTreeView: "); // for trace 
	globalServices.logSrv( this.toString() + "Constructor.");
  
	this.sieveAccounts = new SieveAccounts();    
	this.accounts = this.sieveAccounts.getAccounts();
	this.rowCount = this.accounts.length;
	this.listener = listener;
}
/*
 * Return the name of the class initialized in CONST_HEADER variable.
 * This function overload the 'toString' standard function from Javascript Object.
 * 
 * @return (string) CONST_HEADER containing class name.
 */
OutOfOfficeAccountTreeView.prototype.toString
	= function()
{
	if( this.CONST_HEADER == undefined || this.CONST_HEADER == null ){
		return "OutOfOfficeAccountTreeView: Invalid String"; // Error
	}
	return this.CONST_HEADER;
}

OutOfOfficeAccountTreeView.prototype.update
	= function(rules)
{
    this.accounts = this.sieveAccounts.getAccounts();
	this.rowCount = this.accounts.length;
}

OutOfOfficeAccountTreeView.prototype.getCellValue
	= function(row,column)
{
    return "";
}

OutOfOfficeAccountTreeView.prototype.getCellText 
	= function(row,column)
{
    //consoleService.logStringMessage(row+"/"+column.id+"/"+column+"/"+column.cycler+"/"+column.type);
    
    if (column.id == "namecol"){
    	var information  = new String("");
	 	if( this.accounts[row].isEnabled() ){
	    	if(this.accounts[row].isConnectRequest() == false){
	    		information =  " [" + globalServices.localizeString( "out_of_office_locale.properties", "&outofoffice.list.tree.account.norequest;" ) + "]";
	    	}
	 	} else {
	 		information =  " [" + globalServices.localizeString( "out_of_office_locale.properties", "&outofoffice.list.tree.account.noactivate;" ) + "]";
	 	}
        return this.accounts[row].getDescription() + information;
    }
    else 
        return "";         
}
    
OutOfOfficeAccountTreeView.prototype.setTree
	= function(treebox){ this.treebox = treebox; }
		
OutOfOfficeAccountTreeView.prototype.isContainer
	= function(row){ return false; }

OutOfOfficeAccountTreeView.prototype.isSeparator
	= function(row){ return false; }

OutOfOfficeAccountTreeView.prototype.isSorted
	= function(row){ return false; }
	
OutOfOfficeAccountTreeView.prototype.getLevel
	= function(row){ return 0; }

OutOfOfficeAccountTreeView.prototype.getImageSrc
	= function(row,column)
{
    if (column.id == "namecol")
    	return null; 

	if( this.accounts[row].isEnabled() ){
		if( this.accounts[row].isConnectRequest() ){
			if (this.accounts[row].isEnabledOutOfOffice())
				return "chrome://out_of_office/content/images/out_of_office_active.png";
			else
				return "chrome://out_of_office/content/images/out_of_office_inactive.png";
		}   
	    return "chrome://out_of_office/content/images/out_of_office_not_connected.png";
	}
	return  "chrome://out_of_office/content/images/out_of_office_connect_failed.png";
}
	
OutOfOfficeAccountTreeView.prototype.getRowProperties
	= function(row,props){}
	
OutOfOfficeAccountTreeView.prototype.getCellProperties
	= function(row,col,props){}
	
OutOfOfficeAccountTreeView.prototype.getColumnProperties
	= function(colid,col,props){}

OutOfOfficeAccountTreeView.prototype.cycleHeader
	= function(col){}

OutOfOfficeAccountTreeView.prototype.cycleCell
    = function(row, col)
{	// check if a connection is running
	globalServices.logSrv(this.toString() + "cycleCell");
	if( this.listener.onCycleCellActivate(this) == true ){
		this.selection.select(row);
	}else{
		globalServices.logSrv(this.toString() + "Connection active cannot select new item");
	}
}

/*
 * Retrieve current selected account
 * @param (integer) Index of the account to retrieve
 * @return (object) SieveAccount class object
 */
OutOfOfficeAccountTreeView.prototype.getAccount = function(row)
{
	return this.accounts[row];
}

/*
 * Retrieve account list
 * @return (array) Array of SieveAccount class object
 */
OutOfOfficeAccountTreeView.prototype.getAccountList = function()
{
	return this.accounts;
}

    