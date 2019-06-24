/**
 * @namespace WPGMZA
 * @module ProMarker
 * @requires WPGMZA.Marker
 */
jQuery(function($) {
	
	WPGMZA.ProMarker = function(row)
	{
		var self = this;
		
		this.title = "";
		this.description = "";
		this.categories = [];
		this.approved = 1;
		
		if(row && row.category && row.category.length)
		{
			var m = row.category.match(/\d+/g);
			
			if(m)
				this.categories = m;
		}
		
		WPGMZA.Marker.call(this, row);
		
		this.on("mouseover", function(event) {
			self.onMouseOver(event);
		});
	}
	
	WPGMZA.ProMarker.prototype = Object.create(WPGMZA.Marker.prototype);
	WPGMZA.ProMarker.prototype.constructor = WPGMZA.ProMarker;
	
	WPGMZA.ProMarker.prototype.onAdded = function(event)
	{
		var m;
		
		WPGMZA.Marker.prototype.onAdded.call(this, event);
		
		this.updateIcon();
		
		if(this.map.storeLocator && this == this.map.storeLocator.marker)
			return;
		
		if(this == this.map.userLocationMarker)
			return;
		
		if(this.map.settings.store_locator_hide_before_search)
		{
			this.isFiltered = true;
			this.setVisible(false);
			return;
		}
		
		if(
			WPGMZA.getQueryParamValue("markerid") == this.id
			|| 
			this.map.shortcodeAttributes.marker == this.id
			)
		{
			this.openInfoWindow();
			this.map.setCenter(this.getPosition());
		}
	}
	
	WPGMZA.ProMarker.prototype.onClick = function(event)
	{
		WPGMZA.Marker.prototype.onClick.apply(this, arguments);
		
		if(this.map.settings.click_open_link == 1 && this.linkd && this.linkd.length)
			window.open(this.linkd);
	}
	
	WPGMZA.ProMarker.prototype.onMouseOver = function(event)
	{
		if(WPGMZA.settings.wpgmza_settings_map_open_marker_by == WPGMZA.ProInfoWindow.OPEN_BY_HOVER)
			this.openInfoWindow();
	}
	
	WPGMZA.ProMarker.prototype.getIcon = function()
	{
		function stripProtocol(url)
		{
			if(typeof url != "string")
				return url;
			
			return url.replace(/^http(s?):/, "");
		}
		
		// NB: Redundant, this is now done on the DB
		if(this.icon && this.icon.length || (window.google && this.icon instanceof google.maps.MarkerImage))
			return stripProtocol(this.icon);
		
		/*var categoryIcon = this.getIconFromCategory();
		if(categoryIcon)
			return stripProtocol(categoryIcon);*/
		
		var defaultIcon = this.map.settings.upload_default_marker;
		if(defaultIcon && defaultIcon.length)
			return stripProtocol(defaultIcon);
		
		return WPGMZA.Marker.prototype.getIcon.call(this);
	}
	
	WPGMZA.ProMarker.prototype.getIconFromCategory = function()
	{
		if(!this.categories.length)
			return;
		
		var self = this;
		var categoryIDs = this.categories.slice();
		
		// TODO: This could be taken from the category table now that it's cached. Would take some load off the client
		categoryIDs.sort(function(a, b) {
			var categoryA = self.map.getCategoryByID(a);
			var categoryB = self.map.getCategoryByID(b);
			
			if(!categoryA || !categoryB)
				return null;	// One of the category IDs is invalid
			
			return (categoryA.depth < categoryB.depth ? -1 : 1);
		});
		
		for(var i = 0; i < categoryIDs.length; i++)
		{
			var category = this.map.getCategoryByID(categoryIDs[i]);
			if(!category)
				continue;	// Invalid category ID
			
			var icon = category.icon;
			if(icon && icon.length)
				return icon;
		}
	}
	
	WPGMZA.ProMarker.prototype.setIcon = function(icon)
	{
		this.icon = icon;
		this.updateIcon();
	}
	
	WPGMZA.ProMarker.prototype.openInfoWindow = function()
	{
		WPGMZA.Marker.prototype.openInfoWindow.apply(this);
		
		if(this.disableInfoWindow)
			return false;
		
		if(this.map && this.map.userLocationMarker == this)
			this.infoWindow.setContent(WPGMZA.localized_strings.my_location);
	}
	
	
	
	
	
});