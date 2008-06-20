
var sieve = null;
var sieveTreeView = null;
var closeTimeout = null;
var keepAliveInterval = null;
var accounts = new Array();

var event = 
{	
  onAuthenticate: function(response)
  {
    var login = getSelectedAccount().getLogin();
    
    if (login.hasUsername() == false)
    {
      event.onSaslPlainResponse(null);
      return;
    }
    
    var request = null;
    // the first in the sasl list is prefferd by the server
    switch (response.getSasl()[0].toLowerCase())
    {
      case "login":
        request = new SieveSaslLoginRequest();      
  	    request.addSaslLoginListener(event);
        break;
      case "plain":
      default: // plain is the fallback...
        request = new SieveSaslPlainRequest();
   	    request.addSaslPlainListener(event);
        break;        
    }

    request.addErrorListener(event);
    request.setUsername(login.getUsername())
    
    if (login.hasPassword())
      request.setPassword(login.getPassword());
    else
    {
      var password = promptPassword();
      if (password == null)
    	  return;

      request.setPassword(login.password);    	    	
    }
    		
    sieve.addRequest(request);    		
    
  },
  
  onInitResponse: function(response)
	{
    	var login = getSelectedAccount().getLogin();
    	
    	// is the Server TLS capable?
    	if (getSelectedAccount().getHost().isTLS() && response.getTLS())
    	{
    	  var request = new SieveStartTLSRequest();
    	  request.addStartTLSListener(event);
    	  request.addErrorListener(event);

   		  sieve.addRequest(request);
   		  return;
    	}    	  
    	
    	event.onAuthenticate(response);
	},
	
	onStartTLSResponse : function(response)
	{	        
    // activate TLS
	  sieve.startTLS();
	    
    // we should call now Capabilities ...
    // .. they can change with enabled TLS
    
    var request = new SieveCapabilitiesRequest();
    request.addCapabilitiesListener(event);
    request.addErrorListener(event);	
		
    sieve.addRequest(request);	  
	},
	
  onSaslLoginResponse: function(response)
  {
    event.onLoginResponse(response);
  },

	
  onSaslPlainResponse: function(response)
  {
    event.onLoginResponse(response);
  },
	
	onLoginResponse: function(response)
	{
    // enable the disabled controls....
    disableControls(false);
    postStatus("Connected");
		
    // List all scripts as soon as we are connected
    var request = new SieveListScriptRequest();
    request.addListScriptListener(event);
    request.addErrorListener(event);

    sieve.addRequest(request);	  	  
    disableControls(false);
	},
	
	onLogoutResponse: function(response)
	{
		if (sieve.isAlive())
			sieve.disconnect();
		clearTimeout(closeTimeout);
		
		// this will close the Dialog!
		close();		
	},
	
	onListScriptResponse: function(response)
	{
		if (response.hasError())
		{
			alert("Command \"Listscripts\" failed");
			return
		}
		
		sieveTreeView.update(response.getScripts());

		var tree = document.getElementById('treeImapRules');
		tree.view = sieveTreeView;
		
		// allways select something
		if ((tree.currentIndex == -1) && (tree.view.rowCount > 0))
			tree.view.selection.select(0);
	},
	
	onSetActiveResponse: function(response)
	{
		if (response.hasError())
			alert("Command \"setActive\" failed");
		
		// Always refresh the table ...
		var request = new SieveListScriptRequest();
		request.addListScriptListener(event);
		request.addErrorListener(event);
		
		sieve.addRequest(request);
	},
	
	onDeleteScriptResponse:  function(response)
	{
		// Always refresh the table ...
		var request = new SieveListScriptRequest();
		request.addListScriptListener(event);
		request.addErrorListener(event);
		
		sieve.addRequest(request);
	},
	
	onCapabilitiesResponse: function(response)
	{
	  event.onAuthenticate(response);
	},	
	
  onError: function(response)
  {
    var code = response.getResponseCode();

    if (code instanceof SieveRespCodeReferral)
    {
      disableControls(true);
      // close the old sieve connection
      sieve.disconnect();
        
      postStatus("Referral to "+code.getHostname()+" ...");
      
      sieve = new Sieve(
                    code.getHostname(),
                    getSelectedAccount().getHost().getPort(),
                    getSelectedAccount().isTLS(),
                    getSelectedAccount().getSettings().isDebug() );
  
      var request = new SieveInitRequest();
      request.addErrorListener(event)
      request.addInitListener(event)
      sieve.addRequest(request);
		    
      sieve.connect();
      return
    }

    alert("SERVER ERROR:"+response.getMessage());
  },
  
  onCycleCell: function(row,col,script,active)
  {
  	var request = null;
    if (active == true)
      request = new SieveSetActiveRequest();
    else
      request = new SieveSetActiveRequest(script)
      
    request.addSetScriptListener(event);
    request.addErrorListener(event);
    
    sieve.addRequest(request);
  }
}

function onKeepAlive()
{
  // create a sieve request without an eventhandler...
  sieve.addRequest(new SieveCapabilitiesRequest())
}

function onWindowLoad()
{
  // Load all the Libraries we need...
  var jsLoader = Components
                   .classes["@mozilla.org/moz/jssubscript-loader;1"]
                   .getService(Components.interfaces.mozIJSSubScriptLoader);
  jsLoader
    .loadSubScript("chrome://sieve/content/libs/libManageSieve/SieveAccounts.js");
  jsLoader
    .loadSubScript("chrome://sieve/content/libs/libManageSieve/Sieve.js");
  jsLoader
    .loadSubScript("chrome://sieve/content/libs/libManageSieve/SieveRequest.js");
  jsLoader
    .loadSubScript("chrome://sieve/content/libs/libManageSieve/SieveResponse.js");    
  jsLoader
    .loadSubScript("chrome://sieve/content/libs/libManageSieve/SieveResponseParser.js");        
  jsLoader
    .loadSubScript("chrome://sieve/content/libs/libManageSieve/SieveResponseCodes.js");
  jsLoader
    .loadSubScript("chrome://sieve/content/editor/SieveFiltersTreeView.js");
//	var actList = document.getElementById("conImapAcct");
//	var actpopup = document.createElement("menupopup");
//	actList.appendChild(actpopup);

  var menuImapAccounts = document.getElementById("menuImapAccounts");

  accounts = (new SieveAccounts()).getAccounts();

  for (var i = 0; i < accounts.length; i++)
  {   
    if (accounts[i].isEnabled() == false)
      menuImapAccounts.appendItem( accounts[i].getDescription(),"","- disabled").disabled = true;
    else
      menuImapAccounts.appendItem( accounts[i].getDescription(),"","").disabled = false;
  }
	
  sieveTreeView = new SieveTreeView(new Array(),event);	
  document.getElementById('treeImapRules').view = sieveTreeView;
	
  menuImapAccounts.selectedIndex = 0;
  onSelectAccount();
}
   
function onWindowClose()
{
  if (keepAliveInterval != null)
  {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
  
  if (sieve == null)
    return true;
  // Force disconnect in 500 MS
  closeTimeout = setTimeout("sieve.disconnect(); close();",250);

  var request = new SieveLogoutRequest(event)
  request.addLogoutListener(event);
  request.addErrorListener(event)
  
  sieve.addRequest(request);

  return false;
}   

function getSelectedAccount()
{
    var menu = document.getElementById("menuImapAccounts")
    return accounts[menu.selectedIndex];
}

function promptPassword()
{
    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
                        
    input = {value:null};
    check = {value:false}; 
    var result = prompts.promptPassword(window,"Password", "Please enter the password for your Sieve account", input, null, check);
    
    if (result)
        return input.value;

    return null;
}

function onSelectAccount()
{
	var logoutTimeout = null;	
	// Override the unsual request handler because we have to logout first
	var levent = 
	{
		onLogoutResponse: function(response)
		{
			clearTimeout(logoutTimeout);
			if ((sieve != null) && (sieve.isAlive()))
				sieve.disconnect();

      // always clear the TreeView
      var tree = document.getElementById('treeImapRules');
   		tree.currentIndex = -1;
     	sieveTreeView.update(new Array());
	    tree.view = sieveTreeView;

      var account = getSelectedAccount();
		
		  disableControls(true);
			// Disable and cancel if account is not enabled
			if (account.isEnabled() == false)
			{			    
				postStatus("Not connected - go to Tool -> Sieve Settings to activate this account")
				return;
			}			

			postStatus("Connecting...");
			if (account.getSettings().isKeepAlive())
			    keepAliveInterval = setInterval("onKeepAlive()",account.getSettings().getKeepAliveInterval());

      sieve = new Sieve(
                    account.getHost().getHostname(),
                    account.getHost().getPort(),
                    account.getHost().isTLS(),
                    account.getSettings().isDebug() );
		    
      var request = new SieveInitRequest();
      request.addErrorListener(event)
      request.addInitListener(event)
      sieve.addRequest(request);
  
      sieve.connect();
    }
  }

	// Besteht das Objekt überhaupt bzw besteht eine Verbindung?
	if ((sieve == null) || (sieve.isAlive() == false))
	{
		// beides schein nicht zu existieren, daher connect direkt aufrufen...
		levent.onLogoutResponse("");
		return
	}
	
	// hier haben wir etwas weniger Zeit ...
	logoutTimeout = setTimeout("levent.onLogoutResponse(\"\")",250);
	
    if (keepAliveInterval != null)
    {
    	clearInterval(keepAliveInterval);
    	keepAliveInterval = null;
    }
  var request = new SieveLogoutRequest();
  request.addLogoutListener(levent);
  request.addErrorListener(event);
	sieve.addRequest(request);	
}

function onDeleteClick()
{	
	var tree = document.getElementById('treeImapRules');	
	
	if (tree.currentIndex == -1)
		return;

	var scriptName = new String(tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0)));	
		
	// delete the script...
	var request = new SieveDeleteScriptRequest(scriptName);
	request.addDeleteScriptListener(event);
	request.addErrorListener(event);
	
	sieve.addRequest(request);
}

function onNewClick()
{
	var args = new Array();
	args["sieve"] = sieve;
	args["compile"] = getSelectedAccount().getSettings().isCompile();
	args["compileDelay"] = getSelectedAccount().getSettings().getCompileDelay();
		
	window.openDialog("chrome://sieve/content/editor/SieveFilterEditor.xul", "FilterEditor", "chrome,modal,titlebar,resizable,centerscreen", args);

	var request = new SieveListScriptRequest();
	request.addListScriptListener(event);
	request.addErrorListener(event);
	
	sieve.addRequest(request);	
}

function onEditClick()
{
  var tree = document.getElementById('treeImapRules');	
  if (tree.currentIndex == -1)
    return;

  var scriptName = new String(tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0)));	

  var args = new Array();
  args["scriptName"] = scriptName;
  args["sieve"] = sieve;
  args["compile"] = getSelectedAccount().getSettings().isCompile();
  args["compileDelay"] = getSelectedAccount().getSettings().getCompileDelay();

  window.openDialog("chrome://sieve/content/editor/SieveFilterEditor.xul", "FilterEditor", "chrome,modal,titlebar,resizable,centerscreen", args);

  var request = new SieveListScriptRequest();
  request.addListScriptListener(event);
  request.addErrorListener(event);
    			
  sieve.addRequest(request);
}

function onCapabilitesClick()
{
  var lEvent = 
  {    
    onCapabilitiesResponse: function(response)
    {
      var args = new Array();
      args["implementation"] = response.getImplementation();
      args["extensions"] = response.getExtensions();
      if (response.getSasl() != "")
        args["sasl"] = response.getSasl();
      else
        args["sasl"] = "Not supported, thus you are authenticated"

      window.openDialog("chrome://sieve/content/editor/SieveCapabilities.xul", "FilterCapabilities", "chrome,modal,titlebar,centerscreen", args);
    }
  }   
    
  var request = new SieveCapabilitiesRequest();
  request.addCapabilitiesListener(lEvent);
  request.addErrorListener(event);	
	
  sieve.addRequest(request);
}

function onSettingsClick()
{
  window.openDialog("chrome://sieve/content/options/SieveOptions.xul", "FilterEditor", "chrome,modal,titlebar,resizable,centerscreen");
}

function postStatus(progress)
{
  document.getElementById('logger').value = progress;
}

function disableControls(disabled)
{
  if (disabled)
  {
    document.getElementById('newButton').setAttribute('disabled','true');
    document.getElementById('editButton').setAttribute('disabled','true');
    document.getElementById('deleteButton').setAttribute('disabled','true');
    document.getElementById('renameButton').setAttribute('disabled','true');
    document.getElementById('capabilites').setAttribute('disabled','true');
    document.getElementById('treeImapRules').setAttribute('disabled','true');
  }
  else
  {
    document.getElementById('newButton').removeAttribute('disabled');
    document.getElementById('editButton').removeAttribute('disabled');
    document.getElementById('deleteButton').removeAttribute('disabled');
    document.getElementById('renameButton').removeAttribute('disabled');    
    document.getElementById('capabilites').removeAttribute('disabled');
    document.getElementById('treeImapRules').removeAttribute('disabled');  
  }
}

function onRenameClick()
{
  
  var lEvent = 
  {
    oldScriptName : null,    
    newScriptName : null,
    
    onGetScriptResponse: function(response)
    {
      
      var request = new SievePutScriptRequest(
                      new String(lEvent.newScriptName),
                      new String(response.getScriptBody()));

      request.addPutScriptListener(lEvent)
      request.addErrorListener(event)
      sieve.addRequest(request);  
    },
        
    onPutScriptResponse: function(response)
    {
      // we redirect this request to event not lEvent!
      // because event.onDeleteScript is doing exactly what we want!
      var request = new SieveDeleteScriptRequest(lEvent.oldScriptName);
      request.addDeleteScriptListener(event);
      request.addErrorListener(event);
      sieve.addRequest(request);
    }    	
  }

  var tree = document.getElementById('treeImapRules');

  if (tree.currentIndex == -1)
    return;


  lEvent.oldScriptName = new String(tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0)));
  
  // TODO remember if the Script is active

  var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                  .getService(Components.interfaces.nsIPromptService);

  input = {value:lEvent.oldScriptName};
  check = {value:false};

  var result
       = prompts.prompt(
           window,
           "Rename Sieve Script",
           "Enter the new name for your Sieve script ",
           input, null, check);

  // Did the User cancel the dialog?
  if (result != true)
    return;

  lEvent.newScriptName = input.value;
  
  // it the old name equals the new name, ignore the request.
  if (lEvent.newScriptName.toLowerCase() == lEvent.oldScriptName.toLowerCase())
    return;   

  // first get the script and redirect the event to a local event...
  // ... in order to put it up under its new name an then finally delete it
  var request = new SieveGetScriptRequest(lEvent.oldScriptName);

  request.addGetScriptListener(lEvent);
  request.addErrorListener(event);

  sieve.addRequest(request);	
}
