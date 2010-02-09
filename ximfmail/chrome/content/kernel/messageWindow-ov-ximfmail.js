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
var gJSLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].createInstance(Components.interfaces.mozIJSSubScriptLoader);
var gConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
gJSLoader.loadSubScript("chrome://ximfmail/content/jquery.js");
gJSLoader.loadSubScript("chrome://ximfmail/content/controler-ximfmail.js");
gJSLoader.loadSubScript("chrome://ximfmail/content/ximfmail.js");
gJSLoader.loadSubScript("chrome://ximfmail/content/messageAnalyser-ximfmail.js");
gJSLoader.loadSubScript("chrome://ximfmail/content/constant-ximfmail.js");


var gXimfHeaders = null;
var gMsgWdTimer=null;
var gMsgWdReOpenTimer=null;
var gXimfUri=null;


// 
$(document).ready(function(){
	//is message opened in preview panel
	var mainPaneElt = document.getElementById('folderPaneBox');
	if(mainPaneElt){ return; }
	
	// wait for complete message opening
	gMsgWdTimer=setInterval("UpdateDocWithXimfHeaders()", 10);
	gMsgWdReOpenTimer=setInterval("IsNewMsgUri()", 10);
	$(window).bind("close", MsgWindowOvXimfmailTerminate);	
});

// Stop current polling on terminate window
function MsgWindowOvXimfmailTerminate(){	
	try{
		clearInterval(gMsgWdReOpenTimer);
		gMsgWdReOpenTimer=null;
		gXimfUri=null;
		gXimfHeaders=null;
	}catch(e){}
};

// Reload opened window (polling on reloaded window)
function IsNewMsgUri(){
	try{
		if(!gXimfUri)return;
		if(!gCurrentMessageUri)return;
		if(gXimfUri == gCurrentMessageUri)return;
		gXimfUri = gCurrentMessageUri;	
		UpdateDocWithXimfHeaders();
	}catch(e){}
}

// Create panel with instance template
function UpdateDocWithXimfHeaders(){	
	try{
		if(!gCurrentMessageUri) return;
		if(gCurrentMessageUri){				
			if(gMsgWdTimer){
				clearInterval(gMsgWdTimer);
				gMsgWdTimer=null;
				gXimfUri = gCurrentMessageUri;
			}
			// get infos message
			gXimfHeaders = new XimfmailDbMsg();
			gXimfHeaders.set(gXimfUri);			
			ShowExpandedHeaders();
			ShowPanel();
		}
	}catch(e){
		gConsole.logStringMessage("[ximfmail - UpdateDocWithXimfHeaders ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);			 			
	}	
}


// display ximfHdr informations in main panel
function ExpandedXimfHeaders(){
	try{
		if(pref.getBoolPref("mailnews.headers.showXimfmail")){		
			var uri = messenger.lastDisplayedMessageUri;  // var url = GetSelectedMessages()[0];	
			if(uri){	
				//alert("MSG SELECTED : " + uri  )	
				if(!gXimfHeaders) 
					gXimfHeaders = new XimfmailDbMsg();		
				gXimfHeaders.set(uri);
				ShowExpandedHeaders();	
			}	
		}else{
			ResetDomHeaders();		
		}
	}catch(e){
		gConsole.logStringMessage("[ximfmail - ExpandedXimfHeaders ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
	}
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
				//createXimfHdrArray();
				
				//
				var prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);
				var current_definition = "";
				//var instance = "";
				if(prefBranch.prefHasUserValue("mailnews.instance.mailpanel")){
					this._instanceMsgXimf =  prefBranch.getCharPref("mailnews.instance.mailpanel");
					if(prefBranch.prefHasUserValue("mailnews.theme.mailpanel")){
						current_definition =  prefBranch.getCharPref("mailnews.theme.mailpanel");
					}
					gConsole.logStringMessage("DBG [ximfmail - XimfmailDbMsg.set ] search for preferences\nmailnews.instance.mailpanel : "+ this._instanceMsgXimf+"\nmailnews.theme.mailpanel : "+current_definition);
				}else{
					gConsole.logStringMessage("DBG [ximfmail - XimfmailDbMsg.set ] no ximf preferences ");					
				}
								
				// search for template XIMF	
				if(this._msgAnalyser){ this._msgAnalyser=null; }	
				this._msgAnalyser = new XimfMessageAnalyser();		
				this._msgAnalyser.setOriginalURI(this._mailUri); 
				this._msgAnalyser.createXimfHdrArray();			 	
				var uriXimfInstance = this._msgAnalyser.hasXimfHeaders(current_definition);
				if(uriXimfInstance){		
					gConsole.logStringMessage("DBG [ximfmail - XimfmailDbMsg.set ] mail instance :  " + uriXimfInstance);			
					this._instanceMsgXimf = uriXimfInstance;
			}				
		}catch(e){
			gConsole.logStringMessage("[ximfmail - XimfmailDbMsg.reload ] " + e +"\nline : " + e.lineNumber + " : "+ e + "\nfile : "+ Error().fileName);
		}
	};

	// get XIMF value from message
	this.getValue = function(headerName){
		return this._msgAnalyser.getHeaderValue(headerName);
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

// clear Ximf headers panels
function ResetDomHeaders(){
	// hide expanded headers
	$("#rowsHeadersGrid1").empty();
	$("#rowsHeadersGrid2").empty();	
	$("#ximfGroupBox").attr("hidden","true");
};

// load ximf headers in DOM documents	
function ShowPanel(){			
	if(!gXimfHeaders._instanceMsgXimf){ return; }		
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
								var menu_item = $("popup[id='"+display_box[0].getAttribute("popup")+"'] menuitem");
								
								for(var idx_menu_item = 0 ; idx_menu_item < menu_item.length ; ++idx_menu_item){
									var current_ximfvalue = menu_item[idx_menu_item].getAttribute("ximfvalue");						
									if(current_ximfvalue.toLowerCase() == ximfValue.toLowerCase()){								
										display_box[0].setAttribute("value",menu_item[idx_menu_item].getAttribute("label"));
										display_box[0].setAttribute("ximfvalue",current_ximfvalue);
										display_box[0].setAttribute("tooltiptext",menu_item[idx_menu_item].getAttribute("label"));
										
										//linkpopup manager									
										var linkpopup = menu_item[idx_menu_item].getAttribute("linkpopupbox");
										if(linkpopup){
											var targetpopup = $("popup[id='"+linkpopup+"']");
											$("textbox[id='" + targetpopup[0].getAttribute("ximfreftextbox")+"']").attr("popup",linkpopup);
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
						//var oriTxtboxId = xheader_dom[idx_xheader_dom].getAttribute("ximfreftextbox");							
							var ximfLabelId = $("textbox[id='"+oriTxtboxId+"']").attr("refheader");
						if(ximfLabelId){
							//gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - search value for freetext :" + $("label[id='"+ximfLabelId+"']").attr("ximfheader")+"\nid ="+ximfLabelId);		
								var ximfValue = gXimfHeaders.getValue($("label[id='"+ximfLabelId+"']").attr("ximfheader"));							
							if(ximfValue){								
								//$("textbox[id='"+oriTxtboxId+"']").attr("value",ximfValue);
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
					//var oriTxtbox = $("textbox[id='"+xheader_dom[idx_xheader_dom].getAttribute("ximfreftextbox")+"']").attr("refheader");
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
			$("#ximfmailMailHeadersTablist popup").remove(); // delete popup 
			
			 							
			// event manager panel
			$("#ximfmailComposeMessageMaximize").click(ToogleHiddenPanel);
			$("#ximfmailComposeMessageMinimize").click(ToogleHiddenPanel);				
			$("#ximfmailMailPanelFocusBar").dblclick(ToogleHiddenPanel);		
			$("#ximfmailMailPanel").attr("hidden","false"); // display new panel
			$("button[class*='ximfDetail']").bind("command",onSelectDetail); //
		}catch(e){
			gConsole.logStringMessage("[ximfmail - ShowPanel ] " + e +"\nline : " + e.lineNumber + " : "+ e + "\nfile : "+ Error().fileName);
		}			
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
		
		// detail image
		var ximfDetailImage = document.createElement("button");
		$(ximfDetailImage).attr("class","ximfmailButton ximfDetail");
		$(ximfDetailImage).attr("refLabel",element.id);
		
		// replace DOM
		$(element).replaceWith(ximflabel);
		$(ximflabel.parentNode).append(ximfDetailImage);
	}catch(e){
		gConsole.logStringMessage("[ximfmail - ReplaceTxtboxWithLabel] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
	}
}		

// insert security pictures...
function ShowExpandedHeaders(){
	//display security labels pictures
	try{
		gConsole.logStringMessage("[ximfmail - showExpandedHeaders ] \n search for labels to display... ");		
		var imgClassification = document.getElementById("ximfSecurityClassificationLabelImg");
		if(imgClassification){						
			//imgClassification.setAttribute("ximfvalue",_msgAnalyser.getHeaderValue("X-XIMF-Security-Classification-Identifier"));
			//imgClassification.setAttribute("src","chrome://ximf-intraced-cd-theme/content/resource/ximf-label_CD.png");
			imgClassification.setAttribute("src","");
			var picturesClassifArray  = [];		
			var reg=new RegExp("[&]+", "g");				
			picturesClassifArray = CreateRulesArray(gXimfHeaders._instanceMsgXimf,"classificationPictures");				
			if(picturesClassifArray.length > 0){
				var headerRef = picturesClassifArray[0]._headerRef;
				var valueRef = gXimfHeaders.getValue(headerRef);
				//alert(headerRef+" > "+valueRef);
				for(var idxPix = 0 ; idxPix < picturesClassifArray.length ; ++idxPix){
					var tabPictureValueRef =picturesClassifArray[idxPix]._valueRef.split(reg);
					var tabPictureValueName =picturesClassifArray[idxPix]._valueName.split(reg);
					for(var iPict = 0 ; iPict<tabPictureValueRef.length ; ++iPict ){
						//alert("picturesClassifArray[idxPix]._valueRef : "+picturesClassifArray[idxPix]._valueRef);
						var valuemsg = valueRef.toLowerCase();
						var valueref = tabPictureValueRef[iPict].toLowerCase();						
						if( valuemsg.indexOf(valueref, 0) != -1 ){
							//alert("src : "+ tabPictureValueName[iPict]);
							imgClassification.setAttribute("src",tabPictureValueName[iPict]);
						}	
					}								
				}				
			}	
		}						
		var imgCategory = document.getElementById("ximfCategoryClassificationLabelImg");
		if(imgCategory){
			//imgCategory.setAttribute("ximfvalue",_msgAnalyser.getHeaderValue("X-XIMF-Security-Categories-Identifier"));
			//imgCategory.setAttribute("src","chrome://ximf-intraced-cd-theme/content/resource/ximf-label_SF.png");
			imgCategory.setAttribute("src","");
			var picturesCategoryArray  = [];
			var reg=new RegExp("[&]+", "g");					
			picturesCategorArray = CreateRulesArray(gXimfHeaders._instanceMsgXimf,"categoryPictures");
			if(picturesCategorArray.length > 0){
				var headerRef = picturesCategorArray[0]._headerRef;
				var valueRef = gXimfHeaders.getValue(headerRef);
				//alert(headerRef+" > "+valueRef);
				for(var idxPix = 0 ; idxPix < picturesCategorArray.length ; ++idxPix){
					var tabPictureValueRef = picturesCategorArray[idxPix]._valueRef.split(reg);
					var tabPictureValueName = picturesCategorArray[idxPix]._valueName.split(reg);
					for(var iPict = 0 ; iPict<tabPictureValueRef.length ; ++iPict ){
						//alert("picturesClassifArray[idxPix]._valueRef : "+picturesClassifArray[idxPix]._valueRef + " & " + valueRef );
						var valuemsg = valueRef.toLowerCase();
						var valueref = tabPictureValueRef[iPict].toLowerCase();						
						if( valuemsg.indexOf(valueref, 0) != -1 ){						
							//alert("src : "+ tabPictureValueName[iPict]);
							imgCategory.setAttribute("src",tabPictureValueName[iPict]);
						}	
					}								
				}				
			}									
		}				
	}catch(e){
		gConsole.logStringMessage("[ximfmail - showExpandedHeaders ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
	}
}
		
// show values ximf
function onSelectDetail(evt){
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