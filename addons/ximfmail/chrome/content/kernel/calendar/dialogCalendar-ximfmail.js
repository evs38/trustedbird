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
 * ***** END LICENSE BLOCK ***** */
var gJSLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].createInstance(Components.interfaces.mozIJSSubScriptLoader);
var gConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
gJSLoader.loadSubScript("chrome://ximfmail/content/jquery.js");
gJSLoader.loadSubScript("chrome://ximfmail/content/ximfmail.js");

var _XIMF_ATT_XVALUE = "ximfvalue";
  
var gDlgTreeXimf_maxItem = null;
var gDlgTreeXimf_current_selection = null;
var gDlgTreeXimf_current_separator = null;
var gXmlDatasFilePath = null;
var gRdfTempo = null;


var gSelectedDate = null;
var gSelectedDayItem = null;
var gSelectedMonthItem = null; // dom month
var gSelectedHourItem = null;
var gSelectedMinItem = null;
var gTitleDlg = null;
/*
 window.arguments = [];
		args[0] id de la textbox à enrichir
		args[1] date courant affichee		
*/
var gBoxOpener = null; // display date
$(document).ready(function(){
	
	var gArgs = window.arguments;
	if(gArgs[0].length <= 0) return;
	// load background datas
	gBoxOpener = gArgs[0][0];
	gTitleDlg = gArgs[0][2];
	
	if(gBoxOpener){
		gSelectedDate = parseDate(gArgs[0][1]);
	}else{
		adjustCurrentDate();		
	}	
	
	UpdateCalendar();
	
}); 

/*
 * 
 */
function clickOk(){	
	
	var date = ConvertDateForDisplay();	
  	window.opener.document.getElementById(gBoxOpener).value = date; 
  	window.opener.document.getElementById(gBoxOpener).setAttribute(_XIMF_ATT_XVALUE, gSelectedDate.toGMTString()); 
	window.close();
	return true;
}

/*
 * 
 */
function clickCancel(){
	window.close();
	return false;	
}

/*
 * 
 */
function adjustCurrentDate(){
	gSelectedDate = new Date();
	
	// minutes %5	
	gSelectedDate.setMinutes(parseInt(Math.round(gSelectedDate.getMinutes()/5)*5));	
	UpdateCalendar();	
}

function ConvertDateForDisplay(){
	var displayDate = null;
	var date = new Date();
	if( gSelectedDate ){ date = gSelectedDate;}
	try{		
		//displayDate = date.getDate() + "/" + (date.getMonth()+1) + "/" +  date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();
		// day
		if(date.getDate()>=10){
			displayDate = date.getDate();
		}else{
			displayDate = "0"+date.getDate();
		}
		
		//month
		if((date.getMonth()+1)>=10){
			displayDate += "/" + (date.getMonth()+1);
		}else{
			displayDate += "/0" + (date.getMonth()+1);
		}
		
		//year
		displayDate += "/" +  date.getFullYear() + " ";
		
		// hour
		if(date.getHours()>=10){
			displayDate += "" + date.getHours();
		}else{
			displayDate += "0" + date.getHours();
		}
		
		//minutes
		displayDate += ":";
		if(date.getMinutes()>=10){
			displayDate += date.getMinutes();
		}else{
			displayDate += "0" + date.getMinutes();
		}		
	}catch( e ){
		
	}
	return displayDate;
}
	

function UpdateCalendar(){
	try{		
		// Set up the picker, called when the popup pops
		// get the start date from the popup value attribute and select it					
		var startDate = gSelectedDate;					
						
		if(startDate){						
			gOriginalDate = new Date( startDate );
			gSelectedDate = new Date( startDate );
		}else{
			gOriginalDate = new Date();
			gSelectedDate = new Date();
			gSelectedDate.setMinutes(Math.round((gSelectedDate.getMinutes()/5))*5);  
			gOriginalDate.setMinutes(Math.round((gOriginalDate.getMinutes()/5))*5);  
		}
						
		// draw the year based on the selected date
		redrawYear();
	
		// draw the month based on the selected date
		var month = gSelectedDate.getMonth() + 1;
		var selectedMonthBoxItem = document.getElementById("oe-date-picker-year-month-" + month + "-box"  );
		selectMonthItem( selectedMonthBoxItem );
	
		// draw in the days for the selected date
		redrawDays();
						
		//EADS - draw in hours and minutes for selected date
		var hour = gSelectedDate.getHours();
		var selectedHoursBoxItem = document.getElementById("ximfmail-date-picker-hour-box-" + hour );
		selectHoursItem(selectedHoursBoxItem);
						
		var min = gSelectedDate.getMinutes();
		var selectedMinutesBoxItem = null;
		if(min%5 != 0)
			selectedMinutesBoxItem = document.getElementById("ximfmail-date-picker-min-box-" + (Math.round(min/5)*5) );
		else
			selectedMinutesBoxItem = document.getElementById("ximfmail-date-picker-min-box-" + min );
		selectMinutesItem(selectedMinutesBoxItem); 
		
		//title calendar
		$("#ximf-date-picker-title").attr("value", gTitleDlg.substring(0,gTitleDlg.lastIndexOf(":")));
	}catch(e){}
}

function clickDay(newDayItem, newDayItemNumber){
	// Called when a day is clicked, close the picker and call the client's oncommand
	// get the clicked day
	if( gSelectedDayItem  == newDayItem )
		return;
			
	// update new selection
	newDayItem.setAttribute("selected",true);
	if(gSelectedDayItem){
		gSelectedDayItem.removeAttribute("selected");
	}
	gSelectedDayItem = newDayItem;
					 					 
	var dayNumberItem = document.getElementById("oe-date-picker-month-day-text-" + newDayItemNumber );
	var dayNumber = dayNumberItem.getAttribute( "value" );
	// they may have clicked an unfilled day, if so ignore it and leave the picker up
	if( dayNumber != "" ){						
		selectDayItem(newDayItem);
		// set the selected date to what they cliked on
		gSelectedDate.setDate( dayNumber );
	}
}


/*
 * 
 */
function clickMonth(newMonthItem, newMonthNumber){
		// Called when a month box is clicked 
		// already selected, return					
		if( gSelectedMonthItem  == newMonthItem )
			return;
		
		// update new selection
		newMonthItem.setAttribute("selected",true);
		if(gSelectedMonthItem){
			gSelectedMonthItem.removeAttribute("selected");
		}
		gSelectedMonthItem = newMonthItem;
							
		
		// Avoid problems when changing months if the date is at the end of the month
		// i.e. if date is 31 march and you do a setmonth to april, the month would
		// actually be set to may, beacause april only has 30 days.
		// This is why we keep the original date around.
		var oldDate = gSelectedDate.getDate();
		var yearNumber = gSelectedDate.getFullYear();

		var pastLastDate = new Date( yearNumber, newMonthNumber-1, 32 );
		var lastDayOfMonth = 32 - pastLastDate.getDate(); 

		if( oldDate > lastDayOfMonth ){
			 gSelectedDate.setDate(lastDayOfMonth);
		}

		// update the selected date
		gSelectedDate.setMonth( newMonthNumber - 1 );

		// select Month
		selectMonthItem( newMonthItem );

		// redraw days
		redrawDays();
}

/*
 * 
 */
function previousYearCommand(increment){
					// Called when previous Year button is clicked 
					// update the selected date

					var oldYear = gSelectedDate.getFullYear(); 
					gSelectedDate.setFullYear( oldYear - increment ); 

					// redraw the year and the days
					redrawYear();
					redrawDays();
}

/*
 * 
 */
function nextYearCommand(increment){
					// Called when next Year button is clicked 
					// update the selected date

					var oldYear = gSelectedDate.getFullYear(); 
					gSelectedDate.setFullYear( oldYear + increment ); 

					// redraw the year and the days
					redrawYear();
					redrawDays();
}

/*
 * 
 */
function redrawYear(){
	var yearTitleItem = document.getElementById("oe-date-picker-year-title-text");
	yearTitleItem.setAttribute( "value", gSelectedDate.getFullYear() );
}

/*
 * 
 */
function selectMonthItem(newMonthItem){
	// Select a month box 
	// clear old selection, if there is one
	if( gSelectedMonthItem != null ){
		gSelectedMonthItem.removeAttribute("selected");
	}

	// Set the selected attribute, used to give it a different style
	newMonthItem.setAttribute( "selected" , true );

	// Remember new selection
	gSelectedMonthItem = newMonthItem;
}

/*
 * 
 */
function selectDayItem(newDayItem){
	// Select a day box 
	// clear old selection, if there is one

	if( gSelectedDayItem != null ){
		gSelectedDayItem.removeAttribute("selected");
	}

	if( newDayItem != null ){
		// Set the selected attribute, used to give it a different style
		newDayItem.setAttribute( "selected" , true );
	}
	
	// Remember new selection
	gSelectedDayItem = newDayItem;
}

/*
 * 
 */
function redrawDays(){
	// Redraw day numbers based on the selected date
	// Write in all the day numbers				 
	var firstDate = new Date( gSelectedDate.getFullYear(), gSelectedDate.getMonth(), 1 );
	var firstDayOfWeek = firstDate.getDay();
				 
	//get last Day Of Month					 
	 var pastLastDate = new Date( gSelectedDate.getFullYear(), gSelectedDate.getMonth(), 32 );
   	 var lastDayOfMonth = 32 - pastLastDate.getDate(); 
				 
	// clear the selected day item					 
	selectDayItem( null );
				 
	// redraw each day bax in the 7 x 6 grid
	var dayNumber = 1;
	for( var dayIndex = 0; dayIndex < 42; ++dayIndex ){
		// get the day text box
		var dayNumberItem = document.getElementById("oe-date-picker-month-day-text-" + (dayIndex + 1) );
		
		// if it is an unfilled day ( before first or after last ), just set its value to "",
		// and don't increment the day number.
		if( dayIndex < firstDayOfWeek || dayNumber > lastDayOfMonth )
		{
			 dayNumberItem.setAttribute( "value" , "" );  
		}else{
			// set the value to the day number
			dayNumberItem.setAttribute( "value" , dayNumber );
			
			// draw the day as selected
			if( dayNumber == gSelectedDate.getDate() ){
				var dayNumberBoxItem = document.getElementById( "oe-date-picker-month-day-" + (dayIndex + 1) + "-box"  );
				selectDayItem( dayNumberBoxItem );
			 }
			
			// advance the day number
			++dayNumber;  
		}
	}
}

/*
 * 
 */
function parseDate(datestr){
	//var datestr = _input.value;					
	try{
		if( datestr != "" ){
			var reg=new RegExp("[ / :]+", "g"); //eads
			var parts = datestr.split(reg);							
			if( parts.length >= 5 ){								
				//var d = new Date(month, day, year, hour, minutes, seconds);
				//return new Date(parseInt(parts[1]-1),parseInt(parts[0]),parseInt(parts[2]),parseInt(parts[3]),parseInt(parts[4]),0);
				//alert("SPLIT DATE\nmonth : "+parts[1] + "\n day : " + parts[0] +"\n year : "+ parts[2] +"\n hour : "+ parts[3] +"\n min : "+ parts[4]);
				var new_date = new Date();
				new_date.setDate(parseInt(parts[0]));
				new_date.setMonth(parseInt(parts[1]-1));
				new_date.setFullYear(parseInt(parts[2]));
				new_date.setHours(parseInt(parts[3]));
				new_date.setMinutes(parseInt(parts[4]));
				new_date.setSeconds(0);
				return new_date;								
			}
		}
	}catch(e){}
	return null;
}

/*
 * 
 */
function clickHour(newHoursItem,newHourItemNumber){
		if( gSelectedHourItem  == newHoursItem ) return;
		selectHoursItem(newHoursItem);
		/*
		// update new selection
		newHoursItem.setAttribute("selected",true);
		if(gSelectedHourItem){
				gSelectedHourItem.removeAttribute("selected");
		}
		gSelectedHourItem = newHoursItem;
		*/
		
		gSelectedDate.setHours(parseInt(newHourItemNumber));			
}

/*
 * 
 */
function selectHoursItem(newHoursItem){
	// Select a month box 
	// clear old selection, if there is one
	if( gSelectedHourItem != null ){
		gSelectedHourItem.removeAttribute( "selected" );
	}

	// Set the selected attribute, used to give it a different style
	newHoursItem.setAttribute( "selected" , true );

	// Remember new selection
	gSelectedHourItem = newHoursItem;
}

/*
 * 
 */
function clickMin(newMinItem,newMinItemNumber){	
		if( gSelectedMinItem  == newMinItem ) return;
		// update new selection
		selectMinutesItem(newMinItem);
		/*newMinItem.setAttribute("selected",true);
		
		if(gSelectedMinItem){
			gSelectedMinItem.removeAttribute("selected");
		}
		gSelectedMinItem = newMinItem;
		*/
		gSelectedDate.setMinutes(parseInt(newMinItemNumber));
		
}

/*
 * 
 */
function selectMinutesItem(newMinutesItem){
	// Select a month box 
	// clear old selection, if there is one
	if( gSelectedMinItem != null ){
		gSelectedMinItem.removeAttribute( "selected" );
	}

	// Set the selected attribute, used to give it a different style
	newMinutesItem.setAttribute( "selected" , true );

	// Remember new selection
	gSelectedMinItem = newMinutesItem;
}		