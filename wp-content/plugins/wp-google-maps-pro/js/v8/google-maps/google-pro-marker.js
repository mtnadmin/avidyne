/**
 * @namespace WPGMZA
 * @module GoogleProMarker
 * @requires WPGMZA.GoogleMarker
 */
jQuery(function($) {
	
	WPGMZA.GoogleProMarker = function(row)
	{
		WPGMZA.GoogleMarker.call(this, row);
	}
	
	WPGMZA.GoogleProMarker.prototype = Object.create(WPGMZA.GoogleMarker.prototype);
	WPGMZA.GoogleProMarker.prototype.constructor = WPGMZA.GoogleProMarker;
	
	WPGMZA.GoogleProMarker.prototype.onAdded = function(event)
	{
		WPGMZA.GoogleMarker.prototype.onAdded.apply(this, arguments);
		
		if(this.map.settings.wpgmza_settings_disable_infowindows)
			this.googleMarker.setOptions({clickable: false});
	}
	
	WPGMZA.GoogleProMarker.prototype.updateIcon = function()
	{
		var self = this;
		var icon = this.getIcon();
		
		if(this.settings.retina)
		{
			var img = new Image();
			img.onload = function(event) {
				var size = new google.maps.Size(
					Math.round(img.width / 2), 
					Math.round(img.height / 2)
				);
				self.googleMarker.setIcon(
					new google.maps.MarkerImage(icon, null, null, null, size)
				);
			};
			img.src = icon;
		}
		else
			this.googleMarker.setIcon(icon);
	}
	
});