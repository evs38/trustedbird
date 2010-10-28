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

var gJSLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].createInstance(Components.interfaces.mozIJSSubScriptLoader);
var gConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
  

var gDlgTreeXimf_maxItem_alert = "";
var gDlgTreeXimf_current_selection = null;
var gDlgTreeXimf_current_separator = null;
var gTitleDlg = "";

function XimfDataSource(){
	this._id; // xml file name path
	this._dataSource;
	this._refDataSource;				
}





var gArgsOpener = null;

$(document).ready(function(){
	var gArgs = window.arguments;
	if(gArgs[0].length <= 0) return;

	// load event manager
 	$("#ximfmail_dTreeAdd").bind("command",OnPushAddSelection);
 	$("#iTreechildDialog").dblclick(OnPushAddSelection);
 	$("#ximfmail_dTreeDel").bind("command",OnPushDelSelection);
 	$("#ximfmail_dTreeRaz").bind("command",OnPushRazSelection);	

	// load background datas
	try{
		gArgsOpener = gArgs[0];	// gArgs[0] is an XimfmailTreedialogArgs object - XimfmailTreedialogArgs class description at ximfmail.js file
	}catch(e){
		gConsole.logStringMessage("[ximfmail - ready ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
		return;
	}
	
	// create alert message 	
	if(parseInt(gArgsOpener.maxItemsSelected) > 1){
		gDlgTreeXimf_maxItem_alert = gArgsOpener.maxItemsSelected + " "+ getIlkProperties("ximfmail.dialog.editor.warning.nbrows");
	}else{
		if(parseInt(gArgsOpener.maxItemsSelected) == 1){
			gDlgTreeXimf_maxItem_alert = gArgsOpener.maxItemsSelected + " "+ getIlkProperties("ximfmail.dialog.editor.warning.nbrows.one");
		}
	}
	
	try{
		//set main title	
		var sTitle = gArgsOpener.title;		
		if(sTitle.indexOf(":") != -1){
			sTitle = sTitle.substring(0,sTitle.lastIndexOf(":"));
		}		
		$("#treeDialogHeader").attr("title",sTitle);
		$("#treeDialogHeader").attr("description",gDlgTreeXimf_maxItem_alert);
		
		//set title columns
		$("#iCol0").attr("label",gArgsOpener.titleColKey);
		$("#iCol1").attr("label",gArgsOpener.titleColLabel);
		
	}catch(e){
			gConsole.logStringMessage("[ximfmail - AddCurrentSelection ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+ e.lineNumber);
	}
	
	setTimeout("LoadXmlDatas()", 50);	
});

/*
 *  attach RDF Source to local tree
 */
function LoadXmlDatas(){
	try{			
		//
		var tree = document.getElementById("iTreechildDialog");		
		tree.database.AddDataSource(gArgsOpener.dataSource);		
		tree.setAttribute("ref",gArgsOpener.refdataSource);	
		tree.builder.rebuild();
		//
		AddCurrentSelection();
	}catch(e){	
		gConsole.logStringMessage("[ximfmail - LoadXmlDatas ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
	}	
}

function AddCurrentSelection(){
	// load current selected values
	if(gArgsOpener.currentKeys.length > 0){
		/*var reg = null;	
		if(gDlgTreeXimf_current_separator){
			reg=new RegExp("["+gDlgTreeXimf_current_separator+"]+", "g");		
		}else{
			reg=new RegExp("[;,]+", "g");
		}
		var arrayItems = gDlgTreeXimf_current_selection.split(reg);	
		*/
		var list = document.getElementById("ximfmail_selection");
		for (var i=0; i<gArgsOpener.currentKeys.length; i++) {
			if(gArgsOpener.currentLabels[i]!=""){
				var item = list.appendItem(gArgsOpener.currentKeys[i]);
				if(gArgsOpener.currentKeys[i]!=""){
					item.setAttribute("tooltiptext",gArgsOpener.currentLabels[i]);
				}
			} 			 
		}
	}	
}

function OnPushAddSelection(){
	try{	
		var tree = document.getElementById("ximfmail.treedialog");
		var list = document.getElementById("ximfmail_selection");
		var start = new Object();
		var end = new Object();
		var numRanges = tree.view.selection.getRangeCount();
		
		
		for (var t=0; t<numRanges; t++){
	  		tree.view.selection.getRangeAt(t,start,end);
	  			for (var v=start.value; v<=end.value; v++){  
	  				if(gArgsOpener.maxItemsSelected){  					
	  					var nbItems = $("#ximfmail_selection listitem");  					
	  					if(nbItems.length >= gArgsOpener.maxItemsSelected){
	  						alert(gDlgTreeXimf_maxItem_alert);	  						
	  						return;
	  					}
	  				}			  					
	    			var item = list.appendItem(tree.view.getCellText(v, tree.columns.getColumnAt(0))); //list.appendItem(label,value)
	    			item.tooltipText=tree.view.getCellText(v, tree.columns.getColumnAt(1));
	  		}
		}
	}catch(e){
		gConsole.logStringMessage("[ximfmail - OnPushAddSelection ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
	}
}

function OnPushDelSelection(){
	var list = document.getElementById("ximfmail_selection");
	list.removeItemAt( list.selectedIndex );
}

function OnPushRazSelection(){
	var list = document.getElementById("ximfmail_selection");
	var count = $("#ximfmail_selection listitem");	
	for(var i=count.length; i>0; --i){
		list.removeItemAt(i-1);
	}
}



function doOK(){
	// get current selection	
  	var list = $("#ximfmail_selection listitem");	
	for(var idx_list = 0; idx_list < list.length;++idx_list){
		var currentItem = list[idx_list].getAttribute("label");
		var currentTooltip = list[idx_list].getAttribute("tooltiptext");
		if(currentItem != ""){
			gArgsOpener.retKeys.push(currentItem);				
  			gArgsOpener.retLabels.push(currentTooltip);
  		}
	}	     
  	return true;
}

/*
 * 
 */
function doCancel()
{
	gArgsOpener.retIsCancel=true; 
}

function getTreeSelection(){
	var list="";
	var tree = document.getElementById("ximfmail.treedialog");
	var start = new Object();
	var end = new Object();
	var numRanges = tree.view.selection.getRangeCount();

	for (var t=0; t<numRanges; t++){
  		tree.view.selection.getRangeAt(t,start,end);
  			for (var v=start.value; v<=end.value; v++){
  				if(list!="")
  					list+=",";
    			list += tree.view.getCellText(v, tree.columns.getColumnAt(0));
  		}
	}
	return list;
}




///BEGIN TEST
function OnSelectTreeData(evt){
	//alert("OnSelectTreeData");
	var elt = evt.currentTarget;
	//var tree = document.getElementById("ximfmail.tree");
	if(elt.view){
		//alert("index = " + elt.view.selection.currentIndex);
		
		// on select
		var cellIndex = 0;
   	 	var cellText = elt.view.getCellText(elt.currentIndex, elt.columns.getColumnAt(cellIndex));
    	//alert("cellText: "+cellText);
	}	
		
    var row = new Object();
    var col = new Object();
    var child = new Object();
    
    //elt.firstChild.treeBoxObject.getCellAt(event.clientX, event.clientY, row, col, child);
    elt.treeBoxObject.getCellAt(evt.clientX, evt.clientY, row, col, child);
	var idMatch;
	try {
        idMatch = col.value.element.getAttribute('id');
    } catch (error) {
        idMatch = col.value;
    }
   //alert(row.value + " : " + idMatch);
   //return {row: row.value, col: idMatch};	
}

function OnClickTreeData(evt){
	//alert("OnSelectTreeData");
	var elt = evt.currentTarget;	
    var row = new Object();
    var col = new Object();
    var child = new Object();
    //elt.firstChild.treeBoxObject.getCellAt(event.clientX, event.clientY, row, col, child);
    elt.treeBoxObject.getCellAt(evt.clientX, evt.clientY, row, col, child);
	var idMatch;
	try {
        idMatch = col.value.element.getAttribute('id');
    } catch (error) {
        idMatch = col.value;
    }
    //alert(row.value + " : " + idMatch);
    //return {row: row.value, col: idMatch};	
}
