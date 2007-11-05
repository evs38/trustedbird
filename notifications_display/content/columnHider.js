


 //Folder Listener called by any action on folder 
  var folderListener = {
    OnItemAdded: 					function(parentItem, item) {},
    OnItemBoolPropertyChanged:		function(item, property, oldValue, newValue) {},
    OnItemEvent:					function(folder, event)
    {
      if (folder.server == "undefined")
      	return;
      
      //IMAP type check  
      var serverName= folder.name;
      if (serverName == "Sent")
      {
        document.getElementById("MDN").setAttribute("hidden", false);
      
      } else
        document.getElementById("MDN").setAttribute("hidden", true);
       
    },
    OnItemIntPropertyChanged:		function(item, property, oldValue, newValue) {},
    OnItemPropertyChanged:			function(item, property, oldValue, newValue) {},
    OnItemPropertyFlagChanged:		function(item, property, oldFlag, newFlag) {},
    OnItemRemoved:					function(parentItem, item) {},
    OnItemUnicharPropertyChanged:	function(item, property, oldValue, newValue) {}
  };

// add folder listener
    var mailSession = Components.classes["@mozilla.org/messenger/services/session;1"].getService(Components.interfaces.nsIMsgMailSession);
    mailSession.AddFolderListener(this.folderListener, Components.interfaces.nsIFolderListener.all);