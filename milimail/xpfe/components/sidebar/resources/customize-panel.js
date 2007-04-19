/* -*- Mode: Java -*-
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
 * The Original Code is Mozilla Communicator.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corp.
 * Portions created by the Initial Developer are Copyright (C) 1999
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Stephen Lamm <slamm@netscape.com>
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

// the rdf service
var RDF = '@mozilla.org/rdf/rdf-service;1'
RDF = Components.classes[RDF].getService();
RDF = RDF.QueryInterface(Components.interfaces.nsIRDFService);

var NC = "http://home.netscape.com/NC-rdf#";

var sidebarObj = new Object;
var customizeObj = new Object;

function Init()
{
  customizeObj.id = window.arguments[0];
  customizeObj.url = window.arguments[1];
  sidebarObj.datasource_uri = window.arguments[2];
  sidebarObj.resource = window.arguments[3];

  sidebarObj.datasource = RDF.GetDataSource(sidebarObj.datasource_uri);

  var customize_frame = document.getElementById('customize_frame');
  customize_frame.setAttribute('src', customizeObj.url);
}

// Use an assertion to pass a "refresh" event to all the sidebars.
// They use observers to watch for this assertion (in sidebarOverlay.js).
function RefreshPanel() {
  var sb_resource = RDF.GetResource(sidebarObj.resource);
  var refresh_resource = RDF.GetResource(NC + "refresh_panel");
  var panel_resource = RDF.GetLiteral(customizeObj.id);

  sidebarObj.datasource.Assert(sb_resource,
                               refresh_resource,
                               panel_resource,
                               true);
  sidebarObj.datasource.Unassert(sb_resource,
                                 refresh_resource,
                                 panel_resource);
}

