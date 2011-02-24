<?xml version="1.0" encoding="UTF-8"?>

<!-- ***** BEGIN LICENSE BLOCK *****
   - Copyright (c) 2008-2009 EADS DEFENCE AND SECURITY - All rights reserved.
   - ximfmail is under the triple license  MPL 1.1/GPL 2.0/LGPL 2.1.
   - 
   -
   - Redistribution and use, in source and binary forms, with or without modification, 
   - are permitted provided that the following conditons are met :
   -
   - 1. Redistributions of source code must retain the above copyright notice, 
   - 2. MPL 1.1/GPL 2.0/LGPL 2.1. license agreements must be attached 
   -    in the redistribution of the source code.
   - 3. Neither the names of the copyright holders nor the names of any contributors 
   -    may be used to endorse or promote products derived from this software without specific 
   -    prior written permission from EADS Defence and Security.
   - 
   - Alternatively, the contents of this file may be used under the terms of
   - either of the GNU General Public License Version 2 or later (the "GPL"),
   - or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
   - in which case the provisions of the GPL or the LGPL are applicable instead
   - of those above. If you wish to allow use of your version of this file only
   - under the terms of either the GPL or the LGPL, and not to allow others to
   - use your version of this file under the terms of the MPL, indicate your
   - decision by deleting the provisions above and replace them with the notice
   - and other provisions required by the GPL or the LGPL. If you do not delete
   - the provisions above, a recipient may use your version of this file under
   - the terms of any one of the MPL, the GPL or the LGPL.
   - 
   - REMINDER  :
   - THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
   - ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
   - WARRANTIES OF MERCHANTABILITY AND FITNESS FOR  A PARTICULAR PURPOSE ARE DISCLAIMED. 
   - IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
   - INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES 
   - (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
   - LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, 
   - WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
   - IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
   -  
   - EADS Defence and Security - 1 Boulevard Jean Moulin -  
   - ZAC de la Clef Saint Pierre - 78990 Elancourt - FRANCE (IDDN.FR.001.480012.002.S.P.2008.000.10000) 
   - ***** END LICENSE BLOCK ***** -->
<xsl:stylesheet version="2.0"
	xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:ximf="http://eads.org/ximf/">
	<xsl:output method="xml" encoding="UTF-8" indent="yes" version="1.0" />	
	<xsl:template match="/">		
		<xsl:for-each select="/ximf:instance/ximf:rule/ximf:securityLabel">		
			<securityLabel id="{generate-id(.)}">											
					<xsl:for-each select="ximf:aliasHeader">						
						<xsl:choose>
							<xsl:when test="@headerName='SecurityPolicyIdentifier'">
									<securityPolicyIdentifier value="" label=""/>
							</xsl:when>
							<xsl:when test="@headerName='SecurityClassification'">
									<securityClassification valueDisplayed="true">
										<item value="0" label="unmarked" />
										<item value="1" label="unclassified" />
										<item value="2" label="restricted" />
										<item value="3" label="confidential" />
										<item value="4" label="secret" />
										<item value="5" label="top-secret" />
									</securityClassification>
							</xsl:when>
							<xsl:when test="@headerName='ESSPrivacyMark'">
									<privacyMark freetext="true">
										<item value="" label=""/>
									</privacyMark>
							</xsl:when>
							<xsl:when test="@headerName='SecurityCategory'" >
									<securityCategories type="{@type}">
										<!-- <item oid="" type=""  value="" label=""/>  -->
									</securityCategories>
							</xsl:when>						
							<xsl:otherwise/>
						</xsl:choose>			
					</xsl:for-each>					
			</securityLabel>
		</xsl:for-each>
	</xsl:template>
</xsl:stylesheet>