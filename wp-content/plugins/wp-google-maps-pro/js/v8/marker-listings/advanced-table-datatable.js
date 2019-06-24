/**
 * @namespace WPGMZA
 * @module AdvancedTableDataTable
 * @requires WPGMZA.DataTable
 */
jQuery(function($) {
	
	WPGMZA.AdvancedTableDataTable = function(element)
	{
		var self = this;
		
		this.element = element;
		
		WPGMZA.DataTable.apply(this, arguments);
		
		this.overrideListingOrderSettings = false;
		
		$(this.dataTableElement).on("click", "th.sorting", function(event) {
			
			self.onUserChangedOrder(event);
			
		});
		
		$(document.body).on("init.wpgmza", function(event) {
			
			if(event.target == self.map)
				self.map.markerFilter.on("filteringcomplete", function(event) {
					self.onMarkerFilterFilteringComplete(event);
				});
			
		});
	}
	
	WPGMZA.AdvancedTableDataTable.prototype = Object.create(WPGMZA.DataTable.prototype);
	WPGMZA.AdvancedTableDataTable.prototype.constructor = WPGMZA.AdvancedTableDataTable;
	
	WPGMZA.AdvancedTableDataTable.prototype.getDataTableSettings = function()
	{
		var self = this;
		var options = WPGMZA.DataTable.prototype.getDataTableSettings.apply(this, arguments);
		
		options.drawCallback = function(settings) {
			
			var ths = $(self.element).find("thead th");
			
			if(settings.json.data.length == 0)
				return;
			
			$(self.element).find("tbody>tr").each(function(index, tr) {
				
				var meta = settings.json.meta[index];
				
				$(tr).addClass("wpgmaps_mlist_row");
				$(tr).attr("mid", meta.id);
				$(tr).attr("mapid", self.map.id);
				
				$(tr).find("td").each(function(col, td) {
					
					var wpgmza_class = ths[col].className.match(/wpgmza_\w+/)[0];
					$(td).addClass(wpgmza_class);
					
				});
				
			});
			
		};
		
		return options;
	}
	
	WPGMZA.AdvancedTableDataTable.prototype.onAJAXRequest = function(data, settings)
	{
		var request = WPGMZA.DataTable.prototype.onAJAXRequest.apply(this, arguments);
		
		if(this.filteredMarkerIDs)
			request.wpgmzaDataTableRequestData.markerIDs = this.filteredMarkerIDs.join(",");
		
		if(this.filteringParams)
			request.wpgmzaDataTableRequestData.filteringParams = this.filteringParams;
		
		request.wpgmzaDataTableRequestData.overrideListingOrderSettings = this.overrideListingOrderSettings;
		
		
		return request;
	}
	
	WPGMZA.AdvancedTableDataTable.prototype.onMarkerFilterFilteringComplete = function(event)
	{
		var self = this;
		
		this.filteredMarkerIDs = [];
		
		event.filteredMarkers.forEach(function(data) {
			self.filteredMarkerIDs.push(data.id);
		});
		
		self.filteringParams = event.filteringParams;
	}
	
	WPGMZA.AdvancedTableDataTable.prototype.onUserChangedOrder = function(event)
	{
		this.overrideListingOrderSettings = true;
	}
	
});