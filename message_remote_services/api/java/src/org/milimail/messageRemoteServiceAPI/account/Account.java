package org.milimail.messageRemoteServiceAPI.account;


public class Account {

	org.milimail.messageRemoteServiceAPI.stubs.Account account;

	public String getKey() {
		return account.key;
	}

	public void setKey(String key) {
		if (key == null)
			return;
		 account.key = key;
	}

	public String getServerHostName() {
		return account.serverHostName;
	}

	public void setServerHostName(String serverHostName) {
		if (serverHostName == null)
			return;
		account.serverHostName = serverHostName;
	}

	public Account(org.milimail.messageRemoteServiceAPI.stubs.Account account) {
		this.account = account;
	}

	public Account() {
		account = new org.milimail.messageRemoteServiceAPI.stubs.Account();
		account.key = "";
		account.serverHostName = "";
	}
}
