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
 *   BT Global Services / Etat français Ministère de la Défense
 * Portions created by the Initial Developer are Copyright (C) 1998-2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bruno Lebon BT Global Services / Etat français Ministère de la Défense
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
// Global variables
var gPrefs;
var gAddButton;
var gOKButton;
var gRemoveButton;
var gHeaderInputElement;
var gArrayHdrs;
var gHdrsList;
var gFilterBundle=null;
var gCustomBundle=null;
var gMsgCompose = window.opener['gMsgCompose'];
var msgCompFields = gMsgCompose.compFields;
var headersCustom=new Array();
const AVAILABLE_ROW = 8;
const DATE_VERIF='X-P772-Extended-Authorisation-Info';
var verif;
var message;
var customedHead;

//window first initialisation
window.opener.customedHeaders=msgCompFields.otherRandomHeaders;
if((!(gMsgCompose.bodyModified)) || (!(window.opener.gContainer))){window.opener.gContainer=0; gMsgCompose.bodyModified=true;}

//function :  listbox multi-choice 
function availableToChoice(list,list2) {
	var box = document.getElementById(list2);
	var box1 = document.getElementById(list);
	var boxCount = box.selectedCount;
	var box_1="";
	try{
		box1.selectAll( );
		var box1item = box1.selectedCount;
		for (var i = 0; i < box1item; i++) {
			box_1 += box1.selectedItems[i].label +",";
		}
		box1.clearSelection( );
	}catch(ex){}	
	
	for (var i = 0; i < boxCount; i++) {
		var item = box.selectedItems[0];
		try{
			box.removeItemAt(box.getIndexOfItem(item));
			var regexp=item.label;
			regexp = new RegExp(regexp);
			if ((regexp.test(box_1)) == true){continue;}//remove item that already exist
		}catch(ex){}
		if((box1.getRowCount() < AVAILABLE_ROW)){ //add Item limit 
			box1.appendItem ( item.label , item.label );
		}		
	}
}
//function : set listbox multi-choice onload
function choices(choice,list) {
	var box = document.getElementById(list);
	var box2 = document.getElementById("available");
	
	for (var i = 0; i < choice.length; i++) {
		var item = choice[i];
		box.appendItem ( item , item );
	}
}

/////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////  field initialisation  ////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
//get headers from draft
function isDraftMessage(array1){
	var catchHeaderFromURI = getXsmtpHeadersFromURI(window.opener['msgWindow']);
	if ((catchHeaderFromURI) && (window.opener.gContainer != 1) ){
		window.opener.customedHeaders = catchHeaderFromURI; //record field value initialization
		return catchHeaderFromURI;
	}return array1;
}

//fill field on onload
function onLoad()
{
    //window first initialisation
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
		var champs=window.opener.customedHeaders;
		champs = isDraftMessage(champs);
		
		var array1=champs.split("\r\n");
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

//no null field
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

//add field value
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
                }else if (gArrayElement == "X-P772-MCA"){	
						var disabledField=window.document.getElementById("X-P772-Distribution-Codes").setAttribute('disabled',true);
						field.value = head;
			    }else if (gArrayElement == "X-P772-Distribution-Codes"){
				        var disabledField=window.document.getElementById("X-P772-MCA").setAttribute('disabled',true);
						field.value = head;
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
	if ((/^([^=]+)=(.*)/.test(head)) == true){
		var field2=field+"2";
		onselectOk(field2,RegExp.$2,RegExp.$1);
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

//mail field check up
function isRFC2822Mail(val){
	var xSMTPbundle = window.document.getElementById('xSMTPCompose');
	var field= window.document.getElementById(val);
	message = "";
	var reg =/^(("([a-zA-Z\d]+)"\s+(<){1})?([a-z\d]+((\.|-|_)[a-z\d]+)*@((?![-\d])[a-z\d-]{0,62}[a-z\d]\.){1,4}[a-z]{2,6})(>)?(;)?)+$/;
	var valeur = field.value;
	if(valeur){
		if(!(reg.test(valeur))){
			message = xSMTPbundle.getString(val+".label") + " : "+xSMTPbundle.getString("mail.bad")+"\r\n";
			verif[val] = message;
			//alert(message);
		}	
	}
	verif[val] = message;
}		

//field to desable
function fieldDesabled(fieldEnable,fieldToDisabled){
	var field = window.document.getElementById(fieldEnable);
	var disabledField=window.document.getElementById(fieldToDisabled);
	var values = TrimString(field.value); //remove white space before and after
	if (values){
		disabledField.setAttribute('disabled',true);
	}else{ disabledField.removeAttribute('disabled');}
}

//field size control
function fieldAttributLengthVerif(val,fieldSize,stringMinSize,stringMaxSize){
	var xSMTPbundle = window.document.getElementById('xSMTPCompose');
    var field = window.document.getElementById(val);
	message = "";
	
	//var regval="^([a-z\d]{"+stringMinSize+","+stringMaxSize+"};){0,"+(fieldSize - 1)+"}([a-z\d]{"+stringMinSize+","+stringMaxSize+"}(;)?){1}$";
	var regval="^(.{"+stringMinSize+","+stringMaxSize+"};){0,"+(fieldSize - 1)+"}(.{"+stringMinSize+","+stringMaxSize+"}(;)?){1}$";
	regval = new RegExp(regval);
	var values = TrimString(field.value); //remove white space before and after
	if (values){
		if(!(regval.test(values))){
			message = xSMTPbundle.getString(val+".label") + " : "+xSMTPbundle.getString("format.bad")+"\r\n";
			verif[val] = message;
			//alert(message);
		}
	}
	verif[val] = message;		
}		

//is integer			
function integerNumber(val){
	var xSMTPbundle = window.document.getElementById('xSMTPCompose');
	var xSMTPNumber = window.document.getElementById(val).value;
	message = "";
    if((TrimString(xSMTPNumber)) &&(xSMTPNumber != parseInt(xSMTPNumber))){
		var message = xSMTPbundle.getString(val+".label")+ " : "+xSMTPbundle.getString("integer.bad")+"\r\n";
		verif[val] = message;
		//alert(message);
	}
	verif[val] = message;
}

//needed field check up
function isNeeded(){
	var xSMTPbundle = window.document.getElementById('xSMTPCompose');
	//var xSMTPNeededHeaders = new Array();
	var xSMTPNeededHeaders = gPrefs.getCharPref("xsmtp.neededHeaders").split(',');
	for (var i =0; i< xSMTPNeededHeaders.length; i++) {
		message = "";
		var field= window.document.getElementById(xSMTPNeededHeaders[i]);
		if (!(TrimString(field.value))){
			var message = xSMTPbundle.getString(xSMTPNeededHeaders[i]+".label")+ " : "+xSMTPbundle.getString("xsmtp.needed")+"\r\n";
		}
		verif[xSMTPNeededHeaders[i]] = message;
	}
}

// is all field syntax ok
function isAllOk(){
    isNeeded();
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

//field description control
function onselectOk(field,valFieldText,valFieldMenu)
{
	field = window.document.getElementById(field);
	if (valFieldMenu){
		if(valFieldText){field.value = valFieldText;}
		field.removeAttribute("disabled");
	}else{
		field.value ='';
		field.setAttribute("disabled",true);
	}
}

//concate field and its optionnal description
function concatField(field,value)
{
	field = window.document.getElementById(field);
	value=value.replace(/\s+/g,'');
	if (/^([^=]+)=.*/.test(field.value)){
		if (value == ""){
				field.setAttribute('value',RegExp.$1);
		}else{ field.value = RegExp.$1+"="+ value;}
	}else if((field.value) && (value)){ field.value += "="+ value;}
}

//syntax control
function isValidChar(field, fieldValue){
	var xSMTPbundle = window.document.getElementById('xSMTPCompose');
	field = window.document.getElementById(field);
	/*if (/([^\w])/.test(fieldValue)){//autre correction
		alert (xSMTPbundle.getString("syntax.bad")+ " :"+RegExp.$1);*/
	if (/[:]/.test(fieldValue)){
		alert (xSMTPbundle.getString("syntax.bad"));
		field.value =  fieldValue.substring(0,fieldValue.length -1);
		//fieldValue = fieldValue.substring(0,fieldValue.length -1);
		//field.value = fieldValue;
	}
}
	

//////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////  field value submission  ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
//onclick
function onOk()
{  
 //onOK field verification
 if (!isAllOk()){return false};
 //var xsmtpHeaders = new Array();
 var xsmtpHeaders = gPrefs.getCharPref("mailnews.customHeaders").split(',');
 var priority;
 
  if (xsmtpHeaders.length)
  {
	window.opener.customedHeaders = ""; //record field value initialization
	msgCompFields.otherRandomHeaders = ""; //headers initialization
	//window.opener.customedHeaders += DATE_VERIF+":" + setRFC2822Date(new Date()) + "\r\n";
	
	for (var i =0; i< xsmtpHeaders.length; i++) {
		try
		{	
			if (/available|info/i.test(xsmtpHeaders[i])){continue;}
			
			var priority;
			var list = window.document.getElementById(xsmtpHeaders[i]);
			
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
			//if (priority.length) //no null field
			//{
			  window.opener.customedHeaders += xsmtpHeaders[i]+":" + priority + "\r\n";
			  msgCompFields.otherRandomHeaders = window.opener.customedHeaders;
			 // window.opener.customedHeaders="";
			//}
		}catch(ex) {} 
	}
  }
  window.opener.gContainer=1;
  return true;
}

//onclick
function onCancel()
{  
 return true;
}