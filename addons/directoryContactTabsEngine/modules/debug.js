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
 * The Original Code is Trustedbird/Directory Contact Tabs code.
 *
 * The Initial Developer of the Original Code is
 * BT Global Services / Etat francais Ministere de la Defense.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Raphael Fairise / BT Global Services / Etat francais Ministere de la Defense
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

var EXPORTED_SYMBOLS = ["dumpMessage", "dumpObject"];


/**
 * Dump a message to the system console (needs "browser.dom.window.dump.enabled=true")
 * @param {string} aMessage
 */
function dumpMessage(aMessage) {
  dump(aMessage + "\n");
}

/**
 * Print human-readable information about a variable
 * @param {Object} obj Variable to print 
 */
function dumpObject(obj) {
  var label = 'unknown';

  function is_array(o) {
    if (o != null && typeof o == 'object') {
      return (typeof o.push == 'undefined') ? false : true;
    }
    return false;
  }

  if (obj == null) {
    return 'null';
  } else if (is_array(obj)) {
    label = 'Array{' + obj.length + '}';
  } else if (typeof obj == 'object' && obj.prototype) {
    obj = obj.prototype;
    label = 'Object';
  } else if (typeof obj == 'object' && !obj.prototype) {
    label = 'Object';
  }

  var base = (typeof arguments[1] == 'undefined') ? '' : arguments[1];

  var r = '';
  var ret_val = '';
  for (var key in obj) {
    if (typeof obj[key] == 'object') {
      if (label.indexOf('Array') > -1 || label == 'Object') {
        r += base + '\t[' + key + '] => '
          + dumpObject(obj[key], (base + '\t')) + '\n';
      } else if (label == 'HTMLObject') {
        var element_id = '';
        if (typeof obj[key].id != 'undefined') {
          element_id += base + '\t\t\t[className] => '
              + typeof (obj[key].className) + '{'
              + obj[key].className.length + '}: ' + '"'
              + obj[key].className + '"' + '\n';
          element_id += base + '\t\t\t[id] => '
              + typeof (obj[key].id) + '{' + obj[key].id.length
              + '}: ' + '"' + obj[key].id + '"' + '\n';
          element_id += base + '\t\t\t[innerText] => '
              + typeof (obj[key].innerText) + '{'
              + obj[key].innerText.length + '}: ' + '"'
              + obj[key].innerText + '"' + '\n';
          element_id += base + '\t\t\t[parentElement] => '
              + typeof (obj[key].parentElement.id) + '{'
              + obj[key].parentElement.id.length + '}: ' + '"'
              + obj[key].parentElement.id + '"' + '\n';
          element_id += base + '\t\t\t[tagName] => '
              + typeof (obj[key].tagName) + '{'
              + obj[key].tagName.length + '}: ' + '"'
              + obj[key].tagName + '"' + '\n';
        }

        r += base + '\t[' + key + '] => '
            + dumpObject(obj[key].children, (base + '\t')) + '\n'
            + base + '\t\tHTMLObj {\n' + element_id + base
            + '\t\t}\n';
      }
    } else {
      if (typeof obj[key] == 'string') {
        r += base
            + '\t['
            + key
            + '] => '
            + (typeof obj[key] + '{' + obj[key].length + '}: '
                + '"' + obj[key] + '"' + '\n');
      } else {
        r += base
            + '\t['
            + key
            + '] => '
            + (typeof obj[key] + ': ' + '"' + obj[key] + '"' + '\n');
      }
    }
  }

  dump(label + ' { \n' + r + base + '} \n\n');
}
