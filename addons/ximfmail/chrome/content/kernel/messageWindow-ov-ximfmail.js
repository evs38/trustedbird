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
gConsole.logStringMessage("messageWindow-ov-ximfmail.js file loaded");
window.addEventListener('messagepane-loaded', InitXimfailMsgWindow, true);
/*
 * gUriMsgLoading check for messages which are currently loading *
 */
var gUriMsgLoading = {
		// array of uri loading
		uriList : [],
		add : function(uri){
			if (uri) {
				this.uriList.push(uri);
			}
			gConsole.logStringMessage("[ximfmail - gUriMsgLoading.add ]  uri :  " + uri);
		},
		remove : function(uri){
			if (!uri) {
				return;
			}
			var idx = 0;
			try{
			for(idx ; idx<this.uriList.length ; ++idx){
				if(this.uriList[idx] === uri){
					this.uriList.splice(idx,1);
					gConsole.logStringMessage("[ximfmail - gUriMsgLoading.remove ]  uri :  " + uri);
					return;
				}
			}
			}catch(e){
				gConsole.logStringMessage("[ximfmail - gUriMsgLoading.remove ] error for uri  " + uri +"\n error: "+  e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
			}
		},
		isLoading : function(uri){
			if (!uri) {
				return;
			}
			try{
				for(var idx=0 ; idx<this.uriList.length ; ++idx){
					if(this.uriList[idx] === uri){
						gConsole.logStringMessage("[ximfmail - gUriMsgLoading.isloading : true ]  uri :  " + uri);
						return true;
					}
				}
			}catch(e){
				gConsole.logStringMessage("[ximfmail - gUriMsgLoading.isloading ] error for uri  " + uri +"\n error: "+  e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
			}
			gConsole.logStringMessage("[ximfmail - gUriMsgLoading.isloading : false ]  uri :  " + uri);
			return false;
		}
};
/*
 * Create a message listener
 */
function InitXimfailMsgWindow(){
   //
   gMessageListeners.push({
    onStartHeaders: function (){
		// box for ximf headers
    	$("#ximfmailMailPanel").attr("collapsed","true");
    	// box for ximf pictures
		$("#ximfHeadBox").attr("collapsed","true");
    },
    onEndHeaders: function(){
    	var uriMsg = null;
    	if (gMessageDisplay.isDummy){
    		// displayed message from disk
    		uriMsg = gMessageDisplay.displayedUri;
    		gConsole.logStringMessage("[ximfmail - InitXimfailMsgWindow.onEndHeaders ]\ndisplayed message from disk - url = "+uriMsg);
    	} else {
    	   	// get uri of selected message
    		var msgDBHdr = gFolderDisplay.selectedMessage;
    		if (msgDBHdr) {
				uriMsg = msgDBHdr.folder.getUriForMsg(msgDBHdr);
			}
    	}
    	if(!gUriMsgLoading.isLoading(uriMsg)){
    		gUriMsgLoading.add(uriMsg);
    		XimfmailGetMessage(uriMsg, function(msgSrc, uriSrc) {
    			// Parse Ximf headers in message and display them if necessary
    			var currentXimfHdrArray = XimfmailParseMessage(msgSrc);
    			var folderPaneElt = document.getElementById('folderPaneBox');
    			if (folderPaneElt) {
	    			var ximfMsg = new XimfmailMesssage();
	    			if (ximfMsg.init(uriSrc, currentXimfHdrArray)) {
	    				if (folderPaneElt.hasAttribute("collapsed")) {
	        				// message opened in new tab
	        				$("#ximfmail-custom-panel").attr("collapsed","true");
	        				ShowXimfmailPanel(ximfMsg);
	        				ShowExpandedHeaders(ximfMsg);
	        				$("#ximfmailMailPanel").removeAttr("collapsed");
	        			} else {
	        				// preview pane, no headers to display
	        				ShowExpandedHeaders(ximfMsg);
	        				$("#ximfmail-custom-panel").removeAttr("collapsed");
	        			}
	    				gUriMsgLoading.remove(uriSrc);
	    			}
    			} else {
    				// message opened in new window
    				OpenWindowXimfMesssage(uriSrc, currentXimfHdrArray);
    			}
    		});
    	}
    },
    onEndAttachments: function (){
	}
  });
}
/**
 * Add Ximf headers to new window message
 * @param uriSrc
 * @param ximfHdrArray
 */
function OpenWindowXimfMesssage(uriSrc, ximfHdrArray) {
	try {
		// ximfCatalog must be loaded (new window here...)
		var ximfMsg = new XimfmailMesssage();
		if(ximfMsg.init(uriSrc, ximfHdrArray)){
			ShowXimfmailPanel(ximfMsg);
			ShowExpandedHeaders(ximfMsg);
			gUriMsgLoading.remove(uriSrc);
			$("#ximfmailMailPanel").removeAttr("collapsed");
		}
	}catch(e){
		gConsole.logStringMessage("[OpenWindowXimfMesssage] Error: " + e);
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
		if($("#signedHdrIcon").attr("signed") === "ximfalert"){
			$("#signedHdrIcon").attr("signed","");
		}
		try{
			$(".ximfImgCategory").remove();
		}catch(e){}
	}catch(e){}
}
/*
 * Dom document manipulations
 */
function ToogleHiddenPanel(){
		if($("#ximfMailTable").attr("hidden") === "true"){
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
function ConvertMimeDatasToLabelValues() {
	try {
		var valueItem = "";
		var valueBox = "";
		var txtBoxList = $("textbox[class='XimfTextboxDisplay']");
		for (var x = 0; x<txtBoxList.length; ++x) {
			valueBox = txtBoxList[x].getAttribute("value");
			if ( valueBox !== "") {
				// menuitem case
				var items = $("panel[id='"+ txtBoxList[x].getAttribute("refpanel") +"'] menuitem");
				if (items.length > 0) {
					for (var idxItm = 0; idxItm < items.length; ++idxItm) {
						valueItem = items[idxItm].getAttribute("ximfvalue");
						if (valueBox.toLowerCase() === valueItem.toLowerCase()) {
							txtBoxList[x].setAttribute("value", items[idxItm].getAttribute("label"));
						}
					}
				}
				// button case
				var buttons = $("panel[id='"+ txtBoxList[x].getAttribute("refpanel") +"'] button");
				if (buttons.length > 0) {
					for (var idxBtn = 0; idxBtn < buttons.length; ++idxBtn) {
						valueItem = buttons[idxBtn].getAttribute("ximfvalue");
						if (valueBox.toLowerCase() === valueItem.toLowerCase()) {
							txtBoxList[x].setAttribute("value", buttons[idxBtn].getAttribute("label"));
						}
					}
				}
				// chekbox case
				var checkboxes = $("panel[id='"+ txtBoxList[x].getAttribute("refpanel") +"'] checkbox");
				if (checkboxes.length > 0 ){
					for (var idxChk = 0; idxChk < checkboxes.length; ++idxChk) {
						valueItem = checkboxes[idxChk].getAttribute("ximfvalue");
						if (valueBox.toLowerCase() === valueItem.toLowerCase()) {
							txtBoxList[x].setAttribute("value", checkboxes[idxChk].getAttribute("label"));
						}
					}
				}
			}
		}
	} catch(e) {}
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
				if(current_ximfvalue.toLowerCase() === ximfValue.toLowerCase()){
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
function ShowXimfmailPanel(ximfmailMesssage) {
	try {
		var defaultXimfName = ximfConst.DEFAULT_XIMF_NAME;
		var ximfName = XimfCatalog.getInstance().getNameInstance(ximfmailMesssage._instanceMsgXimf);
		if (!ximfName) {
			ximfName = defaultXimfName;
		}
		var arrList = XimfCatalog.getInstance().getInstanceList;
		// create DOM panel using compose message template xslt
		$("#ximfmailMailPanelTitle").attr("value",ximfName);
		$("#ximfmailMailHeadersTablist").empty();
		var composeDom = CreateDOMWithXimfInstance(ximfmailMesssage._instanceMsgXimf,"chrome://theme_ximfmail/content/messengerCompose-ximfmail.xsl");
		$("#ximfmailMailHeadersTablist").append(composeDom);
		$("#ximfmailMailPanel").attr("hidden","true");
		// Dom element of preview panel
		$("#ximfmail-custom-panel").attr("collapsed",true);
		// compute datas to message
		try {
			var xheader_dom = $("label[ximfheader]");
			var ximfValue = "";
			var display_box = "";
			for (var idxXmfHdr=0; idxXmfHdr < xheader_dom.length; ++idxXmfHdr) {
				try {
					ximfValue = ximfmailMesssage.getHeaderValue(xheader_dom[idxXmfHdr].getAttribute("ximfheader"));
					if (ximfValue) {
						// search for value and comlete display box
						display_box = $("textbox[refheader='" + xheader_dom[idxXmfHdr].getAttribute("id") + "']");
						if (display_box.length > 0) {
							try {
								// ximfValue is in Array
								if (ximfValue.constructor === Array) {
									var sSeparator  = display_box[0].getAttribute("ximfseparator");
									ximfValue = ximfValue.join(sSeparator);
								}
							} catch(e) {}
							// default values
							display_box[0].setAttribute("value",ximfValue);
							display_box[0].setAttribute("ximfvalue",ximfValue);
							display_box[0].setAttribute("tooltiptext",ximfValue);
							// menuitem value (ilk, linkpopup...)
							var menu_item = $("panel[id='"+display_box[0].getAttribute("refpanel")+"'] menuitem");
							for (var idx_menu_item = 0 ; idx_menu_item < menu_item.length ; ++idx_menu_item) {
								var current_ximfvalue = menu_item[idx_menu_item].getAttribute("ximfvalue");
								if (current_ximfvalue.toLowerCase() === ximfValue.toLowerCase()) {
									display_box[0].setAttribute("value",menu_item[idx_menu_item].getAttribute("label"));
									display_box[0].setAttribute("ximfvalue",current_ximfvalue);
									display_box[0].setAttribute("tooltiptext",menu_item[idx_menu_item].getAttribute("label"));
									//linkpopup manager
									var linkpopup = menu_item[idx_menu_item].getAttribute("linkpopupbox");
									if (linkpopup) {
										var targetpopup = $("panel[id='"+linkpopup+"']");

										ComputeXimfElementLinked($("textbox[id='" + targetpopup[0].getAttribute("ximfreftextbox")+"']"),targetpopup[0].id,ximfmailMesssage);
									}
								}
							}
						}
					}
				} catch(e) {
					gConsole.logStringMessage("[ximfmail - ShowXimfmailPanel ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
				}
			}
			// load free text values
			xheader_dom = $("textbox[class='ximfEditor']");
			for (var idxXmfEdtr=0; idxXmfEdtr<xheader_dom.length; ++idxXmfEdtr) {
				try {
					var oriTxtboxId = xheader_dom[idxXmfEdtr].getAttribute("ximfreftextbox");
					var ximfLabelId = $("textbox[id='"+oriTxtboxId+"']").attr("refheader");
					if (ximfLabelId) {
						ximfValue = ximfmailMesssage.getHeaderValue($("label[id='"+ximfLabelId+"']").attr("ximfheader"));
						if (ximfValue) {
							try{
								// ximfValue is in Array
								if(ximfValue.constructor === Array){
									display_box = $("textbox[refheader='" + xheader_dom[idxXmfEdtr].getAttribute("id") + "']");
									if(display_box.length > 0){
										var sSeparator  = display_box[0].getAttribute("ximfseparator");
										ximfValue = ximfValue.join(sSeparator);
									}
								}
							}catch(e){}
							xheader_dom[idxXmfEdtr].setAttribute("value",ximfValue);
						}
					}
				} catch(e) {
					gConsole.logStringMessage("[ximfmail - ShowXimfmailPanel] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
				}
			}
			// load address values
			xheader_dom = $("ximfaddress");
			for(var idxXmfAddr=0; idxXmfAddr<xheader_dom.length; ++idxXmfAddr){
				try{
					var refHeader = xheader_dom[idxXmfAddr].getAttribute("refheader");
					if(refHeader){
						ximfValue = ximfmailMesssage.getHeaderValue($("label[id='"+refHeader+"']").attr("ximfheader"));
						if(ximfValue){
							try{
								// ximfValue is in Array
								if(ximfValue.constructor === Array){
									display_box = $("textbox[refheader='" + xheader_dom[idxXmfAddr].getAttribute("id") + "']");
									if(display_box.length > 0){
										var sSeparator  = display_box[0].getAttribute("ximfseparator");
										ximfValue = ximfValue.join(sSeparator);
									}
								}
							}catch(e){}
							xheader_dom[idxXmfAddr].listaddress = ximfValue;
						}
					}
				}catch(e){
					gConsole.logStringMessage("[ximfmail - ShowXimfmailPanel] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
				}
			}
			// load datetime values
			xheader_dom = $("textbox[class='ximfDatetime']");
			for (var idxDttm=0; idxDttm<xheader_dom.length; ++idxDttm) {
				try {
					var refHeader = xheader_dom[idxDttm].getAttribute("refheader");
					if (refHeader) {
						ximfValue = ximfmailMesssage.getHeaderValue($("label[id='"+refHeader+"']").attr("ximfheader"));
						if (ximfValue) {
							xheader_dom[idxDttm].setAttribute("ximfvalue", ximfValue);
							var thisDate = ConvertZTimeToLocal(ximfValue);
							if (!thisDate) {
								thisDate = ximfValue;
							}
							xheader_dom[idxDttm].setAttribute("value",thisDate );
							xheader_dom[idxDttm].setAttribute("ximftype","date");
						}
					}
				} catch(e) {
					gConsole.logStringMessage("[ximfmail - ShowXimfmailPanel] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
				}
			}
		} catch(e) {
			gConsole.logStringMessage("[ximfmail - ShowXimfmailPanel] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
		}
		// replace values with international labels
		ConvertMimeDatasToLabelValues();
		// modify DOM to create readable ihm
		//replace textbox elements with labels elements
		xheader_dom = $("textbox[class='XimfTextboxDisplay']");
		for (var idxTxtDsp=0; idxTxtDsp<xheader_dom.length; ++idxTxtDsp) {
			try {
				ReplaceTxtboxWithLabel(xheader_dom[idxTxtDsp]);
			} catch(e) {
				gConsole.logStringMessage("[ximfmail - ShowXimfmailPanel] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
			}
		}
		xheader_dom = $("textbox[class='ximfDatetime']");
		for (var idx_xheader_dom=0; idx_xheader_dom<xheader_dom.length; ++idx_xheader_dom) {
			try {
				ReplaceTxtboxWithLabel(xheader_dom[idx_xheader_dom]);
			} catch(e) {
				gConsole.logStringMessage("[ximfmail - ShowXimfmailPanel] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
			}
		}
		// remove template datas
		// delete erase button
		$("button[class*='ximfEraser']").remove();
		// delete popup
		$("#ximfmailMailHeadersTablist panel").remove();
		// no mandatory labels
		$("label[class='ximfHeaderLabel']").attr("style","color:inherit;");
		// event manager panel
		$("#ximfmailComposeMessageMaximize").click(ToogleHiddenPanel);
		$("#ximfmailComposeMessageMinimize").click(ToogleHiddenPanel);
		$("#ximfmailMailPanelFocusBar").dblclick(ToogleHiddenPanel);
		// display new panel
		$("#ximfmailMailPanel").attr("hidden","false");
		$("button[class*='ximfDetail']").bind("command",OnSelectDetail);
	} catch(e) {
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
		// replace DOM
		$(element).replaceWith(ximflabel);
	}catch(e){
		gConsole.logStringMessage("[ximfmail - ReplaceTxtboxWithLabel] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
	}
}
// insert security pictures...
function ShowExpandedHeaders(ximfmailMesssage){
	try {
		gConsole.logStringMessage("[ximfmail - showExpandedHeaders ] get gor pictures rules... ");
		// raz ximf pictures elements
		try {
			$(".ximfImgCategory").remove();
			$("#ximfSecurityClassificationLabelImg").attr("src","");
			$("#ximfCategoryClassificationLabelImg").attr("src","");
		} catch(e) {}
		// selected message has no XIMF headers
		if (!ximfmailMesssage._instanceMsgXimf) {
			return false;
		}
		// ximfmail elements to display pictures
		var headerRef = "";
		var valueRef = "";
		var tabPictureValueRef = undefined;
		var tabPictureValueName = undefined;
		var imgClassification = document.getElementById("ximfSecurityClassificationLabelImg");
		var imgCategory = document.getElementById("ximfCategoryClassificationLabelImg");
		//display security labels pictures
		gConsole.logStringMessage("[ximfmail - showExpandedHeaders ] \n search for labels to display... ");
		if (imgClassification) {
			imgClassification.setAttribute("src","");
			var reg=new RegExp("[&]+", "g");
			var picturesClassifArray = CreateRulesArray(ximfmailMesssage._instanceMsgXimf,"ximf:classificationPictures");
			for (var idxClssfPct=0; idxClssfPct<picturesClassifArray.length ; ++idxClssfPct) {
				headerRef = picturesClassifArray[idxClssfPct]._headerRef;
				valueRef = ximfmailMesssage.getHeaderValue(headerRef);
				if (valueRef) {
					for (var idxClssPix = 0 ; idxClssPix < picturesClassifArray.length ; ++idxClssPix) {
						tabPictureValueRef =picturesClassifArray[idxClssPix]._valueRef.split(reg);
						tabPictureValueName =picturesClassifArray[idxClssPix]._valueName.split(reg);
						for (var idxClssfPict = 0 ; idxClssfPict<tabPictureValueRef.length ; ++idxClssfPict ) {
							var regClassImg = new RegExp(tabPictureValueRef[idxClssfPict] + "[\\W]","gi");
							// valueRef : SECTION SIGN caracter as last item checked with regex
							valueRef += "\u00A7";
							if (valueRef.match(regClassImg)) {
								imgClassification.setAttribute("src",tabPictureValueName[idxClssfPict]);
							}
						}
					}
				}
			}
		}
		// check categories logos
		if (imgCategory) {
			imgCategory.setAttribute("src","");
			$(".ximfImgCategory").remove();
			var regImgCtg=new RegExp("[&]+", "g");
			var picturesCategorArray = CreateRulesArray(ximfmailMesssage._instanceMsgXimf,"ximf:categoryPictures");
			var container = document.getElementById("ximfHeadBox");
			for (var iHdr=0; iHdr<picturesCategorArray.length ; ++iHdr) {
				headerRef = picturesCategorArray[iHdr]._headerRef;
				valueRef = ximfmailMesssage.getHeaderValue(headerRef);
				if (valueRef) {
					for (var idxPix = 0 ; idxPix < picturesCategorArray.length ; ++idxPix) {
						tabPictureValueRef = picturesCategorArray[idxPix]._valueRef.split(regImgCtg);
						tabPictureValueName = picturesCategorArray[idxPix]._valueName.split(regImgCtg);
						for (var iPict = 0 ; iPict<tabPictureValueRef.length ; ++iPict ) {
							var regCatImg = new RegExp(tabPictureValueRef[iPict] + "[\\W]","gi");
							// SECTION SIGN caracter as last item checked with regex
							valueRef += "\u00A7";
							if (valueRef.match(regCatImg)) {
								try {
									var img = document.createElement("image");
									img.setAttribute("class","ximfImgCategory");
									img.setAttribute("src",tabPictureValueName[iPict]);
									container.appendChild(img);
								} catch(e) {
									gConsole.logStringMessage("[ximfmail - showExpandedHeaders ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
								}
							}
						}
					}
				}
			}
		}
	} catch(e) {
		gConsole.logStringMessage("[ximfmail - showExpandedHeaders ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
	}
	// secure headers signature are present in message, isn't it?
	// this rule is applied only on ximf messages with same instance of current account
	try {
		secureHdrsArray = CreateRulesArray(ximfmailMesssage._instanceMsgXimf,"ximfsecureHeaders");
		if (secureHdrsArray.length > 0) {
			var smimeBox = document.getElementById("smimeBox");
			if (smimeBox.hasAttribute("collapsed")) {
				// Trustedbird hasn't detected signature
				// set ximfmail information to user
				smimeBox.removeAttribute("collapsed");
				$("#signedHdrIcon").attr("signed","ximfalert");
			}
		}
	} catch(e) {
		gConsole.logStringMessage("[ximfmail - showExpandedHeaders ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
	}
	$("#ximfHeadBox").removeAttr("collapsed");
	return true;
}
// show values ximf
function OnSelectDetail(evt){
	try{
		idBox = evt.currentTarget.getAttribute("refLabel");
	 	var eltTextbox = document.getElementById(idBox);
		// display datas of current XIMF header
	 	if(eltTextbox.value !== ""){
	 		// get informations of datas to load
			var args = [];
			var hLabel = document.getElementById(eltTextbox.getAttribute("refheader"));
			// args[0] : textbox id
			args.push(hLabel.getAttribute("value"));
			// args[1] : catalog ref
			args.push(hLabel.getAttribute("ximfheader"));
			// args[2] : title dialogbox
			args.push(eltTextbox.value);
			// args[3] : description dialogbox
			args.push(eltTextbox.getAttribute("ximfvalue"));
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