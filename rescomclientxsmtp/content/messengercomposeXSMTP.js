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
var customedHead = window.opener['customedHeaders'];
var gMsgCompose = window.opener['gMsgCompose'];
var msgCompFields = gMsgCompose.compFields;
var headersCustom=new Array();
const AVAILABLE_ROW = 8;
const MILLISECONDS_PER_HOUR   = 60 * 60 * 1000;
const MICROSECONDS_PER_DAY    = 1000 * MILLISECONDS_PER_HOUR * 24;
const DATE_VERIF='X-P772-Extended-Authorisation-Info';
var verif;
var message;

//function :  listbox multi-choice 
function availableToChoice(list,list2) {
	var box = document.getElementById(list2);
	var box1 = document.getElementById(list);
	var boxCount = box.selectedCount;
	for (var i = 0; i < boxCount; i++) {
		var item = box.selectedItems[0];
		if((box1.getRowCount() < AVAILABLE_ROW)){ //add Item limit 
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
/////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////  field initialisation  ////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
function onLoad()
{
    gPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	verif={};
    var hdrs;
    try
    {
       hdrs = gPrefs.getCharPref("mailnews.customHeaders");
    }
    catch(ex)
    {
      hdrs =null;
    }
    gArrayHdrs = new Array();
	try
    {  
        var champs=customedHead;
		var array1=champs.split("\r");
		for (var i = 0; i< array1.length; i++) {
			var field = array1[i].split(":");
			if (field[0]==DATE_VERIF){ continue;}
			if (field[0]){
				headersCustom[(TrimString(field[0]))]=TrimString(field[1]);
			}
		}
    }
    catch(ex)
    {
      headersCustom={};
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
		if (field){		
			if(head){   
				if (gArrayElement == "X-P772-Special-Handling-Instructions"){
					var choice = new Array();
					choice = head.split(";");
					choices(choice,gArrayElement);
				}else if(field.tagName == 'menulist'){
					field.setAttribute('value',head);
					head=associateValue(head,gArrayElement,'=');
					field.setAttribute('label',head);
					
				}else{
					field.value = head;
				}
			}
		}
	}catch(ex) {} 
}

///////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////  Field check up  //////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
//find associate value
function associateValue(head,field,separator){
	var regval = new RegExp(/^([^=]*)=(.*)/);
	if ((regval.test(head)) == true){
		alert("hier");
		var field2=field+"2";
		onselectOk(field2,RegExp.$2);
		head=RegExp.$1;
	}
	return head;
}

//Remove whitespace from both ends of a string
function TrimString(string) //ok
{
  if (!string) return "";
  return string.replace(/(^\s+)|(\s+$)/g, '')
}

//verification des champs
function isRFC2822Mail(val){
	var field= window.document.getElementById(val);
	var xSMTPbundle = window.document.getElementById('xSMTPCompose');
	message = "";
	var reg =/^(("([a-zA-Z\d]+)"\s+(<){1})?([a-z\d]+((\.|-|_)[a-z\d]+)*@((?![-\d])[a-z\d-]{0,62}[a-z\d]\.){1,4}[a-z]{2,6})(>)?(;)?)+$/;
	var valeur = field.value;
	if(valeur){
		if(!(reg.test(valeur))){
			message = xSMTPbundle.getString(val+".label") + " : "+xSMTPbundle.getString("mail.bad")+"\r\n";
			alert(message);
		}	
	}
	verif[val] = message;
}		

//field size control
function fieldAttributLengthVerif(val,fieldSize,stringMinSize,stringMaxSize){
	var xSMTPbundle = window.document.getElementById('xSMTPCompose');
    var field = window.document.getElementById(val);
	message = "";
	
	var regval="^([a-z\d]{"+stringMinSize+","+stringMaxSize+"};){0,"+(fieldSize - 1)+"}([a-z\d]{"+stringMinSize+","+stringMaxSize+"}(;)?){1}$";
	regval = new RegExp(regval);
	var values = TrimString(field.value); //remove white space before and after
	if (values){
		//alert("val "+values);
		if(!(regval.test(values))){
			message = xSMTPbundle.getString(val+".label") + " : "+xSMTPbundle.getString("format.bad")+"\r\n";
			alert(message);
		}
	}
	verif[val] = message;		
}		
			
function integerNumber(val){
	var number = window.document.getElementById(val).value;
	var xSMTPbundle = window.document.getElementById('xSMTPCompose');
	message = "";
    if(number != parseInt(number)){
		var message = xSMTPbundle.getString(val+".label")+ " : "+xSMTPbundle.getString("integer.bad")+"\r\n";
		alert(message);
	}
	verif[val] = message;
}

function isAllOk(){
	var compte = 0;
	var elt = "";
	for (var i in verif) {
		elt += verif[i];
		if (elt) compte++;
	}
	if (compte>0){
		alert(elt);
		return false;
	}else{return true}
}

function onselectOk(field,val)
{
	field = window.document.getElementById(field);
	field.value = val;
	field.setAttribute("hidden",false);
}

function concatField(field,value)
{
	field = window.document.getElementById(field);
	field.value += "="+ value;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////  field value submission  ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
//on button ok onclick
function onOk()
{  
 //onOK field verification
 if (!isAllOk()){return false};
 var headrs = gPrefs.getCharPref("mailnews.customHeaders");
 window.opener.customedHeaders = ""; //record field value initialization
 var headers = new Array();
 headers = headrs.split(',');
 var priority;
 
  if (headers.length)
  {
	msgCompFields.otherRandomHeaders=""; //headers initialization
	window.opener.customedHeaders += DATE_VERIF+": " + setRFC2822Date(new Date()) + "\r";
	var hdrs;
	for (var i =0; i< headers.length; i++) {
		try
		{	
			var priority;
			var list = window.document.getElementById(headers[i]);
			
			if(list.tagName == "listbox"){// listbox data
				if (list.getItemAtIndex(0).value){
					priority = list.getItemAtIndex(0).value;
					for (var j=1; j <list.getRowCount(); j++){
						priority += ";"+list.getItemAtIndex(j).value;
				}
				}
			}else{
				priority = list.value;
			}
			if (priority.length)
			{
			  window.opener.customedHeaders += headers[i]+": " + priority + "\r";
			}
		}catch(ex) {} 
	}
  }
  return true;

}