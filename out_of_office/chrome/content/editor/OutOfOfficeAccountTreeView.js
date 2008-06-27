// This is our custom view, based on the treeview interface

function OutOfOfficeAccountTreeView(listener)
{
	// Load all the Libraries we need...
	var jsLoader = Components
										.classes["@mozilla.org/moz/jssubscript-loader;1"]
										.getService(Components.interfaces.mozIJSSubScriptLoader);
  jsLoader
    .loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveAccounts.js");
	
  this.sieveAccounts = new SieveAccounts();    
  this.accounts = this.sieveAccounts.getAccounts();
  this.rowCount = this.accounts.length;
  this.listener = listener;
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
    
    if (column.id == "namecol") 
        return this.accounts[row].getDescription();
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
    
    if (this.accounts[row].isEnabledOutOfOffice())
    	return "chrome://out_of_office/content/images/active.png"
    else
    	return "chrome://out_of_office/content/images/passive.png"
}
	
OutOfOfficeAccountTreeView.prototype.getRowProperties
	= function(row,props){}
	
OutOfOfficeAccountTreeView.prototype.getCellProperties
	= function(row,col,props){}
	
OutOfOfficeAccountTreeView.prototype.getColumnProperties
	= function(colid,col,props){}

OutOfOfficeAccountTreeView.prototype.cycleHeader
	= function(col){}

var globalServices=new Services();
	
OutOfOfficeAccountTreeView.prototype.cycleCell
    = function(row, col)
{
	globalServices.logSrv( "OutOfOfficeAccountTreeView >>>>onCycleCell");
	this.accounts[row].setEnabledOutOfOffice( ! this.accounts[row].isEnabledOutOfOffice());
	this.listener.onCycleCellActivate(this);
	this.selection.select(row);
}

OutOfOfficeAccountTreeView.prototype.getAccount
    = function(row) { return this.accounts[row]; }
