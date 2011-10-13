/* ***** BEGIN LICENSE BLOCK *****
Copyright (c) 2008-2009 EADS DEFENCE AND SECURITY - All rights reserved.
secure header is under the triple license  MPL 1.1/GPL 2.0/LGPL 2.1.


Redistribution and use, in source and binary forms, with or without modification, are permitted provided that the following conditons are met :

1. Redistributions of source code must retain the above copyright notice,
2.MPL 1.1/GPL 2.0/LGPL 2.1. license agreements must be attached in the redistribution of the source code.
3. Neither the names of the copyright holders nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from EADS Defence and Security.

Alternatively, the contents of this file may be used under the terms of
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

REMINDER  :
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR  A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 
EADS Defence and Security - 1 Boulevard Jean Moulin -  ZAC de la Clef Saint Pierre - 78990 Elancourt - FRANCE (IDDN.FR.001.480012.002.S.P.2008.000.10000)
 * ***** END LICENSE BLOCK ***** */

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
