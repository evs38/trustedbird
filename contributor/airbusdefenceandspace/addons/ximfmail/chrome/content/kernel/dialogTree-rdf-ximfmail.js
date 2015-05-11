/* ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2008-2009 EADS DEFENCE AND SECURITY - All rights reserved.
 * ximfmail is under the triple license  MPL 1.1/GPL 2.0/LGPL 2.1.
 *
 *
 * Redistribution and use, in source and binary forms, with or without modification,
 * are permitted provided that the following conditons are met :
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * 2. MPL 1.1/GPL 2.0/LGPL 2.1. license agreements must be attached
 *    in the redistribution of the source code.
 * 3. Neither the names of the copyright holders nor the names of any contributors
 *    may be used to endorse or promote products derived from this software without specific
 *    prior written permission from EADS Defence and Security.
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
 * REMINDER  :
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR  A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * EADS Defence and Security - 1 Boulevard Jean Moulin -
 * ZAC de la Clef Saint Pierre - 78990 Elancourt - FRANCE (IDDN.FR.001.480012.002.S.P.2008.000.10000)
 *
 * Contributor(s):
 *   Copyright(c) Airbus Defence and Space 2014 - All rights reserved
 * ***** END LICENSE BLOCK ***** */
var XIMF_DIALOG_TREE_RDF_ROOT_URI       = "http://www.ximfmail.com/dialogtree/datas";
var XIMF_DIALOG_TREE_PREDICATE_COLUMN_0 = "http://www.ximfmail.com/RDF#column0";
var XIMF_DIALOG_TREE_PREDICATE_COLUMN_1 = "http://www.ximfmail.com/RDF#column1";

function Indexage(){
  this.A = -1;
  this.B = -1;
  this.C = -1;
  this.D = -1;
  this.E = -1;
  this.F = -1;
  this.G = -1;
  this.H = -1;
  this.I = -1;
  this.J = -1;
  this.K = -1;
  this.L = -1;
  this.M = -1;
  this.N = -1;
  this.O = -1;
  this.P = -1;
  this.Q = -1;
  this.R = -1;
  this.S = -1;
  this.T = -1;
  this.U = -1;
  this.V = -1;
  this.W = -1;
  this.X = -1;
  this.Y = -1;
  this.Z = -1;
};
/*
 *
 */
function DialogTreeRDFSourceClass() {
  // private:
  var _rdfService = null;
  var _rdfCUtils = null;
  var _treeProjectsDatasource = null;
  var _treeProjectsRefURI = null;
  var _SeqRDFC_data = null;
  // public:
  if (typeof DialogTreeRDFSourceClass.initialized === "undefined") {
    //init
    DialogTreeRDFSourceClass.prototype.initialize = function(dataSource, strURI) {
      try {
      	gConsole.logStringMessage("[ximfmail - DialogTreeRDFClass ] \n ");
        // ref : attribut of tree. use to save all data in the same dataSource
         _treeProjectsRefURI = strURI;
        // init RDF service
        _rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
        // init data source
        if (null === _treeProjectsDatasource) {
          _treeProjectsDatasource = dataSource;
        }
        // init RDF Container Utils
        _rdfCUtils = Components.classes["@mozilla.org/rdf/container-utils;1"].createInstance(Components.interfaces.nsIRDFContainerUtils);
        // Init seq Container data source
        var seqNode = _rdfService.GetResource(_treeProjectsRefURI);
        _SeqRDFC_data = _rdfCUtils.MakeSeq(_treeProjectsDatasource, seqNode);
      } catch(e){
        gConsole.logStringMessage("[ximfmail - DialogTreeRDFClass ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
      }
    }
    //
    DialogTreeRDFSourceClass.prototype.getEntriesCount = function() {
      if (_SeqRDFC_data) {
        return _SeqRDFC_data.GetCount();
      } else {
        return 0;
      }
    }
    //
    DialogTreeRDFSourceClass.prototype.getDataSource=function() {
      return _treeProjectsDatasource;
    };

    DialogTreeRDFSourceClass.prototype.getDataEntry = function(uri,predicate) {
      try {
        var data = "";
        var resource = _rdfService.GetResource(uri);
        var targets = _treeProjectsDatasource.ArcLabelsOut(resource);
        while (targets.hasMoreElements()) {
          var newpredicate = targets.getNext();
          if (newpredicate instanceof Components.interfaces.nsIRDFResource) {
              var target = _treeProjectsDatasource.GetTarget(resource, newpredicate, true);
              if (target instanceof Components.interfaces.nsIRDFLiteral && newpredicate.Value === predicate) {
                data = target.Value;
              }
            }
        }
      }catch(e){
        gConsole.logStringMessage("[ximfmail - DialogTreeRDFSourceClass ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
      }
      return data;
    };
    DialogTreeRDFSourceClass.prototype.getEntryByPos = function(beggin, nbr) {
      var arrayResult = [];
      try {
        var seq = _SeqRDFC_data.GetElements();
        var currentData = 0;
        while (seq.hasMoreElements()) {
          var element = seq.getNext();
          if (element instanceof Components.interfaces.nsIRDFResource && currentData >= beggin && currentData <= beggin+nbr) {
            var col0 = this.getDataEntry(element.ValueUTF8,XIMF_DIALOG_TREE_PREDICATE_COLUMN_0);
            var col1 = this.getDataEntry(element.ValueUTF8,XIMF_DIALOG_TREE_PREDICATE_COLUMN_1);
            arrayResult.push([col0,col1]);
          }
          currentData++;
        }
      }catch(e){
        gConsole.logStringMessage("[ximfmail - getSeachText ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
      }
      return arrayResult;
    };

    //
    DialogTreeRDFSourceClass.prototype.getEntryByText = function(textToFind, nbr, curpos)  {
      var arrayResult = [];
      var beggin = _SeqRDFC_data.GetCount();
      try {
        var seq = _SeqRDFC_data.GetElements();
        var currentData = 0;
        while (seq.hasMoreElements()) {
	        var element = seq.getNext();
	        if (element instanceof Components.interfaces.nsIRDFResource && curpos <= currentData) {
	            var col0 = this.getDataEntry(element.ValueUTF8,XIMF_DIALOG_TREE_PREDICATE_COLUMN_0);
	            if (beggin === _SeqRDFC_data.GetCount() && col0.toUpperCase().indexOf(textToFind.toUpperCase()) !== -1) {
					beggin = currentData;
				}
	            if (currentData >= beggin && currentData <= beggin+nbr) {
	              var col1 = this.getDataEntry(element.ValueUTF8,XIMF_DIALOG_TREE_PREDICATE_COLUMN_1);
	              arrayResult.push([col0,col1]);
	            }
        	}
          currentData++;
        }
      }catch(e){
        gConsole.logStringMessage("[ximfmail - getSeachText ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
      }
      return [arrayResult,beggin];
    };
    DialogTreeRDFSourceClass.prototype.getIndex = function() {
      var arrayResult = [];
      var beggin = -1;
      var indexAZ = new Indexage();
      try {
        var seq = _SeqRDFC_data.GetElements();
        var currentData = 0;
        while (seq.hasMoreElements()) {
          var element = seq.getNext();
          if (element instanceof Components.interfaces.nsIRDFResource) {
            var col0 = this.getDataEntry(element.ValueUTF8,XIMF_DIALOG_TREE_PREDICATE_COLUMN_0);
            if(indexAZ[col0[0].toUpperCase()] === -1) {
              indexAZ[col0[0].toUpperCase()] = currentData;
            }
          }
          currentData++;
        }
      }catch(e){
        gConsole.logStringMessage("[ximfmail - getIndex ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
      }
      return indexAZ;
    };
    // object initialisation
    DialogTreeRDFSourceClass.initialized = true;
  }
}

/*
 *
 */
function DialogTreeRDFClass() {
  // private:
  var _rdfService = null;
  var _rdfCUtils = null;
  var _treeProjectsDatasource = null;
  var _treeProjectsRefURI = null;
  var _SeqRDFC_data = null;
  var _RdfDataSourceOrigin = null;
  var _indexAZ = null;
  // public:
  if(typeof DialogTreeRDFClass.initialized === "undefined") {
    //init
    DialogTreeRDFClass.prototype.initialize = function(dataSource, strURI) {
      try {
      	// ref : attribut of tree. use to save all data in the same dataSource
          _treeProjectsRefURI = XIMF_DIALOG_TREE_RDF_ROOT_URI;
        // init RDF service
        _rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
        // init data source
        if (null === _treeProjectsDatasource) {
          _treeProjectsDatasource = _rdfService.GetDataSource("rdf:in-memory-datasource");
          _treeProjectsDatasource.QueryInterface(Components.interfaces.nsIRDFInMemoryDataSource);
        }
        // init RDF Container Utils
        _rdfCUtils = Components.classes["@mozilla.org/rdf/container-utils;1"].createInstance(Components.interfaces.nsIRDFContainerUtils);
        // Init seq Container data source
        var seqNode = _rdfService.GetResource(_treeProjectsRefURI);
        _SeqRDFC_data = _rdfCUtils.MakeSeq(_treeProjectsDatasource, seqNode);
        _RdfDataSourceOrigin = new DialogTreeRDFSourceClass();
        _RdfDataSourceOrigin.initialize(dataSource, strURI);
        _indexAZ = _RdfDataSourceOrigin.getIndex();
      } catch(e) {
        gConsole.logStringMessage("[ximfmail - DialogTreeRDFClass ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
      }
    }
    //
    DialogTreeRDFClass.prototype.getEntriesCount = function() {
      if (_SeqRDFC_data) {
        return _SeqRDFC_data.GetCount();
      }else{
        return 0;
      }
    }
    //
    DialogTreeRDFClass.prototype.getDataSource=function() {
      return _treeProjectsDatasource;
    };
    DialogTreeRDFClass.prototype.addEntryDisplay = function(entry, index) {
      // append resource element to sequence
      //[DN,name,type]
      var col0 = entry[0];
      var col1 = entry[1];
      var newURI = _treeProjectsRefURI + "/data" + index ;
      var newResource = _rdfService.GetResource(newURI);
      _SeqRDFC_data.AppendElement(newResource);
      // save user informations
      if(col0) {
        _treeProjectsDatasource.Assert(newResource,
          _rdfService.GetResource(XIMF_DIALOG_TREE_PREDICATE_COLUMN_0),
          _rdfService.GetLiteral(col0),
          true);
      }
      if(col1) {
        _treeProjectsDatasource.Assert(newResource,
          _rdfService.GetResource(XIMF_DIALOG_TREE_PREDICATE_COLUMN_1),
          _rdfService.GetLiteral(col1),
          true);
      }
    };
    DialogTreeRDFClass.prototype.getDataEntry = function(uri,predicate) {
      try{
        _RdfDataSourceOrigin.getDataEntry(uri,predicate);
      }catch(e){
        gConsole.logStringMessage("[ximfmail - DialogTreeRDFClass ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
      }
      return data;
    };
	DialogTreeRDFClass.prototype.removeAllDisplay = function() {
      try {
        if(_SeqRDFC_data) {
          var numEntri = _SeqRDFC_data.GetCount();
          for (var indexCur = numEntri; indexCur >0; indexCur--) {
            _SeqRDFC_data.RemoveElementAt(indexCur,true);
          }
        }
      }catch(e){
        gConsole.logStringMessage("[ximfmail - DialogTreeRDFClass ] \n " + e + "\nfile : " + Error().fileName+"\nline : "+Error().lineNumber);
      }
    };
    //
    DialogTreeRDFClass.prototype.updateDisplay = function(curpos,maxPos) {
		var colFoundArray = [];
		var maxEntry = _RdfDataSourceOrigin.getEntriesCount();
		if(curpos+maxPos > maxEntry) {
	    	curpos = maxEntry-maxPos;
		}
		colFoundArray = _RdfDataSourceOrigin.getEntryByPos(curpos, maxPos);
		this.removeAllDisplay();
		for(var currItem=0;currItem<colFoundArray.length;currItem++) {
	      this.addEntryDisplay(colFoundArray[currItem], currItem);
		}
	    $("#ximfmail.treedialog").attr("hidevscroll","true");
    };
	DialogTreeRDFClass.prototype.updateDisplayByText = function(textToFind,maxPos,curpos) {
		var colFoundArray = [];
  		var index = _indexAZ[textToFind[0].toUpperCase()];
	    if(index === -1) {
	      return -1;
		}
	    if(textToFind.length === 1) {
	    	if(index===curpos){
				return -1;
			}
	      this.updateDisplay(index,maxPos);
	      return index;
	    }
	    var maxEntry = _RdfDataSourceOrigin.getEntriesCount();
	    if(index+maxPos > maxEntry){
			index = maxEntry-maxPos-1;
		}
	    var result = _RdfDataSourceOrigin.getEntryByText(textToFind, maxPos, index);
	    colFoundArray = result[0];
	    if(colFoundArray.length === 0){
	      return -1;
		}
	    this.removeAllDisplay();
      for(var currItem=0;currItem<colFoundArray.length;currItem++) {
        this.addEntryDisplay(colFoundArray[currItem], currItem);
      }
      $("#ximfmail.treedialog").attr("hidevscroll","true");
	    return result[1];
    };
    //
    DialogTreeRDFClass.prototype.getMaxEntry = function() {
      var remoteCount = 0;
      remoteCount = _RdfDataSourceOrigin.getEntriesCount();
      return remoteCount;
    };
    // object initialisation
    DialogTreeRDFClass.initialized = true;
  }
}