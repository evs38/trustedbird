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
var XIMF_RULE_TARGET_NAME_MANDATORY_HEADERS = "MandatoryHeaders";
var gSpecialMandatoryHeaders = [];
//
function SpecialMandatoryHeaders(nameHeader,refHeader){
	if(nameHeader && refHeader){
		var o = new Object();
		o.nameHeader = nameHeader;
		o.refHeader = refHeader;
		gSpecialMandatoryHeaders.push(o);
	}
	$("#addressingWidget").bind("command",SpecialXimfRule_CheckAddress);
	AddEventSpecialMandatoryHeaders();
}
//
function AddEventSpecialMandatoryHeaders(){
	$("#addressingWidget textbox").bind("input",function(evt){
		if(evt.currentTarget.value.length <= 1) {
			SpecialXimfRule_CheckAddress();
		}
	});
}
//
function SpecialXimfRule_CheckAddress(){
	try{
		var menulist = $("#addressingWidget menulist");
		for(var idxSMH = 0 ; idxSMH < gSpecialMandatoryHeaders.length ; ++idxSMH){
			var valueRef = "addr_" + gSpecialMandatoryHeaders[idxSMH].refHeader;
			var nameHeader = gSpecialMandatoryHeaders[idxSMH].nameHeader;
			var valueRefSelected = false;
			for(var i=0;i<menulist.length;++i){
				var valueMenuList = $(menulist[i]).attr("value");
				if( valueMenuList === valueRef){
					// "addr_cc"
					try{
						var id = $(menulist[i]).attr("id");
						var idBox = "addressCol2#" + id.slice(id.indexOf("#")+1,id.length);
						elt = document.getElementById(idBox);
						if(elt.value !== ""){
							// Apply specific rule SpecialXimfRule_MandatoryHeadersCC
							SpecialXimfRule_MandatoryHeaders(nameHeader);
							valueRefSelected = true;
						}
					}catch(ex){}
					break;
				}
			}
			// no rules to apply : unregister it
			if(!valueRefSelected){
				SpecialXimfRule_No_MandatoryHeaders(nameHeader);
			}
		}
		// register new textboxes events
		setTimeout("AddEventSpecialMandatoryHeaders()", 50);
	}catch(e){
			gConsole.logStringMessage("[ximfmail - SpecialXimfRule_CheckAddress ] \n " + err + "\nfile : " + Error().fileName+"\nline : "+err.lineNumber);
	}
}
//
function SpecialXimfRule_MandatoryHeaders(nameHeader){
	try{
		// get headers to mandatory
		var hdrLabel = $("label[ximfheader='"+nameHeader+"']");
		if(hdrLabel){
			hdrLabel[0].setAttribute("ximfmandatory","true");
			CheckXimfhdrsSelection();
		}
	}catch(e){
		gConsole.logStringMessage("[ximfmail - SpecialXimfRule_MandatoryHeaders ] \n " + err + "\nfile : " + Error().fileName+"\nline : "+err.lineNumber);
	}
}
//
function SpecialXimfRule_No_MandatoryHeaders(nameHeader){
	try{
		//get headers to unmandatory
		var hdrLabel = $("label[ximfheader='"+nameHeader+"']");
		if(hdrLabel){
			hdrLabel[0].setAttribute("ximfmandatory","false");
			hdrLabel[0].setAttribute("style","color:inherit;");
			CheckXimfhdrsSelection();
		}
	}catch(e){
		gConsole.logStringMessage("[ximfmail - SpecialXimfRule_MandatoryHeaders ] \n " + err + "\nfile : " + Error().fileName+"\nline : "+err.lineNumber);
	}
}