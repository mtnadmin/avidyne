/**
 * @namespace WPGMZA
 * @module AdvancedTableMarkerListing
 * @requires WPGMZA.MarkerListing
 */
jQuery(function($) {
	
	WPGMZA.AdvancedTableMarkerListing = function(map, element, options)
	{
		var self = this;
		
		// NB: Legacy compatibility
		this.element = element = $("#wpgmza_marker_holder_" + map.id + ", #wpgmza_marker_list_" + map.id);
		
		WPGMZA.MarkerListing.apply(this, arguments);
		
		this.dataTable = new WPGMZA.AdvancedTableDataTable(element);
		this.dataTable.map = map;
	}
	
	WPGMZA.AdvancedTableMarkerListing.prototype = Object.create(WPGMZA.MarkerListing.prototype);
	WPGMZA.AdvancedTableMarkerListing.prototype.constructor = WPGMZA.AdvancedTableMarkerListing;
	
	WPGMZA.AdvancedTableMarkerListing.prototype.reload = function()
	{
		if(!this.dataTable)
			return; // NB: Still construction. We return, as the dataTable will load itself on init.
		
		this.dataTable.reload();
	}
	
});