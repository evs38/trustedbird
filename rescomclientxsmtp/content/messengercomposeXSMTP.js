/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * ***** BEGIN LICENSE BLOCK *****
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
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998-2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents o    f this file may be used under the terms of
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
// Global variables
var gPrefs;
var gAddButton;
var gOKButton;
var gRemoveButton;
var gHeaderInputElement;
var gArrayHdrs;
var gHdrsList;
var gContainer;
var gFilterBundle=null;
var gCustomBundle=null;
var customedHead= window.opener['customedHeaders'];
var gMsgCompose = window.opener['gMsgCompose'];
var msgCompFields = gMsgCompose.compFields;
var headersCustom=new Array();
const AVAILABLE_ROW = 8;

//function :  listbox multi-choice 
function availableToChoice(list,list2) {
	var box = document.getElementById(list2);
	var box1 = document.getElementById(list);
	var boxCount = box.selectedCount;
	for (var i = 0; i < boxCount; i++) {
		var item = box.selectedItems[0];
		alert("voici "+ box1.getItemAtIndex[1]);
		if(box1.getRowCount() < AVAILABLE_ROW){ //add Item limit 
			box1.appendItem ( box.selectedItems[0].label , box.selectedItems[0].label );
		}
		box.removeItemAt(box.getIndexOfItem(item));
	}
}


function choices(choice,list) {
	var box = document.getElementById(list);
	var box2 = document.getElementById("available");
	var boxCount = choice.length;
	
	for (var i = 0; i < boxCount; i++) {
		var item = choice[i];
		try{
			box2.removeItemAt(box2.getIndexOfItem(item));
		}catch(ex){}
		box.appendItem ( item , item );
	}
}

//
function onLoad()
{
    gPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
    var hdrs;
    try
    {
       hdrs = gPrefs.getCharPref("mail.compose.other.header");
    }
    catch(ex)
    {
      hdrs =null;
    }
    gArrayHdrs = new Array();
	try
    {
       var champs=customedHead;
		var array1=champs.split("|");
		for (var i = 0; i< array1.length; i++) {
			var item=array1[i];
			var field = item.split(":");
			if (field[0]){
				headersCustom[(TrimString(field[0]))]=TrimString(field[1]);
			}
		}
    }
    catch(ex)
    {
      headersCustom=null;
    }
    initializeDialog(hdrs);
}

function initializeDialog(hdrs)
{
  if (hdrs)
  {
    hdrs = hdrs.replace(/\s+/g,'');  //remove white spaces before splitting
    gArrayHdrs = hdrs.split(",");
	
    for (var i = 0; i< gArrayHdrs.length; i++){
      if (!gArrayHdrs[i]){
        gArrayHdrs.splice(i,1);  //remove any null elements
	  }
	} 
	initializeFields();
  }
}

function initializeFields()
{
  for (var i = 0; i< gArrayHdrs.length; i++) {
      var gArrayElements=(TrimString(gArrayHdrs[i]));
	  addFields(gArrayElements);
  }
}

function addFields(gArrayElement) //ok
{
	var head="";
	try
		{	
		var field = window.document.getElementById(gArrayElement);
		head = headersCustom[gArrayElement];
	}catch(ex) {} 
	if (field){		
		if(head){   
			if (gArrayElement == "X-P772-Special-Handling-Instructions"){
				var choice = new Array();
				choice = head.split(";");
				choices(choice,gArrayElement);
			}else{
				field.value = head;
			}
		}
	}
}


//Remove whitespace from both ends of a string
function TrimString(string) //ok
{
  if (!string) return "";
  return string.replace(/(^\s+)|(\s+$)/g, '')
}

//on button ok onclick
function onOk()
{  
 var headrs = gPrefs.getCharPref("mail.compose.other.header");
 window.opener.customedHeaders="";
 var headers = new Array();
 headers=headrs.split(',');
 var priority;
  if (headers.length)
  {
	msgCompFields.otherRandomHeaders=""; //headers initialization
	var hdrs;
	for (var i =0; i< headers.length; i++) {
		try
		{	
			var priority;
			var list = window.document.getElementById(headers[i]);
			
			if(list.tagName == "listbox"){// listbox data
				 if (list.getItemAtIndex(0).value){
					priority = list.getItemAtIndex(0).value;
					var compte = list.getRowCount();
					for (var j=1; j <compte; j++){
						priority += ";"+list.getItemAtIndex(j).value;
					}
				}
			}else{
				priority = list.value;
			}
			if (priority.length)
			{
			  var rescomHeaders = headers[i]+": ";
			 window.opener.customedHeaders += rescomHeaders + priority + "|";
			}
		}catch(ex) {} 
	}
  }
  window.close();
}