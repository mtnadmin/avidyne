/**
 * @namespace WPGMZA
 * @module OLProInfoWindow
 * @requires WPGMZA.OLInfoWindow
 */
jQuery(function($) {
	
	WPGMZA.OLProInfoWindow = function(mapObject)
	{
		WPGMZA.OLInfoWindow.call(this, mapObject);
	}
	
	WPGMZA.OLProInfoWindow.prototype = Object.create(WPGMZA.OLInfoWindow.prototype);
	WPGMZA.OLProInfoWindow.prototype.constructor = WPGMZA.OLProInfoWindow;
	
	WPGMZA.OLProInfoWindow.prototype.open = function(map, mapObject)
	{
		this.mapObject = mapObject;
		
		var style = (WPGMZA.currentPage == "map-edit" ? WPGMZA.ProInfoWindow.STYLE_NATIVE_GOOGLE : this.style);
		
		switch(style)
		{
			case WPGMZA.ProInfoWindow.STYLE_MODERN:
			case WPGMZA.ProInfoWindow.STYLE_MODERN_PLUS:
			case WPGMZA.ProInfoWindow.STYLE_MODERN_CIRCULAR:
			case WPGMZA.ProInfoWindow.STYLE_TEMPLATE:
				return WPGMZA.ProInfoWindow.prototype.open.call(this, map, mapObject);
				break;
			
			default:
				return WPGMZA.OLInfoWindow.prototype.open.call(this, map, mapObject);
				break;
		}
	}
	
});