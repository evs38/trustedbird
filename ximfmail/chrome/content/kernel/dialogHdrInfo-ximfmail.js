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


  
/*
 window.arguments = [];
		args[0] label de l'entête
		args[1] entête brut XIMF
		args[2] liste des valeurs labelisees
		args[3] liste des valeurs XIMF		
		args[4] separateur label
		args[5] separateur XIMF
*/

$(document).ready(function(){
	var gArgs = window.arguments;
	var xSeparator = null;
	var NB_CHARACTERS = 45;
	
		
	if(gArgs[0].length > 0){
		var title = gArgs[0][0];		
		var xHdr  = gArgs[0][1];
		var val   = gArgs[0][2];
		var xval  = gArgs[0][3];
		
	}
	
	if(gArgs[0].length  == 5){
		var xSeparator = gArgs[0][4];
	}	
		
	
	//$("#ximfmail-dialog-hdrInfo").attr("title",title.substring(0,title.lastIndexOf(":")));
	//$("#dlgheader_hdrInfo").attr("title",title.substring(0,title.lastIndexOf(":")));
	//$("#dlgheader_hdrInfo").attr("title",xHdr);
	$("#hdrInfoTreeCol1").attr("label",title.substring(0,title.lastIndexOf(":")));
	$("#hdrInfoTreeCol2").attr("label",xHdr);	
	
	//add complete header to description
	$("#ilkheaderName").attr("value",title.substring(0,title.lastIndexOf(":")));
	$("#ximfheaderName").attr("value",xHdr);
	if(!xSeparator){
		$("#box-ilkheaderValue").attr("hidden",false);
		$("#box-ilkheaderMultivalue").attr("hidden",true);
		var cval = val;
		var temp = "";
		for(var i=0; i< val.length%NB_CHARACTERS; ++i){
			var temp =  temp + cval.slice(0,NB_CHARACTERS)+"\n";
			cval= cval.slice(NB_CHARACTERS, cval.length);		
		}	
		txt = document.createTextNode(temp);	
		$("#ilkheaderValue").append(txt);	
	}else{
		$("#box-ilkheaderValue").attr("hidden",true);
		$("#box-ilkheaderMultivalue").attr("hidden",false);
		var reg=new RegExp("["+xSeparator+"]+", "g");	
		var tabVal=val.split(reg);		
		// append item to listbox
		for (var i=0; i<tabVal.length; i++) {
			var item = document.createElement("listitem");
			$(item).attr("label",tabVal[i]);
			$(item).attr("value",tabVal[i]);
			$("#ilkheaderMultivalue").append(item);
		}
	}
	
	//	
	if(xval != val){		
		cval = xval;
		temp = "";
		for(var i=0; i<cval.length%NB_CHARACTERS; ++i){
			var temp =  temp + cval.slice(0,NB_CHARACTERS)+"\n";
			cval= cval.slice(NB_CHARACTERS, cval.length);		
		}	
		txt = document.createTextNode(temp);
		$("#box-ximfheaderValue").attr("hidden",false);
		$("#ximfheaderValue").append(txt);
	}
	
	/*
	// lsearch for separators in list
	var reg=new RegExp("[,;]+", "g");	
	var tabVal=val.split(reg);
	var tabXval=xval.split(reg);	
	
	// append rows to tree
	$("#hdrInfoTreechildren").empty();	
	for (var i=0; i<tabVal.length; i++) {
    	var item = document.createElement("treeitem");
		var row = document.createElement("treerow");
		var cell1 = document.createElement("treecell");
		var cell2 = document.createElement("treecell");
		
		$(cell1).attr("label",tabVal[i]);
		$(cell2).attr("label",tabXval[i]);
		$(item).append(row);
			
		$(row).append(cell1);
		$(row).append(cell2);
	
		$("#hdrInfoTreechildren").append(item);			
	}*/
}); 

function doOK()
{     
  return true;
}

function doCancel()
{
  return true;
}
