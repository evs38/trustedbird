package org.milimail.messageRemoteServiceAPI.compose;

public class Security {
	boolean isSigned;
	boolean isCrypted;
	
	public Security() {
		isSigned = false;
		isCrypted = false;
	}
	
	public boolean isSigned() {
		return isSigned;
	}
	public void setSigned(boolean isSigned) {
		this.isSigned = isSigned;
	}
	public boolean isCrypted() {
		return isCrypted;
	}
	public void setCrypted(boolean isCrypted) {
		this.isCrypted = isCrypted;
	}
}
