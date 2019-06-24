/**
 * @namespace WPGMZA
 * @module ProMarkerFilter
 * @requires WPGMZA.MarkerFilter
 */
jQuery(function($) {
	
	WPGMZA.ProMarkerFilter = function(map)
	{
		var self = this;
		
		WPGMZA.MarkerFilter.call(this, map);
	}
	
	WPGMZA.ProMarkerFilter.prototype = Object.create(WPGMZA.MarkerFilter.prototype);
	WPGMZA.ProMarkerFilter.prototype.constructor = WPGMZA.ProMarkerFilter;
	
	WPGMZA.MarkerFilter.createInstance = function(map)
	{
		return new WPGMZA.ProMarkerFilter(map);
	}
	
	WPGMZA.ProMarkerFilter.prototype.getFilteringParameters = function()
	{
		var params = WPGMZA.MarkerFilter.prototype.getFilteringParameters.call(this);
		var mashupIDs = this.map.mashupIDs;
		
		if(mashupIDs)
			params.mashupIDs = mashupIDs;
		
		if(this.map.markerListing)
			params = $.extend(params, this.map.markerListing.getFilteringParameters());
		
		if(this.map.customFieldFilterController)
		{
			var customFieldFilterAjaxParams = this.map.customFieldFilterController.getAjaxRequestData();
			var customFieldFilterFilteringParams = customFieldFilterAjaxParams.data.widgetData;
			params.customFields = customFieldFilterFilteringParams;
		}
		
		return params;
	}
	
	WPGMZA.ProMarkerFilter.prototype.update = function(params)
	{
		var self = this;
		
		if(this.updateTimeoutID)
			return;
		
		if(!params)
			params = {};
		
		if(this.xhr)
		{
			this.xhr.abort();
			delete this.xhr;
		}
		
		this.updateTimeoutID = setTimeout(function() {
			
			params = $.extend(self.getFilteringParameters(), params);
			
			if(params.center instanceof WPGMZA.LatLng)
				params.center = params.center.toLatLngLiteral();
			
			self.map.showPreloader(true);
			
			self.xhr = WPGMZA.restAPI.call("/markers/", {
				data: {
					fields: ["id"],
					filter: JSON.stringify(params),
				},
				success: function(result, status, xhr) {
					
					self.map.showPreloader(false);
					
					var event = new WPGMZA.Event("filteringcomplete");
					
					event.map = self.map;
					event.filteredMarkers = result;
					event.filteringParams = params;
					
					self.onFilteringComplete(event);
					
					self.trigger(event);
					self.map.trigger(event);
					
				}
			});
			
			delete self.updateTimeoutID;
			
		}, 0);
	}
	
	WPGMZA.ProMarkerFilter.prototype.onFilteringComplete = function(event)
	{
		var self = this;
		var map = [];
		
		event.filteredMarkers.forEach(function(data) {
			map[data.id] = true;
		});
		
		this.map.markers.forEach(function(marker) {
			
			if((self.map.storeLocator && marker == self.map.storeLocator.marker) || marker == self.map.userLocationMarker)
				return;
				
			var allowByFilter = map[marker.id];
			
			marker.isFiltered = (allowByFilter ? false : true);
			marker.setVisible(allowByFilter);
			
		});
	}
	
});