

function readOnline(mail) {
	var key = mail.messageKey;

	var uri = mail.folder.generateMessageURI(key);

	var messenger = Components.classes['@mozilla.org/messenger;1']
			.createInstance();

	messenger = messenger.QueryInterface(Components.interfaces.nsIMessenger);
	var messageService = messenger.messageServiceFromURI(uri);

	var aurl = new Object();
	messageService.CopyMessage(uri, myStreamListener, false, null, msgWindow,
			aurl);
}

var notificationsProcessor = {

	process : function(message) {

		var isMDNDisplayed = this.isMDNDisplayed(message);

		var originalID;

		if (isMDNDisplayed) {
			originalID = this.getOriginalID(message);
			dump("Notifications Display Extension (messengerOverlay.js) Notification From Original Message ID : "
					+ originalID + " \n");
		}

		dump("Notifications Display Extension (messengerOverlay.js) Message is MDN Displayed Type : "
				+ isMDNDisplayed + " \n");

		if (isMDNDisplayed) {
			this.tagOriginalMessage(originalID);
		}

	},

	tagOriginalMessage : function(originalID) {
		if (gDBView) {

			dump("Notifications Display Extension (messengerOverlay.js) Tag Original Message Begin\n");

			hdr = this.findMsgHdr(originalID);
            
			if (hdr == null) {
				dump("Notifications Display Extension (messengerOverlay.js) Original Message Not Found ID = "
						+ originalID + "\n");
			}

			var author = hdr.author;
			dump("Notifications Display Extension (messengerOverlay.js) Original Found, its author is : "
					+ author + " \n");
			
            hdr.setProperty(MSG_MDN_PROPERTY_BOOL_DISPLAYED, true);
            dump("Notifications Display Extension (messengerOverlay.js) Tag Original Message End\n");
		}

	},

	findMsgHdr : function(originalID) {
		var hdr;
		var RDF = Components.classes['@mozilla.org/rdf/rdf-service;1']
				.getService();
		RDF = RDF.QueryInterface(Components.interfaces.nsIRDFService);
		var sentboxArray = this.listAllSentBox();

		//loop over all Sent Box
		for (var index = 0;index < sentboxArray.length; index++) {
			var folderRessource = RDF.GetResource(sentboxArray[index]);
			var folder = folderRessource
					.QueryInterface(Components.interfaces.nsIMsgFolder);

			var db = folder.getMsgDatabase(null);
			//folder.ForceDBClosed();
			// db.Close(true);
			//folder.startFolderLoading();
			//folder.updateFolder(null);
			// folder.ForceDBClosed();

			var hdr = db.getMsgHdrForMessageID(originalID);

			//Header found, do not need to continue
			if (hdr != null)
				return hdr;

		}

		return hdr;

	},

	updateAllSentBox : function() {

		var RDF = Components.classes['@mozilla.org/rdf/rdf-service;1']
				.getService();
		RDF = RDF.QueryInterface(Components.interfaces.nsIRDFService);
		var sentboxArray = notificationsProcessor.listAllSentBox();

		//loop over all Sent Box
		for (var index = 0;index < sentboxArray.length; index++) {
			var folderRessource = RDF.GetResource(sentboxArray[index]);
			var folder = folderRessource
					.QueryInterface(Components.interfaces.nsIMsgFolder);

			folder.startFolderLoading();
			folder.updateFolder(null);

		}

	},
	isMDNDisplayed : function(message) {
		if (message.toString().match(NOTIFICATION_MDN_DISPLAYED) != null)
			return true;
		else
			return false;
	},

	getOriginalID : function(message) {
		var pattern = /Original-Message-ID: <([\w@\.]*)>/m;
		var result = message.match(pattern);

		if (result.length == 2)
			return result[1];
		else
			return "";
	},

	listAllSentBox : function() {
		var idArray = new Array();
		var msgAccountManager = Components.classes["@mozilla.org/messenger/account-manager;1"]
				.getService(Components.interfaces.nsIMsgAccountManager);
		var identities = msgAccountManager.allIdentities;

		for (var i = 0;i < identities.Count(); i++) {
			var id = identities.QueryElementAt(i,
					Components.interfaces.nsIMsgIdentity);
			idArray.push(id.fccFolder);
		}
		return idArray;
	}
};

var myStreamListener = {
	bodyAndHdr : "",
	onDataAvailable : function(request, context, inputStream, offset, count) {

		this.bodyAndHdr = "";

		try {
			var sis = Components.classes["@mozilla.org/scriptableinputstream;1"]
					.createInstance(Components.interfaces.nsIScriptableInputStream);
			sis.init(inputStream);
			this.bodyAndHdr += sis.read(count);
		} catch (ex) {
			alert("exception caught: " + ex.message + "\n");
		}
	},

	onStartRequest : function(request, context) {
	},

	onStopRequest : function(aRequest, aContext, aStatusCode) {
		dump("Notifications Display Extension (messengerOverlay.js) Message Content is : \n"
				+ this.bodyAndHdr + "\n");
		notificationsProcessor.process(this.bodyAndHdr);
	}
};

var incomeMsgManager = {

	folderListener : {

		itemAdded : function(item) {
			dump("Notifications Display Extension (messengerOverlay.js) Item Added : OK\n");
            
            dump("Notifications Display Extension (messengerOverlay.js) Update All Sent Box\n")
            notificationsProcessor.updateAllSentBox();
            
			var hdr;

			try {
				hdr = item.QueryInterface(Components.interfaces.nsIMsgDBHdr);
			} catch (ex) {
				// This could happen if item is a folder instead of a message
				return;
			}

			dump("Notifications Display Extension (messengerOverlay.js) Message received from : "
					+ hdr.author + "\n");
			dump("Notifications Display Extension (messengerOverlay.js) Message received id : "
					+ hdr.messageId + "\n");

			readOnline(item);
		},

		itemDeleted : function(aMove, aSrcItems, aDestFolder) {
		},
		itemMoveCopyCompleted : function(item, property, oldValue, newValue) {
		},
		folderRenamed : function(aOrigFolder, aNewFolder) {
		}
	}
};

dump("Notifications Display Extension (messengerOverlay.js) Loading : OK\n");

// add folder listener
var notificationService = Components.classes["@mozilla.org/messenger/msgnotificationservice;1"]
		.getService(Components.interfaces.nsIMsgFolderNotificationService);
notificationService.addListener(incomeMsgManager.folderListener);
