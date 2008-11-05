/**
 * @fileoverview SieveResponseParser class - Library class to parse Sieve server response and validate it. See class from SieveResponse.js file.
 * @author Thomas Schmid Creator of the Sieve library.
 * @author Olivier Brun Contributor - BT Global Services / Etat francais Ministere de la Defense
 */


function SieveResponseParser(data)
{
  if (data == null)
    throw "Error Parsing Response...\nData is null";
  
  this.data = data;
}

SieveResponseParser.prototype.extract
    = function (size)
{
    this.data = this.data.slice(size);
}

SieveResponseParser.prototype.isLineBreak
    = function ()
{
    if (this.data.indexOf("\r\n") != 0)
        return false;

    return true;
}

SieveResponseParser.prototype.extractLineBreak
    = function ()
{
    if (this.isLineBreak() == false)
        throw "Linebreak expected";
        
    this.data = this.data.slice(2);
}

SieveResponseParser.prototype.isSpace
    = function ()
{
    if (this.data.charAt(0) == " ")
        return true;

    return false;
}

SieveResponseParser.prototype.extractSpace
    = function ()
{
    if (this.isSpace() == false)
        throw "Space expected";
    
    this.data = this.data.slice(1);
}

//     literal               = "{" number  "+}" CRLF *OCTET
SieveResponseParser.prototype.isLiteral
    = function ()
{
    if (this.data.charAt(0) == "{")
        return true;

    return false;
}

// est-ce qu'il y a (string ) dans le cas  si il n'�xiste pas �a sera annul�
// gibt einen string zur?ck, wenn keiner Existiert wird null ?bergeben
// If tey are syntax error then do an exception;
SieveResponseParser.prototype.extractLiteral
    = function ()
{
    if ( this.isLiteral() == false )
        throw "Literal Expected";
    
    // remove the "{"
    this.data = this.data.slice(1);

    // some sieveserves don't care about the Documentation
    // this means instead of "{4+}\r\n1234" we can get "{4}\r\n1234"
    var nextBracket = this.data.indexOf("}");
    if (nextBracket == -1)
        throw "Error unbalanced parathesis \"{\"";

    // extract the size, and ignore "+"
    var size = parseInt(this.data.slice(0,nextBracket).replace(/\+/,""));
    this.data = this.data.slice(nextBracket+1);

    if ( this.isLineBreak() == false)
        throw "Linebreak Expected";        
        
    this.extractLineBreak();

    // extract the Size...
    var literal = this.data.slice(0,size);
    this.data = this.data.slice(size);

    return literal;
}

SieveResponseParser.prototype.isQuoted
    = function ()
{
    if (this.data.charAt(0) == "\"")
        return true;

    return false;
}

SieveResponseParser.prototype.extractQuoted
    = function ()
{
    if (this.isQuoted() == false)
        throw "Quoted expected";

    // remove the Quote "
    this.data = this.data.slice(1);

    // save the position of the next "
    var nextQuote = this.data.indexOf("\"");

    if (nextQuote == -1)
        throw "Error unbalanced quotes";

	var quoted = this.data.slice(0,nextQuote);

    this.data = this.data.slice(nextQuote+1);

    return quoted;
}


SieveResponseParser.prototype.isString
    = function ()
{
    if ( this.isQuoted() )
        return true;
    else if ( this.isLiteral() )
        return true;

    return false;
}

SieveResponseParser.prototype.extractString
    = function ()
{
    if ( this.isQuoted() )
        return this.extractQuoted();
    if ( this.isLiteral() )
        return this.extractLiteral();
        
    throw "Message String expected";        
}

// Tokens end with an linebreak or a Space
SieveResponseParser.prototype.extractToken
    = function ( delimiter )
{
    var size = this.data.indexOf(delimiter)
    if (size == -1)
        throw "Delimiter not found";        
    
    var token = this.data.slice(0,size);
    this.data = this.data.slice(size);
    
    return token;
}

SieveResponseParser.prototype.startsWith
    = function ( string )
{
    var tmp = this.data.slice(0,string.length).toUpperCase();    

    if (tmp.indexOf(string.toUpperCase()) == 0)
        return true;
    
    return false;
}

SieveResponseParser.prototype.getData
    = function ()
{
    return this.data;
}    
    
