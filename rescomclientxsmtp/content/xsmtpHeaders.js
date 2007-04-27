
var messenger = Components.classes["@mozilla.org/messenger;1"].createInstance();
messenger = messenger.QueryInterface(Components.interfaces.nsIMessenger);

var customedHeaders;
var gContainer;

function GetHeadersFromURI(messageURI) {  
    var messageService = messenger.messageServiceFromURI(messageURI);
    var messageStream = Components.classes["@mozilla.org/network/sync-stream-listener;1"].createInstance().QueryInterface(Components.interfaces.nsIInputStream);
    var inputStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance().QueryInterface(Components.interfaces.nsIScriptableInputStream);
    inputStream.init(messageStream);
    var msgWindow = window.opener['msgWindow'];
    var newuri = messageService.streamMessage(messageURI,messageStream, msgWindow, null, false, null); 

    var content = "";
    inputStream.available();
    while (inputStream.available()) {
        content = content + inputStream.read(512);
        var p = content.indexOf("\r\n\r\n");
        var p1 = content.indexOf("\r\r");
        var p2 = content.indexOf("\n\n");
        if (p > 0) {
          content = content.substring(0, p);
          break;
        }
        if (p1 > 0) { 
          content = content.substring(0, p1);
          break;
        }
        if (p2 > 0) {
          content = content.substring(0, p2);
          break;
        }
        if (content.length > 512 * 8)
        {
          throw "Could not find end-of-headers line.";
          return null;
        }
    }
    content = content + "\r\n";

    var headers = Components.classes["@mozilla.org/messenger/mimeheaders;1"].createInstance().QueryInterface(Components.interfaces.nsIMimeHeaders);
    headers.initialize(content, content.length);
    return headers;
}
function GetSelectedMessages()
{
  if (gMsgCompose) {
    var mailWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService()
                     .QueryInterface(Components.interfaces.nsIWindowMediator)
                     .getMostRecentWindow("mail:3pane");
    if (mailWindow) {
      return mailWindow.GetSelectedMessages();
    }
  }

  return null;
}
//var bob= messenger.messageServiceFromURI(messageURI);
//print (bob);
function getXsmtpHeadersFromURI(){
    var messageURI = "";
	//var messageCurrentWindow = window.opener.arguments[0];
	//alert("bruno "+messageCurrentWindow);
	if ((gMsgCompose.type != 0)){
	    //window.opener['customedHeaders']="";
	    messageURI = GetSelectedMessages();
		var head=GetHeadersFromURI(messageURI).allHeaders;
		var allHeaders = new Array();
		var xSMTPHeaders="";
		allHeaders = head.split('\r\n');
		for (i in allHeaders){ 
			if (!(allHeaders[i].indexOf('X-P772'))){
				xSMTPHeaders += allHeaders[i]+ "\r";
			}
		}
		return xSMTPHeaders;
	}else return messageURI;
}
//if((!(gMsgCompose.bodyModified))
//if(window.opener.gContainer !=1){
	


/*if((!(gMsgCompose.bodyModified)) || (gContainer !=1)){
//if((gContainer !=1)){
	if (gMsgCompose.type != 0){
		customedHeaders = getXsmtpHeadersFromURI();
	}else{customedHeaders="";} 
	gContainer=0;
	gMsgCompose.bodyModified=true;
}
alert("fif "+gContainer+" "+customedHeaders);

/*if((!(gMsgCompose.bodyModified)) && (!(window.opener.gContainer))){customedHeaders=""; window.opener.gContainer=0;gMsgCompose.bodyModified=true;}
window.opener.customedHeaders*/


