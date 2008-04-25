package org.milimail.messageRemoteServiceAPI.init;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.apache.commons.io.FileUtils;

public class IORFinder {

	public IORFinder() {
		
		
	}
	
	@SuppressWarnings("unchecked")
	public static String getIOR(String service) throws IOException{
		
		String filename = System.getProperty("user.home") + 
        System.getProperty("file.separator") + ".milimail" + System.getProperty("file.separator") +
        service + ".ior";
    	
		File file = new File(filename);
		
		List<String> lines = FileUtils.readLines(file);
    		
		return lines.get(0);
	}
}
