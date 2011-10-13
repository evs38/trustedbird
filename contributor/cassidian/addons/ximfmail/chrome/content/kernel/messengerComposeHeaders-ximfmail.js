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

var gChromeXslMsgCompose = "chrome://theme_ximfmail/content/messengerCompose-ximfmail.xsl";
var gChromeXslSecureHeaders = "chrome://theme_ximfmail/content/secureHeaders-ximfmail.xsl";
var gChromeXslSecurityLabel = "chrome://theme_ximfmail/content/securityLabel-ximfmail.xsl";
var gChomeXulXimfTreeDialog = "chrome://ximfmail/content/dialogTree-ximfmail.xul"; 
var gChomeXulXimfCalendarDialog = "chrome://ximfmail/content/calendar/dialogCalendar-ximfmail.xul";
var gChomeXulXimfEditorDialog = "chrome://ximfmail/content/editor/dialogEditor-ximfmail.xul";

//
function onclosepanel(){
	try{
		//alert('onclosepanel ' + evt.currentTarget.id)
	//var a = document.getElementById("search");
	var lisitem = $("#search-panel checkbox");
	var resString = "";	
	for(i=0;i<lisitem.length;++i){
		if(lisitem[i].hasAttribute("checked"))
		resString += $(lisitem[i]).attr("label")+ " | ";
	}
	var b = document.getElementById("txtpanel");
	b.value = resString;
	}catch(e){
		alert("e = " + e)
	}	
}


var gXimfHdrs = null;		
//			
function XimfmailInstanceHeaders(){
	//private:
	var _instance = null;	
	var _ximfHdrArray = [];
	var _xsmtpHdrArray = [];	
	var _eSSSecurityLabelHdrArray = [];
	var _ximfAssociatedHdrArray = [];
	var _ximfSpecialRulesArray = []; //FT 3504
	
	//public:
	if(typeof XimfmailInstanceHeaders.initialized == "undefined"){	
		//
		XimfmailInstanceHeaders.prototype.init = function(ximfInstanceResource){
			_instance = ximfInstanceResource;			
			_xsmtpHdrArray = CreateRulesArray(_instance,"ximf:compatibility");
			_ximfAssociatedHdrArray = CreateRulesArray(_instance, "ximf:association");				
			_ximfSpecialRulesArray = CreateRulesArray(_instance, "ximf:special"); //FT 3504		
		};	
		//	
		XimfmailInstanceHeaders.prototype.getXimfInstanceResource = function(){	
			return _instance; 
		};
		//
		XimfmailInstanceHeaders.prototype.getXimfHdrArray = function(){	
			return _ximfHdrArray;
		};
		//
		XimfmailInstanceHeaders.prototype.getXsmtpHdrArray = function(){	
			return _xsmtpHdrArray; 
		};
		//
		XimfmailInstanceHeaders.prototype.getXimfAssociatedHdrArray = function(){	
			return _ximfAssociatedHdrArray; 
		};
		//
		XimfmailInstanceHeaders.prototype.getESSSecurityLabelHdrArray = function(){	
			return _eSSSecurityLabelHdrArray; 
		};
		//FT 3504
		XimfmailInstanceHeaders.prototype.getSpecialRulesArray = function(){	
			return _ximfSpecialRulesArray; 
		};
		//		
		XimfmailInstanceHeaders.prototype.loadXimfSecurityRules = function(){
			var isSigned = false;
			
			// get secure state from prefs
			if (gSMFields)	isSigned = gSMFields.signMessage;  				

			// secure headers			
			try{
				// create XMLFile at temp directory with rules datas
				var secureHdrArray  = [];
				secureHdrArray = CreateRulesArray(_instance,"ximf:secureHeaders");				
				if(secureHdrArray.length > 0){
					var signHeaders = CreateDOMWithXimfInstance(_instance,gChromeXslSecureHeaders);						
					if(signHeaders){
						var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile); // get profile folder
						var serializer = new XMLSerializer();
						var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
						
						file.append(XIMFMAIL_SECURE_HEADERS_XML_FILE);
						foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);   // write, create, truncate
						serializer.serializeToStream(signHeaders, foStream, "");   // rememeber, doc is the DOM tree
						foStream.close();
						
						// set folder datas					
						gCurrentIdentity.setCharAttribute("secureheaders.folderdata",file.path);
						
						// sign message with secure headers
						gCurrentIdentity.setBoolAttribute("secureheaders.checked",true);
						$("#idItemSecureHeaders_1").attr("checked","true");					
						$("#idItemSecureHeaders_2").attr("checked","true");					
						$("#idItemSecureHeaders_1").attr("disabled","true");
						$("#idItemSecureHeaders_2").attr("disabled","true");										
						if(!isSigned){
							toggleSignMessage();// signMessage(); // from file msgCompSMIMIEOverlay.js
							isSigned = true;
						}				
						$("#menu_securitySign1").attr("disabled","true");
						$("#menu_securitySign2").attr("disabled","true");	
						
						gConsole.logStringMessage("ximfmail - loadSecurityRules - secureHeaders on ");					
					}
				}else{
					gConsole.logStringMessage("ximfmail - loadSecurityRules - secureHeaders off ");
				}
			}catch(e){
				gConsole.logStringMessage("[ximfmail - loadSecurityRules - secureHeaders] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
			}
			// Security Labels			
			try{
				// create XMLFile at temp directory with rules datas
				_eSSSecurityLabelHdrArray = CreateRulesArray(_instance,"ximf:securityLabel");
				if(_eSSSecurityLabelHdrArray.length > 0){					
					$("#menu_securityLabelDialog1").attr("checked","true");					
					$("#menu_securityLabelDialog2").attr("checked","true");					
					$("#menu_securityLabelDialog1").attr("disabled","true");
					$("#menu_securityLabelDialog2").attr("disabled","true");
					
					if(!isSigned){
						toggleSignMessage(); // from file msgCompSMIMIEOverlay.js
						isSigned = true;
					}
					if(gSMFields){
						gSMFields.securityClassification = -1;
						gSMFields.privacyMark = "";
						gSMFields.securityCategories = "";
					}
					gConsole.logStringMessage("ximfmail - loadSecurityRules - securityLabels on ");	
				}else{
					gConsole.logStringMessage("ximfmail - loadSecurityRules - securityLabels off ");	
				}				
			}catch(e){
				gConsole.logStringMessage("[ximfmail - loadSecurityRules - securityLabel] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
			}		
		};
		// init object
		XimfmailInstanceHeaders.initialized = true;
	}
}

//
function XimfDataSource(){
	this._id; // xml file name path
	this._dataSource;
	this._refDataSource;				
}

//
function InsertXimfmailComposer(currentInstance){
	try{
		if(gXimfHdrs){gXimfHdrs = null;}
	
		gXimfHdrs = new XimfmailInstanceHeaders();
		gXimfHdrs.init(currentInstance);
		gXimfHdrs.loadXimfSecurityRules();
		
		// ihm init		
		ResetXimfhdrsDom();
		InsertXimfhdrsDom(gXimfHdrs.getXimfInstanceResource(), gChromeXslMsgCompose);
		
		// controler init		
		LoadXimfhdrsEventObserver();	
		ExecuteXimfHdrsDefaultValuesRule();		
		InitSpecialXimfRules();
		CheckXimfhdrsSelection();
	}catch(e){
		gConsole.logStringMessage("[ximfmail - InsertXimfmailComposer ] " + e +"\nline : " + e.lineNumber + " : "+ e + "\nfile : "+ Error().fileName);
	}
}

/*
 * DOM MANIPULATIONS OF XIMFMAIL ELEMENTS
 */
function ResetXimfhdrsDom(){
	// delete old ximf items
	$("#ximfmailComposeMessageHeadersTablist").empty();
}
		
function InsertXimfhdrsDom(ximfInstanceResource, urlXslTemplate){
			// append to document ximfmail panel ihm	
			if(!ximfInstanceResource){
				$("#isUsingXimfail").attr("hidden","true");
			 	return;
			}
			$("#isUsingXimfail").attr("hidden","false");
							
			if(gXimfCatalog){
				$("#ximfmailComposeMessageTitle").attr("value",gXimfCatalog.getLabelInstance(ximfInstanceResource));
			}else{
				$("#ximfmailComposeMessageTitle").attr("value","XIMFMAIL");
				$("#ximfmailComposeMessageTitle").attr("tooltiptext",ximfInstanceResource);
			}				
			
			try{
				// Add XSLT result in MessengerCompose window			
				$("#ximfmailComposeMessageHeadersTablist").append(CreateDOMWithXimfInstance(ximfInstanceResource, urlXslTemplate));
			}catch(e){
				// TODO : alert user of xslt problem
				("#isUsingXimfail").attr("hidden","false");
			}	
			
			// custom panels where maxitem=1 and contains composed elements
			var arrPanel = $("panel[ximfmaxitem='1']");
			for(i=0;i<arrPanel.length;++i){				
				// checkboxes are used
				var chkboxes = $("panel[id='"+arrPanel[i].id+"'] checkbox");				
				if(chkboxes.length>=1){					
					var mnuitems = $("panel[id='"+arrPanel[i].id+"'] menuitem");
					for(j=0;j<mnuitems.length;++j){
						var chkbx = document.createElement("checkbox");
						$(chkbx).attr("id",$(mnuitems[j]).attr("id"));
						$(chkbx).attr("label",$(mnuitems[j]).attr("label"));
						$(chkbx).attr("ximfvalue",$(mnuitems[j]).attr("ximfvalue"));
						$(chkbx).attr("ximftextbox",$(mnuitems[j]).attr("ximftextbox"));
						if(mnuitems[j].hasAttribute("ximftecvalue"))$(chkbx).attr("ximftecvalue",$(mnuitems[j]).attr("ximftecvalue"));
						$(mnuitems[j].parentNode).append(chkbx);
						$(mnuitems[j]).remove();		
					}
				}
				
			}
			
			// custom input boxes
			try{								
				var inputPopupList = $("textbox[class='ximfInputbox']");
				for(var i = 0; i < inputPopupList.length; ++i){				
					var padre = inputPopupList[i].parentNode;
					if(padre.nodeName=="popup"){
						padre.setAttribute("position", "overlap");
						//padre.setAttribute("style", "min-width : 250px; background-color:#5cacea; "); //#48a2e7;
					}										
				}						
	  		}catch(err){}
				
			// internationalisation of ximfmail context popup
			try{				
				var gBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
				var stringBundle = gBundle.createBundle("chrome://ximfmail/locale/ximfmail.properties");		
				var contextMenuList = $("menuitem[class='ximfContext']");
				for(var i=0; i<contextMenuList.length; ++i){
					var ilabel = contextMenuList[i].getAttribute("label");
					var sLabel = stringBundle.GetStringFromName(ilabel);
					if(sLabel!=""){
						contextMenuList[i].setAttribute("label",sLabel);
					}
				}
			}catch(err){}
			
		// Custom Ximf Headers Dom
		CustomXimfhdrsInputBox();	
		CustomXimfhdrsButton();	
		CustomXimfhdrsTreeDialog();	// append DOM elements to access external datas	
}		

/*
* change ximtextbox elements to edit box
*/
function CustomXimfhdrsInputBox(){	
	var listEditorClass = $("popup > textbox[class='ximfInputbox']");
	for(var i = 0 ; i<listEditorClass.length ; ++i){	
		try{
			var idTxtBox = listEditorClass[i].getAttribute("ximfreftextbox");
			var inputbox = $("textbox[id='"+idTxtBox+"'][class]");
			if(inputbox[0].getAttribute("class") != "ximfDatetime"){									
				var editor_button = $("textbox[id='"+idTxtBox+"']>button");
				editor_button[0].setAttribute("class","ximfmailButtonTxt ximfEditor");					
				editor_button[0].setAttribute("tooltiptext",getIlkProperties("ximfmail.composer.editor.image"));
				editor_button[0].setAttribute("refbox",inputbox[0].getAttribute("id"));						
					
				inputbox[0].setAttribute("ximfmaxitems", listEditorClass[i].getAttribute("ximfmaxitems"));
				inputbox[0].setAttribute("ximfminitems", listEditorClass[i].getAttribute("ximfminitems"));
				inputbox[0].setAttribute("ximseparator", listEditorClass[i].getAttribute("ximseparator"));
				inputbox[0].setAttribute("tabindex",parseInt(i, 10)+100);
				inputbox[0].setAttribute("class","ximfEditor");							
				inputbox[0].removeAttribute("popup");
				inputbox[0].removeAttribute("readonly");
			}
		}catch(e){
			gConsole.logStringMessage("[ximfmail - modifyEditorBox ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);			
		}				
	}
	
	try{
		// remove popup of free text
		$("textbox[class='ximfEditor'] ~ popup").remove();
	}catch(e){
		gConsole.logStringMessage("[ximfmail - CustomXimfhdrsInputBox ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+ e.lineNumber);			
	}	
}	
	
/*
 * Add international tooltiptext to button 
 */	
function CustomXimfhdrsButton(){		
	var listCalendarClass = $("button[class*='ximfDatepicker']");
	for(var i = 0 ; i<listCalendarClass.length ; ++i){
		try{									
			listCalendarClass[i].setAttribute("tooltiptext",getIlkProperties("ximfmail.composer.calendar.image"));
		}catch(e){
			gConsole.logStringMessage("[ximfmail - customizeCalendarBox ] \n " + e + "\nfile : " + Error().fileName+"\nline : " + e.lineNumber);			
		}				
	}			
	var listPopupClass = $("button[class*='ximfPopup']");
	for(var i = 0 ; i<listPopupClass.length ; ++i){
		try{									
			listPopupClass[i].setAttribute("tooltiptext",getIlkProperties("ximfmail.composer.popup.image"));
		}catch(e){
			gConsole.logStringMessage("[ximfmail - customizeCalendarBox ] \n " + e + "\nfile : " + Error().fileName+"\nline : " + e.lineNumber);			
		}				
	}
}

/*
 * Add informations to load ximfTreeDialog
 */	
function CustomXimfhdrsTreeDialog(){			
	var listTreeClass = $("box[class='ximfTreeDialog']");		
	for(var i = 0; i<listTreeClass.length;++i){
		try{
			var idTxtBox = listTreeClass[i].getAttribute("refBox");				
					
			// create DOM element to acces External Tree Dialog				
			var data_button = $("textbox[id='"+idTxtBox+"']>button");
			data_button[0].setAttribute("class", "ximfmailButtonTxt ximfTreeDialog");// insert image in DOM
			data_button[0].setAttribute("id","image-"+idTxtBox);							
			data_button[0].setAttribute("refBox",idTxtBox);
			data_button[0].setAttribute("refExternal",listTreeClass[i].getAttribute("refExternal"));
			data_button[0].setAttribute("tooltiptext",getIlkProperties("ximfmail.composer.treedlg.image"));
										
			$("textbox[id='"+idTxtBox+"']").attr("refExternal",listTreeClass[i].getAttribute("refExternal"));
			$("textbox[id='"+idTxtBox+"']").attr("refBox",idTxtBox);
			$("textbox[id='"+idTxtBox+"']").removeAttr("popup");
		}catch(e){
			gConsole.logStringMessage("[ximfmail - createButtonsOfExternDatas ] \n " + e + "\nfile : " + Error().fileName+"\nline : " + e.lineNumber);		
		}						
	}
}	
		
		
/*
 * Switch On / Off Ximf DOM
 */
function ToogleXimfhdrsPanel(){			
	if($("#isShowingXimfail").attr("hidden") == "true"){
		$("#isShowingXimfail").attr("hidden","false");
		$("#ximfmailComposeMessageMaximize").attr("hidden","true");		
		$("#ximfmailComposeMessageMinimize").attr("hidden","false");	
		
		// set focus on first tab
		try{
			var tbox = $("#ximfmailComposeMessageHeadersTablist textbox[class='ximfEditor']"); 
			if(tbox){
				$(tbox[0]).click();
			}
		}catch(e){}	
		try{	
			var tab = $("#ximfmailComposeMessageHeadersTablist tab");
			if(tab){
				$(tab[0]).click();					
			}
		}catch(e){}						
	}else{
		$("#isShowingXimfail").attr("hidden","true");
		$("#ximfmailComposeMessageMaximize").attr("hidden","false");		
		$("#ximfmailComposeMessageMinimize").attr("hidden","true");										
	}
};		

/*
 * manage DOM elements to send message
 */
function HideSendMessageElements(isToSend){
	if(!isToSend){
		// ihm to unactive sending message
		//$("#ximfmailComposeMessageState").attr("class","ximfmailUnacceptState");
		$("#button-send").attr("disabled", "true");	
		// $("menuitem[key='key_send']").attr("disabled", "true");
		$("#menu_File menuitem[command='cmd_sendNow']").attr("hidden", "true");
		$("#menu_File menuitem[key='key_sendLater']").attr("hidden", "true");				
	}else{
		// ihm to active sending message
		//$("#ximfmailComposeMessageState").attr("class","ximfmailAcceptState");
		$("#button-send").removeAttr("disabled");
		// $("menuitem[key='key_send']").removeAttr("disabled");
		$("#menu_File menuitem[command='cmd_sendNow']").removeAttr("hidden");
		$("#menu_File menuitem[key='key_sendLater']").removeAttr("hidden");				
	}
};

/*
 * Open Window to select external datas
 */
 var _dataSourceArray = [];  // array of ximfHdr : _ximfHdrArray[ximfHdr]
 function OpenTreeDialog(element){
 	var keyCat = element.getAttribute("refExternal");	
	var refBox = element.getAttribute("refBox");
	var idxDatasSource = -1;
	var rdfdataSource = null;
	var refRdfdataSource = null;	
	
	//	get/create RDF sources
	try{							
		for(var idx_dataSourceArray = 0; idx_dataSourceArray < _dataSourceArray.length ; ++idx_dataSourceArray){
			if(keyCat == _dataSourceArray[idx_dataSourceArray]._id){
				idxDatasSource = idx_dataSourceArray;
				//alert("datasource exist : "+_dataSourceArray[idxDatasSource]._id + "idxDatasSource = " + idxDatasSource);
			}
		}
		if(idxDatasSource >= 0){
			//alert("attach datasource "+_dataSourceArray[idxDatasSource]._refDataSource);					
			rdfdataSource = _dataSourceArray[idxDatasSource]._dataSource;
			refRdfdataSource = _dataSourceArray[idxDatasSource]._refDataSource;
		}else{							
			// get xml schema from profile instance directory				
			var sCompletePath = getFilePathInProfile("extensions/"+gXimfCatalog.getSchemaInstance(gXimfHdrs.getXimfInstanceResource()));
			sCompletePath = sCompletePath.substring(0, sCompletePath.lastIndexOf("\\")+1) + keyCat;	  			
			var dir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			dir.initWithPath( sCompletePath );			
			if(!dir.exists()){return;}
			
			// create and save datasource
			xDataSource = new XimfDataSource();
			xDataSource._id = keyCat;		
			var res = CreateRdfDatasSource(sCompletePath);
			rdfdataSource = res._dataSource;
			xDataSource._dataSource = rdfdataSource;					
			refRdfdataSource = res._refDataSource;
			xDataSource._refDataSource = refRdfdataSource;
			
			//alert("new datasource "+refRdfdataSource);	
			_dataSourceArray.push(xDataSource);
		}				
	}catch(e){
		gConsole.logStringMessage("[ximfmail - addExternDatas ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+ e.lineNumber);		
	}
	
	// push datas to new dialog window 
	try{				
		// get informations of datas to load 
		var eltTxtBox = document.getElementById(refBox);
		var separator = eltTxtBox.getAttribute(_XIMF_ATT_SEPARATOR)	
		//args.push(eltTxtBox.getAttribute(_XIMF_ATT_XVALUE)); 
		var header = document.getElementById(eltTxtBox.getAttribute("refheader"));
						
		// set informations of datas to load
		var args = new XimfmailTreedialogArgs();			
		args.dataSource = rdfdataSource;
		args.refdataSource = refRdfdataSource;
		args.title = header.getAttribute("value");
		args.maxItemsSelected = eltTxtBox.getAttribute(_XIMF_ATT_MAX_ITEMS);
		
		// push current selection		
		if(eltTxtBox.value){
			try{
				var currentValue = eltTxtBox.value;
				if(args.maxItemsSelected > 1 && separator !="" ){
					var reg = new RegExp("["+separator+"]+", "g");			
					var arrayItems = currentValue.split(reg);
					for(var i=0 ; i<arrayItems.length;++i){
						if(arrayItems[i] != "")	args.currentKeys.push(arrayItems[i]);					 
					}
				}else{
					//				
					args.currentKeys.push(currentValue);
					if($(eltTxtBox).attr("tooltiptext")){
						args.currentLabels.push($(eltTxtBox).attr("tooltiptext"));
					}
				}
			}catch(ex){
					gConsole.logStringMessage("[ximfmail - OpenTreeDialogBox_Svc ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
			}
		}	
		
		// open dialog		
		window.openDialog(gChomeXulXimfTreeDialog,"showmore", "chrome,resizable,centerscreen,modal",args);
		
		if(args.retIsCancel){
			gConsole.logStringMessage("[ximfmail - OpenTreeDialogBox_Svc ] selection has been canceled !");		
			return;			
		}
		
		// get for user selection
		if(args.retKeys.length > 1){			
			var value = "";
			for(var i=0 ; i < args.retKeys.length ; ++i){
				if(value == ""){
				  value = args.retKeys[i];
				}else{
					value = value + separator + args.retKeys[i];
				}
			}
			// set new list values
			eltTxtBox.value = value;
			$(eltTxtBox).attr("ximfvalue",value); 	
			$(eltTxtBox).attr("tooltiptext","");		
		}else{
			if(args.retKeys[0]){
				eltTxtBox.value = args.retKeys[0];
				$(eltTxtBox).attr("ximfvalue",args.retKeys[0]); // used for mandatories headers control rules
				$(eltTxtBox).attr("tooltiptext",args.retLabels[0]);			
			}else{
				eltTxtBox.value = "";
				$(eltTxtBox).attr("ximfvalue",""); 
				$(eltTxtBox).attr("tooltiptext","");	
			}
		}
	}catch(e){
		gConsole.logStringMessage("[ximfmail - addExternDatas ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+ e.lineNumber);		
	}		
}

/*
 * Open window to select datetime
 */
function OpenCalendarDialog(button){
	try{
		// get informations of datas to load 					
		var args = [];					
		var idBox = button.getAttribute("refBox");
		var ebox = document.getElementById(idBox);
		args.push(idBox); // args[0] : id de la textbox a enrichir
		args.push(ebox.value); // displayed date
		args.push($("label[id='"+ebox.getAttribute("refheader")+"']").attr("value"));

		// open dialog		
		window.openDialog(gChomeXulXimfCalendarDialog,"showmore", "chrome,resizable,centerscreen,modal",args);
	}catch(e){
		gConsole.logStringMessage("[ximfmail - openCalendarDialogBox ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+ e.lineNumber);		
	}	
}

/*
 * Open window text editor
 */
function OpenEditorDialog(button){
	try{
		var args=[];
		var idBox = button.getAttribute("refbox");
		args.push(idBox);
		
		var ebox = document.getElementById(idBox);
		if(ebox){
			args.push(ebox.value);		
			args.push(ebox.getAttribute("ximfseparator"));		
			args.push(ebox.getAttribute("ximfmaxitems"));
			args.push(ebox.getAttribute("ximfminitems"));				
			args.push($("label[id='"+ebox.getAttribute("refheader")+"']").attr("value"));
			window.openDialog(gChomeXulXimfEditorDialog,"showmore", "chrome,resizable,centerscreen,modal",args);
		}
	}catch(e){
		gConsole.logStringMessage("[ximfmail - openEditorDialogBox ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+ e.lineNumber);		
	}
}

/*
 * Open window with complete informations of ximf header
 */
function OpenInfoDialog(idBox){			
	// get informations of datas to load 
	var args = [];
	var txtBox = document.getElementById(idBox);
	var hLabel = document.getElementById(txtBox.getAttribute("refheader"));
	args.push(hLabel.getAttribute("value")); // args[0] : id de la textbox a enrichir
	args.push(hLabel.getAttribute("ximfheader")); // args[1] : ref du catalogue a charger
	args.push(txtBox.value); // args[2] : titre de la dialogbox
	args.push(txtBox.getAttribute("ximfvalue")); // args[3] : description de la dialogbox		
	if(txtBox.hasAttribute("ximfseparator")){
		args.push(txtBox.getAttribute("ximfseparator"));
	}
	// open dialog		
	window.openDialog("chrome://ximfmail/content/dialogHdrInfo-ximfmail.xul","showmore", "chrome,resizable,centerscreen,modal",args);
}
// END DOM FUNCTIONS

/*
 * EVENT MANAGER OF XIMFMAIL ELEMENTS
 */	
function LoadXimfhdrsEventObserver(){	
	// animation on ximfmail panel
	$("#ximfmailComposeMessageMaximize").bind("command",OnClickXimfhdrsBar);
	$("#ximfmailComposeMessageMinimize").bind("command",OnClickXimfhdrsBar);
	$("#ximfmailComposeMessageFocusBar").dblclick(OnClickXimfhdrsBar);
	
	// command events on ximfmail elements				
	$("button[class='ximfButton']").bind("command",OnSelectButtonPopup);	
	$("menuitem[class='ximfOkSet']").bind("command",OnSelectCheckPopup); 	
	$("textbox[class='XimfTextboxDisplay']").mouseover(OnHoverTextbox);
	$("menuitem[class='ximfContext']").bind("command",OnSelectContextBox);	
	$("button[class*='ximfEraser']").bind("command",OnClickEraser);	
	$("button[class*='ximfTreeDialog']").bind("command",OnClickTreeDialogButton);
	$("button[class*='ximfDatepicker']").bind("command",OnClickDatepicker);	
	$("textbox[class='ximfEditor']").click(OnXimfhdrsEditor);
	$("textbox[class='ximfEditor']").bind("change",OnCheckXimfhdrsEditor);		
	$("button[class*='ximfEditor']").bind("command",OnClickEditorButton);
	
	// get complete information of ximf hdr
	$("button[class*='ximfDetail']").bind("command",function(evt){
		OpenInfoDialog($(evt.currentTarget).attr("refLabel"));	
	});
	
	// open panel under ximfmail textbox 
	$("button[class*='ximfPopup']").bind("command",function(evt){
		var panel = document.getElementById($(evt.currentTarget).attr("refpanel"));	
		$("#"+panel.id+" richlistitem").removeAttr("selected");	
		$("#"+panel.id+" richlistitem").removeAttr("current");
		panel.openPopup(evt.currentTarget.parentNode, "after_start", 0, 0, false, false);
	});
		
	// menuitem selected for 1 entry header		
 	$("menuitem[class*='ximfItem']").bind("command",function(evt){ 
 		ComputeXimfhdrsMenuItem(evt.currentTarget);		
		var box = document.getElementById($(evt.currentTarget).attr("ximftextbox"));		
		document.getElementById($(box).attr("refpanel")).hidePopup();
	});	
	
	// keyboard event on panel	
	$("panel").bind("keyup",function(evt){		
		if(evt.keyCode == 13){			
			var panel = evt.currentTarget;			
			var richlistitem = $("#" + evt.currentTarget.id + " richlistitem");
			for(i=0;i<richlistitem.length;++i){
				if(richlistitem[i].selected){
					var nodes = richlistitem[i].childNodes;
					for(j=0;j<nodes.length;++j){
						if(nodes[j].localName=="menuitem"){
							ComputeXimfhdrsMenuItem(nodes[j]);
							var box = document.getElementById($(nodes[j]).attr("ximftextbox"));
							XimfailComposeCanClose();
							document.getElementById($(box).attr("refpanel")).hidePopup();
							return;
						}
					}					
				}
			}
			document.getElementById(evt.currentTarget.id).hidePopup();
		}		
	});
	
	// checkbox panel is selected
	$("panel checkbox").bind("command",function(evt){
		 ComputePanelOfCheckboxSelection(evt.currentTarget.id)});

	// check richlistitem where ximfchild=true (ximf computestring)
	$("panel").bind("popuphiding",function(evt){
		var CompstringItem = $("#" + evt.currentTarget.id + " richlistitem[ximfchild='true']");
		for(i=0; i<CompstringItem.length; ++i){
			var chk1 = CompstringItem[i].firstElementChild;
			if(chk1.localName == "checkbox"){
				if(chk1.checked){				
					if(!IsAcceptableXimfCompstring(chk1.id)){
						 chk1.checked = false;
						 chk1.removeAttribute("ximfchild");
						 ComputePanelOfCheckboxSelection(chk1.id);
					}				
				}
			}
		}
		
	});
	
	// panel can accept more than 1 entry for header
	$("panel").bind("popuphidden",function(evt){
		if(parseInt($(evt.currentTarget).attr("ximfmaxitem"), 10) > 1 ){
			// if panel has XIMF multiset implementation, don't compute it
			var multisetPanel = $("#" + evt.currentTarget.id + " button[class='ximfButton']");
			if(multisetPanel.length <=0){
				ComputeXimfhdrsMultivaluePanel(evt.currentTarget.id);
			}
		}else{
			var nbChk = $("#" + evt.currentTarget.id + " checkbox");
			if(nbChk.length > 0 )ComputeXimfhdrsMultivaluePanel(evt.currentTarget.id);		
		}
		XimfailComposeCanClose();
	});	 
	
	// panel - first entry must be selected before selecting composed item
	$("panel").bind("popupshown",function(evt){
		if(parseInt($(evt.currentTarget).attr("ximfmaxitem"), 10) <= 1 ) return;
		var richitems = $("#" + evt.currentTarget.id + " richlistbox" ).children("richlistitem");			
		for(i=0 ; i<richitems.length; ++i){
			var chk1 = richitems[i].firstElementChild;
			if(chk1.localName == "checkbox"){
				if(!chk1.checked){
					var eltsChild = richitems[i].getElementsByTagName("checkbox");					
					for(j=0 ; j < eltsChild.length; ++j){
						$(eltsChild[j]).attr("disabled","true");
					}
					$(chk1).attr("disabled","false");//.removeAttr("disabled");				
				}
			}
		}
	});	
	
	// remove css style from mouse item selections
	$("#ximfmailComposeMessageHeadersTablist richlistitem").mouseout(function(evt){
		if(evt.currentTarget.hasAttribute("selected"))
			$(evt.currentTarget).removeAttr("selected");
	});

	// get document tab control, set focus to ximfmail tabbox
	$(document).bind("keypress",function(evt){
		if(evt.keyCode == 9 && evt.target.id=="msgSubject"){ // 9: tabuklation keycode
			if(document.getElementById("ximfmailComposeMessageMinimize").hasAttribute("hidden")){
				$("#ximfmailComposeMessageMaximize").focus();
			}else{
				$("#ximfmailComposeMessageMinimize").focus();
			}
		}
	}); 
}; 

function OnClickXimfhdrsBar(evt){
	ToogleXimfhdrsPanel();				
};


function OnSelectButtonPopup(evt){
	ComputeXimfhdrsButtonPopup(evt.currentTarget);	
};

function OnSelectCheckPopup(evt){	
	ComputeXimfhdrsCheckPopup(evt.currentTarget);	
};


function OnClickEraser(evt){			
	EraseAndComputeXimfhdrsTextbox(document.getElementById(evt.currentTarget.id).getAttribute("refValue"), false);
	CheckXimfhdrsSelection();// valid document state
};
		
function OnClickTreeDialogButton(evt){			
	OpenTreeDialog(evt.currentTarget);
	XimfailComposeCanClose();
};	

function OnClickDatepicker(evt){	
	OpenCalendarDialog(evt.currentTarget);
	XimfailComposeCanClose();
};	

function OnClickEditorButton(evt){
	OpenEditorDialog(evt.currentTarget);
	CheckXimfhdrsSelection();
	XimfailComposeCanClose();
};	


function OnXimfhdrsEditor(evt){	
	var id = evt.currentTarget.id;	
	var bx = document.getElementById(id);
	bx.focus();			
};


function OnHoverTextbox(evt){
	try{
		elt = evt.currentTarget;
		tooltext = elt.value;			
		if(tooltext != ""){			
			elt.setAttribute("tooltiptext",tooltext);
		}else{
			elt.removeAttribute("tooltiptext");
		}
	}catch(e){
		gConsole.logStringMessage("[ximfmail - OnHoverXimfTextbox ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);		
	}
}

/*
 * Display context menu Ximfmail
 */
function OnSelectContextBox(evt){
	try{		
		idBox = evt.currentTarget.getAttribute("idbox"); 
	 	var eltTextbox = document.getElementById(idBox);
	 	switch(parseInt(evt.currentTarget.getAttribute("idx"), 10)){ 	 			 		
	 		case 1:
	 			// erase all selected values
	 			EraseAndComputeXimfhdrsTextbox(eltTextbox.id, true);
	 			break;
	 		case 2:
	 			// display datas of current XIMF header		 			
	 			if(eltTextbox.value != ""){
	 				OpenInfoDialog(idBox);
	 			}
	 			break;		 		
	 		default:
	 			gConsole.logStringMessage("[ximfmail warning OnSelectXimfmailContextBox] \n  unknown choice : "+eltTextbox.getAttribute("idx"));
	 			break;
	 	}
	}catch(e){
		gConsole.logStringMessage("[ximfmail - OnSelectXimfmailContextBox ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
	}
}
		
function OnCheckXimfhdrsEditor(evt){
	try{
		//alert(evt.currentTarget.id)
		var domElt = evt.currentTarget;
		var maxItems = domElt.getAttribute("ximfmaxitems");		 
		var separatorItem = domElt.getAttribute("ximfseparator");	
		var labelHeader = document.getElementById(domElt.getAttribute("refheader")).getAttribute("value");	
		if(maxItems==""){return;}		
		var dlgEditorXimf_maxItem_alert = maxItems + " "+ getIlkProperties("ximfmail.dialog.editor.warning.nbrows");	
		var arrayItem = domElt.value.split(separatorItem);	
		var nbItems = arrayItem.length;
		if(parseInt(maxItems, 10)<arrayItem.length){
			nbItems = parseInt(maxItems, 10);
			ximfAlert(labelHeader,dlgEditorXimf_maxItem_alert);	
			var newvalue = "";		
			for(var i=0 ; i<nbItems ; ++i){
				if(arrayItem[i]!=""){
					if(i==0)
						newvalue = arrayItem[i];
					else
						newvalue += separatorItem + arrayItem[i];		
				} 
			}
			domElt.value = newvalue;
			domElt.inputField = newvalue;
		} 
	}catch(e){
		gConsole.logStringMessage("[ximfmail - OnCheckXimfhdrsEditor ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
	}
}

// END EVENT FUNCTIONS


/*
 * COMPUTE XIMFMAIL ELEMENTS AND UPDATE DOM
 */
function CheckXimfhdrsSelection(){		
	try{		
		var isRuleOk=true;
		// apply generic rules			
		if(!ExecuteXimfHdrsAssociationRule()){isRuleOk=false; }		
		if(!ExecuteXimfHdrsMandatoryRule()){isRuleOk=false; }	
		AppendESSSecuityLabel();					
		HideSendMessageElements(isRuleOk); 		
	}catch(e){
		gConsole.logStringMessage("[ximfmail - IsReadyToSend ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);		
	}
}

/*
 * Update Ximf header selected from multi choice panel
 */
function ComputeXimfhdrsMultivaluePanel(idPanel){
	try{
		var panel = document.getElementById(idPanel);
		var ximfSeparator = $(panel).attr("ximfseparator");
		var ximfTecSeparator = $(panel).attr("ximftecseparator");
		var selectionObject = new Object;
		selectionObject.value = "";
		selectionObject.ximfvalue = "";
		selectionObject.ximftecvalue = ""; 
		var listRichBox = panel.getElementsByTagName("richlistbox");
		var childnodes = listRichBox[0].childNodes;
		
		//
		for(var i = 0 ; i < childnodes.length ; i++){			
			if(childnodes[i].localName == "richlistitem"){
				var selectionItem = GetXimfSelectionOfRichlistitem(childnodes[i],ximfSeparator,ximfTecSeparator);
				if(selectionItem){				
					if(selectionItem.value != ""){
						if(selectionObject.value == ""){
							selectionObject.value = selectionItem.value;
							selectionObject.ximfvalue = selectionItem.ximfvalue;
							if(selectionItem.ximftecvalue != "") selectionObject.ximftecvalue =  selectionItem.ximftecvalue;
						}else{
							selectionObject.value += ximfSeparator + selectionItem.value;
							selectionObject.ximfvalue += ximfSeparator + selectionItem.ximfvalue;
							if(selectionItem.ximftecvalue != "") selectionObject.ximftecvalue += ximfTecSeparator + selectionItem.ximftecvalue;
						}
							
					}
				}
			}
		}
		
		// save selection to ximfhdr textbox
		var hdrTextbox = document.getElementById($(panel).attr("ximfreftextbox"));
		hdrTextbox.value = selectionObject.value;
		$(hdrTextbox).attr("ximfvalue",selectionObject.ximfvalue);	
		$(hdrTextbox).attr("ximfseparator",ximfSeparator);
		if(selectionObject.ximftecvalue != ""){
			 $(hdrTextbox).attr("ximftecvalue",selectionObject.ximftecvalue);
			 $(hdrTextbox).attr("ximftecseparator",ximfTecSeparator);
		}			
		
	}catch(e){
		gConsole.logStringMessage("[ximfmail - ComputeXimfhdrsMultivaluePanel ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+ e.lineNumber);		
	}	
}


/*
 * Get XIMF informations of composed element
 */
function GetXimfSelectionOfRichlistitem(richItem,cSeparator,cTecSeparator){
	var selectionObject = new Object;
	selectionObject.value = "";
	selectionObject.ximfvalue = "";
	selectionObject.ximftecvalue = "";
	selectionObject.separator = "";
	selectionObject.tecseparator = "";
	try{
		var childnodes = richItem.childNodes;
		
		// single element to decode
		if(childnodes.length == 1){
			return GetXimfValuesOfRichlistItem(childnodes[0]);
		}		
		
		// multi element to decode
		if(!GetXimfValuesOfRichlistItem(childnodes[0])) return selectionObject;
		// create array of user informations
		var arrItems = new Array();		
		for(var i=0 ; i < childnodes.length ; i++){
			if(childnodes[i].localName == "vbox"){
				var childnodes2 = childnodes[i].childNodes;					
				for(var j=0 ; j < childnodes2.length ; j++){
					var item = GetXimfValuesOfRichlistItem(childnodes2[j].firstChild);
					if(item){
						arrItems.push(item);
					}		
				}
			}
			var item = GetXimfValuesOfRichlistItem(childnodes[i]);
			if(item){
				arrItems.push(item);
			}				
		}
				
		// format Ximf informations		
		if(arrItems.length > 1){
			for(var i = arrItems.length-1 ; i >= 0 ; --i){
				var cConcatId = arrItems[i].concatid;
				// get element with id cConcatId
				// concat linked values and create formated information
				if(arrItems[i].concatid != arrItems[i].id){
					for(var j = 0 ; j < arrItems.length ; ++j){
						if(arrItems[j].id == cConcatId){
							if(selectionObject.value == ""){						
							selectionObject.value = arrItems[j].value + arrItems[j].separator + arrItems[i].value;
							selectionObject.ximfvalue = arrItems[j].ximfvalue + arrItems[j].separator + arrItems[i].ximfvalue;							
							if(arrItems[j].ximftecvalue != "")
								selectionObject.ximftecvalue = arrItems[j].ximftecvalue + arrItems[j].tecseparator + arrItems[i].ximftecvalue;
							}else{
								selectionObject.value += cSeparator + arrItems[j].value + arrItems[j].separator + arrItems[i].value;
								selectionObject.ximfvalue += cSeparator + arrItems[j].ximfvalue + arrItems[j].separator + arrItems[i].ximfvalue;							
								if(arrItems[j].ximftecvalue != "")
									selectionObject.ximftecvalue += cTecSeparator + arrItems[j].ximftecvalue + arrItems[j].tecseparator + arrItems[i].ximftecvalue;
							}
							arrItems.splice(i,1); // erase array element
							break; 
						}
					}
				}
			}
		}else{
			// case 1 item is used in item selection
			if(arrItems[0].value != ""){
				selectionObject.value += arrItems[0].value;
				selectionObject.ximfvalue += arrItems[0].ximfvalue;							
				if(arrItems[0].ximftecvalue != "")
					selectionObject.ximftecvalue += arrItems[0].ximftecvalue;
			}			
		}			
	}catch(e){
		gConsole.logStringMessage("[ximfmail - GetXimfSelectionOfRichlistitem ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
	}
	return selectionObject;	
}

/*
 * get iformations of element selected by user 
 */
function GetXimfValuesOfRichlistItem(richItem){
	var oItem = new Object;
	oItem.id = "";
	oItem.concatid = "";
	oItem.value = "";
	oItem.ximfvalue = "";
	oItem.ximftecvalue = "";
	oItem.separator = "";
	oItem.tecseparator = "";
	
	try{		
		switch(richItem.localName){
			case "checkbox" :
				if(richItem.hasAttribute("checked")){ 
					oItem.value = richItem.getAttribute("label");
					oItem.ximfvalue = richItem.getAttribute("ximfvalue");
					if(richItem.hasAttribute("ximftecvalue")) oItem.ximftecvalue = richItem.getAttribute("ximftecvalue");
					if(richItem.hasAttribute("ximfseparator")) oItem.separator = richItem.getAttribute("ximfseparator");
					if(richItem.hasAttribute("ximftecseparator")) oItem.tecseparator = richItem.getAttribute("ximftecseparator");
					if(richItem.hasAttribute("id")) oItem.id = richItem.getAttribute("id");
					if(richItem.hasAttribute("ximfconcatid")) oItem.concatid = richItem.getAttribute("ximfconcatid");						
				}				
				break;
			case "textbox" :
				if(richItem.value != ""){ 
					oItem.value = richItem.value;
					oItem.ximfvalue = richItem.value;						
					if(richItem.hasAttribute("ximfseparator")) oItem.separator = richItem.getAttribute("ximfseparator");						
					if(richItem.hasAttribute("id")) oItem.id = richItem.getAttribute("id");
					if(richItem.hasAttribute("ximfconcatid")) oItem.concatid = richItem.getAttribute("ximfconcatid");
				}				
				break;
		}
		
		if(oItem.value == "") oItem = null;
					
	}catch(e){
		gConsole.logStringMessage("[ximfmail - GetXimfSelectionOfRichlistitem ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);		
	}
	return oItem;	
}

/*
 * Update Ximf header selected from single choice panel
 */
function ComputeXimfhdrsMenuItem(menuitem){
	try{
		var iMaxItems = 0;
		var sXimfseparator = _XIMF_DEFAULT_SEPARATOR;
		var eltTextbox = document.getElementById(menuitem.getAttribute("ximftextbox"));	
					
		// CheckXimfhdrsSelection for list with finished elements number
		if(eltTextbox.hasAttribute(_XIMF_ATT_MAX_ITEMS) ){
			iMaxItems = parseInt(eltTextbox.getAttribute(_XIMF_ATT_MAX_ITEMS),10);
		}
		
		// CheckXimfhdrsSelection for separator value 
		if(eltTextbox.hasAttribute(_XIMF_ATT_SEPARATOR) ){
			sXimfseparator = eltTextbox.getAttribute(_XIMF_ATT_SEPARATOR);
		}
					
		// CheckXimfhdrsSelection for concated values
		var sConcatVal="";
		var sConcatXimfVal="";
		var sConcatTecVal="";
		var sContentSeparator = _XIMF_DEFAULT_SEPARATOR;		
		var sContenTecSeparator = _XIMF_DEFAULT_SEPARATOR;
		if(menuitem.hasAttribute(_XIMF_ATT_CONCAT_ID)){				
			//
			if(menuitem.hasAttribute(_XIMF_ATT_SEPARATOR)){
				sContentSeparator = menuitem.getAttribute(_XIMF_ATT_SEPARATOR);
			}else{
				if(menuitem.parentNode.hasAttribute(_XIMF_ATT_SEPARATOR)){
					sContentSeparator = menuitem.parentNode.getAttribute(_XIMF_ATT_SEPARATOR);							
				}
			}					
			//
			if(menuitem.hasAttribute(_XIMF_ATT_TEC_SEPARATOR)){
				sContenTecSeparator = menuitem.getAttribute(_XIMF_ATT_TEC_SEPARATOR);
			}else{
				if(menuitem.parentNode.hasAttribute(_XIMF_ATT_TEC_SEPARATOR)){
					sContenTecSeparator = menuitem.parentNode.getAttribute(_XIMF_ATT_TEC_SEPARATOR);							
				}
			}
						
			var sIds = menuitem.getAttribute(_XIMF_ATT_CONCAT_ID);
			var reg=new RegExp("[+]+", "g");
			var arrayIds = sIds.split(reg);
			for (var i=0; i<arrayIds.length; i++) {
				try{ 		
					var cElt = document.getElementById(arrayIds[i]);
					if(cElt){
						if(sConcatVal == ""){					
							sConcatVal = cElt.getAttribute("label");
							sConcatXimfVal = cElt.getAttribute(_XIMF_ATT_XVALUE);
							sConcatTecVal =  cElt.getAttribute(_XIMF_ATT_TEC_VALUE);
						}else{
							sConcatVal = sConcatVal + sContentSeparator + cElt.getAttribute("label");
							sConcatXimfVal = sConcatXimfVal + sContentSeparator + cElt.getAttribute(_XIMF_ATT_XVALUE);
							sConcatTecVal = sConcatTecVal + sContenTecSeparator + cElt.getAttribute(_XIMF_ATT_TEC_VALUE);
						}
					}
				}catch(e){}
			}
		}
		
		// replace existing value if exits					
		var sOldximfvalue = eltTextbox.getAttribute(_XIMF_ATT_XVALUE);
		eltTextbox.value = sConcatVal + menuitem.getAttribute("label");			
		eltTextbox.setAttribute(_XIMF_ATT_XVALUE, sConcatXimfVal + menuitem.getAttribute(_XIMF_ATT_XVALUE));
						
		// watch for technical value
		if(menuitem.hasAttribute(_XIMF_ATT_TEC_VALUE)){			
			eltTextbox.setAttribute(_XIMF_ATT_TEC_VALUE, sConcatTecVal + menuitem.getAttribute(_XIMF_ATT_TEC_VALUE));
		}
						
		//erase old linkPopup case and new selection
		if(sOldximfvalue!=""){
			if(sOldximfvalue != menuitem.getAttribute(_XIMF_ATT_XVALUE)){		
				var sOldlinkpopup = $("panel[id='"+ eltTextbox.getAttribute("refpanel")+"'] menuitem[ximfvalue='"+sOldximfvalue+"']").attr(_XIMF_ATT_LINK_POPUP_BOX);
				EraseAndComputeXimfhdrsTextbox($("panel[id='"+ sOldlinkpopup +"']").attr(_XIMF_ATT_REF_BOX));
				// delete popup link in textbox
				$("textbox[id='" + $("panel[id='"+ sOldlinkpopup +"']").attr(_XIMF_ATT_REF_BOX) + "']").removeAttr("refpanel");
				$("textbox[id='" + $("panel[id='"+ sOldlinkpopup +"']")+ " button").removeAttr("refpanel");
			}				
		}					
					
		// manage popup of link header
		if(menuitem.hasAttribute(_XIMF_ATT_LINK_POPUP_BOX)){		
			var popupset = document.getElementById(menuitem.getAttribute(_XIMF_ATT_LINK_POPUP_BOX));
			var txtbox = document.getElementById(popupset.getAttribute(_XIMF_ATT_REF_BOX));
			txtbox.setAttribute("refpanel",menuitem.getAttribute(_XIMF_ATT_LINK_POPUP_BOX));
			$("textbox[id='" + txtbox.getAttribute("id") + "'] button").attr("refpanel",menuitem.getAttribute(_XIMF_ATT_LINK_POPUP_BOX));		
		}	
					
		// valid document state
		CheckXimfhdrsSelection();	
	}catch(e){
		gConsole.logStringMessage("[ximfmail - OnSelectXimfItem ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);		
	}	
}

/*
 * Update Ximf header selected in menu popup with button
 */
function ComputeXimfhdrsButtonPopup(button){
	// Add selection and associated values for header from button popup 	
	try{
		var sXimfValues="";
		var sValues="";	
		var sXimfTechnicalValues="";
		var ximfvalue = "";
		var value = "";
		var ximftechnicalvalue="";
		var sContentSeparator = _XIMF_DEFAULT_SEPARATOR;		
		var sContenTecSeparator = _XIMF_DEFAULT_SEPARATOR;	
		var eltTextbox = document.getElementById(button.getAttribute("ximfreftextbox"));
		
		sXimfValues = eltTextbox.getAttribute(_XIMF_ATT_XVALUE);
		sValues = eltTextbox.value;
		sXimfTechnicalValues = eltTextbox.getAttribute(_XIMF_ATT_TEC_VALUE);
		
		// CheckXimfhdrsSelection for concated values				
		if(button.hasAttribute(_XIMF_ATT_CONCAT_ID)){						
			var sIds = button.getAttribute(_XIMF_ATT_CONCAT_ID);
			var reg=new RegExp("[+]+", "g");
			var arrayIds = sIds.split(reg);
			for (var i=0; i<arrayIds.length; i++){ 		
				var cElt = document.getElementById(arrayIds[i]);				
				if(cElt){
					//
					if(cElt.hasAttribute(_XIMF_ATT_SEPARATOR))
						sContentSeparator = cElt.getAttribute(_XIMF_ATT_SEPARATOR);
					if(cElt.hasAttribute(_XIMF_ATT_TEC_SEPARATOR))
						sContenTecSeparator = cElt.getAttribute(_XIMF_ATT_TEC_SEPARATOR);

					//
					if(value == ""){					
						value = cElt.getAttribute("label") + sContentSeparator;
						ximfvalue = cElt.getAttribute(_XIMF_ATT_XVALUE) + sContentSeparator;
						ximftechnicalvalue = cElt.getAttribute(_XIMF_ATT_TEC_VALUE) + sContenTecSeparator;
					}else{
						value = value + cElt.getAttribute("label") + sContentSeparator ;
						ximfvalue = ximfvalue + cElt.getAttribute(_XIMF_ATT_XVALUE) + sContentSeparator ;
						ximftechnicalvalue = ximftechnicalvalue + cElt.getAttribute(_XIMF_ATT_TEC_VALUE) + sContenTecSeparator ;
					}
				}
			}
		}
		
		// get default parameters
		if(button.hasAttribute(_XIMF_ATT_SEPARATOR))
			sContentSeparator = button.getAttribute(_XIMF_ATT_SEPARATOR);
					
		if(button.hasAttribute(_XIMF_ATT_TEC_SEPARATOR))
			sContenTecSeparator = button.getAttribute(_XIMF_ATT_TEC_SEPARATOR);			
				
		if(sValues != ""){
			sValues =  sValues + sContentSeparator + value + button.getAttribute("label");		
			sXimfValues =  sXimfValues + sContentSeparator + ximfvalue + button.getAttribute(_XIMF_ATT_XVALUE);
			sXimfTechnicalValues = sXimfTechnicalValues + sContenTecSeparator + ximftechnicalvalue + button.getAttribute(_XIMF_ATT_TEC_VALUE);
		}else{
			sValues = value + button.getAttribute("label");
			sXimfValues = ximfvalue + button.getAttribute(_XIMF_ATT_XVALUE);
			sXimfTechnicalValues = ximftechnicalvalue + button.getAttribute(_XIMF_ATT_TEC_VALUE);
		}	
			
		// load new values
		eltTextbox.setAttribute(_XIMF_ATT_XVALUE,sXimfValues);
		eltTextbox.value=sValues;
		
		CheckXimfhdrsSelection();
	}catch(e){
		gConsole.logStringMessage("[ximfmail - OnSelectXimfButton ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);		
	}
}

/*
 * Update Ximf header selected in menu popup with CheckXimfhdrsSelection
 */
function ComputeXimfhdrsCheckPopup(xulElement){
		//CheckXimfhdrsSelection all selected values and add to ximf box
		try{
			var sXimfValues="";
			var sValues="";
			var sXimfTechnicalValues="";
			var sContentSeparator = _XIMF_DEFAULT_SEPARATOR;		
			var sContenTecSeparator = _XIMF_DEFAULT_SEPARATOR;
			var nextElt = null;
			var idTextBox = "";
			var parentElt = null;
			//
			nextElt = xulElement.parentNode;		
			var arrayCheckedbox = null;
			while(nextElt){
				if(nextElt.localName == "popup"){				
					arrayCheckedbox = $("popup[id='"+nextElt.id+"'] checkbox[class='ximCheckbox'][checked]" );			
					//alert("checklist OK !!" + nextElt.id + arrayCheckbox.length);
					// id of parent node
					idTextBox = nextElt.getAttribute('ximfreftextbox'); 				
					parentElt = nextElt;
					// get default parameters
					if(parentElt.hasAttribute(_XIMF_ATT_SEPARATOR))
						sContentSeparator = parentElt.getAttribute(_XIMF_ATT_SEPARATOR);
					if(parentElt.hasAttribute(_XIMF_ATT_TEC_SEPARATOR))
						sContenTecSeparator = parentElt.getAttribute(_XIMF_ATT_TEC_SEPARATOR);		
					break;
				}
			nextElt = nextElt.parentNode;
			}
			//alert("arrayCheckedbox.length = " + arrayCheckedbox.length);
			// get value of each checkbox selected
			for( var idx=0 ; idx < arrayCheckedbox.length; ++idx){
				var ximfvalue = "";
				var value = "";
				var ximftechnicalvalue="";			
				
				var concatvalue = "";
				var ximfconcatvalue = "";
				var ximfconcattechnicalvalue = "";
				
					
				if(arrayCheckedbox[idx].hasAttribute("label")){
					value = arrayCheckedbox[idx].getAttribute("label");
				}
				if(arrayCheckedbox[idx].hasAttribute(_XIMF_ATT_XVALUE)){
					ximfvalue = arrayCheckedbox[idx].getAttribute(_XIMF_ATT_XVALUE);
				}							
				if(arrayCheckedbox[idx].hasAttribute(_XIMF_ATT_TEC_VALUE)){
					ximftechnicalvalue = arrayCheckedbox[idx].getAttribute(_XIMF_ATT_TEC_VALUE);
				}				
				
				// search for XIMF ComplexString 
				if(arrayCheckedbox[idx].hasAttribute(_XIMF_ATT_CONCAT_ID)){
					var sIds = arrayCheckedbox[idx].getAttribute(_XIMF_ATT_CONCAT_ID);
					var reg=new RegExp("[+]+", "g");
					var arrayIds = sIds.split(reg);
									
					for (var k=0; k<arrayIds.length; ++k) { 		
						var cElt = document.getElementById(arrayIds[k]);
						if(cElt){
							var sConcatSeparator = _XIMF_DEFAULT_SEPARATOR;
							var sConcatTecSeparator = _XIMF_DEFAULT_SEPARATOR;
							if(cElt.hasAttribute(_XIMF_ATT_SEPARATOR))
								sConcatSeparator = cElt.getAttribute(_XIMF_ATT_SEPARATOR);
							if(cElt.hasAttribute(_XIMF_ATT_TEC_SEPARATOR))
								sConcatTecSeparator = cElt.getAttribute(_XIMF_ATT_TEC_SEPARATOR);
						 	if(cElt.getAttribute(_XIMF_ATT_XVALUE)){								
								if(concatvalue == ""){			
									concatvalue =  cElt.getAttribute("label") + sConcatSeparator;
									ximfconcatvalue =  cElt.getAttribute(_XIMF_ATT_XVALUE) + sConcatSeparator ;
									if(cElt.hasAttribute(_XIMF_ATT_TEC_VALUE)){
										ximfconcattechnicalvalue =  cElt.getAttribute(_XIMF_ATT_TEC_VALUE) + sConcatTecSeparator;
									}
								}else{
									concatvalue = concatvalue + cElt.getAttribute("label") + sConcatSeparator;
									ximfconcatvalue = ximfconcatvalue + cElt.getAttribute(_XIMF_ATT_XVALUE) + sConcatSeparator;
									if(cElt.hasAttribute(_XIMF_ATT_TEC_VALUE)){
										ximfconcattechnicalvalue = ximfconcattechnicalvalue + cElt.getAttribute(_XIMF_ATT_TEC_VALUE) + sConcatTecSeparator;
									}
								}
							}
						}
					}
				}
	
				//			
				if(sValues != ""){
					sValues = sValues + sContentSeparator + concatvalue + value;		
					sXimfValues = sXimfValues + sContentSeparator + ximfconcatvalue + ximfvalue ;
					if(ximfconcattechnicalvalue != "" || ximftechnicalvalue != ""){
						sXimfTechnicalValues =  sXimfTechnicalValues + sContenTecSeparator + ximfconcattechnicalvalue + ximftechnicalvalue ;
					}
				}else{
					sValues = concatvalue + value;		
					sXimfValues = ximfconcatvalue + ximfvalue;
					if(ximfconcattechnicalvalue != "" || ximftechnicalvalue != ""){	
						sXimfTechnicalValues = 	ximfconcattechnicalvalue + ximftechnicalvalue;
					}
				}
			}
			
			//CheckXimfhdrsSelection for input values
			var arrayTextbox = $("popup[id='"+parentElt.id+"'] textbox[class='ximfInputbox']" );			
			//alert("arrayTextbox.length = " + arrayTextbox.length);
			for( var idx=0 ; idx < arrayTextbox.length; ++idx){
				var ximfvalue = "";
				var value = "";						
				var concatvalue = "";
				var ximfconcatvalue = "";				
				
				// search for XIMF ComplexString 
				if(arrayTextbox[idx].hasAttribute(_XIMF_ATT_CONCAT_ID)){
					var sIds = arrayTextbox[idx].getAttribute(_XIMF_ATT_CONCAT_ID);
					var reg=new RegExp("[+]+", "g");
					var arrayIds = sIds.split(reg);
									
					for (var k=0; k<arrayIds.length; ++k) { 		
						var cElt = document.getElementById(arrayIds[k]);
						if(cElt){
							var sConcatSeparator = _XIMF_DEFAULT_SEPARATOR;
							var sConcatTecSeparator = _XIMF_DEFAULT_SEPARATOR;
							if(cElt.hasAttribute(_XIMF_ATT_SEPARATOR))
								sConcatSeparator = cElt.getAttribute(_XIMF_ATT_SEPARATOR);
							if(cElt.hasAttribute(_XIMF_ATT_TEC_SEPARATOR))
								sConcatTecSeparator = cElt.getAttribute(_XIMF_ATT_TEC_SEPARATOR);
						 						
						 	if(cElt.getAttribute("label")){				
								if(concatvalue == ""){			
									concatvalue =  cElt.getAttribute("label") + sConcatSeparator;
									ximfconcatvalue =  cElt.getAttribute(_XIMF_ATT_XVALUE) + sConcatSeparator ;
									ximfconcattechnicalvalue =  cElt.getAttribute(_XIMF_ATT_TEC_VALUE);
								}else{
									concatvalue = concatvalue + cElt.getAttribute("label") + sConcatSeparator;
									ximfconcatvalue = ximfconcatvalue + cElt.getAttribute(_XIMF_ATT_XVALUE) + sConcatSeparator;
									ximfconcattechnicalvalue = ximfconcattechnicalvalue + sConcatTecSeparator + cElt.getAttribute(_XIMF_ATT_TEC_VALUE) ;
								}
							}
						}
					}
				}
						
				// save edit entry			
				var sInValues = arrayTextbox[idx].value;
				var reg=new RegExp("[\n]+", "g");
				var arrayValues = sInValues.split(reg);
				var valuelist = "";		
				var valueXimflist = "";
				for (var i=0; i<arrayValues.length; ++i) {				 		
					if(arrayValues[i] != ""){
						if(valuelist == ""){					
							valuelist = concatvalue + arrayValues[i];
							valueXimflist = ximfconcatvalue + arrayValues[i];							
						}else{
							valuelist = valuelist + sContentSeparator + concatvalue +  arrayValues[i];
							valueXimflist = valueXimflist + sContentSeparator + ximfconcatvalue +  arrayValues[i];
						}
					}					
				}		
				
				//	add new edit entry		
				if(valuelist!=""){
					if(sValues != ""){
						sValues = sValues + sContentSeparator + valuelist;		
						sXimfValues = sXimfValues + sContentSeparator + valueXimflist ;						
					}else{
						sValues = valuelist;		
						sXimfValues = valueXimflist;
					}
					// technical values
					if(ximfconcattechnicalvalue!=""){
						if(sXimfTechnicalValues!=""){
							sXimfTechnicalValues =  sXimfTechnicalValues + sContenTecSeparator + ximfconcattechnicalvalue ;
						}else{
							sXimfTechnicalValues = 	ximfconcattechnicalvalue;
						}
					}
				}
			} 				 
					
			// set values to textbox
			var txt = document.getElementById(idTextBox);
			txt.value = sValues;
			txt.setAttribute("ximfvalue",sXimfValues);
			txt.setAttribute(_XIMF_ATT_TEC_VALUE,sXimfTechnicalValues);	
			txt.setAttribute(_XIMF_ATT_SEPARATOR,sContentSeparator);
			txt.setAttribute(_XIMF_ATT_TEC_SEPARATOR,sContenTecSeparator);
			CheckXimfhdrsSelection();
			}catch(e){
 			}
};


/*
 * Check elements of panel and update accessibility of elements
 */
function ComputePanelOfCheckboxSelection(idCheckbox){
	try{
		// get informations of panel			
		var pnl = document.getElementById(idCheckbox);
		while(pnl.localName != "panel"){
			pnl = pnl.parentNode;
		} 
		
		// check for selected item number
		var nbItems = $(pnl).attr("ximfmaxitem");			
		var richitems = $("#" + pnl.id + " richlistbox" ).children("richlistitem");			
		var nbchkedboxes = 0;			
		for(i=0 ; i<richitems.length; ++i){
			var chk1 = richitems[i].firstElementChild;						
			if(chk1.localName == "checkbox"){					
				if(chk1.checked){
					var eltsChild = richitems[i].getElementsByTagName("checkbox");
					var cptChk = 0;
					for(j=0 ; j < eltsChild.length; ++j){
						if(eltsChild[j].hasAttribute("checked")) cptChk++;
					}
					nbchkedboxes = nbchkedboxes + cptChk;
					if(cptChk > 1)	nbchkedboxes = nbchkedboxes - 1;
					
					// Compstring flag, if true, child value must be filled
					var ximfChild = false; 
					if(richitems[i].hasAttribute("ximfchild"))
						if(richitems[i].getAttribute("ximfchild")=="true")	
							$(chk1).attr("ximfchild","true");	
				}else{
					$(chk1).removeAttr("ximfchild");
				}
			}
		}
	
		var chkboxes = $("#" + pnl.id + " checkbox" );
		// enable/disable items that can be selected
		if(nbchkedboxes < nbItems){
			// other items can be selected				
			$(chkboxes).attr("disabled","false");//.removeAttr("disabled");	
			for(i=0 ; i<richitems.length; ++i){
				var chk1 = richitems[i].firstElementChild;
				if(chk1.localName == "checkbox"){
					if(!chk1.checked){
						
						var eltsChild = richitems[i].getElementsByTagName("checkbox");					
						for(j=0 ; j < eltsChild.length; ++j){
							$(eltsChild[j]).removeAttr("checked");
							$(eltsChild[j]).attr("disabled","true");								
						}
						$(chk1).attr("disabled","false");//.removeAttr("disabled");							
					}
				}
			}
		}else{
			// max selection is selected, disable others items 
			for(i=0 ; i<richitems.length; ++i){
				var chk1 = richitems[i].firstElementChild;
				if(chk1.localName == "checkbox"){
					var eltsChild = richitems[i].getElementsByTagName("checkbox");					
					if(!chk1.checked){	
						$(chk1).removeAttr("ximfchild");						
						for(j=0 ; j < eltsChild.length; ++j){		
							$(eltsChild[j]).removeAttr("checked");						
							$(eltsChild[j]).attr("disabled","true");													
						}
					}else{
						// disable composed items
						if(eltsChild.length > 1){
							var intCpt = 0;								
							for(j=0 ; j < eltsChild.length; ++j){									
								if(eltsChild[j].hasAttribute("checked")) intCpt++;
							}
							switch(intCpt){
								case 1:
									for(j=0 ; j < eltsChild.length; ++j){
										$(eltsChild[j]).attr("disabled","false");//.removeAttr("disabled");
									}
									chk1.checked = true;
									break;
								case 2:
									for(j=0 ; j < eltsChild.length; ++j){
										if(!eltsChild[j].hasAttribute("checked"))									
											$(eltsChild[j]).attr("disabled","true");
									}
									break;
							}								
						}
					}
				}					
			}				
		}
		XimfailComposeCanClose();	
	}catch(e){
		gConsole.logStringMessage("[ximfmail - ComputePanelOfCheckboxSelection ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
	}		
}


/*
 * Check item group - more than 1 element must be selected
 */
function IsAcceptableXimfCompstring(idCompstring){
	try{	
		var isAcceptableCompstring = false;
		// 
		var siblingElement = document.getElementById(idCompstring).nextElementSibling;
		if(siblingElement){
			if(siblingElement.localName == "textbox"){						
				if(siblingElement.value !="") isAcceptableCompstring = true;				
			}else{
				// search for textboxes
				var childTxtboxList = siblingElement.getElementsByTagName("textbox");
				for(i=0 ; i<childTxtboxList.length ; ++i){
					if(childTxtboxList[i].value !=""){
						isAcceptableCompstring = true;
						break;
					}
				}
				
				if(!isAcceptableCompstring){
				// search for checkboxes
				var childCheckBoxList = siblingElement.getElementsByTagName("checkbox");
					for(i=0 ; i<childCheckBoxList.length ; ++i){
						if(childCheckBoxList[i].checked){
							isAcceptableCompstring = true;
							break;
						}
					}
				}
			}
		}
	}catch(e){
		gConsole.logStringMessage("[ximfmail - IsAcceptableXimfCompstring ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
	} 
	return isAcceptableCompstring;
}

/*
 * Delete all values of ximfmail element
 */
 function EraseAndComputeXimfhdrsTextbox(idTextBox){	
	try{
		var eltTextbox = document.getElementById(idTextBox);
				
		// datepicker case
		if(eltTextbox.localName == _XIMF_ELT_DATEPICKER){
			eltTextbox._input.value = "";
			eltTextbox.gPopup.value = null;
			return;
		}
		
		eltTextbox.value = "";
		eltTextbox.setAttribute(_XIMF_ATT_XVALUE,"");			
		if(eltTextbox.hasAttribute(_XIMF_ATT_TEC_VALUE)){
			eltTextbox.setAttribute(_XIMF_ATT_TEC_VALUE,"");
		}
				
		// raz panel selections
		$("panel[id='"+ eltTextbox.getAttribute("refpanel")+"'] checkbox").removeAttr("checked");
		$("panel[id='"+ eltTextbox.getAttribute("refpanel")+"'] checkbox").removeAttr("disabled");
		var listTxtbox = $("panel[id='"+ eltTextbox.getAttribute("refpanel")+"'] textbox");
		for(i=0;i<listTxtbox.length;++i)listTxtbox[i].value="";
				
		// delete repanel of linked values		
		menu_link = $("panel[id='"+ eltTextbox.getAttribute("refpanel")+"'] menuitem[linkpopupbox]");
		if(menu_link.length > 0){
			for(i=0 ; i<menu_link.length ; ++i)	{	
				try{
					var popupset = document.getElementById($(menu_link[i]).attr("linkpopupbox"));
					var txtbox = document.getElementById(popupset.getAttribute(_XIMF_ATT_REF_BOX));
					EraseAndComputeXimfhdrsTextbox(popupset.getAttribute(_XIMF_ATT_REF_BOX));
					txtbox.setAttribute("refpanel","");
					$("textbox[id='"+popupset.getAttribute(_XIMF_ATT_REF_BOX)+"'] button").attr("refpanel","");
				}catch(e){}
			}
		}		
	}catch(e){
		gConsole.logStringMessage("[ximfmail - eraseXimfmailTextbox ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
	}
}

/*
 *  Compute DOM with datas (used to load draft or template message)
*/
function ComputeWithForm(ximfMessage){	
	if (!ximfMessage instanceof XimfmailMesssage){
		gConsole.logStringMessage("[ximfmail - ComputeWithForm ] \n parameter of refreshDatas must be a ximfMessage object");
		return false;			
	}
	
	// compute free text type
	// compute time type
	// compute menus type			
	try{
		var xheader_dom = $("label[ximfheader]");	
		
		for(var idx_xheader_dom=0; idx_xheader_dom<xheader_dom.length; ++idx_xheader_dom){
			var display_box = null;
			try{
				//gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - search value for textbox : " + xheader_dom[idx_xheader_dom].getAttribute("ximfheader"));		
				var ximfValue = ximfMessage.getHeaderValue(xheader_dom[idx_xheader_dom].getAttribute("ximfheader"));
				if(ximfValue){						
					// search for value and complete display box
					var display_box_list = $("textbox[refheader='" + xheader_dom[idx_xheader_dom].getAttribute("id") + "']");
					
					if(!display_box_list) continue;
					for(var i = 0 ; i < display_box_list.length ; ++i){
						if(display_box_list[i].nodeName == "textbox"){
							display_box = display_box_list[i];
						}
					}
					if(!display_box) continue;
											
					// default values					
					$(display_box).attr("value",ximfValue);
					$(display_box).attr("ximfvalue",ximfValue);
					$(display_box).attr("tooltiptext",ximfValue);

					// menuitem value (ilk, linkpopup...)
					var menu_item = $("panel[id='"+$(display_box).attr("refpanel")+"'] menuitem");
					if(menu_item.length > 0){					
						for(var idx_menu_item = 0 ; idx_menu_item < menu_item.length ; ++idx_menu_item){
							try{
								var current_ximfvalue = menu_item[idx_menu_item].getAttribute("ximfvalue");		
								var valuemsg = String_trim(ximfValue.toLowerCase());
								var valueref = String_trim(current_ximfvalue.toLowerCase());					
								if( valuemsg.indexOf(valueref, 0) != -1 ){
																																			
									//linkpopup manager									
									var linkpopup = menu_item[idx_menu_item].getAttribute("linkpopupbox");
									if(linkpopup){											
										var targetpopup = $("panel[id='"+linkpopup+"']");
										$("textbox[id='" + targetpopup[0].getAttribute("ximfreftextbox")+"']").attr("refpanel",linkpopup);
										$("textbox[id='" + targetpopup[0].getAttribute("ximfreftextbox")+"'] button[class*='ximfPopup']").attr("refpanel",linkpopup);
									}
									
									//insert values in textbox																					
									$(display_box).attr("ximfvalue",current_ximfvalue);
									$(display_box).attr("tooltiptext",menu_item[idx_menu_item].getAttribute("label"));
									display_box.inputField.value = menu_item[idx_menu_item].getAttribute("label");
									//technical value is associated
									try{									
										var xtcval = menu_item[idx_menu_item].getAttribute("ximftecvalue");
										if(xtcval){											
											display_box.setAttribute("ximftecvalue",xtcval);
										}
									}catch(err){}
								}
							}catch(err){
								gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - refreshDatas ] \n " + err + "\nfile : " + Error().fileName+"\nline : "+err.lineNumber);									
							}
						}
					}
				
					
					// checkbox value (ilk, linkpopup...)					
					var check_item = $("panel[id='"+$(display_box).attr("refpanel")+"'] checkbox");
					if(check_item.length > 0){						
						var newximfvalue = "";
						var newtooltiptex = "";
						var newlabel = "";
						var newximftecvalue = "";
						var xSeparator = $("panel[id='"+$(display_box).attr("refpanel")+"']").attr("ximfseparator");
						var xTecSeparator = $("panel[id='"+$(display_box).attr("refpanel")+"']").attr("ximftecseparator");	
						var arrayValue = []
						
						if(xSeparator){						
							var reg=new RegExp("["+xSeparator+"]+", "g");	
							arrayValue = ximfValue.split(reg);
						}else{
							arrayValue.push(ximfValue);
						}			
						for(var idx_arrayValue=0 ; idx_arrayValue<arrayValue.length ; ++idx_arrayValue){									
							var isarrayValueAppend = false;
							for(var idx_check_item = 0 ; idx_check_item < check_item.length ; ++idx_check_item){						
								try{
									var current_ximfvalue = check_item[idx_check_item].getAttribute("ximfvalue");																	
									var valuemsg = arrayValue[idx_arrayValue].toLowerCase();
									var valueref = current_ximfvalue.toLowerCase();					
									if( valuemsg == valueref){
										isarrayValueAppend = true;										
										//										
										check_item[idx_check_item].setAttribute("checked",true);																										
										//linkpopup manager									
										var linkpopup = check_item[idx_check_item].getAttribute("linkpopupbox");
										if(linkpopup){											
											var targetpopup = $("panel[id='"+linkpopup+"']");
											$("textbox[id='" + targetpopup[0].getAttribute("ximfreftextbox")+"']").attr("refpanel",linkpopup);
										}
										
										// save values
										if(xSeparator && newlabel!=""){
											newlabel += xSeparator + check_item[idx_check_item].getAttribute("label");
										}else{
											newlabel = check_item[idx_check_item].getAttribute("label");
										}
										if(xSeparator && newximfvalue!=""){
											newximfvalue += xSeparator + current_ximfvalue;									
										}else{
											newximfvalue = current_ximfvalue;
										}
										if(xSeparator && newtooltiptex!=""){
											newtooltiptex += xSeparator + check_item[idx_check_item].getAttribute("label");									
										}else{
											newtooltiptex = check_item[idx_check_item].getAttribute("label");
										}
										
										//technical value is associated
										var xtcval = check_item[idx_check_item].getAttribute("ximftecvalue");
										if(xtcval){											
											if(xTecSeparator && newximftecvalue!=""){
												newximftecvalue += xTecSeparator + xtcval;									
											}else{
												newximftecvalue = xtcval;
											}		
										}								
									}
								}catch(err){
									gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - refreshDatas ] \n " + err + "\nfile : " + Error().fileName+"\nline : "+err.lineNumber);									
								}
							}
							if(!isarrayValueAppend && arrayValue[idx_arrayValue]!=""){								
								if(xSeparator && newlabel!=""){
									newlabel += xSeparator + arrayValue[idx_arrayValue];
								}else{
									newlabel = arrayValue[idx_arrayValue];
								}
								if(xSeparator && newximfvalue!=""){
									newximfvalue += xSeparator + arrayValue[idx_arrayValue];									
								}else{
									newximfvalue = arrayValue[idx_arrayValue];
								}
								if(xSeparator && newtooltiptex!=""){
									newtooltiptex += xSeparator + arrayValue[idx_arrayValue];									
								}else{
									newtooltiptex = arrayValue[idx_arrayValue];
								}
							}
						}
						
						//insert values in textbox
						if(newximfvalue!="") $(display_box).attr("ximfvalue",newximfvalue);
						if(newtooltiptex!="") $(display_box).attr("tooltiptext",newtooltiptex);
						if(newlabel!="") display_box.inputField.value = newlabel;	
						if(newximftecvalue!="") $(display_box).attr("ximftecvalue",newximftecvalue);
						if(xTecSeparator!="") $(display_box).attr("ximftecseparator",xTecSeparator);
						if(xSeparator!="") $(display_box).attr("ximfseparator",xSeparator);
					}
					
					// button value (ilk, linkpopup...)					
					var button_item = $("panel[id='"+$(display_box).attr("refpanel")+"'] button");		
					if(button_item.length > 0){			
						for(var idx_button_item = 0 ; idx_button_item < button_item.length ; ++idx_button_item){
							try{
								var current_ximfvalue = button_item[idx_button_item].getAttribute("ximfvalue");					
								if(current_ximfvalue != ""){								
									var valuemsg = String_trim(ximfValue.toLowerCase());
									var valueref = String_trim(current_ximfvalue.toLowerCase());					
									if( valuemsg.indexOf(valueref, 0) != -1 ){
									
										//linkpopup manager									
										var linkpopup = button_item[idx_button_item].getAttribute("linkpopupbox");
										if(linkpopup){											
											var targetpopup = $("panel[id='"+linkpopup+"']");
											$("textbox[id='" + targetpopup[0].getAttribute("ximfreftextbox")+"']").attr("refpanel",linkpopup);
										}
										
										//insert values in textbox																					
										$(display_box).attr("ximfvalue",current_ximfvalue);
										$(display_box).attr("tooltiptext",button_item[idx_button_item].getAttribute("label"));
										display_box.inputField.value = button_item[idx_button_item].getAttribute("label");
										
										//technical value is associated
										try{									
											var xtcval = button_item[idx_button_item].getAttribute("ximftecvalue");
											if(xtcval){											
												$(display_box).attr("ximftecvalue",xtcval);
											}
										}catch(err){}
									}
								}
							}catch(err){
								gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - refreshDatas ] \n " + err + "\nfile : " + Error().fileName+"\nline : "+err.lineNumber);									
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
						var ximfValue = ximfMessage.getHeaderValue($("label[id='"+ximfLabelId+"']").attr("ximfheader"));							
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
					var refHeader = xheader_dom[idx_xheader_dom].getAttribute(_XIMF_ATT_REF_HEADER);								
					if(refHeader){
						//gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - search value for freetext :" + $("label[id='"+ximfLabelId+"']").attr("ximfheader")+"\nid ="+ximfLabelId);		
						var ximfValue = ximfMessage.getHeaderValue($("label[id='"+refHeader+"']").attr("ximfheader"));							
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
					var refHeader = xheader_dom[idx_xheader_dom].getAttribute(_XIMF_ATT_REF_HEADER);								
					if(refHeader){
						//gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - search value for freetext :" + $("label[id='"+ximfLabelId+"']").attr("ximfheader")+"\nid ="+ximfLabelId);		
						var ximfValue = ximfMessage.getHeaderValue($("label[id='"+refHeader+"']").attr("ximfheader"));							
						if(ximfValue){
							//alert($("label[id='"+refHeader+"']").attr("ximfheader")+" :: "+ximfValue)
							var thisDate = ConvertZTimeToLocal(ximfValue);	
							if(!thisDate) thisDate = ximfValue;								
							// load date
							xheader_dom[idx_xheader_dom].setAttribute("value",thisDate );
							xheader_dom[idx_xheader_dom].setAttribute("ximfvalue", ximfValue);																
						}								
					}	
				}catch(e){
					gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - refreshDatas] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
				} 
			}
		CheckXimfhdrsSelection();								
	}catch(e){
			gConsole.logStringMessage("[ximfmail - XimfMsgComposeView - refreshDatas] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);		
	}
}

// END COMPUTE FUNCTIONS


/*
 * XIMF RULES AND DOM
 */
function ExecuteXimfHdrsMandatoryRule(){
	var isRuleOk=true;
	/*
	var mandatoriesHdrs = $("label[ximfmandatory='true']");
	for(var i=0; i<mandatoriesHdrs.length; ++i){
		if($("textbox[refheader='"+mandatoriesHdrs[i].getAttribute("id")+"']").attr("ximfvalue") == ""){
			mandatoriesHdrs[i].setAttribute("style","color:red;");				
			isRuleOk = false;
		}else{
			mandatoriesHdrs[i].setAttribute("style","color:black;");	
		}
	}*/
	
	//color tab container
	var panelHdrs = $("tabpanel[class='ximfpane']");
	for(var idx_panelHdrs = 0 ; idx_panelHdrs < panelHdrs.length ; ++idx_panelHdrs){
		//raz tab element
		idXimfPanel = panelHdrs[idx_panelHdrs].getAttribute("id");
		idXimfTap = "tab" + idXimfPanel;
		var cTab = $("tab[id='"+ idXimfTap +"']");
		cTab[0].removeAttribute("ismandatory");
		// CheckXimfhdrsSelection for mandatory elements
		var mandatoriesHdrs = $("tabpanel[id='"+ idXimfPanel + "'] label[ximfmandatory='true']");
		for(var i=0; i<mandatoriesHdrs.length; ++i){
			if($("textbox[refheader='"+mandatoriesHdrs[i].getAttribute("id")+"']").attr("ximfvalue") == ""){
				mandatoriesHdrs[i].setAttribute("style","color:#b20000;");	
				cTab[0].setAttribute("ismandatory","true");						
				isRuleOk = false;				
			}else{
				mandatoriesHdrs[i].setAttribute("style","color:inherit;");	
			}
		}
	}
	return isRuleOk;
}
	
/*
 * XIMF RULES AND DOM
 */
function ExecuteXimfHdrsAssociationRule(){
	var isRuleOk=true;
	var isAlertDisplayed=false;
	var associateArray = gXimfHdrs.getXimfAssociatedHdrArray();
	if(!associateArray) return isRuleOk;
	
	// label to prompt
	// internationalisation
	var sAlertLabel = "";
	try{				
		var gBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
		var stringBundle = gBundle.createBundle("chrome://ximfmail/locale/ximfmail.properties");	
		sAlertLabel = stringBundle.GetStringFromName("ximf-association-alert-label");
	}catch(err){sAlertLabel = "Datas will be deleted!"}	
	
	var reg=new RegExp("[&]+", "g");
	for(var i=0; i<associateArray.length; ++i){		
		var headerRef = $("label[ximfheader='"+associateArray[i]._headerRef+"']").attr("id");
		var valueRef = $("textbox[refheader='"+headerRef+"']").attr("ximfvalue");
		
		var headerName = $("label[ximfheader='"+associateArray[i]._headerName+"']").attr("id");
		var valueName = $("textbox[refheader='"+headerName+"']").attr("ximfvalue");
		
		var tabAssociateValueRef =associateArray[i]._valueRef.split(reg);
		var tabAssociateValueName =associateArray[i]._valueName.split(reg);
		
		var idTextbox = $("textbox[refheader='"+headerName+"']").attr("id");
		var tabItems =  $("panel[ximfreftextbox='"+idTextbox+"'] menuitem");// list of menuitems
								
		if(valueRef !=""){								
			for(var j=0; j<tabAssociateValueRef.length; ++j){	
				if(valueRef == tabAssociateValueRef[j]){						
					if(tabAssociateValueName[j].lastIndexOf(valueName) == -1 ){
						
						if(valueName != "" && !isAlertDisplayed){
							// ask for delete datas
							ximfAlert(sAlertLabel);
							isAlertDisplayed = true;	
						}							
						
						EraseAndComputeXimfhdrsTextbox($("textbox[refheader='"+headerName+"']").attr("id"));							
					}
					for(var idx_tabItems=0; idx_tabItems<tabItems.length; ++idx_tabItems){
						if(tabAssociateValueName[j].lastIndexOf(tabItems[idx_tabItems].getAttribute("ximfvalue")) == -1){
							tabItems[idx_tabItems].setAttribute("disabled","true");
							tabItems[idx_tabItems].parentNode.setAttribute("ximfenable","false"); // css style
						}else{
							tabItems[idx_tabItems].removeAttribute("disabled");	
							tabItems[idx_tabItems].parentNode.setAttribute("ximfenable","true"); // css style
						}							
					}
				}
			}
		}else{
			for(var idx_tabItems=0; idx_tabItems<tabItems.length; ++idx_tabItems){
				tabItems[idx_tabItems].setAttribute("disabled","true");
				tabItems[idx_tabItems].parentNode.setAttribute("ximfenable","false"); // css style
					
				if(valueName != "" && !isAlertDisplayed){
					// ask for delete datas
					ximfAlert(sAlertLabel);	
					isAlertDisplayed = true;
				}
				EraseAndComputeXimfhdrsTextbox($("textbox[refheader='"+headerName+"']").attr("id"));
				
			}							
		}
	}
	return isRuleOk;	
}

/*
 * XIMF RULES AND DOM : manage default values
 */
function ExecuteXimfHdrsDefaultValuesRule(){
	
	try{		
		// get default value in ximfHdr
		var textboxXimfHdrs = $("textbox[class='XimfTextboxDisplay']");		
		for(var i=0; i<textboxXimfHdrs.length; ++i){
			try{
				var refDefaultItemXimfHdr = $("panel[id='" + $(textboxXimfHdrs[i]).attr("refpanel") + "']").attr("ximfdefault");			
				if(refDefaultItemXimfHdr && $(textboxXimfHdrs[i]).attr("ximfvalue") == "" ){
					var item = $("#"+refDefaultItemXimfHdr);
					if(item.length > 0){
						$(textboxXimfHdrs[i]).attr("ximfvalue",$(item[0]).attr("ximfvalue"));
						textboxXimfHdrs[i].value = $(item[0]).attr("label");					
						var techvalue=$(item[0]).attr("ximftecvalue");
						if(techvalue){							
							$(textboxXimfHdrs[i]).attr("ximftecvalue",techvalue);
						}
					}else{
						$(textboxXimfHdrs[i]).attr("ximfvalue",refDefaultItemXimfHdr);
						textboxXimfHdrs[i].value = refDefaultItemXimfHdr;
					}
				}
			}catch(err){}
		}			
	}catch(err){
		gConsole.logStringMessage("[ximfmail - ExecuteXimfHdrsDefaultValuesRule ] \n " + err + "\nfile : " + Error().fileName+"\nline : "+err.lineNumber);
	}	
	
	
}

/*
 * Init non generic rules
 * FT 3504
 */
function InitSpecialXimfRules(){	
	try{
		// load special rules
		var specialRulesArray = gXimfHdrs.getSpecialRulesArray();
		for(var i=0 ; i < specialRulesArray.length ; ++i){
			// search for ximf value					
			var nameHeader = specialRulesArray[i]._headerName;	
			var refHeader = specialRulesArray[i]._headerRef;
			var targetName = specialRulesArray[i]._targetName;
			
			switch(targetName){
				case XIMF_RULE_TARGET_NAME_MANDATORY_HEADERS:
					gConsole.logStringMessage("[ximfmail - InitSpecialXimfRules ] load special rule " + targetName);
					SpecialMandatoryHeaders(nameHeader,refHeader);
					break;
				default: break;
			}
			//alert("refHeader = " + refHeader + "\nnameHeader = " + nameHeader+"\ntargetName = " + targetName);
		}		
	}catch(e){
		gConsole.logStringMessage("[ximfmail - InitSpecialXimfRules ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
	}
}

/*
 * 
 */
function AppendESSSecuityLabel (){
	var essArray = gXimfHdrs.getESSSecurityLabelHdrArray();
	if(!essArray) return;
	if(essArray.length <= 0) return;
	
	if(!gSMFields) return;
	try{
		var essLabels = CreateDOMWithXimfInstance(gXimfHdrs.getXimfInstanceResource(),gChromeXslSecurityLabel);				
	}catch(e){		
		gConsole.logStringMessage("[ximfmail - AppendESSSecuityLabel ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
		return false;
	}	
	try{									
		var ximftexboxArray =  $("#ximfmailComposeMessageHeadersTablist textbox");
		var ximfhiddenlabelArray = $("#ximfmailComposeMessageHeadersTablist label[class='ximfHiddenHeader']");
		var elt = null;			
		for(var i=0 ; i < essArray.length ; ++i){
			// search for ximf value					
			var sXimfValue = null;
			var sXimfLabel = null;
			var sXimfSeparator = null;
			var sXimfTecSeparator = null;
			var refHeader = essArray[i]._headerRef;					
			var refValue  = essArray[i]._valueRef;
			var nameValue = essArray[i]._valueName; 
										
			for(var j=0 ; j < ximftexboxArray.length; ++j ){
				var sXimfHeader = $("label[id='" + ximftexboxArray[j].getAttribute(_XIMF_ATT_REF_HEADER) + "']").attr("ximfheader");
				
				if(refHeader == sXimfHeader){
					sXimfValue = ximftexboxArray[j].getAttribute(_XIMF_ATT_XVALUE);
					sXimfSeparator = ximftexboxArray[j].getAttribute(_XIMF_ATT_SEPARATOR);													
					break;
				}
				
				//technical header case
				sXimfHeader = $("label[id='" + ximftexboxArray[j].getAttribute(_XIMF_ATT_REF_HEADER) + "']").attr("ximftecheader");
				if(refHeader == sXimfHeader){
					sXimfValue = ximftexboxArray[j].getAttribute(_XIMF_ATT_TEC_VALUE);
					sXimfSeparator = ximftexboxArray[j].getAttribute(_XIMF_ATT_SEPARATOR);
					sXimfLabel = ximftexboxArray[j].getAttribute(_XIMF_ATT_XVALUE);
					sXimfTecSeparator = ximftexboxArray[j].getAttribute(_XIMF_ATT_TEC_SEPARATOR);							
					break;
				}
			}
			if(!sXimfValue){
				for(var idx_ximfhiddenlabelArray=0 ; idx_ximfhiddenlabelArray < ximfhiddenlabelArray.length; ++idx_ximfhiddenlabelArray ){
					var sXimfHeader = ximfhiddenlabelArray[idx_ximfhiddenlabelArray].getAttribute("ximfheader");
					if(refHeader == sXimfHeader){
						sXimfValue = ximfhiddenlabelArray[idx_ximfhiddenlabelArray].getAttribute(_XIMF_ATT_XVALUE);
						sXimfSeparator = ximfhiddenlabelArray[idx_ximfhiddenlabelArray].getAttribute(_XIMF_ATT_SEPARATOR);													
						break;
					}						
				}
			}			
			
			//search valueName if refValue defined
			if(refValue){
				var reg=new RegExp("[&]+", "g");
				var arrayRefValue = refValue.split(reg);
				var arrayNameValue = nameValue.split(reg);						
				for (var idxArrayRefValue=0; idxArrayRefValue<arrayRefValue.length; ++idxArrayRefValue){ 		
					if(arrayRefValue[idxArrayRefValue] == sXimfValue){
						if (arrayNameValue[idxArrayRefValue]){											
							sXimfValue = arrayNameValue[idxArrayRefValue];									
							break;
						}
					}							
				}
			}
			
			// add label to sign it
			switch(essArray[i]._headerName){
				case "SecurityPolicyIdentifier": //Security Policy Identifier
					//gConsole.logStringMessage("SecurityPolicyIdentifier =  "+sXimfValue);							
					if(sXimfValue == ""){								
						gSMFields.securityClassification = -1;
						gSMFields.privacyMark = "";
						gSMFields.securityCategories = "";
					}else{
						gSMFields.securityPolicyIdentifier = sXimfValue;
						if(essLabels){
							elt = essLabels.childNodes[0].getElementsByTagName("securityPolicyIdentifier");
							elt[0].setAttribute("value",sXimfValue);
							if(sXimfLabel){
								elt[0].setAttribute("label",sXimfLabel);
							}else{
								elt[0].setAttribute("label",sXimfValue);
							}
						}	
					}
					break;
				case "SecurityClassification": 
					// Security Classification
					// gConsole.logStringMessage("SecurityClassification =  "+sXimfValue);
					// values must be 0,1,2,3,4 or 5 (RFC 2634)
					// gConsole.logStringMessage("SecurityCategory =  "+sXimfValue);										
					if(sXimfValue == ""){ break; }
					if(sXimfValue >= 0 && sXimfValue <= 5){
						gSMFields.securityClassification = sXimfValue;
						if(essLabels){
							elt = essLabels.childNodes[0].getElementsByTagName("securityClassification");
							var item = elt[0].getElementsByTagName("item");
							for(var k=0; k<item.length; ++k){
								if(item[k].getAttribute("value") == sXimfValue){																			
									item[k].setAttribute("ximf",sXimfLabel);
								}
							}
						}								
					}else{
						gSMFields.securityClassification = -1;
					}							
					break;
				case "ESSPrivacyMark": // Privacy Mark							
					//gConsole.logStringMessage("ESSPrivacyMark =  "+sXimfValue);
					gSMFields.privacyMark = sXimfValue;
					if(essLabels){
						elt = essLabels.childNodes[0].getElementsByTagName("privacyMark");
						var item = elt[0].getElementsByTagName("item");
						item[0].setAttribute("value",sXimfValue);								
					}
					break;
				case "SecurityCategory": 							
					// Security Categories 		
					// format to load : oid|type|value name e.g. 0.0.0|1|value|0.0.0.1|2|value														
					var categories = "";
					var regtec = new RegExp("["+sXimfTecSeparator+"]+", "g");
					var reg = new RegExp("["+sXimfSeparator+"]+", "g");
					//var regtec = new RegExp("[;,]+", "g");
					
					if(sXimfValue!=""){
						var tab_XimfValue = sXimfValue.split(regtec);								
						if(sXimfLabel){									
							var tab_XimfLabel = sXimfLabel.split(reg);									
							for(var idx_tab_XimfValue=0; idx_tab_XimfValue<tab_XimfValue.length; ++idx_tab_XimfValue){
								try{
									if(tab_XimfValue[idx_tab_XimfValue]!="" && tab_XimfLabel[idx_tab_XimfValue]!=""){
										if(categories != ""){
											categories += "|";
										}
										//ximftecvalue = "oid,value"
										var regOidValueSep = ","; // FT INT_FT4041 - var regOidValueSep = new RegExp("(,)","g");
										var tmp = tab_XimfValue[idx_tab_XimfValue];
										var oid = tmp.slice(0,tmp.indexOf(regOidValueSep,0));
										var value = tmp.slice(tmp.indexOf(regOidValueSep,0)+1,tmp.length);
										//alert("tmp=" + tmp + "\ntmp.indexOf(regOidValueSep) = "  + tmp.indexOf(regOidValueSep)+"\n>>oid = "+oid+"\nvalue = " + value)
										
										if(value){													
											var type = null;												
											
											if(essLabels){
												var elt = essLabels.childNodes[0].getElementsByTagName("securityCategories");
												//var item = elt[0].getElementsByTagName("item"); // create item...
												// get type form rules definition
												type = $(elt).attr("type");
													if(!type) type = "2"; // fefault value as integer
											
												// add values to xml file
												// <item oid="" type=""  value="" label=""/>
												var item = document.createElement("item");
												item.setAttribute("oid",oid);
												item.setAttribute("type",type);
												item.setAttribute("value",value);
												item.setAttribute("label",tab_XimfLabel[idx_tab_XimfValue]);														
												$(elt).append(item);												
											}											
											categories += oid + "|" + type + "|" + value;	
										}
									}
								}catch(e){
									gConsole.logStringMessage("[ximfmail - AppendESSSecuityLabel - SecurityCategory] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
								}									
							}
						}
					}							
					if(categories != "")
						gConsole.logStringMessage("SecurityCategories =  " + categories);
					gSMFields.securityCategories = categories;																
					break;
				default:
					break;						
			}										
		}
		} catch (e) {
			gConsole.logStringMessage("[ximfmail - AppendESSSecuityLabel ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+e.lineNumber);
		}
		
		try{
			/*
			// create file es XIMFMAIL_SECURITY_LABEL_XML_FILE							
			if(essLabels){			
					// create securityLabel directory
				  	var essfile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile); // get profile folder
					var serializer = new XMLSerializer();
					var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
									
					essfile.append(XIMFMAIL_SECURITY_LABEL_XML_DIR);
					try{essfile.create(essfile.DIRECTORY_TYPE,0);}catch(err){}																			
					essfile.append(XIMFMAIL_SECURITY_LABEL_XML_FILE);
					
					foStream.init(essfile, 0x02 | 0x08 | 0x20, 0664, 0);   // write, create, truncate
					serializer.serializeToStream(essLabels, foStream, "");   // rememeber, doc is the DOM tree
					foStream.close();
			}
			* */
		}catch(e){}
		
		
		try{
			// call external trustedBird functions
			securityLabelSetUIStatusBar(gSMFields.securityPolicyIdentifier, gSMFields.securityClassification);					
			if (!gSMFields.signMessage) signMessage();
		}catch(e){}		
}

/*
 * Check for changes to document and allow saving before closing 
 */	
function XimfailComposeCanClose(){
	try{
		if(gContentChanged == true) return;
		var charSet = null;
		if(gMsgCompose){
			charSet = gMsgCompose.compFields.characterSet;
			if(!charSet) charSet == msgCompFields.defaultCharacterSet;
		}
		var ximfmailMimeSelection = ReadMimeHeadersSelection( XIMF_ENDLINE, charSet);
		if(ximfmailMimeSelection.length > 0) gContentChanged = true; // used xith ComposeCanClose()	
	} catch (e) {
		gConsole.logStringMessage("[ximfmail - XimfailComposeCanClose ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+ e.lineNumber);
	}
}	
	
/*
 * READ XIMFMAIL DOM SELECTION 
 */		
function ReadMimeHeadersSelection( headersSeparator, charSet){
	var sCompleteList="";
	
	// insert XIMF-NAME - name of instance
	var ximfName = DEFAULT_XIMF_NAME;
	if(gXimfCatalog){
		ximfName = gXimfCatalog.getNameInstance(gXimfHdrs.getXimfInstanceResource());
	}	
	try{
		// FT INT_FT3970
		if(ximfName.toLowerCase() == SMTP_INSTANCE){ 
			gConsole.logStringMessage("[ximfmail - ximfmailOnSend ] Send non XIMF message - instance  " + ximfName);
			return sCompleteList;
		}
	}catch(e){}	
	sCompleteList += EncodeMimeXimfheader(XIMF_NAME_HEADER, ximfName, charSet) + headersSeparator;

	// insert XIMF-Version - B4521
	var ximfVersion = DEFAULT_XIMF_VERSION;
	if(gXimfCatalog){
		ximfVersion = gXimfCatalog.getVersionInstance(gXimfHdrs.getXimfInstanceResource());
	}
	sCompleteList += EncodeMimeXimfheader(XIMF_VERSION_HEADER, ximfVersion, charSet) + headersSeparator;
	
	
	// send hidden headers elements
	var arrayValues = $("label[class='ximfHiddenHeader']");
	if(arrayValues){						
		for(var idx=0; idx<=arrayValues.length; idx++){
			try {	
				if(arrayValues[idx].getAttribute(_XIMF_ATT_XVALUE)){					
					sCompleteList += EncodeMimeXimfheader($(arrayValues[idx]).attr("ximfheader"), $(arrayValues[idx]).attr(_XIMF_ATT_XVALUE), charSet) + headersSeparator;											
				}
			} catch (e) {
				gConsole.logStringMessage("[ximfmail - ximfmailOnSend ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);		
			}	
		}
	}
					
	// send textbox elements
	arrayValues = $("textbox[class='XimfTextboxDisplay']");
	if(arrayValues){						
		for(var idx=0; idx<=arrayValues.length; idx++){
			try {	
				if($(arrayValues[idx]).attr(_XIMF_ATT_XVALUE)){
					sCompleteList += EncodeMimeXimfheader($("#"+$(arrayValues[idx]).attr(_XIMF_ATT_REF_HEADER)).attr("ximfheader"), $(arrayValues[idx]).attr(_XIMF_ATT_XVALUE), charSet) + headersSeparator;
					if($(arrayValues[idx]).attr(_XIMF_ATT_TEC_VALUE)){						
						sCompleteList += EncodeMimeXimfheader($("#"+$(arrayValues[idx]).attr(_XIMF_ATT_REF_HEADER)).attr("ximftecheader"), $(arrayValues[idx]).attr(_XIMF_ATT_TEC_VALUE), charSet) + headersSeparator;
					}					
				}
			} catch (e) {
				gConsole.logStringMessage("[ximfmail - ximfmailOnSend ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);		
			}	
		}
	}

	// send editor elements				
	try{									
		arrayValues = $("textbox[class='ximfEditor']");
		if(arrayValues){
			for( idx=0; idx<=arrayValues.length; idx++){					
				if(arrayValues[idx].value){
					try{
						sCompleteList += EncodeMimeXimfheader($("#"+$(arrayValues[idx]).attr(_XIMF_ATT_REF_HEADER)).attr("ximfheader"), arrayValues[idx].value, charSet) + headersSeparator;							
					} catch (e) {
						gConsole.logStringMessage("[ximfmail - ximfmailOnSend ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
					}									
				}
			}
		}
	}catch(e){
		
	}		

	// send datetime elements
	try{
		//arrayValues = $("#ximfmailComposeMessagePanel " + _XIMF_ELT_DATEPICKER);						
		arrayValues = $("textbox[class='ximfDatetime']");	
		if(arrayValues){			
			for( idx=0; idx<=arrayValues.length; idx++){					
				if(arrayValues[idx].value){						
					try{
						sCompleteList += EncodeMimeXimfheader($("#"+$(arrayValues[idx]).attr(_XIMF_ATT_REF_HEADER)).attr("ximfheader"), arrayValues[idx].getAttribute(_XIMF_ATT_XVALUE), charSet) + headersSeparator;							
					} catch (e) {
						//alert(e)
						gConsole.logStringMessage("[ximfmail - ximfmailOnSend ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
					}									
				}
			}
		}
	}catch(e){}
	
	// send ximfaddress elements
	try{
		arrayValues = $("#ximfmailComposeMessagePanel ximfaddress");
		if(arrayValues){						
			for( idx=0; idx<=arrayValues.length; idx++){				
				if(arrayValues[idx].listaddress != ""){
					try{
						sCompleteList += EncodeMimeXimfheader($("#"+$(arrayValues[idx]).attr(_XIMF_ATT_REF_HEADER)).attr("ximfheader"), arrayValues[idx].listaddress, charSet) + headersSeparator;
						
					} catch (e) {
						gConsole.logStringMessage("[ximfmail - ximfmailOnSend ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
					}									
				}
			}
		}
	}catch(e){}
	//alert ("getHeadersSelection \n" + sCompleteList);
	return sCompleteList;
}

		
function ReadXsmptHeadersTranslation(headerValueSeparator, headersSeparator,charSet){
	var sCompleteList = "";
	var xsmtpArray = gXimfHdrs.getXsmtpHdrArray();
	if(!xsmtpArray) return;
	// create mandatory xsmpt headers
	//this.AddMandatoryXsmtpHeader();
	try{			
		for(var i=0 ; i < xsmtpArray.length ; ++i){
			if(!xsmtpArray[i]._headerRef){
				sCompleteList += EncodeMimeXimfheader(xsmtpArray[i]._headerName, xsmtpArray[i]._valueName, charSet) + headersSeparator;
			}
		}			
	} catch (e) {
		gConsole.logStringMessage("[ximfmail - AddMandatoryXsmtpHeader ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
	}
	
	// Copy and convert XIMF headers to XSMTP headers
	var ximftexboxArray =  $("textbox[class='XimfTextboxDisplay']["+_XIMF_ATT_XVALUE+"]");
	for(var i = 0 ; i < ximftexboxArray.length; ++i ){
		var sXimfHeader = $("label[class='ximfHeaderLabel'][id='" + ximftexboxArray[i].getAttribute(_XIMF_ATT_REF_HEADER) + "']").attr("ximfheader");
		var sXimfValue = ximftexboxArray[i].getAttribute(_XIMF_ATT_XVALUE);
		
		if(sXimfValue != ""){
			//this.AddXsmtpHeader(sXimfHeader,sXimfValue);
			try{						
				for(var j=0 ; j < xsmtpArray.length ; ++j){
					//alert(this._ArrayheadersCompatibility[i]._headerRef +" -- "+ ximfHeader);
					
					if(xsmtpArray[j]._headerRef == sXimfHeader){
						//alert(this._ArrayheadersCompatibility[i]._headerRef +" -- "+ ximfHeader);
						var xvalue = sXimfValue; // default, copy of XIMF value	
						// get for values references
						var reg=new RegExp("[&]+", "g");
						if(xsmtpArray[j]._valueRef){
							var arrayValRefs = xsmtpArray[j]._valueRef.split(reg);
							var arrayVals = xsmtpArray[j]._valueName.split(reg);
							for (var k=0; k<arrayValRefs.length; ++k){ 		
								if(arrayValRefs[k] == sXimfValue){
									if (arrayVals[k]){											
									xvalue = arrayVals[k];
									break;
									}
								}							
							}
						}else{
							if(xsmtpArray[j]._valueName)
							var xvalue = xsmtpArray[j]._valueName; // default, copy of XIMF value	
						}
			
						// append line to headers
						sCompleteList += EncodeMimeXimfheader(xsmtpArray[j]._headerName, xvalue, charSet) + headersSeparator;							
					}
				}			
			} catch (e) {
				gConsole.logStringMessage("[ximfmail - AddXsmtpHeader ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+ e.lineNumber);
			}
		} //if	
	}
	return sCompleteList;
}

/*
 * Security rules are only valid for XIMFMAIL Instances
 */
function ReloadSecurityAccess(){
	// access secure headers
	gCurrentIdentity.setBoolAttribute("secureheaders.checked",false);
	$("#idItemSecureHeaders_1").removeAttr("checked");					
	$("#idItemSecureHeaders_2").removeAttr("checked");					
	$("#idItemSecureHeaders_1").removeAttr("disabled");
	$("#idItemSecureHeaders_2").removeAttr("disabled");										
	$("#menu_securitySign1").removeAttr("disabled");
	$("#menu_securitySign2").removeAttr("disabled");
	
	// access security label
	$("#menu_securityLabelDialog1").removeAttr("checked");					
	$("#menu_securityLabelDialog2").removeAttr("checked");					
	$("#menu_securityLabelDialog1").removeAttr("disabled");
	$("#menu_securityLabelDialog2").removeAttr("disabled");	
}