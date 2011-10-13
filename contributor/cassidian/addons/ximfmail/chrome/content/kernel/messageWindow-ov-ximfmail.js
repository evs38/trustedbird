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

//
window.addEventListener('messagepane-loaded', InitXimfailMsgWindow, true);
 
/*
 * Create a message listener  
 */
function InitXimfailMsgWindow(){		
   //	
   gMessageListeners.push({
    onStartHeaders: function (){
    	
    },
    onEndHeaders: function(){ 
    	var uriMsg = null;
    	if (gMessageDisplay.isDummy){
    		// displayed message from disk
    		uriMsg = gMessageDisplay.displayedUri;    	
    		gConsole.logStringMessage("[ximfmail - InitXimfailMsgWindow.onEndHeaders ]\ndisplayed message from disk - url = "+uriMsg);
    	}else{
    	   	// get uri of selected message
    		var msgDBHdr = gFolderDisplay.selectedMessage;
    		if(msgDBHdr)	uriMsg = msgDBHdr.folder.getUriForMsg(msgDBHdr);
    	}
    	XimfmailGetMessage(uriMsg,XimfmailParseAndOpenMesssage);    	
    },
    onEndAttachments: function (){
	}
  });
}

/*
 * Get Extended headers of messages and display known instances
 */
function XimfmailParseAndOpenMesssage(msgSrc,uriSrc){
	var currentXimfHdrArray = XimfmailParseMessage(msgSrc);	
	try{
		if(currentXimfHdrArray.length > 0){
			var ximfMsg = new XimfmailMesssage();
			if(ximfMsg.init(uriSrc,currentXimfHdrArray)){	
				//alert("XimfmailParseMesssage uriSrc = " + uriSrc +" \n valid ximfmail message")				
				var folderPaneElt = document.getElementById('folderPaneBox'); 			
				if(folderPaneElt){
					// is read message opened in new tab
					if(folderPaneElt.hasAttribute("collapsed")){
						$("#ximfmail-custom-panel").attr("collapsed","true");						
						if(ShowXimfmailPanel(ximfMsg)){
							$("#ximfmailMailPanel").removeAttr("collapsed");
						}					
					}else{							
						$("#ximfmail-custom-panel").removeAttr("collapsed");
					}					
				}else{	
					//alert("XimfmailParseMesssage - new window - uriSrc = " + uriSrc +" \n valid ximfmail message")					
					// message is displayed in new window		      		
		      		$("#ximfmail-custom-panel").removeAttr("collapsed");
					if(ShowXimfmailPanel(ximfMsg))	$("#ximfmailMailPanel").removeAttr("collapsed");
				}
				// common elements to display			  				
				if(ShowExpandedHeaders(ximfMsg)){					
					$("#ximfHeadBox").removeAttr("collapsed");								 			
				}				
			}
		}	
	}catch(e){
		gConsole.logStringMessage("XimfmailParseAndOpenMesssage error:"+e);
	}
};


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
					var items = $("panel[id='"+ txtBoxList[x].getAttribute("refpanel") +"'] menuitem");
					if(items.length > 0){
						for(var y = 0; y < items.length; ++y){
							var valueItem = items[y].getAttribute("ximfvalue");							
							if(valueBox.toLowerCase() == valueItem.toLowerCase()){
								txtBoxList[x].setAttribute("value", items[y].getAttribute("label"));							
							}
						}
					}
					// button case
					var buttons = $("panel[id='"+ txtBoxList[x].getAttribute("refpanel") +"'] button");
					if(buttons.length > 0){
						for(var y = 0; y < buttons.length; ++y){
							var valueItem = buttons[y].getAttribute("ximfvalue");
							//alert("valuebox="+valueBox+"\nvalueItem="+valueItem)							
							if(valueBox.toLowerCase() == valueItem.toLowerCase()){
								txtBoxList[x].setAttribute("value", buttons[y].getAttribute("label"));							
							}
						}
					}
					// chekbox case
					var checkboxes = $("panel[id='"+ txtBoxList[x].getAttribute("refpanel") +"'] checkbox");
					if(checkboxes.length > 0){
						for(var y = 0; y < checkboxes.length; ++y){
							var valueItem = checkboxes[y].getAttribute("ximfvalue");
							//alert("valuebox="+valueBox+"\nvalueItem="+valueItem)							
							if(valueBox.toLowerCase() == valueItem.toLowerCase()){
								txtBoxList[x].setAttribute("value", checkboxes[y].getAttribute("label"));							
							}
						}
					}
				}
			}
		}catch(e){}
	};

/*
 * Set label and ximfvalue of ximf linked element 
 * 
 * @ximfMesssage : ximfmailMesssage object
 */
function ComputeXimfElementLinked(ximfelement,idPanel,ximfMessage){
	try{
		var xHeader = $("label[id='"+$(ximfelement).attr("refheader")+"']").attr("ximfheader");
		var ximfValue = ximfMessage.getHeaderValue(xHeader);
		if(ximfValue){
			// search for value and comlete display box
			$(ximfelement).attr("refpanel",idPanel);			
			var display_box = $("textbox[refheader='" + xHeader + "']");
				
			// default values
			$(ximfelement).attr("value",ximfValue);
			$(ximfelement).attr("ximfvalue",ximfValue);
			$(ximfelement).attr("tooltiptext",ximfValue);
								
			// menuitem value (ilk, linkpopup...)
			var menu_item = $("panel[id='"+$(ximfelement).attr("refpanel")+"'] menuitem");										
			for(var idx_menu_item = 0 ; idx_menu_item < menu_item.length ; ++idx_menu_item){
				var current_ximfvalue = menu_item[idx_menu_item].getAttribute("ximfvalue");						
				if(current_ximfvalue.toLowerCase() == ximfValue.toLowerCase()){								
					ximfelement.setAttribute("value",menu_item[idx_menu_item].getAttribute("label"));
					$(ximfelement).attr("ximfvalue",ximfValue);
					$(ximfelement).attr("tooltiptext",menu_item[idx_menu_item].getAttribute("label"));
					
					//linkpopup manager									
					var linkpopup = menu_item[idx_menu_item].getAttribute("linkpopupbox");
					if(linkpopup){					
						var targetpopup = $("panel[id='"+linkpopup+"']");
						$("textbox[id='" + targetpopup[0].getAttribute("ximfreftextbox")+"']").attr("refpanel",linkpopup);						
						ComputeXimfElementLinked($("textbox[id='" + targetpopup[0].getAttribute("ximfreftextbox")+"']"),targetpopup[0].id,ximfMessage);																
					}	
				}
			}
		}
	}catch(e){
		gConsole.logStringMessage("[ximfmail - ComputeXimfElementLinked ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
	}					
}

// load ximf headers in DOM documents	
function ShowXimfmailPanel(ximfmailMesssage){
	try{
		// create DOM panel using compose message template xslt				
		if(gXimfCatalog){
			$("#ximfmailMailPanelTitle").attr("value",gXimfCatalog.getNameInstance(ximfmailMesssage._instanceMsgXimf));
		}else{ 			
			$("#ximfmailMailPanelTitle").attr("value","XIMFMAIL");
		}				
		$("#ximfmailMailHeadersTablist").empty();
		var composeDom = CreateDOMWithXimfInstance(ximfmailMesssage._instanceMsgXimf,"chrome://theme_ximfmail/content/messengerCompose-ximfmail.xsl");
		$("#ximfmailMailHeadersTablist").append(composeDom);
		$("#ximfmailMailPanel").attr("hidden","true");
		
		// compute datas to message
		try{
			var xheader_dom = $("label[ximfheader]");			
			for(var idx_xheader_dom=0; idx_xheader_dom<xheader_dom.length; ++idx_xheader_dom){
				try{
					//gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - search value for textbox : " + xheader_dom[idx_xheader_dom].getAttribute("ximfheader"));		
					var ximfValue = ximfmailMesssage.getHeaderValue(xheader_dom[idx_xheader_dom].getAttribute("ximfheader"));
					if(ximfValue){						
						// search for value and comlete display box
						var display_box = $("textbox[refheader='" + xheader_dom[idx_xheader_dom].getAttribute("id") + "']");
						if(display_box.length > 0){
							try{
								// ximfValue is in Array
								if(ximfValue.constructor == Array){											
									var sSeparator  = display_box[0].getAttribute("ximfseparator");
									ximfValue = ximfValue.join(sSeparator);
								}								
							}catch(e){}
										
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
																				
										ComputeXimfElementLinked($("textbox[id='" + targetpopup[0].getAttribute("ximfreftextbox")+"']"),targetpopup[0].id,ximfmailMesssage);																	
									}	
								}
							}
						}
					}
				}catch(e){
					gConsole.logStringMessage("[ximfmail - ShowXimfmailPanel ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
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
						var ximfValue = ximfmailMesssage.getHeaderValue($("label[id='"+ximfLabelId+"']").attr("ximfheader"));							
						if(ximfValue){
							try{
								// ximfValue is in Array								
								if(ximfValue.constructor == Array){
									var display_box = $("textbox[refheader='" + xheader_dom[idx_xheader_dom].getAttribute("id") + "']");
									if(display_box.length > 0){											
										var sSeparator  = display_box[0].getAttribute("ximfseparator");
										ximfValue = ximfValue.join(sSeparator);
									}
								}								
							}catch(e){}							
							xheader_dom[idx_xheader_dom].setAttribute("value",ximfValue);
						}								
						}	
				}catch(e){
					gConsole.logStringMessage("[ximfmail - ShowXimfmailPanel] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
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
						var ximfValue = ximfmailMesssage.getHeaderValue($("label[id='"+refHeader+"']").attr("ximfheader"));							
						if(ximfValue){
							try{
								// ximfValue is in Array								
								if(ximfValue.constructor == Array){
									var display_box = $("textbox[refheader='" + xheader_dom[idx_xheader_dom].getAttribute("id") + "']");
									if(display_box.length > 0){											
										var sSeparator  = display_box[0].getAttribute("ximfseparator");
										ximfValue = ximfValue.join(sSeparator);
									}
								}								
							}catch(e){}													
							xheader_dom[idx_xheader_dom].listaddress = ximfValue;
							//alert("load address values \n"+ximfValue+"\n"+xheader_dom[idx_xheader_dom].listaddress);									
						}								
					}	
				}catch(e){
					gConsole.logStringMessage("[ximfmail - ShowXimfmailPanel] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
				}  
			}
	
			// load datetime values		
			xheader_dom = $("textbox[class='ximfDatetime']");  	
			for(var idx_xheader_dom=0; idx_xheader_dom<xheader_dom.length; ++idx_xheader_dom){
				try{
					var refHeader = xheader_dom[idx_xheader_dom].getAttribute("refheader");								
					if(refHeader){
						//gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - search value for freetext :" + $("label[id='"+ximfLabelId+"']").attr("ximfheader")+"\nid ="+ximfLabelId);		
						var ximfValue = ximfmailMesssage.getHeaderValue($("label[id='"+refHeader+"']").attr("ximfheader"));							
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
					gConsole.logStringMessage("[ximfmail - ShowXimfmailPanel] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
				} 
			}									
		}catch(e){
			gConsole.logStringMessage("[ximfmail - ShowXimfmailPanel] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
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
				gConsole.logStringMessage("[ximfmail - ShowXimfmailPanel] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
			} 
		}			
		xheader_dom = $("textbox[class='ximfDatetime']");    	
		for(var idx_xheader_dom=0; idx_xheader_dom<xheader_dom.length; ++idx_xheader_dom){
			try{
				ReplaceTxtboxWithLabel(xheader_dom[idx_xheader_dom]);								
			}catch(e){
				gConsole.logStringMessage("[ximfmail - ShowXimfmailPanel] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
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
function ShowExpandedHeaders(ximfmailMesssage){
	try{
		// ximfmail elements to display pictures
		var imgClassification = document.getElementById("ximfSecurityClassificationLabelImg");
		var imgCategory = document.getElementById("ximfCategoryClassificationLabelImg");
		
		// selected message has no XIMF headers 
		if(!ximfmailMesssage._instanceMsgXimf){			
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
			var picturesClassifArray = CreateRulesArray(ximfmailMesssage._instanceMsgXimf,"ximf:classificationPictures");				
			for(var iHdr=0; iHdr<picturesClassifArray.length ; ++iHdr){
				var headerRef = picturesClassifArray[iHdr]._headerRef;
				var valueRef = ximfmailMesssage.getHeaderValue(headerRef);
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
			var picturesCategorArray = CreateRulesArray(ximfmailMesssage._instanceMsgXimf,"ximf:categoryPictures");
			for(var iHdr=0; iHdr<picturesCategorArray.length ; ++iHdr){
				var headerRef = picturesCategorArray[iHdr]._headerRef;
				var valueRef = ximfmailMesssage.getHeaderValue(headerRef);
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
		secureHdrsArray = CreateRulesArray(ximfmailMesssage._instanceMsgXimf,"ximfsecureHeaders");				
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
			args.push(hLabel.getAttribute("value")); // args[0] : textbox id 
			args.push(hLabel.getAttribute("ximfheader")); // args[1] : catalog ref 
			args.push(eltTextbox.value); // args[2] : title dialogbox
			args.push(eltTextbox.getAttribute("ximfvalue")); // args[3] : description dialogbox	
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