/**
 * @namespace WPGMZA
 * @module MarkerListing
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.MarkerListing = function(map, element, options)
	{
		var self = this;
		
		this._paginationEnabled = true;
		
		this.map = map;
		
		this.element = element;
		
		if(options)
			for(var key in options)
				this[key] = options[key];
		
		this.categoryDropdown = $("select[name='wpgmza_filter_select'][mid='" + this.map.id + "']")
		this.categoryDropdown.on("change", function(event) {
			var map = WPGMZA.getMapByID(self.map.id);
			map.markerFilter.update();
		});
		
		this.categoryCheckboxes = $(".wpgmza_checkbox[mid='" + this.map.id + "']");
		this.categoryCheckboxes.on("change", function(event) {
			var map = WPGMZA.getMapByID(self.map.id);
			map.markerFilter.update();
		});
		
		if(map.settings.store_locator_hide_before_search)
		{
			this.showOnFilteringComplete = true;
			$(this.element).hide();
		}
		
		$(this.element).on("click", ".wpgmaps_mlist_row, .wpgmaps_blist_row", function(event) {
			self.onItemClick(event);
		});
		
		$(document.body).on("filteringcomplete.wpgmza", function(event) {
			
			if(event.map.id == self.map.id)
				self.onFilteringComplete(event);
			
		});
		
		this.reload();
	}
	
	WPGMZA.MarkerListing.createInstance = function(map, element, options)
	{
		switch(map.settings.list_markers_by)
		{
			case WPGMZA.MarkerListing.STYLE_ADVANCED_TABLE:
				return new WPGMZA.AdvancedTableMarkerListing(map, element, options); 
				break;
			
			case WPGMZA.MarkerListing.STYLE_CAROUSEL:
				return new WPGMZA.CarouselMarkerListing(map, element, options);
				break;
			
			case WPGMZA.MarkerListing.STYLE_MODERN:
				return new WPGMZA.ModernMarkerListing(map, element, options);
				break;
			
			default:
				return new WPGMZA.MarkerListing(map, element, options);
				break;
		}
	}
	
	WPGMZA.MarkerListing.STYLE_NONE					= 0;
	WPGMZA.MarkerListing.STYLE_BASIC_TABLE			= 1;
	WPGMZA.MarkerListing.STYLE_BASIC_LIST 			= 4;
	WPGMZA.MarkerListing.STYLE_ADVANCED_TABLE		= 2;
	WPGMZA.MarkerListing.STYLE_CAROUSEL				= 3;
	WPGMZA.MarkerListing.STYLE_MODERN				= 6;
	
	Object.defineProperty(WPGMZA.MarkerListing.prototype, "mapID", {
		
		"get": function() {
			return this.map.id;
		}
		
	});
	
	Object.defineProperty(WPGMZA.MarkerListing.prototype, "paginationEnabled", {
		
		"get": function() {
			return this._paginationEnabled;
		},
		
		"set": function(value) {
			this._paginationEnabled = (value ? true : false);
		}
		
	});
	
	/**
	 * The page size, or the default of 10 if none is set
	 */
	Object.defineProperty(WPGMZA.MarkerListing.prototype, "pageSize", {
		
		"get": function() {
			
			if(!WPGMZA.settings.wpgmza_default_items)
				return 10;
			
			var pageSize = parseInt( WPGMZA.settings.wpgmza_default_items );
			
			if(isNaN(pageSize))
			{
				//console.warn("Invalid page size");
				return null;
			}
			
			return pageSize;
			
		},
		
		"set": function(value) {
			this.pagination("pageSize", value);
		}
		
	});
	
	/**
	 * The current page number, zero based
	 */
	Object.defineProperty(WPGMZA.MarkerListing.prototype, "currentPage", {
		
		"get": function() {
			if(!this.paginationElement)
				return 0;
			
			try{
				return $(this.paginationElement).pagination("getSelectedPageNum") - 1;
			}catch(e) {
				//console.warn("pagination.js getSelectedPageNum failed");
				return 0;
			}
		},
		
		"set": function(value) {
			throw new Error("Not yet implemented");
		}
		
	});
	
	Object.defineProperty(WPGMZA.MarkerListing.prototype, "style", {
		
		"get": function() {
			return this.map.settings.list_markers_by;
		}
		
	});
	
	WPGMZA.MarkerListing.prototype.initPagination = function()
	{
		if(this.paginationElement)
		{
			try{
				$(this.paginationElement).pagination("destroy");
			}catch(e) {
				//console.warn(e);
			}
			$(this.paginationElement).remove();
		}
		
		if(!this.paginationEnabled || this.showOnFilteringComplete)
			return;
		
		if(this.pageSize)
		{
			var options = this.getPaginationOptions();
			
			if(this.lastAJAXResponse.recordsFiltered <= options.pageSize)
				return;
			
			this.paginationElement = $("<div class='wpgmza-pagination'/>");
			this.pagination = $(this.paginationElement).pagination(this.getPaginationOptions());
			
			$(this.element).after(this.paginationElement);
		}
	}
	
	WPGMZA.MarkerListing.prototype.getPaginationOptions = function()
	{
		var self = this;
		
		var options = {
			
			triggerPagingOnInit: false,
			pageSize: this.pageSize,
			
			dataSource: function(done) {
				done( self.getPaginationDataSource() )
			},
			
			callback: function(data, pagination) {
				self.pageOnPaginationReinit = $(self.paginationElement).pagination("getSelectedPageNum");
				$(self.paginationElement).pagination("disable");
				self.reload();
			}
			
		};
		
		if(this.pageOnPaginationReinit)
			options.pageNumber = this.pageOnPaginationReinit;
		
		return options;
	}
	
	WPGMZA.MarkerListing.prototype.getPaginationDataSource = function()
	{
		var source = [];
		
		if(!this.lastAJAXResponse)
			return source;
		
		for(var i = 0; i < this.lastAJAXResponse.recordsFiltered; i++)
			source.push(i);
		
		return source;
	}
	
	WPGMZA.MarkerListing.prototype.getAJAXRequestParameters = function(params)
	{
		var self = this;
		
		// Create parameters object if it doesn't exist already
		if(!params)
			params = {};
		if(!params.data)
			params.data = {};
		
		// We use POST as the requests can become quite large with marker IDs, don't want to hit the GET limit
		params.method = "POST";
		
		// Parse parameters passed from the server
		var str = $(this.element).attr("data-wpgmza-ajax-parameters");
		if(!str || !str.length)
			throw new Error("No AJAX parameters specified on Marker Listing attribute");
		
		var attributeParameters = JSON.parse(str);
		
		// Put PHP class and attribute parameters in params.data
		$.extend(
			params.data, 
			{
				"phpClass": $(this.element).attr("data-wpgmza-php-class"),
				"start": this.currentPage * this.pageSize,
				"length": this.pageSize
			},
			attributeParameters
		);
		
		if(this.overrideMarkerIDs)
			params.data.overrideMarkerIDs = this.overrideMarkerIDs.join(",");
		
		if(this.lastFilteringParams)
			params.data.filteringParams = this.lastFilteringParams;
		
		// Add success callback
		params.success = function(response, textStatus, xhr) {
			self.onAJAXResponse(response, textStatus, xhr);
		};
		
		return params;
	}
	
	WPGMZA.MarkerListing.prototype.onAJAXResponse = function(response, textStatus, xhr)
	{
		this.map.showPreloader(false);
		
		this.lastAJAXResponse = response;
		
		this.onHTMLResponse(response.html);
		this.initPagination();
	}
	
	WPGMZA.MarkerListing.prototype.onHTMLResponse = function(html)
	{
		$(this.element).html(html);
	}
	
	WPGMZA.MarkerListing.prototype.reload = function()
	{
		// NB: This allows for the marker category filter to work even if "No marker listing" is selected
		if(!this.element)
			return;
		
		var route = $(this.element).attr("data-wpgmza-rest-api-route");
		var params = this.getAJAXRequestParameters();
		
		this.map.showPreloader(true);
		
		WPGMZA.restAPI.call(route, params);
	}
	
	WPGMZA.MarkerListing.prototype.enable = function(value)
	{
		if(!value)
			this.pagination("disable");
		else
			this.pagination("enable");
	}
	
	WPGMZA.MarkerListing.prototype.getFilteringParameters = function()
	{
		var params = {};
		
		if(this.categoryDropdown.length && this.categoryDropdown.val() != "0")
			params.categories = [this.categoryDropdown.val()];
		
		if(this.categoryCheckboxes.length)
		{
			params.categories = [];
			
			this.categoryCheckboxes.each(function(index, el) {
				
				if($(el).prop("checked"))
					params.categories.push($(el).val());
				
			});
		}
		
		return params;
	}
	
	WPGMZA.MarkerListing.prototype.onFilteringComplete = function(event)
	{
		var self = this;
		
		if(this.showOnFilteringComplete)
		{
			$(this.element).show();
			delete this.showOnFilteringComplete;
		}
		
		this.overrideMarkerIDs = [];
		
		event.filteredMarkers.forEach(function(data) {
			self.overrideMarkerIDs.push(data.id);
		});
		
		this.lastFilteringParams = event.filteringParams;
		
		this.reload();
	}
	
	WPGMZA.MarkerListing.prototype.onItemClick = function(event)
	{
		var marker_id = $(event.currentTarget).attr("mid");
		var marker = this.map.getMarkerByID(marker_id);
		var listingPushedInMap = WPGMZA.maps[0].settings.push_in_map && WPGMZA.maps[0].settings.push_in_map.length;
		var clickedGetDirections = $(event.target).hasClass("wpgmza_gd");
		var zoomLevelOnClick = 13;
		
		marker.trigger("select");
		
		if(this.style != WPGMZA.MarkerListing.STYLE_MODERN && 
			!WPGMZA.settings.disable_scroll_on_marker_listing_click &&
			!clickedGetDirections &&
			!listingPushedInMap)
		{
			var offset = 0;
			
			if(WPGMZA.settings.marker_listing_item_click_scroll_offset)
				offset = parseInt(WPGMZA.settings.marker_listing_item_click_scroll_offset);
			
			$('html, body').animate({
				scrollTop: $(this.map.element).offset().top - offset
			}, 500);
		}
		
		if(this.map.settings.zoom_level_on_marker_listing_click)
			zoomLevelOnClick = this.map.settings.zoom_level_on_marker_listing_click;
		
		if(this.map instanceof WPGMZA.GoogleMap)
		{
			this.map.panTo(marker.getPosition());
			this.map.setZoom(zoomLevelOnClick);
		}
		else
		{
			this.map.panTo(marker.getPosition(), zoomLevelOnClick);
		}
	}
	
	/*$(document).ready(function() {
		
		$("[data-wpgmza-marker-listing]:not([data-wpgmza-carousel-marker-listing])").each(function(index, el) {
			
			// TODO: When the Map object takes over responsibility for this, store a back reference to the map
			el.wpgmzaMarkerListing = WPGMZA.MarkerListing.createInstance(el);
			
		});
		
	});*/
	
});