var XIMF_RULE_TARGET_NAME_MANDATORY_HEADERS = "MandatoryHeaders"
var gSpecialMandatoryHeaders = [];

//
function SpecialMandatoryHeaders(nameHeader,refHeader){
	//alert("SpecialMandatoryHeaders refHeader = " + refHeader + "\nnameHeader = " + nameHeader);
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
	$("#addressingWidget textbox").bind("input",function(evt){if(evt.currentTarget.value.length <= 1) SpecialXimfRule_CheckAddress();});
}

//
function SpecialXimfRule_CheckAddress(){	
	try{
		var menulist = $("#addressingWidget menulist");	
		for(var idxSMH = 0 ; idxSMH < gSpecialMandatoryHeaders.length ; ++idxSMH){
			var valueRef = "addr_" + gSpecialMandatoryHeaders[idxSMH].refHeader; //
			var nameHeader = gSpecialMandatoryHeaders[idxSMH].nameHeader;
			var valueRefSelected = false;
	
			for(var i=0;i<menulist.length;++i){
				var valueMenuList = $(menulist[i]).attr("value");
				
				if( valueMenuList == valueRef){//"addr_cc"
					try{			
						var id = $(menulist[i]).attr("id");
						var idBox = "addressCol2#" + id.slice(id.indexOf("#")+1,id.length);			
						elt = document.getElementById(idBox);
						if(elt.value != ""){
							// Apply specific rule SpecialXimfRule_MandatoryHeadersCC
							//alert("id = " + idBox + "\nvalue = " + elt.value);	
							SpecialXimfRule_MandatoryHeaders(nameHeader);
							valueRefSelected = true;					
						}
					}catch(ex){}				
					break;
				}
			}		
			
			// no rules to apply : unregister it
			if(!valueRefSelected){
				//gConsole.logStringMessage("SpecialXimfRule_No_MandatoryHeaders ");
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
		//gConsole.logStringMessage("SpecialXimfRule_MandatoryHeaders on " + nameHeader);	
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
		//gConsole.logStringMessage("SpecialXimfRule_No_MandatoryHeaders on " + nameHeader)
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