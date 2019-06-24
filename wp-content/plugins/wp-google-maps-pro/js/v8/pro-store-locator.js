/**
 * @namespace WPGMZA
 * @module ProStoreLocator
 * @requires WPGMZA.StoreLocator
 */
jQuery(function($) {
	
	WPGMZA.ProStoreLocator = function(map, element)
	{
		var self = this;
		
		WPGMZA.StoreLocator.call(this, map, element);
		
		if(map.settings.store_locator_use_their_location == "1")
		{
			var input = $(this.element).find(".addressInput");
			var button = new WPGMZA.UseMyLocationButton(input);
			input.after(button.element);
		}
		
		this.map.on("init", function(event) {
			
			self.map.markerFilter.on("filteringcomplete", function(event) {
				self.onFilteringComplete(event);
			});
			
		});
	}
	
	WPGMZA.ProStoreLocator.prototype = Object.create(WPGMZA.StoreLocator.prototype);
	WPGMZA.ProStoreLocator.prototype.constructor = WPGMZA.ProStoreLocator;
	
	WPGMZA.StoreLocator.createInstance = function(map, element)
	{
		return new WPGMZA.ProStoreLocator(map, element);
	}
	
	Object.defineProperty(WPGMZA.ProStoreLocator.prototype, "distanceUnits", {
	
		"get": function() {
			if(this.map.settings.store_locator_distance == 1)
				return WPGMZA.Distance.MILES;
			
			return WPGMZA.Distance.KILOMETERS;
		}
	
	});
	
	Object.defineProperty(WPGMZA.ProStoreLocator.prototype, "keywords", {
		
		"get": function() {
			return $(".wpgmza_name_search_string + input").val()
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProStoreLocator.prototype, "categories", {
		
		"get": function() {
			var dropdown, checkboxes, value, results;
			
			if((dropdown = $(this.element).find(".wpgmza_sl_category_div > select")).length)
			{
				value = dropdown.val();
				
				if(value == "0")
					return null;
				
				return [value];
			}
			
			$(this.element).find(".wpgmza_sl_category_div :checked").each(function(index, el) {
				
				if(!results)
					results = [];
				
				results.push( $(el).val() );
				
			});
			
			return results;
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProStoreLocator.prototype, "circleStrokeColor", {
		
		"get": function() {
			
			if(this.map.settings.sl_stroke_color)
				return "#" + this.map.settings.sl_stroke_color;
			
			return "#ff0000";
			
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProStoreLocator.prototype, "circleFillColor", {
		
		"get": function() {
			
			if(this.map.settings.sl_fill_color)
				return "#" + this.map.settings.sl_fill_color;
			
			return "#ff0000";
			
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProStoreLocator.prototype, "circleStrokeOpacity", {
		
		"get": function() {
			
			if(this.map.settings.sl_stroke_opacity)
				return parseFloat(this.map.settings.sl_stroke_opacity);
			
			return 0.25;
			
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProStoreLocator.prototype, "circleFillOpacity", {
		
		"get": function() {
			
			if(this.map.settings.sl_fill_opacity)
				return parseFloat(this.map.settings.sl_fill_opacity);
			
			return 0.15;
			
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProStoreLocator.prototype, "circle", {
		
		"get": function() {
			
			if(this._circle)
				return this._circle;
			
			if(this.map.settings.wpgmza_store_locator_radius_style == "modern")
			{
				this._circle = WPGMZA.ModernStoreLocatorCircle.createInstance(this.map.id);
				this._circle.settings.color = this.circleStrokeColor;
			}
			else
			{
				this._circle = WPGMZA.Circle.createInstance({
					strokeColor:	this.circleStrokeColor,
					strokeOpacity:	this.circleStrokeOpacity,
					strokeWeight:	2,
					fillColor:		this.circleFillColor,
					fillOpacity:	this.circleFillOpacity,
					visible:		false
				});
			}
			
			return this._circle;
			
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProStoreLocator.prototype, "marker", {
		
		"get": function() {
			
			if(this.map.settings.store_locator_bounce != 1)
				return null;
			
			if(this._marker)
				return this._marker;
			
			var options = {
				visible: false
			};
			
			if(this.map.settings.upload_default_sl_marker && this.map.settings.upload_default_sl_marker.length)
				options.icon = this.map.settings.upload_default_sl_marker;
			
			this._marker = WPGMZA.Marker.createInstance();
			this._marker.disableInfoWindow = true;
			
			if(this.map.settings.wpgmza_sl_animation)
				this._marker.setAnimation(this.map.settings.wpgmza_sl_animation);
			
			return this._marker;
			
		}
		
	});
	
	WPGMZA.ProStoreLocator.prototype.getFilteringParameters = function()
	{
		if(this.state == WPGMZA.StoreLocator.STATE_INITIAL)
			return {};	// No search has been performed yet
		
		var params = WPGMZA.StoreLocator.prototype.getFilteringParameters.call(this);
		
		var proParams = {};
		
		if(this.keywords)
			proParams.keywords = this.keywords;
		
		if(this.categories)
			proParams.categories = this.categories;
		
		return $.extend(params, proParams);
	}
	
	WPGMZA.ProStoreLocator.prototype.onFilteringComplete = function(event)
	{
		var params = event.filteringParams;
		var circle = this.circle;
		var marker = this.marker;
		var factor = (this.distanceUnits == WPGMZA.Distance.MILES ? WPGMZA.Distance.KILOMETERS_PER_MILE : 1.0);
		
		if(marker)
			marker.setVisible(false);
		
		if(circle)
			circle.setVisible(false);
		
		if(params.center && marker)
		{
			marker.setPosition(params.center);
			marker.setVisible(true);
			
			if(marker.map != this.map)
				this.map.addMarker(marker);
		}
		
		if(params.center && params.radius && circle)
		{
			if(circle instanceof WPGMZA.ModernStoreLocatorCircle)
				circle.settings.radiusString = Math.round(params.radius);
			
			circle.setRadius(params.radius * factor);
			circle.setCenter(params.center);
			circle.setVisible(true);
			
			if(circle.map != this.map)
				this.map.addCircle(circle);
		}
	}
	
});