"use strict";

var LANG;

$(document).ready(function () {	
	//prepend the more info link to all charts
	$(".chart_container").each(function(i, value) {
		var moreinfo_html = "<a href='#'>"
				+ "<img src='images/moreinfo.png' class='moreinfo' id='moreinfo_" 
				+ $(value).attr("id") + "' alt='more info' title='Click for more info about this metric' /></a>";
				
		$(this).prepend(moreinfo_html);
	});
	
	//provide lang literals globally
	d3.json("lang/en_US.json", function(data) {
		LANG = data;
		
		//other initializations
		$("input, textarea, select").uniform();
		//touchDropdown();
		assignEventListeners();
		drawCharts();
	});
});

function assignEventListeners() {
	var hoverIntentConfig = {    
		over: chartContainerEnter,
		interval: 50,
		timeout: 900,
		out: chartContainerLeave
	};
	$(".chart_container").hoverIntent(hoverIntentConfig);

	$(".moreinfo").click(function(e) {
		//alert("clicking this will bring up more info about the metric, ...");
		$(".dim").show();
		
		//get details of calling metric
		var srcE = e.srcElement ? e.srcElement : e.target; 
		var lookup_id = $(srcE.parentElement.parentElement).attr("id");
		var title = $("#" + $(srcE.parentElement.parentElement).attr("id") + " span").html();

		$("#modal_box h2").html(title);
		$("#modal_box p#content_what").html(LANG[lookup_id].what);
		$("#modal_box p#content_how").html(LANG[lookup_id].how);
		$("#modal_box").show();
		
		return false;
	});
	
	$(".close_modal_box").click(function(e) {
		$(".dim").hide();
		$(".modal").hide();
	});
	
	$(".dim").click(function(e) {
		$(".dim").hide();
		$(".modal").hide();
	});
	
	function chartContainerEnter(e) {
		var moreinfo_button = $("#moreinfo_" + $(this).attr("id"));
		
		//prevent multiple, rapid mouseenters
		if(moreinfo_button.css("opacity") == 0) {
			moreinfo_button.fadeTo(400,1);
		}
	}

	function chartContainerLeave(e) {
		$("#moreinfo_" + $(this).attr("id")).fadeTo(400,0);
	}
}

function drawCharts() {
	//$(".chart_container div").empty();

	//draw the charts
	d3.json("data/architectural_by_chart.json", function(data) {
		$.each($(".chart_container"), function(index, value) {
			var id= $(value).attr("id"); //console.log("id is " + id);
			var format = "s",
				humanify_numbers = true,
				custom_units = "",
				splice_from = 0;
			
			if(id == "prop_cost" || id == "dependencies_density" || id == "percent_in_core")
				format = "%";
			
			if(id == "speed" || id == "defects_per_kloc")
				humanify_numbers = false;
				
			if(id == "mem")
				custom_units = "MB";
				
			if(id == "crashes") splice_from = 8;
			if(id == "mem" || id == "speed") splice_from = 6;
			if(id == "defects_per_kloc") splice_from = 7;
			
			draw(eval("data."+id), "#" + id, format, humanify_numbers, custom_units, splice_from);
		});
	});
}


/**
 * Helper functions (typically from StackOverflow)
 */
 
 function randomRange(minVal,maxVal,floatVal) {
  var randVal = minVal+(Math.random()*(maxVal-minVal));
  return typeof floatVal=='undefined'?Math.round(randVal):randVal.toFixed(floatVal);
}

function addCommas(nStr) {
	nStr += '';
	var x = nStr.split('.');
	var x1 = x[0];
	var x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}


function getHumanSize(size) {
	var sizePrefixes = ' kmbtpezyxwvu';
	if(size <= 0) return '0';
	var t2 = Math.min(Math.floor(Math.log(size)/Math.log(1000)), 12);
	return (Math.round(size * 100 / Math.pow(1000, t2)) / 100) +
	//return (Math.round(size * 10 / Math.pow(1000, t2)) / 10) +
		sizePrefixes.charAt(t2).replace(' ', '');
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}