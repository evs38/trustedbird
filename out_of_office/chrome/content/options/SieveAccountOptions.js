// Load all the Libraries we need...
var jsLoader =  Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);

// includes
jsLoader.loadSubScript("chrome://out_of_office/content/libs/misc.js");
var globalServices=new Services();


//Global object to configure the Sieve server account
var gSieveAccountToConfigure = null;
var gAccount = null;

function SieveAccountUI(account)
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

SieveAccountUI.prototype.getHostName = function () {
	return this.hostName; 
}
SieveAccountUI.prototype.setHostName = function (hostName) {
	this.hostName = hostName; 
}

SieveAccountUI.prototype.getHostPort = function () {
	return this.hostPort; 
}
SieveAccountUI.prototype.setHostPort = function (hostPort) {
	this.hostPort = hostPort; 
}

SieveAccountUI.prototype.getHostTLS = function () {
	return this.hostTLS; 
}
SieveAccountUI.prototype.setHostTLS = function (hostTLS) {
	this.hostTLS = hostTLS; 
}

SieveAccountUI.prototype.getHostType = function () {
	return this.hostType; 
}
SieveAccountUI.prototype.setHostType = function (hostType) {
	this.hostType = hostType; 
}

SieveAccountUI.prototype.getUserName = function () {
	return this.userName; 
}
SieveAccountUI.prototype.setUserName = function (userName) {
	this.userName = userName; 
}

SieveAccountUI.prototype.getUserPassword = function () {
	return this.userPassword; 
}
SieveAccountUI.prototype.setUserPassword = function (userPassword) {
	this.userPassword = userPassword; 
}

SieveAccountUI.prototype.getUserPasswordCheck = function () {
	return this.userPasswordCheck; 
}
SieveAccountUI.prototype.setUserPasswordCheck = function (userPasswordCheck) {
	this.userPasswordCheck = userPasswordCheck; 
}

SieveAccountUI.prototype.getLoginIndex = function () {
	return this.rgLoginIndex; 
}
SieveAccountUI.prototype.setLoginIndex = function (rgLoginIndex) {
	this.rgLoginIndex = rgLoginIndex; 
}
	  
SieveAccountUI.prototype.getKeepAlive = function () {
	return this.keepAlive; 
}
SieveAccountUI.prototype.setKeepAlive = function (keepAlive) {
	this.keepAlive = keepAlive; 
}

SieveAccountUI.prototype.getKeepAliveCheck = function () {
	return this.keepAliveCheck; 
}
SieveAccountUI.prototype.setKeepAliveCheck = function (keepAliveCheck) {
	this.keepAliveCheck = keepAliveCheck; 
}
	
SieveAccountUI.prototype.getCompileDelay = function () {
	return this.compileDelay; 
}
SieveAccountUI.prototype.setCompileDelay = function (compileDelay) {
	this.compileDelay = compileDelay; 
}

SieveAccountUI.prototype.getCompileCheck = function () {
	return this.compileCheck; 
}
SieveAccountUI.prototype.setCompileCheck = function (compileCheck) {
	this.compileCheck = compileCheck; 
}
	
SieveAccountUI.prototype.getDebugMode = function () {
	return this.debugMode; 
}
SieveAccountUI.prototype.setDebugMode = function (debugMode) {
	this.debugMode = debugMode; 
}

   
function onDialogLoad(sender)
{
	gAccount = window.arguments[0]["SieveAccount"];
	
	// Initialize UI parameters
	gSieveAccountToConfigure = new SieveAccountUI(gAccount);
	updateData(false); // Set data to user interface control

	// Enable dialog control
	enableHost(gSieveAccountToConfigure.getHostType());
	enableLogin(gSieveAccountToConfigure.getLoginIndex());
	enableKeepAlive(gSieveAccountToConfigure.getKeepAliveCheck());
	enableCompile(gSieveAccountToConfigure.getCompileCheck());	
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
	
	gSieveAccountToConfigure.setLoginIndex( type );
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
	gSieveAccountToConfigure.setUserPasswordCheck(cbxPassword.checked);
	gSieveAccountToConfigure.setUserName(document.getElementById('txtUsername').value);
	gSieveAccountToConfigure.getUserPassword( ( (cbxPassword.checked == true) ? document.getElementById('txtPassword').value : null ) );
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
	gSieveAccountToConfigure.setHostType(sender.checked);
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
	gSieveAccountToConfigure.setHostName( sender.value );
}

function onPortChange(sender)
{
	gSieveAccountToConfigure.setHostPort(sender.value)
}

function onTLSCommand(sender)
{
	gSieveAccountToConfigure.setHostTLS(sender.checked);        
}

// Function for the general Settings...
function onKeepAliveCommand(sender)
{
	gSieveAccountToConfigure.setKeepAliveCheck(sender.checked);
	enableKeepAlive(sender.checked);    
}

function enableKeepAlive(enabled)
{
	globalServices.enableCtrlID('txtKeepAlive', enabled);
}

function onKeepAliveChange(sender)
{
	gSieveAccountToConfigure.setKeepAlive(sender.value);    
}

function onCompileCommand(sender)
{    
	gSieveAccountToConfigure.setCompileCheck(sender.checked); 
	enableCompile(sender.checked);    
}

function enableCompile(enabled)
{
	globalServices.enableCtrlID('txtCompile', enabled);
}

function onCompileChange(sender)
{
	gSieveAccountToConfigure.setCompileDelay(sender.value);
}

function onDebugCommand(sender)
{    
	gSieveAccountToConfigure.getDebugMode(sender.checked);
}

/*
 * Call this member function to initialize data in a dialog box, or to retrieve and validate dialog data.
 * @param (boolean) bSaveAndValidate Flag that indicates whether dialog box is being initialized (FALSE) or data is being retrieved (TRUE).
 * @return (boolean) Nonzero if the operation is successful; otherwise 0. If bSaveAndValidate is TRUE, then a return value of nonzero means that the data is successfully validated.
 */
function updateData(bSaveAndValidate)
{
    if (gSieveAccountToConfigure == null){
        throw "gSieveAccountToConfigure: Sieve Account can't be null"; 
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
	document.getElementById('txtHostname').value = gSieveAccountToConfigure.getHostName();
	document.getElementById('txtPort').value = gSieveAccountToConfigure.getHostPort();
	document.getElementById('cbxTLS').checked = gSieveAccountToConfigure.getHostTLS();
	
	var cbxHost = document.getElementById('cbxHost');
	cbxHost.checked = gSieveAccountToConfigure.getHostType();
	
	// Login field.
	document.getElementById('txtUsername').value = gSieveAccountToConfigure.getUserName();
	       
	var cbxPassword = document.getElementById('cbxPassword');
	cbxPassword.checked = gSieveAccountToConfigure.getUserPasswordCheck();
	document.getElementById('txtPassword').value = ( (cbxPassword.checked == true) ? gSieveAccountToConfigure.getUserPassword() : "" );
	
	var rgLogin = document.getElementById('rgLogin');
	rgLogin.selectedIndex = gSieveAccountToConfigure.getLoginIndex();
  
	document.getElementById('txtKeepAlive').value = gSieveAccountToConfigure.getKeepAlive();
	  
	var cbxKeepAlive = document.getElementById('cbxKeepAlive');
	cbxKeepAlive.checked = gSieveAccountToConfigure.getKeepAliveCheck();
	
	document.getElementById('txtCompile').value = gSieveAccountToConfigure.getCompileDelay();
	          
	var cbxCompile = document.getElementById('cbxCompile');
	cbxCompile.checked = gSieveAccountToConfigure.getCompileCheck();
	
	var cbxDebug = document.getElementById('cbxDebug');
	cbxDebug.checked = gSieveAccountToConfigure.getDebugMode();
}

/*
 * Call this member function to check the validity of the data before set the Sieve account object.
 * @return (boolean) True indicate that the data are correct, False indicate an invalid data set.
 */
function checkDataValidity()
{
	var type = gSieveAccountToConfigure.getLoginIndex();
	if ((type < 0) || (type > 2)){
		alertDataValidity("&outofoffice.settings.invalid.choice;", 'labelLogin' );
		return false;
	}
	if ( type == 2 ){ // Use username/password
		if( gSieveAccountToConfigure.getUserName() == "" ){	// type 2 request a username
			alertDataValidity("&outofoffice.settings.invalid.data;", 'labelUsername' );
			globalServices.setFocusCtrlID('txtUsername');
			return false;
		}
		if( gSieveAccountToConfigure.getUserPasswordCheck()==true ){// Remember the password
			if( gSieveAccountToConfigure.getUserPassword() == null || gSieveAccountToConfigure.getUserPassword() == "" ){	// Then the password cannot be empty
				alertDataValidity("&outofoffice.settings.invalid.data;", 'labelPassword' );
				globalServices.setFocusCtrlID('txtPassword');
				return false;
			}
		}
	}
	type = gSieveAccountToConfigure.getHostType();
	if ((type < 0) || (type > 1)){
		alertDataValidity("&outofoffice.settings.invalid.choice;", 'cbxHost' );
		return false;
	}
	if( type == 1 && gSieveAccountToConfigure.getHostName() == "" ){
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
	gAccount.setActiveLogin( gSieveAccountToConfigure.getLoginIndex() );
	if( gSieveAccountToConfigure.getLoginIndex() == 2 ){
		gAccount.getLogin(2).setLogin( gSieveAccountToConfigure.getUserName(), ( (gSieveAccountToConfigure.getUserPasswordCheck()==true)?gSieveAccountToConfigure.getUserPassword() : null ) );
	}

	gAccount.setActiveHost( gSieveAccountToConfigure.getHostType() );	
	if( gSieveAccountToConfigure.getHostType() == 1 ){ // Host name used
		gAccount.getHost(1).setHostname( gSieveAccountToConfigure.getHostName() );
	}
	gAccount.getHost(1).setPort( gSieveAccountToConfigure.getHostPort() );
	gAccount.getHost(1).setTLS( gSieveAccountToConfigure.getHostTLS() );
	gAccount.getSettings().setKeepAlive( gSieveAccountToConfigure.getKeepAliveCheck() );
	gAccount.getSettings().setKeepAliveInterval( gSieveAccountToConfigure.getKeepAlive() );
	gAccount.getSettings().setCompile( gSieveAccountToConfigure.getCompileCheck() );
	gAccount.getSettings().setCompileDelay( gSieveAccountToConfigure.getCompileDelay() );
	gAccount.getSettings().setDebug( gSieveAccountToConfigure.getDebugMode() );
}