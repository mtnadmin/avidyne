/**
 * @namespace WPGMZA
 * @module GoogleProMap
 * @requires WPGMZA.GoogleMap
 */
jQuery(function($) {
	WPGMZA.GoogleProMap = function(element, options)
	{
		WPGMZA.GoogleMap.call(this, element, options);
		
		// Load KML layers
		this.loadKMLLayers();
		
		// Dispatch event
		this.trigger("init");
		
		this.dispatchEvent("created");
		WPGMZA.events.dispatchEvent({type: "mapcreated", map: this});
	}
	
	WPGMZA.GoogleProMap.prototype = Object.create(WPGMZA.GoogleMap.prototype);
	WPGMZA.GoogleProMap.prototype.constructor = WPGMZA.GoogleProMap.prototype;
	
	WPGMZA.GoogleProMap.prototype.addHeatmap = function(heatmap)
	{
		heatmap.googleHeatmap.setMap(this.googleMap);
		
		WPGMZA.ProMap.prototype.addHeatmap.call(this, heatmap);
	}
	
	/**
	 * Loads KML/GeoRSS layers
	 * @return void
	 */
	WPGMZA.GoogleProMap.prototype.loadKMLLayers = function()
	{
		// Remove old layers
		if(this.kmlLayers)
		{
			for(var i = 0; i < this.kmlLayers.length; i++)
				this.kmlLayers[i].setMap(null);
		}
		
		this.kmlLayers = [];
		
		if(!this.settings.kml)
			return;
		
		// Add layers
		var urls = this.settings.kml.split(",");
		var cachebuster = new Date().getTime();
		
		for(var i = 0; i < urls.length; i++)
		{
			this.kmlLayers.push(
				new google.maps.KmlLayer(urls[i] + "?cachebuster=" + cachebuster,
					{
						map: this.googleMap,
						preserveViewport: true
					}
				)
			);
		}
	}
	
	WPGMZA.GoogleProMap.prototype.loadFusionTableLayer = function() 
	{
		if(!this.settings.fusion)
			return;
		
		this.fusionLayer = new google.maps.FusionTablesLayer(this.settings.fusion, {
			map: this.googleMap,
			surpressInfoWindows: true
		});
	}
	
});