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
var gJSLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].createInstance(Components.interfaces.mozIJSSubScriptLoader);
var gConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
var gDlgTreeXimf_maxItem_alert = "";
var gDlgTreeXimf_current_selection = null;
var gDlgTreeXimf_current_separator = null;
var gTitleDlg = "";
// RDF list
var gMaxDataList = 15;
var gCurposList = -1;
var gIDTimeoutList = null;
var gIDTimeoutListSearch = null;
var gSearchText = "";
var gRDFList = null;
var gArgsOpener = null;
$(document).ready(function(){
	var gArgs = window.arguments;
	if(gArgs[0].length <= 0) {
		return;
	}
	// load event manager
 	$("#ximfmail_dTreeAdd").bind("command",OnPushAddSelection);
 	$("#iTreechildDialog").dblclick(OnPushAddSelection);
 	$("#ximfmail_dTreeDel").bind("command",OnPushDelSelection);
 	$("#ximfmail_dTreeRaz").bind("command",OnPushRazSelection);
 	// event for scroll
  $("#ximfmailTreeDialogScroll").mousemove(OnClickScrollTreeList);
  $("#ximfmailTreeDialogScroll").click(OnClickScrollTreeList);
  $("#iTreechildDialog").mousemove(OnClickScrollTreeList);
  $(window).resize(OnClickScrollTreeList);
  document.getElementById("iTreechildDialog").addEventListener('DOMMouseScroll', OnScrollTreeList, false);
  $("#ximfmail.treedialog").keypress(OnKeyPressScrollTreeList);
  $("#ximfmailTreeDialogDisplaybox").keypress(OnKeyPressScrollTreeList);
	// load background datas
	try{
		// gArgs[0] is an XimfmailTreedialogArgs object - XimfmailTreedialogArgs class description at ximfmail.js file
		gArgsOpener = gArgs[0];
	}catch(e){
		gConsole.logStringMessage("[ximfmail - ready ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
		return;
	}
	// create alert message
	if(parseInt(gArgsOpener.maxItemsSelected, 10) > 1){
		gDlgTreeXimf_maxItem_alert = gArgsOpener.maxItemsSelected + " "+ getIlkProperties("ximfmail.dialog.editor.warning.nbrows");
	}else{
		if(parseInt(gArgsOpener.maxItemsSelected, 10) === 1){
			gDlgTreeXimf_maxItem_alert = gArgsOpener.maxItemsSelected + " "+ getIlkProperties("ximfmail.dialog.editor.warning.nbrows.one");
		}
	}
	try{
		//set main title
		var sTitle = gArgsOpener.title;
		if(sTitle.indexOf(":") !== -1){
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
	LoadXmlDatas();
});
/*
 *  attach RDF Source to local tree
 */
function LoadXmlDatas(){
	try{
		//
		var tree = document.getElementById("iTreechildDialog");
		gRDFList = new DialogTreeRDFClass();
		gRDFList.initialize(gArgsOpener.dataSource, gArgsOpener.refdataSource);
		tree.database.AddDataSource(gRDFList.getDataSource());
		tree.builder.rebuild();
		OnClickScrollTreeList(0);
		AddCurrentSelection();
	}catch(e){
		gConsole.logStringMessage("[ximfmail - LoadXmlDatas ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
	}
}
function AddCurrentSelection(){
	// load current selected values
	if(gArgsOpener.currentKeys.length > 0){
		var list = document.getElementById("ximfmail_selection");
		for (var i=0; i<gArgsOpener.currentKeys.length; i++) {
			if(gArgsOpener.currentLabels[i]!==""){
				var item = list.appendItem(gArgsOpener.currentKeys[i]);
				if(gArgsOpener.currentKeys[i]!==""){
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
	  					ximfAlert(gDlgTreeXimf_maxItem_alert);
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
		if(currentItem !== ""){
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
  				if (list!=="") {
  					list+=",";
				}
    			list += tree.view.getCellText(v, tree.columns.getColumnAt(0));
  		}
	}
	return list;
}
function OnSelectTreeData(evt){
	var elt = evt.currentTarget;
	if(elt.view){
		// on select
		var cellIndex = 0;
   	 	var cellText = elt.view.getCellText(elt.currentIndex, elt.columns.getColumnAt(cellIndex));
    }
    var row = new Object();
    var col = new Object();
    var child = new Object();
	elt.treeBoxObject.getCellAt(evt.clientX, evt.clientY, row, col, child);
	var idMatch;
	try {
        idMatch = col.value.element.getAttribute('id');
    } catch (error) {
        idMatch = col.value;
    }
}
function OnClickTreeData(evt){
	var elt = evt.currentTarget;
    var row = new Object();
    var col = new Object();
    var child = new Object();
    elt.treeBoxObject.getCellAt(evt.clientX, evt.clientY, row, col, child);
	var idMatch;
	try {
        idMatch = col.value.element.getAttribute('id');
    } catch (error) {
        idMatch = col.value;
    }
}
/* for  to scroll */
function OnClickScrollTreeList(evt)
{
  try {
    if (parseInt($("#ximfmailTreeDialogScroll").attr("maxpos"), 10) <=0) {
		return;
	}
    var treeResult = document.getElementById("ximfmail.treedialog");
    $("#iTreechildDialog").attr("hidevscroll","true");
    var curpos = 0;
    curpos = parseInt($("#ximfmailTreeDialogScroll").attr("curpos"), 10);
    var pageLength = gMaxDataList;
    try{
		pageLength = treeResult.boxObject.getPageLength();
		if (0 === pageLength) {
			pageLength = gMaxDataList;
		}
    }catch(e){
		pageLength = gMaxDataList;
	}
    if(gCurposList !== curpos || gMaxDataList !== pageLength || gMaxDataList !== gRDFList.getEntriesCount() || evt === 0) {
      window.setCursor("wait");
      gMaxDataList = pageLength;
      var maxEntry = parseInt(gRDFList.getMaxEntry(), 10);
      gRDFList.updateDisplay(curpos,gMaxDataList-1);
      var maxpos = gMaxDataList;
      if(maxEntry - gMaxDataList >= 0) {
        maxpos = maxEntry - gMaxDataList;
      } else {
        maxpos = -1;
	  }
      if (maxEntry < gMaxDataList) {
		gMaxDataList = maxEntry;
	  }
      $("#ximfmailTreeDialogScroll").attr("maxpos",maxpos);
      gCurposList = curpos;
      if(maxEntry === 0 || maxpos <= 0) {
        $("#ximfmailTreeDialogScroll").attr("hidden","true");
        gMaxDataList = maxEntry;
      } else {
        $("#ximfmailTreeDialogScroll").removeAttr("hidden");
	  }
      if(treeResult.database !== null) {
	      treeResult.database.AddDataSource(gRDFList.getDataSource());
	      treeResult.builder.rebuild();
	      clearTimeout(gIDTimeoutList);
	      gIDTimeoutList = setTimeout(OnClickScrollTreeList,100,1);
      }
    }
  }catch(e){
    gConsole.logStringMessage("[ximfmail - OnClickScrollTreeList ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
  }
  window.setCursor("auto");
}
function OnScrollTreeList(event)
{
  window.setCursor("wait");
  try {
    var curpos = parseInt($("#ximfmailTreeDialogScroll").attr("curpos"), 10);
    var addPos = 0;
    if(event.detail === -3) {
      addPos = -3;
    } else if (event.detail === 3) {
      addPos = 3;
	}
    curpos += addPos;
    var maxpos = parseInt(gRDFList.getMaxEntry(), 10) - gMaxDataList;
    if (curpos<0) {
      curpos = 0;
	}
    if (curpos>maxpos) {
      curpos = maxpos;
	}
    $("#ximfmailTreeDialogScroll").attr("curpos", curpos);
    OnClickScrollTreeList(0);
  }
  catch(e)
  {
    gConsole.logStringMessage("[ximfmail - OnScrollTreeList ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
  }
  window.setCursor("auto");
}
function OnKeyPressScrollTreeList(event)
{
  window.setCursor("wait");
  gConsole.logStringMessage("[ximfmail - OnKeyPressScrollTreeList ] enter");
  try
  {
    var curpos = parseInt($("#ximfmailTreeDialogScroll").attr("curpos"), 10);
    var addPos = 0;
    var maxEntry = parseInt(gRDFList.getMaxEntry(), 10);
    var maxpos = maxEntry - gMaxDataList;
    var textToFind = "";
    switch(event.keyCode)
    {
      case 33:
        // page up
        addPos = 1-gMaxDataList;
        break;
      case 34:
        // page down
        addPos = gMaxDataList-1;
        break;
      case 35:
        // end
        addPos = 0;
        curpos = maxpos;
        break;
      case 36:
        // beggin
        addPos = 0;
        curpos = 0;
        break;
      case 38:
        // up
        addPos = -1;
        break;
      case 40:
        // down
        addPos = 1;
        break;
      default:
        if(event.charCode === 0)
        {
          window.setCursor("auto");
          return;
        }
        else {
          textToFind = String.fromCharCode(event.charCode);
		  }
    }
    if("" === textToFind)
    {
      curpos += addPos;
      if(curpos<0) {
        curpos = 0;
		}
      if(curpos>maxpos) {
        curpos = maxpos;
		}
      $("#ximfmailTreeDialogScroll").attr("curpos", curpos);
      OnClickScrollTreeList(0);
    }
    else
    {
      clearTimeout(gIDTimeoutListSearch);
      gSearchText += textToFind;
      var curposAfter = gRDFList.updateDisplayByText(gSearchText,gMaxDataList,curpos);
      if(curposAfter === -1)
      {
        gSearchText = "";
        window.setCursor("auto");
        return;
      }
      else
      {
        var maxpos = gMaxDataList;
        if(maxEntry - gMaxDataList >= 0){
          maxpos = maxEntry - gMaxDataList;
        } else {
          maxpos = -1;
		}

        if(maxEntry < gMaxDataList) {
         gMaxDataList = maxEntry;
		}
        $("#ximfmailTreeDialogScroll").attr("maxpos",maxpos);
        $("#ximfmailTreeDialogScroll").attr("curpos", curposAfter);
        OnClickScrollTreeList(0);

        gIDTimeoutListSearch = setTimeout(resetSearchText,2000);
      }
    }
  }
  catch(e)
  {
    gConsole.logStringMessage("[ximfmail - OnKeyPressScrollTreeList ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
  }
  window.setCursor("auto");
}
function resetSearchText()
{
  gSearchText = "";
  gIDTimeoutListSearch = null;
}
