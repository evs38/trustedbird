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
//var Prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
//is mail RFC2822
function isRFC2822Mail(val){
	var field= window.document.getElementById(val);
	var xSMTPbundle = window.document.getElementById('xSMTPCompose');
	var countFaulse=0;
	var reg=/^[a-z\d]+((\.|-|_)[a-z\d]+)*@((?![-\d])[a-z\d-]{0,62}[a-z\d]\.){1,4}[a-z]{2,6}$/;
	//var reg=/^([a-z\d]\s+)?[a-z\d]+((\.|-|_)[a-z\d]+)*@((?![-\d])[a-z\d-]{0,62}[a-z\d]\.){1,4}[a-z]{2,6}$/;
	//var reg=/^([a-z\d]+\$<)?[a-z\d]+((\.|-|_)[a-z\d]+)*@((?![-\d])[a-z\d-]{0,62}[a-z\d]\.){1,4}[a-z]{2,6}(>)?$/;
	//var reg=/^((?(?<!^)\.)[-!#$%&\'*+\/0-9=?a-z^_`{|}~]+)+@'.'((?(?<!@)\.)[a-z]([-a-z0-9]{0,61}[a-z0-9])?)+$/;
	//var reg=/^([a-zA-Z0-9_-])+([.]?[a-zA-Z0-9_-]{1,})*@([a-zA-Z0-9-_]{2,}[.])+[a-zA-Z]{2,3}$/;
//var reg=/^([<-!#-'*+\/-9=?A-Z^-~\x80-\xFF>]+\.)*[-!#-'*+\/-9=?A-Z^-~\x80-\xFF]+@([-!#-'*+\/-9=?A-Z^-~\x80-\xFF]+\.)+[-!#-'*+\/-9=?A-Z^-~\x80-\xFF]+$/;
    //var reg=/^((?>[a-zA-Z\d!#$%&'*+\-\/=?^_`{|}~]+\x20*|"((?=[\x01-\x7f])[^"\\]|\\[\x01-\x7f])*"\x20*)*(?<angle><))?((?!\.)(?>\.?[a-zA-Z\d!#$%&'*+\-\/=?^_`{|}~]+)+|"((?=[\x01-\x7f])[^"\\]|\\[\x01-\x7f])*")@(((?!-)[a-zA-Z\d\-]+(?<!-)\.)+[a-zA-Z]{2,}|\[(((?(?<!\[)\.)(25[0-5]|2[0-4]\d|[01]?\d?\d)){4}|[a-zA-Z\d\-]*[a-zA-Z\d]:((?=[\x01-\x7f])[^\\\[\]]|\\[\x01-\x7f])+)\])(?(angle)>)$/;
	var valeur =field.value;
	if(valeur){
		var array1=valeur.split(";");
		for(var i=0; i< array1.length; i++){
			countFaulse += reg.test(valeur);
		}
		
		if (countFaulse != true){
			message = xSMTPbundle.getString(val+".label") + " : "+xSMTPbundle.getString("mail.bad");
			alert(message);
			//field.focus();
			var ver=window.opener.verif;
			alert("ver "+ver);
			//if (!(window.opener.verif.grep(val))){
				window.opener.verif[val]= message + "\r\n";
			//}
			alert ("bibi "+window.opener['verif']);
		}
	}
}		

//field size control
function fieldAttributLengthVerif(val,fieldSize,stringMinSize,stringMaxSize){
	var xSMTPbundle = window.document.getElementById('xSMTPCompose');
    var field= window.document.getElementById(val);
	var message="ok";
	
	var regval="^([a-z\d]{"+stringMinSize+","+stringMaxSize+"};){0,"+(fieldSize - 1)+"}([a-z\d]{"+stringMinSize+","+stringMaxSize+"}(;)?){1}$";
	regval = new RegExp(regval);
	//alert(regval);
	var values = TrimString(field.value);
	if (values){
		if(regval.test(values) == false){
			message = xSMTPbundle.getString(val+".label") + " : "+xSMTPbundle.getString("format.bad");
			alert(message);	
			//if (!window.opener.verif.indexOf(val)){
				window.opener.verif += message + "|";
			//}
		}
	}
			
}		
			

function integerNumber(val){
	var number = window.document.getElementById(val).value;
	var xSMTPbundle = window.document.getElementById('xSMTPCompose');
    if(number != parseInt(number)){
		var message = xSMTPbundle.getString(val+".label")+ " : "+xSMTPbundle.getString("integer.bad");
		alert(message);
		//val = val+": ";
		//if (!window.opener.verif.indexOf(val)){
			window.opener.verif += message + "\r\n";
		//}
	}
}
			
function TrimString(string) //ok
{
  if (!string) return "";
  return string.replace(/(^\s+)|(\s+$)/g, '')
}	