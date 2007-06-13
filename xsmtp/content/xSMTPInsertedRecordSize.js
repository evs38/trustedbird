﻿/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * ***** BEGIN LICENSE BLOCK *****
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
 *   Eric Ballet Baz BT Global Services / Etat francais Ministere de la Defense
 * and Bruno Lebon BT Global Services / Etat francais Ministere de la Defense
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

// Global variables and constants.
var urls=new Array();
var size = 0;
var gIOService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);

function openMSCOptionsChannel(url) {
  var URI = gIOService.newURI(url, null, null);
  URI = URI.QueryInterface(Components.interfaces.nsIURL );
  return gIOService.newChannelFromURI(URI);
}

function MSCOptionsListener(urls, i)
{
  this.listeurls = urls;
  this.index = i;
}

MSCOptionsListener.prototype =
{

  QueryInterface: function(iid)
  {
    if (iid.equals(Components.interfaces.nsIStreamListener))
        return this;
    return null;
  },
  
  onDataAvailable: function(request , context , inputStream , offset , count)
  {
    size += count;
  },
  
  onStartRequest: function() {},
  
  onStopRequest: function(request , context , statusCode )
  {
    this.index++;
  
	// Goto next URL
	if (this.listeurls.length > this.index) {
		 var channel = openMSCOptionsChannel(this.listeurls[this.index]);
		channel.asyncOpen (new MSCOptionsListener(this.urls, this.index), null);
	}else{
	  window.arguments[0][1]=size;
	  window.close();
	} 
  },

  listeurls: null,
  index: 0
}

// Window Dialog has been loaded.
function mscOptions_Size_Onload() {

    // Retrieve and remind window argument
    urls = window.arguments[0][0];

    // If argument is ok
    if (urls.length>0) {
    
        // Init and process to get message Size
        var channel = openMSCOptionsChannel(urls[0]);
		channel.asyncOpen(new MSCOptionsListener(urls, 0), null);
        
    } else {
        window.close();
    }
}