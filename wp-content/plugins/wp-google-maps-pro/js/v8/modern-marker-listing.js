/**
 * @namespace WPGMZA
 * @module ModernMarkerListing
 * @requires WPGMZA.PopoutPanel
 */
jQuery(function($) {
	
	/**
	 * The modern look and feel marker listing
	 * @return Object
	 */
	WPGMZA.ModernMarkerListing = function(map_id)
	{
		var self = this;
		
		console.log("Created ModernMarkerListing for map " + map_id);
		
		WPGMZA.PopoutPanel.apply(this, arguments);
		
		// Build element
		var container = $("#wpgmza_map_" + map_id);
		var mashup_ids = container.attr("data-mashup-ids");
		
		this.element = $("<div class='wpgmza-popout-panel wpgmza-modern-marker-listing'>\
			<div class='wpgmza-close-container'>\
				<span class='wpgmza-close'><i class='fa fa-times' aria-hidden='true'></i></span>\
			</div>\
			<ul>\
			</ul>\
		</div>");
		
		this.map_id = map_id;
		this.mapElement = container;
		this.mapElement.append(this.element);
		
		// List items
		this.list = $(this.element).find("ul");
		
		this.markers = wpgmaps_localize_marker_data[map_id];
		
		var order = window["wpgmza_modern_marker_listing_marker_order_by_id_for_map_" + map_id];
		
		var mashup = container[0].hasAttribute("data-mashup-ids");
		var markers_by_id = [];
		
		if(mashup)
		{
			for(var i = 0; i < this.markers.length; i++)
				markers_by_id[ this.markers[i].marker_id ] = this.markers[i];
		}
		
		function getMarkerByID(id)
		{
			if(!mashup)
				return self.markers[id];
			
			return markers_by_id[id];
		}
		
		for(var index = 0; index < order.length; index++)
		{
			var marker_id = order[index];
			var marker = getMarkerByID(marker_id);
			var li = $(WPGMZA.ModernMarkerListing.listItemHTML);
			var fields = $(li).find("[data-name]");
			
			$(li).attr("mid", marker_id);
			$(li).attr("mapid", map_id);
			
			for(var i = 0; i < fields.length; i++)
			{
				var name = $(fields[i]).attr("data-name");
				
				if(!marker[name])
					continue;
				
				$(fields[i]).html(marker[name]);
			}
			
			if(marker.pic)
				$(li).find(".wpgmza-marker-listing-pic").attr("src", marker.pic);
			
			this.list.append(li);
		}
		
		// Marker view
		this.markerView = new WPGMZA.ModernMarkerListingMarkerView(map_id);
		
		// Open button
		
		
		
		$(container).append($('<div class="wpgmza-modern-marker-open-button wpgmza-modern-shadow wpgmza-modern-hover-opaque"><i class="fa fa-map-marker"></i> <i class="fa fa-list"></i></div>'));
		
		var button = $(container).find(".wpgmza-modern-marker-open-button");
		
		button.attr("data-map-id", map_id);
		
		console.log("Appended", button, "to", container);
		
		button.on("click", function(event) {
			self.open();
            $("#wpgmza_map_" + map_id + " .wpgmza-modern-store-locator").addClass("wpgmza_sl_offset");
		});
		
		// Event listeners
		$(this.element).find(".wpgmza-close-container").on("click", function(event) {
			self.close();
            $("#wpgmza_map_" + map_id + " .wpgmza-modern-store-locator").removeClass("wpgmza_sl_offset");
		});
		
		$(this.element).on("click", "li", function(event) {
			self.markerView.open($(event.currentTarget).attr("mid"));
		});
		
		$(document.body).on("click", ".wpgmza_sl_reset_button_" + map_id, function(event) {
			$(self.element).find("li[mid]").show();
		});
		
		$("select[mid='" + map_id + "'][name='wpgmza_filter_select']").on("change", function(event) {
			self.updateFilteredItems();
		});
		
		$(".wpgmza_checkbox[mid='" + map_id + "']").on("change", function(event) {
			self.updateFilteredItems();
		});
	};
	
	WPGMZA.ModernMarkerListing.prototype = Object.create(WPGMZA.PopoutPanel.prototype);
	WPGMZA.ModernMarkerListing.prototype.constructor = WPGMZA.ModernMarkerListing;
	
	WPGMZA.ModernMarkerListing.prototype.setVisibleListItems = function(marker_ids)
	{
		$(this.element).find("li").each(function(index, el) {
			
			if(!el.hasAttribute("mid"))
				return;
			
			var visible = marker_ids.indexOf( $(el).attr("mid") ) != -1;
			
			if(visible)
				$(el).show();
			else
				$(el).hide();
			
		});
	}
	
	WPGMZA.ModernMarkerListing.prototype.updateFilteredItems = function()
	{
		//var categories = this.getSelectedCategories();
	}
	
	WPGMZA.ModernMarkerListing.prototype.getSelectedCategories = function()
	{
		var select = $("select[mid='" + this.map_id + "'][name='wpgmza_filter_select']");
		var checkboxes = $(".wpgmza_checkbox[mid='" + this.map_id + "']:checked");
		var categories = [];
		
		if(select.length)
			categories.push(select.val());
		else
		{
			checkboxes.each(function(index, el) {
				categories.push($(el).val());
			});
		}
		
		return categories;
	}
	
	WPGMZA.ModernMarkerListing.listItemHTML = "\
		<li class='wpgmaps_mlist_row'>\
			<img class='wpgmza-marker-listing-pic'/>\
			<div data-name='title'/>\
			<div data-name='address'/>\
			<div data-name='desc'/>\
		</li>\
	";
	
});