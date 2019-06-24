/**
 * @namespace WPGMZA
 * @module ModernDirectionsResultBox
 * @requires WPGMZA.PopoutPanel
 */
jQuery(function($) {
	
	/**
	 * The second step of the directions box
	 * @return Object
	 */
	WPGMZA.ModernDirectionsResultBox = function(map_id, directionsBox)
	{
		WPGMZA.PopoutPanel.apply(this, arguments);
		
		var self = this;
		var container = $("#wpgmza_map_" + map_id);
		
		this.directionsBox = directionsBox;
		this.map_id = map_id;
		this.mapElement = container;
		
		// Build element
		this.element = $("<div class='wpgmza-popout-panel wpgmza-modern-directions-box'>\
			<h2>" + $(directionsBox.element).find("h2").html() + "</h2>\
			<div class='wpgmza-directions-buttons'>\
				<span class='wpgmza-close'><i class='fa fa-arrow-left' aria-hidden='true'></i></span>\
				<a class='wpgmza-print' style='display: none;'><i class='fa fa-print' aria-hidden='true'></i></a>\
			</div>\
			<div class='wpgmza-directions-results'>\
			</div>\
		</div>");
		
		var nativeIcon = new WPGMZA.NativeMapsAppIcon();
		this.nativeMapAppIcon = nativeIcon;
		$(this.element).find(".wpgmza-directions-buttons").append(nativeIcon.element);
		$(nativeIcon.element).on("click", function(event) {
			self.onNativeMapsApp(event);
		});
		
		// Add to DOM tree
		container.append(this.element);
		
		// Print directions link
		$(this.element).find(".wpgmza-print").attr("href", "data:text/html,<script>document.body.innerHTML += sessionStorage.wpgmzaPrintDirectionsHTML; window.print();</script>");
		
		// Event listeners
		$(this.element).find(".wpgmza-close").on("click", function(event) {
			self.close();
		});
		
		$(this.element).find(".wpgmza-print").on("click", function(event) {
			self.onPrint(event);
		});
		
		$(this.mapElement).on("directionsserviceresult", function(event, response, status) {
			self.onDirectionsChanged(event, response, status);
		});
		
		// Initial state
		this.clear();
	};
	
	WPGMZA.ModernDirectionsResultBox.prototype = Object.create(WPGMZA.PopoutPanel.prototype);
	WPGMZA.ModernDirectionsResultBox.prototype.constructor = WPGMZA.ModernDirectionsResultBox;
	
	WPGMZA.ModernDirectionsResultBox.prototype.clear = function()
	{
		$(this.element).find(".wpgmza-directions-results").html("");
		$(this.element).find("a.wpgmza-print").attr("href", "");
	};
	
	WPGMZA.ModernDirectionsResultBox.prototype.open = function()
	{
		WPGMZA.PopoutPanel.prototype.open.apply(this, arguments);
		this.showPreloader();
	};
	
	WPGMZA.ModernDirectionsResultBox.prototype.showPreloader = function()
	{
		$(this.element).find(".wpgmza-directions-results").html("<img src='" + wpgmza_ajax_loader_gif.src + "'/>");
	};
	
	WPGMZA.ModernDirectionsResultBox.prototype.onDirectionsChanged = function(event, response, status)
	{
		this.clear();
		
		switch(status)
		{
			case google.maps.DirectionsStatus.OK:
				directionsDisplay[this.map_id].setPanel(
					$(this.element).find(".wpgmza-directions-results")[0]
				);
				break;
				
			case google.maps.DirectionsStatus.NOT_FOUND:
			case google.maps.DirectionsStatus.ZERO_RESULTS:
			case google.maps.DirectionsStatus.MAX_WAYPOINTS_EXCEEDED:
			case google.maps.DirectionsStatus.MAX_ROUTE_LENGTH_EXCEEDED:
			case google.maps.DirectionsStatus.INVALID_REQUEST:
			case google.maps.DirectionsStatus.OVER_QUERY_LIMIT:
			case google.maps.DirectionsStatus.REQUEST_DENIED:
			 
				var key = status.toLowerCase();
				var message = wpgmza_localized_strings[key];
				
				$(this.element).find(".wpgmza-directions-results").html(
					'<i class="fa fa-times" aria-hidden="true"></i>' + message
				);
				
				break;
			
			default:
				
				var message = wpgmza_localized_string.unknown_error;
				
				$(this.element).find(".wpgmza-directions-results").html(
					'<i class="fa fa-times" aria-hidden="true"></i>' + message
				);
				
				break;
		}
	};
	
	WPGMZA.ModernDirectionsResultBox.prototype.onNativeMapsApp = function(event)
	{
		// TODO: Change this to use lat/lng
		var appleOrGoogle = this.nativeMapAppIcon.type;
		var params = {
			saddr: this.directionsBox.from,
			daddr: this.directionsBox.to,
			dirflg: $("#wpgmza_dir_type_" + this.map_id).val().substr(0, 1).toLowerCase(),
			om: 1
		};
		var arr = [];
		var url;
		
		for(var name in params)
			arr.push(name + "=" + encodeURIComponent(params[name]));
		
		url = "https://maps." + appleOrGoogle + ".com/?" + arr.join("&");

		window.open(url, "_blank");
	};
	
	WPGMZA.ModernDirectionsResultBox.prototype.onPrint = function(event)
	{
		var content = $(this.element).find(".wpgmza-directions-results").html();
		var doc = document.implementation.createHTMLDocument();
		var html;
		
		// sessionStorage.wpgmzaPrintDirectionsHTML = content;
	};
	
	
});