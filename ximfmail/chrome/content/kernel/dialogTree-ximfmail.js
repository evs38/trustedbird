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
gJSLoader.loadSubScript("chrome://ximfmail/content/jquery.js");
gJSLoader.loadSubScript("chrome://ximfmail/content/ximfmail.js");
gJSLoader.loadSubScript("chrome://ximfmail/content/constant-ximfmail.js");

  
var gDlgTreeXimf_maxItem = null;
var gDlgTreeXimf_maxItem_alert = "";
var gDlgTreeXimf_current_selection = null;
var gDlgTreeXimf_current_separator = null;
var gRdfTempo = null;
var gTitleDlg = null;

function XimfDataSource(){
	this._id; // xml file name path
	this._dataSource;
	this._refDataSource;				
}

/*
 window.arguments = [];
		args[0] id de la textbox à enrichir
		args[1] reference du catalogue à charger
		args[2] titre de la dialogbox
		args[3] description de la dialogbox		
		args[4] titre de la colonne 0 de la dialogbox
		args[5] titre de la colonne 1 de la dialogbox
*/

var gBoxOpener = null;

$(document).ready(function(){		
	var gArgs = window.arguments;
	if(gArgs[0].length <= 0) return;

 	$("#ximfmail_dTreeAdd").bind("command",OnPushAddSelection);
 	$("#iTreechildDialog").dblclick(OnPushAddSelection);
 	$("#ximfmail_dTreeDel").bind("command",OnPushDelSelection);
 	$("#ximfmail_dTreeRaz").bind("command",OnPushRazSelection);	

	// load background datas
	try{
		gBoxOpener = gArgs[0][0];	
		gDataSource = gArgs[0][1];	
		gRefDataSource = gArgs[0][2];	
		gDlgTreeXimf_current_selection = gArgs[0][3];
		gDlgTreeXimf_current_separator =  gArgs[0][4];
		gDlgTreeXimf_maxItem = gArgs[0][5];
		gTitleDlg = gArgs[0][6];
	}catch(e){
		gConsole.logStringMessage("[ximfmail - ready ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
	}
	
	if(parseInt(gDlgTreeXimf_maxItem) > 1){
		gDlgTreeXimf_maxItem_alert = gDlgTreeXimf_maxItem + " "+ getIlkProperties("ximfmail.dialog.editor.warning.nbrows");
	}else{
		if(parseInt(gDlgTreeXimf_maxItem) == 1){
			gDlgTreeXimf_maxItem_alert = gDlgTreeXimf_maxItem + " "+ getIlkProperties("ximfmail.dialog.editor.warning.nbrows.one");
		}
	}
		
	gRdfTempo = setInterval("LoadXmlDatas()", 50);	
}); 

var gDataSource = null;
var gRefDataSource = null;
function LoadXmlDatas(){
	try{		
		clearInterval(gRdfTempo);
		gRdfTempo=null;		
		//alert("LoadXmlDatas2 with "+ gRefDataSource)
		AddCurrentSelection();
		var tree = document.getElementById("iTreechildDialog");
		tree.database.AddDataSource(gDataSource);	
		tree.setAttribute("ref",gRefDataSource);			
		tree.builder.rebuild();
	}catch(e){	
		gConsole.logStringMessage("[ximfmail - LoadXmlDatas ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
	}	
}

function AddCurrentSelection(){
	// load current selected values
	if(gDlgTreeXimf_current_selection){
		var reg = null;	
		if(gDlgTreeXimf_current_separator){
			reg=new RegExp("["+gDlgTreeXimf_current_separator+"]+", "g");		
		}else{
			reg=new RegExp("[;,]+", "g");
		}	
		var arrayItems = gDlgTreeXimf_current_selection.split(reg);		
		var list = document.getElementById("ximfmail_selection");
		for (var i=0; i<arrayItems.length; i++) {
			if(arrayItems[i]!=""){
				list.appendItem(arrayItems[i]);
			} 	
		}
	}
	try{
		$("#treeDialogHeader").attr("title",gTitleDlg.substring(0,gTitleDlg.lastIndexOf(":")));
		$("#treeDialogHeader").attr("description",gDlgTreeXimf_maxItem_alert);
	}catch(e){
			gConsole.logStringMessage("[ximfmail - AddCurrentSelection ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+ e.lineNumber);
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
	  				if(gDlgTreeXimf_maxItem){  					
	  					var nbItems = $("#ximfmail_selection listitem");  					
	  					if(nbItems.length >= gDlgTreeXimf_maxItem){
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

function doOK()
{
  //var selection = getTreeSelection();
  var selection = getCurrentSelection();
  window.opener.document.getElementById(gBoxOpener).value = selection; 
  window.opener.document.getElementById(gBoxOpener).setAttribute(_XIMF_ATT_XVALUE, selection);   
  return true;
}

function getCurrentSelection(){
	var list = $("#ximfmail_selection listitem");
	var separator = ","
	var current_selection = "";
	if(gDlgTreeXimf_current_separator){
		separator = gDlgTreeXimf_current_separator;
	}
	for(var idx_list = 0; idx_list < list.length;++idx_list){
		var currentItem = list[idx_list].getAttribute("label");
		if( currentItem != ""){
			if(current_selection != ""){
				current_selection += separator;
			}
			current_selection += currentItem;
		}
	}
	return current_selection;
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

function doCancel()
{
  //alert("Vous avez appuyé sur Annuler !");
  return true;
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
