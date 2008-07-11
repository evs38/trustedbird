// Load all the Libraries we need...
var jsLoader =  Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);

// includes
jsLoader.loadSubScript("chrome://out_of_office/content/libs/misc.js");
var globalServices=new Services();


//Global object to configure the Sieve server account
var gSieveServerToConfigure = null;
var gAccount = null;

function SieveServerUserInterface(account)
{
    if (account == null){
        throw "SieveAccount: Sieve Account can't be null"; 
	}
	// get the custom Host settings
	this.hostName = account.getHost(1).getHostname();
	this.hostPort = account.getHost(1).getPort();
	this.hostTLS = account.getHost(1).isTLS();
	this.hostType = ( (account.getHost().getType() == 1) ? true : false );
   
	// Login field.
	this.userName = account.getLogin(2).getUsername();
	this.userPassword = account.getLogin(2).getPassword();
	this.userPasswordCheck = account.getLogin(2).hasPassword();
	       
	this.rgLoginIndex = account.getLogin().getType();
	  
	this.keepAlive = account.getSettings().getKeepAliveInterval();
	this.keepAliveCheck = account.getSettings().isKeepAlive();
	
	this.compileDelay = account.getSettings().getCompileDelay();
	this.compileCheck = account.getSettings().isCompile();
	
	this.debugMode = account.getSettings().isDebug();
}

SieveServerUserInterface.prototype.getHostName = function () {
	return this.hostName; 
}
SieveServerUserInterface.prototype.setHostName = function (hostName) {
	this.hostName = hostName; 
}

SieveServerUserInterface.prototype.getHostPort = function () {
	return this.hostPort; 
}
SieveServerUserInterface.prototype.setHostPort = function (hostPort) {
	this.hostPort = hostPort; 
}

SieveServerUserInterface.prototype.getHostTLS = function () {
	return this.hostTLS; 
}
SieveServerUserInterface.prototype.setHostTLS = function (hostTLS) {
	this.hostTLS = hostTLS; 
}

SieveServerUserInterface.prototype.getHostType = function () {
	return this.hostType; 
}
SieveServerUserInterface.prototype.setHostType = function (hostType) {
	this.hostType = hostType; 
}

SieveServerUserInterface.prototype.getUserName = function () {
	return this.userName; 
}
SieveServerUserInterface.prototype.setUserName = function (userName) {
	this.userName = userName; 
}

SieveServerUserInterface.prototype.getUserPassword = function () {
	return this.userPassword; 
}
SieveServerUserInterface.prototype.setUserPassword = function (userPassword) {
	this.userPassword = userPassword; 
}

SieveServerUserInterface.prototype.getUserPasswordCheck = function () {
	return this.userPasswordCheck; 
}
SieveServerUserInterface.prototype.setUserPasswordCheck = function (userPasswordCheck) {
	this.userPasswordCheck = userPasswordCheck; 
}

SieveServerUserInterface.prototype.getLoginIndex = function () {
	return this.rgLoginIndex; 
}
SieveServerUserInterface.prototype.setLoginIndex = function (rgLoginIndex) {
	this.rgLoginIndex = rgLoginIndex; 
}
	  
SieveServerUserInterface.prototype.getKeepAlive = function () {
	return this.keepAlive; 
}
SieveServerUserInterface.prototype.setKeepAlive = function (keepAlive) {
	this.keepAlive = keepAlive; 
}

SieveServerUserInterface.prototype.getKeepAliveCheck = function () {
	return this.keepAliveCheck; 
}
SieveServerUserInterface.prototype.setKeepAliveCheck = function (keepAliveCheck) {
	this.keepAliveCheck = keepAliveCheck; 
}
	
SieveServerUserInterface.prototype.getCompileDelay = function () {
	return this.compileDelay; 
}
SieveServerUserInterface.prototype.setCompileDelay = function (compileDelay) {
	this.compileDelay = compileDelay; 
}

SieveServerUserInterface.prototype.getCompileCheck = function () {
	return this.compileCheck; 
}
SieveServerUserInterface.prototype.setCompileCheck = function (compileCheck) {
	this.compileCheck = compileCheck; 
}
	
SieveServerUserInterface.prototype.getDebugMode = function () {
	return this.debugMode; 
}
SieveServerUserInterface.prototype.setDebugMode = function (debugMode) {
	this.debugMode = debugMode; 
}

   
function onDialogLoad(sender)
{
	gAccount = window.arguments[0]["SieveAccount"];
	
	// Initialize UI parameters
	gSieveServerToConfigure = new SieveServerUserInterface(gAccount);
	updateData(false); // Set data to user interface control

	// Enable dialog control
	enableHost(gSieveServerToConfigure.getHostType());
	enableLogin(gSieveServerToConfigure.getLoginIndex());
	enableKeepAlive(gSieveServerToConfigure.getKeepAliveCheck());
	enableCompile(gSieveServerToConfigure.getCompileCheck());	
}

function onDialogAccept(sender)
{
	globalServices.logSrv("onDialogAccept..." );
	window.arguments[0]["OutOfOfficeSieveAccountReturnCode"] = false;
	if( updateData() == true ){ // Retrieve and validate data 
		window.arguments[0]["OutOfOfficeSieveAccountReturnCode"] = true;
		return true;
	}
	globalServices.warningSrv("onDialogAccept: Invalid data." );
	return false; // Invalid data
}

// Function for the custom authentication
function onLoginSelect(sender)
{
	var type = 0;
	if (sender.selectedItem.id == "rbNoAuth")
		type = 0;
	else if (sender.selectedItem.id == "rbImapAuth")
		type = 1;
	else if (sender.selectedItem.id == "rbCustomAuth")
		type = 2;
	
	gSieveServerToConfigure.setLoginIndex( type );
	enableLogin(type);
}

function enableLogin(type)
{
	switch (type)
	{
	case 0:
	case 1:
		globalServices.enableCtrlID('txtUsername', false);
		globalServices.enableCtrlID('txtPassword', false);
		globalServices.enableCtrlID('cbxPassword', false);
        break;
	case 2: 
		globalServices.enableCtrlID('txtUsername', true);
		globalServices.enableCtrlID('cbxPassword', true);
	        
        var cbxPassword = document.getElementById('cbxPassword');
		globalServices.enableCtrlID('txtPassword', cbxPassword.checked);
		break;
	default:
		globalServices.warningSrv("Invalid login type.");
		break;
	}
}

function onLoginChange(sender)
{
	var cbxPassword = document.getElementById('cbxPassword');
	gSieveServerToConfigure.setUserPasswordCheck(cbxPassword.checked);
	gSieveServerToConfigure.setUserName(document.getElementById('txtUsername').value);
	gSieveServerToConfigure.getUserPassword( ( (cbxPassword.checked == true) ? document.getElementById('txtPassword').value : null ) );
}

function onPasswordFocus(sender)
{
  //  document.getElementById('txtPassword').value = "";
}


function onPasswordCommand(sender)
{
	onLoginChange(sender);    
	enablePassword(sender.checked); 
}

function enablePassword(enabled)
{
	globalServices.enableCtrlID('txtPassword', enabled);
}

// Function for the custom server settings
function onHostCommand(sender)
{
	gSieveServerToConfigure.setHostType(sender.checked);
	enableHost(sender.checked);
}

function enableHost(enabled)
{
	globalServices.enableCtrlID('txtHostname', enabled);
	globalServices.enableCtrlID('txtPort', enabled);
	globalServices.enableCtrlID('cbxTLS', enabled);
}

function onHostnameChange(sender)
{
	gSieveServerToConfigure.setHostName( sender.value );
}

function onPortChange(sender)
{
	gSieveServerToConfigure.setHostPort(sender.value)
}

function onTLSCommand(sender)
{
	gSieveServerToConfigure.setHostTLS(sender.checked);        
}

// Function for the general Settings...
function onKeepAliveCommand(sender)
{
	gSieveServerToConfigure.setKeepAliveCheck(sender.checked);
	enableKeepAlive(sender.checked);    
}

function enableKeepAlive(enabled)
{
	globalServices.enableCtrlID('txtKeepAlive', enabled);
}

function onKeepAliveChange(sender)
{
	gSieveServerToConfigure.setKeepAlive(sender.value);    
}

function onCompileCommand(sender)
{    
	gSieveServerToConfigure.setCompileCheck(sender.checked); 
	enableCompile(sender.checked);    
}

function enableCompile(enabled)
{
	globalServices.enableCtrlID('txtCompile', enabled);
}

function onCompileChange(sender)
{
	gSieveServerToConfigure.setCompileDelay(sender.value);
}

function onDebugCommand(sender)
{    
	gSieveServerToConfigure.getDebugMode(sender.checked);
}

/*
 * Call this member function to initialize data in a dialog box, or to retrieve and validate dialog data.
 * @param (boolean) bSaveAndValidate Flag that indicates whether dialog box is being initialized (FALSE) or data is being retrieved (TRUE).
 * @return (boolean) Nonzero if the operation is successful; otherwise 0. If bSaveAndValidate is TRUE, then a return value of nonzero means that the data is successfully validated.
 */
function updateData(bSaveAndValidate)
{
    if (gSieveServerToConfigure == null){
        throw "gSieveServerToConfigure: Sieve Account can't be null"; 
	}
	if(bSaveAndValidate == undefined){
		bSaveAndValidate = true;
	}
	if(bSaveAndValidate == true){	// Retrieve and validate value from control ID
		if( checkDataValidity() == false ) { // Check Data validity
			return false; // Invalid data
		}
		SaveData();
	} else {	// Set value to control ID
		LoadData();
	}
	return true;	
}


/*
 * Call this member function to load data from the Sieve account object.
 */
function LoadData()
{
	// get the custom Host settings
	document.getElementById('txtHostname').value = gSieveServerToConfigure.getHostName();
	document.getElementById('txtPort').value = gSieveServerToConfigure.getHostPort();
	document.getElementById('cbxTLS').checked = gSieveServerToConfigure.getHostTLS();
	
	var cbxHost = document.getElementById('cbxHost');
	cbxHost.checked = gSieveServerToConfigure.getHostType();
	
	// Login field.
	document.getElementById('txtUsername').value = gSieveServerToConfigure.getUserName();
	       
	var cbxPassword = document.getElementById('cbxPassword');
	cbxPassword.checked = gSieveServerToConfigure.getUserPasswordCheck();
	document.getElementById('txtPassword').value = ( (cbxPassword.checked == true) ? gSieveServerToConfigure.getUserPassword() : "" );
	
	var rgLogin = document.getElementById('rgLogin');
	rgLogin.selectedIndex = gSieveServerToConfigure.getLoginIndex();
  
	document.getElementById('txtKeepAlive').value = gSieveServerToConfigure.getKeepAlive();
	  
	var cbxKeepAlive = document.getElementById('cbxKeepAlive');
	cbxKeepAlive.checked = gSieveServerToConfigure.getKeepAliveCheck();
	
	document.getElementById('txtCompile').value = gSieveServerToConfigure.getCompileDelay();
	          
	var cbxCompile = document.getElementById('cbxCompile');
	cbxCompile.checked = gSieveServerToConfigure.getCompileCheck();
	
	var cbxDebug = document.getElementById('cbxDebug');
	cbxDebug.checked = gSieveServerToConfigure.getDebugMode();
}

/*
 * Call this member function to check the validity of the data before set the Sieve account object.
 * @return (boolean) True indicate that the data are correct, False indicate an invalid data set.
 */
function checkDataValidity()
{
	var type = gSieveServerToConfigure.getLoginIndex();
	if ((type < 0) || (type > 2)){
		alertDataValidity("&outofoffice.settings.invalid.choice;", 'labelLogin' );
		return false;
	}
	if ( type == 2 ){ // Use username/password
		if( gSieveServerToConfigure.getUserName() == "" ){	// type 2 request a username
			alertDataValidity("&outofoffice.settings.invalid.data;", 'labelUsername' );
			globalServices.setFocusCtrlID('txtUsername');
			return false;
		}
		if( gSieveServerToConfigure.getUserPasswordCheck()==true ){// Remember the password
			if( gSieveServerToConfigure.getUserPassword() == null || gSieveServerToConfigure.getUserPassword() == "" ){	// Then the password cannot be empty
				alertDataValidity("&outofoffice.settings.invalid.data;", 'labelPassword' );
				globalServices.setFocusCtrlID('txtPassword');
				return false;
			}
		}
	}
	type = gSieveServerToConfigure.getHostType();
	if ((type < 0) || (type > 1)){
		alertDataValidity("&outofoffice.settings.invalid.choice;", 'cbxHost' );
		return false;
	}
	if( type == 1 && gSieveServerToConfigure.getHostName() == "" ){
		alertDataValidity("&outofoffice.settings.invalid.data;", 'labelHostname');
		globalServices.setFocusCtrlID('txtHostname');
		return false;
	}

	return true;
}

/*
 * Display an error popup and set the focus to the UI control on error.
 * @param (string) message String to localize.
 * @param (string) fieldName Label of the UI control id. 
 */
function alertDataValidity( message, fieldName )
{
	var values = new Array();
	values.push( globalServices.getStringLabel(fieldName) );
	alert( globalServices.localizeString( "out_of_office_stringbundle", message, values) );
}

/*
 * Call this member function to save data to the Sieve account object.
 */
function SaveData()
{
	// @TODO Make this attibut accessible to the final user.
	// Hard coded. Activation of the sieve server the current gAccount
	gAccount.setEnabled(true);
	/*
	 * Update gAccount settings
	 */
	gAccount.setActiveLogin( gSieveServerToConfigure.getLoginIndex() );
	if( gSieveServerToConfigure.getLoginIndex() == 2 ){
		gAccount.getLogin(2).setLogin( gSieveServerToConfigure.getUserName(), ( (gSieveServerToConfigure.getUserPasswordCheck()==true)?gSieveServerToConfigure.getUserPassword() : null ) );
	}

	gAccount.setActiveHost( gSieveServerToConfigure.getHostType() );	
	if( gSieveServerToConfigure.getHostType() == 1 ){ // Host name used
		gAccount.getHost(1).setHostname( gSieveServerToConfigure.getHostName() );
	}
	gAccount.getHost(1).setPort( gSieveServerToConfigure.getHostPort() );
	gAccount.getHost(1).setTLS( gSieveServerToConfigure.getHostTLS() );
	gAccount.getSettings().setKeepAlive( gSieveServerToConfigure.getKeepAliveCheck() );
	gAccount.getSettings().setKeepAliveInterval( gSieveServerToConfigure.getKeepAlive() );
	gAccount.getSettings().setCompile( gSieveServerToConfigure.getCompileCheck() );
	gAccount.getSettings().setCompileDelay( gSieveServerToConfigure.getCompileDelay() );
	gAccount.getSettings().setDebug( gSieveServerToConfigure.getDebugMode() );
}