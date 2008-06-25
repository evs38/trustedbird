/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is mozilla.org Code.
 *
 * The Initial Developer of the Original Code is
 *   BT Global Services / Etat francais Ministere de la Defense
 * Portions created by the Initial Developer are Copyright (C) 1998-2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Olivier Brun BT Global Services / Etat francais Ministere de la Defense
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
 * ***** END LICENSE BLOCK ***** */


/**
	@fileoverview
	Library to manage connection and communication between the Thundirbird client and the sieve server.
	This object allow the client to manage the out of office sieve script on the server. 
	@author Olivier Brun - BT Global Services / Etat francais Ministere de la Defense
*/

/*
 * Global object.
 */

var FILE_HEADER = new String("OutOfOfficeSieveServer: "); 

var gParent = null;
var gOutOfOfficeSieveServer = null;
var gSieve = null;
var gCompileTimeout = null;
var gCompile = null
var gCompileDelay = null;
var closeTimeout = null;
var keepAliveInterval = null;
var gTryToCreate = false;

/**
	@TODO 
	Event to manange connection between client and sieve server.
*/
var gEventConnection = 
{	
	onAuthenticate: function(response)
	{
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventConnection:onAuthenticate Sieve server check if password is requested.");
		var login = gOutOfOfficeSieveServer.getAccount().getLogin();

		if (login.hasUsername() == false)
		{
			gEventConnection.onSaslPlainResponse(null);
			return;
		}

		var request = null;
		// the first in the sasl list is prefferd by the server
		switch (response.getSasl()[0].toLowerCase())
		{
			case "login":
				request = new SieveSaslLoginRequest();      
				request.addSaslLoginListener(gEventConnection);
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventConnection:onAuthenticate SieveSaslLoginRequest.");
				break;
			case "plain":
				default: // plain is the fallback...
				request = new SieveSaslPlainRequest();
				request.addSaslPlainListener(gEventConnection);
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventConnection:onAuthenticate SieveSaslPlainRequest.");
				break;        
		}

		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventConnection:onAuthenticate SieveSaslPlainRequest.");
		request.addErrorListener(gEventConnection);
		request.setUsername(login.getUsername())

		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventConnection:onAuthenticate SieveSaslPlainRequest.");
		if (login.hasPassword())
			request.setPassword(login.getPassword());
		else
		{
			var password = promptPassword();
			if (password == null)
				return;

			request.setPassword(login.password);    	    	
		}
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventConnection:onAuthenticate before addrequest.");
		gSieve.addRequest(request);    		
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventConnection:onAuthenticate ended.");
	},

	onInitResponse: function(response)
	{
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventConnection:onInitResponse Sieve server initialization done.");
		var login = gOutOfOfficeSieveServer.getAccount().getLogin();

		// is the Server TLS capable?
		if (gOutOfOfficeSieveServer.getAccount().getHost().isTLS() && response.getTLS())
		{
			var request = new SieveStartTLSRequest();
			request.addStartTLSListener(gEventConnection);
			request.addErrorListener(gEventConnection);

			gSieve.addRequest(request);
			return;
		}    	  

		gEventConnection.onAuthenticate(response);
	},

	onStartTLSResponse : function(response)
	{	        
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventConnection:onStartTLSResponse Sieve server start TLS connection.");
		// activate TLS
		gSieve.startTLS();

		// we should call now Capabilities ...
		// .. they can change with enabled TLS

		var request = new SieveCapabilitiesRequest();
		request.addCapabilitiesListener(gEventConnection);
		request.addErrorListener(gEventConnection);	

		gSieve.addRequest(request);	  
	},

	onSaslLoginResponse: function(response)
	{
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventConnection:onSaslLoginResponse.");
		gEventConnection.onLoginResponse(response);
	},


	onSaslPlainResponse: function(response)
	{
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventConnection:onSaslPlainResponse.");
		gEventConnection.onLoginResponse(response);
	},

	onLoginResponse: function(response)
	{
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventConnection:onLoginResponse Sieve server connected.");
		// enable the disabled controls....
		postStatus("Connected to '" + gOutOfOfficeSieveServer.getAccount().getHost().getHostname() + "' Sieve server.");
		gOutOfOfficeSieveServer.accountConnected = gOutOfOfficeSieveServer.getAccount();
	},

	onLogoutResponse: function(response)
	{
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventConnection:onLogoutResponse Sieve server logout.");
		if (gSieve.isAlive())
			gSieve.disconnect();
		clearTimeout(closeTimeout);

		// this will close the Dialog!
		close();		
		postStatus("Disconnected from '" + gOutOfOfficeSieveServer.getAccount().getHost().getHostname() + "' Sieve server.");
		gOutOfOfficeSieveServer.accountConnected = null;
	},

	onListScriptResponse: function(response)
	{
		if (response.hasError())
		{
			alert("Command \"Listscripts\" failed");
			return ;
		}
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventConnection:onListScriptResponse Sieve server script list response. Try to load " +gOutOfOfficeSieveServer.getScriptName());
//		gOutOfOfficeSieveServer.loadScript();
	},

	onSetActiveResponse: function(response)
	{
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventConnection:onSetActiveResponse Sieve server set active response.");
		if (response.hasError()){
			alert("Command \"setActive\" failed");			
		}
	},

	onCapabilitiesResponse: function(response)
	{
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventConnection:onCapabilitiesResponse.");
		gEventConnection.onAuthenticate(response);
	},	

	onDeleteScriptResponse:  function(response)
	{
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventConnection:onDeleteScriptResponse.");
		clearInterval(gCompileTimeout);
		close();
	},

	onPutScriptResponse: function(response)
	{
		//gOutOfOfficeSieveServer.disconnect();
		
		// Not used because the script file name is hard coded 
		/*
		 * if ((window.arguments[0]["scriptName"] != null)
		 * 		&& (window.arguments[0]["scriptName"] != gOutOfOfficeSieveServer.getScriptName()))
		 * 		{
		 * 			var request = new SieveDeleteScriptRequest( new String(gOutOfOfficeSieveServer.getScriptName()) );
		 * 			request.addDeleteScriptListener(gEventConnection);
		 * 			request.addErrorListener(gEventConnection);
		 * 
		 * 			gSieve.addRequest(request);
		 * 			return
		 * 		}
		 */

		// clearTimeout(gCompileTimeout);
		gOutOfOfficeSieveServer.compileScript();
		// close();
	},

	onGetScriptResponse: function(response)
	{		
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventConnection:onGetScriptResponse Get script name =" + response.getScriptName() );
		gOutOfOfficeSieveServer.setScriptText( response.getScriptBody() );
		gTryToCreate = false;
		if( gParent != null ){
			gParent.postStatus("Connected and script loaded successfully.");
			gParent.onConnectFinish(true);
		}else{
			gOutOfOfficeSieveServer.getServices().errorSrv( FILE_HEADER + "The parent object is not initialized");
		}
	},

	onError: function(response)
	{
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventConnection:onError");
		var code = response.getResponseCode();

		if (code instanceof SieveRespCodeReferral)
		{
			// close the old sieve connection
			gSieve.disconnect();

			postStatus("Referral to "+code.getHostname()+" ...");

			gSieve = new Sieve(
								code.getHostname(),
								gOutOfOfficeSieveServer.getAccount().getHost().getPort(),
								gOutOfOfficeSieveServer.getAccount().isTLS(),
								gOutOfOfficeSieveServer.getAccount().getSettings().isDebug() );
			gOutOfOfficeSieveServer.sieve = gSieve;

			var request = new SieveInitRequest();
			request.addErrorListener(gEventConnection)
			request.addInitListener(gEventConnection)
			gSieve.addRequest(request);

			gSieve.connect();
			return;
		}
		if(gTryToCreate == true /*&& response.getMessage()*/ ){
			// Always refresh the table ...
			gOutOfOfficeSieveServer.createScript();
			gTryToCreate = false;
			return;			
		}

		alert("SERVER ERROR:"+response.getMessage());
	},

	onCycleCell: function(row,col,script,active)
	{
		var request = null;
		if (active == true){
			request = new SieveSetActiveRequest();
		}
		else {	// Script name hard coded for this extension
			request = new SieveSetActiveRequest(gOutOfOfficeSieveServer.getScriptName());
		}

		request.addSetScriptListener(gEventConnection);
		request.addErrorListener(gEventConnection);

		gSieve.addRequest(request);
	}
}


/**
	@TODO 
	Event to manange script creation.
*/
var gEventCreateScript = 
{
	onPutScriptResponse: function(response)
	{
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventCreateScript:onPutScriptResponse Create script name =" + gOutOfOfficeSieveServer.getScriptName() );
		gTryToCreate = false;
		if( gParent != null ){
			gParent.postStatus("Connected and script created successfully.");
			gParent.onConnectFinish(true);
		}else{
			gOutOfOfficeSieveServer.getServices().errorSrv( FILE_HEADER + "The parent object is not initialized");
			stop();
		}
	},

	onError: function(response)
	{
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventCreateScript:onError Error =" + response.getScriptName() );

		// the server did not accept our script therfore wa can't delete it...   		
	}
}



/**
	@TODO 
	Event to manange script compilation.
*/
var gEventCompile = 
{
	onPutScriptResponse: function(response)
	{
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventCompile:onPutScriptResponse Put script name =" + response.getScriptName() );
		document.getElementById("gbError").setAttribute('hidden','true');

		// we need no handlers thus we don't care if the call succseeds
		gSieve.addRequest(new SieveDeleteScriptRequest("TMP_FILE_DELETE_ME"));
		clearTimeout(gCompileTimeout);
		if( gParent != null ){
			gParent.close();
		}else{
			close(); // try to close windows without parent initialized.
		}
		gParent = null;
	},

	onError: function(response)
	{
		gOutOfOfficeSieveServer.getServices().logSrv( FILE_HEADER + "gEventCompile:onError Error =" + response.getScriptName() );
		document.getElementById("gbError").removeAttribute('hidden');
		document.getElementById("lblError").value = response.getMessage();    		

		// the server did not accept our script therfore wa can't delete it...   		
	},
}


/**
	@class This Class link data from user interface to the sieve service running on cyrus server.
	@version 0.1.0
	@author Olivier Brun - BT Global Services / Etat francais Ministere de la Defense
	@constructor
	@param {object} SieveAccount account source
*/
function OutOfOfficeSieveServer(account, services, settings) {

	/*
	 * Sieve object that manage the connection with the server
	 * @type Sieve
	 */
	this.sieve = null;

	/*
	 * account to access to the sieve server
	 * @type SieveAccount
	 */
	this.account = account;
	/*
	 * Current account connected, should be null if no connection active
	 * @type SieveAccount
	 */
	this.accountConnected = null;

	/**
		Object to access to global service (Log, ...) 
		@type Services
	*/
	this.services = services;
	/**
		Out of office parameters
		@type OutOfOfficeSettings
	*/
	this.settings = settings;
	
	this.initialize();
}

OutOfOfficeSieveServer.prototype = {

	/**
		Load all the Libraries we need.
	*/
	loadClass : function()
	{
		var jsLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
		jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveAccounts.js");
		jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/Sieve.js");
		jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveRequest.js");
		jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveResponse.js");    
		jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveResponseParser.js");        
		jsLoader.loadSubScript("chrome://out_of_office/content/libs/libManageSieve/SieveResponseCodes.js");
	},

	/**
		Initialize OutOfOfficeSieveServer 
	*/
	initialize : function()
	{
		/* 
		 * Initialize sieve server as a global object
		 * This is to use the sieve server object by the event objects
		 */
		gOutOfOfficeSieveServer = this;
		this.accountConnected = null;
		
		this.loadClass();

		// @TODO Initialize sieve object
		this.connect();
	},
	
	/*
	 * Start connection to sieve server
	 */
	connect : function()
	{
		this.getServices().logSrv( FILE_HEADER + "try to connect to sieve server " + this.getAccount().getHost().getHostname() );
		var logoutTimeout = null;	
		// Override the unsual request handler because we have to logout first
		var levent = 
		{
			onLogoutResponse: function(response)
			{
				clearTimeout(logoutTimeout);
				if ((this.sieve != null) && (this.sieve.isAlive()))
					this.sieve.disconnect();
					
				// Disable and cancel if account is not enabled
				if (gOutOfOfficeSieveServer.getAccount().isEnabled() == false)
				{	// If we have this message it is a conflict with Sieve extension    
					postStatus("Change Sieve Settings to activate this account");
					return;
				}			
	
				postStatus("Connecting...");
				if (gOutOfOfficeSieveServer.getAccount().getSettings().isKeepAlive())
					keepAliveInterval = setInterval("onKeepAlive()",gOutOfOfficeSieveServer.getAccount().getSettings().getKeepAliveInterval());
	
				gSieve = new Sieve(
									gOutOfOfficeSieveServer.getAccount().getHost().getHostname(),
									gOutOfOfficeSieveServer.getAccount().getHost().getPort(),
									gOutOfOfficeSieveServer.getAccount().getHost().isTLS(),
									gOutOfOfficeSieveServer.getAccount().getSettings().isDebug() );
				this.sieve = gSieve;
	
				var request = new SieveInitRequest();
				request.addErrorListener(gEventConnection)
				request.addInitListener(gEventConnection)
				gSieve.addRequest(request);
	
				gSieve.connect();
			}
		}
	
		// Besteht das Objekt überhaupt bzw besteht eine Verbindung?
		if ((gSieve == null) || (gSieve.isAlive() == false))
		{
			// beides schein nicht zu existieren, daher connect direkt aufrufen...
			levent.onLogoutResponse("");
			return;
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
		request.addErrorListener(gEventConnection);
		gSieve.addRequest(request);	
	},

	/* 
	 * Stop connection to sieve server 
	 */
	disconnect : function()
	{
		this.getServices().logSrv( FILE_HEADER + "disconnect");
		if (keepAliveInterval != null)
		{
			clearInterval(keepAliveInterval);
			keepAliveInterval = null;
		}

		if (gSieve == null)
			return true;
		// Force disconnect in 500 MS
		closeTimeout = setTimeout("this.sieve.disconnect(); close();",250);
		
		var request = new SieveLogoutRequest(gEventConnection)
		request.addLogoutListener(gEventConnection);
		request.addErrorListener(gEventConnection);
		
		gSieve.addRequest(request);
	},

	
	/*
	 * Create script if it doesn't exist on the server
	 * 
	 */
	createScript : function()
	{	
		this.getServices().logSrv( FILE_HEADER + "createScript" + this.getScriptName());

		// TODO put the right parameters to send to sieve server name and data script
		var request = new SievePutScriptRequest( new String(this.getScriptName()), new String("/*NEW*/") );
		request.addPutScriptListener(gEventCreateScript);
		request.addErrorListener(gEventCreateScript);
	
		this.sieve.addRequest(request);
	},


	/*
	 * Load the script out of office from sieve server
	 * @param (object) Parent window that request the load
	 * @return (boolean) Load script successfully started
	 */
	loadScript : function(parent)
	{
		if (gSieve == null){
			this.getServices().warningSrv( FILE_HEADER + "loadScript invalid sieve server object");
			return false;
		}
		this.getServices().logSrv( FILE_HEADER + "loadScript " + this.getScriptName() );
		
		gParent = parent;
		
		// List all scripts as soon as we are connected
/*		var request = new SieveListScriptRequest();
		request.addListScriptListener(gEventConnection);
		request.addErrorListener(gEventConnection);

		gSieve.addRequest(request);
*/		
		
		// script load
		// gSieve = this.connect();
		gCompile = this.getAccount().getSettings().isCompile();
		gCompileDelay = this.getAccount().getSettings().getCompileDelay();
		this.getServices().logSrv( FILE_HEADER + "loadScript Compile =" + gCompile + " delay=" + gCompileDelay );
	
		var request = new SieveGetScriptRequest( new String(this.getScriptName()) );
		request.addGetScriptListener(gEventConnection);
		request.addErrorListener(gEventConnection);
		this.getServices().logSrv( FILE_HEADER + "loadScript send request to sieve." );
		
		gSieve.addRequest(request);
		gTryToCreate = true;
		this.getServices().logSrv( FILE_HEADER + "loadScript ENDED");
		return true;
	},
	
	/**
		Save the script out of office to sieve server 
	*/
	saveScript : function()
	{	
		this.getServices().logSrv( FILE_HEADER + "saveScript");

		// TODO put the right parameters to send to sieve server name and data script
		var request = new SievePutScriptRequest( new String(this.getScriptName()), new String(this.getScriptText()) );
		request.addPutScriptListener(gEventConnection);
		request.addErrorListener(gEventConnection);
	
		gSieve.addRequest(request);
	},
	
	/*
	 * Compile the script out of office and check result
	 */
	compileScript : function()
	{
		this.getServices().logSrv( FILE_HEADER + "compileScript");
		var request = new SievePutScriptRequest("TMP_FILE_DELETE_ME", new String(this.getScriptText()) );
		request.addPutScriptListener(gEventCompile);
		request.addErrorListener(gEventCompile);
		gSieve.addRequest(request);
	},
	
	/*
	 * Activate the script out of office on the server with a symbolic link
	 * @param (string) Name of the script to create link
	 * @param (boolean) Activate script when true
	 */
	activateScript : function(active)
	{
		if( this.accountConnected == null ){
			this.getServices().logSrv( FILE_HEADER + "The script cannot be set to active=" + active + " because the server is not connected.");
			return;	
		}
		this.getServices().logSrv( FILE_HEADER + "activate script=" + active );
		var request = null;
		if (active == true)
			request = new SieveSetActiveRequest();
		else
			request = new SieveSetActiveRequest(this.getScriptName())
      
		request.addSetScriptListener(gEventConnection);
		request.addErrorListener(gEventConnection);
		gSieve.addRequest(request);
	},
	
	/*
	 * Keep Alive
	 */
	keepAlive : function(script,active)
	{
	  	// create a sieve request without an eventhandler...
		gSieve.addRequest(new SieveCapabilitiesRequest())
	},

	/*
	 * Retrieve the name of the script file
	 * @return (string) scriptName Text of the script 
	 */
	getScriptName : function()
	{
		return this.settings.getScriptName();
	},

	/*
	 * Retrieve the text of the script after read from file or generated with data from UI
	 * @return (string) script Text of the script 
	 */
	getScriptText : function()
	{
		return this.settings.scriptCore;
	},

	/**
	 * Set the text of the script after read from file or generated with data from UI
	 * @param (string) script Text of the script 
	 */
	setScriptText : function(script)
	{
		this.settings.scriptCore = script;
	},

	/**
	 * Retrieve current sieve account object
	 * @return (SieveAccount) Sieve account slected 
	 */
	getAccount : function()
	{
		return this.account;
	},

	/**
	 * Retrieve object service  
	 * @return (Services) Services object 
	 */
	getServices : function()
	{
		return this.services;
	},

	/**
	 * Parse the script file read and extract value to initialize Out of Office settings objectc.
	 * This will use by the OutOfOfficeAccountSettings to set the user interface  
	 */
	fillSettings : function()
	{
		return this.services.parseScriptCore();
	},

}

function onBtnCompile()
{
	if ( document.getElementById("btnCompile").checked == false)
	{
		gCompile = true;
		document.getElementById("btnCompile").setAttribute("image","chrome://out_of_office/content/images/syntaxCheckOn.png");
		onCompile();
		return
	}

	clearTimeout(gCompileTimeout);
	gCompileTimeout = null;

	gCompile = false;
	document.getElementById("btnCompile").setAttribute("image","chrome://out_of_office/content/images/syntaxCheckOff.png");
	document.getElementById("gbError").setAttribute('hidden','true')    
}

function onLoad()
{
	// Initialize sieve object to establish communication.
	startSieveConnection( window.arguments[0] ); // @TODO 

	// script loaded
	gCompile = window.arguments[0]["compile"];        
	gCompileDelay = window.arguments[0]["compileDelay"];

	// document.getElementById("btnCompile").checked = gCompile;

	if ( this.getScriptName() == null )
		return

	var request = new SieveGetScriptRequest(new String(this.getScriptName()) );
	request.addGetScriptListener(gEventConnection);
	request.addErrorListener(gEventConnection);

	gSieve.addRequest(request);
}

function onAccept()
{
	var request = new SievePutScriptRequest( new String(this.getScriptName()), new String(this.getScriptText()) );
	request.addPutScriptListener(gEventConnection)
	request.addErrorListener(gEventConnection)

	gSieve.addRequest(request)

	return false;
}
