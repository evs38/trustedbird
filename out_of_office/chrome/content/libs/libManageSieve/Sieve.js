
function Sieve(host, port, secure, debug) 
{
 
  if (debug == null) 
    this.debug = false;    
  else
    this.debug = debug;    
  
  this.host = host;
  this.port = port;
  this.secure = secure;
  
  this.socket = null;
  this.data = "";
    
  this.requests = new Array();  
}

Sieve.prototype.isAlive = function()
{
  if (this.socket == null)
    return false;
    
	return this.socket.isAlive(); 
}

Sieve.prototype.startTLS = function ()
{
  if (this.secure != true)
    throw new Exception("TLS can't be started no secure socket");
    
  if (this.socket == null)
    throw new Exception("Can't start TLS, your are not connected to "+host);

  var securityInfo = this.socket.securityInfo.QueryInterface(Components.interfaces.nsISSLSocketControl);
  securityInfo.StartTLS();     
}

Sieve.prototype.addRequest = function(request)
{
	this.requests[this.requests.length] = request;
	// wenn die l�nge nun eins ist war sie vorher null
	// daher muss die Requestwarteschalnge neu angesto�en werden.
	if (this.requests.length > 1)
		return

	// filtert den initrequest heraus...	 	
	if (request instanceof SieveInitRequest)
	  return;

  var output = request.getNextRequest();
  this.outstream.write(output,output.length);
}

Sieve.prototype.connect = function () 
{
	if( this.socket != null)
		return;

  if ( (this.socket != null) && (this.socket.isAlive()))
    return;

  var transportService =
      Components.classes["@mozilla.org/network/socket-transport-service;1"]
        .getService(Components.interfaces.nsISocketTransportService);
  
  if (this.secure)
    this.socket = transportService.createTransport(["starttls"], 1,this.host, this.port, null); 
  else
    this.socket = transportService.createTransport(null, 0,this.host, this.port, null);    
        
  this.outstream = this.socket.openOutputStream(0,0,0);
  
  var stream = this.socket.openInputStream(0,0,0);
  var pump = Components.
    classes["@mozilla.org/network/input-stream-pump;1"].
      createInstance(Components.interfaces.nsIInputStreamPump);
                  
  pump.init(stream, -1, -1, 5000, 2, true);
  pump.asyncRead(this,null);
}

Sieve.prototype.disconnect = function () 
{	
  if (this.socket == null)
    return;
  
  this.socket.close(0);
  this.socket = null;
}

Sieve.prototype.onStopRequest =  function(request, context, status)
{
  if (this.socket != null)
    this.disconnect();
}

Sieve.prototype.onStartRequest = function(request, context)
{
  if (this.debug)
  {
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                           .getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage("Connected to "+this.host+":"+this.port+" ...");
  }  
}

Sieve.prototype.onDataAvailable = function(request, context, inputStream, offset, count)
{
  
  var instream = Components.classes["@mozilla.org/scriptableinputstream;1"]
      .createInstance(Components.interfaces.nsIScriptableInputStream);  
  instream.init(inputStream);
      
  var data = instream.read(count);
    
  if (this.debug)
  {
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                           .getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage(data);
  }  

	// is a request handler waiting?
	if ((this.requests.length == 0))
		return
	
	// responses could be fragmented
	this.data += data;
	
	// therefore we test if the response is parsable...
	try
	{								
	  this.requests[0].addResponse(this.data);
	}
	catch (ex)
	{
	  // it was not parsable, so we have to wait for the next one
	  return;
	}
  
  // if we are here the response was parsable, so we can drop the
  // transmitted data, thus it is now saved in the object
  this.data = "";
     
 	// ... delete the request, it is processed...	
	if (this.requests[0].hasNextRequest() == false)
  	this.requests.splice(0,1);


	// ... are there any other requests waiting in the queue.
	if ((this.requests.length > 0))
	{
	  var output = this.requests[0].getNextRequest();
	  this.outstream.write(output,output.length);
	}
}