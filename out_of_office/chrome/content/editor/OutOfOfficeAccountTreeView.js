// This is our custom view, based on the treeview interface

// Load all the Libraries we need...
var jsLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
// includes
jsLoader.loadSubScript("chrome://out_of_office/content/libs/misc.js");

var globalServices=new Services();

function OutOfOfficeAccountTreeView(listener)
{
	// includes SieveAccount class
	jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveAccounts.js");
	
	this.CONST_HEADER = new String("OutOfOfficeAccountTreeView: "); // for trace 
	globalServices.logSrv( this.toString() + "Construtor");
  
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
	    		information  = " [Connection not yet requested]";
	    	}
	 	} else {
	 		information  = " [Account not activated]";
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
				return "chrome://out_of_office/content/images/active.png";
			else
				return "chrome://out_of_office/content/images/passive.png";
		}   
	    return "chrome://out_of_office/content/images/unknown.png";
	}
	return  "chrome://out_of_office/content/images/deactivated.png";
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
{
	globalServices.logSrv( this.toString() + ">>>>onCycleCell");
//	this.accounts[row].setEnabledOutOfOffice( ! this.accounts[row].isEnabledOutOfOffice());
	this.listener.onCycleCellActivate(this);
//	this.listener.onCycleCell(this);
//    this.listener.onCycleCell(row,col,this.rules[row][0],this.rules[row][1]);
	this.selection.select(row);
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

    