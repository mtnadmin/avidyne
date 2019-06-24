/**
 * @namespace WPGMZA
 * @module ProInfoWindow
 * @requires WPGMZA.InfoWindow
 */
jQuery(function($) {
	
	WPGMZA.ProInfoWindow = function(mapObject)
	{
		WPGMZA.InfoWindow.call(this, mapObject);
	}
	
	WPGMZA.ProInfoWindow.prototype = Object.create(WPGMZA.InfoWindow.prototype);
	WPGMZA.ProInfoWindow.prototype.constructor = WPGMZA.ProInfoWindow;
	
	WPGMZA.ProInfoWindow.STYLE_INHERIT			= "-1";
	WPGMZA.ProInfoWindow.STYLE_NATIVE_GOOGLE	= "0";
	WPGMZA.ProInfoWindow.STYLE_MODERN			= "1";
	WPGMZA.ProInfoWindow.STYLE_MODERN_PLUS		= "2";
	WPGMZA.ProInfoWindow.STYLE_MODERN_CIRCULAR	= "3";
	WPGMZA.ProInfoWindow.STYLE_TEMPLATE			= "template";
	
	WPGMZA.ProInfoWindow.OPEN_BY_CLICK			= 1;
	WPGMZA.ProInfoWindow.OPEN_BY_HOVER			= 2;
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "maxWidth", {
		
		get: function() {
			var width = WPGMZA.settings.wpgmza_settings_infowindow_width;
			
			if(!width || !(/^\d+$/.test(width)))
				return false;
			
			return width;
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "imageWidth", {
		
		get: function() {
			var width = WPGMZA.settings.wpgmza_settings_image_width;
			
			if(!width || !(/^\d+$/.test(width)))
				return false;
				
			return width;
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "imageHeight", {
		
		get: function() {
			var height = WPGMZA.settings.wpgmza_settings_image_height;
			
			if(!height || !(/^\d+$/.test(height)))
				return false;
				
			return height;
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "enableImageResizing", {
		
		get: function() {
			return WPGMZA.settings.wpgmza_settings_image_resizing == "yes";
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "linkTarget", {
		
		get: function() {
			return WPGMZA.settings.wpgmza_settings_infowindow_links == "yes" ? "_BLANK" : "";
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "linkText", {
		
		get: function() {
			return window.wpgmaps_lang_more_details;
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "directionsText", {
		
		get: function() {
			return window.wpgmaps_lang_get_dir;
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "distanceUnits", {
		
		get: function() {
			return this.mapObject.map.settings.store_locator_distance == 1 ? WPGMZA.Distance.MILES : WPGMZA.Distance.KILOMETERS;
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "showAddress", {
		
		get: function() {
			return WPGMZA.settings.wpgmza_settings_infowindow_address != "yes";
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "style", {
		
		get: function() {
			
			if(this.map && this.map.userLocationMarker == this)
				return WPGMZA.ProInfoWindow.STYLE_NATIVE_GOOGLE;
			
			return this.getSelectedStyle();
			
		}
		
	})
	
	WPGMZA.ProInfoWindow.prototype.getSelectedStyle = function()
	{
		var globalTypeSetting = WPGMZA.settings.wpgmza_iw_type;
		var localTypeSetting = this.mapObject.map.settings.wpgmza_iw_type;
		var type = localTypeSetting;
		
		if(localTypeSetting == WPGMZA.ProInfoWindow.STYLE_INHERIT ||
			typeof localTypeSetting == "undefined")
		{
			type = globalTypeSetting;
			
			if(type == WPGMZA.ProInfoWindow.STYLE_INHERIT)
				return WPGMZA.ProInfoWindow.STYLE_NATIVE_GOOGLE;
		}
			
		if(!type)
			return WPGMZA.ProInfoWindow.STYLE_NATIVE_GOOGLE;
			
		return String(type);
	}
	
	WPGMZA.ProInfoWindow.prototype.legacyCreateDefaultInfoWindow = function(map)
	{
		var marker = this.mapObject;
		var map = marker.map;
		
		function empty(field)
		{
			return !(field && field.length && field.length > 0);
		}
		
		var container = $("<div class='wpgmza_markerbox scrollFix'></div>");
		
		if(this.maxWidth)
			container.css({"max-width": this.maxWidth});
		
		if(!empty(marker.pic))
		{
			var img = $("<img/>");
			
			img.addClass("wpgmza_infowindow_image");
			img.attr("src", marker.pic);
			img.css({"float": "right"});
			
			if(this.maxWidth)
				img.css({"max-width": this.maxWidth});
			
			if(this.enableImageResizing && this.imageWidth)
			{
				img.css({"width": this.imageWidth});
				img.css({"height": this.imageHeight});
			}
			
			if(!this.enableImageResizing)
				img.css({"margin": "5px"});
			
			container.append(img);
		}
		
		if(!empty(marker.title))
		{
			var p = $("<p class='wpgmza_infowindow_title'></p>");
			
			p.text(marker.title);
			
			container.append(p);
		}
		
		if(!empty(marker.address) && this.showAddress)
		{
			var p = $("<p class='wpgmza_infowindow_address'></p>");
			
			p.text(marker.address);
			
			container.append(p);
		}
		
		if(!empty(marker.desc))
		{
			var div = $("<div class='wpgmza_infowindow_description'></div>");
			
			div.html(marker.desc);
			
			container.append(div);
		}
		console.log(marker);
		if(!empty(marker.linkd) || !empty(marker.link))
		{
			var link = empty(marker.link) ? marker.linkd : marker.link;
			var p = $("<p class='wpgmza_infowindow_link'></p>");
			var a = $("<a class='wpgmza_infowindow_link'></a>");
			
			a.attr("href", WPGMZA.decodeEntities(link));
			a.attr("target", this.linkTarget);
			a.attr("title", WPGMZA.decodeEntities(link));
			a.text('View Website');
			
			p.append(a);
			container.append(p);
		}
		
		if(map.directionsEnabled)
		{
			var p = $("<p></p>");
			var a = $("<a class='wpgmza_gd'></a>");
			
			a.attr("href", "javascript: ;");
			a.attr("id", map.id);
			
			a.attr("data-address", marker.address);
			a.attr("data-latlng", marker.getPosition().toString());
			
			// Legacy fields
			a.attr("wpgm_addr_field", marker.address);
			a.attr("gps", marker.lat+","+marker.lng);
			
			a.text(this.directionsText);
			
			p.append(a);
			container.append(p);
		}
		
		var filteringParameters = map.markerFilter.getFilteringParameters();
		if(filteringParameters.center)
		{
			var distanceInKM = WPGMZA.Distance.between(
				filteringParameters.center, 
				marker.getPosition()
			);
			
			var distanceToDisplay = distanceInKM;
			
			if(this.distanceUnits == WPGMZA.Distance.MILES)
				distanceToDisplay /= WPGMZA.Distance.KILOMETERS_PER_MILE;
			
			var text = Math.round(distanceToDisplay, 2) + " ";
			
			if(this.distanceUnits == WPGMZA.Distance.MILES)
				text += WPGMZA.localized_strings.miles_away;
			else
				text += WPGMZA.localized_strings.kilometers_away;
			
			var p = $("<p></p>");
			p.text(text);
			
			container.append(p);
		}
		
		if(marker.custom_fields_html)
			container.append(marker.custom_fields_html);
		
		this.setContent(container.html());
	}
	
	WPGMZA.ProInfoWindow.prototype.legacyCreateModernInfoWindow = function(map)
	{
		// Legacy code
		var mapid = map.id;
		
		if($("#wpgmza_iw_holder_" + map.id).length == 0)
			$(document.body).append("<div id='wpgmza_iw_holder_" + map.id + "'></div>");
		else
			return;
		
		var legend = document.getElementById('wpgmza_iw_holder_' + mapid);
		if (legend !== null)
			$(legend).remove();

		wpgmza_iw_Div[mapid] = document.createElement('div');
		wpgmza_iw_Div[mapid].id = 'wpgmza_iw_holder_' + mapid;
		wpgmza_iw_Div[mapid].style = 'display:block;';
		document.getElementsByTagName('body')[0].appendChild(wpgmza_iw_Div[mapid]);

		wpgmza_iw_Div_inner = document.createElement('div');
		wpgmza_iw_Div_inner.className = 'wpgmza_modern_infowindow_inner wpgmza_modern_infowindow_inner_' + mapid;
		wpgmza_iw_Div[mapid].appendChild(wpgmza_iw_Div_inner);

		wpgmza_iw_Div_close = document.createElement('div');
		wpgmza_iw_Div_close.className = 'wpgmza_modern_infowindow_close';
		wpgmza_iw_Div_close.setAttribute('mid', mapid);

		var t = document.createTextNode("x");
		wpgmza_iw_Div_close.appendChild(t);
		wpgmza_iw_Div_inner.appendChild(wpgmza_iw_Div_close);

		wpgmza_iw_Div_img = document.createElement('div');
		wpgmza_iw_Div_img.className = 'wpgmza_iw_image';
		wpgmza_iw_Div_inner.appendChild(wpgmza_iw_Div_img);

		wpgmza_iw_img = document.createElement('img');
		wpgmza_iw_img.className = 'wpgmza_iw_marker_image';
		wpgmza_iw_img.src = '';
		wpgmza_iw_img.style = 'max-width:100%;';
		wpgmza_iw_Div_img.appendChild(wpgmza_iw_img);

		wpgmza_iw_img_div = document.createElement('div');
		wpgmza_iw_img_div.className = 'wpgmza_iw_title';
		wpgmza_iw_Div_inner.appendChild(wpgmza_iw_img_div);

		wpgmza_iw_img_div_p = document.createElement('p');
		wpgmza_iw_img_div_p.className = 'wpgmza_iw_title_p';
		wpgmza_iw_img_div.appendChild(wpgmza_iw_img_div_p);

		wpgmza_iw_address_div = document.createElement('div');
		wpgmza_iw_address_div.className = 'wpgmza_iw_address';
		wpgmza_iw_Div_inner.appendChild(wpgmza_iw_address_div);

		wpgmza_iw_address_p = document.createElement('p');
		wpgmza_iw_address_p.className = 'wpgmza_iw_address_p';
		wpgmza_iw_address_div.appendChild(wpgmza_iw_address_p);

		wpgmza_iw_description = document.createElement('div');
		wpgmza_iw_description.className = 'wpgmza_iw_description';
		wpgmza_iw_Div_inner.appendChild(wpgmza_iw_description);

		wpgmza_iw_description_p = document.createElement('p');
		wpgmza_iw_description_p.className = 'wpgmza_iw_description_p';
		wpgmza_iw_description.appendChild(wpgmza_iw_description_p);

		wpgmza_iw_buttons = document.createElement('div');
		wpgmza_iw_buttons.className = 'wpgmza_iw_buttons';
		wpgmza_iw_Div_inner.appendChild(wpgmza_iw_buttons);

		wpgmza_directions_button = document.createElement('a');
		wpgmza_directions_button.className = 'wpgmza_button wpgmza_left wpgmza_directions_button';
		wpgmza_directions_button.src = '#';
		
		var t = document.createTextNode(wpgmaps_lang_directions);
		wpgmza_directions_button.appendChild(t);
		wpgmza_iw_buttons.appendChild(wpgmza_directions_button);

		wpgmza_more_info_button = document.createElement('a');
		wpgmza_more_info_button.className = 'wpgmza_button wpgmza_right wpgmza_more_info_button';
		wpgmza_more_info_button.src = '#';
		
		var t = document.createTextNode(wpgmaps_lang_more_info);
		wpgmza_more_info_button.appendChild(t);
		wpgmza_iw_buttons.appendChild(wpgmza_more_info_button);

		var legend = document.getElementById('wpgmza_iw_holder_' + mapid);
		$(legend).css('display', 'block');
		$(legend).addClass('wpgmza_modern_infowindow');
		$(legend).addClass('wpgmza-shadow');

		if (WPGMZA.settings.engine == "google-maps")
			MYMAP[mapid].map.googleMap.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend);
		else {
			var container = $(".wpgmza-ol-modern-infowindow-container[data-map-id='" + mapid + "']");
			if (!container.length) {
				container = $("<div class='wpgmza-ol-modern-infowindow-container' data-map-id='" + mapid + "'></div>");
				$(".wpgmza_map[data-map-id='" + mapid + "']").append(container);
			}

			container.append(legend);
		}

	}
	
	WPGMZA.ProInfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		
		// Legacy support
		if(window.infoWindow)
			infoWindow[mapObject.map.id] = this;
		
		if(!WPGMZA.InfoWindow.prototype.open.call(this, map, mapObject))
			return false;	// Parent class has detected that the window shouldn't open
		
		if(this.mapObject == map.userLocationMarker)
			return true;	// Allow the default style window to open for user location markers
		
		if(map.settings.list_markers_by == WPGMZA.MarkerListing.STYLE_MODERN)
			return false;	// Don't show if modern style marker listing is selected
		
		if(WPGMZA.settings.wpgmza_settings_disable_infowindows)
			return false;	// Global setting "disable infowindows" is set
		
		// Legacy support
		if(this.style == WPGMZA.ProInfoWindow.STYLE_NATIVE_GOOGLE || WPGMZA.currentPage == "map-edit")
		{
			this.legacyCreateDefaultInfoWindow();
			return true;	// Always show default style when on map edit page
		}
		
		var marker_data;
		var data = wpgmaps_localize_marker_data[map.id];
		var marker = mapObject;
		
		if(typeof data == "array")
			for(var i = 0; i < data.length; i++)
			{
				if(data[i].marker_id == mapObject.id)
				{
					marker_data = data[i];
					
					break;
				}
			}
		else if(typeof data == "object")
			for(var key in data)
			{
				if(data[key].marker_id == mapObject.id)
				{
					marker_data = data[key];
					
					break;
				}
			}
		
		if(!marker_data)
		{
			console.warn("Failed to find marker data for marker " + mapObject.id);
			return false;
		}
		
		this.legacyCreateModernInfoWindow(map);
		
		modern_iw_open[map.id] = true;

		/* reset the elements */
		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_marker_image").attr("src",""); 
		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_title").html(""); 
		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_description").html(""); 
		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_address_p").html(""); 


		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_more_info_button").attr("href","#"); 
		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_more_info_button").attr("target",""); 
		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").attr("gps",""); 
		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").attr("href","#"); 
		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").attr("id",""); 
		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").attr("wpgm_addr_field",""); 

		
		
		if (marker_data.image === "" && marker_data.title === "") {  
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_image").css("display","none"); 
		} else {
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_image").css("display","block"); 
		}


		if (marker_data.pic.length) { 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_marker_image").css("display","block"); 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_marker_image").attr("src",marker_data.pic); 
			// Removed !important; to allow customisation
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_title").css({"position": "absolute"});
			if (marker_data.title !== "") { jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_title").html(marker_data.title); }

		} else {
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_marker_image").css("display","none"); 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_title").attr("style","position: relative !important"); 
			if (marker_data.title !== "") { jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_title").html(marker_data.title); }
		}

		if (marker_data.desc !== "") { 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_description").css("display","block"); 
			if (typeof marker_data.desc !== "undefined" && marker_data.desc !== "") { jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_description").html(marker_data.desc); }
		} else {
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_description").css("display","none"); 

		}

		
		if (typeof wpgmaps_localize_global_settings['wpgmza_settings_infowindow_address'] !== 'undefined' && wpgmaps_localize_global_settings['wpgmza_settings_infowindow_address'] === "yes") {
		} else {
			if (typeof marker_data.address !== "undefined" && marker_data.address !== "") { jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_address_p").html(marker_data.address); }
		}
		

		if (typeof marker_data.linkd !== "undefined" && marker_data.linkd !== "") { 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_more_info_button").show();
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_more_info_button").attr("href",marker_data.linkd);
			
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_more_info_button").attr("target",this.linkTarget); 
		} else {
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_more_info_button").hide();
		}
		if (map.directionsEnabled) { 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").show();
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").attr("href","javascript:void(0);"); 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").attr("gps",marker_data.lat + "," + marker_data.lng); 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").attr("wpgm_addr_field",marker_data.address); 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").attr("id",map.id); 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").addClass("wpgmza_gd"); 

		} else {
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").hide();
		}

		return true;
	}
	
	// TODO: This doesn't appear to do anything, nor does it call the parent method
	WPGMZA.ProInfoWindow.prototype.close = function()
	{
		$(this.mapObject.map.element).find(".wpgmza-pro-info-window-container").html();
	}
	
	// TODO: This should be taken care of already in core.js
	$(document).ready(function(event) {
		$(document.body).on("click", ".wpgmza-close-info-window", function(event) {
			$(event.target).closest(".wpgmza-info-window").remove();
		});
	});
	
});