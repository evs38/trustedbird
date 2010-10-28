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
 
var gConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
var gXimfHeaders = null;

//
window.addEventListener('messagepane-loaded', InitXimfailMsgWindow, true);

/*
 * 
 */
function InitXimfailMsgWindow(){	
   //Create a message listener so that we can update the title once the message finishes streaming when it's a dummy.
   gMessageListeners.push({
    onStartHeaders: function () {},
    onEndHeaders: function() {
      var msgDBHdr = gFolderDisplay.selectedMessage;
      if (msgDBHdr){      		
		ParseMsgXimfHeaders(msgDBHdr);
      }
    },
    onEndAttachments: function () {},
  });
}  

/*
 * 
 */
function ParseMsgXimfHeaders(msgDBHdr) {
	try{		
		$("#ximfmailMailPanel").attr("collapsed","true"); // XIMF headers ihm
		$("#ximfmail-custom-panel").attr("collapsed","true"); //XIMF account profile type ihm
		$("#ximfHeadBox").attr("collapsed","true");	// XIMF pictures ihm	
		var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);
		pref = pref.QueryInterface(Components.interfaces.nsIPrefBranch2);
		if(pref.getBoolPref("mailnews.headers.showXimfmail")){
			gXimfHeaders = new XimfmailDbMsg();
			var folderPaneElt = document.getElementById('folderPaneBox');			
			if(folderPaneElt){				
				gXimfHeaders.set(msgDBHdr.folder.getUriForMsg(msgDBHdr)); 	
				// is read message opened in new tab
				if(folderPaneElt.hasAttribute("collapsed")){
					$("#ximfmail-custom-panel").attr("collapsed","true");						
					if(ShowXimfmailPanel()){
						$("#ximfmailMailPanel").removeAttr("collapsed");
					}
				}else{							
					$("#ximfmail-custom-panel").removeAttr("collapsed");
				}					
			}else{
				// message is displayed in new window				
				if (window.arguments[0] instanceof Components.interfaces.nsIMsgDBHdr){
      				msgHdr = window.arguments[0];
      				$("#ximfmail-custom-panel").removeAttr("collapsed");
      				CreateXimfmailCatalog();					
					gXimfHeaders.set(msgDBHdr.folder.getUriForMsg(msgDBHdr)); 
					if(ShowXimfmailPanel())
						$("#ximfmailMailPanel").removeAttr("collapsed");					
					if(ShowExpandedHeaders())				
						$("#ximfHeadBox").removeAttr("collapsed");	
      			}
			}
			
			// common elements to display			  				
			if(ShowExpandedHeaders()){					
				$("#ximfHeadBox").removeAttr("collapsed");								 			
			}	  	
		}else{
			DeleteXimfHeaders();
		}
	}catch(e){
		gConsole.logStringMessage("[ximfmail - ParseMsgXimfHeaders ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);			 			
	}
}


/*
 * Remove all XIMF functions if selected account is not XIMFMAIL tagged
 */
function DeleteXimfHeaders(){
	try{
		// hide ximf expanded headers
		$("#ximfCategoryClassificationLabelImg").removeAttr("src");
		$("#ximfSecurityClassificationLabelImg").removeAttr("src");
		if($("#signedHdrIcon").attr("signed") == "ximfalert"){
			$("#signedHdrIcon").attr("signed","");
		}
	}catch(e){}
}	

/*
 * Ximf headers of current message
 */
function XimfmailDbMsg(){	
	this._mailUri = null;
	this._msgAnalyser = null;
	this._instanceMsgXimf = null;

	// parse and save ximf headers message
	this.set = function(uri){
		try{
			if(!uri) return;
			if(this._mailUri ==	uri) return;
			this._mailUri =	uri;
			this._instanceMsgXimf = null;
			this._msgAnalyser=null;
			
			// get account XIMF definition
			var prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);
			var current_definition = "";				
			if(prefBranch.prefHasUserValue("mailnews.instance.mailpanel")){
				if(prefBranch.prefHasUserValue("mailnews.theme.mailpanel"))
					current_definition =  prefBranch.getCharPref("mailnews.theme.mailpanel");
			}else{
				gConsole.logStringMessage("DBG [ximfmail - XimfmailDbMsg.set ] no ximf preferences ");					
			}
								
			// search for template XIMF			
			this._msgAnalyser = new XimfMessageAnalyser();		
			this._msgAnalyser.setOriginalURI(this._mailUri); 
			this._msgAnalyser.createXimfHdrArray();			 	
			var uriXimfInstance = this._msgAnalyser.hasXimfHeaders(current_definition);
			if(uriXimfInstance){		
				gConsole.logStringMessage("DBG [ximfmail - XimfmailDbMsg.set ] mail instance :  " + uriXimfInstance);			
				this._instanceMsgXimf = uriXimfInstance;
				return true;
			}				
		}catch(e){
			gConsole.logStringMessage("[ximfmail - XimfmailDbMsg.reload ] " + e +"\nline : " + e.lineNumber + " : "+ e + "\nfile : "+ Error().fileName);
		}
		return false;
	};

	// get XIMF value from message
	this.getValue = function(headerName){
		return this._msgAnalyser.getHeaderValue(headerName);
	};
	
	// get XIMF value from message
	this.getCompleteArray = function(){
		return this._msgAnalyser.getCompleteArray();
	};
	
	this.setXimfHeader = function(headerName,value){		
		this._msgAnalyser.setHeaderValue(headerName,value);
	};
}

/* 
 * Dom document manipulations
 */ 
function ToogleHiddenPanel(){	
		if($("#ximfMailTable").attr("hidden") == "true"){
			$("#ximfMailTable").attr("hidden","false");	
			$("#ximfmailComposeMessageMaximize").attr("hidden","true");
			$("#ximfmailComposeMessageMinimize").attr("hidden","false");	
		}else{
			$("#ximfMailTable").attr("hidden","true");	
			$("#ximfmailComposeMessageMaximize").attr("hidden","false");
			$("#ximfmailComposeMessageMinimize").attr("hidden","true");						
		}
} 
 	
// 
function ConvertMimeDatasToLabelValues(){
		try{
			var txtBoxList = $("textbox[class='XimfTextboxDisplay']");			
			for(var x = 0; x<txtBoxList.length; ++x){
				var valueBox = txtBoxList[x].getAttribute("value");
				if( valueBox != ""){
					// menuitem case
					var items = $("popup[id='"+ txtBoxList[x].getAttribute("refpopup") +"'] menuitem");
					if(items.length > 0){
						for(var y = 0; y < items.length; ++y){
							var valueItem = items[y].getAttribute("ximfvalue");
							//alert("valuebox="+valueBox+"\nvalueItem="+valueItem)
							if(valueBox.lastIndexOf(valueItem) != -1){
								txtBoxList[x].setAttribute("value", items[y].getAttribute("label"));							
							}
						}
					}
					// button case
					var buttons = $("popup[id='"+ txtBoxList[x].getAttribute("refpopup") +"'] button");
					if(buttons.length > 0){
						for(var y = 0; y < buttons.length; ++y){
							var valueItem = buttons[y].getAttribute("ximfvalue");
							//alert("valuebox="+valueBox+"\nvalueItem="+valueItem)
							if(valueBox.lastIndexOf(valueItem) != -1){
								txtBoxList[x].setAttribute("value", buttons[y].getAttribute("label"));							
							}
						}
					}
					// chekbox case
					var checkboxes = $("popup[id='"+ txtBoxList[x].getAttribute("refpopup") +"'] checkbox");
					if(checkboxes.length > 0){
						for(var y = 0; y < checkboxes.length; ++y){
							var valueItem = checkboxes[y].getAttribute("ximfvalue");
							//alert("valuebox="+valueBox+"\nvalueItem="+valueItem)
							if(valueBox.lastIndexOf(valueItem) != -1){
								txtBoxList[x].setAttribute("value", checkboxes[y].getAttribute("label"));							
							}
						}
					}
				}
			}
		}catch(e){}
	};



// load ximf headers in DOM documents	
function ShowXimfmailPanel(){			
	if(!gXimfHeaders._instanceMsgXimf){ return false; }		
	try{
		// create DOM panel using compose message template xslt				
		if(gXimfCatalog){
			$("#ximfmailMailPanelTitle").attr("value",gXimfCatalog.getNameInstance(gXimfHeaders._instanceMsgXimf));
		}else{ 			
			$("#ximfmailMailPanelTitle").attr("value","XIMFMAIL");
		}				
		$("#ximfmailMailHeadersTablist").empty();
		var composeDom = CreateDOMWithXimfInstance(gXimfHeaders._instanceMsgXimf,"chrome://theme_ximfmail/content/messengerCompose-ximfmail.xsl");
		$("#ximfmailMailHeadersTablist").append(composeDom);
		$("#ximfmailMailPanel").attr("hidden","true");
		
		// compute datas to message
		try{
			var xheader_dom = $("label[ximfheader]");			
			for(var idx_xheader_dom=0; idx_xheader_dom<xheader_dom.length; ++idx_xheader_dom){
				try{
					//gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - search value for textbox : " + xheader_dom[idx_xheader_dom].getAttribute("ximfheader"));		
					var ximfValue = gXimfHeaders.getValue(xheader_dom[idx_xheader_dom].getAttribute("ximfheader"));
					if(ximfValue){													
						// search for value and comlete display box
						var display_box = $("textbox[refheader='" + xheader_dom[idx_xheader_dom].getAttribute("id") + "']");
						
						if(display_box.length > 0){					
							// default values
							display_box[0].setAttribute("value",ximfValue);
							display_box[0].setAttribute("ximfvalue",ximfValue);
							display_box[0].setAttribute("tooltiptext",ximfValue);
								
							// menuitem value (ilk, linkpopup...)
							var menu_item = $("panel[id='"+display_box[0].getAttribute("refpanel")+"'] menuitem");
							
							for(var idx_menu_item = 0 ; idx_menu_item < menu_item.length ; ++idx_menu_item){
								var current_ximfvalue = menu_item[idx_menu_item].getAttribute("ximfvalue");						
								if(current_ximfvalue.toLowerCase() == ximfValue.toLowerCase()){								
									display_box[0].setAttribute("value",menu_item[idx_menu_item].getAttribute("label"));
									display_box[0].setAttribute("ximfvalue",current_ximfvalue);
									display_box[0].setAttribute("tooltiptext",menu_item[idx_menu_item].getAttribute("label"));
									
									//linkpopup manager									
									var linkpopup = menu_item[idx_menu_item].getAttribute("linkpopupbox");
									if(linkpopup){
										var targetpopup = $("panel[id='"+linkpopup+"']");
										$("textbox[id='" + targetpopup[0].getAttribute("ximfreftextbox")+"']").attr("refpanel",linkpopup);
									}	
								}
							}
						}										
					}
				}catch(e){
					gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - refreshDatas ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
				}
			}
			
			// load free text values
			xheader_dom = $("textbox[class='ximfEditor']"); 				
			for(var idx_xheader_dom=0; idx_xheader_dom<xheader_dom.length; ++idx_xheader_dom){
				try{
					var oriTxtboxId = xheader_dom[idx_xheader_dom].getAttribute("ximfreftextbox");							
					var ximfLabelId = $("textbox[id='"+oriTxtboxId+"']").attr("refheader");
					if(ximfLabelId){
						//gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - search value for freetext :" + $("label[id='"+ximfLabelId+"']").attr("ximfheader")+"\nid ="+ximfLabelId);		
						var ximfValue = gXimfHeaders.getValue($("label[id='"+ximfLabelId+"']").attr("ximfheader"));							
						if(ximfValue){
							xheader_dom[idx_xheader_dom].setAttribute("value",ximfValue);
						}								
						}	
				}catch(e){
					gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - refreshDatas] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
				} 
			}
			
			// load address values
			xheader_dom = $("ximfaddress");  	
			for(var idx_xheader_dom=0; idx_xheader_dom<xheader_dom.length; ++idx_xheader_dom){
				try{
					//var oriTxtbox = $("textbox[id='"+xheader_dom[idx_xheader_dom].getAttribute("ximfreftextbox")+"']").attr("refheader");
					var refHeader = xheader_dom[idx_xheader_dom].getAttribute("refheader");								
					if(refHeader){
						//gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - search value for freetext :" + $("label[id='"+ximfLabelId+"']").attr("ximfheader")+"\nid ="+ximfLabelId);		
						var ximfValue = gXimfHeaders.getValue($("label[id='"+refHeader+"']").attr("ximfheader"));							
						if(ximfValue){												
							xheader_dom[idx_xheader_dom].listaddress = ximfValue;
							//alert("load address values \n"+ximfValue+"\n"+xheader_dom[idx_xheader_dom].listaddress);									
						}								
					}	
				}catch(e){
					gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - refreshDatas] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
				}  
			}
	
			// load datetime values		
			xheader_dom = $("textbox[class='ximfDatetime']");  	
			for(var idx_xheader_dom=0; idx_xheader_dom<xheader_dom.length; ++idx_xheader_dom){
				try{
					var refHeader = xheader_dom[idx_xheader_dom].getAttribute("refheader");								
					if(refHeader){
						//gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - search value for freetext :" + $("label[id='"+ximfLabelId+"']").attr("ximfheader")+"\nid ="+ximfLabelId);		
						var ximfValue = gXimfHeaders.getValue($("label[id='"+refHeader+"']").attr("ximfheader"));							
						if(ximfValue){
							//alert($("label[id='"+refHeader+"']").attr("ximfheader")+" :: "+ximfValue)
							xheader_dom[idx_xheader_dom].setAttribute("ximfvalue", ximfValue);	
							var thisDate = ConvertZTimeToLocal(ximfValue);	
							if(!thisDate) thisDate = ximfValue;								
							xheader_dom[idx_xheader_dom].setAttribute("value",thisDate );																							
							xheader_dom[idx_xheader_dom].setAttribute("ximftype","date");								
						}								
					}	
				}catch(e){
					gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - refreshDatas] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
				} 
			}									
		}catch(e){
			gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - refreshDatas] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
		}			

		// replace values with international labels
		ConvertMimeDatasToLabelValues();			
		
		// modify DOM to create readable ihm
		//replace textbox elements with labels elements 		
		xheader_dom = $("textbox[class='XimfTextboxDisplay']");  	
		for(var idx_xheader_dom=0; idx_xheader_dom<xheader_dom.length; ++idx_xheader_dom){
			try{
				ReplaceTxtboxWithLabel(xheader_dom[idx_xheader_dom]);								
			}catch(e){
				gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - refreshDatas] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
			} 
		}			
		xheader_dom = $("textbox[class='ximfDatetime']");    	
		for(var idx_xheader_dom=0; idx_xheader_dom<xheader_dom.length; ++idx_xheader_dom){
			try{
				ReplaceTxtboxWithLabel(xheader_dom[idx_xheader_dom]);								
			}catch(e){
				gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - refreshDatas] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
			} 	
		}	
		
		// remove template datas			
		$("button[class*='ximfEraser']").remove(); // delete erase button
		$("#ximfmailMailHeadersTablist panel").remove(); // delete popup			
		$("label[class='ximfHeaderLabel']").attr("style","color:inherit;"); // no mandatory labels
		 							
		// event manager panel
		$("#ximfmailComposeMessageMaximize").click(ToogleHiddenPanel);
		$("#ximfmailComposeMessageMinimize").click(ToogleHiddenPanel);				
		$("#ximfmailMailPanelFocusBar").dblclick(ToogleHiddenPanel);		
		$("#ximfmailMailPanel").attr("hidden","false"); // display new panel
		$("button[class*='ximfDetail']").bind("command",OnSelectDetail); //
	}catch(e){
		gConsole.logStringMessage("[ximfmail - ShowXimfmailPanel ] " + e +"\nline : " + e.lineNumber + " : "+ e + "\nfile : "+ Error().fileName);
	}		
	
	return true;	
};

// remove compose template textbox and add dispayed label
function ReplaceTxtboxWithLabel(element){
	try{
		//label 
		var ximflabel = document.createElement("label");
		$(ximflabel).attr("id",element.getAttribute("id"));
		$(ximflabel).attr("value",element.getAttribute("value"));
		$(ximflabel).attr("ximfvalue",element.getAttribute("ximfvalue"));
		
		$(ximflabel).attr("refheader",element.getAttribute("refheader"));										
		$(ximflabel).attr("class","ximfDisplay");
		$(ximflabel).attr("crop","end");
		if(element.hasAttribute("ximfseparator")){
			$(ximflabel).attr("ximfseparator",element.getAttribute("ximfseparator"));
		}
		if(element.hasAttribute("ximftype")){
			$(ximflabel).attr("ximftype",element.getAttribute("ximftype"));
		}		
		
		// detail image
		/*
		var ximfDetailImage = document.createElement("button");
		$(ximfDetailImage).attr("class","ximfmailButton ximfDetail");
		$(ximfDetailImage).attr("refLabel",element.id);
		$(ximflabel.parentNode).append(ximfDetailImage);*/
		
		// replace DOM
		$(element).replaceWith(ximflabel);
		
	}catch(e){
		gConsole.logStringMessage("[ximfmail - ReplaceTxtboxWithLabel] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
	}
}		

// insert security pictures...
function ShowExpandedHeaders(){
	try{
		// ximfmail elements to display pictures
		var imgClassification = document.getElementById("ximfSecurityClassificationLabelImg");
		var imgCategory = document.getElementById("ximfCategoryClassificationLabelImg");
		
		// selected message has no XIMF headers 
		if(!gXimfHeaders._instanceMsgXimf){			
			// remove all ximfmail pictures
			if(imgClassification)	imgClassification.setAttribute("src","");
			if(imgCategory)	imgCategory.setAttribute("src","");	
			return false; 
		}	
	
		//display security labels pictures
		//gConsole.logStringMessage("[ximfmail - showExpandedHeaders ] \n search for labels to display... ");		
		if(imgClassification){						
			imgClassification.setAttribute("src","");					
			var reg=new RegExp("[&]+", "g");				
			var picturesClassifArray = CreateRulesArray(gXimfHeaders._instanceMsgXimf,"ximf:classificationPictures");				
			for(var iHdr=0; iHdr<picturesClassifArray.length ; ++iHdr){
				var headerRef = picturesClassifArray[iHdr]._headerRef;
				var valueRef = gXimfHeaders.getValue(headerRef);
				if(valueRef){
					for(var idxPix = 0 ; idxPix < picturesClassifArray.length ; ++idxPix){
						var tabPictureValueRef =picturesClassifArray[idxPix]._valueRef.split(reg);
						var tabPictureValueName =picturesClassifArray[idxPix]._valueName.split(reg);
						for(var iPict = 0 ; iPict<tabPictureValueRef.length ; ++iPict ){
							//alert("picturesClassifArray[idxPix]._valueRef : "+picturesClassifArray[idxPix]._valueRef);
							var valuemsg = valueRef.toLowerCase();
							var valueref = tabPictureValueRef[iPict].toLowerCase();						
							if( valuemsg.indexOf(valueref, 0) != -1 ){
								imgClassification.setAttribute("src",tabPictureValueName[iPict]);
							}	
						}								
					}				
				}
			}	
		}	
							
		if(imgCategory){
			imgCategory.setAttribute("src","");			
			var reg=new RegExp("[&]+", "g");					
			var picturesCategorArray = CreateRulesArray(gXimfHeaders._instanceMsgXimf,"ximf:categoryPictures");
			for(var iHdr=0; iHdr<picturesCategorArray.length ; ++iHdr){
				var headerRef = picturesCategorArray[iHdr]._headerRef;
				var valueRef = gXimfHeaders.getValue(headerRef);
				if(valueRef){
					for(var idxPix = 0 ; idxPix < picturesCategorArray.length ; ++idxPix){
						var tabPictureValueRef = picturesCategorArray[idxPix]._valueRef.split(reg);
						var tabPictureValueName = picturesCategorArray[idxPix]._valueName.split(reg);
						for(var iPict = 0 ; iPict<tabPictureValueRef.length ; ++iPict ){
							//alert("picturesClassifArray[idxPix]._valueRef : "+picturesClassifArray[idxPix]._valueRef + " & " + valueRef );
							var valuemsg = valueRef.toLowerCase();
							var valueref = tabPictureValueRef[iPict].toLowerCase();						
							if( valuemsg.indexOf(valueref, 0) != -1 ){
								imgCategory.setAttribute("src",tabPictureValueName[iPict]);
							}	
						}								
					}			
				}	
			}									
		}				
	}catch(e){
		gConsole.logStringMessage("[ximfmail - showExpandedHeaders ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
	}
	
	// secure headers signature are present in message, isn't it?
	// this rule is applied only on ximf messages with same instance of current account
	try{			
		secureHdrsArray = CreateRulesArray(gXimfHeaders._instanceMsgXimf,"ximfsecureHeaders");				
		if(secureHdrsArray.length > 0){							
			var smimeBox = document.getElementById("smimeBox")
			if(smimeBox.hasAttribute("collapsed")){					
				// Trustedbird hasn't detected signature
				// set ximfmail information to user
				smimeBox.removeAttribute("collapsed");
				$("#signedHdrIcon").attr("signed","ximfalert");	
			}
		}
	}catch(e){
		gConsole.logStringMessage("[ximfmail - showExpandedHeaders ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
	}
	return true;
}
		
// show values ximf
function OnSelectDetail(evt){
	try{		
		idBox = evt.currentTarget.getAttribute("refLabel"); 
	 	var eltTextbox = document.getElementById(idBox);
	 
		// display datas of current XIMF header		 			
	 	if(eltTextbox.value != ""){
	 		// get informations of datas to load 
			var args = [];				
			var hLabel = document.getElementById(eltTextbox.getAttribute("refheader"));
			args.push(hLabel.getAttribute("value")); // args[0] : id de la textbox à enrichir
			args.push(hLabel.getAttribute("ximfheader")); // args[1] : ref du catalogue à charger
			args.push(eltTextbox.value); // args[2] : titre de la dialogbox
			args.push(eltTextbox.getAttribute("ximfvalue")); // args[3] : description de la dialogbox	
			if(eltTextbox.hasAttribute("ximfseparator")){
				args.push(eltTextbox.getAttribute("ximfseparator"));
			}
			// open dialog		
			window.openDialog("chrome://ximfmail/content/dialogHdrInfo-ximfmail.xul","showmore", "chrome,resizable,centerscreen,modal",args);
	 	}	
	}catch(e){
		gConsole.logStringMessage("[ximfmail - OnSelectXimfmailContextBox ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
	}
}