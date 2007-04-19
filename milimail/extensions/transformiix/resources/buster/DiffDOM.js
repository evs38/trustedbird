/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
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
 * The Original Code is TransforMiiX XSLT processor code.
 *
 * The Initial Developer of the Original Code is
 * Axel Hecht.
 * Portions created by the Initial Developer are Copyright (C) 2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Axel Hecht <axel@pike.org> (Original Author)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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

// ----------------------
// DiffDOM(node1,node2)
// ----------------------

var isHTML = false;

function DiffDOM(node1, node2, aIsHTML)
{
  isHTML = aIsHTML;
  return DiffNodeAndChildren(node1, node2);
}


// namespace attributes in the second node are ignored
const nsreg = /^xmlns[|:\w]/;

// This function does the work of DiffDOM by recursively calling
// itself to explore the tree
function DiffNodeAndChildren(node1, node2)
{
  if (!node1 && !node2)
    return true;
  if (!node1 || !node2)
    return ErrorUp("One of the nodes is null", node1, node2);
  if (node1.type!=node2.type)
    return ErrorUp("Different node types", node1, node2);

  var attributes = node2.attributes;
  if (attributes && attributes.length) {
    var item, name, ns, value, otherValue;
    for (var index = 0; index < attributes.length; index++) {
      item = attributes.item(index);
      ns = item.namespaceURI;
      if (ns) {
        name = item.localName;
        otherValue = node2.getAttributeNS(ns, name);
      }
      else {
        name = item.nodeName;
        otherValue = node2.getAttribute(name);
      }
      value = item.nodeValue;
      if (!nsreg.test(name) && otherValue!=value) {
        return ErrorUp("Different values for attribute", node1, node2);
      }
    }
  }
  else if (node1.attributes && node1.attributes.length) {
    return ErrorUp("Different number of attributes", node1, node2);
  }

  if (isHTML) {
    if (node1.nodeName.toLowerCase()!=node2.nodeName.toLowerCase())
      return ErrorUp("Different node names", node1, node2);
  }
  else {
    if (node1.nodeName!=node2.nodeName)
      return ErrorUp("Different node names", node1, node2);
  }
  if (node1.nodeValue!=node2.nodeValue)
    return ErrorUp("Different node values", node1, node2);
  if (!isHTML)
    if (node1.namespaceURI!=node2.namespaceURI)
      return ErrorUp("Different namespace", node1, node2);
  if (node1.hasChildNodes() != node2.hasChildNodes())
    return ErrorUp("Different children", node1, node2);
  if (node1.childNodes) {
    if (node1.childNodes.length != node2.childNodes.length)
      return ErrorUp("Different number of children", node1, node2);
    for (var child = 0; child < node1.childNodes.length; child++) {
      if (!DiffNodeAndChildren(node1.childNodes[child],
                               node2.childNodes[child])) {
        return false;
      }
    }
  }
  return true;
}

function ErrorUp(errMsg, node1, node2)
{
  dump("Error: "+errMsg+"\n");
  if (node1) {
      dump("Node 1: "+node1+", ");
      if (node1.nodeType == Node.TEXT_NODE)
          dump("nodeValue: "+node1.nodeValue+"\n");
      else
          dump("nodeName: "+node1.namespaceURI+":"+node1.nodeName+"\n");
  }
  if (node2) {
      dump("Node 2: "+node2+", ");
      if (node2.nodeType == Node.TEXT_NODE)
          dump("nodeValue: "+node2.nodeValue+"\n");
      else
          dump("nodeName: "+node2.namespaceURI+":"+node2.nodeName+"\n");
  }
  return false;
}
