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

var gSecureHeaders="";

const SECURE_HEADER_SEPARATOR = "###HEADER_SEPARATOR###";
const HEADER_VAL_SEPARATOR = "###HEADER_VAL###";
const URL_IMAGE_HDRVALID = "chrome://messenger/skin/smime/icons/sbSignOk.png"
const URL_IMAGE_HDRNOTVALID = "chrome://messenger/skin/smime/icons/sbSignNotOk.png"

function onLoad()
{
	var gSecureHeadersBundle = document.getElementById("bundle_secure_headers_view");

	gSecureHeaders = window.arguments[0];
	
	if(gSecureHeaders!="")
	{
		var treechild = document.getElementById("secHeader_treechild_id");
		var each_header_tab=gSecureHeaders.split(SECURE_HEADER_SEPARATOR);
		for(var i=0;i<each_header_tab.length;++i)
		{
			var each_value_tab=each_header_tab[i].split(HEADER_VAL_SEPARATOR);
			var label;
			if(each_value_tab.length>=3){
				//read the current header property
				var headerName = each_value_tab[0];
				var headerValue = each_value_tab[1];
				var headerStatus = each_value_tab[2];
				var headerSecStatus = each_value_tab[3];
				//var headerEncrypted = parseInt(each_value_tab[4]);

				//create each element for the tree
				var treeitem=document.createElement("treeitem");
				var treerow=document.createElement("treerow");
				var namecell=document.createElement("treecell");
				var valuecell=document.createElement("treecell");
				var statuscell=document.createElement("treecell");
				var secstatuscell=document.createElement("treecell");
				//var encryptedcell=document.createElement("treecell");
				
				//set the header name and value
				namecell.setAttribute("label",headerName);
				valuecell.setAttribute("label",headerValue);
				
				//set the header status
				switch(headerStatus)
				{
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

				//set the header secure status
				switch(headerSecStatus)
				{
					case "ok":
						var lab=gSecureHeadersBundle.getString("headersecure.valid.label");
						//secstatuscell.setAttribute("src",URL_IMAGE_HDRVALID);
						secstatuscell.setAttribute("tooltiptext",lab);
						secstatuscell.setAttribute("properties","valid_pic");
						namecell.setAttribute("properties","valid");
					break;
					case "nok":
						var lab=gSecureHeadersBundle.getString("headersecure.invalid.label");
						//secstatuscell.setAttribute("src",URL_IMAGE_HDRNOTVALID);
						secstatuscell.setAttribute("tooltiptext",lab);
						secstatuscell.setAttribute("properties","invalid_pic");
						namecell.setAttribute("properties","invalid");
					break;
					default:
						var lab=gSecureHeadersBundle.getString("notdefine.label");
						secstatuscell.setAttribute("label",lab);
					break;
				}
				secstatuscell.setAttribute("align","center");
				
				//set the header encrypted
				/*switch(headerEncrypted)
				{
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

				//append all element in the tree
				treerow.appendChild(namecell);
				treerow.appendChild(valuecell);
				treerow.appendChild(statuscell);
				treerow.appendChild(secstatuscell);
				//treerow.appendChild(encryptedcell);
				treeitem.appendChild(treerow);
				treechild.appendChild(treeitem);
			}
		}
	}
}
