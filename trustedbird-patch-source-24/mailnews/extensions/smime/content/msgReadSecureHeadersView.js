 /* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Contributor(s):
 *   Copyright (c) 2008-2009 EADS DEFENCE AND SECURITY - All rights reserved
 *   Copyright(c) Airbus Defence and Space 2014 - All rights reserved */

const SECURE_HEADER_SEPARATOR = "###HEADER_SEPARATOR###";
const HEADER_VAL_SEPARATOR = "###HEADER_VAL###";

/*
gSecureHeadersArray[o.hdrName]={
	o.hdrName = sHeader.headerName; // signed header
	o.hdrSecureValue = sHeader.headerValue; // Value in the signature
	o.hdrMimeValue = "";	// value in the MIME message
	o.hdrSignedStatus = sHeader.headerStatus;
	o.hdrCanonAlgo = aCanonAlgo;
	o.hdrEncryptStatus = "";
	o.hdrSignedRes = "valid";}
*/
function onLoad()
{
	var gSecureHeadersBundle = document.getElementById("bundle_secure_headers_view");

	var secureHeadersString = window.arguments[0];	
	
	if(secureHeadersString=="")return;
	// split secureHeadersString to cSecureHeadersArray
	var cSecureHeadersArray = {}; 
	var each_header_tab=secureHeadersString.split(SECURE_HEADER_SEPARATOR);
	for(var i=0;i<each_header_tab.length;++i){
		var each_value_header_tab=each_header_tab[i].split(HEADER_VAL_SEPARATOR);
		var oEntry = new Object;
		var headerNameEntry = "";			
		for(var idxElt=0;idxElt<each_value_header_tab.length;++idxElt){			
			switch(idxElt){
				case 0:
					headerNameEntry = each_value_header_tab[idxElt];
					oEntry.hdrName = each_value_header_tab[idxElt];
					break;
				case 1:
					oEntry.hdrSecureValue = each_value_header_tab[idxElt];
					break;
				case 2:
					oEntry.hdrMimeValue = each_value_header_tab[idxElt];
					break;
				case 3:
					oEntry.hdrSignedStatus = each_value_header_tab[idxElt];
					break;
				case 4:
					oEntry.hdrCanonAlgo = each_value_header_tab[idxElt];
					break;
				case 5:
					oEntry.hdrSignedRes = each_value_header_tab[idxElt];
					break;				
			}
		}
		oEntry.hdrEncryptStatus = "";
		if(headerNameEntry!="") cSecureHeadersArray[headerNameEntry] = oEntry;
	}
	
	// create tree viewer
	var treechild = document.getElementById("secHeader_treechild_id");	
	for (headerName in cSecureHeadersArray) {
		var label="";					
		//create each element for the tree
		var treeitem=document.createElement("treeitem");
		var treerow=document.createElement("treerow");
		var namecell=document.createElement("treecell");
		var valuecell=document.createElement("treecell");
		var statuscell=document.createElement("treecell");		
		var canonizcell=document.createElement("treecell");		
		var valueMimecell=document.createElement("treecell");
		//var encryptedcell=document.createElement("treecell");
			
		//set the header name, value and status
		namecell.setAttribute("label",cSecureHeadersArray[headerName].hdrName);
		valuecell.setAttribute("label",cSecureHeadersArray[headerName].hdrSecureValue); // signed value
		namecell.setAttribute("properties",cSecureHeadersArray[headerName].hdrSignedRes); 
		valueMimecell.setAttribute("label",cSecureHeadersArray[headerName].hdrMimeValue); // displayed value in message
			
		//set the header status
		switch(cSecureHeadersArray[headerName].hdrSignedStatus){
			case "-1":
				label=gSecureHeadersBundle.getString("notdefine.label");
				break;
			case "0" :
				label=gSecureHeadersBundle.getString("headerstatus.duplicated.label");
				break;
			case "1" :
				label=gSecureHeadersBundle.getString("headerstatus.deleted.label");
				break;
			case "2":
				label=gSecureHeadersBundle.getString("headerstatus.modified.label");
				break;
			default:
				label="ERROR";
				break;
		}
		statuscell.setAttribute("label",label);
			
		//set the canonization algo used
		var sAlgo = "";
		switch(parseInt(cSecureHeadersArray[headerName].hdrCanonAlgo,10)){
			case 0:
				sAlgo =	gSecureHeadersBundle.getString("headercanoniz.simple.label");
				break;
			case 1:
				sAlgo = gSecureHeadersBundle.getString("headercanoniz.relaxed.label");
				break;					
		}
		canonizcell.setAttribute("label",sAlgo);
			
		//set the header encrypted
		/*switch(gSecureHeadersArray[headerName].hdrEncryptStatus){
			case -1:
				label=gSecureHeadersBundle.getString("notdefine.label");
				break;
			case 0 :
				label=gSecureHeadersBundle.getString("no.label");
				break;
			case 1 :
				label=gSecureHeadersBundle.getString("yes.label");
				break;
			default:
				label="ERROR";
				break;
		}
		encryptedcell.setAttribute("label",label);*/

		//append all elements in the tree
		treerow.appendChild(namecell);
		treerow.appendChild(valuecell);
		treerow.appendChild(statuscell);	
		treerow.appendChild(canonizcell);		
		treerow.appendChild(valueMimecell);				
		//treerow.appendChild(encryptedcell);
		treeitem.appendChild(treerow);
		treechild.appendChild(treeitem);
	}
}

/*
 * Load complete informations of selected header in texteboxes box
 */
function DisplayDetailHeader(){
	var gConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
	try{
		var tree = document.getElementById("secureheaderstree.id");			
		var v = tree.currentIndex;
		document.getElementById("headerName_val").value = tree.view.getCellText(v, tree.columns.getColumnAt(0)); 
		document.getElementById("headerValue_val").value = tree.view.getCellText(v, tree.columns.getColumnAt(1));
		document.getElementById("headerStatus_val").value = tree.view.getCellText(v, tree.columns.getColumnAt(2));
		document.getElementById("headerCanonization_val").value = tree.view.getCellText(v, tree.columns.getColumnAt(3));
		document.getElementById("headerMimeValue_val").value = tree.view.getCellText(v, tree.columns.getColumnAt(4));
	}catch(e){
			gConsole.logStringMessage("DisplayDetailHeader -error : " + e + " - line " + e.lineNumber);
	}
}
