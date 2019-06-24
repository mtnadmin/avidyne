jQuery(function($) {
	
	if(!window.WPGMZA)
		window.WPGMZA = {};
	
	WPGMZA.ContentEditorMapButton = function(element)
	{
		var self = this;
		
		this.element = element;
		
		$(element).on("click", function(event) {
			self.onClick(event);
		});
		
		$(document).on("click", ".wpgmza-insert-map", function(event) {
			self.onInsertMap(event);
		});
		
		$(document).on("click", ".wpgmza-quick-create", function(event) {
			self.onQuickCreateMap(event);
		});
	}
	
	WPGMZA.ContentEditorMapButton.createInstance = function(element)
	{
		return new WPGMZA.ContentEditorMapButton(element);
	}
	
	WPGMZA.ContentEditorMapButton.prototype.insertShortcode = function(map_id)
	{
		var shortcode = "[wpgmza id='" + map_id + "']";
		
		if(tinymce.activeEditor)
			tinymce.activeEditor.execCommand("mceInsertContent", false, shortcode);
		else
		{
			var textarea = $("#wp-content-editor-container textarea")[0];
			
			if(textarea.setSelectionRange)
			{
				textarea.value = textarea.value.substring(0, textarea.selectionStart) +
					shortcode +
					textarea.value.substring(textarea.selectionStart, textarea.selectionEnd) +
					textarea.value.substring(textarea.selectionEnd, textarea.value.length);
			}
			else
			{
				textarea.focus();
				var range = document.selection.createRange();
				range.text = shortcode + range.text;
			}
		}
	}
	
	WPGMZA.ContentEditorMapButton.prototype.onClick = function()
	{
		WPGMZA.ContentEditorMapButton.dialog.open();
	}
	
	WPGMZA.ContentEditorMapButton.prototype.onInsertMap = function(event)
	{
		var map_id = $(".wpgmza-add-map-dialog select[name='map']").val();
		this.insertShortcode(map_id);
	}
	
	WPGMZA.ContentEditorMapButton.prototype.onQuickCreateMap = function(event)
	{
		var self = this;
		
		$(event.target).prop("disabled", true);
		
		var address = $(".wpgmza-add-map-dialog input[name='wpgmza-address']").val();
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({'address': address}, function(results, status) {
			$(event.target).prop("disabled", false);
			
			if(status == "OK")
			{
				var latLng = results[0].geometry.location;
				self.onGeocodeSuccessful(latLng);
			}
			else
			{
				alert("Failed to find the specified address");
			}
		});
	}
	
	WPGMZA.ContentEditorMapButton.prototype.onGeocodeSuccessful = function(latLng)
	{
		var self = this;
		
		$.ajax(ajaxurl, {
			method: "POST",
			data: {
				action: "wpgmza_quick_create_map",
				title: $(".wpgmza-add-map-dialog [name='wpgmza-title']").val(),
				address: $(".wpgmza-add-map-dialog [name='wpgmza-address']").val(),
				lat: latLng.lat(),
				lng: latLng.lng()
			},
			success: function(response, status, xhr) {
				if(!response.success)
				{
					self.onFail();
					return;
				}
				
				self.insertShortcode(response.map_id);
				WPGMZA.ContentEditorMapButton.dialog.close();
			},
			complete: function(response, status, xhr) {
				$(event.target).prop("disabled", false);
			},
			error: function()
			{
				self.onFail();
			}
		});
	}
	
	WPGMZA.ContentEditorMapButton.prototype.onFail = function()
	{
		alert("There was problem creating your map, please try again");
	}
	
	$(document).ready(function(event) {
		
		var el = WPGMZA.ContentEditorMapButton.dialogElement = $(wpgmza_map_select_dialog_html);
		var address = $(el).find("[name='wpgmza-address']")[0];
		address.autoComplete = new google.maps.places.Autocomplete(address, {fields: ["name", "formatted_address"]});
		WPGMZA.ContentEditorMapButton.dialog = $(el).remodal();
		
		
		$(document.body).append(WPGMZA.ContentEditorMapButton.dialog);
		
		$(document).find(".wpgmza-content-editor-add-map").each(function(index, el) {
			
			el.contentEditorMapButton = WPGMZA.ContentEditorMapButton.createInstance(el);
			
		});
		
	});
	
});