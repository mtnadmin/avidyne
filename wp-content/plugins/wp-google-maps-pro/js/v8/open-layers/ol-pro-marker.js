/**
 * @namespace WPGMZA
 * @module OLProMarker
 * @requires WPGMZA.OLMarker
 */
jQuery(function($) {
	
	WPGMZA.OLProMarker = function(row)
	{
		WPGMZA.OLMarker.call(this, row);
	}
	
	WPGMZA.OLProMarker.prototype = Object.create(WPGMZA.OLMarker.prototype);
	WPGMZA.OLProMarker.prototype.constructor = WPGMZA.OLProMarker;
	
	WPGMZA.OLProMarker.prototype.updateIcon = function()
	{
		var icon = this.getIcon();
		
		if(typeof icon == "object" && "url" in icon)
			icon = icon.url;
		else if(typeof icon != "string")
			console.warn("Invalid marker icon");
		
		$(this.element).find("img").attr("src", icon);
	}
	
});