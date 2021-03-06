/* ***** BEGIN LICENSE BLOCK *****
 * Version: NPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Netscape Public License
 * Version 1.1 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.mozilla.org/NPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is BT Global Services / Etat francais Ministere de la Defense
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *  Olivier PARNIERE <olivier.parniere_AT_gmail.com> <olivier.parniere_AT_bt.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the NPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the NPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
#ifndef MESSAGEBROWSESERVICE_I_H_
#define MESSAGEBROWSESERVICE_I_H_

#include "nsIServiceManager.h"
#include "Services.h"
#include "nsString.h"
/*!
 * Corba MessageBrowseServicePOA Implementation
 */
class MessageBrowseService_i : public POA_MessageBrowseService
{
public:
	MessageBrowseService_i();
	virtual ~MessageBrowseService_i();

	virtual void GetMessageHdrs(const CFolder& p_folder, CMessageHdrs_out p_messageHdrs);
	/*!
	 * This method is used to get all children folders
	 * \param p_rootFolder the father folder
	 * \param p_folders this children folders found
	 */
	virtual void GetAllFolders(const CFolder& p_rootFolder, CFolders_out p_folders);

	/*!
	 *  This method is used to get the Inbox folder of the current profile.
	 *  \param p_localFolder is the holder which is the local folder found)
	 */
	virtual void GetRootFolder(const CAccount& p_account, CFolder_out p_rootFolder);

	/*!
	 * This method is used to get raw source content for a MessageHandler
	 * \param p_messageHdr the handler
	 * \param p_sourceListener the Listener which is called by thunderbird with content
	 */
	virtual void GetSource(const CMessageHdr& p_messageHdr, SourceListener_ptr p_sourceListener);

	/*!
	 * This method is used to get decrypted source content for a MessageHandler
	 * \param p_messageHdr the handler
	 * \param p_sourceListener the Listener which is called by thunderbird with content
	 */
	virtual void GetDecryptedSource(const CMessageHdr& p_messageHdr, SourceListener_ptr p_sourceListener);

	/*!
	 * This is used to force Thunderbird to fetch new messages from the server
	 * It can be used if the option Imap Idle is disabled
	 * \param p_Folder is the folder to fetch
	 */
	virtual void GetNewMessages(const CFolder& p_Folder);

	/*!
	*  This method is used to get the Local folder of the current profile.
	*  \param p_localFolder is the holder which is the local folder found)
	*/
	virtual void GetLocalFolder(CFolder_out p_localFolder);
private:

	virtual void Adapt(const char * recipients, Addresses& addresses);
};

#endif /*MESSAGEBROWSESERVICE_I_H_*/
