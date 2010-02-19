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

var gBoxOpener = null;
var gXimfMaxItems = null;
var gXimfMinItems = null;
var gXimfSeparator = null;
var gCurrentText = null;
var gEditorElt = null; //textbox elment
var gTitleDlg = null;
var gDlgEditorXimf_maxItem_alert = "";

/*
 window.arguments = [];
		args[0] id of textbox 
		args[1] text
		args[2] separator value		
		args[3] max items to write
		args[4] min items to write
*/
$(document).ready(function(){		
	var gArgs = window.arguments;
	if(gArgs[0].length < 5){ 
		alert("error nbargs = "+gArgs[0].length)
		return;}	
	
	// load background datas
	gBoxOpener = gArgs[0][0];
	gCurrentText = gArgs[0][1];
	gXimfSeparator = gArgs[0][2];
	gXimfMaxItems = gArgs[0][3];
	gXimfMinItems  = gArgs[0][4];	
	gTitleDlg = gArgs[0][5];
	//
	gEditorElt = document.getElementById("textbox-editor");		
	gConsole.logStringMessage("[ximfmail - dialogEditor ] \n id of textbox :" + gArgs[0][0] + "\n separator value: " + gArgs[0][2] + "\n max items to write: "+ gArgs[0][3] + "\n min items to write: " +gArgs[0][4]);		
	if(parseInt(gXimfMaxItems) > 1){
		gDlgEditorXimf_maxItem_alert = gXimfMaxItems + " "+ getIlkProperties("ximfmail.dialog.editor.warning.nbrows");
	}else{
		gDlgEditorXimf_maxItem_alert = gXimfMaxItems + "1 "+ getIlkProperties("ximfmail.dialog.editor.warning.nbrows.one");
	}
	RefreshEditor();
	
	// event observer
	$("#textbox-editor").keypress(onCheck);		
}); 

/*
 * 
 */
function doOK()
{
  if(!gEditorElt) return false;
  
  if(gXimfMinItems){
	  if( getWritedRowsCount() < parseInt(gXimfMinItems)){
			alert("no enough item");
	  }
  }
  
  var newvalue = null;
  if(!gXimfSeparator){		
		newvalue = gEditorElt.value;	
	}else{			
		var reg=new RegExp("\n", "g");
		newvalue = gEditorElt.value.replace(reg , gXimfSeparator);
		
		//remove last separator		
		if(newvalue.lastIndexOf(gXimfSeparator)+1 == newvalue.length){
			newvalue = newvalue.substring(0,newvalue.lastIndexOf(gXimfSeparator));
		}
	}
  window.opener.document.getElementById(gBoxOpener).value = newvalue;  
  window.opener.document.getElementById(gBoxOpener).setAttribute("tooltiptext", newvalue);
  return true;
}


function doCancel()
{
  return true;
}

/*
 * 
 */
function onCheck(aEvent){
	if(!gEditorElt) return false;
	var key = aEvent.which;	
	// check for entries items
	if(key == 13){ // key=="\n"		
		if( getWritedRowsCount() > parseInt(gXimfMaxItems)){
			alert(gDlgEditorXimf_maxItem_alert);	
			var reg = new RegExp("\n", "g");
			var artxt = gEditorElt.value.split(reg);
			var newText = "";
			for(var i=0 ; i < gXimfMaxItems; ++i){
				if(i < artxt.length){
					if(gXimfMaxItems-1 == i){
						newText += artxt[i];
					}else{
						newText += artxt[i] + "\n";
					}
				}
			}
			gEditorElt.value = newText;		
		}
	}
	return true;
}

function getWritedRowsCount(){
	var nblines = 0;
	var reg=new RegExp("\n", "g");
	var nbvalue = gEditorElt.value.split(reg);
	return nbvalue.length;
}
/*
 * 
 */
function RefreshEditor(){
	if(!gEditorElt)	return;

	// title box
	$("#editorDialogHeader").attr("title",gTitleDlg);		
	$("#editorDialogHeader").attr("description",gDlgEditorXimf_maxItem_alert);
		
	// text value
	if(!gXimfSeparator){
		gEditorElt.setAttribute("multiline","false");
		gEditorElt.value = gCurrentText;		
	}else{
		try{				
			gEditorElt.setAttribute("multiline","true");
			if(gCurrentText){				
				var reg=new RegExp(gXimfSeparator, "g");		
				var multitxt = gCurrentText.replace(reg , "\n");		
				gEditorElt.setAttribute("value",multitxt+"\n");
			}				
		}catch(e){
			gConsole.logStringMessage("[ximfmail - RefreshEditor ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+ e.lineNumber);		
		}				
	}
}