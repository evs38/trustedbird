<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:ximf="http://eads.org/ximf/">
	<xsl:output method="xml" indent="yes" />

<xsl:template match="ximf:instance">
	<xsl:element name="securityLabel" namespace="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" >
		<!--<xsl:attribute name="xmlns">http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul</xsl:attribute>-->
		<xsl:attribute name="id">id0x087c8960</xsl:attribute>
	<xsl:apply-templates select="ximf:header" />
	</xsl:element>
</xsl:template>

<xsl:template match="ximf:header">
	<xsl:variable name="headerPolicyIdentifier" select="contains(@id,'header-policy-identifier')" />
	<xsl:variable name="headerClassification" select="contains(@id,'header-classification')" />
	<xsl:variable name="headerPrivacyMark" select="contains(@id,'header-privacy-mark')" />
	<xsl:variable name="headerCategories" select="contains(@id,'header-categories')" />
	<xsl:choose>
		<xsl:when test="$headerPolicyIdentifier">
			<xsl:element name="securityPolicyIdentifier">
				<xsl:attribute name="value">
					<xsl:value-of select="ximf:string/@content" />
				</xsl:attribute>
				<xsl:attribute name="label">
					<xsl:value-of select="ximf:string/@content" />
				</xsl:attribute>
			</xsl:element>
		</xsl:when>
		<xsl:when test="$headerClassification">
			<xsl:element name="securityClassification">
				<xsl:attribute name="valueDisplayed">
					<xsl:text>true</xsl:text>
				</xsl:attribute>
				<xsl:apply-templates select="ximf:set" mode="securityClassification" />
			</xsl:element>
		</xsl:when>
		<xsl:when test="$headerPrivacyMark">
			<xsl:element name="privacyMark">
				<xsl:attribute name="freetext">
					<xsl:text>true</xsl:text>
				</xsl:attribute>
				<!-- Champ vide codé en dur, je ne sais pas le récupérer autrement -->
				<xsl:element name="item">
					<xsl:attribute name="value" />
					<xsl:attribute name="label" />
				</xsl:element>
				<xsl:for-each select="ximf:set/ximf:string">
					<xsl:element name="item">
						<xsl:attribute name="value">
							<xsl:value-of select="@content" />
						</xsl:attribute>
						<xsl:attribute name="label" />
					</xsl:element>
				</xsl:for-each>
			</xsl:element>
		</xsl:when>
		<xsl:when test="$headerCategories">
				<xsl:apply-templates select="ximf:set" mode="securityCategories" />
		</xsl:when>
		<xsl:otherwise>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template match="ximf:set" mode="securityClassification">
	<xsl:apply-templates select="ximf:string" mode="securityClassification" />
</xsl:template>

<xsl:template match="ximf:set" mode="securityCategories">
	<xsl:variable name="id"><xsl:value-of select="@id" /></xsl:variable>
	<xsl:element name="securityCategories">
		<xsl:attribute name="type">
			<xsl:value-of select="../../ximf:header[@id='header-classification']/ximf:set/ximf:string/ximf:linkedValue[@ref=$id]/../@technicalContent" />
		</xsl:attribute>
		<xsl:apply-templates select="ximf:string" mode="securityCategories" />
		<xsl:apply-templates select="ximf:compstring" mode="securityCategories" />
	</xsl:element>
</xsl:template>

<xsl:template match="ximf:string" mode="securityClassification" >
	<xsl:variable name="sCLabel">
	<!-- Remplacer par un tableau ? -->
		<xsl:choose>
			<xsl:when test="@technicalContent=0">
				<xsl:text>unmarked</xsl:text>
			</xsl:when>
			<xsl:when test="@technicalContent=1">
				<xsl:text>unclassified</xsl:text>
			</xsl:when>
			<xsl:when test="@technicalContent=2">
				<xsl:text>restricted</xsl:text>
			</xsl:when>
			<xsl:when test="@technicalContent=3">
				<xsl:text>confidential</xsl:text>
			</xsl:when>
			<xsl:when test="@technicalContent=4">
				<xsl:text>secret</xsl:text>
			</xsl:when>
			<xsl:when test="@technicalContent=5">
				<xsl:text>top-secret</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:variable>
	<xsl:element name="item">		
		<xsl:attribute name="value">
			<xsl:value-of select="@technicalContent" />			
		</xsl:attribute>
		<xsl:attribute name="label">
			<xsl:value-of select="$sCLabel" />
		</xsl:attribute>
	</xsl:element>
</xsl:template>

<xsl:template match="ximf:string" mode="securityCategories" >
	<xsl:element name="item">
		<xsl:attribute name="oid">
			<xsl:value-of select="substring-before(@technicalContent,',')" />
		</xsl:attribute>
		<xsl:attribute name="type">
			<xsl:text>2</xsl:text>
		</xsl:attribute>
		<xsl:attribute name="value">
			<xsl:value-of select="substring-after(@technicalContent,',')" />
		</xsl:attribute>
		<xsl:attribute name="label">
			<xsl:value-of select="@content" />
		</xsl:attribute>
	</xsl:element>
</xsl:template>

<xsl:template match="ximf:compstring" mode="securityCategories" >
	<xsl:element name="item">
		<xsl:attribute name="oid">
			<xsl:value-of select="substring-before(@technicalContent,',')" />
		</xsl:attribute>
		<xsl:attribute name="type">
			<xsl:text>2</xsl:text>
		</xsl:attribute>
		<xsl:attribute name="value">
			<xsl:value-of select="substring-after(@technicalContent,',')" />
		</xsl:attribute>
		<xsl:attribute name="label">
			<xsl:value-of select="@content" />
		</xsl:attribute>
	</xsl:element>
</xsl:template>
</xsl:stylesheet>
