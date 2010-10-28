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
	<xsl:output method="xml" encoding="UTF-8" indent="yes" version="1.0"
		doctype-system="chrome://ximfmail/locale/ximfmail.dtd" />

	<xsl:param name="gLang">us</xsl:param>
	<xsl:param name="gIdSeparator">&#183;</xsl:param> <!-- unicode of middle dot  -->

	<!-- MAIN FUNCTION  -->
	<xsl:template match="/">		
		<xsl:choose>
			<xsl:when test="/ximf:instance/ximf:ihm">
				<xsl:call-template name="CustomizedIhm" />				
			</xsl:when>
			<xsl:otherwise>
				<xsl:call-template name="DefaultIhm" />
			</xsl:otherwise>			
		</xsl:choose>
		
	</xsl:template>

	<!-- DEFAULT PANEL  -->
	<xsl:template name="DefaultIhm">
		<tabs>
			<tab id="tabdefaultheaders" label="Headers" />
			<tab id="tabpanelinformations" label="Informations" />
		</tabs>
		<tabpanels id="instanceXimfmail">
			<xsl:for-each select="ximf:instance">
				<tabpanel id="defaultheaders">
					<grid>
						<columns>
							<column id="id_col1_{@id}" />
							<column id="id_col2_{@id}" />
							<column id="id_col3_{@id}" />
							<column id="id_col4_{@id}" />					
						</columns>
						<rows id="id_rows_{@id}">							
							<xsl:for-each select="ximf:header">							
								<xsl:call-template	name="InsertRow">
									<xsl:with-param	name="headerRef" select="@id" />
								</xsl:call-template>													 
							</xsl:for-each>
						</rows>
					</grid>
					<xsl:call-template name="AddHeadersHidden" />		
				</tabpanel>
				<tabpanel id="panelinformations">
					<grid>
						<columns>
							<column id="_col1" />
							<column id="_col2" />
						</columns>
						<rows>					
							<row>
								<label value="Instance identifier  : " />
								<label value="{@id}" style="color:blue; font-weight:bold;" />
							</row>
							<row>
								<label value="Instance version : " />
								<label value="{@version}" style="color:blue; font-weight:bold;" />
							</row>
							<row>
								<label value="XIMF schema version : " />
								<label value="{@ximfVersion}" style="color:blue; font-weight:bold;" />
							</row>
						</rows>
					</grid>
				</tabpanel>
			</xsl:for-each>
		</tabpanels>	
		
	</xsl:template>

	<!-- CUSTOM IHM -->
	<xsl:template name="CustomizedIhm">
		<tabs>
			<xsl:for-each select="/ximf:instance/ximf:ihm/ximf:panel">
				<xsl:element name="tab" id="tab{@id}" accesskey="*">	
					<xsl:attribute name="id">
						<xsl:value-of select="concat('tab',@id)"/>	
					</xsl:attribute>				
					<xsl:attribute name="label">
   						<xsl:call-template name="getInternational">
            				<xsl:with-param name="ilk" select="@ilk" />            					
        				</xsl:call-template> 
        			</xsl:attribute>
				</xsl:element>
			</xsl:for-each>
		</tabs>
		<tabpanels flex="1">
			<xsl:for-each select="/ximf:instance/ximf:ihm/ximf:panel">				
				<tabpanel id="{@id}" class="ximfpane" flex="1">
					<xsl:for-each select="*">
						<xsl:choose>
							<xsl:when test="name()='ximf:groupbox'">
								<groupbox flex="1">
									<xsl:element name="caption">
										<xsl:attribute name="label"> 
										<xsl:call-template	name="getInternational">
            								<xsl:with-param name="ilk"	select="@ilk" />            					
        								</xsl:call-template> 
        								</xsl:attribute>
									</xsl:element>
									<xsl:call-template	name="CreateGrid">
										<xsl:with-param	 name="headerSeq" select="." />
									</xsl:call-template>									
								</groupbox>
							</xsl:when>
							<xsl:when test="name()='ximf:grid'">
								<xsl:call-template	name="CreateGrid">
									<xsl:with-param	 name="headerSeq" select="." />
								</xsl:call-template>
							</xsl:when>							
							<xsl:otherwise/>
						</xsl:choose>
					</xsl:for-each>
					<!-- no container defined : create grid-->
					<vbox flex="1">
						<grid flex="1">
							<columns>
								<column id="id_col1_{@id}" />
								<column id="id_col2_{@id}" flex="1"/>
								<column id="id_col3_{@id}" />
								<column id="id_col4_{@id}" />					
							</columns>
							<rows id="id_rows_{@id}">
								<xsl:for-each select="ximf:headerRef">
									<xsl:call-template	name="InsertRow">
										<xsl:with-param	name="headerRef" select="." />
									</xsl:call-template>
								</xsl:for-each>
							</rows>
						</grid >							
					</vbox>		
					<xsl:if test="position()=1">
						<xsl:call-template name="AddHeadersHidden" />						
					</xsl:if>											
				</tabpanel>
			</xsl:for-each>
		</tabpanels>			
	</xsl:template>
	
	<!-- ****************************************************** -->
	<!-- template to append headers ximf without ihm definition -->
	<xsl:template name="AddHeadersHidden">
		<vbox hidden="true">		
			<xsl:for-each select="/ximf:instance/ximf:header">
				<xsl:choose>		
						<xsl:when test="string-length(@ilk) > 0">
						</xsl:when>
						<xsl:otherwise>					
							<xsl:element name="label">								
								<xsl:attribute name="class">ximfHiddenHeader</xsl:attribute>
								<xsl:attribute name="ximfheader"><xsl:value-of select="@headerName" /></xsl:attribute>
								<xsl:attribute name="ximfvalue"><xsl:value-of select="./ximf:string/@content" /></xsl:attribute>		
							</xsl:element>						
						</xsl:otherwise>			
				</xsl:choose>	
			</xsl:for-each>
		</vbox>
	</xsl:template>
	
	
	<!-- **************************** -->
	<!-- template to create grid ximf -->
	<xsl:template name="CreateGrid">
		<xsl:param name="headerSeq" select="" />
			<grid flex="1" >
				<columns>
					<column id="id_col1_{$headerSeq/@id}" />
					<column id="id_col2_{$headerSeq/@id}" flex="1"/>
					<column id="id_col3_{$headerSeq/@id}" />
					<column id="id_col4_{$headerSeq/@id}" />					
				</columns>
				<rows id="id_rows_{$headerSeq/@id}" >
					<xsl:for-each select="$headerSeq/ximf:headerRef">
						<xsl:call-template	name="InsertRow">
							<xsl:with-param	name="headerRef" select="." />
						</xsl:call-template>
					</xsl:for-each>
				</rows>
			</grid>
	</xsl:template>
	
	<!-- ************************************* -->
	<!-- template to create id of Popup element-->
	<xsl:template name="GetPopupId">
		<xsl:param name="_refNode"/>
        <xsl:param name="_refHeader"/>
        <xsl:choose>
        <xsl:when test="string-length(@id) &lt;= 0">
			<xsl:value-of select="concat($_refHeader,$gIdSeparator,'ximfmailPopup')"/>
		</xsl:when>
		<xsl:otherwise>							
		 	<xsl:value-of select="@id"/>		
		</xsl:otherwise>
		</xsl:choose>
	 </xsl:template>	 
	
	<!--************************************************** -->
	<!-- template to row in grid with ximf header elements -->
	<xsl:template name="InsertRow">
		<xsl:param name="headerRef" select="" />
		<xsl:for-each	select="/ximf:instance/ximf:header[$headerRef=@id]">
			<!-- <xsl:variable name="_headerId" select="@id" />-->
			 <xsl:variable name="_headerId">
				<xsl:call-template name="GetUNID">									
					<xsl:with-param name="_refNode" select="."/>								
				</xsl:call-template>
			</xsl:variable>
			<row align="center" flex="1">
			
			<!-- Header name label  -->
			<xsl:variable name="_ilkLabel">
				<xsl:call-template name='getInternational'>
            		<xsl:with-param name='ilk' select='@ilk' />            					
        		</xsl:call-template>
			</xsl:variable>
			<xsl:element name="label">
				<xsl:attribute name="id"><xsl:value-of select="$_headerId"/></xsl:attribute>
				<xsl:attribute name="class">ximfHeaderLabel</xsl:attribute>
				<xsl:attribute name="value">   					
        			<xsl:value-of select="concat($_ilkLabel,' : ')"/>
        		</xsl:attribute>
				<xsl:attribute name="ximfheader"><xsl:value-of select="@headerName" /></xsl:attribute>
				<xsl:if test="string-length(@technicalHeaderName)>0">
					<xsl:attribute name="ximftecheader"><xsl:value-of select="@technicalHeaderName" /></xsl:attribute>
				</xsl:if>
				<xsl:if test="string-length(@isMandatory)>0">
					<xsl:attribute name="ximfmandatory"><xsl:value-of select="@isMandatory" /></xsl:attribute>
				</xsl:if>
			</xsl:element>
				
			<!-- count how many set or multiset -->
			<xsl:variable name="_counterset" select="count(./ximf:set)"/>
			<xsl:variable name="_countermultiset" select="count(./ximf:multiset)"/>
					
			<!-- variables of IDs -->
			<xsl:variable name="idBox" select="concat($_headerId,$gIdSeparator,'ximfvalue')"/>			
									
			<!-- Value field elements -->		
			<xsl:for-each select="*">
				<xsl:variable name="_idBox" select="concat($_headerId,$gIdSeparator,'ximfmailtextbox')"/>
				<xsl:variable name="_idPopupSet">							
            		<xsl:call-template name="GetUNID">									
						<xsl:with-param name="_refNode" select="."/>								
					</xsl:call-template>
				</xsl:variable>
				<xsl:choose>		
					<xsl:when test="name()='ximf:string'">						
						<xsl:if test="@editable='true'">
							<xsl:call-template name="CreateXimfmailTextbox">
            					<xsl:with-param name="_refNode" select="." />
            					<xsl:with-param name="_refHeader" select="$_headerId" />
            					<xsl:with-param name="_refBox" select="$_idBox" /> 
            					<xsl:with-param name="_refPopupBox" select="$_idPopupSet"/>          							
            				</xsl:call-template>
            				<popup id="{$_idPopupSet}" ximfreftextbox="{$_idBox}" position="after_start" ignorekeys="true" >
							<xsl:call-template name="CreateInputBox">								
								<xsl:with-param name="_refPopupBox" select="$_idPopupSet"/>
								<xsl:with-param name="_refBox" select="$_idBox"/>
								<xsl:with-param name="_refHeader" select="$_headerId" />								
							</xsl:call-template>
							</popup>
         				</xsl:if>         				
         			</xsl:when>					
					<xsl:when test="name()='ximf:set' or name()='ximf:multiset' or name()='ximf:compstring'">
						<!-- if multiple set, just create 1 textbox -->
						<xsl:if test="position()=1"> 
							<xsl:choose>
								<!-- if multiple set, no default context popupset -->
								<xsl:when test="$_counterset > 1 or $_countermultiset > 1">									
									<xsl:call-template name="CreateXimfmailTextbox">
            							<xsl:with-param name="_refNode" select="." />
            							<xsl:with-param name="_refHeader" select="$_headerId" />
            							<xsl:with-param name="_refBox" select="$_idBox" />            							
            						</xsl:call-template>
								</xsl:when>
								<xsl:otherwise>									
									<xsl:call-template name="CreateXimfmailTextbox">
            							<xsl:with-param name="_refNode" select="." />
            							<xsl:with-param name="_refHeader" select="$_headerId" />
            							<xsl:with-param name="_refBox" select="$_idBox" />
            							<xsl:with-param name="_refPopupBox" select="$_idPopupSet" />
            						</xsl:call-template>
								</xsl:otherwise>
							</xsl:choose>
            			</xsl:if>
					
						<!-- Create panel element set/multiset -->
						<xsl:if test="name()='ximf:set' or name()='ximf:multiset'">							
							<panel id="{$_idPopupSet}" ximfreftextbox="{$_idBox}" ximfmaxitem="1">								
								<xsl:if test="@maxItem">
									<xsl:attribute name="ximfmaxitem"><xsl:value-of select="@maxItem" /></xsl:attribute>
								</xsl:if>								
								<xsl:if test="@ximfdefault">
	        						<xsl:attribute name="ximfdefault"><xsl:value-of select="@ximfdefault" /></xsl:attribute>
	        					</xsl:if>
								<xsl:if test="@ximfdefault">
	        						<xsl:attribute name="ximfdefault"><xsl:value-of select="@ximfdefault" /></xsl:attribute>
	        					</xsl:if>
								<xsl:call-template name="GetFacetsAttribute">
									<xsl:with-param name="_refNode" select="." />
								</xsl:call-template>
								<xsl:call-template name="GetXimfProperties">
		            					<xsl:with-param name="_refNode" select="." />
            							<xsl:with-param name="_refHeader" select="$_headerId" />
            							<xsl:with-param name="_refBox" select="$_idBox" />            							            							            					
		        					</xsl:call-template>
		        				<arrowscrollbox orient="vertical" style="max-height:400px;">	
		        				<richlistbox>										            			           			
	            					<xsl:call-template name="AddSetAndMultisetPanel">
	            						<xsl:with-param name="_refNode" select="." />
	            						<xsl:with-param name="_refHeader" select="$_headerId" />
	            						<xsl:with-param name="_refBox" select="$_idBox" />
	            						<xsl:with-param name="_refPopupBox" select="$_idPopupSet" />
	            						<xsl:with-param name="_positionPopup" select="'after_start'" />
	            					</xsl:call-template>
            					</richlistbox>
            					</arrowscrollbox>
            				</panel>
						</xsl:if>
						
            			<!-- Create Popupset compstring -->
            			<xsl:if test="name()='ximf:compstring'">
							<popup id="{$_idPopupSet}"  ximfreftextbox="{$_idBox}" position="after_start" ignorekeys="true">
								<xsl:call-template name="GetFacetsAttribute">
									<xsl:with-param name="_refNode" select="." />
								</xsl:call-template>
								<xsl:call-template name="CreateMenu">
									<xsl:with-param name="_refNode" select="*"/>
									<xsl:with-param name="_refHeader" select="$_headerId" />
            						<xsl:with-param name="_refBox" select="$_idBox" />
            						<xsl:with-param name="_refPopupBox" select="$_idPopupSet" />    											
								</xsl:call-template>
							</popup>
						</xsl:if>
					</xsl:when>
					<xsl:otherwise/>				
			</xsl:choose>
			</xsl:for-each>									
			</row>
		</xsl:for-each>
	</xsl:template>
		
	<!-- ***************************** -->
	<!-- add fascets attributes of ximf schema -->
	<xsl:template name="GetFacetsAttribute">
		<xsl:param name="_refNode" />
		<xsl:if test="@separator">
			<xsl:attribute name="ximfseparator"><xsl:value-of select="@separator"/></xsl:attribute>
		</xsl:if>
		<xsl:if test="@technicalSeparator">
			<xsl:attribute name="ximftecseparator"><xsl:value-of select="@technicalSeparator"/></xsl:attribute>
		</xsl:if>		
	</xsl:template>	
	
	<!-- *********************************** -->	
	<!-- Create IHM elements of Ximfmail row -->
	<xsl:template name="CreateXimfmailTextbox">	
		<xsl:param name="_refNode"/>
        <xsl:param name="_refHeader"/>
        <xsl:param name="_refBox"/>
        <xsl:param name="_refPopupBox"/>	
		
		<xsl:variable name="idContextBox" select="concat($_refHeader,$gIdSeparator,'ximfmailTextboxContext')"/>		
		<xsl:choose>
			<xsl:when test="/ximf:instance/ximf:header[@id=$_refHeader][@type='date']">				
				<textbox flex="1" id="{$_refBox}" refheader="{$_refHeader}" class="ximfDatetime" context="{$idContextBox}" readonly="false">
					<button class="ximfmailButtonTxt ximfDatepicker" refBox="{$_refBox}"/>					
				</textbox>								
				<xsl:call-template name="AppendToolButtons">
					<xsl:with-param name="refBox" select="$_refBox"/>							
				</xsl:call-template>		
			</xsl:when>
			<xsl:when test="/ximf:instance/ximf:header[@id=$_refHeader][@type='address']">	
				<ximfaddress id="{$_refBox}" refheader="{$_refHeader}" />				
			</xsl:when>
			<xsl:otherwise>
				<textbox flex="1" id="{$_refBox}" refheader="{$_refHeader}" class="XimfTextboxDisplay" context="{$idContextBox}" refpanel="{$_refPopupBox}"  readonly="false">
					<xsl:if test="string-length($_refNode/@maxItem) > 0">
						<xsl:attribute name="ximfmaxitems"><xsl:value-of select="$_refNode/@maxItem"/></xsl:attribute>
					</xsl:if>
					<xsl:if test="string-length($_refNode/@separator) > 0">
						<xsl:attribute name="ximfseparator"><xsl:value-of select="$_refNode/@separator"/></xsl:attribute>
					</xsl:if>	
					<button class="ximfmailButtonTxt ximfPopup" refpanel="{$_refPopupBox}"/>		
				</textbox>
				<!-- Eraser image -->
				<xsl:call-template name="AppendToolButtons">
					<xsl:with-param name="refBox" select="$_refBox"/>							
				</xsl:call-template>
			</xsl:otherwise>
		</xsl:choose>						
		<!-- Context popupset -->
		<xsl:call-template name="CreateContext">
			<xsl:with-param name="refBox" select="$_refBox"/>
			<xsl:with-param name="idContext" select="$idContextBox"/>
		</xsl:call-template>
	</xsl:template>
	
	<!-- **************************** -->
	<!-- construct or get ID for node -->	
	<xsl:template name="GetUNID">
		<xsl:param name="_refNode"/>
		<xsl:choose>
			<xsl:when test="string-length($_refNode/@id)>0">
				<xsl:value-of select="$_refNode/@id" />		
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat(generate-id($_refNode/ancestor::ximf:header),$gIdSeparator,generate-id($_refNode),$gIdSeparator,position())" />		
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<!-- ************************************** -->
	<!-- create attributes with Ximf properties -->	
	<xsl:template name="GetXimfProperties">
		<xsl:param name="_refNode"/>
        <xsl:param name="_refHeader"/>
		<xsl:param name="_refBox"/>
		<xsl:param name="_refPopupBox"/>
		
		<xsl:for-each select="$_refNode">
			<xsl:if test="$_refHeader">
				<xsl:attribute name="ximfrefheader"><xsl:value-of select="$_refHeader"/></xsl:attribute>
			</xsl:if>
			<xsl:if test="$_refBox">
				<xsl:attribute name="ximfreftextbox"><xsl:value-of select="$_refBox"/></xsl:attribute>
			</xsl:if>
			<xsl:if test=".[@maxLength]">
				<xsl:attribute name="ximfmaxlength"><xsl:value-of select="@maxLength"/></xsl:attribute>
			</xsl:if>
			<xsl:if test=".[@minLength]">   
				<xsl:attribute name="ximfminlength"><xsl:value-of select="@minLength"/></xsl:attribute>
			</xsl:if>
			<xsl:if test=".[@maxItem]">
				<xsl:attribute name="ximfmaxitem"><xsl:value-of select="@maxItem"/></xsl:attribute>
			</xsl:if>
			<xsl:if test=".[@minItem]">
				<xsl:attribute name="ximfminitem"><xsl:value-of select="@minItem"/></xsl:attribute>
			</xsl:if>
			<xsl:if test=".[@separator]">
				<xsl:attribute name="ximfseparator"><xsl:value-of select="@separator"/></xsl:attribute>
			</xsl:if>
			<xsl:if test=".[@technicalSeparator]">
				<xsl:attribute name="ximftecseparator"><xsl:value-of select="@technicalSeparator"/></xsl:attribute>
			</xsl:if>
						
		</xsl:for-each>
	</xsl:template>
	
	
	<!-- ******************************** -->	
	<!-- Manage set and multiset elements -->
	<xsl:template name="AddSetAndMultisetPanel">
		<xsl:param name="_refNode"/>
        <xsl:param name="_refHeader"/>
        <xsl:param name="_refBox"/>
        <xsl:param name="_refPopupBox"/>
        <xsl:param name="_positionPopup" />
        <xsl:param name="_refConcat" />
        		
		<!-- <xsl:for-each select="$_setType[$refNode=@id]"> -->
		<xsl:for-each select="$_refNode">
			<xsl:variable name="_setType" select="name()"/>							 
			<xsl:choose>
				<!-- Reference to another set/multiset -->
				<xsl:when test="string-length(@ref)>0">
			 		<xsl:variable name="_refHead" select="@ref"/>			 				
					 <xsl:choose>
						<xsl:when test="count(//*[@id=$_refHead])>0">		
							<xsl:for-each select="//*[@id=$_refHead]">
								<xsl:call-template name="AddSetAndMultisetPanel">
		            				<xsl:with-param name="_refNode" select="." />
            						<xsl:with-param name="_refHeader" select="$_refHeader" />
            						<xsl:with-param name="_refBox" select="$_refBox" />
            						<xsl:with-param name="_refPopupBox" select="$_refPopupBox" />
            						<xsl:with-param name="_positionPopup" select="'after_start'" />   
            						<xsl:with-param name="_refConcat" select="$_refConcat"/>            					
		        				</xsl:call-template>
							</xsl:for-each>					
						</xsl:when>
						<xsl:otherwise>	
							<xsl:call-template name="ManageExternalDatas">
								<xsl:with-param name="_refBox" select="$_refBox" />
								<xsl:with-param name="_refExternal" select="$_refHead"/>			 
							</xsl:call-template>												
						</xsl:otherwise>
					</xsl:choose>				
				</xsl:when> 
				<!-- can select more than one item -->
				<xsl:when test=" number(@maxItem) > 1" >
					<xsl:choose>
						<xsl:when test="$_setType='ximf:set' and ./*[name()='ximf:string']" >
							<xsl:for-each select="*">
								<xsl:if test="name()='ximf:string'">
									<xsl:call-template name="CreateCheckItem">										
			       						<xsl:with-param name="_refString" select="." />  
			       						<xsl:with-param name="_refHeader" select="$_refHeader" />
			       						<xsl:with-param name="_refBox" select="$_refBox" />
			       						<xsl:with-param name="_setType" select="$_setType"/>
			       						<xsl:with-param name="_refConcat" select="$_refConcat"/>          										            					
			    					</xsl:call-template>
			    				</xsl:if>
			    				<xsl:if test="name()='ximf:compstring'">
			    					<xsl:call-template name="CreateMenu">										
			       					<xsl:with-param name="_refNode" select="."/>
									<xsl:with-param name="_refHeader" select="$_refHeader" />
				        			<xsl:with-param name="_refBox" select="$_refBox" />
		            				<xsl:with-param name="_refPopupBox" select="$_refPopupBox" />
		            				<xsl:with-param name="_refConcat" select="$_refConcat"/>           										            					
			    					</xsl:call-template>
			    				</xsl:if>
			    			</xsl:for-each>													
						</xsl:when>
						<xsl:when test="$_setType='ximf:multiset' and ./*[name()='ximf:string']" >
							<xsl:for-each select="*">
									<xsl:if test="name()='ximf:string'">
										<xsl:call-template name="CreateButtonItem">										
			       							<xsl:with-param name="_refString" select="." />  
			       							<xsl:with-param name="_refHeader" select="$_refHeader" />
			       							<xsl:with-param name="_refBox" select="$_refBox" />
			       							<xsl:with-param name="_setType" select="$_setType"/>
			       							<xsl:with-param name="_refConcat" select="$_refConcat"/>          										            					
			    						</xsl:call-template>
			    					</xsl:if>
			    					<xsl:if test="name()='ximf:compstring'">
			    						<xsl:call-template name="CreateMenu">										
			       							<xsl:with-param name="_refNode" select="."/>
											<xsl:with-param name="_refHeader" select="$_refHeader" />
				        					<xsl:with-param name="_refBox" select="$_refBox" />
		            						<xsl:with-param name="_refPopupBox" select="$_refPopupBox" />
		            						<xsl:with-param name="_refConcat" select="$_refConcat"/>           										            					
			    						</xsl:call-template>
			    					</xsl:if>
			    				</xsl:for-each>
							<!-- </menupopup> -->						
						</xsl:when>
						<xsl:when test="$_setType='ximf:multiset' and ./*[name()='ximf:compstring']">						
							<!-- <menupopup id="{$_refPopupBox}" position="{$_positionPopup}" ximfreftextbox="{$_refBox}"> xp-->	
							<xsl:for-each select="ximf:compstring">							
								<xsl:call-template name="CreateMenu">
									<xsl:with-param name="_refNode" select="."/>
									<xsl:with-param name="_refHeader" select="$_refHeader" />
				        			<xsl:with-param name="_refBox" select="$_refBox" />
		            				<xsl:with-param name="_refPopupBox" select="$_refPopupBox" />
		            				<xsl:with-param name="_refConcat" select="$_refConcat"/>             												
								</xsl:call-template>				
							</xsl:for-each>			
							<!-- </menupopup> -->
						</xsl:when>
					</xsl:choose>
				</xsl:when>
				<xsl:when test="*[name()='ximf:string'] or *[name()='ximf:compstring']">
					<xsl:choose>
						<xsl:when test="ximf:string[@editable='true']"> 
							<xsl:call-template name="CreateInputBox">							
								<xsl:with-param name="_refPopupBox" select="$_refPopupBox"/>
								<xsl:with-param name="_refBox" select="$_refBox"/>
								<xsl:with-param name="_refConcat" select="$_refConcat"/> 
								<!-- <xsl:with-param name="_nbRows" select="@minItem" />  -->
							</xsl:call-template>	
						</xsl:when>
						<xsl:otherwise>
							<!--  <menupopup id="{$_refPopupBox}" position="{$_positionPopup}" ximfreftextbox="{$_refBox}"> xp-->	
								<xsl:for-each select="*">
									<xsl:if test="name()='ximf:string'">
										<xsl:call-template name="CreateMenuitem">
				       						<xsl:with-param name="_refString" select="." />  
				       						<xsl:with-param name="_refHeader" select="$_refHeader" />
				       						<xsl:with-param name="_refBox" select="$_refBox" />
				       						<xsl:with-param name="_setType" select="$_setType"/> 
				       						<xsl:with-param name="_refConcat" select="$_refConcat"/>         										            					
				    					</xsl:call-template>
				    				</xsl:if>
				    				<xsl:if test="name()='ximf:compstring'">
				    					<xsl:call-template name="CreateMenu">
											<xsl:with-param name="_refNode" select="*"/>
											<xsl:with-param name="_refHeader" select="$_refHeader" />
			        						<xsl:with-param name="_refBox" select="$_refBox" />
	            							<xsl:with-param name="_refPopupBox" select="$_refPopupBox" /> 
	            							<xsl:with-param name="_refConcat" select="$_refConcat"/>            												
										</xsl:call-template>
				    				</xsl:if>
			    				</xsl:for-each>
							<!-- </menupopup> -->
						</xsl:otherwise>
					</xsl:choose>	
				</xsl:when>				
				<xsl:otherwise>
				</xsl:otherwise>
			</xsl:choose>							
		</xsl:for-each>
	</xsl:template>
	
	<!-- *********************************** -->
	<!-- create popup box for external datas -->
	<xsl:template name="ManageExternalDatas">
		<xsl:param name="_refBox"/>
		<xsl:param name="_refExternal"/>
    	<box xtern="1" isset="1"  refBox="{$_refBox}" refExternal="{$_refExternal}" class="ximfTreeDialog"/>        					
	</xsl:template>
	
	<!-- ***************** -->
	<!-- create Input box  -->
	<xsl:template name="CreateInputBox">	
		<xsl:param name="_refPopupBox"/>
		<xsl:param name="_refBox"/>
		<xsl:param name="_refConcat"/>
		<xsl:param name="_nbRows" select="1"/>					
	
		<textbox ximfreftextbox="{$_refBox}" class="ximfInputbox" rows="1" flex="1">			
			<xsl:if test="number(@maxItem) > 1"> <!-- input box is in tree of menu -->
				<xsl:attribute name="rows">4</xsl:attribute>
	       		<xsl:attribute name="ximfmaxitems"><xsl:value-of select="@maxItem" /></xsl:attribute>
	       		<xsl:attribute name="rows"><xsl:value-of select="@minItem" /></xsl:attribute>
	       		<xsl:attribute name="multiline">true</xsl:attribute>
	       	</xsl:if>
	       	<xsl:if test="number(@minItem) > 1"> <!-- input box is in tree of menu -->
	       		<xsl:attribute name="rows"><xsl:value-of select="@minItem" /></xsl:attribute>	       		        	
	       		<xsl:attribute name="multiline">true</xsl:attribute>
	       	</xsl:if>
			<xsl:if test="string-length($_refConcat) > 0"> <!-- input box is in tree of menu -->
	       		<xsl:attribute name="ximfconcatid"><xsl:value-of select="$_refConcat" /></xsl:attribute>	       		        	
	       	</xsl:if>
	       	<xsl:if test="@separator">
	       		<xsl:attribute name="ximfseparator"><xsl:value-of select="@separator" /></xsl:attribute>
	       	</xsl:if>
	       	<button class="ximfmailButtonTxt ximfEditor"/>
		</textbox>
	</xsl:template>
	
	<!-- *********************************** -->
	<!-- Manage Menu and Submenu (compstring nodes) -->
	<xsl:template name="CreateMenu">
		<xsl:param name="_refNode"/>
		<xsl:param name="_refHeader"/>
        <xsl:param name="_refBox"/>
        <xsl:param name="_refPopupBox"/>
        <xsl:param name="_refConcat"/>
        
        <xsl:variable name="_id">
			<xsl:call-template name="GetUNID">									
					<xsl:with-param name="_refNode" select="$_refNode"/>								
			</xsl:call-template>
		</xsl:variable>
		<xsl:variable name="_newConcat" select="$_id"/>
        <!-- <xsl:variable name="_newConcat" select="concat($_refConcat,'+',$_id)"/>  -->
		<richlistitem align="start" ximfenable="true">
			<xsl:if test=".[@ximfchild]">
		       	<xsl:attribute name="ximfchild"><xsl:value-of select="@ximfchild" /></xsl:attribute>
		   </xsl:if>		
			<xsl:element name="checkbox">
				<xsl:attribute name="id"><xsl:value-of select="$_id"/></xsl:attribute>    
				<xsl:attribute name="disabled">false</xsl:attribute>
				<xsl:attribute name="ximfconcatid"><xsl:value-of select="$_newConcat"/></xsl:attribute>
				<xsl:attribute name="label">
					<xsl:call-template	name="getInternational">
			    		<xsl:with-param	name="ilk" select="@ilk" />            					
			    	</xsl:call-template>
			    </xsl:attribute>		        			 
			    <xsl:attribute name="ximfvalue"><xsl:value-of select="@content"/></xsl:attribute>
			    <xsl:if test="@technicalContent">
			    		<xsl:attribute name="ximftecvalue"><xsl:value-of select="@technicalContent" /></xsl:attribute>
			    </xsl:if>		    
				<xsl:call-template name="GetFacetsAttribute">
					<xsl:with-param name="_refNode" select="." />
				</xsl:call-template>
				<xsl:if test="@contentPositionEnd">
					<xsl:attribute name="ximfcompositionend"><xsl:value-of select="@contentPositionEnd" /></xsl:attribute>
				</xsl:if>
			</xsl:element>				
				<xsl:for-each select="*">
					<xsl:choose>
						<xsl:when test="name()='ximf:compstring'" >
							<xsl:if test="position()=1">						
									<xsl:call-template name="CreateMenu">									
										<xsl:with-param name="_refNode" select="."/>
										<xsl:with-param name="_refHeader" select="$_refHeader"/>
										<xsl:with-param name="_refBox" select="$_refBox" />
										<xsl:with-param name="_refConcat" select="$_newConcat"/>
									</xsl:call-template>		
									<xsl:for-each select="./following-sibling::*">
										<xsl:call-template name="CreateMenu">									
											<xsl:with-param name="_refNode" select="."/>
											<xsl:with-param name="_refHeader" select="$_refHeader"/>
											<xsl:with-param name="_refBox" select="$_refBox" />
											<xsl:with-param name="_refConcat" select="$_newConcat"/>								
										</xsl:call-template>									
									</xsl:for-each>												
								<!--  </xsl:element> --> 
							</xsl:if>
						</xsl:when>
						<xsl:when test="name()='ximf:set' or name()='ximf:multiset'">
							<vbox>
								<xsl:call-template name="AddSetAndMultisetPanel">
		            				<xsl:with-param name="_refNode" select="." />
		            				<xsl:with-param name="_refHeader" select="$_refHeader" />
		            				<xsl:with-param name="_refBox" select="$_refBox" />
		            				<xsl:with-param name="_refPopupBox" select="$_refPopupBox" />
		            				<xsl:with-param name="_positionPopup" select="'end_before'" />
		            				<xsl:with-param name="_refConcat" select="$_newConcat"/> 
		            			</xsl:call-template>
		            		</vbox>	            		         			
						</xsl:when>
							<xsl:when test="name()='ximf:string'">
								<xsl:choose>
									<xsl:when test="@editable='true'">
										<xsl:call-template name="CreateInputBox">								
											<xsl:with-param name="_refPopupBox" select="$_refPopupBox"/>
											<xsl:with-param name="_refBox" select="$_refBox"/>
											<xsl:with-param name="_refHeader" select="$_refHeader" />
											<xsl:with-param name="_refConcat" select="$_newConcat"/> 
										</xsl:call-template>							
	         						</xsl:when>
	         						<xsl:otherwise>
										<xsl:call-template name="CreateMenuitem">							
	            							<xsl:with-param name="_refString" select="$_refNode" />  
	            							<xsl:with-param name="_refHeader" select="$_refHeader" />
	            							<xsl:with-param name="_refBox" select="$_refBox" />            				    
	            							<xsl:with-param name="_refConcat" select="$_newConcat"/>      										            					
	        							</xsl:call-template>
									</xsl:otherwise>        							
	        					</xsl:choose>	
							</xsl:when>				
						</xsl:choose>													
					</xsl:for-each>			   
		</richlistitem>
	</xsl:template>
	
	<!-- *********************** -->
	<!-- Create menuitem element -->
	<xsl:template name="CreateMenuitem">
		<xsl:param name="_refString"/>
		<xsl:param name="_refHeader"/>
		<xsl:param name="_refBox"/>
		<xsl:param name="_setType"/>	
		<xsl:param name="_refConcat"/>	
		<xsl:for-each select="$_refString">
			<xsl:variable name="_idmenuitem">
				<xsl:call-template name="GetUNID">
					<xsl:with-param name="_refNode" select="."/>
				</xsl:call-template>
			</xsl:variable>		
			<xsl:choose>
				<xsl:when test=".[@editable='true']" >
					<xsl:call-template name="CreateInputBox">								
						<xsl:with-param name="_refPopupBox" select="$_idmenuitem"/>
						<xsl:with-param name="_refBox" select="$_refBox"/>
						<xsl:with-param name="_refHeader" select="$_refHeader" />
						<xsl:with-param name="_refConcat" select="$_refConcat"/>
					</xsl:call-template>
				</xsl:when>
				<xsl:otherwise>
					<richlistitem ximfenable="true">
						<xsl:element name="menuitem">
							<xsl:attribute name="class">ximfItem</xsl:attribute>
							<xsl:attribute name="id"><xsl:value-of select="$_idmenuitem" /></xsl:attribute>													
							<xsl:attribute name="label">
				   				<xsl:call-template	name="getInternational">
				            			<xsl:with-param	name="ilk" select="@ilk" />            					
				        		</xsl:call-template> 
				        	</xsl:attribute>
				        	<xsl:attribute name="ximfvalue"><xsl:value-of select="@content" /></xsl:attribute>
				        	<xsl:attribute name="ximftextbox"><xsl:value-of select="$_refBox" /></xsl:attribute>
				        	<xsl:if test=".[@technicalContent]">
				        		<xsl:attribute name="ximftecvalue"><xsl:value-of select="@technicalContent" /></xsl:attribute>
				        	</xsl:if>	        	
				        	<xsl:if test="string-length($_refConcat) > 0"> <!-- menuitem is in tree of menu -->
				        		<xsl:attribute name="ximfconcatid"><xsl:value-of select="$_refConcat" /></xsl:attribute>        	
				        	</xsl:if>
				        	<!-- manage link values -->
				        	<xsl:if test="./ximf:linkedValue">
				        		<xsl:attribute name="linkpopupbox"><xsl:value-of select="./ximf:linkedValue/@ref"/></xsl:attribute>
				        	</xsl:if>	          	
						</xsl:element>
					</richlistitem>
			</xsl:otherwise>
			</xsl:choose>
		</xsl:for-each>
	</xsl:template>
	
	<!-- *********************** -->
	<!-- Create checkbox element -->
	<xsl:template name="CreateCheckItem">
		<xsl:param name="_refString"/>
		<xsl:param name="_refHeader"/>
		<xsl:param name="_refBox"/>
		<xsl:param name="_setType"/>	
		<xsl:param name="_refConcat"/>	
		<xsl:for-each select="$_refString">	
			<richlistitem ximfenable="true">				
				<xsl:element name="checkbox">
					<xsl:attribute name="class">ximCheckbox</xsl:attribute>
					<xsl:attribute name="disabled">false</xsl:attribute>
					<xsl:attribute name="id">
						<xsl:call-template name="GetUNID">
							<xsl:with-param name="_refNode" select="."/>
						</xsl:call-template>
					</xsl:attribute>
					<xsl:attribute name="label">
		   				<xsl:call-template	name="getInternational">
		            		<xsl:with-param	name="ilk" select="@ilk" />            					
		        		</xsl:call-template> 
		        	</xsl:attribute>
		        	
		        	<xsl:attribute name="ximfvalue"><xsl:value-of select="@content" /></xsl:attribute>
		        	<xsl:if test=".[@technicalContent]">
		        		<xsl:attribute name="ximftecvalue"><xsl:value-of select="@technicalContent" /></xsl:attribute>
		        	</xsl:if>	        	
		        	<xsl:if test="string-length($_refConcat) > 0"> <!-- menuitem is in tree of menu -->
		        		<xsl:attribute name="ximfconcatid"><xsl:value-of select="$_refConcat" /></xsl:attribute>        	
		        	</xsl:if>
		        	<!-- manage link values -->
		        	<xsl:if test="./ximf:linkedValue">
		        		<xsl:attribute name="linkpopupbox"><xsl:value-of select="./ximf:linkedValue/@ref"/></xsl:attribute>
		        	</xsl:if>
				</xsl:element>
			</richlistitem>
		</xsl:for-each>
	</xsl:template>
	
	<!-- *********************** -->
	<!-- Create button element -->
	<xsl:template name="CreateButtonItem">
		<xsl:param name="_refString"/>
		<xsl:param name="_refHeader"/>
		<xsl:param name="_refBox"/>
		<xsl:param name="_setType"/>	
		<xsl:param name="_refConcat"/>	
		<xsl:for-each select="$_refString">			
			<xsl:element name="button">
				<xsl:attribute name="class">ximfButton</xsl:attribute>
				<xsl:attribute name="id">
					<xsl:call-template name="GetUNID">
						<xsl:with-param name="_refNode" select="."/>
					</xsl:call-template>
				</xsl:attribute>													
				<xsl:attribute name="label">
	   				<xsl:call-template	name="getInternational">
	            			<xsl:with-param	name="ilk" select="@ilk" />            					
	        		</xsl:call-template> 
	        	</xsl:attribute>
	        	<xsl:attribute name="ximfvalue"><xsl:value-of select="@content" /></xsl:attribute>
	        	<xsl:if test=".[@technicalContent]">
	        		<xsl:attribute name="ximftecvalue"><xsl:value-of select="@technicalContent" /></xsl:attribute>
	        	</xsl:if>
	        	<xsl:attribute name="ximfreftextbox"><xsl:value-of select="$_refBox" /></xsl:attribute>
	        	<xsl:if test="string-length($_refConcat) > 0"> <!-- menuitem is in tree of menu -->
	        		<xsl:attribute name="ximfconcatid"><xsl:value-of select="$_refConcat" /></xsl:attribute>        	
	        	</xsl:if>
	        	<!-- manage link values -->
	        	<xsl:if test="./ximf:linkedValue">
	        		<xsl:attribute name="linkpopupbox"><xsl:value-of select="./ximf:linkedValue/@ref"/></xsl:attribute>
	        	</xsl:if>
			</xsl:element>
		</xsl:for-each>
	</xsl:template>
	
	<!-- ******************************* -->
	<!-- create context menu for textbox -->
	<xsl:template name="CreateContext">
		<xsl:param name="refBox"/>
		<xsl:param name="idContext"/>
		<popup id="{$idContext}">			
			<menuitem class="ximfContext" idx="1" idbox="{$refBox}" label="ximfmail.composer.context.eraseall"/>
			<menuitem class="ximfContext" idx="2" idbox="{$refBox}" label="ximfmail.composer.context.details" />						
  		</popup>  		
  	</xsl:template>
  	
  	<!-- ********************** -->
	<!-- insert image of eraser -->
	<xsl:template name="AppendToolButtons">
		<xsl:param name="refBox"/>
		<button 
			class="ximfmailButton ximfDetail" 
			id="{concat($refBox,$gIdSeparator,'ximfdetail')}" 
			refLabel="{$refBox}"/>		
		<button 
			class="ximfmailButton ximfEraser" 
			id="{concat($refBox,$gIdSeparator,'ximferaser')}" 
			refValue="{$refBox}"/>
	</xsl:template>
	
	<!-- *********************************************** -->
	<!-- internationalisation of ilk attribute template  -->
	<xsl:template name="getInternational">
		<xsl:param name="ilk" />
		<xsl:variable name="value-ilk" select="/ximf:instance/ximf:dictionary/ximf:locale[@lang=$gLang]/ximf:ilk[$ilk=@entity]" />
			<xsl:choose>
				<xsl:when test="string-length($value-ilk) &lt;= 0"><xsl:value-of select="$ilk" /></xsl:when><!-- lire a <= b  --> 
				<xsl:otherwise><xsl:value-of select="$value-ilk" /></xsl:otherwise>
			</xsl:choose>  
	</xsl:template>
</xsl:stylesheet>