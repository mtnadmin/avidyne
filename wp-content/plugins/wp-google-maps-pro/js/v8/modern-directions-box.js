/**
 * @namespace WPGMZA
 * @module ModernDirectionsBox
 * @requires WPGMZA.PopoutPanel
 */
jQuery(function($) {
	
	/**
	 * The new modern look directions box. It takes the elements
	 * from the default look and moves them into the map, wrapping
	 * in a new element so we can apply new styles.
	 * @return Object
	 */
	WPGMZA.ModernDirectionsBox = function(map_id) {
		
		WPGMZA.PopoutPanel.apply(this, arguments);
		
		var self = this;
		var original = $("div#wpgmaps_directions_edit_" + map_id);
		
		MYMAP[map_id].directionsBox = this;
		this.map_id = map_id;
		
		if(!original.length)
			return;
		
		var container = $("#wpgmza_map_" + map_id);
		this.mapElement = container;
		
		// Build element
		this.element = $("<div class='wpgmza-popout-panel wpgmza-modern-directions-box'></div>");
		
		// Add to DOM tree
		this.element.append(original);
		container.append(this.element);
		
		// Add buttons
		$(this.element).find("h2").after($("\
			<div class='wpgmza-directions-buttons'>\
				<span class='wpgmza-close'><i class='fa fa-arrow-left' aria-hidden='true'></i></span>\
			</div>\
		"));
		
		var nativeIcon = new WPGMZA.NativeMapsAppIcon();
		this.nativeMapAppIcon = nativeIcon;
		$(this.element).find(".wpgmza-directions-buttons").append(nativeIcon.element);
		$(nativeIcon.element).on("click", function(event) {
			self.onNativeMapsApp(event);
		});
		
		// Remove labels
		$(this.element).find("td:first-child").remove();
		
		// Move show options and options box to after the type select
		var row = $(this.element).find("select[name^='wpgmza_dir_type']").closest("tr");
		$(this.element).find(".wpgmaps_to_row").after(row);
		
		// Options box
		$(this.element).find("#wpgmza_options_box_" + map_id).addClass("wpgmza-directions-options");
		
		// Fancy checkboxes (This would require adding admin styles)
		//$(this.element).find("input:checkbox").addClass("postform cmn-toggle cmn-toggle-round-flat");
		
		// NB: Via waypoints is handled below to be compatible with legacy systems. Search "Waypoint JS"
		
		// Result box
		this.resultBox = new WPGMZA.ModernDirectionsResultBox(map_id, this);
		
		// Bind listeners
		$(document.body).on("click", ".wpgmza_map .wpgmza_gd", function(event) {
			
			if($(event.target).closest("[data-map-id]").attr("data-map-id") != self.map_id)
				return;
			
			//var address = $(event.currentTarget).attr("wpgm_addr_field");
			//$(self.element).find(".wpgmza-directions-to").val(address);
			
			self.open();
			
		});
		
		$(document.body).on("click", "#wpgmza_marker_list_" + map_id + " .wpgmza_gd", function(event) {
			
			var address = $(event.currentTarget).attr("wpgm_addr_field");
			$(self.element).find(".wpgmza-directions-to").val(address);
			
			self.open();
			
		});
		
		$(this.element).find(".wpgmza-close").on("click", function(event) {
			self.close();
		});
		
		$(this.element).find(".wpgmaps_get_directions").on("click", function(event) {
			if(self.from.length == 0 || self.to.length == 0)
				return;
			
			self.resultBox.open();
		});
	};
	
	WPGMZA.ModernDirectionsBox.prototype = Object.create(WPGMZA.PopoutPanel.prototype);
	WPGMZA.ModernDirectionsBox.prototype.constructor = WPGMZA.ModernDirectionsBox;
	
	Object.defineProperty(WPGMZA.ModernDirectionsBox.prototype, "from", {
		get: function() {
			return $(this.element).find("#wpgmza_input_from_" + this.map_id).val()
		},
		set: function(value) {
			return $(this.element).find("#wpgmza_input_from_" + this.map_id).val(value)
		}
	});
	
	Object.defineProperty(WPGMZA.ModernDirectionsBox.prototype, "to", {
		get: function() {
			return $(this.element).find("#wpgmza_input_to_" + this.map_id).val()
		},
		set: function(value) {
			return $(this.element).find("#wpgmza_input_to_" + this.map_id).val(value)
		}
	});
	
	/**
	 * Opens the popup and closes the results box if it's open
	 * @return void
	 */
	WPGMZA.ModernDirectionsBox.prototype.open = function() {
		WPGMZA.PopoutPanel.prototype.open.apply(this, arguments);
		
		if(this.resultBox)
			this.resultBox.close();
		
		$("#wpgmaps_directions_edit_" + this.map_id).show();
	};
	
	/**
	 * Fires when the "open native map" button is clicked
	 * @return void
	 */
	WPGMZA.ModernDirectionsBox.prototype.onNativeMapsApp = function() {
		// TODO: Change this to use lat/lng
		var appleOrGoogle = this.nativeMapAppIcon.type;
		var url = "https://maps." + appleOrGoogle + ".com/?daddr=" + encodeURIComponent($(this.element.find("#wpgmza_input_to_" + this.map_id)).val());
		window.open(url, "_blank");
	};
	
});