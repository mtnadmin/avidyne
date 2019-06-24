
// js/v8/core.js
/**
 * @module WPGMZA
 * @summary This is the core Javascript module. Some code exists in ../core.js, the functionality there will slowly be handed over to this module.
 */
jQuery(function($) {
	
	var core = {
		/**
		 * Indexed array of map instances
		 * @constant {array} maps
		 * @static
		 */
		maps: [],
		
		/**
		 * Global EventDispatcher used to listen for global plugin events
		 * @constant {EventDispatcher} events
		 * @static
		 */
		events: null,
		
		/**
		 * Settings, passed from the server
		 * @constant {object} settings
		 * @static
		 */
		settings: null,
		
		/**
		 * Instance of the restAPI. Not to be confused with WPGMZA.RestAPI, which is the instances constructor
		 * @constant {RestAPI} restAPI
		 * @static
		 */
		restAPI: null,
		
		/**
		 * Key and value pairs of localized strings passed from the server
		 * @constant {object} localized_strings
		 * @static
		 */
		localized_strings: null,
		
		loadingHTML: '<div class="wpgmza-preloader"><div class="wpgmza-loader">...</div></div>',
		
		/**
		 * Override this method to add a scroll offset when using animated scroll, useful for sites with fixed headers.
		 * @method getScrollAnimationOffset
		 * @static
		 * @return {number} The scroll offset
		 */
		getScrollAnimationOffset: function() {
			return (WPGMZA.settings.scroll_animation_offset || 0);
		},
		
		/**
		 * Animated scroll, accounts for animation settings and fixed header height
		 * @method animateScroll
		 * @static
		 * @param {HTMLElement} element The element to scroll to
		 * @param {number} [milliseconds] The time in milliseconds to scroll over. Defaults to 500 if no value is specified.
		 * @return void
		 */
		animateScroll: function(element, milliseconds) {
			
			var offset = WPGMZA.getScrollAnimationOffset();
			
			if(!milliseconds)
			{
				if(WPGMZA.settings.scroll_animation_milliseconds)
					milliseconds = WPGMZA.settings.scroll_animation_milliseconds;
				else
					milliseconds = 500;
			}
			
			$("html, body").animate({
				scrollTop: $(element).offset().top - offset
			}, milliseconds);
			
		},
		
		/**
		 * Generates and returns a GUID
		 * @method guid
		 * @static
		 * @return {string} The GUID
		 */
		guid: function() { // Public Domain/MIT
		  var d = new Date().getTime();
			if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
				d += performance.now(); //use high-precision timer if available
			}
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = (d + Math.random() * 16) % 16 | 0;
				d = Math.floor(d / 16);
				return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
			});
		},
		
		/**
		 * Takes a hex string and opacity value and converts it to Openlayers RGBA format
		 * @method hexOpacityToRGBA
		 * @static
		 * @param {string} colour The hex color string
		 * @param {number} opacity The opacity from 0.0 - 1.0
		 * @return {array} RGBA array where color components are 0 - 255 and opacity is 0.0 - 1.0
		 */
		hexOpacityToRGBA: function(colour, opacity)
		{
			hex = parseInt(colour.replace(/^#/, ""), 16);
			return [
				(hex & 0xFF0000) >> 16,
				(hex & 0xFF00) >> 8,
				hex & 0xFF,
				parseFloat(opacity)
			];
		},
		
		/**
		 * Takes a hex color string and converts it to an RGBA object.
		 * @method hexToRgba
		 * @static
		 * @param {string} hex The hex color string
		 * @return {object} Object with r, g, b and a properties, or 0 if the input is invalid.
		 */
		hexToRgba: function(hex) {
			var c;
			if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
				c= hex.substring(1).split('');
				if(c.length== 3){
					c= [c[0], c[0], c[1], c[1], c[2], c[2]];
				}
				c= '0x'+c.join('');
				
				return {
					r: (c>>16)&255,
					g: (c>>8)&255,
					b: c&255,
					a: 1
				};
			}
			
			return 0;
			
			//throw new Error('Bad Hex');
		},
		
		/**
		 * Takes an object with r, g, b and a properties and returns a CSS rgba color string
		 * @method rgbaToString
		 * @static
		 * @param {string} rgba The input object
		 * @return {string} The CSS rgba color string
		 */
		rgbaToString: function(rgba) {
			return "rgba(" + rgba.r + ", " + rgba.g + ", " + rgba.b + ", " + rgba.a + ")";
		},
		
		/**
		 * A regular expression that matches a latitude / longitude coordinate pair
		 * @constant {RegExp} latLngRegexp
		 * @static
		 */
		latLngRegexp: /^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/,
		
		/**
		 * Utility function returns true is string is a latitude and longitude
		 * @method isLatLngString
		 * @static
		 * @param str {string} The string to attempt to parse as coordinates
		 * @return {array} the matched latitude and longitude or null if no match
		 */
		isLatLngString: function(str)
		{
			if(typeof str != "string")
				return null;
			
			// Remove outer brackets
			if(str.match(/^\(.+\)$/))
				str = str.replace(/^\(|\)$/, "");
			
			var m = str.match(WPGMZA.latLngRegexp);
			
			if(!m)
				return null;
			
			return new WPGMZA.LatLng({
				lat: parseFloat(m[1]),
				lng: parseFloat(m[3])
			});
		},
		
		/**
		 * Utility function returns a latLng literal given a valid latLng string
		 * @method stringToLatLng
		 * @static
		 * @param str {string} The string to attempt to parse as coordinates
		 * @return {object} LatLng literal
		 */
		stringToLatLng: function(str)
		{
			var result = WPGMZA.isLatLngString(str);
			
			if(!result)
				throw new Error("Not a valid latLng");
			
			return result;
		},
		
		/**
		 * Utility function returns a latLng literal given a valid latLng string
		 * @method stringToLatLng
		 * @static
		 * @param str {string} The string to attempt to parse as coordinates
		 * @return {object} LatLng literal
		 */
		isHexColorString: function(str)
		{
			if(typeof str != "string")
				return false;
			
			return (str.match(/#[0-9A-F]{6}/i) ? true : false);
		},
		
		/**
		 * Cache of image dimensions by URL, for internal use only
		 * @var imageDimensionsCache
		 * @inner
		 * @see WPGMZA.getImageDimensions
		 */
		imageDimensionsCache: {},
		
		/**
		 * Utility function to get the dimensions of an image, caches results for best performance
		 * @method getImageDimensions
		 * @static
		 * @param src {string} Image source URL
		 * @param callback {function} Callback to recieve image dimensions
		 * @return {void}
		 */
		getImageDimensions: function(src, callback)
		{
			if(WPGMZA.imageDimensionsCache[src])
			{
				callback(WPGMZA.imageDimensionsCache[src]);
				return;
			}
			
			var img = document.createElement("img");
			img.onload = function(event) {
				var result = {
					width: img.width,
					height: img.height
				};
				WPGMZA.imageDimensionsCache[src] = result;
				callback(result);
			};
			img.src = src;
		},
		
		decodeEntities: function(input)
		{
			return input.replace(/&(nbsp|amp|quot|lt|gt);/g, function(m, e) {
				return m[e];
			}).replace(/&#(\d+);/gi, function(m, e) {
				return String.fromCharCode(parseInt(e, 10));
			});
		},
		
		/**
		 * Returns true if developer mode is set or if developer mode cookie is set
		 * @method isDeveloperMode
		 * @static
		 * @return {boolean} True if developer mode is on
		 */
		isDeveloperMode: function()
		{
			return this.settings.developer_mode || (window.Cookies && window.Cookies.get("wpgmza-developer-mode"));
		},
		
		/**
		 * Returns true if the Pro add-on is active
		 * @method isProVersion
		 * @static
		 * @return {boolean} True if the Pro add-on is active
		 */
		isProVersion: function()
		{
			return (this._isProVersion == "1");
		},
		
		/**
		 * Opens the WP media dialog and returns the result to a callback
		 * @method openMediaDialog
		 * @param {function} callback Callback to recieve the attachment ID as the first parameter and URL as the second
		 * @static
		 * @return {void}
		 */
		openMediaDialog: function(callback) {
			// Media upload
			var file_frame;
			
			// If the media frame already exists, reopen it.
			if ( file_frame ) {
				// Set the post ID to what we want
				file_frame.uploader.uploader.param( 'post_id', set_to_post_id );
				// Open frame
				file_frame.open();
				return;
			}
			
			// Create the media frame.
			file_frame = wp.media.frames.file_frame = wp.media({
				title: 'Select a image to upload',
				button: {
					text: 'Use this image',
				},
				multiple: false	// Set to true to allow multiple files to be selected
			});
			
			// When an image is selected, run a callback.
			file_frame.on( 'select', function() {
				// We set multiple to false so only get one image from the uploader
				attachment = file_frame.state().get('selection').first().toJSON();
				
				callback(attachment.id, attachment.url);
			});
			
			// Finally, open the modal
			file_frame.open();
		},
		
		/**
		 * @function getCurrentPosition
		 * @summary This function will get the users position, it first attempts to get
		 * high accuracy position (mobile with GPS sensors etc.), if that fails
		 * (desktops will time out) then it tries again without high accuracy
		 * enabled
		 * @static
		 * @return {object} The users position as a LatLng literal
		 */
		getCurrentPosition: function(callback, watch)
		{
			var trigger = "userlocationfound";
			var nativeFunction = "getCurrentPosition";
			
			if(watch)
			{
				trigger = "userlocationupdated";
				nativeFunction = "watchPosition";
				
				// Call again immediatly to get current position, watchPosition won't fire until the user moves
				WPGMZA.getCurrentPosition(callback, false);
			}
			
			if(!navigator.geolocation)
			{
				console.warn("No geolocation available on this device");
				return;
			}
			
			var options = {
				enableHighAccuracy: true
			};
			
			navigator.geolocation[nativeFunction](function(position) {
				if(callback)
					callback(position);
				
				WPGMZA.events.trigger("userlocationfound");
			},
			function(error) {
				
				options.enableHighAccuracy = false;
				
				navigator.geolocation[nativeFunction](function(position) {
					if(callback)
						callback(position);
					
					WPGMZA.events.trigger("userlocationfound");
				},
				function(error) {
					console.warn(error.code, error.message);
				},
				options);
				
			},
			options);
		},
		
		watchPosition: function(callback)
		{
			return WPGMZA.getCurrentPosition(callback, true);
		},
		
		/**
		 * Runs a catchable task and displays a friendly error if the function throws an error
		 * @method runCatchableTask
		 * @static
		 * @param {function} callback The function to run
		 * @param {HTMLElement} friendlyErrorContainer The container element to hold the error
		 * @return {void}
		 * @see WPGMZA.FriendlyError
		 */
		runCatchableTask: function(callback, friendlyErrorContainer) {
			
			if(WPGMZA.isDeveloperMode())
				callback();
			else
				try{
					callback();
				}catch(e) {
					var friendlyError = new WPGMZA.FriendlyError(e);
					$(friendlyErrorContainer).html("");
					$(friendlyErrorContainer).append(friendlyError.element);
					$(friendlyErrorContainer).show();
				}
		},
		
		/**
		 * This function is for checking inheritence has been setup correctly. For objects that have engine and Pro specific classes, it will automatically add the engine and pro prefix to the supplied string and if such an object exists it will test against that name rather than the un-prefix argument supplied.
		 *
		 * For example, if we are running the Pro addon with Google maps as the engine, if you supply Marker as the instance name the function will check to see if instance is an instance of GoogleProMarker
		 * @method assertInstanceOf
		 * @static
		 * @param {object} instance The object to check
		 * @param {string} instanceName The class name as a string which this object should be an instance of
		 * @return {void}
		 */
		assertInstanceOf: function(instance, instanceName) {
			var engine, fullInstanceName, assert;
			var pro = WPGMZA.isProVersion() ? "Pro" : "";
			
			switch(WPGMZA.settings.engine)
			{
				case "open-layers":
					engine = "OL";
					break;
				
				default:
					engine = "Google";
					break;
			}
			
			if(WPGMZA[engine + pro + instanceName])
				fullInstanceName = engine + pro + instanceName;
			else if(WPGMZA[pro + instanceName])
				fullInstanceName = pro + instanceName;
			else if(WPGMZA[engine + instanceName])
				fullInstanceName = engine + instanceName;
			else
				fullInstanceName = instanceName;
			
			assert = instance instanceof WPGMZA[fullInstanceName];
			
			if(!assert)
				throw new Error("Object must be an instance of " + fullInstanceName + " (did you call a constructor directly, rather than createInstance?)");
		},
		
		/**
		 * @method getMapByID
		 * @static
		 * @param {mixed} id The ID of the map to retrieve
		 * @return {object} The map object, or null if no such map exists
		 */
		getMapByID: function(id) {
			
			// Workaround for map ID member not set correctly
			
			if(WPGMZA.isProVersion())
				return MYMAP[id].map;
			return MYMAP.map;
			
			for(var i = 0; i < WPGMZA.maps.length; i++) {
				if(WPGMZA.maps[i].id == id)
					return WPGMZA.maps[i];
			}
			
			return null;
		},
		
		/**
		 * Shorthand function to determine if the Places Autocomplete is available
		 * @method isGoogleAutocompleteSupported
		 * @static
		 * @return {boolean} True if the places autocomplete is available
		 */
		isGoogleAutocompleteSupported: function() {
			return typeof google === 'object' && typeof google.maps === 'object' && typeof google.maps.places === 'object' && typeof google.maps.places.Autocomplete === 'function';
		},
		
		/**
		 * The Google API status script enqueue, as reported by the server
		 * @constant
		 * @static
		 */
		googleAPIStatus: window.wpgmza_google_api_status,
		
		/**
		 * Makes an educated guess as to whether the browser is Safari
		 * @method isSafari
		 * @static
		 * @return {boolean} True if it's likely the browser is Safari
		 */
		isSafari: function() {
			
			var ua = navigator.userAgent.toLowerCase();
			return (ua.indexOf("safari") != -1 && ua.indexOf("chrome") == -1);
			
		},
		
		/**
		 * Makes an educated guess as to whether the browser is running on a touch device
		 * @method isTouchDevice
		 * @static
		 * @return {boolean} True if it's likely the browser is running on a touch device
		 */
		isTouchDevice: function() {
			
			return ("ontouchstart" in window);
			
		},
		
		/**
		 * Makes an educated guess whether the browser is running on an iOS device
		 * @method isDeviceiOS
		 * @static
		 * @return {boolean} True if it's likely the browser is running on an iOS device
		 */
		isDeviceiOS: function() {
			
			return (
			
				(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)
				
				||
				
				(!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform))
			
			);
			
		},
		
		getQueryParamValue: function(name) {
			
			var regex = new RegExp(name + "=([^&]*)");
			var m;
			
			if(!(m = window.location.href.match(regex)))
				return null;
			
			return m[1];
			
		}
		
	};
	
	if(window.WPGMZA)
		window.WPGMZA = $.extend(window.WPGMZA, core);
	else
		window.WPGMZA = core;
	
	for(var key in WPGMZA_localized_data)
	{
		var value = WPGMZA_localized_data[key];
		WPGMZA[key] = value;
	}
	
	jQuery(function($) {
		
		// Combined script warning
		if($("script[src*='wp-google-maps.combined.js'], script[src*='wp-google-maps-pro.combined.js']").length)
			console.warn("Minified script is out of date, using combined script instead.");
		
		// Check for multiple jQuery versions
		var elements = $("script").filter(function() {
			return this.src.match(/(^|\/)jquery\.(min\.)?js(\?|$)/i);
		});

		if(elements.length > 1)
			console.warn("Multiple jQuery versions detected: ", elements);
		
		// Rest API
		WPGMZA.restAPI = WPGMZA.RestAPI.createInstance();
		
		// TODO: Move to map edit page JS
		$(document).on("click", ".wpgmza_edit_btn", function() {
			
			WPGMZA.animateScroll("#wpgmaps_tabs_markers");
			
		});
		
	});
	
	$(window).on("load", function(event) {
		
		// Geolocation warnings
		if(window.location.protocol != 'https:')
		{
			var warning = '<div class="notice notice-warning"><p>' + WPGMZA.localized_strings.unsecure_geolocation + "</p></div>";
			
			$(".wpgmza-geolocation-setting").each(function(index, el) {
				$(el).after( $(warning) );
			});
		}
		
	});
	
	
	
});

// js/v8/compatibility.js
/**
 * @namespace WPGMZA
 * @module Compatibility
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Reverse compatibility module
	 *
	 * @class WPGMZA.Compatibility
	 * @constructor WPGMZA.Compatibility
	 * @memberof WPGMZA
	 */
	WPGMZA.Compatibility = function()
	{
		this.preventDocumentWriteGoogleMapsAPI();
	}
	
	/**
	 * Prevents document.write from outputting Google Maps API script tag
	 *
	 * @method
	 * @memberof WPGMZA.Compatibility
	 */
	WPGMZA.Compatibility.prototype.preventDocumentWriteGoogleMapsAPI = function()
	{
		var old = document.write;
		
		document.write = function(content)
		{
			if(content.match && content.match(/maps\.google/))
				return;
			
			old.call(document, content);
		}
	}
	
	WPGMZA.compatiblityModule = new WPGMZA.Compatibility();
	
});

// js/v8/css-escape.js
/**
 * Polyfill for CSS.escape, with thanks to @mathias
 * @namespace WPGMZA
 * @module CSS
 * @requires WPGMZA
 */

/*! https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
;(function(root, factory) {
	// https://github.com/umdjs/umd/blob/master/returnExports.js
	if (typeof exports == 'object') {
		// For Node.js.
		module.exports = factory(root);
	} else if (typeof define == 'function' && define.amd) {
		// For AMD. Register as an anonymous module.
		define([], factory.bind(root, root));
	} else {
		// For browser globals (not exposing the function separately).
		factory(root);
	}
}(typeof global != 'undefined' ? global : this, function(root) {

	if (root.CSS && root.CSS.escape) {
		return root.CSS.escape;
	}

	// https://drafts.csswg.org/cssom/#serialize-an-identifier
	var cssEscape = function(value) {
		if (arguments.length == 0) {
			throw new TypeError('`CSS.escape` requires an argument.');
		}
		var string = String(value);
		var length = string.length;
		var index = -1;
		var codeUnit;
		var result = '';
		var firstCodeUnit = string.charCodeAt(0);
		while (++index < length) {
			codeUnit = string.charCodeAt(index);
			// Note: there’s no need to special-case astral symbols, surrogate
			// pairs, or lone surrogates.

			// If the character is NULL (U+0000), then the REPLACEMENT CHARACTER
			// (U+FFFD).
			if (codeUnit == 0x0000) {
				result += '\uFFFD';
				continue;
			}

			if (
				// If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
				// U+007F, […]
				(codeUnit >= 0x0001 && codeUnit <= 0x001F) || codeUnit == 0x007F ||
				// If the character is the first character and is in the range [0-9]
				// (U+0030 to U+0039), […]
				(index == 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
				// If the character is the second character and is in the range [0-9]
				// (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
				(
					index == 1 &&
					codeUnit >= 0x0030 && codeUnit <= 0x0039 &&
					firstCodeUnit == 0x002D
				)
			) {
				// https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
				result += '\\' + codeUnit.toString(16) + ' ';
				continue;
			}

			if (
				// If the character is the first character and is a `-` (U+002D), and
				// there is no second character, […]
				index == 0 &&
				length == 1 &&
				codeUnit == 0x002D
			) {
				result += '\\' + string.charAt(index);
				continue;
			}

			// If the character is not handled by one of the above rules and is
			// greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
			// is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
			// U+005A), or [a-z] (U+0061 to U+007A), […]
			if (
				codeUnit >= 0x0080 ||
				codeUnit == 0x002D ||
				codeUnit == 0x005F ||
				codeUnit >= 0x0030 && codeUnit <= 0x0039 ||
				codeUnit >= 0x0041 && codeUnit <= 0x005A ||
				codeUnit >= 0x0061 && codeUnit <= 0x007A
			) {
				// the character itself
				result += string.charAt(index);
				continue;
			}

			// Otherwise, the escaped character.
			// https://drafts.csswg.org/cssom/#escape-a-character
			result += '\\' + string.charAt(index);

		}
		return result;
	};

	if (!root.CSS) {
		root.CSS = {};
	}

	root.CSS.escape = cssEscape;
	return cssEscape;

}));

// js/v8/distance.js
/**
 * Collection of distance utility functions and constants
 * @namespace WPGMZA
 * @module Distance
 * @requires WPGMZA
 */
jQuery(function($) {
	
	var earthRadiusMeters = 6371;
	var piTimes360 = Math.PI / 360;
	
	function deg2rad(deg) {
	  return deg * (Math.PI/180)
	};
	
	/**
	 * @class WPGMZA.Distance
	 * @memberof WPGMZA
	 * @deprecated Will be dropped wiht the introduction of global distance units
	 */
	WPGMZA.Distance = {
		
		/**
		 * Miles, represented as true by legacy versions of the plugin
		 * @constant MILES
		 * @static
		 * @memberof WPGMZA.Distance
		 */
		MILES:					true,
		
		/**
		 * Kilometers, represented as false by legacy versions of the plugin
		 * @constant KILOMETERS
		 * @static
		 * @memberof WPGMZA.Distance
		 */
		KILOMETERS:				false,
		
		/**
		 * Miles per kilometer
		 * @constant MILES_PER_KILOMETER
		 * @static
		 * @memberof WPGMZA.Distance
		 */
		MILES_PER_KILOMETER:	0.621371,
		
		/**
		 * Kilometers per mile
		 * @constant KILOMETERS_PER_MILE
		 * @static
		 */
		KILOMETERS_PER_MILE:	1.60934,
		
		// TODO: Implement WPGMZA.settings.distance_units
		
		/**
		 * Converts a UI distance (eg from a form control) to meters,
		 * accounting for the global units setting
		 * @method uiToMeters
		 * @static
		 * @memberof WPGMZA.Distance
		 * @param {number} uiDistance The distance from the UI, could be in miles or kilometers depending on settings
		 * @return {number} The input distance in meters
		 */
		uiToMeters: function(uiDistance)
		{
			return parseFloat(uiDistance) / (WPGMZA.settings.distance_units == WPGMZA.Distance.MILES ? WPGMZA.Distance.MILES_PER_KILOMETER : 1) * 1000;
		},
		
		/**
		 * Converts a UI distance (eg from a form control) to kilometers,
		 * accounting for the global units setting
		 * @method uiToKilometers
		 * @static
		 * @memberof WPGMZA.Distance
		 * @param {number} uiDistance The distance from the UI, could be in miles or kilometers depending on settings
		 * @return {number} The input distance in kilometers
		 */
		uiToKilometers: function(uiDistance)
		{
			return WPGMZA.Distance.uiToMeters(uiDistance) * 0.001;
		},
		
		/**
		 * Converts a UI distance (eg from a form control) to miles, according to settings
		 * @method uiToMiles
		 * @static
		 * @memberof WPGMZA.Distance
		 * @param {number} uiDistance The distance from the UI, could be in miles or kilometers depending on settings
		 * @return {number} The input distance 
		 */
		uiToMiles: function(uiDistance)
		{
			return WPGMZA.Distance.uiToKilometers(uiDistance) * WPGMZA.Distance.MILES_PER_KILOMETER;
		},
		
		/**
		 * Converts kilometers to a UI distance, either the same value, or converted to miles depending on settings.
		 * @method kilometersToUI
		 * @static
		 * @memberof WPGMZA.Distance
		 * @param {number} km The input distance in kilometers
		 * @param {number} The UI distance in the units specified by settings
		 */
		kilometersToUI: function(km)
		{
			if(WPGMZA.settings.distance_units == WPGMZA.Distance.MILES)
				return km * WPGMZA.Distance.MILES_PER_KILOMETER;
			return km;
		},
		
		/**
		 * Returns the distance, in kilometers, between two LatLng's
		 * @method between
		 * @static
		 * @memberof WPGMZA.Distance
		 * @param {WPGMZA.Latlng} The first point
		 * @param {WPGMZA.Latlng} The second point
		 * @return {number} The distance, in kilometers
		 */
		between: function(a, b)
		{
			if(!(a instanceof WPGMZA.LatLng))
				throw new Error("First argument must be an instance of WPGMZA.LatLng");
			
			if(!(b instanceof WPGMZA.LatLng))
				throw new Error("Second argument must be an instance of WPGMZA.LatLng");
			
			if(a === b)
				return 0.0;
			
			var lat1 = a.lat;
			var lon1 = a.lng;
			var lat2 = b.lat;
			var lon2 = b.lng;
			
			var dLat = deg2rad(lat2-lat1);
			var dLon = deg2rad(lon2-lon1); 
			
			var a = 
				Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
				Math.sin(dLon/2) * Math.sin(dLon/2); 
				
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			var d = earthRadiusMeters * c; // Distance in km
			
			return d;
		}
		
	};
	
});

// js/v8/event-dispatcher.js
/**
 * @namespace WPGMZA
 * @module EventDispatcher
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Base class for any (non HTMLElement) object which dispatches or listens for events
	 * @class WPGMZA.EventDispatcher
	 * @constructor WPGMZA.EventDispatcher
	 * @memberof WPGMZA
	 */
	WPGMZA.EventDispatcher = function()
	{
		WPGMZA.assertInstanceOf(this, "EventDispatcher");
		
		this._listenersByType = {};
	}

	/**
	 * Adds an event listener on this object
	 * @method
	 * @memberof WPGMZA.EventDispatcher
	 * @param {string} type The event type, or multiple types separated by spaces
	 * @param {function} callback The callback to call when the event fires
	 * @param {object} [thisObject] The object to use as "this" when firing the callback
	 * @param {bool} [useCapture] If true, fires the callback on the capture phase, as opposed to bubble phase
	 */
	WPGMZA.EventDispatcher.prototype.addEventListener = function(type, listener, thisObject, useCapture)
	{
		var types = type.split(/\s+/);
		if(types.length > 1)
		{
			for(var i = 0; i < types.length; i++)
				this.addEventListener(types[i], listener, thisObject, useCapture);
			
			return;
		}
		
		if(!(listener instanceof Function))
			throw new Error("Listener must be a function");
	
		var target;
		if(!this._listenersByType.hasOwnProperty(type))
			target = this._listenersByType[type] = [];
		else
			target = this._listenersByType[type];
		
		var obj = {
			listener: listener,
			thisObject: (thisObject ? thisObject : this),
			useCapture: (useCapture ? true : false)
			};
			
		target.push(obj);
	}

	/**
	 * Alias for addEventListener
	 * @method
	 * @memberof WPGMZA.EventDispatcher
	 * @see WPGMZA.EventDispatcher#addEventListener
	 */
	WPGMZA.EventDispatcher.prototype.on = WPGMZA.EventDispatcher.prototype.addEventListener;

	/**
	 * Removes event listeners from this object
	 * @method
	 * @memberof WPGMZA.EventDispatcher
	 * @param {string} type The event type to remove listeners from
	 * @param {function} [listener] The function to remove. If omitted, all listeners will be removed
	 * @param {object} [thisObject] Use the parameter to remove listeners bound with the same thisObject
	 * @param {bool} [useCapture] Remove the capture phase event listener. Otherwise, the bubble phase event listener will be removed.
	 */
	WPGMZA.EventDispatcher.prototype.removeEventListener = function(type, listener, thisObject, useCapture)
	{
		var arr, index, obj;

		if(!(arr = this._listenersByType[type]))
			return;
			
		if(!thisObject)
			thisObject = this;
			
		useCapture = (useCapture ? true : false);
		
		for(var i = 0; i < arr.length; i++)
		{
			obj = arr[i];
		
			if(obj.listener == listener && obj.thisObject == thisObject && obj.useCapture == useCapture)
			{
				arr.splice(i, 1);
				return;
			}
		}
	}

	/**
	 * Alias for removeEventListener
	 * @method
	 * @memberof WPGMZA.EventDispatcher
	 * @see WPGMZA.EventDispatcher#removeEventListener
	 */
	WPGMZA.EventDispatcher.prototype.off = WPGMZA.EventDispatcher.prototype.removeEventListener;

	/**
	 * Test for listeners of type on this object
	 * @method
	 * @memberof WPGMZA.EventDispatcher
	 * @param {string} type The event type to test for
	 * @return {bool} True if this object has listeners bound for the specified type
	 */
	WPGMZA.EventDispatcher.prototype.hasEventListener = function(type)
	{
		return (_listenersByType[type] ? true : false);
	}

	/**
	 * Fires an event on this object
	 * @method
	 * @memberof WPGMZA.EventDispatcher
	 * @param {string|WPGMZA.Event} event Either the event type as a string, or an instance of WPGMZA.Event
	 */
	WPGMZA.EventDispatcher.prototype.dispatchEvent = function(event)
	{
		if(!(event instanceof WPGMZA.Event))
		{
			if(typeof event == "string")
				event = new WPGMZA.Event(event);
			else
			{
				var src = event;
				event = new WPGMZA.Event();
				for(var name in src)
					event[name] = src[name];
			}
		}

		event.target = this;
			
		var path = [];
		for(var obj = this.parent; obj != null; obj = obj.parent)
			path.unshift(obj);
		
		event.phase = WPGMZA.Event.CAPTURING_PHASE;
		for(var i = 0; i < path.length && !event._cancelled; i++)
			path[i]._triggerListeners(event);
			
		if(event._cancelled)
			return;
			
		event.phase = WPGMZA.Event.AT_TARGET;
		this._triggerListeners(event);
			
		event.phase = WPGMZA.Event.BUBBLING_PHASE;
		for(i = path.length - 1; i >= 0 && !event._cancelled; i--)
			path[i]._triggerListeners(event);
		
		if(this.element)
		{
			var customEvent = {};
			
			for(var key in event)
			{
				var value = event[key];
				
				if(key == "type")
					value += ".wpgmza";
				
				customEvent[key] = value;
			}
			
			$(this.element).trigger(customEvent);
		}
	}

	/**
	 * Alias for removeEventListener
	 * @method
	 * @memberof WPGMZA.EventDispatcher
	 * @see WPGMZA.EventDispatcher#removeEventListener
	 */
	WPGMZA.EventDispatcher.prototype.trigger = WPGMZA.EventDispatcher.prototype.dispatchEvent;

	/**
	 * Handles the logic of triggering listeners
	 * @method
	 * @memberof WPGMZA.EventDispatcher
	 * @inner
	 */
	WPGMZA.EventDispatcher.prototype._triggerListeners = function(event)
	{
		var arr, obj;
		
		if(!(arr = this._listenersByType[event.type]))
			return;
			
		for(var i = 0; i < arr.length; i++)
		{
			obj = arr[i];
			
			if(event.phase == WPGMZA.Event.CAPTURING_PHASE && !obj.useCapture)
				continue;
				
			obj.listener.call(arr[i].thisObject, event);
		}
	}

	WPGMZA.events = new WPGMZA.EventDispatcher();

});

// js/v8/event.js
/**
 * @namespace WPGMZA
 * @module Event
 * @requires WPGMZA
 */ 
jQuery(function($) {
		
	/**
	 * Base class used for events (for non-HTMLElement objects)
	 * @class WPGMZA.Event
	 * @constructor WPGMZA.Event
	 * @memberof WPGMZA
	 * @param {string|object} options The event type as a string, or an object of options to be mapped to this event
	 */
	WPGMZA.Event = function(options)
	{
		if(typeof options == "string")
			this.type = options;
		
		this.bubbles		= true;
		this.cancelable		= true;
		this.phase			= WPGMZA.Event.PHASE_CAPTURE;
		this.target			= null;
		
		this._cancelled = false;
		
		if(typeof options == "object")
			for(var name in options)
				this[name] = options[name];
	}

	WPGMZA.Event.CAPTURING_PHASE		= 0;
	WPGMZA.Event.AT_TARGET				= 1;
	WPGMZA.Event.BUBBLING_PHASE			= 2;

	/**
	 * Prevents any further propagation of this event
	 * @method
	 * @memberof WPGMZA.Event
	 */
	WPGMZA.Event.prototype.stopPropagation = function()
	{
		this._cancelled = true;
	}
	
});

// js/v8/friendly-error.js
/**
 * @namespace WPGMZA
 * @module FriendlyError
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Deprecated
	 * @class WPGMZA.FriendlyError
	 * @constructor WPGMZA.FriendlyError
	 * @memberof WPGMZA
	 * @deprecated
	 */
	WPGMZA.FriendlyError = function()
	{
		
	}
	
	/*var template = '\
		<div class="notice notice-error"> \
			<p> \
			' + WPGMZA.localized_strings.friendly_error + ' \
			</p> \
			<pre style="white-space: pre-line;"></pre> \
		<div> \
		';
	
	WPGMZA.FriendlyError = function(nativeError)
	{
		if(!WPGMZA.is_admin)
		{
			this.element = $(WPGMZA.preloaderHTML);
			$(this.element).removeClass("animated");
			return;
		}
		
		$("#wpgmza-map-edit-page>.wpgmza-preloader").remove();
		
		this.element = $(template);
		this.element.find("pre").html(nativeError.message + "\r\n" + nativeError.stack + "\r\n\r\n on " + window.location.href);
	}*/
	
});

// js/v8/geocoder.js
/**
 * @namespace WPGMZA
 * @module Geocoder
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Base class for geocoders. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Geocoder
	 * @constructor WPGMZA.Geocoder
	 * @memberof WPGMZA
	 * @see WPGMZA.Geocoder.createInstance
	 */
	WPGMZA.Geocoder = function()
	{
		WPGMZA.assertInstanceOf(this, "Geocoder");
	}
	
	/**
	 * Indicates a successful geocode, with one or more results
	 * @constant SUCCESS
	 * @memberof WPGMZA.Geocoder
	 */
	WPGMZA.Geocoder.SUCCESS			= "success";
	
	/**
	 * Indicates the geocode was successful, but returned no results
	 * @constant ZERO_RESULTS
	 * @memberof WPGMZA.Geocoder
	 */
	WPGMZA.Geocoder.ZERO_RESULTS	= "zero-results";
	
	/**
	 * Indicates the geocode failed, usually due to technical reasons (eg connectivity)
	 * @constant FAIL
	 * @memberof WPGMZA.Geocoder
	 */
	WPGMZA.Geocoder.FAIL			= "fail";
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.Geocoder
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.Geocoder.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				return WPGMZA.OLGeocoder;
				break;
				
			default:
				return WPGMZA.GoogleGeocoder;
				break;
		}
	}
	
	/**
	 * Creates an instance of a Geocoder, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>
	 * @method
	 * @memberof WPGMZA.Geocoder
	 * @return {WPGMZA.Geocoder} A subclass of WPGMZA.Geocoder
	 */
	WPGMZA.Geocoder.createInstance = function()
	{
		var constructor = WPGMZA.Geocoder.getConstructor();
		return new constructor();
	}
	
	/**
	 * Attempts to convert a street address to an array of potential coordinates that match the address, which are passed to a callback. If the address is interpreted as a latitude and longitude coordinate pair, the callback is immediately fired.
	 * @method
	 * @memberof WPGMZA.Geocoder
	 * @param {object} options The options to geocode, address is mandatory.
	 * @param {function} callback The callback to receive the geocode result.
	 * @return {void}
	 */
	WPGMZA.Geocoder.prototype.getLatLngFromAddress = function(options, callback)
	{
		if(WPGMZA.isLatLngString(options.address))
		{
			var parts = options.address.split(/,\s*/);
			var latLng = new WPGMZA.LatLng({
				lat: parseFloat(parts[0]),
				lng: parseFloat(parts[1])
			});
			callback([latLng], WPGMZA.Geocoder.SUCCESS);
		}
	}
	
	/**
	 * Attempts to convert latitude eand longitude coordinates into a street address. By default this will simply return the coordinates wrapped in an array.
	 * @method
	 * @memberof WPGMZA.Geocoder
	 * @param {object} options The options to geocode, latLng is mandatory.
	 * @param {function} callback The callback to receive the geocode result.
	 * @return {void}
	 */
	WPGMZA.Geocoder.prototype.getAddressFromLatLng = function(options, callback)
	{
		var latLng = new WPGMZA.LatLng(options.latLng);
		callback([latLng.toString()], WPGMZA.Geocoder.SUCCESS);
	}
	
	/**
	 * Geocodes either an address or a latitude and longitude coordinate pair, depending on the input
	 * @method
	 * @memberof WPGMZA.Geocoder
	 * @param {object} options The options to geocode, you must supply <em>either</em> latLng <em>or</em> address.
	 * @throws You must supply either a latLng or address
	 * @return {void}
	 */
	WPGMZA.Geocoder.prototype.geocode = function(options, callback)
	{
		if("address" in options)
			return this.getLatLngFromAddress(options, callback);
		else if("latLng" in options)
			return this.getAddressFromLatLng(options, callback);
		
		throw new Error("You must supply either a latLng or address");
	}
	
});

// js/v8/google-api-error-handler.js
/**
 * @namespace WPGMZA
 * @module GoogleAPIErrorHandler
 * @requires WPGMZA
 */
jQuery(function($) { 

	/**
	 * This class catches Google Maps API errors and presents them in a friendly manner, before sending them on to the consoles default error handler.
	 * @class WPGMZA.GoogleAPIErrorHandler
	 * @constructor WPGMZA.GoogleAPIErrorHandler
	 * @memberof WPGMZA
	 */
	WPGMZA.GoogleAPIErrorHandler = function() {
		
		var self = this;
		
		// Don't do anything if Google isn't the selected API
		if(WPGMZA.settings.engine != "google-maps")
			return;
		
		// Only allow on the map edit page, or front end if user has administrator role
		if(!(WPGMZA.currentPage == "map-edit" || (WPGMZA.is_admin == 0 && WPGMZA.userCanAdministrator == 1)))
			return;
		
		this.element = $(WPGMZA.html.googleMapsAPIErrorDialog);
		
		if(WPGMZA.is_admin == 1)
			this.element.find(".wpgmza-front-end-only").remove();
		
		this.errorMessageList = this.element.find(".wpgmza-google-api-error-list");
		this.templateListItem = this.element.find("li.template").remove();
		
		this.messagesAlreadyDisplayed = {};
		
		//if(WPGMZA.settings.developer_mode)
			//return;
		
		// Override error function
		var _error = console.error;
		
		console.error = function(message)
		{
			self.onErrorMessage(message);
			
			_error.apply(this, arguments);
		}
		
		// Check for no API key
		if(WPGMZA.settings.engine == "google-maps" && (!WPGMZA.settings.wpgmza_google_maps_api_key || !WPGMZA.settings.wpgmza_google_maps_api_key.length))
			this.addErrorMessage(WPGMZA.localized_strings.no_google_maps_api_key, ["https://www.wpgmaps.com/get-a-google-maps-api-key/"]);
	}
	
	/**
	 * Overrides console.error to scan the error message for Google Maps API error messages.
	 * @method 
	 * @memberof WPGMZA.GoogleAPIErrorHandler
	 * @param {string} message The error message passed to the console
	 */
	WPGMZA.GoogleAPIErrorHandler.prototype.onErrorMessage = function(message)
	{
		var m;
		var regexURL = /http(s)?:\/\/[^\s]+/gm;
		
		if(!message)
			return;
		
		if((m = message.match(/You have exceeded your (daily )?request quota for this API/)) || (m = message.match(/This API project is not authorized to use this API/)) || (m = message.match(/^Geocoding Service: .+/)))
		{
			var urls = message.match(regexURL);
			this.addErrorMessage(m[0], urls);
		}
		else if(m = message.match(/^Google Maps.+error: (.+)\s+(http(s?):\/\/.+)/m))
		{
			this.addErrorMessage(m[1].replace(/([A-Z])/g, " $1"), [m[2]]);
		}
	}
	
	/**
	 * Called by onErrorMessage when a Google Maps API error is picked up, this will add the specified message to the Maps API error message dialog, along with URLs to compliment it. This function ignores duplicate error messages.
	 * @method
	 * @memberof WPGMZA.GoogleAPIErrorHandler
	 * @param {string} message The message, or part of the message, intercepted from the console
	 * @param {array} [urls] An array of URLs relating to the error message to compliment the message.
	 */
	WPGMZA.GoogleAPIErrorHandler.prototype.addErrorMessage = function(message, urls)
	{
		var self = this;
		
		if(this.messagesAlreadyDisplayed[message])
			return;
		
		var li = this.templateListItem.clone();
		$(li).find(".wpgmza-message").html(message);
		
		var buttonContainer = $(li).find(".wpgmza-documentation-buttons");
		
		var buttonTemplate = $(li).find(".wpgmza-documentation-buttons>a");
		buttonTemplate.remove();
		
		if(urls && urls.length)
		{
			for(var i = 0; i < urls.length; i++)
			{
				var url = urls[i];
				var button = buttonTemplate.clone();
				var icon = "fa-external-link";
				var text = WPGMZA.localized_strings.documentation;
				
				button.attr("href", urls[i]);
				
				/*if(url.match(/google.+documentation/))
				{
					// icon = "fa-google";
					icon = "fa-wrench"
				}
				else if(url.match(/maps-no-account/))
				{
					icon = "fa-wrench"
					text = WPGMZA.localized_strings.verify_project;
				}
				else if(url.match(/console\.developers\.google/))
				{
					icon = "fa-wrench";
					text = WPGMZA.localized_strings.api_dashboard;
				}*/
				
				$(button).find("i").addClass(icon);
				$(button).append(text);
			}
			
			buttonContainer.append(button);
		}
		
		$(this.errorMessageList).append(li);
		
		/*if(!this.dialog)
			this.dialog = $(this.element).remodal();
		
		switch(this.dialog.getState())
		{
			case "open":
			case "opened":
			case "opening":
				break;
				
			default:
				this.dialog.open();
				break;
		}*/
		
		$("#wpgmza_map, .wpgmza_map").each(function(index, el) {
			
			var container = $(el).find(".wpgmza-google-maps-api-error-overlay");

			if(container.length == 0)
			{
				container = $("<div class='wpgmza-google-maps-api-error-overlay'></div>");
				container.html(self.element.html());
			}
			
			setTimeout(function() {
				$(el).append(container);
			}, 100);
		});
		
		$(".gm-err-container").parent().css({"z-index": 1});
		
		this.messagesAlreadyDisplayed[message] = true;
	}
	
	WPGMZA.googleAPIErrorHandler = new WPGMZA.GoogleAPIErrorHandler();

});

// js/v8/info-window.js
/**
 * @namespace WPGMZA
 * @module InfoWindow
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	/**
	 * Base class for infoWindows. This acts as an abstract class so that infoWindows for both Google and OpenLayers can be interacted with seamlessly by the overlying logic. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.InfoWindow
	 * @constructor WPGMZA.InfoWindow
	 * @memberof WPGMZA
	 * @see WPGMZA.InfoWindow.createInstance
	 */
	WPGMZA.InfoWindow = function(mapObject)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		WPGMZA.assertInstanceOf(this, "InfoWindow");
		
		if(!mapObject)
			return;
		
		this.mapObject = mapObject;
		
		if(mapObject.map)
		{
			// This has to be slightly delayed so the map initialization won't overwrite the infowindow element
			setTimeout(function() {
				self.onMapObjectAdded(event);
			}, 100);
		}
		else
			mapObject.addEventListener("added", function(event) { 
				self.onMapObjectAdded(event);
			});		
	}
	
	WPGMZA.InfoWindow.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.InfoWindow.prototype.constructor = WPGMZA.InfoWindow;
	
	WPGMZA.InfoWindow.OPEN_BY_CLICK = 1;
	WPGMZA.InfoWindow.OPEN_BY_HOVER = 2;
	
	/**
	 * Fetches the constructor to be used by createInstance, based on the selected maps engine
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @return {function} The appropriate constructor
	 */
	WPGMZA.InfoWindow.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				if(WPGMZA.isProVersion())
					return WPGMZA.OLProInfoWindow;
				return WPGMZA.OLInfoWindow;
				break;
			
			default:
				if(WPGMZA.isProVersion())
					return WPGMZA.GoogleProInfoWindow;
				return WPGMZA.GoogleInfoWindow;
				break;
		}
	}
	
	/**
	 * Creates an instance of an InfoWindow, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @param {object} options Options for the object (optional)
	 */
	WPGMZA.InfoWindow.createInstance = function(mapObject)
	{
		var constructor = this.getConstructor();
		return new constructor(mapObject);
	}
	
	/**
	 * Gets the content for the info window and passes it to the specified callback - this allows for delayed loading (eg AJAX) as well as instant content
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @return void
	 */
	WPGMZA.InfoWindow.prototype.getContent = function(callback)
	{
		var html = "";
		
		if(this.mapObject instanceof WPGMZA.Marker)
			html = this.mapObject.address;
		
		callback(html);
	}
	
	/**
	 * Opens the info window on the specified map, with the specified map object as the subject.
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @param {WPGMZA.Map} map The map to open this InfoWindow on.
	 * @param {WPGMZA.MapObject} mapObject The map object (eg marker, polygon) to open this InfoWindow on.
	 * @return boolean FALSE if the info window should not and will not open, TRUE if it will. This can be used by subclasses to establish whether or not the subclassed open should bail or open the window.
	 */
	WPGMZA.InfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		
		this.mapObject = mapObject;
		
		if(WPGMZA.settings.disable_infowindows)
			return false;
		
		if(this.mapObject.disableInfoWindow)
			return false;
		
		return true;
	}
	
	/**
	 * Abstract function, closes this InfoWindow
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 */
	WPGMZA.InfoWindow.prototype.close = function()
	{
		this.trigger("infowindowclose");
	}
	
	/**
	 * Abstract function, sets the content in this InfoWindow
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 */
	WPGMZA.InfoWindow.prototype.setContent = function(options)
	{
		
	}
	
	/**
	 * Abstract function, sets options on this InfoWindow
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 */
	WPGMZA.InfoWindow.prototype.setOptions = function(options)
	{
		
	}
	
	/**
	 * Event listener for when the map object is added. This will cause the info window to open if the map object has infoopen set
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @return void
	 */
	WPGMZA.InfoWindow.prototype.onMapObjectAdded = function()
	{
		if(this.mapObject.settings.infoopen == 1)
			this.open();
	}
	
});

// js/v8/latlng.js
/**
 * @namespace WPGMZA
 * @module LatLng
 * @requires WPGMZA
 */
jQuery(function($) {

	/**
	 * This class represents a latitude and longitude coordinate pair, and provides utilities to work with coordinates, parsing and conversion.
	 * @class WPGMZA.LatLng
	 * @constructor WPGMZA.LatLng
	 * @memberof WPGMZA
	 * @param {number|object} arg A latLng literal, or latitude
	 * @param {number} [lng] The latitude, where arg is a longitude
	 */
	WPGMZA.LatLng = function(arg, lng)
	{
		this._lat = 0;
		this._lng = 0;
		
		if(arguments.length == 0)
			return;
		
		if(arguments.length == 1)
		{
			// TODO: Support latlng string
			
			if(typeof arg == "string")
			{
				var m;
				
				if(!(m = arg.match(WPGMZA.LatLng.REGEXP)))
					throw new Error("Invalid LatLng string");
				
				arg = {
					lat: m[1],
					lng: m[3]
				};
			}
			
			if(typeof arg != "object" || !("lat" in arg && "lng" in arg))
				throw new Error("Argument must be a LatLng literal");
			
			this.lat = arg.lat;
			this.lng = arg.lng;
		}
		else
		{
			this.lat = arg;
			this.lng = lng;
		}
	}
	
	/**
	 * A regular expression which matches latitude and longitude coordinate pairs from a string. Matches 1 and 3 correspond to latitude and longitude, respectively,
	 * @constant {RegExp}
	 * @memberof WPGMZA.LatLng
	 */
	WPGMZA.LatLng.REGEXP = /^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/;
	
	/**
	 * Returns true if the supplied object is a LatLng literal, also returns true for instances of WPGMZA.LatLng
	 * @method
	 * @static
	 * @memberof WPGMZA.LatLng
	 * @param {object} obj A LatLng literal, or an instance of WPGMZA.LatLng
	 * @return {bool} True if this object is a valid LatLng literal or instance of WPGMZA.LatLng
	 */
	WPGMZA.LatLng.isValid = function(obj)
	{
		if(typeof obj != "object")
			return false;
		
		if(!("lat" in obj && "lng" in obj))
			return false;
		
		return true;
	}
	
	/**
	 * The latitude, guaranteed to be a number
	 * @property lat
	 * @memberof WPGMZA.LatLng
	 */
	Object.defineProperty(WPGMZA.LatLng.prototype, "lat", {
		get: function() {
			return this._lat;
		},
		set: function(val) {
			if(!$.isNumeric(val))
				throw new Error("Latitude must be numeric");
			this._lat = parseFloat( val );
		}
	});
	
	/**
	 * The longitude, guaranteed to be a number
	 * @property lng
	 * @memberof WPGMZA.LatLng
	 */
	Object.defineProperty(WPGMZA.LatLng.prototype, "lng", {
		get: function() {
			return this._lng;
		},
		set: function(val) {
			if(!$.isNumeric(val))
				throw new Error("Longitude must be numeric");
			this._lng = parseFloat( val );
		}
	});
	
	/**
	 * Returns this latitude and longitude as a string
	 * @method
	 * @memberof WPGMZA.LatLng
	 * @return {string} This object represented as a string
	 */
	WPGMZA.LatLng.prototype.toString = function()
	{
		return this._lat + ", " + this._lng;
	}
	
	/**
	 * Queries the users current location and passes it to a callback, you can pass
	 * geocodeAddress through options if you would like to also receive the address
	 * @method
	 * @memberof WPGMZA.LatLng
	 * @param {function} A callback to receive the WPGMZA.LatLng
	 * @param {object} An object of options, only geocodeAddress is currently supported
	 * @return void
	 */
	WPGMZA.LatLng.fromCurrentPosition = function(callback, options)
	{
		if(!options)
			options = {};
		
		if(!callback)
			return;
		
		WPGMZA.getCurrentPosition(function(position) {
			
			var latLng = new WPGMZA.LatLng({
				lat: position.coords.latitude,
				lng: position.coords.longitude
			});
			
			if(options.geocodeAddress)
			{
				var geocoder = WPGMZA.Geocoder.createInstance();
				
				geocoder.getAddressFromLatLng({
					latLng: latLng
				}, function(results) {
					
					if(results.length)
						latLng.address = results[0];
					
					callback(latLng);
					
				});
				
				
			}	
			else
				callback(latLng);
			
		});
	}
	
	/**
	 * Returns an instnace of WPGMZA.LatLng from an instance of google.maps.LatLng
	 * @method
	 * @static
	 * @memberof WPGMZA.LatLng
	 * @param {google.maps.LatLng} The google.maps.LatLng to convert
	 * @return {WPGMZA.LatLng} An instance of WPGMZA.LatLng built from the supplied google.maps.LatLng
	 */
	WPGMZA.LatLng.fromGoogleLatLng = function(googleLatLng)
	{
		return new WPGMZA.LatLng(
			googleLatLng.lat(),
			googleLatLng.lng()
		);
	}
	
	/**
	 * Returns an instance of google.maps.LatLng with the same coordinates as this object
	 * @method
	 * @memberof WPGMZA.LatLng
	 * @return {google.maps.LatLng} This object, expressed as a google.maps.LatLng
	 */
	WPGMZA.LatLng.prototype.toGoogleLatLng = function()
	{
		return new google.maps.LatLng({
			lat: this.lat,
			lng: this.lng
		});
	}
	
	WPGMZA.LatLng.prototype.toLatLngLiteral = function()
	{
		return {
			lat: this.lat,
			lng: this.lng
		};
	}
	
	/**
	 * Moves this latLng by the specified kilometers along the given heading. This function operates in place, as opposed to creating a new instance of WPGMZA.LatLng. With many thanks to Hu Kenneth - https://gis.stackexchange.com/questions/234473/get-a-lonlat-point-by-distance-or-between-2-lonlat-points
	 * @method
	 * @memberof WPGMZA.LatLng
	 * @param {number} kilometers The number of kilometers to move this LatLng by
	 * @param {number} heading The heading, in degrees, to move along, where zero is North
	 * @return {void}
	 */
	WPGMZA.LatLng.prototype.moveByDistance = function(kilometers, heading)
	{
		var radius 		= 6371;
		
		var delta 		= parseFloat(kilometers) / radius;
		var theta 		= parseFloat(heading) / 180 * Math.PI;
		
		var phi1 		= this.lat / 180 * Math.PI;
		var lambda1 	= this.lng / 180 * Math.PI;
		
		var sinPhi1 	= Math.sin(phi1), cosPhi1 = Math.cos(phi1);
		var sinDelta	= Math.sin(delta), cosDelta = Math.cos(delta);
		var sinTheta	= Math.sin(theta), cosTheta = Math.cos(theta);
		
		var sinPhi2		= sinPhi1 * cosDelta + cosPhi1 * sinDelta * cosTheta;
		var phi2		= Math.asin(sinPhi2);
		var y			= sinTheta * sinDelta * cosPhi1;
		var x			= cosDelta - sinPhi1 * sinPhi2;
		var lambda2		= lambda1 + Math.atan2(y, x);
		
		this.lat		= phi2 * 180 / Math.PI;
		this.lng		= lambda2 * 180 / Math.PI;
	}
	
	/**
	 * @function getGreatCircleDistance
	 * @summary Uses the haversine formula to get the great circle distance between this and another LatLng / lat & lng pair
	 * @param arg1 [WPGMZA.LatLng|Object|Number] Either a WPGMZA.LatLng, an object representing a lat/lng literal, or a latitude
	 * @param arg2 (optional) If arg1 is a Number representing latitude, pass arg2 to represent the longitude
	 * @return number The distance "as the crow files" between this point and the other
	 */
	WPGMZA.LatLng.prototype.getGreatCircleDistance = function(arg1, arg2)
	{
		var lat1 = this.lat;
		var lon1 = this.lng;
		var other;
		
		if(arguments.length == 1)
			other = new WPGMZA.LatLng(arg1);
		else if(arguments.length == 2)
			other = new WPGMZA.LatLng(arg1, arg2);
		else
			throw new Error("Invalid number of arguments");
		
		var lat2 = other.lat;
		var lon2 = other.lng;
		
		var R = 6371; // Kilometers
		var phi1 = lat1.toRadians();
		var phi2 = lat2.toRadians();
		var deltaPhi = (lat2-lat1).toRadians();
		var deltaLambda = (lon2-lon1).toRadians();

		var a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
				Math.cos(phi1) * Math.cos(phi2) *
				Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

		var d = R * c;
		
		return d;
	}
	
});

// js/v8/latlngbounds.js
/**
 * @namespace WPGMZA
 * @module LatLngBounds
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * This class represents latitude and longitude bounds as a rectangular area.
	 * NB: This class is not fully implemented
	 * @class WPGMZA.LatLngBounds
	 * @constructor WPGMZA.LatLngBounds
	 * @memberof WPGMZA
	 */
	WPGMZA.LatLngBounds = function(southWest, northEast)
	{
		//console.log("Created bounds", southWest, northEast);
		
		if(southWest && northEast)
		{
			// TODO: Add checks and errors
			this.south = southWest.lat;
			this.north = northEast.lat;
			this.west = southWest.lng;
			this.east = southWest.lng;
		}
	}
	
	/**
	 * Returns true if this object is in it's initial state (eg no points specified to gather bounds from)
	 * @method
	 * @memberof WPGMZA.LatLngBounds
	 * @return {bool} True if the object is in it's initial state
	 */
	WPGMZA.LatLngBounds.prototype.isInInitialState = function()
	{
		return (this.north == undefined && this.south == undefined && this.west == undefined && this.east == undefined);
	}
	
	/**
	 * Extends this bounds object to encompass the given latitude and longitude coordinates
	 * @method
	 * @memberof WPGMZA.LatLngBounds
	 * @param {object|WPGMZA.LatLng} latLng either a LatLng literal or an instance of WPGMZA.LatLng
	 */
	WPGMZA.LatLngBounds.prototype.extend = function(latLng)
	{
		if(!(latLng instanceof WPGMZA.LatLng))
			latLng = new WPGMZA.LatLng(latLng);
		
		//console.log("Expanding bounds to " + latLng.toString());
		
		if(this.isInInitialState())
		{
			this.north = this.south = latLng.lat;
			this.west = this.east = latLng.lng;
			return;
		}
		
		if(latLng.lat < this.north)
			this.north = latLng.lat;
		
		if(latLng.lat > this.south)
			this.south = latLng.lat;
		
		if(latLng.lng < this.west)
			this.west = latLng.lng;
		
		if(latLng.lng > this.east)
			this.east = latLng.lng;
	}
	
	WPGMZA.LatLngBounds.prototype.extendByPixelMargin = function(map, x, arg)
	{
		var y = x;
		
		if(!(map instanceof WPGMZA.Map))
			throw new Error("First argument must be an instance of WPGMZA.Map");
		
		if(this.isInInitialState())
			throw new Error("Cannot extend by pixels in initial state");
		
		if(arguments.length >= 3)
			y = arg;
		
		var southWest = new WPGMZA.LatLng(this.south, this.west);
		var northEast = new WPGMZA.LatLng(this.north, this.east);
		
		southWest = map.latLngToPixels(southWest);
		northEast = map.latLngToPixels(northEast);
		
		southWest.x -= x;
		southWest.y += y;
		
		northEast.x += x;
		northEast.y -= y;
		
		southWest = map.pixelsToLatLng(southWest.x, southWest.y);
		northEast = map.pixelsToLatLng(northEast.x, northEast.y);
		
		var temp = this.toString();
		
		this.north = northEast.lat;
		this.south = southWest.lat;
		this.west = southWest.lng;
		this.east = northEast.lng;
		
		//console.log("Extended", temp, "to", this.toString());
	}
	
	WPGMZA.LatLngBounds.prototype.contains = function(latLng)
	{
		//console.log("Checking if latLng ", latLng, " is within bounds " + this.toString());
		
		if(!(latLng instanceof WPGMZA.LatLng))
			throw new Error("Argument must be an instance of WPGMZA.LatLng");
		
		if(latLng.lat < Math.min(this.north, this.south))
			return false;
		
		if(latLng.lat > Math.max(this.north, this.south))
			return false;
		
		if(this.west < this.east)
			return (latLng.lng >= this.west && latLng.lng <= this.east);
		
		if(this.west < this.east)
			return (latLng.lng >= this.west || this.lng <= this.east);
		
		return (latLng.lng <= this.west || this.lng >= this.east);
	}
	
	WPGMZA.LatLngBounds.prototype.toString = function()
	{
		return this.north + "N " + this.south + "S " + this.west + "W " + this.east + "E";
	}
	
});

// js/v8/map-object.js
/**
 * @namespace WPGMZA
 * @module MapObject
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	/**
	 * Base class for Map Objects (known as Features in Map Block), that is, markers, polygons, polylines, circles, rectangles and heatmaps. Implements functionality shared by all map objects, such as parsing geometry and serialization.
	 * @class WPGMZA.MapObject
	 * @constructor WPGMZA.MapObject
	 * @memberof WPGMZA
	 * @augments WPGMZA.EventDispatcher
	 */
	WPGMZA.MapObject = function(row)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "MapObject");
		
		WPGMZA.EventDispatcher.call(this);
		
		this.id = -1;
		this.guid = WPGMZA.guid();
		this.modified = true;
		this.settings = {};
		
		if(row)
		{
			for(var name in row)
			{
				if(name == "settings")
				{
					if(row["settings"] == null)
						this["settings"] = {};
					else switch(typeof row["settings"]) {
						case "string":
							this["settings"] = JSON.parse(row[name]);
							break;
						case "object":
							this["settings"] = row[name];
							break;
						default:
							throw new Error("Don't know how to interpret settings")
							break;
					}
					
					for(var name in this.settings)
					{
						var value = this.settings[name];
						if(String(value).match(/^-?\d+$/))
							this.settings[name] = parseInt(value);
					}
				}
				else
					this[name] = row[name];
			}
		}		
	}
	
	WPGMZA.MapObject.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.MapObject.prototype.constructor = WPGMZA.MapObject;
	
	/**
	 * Scans a string for all floating point numbers and build an array of latitude and longitude literals from the matched numbers
	 * @method
	 * @memberof WPGMZA.MapObject
	 * @param {string} string The string to parse numbers from
	 * @return {array} An array of LatLng literals parsed from the string
	 */
	WPGMZA.MapObject.prototype.parseGeometry = function(string)
	{
		var stripped, pairs, coords, results = [];
		stripped = string.replace(/[^ ,\d\.\-+e]/g, "");
		pairs = stripped.split(",");
		
		for(var i = 0; i < pairs.length; i++)
		{
			coords = pairs[i].split(" ");
			results.push({
				lat: parseFloat(coords[1]),
				lng: parseFloat(coords[0])
			});
		}
				
		return results;
	}
	
	/**
	 * Returns a copy of this object as a JSON object for serializsation
	 * @method
	 * @memberof WPGMZA.MapObject
	 * @return {object} This object as represented by JSON
	 */
	WPGMZA.MapObject.prototype.toJSON = function()
	{
		return {
			id: this.id,
			guid: this.guid,
			settings: this.settings
		};
	}
	
});

// js/v8/circle.js
/**
 * @namespace WPGMZA
 * @module Circle
 * @requires WPGMZA.MapObject
 */
jQuery(function($) {
	
	var Parent = WPGMZA.MapObject;
	
	/**
	 * Base class for circles. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Circle
	 * @constructor WPGMZA.Circle
	 * @memberof WPGMZA
	 * @augments WPGMZA.MapObject
	 * @see WPGMZA.Circle.createInstance
	 */
	WPGMZA.Circle = function(options, engineCircle)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Circle");
		
		this.center = new WPGMZA.LatLng();
		this.radius = 100;
		
		Parent.apply(this, arguments);
	}
	
	WPGMZA.Circle.prototype = Object.create(Parent.prototype);
	WPGMZA.Circle.prototype.constructor = WPGMZA.Circle;
	
	/**
	 * Creates an instance of a circle, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {object} options Options for the object (optional)
	 */
	WPGMZA.Circle.createInstance = function(options)
	{
		var constructor;
		
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				constructor = WPGMZA.OLCircle;
				break;
			
			default:
				constructor = WPGMZA.GoogleCircle;
				break;
		}
		
		return new constructor(options);
	}
	
	/**
	 * Gets the circles center
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @returns {WPGMZA.LatLng}
	 */
	WPGMZA.Circle.prototype.getCenter = function()
	{
		return this.center.clone();
	}
	
	/**
	 * Sets the circles center
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {object|WPGMZA.LatLng} latLng either a literal or as a WPGMZA.LatLng
	 */
	WPGMZA.Circle.prototype.setCenter = function(latLng)
	{
		this.center.lat = latLng.lat;
		this.center.lng = latLng.lng;
	}
	
	/**
	 * Gets the circles radius, in kilometers
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {object|WPGMZA.LatLng} latLng either a literal or as a WPGMZA.LatLng
	 * @returns {WPGMZA.LatLng}
	 */
	WPGMZA.Circle.prototype.getRadius = function()
	{
		return this.radius;
	}
	
	/**
	 * Sets the circles radius, in kilometers
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {number} radius The radius
	 * @returns {void}
	 */
	WPGMZA.Circle.prototype.setRadius = function(radius)
	{
		this.radius = radius;
	}
	
	/**
	 * Returns the map that this circle is being displayed on
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @return {WPGMZA.Map}
	 */
	WPGMZA.Circle.prototype.getMap = function()
	{
		return this.map;
	}
	
	/**
	 * Puts this circle on a map
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {WPGMZA.Map} map The target map
	 * @return {void}
	 */
	WPGMZA.Circle.prototype.setMap = function(map)
	{
		if(this.map)
			this.map.removeCircle(this);
		
		if(map)
			map.addCircle(this);
			
	}
	
});

// js/v8/map-settings-page.js
/**
 * @namespace WPGMZA
 * @module MapSettingsPage
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * This class helps manage the map settings pageX
	 * @class WPGMZA.MapSettingsPage
	 * @constructor WPGMZA.MapSettingsPage
	 * @memberof WPGMZA
	 */
	WPGMZA.MapSettingsPage = function()
	{
		var self = this;
		
		this.updateEngineSpecificControls();
		this.updateGDPRControls();
		
		$("select[name='wpgmza_maps_engine']").on("change", function(event) {
			self.updateEngineSpecificControls();
		});
		
		$("input[name='wpgmza_gdpr_require_consent_before_load'], input[name='wpgmza_gdpr_require_consent_before_vgm_submit'], input[name='wpgmza_gdpr_override_notice']").on("change", function(event) {
			self.updateGDPRControls();
		});
	}
	
	/**
	 * Updates engine specific controls, hiding irrelevant controls (eg Google controls when OpenLayers is the selected engine) and showing relevant controls.
	 * @method
	 * @memberof WPGMZA.MapSettingsPage
	 */
	WPGMZA.MapSettingsPage.prototype.updateEngineSpecificControls = function()
	{
		var engine = $("select[name='wpgmza_maps_engine']").val();
		
		$("[data-required-maps-engine][data-required-maps-engine!='" + engine + "']").hide();
		$("[data-required-maps-engine='" + engine + "']").show();
	}
	
	/**
	 * Updates the GDPR controls (eg visibility state) based on the selected GDPR settings
	 * @method
	 * @memberof WPGMZA.MapSettingsPage
	 */
	WPGMZA.MapSettingsPage.prototype.updateGDPRControls = function()
	{
		var showNoticeControls = $("input[name='wpgmza_gdpr_require_consent_before_load']").prop("checked");
		
		var vgmCheckbox = $("input[name='wpgmza_gdpr_require_consent_before_vgm_submit']");
		
		if(vgmCheckbox.length)
			showNoticeControls = showNoticeControls || vgmCheckbox.prop("checked");
		
		var showOverrideTextarea = showNoticeControls && $("input[name='wpgmza_gdpr_override_notice']").prop("checked");
		
		if(showNoticeControls)
		{
			$("#wpgmza-gdpr-compliance-notice").show("slow");
		}
		else
		{
			$("#wpgmza-gdpr-compliance-notice").hide("slow");
		}
		
		if(showOverrideTextarea)
		{
			$("#wpgmza_gdpr_override_notice_text").show("slow");
		}
		else
		{
			$("#wpgmza_gdpr_override_notice_text").hide("slow");
		}
	}
	
	jQuery(function($) {
		
		if(!window.location.href.match(/wp-google-maps-menu-settings/))
			return;
		
		WPGMZA.mapSettingsPage = new WPGMZA.MapSettingsPage();
		
	});
	
});

// js/v8/map-settings.js
/**
 * @namespace WPGMZA
 * @module MapSettings
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Handles map settings, parsing them from the data-settings attribute on the maps HTML element.
	 * NB: This will be split into GoogleMapSettings and OLMapSettings in the future.
	 * @class WPGMZA.MapSettings
	 * @constructor WPGMZA.MapSettings
	 */
	WPGMZA.MapSettings = function(element)
	{
		var self = this;
		var str = element.getAttribute("data-settings");
		var json;
		
		try{
			json = JSON.parse(str);
		}catch(e) {
			
			str = str.replace(/\\%/g, "%");
			str = str.replace(/\\\\"/g, '\\"');
			
			try{
				json = JSON.parse(str);
			}catch(e) {
				json = {};
				console.warn("Failed to parse map settings JSON");
			}
			
		}
		
		WPGMZA.assertInstanceOf(this, "MapSettings");
		
		function addSettings(input)
		{
			if(!input)
				return;
			
			for(var key in input)
			{
				if(key == "other_settings")
					continue; // Ignore other_settings
				
				var value = input[key];
				
				if(String(value).match(/^-?\d+$/))
					value = parseInt(value);
					
				self[key] = value;
			}
		}
		
		addSettings(WPGMZA.settings);
		
		addSettings(json);
		
		if(json && json.other_settings)
			addSettings(json.other_settings);
	}
	
	/**
	 * Returns settings on this object converted to OpenLayers view options
	 * @method
	 * @memberof WPGMZA.MapSettings
	 * @return {object} The map settings, in a format understood by OpenLayers
	 */
	WPGMZA.MapSettings.prototype.toOLViewOptions = function()
	{
		var options = {
			center: ol.proj.fromLonLat([-119.4179, 36.7783]),
			zoom: 4
		};
		
		function empty(name)
		{
			if(typeof self[name] == "object")
				return false;
			
			return !self[name] || !self[name].length;
		}
		
		// Start location
		if(typeof this.start_location == "string")
		{
			var coords = this.start_location.replace(/^\(|\)$/g, "").split(",");
			if(WPGMZA.isLatLngString(this.start_location))
				options.center = ol.proj.fromLonLat([
					parseFloat(coords[1]),
					parseFloat(coords[0])
				]);
			else
				console.warn("Invalid start location");
		}
		
		if(this.center)
		{
			options.center = ol.proj.fromLonLat([
				parseFloat(this.center.lng),
				parseFloat(this.center.lat)
			]);
		}
		
		// Start zoom
		if(this.zoom)
			options.zoom = parseInt(this.zoom);
		
		if(this.start_zoom)
			options.zoom = parseInt(this.start_zoom);
		
		// Zoom limits
		// TODO: This matches the Google code, so some of these could be potentially put on a parent class
		if(this.map_min_zoom && this.map_max_zoom)
		{
			options.minZoom = Math.min(this.map_min_zoom, this.map_max_zoom);
			options.maxZoom = Math.max(this.map_min_zoom, this.map_max_zoom);
		}
		
		return options;
	}
	
	/**
	 * Returns settings on this object converted to Google's MapOptions spec.
	 * @method
	 * @memberof WPGMZA.MapSettings
	 * @return {object} The map settings, in the format specified by google.maps.MapOptions
	 */
	WPGMZA.MapSettings.prototype.toGoogleMapsOptions = function()
	{
		var self = this;
		var latLngCoords = (this.start_location && this.start_location.length ? this.start_location.split(",") : [36.7783, -119.4179]);
		
		function empty(name)
		{
			if(typeof self[name] == "object")
				return false;
			
			return !self[name] || !self[name].length;
		}
		
		function formatCoord(coord)
		{
			if($.isNumeric(coord))
				return coord;
			return parseFloat( String(coord).replace(/[\(\)\s]/, "") );
		}
		
		var latLng = new google.maps.LatLng(
			formatCoord(latLngCoords[0]),
			formatCoord(latLngCoords[1])
		);
		
		var zoom = (this.start_zoom ? parseInt(this.start_zoom) : 4);
		
		if(!this.start_zoom && this.zoom)
			zoom = parseInt( this.zoom );
		
		var options = {
			zoom:			zoom,
			center:			latLng
		};
		
		if(!empty("center"))
			options.center = new google.maps.LatLng({
				lat: parseFloat(this.center.lat),
				lng: parseFloat(this.center.lng)
			});
		
		if(this.map_min_zoom && this.map_max_zoom)
		{
			options.minZoom = Math.min(this.map_min_zoom, this.map_max_zoom);
			options.maxZoom = Math.max(this.map_min_zoom, this.map_max_zoom);
		}
		
		// These settings are all inverted because the checkbox being set means "disabled"
		options.zoomControl				= !(this.wpgmza_settings_map_zoom == 'yes');
        options.panControl				= !(this.wpgmza_settings_map_pan == 'yes');
        options.mapTypeControl			= !(this.wpgmza_settings_map_type == 'yes');
        options.streetViewControl		= !(this.wpgmza_settings_map_streetview == 'yes');
        options.fullscreenControl		= !(this.wpgmza_settings_map_full_screen_control == 'yes');
        
        options.draggable				= !(this.wpgmza_settings_map_draggable == 'yes');
        options.disableDoubleClickZoom	= (this.wpgmza_settings_map_clickzoom == 'yes');
        options.scrollwheel				= !(this.wpgmza_settings_map_scroll == 'yes');
		
		if(this.wpgmza_force_greedy_gestures == "greedy" || this.wpgmza_force_greedy_gestures == "yes")
			options.gestureHandling = "greedy";
		else
			options.gestureHandling = "cooperative";
		
		switch(parseInt(this.type))
		{
			case 2:
				options.mapTypeId = google.maps.MapTypeId.SATELLITE;
				break;
			
			case 3:
				options.mapTypeId = google.maps.MapTypeId.HYBRID;
				break;
			
			case 4:
				options.mapTypeId = google.maps.MapTypeId.TERRAIN;
				break;
				
			default:
				options.mapTypeId = google.maps.MapTypeId.ROADMAP;
				break;
		}
		
		if(this.theme_data && this.theme_data.length > 0)
		{
			try{
				options.styles = JSON.parse(this.theme_data);
			}catch(e) {
				alert("Your theme data is not valid JSON and has been ignored");
			}
		}
		
		return options;
	}
});

// js/v8/map.js
/**
 * @namespace WPGMZA
 * @module Map
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	/**
	 * Base class for maps. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Map
	 * @constructor WPGMZA.Map
	 * @memberof WPGMZA
	 * @param {HTMLElement} element to contain map
	 * @param {object} [options] Options to apply to this map
	 * @augments WPGMZA.EventDispatcher
	 */
	WPGMZA.Map = function(element, options)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Map");
		
		WPGMZA.EventDispatcher.call(this);
		
		if(!(element instanceof HTMLElement))
			throw new Error("Argument must be a HTMLElement");
		
		this.id = element.getAttribute("data-map-id");
		if(!/\d+/.test(this.id))
			throw new Error("Map ID must be an integer");
		
		WPGMZA.maps.push(this);
		this.element = element;
		this.element.wpgmzaMap = this;
		
		this.engineElement = element;
		
		this.markers = [];
		this.polygons = [];
		this.polylines = [];
		this.circles = [];
		
		this.loadSettings(options);
		
		this.shortcodeAttributes = {};
		if($(this.element).attr("data-shortcode-attributes"))
			try{
				this.shortcodeAttributes = JSON.parse($(this.element).attr("data-shortcode-attributes"))
			}catch(e) {
				console.warn("Error parsing shortcode attributes");
			}
		
		this.initStoreLocator();
		
		this.markerFilter = WPGMZA.MarkerFilter.createInstance(this);
	}
	
	WPGMZA.Map.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.Map.prototype.constructor = WPGMZA.Map;
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.Map
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.Map.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				if(WPGMZA.isProVersion())
					return WPGMZA.OLProMap;
				
				return WPGMZA.OLMap;
				break;
			
			default:
				if(WPGMZA.isProVersion())
					return WPGMZA.GoogleProMap;
				
				return WPGMZA.GoogleMap;
				break;
		}
	}

	/**
	 * Creates an instance of a map, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {HTMLElement} element to contain map
	 * @param {object} [options] Options to apply to this map
	 * @return {WPGMZA.Map} An instance of WPGMZA.Map
	 */
	WPGMZA.Map.createInstance = function(element, options)
	{
		var constructor = WPGMZA.Map.getConstructor();
		return new constructor(element, options);
	}
	
	/**
	 * Loads the maps settings and sets some defaults
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.loadSettings = function(options)
	{
		var settings = new WPGMZA.MapSettings(this.element);
		var other_settings = settings.other_settings;
		
		delete settings.other_settings;
		
		/*if(other_settings)
			for(var key in other_settings)
				settings[key] = other_settings[key];*/
			
		if(options)
			for(var key in options)
				settings[key] = options[key];
			
		this.settings = settings;
	}
	
	WPGMZA.Map.prototype.initStoreLocator = function()
	{
		var storeLocatorElement = $(".wpgmza_sl_main_div");
		if(storeLocatorElement.length)
			this.storeLocator = WPGMZA.StoreLocator.createInstance(this, storeLocatorElement[0]);
	}
	
	/**
	 * This override should automatically dispatch a .wpgmza scoped event on the element
	 * TODO: Implement
	 */
	/*WPGMZA.Map.prototype.trigger = function(event)
	{
		
	}*/
	
	/**
	 * Sets options in bulk on map
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.setOptions = function(options)
	{
		for(var name in options)
			this.settings[name] = options[name];
	}
	
	/**
	 * Gets the distance between two latLngs in kilometers
	 * NB: Static function
	 * @return number
	 */
	var earthRadiusMeters = 6371;
	var piTimes360 = Math.PI / 360;
	
	function deg2rad(deg) {
	  return deg * (Math.PI/180)
	};
	
	/**
	 * This gets the distance in kilometers between two latitude / longitude points
	 * TODO: Move this to the distance class, or the LatLng class
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {number} lat1 Latitude from the first coordinate pair
	 * @param {number} lon1 Longitude from the first coordinate pair
	 * @param {number} lat2 Latitude from the second coordinate pair
	 * @param {number} lon1 Longitude from the second coordinate pair
	 * @return {number} The distance between the latitude and longitudes, in kilometers
	 */
	WPGMZA.Map.getGeographicDistance = function(lat1, lon1, lat2, lon2)
	{
		var dLat = deg2rad(lat2-lat1);
		var dLon = deg2rad(lon2-lon1); 
		
		var a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2); 
			
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = earthRadiusMeters * c; // Distance in km
		
		return d;
	}
	
	/**
	 * Centers the map on the supplied latitude and longitude
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {object|WPGMZA.LatLng} latLng A LatLng literal or an instance of WPGMZA.LatLng
	 */
	WPGMZA.Map.prototype.setCenter = function(latLng)
	{
		if(!("lat" in latLng && "lng" in latLng))
			throw new Error("Argument is not an object with lat and lng");
	}
	
	/**
	 * Sets the dimensions of the map engine element
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {number} width Width as a CSS string
	 * @param {number} height Height as a CSS string
	 */
	WPGMZA.Map.prototype.setDimensions = function(width, height)
	{
		$(this.element).css({
			width: width
		});
		
		$(this.engineElement).css({
			width: "100%",
			height: height
		});
	}
	
	/**
	 * Adds the specified marker to this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Marker} marker The marker to add
	 * @fires markeradded
	 * @fires WPGMZA.Marker#added
	 * @throws Argument must be an instance of WPGMZA.Marker
	 */
	WPGMZA.Map.prototype.addMarker = function(marker)
	{
		if(!(marker instanceof WPGMZA.Marker))
			throw new Error("Argument must be an instance of WPGMZA.Marker");
		
		marker.map = this;
		marker.parent = this;
		
		this.markers.push(marker);
		this.dispatchEvent({type: "markeradded", marker: marker});
		marker.dispatchEvent({type: "added"});
	}
	
	/**
	 * Removes the specified marker from this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Marker} marker The marker to remove
	 * @fires markerremoved
	 * @fires WPGMZA.Marker#removed
	 * @throws Argument must be an instance of WPGMZA.Marker
	 * @throws Wrong map error
	 */
	WPGMZA.Map.prototype.removeMarker = function(marker)
	{
		if(!(marker instanceof WPGMZA.Marker))
			throw new Error("Argument must be an instance of WPGMZA.Marker");
		
		if(marker.map !== this)
			throw new Error("Wrong map error");
		
		marker.map = null;
		marker.parent = null;
		
		this.markers.splice(this.markers.indexOf(marker), 1);
		this.dispatchEvent({type: "markerremoved", marker: marker});
		marker.dispatchEvent({type: "removed"});
	}
	
	/**
	 * Gets a marker by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the marker to get
	 * @return {WPGMZA.Marker|null} The marker, or null if no marker with the specified ID is found
	 */
	WPGMZA.Map.prototype.getMarkerByID = function(id)
	{
		for(var i = 0; i < this.markers.length; i++)
		{
			if(this.markers[i].id == id)
				return this.markers[i];
		}
		
		return null;
	}
	
	/**
	 * Removes a marker by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the marker to remove
	 * @fires markerremoved
	 * @fires WPGMZA.Marker#removed
	 */
	WPGMZA.Map.prototype.removeMarkerByID = function(id)
	{
		var marker = this.getMarkerByID(id);
		
		if(!marker)
			return;
		
		this.removeMarker(marker);
	}
	
	/**
	 * Adds the specified polygon to this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Polygon} polygon The polygon to add
	 * @fires polygonadded
	 * @throws Argument must be an instance of WPGMZA.Polygon
	 */
	WPGMZA.Map.prototype.addPolygon = function(polygon)
	{
		if(!(polygon instanceof WPGMZA.Polygon))
			throw new Error("Argument must be an instance of WPGMZA.Polygon");
		
		polygon.map = this;
		
		this.polygons.push(polygon);
		this.dispatchEvent({type: "polygonadded", polygon: polygon});
	}
	
	/**
	 * Removes the specified polygon from this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Polygon} polygon The polygon to remove
	 * @fires polygonremoved
	 * @throws Argument must be an instance of WPGMZA.Polygon
	 * @throws Wrong map error
	 */
	WPGMZA.Map.prototype.deletePolygon = function(polygon)
	{
		if(!(polygon instanceof WPGMZA.Polygon))
			throw new Error("Argument must be an instance of WPGMZA.Polygon");
		
		if(polygon.map !== this)
			throw new Error("Wrong map error");
		
		polygon.map = null;
		
		this.polygons.splice(this.polygons.indexOf(polygon), 1);
		this.dispatchEvent({type: "polygonremoved", polygon: polygon});
	}
	
	/**
	 * Gets a polygon by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the polygon to get
	 * @return {WPGMZA.Polygon|null} The polygon, or null if no polygon with the specified ID is found
	 */
	WPGMZA.Map.prototype.getPolygonByID = function(id)
	{
		for(var i = 0; i < this.polygons.length; i++)
		{
			if(this.polygons[i].id == id)
				return this.polygons[i];
		}
		
		return null;
	}
	
	/**
	 * Removes a polygon by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the polygon to remove
	 */
	WPGMZA.Map.prototype.deletePolygonByID = function(id)
	{
		var polygon = this.getPolygonByID(id);
		
		if(!polygon)
			return;
		
		this.deletePolygon(polygon);
	}
	
	/**
	 * Gets a polyline by ID
	 * @return void
	 */
	WPGMZA.Map.prototype.getPolylineByID = function(id)
	{
		for(var i = 0; i < this.polylines.length; i++)
		{
			if(this.polylines[i].id == id)
				return this.polylines[i];
		}
		
		return null;
	}
	
	/**
	 * Adds the specified polyline to this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Polyline} polyline The polyline to add
	 * @fires polylineadded
	 * @throws Argument must be an instance of WPGMZA.Polyline
	 */
	WPGMZA.Map.prototype.addPolyline = function(polyline)
	{
		if(!(polyline instanceof WPGMZA.Polyline))
			throw new Error("Argument must be an instance of WPGMZA.Polyline");
		
		polyline.map = this;
		
		this.polylines.push(polyline);
		this.dispatchEvent({type: "polylineadded", polyline: polyline});
	}
	
	/**
	 * Removes the specified polyline from this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Polyline} polyline The polyline to remove
	 * @fires polylineremoved
	 * @throws Argument must be an instance of WPGMZA.Polyline
	 * @throws Wrong map error
	 */
	WPGMZA.Map.prototype.deletePolyline = function(polyline)
	{
		if(!(polyline instanceof WPGMZA.Polyline))
			throw new Error("Argument must be an instance of WPGMZA.Polyline");
		
		if(polyline.map !== this)
			throw new Error("Wrong map error");
		
		polyline.map = null;
		
		this.polylines.splice(this.polylines.indexOf(polyline), 1);
		this.dispatchEvent({type: "polylineremoved", polyline: polyline});
	}
	
	/**
	 * Gets a polyline by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the polyline to get
	 * @return {WPGMZA.Polyline|null} The polyline, or null if no polyline with the specified ID is found
	 */
	WPGMZA.Map.prototype.getPolylineByID = function(id)
	{
		for(var i = 0; i < this.polylines.length; i++)
		{
			if(this.polylines[i].id == id)
				return this.polylines[i];
		}
		
		return null;
	}
	
	/**
	 * Removes a polyline by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the polyline to remove
	 */
	WPGMZA.Map.prototype.deletePolylineByID = function(id)
	{
		var polyline = this.getPolylineByID(id);
		
		if(!polyline)
			return;
		
		this.deletePolyline(polyline);
	}
	
	/**
	 * Adds the specified circle to this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Circle} circle The circle to add
	 * @fires polygonadded
	 * @throws Argument must be an instance of WPGMZA.Circle
	 */
	WPGMZA.Map.prototype.addCircle = function(circle)
	{
		if(!(circle instanceof WPGMZA.Circle))
			throw new Error("Argument must be an instance of WPGMZA.Circle");
		
		circle.map = this;
		
		this.circles.push(circle);
		this.dispatchEvent({type: "circleadded", circle: circle});
	}
	
	/**
	 * Removes the specified circle from this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Circle} circle The circle to remove
	 * @fires circleremoved
	 * @throws Argument must be an instance of WPGMZA.Circle
	 * @throws Wrong map error
	 */
	WPGMZA.Map.prototype.removeCircle = function(circle)
	{
		if(!(circle instanceof WPGMZA.Circle))
			throw new Error("Argument must be an instance of WPGMZA.Circle");
		
		if(circle.map !== this)
			throw new Error("Wrong map error");
		
		circle.map = null;
		
		this.circles.splice(this.circles.indexOf(circle), 1);
		this.dispatchEvent({type: "circleremoved", circle: circle});
	}
	
	/**
	 * Gets a circle by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the circle to get
	 * @return {WPGMZA.Circle|null} The circle, or null if no circle with the specified ID is found
	 */
	WPGMZA.Map.prototype.getCircleByID = function(id)
	{
		for(var i = 0; i < this.circles.length; i++)
		{
			if(this.circles[i].id == id)
				return this.circles[i];
		}
		
		return null;
	}
	
	/**
	 * Removes a circle by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the circle to remove
	 */
	WPGMZA.Map.prototype.deleteCircleByID = function(id)
	{
		var circle = this.getCircleByID(id);
		
		if(!circle)
			return;
		
		this.deleteCircle(circle);
	}
	
	/**
	 * Nudges the map viewport by the given pixel coordinates
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {number} x Number of pixels to nudge along the x axis
	 * @param {number} y Number of pixels to nudge along the y axis
	 * @throws Invalid coordinates supplied
	 */
	WPGMZA.Map.prototype.nudge = function(x, y)
	{
		var pixels = this.latLngToPixels(this.getCenter());
		
		pixels.x += parseFloat(x);
		pixels.y += parseFloat(y);
		
		if(isNaN(pixels.x) || isNaN(pixels.y))
			throw new Error("Invalid coordinates supplied");
		
		var latLng = this.pixelsToLatLng(pixels);
		
		this.setCenter(latLng);
	}
	
	/**
	 * Called when the window resizes
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.onWindowResize = function(event)
	{
		
	}
	
	/**
	 * Called when the engine map div is resized
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.onElementResized = function(event)
	{
		
	}
	
	/**
	 * Called when the map viewport bounds change. Fires the legacy bounds_changed event.
	 * @method
	 * @memberof WPGMZA.Map
	 * @fires boundschanged
	 * @fires bounds_changed
	 */
	WPGMZA.Map.prototype.onBoundsChanged = function(event)
	{
		// Native events
		this.trigger("boundschanged");
		
		// Google / legacy compatibility events
		this.trigger("bounds_changed");
	}
	
	/**
	 * Called when the map viewport becomes idle (eg movement done, tiles loaded)
	 * @method
	 * @memberof WPGMZA.Map
	 * @fires idle
	 */
	WPGMZA.Map.prototype.onIdle = function(event)
	{
		this.trigger("idle");
	}
	
});

// js/v8/maps-engine-dialog.js
/**
 * @namespace WPGMZA
 * @module MapsEngineDialog
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * The modal dialog presented to the user in the map edit page, prompting them to choose a map engine, if they haven't done so already
	 * @class WPGMZA.MapEngineDialog
	 * @constructor WPGMZA.MapEngineDialog
	 * @memberof WPGMZA
	 * @param {HTMLElement} element to create modal dialog from
	 */
	WPGMZA.MapsEngineDialog = function(element)
	{
		var self = this;
		
		this.element = element;
		
		if(window.wpgmzaUnbindSaveReminder)
			window.wpgmzaUnbindSaveReminder();
		
		$(element).show();
		$(element).remodal().open();
		
		$(element).find("input:radio").on("change", function(event) {
			
			$("#wpgmza-confirm-engine").prop("disabled", false);
			
		});
		
		$("#wpgmza-confirm-engine").on("click", function(event) {
			
			self.onButtonClicked(event);
			
		});
	}
	
	/**
	 * Triggered when an engine is selected. Makes an AJAX call to the server to save the selected engine.
	 * @method
	 * @memberof WPGMZA.MapEngineDialog
	 * @param {object} event The click event from the selected button.
	 */
	WPGMZA.MapsEngineDialog.prototype.onButtonClicked = function(event)
	{
		$(event.target).prop("disabled", true);
		
		$.ajax(WPGMZA.ajaxurl, {
			method: "POST",
			data: {
				action: "wpgmza_maps_engine_dialog_set_engine",
				engine: $("[name='wpgmza_maps_engine']:checked").val()
			},
			success: function(response, status, xhr) {
				window.location.reload();
			}
		});
	}
	
	$(window).on("load", function(event) {
		
		var element = $("#wpgmza-maps-engine-dialog");
		
		if(!element.length)
			return;
		
		if(WPGMZA.settings.wpgmza_maps_engine_dialog_done)
			return;
		
		if(WPGMZA.settings.wpgmza_google_maps_api_key && WPGMZA.settings.wpgmza_google_maps_api_key.length)
			return;
		
		WPGMZA.mapsEngineDialog = new WPGMZA.MapsEngineDialog(element);
		
	});
	
});

// js/v8/marker-filter.js
/**
 * @namespace WPGMZA
 * @module MarkerFilter
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.MarkerFilter = function(map)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		this.map = map;
	}
	
	WPGMZA.MarkerFilter.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.MarkerFilter.prototype.constructor = WPGMZA.MarkerFilter;
	
	WPGMZA.MarkerFilter.createInstance = function(map)
	{
		return new WPGMZA.MarkerFilter(map);
	}
	
	WPGMZA.MarkerFilter.prototype.getFilteringParameters = function()
	{
		var params = {map_id: this.map.id};
		
		if(this.map.storeLocator)
			params = $.extend(params, this.map.storeLocator.getFilteringParameters());
		
		return params;
	}
	
	WPGMZA.MarkerFilter.prototype.update = function()
	{
		// NB: This function takes no action. The client can hide and show markers based on radius without putting load on the server. This function is only used by the ProMarkerFilter module
	}
	
	WPGMZA.MarkerFilter.prototype.onFilteringComplete = function(results)
	{
		
	}
	
});

// js/v8/marker.js
/**
 * @namespace WPGMZA
 * @module Marker
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Base class for markers. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Marker
	 * @constructor WPGMZA.Marker
	 * @memberof WPGMZA
	 * @param {object} [row] Data to map to this object (eg from the database)
	 * @augments WPGMZA.MapObject
	 */
	WPGMZA.Marker = function(row)
	{
		var self = this;
		
		this._offset = {x: 0, y: 0};
		
		WPGMZA.assertInstanceOf(this, "Marker");
		
		this.lat = "36.778261";
		this.lng = "-119.4179323999";
		this.address = "California";
		this.title = null;
		this.description = "";
		this.link = "";
		this.icon = "";
		this.approved = 1;
		this.pic = null;
		
		this.disableInfoWindow = false;
		
		WPGMZA.MapObject.apply(this, arguments);
		
		if(row && row.heatmap)
			return; // Don't listen for these events on heatmap markers.
		
		if(row)
			this.on("init", function(event) {
				if(row.position)
					this.setPosition(row.position);
				
				if(row.map)
					row.map.addMarker(this);
			});
		
		this.addEventListener("added", function(event) {
			self.onAdded(event);
		});
	}
	
	WPGMZA.Marker.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Marker.prototype.constructor = WPGMZA.Marker;
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.Marker
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.Marker.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				if(WPGMZA.isProVersion())
					return WPGMZA.OLProMarker;
				return WPGMZA.OLMarker;
				break;
				
			default:
				if(WPGMZA.isProVersion())
					return WPGMZA.GoogleProMarker;
				return WPGMZA.GoogleMarker;
				break;
		}
	}
	
	/**
	 * Creates an instance of a marker, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {object} [row] Data to map to this object (eg from the database)
	 */
	WPGMZA.Marker.createInstance = function(row)
	{
		var constructor = WPGMZA.Marker.getConstructor();
		return new constructor(row);
	}
	
	WPGMZA.Marker.ANIMATION_NONE			= "0";
	WPGMZA.Marker.ANIMATION_BOUNCE			= "1";
	WPGMZA.Marker.ANIMATION_DROP			= "2";
	
	Object.defineProperty(WPGMZA.Marker.prototype, "offsetX", {
		
		get: function()
		{
			return this._offset.x;
		},
		
		set: function(value)
		{
			this._offset.x = value;
			this.updateOffset();
		}
		
	});
	
	Object.defineProperty(WPGMZA.Marker.prototype, "offsetY", {
		
		get: function()
		{
			return this._offset.y;
		},
		
		set: function(value)
		{
			this._offset.y = value;
			this.updateOffset();
		}
		
	});
	
	/**
	 * Called when the marker has been added to a map
	 * @method
	 * @method
	 * @memberof WPGMZA.Marker
	 */
	WPGMZA.Marker.prototype.onAdded = function(event)
	{
		var self = this;
		
		this.addEventListener("click", function(event) {
			self.onClick(event);
		});
		
		this.addEventListener("mouseover", function(event) {
			self.onMouseOver(event);
		});
		
		this.addEventListener("select", function(event) {
			self.onSelect(event);
		});
		
		if(this.map.settings.marker == this.id)
			self.trigger("select");
		
		if(this.infoopen == "1")
			this.openInfoWindow();
	}
	
	WPGMZA.Marker.prototype.initInfoWindow = function()
	{
		if(this.infoWindow)
			return;
		
		this.infoWindow = WPGMZA.InfoWindow.createInstance();
	}
	
	/**
	 * Placeholder for future use
	 * @method
	 * @memberof WPGMZA.Marker
	 */
	WPGMZA.Marker.prototype.openInfoWindow = function()
	{
		if(!this.map)
		{
			console.warn("Cannot open infowindow for marker with no map");
			return;
		}
		
		if(this.map.lastInteractedMarker)
			this.map.lastInteractedMarker.infoWindow.close();
		this.map.lastInteractedMarker = this;
		
		this.initInfoWindow();
		this.infoWindow.open(this.map, this);
	}
	
	/**
	 * Called when the marker has been clicked
	 * @method
	 * @memberof WPGMZA.Marker
	 */
	WPGMZA.Marker.prototype.onClick = function(event)
	{
		
	}
	
	/**
	 * Called when the marker has been selected, either by the icon being clicked, or from a marker listing
	 * @method
	 * @memberof WPGMZA.Marker
	 */
	WPGMZA.Marker.prototype.onSelect = function(event)
	{
		this.openInfoWindow();
	}
	
	/**
	 * Called when the user hovers the mouse over this marker
	 * @method
	 * @memberof WPGMZA.Marker
	 */
	WPGMZA.Marker.prototype.onMouseOver = function(event)
	{
		if(this.map.settings.info_window_open_by == WPGMZA.InfoWindow.OPEN_BY_HOVER)
			this.openInfoWindow();
	}
	
	/**
	 * Gets the marker icon image URL, without the protocol prefix
	 * @method
	 * @memberof WPGMZA.Marker
	 * @return {string} The URL to the markers icon image
	 */
	WPGMZA.Marker.prototype.getIcon = function()
	{
		function stripProtocol(url)
		{
			if(typeof url != "string")
				return url;
			
			return url.replace(/^http(s?):/, "");
		}
		
		if(WPGMZA.defaultMarkerIcon)
			return stripProtocol(WPGMZA.defaultMarkerIcon);
		
		return stripProtocol(WPGMZA.settings.default_marker_icon);
	}
	
	/**
	 * Gets the position of the marker
	 * @method
	 * @memberof WPGMZA.Marker
	 * @return {object} LatLng literal of this markers position
	 */
	WPGMZA.Marker.prototype.getPosition = function()
	{
		return new WPGMZA.LatLng({
			lat: parseFloat(this.lat),
			lng: parseFloat(this.lng)
		});
	}
	
	/**
	 * Sets the position of the marker.
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {object|WPGMZA.LatLng} latLng The position either as a LatLng literal or instance of WPGMZA.LatLng.
	 */
	WPGMZA.Marker.prototype.setPosition = function(latLng)
	{
		if(latLng instanceof WPGMZA.LatLng)
		{
			this.lat = latLng.lat;
			this.lng = latLng.lng;
		}
		else
		{
			this.lat = parseFloat(latLng.lat);
			this.lng = parseFloat(latLng.lng);
		}
	}
	
	WPGMZA.Marker.prototype.setOffset = function(x, y)
	{
		this._offset.x = x;
		this._offset.y = y;
		
		this.updateOffset();
	}
	
	WPGMZA.Marker.prototype.updateOffset = function()
	{
		
	}
	
	/**
	 * Returns the animation set on this marker (see WPGMZA.Marker ANIMATION_* constants).
	 * @method
	 * @memberof WPGMZA.Marker
	 */
	WPGMZA.Marker.prototype.getAnimation = function(animation)
	{
		return this.settings.animation;
	}
	
	/**
	 * Sets the animation for this marker (see WPGMZA.Marker ANIMATION_* constants).
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {int} animation The animation to set.
	 */
	WPGMZA.Marker.prototype.setAnimation = function(animation)
	{
		this.settings.animation = animation;
	}
	
	/**
	 * Get the marker visibility
	 * @method
	 * @todo Implement
	 * @memberof WPGMZA.Marker
	 */
	WPGMZA.Marker.prototype.getVisible = function()
	{
		
	}
	
	/**
	 * Set the marker visibility. This is used by the store locator etc. and is not a setting. Closes the InfoWindow if the marker is being hidden and the InfoWindow for this marker is open.
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {bool} visible Whether the marker should be visible or not
	 */
	WPGMZA.Marker.prototype.setVisible = function(visible)
	{
		if(!visible && this.infoWindow)
			this.infoWindow.close();
	}
	
	WPGMZA.Marker.prototype.getMap = function()
	{
		return this.map;
	}
	
	/**
	 * Sets the map this marker should be displayed on. If it is already on a map, it will be removed from that map first, before being added to the supplied map.
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {WPGMZA.Map} map The map to add this markmer to
	 */
	WPGMZA.Marker.prototype.setMap = function(map)
	{
		if(!map)
		{
			if(this.map)
				this.map.removeMarker(this);
		}
		else
			map.addMarker(this);
		
		this.map = map;
	}
	
	/**
	 * Gets whether this marker is draggable or not
	 * @method
	 * @memberof WPGMZA.Marker
	 * @return {bool} True if the marker is draggable
	 */
	WPGMZA.Marker.prototype.getDraggable = function()
	{
		
	}
	
	/**
	 * Sets whether the marker is draggable
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {bool} draggable Set to true to make this marker draggable
	 */
	WPGMZA.Marker.prototype.setDraggable = function(draggable)
	{
		
	}
	
	/**
	 * Sets options on this marker
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {object} options An object containing the options to be set
	 */
	WPGMZA.Marker.prototype.setOptions = function(options)
	{
		
	}
	
	WPGMZA.Marker.prototype.setOpacity = function(opacity)
	{
		
	}
	
	/**
	 * Centers the map this marker belongs to on this marker
	 * @method
	 * @memberof WPGMZA.Marker
	 * @throws Marker hasn't been added to a map
	 */
	WPGMZA.Marker.prototype.panIntoView = function()
	{
		if(!this.map)
			throw new Error("Marker hasn't been added to a map");
		
		this.map.setCenter(this.getPosition());
	}
	
	/**
	 * Overrides MapObject.toJSON, serializes the marker to a JSON object
	 * @method
	 * @memberof WPGMZA.Marker
	 * @return {object} A JSON representation of this marker
	 */
	WPGMZA.Marker.prototype.toJSON = function()
	{
		var result = WPGMZA.MapObject.prototype.toJSON.call(this);
		var position = this.getPosition();
		
		$.extend(result, {
			lat: position.lat,
			lng: position.lng,
			address: this.address,
			title: this.title,
			description: this.description,
			link: this.link,
			icon: this.icon,
			pic: this.pic,
			approved: this.approved
		});
		
		return result;
	}
	
	
});

// js/v8/modern-store-locator-circle.js
/**
 * @namespace WPGMZA
 * @module ModernStoreLocatorCircle
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * This is the base class the modern store locator circle. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.ModernStoreLocatorCircle
	 * @constructor WPGMZA.ModernStoreLocatorCircle
	 * @param {int} map_id The ID of the map this circle belongs to
	 * @param {object} [settings] Settings to pass into this circle, such as strokeColor
	 */
	WPGMZA.ModernStoreLocatorCircle = function(map_id, settings) {
		var self = this;
		var map;
		
		if(WPGMZA.isProVersion())
			map = this.map = MYMAP[map_id].map;
		else
			map = this.map = MYMAP.map;
		
		this.map_id = map_id;
		this.mapElement = map.element;
		this.mapSize = {
			width:  $(this.mapElement).width(),
			height: $(this.mapElement).height()
		};
			
		this.initCanvasLayer();
		
		this.settings = {
			center: new WPGMZA.LatLng(0, 0),
			radius: 1,
			color: "#63AFF2",
			
			shadowColor: "white",
			shadowBlur: 4,
			
			centerRingRadius: 10,
			centerRingLineWidth: 3,

			numInnerRings: 9,
			innerRingLineWidth: 1,
			innerRingFade: true,
			
			numOuterRings: 7,
			
			ringLineWidth: 1,
			
			mainRingLineWidth: 2,
			
			numSpokes: 6,
			spokesStartAngle: Math.PI / 2,
			
			numRadiusLabels: 6,
			radiusLabelsStartAngle: Math.PI / 2,
			radiusLabelFont: "13px sans-serif",
			
			visible: false
		};
		
		if(settings)
			this.setOptions(settings);
	};
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.ModernStoreLocatorCircle.createInstance = function(map, settings) {
		
		if(WPGMZA.settings.engine == "google-maps")
			return new WPGMZA.GoogleModernStoreLocatorCircle(map, settings);
		else
			return new WPGMZA.OLModernStoreLocatorCircle(map, settings);
		
	};
	
	/**
	 * Abstract function to initialize the canvas layer
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.initCanvasLayer = function() {
		
	}
	
	/**
	 * Handles the map viewport being resized
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.onResize = function(event) { 
		this.draw();
	};
	
	/**
	 * Updates and redraws the circle
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.onUpdate = function(event) { 
		this.draw();
	};
	
	/**
	 * Sets options on the circle (for example, strokeColor)
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @param {object} options An object of options to iterate over and set on this circle.
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.setOptions = function(options) {
		for(var name in options)
		{
			var functionName = "set" + name.substr(0, 1).toUpperCase() + name.substr(1);
			
			if(typeof this[functionName] == "function")
				this[functionName](options[name]);
			else
				this.settings[name] = options[name];
		}
	};
	
	/**
	 * Gets the resolution scale for drawing on the circles canvas.
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @return {number} The device pixel ratio, or 1 where that is not present.
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getResolutionScale = function() {
		return window.devicePixelRatio || 1;
	};
	
	/**
	 * Returns the center of the circle
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @return {object} A latLng literal
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getCenter = function() {
		return this.getPosition();
	};
	
	/**
	 * Sets the center of the circle
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @param {WPGMZA.LatLng|object} A LatLng literal or instance of WPGMZA.LatLng
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.setCenter = function(value) {
		this.setPosition(value);
	};
	
	/**
	 * Gets the center of the circle
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @return {object} The center as a LatLng literal
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getPosition = function() {
		return this.settings.center;
	};
	
	/**
	 * Alias for setCenter
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.setPosition = function(position) {
		this.settings.center = position;
	};
	
	/**
	 * Gets the circle radius, in kilometers
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @return {number} The circles radius, in kilometers
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getRadius = function() {
		return this.settings.radius;
	};
	
	/**
	 * Sets the circles radius, in kilometers
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @param {number} radius The radius, in kilometers
	 * @throws Invalid radius
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.setRadius = function(radius) {
		
		if(isNaN(radius))
			throw new Error("Invalid radius");
		
		this.settings.radius = radius;
	};
	
	/**
	 * Gets the visibility of the circle
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @return {bool} Whether or not the circle is visible
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getVisible = function() {
		return this.settings.visible;
	};
	
	/**
	 * Sets the visibility of the circle
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @param {bool} visible Whether the circle should be visible
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.setVisible = function(visible) {
		this.settings.visible = visible;
	};
	
	/**
	 * Abstract function to get the transformed circle radius (see subclasses)
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @param {number} km The input radius, in kilometers
	 * @throws Abstract function called
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getTransformedRadius = function(km)
	{
		throw new Error("Abstract function called");
	}
	
	/**
	 * Abstract function to set the canvas context
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @param {string} type The context type
	 * @throws Abstract function called
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getContext = function(type)
	{
		throw new Error("Abstract function called");
	}
	
	/**
	 * Abstract function to get the canvas dimensions
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @throws Abstract function called
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getCanvasDimensions = function()
	{
		throw new Error("Abstract function called");
	}
	
	/**
	 * Validates the circle settings and corrects them where they are invalid
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.validateSettings = function()
	{
		if(!WPGMZA.isHexColorString(this.settings.color))
			this.settings.color = "#63AFF2";
	}
	
	/**
	 * Draws the circle to the canvas
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.draw = function() {
		
		this.validateSettings();
		
		var settings = this.settings;
		var canvasDimensions = this.getCanvasDimensions();
		
        var canvasWidth = canvasDimensions.width;
        var canvasHeight = canvasDimensions.height;
		
		var map = this.map;
		var resolutionScale = this.getResolutionScale();
		
		context = this.getContext("2d");
        context.clearRect(0, 0, canvasWidth, canvasHeight);

		if(!settings.visible)
			return;
		
		context.shadowColor = settings.shadowColor;
		context.shadowBlur = settings.shadowBlur;
		
		// NB: 2018/02/13 - Left this here in case it needs to be calibrated more accurately
		/*if(!this.testCircle)
		{
			this.testCircle = new google.maps.Circle({
				strokeColor: "#ff0000",
				strokeOpacity: 0.5,
				strokeWeight: 3,
				map: this.map,
				center: this.settings.center
			});
		}
		
		this.testCircle.setCenter(settings.center);
		this.testCircle.setRadius(settings.radius * 1000);*/
		
        // Reset transform
        context.setTransform(1, 0, 0, 1, 0, 0);
        
        var scale = this.getScale();
        context.scale(scale, scale);

		// Translate by world origin
		var offset = this.getWorldOriginOffset();
		context.translate(offset.x, offset.y);

        // Get center and project to pixel space
		var center = new WPGMZA.LatLng(this.settings.center);
		var worldPoint = this.getCenterPixels();
		
		var rgba = WPGMZA.hexToRgba(settings.color);
		var ringSpacing = this.getTransformedRadius(settings.radius) / (settings.numInnerRings + 1);
		
		// TODO: Implement gradients for color and opacity
		
		// Inside circle (fixed?)
        context.strokeStyle = settings.color;
		context.lineWidth = (1 / scale) * settings.centerRingLineWidth;
		
		context.beginPath();
		context.arc(
			worldPoint.x, 
			worldPoint.y, 
			this.getTransformedRadius(settings.centerRingRadius) / scale, 0, 2 * Math.PI
		);
		context.stroke();
		context.closePath();
		
		// Spokes
		var radius = this.getTransformedRadius(settings.radius) + (ringSpacing * settings.numOuterRings) + 1;
		var grad = context.createRadialGradient(0, 0, 0, 0, 0, radius);
		var rgba = WPGMZA.hexToRgba(settings.color);
		var start = WPGMZA.rgbaToString(rgba), end;
		var spokeAngle;
		
		rgba.a = 0;
		end = WPGMZA.rgbaToString(rgba);
		
		grad.addColorStop(0, start);
		grad.addColorStop(1, end);
		
		context.save();
		
		context.translate(worldPoint.x, worldPoint.y);
		context.strokeStyle = grad;
		context.lineWidth = 2 / scale;
		
		for(var i = 0; i < settings.numSpokes; i++)
		{
			spokeAngle = settings.spokesStartAngle + (Math.PI * 2) * (i / settings.numSpokes);
			
			x = Math.cos(spokeAngle) * radius;
			y = Math.sin(spokeAngle) * radius;
			
			context.setLineDash([2 / scale, 15 / scale]);
			
			context.beginPath();
			context.moveTo(0, 0);
			context.lineTo(x, y);
			context.stroke();
		}
		
		context.setLineDash([]);
		
		context.restore();
		
		// Inner ringlets
		context.lineWidth = (1 / scale) * settings.innerRingLineWidth;
		
		for(var i = 1; i <= settings.numInnerRings; i++)
		{
			var radius = i * ringSpacing;
			
			if(settings.innerRingFade)
				rgba.a = 1 - (i - 1) / settings.numInnerRings;
			
			context.strokeStyle = WPGMZA.rgbaToString(rgba);
			
			context.beginPath();
			context.arc(worldPoint.x, worldPoint.y, radius, 0, 2 * Math.PI);
			context.stroke();
			context.closePath();
		}
		
		// Main circle
		context.strokeStyle = settings.color;
		context.lineWidth = (1 / scale) * settings.centerRingLineWidth;
		
		context.beginPath();
		context.arc(worldPoint.x, worldPoint.y, this.getTransformedRadius(settings.radius), 0, 2 * Math.PI);
		context.stroke();
		context.closePath();
		
		// Outer ringlets
		var radius = radius + ringSpacing;
		for(var i = 0; i < settings.numOuterRings; i++)
		{
			if(settings.innerRingFade)
				rgba.a = 1 - i / settings.numOuterRings;
			
			context.strokeStyle = WPGMZA.rgbaToString(rgba);
			
			context.beginPath();
			context.arc(worldPoint.x, worldPoint.y, radius, 0, 2 * Math.PI);
			context.stroke();
			context.closePath();
		
			radius += ringSpacing;
		}
		
		// Text
		if(settings.numRadiusLabels > 0)
		{
			var m;
			var radius = this.getTransformedRadius(settings.radius);
			var clipRadius = (12 * 1.1) / scale;
			var x, y;
			
			if(m = settings.radiusLabelFont.match(/(\d+)px/))
				clipRadius = (parseInt(m[1]) / 2 * 1.1) / scale;
			
			context.font = settings.radiusLabelFont;
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillStyle = settings.color;
			
			context.save();
			
			context.translate(worldPoint.x, worldPoint.y)
			
			for(var i = 0; i < settings.numRadiusLabels; i++)
			{
				var spokeAngle = settings.radiusLabelsStartAngle + (Math.PI * 2) * (i / settings.numRadiusLabels);
				var textAngle = spokeAngle + Math.PI / 2;
				var text = settings.radiusString;
				var width;
				
				if(Math.sin(spokeAngle) > 0)
					textAngle -= Math.PI;
				
				x = Math.cos(spokeAngle) * radius;
				y = Math.sin(spokeAngle) * radius;
				
				context.save();
				
				context.translate(x, y);
				
				context.rotate(textAngle);
				context.scale(1 / scale, 1 / scale);
				
				width = context.measureText(text).width;
				height = width / 2;
				context.clearRect(-width, -height, 2 * width, 2 * height);
				
				context.fillText(settings.radiusString, 0, 0);
				
				context.restore();
			}
			
			context.restore();
		}
	}
	
});

// js/v8/native-maps-icon.js
/**
 * @namespace WPGMZA
 * @module NativeMapsAppIcon
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Small utility class to create an icon for the native maps app, an Apple icon on iOS devices, a Google icon on other devices
	 * @method WPGMZA.NativeMapsAppIcon
	 * @constructor WPGMZA.NativeMapsAppIcon
	 * @memberof WPGMZA
	 */
	WPGMZA.NativeMapsAppIcon = function() {
		if(navigator.userAgent.match(/^Apple|iPhone|iPad|iPod/))
		{
			this.type = "apple";
			this.element = $('<span><i class="fab fa-apple" aria-hidden="true"></i></span>');
		}
		else
		{
			this.type = "google";
			this.element = $('<span><i class="fab fa-google" aria-hidden="true"></i></span>');
		}
	};
	
});

// js/v8/polygon.js
/**
 * @namespace WPGMZA
 * @module Polygon
 * @requires WPGMZA.MapObject
 */
jQuery(function($) {
	
	/**
	 * Base class for polygons. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Polygon
	 * @constructor WPGMZA.Polygon
	 * @memberof WPGMZA
	 * @param {object} [row] Options to apply to this polygon.
	 * @param {object} [enginePolygon] An engine polygon, passed from the drawing manager. Used when a polygon has been created by a drawing manager.
	 * @augments WPGMZA.MapObject
	 */
	WPGMZA.Polygon = function(row, enginePolygon)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Polygon");
		
		this.paths = null;
		this.title = null;
		this.name = null;
		this.link = null;
		
		WPGMZA.MapObject.apply(this, arguments);
	}
	
	WPGMZA.Polygon.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Polygon.prototype.constructor = WPGMZA.Polygon;
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.Polygon
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.Polygon.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				if(WPGMZA.isProVersion())
					return WPGMZA.OLProPolygon;
				return WPGMZA.OLPolygon;
				break;
			
			default:
				if(WPGMZA.isProVersion())
					return WPGMZA.GoogleProPolygon;
				return WPGMZA.GooglePolygon;
				break;
		}
	}
	
	/**
	 * Creates an instance of a map, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Polygon
	 * @param {object} [row] Options to apply to this polygon.
	 * @param {object} [enginePolygon] An engine polygon, passed from the drawing manager. Used when a polygon has been created by a drawing manager.
	 * @returns {WPGMZA.Polygon} An instance of WPGMZA.Polygon
	 */
	WPGMZA.Polygon.createInstance = function(row, engineObject)
	{
		var constructor = WPGMZA.Polygon.getConstructor();
		return new constructor(row, engineObject);
	}
	
	/**
	 * Returns a JSON representation of this polygon, for serialization
	 * @method
	 * @memberof WPGMZA.Polygon
	 * @returns {object} A JSON object representing this polygon
	 */
	WPGMZA.Polygon.prototype.toJSON = function()
	{
		var result = WPGMZA.MapObject.prototype.toJSON.call(this);
		
		$.extend(result, {
			name:		this.name,
			title:		this.title,
			link:		this.link,
		});
	
		return result;
	}
	
});

// js/v8/polyline.js
/**
 * @namespace WPGMZA
 * @module Polyline
 * @requires WPGMZA.MapObject
 */
jQuery(function($) {
	
	/**
	 * Base class for polylines. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Polyline
	 * @constructor WPGMZA.Polyline
	 * @memberof WPGMZA
	 * @param {object} [row] Options to apply to this polyline.
	 * @param {object} [enginePolyline] An engine polyline, passed from the drawing manager. Used when a polyline has been created by a drawing manager.
	 * @augments WPGMZA.MapObject
	 */
	WPGMZA.Polyline = function(row, googlePolyline)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Polyline");
		
		this.title = null;
		
		WPGMZA.MapObject.apply(this, arguments);
	}
	
	WPGMZA.Polyline.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Polyline.prototype.constructor = WPGMZA.Polyline;
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.Polyline
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.Polyline.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				return WPGMZA.OLPolyline;
				break;
			
			default:
				return WPGMZA.GooglePolyline;
				break;
		}
	}
	
	/**
	 * Creates an instance of a map, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Polyline
	 * @param {object} [row] Options to apply to this polyline.
	 * @param {object} [enginePolyline] An engine polyline, passed from the drawing manager. Used when a polyline has been created by a drawing manager.
	 * @returns {WPGMZA.Polyline} An instance of WPGMZA.Polyline
	 */
	WPGMZA.Polyline.createInstance = function(row, engineObject)
	{
		var constructor = WPGMZA.Polyline.getConstructor();
		return new constructor(row, engineObject);
	}
	
	/**
	 * Gets the points on this polylines
	 * @return {array} An array of LatLng literals
	 */
	WPGMZA.Polyline.prototype.getPoints = function()
	{
		return this.toJSON().points;
	}
	
	/**
	 * Returns a JSON representation of this polyline, for serialization
	 * @method
	 * @memberof WPGMZA.Polyline
	 * @returns {object} A JSON object representing this polyline
	 */
	WPGMZA.Polyline.prototype.toJSON = function()
	{
		var result = WPGMZA.MapObject.prototype.toJSON.call(this);
		
		result.title = this.title;
		
		return result;
	}
	
	
});

// js/v8/popout-panel.js
/**
 * @namespace WPGMZA
 * @module PopoutPanel
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Common functionality for popout panels, which is the directions box, directions result box, and the modern style marker listing
	 * @class WPGMZA.PopoutPanel
	 * @constructor WPGMZA.PopoutPanel
	 * @memberof WPGMZA
	 */
	WPGMZA.PopoutPanel = function()
	{
		
	}
	
	/**
	 * Opens the direction box
	 * @method
	 * @memberof WPGMZA.PopoutPanel
	 */
	WPGMZA.PopoutPanel.prototype.open = function() {
		$(this.element).addClass("wpgmza-open");
	};
	
	/**
	 * Closes the direction box
	 * @method
	 * @memberof WPGMZA.PopoutPanel
	 */
	WPGMZA.PopoutPanel.prototype.close = function() {
		$(this.element).removeClass("wpgmza-open");
	};
	
});

// js/v8/rest-api.js
/**
 * @namespace WPGMZA
 * @module WPGMZA.RestAPI
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Used to interact with the WordPress REST API. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.RestAPI
	 * @constructor WPGMZA.RestAPI
	 * @memberof WPGMZA
	 */
	WPGMZA.RestAPI = function()
	{
		WPGMZA.RestAPI.URL = WPGMZA.resturl;
	}
	
	/**
	 * Creates an instance of a RestAPI, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.RestAPI
	 */
	WPGMZA.RestAPI.createInstance = function() 
	{
		return new WPGMZA.RestAPI();
	}
	
	/**
	 * Makes an AJAX to the REST API, this function is a wrapper for $.ajax
	 * @method
	 * @memberof WPGMZA.RestAPI
	 * @param {string} route The REST API route
	 * @param {object} params The request parameters, see http://api.jquery.com/jquery.ajax/
	 */
	WPGMZA.RestAPI.prototype.call = function(route, params)
	{
		if(typeof route != "string" || !route.match(/^\//))
			throw new Error("Invalid route");
		
		if(WPGMZA.RestAPI.URL.match(/\/$/))
			route = route.replace(/^\//, "");
		
		if(!params)
			params = {};
		
		params.beforeSend = function(xhr) {
			xhr.setRequestHeader('X-WP-Nonce', WPGMZA.restnonce);
		};
		
		if(!params.error)
			params.error = function(xhr, status, message) {
				throw new Error(message);
			}
		
		return $.ajax(WPGMZA.RestAPI.URL + route, params);
	}
	
});

// js/v8/store-locator.js
/**
 * @namespace WPGMZA
 * @module StoreLocator
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.StoreLocator = function(map, element)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		this._center = null;
		
		this.map = map;
		this.element = element;
		this.state = WPGMZA.StoreLocator.STATE_INITIAL;
		
		// TODO: This will be moved into this module instead of listening to the map event
		this.map.on("storelocatorgeocodecomplete", function(event) {
			self.onGeocodeComplete(event);
		});
		
		// Legacy store locator buttons
		$(document.body).on("click", ".wpgmza_sl_search_button_" + map.id, function(event) {
			self.onSearch(event);
		});
		
		$(document.body).on("click", ".wpgmza_sl_reset_button_" + map.id, function(event) {
			self.onReset(event);
		});
	}
	
	WPGMZA.StoreLocator.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.StoreLocator.prototype.constructor = WPGMZA.StoreLocator;
	
	WPGMZA.StoreLocator.STATE_INITIAL		= "initial";
	WPGMZA.StoreLocator.STATE_APPLIED		= "applied";
	
	WPGMZA.StoreLocator.createInstance = function(map, element)
	{
		return new WPGMZA.StoreLocator(map, element);
	}
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "radius", {
		"get": function() {
			return $("#radiusSelect_" + this.map.id).val();
		}
	});
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "center", {
		"get": function() {
			return this._center;
		}
	});
	
	WPGMZA.StoreLocator.prototype.onGeocodeComplete = function(event)
	{
		if(!event.results || !event.results.length)
			this._center = null;
		else
			this._center = new WPGMZA.LatLng( event.results[0].latLng );
		
		this.map.markerFilter.update();
	}
	
	WPGMZA.StoreLocator.prototype.onSearch = function(event)
	{
		this.state = WPGMZA.StoreLocator.STATE_APPLIED;
	}
	
	WPGMZA.StoreLocator.prototype.onReset = function(event)
	{
		this.state = WPGMZA.StoreLocator.STATE_INITIAL;
		
		this._center = null;
		
		this.map.markerFilter.update();
	}
	
	WPGMZA.StoreLocator.prototype.getFilteringParameters = function()
	{
		if(!this.center)
			return {};
		
		return {
			center: this.center,
			radius: this.radius
		};
	}
	
});

// js/v8/text.js
/**
 * @namespace WPGMZA
 * @module Text
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.Text = function(options)
	{
		if(options)
			for(var name in options)
				this[name] = options[name];
	}
	
	WPGMZA.Text.createInstance = function(options)
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				break;
				
			default:
				break;
		}
		
		return new WPGMZA.Text(options);
	}
	
});

// js/v8/version.js
/**
 * @namespace WPGMZA
 * @module Version
 * @requires WPGMZA
 */
jQuery(function($) {

	function isPositiveInteger(x) {
		// http://stackoverflow.com/a/1019526/11236
		return /^\d+$/.test(x);
	}

	function validateParts(parts) {
		for (var i = 0; i < parts.length; ++i) {
			if (!isPositiveInteger(parts[i])) {
				return false;
			}
		}
		return true;
	}
	
	WPGMZA.Version = function()
	{
		
	}
	
	WPGMZA.Version.GREATER_THAN		= 1;
	WPGMZA.Version.EQUAL_TO			= 0;
	WPGMZA.Version.LESS_THAN		= -1;
	
	/**
	 * Compare two software version numbers (e.g. 1.7.1)
	 * Returns:
	 *
	 *  0 if they're identical
	 *  negative if v1 < v2
	 *  positive if v1 > v2
	 *  NaN if they in the wrong format
	 *
	 *  "Unit tests": http://jsfiddle.net/ripper234/Xv9WL/28/
	 *
	 *  Taken from http://stackoverflow.com/a/6832721/11236
	 */
	WPGMZA.Version.compare = function(v1, v2)
	{
		var v1parts = v1.split('.');
		var v2parts = v2.split('.');

		// First, validate both numbers are true version numbers
		if (!validateParts(v1parts) || !validateParts(v2parts)) {
			return NaN;
		}

		for (var i = 0; i < v1parts.length; ++i) {
			if (v2parts.length === i) {
				return 1;
			}

			if (v1parts[i] === v2parts[i]) {
				continue;
			}
			if (v1parts[i] > v2parts[i]) {
				return 1;
			}
			return -1;
		}

		if (v1parts.length != v2parts.length) {
			return -1;
		}

		return 0;
	}

});

// js/v8/3rd-party-integration/integration.js
/**
 * @namespace WPGMZA
 * @module Integration
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.Integration = {};
	WPGMZA.integrationModules = {};
	
});

// js/v8/3rd-party-integration/gutenberg/dist/gutenberg.js
"use strict";

/**
 * @namespace WPGMZA.Integration
 * @module Gutenberg
 * @requires WPGMZA.Integration
 * @requires wp-i18n
 * @requires wp-blocks
 * @requires wp-editor
 * @requires wp-components
 */

/**
 * Internal block libraries
 */
jQuery(function ($) {

	if (!window.wp || !wp.i18n || !wp.blocks || !wp.editor || !wp.components) return;

	var __ = wp.i18n.__;
	var registerBlockType = wp.blocks.registerBlockType;
	var _wp$editor = wp.editor,
	    InspectorControls = _wp$editor.InspectorControls,
	    BlockControls = _wp$editor.BlockControls;
	var _wp$components = wp.components,
	    Dashicon = _wp$components.Dashicon,
	    Toolbar = _wp$components.Toolbar,
	    Button = _wp$components.Button,
	    Tooltip = _wp$components.Tooltip,
	    PanelBody = _wp$components.PanelBody,
	    TextareaControl = _wp$components.TextareaControl,
	    CheckboxControl = _wp$components.CheckboxControl,
	    TextControl = _wp$components.TextControl,
	    SelectControl = _wp$components.SelectControl,
	    RichText = _wp$components.RichText;


	WPGMZA.Integration.Gutenberg = function () {
		registerBlockType('gutenberg-wpgmza/block', this.getBlockDefinition());
	};

	WPGMZA.Integration.Gutenberg.prototype.getBlockTitle = function () {
		return __("WP Google Maps");
	};

	WPGMZA.Integration.Gutenberg.prototype.getBlockInspectorControls = function (props) {

		/*
  <TextControl
  				name="overrideWidthAmount"
  				label={__("Override Width Amount")}
  				checked={props.overrideWidthAmount}
  				onChange={onPropertiesChanged}
  				/>
  			
  			<SelectControl
  				name="overrideWidthUnits"
  				label={__("Override Width Units")}
  				options={[
  					{value: "px", label: "px"},
  					{value: "%", label: "%"},
  					{value: "vw`", label: "vw"},
  					{value: "vh", label: "vh"}
  				]}
  				onChange={onPropertiesChanged}
  				/>
  				
  			<CheckboxControl
  				name="overrideHeight"
  				label={__("Override Height")}
  				checked={props.overrideWidth}
  				onChange={onPropertiesChanged}
  				/>
  				
  			<TextControl
  				name="overrideHeightAmount"
  				label={__("Override Height Amount")}
  				checked={props.overrideWidthAmount}
  				onChange={onPropertiesChanged}
  				/>
  			
  			<SelectControl
  				name="overrideHeightUnits"
  				label={__("Override Height Units")}
  				options={[
  					{value: "px", label: "px"},
  					{value: "%", label: "%"},
  					{value: "vw`", label: "vw"},
  					{value: "vh", label: "vh"}
  				]}
  				onChange={onPropertiesChanged}
  				/>
  				*/

		var onOverrideWidthCheckboxChanged = function onOverrideWidthCheckboxChanged(value) {};

		return React.createElement(
			InspectorControls,
			{ key: "inspector" },
			React.createElement(
				PanelBody,
				{ title: __('Map Settings') },
				React.createElement(
					"p",
					{ "class": "map-block-gutenberg-button-container" },
					React.createElement(
						"a",
						{ href: WPGMZA.adminurl + "admin.php?page=wp-google-maps-menu&action=edit&map_id=1",
							target: "_blank",
							"class": "button button-primary" },
						React.createElement("i", { "class": "fa fa-pencil-square-o", "aria-hidden": "true" }),
						__('Go to Map Editor')
					)
				),
				React.createElement(
					"p",
					{ "class": "map-block-gutenberg-button-container" },
					React.createElement(
						"a",
						{ href: "https://www.wpgmaps.com/documentation/creating-your-first-map/",
							target: "_blank",
							"class": "button button-primary" },
						React.createElement("i", { "class": "fa fa-book", "aria-hidden": "true" }),
						__('View Documentation')
					)
				)
			)
		);
	};

	WPGMZA.Integration.Gutenberg.prototype.getBlockAttributes = function () {
		return {};
	};

	WPGMZA.Integration.Gutenberg.prototype.getBlockDefinition = function (props) {
		var _this = this;

		return {

			title: __("WP Google Maps"),
			description: __('The easiest to use Google Maps plugin! Create custom Google Maps with high quality markers containing locations, descriptions, images and links. Add your customized map to your WordPress posts and/or pages quickly and easily with the supplied shortcode. No fuss.'),
			category: 'common',
			icon: 'location-alt',
			keywords: [__('Map'), __('Maps'), __('Google')],
			attributes: this.getBlockAttributes(),

			edit: function edit(props) {
				return [!!props.isSelected && _this.getBlockInspectorControls(props), React.createElement(
					"div",
					{ className: props.className + " wpgmza-gutenberg-block" },
					React.createElement(Dashicon, { icon: "location-alt" }),
					React.createElement(
						"span",
						{ "class": "wpgmza-gutenberg-block-title" },
						__("Your map will appear here on your websites front end")
					)
				)];
			},
			// Defining the front-end interface
			save: function save(props) {
				// Rendering in PHP
				return null;
			}

		};
	};

	WPGMZA.Integration.Gutenberg.getConstructor = function () {
		return WPGMZA.Integration.Gutenberg;
	};

	WPGMZA.Integration.Gutenberg.createInstance = function () {
		var constructor = WPGMZA.Integration.Gutenberg.getConstructor();
		return new constructor();
	};

	// Allow the Pro module to extend and create the module, only create here when Pro isn't loaded
	if(!WPGMZA.isProVersion() && !(/^6/.test(WPGMZA.pro_version))) WPGMZA.integrationModules.gutenberg = WPGMZA.Integration.Gutenberg.createInstance();
});

// js/v8/compatibility/google-ui-compatibility.js
/**
 * @namespace WPGMZA
 * @module GoogleUICompatibility
 * @requires WPGMZA
 */ 
jQuery(function($) {
	
	WPGMZA.GoogleUICompatibility = function()
	{
		var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
				   navigator.userAgent &&
				   navigator.userAgent.indexOf('CriOS') == -1 &&
				   navigator.userAgent.indexOf('FxiOS') == -1;
		
		if(!isSafari)
		{
			var style = $("<style id='wpgmza-google-ui-compatiblity-fix'/>");
			style.html(".wpgmza_map img:not(button img) { padding:0 !important; }");
			$(document.head).append(style);
		}
	}
	
	WPGMZA.googleUICompatibility = new WPGMZA.GoogleUICompatibility();
	
});

// js/v8/google-maps/google-circle.js
/**
 * @namespace WPGMZA
 * @module GoogleCircle
 * @requires WPGMZA.Circle
 */
jQuery(function($) {
	
	/**
	 * Subclass, used when Google is the maps engine. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.GoogleCircle
	 * @constructor WPGMZA.GoogleCircle
	 * @memberof WPGMZA
	 * @augments WPGMZA.Circle
	 * @see WPGMZA.Circle.createInstance
	 */
	WPGMZA.GoogleCircle = function(options, googleCircle)
	{
		var self = this;
		
		WPGMZA.Circle.call(this, options, googleCircle);
		
		if(googleCircle)
		{
			this.googleCircle = googleCircle;
		}
		else
		{
			this.googleCircle = new google.maps.Circle();
			this.googleCircle.wpgmzaCircle = this;
		}
		
		google.maps.event.addListener(this.googleCircle, "click", function() {
			self.dispatchEvent({type: "click"});
		});
		
		if(options)
		{
			var googleOptions = {};
			
			googleOptions = $.extend({}, options);
			delete googleOptions.map;
			delete googleOptions.center;
			
			if(options.center)
				googleOptions.center = new google.maps.LatLng({
					lat: options.center.lat,
					lng: options.center.lng
				});
			
			this.googleCircle.setOptions(googleOptions);
			
			if(options.map)
				options.map.addCircle(this);
		}
	}
	
	WPGMZA.GoogleCircle.prototype = Object.create(WPGMZA.Circle.prototype);
	WPGMZA.GoogleCircle.prototype.constructor = WPGMZA.GoogleCircle;
	
	WPGMZA.GoogleCircle.prototype.setCenter = function(center)
	{
		WPGMZA.Circle.prototype.setCenter.apply(this, arguments);
		
		this.googleCircle.setCenter(center);
	}
	
	WPGMZA.GoogleCircle.prototype.setRadius = function(radius)
	{
		WPGMZA.Circle.prototype.setRadius.apply(this, arguments);
		
		this.googleCircle.setRadius(parseFloat(radius) * 1000);
	}
	
	WPGMZA.GoogleCircle.prototype.setVisible = function(visible)
	{
		this.googleCircle.setVisible(visible ? true : false);
	}
	
});

// js/v8/google-maps/google-geocoder.js
/**
 * @namespace WPGMZA
 * @module GoogleGeocoder
 * @requires WPGMZA.Geocoder
 */
jQuery(function($) {
	
	/**
	 * Subclass, used when Google is the maps engine. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.GoogleGeocoder
	 * @constructor WPGMZA.GoogleGeocoder
	 * @memberof WPGMZA
	 * @augments WPGMZA.Geocoder
	 * @see WPGMZA.Geocoder.createInstance
	 */
	WPGMZA.GoogleGeocoder = function()
	{
		
	}
	
	WPGMZA.GoogleGeocoder.prototype = Object.create(WPGMZA.Geocoder.prototype);
	WPGMZA.GoogleGeocoder.prototype.constructor = WPGMZA.GoogleGeocoder;
	
	WPGMZA.GoogleGeocoder.prototype.getLatLngFromAddress = function(options, callback)
	{
		if(!options || !options.address)
			throw new Error("No address specified");
		
		if(WPGMZA.isLatLngString(options.address))
			return WPGMZA.Geocoder.prototype.getLatLngFromAddress.call(this, options, callback);
		
		if(options.country)
			options.componentRestrictions = {
				country: options.country
			};
		
		var geocoder = new google.maps.Geocoder();
		
		geocoder.geocode(options, function(results, status) {
			if(status == google.maps.GeocoderStatus.OK)
			{
				var location = results[0].geometry.location;
				var latLng = {
					lat: location.lat(),
					lng: location.lng()
				};
				
				var results = [
					{
						geometry: {
							location: latLng
						},
						latLng: latLng,
						lat: latLng.lat,
						lng: latLng.lng
					}
				];
				
				callback(results, WPGMZA.Geocoder.SUCCESS);
			}
			else
			{
				var nativeStatus = WPGMZA.Geocoder.FAIL;
				
				if(status == google.maps.GeocoderStatus.ZERO_RESULTS)
					nativeStatus = WPGMZA.Geocoder.ZERO_RESULTS;
				
				callback(null, nativeStatus);
			}
		});
	}
	
	WPGMZA.GoogleGeocoder.prototype.getAddressFromLatLng = function(options, callback)
	{
		if(!options || !options.latLng)
			throw new Error("No latLng specified");
		
		var latLng = new WPGMZA.LatLng(options.latLng);
		var geocoder = new google.maps.Geocoder();
		
		var options = $.extend(options, {
			location: {
				lat: latLng.lat,
				lng: latLng.lng
			}
		});
		delete options.latLng;
		
		geocoder.geocode(options, function(results, status) {
			
			if(status !== "OK")
				callback(null, WPGMZA.Geocoder.FAIL);
			
			if(!results || !results.length)
				callback([], WPGMZA.Geocoder.NO_RESULTS);
			
			callback([results[0].formatted_address], WPGMZA.Geocoder.SUCCESS);
			
		});
	}
	
});

// js/v8/google-maps/google-html-overlay.js
/**
 * @namespace WPGMZA
 * @module GoogleHTMLOverlay
 * @requires WPGMZA
 */
jQuery(function($) {
	
	// https://developers.google.com/maps/documentation/javascript/customoverlays
	
	if(WPGMZA.settings.engine != "google-maps")
		return;
	
	if(!window.google || !window.google.maps)
		return;
	
	WPGMZA.GoogleHTMLOverlay = function(map)
	{
		this.element	= $("<div class='wpgmza-google-html-overlay'></div>");
		
		this.visible	= true;
		this.position	= new WPGMZA.LatLng();
		
		this.setMap(map.googleMap);
		this.wpgmzaMap = map;
	}
	
	WPGMZA.GoogleHTMLOverlay.prototype = new google.maps.OverlayView();
	
	WPGMZA.GoogleHTMLOverlay.prototype.onAdd = function()
	{
		var panes = this.getPanes();
		panes.overlayMouseTarget.appendChild(this.element[0]);
		
		/*google.maps.event.addDomListener(this.element, "click", function() {
			
		});*/
	}
	
	WPGMZA.GoogleHTMLOverlay.prototype.onRemove = function()
	{
		if(this.element && $(this.element).parent().length)
		{
			$(this.element).remove();
			this.element = null;
		}
	}
	
	WPGMZA.GoogleHTMLOverlay.prototype.draw = function()
	{
		this.updateElementPosition();
	}
	
	/*WPGMZA.GoogleHTMLOverlay.prototype.setMap = function(map)
	{
		if(!(map instanceof WPGMZA.Map))
			throw new Error("Map must be an instance of WPGMZA.Map");
		
		google.maps.OverlayView.prototype.setMap.call(this, map.googleMap);
		
		this.wpgmzaMap = map;
	}*/
	
	/*WPGMZA.GoogleHTMLOverlay.prototype.getVisible = function()
	{
		return $(this.element).css("display") != "none";
	}
	
	WPGMZA.GoogleHTMLOverlay.prototype.setVisible = function(visible)
	{
		$(this.element).css({
			"display": (visible ? "block" : "none")
		});
	}*/
	
	/*WPGMZA.GoogleHTMLOverlay.prototype.getPosition = function()
	{
		return new WPGMZA.LatLng(this.position);
	}
	
	WPGMZA.GoogleHTMLOverlay.prototype.setPosition = function(position)
	{
		if(!(position instanceof WPGMZA.LatLng))
			throw new Error("Argument must be an instance of WPGMZA.LatLng");
		
		this.position = position;
		this.updateElementPosition();
	}*/
	
	WPGMZA.GoogleHTMLOverlay.prototype.updateElementPosition = function()
	{
		//var pixels = this.wpgmzaMap.latLngToPixels(this.position);
		
		var projection = this.getProjection();
		
		if(!projection)
			return;
		
		var pixels = projection.fromLatLngToDivPixel(this.position.toGoogleLatLng());
		
		$(this.element).css({
			"left": pixels.x,
			"top": pixels.y
		});
	}
});

// js/v8/google-maps/google-modern-store-locator-circle.js
/**
 * @namespace WPGMZA
 * @module GoogleModernStoreLocatorCircle
 * @requires WPGMZA.ModernStoreLocatorCircle
 */
jQuery(function($) {
	
	WPGMZA.GoogleModernStoreLocatorCircle = function(map, settings)
	{
		var self = this;
		
		WPGMZA.ModernStoreLocatorCircle.call(this, map, settings);
		
		this.intervalID = setInterval(function() {
			
			var mapSize = {
				width: $(self.mapElement).width(),
				height: $(self.mapElement).height()
			};
			
			if(mapSize.width == self.mapSize.width && mapSize.height == self.mapSize.height)
				return;
			
			self.canvasLayer.resize_();
			self.canvasLayer.draw();
			
			self.mapSize = mapSize;
			
		}, 1000);
		
		$(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function() {
			
			self.canvasLayer.resize_();
			self.canvasLayer.draw();
			
		});
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype = Object.create(WPGMZA.ModernStoreLocatorCircle.prototype);
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.constructor = WPGMZA.GoogleModernStoreLocatorCircle;
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.initCanvasLayer = function()
	{
		var self = this;
		
		if(this.canvasLayer)
		{
			this.canvasLayer.setMap(null);
			this.canvasLayer.setAnimate(false);
		}
		
		this.canvasLayer = new CanvasLayer({
			map: this.map.googleMap,
			resizeHandler: function(event) {
				self.onResize(event);
			},
			updateHandler: function(event) {
				self.onUpdate(event);
			},
			animate: true,
			resolutionScale: this.getResolutionScale()
        });
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.setOptions = function(options)
	{
		WPGMZA.ModernStoreLocatorCircle.prototype.setOptions.call(this, options);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.setPosition = function(position)
	{
		WPGMZA.ModernStoreLocatorCircle.prototype.setPosition.call(this, position);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.setRadius = function(radius)
	{
		WPGMZA.ModernStoreLocatorCircle.prototype.setRadius.call(this, radius);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.getTransformedRadius = function(km)
	{
		var multiplierAtEquator = 0.006395;
		var spherical = google.maps.geometry.spherical;
		
		var center = this.settings.center;
		var equator = new WPGMZA.LatLng({
			lat: 0.0,
			lng: 0.0
		});
		var latitude = new WPGMZA.LatLng({
			lat: center.lat,
			lng: 0.0
		});
		
		var offsetAtEquator = spherical.computeOffset(equator.toGoogleLatLng(), km * 1000, 90);
		var offsetAtLatitude = spherical.computeOffset(latitude.toGoogleLatLng(), km * 1000, 90);
		
		var factor = offsetAtLatitude.lng() / offsetAtEquator.lng();
		var result = km * multiplierAtEquator * factor;
		
		if(isNaN(result))
			throw new Error("here");
		
		return result;
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.getCanvasDimensions = function()
	{
		return {
			width: this.canvasLayer.canvas.width,
			height: this.canvasLayer.canvas.height
		};
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.getWorldOriginOffset = function()
	{
		var projection = this.map.googleMap.getProjection();
		var position = projection.fromLatLngToPoint(this.canvasLayer.getTopLeft());
		
		return {
			x: -position.x,
			y: -position.y
		};
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.getCenterPixels = function()
	{
		var center = new WPGMZA.LatLng(this.settings.center);
		var projection = this.map.googleMap.getProjection();
		return projection.fromLatLngToPoint(center.toGoogleLatLng());
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.getContext = function(type)
	{
		return this.canvasLayer.canvas.getContext("2d");
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.getScale = function()
	{
		return Math.pow(2, this.map.getZoom()) * this.getResolutionScale();
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.setVisible = function(visible)
	{
		WPGMZA.ModernStoreLocatorCircle.prototype.setVisible.call(this, visible);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.destroy = function()
	{
		this.canvasLayer.setMap(null);
		this.canvasLayer = null;
		
		clearInterval(this.intervalID);
	}
	
});

// js/v8/google-maps/google-polyline.js
/**
 * @namespace WPGMZA
 * @module GooglePolyline
 * @requires WPGMZA.Polyline
 */
jQuery(function($) {
	
	WPGMZA.GooglePolyline = function(row, googlePolyline)
	{
		var self = this;
		
		WPGMZA.Polyline.call(this, row, googlePolyline);
		
		if(googlePolyline)
		{
			this.googlePolyline = googlePolyline;
		}
		else
		{
			this.googlePolyline = new google.maps.Polyline(this.settings);			
			this.googlePolyline.wpgmzaPolyline = this;
			
			if(row && row.points)
			{
				var path = this.parseGeometry(row.points);
				this.setPoints(path);
			}
		}
		
		google.maps.event.addListener(this.googlePolyline, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
	WPGMZA.GooglePolyline.prototype = Object.create(WPGMZA.Polyline.prototype);
	WPGMZA.GooglePolyline.prototype.constructor = WPGMZA.GooglePolyline;
	
	WPGMZA.GooglePolyline.prototype.setEditable = function(value)
	{
		this.googlePolyline.setOptions({editable: value});
	}
	
	WPGMZA.GooglePolyline.prototype.setPoints = function(points)
	{
		this.googlePolyline.setOptions({path: points});
	}
	
	WPGMZA.GooglePolyline.prototype.toJSON = function()
	{
		var result = WPGMZA.Polyline.prototype.toJSON.call(this);
		
		result.points = [];
		
		var path = this.googlePolyline.getPath();
		for(var i = 0; i < path.getLength(); i++)
		{
			var latLng = path.getAt(i);
			result.points.push({
				lat: latLng.lat(),
				lng: latLng.lng()
			});
		}
		
		return result;
	}
	
});

// js/v8/google-maps/google-text-overlay.js
/**
 * @namespace WPGMZA
 * @module GoogleTextOverlay
 * @requires WPGMZA.Text
 */
jQuery(function($) {
	
	WPGMZA.GoogleTextOverlay = function()
	{
		this.element = $("<div></div>");
		
	}
	
	if(window.google && google.maps && google.maps.OverlayView)
		WPGMZA.GoogleTextOverlay.prototype = new google.maps.OverlayView();
	
	WPGMZA.GoogleTextOverlay.prototype.onAdd = function()
	{
		
	}
	
});

// js/v8/google-maps/google-text.js
/**
 * @namespace WPGMZA
 * @module GoogleText
 * @requires WPGMZA.Text
 */
jQuery(function($) {
	
	WPGMZA.GoogleText = function()
	{
		
	}
	
	
	
});

// js/v8/google-maps/google-vertex-context-menu.js
/**
 * @namespace WPGMZA
 * @module GoogleVertexContextMenu
 * @requires wpgmza_api_call
 */
jQuery(function($) {
	
	if(WPGMZA.settings.engine != "google-maps")
		return;
	
	if(WPGMZA.googleAPIStatus && WPGMZA.googleAPIStatus.code == "USER_CONSENT_NOT_GIVEN")
		return;
	
	WPGMZA.GoogleVertexContextMenu = function(mapEditPage)
	{
		var self = this;
		
		this.mapEditPage = mapEditPage;
		
		this.element = document.createElement("div");
		this.element.className = "wpgmza-vertex-context-menu";
		this.element.innerHTML = "Delete";
		
		google.maps.event.addDomListener(this.element, "click", function(event) {
			self.removeVertex();
			event.preventDefault();
			event.stopPropagation();
			return false;
		});
	}
	
	WPGMZA.GoogleVertexContextMenu.prototype = new google.maps.OverlayView();
	
	WPGMZA.GoogleVertexContextMenu.prototype.onAdd = function()
	{
		var self = this;
		var map = this.getMap();
		
		this.getPanes().floatPane.appendChild(this.element);
		this.divListener = google.maps.event.addDomListener(map.getDiv(), "mousedown", function(e) {
			if(e.target != self.element)
				self.close();
		}, true);
	}
	
	WPGMZA.GoogleVertexContextMenu.prototype.onRemove = function()
	{
		google.maps.event.removeListener(this.divListener);
		this.element.parentNode.removeChild(this.element);
		
		this.set("position");
		this.set("path");
		this.set("vertex");
	}
	
	WPGMZA.GoogleVertexContextMenu.prototype.open = function(map, path, vertex)
	{
		this.set('position', path.getAt(vertex));
		this.set('path', path);
		this.set('vertex', vertex);
		this.setMap(map);
		this.draw();
	}
	
	WPGMZA.GoogleVertexContextMenu.prototype.close = function()
	{
		this.setMap(null);
	}
	
	WPGMZA.GoogleVertexContextMenu.prototype.draw = function()
	{
		var position = this.get('position');
		var projection = this.getProjection();

		if (!position || !projection)
		  return;

		var point = projection.fromLatLngToDivPixel(position);
		this.element.style.top = point.y + 'px';
		this.element.style.left = point.x + 'px';
	}
	
	WPGMZA.GoogleVertexContextMenu.prototype.removeVertex = function()
	{
		var path = this.get('path');
		var vertex = this.get('vertex');

		if (!path || vertex == undefined) {
		  this.close();
		  return;
		}

		path.removeAt(vertex);
		this.close();
	}
	
});

// js/v8/open-layers/ol-circle.js
/**
 * @namespace WPGMZA
 * @module OLCircle
 * @requires WPGMZA.Circle
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Circle;
	
	WPGMZA.OLCircle = function(options, olFeature)
	{
		var self = this;
		
		this.center = {lat: 0, lng: 0};
		this.radius = 0;
		
		Parent.call(this, options, olFeature);
		
		if(!this.settings.fillColor)
		{
			this.settings.fillColor = "#ff0000";
			this.settings.fillOpacity = 0.6;
		}
		
		if(options.fillColor)
			this.settings.fillColor = options.fillColor;
		if(options.fillOpacity)
			this.settings.fillOpacity = options.fillOpacity;
		
		this.olStyle = new ol.style.Style(this.getStyleFromSettings());
		
		this.vectorLayer3857 = this.layer = new ol.layer.Vector({
			source: new ol.source.Vector(),
			style: this.olStyle
		});
		
		if(olFeature)
			this.olFeature = olFeature;
		else
			this.recreate();
	}
	
	WPGMZA.OLCircle.prototype = Object.create(Parent.prototype);
	WPGMZA.OLCircle.prototype.constructor = WPGMZA.OLCircle;
	
	WPGMZA.OLCircle.prototype.recreate = function()
	{
		if(this.olFeature)
		{
			this.layer.getSource().removeFeature(this.olFeature);
			delete this.olFeature;
		}
		
		if(!this.center || !this.radius)
			return;
		
		// IMPORTANT: Please note that due to what appears to be a bug in OpenLayers, the following code MUST be exected specifically in this order, or the circle won't appear
		var wgs84Sphere = new ol.Sphere(6378137);
		var radius = parseFloat(this.radius) * 1000;
		var x, y;
		
		x = this.center.lng;
		y = this.center.lat;
		
		var circle4326 = ol.geom.Polygon.circular(wgs84Sphere, [x, y], radius, 64);
		var circle3857 = circle4326.clone().transform('EPSG:4326', 'EPSG:3857');
		
		this.olFeature = new ol.Feature(circle3857);
		
		this.layer.getSource().addFeature(this.olFeature);
	}
	
	WPGMZA.OLCircle.prototype.getStyleFromSettings = function()
	{
		var params = {};
				
		if(this.settings.strokeOpacity)
			params.stroke = new ol.style.Stroke({
				color: WPGMZA.hexOpacityToRGBA(this.settings.strokeColor, this.settings.strokeOpacity)
			});
		
		if(this.settings.fillOpacity)
			params.fill = new ol.style.Fill({
				color: WPGMZA.hexOpacityToRGBA(this.settings.fillColor, this.settings.fillOpacity)
			});
			
		return params;
	}
	
	WPGMZA.OLCircle.prototype.updateStyleFromSettings = function()
	{
		// Re-create the style - working on it directly doesn't cause a re-render
		var params = this.getStyleFromSettings();
		this.olStyle = new ol.style.Style(params);
		this.layer.setStyle(this.olStyle);
	}
	
	WPGMZA.OLCircle.prototype.setVisible = function(visible)
	{
		this.layer.setVisible(visible ? true : false);
	}
	
	WPGMZA.OLCircle.prototype.setCenter = function(center)
	{
		WPGMZA.Circle.prototype.setCenter.apply(this, arguments);
		
		this.recreate();
	}
	
	WPGMZA.OLCircle.prototype.setRadius = function(radius)
	{
		WPGMZA.Circle.prototype.setRadius.apply(this, arguments);
		
		this.recreate();
	}
	
});

// js/v8/open-layers/ol-geocoder.js
/**
 * @namespace WPGMZA
 * @module OLGeocoder
 * @requires WPGMZA.Geocoder
 */
jQuery(function($) {
	
	/**
	 * @class OLGeocoder
	 * @extends Geocoder
	 * @summary OpenLayers geocoder - uses Nominatim by default
	 */
	WPGMZA.OLGeocoder = function()
	{
		
	}
	
	WPGMZA.OLGeocoder.prototype = Object.create(WPGMZA.Geocoder.prototype);
	WPGMZA.OLGeocoder.prototype.constructor = WPGMZA.OLGeocoder;
	
	/**
	 * @function getResponseFromCache
	 * @access protected
	 * @summary Tries to retrieve cached coordinates from server cache
	 * @param {string} address The street address to geocode
	 * @param {function} callback Where to send the results, as an array
	 * @return {void}
	 */
	WPGMZA.OLGeocoder.prototype.getResponseFromCache = function(query, callback)
	{
		$.ajax(WPGMZA.ajaxurl, {
			data: {
				action: "wpgmza_query_nominatim_cache",
				query: JSON.stringify(query)
			},
			success: function(response, xhr, status) {
				// Legacy compatibility support
				response.lng = response.lon;
				
				callback(response);
			}
		});
	}
	
	/**
	 * @function getResponseFromNominatim
	 * @access protected
	 * @summary Queries Nominatim on the specified address
	 * @param {object} options An object containing the options for geocoding, address is a mandatory field
	 * @param {function} callback The function to send the results to, as an array
	 */
	WPGMZA.OLGeocoder.prototype.getResponseFromNominatim = function(options, callback)
	{
		var data = {
			q: options.address,
			format: "json"
		};
		
		if(options.componentRestrictions && options.componentRestrictions.country)
			data.countryCodes = options.componentRestrictions.country;
		
		$.ajax("https://nominatim.openstreetmap.org/search/", {
			data: data,
			success: function(response, xhr, status) {
				callback(response);
			},
			error: function(response, xhr, status) {
				callback(null, WPGMZA.Geocoder.FAIL)
			}
		});
	}
	
	/**
	 * @function cacheResponse
	 * @access protected
	 * @summary Caches a response on the server, usually after it's been returned from Nominatim
	 * @param {string} address The street address
	 * @param {object|array} response The response to cache
	 * @returns {void}
	 */
	WPGMZA.OLGeocoder.prototype.cacheResponse = function(query, response)
	{
		$.ajax(WPGMZA.ajaxurl, {
			data: {
				action: "wpgmza_store_nominatim_cache",
				query: JSON.stringify(query),
				response: JSON.stringify(response)
			},
			method: "POST"
		});
	}
	
	WPGMZA.OLGeocoder.prototype.getLatLngFromAddress = function(options, callback)
	{
		return WPGMZA.OLGeocoder.prototype.geocode(options, callback);
	}
	
	WPGMZA.OLGeocoder.prototype.getAddressFromLatLng = function(options, callback)
	{
		return WPGMZA.OLGeocoder.prototype.geocode(options, callback);
	}
	
	WPGMZA.OLGeocoder.prototype.geocode = function(options, callback)
	{
		var self = this;
		
		if(!options)
			throw new Error("Invalid options");
		
		if(options.location)
			options.latLng = new WPGMZA.LatLng(options.location);
		
		var finish, location;
		
		if(options.address)
		{
			location = options.address;
			
			finish = function(response, status)
			{
				for(var i = 0; i < response.length; i++)
				{
					response[i].geometry = {
						location: new WPGMZA.LatLng({
							lat: parseFloat(response[i].lat),
							lng: parseFloat(response[i].lon)
						})
					};
					
					response[i].latLng = {
						lat: parseFloat(response[i].lat),
						lng: parseFloat(response[i].lon)
					};
					
					// Backward compatibility with old UGM
					response[i].lng = response[i].lon;
				}
				
				callback(response, status);
			}
		}
		else if(options.latLng)
		{
			location = options.latLng.toString();
			
			finish = function(response, status)
			{
				var address = response[0].display_name;
				callback([address], status);
			}
		}
		else
			throw new Error("You must supply either a latLng or address")
		
		var query = {location: location, options: options};
		this.getResponseFromCache(query, function(response) {
			if(response.length)
			{
				finish(response, WPGMZA.Geocoder.SUCCESS);
				return;
			}
			
			self.getResponseFromNominatim($.extend(options, {address: location}), function(response, status) {
				if(status == WPGMZA.Geocoder.FAIL)
				{
					callback(null, WPGMZA.Geocoder.FAIL);
					return;
				}
				
				if(response.length == 0)
				{
					callback([], WPGMZA.Geocoder.ZERO_RESULTS);
					return;
				}
				
				finish(response, WPGMZA.Geocoder.SUCCESS);
				
				self.cacheResponse(query, response);
			});
		});
	}
	
});

// js/v8/open-layers/ol-modern-store-locator-circle.js
/**
 * @namespace WPGMZA
 * @module OLModernStoreLocatorCircle
 * @requires WPGMZA.ModernStoreLocatorCircle
 */
jQuery(function($) {
	
	WPGMZA.OLModernStoreLocatorCircle = function(map, settings)
	{
		WPGMZA.ModernStoreLocatorCircle.call(this, map, settings);
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype = Object.create(WPGMZA.ModernStoreLocatorCircle.prototype);
	WPGMZA.OLModernStoreLocatorCircle.prototype.constructor = WPGMZA.OLModernStoreLocatorCircle;
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.initCanvasLayer = function()
	{
		var self = this;
		var mapElement = $(this.map.element);
		var olViewportElement = mapElement.children(".ol-viewport");
		
		this.canvas = document.createElement("canvas");
		this.canvas.className = "wpgmza-ol-canvas-overlay";
		mapElement.append(this.canvas);
		
		this.renderFunction = function(event) {
			
			if(self.canvas.width != olViewportElement.width() || self.canvas.height != olViewportElement.height())
			{
				self.canvas.width = olViewportElement.width();
				self.canvas.height = olViewportElement.height();
				
				$(this.canvas).css({
					width: olViewportElement.width() + "px",
					height: olViewportElement.height() + "px"
				});
			}
			
			self.draw();
		};
		
		this.map.olMap.on("postrender", this.renderFunction);
	}

	WPGMZA.OLModernStoreLocatorCircle.prototype.getContext = function(type)
	{
		return this.canvas.getContext(type);
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.getCanvasDimensions = function()
	{
		return {
			width: this.canvas.width,
			height: this.canvas.height
		};
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.getCenterPixels = function()
	{
		var center = this.map.latLngToPixels(this.settings.center);
		
		return center;
	}
		
	WPGMZA.OLModernStoreLocatorCircle.prototype.getWorldOriginOffset = function()
	{
		return {
			x: 0,
			y: 0
		};
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.getTransformedRadius = function(km)
	{
		var center = new WPGMZA.LatLng(this.settings.center);
		var outer = new WPGMZA.LatLng(center);
		
		outer.moveByDistance(km, 90);
		
		var centerPixels = this.map.latLngToPixels(center);
		var outerPixels = this.map.latLngToPixels(outer);
		
		return Math.abs(outerPixels.x - centerPixels.x);

		if(!window.testMarker){
			window.testMarker = WPGMZA.Marker.createInstance({
				position: outer
			});
			WPGMZA.maps[0].addMarker(window.testMarker);
		}
		
		return 100;
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.getScale = function()
	{
		return 1;
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.destroy = function()
	{
		$(this.canvas).remove();
		
		this.map.olMap.un("postrender", this.renderFunction);
		this.map = null;
		this.canvas = null;
	}
	
});

// js/v8/open-layers/ol-polyline.js
/**
 * @namespace WPGMZA
 * @module OLPolyline
 * @requires WPGMZA.Polyline
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLPolyline = function(row, olFeature)
	{
		var self = this;
		
		WPGMZA.Polyline.call(this, row);
		
		this.olStyle = new ol.style.Style();
		
		if(olFeature)
		{
			this.olFeature = olFeature;
		}
		else
		{
			var coordinates = [];
			
			if(row && row.points)
			{
				var path = this.parseGeometry(row.points);
				
				for(var i = 0; i < path.length; i++)
					coordinates.push(ol.proj.fromLonLat([
						parseFloat(path[i].lng),
						parseFloat(path[i].lat)
					]));
			}
			
			var params = this.getStyleFromSettings();
			this.olStyle = new ol.style.Style(params);
			
			this.olFeature = new ol.Feature({
				geometry: new ol.geom.LineString(coordinates)
			});
		}
		
		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [this.olFeature]
			}),
			style: this.olStyle
		});
		
		this.layer.getSource().getFeatures()[0].setProperties({
			wpgmzaPolyling: this
		});
	}
	
	Parent = WPGMZA.Polyline;
		
	WPGMZA.OLPolyline.prototype = Object.create(Parent.prototype);
	WPGMZA.OLPolyline.prototype.constructor = WPGMZA.OLPolyline;
	
	WPGMZA.OLPolyline.prototype.getStyleFromSettings = function()
	{
		var params = {};
		
		if(this.settings.strokeOpacity)
			params.stroke = new ol.style.Stroke({
				color: WPGMZA.hexOpacityToRGBA(this.settings.strokeColor, this.settings.strokeOpacity),
				width: parseInt(this.settings.strokeWeight)
			});
			
		return params;
	}
	
	WPGMZA.OLPolyline.prototype.updateStyleFromSettings = function()
	{
		// Re-create the style - working on it directly doesn't cause a re-render
		var params = this.getStyleFromSettings();
		this.olStyle = new ol.style.Style(params);
		this.layer.setStyle(this.olStyle);
	}
	
	WPGMZA.OLPolyline.prototype.setEditable = function(editable)
	{
		
	}
	
	WPGMZA.OLPolyline.prototype.setPoints = function(points)
	{
		if(this.olFeature)
			this.layer.getSource().removeFeature(this.olFeature);
		
		var coordinates = [];
		
		for(var i = 0; i < points.length; i++)
			coordinates.push(ol.proj.fromLonLat([
				parseFloat(points[i].lng),
				parseFloat(points[i].lat)
			]));
		
		this.olFeature = new ol.Feature({
			geometry: new ol.geom.LineString(coordinates)
		});
		
		this.layer.getSource().addFeature(this.olFeature);
	}
	
	WPGMZA.OLPolyline.prototype.toJSON = function()
	{
		var result = Parent.prototype.toJSON.call(this);
		var coordinates = this.olFeature.getGeometry().getCoordinates();
		
		result.points = [];
		
		for(var i = 0; i < coordinates.length; i++)
		{
			var lonLat = ol.proj.toLonLat(coordinates[i]);
			var latLng = {
				lat: lonLat[1],
				lng: lonLat[0]
			};
			result.points.push(latLng);
		}
		
		return result;
	}
	
});

// js/v8/open-layers/ol-text.js
/**
 * @namespace WPGMZA
 * @module OLText
 * @requires WPGMZA.Text
 */
jQuery(function($) {
	
	WPGMZA.OLText = function()
	{
		
	}
	
});

// js/v8/tables/datatable.js
/**
 * @namespace WPGMZA
 * @module DataTable
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.DataTable = function(element)
	{
		$.fn.dataTable.ext.errMode = "throw";
		
		this.element = element;
		this.element.wpgmzaDataTable = this;
		this.dataTableElement = this.getDataTableElement();

		var settings = this.getDataTableSettings();
		
		this.phpClass			= $(element).attr("data-wpgmza-php-class");
		this.dataTable			= $(this.dataTableElement).DataTable(settings);
		this.wpgmzaDataTable	= this;
	}
	
	WPGMZA.DataTable.prototype.getDataTableElement = function()
	{
		return $(this.element).find("table");
	}
	
	WPGMZA.DataTable.prototype.getDataTableSettings = function()
	{
		var self = this;
		var element = this.element;
		var options = {};
		var ajax;
		
		if($(element).attr("data-wpgmza-datatable-options"))
			options = JSON.parse($(element).attr("data-wpgmza-datatable-options"));
		
		if(ajax = $(element).attr("data-wpgmza-rest-api-route"))
		{
			options.ajax = {
				url: WPGMZA.resturl + ajax,
				method: "POST",	// We don't use GET because the request can get bigger than some browsers maximum URL lengths
				data: function(data, settings) {
					return self.onAJAXRequest(data, settings);
				},
				beforeSend: function(xhr) {
					xhr.setRequestHeader('X-WP-Nonce', WPGMZA.restnonce);
				}
			};
			
			options.processing = true;
			options.serverSide = true;
		}
		
		if($(this.element).attr("data-wpgmza-php-class") == "WPGMZA\\MarkerListing\\AdvancedTable" && WPGMZA.settings.wpgmza_default_items)
		{
			options.iDisplayLength = parseInt(WPGMZA.settings.wpgmza_default_items);
			options.aLengthMenu = [5, 10, 25, 50, 100];
		}
		
		var languageURL;

		if(WPGMZA.locale)
			switch(WPGMZA.locale.substr(0, 2))
			{
				case "af":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Afrikaans.json";
					break;

				case "sq":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Albanian.json";
					break;

				case "am":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Amharic.json";
					break;

				case "ar":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Arabic.json";
					break;

				case "hy":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Armenian.json";
					break;

				case "az":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Azerbaijan.json";
					break;

				case "bn":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Bangla.json";
					break;

				case "eu":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Basque.json";
					break;

				case "be":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Belarusian.json";
					break;

				case "bg":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Bulgarian.json";
					break;

				case "ca":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Catalan.json";
					break;

				case "zh":
					if(WPGMZA.locale == "zh_TW")
						languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Chinese-traditional.json";
					else
						languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Chinese.json";
					break;

				case "hr":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Croatian.json";
					break;

				case "cs":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Czech.json";
					break;

				case "da":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Danish.json";
					break;

				case "nl":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Dutch.json";
					break;

				/*case "en":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/English.json";
					break;*/

				case "et":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Estonian.json";
					break;

				case "fi":
					if(WPGMZA.locale.match(/^fil/))
						languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Filipino.json";
					else
						languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Finnish.json";
					break;

				case "fr":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/French.json";
					break;

				case "gl":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Galician.json";
					break;

				case "ka":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Georgian.json";
					break;

				case "de":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/German.json";
					break;

				case "el":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Greek.json";
					break;

				case "gu":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Gujarati.json";
					break;

				case "he":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Hebrew.json";
					break;

				case "hi":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Hindi.json";
					break;

				case "hu":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Hungarian.json";
					break;

				case "is":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Icelandic.json";
					break;

				/*case "id":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Indonesian-Alternative.json";
					break;*/
				
				case "id":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Indonesian.json";
					break;

				case "ga":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Irish.json";
					break;

				case "it":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Italian.json";
					break;

				case "ja":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Japanese.json";
					break;

				case "kk":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Kazakh.json";
					break;

				case "ko":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Korean.json";
					break;

				case "ky":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Kyrgyz.json";
					break;

				case "lv":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Latvian.json";
					break;

				case "lt":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Lithuanian.json";
					break;

				case "mk":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Macedonian.json";
					break;

				case "ml":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Malay.json";
					break;

				case "mn":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Mongolian.json";
					break;

				case "ne":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Nepali.json";
					break;

				case "nb":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Norwegian-Bokmal.json";
					break;
				
				case "nn":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Norwegian-Nynorsk.json";
					break;
				
				case "ps":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Pashto.json";
					break;

				case "fa":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Persian.json";
					break;

				case "pl":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Polish.json";
					break;

				case "pt":
					if(WPGMZA.locale == "pt_BR")
						languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Portuguese-Brasil.json";
					else
						languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Portuguese.json";
					break;
				
				case "ro":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Romanian.json";
					break;

				case "ru":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Russian.json";
					break;

				case "sr":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Serbian.json";
					break;

				case "si":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Sinhala.json";
					break;

				case "sk":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Slovak.json";
					break;

				case "sl":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Slovenian.json";
					break;

				case "es":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Spanish.json";
					break;

				case "sw":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Swahili.json";
					break;

				case "sv":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Swedish.json";
					break;

				case "ta":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Tamil.json";
					break;

				case "te":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/telugu.json";
					break;

				case "th":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Thai.json";
					break;

				case "tr":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Turkish.json";
					break;

				case "uk":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Ukrainian.json";
					break;

				case "ur":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Urdu.json";
					break;

				case "uz":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Uzbek.json";
					break;

				case "vi":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Vietnamese.json";
					break;

				case "cy":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Welsh.json";
					break;
			}
		
		if(languageURL)
			options.language = {
				"processing": "test",
				"url": languageURL
			};
		
		return options;
	}
	
	/**
	 * This function wraps the request so it doesn't collide with WP query vars,
	 * it also adds the PHP class so that the controller knows which class to 
	 * instantiate
	 * @return object
	 */
	WPGMZA.DataTable.prototype.onAJAXRequest = function(data, settings)
	{
		var params = {
			"phpClass":	this.phpClass
		};
		
		var attr = $(this.element).attr("data-wpgmza-ajax-parameters");
		if(attr)
			$.extend(params, JSON.parse(attr));
		
		$.extend(data, params);
		
		return {
			wpgmzaDataTableRequestData: data
		};
	}
	
	WPGMZA.DataTable.prototype.onAJAXResponse = function(response)
	{
		
	}
	
	WPGMZA.DataTable.prototype.reload = function()
	{
		this.dataTable.ajax.reload(null, false); // null callback, false for resetPaging
	}
	
});

// js/v8/tables/admin-marker-datatable.js
/**
 * @namespace WPGMZA
 * @module AdminMarkerDataTable
 * @requires WPGMZA.DataTable
 */
jQuery(function($) {
	
	WPGMZA.AdminMarkerDataTable = function(element)
	{
		var self = this;
		
		WPGMZA.DataTable.call(this, element);
		
		$(element).find(".wpgmza.select_all_markers").on("click", function(event) {
			self.onSelectAll(event);
		});
		
		$(element).find(".wpgmza.bulk_delete").on("click", function(event) {
			self.onBulkDelete(event);
		});
	}
	
	WPGMZA.AdminMarkerDataTable.prototype = Object.create(WPGMZA.DataTable.prototype);
	WPGMZA.AdminMarkerDataTable.prototype.constructor = WPGMZA.AdminMarkerDataTable;
	
	WPGMZA.AdminMarkerDataTable.prototype.getDataTableSettings = function()
	{
		var self = this;
		var options = WPGMZA.DataTable.prototype.getDataTableSettings.call(this);
		
		options.createdRow = function(row, data, index)
		{
			var ajax = self.dataTable.ajax.json();
			var meta = ajax.meta[index];
			row.wpgmzaMarkerData = meta;
		}
		
		return options;
	}
	
	WPGMZA.AdminMarkerDataTable.prototype.onSelectAll = function(event)
	{
		$(this.element).find("input[name='mark']").prop("checked", true);
	}
	
	WPGMZA.AdminMarkerDataTable.prototype.onBulkDelete = function(event)
	{
		var self = this;
		var ids = [];
		
		$(this.element).find("input[name='mark']:checked").each(function(index, el) {
			var row = $(el).closest("tr")[0];
			ids.push(row.wpgmzaMarkerData.id);
		});
		
		WPGMZA.restAPI.call("/markers/", {
			method: "DELETE",
			data: {
				ids: ids
			},
			complete: function() {
				self.reload();
			}
		});
	}
	
	$(document).ready(function(event) {
		
		$("[data-wpgmza-admin-marker-datatable]").each(function(index, el) {
			new WPGMZA.AdminMarkerDataTable(el);
		});
		
	});
	
});

// js/v8/custom-field-filter-controller.js
/**
 * @namespace WPGMZA
 * @module CustomFieldFilterController
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * This module handles the custom field filtering logic
	 * @constructor
	 */
	WPGMZA.CustomFieldFilterController = function(map_id)
	{
		var self = this;
		
		this.map_id = map_id;
		this.widgets = [];
		this.ajaxTimeoutID = null;
		this.ajaxRequest = null;
		
		// TODO: This will break pagination (page count mismatch) when we integrate pagination for basic styles. I suggest we unify the filtering before doing so
		this.markerListingCSS = $("<style type='text/css'/>");
		$(document.body).append(this.markerListingCSS);
		
		WPGMZA.CustomFieldFilterController.controllersByMapID[map_id] = this;
		
		$("[data-wpgmza-filter-widget-class][data-map-id=" + map_id + "]").each(function(index, el) {
			self.widgets.push( WPGMZA.CustomFieldFilterWidget.createInstance(el) );
			
			$(el).on("input change", function(event) {
				self.onWidgetChanged(event);
			});
			
			if($(el).is(":checkbox"))
				$(el).on("click", function(event) {
					self.onWidgetChanged(event);
				});
		});
		
		var container = $(".wpgmza-filter-widgets[data-map-id='" + map_id + "']");
		$(container).find("button.wpgmza-reset-custom-fields").on("click", function(event) {
			$(container).find("input:not([type='checkbox']):not([type='radio']), textarea").val("");
			$(container).find("input[type='checkbox']").prop("checked", false);
			//$(container).find("option:selected").prop("selected", false);
			//$(container).find("option[value='*']").prop("selected", true);
			$(container).find("select").val("");
			self.onWidgetChanged();
		});
	};
	
	WPGMZA.CustomFieldFilterController.AJAX_DELAY = 500;
	WPGMZA.CustomFieldFilterController.controllersByMapID = {};
	WPGMZA.CustomFieldFilterController.dataTablesSourceHTMLByMapID = {};
	
	WPGMZA.CustomFieldFilterController.createInstance = function(map_id)
	{
		return new WPGMZA.CustomFieldFilterController(map_id);
	};
	
	WPGMZA.CustomFieldFilterController.prototype.getAjaxRequestData = function() {
		var self = this;
		
		var result = {
			url: ajaxurl,
			method: "POST",
			data: {
				action: "wpgmza_custom_field_filter_get_filtered_marker_ids",
				map_id: this.map_id,
				widgetData: []
			},
			success: function(response, status, xhr) {
				self.onAjaxResponse(response, status, xhr);
			}
		};
		
		this.widgets.forEach(function(widget) {
			result.data.widgetData.push(widget.getAjaxRequestData());
		});
		
		return result;
	};
	
	WPGMZA.CustomFieldFilterController.prototype.onWidgetChanged = function(event) {
		var self = this;
		
		var map = WPGMZA.getMapByID(this.map_id);
		map.markerFilter.update();
	};
	
	WPGMZA.CustomFieldFilterController.prototype.onAjaxResponse = function(response, status, xhr) {
		this.lastResponse = response;
		
		var selectors = [];
		
		for(var marker_id in marker_array[this.map_id])
		{
			var visible = (response.marker_ids.length == 0 || response.marker_ids.indexOf(marker_id) > -1);
			marker_array[this.map_id][marker_id].setVisible(visible);
			
			if(!visible)
				selectors.push(".wpgmaps_mlist_row[mid='" + marker_id + "']");
		}
		
		if(wpgmaps_localize[this.map_id].order_markers_by && wpgmaps_localize[this.map_id].order_markers_by == 2)
		{
			wpgmza_update_data_table(
				WPGMZA.CustomFieldFilterController.dataTablesSourceHTMLByMapID[this.map_id],
				this.map_id
			);
		}
		else
		{
			this.markerListingCSS.html( selectors.join(", ") + "{ display: none; }" );
			
			var container;
			if(this.currAdvancedTableHTML)
				container = $("#wpgmza_marker_holder_" + this.map_id);
			else
				container = $(this.currAdvancedTableHTML);
			
			this.applyToAdvancedTable(container);
		}
	};
	
	/**
	 * This function is a quick hack to re-apply the last response after the store locator
	 * has been used or marker listing filtering changes. This should be deprecated and
	 * the filtering system unified at some point.
	 * @return void
	 */
	WPGMZA.CustomFieldFilterController.prototype.reapplyLastResponse = function() {
		if(!this.lastResponse)
			return;
		
		var response = this.lastResponse;
		
		for(var marker_id in marker_array[this.map_id])
		{
			var visible = (response.marker_ids.indexOf(marker_id) > -1);
			marker_array[this.map_id][marker_id].setVisible(visible);
		}
	};
	
	WPGMZA.CustomFieldFilterController.prototype.applyToAdvancedTable = function() {
		if(!this.lastResponse)
			return;
		
		var response = this.lastResponse;
		var container = $("#wpgmza_marker_holder_" + this.map_id);
		
		$(container).find("[mid]").each(function(index, el) {
			var marker_id = $(el).attr("mid");
			if(response.marker_ids.indexOf(marker_id) == -1)
				$(el).remove();
		});
	};
	
	$(window).on("load", function(event) {
		
		$(".wpgmza_map").each(function(index, el) {
			var map_id = parseInt( $(el).attr("id").match(/\d+/)[0] );
			
			/*MYMAP[map_id].customFieldFilterController 
				= MYMAP[map_id].map.customFieldFilterController 
				= WPGMZA.CustomFieldFilterController.createInstance(map_id);*/

            setTimeout(function () {
                $(el).children('div').first().after($('.wpgmza-modern-marker-open-button'));
            }, 500);
		});
		
		
	});
	
});

// js/v8/custom-field-filter-widget.js
/**
 * @namespace WPGMZA
 * @module CustomFieldFilterWidget
 * @requires WPGMZA
 */
jQuery(function($) {

	/**
	 * This is the base module for custom field filter widgets
	 * @constructor
	 */
	WPGMZA.CustomFieldFilterWidget = function(element) {
		this.element = element;
	};
	
	WPGMZA.CustomFieldFilterWidget.createInstance = function(element) {
		var widgetPHPClass = $(element).attr("data-wpgmza-filter-widget-class");
		var constructor = null;
		
		switch(widgetPHPClass)
		{
			case "WPGMZA\\CustomFieldFilterWidget\\Text":
				constructor = WPGMZA.CustomFieldFilterWidget.Text;
				break;
				
			case "WPGMZA\\CustomFieldFilterWidget\\Dropdown":
				constructor = WPGMZA.CustomFieldFilterWidget.Dropdown;
				break;
			
			case "WPGMZA\\CustomFieldFilterWidget\\Checkboxes":
				constructor = WPGMZA.CustomFieldFilterWidget.Checkboxes;
				break;
				
			default:
				throw new Error("Unknown field type '" + widgetPHPClass + "'");
				break;
		}
		
		return new constructor(element);
	};
	
	WPGMZA.CustomFieldFilterWidget.prototype.getAjaxRequestData = function() {
		var data = {
			field_id: $(this.element).attr("data-field-id"),
			value: $(this.element).val()
		};
		
		return data;
	};
	
	/**
	 * Text field custom field filter
	 * @constructor
	 */
	WPGMZA.CustomFieldFilterWidget.Text = function(element) {
		WPGMZA.CustomFieldFilterWidget.apply(this, arguments);
	};
	
	WPGMZA.CustomFieldFilterWidget.Text.prototype = Object.create(WPGMZA.CustomFieldFilterWidget.prototype);
	WPGMZA.CustomFieldFilterWidget.Text.prototype.constructor = WPGMZA.CustomFieldFilterWidget.Text;
	
	/**
	 * Dropdown field custom field filter
	 * @constructor
	 */
	WPGMZA.CustomFieldFilterWidget.Dropdown = function(element) {
		WPGMZA.CustomFieldFilterWidget.apply(this, arguments);
	};
	
	WPGMZA.CustomFieldFilterWidget.Dropdown.prototype = Object.create(WPGMZA.CustomFieldFilterWidget.prototype);
	WPGMZA.CustomFieldFilterWidget.Dropdown.prototype.constructor = WPGMZA.CustomFieldFilterWidget.Dropdown;
	
	/**
	 * Checkboxes field custom field filter
	 * @constructor
	 */
	WPGMZA.CustomFieldFilterWidget.Checkboxes = function(element) {
		WPGMZA.CustomFieldFilterWidget.apply(this, arguments);
	};
	
	WPGMZA.CustomFieldFilterWidget.Checkboxes.prototype = Object.create(WPGMZA.CustomFieldFilterWidget.prototype);
	WPGMZA.CustomFieldFilterWidget.Checkboxes.prototype.constructor = WPGMZA.CustomFieldFilterWidget.Checkboxes;
	
	WPGMZA.CustomFieldFilterWidget.Checkboxes.prototype.getAjaxRequestData = function() {
		var checked = [];
		
		$(this.element).find(":checked").each(function(index, el) {
			checked.push($(el).val());
		});
		
		return {
			field_id: $(this.element).attr("data-field-id"),
			value: checked
		}
	};
	
	
});

// js/v8/heatmap.js
/**
 * @namespace WPGMZA
 * @module Heatmap
 * @requires WPGMZA.MapObject
 */
jQuery(function($) {
	
	WPGMZA.Heatmap = function(row)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "EventDispatcher");
		
		this.name = "";
		this.points = [];
		
		WPGMZA.MapObject.apply(this, arguments);
		
		// Parse gradient
		if(typeof this.settings.gradient != "array")
		{
			console.warn("Ignoring invalid gradient");
			delete this.settings.gradient;
			
			this.settings.gradient = [
				"rgba(0, 255, 255, 0)",
				"rgba(0, 255, 255, 1)",
				"rgba(0, 191, 255, 1)",
				"rgba(0, 127, 255, 1)",
				"rgba(0, 63, 255, 1)",
				"rgba(0, 0, 255, 1)",
				"rgba(0, 0, 223, 1)",
				"rgba(0, 0, 191, 1)",
				"rgba(0, 0, 159, 1)",
				"rgba(0, 0, 127, 1)",
				"rgba(63, 0, 91, 1)",
				"rgba(127, 0, 63, 1)",
				"rgba(191, 0, 31, 1)",
				"rgba(255, 0, 0, 1)"
			];
		}
		
		// Keep a hash map of points so they can be quickly looked up by lat/lng (for removing them)
		this.hashMap = {};
		
		// Parse points
		if(row && row.points)
		{
			this.points = this.parseGeometry(row.points);
			for(var i = 0; i < this.points.length; i++)
				this.addPointToHashMap(this.points[i]);
		}
	}
	
	WPGMZA.Heatmap.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Heatmap.prototype.constructor = WPGMZA.Heatmap;
	
	WPGMZA.Heatmap.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				return WPGMZA.OLHeatmap;
				break;
			
			default:
				return WPGMZA.GoogleHeatmap;
				break;
		}
	}
	
	WPGMZA.Heatmap.createInstance = function(row)
	{
		var constructor = WPGMZA.Heatmap.getConstructor();
		return new constructor(row);
	}
	
	WPGMZA.Heatmap.prototype.getHashFromLatLng = function(latLng)
	{
		return parseFloat(latLng.lat).toFixed(11) + "," + parseFloat(latLng.lng).toFixed(11);
	}
	
	WPGMZA.Heatmap.prototype.addPointToHashMap = function(point)
	{
		var hash = this.getHashFromLatLng({
			lat: point.lat,
			lng: point.lng
		});
		this.hashMap[hash] = point;
	}
	
	WPGMZA.Heatmap.prototype.addPoint = function(latLng)
	{
		this.points.push(latLng);
		this.addPointToHashMap(latLng);
		this.modified = true;
	}
	
	WPGMZA.Heatmap.prototype.removePoint = function(latLng)
	{
		var hash = this.getHashFromLatLng(latLng);
		var point = this.hashMap[hash];
		var index = this.points.indexOf(point);
		
		if(index == -1)
		{
			console.warn("No point found at " + hash);
			return;
		}
		
		this.points.splice(index, 1);
		this.modified = true;
	}
	
	WPGMZA.Heatmap.prototype.toJSON = function()
	{
		var result = WPGMZA.MapObject.prototype.toJSON.call(this);
		
		result.points = [];
		
		for(var i = 0; i < this.points.length; i++)
		{
			var latLng = this.points[i];
			result.points.push({
				lat: latLng.lat,
				lng: latLng.lng
			});
		}
		
		return result;
	}
	
});

// js/v8/modern-directions-box.js
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

// js/v8/modern-directions-result-box.js
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

// js/v8/modern-marker-listing-marker-view.js
/**
 * @namespace WPGMZA
 * @module ModernMarkerListingMarkerView
 * @requires WPGMZA.PopoutPanel
 */
jQuery(function($) {
	
	/**
	 * This is the 2nd step of the modern look and feel marker listing
	 * @return Object
	 */
	WPGMZA.ModernMarkerListingMarkerView = function(map)
	{
		var self = this;
		
		this.map = map;
		this.map_id = map.id;
		
		WPGMZA.PopoutPanel.apply(this, arguments);
		
		var container = $("#wpgmza_map_" + map.id);
		
		this.element = $("<div class='wpgmza-popout-panel wpgmza-modern-marker-listing-marker-view'>\
			<div class='wpgmza-close-container'>\
				<span class='wpgmza-close'><i class='fa fa-arrow-left' aria-hidden='true'></i></span>\
				<span class='wpgmza-close'><i class='fa fa-times' aria-hidden='true'></i></span>\
			</div>\
			<div data-name='title'></div>\
			<div data-name='address'></div>\
			<div data-name='category'></div>\
			<img data-name='pic'/>\
			<div data-name='desc'></div>\
			<div class='wpgmza-modern-marker-listing-buttons'>\
				<div class='wpgmza-modern-marker-listing-button wpgmza-link-button'>\
					<i class='fa fa-link' aria-hidden='true'></i>\
					<div>\
						" + wpgmza_localized_strings.link + "\
					</div>\
				</div>\
				<div class='wpgmza-modern-marker-listing-button wpgmza-directions-button'>\
					<i class='fa fa-road' aria-hidden='true'></i>\
					<div>\
						" + wpgmza_localized_strings.directions + "\
					</div>\
				</div>\
				<div class='wpgmza-modern-marker-listing-button wpgmza-zoom-button'>\
					<i class='fa fa-search-plus' aria-hidden='true'></i>\
					<div>\
						" + wpgmza_localized_strings.zoom + "\
					</div>\
				</div>\
			</div>\
		</div>");
		
		map.on("init", function() {
			
			container.append(self.element);
			
		});
		
		map.on("click", function(event) {
			
			if(!(event.target instanceof WPGMZA.Marker))
				return;
			
			if(event.target == self.map.userLocationMarker || event.target == self.map.storeLocatorMarker)
				return;
			
			self.open(event.target.id);
			
		});
		
		$(this.element).find(".wpgmza-close").on("click", function(event) {
			self.close();
            $("#wpgmza_map_" + self.map_id + " .wpgmza-modern-store-locator").removeClass("wpgmza_sl_mv_offset");
		});
		
		$(this.element).find(".wpgmza-link-button").on("click", function(event) {
			self.onLink(event);
		});
		
		$(this.element).find(".wpgmza-directions-button").on("click", function(event) {
			self.onDirections(event);
		});
		
		$(this.element).find(".wpgmza-zoom-button").on("click", function(event) {
			self.onZoom(event);
		});
	}
	
	WPGMZA.ModernMarkerListingMarkerView.prototype = Object.create(WPGMZA.PopoutPanel.prototype);
	WPGMZA.ModernMarkerListingMarkerView.prototype.constructor = WPGMZA.ModernMarkerListingMarkerView;
	
	/*WPGMZA.ModernMarkerListingMarkerView.prototype.getMarkerAndData = function(marker_id)
	{
		var result = {
			marker: null,
			data: null
		};
		
		var mashup_ids = this.parent.mashup_ids;
		var map_id = this.map_id;
		var map_ids = [map_id];
		
		if(mashup_ids && mashup_ids.length)
			map_ids = mashup_ids.split(",");
		
		map_ids.forEach(function(map_id) {
			
			
			
		});
		
		return result;
	}*/
	
	WPGMZA.ModernMarkerListingMarkerView.prototype.open = function(marker_id)
	{
		WPGMZA.PopoutPanel.prototype.open.apply(this, arguments);
		
		var self = this;
		
		var marker_data;
        var data = wpgmaps_localize_marker_data[this.map.id];
		
		if(typeof data == "array")
			for(var i = 0; i < data.length; i++)
			{
				if(data[i].marker_id == marker_id)
				{
					marker_data = data[i];
					
					break;
				}
			}
		else if(typeof data == "object")
			for(var key in data)
			{
				if(data[key].marker_id == marker_id)
				{
					marker_data = data[key];
					
					break;
				}
			}
		
		if(!marker_data)
		{
			console.warn("Failed to find marker data for marker " + mapObject.id);
			return false;
		}
		
		this.focusedMarker = marker_array[this.map_id][marker_id];
			
		if(this.parent.mashup_ids)
		{
			for(var key in wpgmaps_localize_marker_data[this.map_id])
			{
				var data = wpgmaps_localize_marker_data[this.map_id][key];
				
				if(data.marker_id == marker_id)
				{
					this.focusedMarkerData = marker_data = data;
					break;
				}
			}
		}
		else
		{
			this.focusedMarkerData = marker_data;
		}
		
		$(this.element).find("[data-name]").each(function(index, el) {
			
			var name = $(el).attr("data-name");
			var value;
			
			
			if(!marker_data[name])
				value = "";
			else
				value = marker_data[name];
			
			switch(name)
			{
				case "pic":
					$(el).attr("src", value);
					// $(el).css({visibility: (value == "" ? "hidden" : "visible")});
					
					break;
				
				case "category":
					var ids = value.split(",");
					var names = [];
					
					for(var i = 0; i < ids.length; i++) {
						var id = ids[i];
						
						if(wpgmza_category_data[id])
							names.push(wpgmza_category_data[id].category_name);
					}
					
					$(el).html(names.join(", "));
					
					break;
				
				default:
					$(el).html(value);
					break;
			}
			
		});
		
		if(!marker_data["linkd"] || marker_data["linkd"].length == 0)
			$(this.element).find(".wpgmza-link-button").hide();
		else
			$(this.element).find(".wpgmza-link-button").show();

        $("#wpgmza_map_" + this.map_id + " .wpgmza-modern-store-locator").addClass("wpgmza_sl_mv_offset");
	 
		$(this.element).find("[data-custom-field-name]").remove();
		$(this.element).find(".wpgmza-modern-marker-listing-buttons").before(marker_data.custom_fields_html);
		
		$(this.element).find(".wpgmza-close").on("click", function(event) {
			self.close();
		});
	}
	
	WPGMZA.ModernMarkerListingMarkerView.prototype.onLink = function(event) {
		
		window.open(this.focusedMarkerData.linkd, "_blank");
		
	}
	
	WPGMZA.ModernMarkerListingMarkerView.prototype.onDirections = function(event) {
		
		if(MYMAP[entry].directionsBox)
			MYMAP[entry].directionsBox.open();
		else
			$("#wpgmaps_directions_edit_" + this.map_id).show();
		
		$("#wpgmza_input_to_" + this.map_id).val(this.focusedMarkerData.address);
		
	}
	
	WPGMZA.ModernMarkerListingMarkerView.prototype.onZoom = function(event) {
		
		var map = MYMAP[this.map_id].map;
		
		map.setCenter(this.focusedMarker.getPosition());
		map.setZoom(14);
		
	}
	
});

// js/v8/pro-info-window.js
/**
 * @namespace WPGMZA
 * @module ProInfoWindow
 * @requires WPGMZA.InfoWindow
 */
jQuery(function($) {
	
	WPGMZA.ProInfoWindow = function(mapObject)
	{
		WPGMZA.InfoWindow.call(this, mapObject);
	}
	
	WPGMZA.ProInfoWindow.prototype = Object.create(WPGMZA.InfoWindow.prototype);
	WPGMZA.ProInfoWindow.prototype.constructor = WPGMZA.ProInfoWindow;
	
	WPGMZA.ProInfoWindow.STYLE_INHERIT			= "-1";
	WPGMZA.ProInfoWindow.STYLE_NATIVE_GOOGLE	= "0";
	WPGMZA.ProInfoWindow.STYLE_MODERN			= "1";
	WPGMZA.ProInfoWindow.STYLE_MODERN_PLUS		= "2";
	WPGMZA.ProInfoWindow.STYLE_MODERN_CIRCULAR	= "3";
	WPGMZA.ProInfoWindow.STYLE_TEMPLATE			= "template";
	
	WPGMZA.ProInfoWindow.OPEN_BY_CLICK			= 1;
	WPGMZA.ProInfoWindow.OPEN_BY_HOVER			= 2;
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "maxWidth", {
		
		get: function() {
			var width = WPGMZA.settings.wpgmza_settings_infowindow_width;
			
			if(!width || !(/^\d+$/.test(width)))
				return false;
			
			return width;
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "imageWidth", {
		
		get: function() {
			var width = WPGMZA.settings.wpgmza_settings_image_width;
			
			if(!width || !(/^\d+$/.test(width)))
				return false;
				
			return width;
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "imageHeight", {
		
		get: function() {
			var height = WPGMZA.settings.wpgmza_settings_image_height;
			
			if(!height || !(/^\d+$/.test(height)))
				return false;
				
			return height;
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "enableImageResizing", {
		
		get: function() {
			return WPGMZA.settings.wpgmza_settings_image_resizing == "yes";
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "linkTarget", {
		
		get: function() {
			return WPGMZA.settings.wpgmza_settings_infowindow_links == "yes" ? "_BLANK" : "";
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "linkText", {
		
		get: function() {
			return window.wpgmaps_lang_more_details;
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "directionsText", {
		
		get: function() {
			return window.wpgmaps_lang_get_dir;
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "distanceUnits", {
		
		get: function() {
			return this.mapObject.map.settings.store_locator_distance == 1 ? WPGMZA.Distance.MILES : WPGMZA.Distance.KILOMETERS;
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "showAddress", {
		
		get: function() {
			return WPGMZA.settings.wpgmza_settings_infowindow_address != "yes";
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProInfoWindow.prototype, "style", {
		
		get: function() {
			
			if(this.map && this.map.userLocationMarker == this)
				return WPGMZA.ProInfoWindow.STYLE_NATIVE_GOOGLE;
			
			return this.getSelectedStyle();
			
		}
		
	})
	
	WPGMZA.ProInfoWindow.prototype.getSelectedStyle = function()
	{
		var globalTypeSetting = WPGMZA.settings.wpgmza_iw_type;
		var localTypeSetting = this.mapObject.map.settings.wpgmza_iw_type;
		var type = localTypeSetting;
		
		if(localTypeSetting == WPGMZA.ProInfoWindow.STYLE_INHERIT ||
			typeof localTypeSetting == "undefined")
		{
			type = globalTypeSetting;
			
			if(type == WPGMZA.ProInfoWindow.STYLE_INHERIT)
				return WPGMZA.ProInfoWindow.STYLE_NATIVE_GOOGLE;
		}
			
		if(!type)
			return WPGMZA.ProInfoWindow.STYLE_NATIVE_GOOGLE;
			
		return String(type);
	}
	
	WPGMZA.ProInfoWindow.prototype.legacyCreateDefaultInfoWindow = function(map)
	{
		var marker = this.mapObject;
		var map = marker.map;
		
		function empty(field)
		{
			return !(field && field.length && field.length > 0);
		}
		
		var container = $("<div class='wpgmza_markerbox scrollFix'></div>");
		
		if(this.maxWidth)
			container.css({"max-width": this.maxWidth});
		
		if(!empty(marker.pic))
		{
			var img = $("<img/>");
			
			img.addClass("wpgmza_infowindow_image");
			img.attr("src", marker.pic);
			img.css({"float": "right"});
			
			if(this.maxWidth)
				img.css({"max-width": this.maxWidth});
			
			if(this.enableImageResizing && this.imageWidth)
			{
				img.css({"width": this.imageWidth});
				img.css({"height": this.imageHeight});
			}
			
			if(!this.enableImageResizing)
				img.css({"margin": "5px"});
			
			container.append(img);
		}
		
		if(!empty(marker.title))
		{
			var p = $("<p class='wpgmza_infowindow_title'></p>");
			
			p.text(marker.title);
			
			container.append(p);
		}
		
		if(!empty(marker.address) && this.showAddress)
		{
			var p = $("<p class='wpgmza_infowindow_address'></p>");
			
			p.text(marker.address);
			
			container.append(p);
		}
		
		if(!empty(marker.desc))
		{
			var div = $("<div class='wpgmza_infowindow_description'></div>");
			
			div.html(marker.desc);
			
			container.append(div);
		}
		
		if(!empty(marker.linkd) || !empty(marker.link))
		{
			var link = empty(marker.link) ? marker.linkd : marker.link;
			var p = $("<p class='wpgmza_infowindow_link'></p>");
			var a = $("<a class='wpgmza_infowindow_link'></a>");
			
			a.attr("href", WPGMZA.decodeEntities(link));
			a.attr("target", this.linkTarget);
			a.text(this.linkText);
			
			p.append(a);
			container.append(p);
		}
		
		if(map.directionsEnabled)
		{
			var p = $("<p></p>");
			var a = $("<a class='wpgmza_gd'></a>");
			
			a.attr("href", "javascript: ;");
			a.attr("id", map.id);
			
			a.attr("data-address", marker.address);
			a.attr("data-latlng", marker.getPosition().toString());
			
			// Legacy fields
			a.attr("wpgm_addr_field", marker.address);
			a.attr("gps", marker.lat+","+marker.lng);
			
			a.text(this.directionsText);
			
			p.append(a);
			container.append(p);
		}
		
		var filteringParameters = map.markerFilter.getFilteringParameters();
		if(filteringParameters.center)
		{
			var distanceInKM = WPGMZA.Distance.between(
				filteringParameters.center, 
				marker.getPosition()
			);
			
			var distanceToDisplay = distanceInKM;
			
			if(this.distanceUnits == WPGMZA.Distance.MILES)
				distanceToDisplay /= WPGMZA.Distance.KILOMETERS_PER_MILE;
			
			var text = Math.round(distanceToDisplay, 2) + " ";
			
			if(this.distanceUnits == WPGMZA.Distance.MILES)
				text += WPGMZA.localized_strings.miles_away;
			else
				text += WPGMZA.localized_strings.kilometers_away;
			
			var p = $("<p></p>");
			p.text(text);
			
			container.append(p);
		}
		
		if(marker.custom_fields_html)
			container.append(marker.custom_fields_html);
		
		this.setContent(container.html());
	}
	
	WPGMZA.ProInfoWindow.prototype.legacyCreateModernInfoWindow = function(map)
	{
		// Legacy code
		var mapid = map.id;
		
		if($("#wpgmza_iw_holder_" + map.id).length == 0)
			$(document.body).append("<div id='wpgmza_iw_holder_" + map.id + "'></div>");
		else
			return;
		
		var legend = document.getElementById('wpgmza_iw_holder_' + mapid);
		if (legend !== null)
			$(legend).remove();

		wpgmza_iw_Div[mapid] = document.createElement('div');
		wpgmza_iw_Div[mapid].id = 'wpgmza_iw_holder_' + mapid;
		wpgmza_iw_Div[mapid].style = 'display:block;';
		document.getElementsByTagName('body')[0].appendChild(wpgmza_iw_Div[mapid]);

		wpgmza_iw_Div_inner = document.createElement('div');
		wpgmza_iw_Div_inner.className = 'wpgmza_modern_infowindow_inner wpgmza_modern_infowindow_inner_' + mapid;
		wpgmza_iw_Div[mapid].appendChild(wpgmza_iw_Div_inner);

		wpgmza_iw_Div_close = document.createElement('div');
		wpgmza_iw_Div_close.className = 'wpgmza_modern_infowindow_close';
		wpgmza_iw_Div_close.setAttribute('mid', mapid);

		var t = document.createTextNode("x");
		wpgmza_iw_Div_close.appendChild(t);
		wpgmza_iw_Div_inner.appendChild(wpgmza_iw_Div_close);

		wpgmza_iw_Div_img = document.createElement('div');
		wpgmza_iw_Div_img.className = 'wpgmza_iw_image';
		wpgmza_iw_Div_inner.appendChild(wpgmza_iw_Div_img);

		wpgmza_iw_img = document.createElement('img');
		wpgmza_iw_img.className = 'wpgmza_iw_marker_image';
		wpgmza_iw_img.src = '';
		wpgmza_iw_img.style = 'max-width:100%;';
		wpgmza_iw_Div_img.appendChild(wpgmza_iw_img);

		wpgmza_iw_img_div = document.createElement('div');
		wpgmza_iw_img_div.className = 'wpgmza_iw_title';
		wpgmza_iw_Div_inner.appendChild(wpgmza_iw_img_div);

		wpgmza_iw_img_div_p = document.createElement('p');
		wpgmza_iw_img_div_p.className = 'wpgmza_iw_title_p';
		wpgmza_iw_img_div.appendChild(wpgmza_iw_img_div_p);

		wpgmza_iw_address_div = document.createElement('div');
		wpgmza_iw_address_div.className = 'wpgmza_iw_address';
		wpgmza_iw_Div_inner.appendChild(wpgmza_iw_address_div);

		wpgmza_iw_address_p = document.createElement('p');
		wpgmza_iw_address_p.className = 'wpgmza_iw_address_p';
		wpgmza_iw_address_div.appendChild(wpgmza_iw_address_p);

		wpgmza_iw_description = document.createElement('div');
		wpgmza_iw_description.className = 'wpgmza_iw_description';
		wpgmza_iw_Div_inner.appendChild(wpgmza_iw_description);

		wpgmza_iw_description_p = document.createElement('p');
		wpgmza_iw_description_p.className = 'wpgmza_iw_description_p';
		wpgmza_iw_description.appendChild(wpgmza_iw_description_p);

		wpgmza_iw_buttons = document.createElement('div');
		wpgmza_iw_buttons.className = 'wpgmza_iw_buttons';
		wpgmza_iw_Div_inner.appendChild(wpgmza_iw_buttons);

		wpgmza_directions_button = document.createElement('a');
		wpgmza_directions_button.className = 'wpgmza_button wpgmza_left wpgmza_directions_button';
		wpgmza_directions_button.src = '#';
		
		var t = document.createTextNode(wpgmaps_lang_directions);
		wpgmza_directions_button.appendChild(t);
		wpgmza_iw_buttons.appendChild(wpgmza_directions_button);

		wpgmza_more_info_button = document.createElement('a');
		wpgmza_more_info_button.className = 'wpgmza_button wpgmza_right wpgmza_more_info_button';
		wpgmza_more_info_button.src = '#';
		
		var t = document.createTextNode(wpgmaps_lang_more_info);
		wpgmza_more_info_button.appendChild(t);
		wpgmza_iw_buttons.appendChild(wpgmza_more_info_button);

		var legend = document.getElementById('wpgmza_iw_holder_' + mapid);
		$(legend).css('display', 'block');
		$(legend).addClass('wpgmza_modern_infowindow');
		$(legend).addClass('wpgmza-shadow');

		if (WPGMZA.settings.engine == "google-maps")
			MYMAP[mapid].map.googleMap.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend);
		else {
			var container = $(".wpgmza-ol-modern-infowindow-container[data-map-id='" + mapid + "']");
			if (!container.length) {
				container = $("<div class='wpgmza-ol-modern-infowindow-container' data-map-id='" + mapid + "'></div>");
				$(".wpgmza_map[data-map-id='" + mapid + "']").append(container);
			}

			container.append(legend);
		}

	}
	
	WPGMZA.ProInfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		
		// Legacy support
		if(window.infoWindow)
			infoWindow[mapObject.map.id] = this;
		
		if(!WPGMZA.InfoWindow.prototype.open.call(this, map, mapObject))
			return false;	// Parent class has detected that the window shouldn't open
		
		if(this.mapObject == map.userLocationMarker)
			return true;	// Allow the default style window to open for user location markers
		
		if(map.settings.list_markers_by == WPGMZA.MarkerListing.STYLE_MODERN)
			return false;	// Don't show if modern style marker listing is selected
		
		if(WPGMZA.settings.wpgmza_settings_disable_infowindows)
			return false;	// Global setting "disable infowindows" is set
		
		// Legacy support
		if(this.style == WPGMZA.ProInfoWindow.STYLE_NATIVE_GOOGLE || WPGMZA.currentPage == "map-edit")
		{
			this.legacyCreateDefaultInfoWindow();
			return true;	// Always show default style when on map edit page
		}
		
		var marker_data;
		var data = wpgmaps_localize_marker_data[map.id];
		var marker = mapObject;
		
		if(typeof data == "array")
			for(var i = 0; i < data.length; i++)
			{
				if(data[i].marker_id == mapObject.id)
				{
					marker_data = data[i];
					
					break;
				}
			}
		else if(typeof data == "object")
			for(var key in data)
			{
				if(data[key].marker_id == mapObject.id)
				{
					marker_data = data[key];
					
					break;
				}
			}
		
		if(!marker_data)
		{
			console.warn("Failed to find marker data for marker " + mapObject.id);
			return false;
		}
		
		this.legacyCreateModernInfoWindow(map);
		
		modern_iw_open[map.id] = true;

		/* reset the elements */
		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_marker_image").attr("src",""); 
		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_title").html(""); 
		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_description").html(""); 
		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_address_p").html(""); 


		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_more_info_button").attr("href","#"); 
		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_more_info_button").attr("target",""); 
		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").attr("gps",""); 
		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").attr("href","#"); 
		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").attr("id",""); 
		jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").attr("wpgm_addr_field",""); 

		
		
		if (marker_data.image === "" && marker_data.title === "") {  
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_image").css("display","none"); 
		} else {
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_image").css("display","block"); 
		}


		if (marker_data.pic.length) { 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_marker_image").css("display","block"); 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_marker_image").attr("src",marker_data.pic); 
			// Removed !important; to allow customisation
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_title").css({"position": "absolute"});
			if (marker_data.title !== "") { jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_title").html(marker_data.title); }

		} else {
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_marker_image").css("display","none"); 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_title").attr("style","position: relative !important"); 
			if (marker_data.title !== "") { jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_title").html(marker_data.title); }
		}

		if (marker_data.desc !== "") { 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_description").css("display","block"); 
			if (typeof marker_data.desc !== "undefined" && marker_data.desc !== "") { jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_description").html(marker_data.desc); }
		} else {
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_description").css("display","none"); 

		}

		
		if (typeof wpgmaps_localize_global_settings['wpgmza_settings_infowindow_address'] !== 'undefined' && wpgmaps_localize_global_settings['wpgmza_settings_infowindow_address'] === "yes") {
		} else {
			if (typeof marker_data.address !== "undefined" && marker_data.address !== "") { jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_iw_address_p").html(marker_data.address); }
		}
		

		if (typeof marker_data.linkd !== "undefined" && marker_data.linkd !== "") { 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_more_info_button").show();
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_more_info_button").attr("href",marker_data.linkd);
			
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_more_info_button").attr("target",this.linkTarget); 
		} else {
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_more_info_button").hide();
		}
		if (map.directionsEnabled) { 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").show();
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").attr("href","javascript:void(0);"); 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").attr("gps",marker_data.lat + "," + marker_data.lng); 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").attr("wpgm_addr_field",marker_data.address); 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").attr("id",map.id); 
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").addClass("wpgmza_gd"); 

		} else {
			jQuery("#wpgmza_iw_holder_"+map.id+" .wpgmza_directions_button").hide();
		}

		return true;
	}
	
	// TODO: This doesn't appear to do anything, nor does it call the parent method
	WPGMZA.ProInfoWindow.prototype.close = function()
	{
		$(this.mapObject.map.element).find(".wpgmza-pro-info-window-container").html();
	}
	
	// TODO: This should be taken care of already in core.js
	$(document).ready(function(event) {
		$(document.body).on("click", ".wpgmza-close-info-window", function(event) {
			$(event.target).closest(".wpgmza-info-window").remove();
		});
	});
	
});

// js/v8/google-maps/google-info-window.js
/**
 * @namespace WPGMZA
 * @module GoogleInfoWindow
 * @requires WPGMZA.InfoWindow
 * @pro-requires WPGMZA.ProInfoWindow
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.GoogleInfoWindow = function(mapObject)
	{
		Parent.call(this, mapObject);
		
		this.setMapObject(mapObject);
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProInfoWindow;
	else
		Parent = WPGMZA.InfoWindow;
	
	WPGMZA.GoogleInfoWindow.prototype = Object.create(Parent.prototype);
	WPGMZA.GoogleInfoWindow.prototype.constructor = WPGMZA.GoogleInfoWindow;
	
	WPGMZA.GoogleInfoWindow.prototype.setMapObject = function(mapObject)
	{
		if(mapObject instanceof WPGMZA.Marker)
			this.googleObject = mapObject.googleMarker;
		else if(mapObject instanceof WPGMZA.Polygon)
			this.googleObject = mapObject.googlePolygon;
		else if(mapObject instanceof WPGMZA.Polyline)
			this.googleObject = mapObject.googlePolyline;
	}
	
	WPGMZA.GoogleInfoWindow.prototype.createGoogleInfoWindow = function()
	{
		var self = this;
		
		if(this.googleInfoWindow)
			return;
		
		this.googleInfoWindow = new google.maps.InfoWindow();
		google.maps.event.addListener(this.googleInfoWindow, "closeclick", function(event) {
			self.mapObject.map.trigger("infowindowclose");
		});
	}
	
	/**
	 * Opens the info window
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	WPGMZA.GoogleInfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		
		if(!Parent.prototype.open.call(this, map, mapObject))
			return false;
		
		// Set parent for events to bubble up to
		this.parent = map;
		
		this.createGoogleInfoWindow();
		this.setMapObject(mapObject);
		
		this.googleInfoWindow.open(
			this.mapObject.map.googleMap,
			this.googleObject
		);
		
		var guid = WPGMZA.guid();
		var html = "<div id='" + guid + "'>" + this.content + "</div>";

		this.googleInfoWindow.setContent(html);
		
		var intervalID;
		intervalID = setInterval(function(event) {
			
			div = $("#" + guid);
			
			if(div.length)
			{
				div[0].wpgmzaMapObject = self.mapObject;
				
				self.element = div[0];
				self.trigger("infowindowopen");
				
				clearInterval(intervalID);
			}
			
		}, 50);
		
		return true;
	}
	
	WPGMZA.GoogleInfoWindow.prototype.close = function()
	{
		if(!this.googleInfoWindow)
			return;
		
		WPGMZA.InfoWindow.prototype.close.call(this);
		
		this.googleInfoWindow.close();
	}
	
	WPGMZA.GoogleInfoWindow.prototype.setContent = function(html)
	{
		Parent.prototype.setContent.call(this, html);
		
		this.content = html;
		
		this.createGoogleInfoWindow();
		
		this.googleInfoWindow.setContent(html);
	}
	
	WPGMZA.GoogleInfoWindow.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.call(this, options);
		
		this.createGoogleInfoWindow();
		
		this.googleInfoWindow.setOptions(options);
	}
	
});

// js/v8/open-layers/ol-info-window.js
/**
 * @namespace WPGMZA
 * @module OLInfoWindow
 * @requires WPGMZA.InfoWindow
 * @pro-requires WPGMZA.ProInfoWindow
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLInfoWindow = function(mapObject)
	{
		var self = this;
		
		Parent.call(this, mapObject);
		
		this.element = $("<div class='ol-info-window-container ol-info-window-plain'></div>")[0];
			
		$(this.element).on("click", ".ol-info-window-close", function(event) {
			self.close();
		});
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProInfoWindow;
	else
		Parent = WPGMZA.InfoWindow;
	
	WPGMZA.OLInfoWindow.prototype = Object.create(Parent.prototype);
	WPGMZA.OLInfoWindow.prototype.constructor = WPGMZA.OLInfoWindow;
	
	/**
	 * Opens the info window
	 * TODO: This should take a mapObject, not an event
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	WPGMZA.OLInfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		var latLng = mapObject.getPosition();
		
		if(!Parent.prototype.open.call(this, map, mapObject))
			return false;
		
		// Set parent for events to bubble up
		this.parent = map;
		
		if(this.overlay)
			this.mapObject.map.olMap.removeOverlay(this.overlay);
			
		this.overlay = new ol.Overlay({
			element: this.element
		});
		
		this.overlay.setPosition(ol.proj.fromLonLat([
			latLng.lng,
			latLng.lat
		]));
		self.mapObject.map.olMap.addOverlay(this.overlay);
		
		$(this.element).show();
		
		this.trigger("infowindowopen");
	}
	
	WPGMZA.OLInfoWindow.prototype.close = function(event)
	{
		// TODO: Why? This shouldn't have to be here. Removing the overlay should hide the element (it doesn't)
		$(this.element).hide();
		
		if(!this.overlay)
			return;
		
		WPGMZA.InfoWindow.prototype.close.call(this);
		
		this.trigger("infowindowclose");
		
		this.mapObject.map.olMap.removeOverlay(this.overlay);
		this.overlay = null;
	}
	
	WPGMZA.OLInfoWindow.prototype.setContent = function(html)
	{
		$(this.element).html("<i class='fa fa-times ol-info-window-close' aria-hidden='true'></i>" + html);
	}
	
	WPGMZA.OLInfoWindow.prototype.setOptions = function(options)
	{
		if(options.maxWidth)
		{
			$(this.element).css({"max-width": options.maxWidth + "px"});
		}
	}
	
});

// js/v8/pro-map.js
/**
 * @namespace WPGMZA
 * @module ProMap
 * @requires WPGMZA.Map
 */
jQuery(function($) {
	
	WPGMZA.ProMap = function(element, options)
	{
		var self = this;
		
		// Some objects created in the parent constructor use the category data, so load that first
		this.element = element;
		
		// Call the parent constructor
		WPGMZA.Map.call(this, element, options);
		
		this.heatmaps = [];
		
		this.initMarkerListing();
		this.initCustomFieldFilterController();
		this.initUserLocationMarker();
		
		this.on("init", function(event) {
			self.onInit(event);
		});
		
		this.on("markersplaced", function(event) {
			self.onMarkersPlaced(event);
		});
	}
	
	WPGMZA.ProMap.prototype = Object.create(WPGMZA.Map.prototype);
	WPGMZA.ProMap.prototype.constructor = WPGMZA.ProMap;
	
	Object.defineProperty(WPGMZA.ProMap.prototype, "mashupIDs", {
		
		get: function() {
			
			var result = [];
			var attr = $(this.element).attr("data-mashup-ids");
			
			if(attr && attr.length)
				result = result = attr.split(",");
			
			return result;
			
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProMap.prototype, "directionsEnabled", {
		
		get: function() {
			
			return this.settings.directions_enabled == 1;
			
		}
		
	});
	
	WPGMZA.ProMap.prototype.onInit = function(event)
	{
		this.initPreloader();
		
		if(this.shortcodeAttributes.cat)
		{
			var categories = this.shortcodeAttributes.cat.split(",");
			
			// Set filtering controls
			var select = $("select[mid='" + this.id + "'][name='wpgmza_filter_select']");
			
			for(var i = 0; i < categories.length; i++)
			{
				$("input[type='checkbox'][mid='" + this.id + "'][value='" + categories[i] + "']").prop("checked", true);
				select.val(categories[i]);
			}
			
			// Force category ID's in case no filtering controls are present
			this.markerFilter.update({
				categories: categories
			});
		}
		
		var zoom;
		if(zoom = WPGMZA.getQueryParamValue("mzoom"))
			this.setZoom(zoom);
	}
	
	WPGMZA.ProMap.prototype.onMarkersPlaced = function(event)
	{
		// Clustering
		if(window.wpgm_g_e && wpgm_g_e == 1 && this.settings.mass_marker_support == 1)
		{
			this.markerClusterer.addMarkers(this.markers);
			
			// Legacy support
			if(typeof window.markerClusterer == "array")
				window.markerClusterer[this.id] = clusterer;
		}
	}
	
	WPGMZA.ProMap.prototype.initPreloader = function()
	{
		this.preloader = $("<div class='wpgmza-preloader'/>");
		
		$(this.preloader).css({
			"background-image": "url(" + WPGMZA.defaultPreloaderImage + ")"
		});
		$(this.preloader).hide();
		
		$(this.element).append(this.preloader);
	}
	
	WPGMZA.ProMap.prototype.showPreloader = function(show)
	{
		if(show)
			$(this.preloader).show();
		else
			$(this.preloader).hide();
	}
	
	WPGMZA.ProMap.prototype.initMarkerListing = function()
	{
		// TODO: Support carousel
		var markerListingElement = $("[data-wpgmza-marker-listing][id$='_" + this.id + "']");
		
		// NB: This is commented out to allow the category filter to still function with "No marker listing". This will be rectified in the future with a unified filtering interface
		//if(markerListingElement.length)
		this.markerListing = WPGMZA.MarkerListing.createInstance(this, markerListingElement[0]);
	}
	
	WPGMZA.ProMap.prototype.initCustomFieldFilterController = function()
	{
		this.customFieldFilterController = WPGMZA.CustomFieldFilterController.createInstance(this.id);
	}
	
	WPGMZA.ProMap.prototype.initUserLocationMarker = function()
	{
		var self = this;
		
		if(this.settings.show_user_location != 1)
			return;
		
		var icon = this.settings.upload_default_ul_marker;
		var options = {
			id: WPGMZA.guid(),
			animation: WPGMZA.Marker.ANIMATION_DROP
		};
		
		if(icon && icon.length)
			options.icon = icon;
		
		var marker = this.userLocationMarker = WPGMZA.Marker.createInstance(options);
		
		WPGMZA.watchPosition(function(position) {
			
			marker.setPosition({
				lat: position.coords.latitude,
				lng: position.coords.longitude
			});
			
			if(!marker.map)
				self.addMarker(marker);
			
		});
	}
	
	WPGMZA.ProMap.prototype.getMapObjectArrays = function()
	{
		var arrays = WPGMZA.Map.prototype.getMapObjectArrays.call(this);
		
		arrays.heatmaps = this.heatmaps;
		
		return arrays;
	}
	
	/**
	 * Adds the specified heatmap to the map
	 * @return void
	 */
	WPGMZA.ProMap.prototype.addHeatmap = function(heatmap)
	{
		if(!(heatmap instanceof WPGMZA.Heatmap))
			throw new Error("Argument must be an instance of WPGMZA.Heatmap");
		
		heatmap.map = this;
		
		this.heatmaps.push(heatmap);
		this.dispatchEvent({type: "heatmapadded", heatmap: heatmap});
	}
	
	/**
	 * Gets a heatmap by ID
	 * @return void
	 */
	WPGMZA.ProMap.prototype.getHeatmapByID = function(id)
	{
		for(var i = 0; i < this.heatmaps.length; i++)
			if(this.heatmaps[i].id == id)
				return this.heatmaps[i];
			
		return null;
	}
	
	/**
	 * Removes the specified heatmap and fires an event
	 * @return void
	 */
	WPGMZA.ProMap.prototype.removeHeatmap = function(heatmap)
	{
		if(!(heatmap instanceof WPGMZA.Heatmap))
			throw new Error("Argument must be an instance of WPGMZA.Heatmap");
		
		if(heatmap.map != this)
			throw new Error("Wrong map error");
		
		heatmap.map = null;
		
		// TODO: This shoud not be here in the generic class
		heatmap.googleHeatmap.setMap(null);
		
		this.heatmaps.splice(this.heatmaps.indexOf(heatmap), 1);
		this.dispatchEvent({type: "heatmapremoved", heatmap: heatmap});
	}
	
	/**
	 * Removes the specified heatmap and fires an event
	 * @return void
	 */
	WPGMZA.ProMap.prototype.removeHeatmapByID = function(id)
	{
		var heatmap = this.getHeatmapByID(id);
		
		if(!heatmap)
			return;
		
		this.removeHeatmap(heatmap);
	}
	
	WPGMZA.ProMap.prototype.getInfoWindowStyle = function()
	{
		if(!this.settings.other_settings)
			return WPGMZA.ProInfoWindow.STYLE_NATIVE_GOOGLE;
		
		var local = this.settings.other_settings.wpgmza_iw_type;
		var global = WPGMZA.settings.wpgmza_iw_type;
		
		if(local == "-1" && global == "-1")
			return WPGMZA.ProInfoWindow.STYLE_NATIVE_GOOGLE;
		
		if(local == "-1")
			return global;
		
		if(local)
			return local;
		
		return WPGMZA.ProInfoWindow.STYLE_NATIVE_GOOGLE;
	}
	
});

// js/v8/google-maps/google-map.js
/**
 * @namespace WPGMZA
 * @module GoogleMap
 * @requires WPGMZA.Map
 * @pro-requires WPGMZA.ProMap
 */
jQuery(function($) {
	var Parent;
	
	/**
	 * Constructor
	 * @param element to contain the map
	 */
	WPGMZA.GoogleMap = function(element, options)
	{
		var self = this;
		
		Parent.call(this, element, options);
		
		if(!window.google)
		{
			var status = WPGMZA.googleAPIStatus;
			var message = "Google API not loaded";
			
			if(status && status.message)
				message += " - " + status.message;
			
			if(status.code == "USER_CONSENT_NOT_GIVEN")
			{
				return;
			}
			
			$(element).html("<div class='notice notice-error'><p>" + WPGMZA.localized_strings.google_api_not_loaded + "<pre>" + message + "</pre></p></div>");
			
			throw new Error(message);
		}
		
		this.loadGoogleMap();
		
		if(options)
			this.setOptions(options);

		google.maps.event.addListener(this.googleMap, "click", function(event) {
			var wpgmzaEvent = new WPGMZA.Event("click");
			wpgmzaEvent.latLng = {
				lat: event.latLng.lat(),
				lng: event.latLng.lng()
			};
			self.dispatchEvent(wpgmzaEvent);
		});
		
		google.maps.event.addListener(this.googleMap, "rightclick", function(event) {
			var wpgmzaEvent = new WPGMZA.Event("rightclick");
			wpgmzaEvent.latLng = {
				lat: event.latLng.lat(),
				lng: event.latLng.lng()
			};
			self.dispatchEvent(wpgmzaEvent);
		});
		
		google.maps.event.addListener(this.googleMap, "dragend", function(event) {
			self.dispatchEvent("dragend");
		});
		
		google.maps.event.addListener(this.googleMap, "zoom_changed", function(event) {
			self.dispatchEvent("zoom_changed");
			self.dispatchEvent("zoomchanged");
		});
		
		// Idle event
		google.maps.event.addListener(this.googleMap, "idle", function(event) {
			self.onIdle(event);
		});
		
		// Dispatch event
		if(!WPGMZA.isProVersion())
		{
			this.trigger("init");
			
			this.dispatchEvent("created");
			WPGMZA.events.dispatchEvent({type: "mapcreated", map: this});
		}
	}
	
	// If we're running the Pro version, inherit from ProMap, otherwise, inherit from Map
	if(WPGMZA.isProVersion())
	{
		Parent = WPGMZA.ProMap;
		WPGMZA.GoogleMap.prototype = Object.create(WPGMZA.ProMap.prototype);
	}
	else
	{
		Parent = WPGMZA.Map;
		WPGMZA.GoogleMap.prototype = Object.create(WPGMZA.Map.prototype);
	}
	WPGMZA.GoogleMap.prototype.constructor = WPGMZA.GoogleMap;
	
	/**
	 * Creates the Google Maps map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.loadGoogleMap = function()
	{
		var self = this;
		var options = this.settings.toGoogleMapsOptions();
		
		this.googleMap = new google.maps.Map(this.engineElement, options);
		
		google.maps.event.addListener(this.googleMap, "bounds_changed", function() { 
			self.onBoundsChanged();
		});
		
		if(this.settings.bicycle == 1)
			this.enableBicycleLayer(true);
		if(this.settings.traffic == 1)
			this.enableTrafficLayer(true);
		if(this.settings.transport == 1)
			this.enablePublicTransportLayer(true);
		this.showPointsOfInterest(this.settings.show_point_of_interest);
		
		// Move the loading wheel into the map element (it has to live outside in the HTML file because it'll be overwritten by Google otherwise)
		$(this.engineElement).append($(this.element).find(".wpgmza-loader"));
	}
	
	WPGMZA.GoogleMap.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.call(this, options);
		
		var converted = $.extend(options, this.settings.toGoogleMapsOptions());
		
		//this.googleMap.setOptions(converted);
		
		var clone = $.extend({}, converted);
		if(!clone.center instanceof google.maps.LatLng && (clone.center instanceof WPGMZA.LatLng || typeof clone.center == "object"))
			clone.center = {
				lat: parseFloat(clone.center.lat),
				lng: parseFloat(clone.center.lng)
			};
		
		if(this.settings.hide_point_of_interest == "1")
		{
			var noPoi = {
				featureType: "poi",
				elementType: "labels",
				stylers: [
					{
						visibility: "off"
					}
				]
			};
			
			if(!clone.styles)
				clone.styles = [];
			
			clone.styles.push(noPoi);
		}
		
		this.googleMap.setOptions(clone);
	}
	
	/**
	 * Adds the specified marker to this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.addMarker = function(marker)
	{
		marker.googleMarker.setMap(this.googleMap);
		
		Parent.prototype.addMarker.call(this, marker);
	}
	
	/**
	 * Removes the specified marker from this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.removeMarker = function(marker)
	{
		marker.googleMarker.setMap(null);
		
		Parent.prototype.removeMarker.call(this, marker);
	}
	
	/**
	 * Adds the specified polygon to this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.addPolygon = function(polygon)
	{
		polygon.googlePolygon.setMap(this.googleMap);
		
		Parent.prototype.addPolygon.call(this, polygon);
	}
	
	/**
	 * Removes the specified polygon from this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.removePolygon = function(polygon)
	{
		polygon.googlePolygon.setMap(null);
		
		Parent.prototype.removePolygon.call(this, polygon);
	}
	
	/**
	 * Adds the specified polyline to this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.addPolyline = function(polyline)
	{
		polyline.googlePolyline.setMap(this.googleMap);
		
		Parent.prototype.addPolyline.call(this, polyline);
	}
	
	/**
	 * Removes the specified polygon from this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.removePolyline = function(polyline)
	{
		polyline.googlePolyline.setMap(null);
		
		Parent.prototype.removePolyline.call(this, polyline);
	}
	
	WPGMZA.GoogleMap.prototype.addCircle = function(circle)
	{
		circle.googleCircle.setMap(this.googleMap);
		
		Parent.prototype.addCircle.call(this, circle);
	}
	
	WPGMZA.GoogleMap.prototype.removeCircle = function(circle)
	{
		circle.googleCircle.setMap(null);
		
		Parent.prototype.removeCircle.call(this, circle);
	}
	
	/**
	 * Delegate for google maps getCenter
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.getCenter = function()
	{
		var latLng = this.googleMap.getCenter();
		
		return {
			lat: latLng.lat(),
			lng: latLng.lng()
		};
	}
	
	/**
	 * Delegate for google maps setCenter
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.setCenter = function(latLng)
	{
		WPGMZA.Map.prototype.setCenter.call(this, latLng);
		
		if(latLng instanceof WPGMZA.LatLng)
			this.googleMap.setCenter({
				lat: latLng.lat,
				lng: latLng.lng
			});
		else
			this.googleMap.setCenter(latLng);
	}
	
	/**
	 * Delegate for google maps setPan
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.panTo = function(latLng)
	{
		if(latLng instanceof WPGMZA.LatLng)
			this.googleMap.panTo({
				lat: latLng.lat,
				lng: latLng.lng
			});
		else
			this.googleMap.panTo(latLng);
	}
	
	/**
	 * Delegate for google maps getCenter
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.getZoom = function()
	{
		return this.googleMap.getZoom();
	}
	
	/**
	 * Delegate for google maps getZoom
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.setZoom = function(value)
	{
		if(isNaN(value))
			throw new Error("Value must not be NaN");
		
		return this.googleMap.setZoom(parseInt(value));
	}
	
	/**
	 * Gets the bounds
	 * @return object
	 */
	WPGMZA.GoogleMap.prototype.getBounds = function()
	{
		var bounds = this.googleMap.getBounds();
		var northEast = bounds.getNorthEast();
		var southWest = bounds.getSouthWest();
		
		var nativeBounds = new WPGMZA.LatLngBounds({});
		
		nativeBounds.north = northEast.lat();
		nativeBounds.south = southWest.lat();
		nativeBounds.west = southWest.lng();
		nativeBounds.east = northEast.lng();
		
		// Backward compatibility
		nativeBounds.topLeft = {
			lat: northEast.lat(),
			lng: southWest.lng()
		};
		
		nativeBounds.bottomRight = {
			lat: southWest.lat(),
			lng: northEast.lng()
		};
		
		return nativeBounds;
	}
	
	/**
	 * Fit to given boundaries
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.fitBounds = function(southWest, northEast)
	{
		if(southWest instanceof WPGMZA.LatLng)
			southWest = {lat: southWest.lat, lng: southWest.lng};
		if(northEast instanceof WPGMZA.LatLng)
			northEast = {lat: northEast.lat, lng: northEast.lng};
		else if(southWest instanceof WPGMZA.LatLngBounds)
		{
			var bounds = southWest;
			
			southWest = {
				lat: bounds.south,
				lng: bounds.west
			};
			
			northEast = {
				lat: bounds.north,
				lng: bounds.east
			};
		}
		
		var nativeBounds = new google.maps.LatLngBounds(southWest, northEast);
		this.googleMap.fitBounds(nativeBounds);
	}
	
	/**
	 * Fit the map boundaries to visible markers
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.fitBoundsToVisibleMarkers = function()
	{
		var bounds = new google.maps.LatLngBounds();
		for(var i = 0; i < this.markers.length; i++)
		{
			if(markers[i].getVisible())
				bounds.extend(markers[i].getPosition());
		}
		this.googleMap.fitBounds(bounds);
	}
	
	/**
	 * Enables / disables the bicycle layer
	 * @param enable boolean, enable or not
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.enableBicycleLayer = function(enable)
	{
		if(!this.bicycleLayer)
			this.bicycleLayer = new google.maps.BicyclingLayer();
		
		this.bicycleLayer.setMap(
			enable ? this.googleMap : null
		);
	}
	
	/**
	 * Enables / disables the bicycle layer
	 * @param enable boolean, enable or not
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.enableTrafficLayer = function(enable)
	{
		if(!this.trafficLayer)
			this.trafficLayer = new google.maps.TrafficLayer();
		
		this.trafficLayer.setMap(
			enable ? this.googleMap : null
		);
	}
	
	/**
	 * Enables / disables the bicycle layer
	 * @param enable boolean, enable or not
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.enablePublicTransportLayer = function(enable)
	{
		if(!this.publicTransportLayer)
			this.publicTransportLayer = new google.maps.TransitLayer();
		
		this.publicTransportLayer.setMap(
			enable ? this.googleMap : null
		);
	}
	
	/**
	 * Shows / hides points of interest
	 * @param show boolean, enable or not
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.showPointsOfInterest = function(show)
	{
		// TODO: This will bug the front end because there is textarea with theme data
		var text = $("textarea[name='theme_data']").val();
		
		if(!text)
			return;
		
		var styles = JSON.parse(text);
		
		styles.push({
			featureType: "poi",
			stylers: [
				{
					visibility: (show ? "on" : "off")
				}
			]
		});
		
		this.googleMap.setOptions({styles: styles});
	}
	
	/**
	 * Gets the min zoom of the map
	 * @return int
	 */
	WPGMZA.GoogleMap.prototype.getMinZoom = function()
	{
		return parseInt(this.settings.min_zoom);
	}
	
	/**
	 * Sets the min zoom of the map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.setMinZoom = function(value)
	{
		this.googleMap.setOptions({
			minZoom: value,
			maxZoom: this.getMaxZoom()
		});
	}
	
	/**
	 * Gets the min zoom of the map
	 * @return int
	 */
	WPGMZA.GoogleMap.prototype.getMaxZoom = function()
	{
		return parseInt(this.settings.max_zoom);
	}
	
	/**
	 * Sets the min zoom of the map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.setMaxZoom = function(value)
	{
		this.googleMap.setOptions({
			minZoom: this.getMinZoom(),
			maxZoom: value
		});
	}
	
	WPGMZA.GoogleMap.prototype.latLngToPixels = function(latLng)
	{
		var map = this.googleMap;
		var nativeLatLng = new google.maps.LatLng({
			lat: parseFloat(latLng.lat),
			lng: parseFloat(latLng.lng)
		});
		var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
		var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
		var scale = Math.pow(2, map.getZoom());
		var worldPoint = map.getProjection().fromLatLngToPoint(nativeLatLng);
		return {
			x: (worldPoint.x - bottomLeft.x) * scale, 
			y: (worldPoint.y - topRight.y) * scale
		};
	}
	
	WPGMZA.GoogleMap.prototype.pixelsToLatLng = function(x, y)
	{
		if(y == undefined)
		{
			if("x" in x && "y" in x)
			{
				y = x.y;
				x = x.x;
			}
			else
				console.warn("Y coordinate undefined in pixelsToLatLng (did you mean to pass 2 arguments?)");
		}
		
		var map = this.googleMap;
		var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
		var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
		var scale = Math.pow(2, map.getZoom());
		var worldPoint = new google.maps.Point(x / scale + bottomLeft.x, y / scale + topRight.y);
		var latLng = map.getProjection().fromPointToLatLng(worldPoint);
		return {
			lat: latLng.lat(),
			lng: latLng.lng()
		};
	}
	
	/**
	 * Handle the map element resizing
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.onElementResized = function(event)
	{
		if(!this.googleMap)
			return;
		google.maps.event.trigger(this.googleMap, "resize");
	}
	
});

// js/v8/open-layers/ol-map.js
/**
 * @namespace WPGMZA
 * @module OLMap
 * @requires WPGMZA.Map
 * @pro-requires WPGMZA.ProMap
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLMap = function(element, options)
	{
		var self = this;
		
		Parent.call(this, element);
		
		this.setOptions(options);
		
		var viewOptions = this.settings.toOLViewOptions();
		
		$(this.element).html("");
		
		this.olMap = new ol.Map({
			target: $(element)[0],
			layers: [
				this.getTileLayer()
			],
			view: new ol.View(viewOptions)
		});
		
		// TODO: Re-implement using correct setting names
		// Interactions
		this.olMap.getInteractions().forEach(function(interaction) {
			
			// NB: The true and false values are flipped because these settings represent the "disabled" state when true
			if(interaction instanceof ol.interaction.DragPan)
				interaction.setActive( (self.settings.wpgmza_settings_map_draggable == "yes" ? false : true) );
			else if(interaction instanceof ol.interaction.DoubleClickZoom)
				interaction.setActive( (self.settings.wpgmza_settings_map_clickzoom ? false : true) );
			else if(interaction instanceof ol.interaction.MouseWheelZoom)
				interaction.setActive( (self.settings.wpgmza_settings_map_scroll == "yes" ? false : true) );
			
		}, this);
		
		// Controls
		this.olMap.getControls().forEach(function(control) {
			
			// NB: The true and false values are flipped because these settings represent the "disabled" state when true
			if(control instanceof ol.control.Zoom && WPGMZA.settings.wpgmza_settings_map_zoom == "yes")
				self.olMap.removeControl(control);
			
		}, this);
		
		if(WPGMZA.settings.wpgmza_settings_map_full_screen_control != "yes")
			this.olMap.addControl(new ol.control.FullScreen());
		
		// Marker layer
		this.markerLayer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: []
			})
		});
		this.olMap.addLayer(this.markerLayer);
		
		// Listen for drag start
		this.olMap.on("movestart", function(event) {
			self.isBeingDragged = true;
		});
		
		// Listen for end of pan so we can wrap longitude if needs be
		this.olMap.on("moveend", function(event) {
			self.wrapLongitude();
			
			self.isBeingDragged = false;
			self.dispatchEvent("dragend");
			self.onIdle();
		});
		
		// Listen for zoom
		this.olMap.getView().on("change:resolution", function(event) {
			self.dispatchEvent("zoom_changed");
			self.dispatchEvent("zoomchanged");
			setTimeout(function() {
				self.onIdle();
			}, 10);
		});
		
		// Listen for bounds changing
		this.olMap.getView().on("change", function() {
			// Wrap longitude
			self.onBoundsChanged();
		});
		self.onBoundsChanged();
		
		// Store locator center
		var marker;
		if(this.storeLocator && (marker = this.storeLocator.centerPointMarker))
		{
			this.olMap.addOverlay(marker.overlay);
			marker.setVisible(false);
		}
		
		// Right click listener
		$(this.element).on("click contextmenu", function(event) {
			
			var isRight;
			event = event || window.event;
			
			var latLng = self.pixelsToLatLng(event.offsetX, event.offsetY);
			
			if("which" in event)
				isRight = event.which == 3;
			else if("button" in event)
				isRight = event.button == 2;
			
			if(event.which == 1 || event.button == 1)
			{
				if(self.isBeingDragged)
					return;
				
				// Left click
				self.trigger({
					type: "click",
					latLng: latLng
				});
				
				return;
			}
			
			if(!isRight)
				return;
			
			return self.onRightClick(event);
		});
		
		// Dispatch event
		if(!WPGMZA.isProVersion())
		{
			this.trigger("init");
			
			this.dispatchEvent("created");
			WPGMZA.events.dispatchEvent({type: "mapcreated", map: this});
		}
	}

	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMap;
	else
		Parent = WPGMZA.Map;
	
	WPGMZA.OLMap.prototype = Object.create(Parent.prototype);
	WPGMZA.OLMap.prototype.constructor = WPGMZA.OLMap;
	
	WPGMZA.OLMap.prototype.getTileLayer = function()
	{
		var options = {};
		
		if(WPGMZA.settings.tile_server_url)
			options.url = WPGMZA.settings.tile_server_url;
		
		return new ol.layer.Tile({
			source: new ol.source.OSM(options)
		});
	}
	
	WPGMZA.OLMap.prototype.wrapLongitude = function()
	{
		var center = this.getCenter();
		
		if(center.lng >= -180 && center.lng <= 180)
			return;
		
		center.lng = center.lng - 360 * Math.floor(center.lng / 360);
		
		if(center.lng > 180)
			center.lng -= 360;
		
		this.setCenter(center);
	}
	
	WPGMZA.OLMap.prototype.getCenter = function()
	{
		var lonLat = ol.proj.toLonLat(
			this.olMap.getView().getCenter()
		);
		return {
			lat: lonLat[1],
			lng: lonLat[0]
		};
	}
	
	WPGMZA.OLMap.prototype.setCenter = function(latLng)
	{
		var view = this.olMap.getView();
		
		WPGMZA.Map.prototype.setCenter.call(this, latLng);
		
		view.setCenter(ol.proj.fromLonLat([
			latLng.lng,
			latLng.lat
		]));
		
		this.wrapLongitude();

		this.onBoundsChanged();
	}
	
	WPGMZA.OLMap.prototype.getBounds = function()
	{
		var bounds = this.olMap.getView().calculateExtent(this.olMap.getSize());
		var nativeBounds = new WPGMZA.LatLngBounds();
		
		var topLeft = ol.proj.toLonLat([bounds[0], bounds[1]]);
		var bottomRight = ol.proj.toLonLat([bounds[2], bounds[3]]);
		
		nativeBounds.north = topLeft[1];
		nativeBounds.south = bottomRight[1];
		
		nativeBounds.west = topLeft[0];
		nativeBounds.east = bottomRight[0];
		
		return nativeBounds;
		
		/*return 
		
		return {
			topLeft: {
				lat: topLeft[1],
				lng: topLeft[0]
			},
			bottomRight: {
				lat: bottomRight[1],
				lng: bottomRight[0]
			}
		};*/
	}
	
	/**
	 * Fit to given boundaries
	 * @return void
	 */
	WPGMZA.OLMap.prototype.fitBounds = function(southWest, northEast)
	{
		if(southWest instanceof WPGMZA.LatLng)
			southWest = {lat: southWest.lat, lng: southWest.lng};
		if(northEast instanceof WPGMZA.LatLng)
			northEast = {lat: northEast.lat, lng: northEast.lng};
		else if(southWest instanceof WPGMZA.LatLngBounds)
		{
			var bounds = southWest;
			
			southWest = {
				lat: bounds.south,
				lng: bounds.west
			};
			
			northEast = {
				lat: bounds.north,
				lng: bounds.east
			};
		}
		
		var view = this.olMap.getView();
		
		var extent = ol.extent.boundingExtent([
			ol.proj.fromLonLat([
				parseFloat(southWest.lng),
				parseFloat(southWest.lat)
			]),
			ol.proj.fromLonLat([
				parseFloat(northEast.lng),
				parseFloat(northEast.lat)
			])
		]);
		view.fit(extent, this.olMap.getSize());
	}
	
	WPGMZA.OLMap.prototype.panTo = function(latLng, zoom)
	{
		var view = this.olMap.getView();
		var options = {
			center: ol.proj.fromLonLat([
				parseFloat(latLng.lng),
				parseFloat(latLng.lat),
			]),
			duration: 500
		};
		
		if(arguments.length > 1)
			options.zoom = parseInt(zoom);
		
		view.animate(options);
	}
	
	WPGMZA.OLMap.prototype.getZoom = function()
	{
		return Math.round( this.olMap.getView().getZoom() );
	}
	
	WPGMZA.OLMap.prototype.setZoom = function(value)
	{
		this.olMap.getView().setZoom(value);
	}
	
	WPGMZA.OLMap.prototype.getMinZoom = function()
	{
		return this.olMap.getView().getMinZoom();
	}
	
	WPGMZA.OLMap.prototype.setMinZoom = function(value)
	{
		this.olMap.getView().setMinZoom(value);
	}
	
	WPGMZA.OLMap.prototype.getMaxZoom = function()
	{
		return this.olMap.getView().getMaxZoom();
	}
	
	WPGMZA.OLMap.prototype.setMaxZoom = function(value)
	{
		this.olMap.getView().setMaxZoom(value);
	}
	
	WPGMZA.OLMap.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.call(this, options);
		
		if(!this.olMap)
			return;
		
		this.olMap.getView().setProperties( this.settings.toOLViewOptions() );
	}
	
	/**
	 * TODO: Consider moving all these functions to their respective classes, same on google map (DO IT!!! It's very misleading having them here)
	 */
	WPGMZA.OLMap.prototype.addMarker = function(marker)
	{
		this.olMap.addOverlay(marker.overlay);
		
		Parent.prototype.addMarker.call(this, marker);
	}
	
	WPGMZA.OLMap.prototype.removeMarker = function(marker)
	{
		this.olMap.removeOverlay(marker.overlay);
		
		Parent.prototype.removeMarker.call(this, marker);
	}
	
	WPGMZA.OLMap.prototype.addPolygon = function(polygon)
	{
		this.olMap.addLayer(polygon.layer);
		
		Parent.prototype.addPolygon.call(this, polygon);
	}
	
	WPGMZA.OLMap.prototype.removePolygon = function(polygon)
	{
		this.olMap.removeLayer(polygon.layer);
		
		Parent.prototype.removePolygon.call(this, polygon);
	}
	
	WPGMZA.OLMap.prototype.addPolyline = function(polyline)
	{
		this.olMap.addLayer(polyline.layer);
		
		Parent.prototype.addPolyline.call(this, polyline);
	}
	
	WPGMZA.OLMap.prototype.removePolyline = function(polyline)
	{
		this.olMap.removeLayer(polyline.layer);
		
		Parent.prototype.removePolyline.call(this, polyline);
	}
	
	WPGMZA.OLMap.prototype.addCircle = function(circle)
	{
		this.olMap.addLayer(circle.layer);
		
		Parent.prototype.addCircle.call(this, circle);
	}
	
	WPGMZA.OLMap.prototype.removeCircle = function(circle)
	{
		this.olMap.removeLayer(circle.layer);
		
		Parent.prototype.removeCircle.call(this, circle);
	}
	
	WPGMZA.OLMap.prototype.pixelsToLatLng = function(x, y)
	{
		if(y == undefined)
		{
			if("x" in x && "y" in x)
			{
				y = x.y;
				x = x.x;
			}
			else
				console.warn("Y coordinate undefined in pixelsToLatLng (did you mean to pass 2 arguments?)");
		}
		
		var coord = this.olMap.getCoordinateFromPixel([x, y]);
		
		if(!coord)
			return {
				x: null,
				y: null
			};
		
		var lonLat = ol.proj.toLonLat(coord);
		return {
			lat: lonLat[1],
			lng: lonLat[0]
		};
	}
	
	WPGMZA.OLMap.prototype.latLngToPixels = function(latLng)
	{
		var coord = ol.proj.fromLonLat([latLng.lng, latLng.lat]);
		var pixel = this.olMap.getPixelFromCoordinate(coord);
		
		if(!pixel)
			return {
				x: null,
				y: null
			};
		
		return {
			x: pixel[0],
			y: pixel[1]
		};
	}
	
	WPGMZA.OLMap.prototype.enableBicycleLayer = function(value)
	{
		if(value)
		{
			if(!this.bicycleLayer)
				this.bicycleLayer = new ol.layer.Tile({
					source: new ol.source.OSM({
						url: "http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png"
					})
				});
				
			this.olMap.addLayer(this.bicycleLayer);
		}
		else
		{
			if(!this.bicycleLayer)
				return;
			
			this.olMap.removeLayer(this.bicycleLayer);
		}
	}
	
	WPGMZA.OLMap.prototype.onElementResized = function(event)
	{
		this.olMap.updateSize();
	}
	
	WPGMZA.OLMap.prototype.onRightClick = function(event)
	{
		if($(event.target).closest(".ol-marker, .wpgmza_modern_infowindow, .wpgmza-modern-store-locator").length)
			return true;
		
		var parentOffset = $(this.element).offset();
		var relX = event.pageX - parentOffset.left;
		var relY = event.pageY - parentOffset.top;
		var latLng = this.pixelsToLatLng(relX, relY);
		
		this.trigger({type: "rightclick", latLng: latLng});
		
		// Legacy event compatibility
		$(this.element).trigger({type: "rightclick", latLng: latLng});
		
		// Prevent menu
		event.preventDefault();
		return false;
	}
	
});

// js/v8/pro-marker-filter.js
/**
 * @namespace WPGMZA
 * @module ProMarkerFilter
 * @requires WPGMZA.MarkerFilter
 */
jQuery(function($) {
	
	WPGMZA.ProMarkerFilter = function(map)
	{
		var self = this;
		
		WPGMZA.MarkerFilter.call(this, map);
	}
	
	WPGMZA.ProMarkerFilter.prototype = Object.create(WPGMZA.MarkerFilter.prototype);
	WPGMZA.ProMarkerFilter.prototype.constructor = WPGMZA.ProMarkerFilter;
	
	WPGMZA.MarkerFilter.createInstance = function(map)
	{
		return new WPGMZA.ProMarkerFilter(map);
	}
	
	WPGMZA.ProMarkerFilter.prototype.getFilteringParameters = function()
	{
		var params = WPGMZA.MarkerFilter.prototype.getFilteringParameters.call(this);
		var mashupIDs = this.map.mashupIDs;
		
		if(mashupIDs)
			params.mashupIDs = mashupIDs;
		
		if(this.map.markerListing)
			params = $.extend(params, this.map.markerListing.getFilteringParameters());
		
		if(this.map.customFieldFilterController)
		{
			var customFieldFilterAjaxParams = this.map.customFieldFilterController.getAjaxRequestData();
			var customFieldFilterFilteringParams = customFieldFilterAjaxParams.data.widgetData;
			params.customFields = customFieldFilterFilteringParams;
		}
		
		return params;
	}
	
	WPGMZA.ProMarkerFilter.prototype.update = function(params)
	{
		var self = this;
		
		if(this.updateTimeoutID)
			return;
		
		if(!params)
			params = {};
		
		if(this.xhr)
		{
			this.xhr.abort();
			delete this.xhr;
		}
		
		this.updateTimeoutID = setTimeout(function() {
			
			params = $.extend(self.getFilteringParameters(), params);
			
			if(params.center instanceof WPGMZA.LatLng)
				params.center = params.center.toLatLngLiteral();
			
			self.map.showPreloader(true);
			
			self.xhr = WPGMZA.restAPI.call("/markers/", {
				data: {
					fields: ["id"],
					filter: JSON.stringify(params),
				},
				success: function(result, status, xhr) {
					
					self.map.showPreloader(false);
					
					var event = new WPGMZA.Event("filteringcomplete");
					
					event.map = self.map;
					event.filteredMarkers = result;
					event.filteringParams = params;
					
					self.onFilteringComplete(event);
					
					self.trigger(event);
					self.map.trigger(event);
					
				}
			});
			
			delete self.updateTimeoutID;
			
		}, 0);
	}
	
	WPGMZA.ProMarkerFilter.prototype.onFilteringComplete = function(event)
	{
		var self = this;
		var map = [];
		
		event.filteredMarkers.forEach(function(data) {
			map[data.id] = true;
		});
		
		this.map.markers.forEach(function(marker) {
			
			if((self.map.storeLocator && marker == self.map.storeLocator.marker) || marker == self.map.userLocationMarker)
				return;
				
			var allowByFilter = map[marker.id];
			
			marker.isFiltered = (allowByFilter ? false : true);
			marker.setVisible(allowByFilter);
			
		});
	}
	
});

// js/v8/pro-marker.js
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

// js/v8/google-maps/google-marker.js
/**
 * @namespace WPGMZA
 * @module GoogleMarker
 * @requires WPGMZA.Marker
 * @pro-requires WPGMZA.ProMarker
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.GoogleMarker = function(row)
	{
		var self = this;
		
		Parent.call(this, row);
		
		var settings = {};
		if(row)
		{
			for(var name in row)
			{
				if(row[name] instanceof WPGMZA.LatLng)
				{
					settings[name] = row[name].toGoogleLatLng();
				}
				else if(row[name] instanceof WPGMZA.Map)
				{
					// Do nothing (ignore)
				}
				else
					settings[name] = row[name];
			}
		}
		
		this.googleMarker = new google.maps.Marker(settings);
		this.googleMarker.wpgmzaMarker = this;
		
		this.googleMarker.setPosition(new google.maps.LatLng({
			lat: parseFloat(this.lat),
			lng: parseFloat(this.lng)
		}));
			
		this.googleMarker.setLabel(this.settings.label);
		
		if(this.animation)
			this.googleMarker.setAnimation(this.animation);
			
		google.maps.event.addListener(this.googleMarker, "click", function() {
			self.dispatchEvent("click");
			self.dispatchEvent("select");
		});
		
		google.maps.event.addListener(this.googleMarker, "mouseover", function() {
			self.dispatchEvent("mouseover");
		});
		
		google.maps.event.addListener(this.googleMarker, "dragend", function() {
			var googleMarkerPosition = self.googleMarker.getPosition();
			
			self.setPosition({
				lat: googleMarkerPosition.lat(),
				lng: googleMarkerPosition.lng()
			});
			
			self.dispatchEvent({
				type: "dragend",
				latLng: self.getPosition()
			});
		});
		
		this.trigger("init");
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMarker;
	else
		Parent = WPGMZA.Marker;
	WPGMZA.GoogleMarker.prototype = Object.create(Parent.prototype);
	WPGMZA.GoogleMarker.prototype.constructor = WPGMZA.GoogleMarker;
	
	WPGMZA.GoogleMarker.prototype.setLabel = function(label)
	{
		if(!label)
		{
			this.googleMarker.setLabel(null);
			return;
		}
		
		this.googleMarker.setLabel({
			text: label
		});
		
		if(!this.googleMarker.getIcon())
			this.googleMarker.setIcon(WPGMZA.settings.default_marker_icon);
	}
	
	/**
	 * Sets the position of the marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setPosition = function(latLng)
	{
		Parent.prototype.setPosition.call(this, latLng);
		this.googleMarker.setPosition({
			lat: this.lat,
			lng: this.lng
		});
	}
	
	/**
	 * Sets the position offset of a marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.updateOffset = function()
	{
		var self = this;
		var icon = this.googleMarker.getIcon();
		var img = new Image();
		var params;
		var x = this._offset.x;
		var y = this._offset.y;
		
		if(!icon)
			icon = WPGMZA.settings.default_marker_icon;
		
		if(typeof icon == "string")
			params = {
				url: icon
			};
		else
			params = icon;
		
		img.onload = function()
		{
			var defaultAnchor = {
				x: img.width / 2,
				y: img.height
			};
			
			params.anchor = new google.maps.Point(defaultAnchor.x - x, defaultAnchor.y - y);
			
			self.googleMarker.setIcon(params);
		}
		
		img.src = params.url;
	}
	
	WPGMZA.GoogleMarker.prototype.setOptions = function(options)
	{
		this.googleMarker.setOptions(options);
	}
	
	/**
	 * Set the marker animation
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setAnimation = function(animation)
	{
		Parent.prototype.setAnimation.call(this, animation);
		this.googleMarker.setAnimation(animation);
	}
	
	/**
	 * Sets the visibility of the marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setVisible = function(visible)
	{
		Parent.prototype.setVisible.call(this, visible);
		
		this.googleMarker.setVisible(visible ? true : false);
	}
	
	WPGMZA.GoogleMarker.prototype.getVisible = function(visible)
	{
		return this.googleMarker.getVisible();
	}
	
	WPGMZA.GoogleMarker.prototype.setDraggable = function(draggable)
	{
		this.googleMarker.setDraggable(draggable);
	}
	
	WPGMZA.GoogleMarker.prototype.setOpacity = function(opacity)
	{
		this.googleMarker.setOpacity(opacity);
	}
	
});

// js/v8/open-layers/ol-marker.js
/**
 * @namespace WPGMZA
 * @module OLMarker
 * @requires WPGMZA.Marker
 * @pro-requires WPGMZA.ProMarker
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLMarker = function(row)
	{
		var self = this;
		
		Parent.call(this, row);

		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
		
		this.element = $("<div class='ol-marker'><img src='" + WPGMZA.defaultMarkerIcon + "' alt=''/></div>")[0];
		this.element.wpgmzaMarker = this;
		
		$(this.element).on("mouseover", function(event) {
			self.dispatchEvent("mouseover");
		});
		
		this.overlay = new ol.Overlay({
			element: this.element,
			position: origin,
			positioning: "bottom-center"
		});
		this.overlay.setPosition(origin);
		
		if(this.animation)
			this.setAnimation(this.animation);
		
		this.setLabel(this.settings.label);
		
		if(row)
		{
			if(row.draggable)
				this.setDraggable(true);
		}
		
		this.rebindClickListener();
		
		this.trigger("init");
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMarker;
	else
		Parent = WPGMZA.Marker;
	WPGMZA.OLMarker.prototype = Object.create(Parent.prototype);
	WPGMZA.OLMarker.prototype.constructor = WPGMZA.OLMarker;
	
	WPGMZA.OLMarker.prototype.addLabel = function()
	{
		this.setLabel(this.getLabelText());
	}
	
	WPGMZA.OLMarker.prototype.setLabel = function(label)
	{
		if(!label)
		{
			if(this.label)
				$(this.element).find(".ol-marker-label").remove();
			
			return;
		}
		
		if(!this.label)
		{
			this.label = $("<div class='ol-marker-label'/>");
			$(this.element).append(this.label);
		}
		
		this.label.html(label);
	}
	
	WPGMZA.OLMarker.prototype.getVisible = function(visible)
	{
		return this.overlay.getElement().style.display != "none";
	}
	
	WPGMZA.OLMarker.prototype.setVisible = function(visible)
	{
		Parent.prototype.setVisible.call(this, visible);
		
		this.overlay.getElement().style.display = (visible ? "block" : "none");
	}
	
	WPGMZA.OLMarker.prototype.setPosition = function(latLng)
	{
		Parent.prototype.setPosition.call(this, latLng);
		
		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
	
		this.overlay.setPosition(origin);
	}
	
	WPGMZA.OLMarker.prototype.updateOffset = function(x, y)
	{
		var x = this._offset.x;
		var y = this._offset.y;
		
		this.element.style.position = "relative";
		this.element.style.left = x + "px";
		this.element.style.top = y + "px";
	}
	
	WPGMZA.OLMarker.prototype.setAnimation = function(anim)
	{
		Parent.prototype.setAnimation.call(this, anim);
		
		switch(anim)
		{
			case WPGMZA.Marker.ANIMATION_NONE:
				$(this.element).removeAttr("data-anim");
				break;
			
			case WPGMZA.Marker.ANIMATION_BOUNCE:
				$(this.element).attr("data-anim", "bounce");
				break;
			
			case WPGMZA.Marker.ANIMATION_DROP:
				$(this.element).attr("data-anim", "drop");
				break;
		}
	}
	
	WPGMZA.OLMarker.prototype.setDraggable = function(draggable)
	{
		var self = this;
		
		if(draggable)
		{
			var options = {
				disabled: false
			};
			
			if(!this.jQueryDraggableInitialized)
			{
				options.start = function(event) {
					self.onDragStart(event);
				}
				
				options.stop = function(event) {
					self.onDragEnd(event);
				};
			}
			
			$(this.element).draggable(options);
			this.jQueryDraggableInitialized = true;
			
			this.rebindClickListener();
		}
		else
			$(this.element).draggable({disabled: true});
	}
	
	WPGMZA.OLMarker.prototype.setOpacity = function(opacity)
	{
		$(this.element).css({opacity: opacity});
	}
	
	WPGMZA.OLMarker.prototype.onDragStart = function(event)
	{
		this.isBeingDragged = true;
	}
		
	WPGMZA.OLMarker.prototype.onDragEnd = function(event)
	{
		var offset = {
			top:	parseFloat( $(this.element).css("top").match(/-?\d+/)[0] ),
			left:	parseFloat( $(this.element).css("left").match(/-?\d+/)[0] )
		};
		
		$(this.element).css({
			top: 	"0px",
			left: 	"0px"
		});
		
		var currentLatLng 		= this.getPosition();
		var pixelsBeforeDrag 	= this.map.latLngToPixels(currentLatLng);
		var pixelsAfterDrag		= {
			x: pixelsBeforeDrag.x + offset.left,
			y: pixelsBeforeDrag.y + offset.top
		};
		var latLngAfterDrag		= this.map.pixelsToLatLng(pixelsAfterDrag);
		
		this.setPosition(latLngAfterDrag);
		
		this.isBeingDragged = false;
		this.trigger({type: "dragend", latLng: latLngAfterDrag});
	}
	
	WPGMZA.OLMarker.prototype.onElementClick = function(event)
	{
		var self = event.currentTarget.wpgmzaMarker;
		
		if(self.isBeingDragged)
			return; // Don't dispatch click event after a drag
		
		self.dispatchEvent("click");
		self.dispatchEvent("select");
	}
	
	/**
	 * Binds / rebinds the click listener. This must be bound after draggable is initialized,
	 * this solves the click listener firing before dragend
	 */
	WPGMZA.OLMarker.prototype.rebindClickListener = function()
	{
		$(this.element).off("click", this.onElementClick);
		$(this.element).on("click", this.onElementClick);
	}
	
});

// js/v8/pro-polygon.js
/**
 * @namespace WPGMZA
 * @module ProPolygon
 * @requires WPGMZA.Polygon
 */
jQuery(function($) {
	
	WPGMZA.ProPolygon = function(row, googlePolygon)
	{
		WPGMZA.Polygon.call(this, row, googlePolygon);
	}
	
	WPGMZA.ProPolygon.prototype = Object.create(WPGMZA.Polygon.prototype);
	WPGMZA.ProPolygon.prototype.constructor = WPGMZA.ProPolygon;
	
	// From https://github.com/mapbox/polylabel
	
	// ISC License
	// Copyright (c) 2016 Mapbox

	// Permission to use, copy, modify, and/or distribute this software for any purpose
	// with or without fee is hereby granted, provided that the above copyright notice
	// and this permission notice appear in all copies.

	// THE SOFTWARE IS PROVIDED "AS IS" AND ISC DISCLAIMS ALL WARRANTIES WITH REGARD TO
	// THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.
	// IN NO EVENT SHALL ISC BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR
	// CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA
	// OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS
	// ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS
	// SOFTWARE.
	
	
	
	WPGMZA.ProPolygon.getLabelPosition = function(polygon, precision, debug) {
		precision = precision || 1.0;

		// find the bounding box of the outer ring
		var minX, minY, maxX, maxY;
		for (var i = 0; i < polygon[0].length; i++) {
			var p = polygon[0][i];
			if (!i || p[0] < minX) minX = p[0];
			if (!i || p[1] < minY) minY = p[1];
			if (!i || p[0] > maxX) maxX = p[0];
			if (!i || p[1] > maxY) maxY = p[1];
		}

		var width = maxX - minX;
		var height = maxY - minY;
		var cellSize = Math.min(width, height);
		var h = cellSize / 2;

		if (cellSize === 0) return [minX, minY];

		// a priority queue of cells in order of their "potential" (max distance to polygon)
		//var cellQueue = new Queue(null, compareMax);
		var cellQueue = [];

		// cover polygon with initial cells
		for (var x = minX; x < maxX; x += cellSize) {
			for (var y = minY; y < maxY; y += cellSize) {
				cellQueue.push(new Cell(x + h, y + h, h, polygon));
			}
		}

		// take centroid as the first best guess
		var bestCell = getCentroidCell(polygon);

		// special case for rectangular polygons
		var bboxCell = new Cell(minX + width / 2, minY + height / 2, 0, polygon);
		if (bboxCell.d > bestCell.d) bestCell = bboxCell;

		var numProbes = cellQueue.length;

		while (cellQueue.length) {
			// pick the most promising cell from the queue
			var cell = cellQueue.pop();

			// update the best cell if we found a better one
			if (cell.d > bestCell.d) {
				bestCell = cell;
				if (debug) console.log('found best %d after %d probes', Math.round(1e4 * cell.d) / 1e4, numProbes);
			}

			// do not drill down further if there's no chance of a better solution
			if (cell.max - bestCell.d <= precision) continue;

			// split the cell into four cells
			h = cell.h / 2;
			cellQueue.push(new Cell(cell.x - h, cell.y - h, h, polygon));
			cellQueue.push(new Cell(cell.x + h, cell.y - h, h, polygon));
			cellQueue.push(new Cell(cell.x - h, cell.y + h, h, polygon));
			cellQueue.push(new Cell(cell.x + h, cell.y + h, h, polygon));
			numProbes += 4;
		}

		if (debug) {
			console.log('num probes: ' + numProbes);
			console.log('best distance: ' + bestCell.d);
		}

		return [bestCell.x, bestCell.y];
	}

	function compareMax(a, b) {
		return b.max - a.max;
	}

	function Cell(x, y, h, polygon) {
		this.x = x; // cell center x
		this.y = y; // cell center y
		this.h = h; // half the cell size
		this.d = pointToPolygonDist(x, y, polygon); // distance from cell center to polygon
		this.max = this.d + this.h * Math.SQRT2; // max distance to polygon within a cell
	}

	// signed distance from point to polygon outline (negative if point is outside)
	function pointToPolygonDist(x, y, polygon) {
		var inside = false;
		var minDistSq = Infinity;

		for (var k = 0; k < polygon.length; k++) {
			var ring = polygon[k];

			for (var i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
				var a = ring[i];
				var b = ring[j];

				if ((a[1] > y !== b[1] > y) &&
					(x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0])) inside = !inside;

				minDistSq = Math.min(minDistSq, getSegDistSq(x, y, a, b));
			}
		}

		return (inside ? 1 : -1) * Math.sqrt(minDistSq);
	}

	// get polygon centroid
	function getCentroidCell(polygon) {
		var area = 0;
		var x = 0;
		var y = 0;
		var points = polygon[0];

		for (var i = 0, len = points.length, j = len - 1; i < len; j = i++) {
			var a = points[i];
			var b = points[j];
			var f = a[0] * b[1] - b[0] * a[1];
			x += (a[0] + b[0]) * f;
			y += (a[1] + b[1]) * f;
			area += f * 3;
		}
		if (area === 0) return new Cell(points[0][0], points[0][1], 0, polygon);
		return new Cell(x / area, y / area, 0, polygon);
	}

	// get squared distance from a point to a segment
	function getSegDistSq(px, py, a, b) {

		var x = a[0];
		var y = a[1];
		var dx = b[0] - x;
		var dy = b[1] - y;

		if (dx !== 0 || dy !== 0) {

			var t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);

			if (t > 1) {
				x = b[0];
				y = b[1];

			} else if (t > 0) {
				x += dx * t;
				y += dy * t;
			}
		}

		dx = px - x;
		dy = py - y;

		return dx * dx + dy * dy;
	}
	
});

// js/v8/google-maps/google-polygon.js
/**
 * @namespace WPGMZA
 * @module GooglePolygon
 * @requires WPGMZA.Polygon
 * @pro-requires WPGMZA.ProPolygon
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.GooglePolygon = function(row, googlePolygon)
	{
		var self = this;
		
		Parent.call(this, row, googlePolygon);
		
		if(googlePolygon)
		{
			this.googlePolygon = googlePolygon;
		}
		else
		{
			this.googlePolygon = new google.maps.Polygon(this.settings);
			
			if(row && row.points)
			{
				var paths = this.parseGeometry(row.points);
				this.googlePolygon.setOptions({paths: paths});
			}
		}
		
		this.googlePolygon.wpgmzaPolygon = this;
			
		google.maps.event.addListener(this.googlePolygon, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProPolygon;
	else
		Parent = WPGMZA.Polygon;
		
	WPGMZA.GooglePolygon.prototype = Object.create(Parent.prototype);
	WPGMZA.GooglePolygon.prototype.constructor = WPGMZA.GooglePolygon;
	
	/**
	 * Returns true if the polygon is editable
	 * @return void
	 */
	WPGMZA.GooglePolygon.prototype.getEditable = function()
	{
		return this.googlePolygon.getOptions().editable;
	}
	
	/**
	 * Sets the editable state of the polygon
	 * @return void
	 */
	WPGMZA.GooglePolygon.prototype.setEditable = function(value)
	{
		this.googlePolygon.setOptions({editable: value});
	}
	
	/**
	 * Returns the polygon represented by a JSON object
	 * @return object
	 */
	WPGMZA.GooglePolygon.prototype.toJSON = function()
	{
		var result = WPGMZA.Polygon.prototype.toJSON.call(this);
		
		result.points = [];
		
		// TODO: Support holes using multiple paths
		var path = this.googlePolygon.getPath();
		for(var i = 0; i < path.getLength(); i++)
		{
			var latLng = path.getAt(i);
			result.points.push({
				lat: latLng.lat(),
				lng: latLng.lng()
			});
		}
		
		return result;
	}
	
});

// js/v8/open-layers/ol-polygon.js
/**
 * @namespace WPGMZA
 * @module OLPolygon
 * @requires WPGMZA.Polygon
 * @pro-requires WPGMZA.ProPolygon
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLPolygon = function(row, olFeature)
	{
		var self = this;
		
		Parent.call(this, row, olFeature);
		
		this.olStyle = new ol.style.Style();
		
		if(olFeature)
		{
			this.olFeature = olFeature;
		}
		else
		{
			var coordinates = [[]];
			
			if(row && row.points)
			{
				var paths = this.parseGeometry(row.points);
				
				for(var i = 0; i < paths.length; i++)
					coordinates[0].push(ol.proj.fromLonLat([
						parseFloat(paths[i].lng),
						parseFloat(paths[i].lat)
					]));
				
				this.olStyle = new ol.style.Style(this.getStyleFromSettings());
			}
			
			this.olFeature = new ol.Feature({
				geometry: new ol.geom.Polygon(coordinates)
			});
		}
		
		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [this.olFeature]
			}),
			style: this.olStyle
		});
		
		this.layer.getSource().getFeatures()[0].setProperties({
			wpgmzaPolygon: this
		});
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProPolygon;
	else
		Parent = WPGMZA.Polygon;
	
	WPGMZA.OLPolygon.prototype = Object.create(Parent.prototype);
	WPGMZA.OLPolygon.prototype.constructor = WPGMZA.OLPolygon;

	WPGMZA.OLPolygon.prototype.getStyleFromSettings = function()
	{
		var params = {};
				
		if(this.settings.strokeOpacity)
			params.stroke = new ol.style.Stroke({
				color: WPGMZA.hexOpacityToRGBA(this.settings.strokeColor, this.settings.strokeOpacity)
			});
		
		if(this.settings.fillOpacity)
			params.fill = new ol.style.Fill({
				color: WPGMZA.hexOpacityToRGBA(this.settings.fillColor, this.settings.fillOpacity)
			});
			
		return params;
	}
	
	WPGMZA.OLPolygon.prototype.updateStyleFromSettings = function()
	{
		// Re-create the style - working on it directly doesn't cause a re-render
		var params = this.getStyleFromSettings();
		this.olStyle = new ol.style.Style(params);
		this.layer.setStyle(this.olStyle);
	}
	
	WPGMZA.OLPolygon.prototype.setEditable = function(editable)
	{
		
	}
	
	WPGMZA.OLPolygon.prototype.toJSON = function()
	{
		var result = Parent.prototype.toJSON.call(this);
		var coordinates = this.olFeature.getGeometry().getCoordinates()[0];
		
		result.points = [];
		
		for(var i = 0; i < coordinates.length; i++)
		{
			var lonLat = ol.proj.toLonLat(coordinates[i]);
			var latLng = {
				lat: lonLat[1],
				lng: lonLat[0]
			};
			result.points.push(latLng);
		}
		
		return result;
	}
	
});

// js/v8/pro-store-locator.js
/**
 * @namespace WPGMZA
 * @module ProStoreLocator
 * @requires WPGMZA.StoreLocator
 */
jQuery(function($) {
	
	WPGMZA.ProStoreLocator = function(map, element)
	{
		var self = this;
		
		WPGMZA.StoreLocator.call(this, map, element);
		
		if(map.settings.store_locator_use_their_location == "1")
		{
			var input = $(this.element).find(".addressInput");
			var button = new WPGMZA.UseMyLocationButton(input);
			input.after(button.element);
		}
		
		this.map.on("init", function(event) {
			
			self.map.markerFilter.on("filteringcomplete", function(event) {
				self.onFilteringComplete(event);
			});
			
		});
	}
	
	WPGMZA.ProStoreLocator.prototype = Object.create(WPGMZA.StoreLocator.prototype);
	WPGMZA.ProStoreLocator.prototype.constructor = WPGMZA.ProStoreLocator;
	
	WPGMZA.StoreLocator.createInstance = function(map, element)
	{
		return new WPGMZA.ProStoreLocator(map, element);
	}
	
	Object.defineProperty(WPGMZA.ProStoreLocator.prototype, "distanceUnits", {
	
		"get": function() {
			if(this.map.settings.store_locator_distance == 1)
				return WPGMZA.Distance.MILES;
			
			return WPGMZA.Distance.KILOMETERS;
		}
	
	});
	
	Object.defineProperty(WPGMZA.ProStoreLocator.prototype, "keywords", {
		
		"get": function() {
			return $(".wpgmza_name_search_string + input").val()
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProStoreLocator.prototype, "categories", {
		
		"get": function() {
			var dropdown, checkboxes, value, results;
			
			if((dropdown = $(this.element).find(".wpgmza_sl_category_div > select")).length)
			{
				value = dropdown.val();
				
				if(value == "0")
					return null;
				
				return [value];
			}
			
			$(this.element).find(".wpgmza_sl_category_div :checked").each(function(index, el) {
				
				if(!results)
					results = [];
				
				results.push( $(el).val() );
				
			});
			
			return results;
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProStoreLocator.prototype, "circleStrokeColor", {
		
		"get": function() {
			
			if(this.map.settings.sl_stroke_color)
				return "#" + this.map.settings.sl_stroke_color;
			
			return "#ff0000";
			
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProStoreLocator.prototype, "circleFillColor", {
		
		"get": function() {
			
			if(this.map.settings.sl_fill_color)
				return "#" + this.map.settings.sl_fill_color;
			
			return "#ff0000";
			
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProStoreLocator.prototype, "circleStrokeOpacity", {
		
		"get": function() {
			
			if(this.map.settings.sl_stroke_opacity)
				return parseFloat(this.map.settings.sl_stroke_opacity);
			
			return 0.25;
			
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProStoreLocator.prototype, "circleFillOpacity", {
		
		"get": function() {
			
			if(this.map.settings.sl_fill_opacity)
				return parseFloat(this.map.settings.sl_fill_opacity);
			
			return 0.15;
			
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProStoreLocator.prototype, "circle", {
		
		"get": function() {
			
			if(this._circle)
				return this._circle;
			
			if(this.map.settings.wpgmza_store_locator_radius_style == "modern")
			{
				this._circle = WPGMZA.ModernStoreLocatorCircle.createInstance(this.map.id);
				this._circle.settings.color = this.circleStrokeColor;
			}
			else
			{
				this._circle = WPGMZA.Circle.createInstance({
					strokeColor:	this.circleStrokeColor,
					strokeOpacity:	this.circleStrokeOpacity,
					strokeWeight:	2,
					fillColor:		this.circleFillColor,
					fillOpacity:	this.circleFillOpacity,
					visible:		false
				});
			}
			
			return this._circle;
			
		}
		
	});
	
	Object.defineProperty(WPGMZA.ProStoreLocator.prototype, "marker", {
		
		"get": function() {
			
			if(this.map.settings.store_locator_bounce != 1)
				return null;
			
			if(this._marker)
				return this._marker;
			
			var options = {
				visible: false
			};
			
			if(this.map.settings.upload_default_sl_marker && this.map.settings.upload_default_sl_marker.length)
				options.icon = this.map.settings.upload_default_sl_marker;
			
			this._marker = WPGMZA.Marker.createInstance();
			this._marker.disableInfoWindow = true;
			
			if(this.map.settings.wpgmza_sl_animation)
				this._marker.setAnimation(this.map.settings.wpgmza_sl_animation);
			
			return this._marker;
			
		}
		
	});
	
	WPGMZA.ProStoreLocator.prototype.getFilteringParameters = function()
	{
		if(this.state == WPGMZA.StoreLocator.STATE_INITIAL)
			return {};	// No search has been performed yet
		
		var params = WPGMZA.StoreLocator.prototype.getFilteringParameters.call(this);
		
		var proParams = {};
		
		if(this.keywords)
			proParams.keywords = this.keywords;
		
		if(this.categories)
			proParams.categories = this.categories;
		
		return $.extend(params, proParams);
	}
	
	WPGMZA.ProStoreLocator.prototype.onFilteringComplete = function(event)
	{
		var params = event.filteringParams;
		var circle = this.circle;
		var marker = this.marker;
		var factor = (this.distanceUnits == WPGMZA.Distance.MILES ? WPGMZA.Distance.KILOMETERS_PER_MILE : 1.0);
		
		if(marker)
			marker.setVisible(false);
		
		if(circle)
			circle.setVisible(false);
		
		if(params.center && marker)
		{
			marker.setPosition(params.center);
			marker.setVisible(true);
			
			if(marker.map != this.map)
				this.map.addMarker(marker);
		}
		
		if(params.center && params.radius && circle)
		{
			if(circle instanceof WPGMZA.ModernStoreLocatorCircle)
				circle.settings.radiusString = Math.round(params.radius);
			
			circle.setRadius(params.radius * factor);
			circle.setCenter(params.center);
			circle.setVisible(true);
			
			if(circle.map != this.map)
				this.map.addCircle(circle);
		}
	}
	
});

// js/v8/use-my-location-button.js
/**
 * @namespace WPGMZA
 * @module UseMyLocationButton
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.UseMyLocationButton = function(target, options)
	{
		var self = this;
		
		this.options = {};
		if(options)
			this.options = options;
		
		this.target = $(target);
		
		this.element = $("<button class='wpgmza-use-my-location' type='button' title='" + WPGMZA.localized_strings.use_my_location + "'><i class='fa fa-crosshairs' aria-hidden='true'></i></button>");
		this.element.on("click", function(event) {
			self.onClick(event);
		});
	}
	
	WPGMZA.UseMyLocationButton.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.UseMyLocationButton.prototype.constructor = WPGMZA.UseMyLocationButton;
	
	WPGMZA.UseMyLocationButton.prototype.onClick = function(event)
	{
		var self = this;
		
		WPGMZA.getCurrentPosition(function(position) {
			
			var lat = position.coords.latitude;
			var lng = position.coords.longitude;
			
			self.target.val(lat + ", " + lng);
			self.target.trigger("change");
			
			var geocoder = WPGMZA.Geocoder.createInstance();
			geocoder.geocode({latLng: {lat: lat, lng: lng}}, function(results) {
				
				if(results && results.length)
					self.target.val(results[0]);
				
			});
			
		});
	}
	
});

// js/v8/modern-store-locator.js
/**
 * @namespace WPGMZA
 * @module ModernStoreLocator
 * @requires WPGMZA
 * @pro-requires WPGMZA.UseMyLocationButton
 */
jQuery(function($) {
	
	/**
	 * The new modern look store locator. It takes the elements from the default look and moves them into the map, wrapping in a new element so we can apply new styles. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.ModernStoreLocator
	 * @constructor WPGMZA.ModernStoreLocator
	 * @memberof WPGMZA
	 * @param {int} map_id The ID of the map this store locator belongs to
	 */
	WPGMZA.ModernStoreLocator = function(map_id)
	{
		var self = this;
		var original;
		var map = WPGMZA.getMapByID(map_id);
		
		WPGMZA.assertInstanceOf(this, "ModernStoreLocator");
		
		if(WPGMZA.isProVersion())
			original = $(".wpgmza_sl_search_button[mid='" + map_id + "']").closest(".wpgmza_sl_main_div");
		else
			original = $(".wpgmza_sl_search_button").closest(".wpgmza_sl_main_div");
		
		if(!original.length)
			return;
		
		// Build / re-arrange elements
		this.element = $("<div class='wpgmza-modern-store-locator'><div class='wpgmza-inner wpgmza-modern-hover-opaque'/></div>")[0];
		
		var inner = $(this.element).find(".wpgmza-inner");
		
		var titleSearch = $(original).find("[id='nameInput_" + map_id + "']");
		if(titleSearch.length)
		{
			var placeholder = wpgmaps_localize[map_id].other_settings.store_locator_name_string;
			if(placeholder && placeholder.length)
				titleSearch.attr("placeholder", placeholder);
			inner.append(titleSearch);
		}
		
		var addressInput;
		if(WPGMZA.isProVersion())
			addressInput = $(original).find(".addressInput");
		else
			addressInput = $(original).find("#addressInput");
		
		if(wpgmaps_localize[map_id].other_settings.store_locator_query_string && wpgmaps_localize[map_id].other_settings.store_locator_query_string.length)
			addressInput.attr("placeholder", wpgmaps_localize[map_id].other_settings.store_locator_query_string);
		
		inner.append(addressInput);
		
		var button;
		if(button = $(original).find("button.wpgmza-use-my-location"))
			inner.append(button);
		
		$(addressInput).on("keydown", function(event) {
			
			if(event.keyCode == 13 && self.searchButton.is(":visible"))
				self.searchButton.trigger("click");
			
		});
		
		$(addressInput).on("input", function(event) {
			
			self.searchButton.show();
			self.resetButton.hide();
			
		});
		
		inner.append($(original).find("select.wpgmza_sl_radius_select"));
		// inner.append($(original).find(".wpgmza_filter_select_" + map_id));
		
		// Buttons
		this.searchButton = $(original).find( ".wpgmza_sl_search_button" );
		inner.append(this.searchButton);
		
		this.resetButton = $(original).find( ".wpgmza_sl_reset_button_div" );
		inner.append(this.resetButton);
		
		this.resetButton.on("click", function(event) {
			resetLocations(map_id);
		});
		
		this.resetButton.hide();
		
		if(WPGMZA.isProVersion())
		{
			this.searchButton.on("click", function(event) {
				if($("addressInput_" + map_id).val() == 0)
					return;
				
				self.searchButton.hide();
				self.resetButton.show();
				
				map.storeLocator.state = WPGMZA.StoreLocator.STATE_APPLIED;
			});
			this.resetButton.on("click", function(event) {
				self.resetButton.hide();
				self.searchButton.show();
				
				map.storeLocator.state = WPGMZA.StoreLocator.STATE_INITIAL;
			});
		}
		
		// Distance type
		inner.append($("#wpgmza_distance_type_" + map_id));
		
		// Categories
		var container = $(original).find(".wpgmza_cat_checkbox_holder");
		var ul = $(container).children("ul");
		var items = $(container).find("li");
		var numCategories = 0;
		
		//$(items).find("ul").remove();
		//$(ul).append(items);
		
		var icons = [];
		
		items.each(function(index, el) {
			var id = $(el).attr("class").match(/\d+/);
			
			for(var category_id in wpgmza_category_data) {
				
				if(id == category_id) {
					var src = wpgmza_category_data[category_id].image;
					var icon = $('<div class="wpgmza-chip-icon"/>');
					
					icon.css({
						"background-image": "url('" + src + "')",
						"width": $("#wpgmza_cat_checkbox_" + category_id + " + label").height() + "px"
					});
					icons.push(icon);
					
                    if(src != null && src != ""){
					   //$(el).find("label").prepend(icon);
                       $("#wpgmza_cat_checkbox_" + category_id + " + label").prepend(icon);
                    }
					
					numCategories++;
					
					break;
				}
				
			}
		});

        $(this.element).append(container);

		
		if(numCategories) {
			this.optionsButton = $('<span class="wpgmza_store_locator_options_button"><i class="fa fa-list"></i></span>');
			$(this.searchButton).before(this.optionsButton);
		}
		
		setInterval(function() {
			
			icons.forEach(function(icon) {
				var height = $(icon).height();
				$(icon).css({"width": height + "px"});
				$(icon).closest("label").css({"padding-left": height + 8 + "px"});
			});
			
			$(container).css("width", $(self.element).find(".wpgmza-inner").outerWidth() + "px");
			
		}, 1000);
		
		$(this.element).find(".wpgmza_store_locator_options_button").on("click", function(event) {
			
			if(container.hasClass("wpgmza-open"))
				container.removeClass("wpgmza-open");
			else
				container.addClass("wpgmza-open");
			
		});
		
		// Remove original element
		$(original).remove();
		
		// Event listeners
		$(this.element).find("input, select").on("focus", function() {
			$(inner).addClass("active");
		});
		
		$(this.element).find("input, select").on("blur", function() {
			$(inner).removeClass("active");
		});
	}
	
	/**
	 * Creates an instance of a modern store locator, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.ModernStoreLocator
	 * @param {int} map_id The ID of the map this store locator belongs to
	 * @return {WPGMZA.ModernStoreLocator} An instance of WPGMZA.ModernStoreLocator
	 */
	WPGMZA.ModernStoreLocator.createInstance = function(map_id)
	{
		if(WPGMZA.settings.engine == "google-maps")
			return new WPGMZA.GoogleModernStoreLocator(map_id);
		else
			return new WPGMZA.OLModernStoreLocator(map_id);
	}
	
});

// js/v8/google-maps/google-modern-store-locator.js
/**
 * @namespace WPGMZA
 * @module GoogleModernStoreLocator
 * @requires WPGMZA.ModernStoreLocator
 */
jQuery(function($) {
	
	WPGMZA.GoogleModernStoreLocator = function(map_id)
	{
		var googleMap, self = this;
		
		this.map = WPGMZA.getMapByID(map_id);
		
		WPGMZA.ModernStoreLocator.call(this, map_id);

		var options = {
			fields: ["name", "formatted_address"],
			types: ["geocode"]
		};
		var restrict = wpgmaps_localize[map_id]["other_settings"]["wpgmza_store_locator_restrict"];
		
		this.addressInput = $(this.element).find(".addressInput, #addressInput")[0];
		
		if(this.addressInput)
		{
			if(restrict && restrict.length)
				options.componentRestrictions = {
					country: restrict
				};
			
			this.autoComplete = new google.maps.places.Autocomplete(
				this.addressInput,
				options
			);
		}
		
		// Positioning for Google
		this.map.googleMap.controls[google.maps.ControlPosition.TOP_CENTER].push(this.element);
	}
	
	WPGMZA.GoogleModernStoreLocator.prototype = Object.create(WPGMZA.ModernStoreLocator.prototype);
	WPGMZA.GoogleModernStoreLocator.prototype.constructor = WPGMZA.GoogleModernStoreLocator;
	
});

// js/v8/open-layers/ol-modern-store-locator.js
/**
 * @namespace WPGMZA
 * @module OLModernStoreLocator
 * @requires WPGMZA.ModernStoreLocator
 */
jQuery(function($) {
	
	WPGMZA.OLModernStoreLocator = function(map_id)
	{
		var element;
		
		WPGMZA.ModernStoreLocator.call(this, map_id);
		
		if(WPGMZA.isProVersion())
			element = $(".wpgmza_map[data-map-id='" + map_id + "']");
		else
			element = $("#wpgmza_map");
		
		element.append(this.element);
	}
	
	WPGMZA.OLModernStoreLocator.prototype = Object.create(WPGMZA.ModernStoreLocator);
	WPGMZA.OLModernStoreLocator.prototype.constructor = WPGMZA.OLModernStoreLocator;
	
});

// js/v8/xml-cache-converter.js
/**
 * @namespace WPGMZA
 * @module XMLCacheConverter
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.XMLCacheConverter = function()
	{
		
	}
	
	WPGMZA.XMLCacheConverter.prototype.convert = function(xml)
	{
		var markers = [];
		
		$(xml).find("marker").each(function(index, el) {
			
			function getField(nodeName)
			{
				return $(el).find(nodeName).text();
			}
			
			var data = {
				map_id:			getField("map_id"),
				marker_id:		getField("marker_id"),
				title:			getField("title"),
				address:		getField("address"),
				icon:			getField("icon"),
				pic:			getField("pic"),
				desc:			getField("desc"),
				linkd:			getField("linkd"),
				anim:			getField("anim"),
				retina:			getField("retina"),
				category:		getField("category"),
				lat:			getField("lat"),
				lng:			getField("lng"),
				infoopen:		getField("infoopen")
			};
			
			markers[data.marker_id] = data;
			
		});
		
		return markers;
	}
	
});

// js/v8/3rd-party-integration/gutenberg/dist/pro-gutenberg.js
"use strict";

/**
 * @namespace WPGMZA.Integration
 * @module ProGutenberg
 * @requires WPGMZA.Gutenberg
 */

/**
 * Internal block libraries
 */
jQuery(function ($) {

	if (!window.wp || !wp.i18n || !wp.blocks || !wp.editor || !wp.components) return;

	var __ = wp.i18n.__;
	var registerBlockType = wp.blocks.registerBlockType;
	var _wp$editor = wp.editor,
	    InspectorControls = _wp$editor.InspectorControls,
	    BlockControls = _wp$editor.BlockControls;
	var _wp$components = wp.components,
	    Dashicon = _wp$components.Dashicon,
	    Toolbar = _wp$components.Toolbar,
	    Button = _wp$components.Button,
	    Tooltip = _wp$components.Tooltip,
	    PanelBody = _wp$components.PanelBody,
	    TextareaControl = _wp$components.TextareaControl,
	    TextControl = _wp$components.TextControl,
	    RichText = _wp$components.RichText,
	    SelectControl = _wp$components.SelectControl;


	WPGMZA.Integration.ProGutenberg = function () {
		WPGMZA.Integration.Gutenberg.call(this);
	};

	WPGMZA.Integration.ProGutenberg.prototype = Object.create(WPGMZA.Integration.Gutenberg.prototype);
	WPGMZA.Integration.ProGutenberg.prototype.constructor = WPGMZA.Integration.ProGutenberg;

	WPGMZA.Integration.Gutenberg.getConstructor = function () {
		return WPGMZA.Integration.ProGutenberg;
	};

	WPGMZA.Integration.ProGutenberg.prototype.getMapSelectOptions = function () {
		var result = [];

		WPGMZA.gutenbergData.maps.forEach(function (el) {

			result.push({
				value: el.id,
				label: el.map_title + " (" + el.id + ")"
			});
		});

		return result;
	};

	WPGMZA.Integration.ProGutenberg.prototype.getBlockInspectorControls = function (props) {
		var onChangeMap = function onChangeMap(value) {
			props.setAttributes({ id: value });
		};

		var onChangeMashupIDs = function onChangeMashupIDs(value) {
			props.setAttributes({ mashup_ids: value });
		};

		var onEditMap = function onEditMap(event) {

			var select = $("select[name='map_id']");
			var map_id = select.val();

			window.open(WPGMZA.adminurl + "admin.php?page=wp-google-maps-menu&action=edit&map_id=" + map_id);

			event.preventDefault();
			return false;
		};

		var selectedMapID = "1";

		if (props.attributes.id) selectedMapID = props.attributes.id;else if (WPGMZA.gutenbergData.maps.length) selectedMapID = WPGMZA.gutenbergData.maps[0].id;

		return React.createElement(
			InspectorControls,
			{ key: "inspector" },
			React.createElement(
				PanelBody,
				{ title: __('Map Settings') },
				React.createElement(SelectControl, {
					name: "map_id",
					label: __("Map"),
					value: selectedMapID,
					options: this.getMapSelectOptions(),
					onChange: onChangeMap
				}),
				React.createElement(SelectControl, {
					label: __("Mashup IDs"),
					value: props.attributes.mashup_ids || [],
					options: this.getMapSelectOptions(),
					multiple: true,
					onChange: onChangeMashupIDs
				}),
				React.createElement(
					"p",
					{ "class": "map-block-gutenberg-button-container" },
					React.createElement(
						"a",
						{ href: WPGMZA.adminurl + "admin.php?page=wp-google-maps-menu",
							onClick: onEditMap,
							target: "_blank",
							"class": "button button-primary" },
						React.createElement("i", { "class": "fa fa-pencil-square-o", "aria-hidden": "true" }),
						__('Go to Map Editor')
					)
				),
				React.createElement(
					"p",
					{ "class": "map-block-gutenberg-button-container" },
					React.createElement(
						"a",
						{ href: "https://www.wpgmaps.com/documentation/creating-your-first-map/",
							target: "_blank",
							"class": "button button-primary" },
						React.createElement("i", { "class": "fa fa-book", "aria-hidden": "true" }),
						__('View Documentation')
					)
				)
			)
		);
	};

	WPGMZA.Integration.ProGutenberg.prototype.getBlockAttributes = function (props) {
		return {
			"id": {
				type: "string"
			},
			"mashup_ids": {
				type: "array"
			}
		};
	};

	WPGMZA.Integration.ProGutenberg.prototype.getBlockDefinition = function (props) {
		var definition = WPGMZA.Integration.Gutenberg.prototype.getBlockDefinition.call(this, props);

		return definition;
	};

	WPGMZA.integrationModules.gutenberg = WPGMZA.Integration.Gutenberg.createInstance();
});

// js/v8/google-maps/google-heatmap.js
/**
 * @namespace WPGMZA
 * @module GoogleHeatmap
 * @requires WPGMZA.Heatmap
 */
jQuery(function($) {
	
	WPGMZA.GoogleHeatmap = function(row)
	{
		WPGMZA.Heatmap.call(this, row);
		
		if(!google.maps.visualization)
		{
			console.warn("Heatmaps disabled. You must include the visualization library in the Google Maps API");
			return;
		}
		
		this.googleHeatmap = new google.maps.visualization.HeatmapLayer(this.settings);
		
		this.updateGoogleHeatmap();
	}
	
	WPGMZA.GoogleHeatmap.prototype = Object.create(WPGMZA.Heatmap.prototype);
	WPGMZA.GoogleHeatmap.prototype.constructor = WPGMZA.GoogleHeatmap;
	
	WPGMZA.GoogleHeatmap.prototype.updateGoogleHeatmap = function()
	{
		var points = this.points;
		var len = points.length;
		var data = [];
		
		// TODO: There are optimizations that could be made here, instead of regenerating the entire array and calling new google.maps.LatLng for each point, it would be better to keep an array and splice it
		
		for(var i = 0; i < len; i++)
			data.push(
				new google.maps.LatLng(
					points[i].lat, 
					points[i].lng
				)
			);
		
		this.googleHeatmap.setData(data);
		
		if(this.map)
			this.googleHeatmap.setMap(this.map.googleMap);
	}
	
	WPGMZA.GoogleHeatmap.prototype.addPoint = function(latLng)
	{
		WPGMZA.Heatmap.prototype.addPoint.call(this, latLng);
		
		this.updateGoogleHeatmap();
	}
	
	WPGMZA.GoogleHeatmap.prototype.removePoint = function(latLng)
	{
		WPGMZA.Heatmap.prototype.removePoint.call(this, latLng);
		
		this.updateGoogleHeatmap();
	}
	
});

// js/v8/google-maps/google-pro-info-window.js
/**
 * @namespace WPGMZA
 * @module GoogleProInfoWindow
 * @requires WPGMZA.GoogleInfoWindow
 */
jQuery(function($) {

	WPGMZA.GoogleProInfoWindow = function(mapObject)
	{
		WPGMZA.GoogleInfoWindow.call(this, mapObject);
	}
	
	WPGMZA.GoogleProInfoWindow.prototype = Object.create(WPGMZA.GoogleInfoWindow.prototype);
	WPGMZA.GoogleProInfoWindow.prototype.constructor = WPGMZA.GoogleProInfoWindow;

	WPGMZA.GoogleProInfoWindow.prototype.open = function(map, mapObject)
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
				var result = WPGMZA.GoogleInfoWindow.prototype.open.call(this, map, mapObject);
				
				if(this.maxWidth && this.googleInfoWindow) // There will be no Google InfoWindow with Modern style marker listing selected
					this.googleInfoWindow.setOptions({maxWidth: this.maxWidth});
				
				return result;
				break;
		}
	}
		
});

// js/v8/google-maps/google-pro-map.js
/**
 * @namespace WPGMZA
 * @module GoogleProMap
 * @requires WPGMZA.GoogleMap
 */
jQuery(function($) {
	WPGMZA.GoogleProMap = function(element, options)
	{
		WPGMZA.GoogleMap.call(this, element, options);
		
		// Load KML layers
		this.loadKMLLayers();
		
		// Dispatch event
		this.trigger("init");
		
		this.dispatchEvent("created");
		WPGMZA.events.dispatchEvent({type: "mapcreated", map: this});
	}
	
	WPGMZA.GoogleProMap.prototype = Object.create(WPGMZA.GoogleMap.prototype);
	WPGMZA.GoogleProMap.prototype.constructor = WPGMZA.GoogleProMap.prototype;
	
	WPGMZA.GoogleProMap.prototype.addHeatmap = function(heatmap)
	{
		heatmap.googleHeatmap.setMap(this.googleMap);
		
		WPGMZA.ProMap.prototype.addHeatmap.call(this, heatmap);
	}
	
	/**
	 * Loads KML/GeoRSS layers
	 * @return void
	 */
	WPGMZA.GoogleProMap.prototype.loadKMLLayers = function()
	{
		// Remove old layers
		if(this.kmlLayers)
		{
			for(var i = 0; i < this.kmlLayers.length; i++)
				this.kmlLayers[i].setMap(null);
		}
		
		this.kmlLayers = [];
		
		if(!this.settings.kml)
			return;
		
		// Add layers
		var urls = this.settings.kml.split(",");
		var cachebuster = new Date().getTime();
		
		for(var i = 0; i < urls.length; i++)
		{
			this.kmlLayers.push(
				new google.maps.KmlLayer(urls[i] + "?cachebuster=" + cachebuster,
					{
						map: this.googleMap,
						preserveViewport: true
					}
				)
			);
		}
	}
	
	WPGMZA.GoogleProMap.prototype.loadFusionTableLayer = function() 
	{
		if(!this.settings.fusion)
			return;
		
		this.fusionLayer = new google.maps.FusionTablesLayer(this.settings.fusion, {
			map: this.googleMap,
			surpressInfoWindows: true
		});
	}
	
});

// js/v8/google-maps/google-pro-marker.js
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

// js/v8/google-maps/google-pro-polygon.js
/**
 * @namespace WPGMZA
 * @module GoogleProPolygon
 * @requires WPGMZA.GooglePolygon
 */
jQuery(function($) {
	
	WPGMZA.GoogleProPolygon = function(row, googlePolygon)
	{
		var self = this;
		
		WPGMZA.GooglePolygon.call(this, row, googlePolygon);
		
		google.maps.event.addListener(this.googlePolygon, "mouseover", function(event) {
			self.onMouseOver(event);
		});
		
		google.maps.event.addListener(this.googlePolygon, "mouseout", function(event) {
			self.onMouseOut(event);
		});
	}
	
	WPGMZA.GoogleProPolygon.prototype = Object.create(WPGMZA.GooglePolygon.prototype);
	WPGMZA.GoogleProPolygon.prototype.constructor = WPGMZA.GoogleProPolygon;
	
	/**
	 * Called when the user hovers their cursor over the polygon
	 * @return void
	 */
	WPGMZA.GoogleProPolygon.prototype.onMouseOver = function(event)
	{
		var options = {};
		
		// Check all these properties to see if they're empty first, so that we don't end up making the polygon black when no values are specified
		if(this.settings.hoverFillColor && this.settings.hoverFillColor.length)
			options.fillColor = this.settings.hoverFillColor;
		
		if(this.settings.hoverOpacity && this.settings.hoverOpacity.length)
			options.fillOpacity = this.settings.hoverOpacity;
		
		if(this.settings.hoverStrokeColor && this.settings.hoverStrokeColor.length)
			options.strokeColor = this.settings.hoverStrokeColor;
		
		this.googlePolygon.setOptions(options);
	}
	
	/**
	 * Called when the user hovers their cursor over the polygon
	 * @return void
	 */
	WPGMZA.GoogleProPolygon.prototype.onMouseOut = function(event)
	{
		this.googlePolygon.setOptions(this.settings);
	}
	
});

// js/v8/marker-listings/advanced-table-datatable.js
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

// js/v8/marker-listings/marker-listing.js
/**
 * @namespace WPGMZA
 * @module MarkerListing
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.MarkerListing = function(map, element, options)
	{
		var self = this;
		
		this._paginationEnabled = true;
		
		this.map = map;
		
		this.element = element;
		
		if(options)
			for(var key in options)
				this[key] = options[key];
		
		this.categoryDropdown = $("select[name='wpgmza_filter_select'][mid='" + this.map.id + "']")
		this.categoryDropdown.on("change", function(event) {
			var map = WPGMZA.getMapByID(self.map.id);
			map.markerFilter.update();
		});
		
		this.categoryCheckboxes = $(".wpgmza_checkbox[mid='" + this.map.id + "']");
		this.categoryCheckboxes.on("change", function(event) {
			var map = WPGMZA.getMapByID(self.map.id);
			map.markerFilter.update();
		});
		
		if(map.settings.store_locator_hide_before_search)
		{
			this.showOnFilteringComplete = true;
			$(this.element).hide();
		}
		
		$(this.element).on("click", ".wpgmaps_mlist_row, .wpgmaps_blist_row", function(event) {
			self.onItemClick(event);
		});
		
		$(document.body).on("filteringcomplete.wpgmza", function(event) {
			
			if(event.map.id == self.map.id)
				self.onFilteringComplete(event);
			
		});
		
		this.reload();
	}
	
	WPGMZA.MarkerListing.createInstance = function(map, element, options)
	{
		switch(map.settings.list_markers_by)
		{
			case WPGMZA.MarkerListing.STYLE_ADVANCED_TABLE:
				return new WPGMZA.AdvancedTableMarkerListing(map, element, options); 
				break;
			
			case WPGMZA.MarkerListing.STYLE_CAROUSEL:
				return new WPGMZA.CarouselMarkerListing(map, element, options);
				break;
			
			case WPGMZA.MarkerListing.STYLE_MODERN:
				return new WPGMZA.ModernMarkerListing(map, element, options);
				break;
			
			default:
				return new WPGMZA.MarkerListing(map, element, options);
				break;
		}
	}
	
	WPGMZA.MarkerListing.STYLE_NONE					= 0;
	WPGMZA.MarkerListing.STYLE_BASIC_TABLE			= 1;
	WPGMZA.MarkerListing.STYLE_BASIC_LIST 			= 4;
	WPGMZA.MarkerListing.STYLE_ADVANCED_TABLE		= 2;
	WPGMZA.MarkerListing.STYLE_CAROUSEL				= 3;
	WPGMZA.MarkerListing.STYLE_MODERN				= 6;
	
	Object.defineProperty(WPGMZA.MarkerListing.prototype, "mapID", {
		
		"get": function() {
			return this.map.id;
		}
		
	});
	
	Object.defineProperty(WPGMZA.MarkerListing.prototype, "paginationEnabled", {
		
		"get": function() {
			return this._paginationEnabled;
		},
		
		"set": function(value) {
			this._paginationEnabled = (value ? true : false);
		}
		
	});
	
	/**
	 * The page size, or the default of 10 if none is set
	 */
	Object.defineProperty(WPGMZA.MarkerListing.prototype, "pageSize", {
		
		"get": function() {
			
			if(!WPGMZA.settings.wpgmza_default_items)
				return 10;
			
			var pageSize = parseInt( WPGMZA.settings.wpgmza_default_items );
			
			if(isNaN(pageSize))
			{
				//console.warn("Invalid page size");
				return null;
			}
			
			return pageSize;
			
		},
		
		"set": function(value) {
			this.pagination("pageSize", value);
		}
		
	});
	
	/**
	 * The current page number, zero based
	 */
	Object.defineProperty(WPGMZA.MarkerListing.prototype, "currentPage", {
		
		"get": function() {
			if(!this.paginationElement)
				return 0;
			
			try{
				return $(this.paginationElement).pagination("getSelectedPageNum") - 1;
			}catch(e) {
				//console.warn("pagination.js getSelectedPageNum failed");
				return 0;
			}
		},
		
		"set": function(value) {
			throw new Error("Not yet implemented");
		}
		
	});
	
	Object.defineProperty(WPGMZA.MarkerListing.prototype, "style", {
		
		"get": function() {
			return this.map.settings.list_markers_by;
		}
		
	});
	
	WPGMZA.MarkerListing.prototype.initPagination = function()
	{
		if(this.paginationElement)
		{
			try{
				$(this.paginationElement).pagination("destroy");
			}catch(e) {
				//console.warn(e);
			}
			$(this.paginationElement).remove();
		}
		
		if(!this.paginationEnabled || this.showOnFilteringComplete)
			return;
		
		if(this.pageSize)
		{
			var options = this.getPaginationOptions();
			
			if(this.lastAJAXResponse.recordsFiltered <= options.pageSize)
				return;
			
			this.paginationElement = $("<div class='wpgmza-pagination'/>");
			this.pagination = $(this.paginationElement).pagination(this.getPaginationOptions());
			
			$(this.element).after(this.paginationElement);
		}
	}
	
	WPGMZA.MarkerListing.prototype.getPaginationOptions = function()
	{
		var self = this;
		
		var options = {
			
			triggerPagingOnInit: false,
			pageSize: this.pageSize,
			
			dataSource: function(done) {
				done( self.getPaginationDataSource() )
			},
			
			callback: function(data, pagination) {
				self.pageOnPaginationReinit = $(self.paginationElement).pagination("getSelectedPageNum");
				$(self.paginationElement).pagination("disable");
				self.reload();
			}
			
		};
		
		if(this.pageOnPaginationReinit)
			options.pageNumber = this.pageOnPaginationReinit;
		
		return options;
	}
	
	WPGMZA.MarkerListing.prototype.getPaginationDataSource = function()
	{
		var source = [];
		
		if(!this.lastAJAXResponse)
			return source;
		
		for(var i = 0; i < this.lastAJAXResponse.recordsFiltered; i++)
			source.push(i);
		
		return source;
	}
	
	WPGMZA.MarkerListing.prototype.getAJAXRequestParameters = function(params)
	{
		var self = this;
		
		// Create parameters object if it doesn't exist already
		if(!params)
			params = {};
		if(!params.data)
			params.data = {};
		
		// We use POST as the requests can become quite large with marker IDs, don't want to hit the GET limit
		params.method = "POST";
		
		// Parse parameters passed from the server
		var str = $(this.element).attr("data-wpgmza-ajax-parameters");
		if(!str || !str.length)
			throw new Error("No AJAX parameters specified on Marker Listing attribute");
		
		var attributeParameters = JSON.parse(str);
		
		// Put PHP class and attribute parameters in params.data
		$.extend(
			params.data, 
			{
				"phpClass": $(this.element).attr("data-wpgmza-php-class"),
				"start": this.currentPage * this.pageSize,
				"length": this.pageSize
			},
			attributeParameters
		);
		
		if(this.overrideMarkerIDs)
			params.data.overrideMarkerIDs = this.overrideMarkerIDs.join(",");
		
		if(this.lastFilteringParams)
			params.data.filteringParams = this.lastFilteringParams;
		
		// Add success callback
		params.success = function(response, textStatus, xhr) {
			self.onAJAXResponse(response, textStatus, xhr);
		};
		
		return params;
	}
	
	WPGMZA.MarkerListing.prototype.onAJAXResponse = function(response, textStatus, xhr)
	{
		this.map.showPreloader(false);
		
		this.lastAJAXResponse = response;
		
		this.onHTMLResponse(response.html);
		this.initPagination();
	}
	
	WPGMZA.MarkerListing.prototype.onHTMLResponse = function(html)
	{
		$(this.element).html(html);
	}
	
	WPGMZA.MarkerListing.prototype.reload = function()
	{
		// NB: This allows for the marker category filter to work even if "No marker listing" is selected
		if(!this.element)
			return;
		
		var route = $(this.element).attr("data-wpgmza-rest-api-route");
		var params = this.getAJAXRequestParameters();
		
		this.map.showPreloader(true);
		
		WPGMZA.restAPI.call(route, params);
	}
	
	WPGMZA.MarkerListing.prototype.enable = function(value)
	{
		if(!value)
			this.pagination("disable");
		else
			this.pagination("enable");
	}
	
	WPGMZA.MarkerListing.prototype.getFilteringParameters = function()
	{
		var params = {};
		
		if(this.categoryDropdown.length && this.categoryDropdown.val() != "0")
			params.categories = [this.categoryDropdown.val()];
		
		if(this.categoryCheckboxes.length)
		{
			params.categories = [];
			
			this.categoryCheckboxes.each(function(index, el) {
				
				if($(el).prop("checked"))
					params.categories.push($(el).val());
				
			});
		}
		
		return params;
	}
	
	WPGMZA.MarkerListing.prototype.onFilteringComplete = function(event)
	{
		var self = this;
		
		if(this.showOnFilteringComplete)
		{
			$(this.element).show();
			delete this.showOnFilteringComplete;
		}
		
		this.overrideMarkerIDs = [];
		
		event.filteredMarkers.forEach(function(data) {
			self.overrideMarkerIDs.push(data.id);
		});
		
		this.lastFilteringParams = event.filteringParams;
		
		this.reload();
	}
	
	WPGMZA.MarkerListing.prototype.onItemClick = function(event)
	{
		var marker_id = $(event.currentTarget).attr("mid");
		var marker = this.map.getMarkerByID(marker_id);
		var listingPushedInMap = WPGMZA.maps[0].settings.push_in_map && WPGMZA.maps[0].settings.push_in_map.length;
		var clickedGetDirections = $(event.target).hasClass("wpgmza_gd");
		var zoomLevelOnClick = 13;
		
		marker.trigger("select");
		
		if(this.style != WPGMZA.MarkerListing.STYLE_MODERN && 
			!WPGMZA.settings.disable_scroll_on_marker_listing_click &&
			!clickedGetDirections &&
			!listingPushedInMap)
		{
			var offset = 0;
			
			if(WPGMZA.settings.marker_listing_item_click_scroll_offset)
				offset = parseInt(WPGMZA.settings.marker_listing_item_click_scroll_offset);
			
			$('html, body').animate({
				scrollTop: $(this.map.element).offset().top - offset
			}, 500);
		}
		
		if(this.map.settings.zoom_level_on_marker_listing_click)
			zoomLevelOnClick = this.map.settings.zoom_level_on_marker_listing_click;
		
		if(this.map instanceof WPGMZA.GoogleMap)
		{
			this.map.panTo(marker.getPosition());
			this.map.setZoom(zoomLevelOnClick);
		}
		else
		{
			this.map.panTo(marker.getPosition(), zoomLevelOnClick);
		}
	}
	
	/*$(document).ready(function() {
		
		$("[data-wpgmza-marker-listing]:not([data-wpgmza-carousel-marker-listing])").each(function(index, el) {
			
			// TODO: When the Map object takes over responsibility for this, store a back reference to the map
			el.wpgmzaMarkerListing = WPGMZA.MarkerListing.createInstance(el);
			
		});
		
	});*/
	
});

// js/v8/marker-listings/modern-marker-listing.js
/**
 * @namespace WPGMZA
 * @module ModernMarkerListing
 * @requires WPGMZA.MarkerListing
 * @requires WPGMZA.PopoutPanel
 */
jQuery(function($) {
	
	/**
	 * The modern look and feel marker listing
	 * @return Object
	 */
	WPGMZA.ModernMarkerListing = function(map, element, options)
	{
		var self = this;
		var map_id = map.id;
		var container = $("#wpgmza_map_" + map_id);
		var mashup_ids = container.attr("data-mashup-ids");
		
		WPGMZA.MarkerListing.apply(this, arguments);
		
		this.map = map;
		
		this.element = $("#wpgmza_marker_list_" + map_id);
		this.openButton = $('<div class="wpgmza-modern-marker-open-button wpgmza-modern-shadow wpgmza-modern-hover-opaque"><i class="fa fa-map-marker"></i> <i class="fa fa-list"></i></div>')
		
		this.popoutPanel = new WPGMZA.PopoutPanel();
		this.popoutPanel.element = this.element;
		
		map.on("init", function(event) {
			
			container.append(self.element);
			container.append(self.openButton);
			
		});
		
		self.openButton.on("click", function(event) {
			
			self.open();
			$("#wpgmza_map_" + map_id + " .wpgmza-modern-store-locator").addClass("wpgmza_sl_offset");
			
		});
		
		// Marker view
		this.markerView = new WPGMZA.ModernMarkerListingMarkerView(map);
		this.markerView.parent = this;
		
		// Event listeners
		$(this.element).find(".wpgmza-close-container").on("click", function(event) {
			self.close();
            $("#wpgmza_map_" + self.map.id + " .wpgmza-modern-store-locator").removeClass("wpgmza_sl_offset");
		});
		
		$(this.element).on("click", "li", function(event) {
			self.markerView.open($(event.currentTarget).attr("mid"));
		});
		
		$(document.body).on("click", ".wpgmza_sl_reset_button_" + map_id, function(event) {
			$(self.element).find("li[mid]").show();
		});
		
		$(document.body).on("filteringcomplete.wpgmza", function(event) {
			
			if(event.map.id == self._mapID)
				self.onFilteringComplete(event);
			
		});
	};
	
	WPGMZA.ModernMarkerListing.prototype = Object.create(WPGMZA.MarkerListing.prototype);
	WPGMZA.ModernMarkerListing.prototype.constructor = WPGMZA.ModernMarkerListing;
	
	WPGMZA.ModernMarkerListing.prototype.initPagination = function()
	{
		WPGMZA.MarkerListing.prototype.initPagination.apply(this, arguments);
		
		if(this.pageSize)
			$(this.element).find("ul").after(this.paginationElement);
	}
	
	WPGMZA.ModernMarkerListing.prototype.onHTMLResponse = function(html)
	{
		$(this.element).find("ul.wpgmza-modern-marker-listing-list-item-container").html(html);
	}
	
	WPGMZA.ModernMarkerListing.prototype.open = function()
	{
		this.popoutPanel.open();
	}
	
	WPGMZA.ModernMarkerListing.prototype.close = function()
	{
		this.popoutPanel.close();
	}
	
});

// js/v8/marker-listings/advanced-table-marker-listing.js
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

// js/v8/marker-listings/carousel-marker-listing.js
/**
 * @namespace WPGMZA
 * @module CarouselMarkerListing
 * @requires WPGMZA.MarkerListing
 */
jQuery(function($) {
	
	WPGMZA.CarouselMarkerListing = function(map, element, options)
	{
		WPGMZA.MarkerListing.call(this, map, element, 
			$.extend({paginationEnabled: false}, options)
		);
	}
	
	WPGMZA.CarouselMarkerListing.prototype = Object.create(WPGMZA.MarkerListing.prototype);
	WPGMZA.CarouselMarkerListing.prototype.constructor = WPGMZA.CarouselMarkerListing;
	
	WPGMZA.CarouselMarkerListing.createInstance = function(el)
	{
		return new WPGMZA.CarouselMarkerListing(el);
	}
	
	WPGMZA.CarouselMarkerListing.prototype.getOwlCarouselOptions = function()
	{
		var options = {
			autoplay: 			true,
			autoplayTimeout:	5000,
			lazyLoad: 			false,
			autoHeight:			false,
			dots:				false,
			nav:				false,
			loop:				true,
			responsive: {
				0: {
					items: 1
				},
				500: {
					items: 3
				},
				800: {
					items: 5
				}
			}
		};
		
		if(wpgmaps_localize_global_settings['carousel_lazyload'] == "yes")
			options.lazyLoad = true;
		
		if(!isNaN(wpgmaps_localize_global_settings['carousel_autoplay']))
			options.autoplayTimeout = parseInt(wpgmaps_localize_global_settings['carousel_autoplay']);
		
		if(wpgmaps_localize_global_settings['carousel_autoheight'] == "yes")
			options.autoHeight = true;
		
		if(wpgmaps_localize_global_settings['carousel_pagination'] == "yes")
			options.dots = true;
		
		if(wpgmaps_localize_global_settings['carousel_navigation']  == "yes")
			options.nav = true;
		
		if(!isNaN(wpgmaps_localize_global_settings['carousel_items']))
			options.responsive["800"].items = parseInt(wpgmaps_localize_global_settings['carousel_items']);
		
		if(!isNaN(wpgmaps_localize_global_settings['carousel_items_tablet']))
			options.responsive["500"].items = parseInt(wpgmaps_localize_global_settings['carousel_items_tablet']);
		
		if(!isNaN(wpgmaps_localize_global_settings['carousel_items_mobile']))
			options.responsive["0"].items = parseInt(wpgmaps_localize_global_settings['carousel_items_mobile']);
		
		return options;
	}
	
	WPGMZA.CarouselMarkerListing.prototype.getAJAXRequestParameters = function(params)
	{
		var params = WPGMZA.MarkerListing.prototype.getAJAXRequestParameters.call(this, params);
		
		// The carousel fetches all items, so remove limits
		delete params.data.start;
		delete params.data.length;
		
		return params;
	}
	
	WPGMZA.CarouselMarkerListing.prototype.onHTMLResponse = function(html)
	{
		WPGMZA.MarkerListing.prototype.onHTMLResponse.call(this, html);
		
		$(this.element).owlCarousel(this.getOwlCarouselOptions());
	}
	
	/*$(document).ready(function() {
		
		$("[data-wpgmza-carousel-marker-listing]").each(function(index, el) {
			
			el.wpgmzaCarouselMarkerListing = 
				el.wpgmzaMarkerListing = 
				WPGMZA.CarouselMarkerListing.createInstance(el);
			
		});
		
	});*/
	
});

// js/v8/open-layers/ol-heatmap.js
/**
 * @namespace WPGMZA
 * @module OLHeatmap
 * @requires WPGMZA.Heatmap
 */
jQuery(function($) {
	
	WPGMZA.OLHeatmap = function(row)
	{
		WPGMZA.Heatmap.call(this, row);
		
		var settings = $.extend({
			source: this.getSource()
		}, this.settings);
		
		this.olHeatmap = new ol.layer.Heatmap(settings);
		
		this.updateOLHeatmap();
	}
	
	WPGMZA.OLHeatmap.prototype = Object.create(WPGMZA.Heatmap.prototype);
	WPGMZA.OLHeatmap.prototype.constructor = WPGMZA.OLHeatmap;
	
	/**
	 * Updates the OL heatmap layer
	 * TODO: This shouldn't need a timeout. I haven't been able to figure out why but it cuts the last point off sometimes without this timeout. Maybe the OL interactions have something to do with this, at this point I've already spent nearly 2 hours trying to debug this issue so I'm goint to leave it like this for now. - Perry
	 * NB: This issue may pertain to the above: https://github.com/openlayers/openlayers/issues/6394
	 * @return void
	 */
	WPGMZA.OLHeatmap.prototype.updateOLHeatmap = function()
	{
		var self = this;
		setTimeout(function() {
			self.olHeatmap.setSource(self.getSource());
		}, 1000);
	}
	
	WPGMZA.OLHeatmap.prototype.getSource = function()
	{
		var points = this.points;
		var len = points.length;
		var features = [];
		
		for(var i = 0; i < len; i++)
			features.push(
				new ol.Feature({
					geometry: new ol.geom.Point(ol.proj.fromLonLat([
						points[i].lng,
						points[i].lat
					]))
				})
			);
		
		return new ol.source.Vector({
			features: features
		});
	}
	
	WPGMZA.OLHeatmap.prototype.addPoint = function(latLng)
	{
		WPGMZA.Heatmap.prototype.addPoint.call(this, latLng);
		
		this.updateOLHeatmap();
	}
	
	WPGMZA.OLHeatmap.prototype.removePoint = function(latLng)
	{
		WPGMZA.Heatmap.prototype.removePoint.call(this, latLng);
		
		this.updateOLHeatmap();
	}
	
});

// js/v8/open-layers/ol-pro-info-window.js
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

// js/v8/open-layers/ol-pro-map.js
/**
 * @namespace WPGMZA
 * @module OLProMap
 * @requires WPGMZA.OLMap
 */
jQuery(function($) {
	
	WPGMZA.OLProMap = function(element, options)
	{
		var self = this;
		
		WPGMZA.OLMap.call(this, element, options);
		
		var prevHoveringMapObjects = [];
		
		// Load KML layers
		this.loadKMLLayers();
		
		// Hover interaction
		this.olMap.on("pointermove", function(event) {
			if(event.dragging)
				return;
			
			var pixel = event.map.getEventPixel(event.originalEvent);
			var currentHoveringMapObjects = [];
			
			var hit = event.map.forEachFeatureAtPixel(pixel, function(feature, layer) {
				
				if(layer && layer.wpgmzaObject)
				{
					if(!layer.wpgmzaObject.hovering)
					{
						layer.wpgmzaObject.hovering = true;
						layer.wpgmzaObject.dispatchEvent("mouseover");
					}
					currentHoveringMapObjects.push(layer.wpgmzaObject);
				}
				
				return true;
			});
			
			for(var i = 0; i < prevHoveringMapObjects.length; i++)
			{
				if(currentHoveringMapObjects.indexOf(prevHoveringMapObjects[i]) == -1)
				{
					prevHoveringMapObjects[i].hovering = false;
					prevHoveringMapObjects[i].dispatchEvent("mouseout");
				}
			}
			
			prevHoveringMapObjects = currentHoveringMapObjects;
		});
		
		this.trigger("init");
		
		this.dispatchEvent("created");
		WPGMZA.events.dispatchEvent({type: "mapcreated", map: this});
	}
	
	WPGMZA.OLProMap.prototype = Object.create(WPGMZA.OLMap.prototype);
	WPGMZA.OLProMap.prototype.constructor = WPGMZA.OLMap.prototype;
	
	WPGMZA.OLProMap.prototype.addHeatmap = function(heatmap)
	{
		this.olMap.addLayer(heatmap.olHeatmap);
		
		WPGMZA.ProMap.prototype.addHeatmap.call(this, heatmap);
	}
	
	/**
	 * Loads KML/GeoRSS layers
	 * @return void
	 */
	WPGMZA.OLProMap.prototype.loadKMLLayers = function()
	{
		// Remove old layers
		if(this.kmlLayers)
		{
			for(var i = 0; i < this.kmlLayers.length; i++)
				this.olMap.removeLayer(this.kmlLayers[i]);
		}
		
		this.kmlLayers = [];
		
		if(!this.settings.kml)
			return;
		
		// Add layers
		var urls = this.settings.kml.split(",");
		var cachebuster = new Date().getTime();
		
		for(var i = 0; i < urls.length; i++)
		{
			var layer = new ol.layer.Vector({
				source: new ol.source.Vector({
					url: urls[i],
					format: new ol.format.KML({
						// extractStyle: true,
						extractAttributes: true
					})
				})
			});
			
			this.kmlLayers.push(layer);
			this.olMap.addLayer(layer);
		}
	}
	
});

// js/v8/open-layers/ol-pro-marker.js
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

// js/v8/open-layers/ol-pro-polygon.js
/**
 * @namespace WPGMZA
 * @module OLProPolygon
 * @requires WPGMZA.OLPolygon
 */
jQuery(function($) {
	
	WPGMZA.OLProPolygon = function(row, olFeature)
	{
		var self = this;
		
		WPGMZA.OLPolygon.call(this, row, olFeature);
		
		this.addEventListener("mouseover", function(event) {
			self.onMouseOver(event);
		});
		this.addEventListener("mouseout", function(event) {
			self.onMouseOut(event);
		});
	}
	
	WPGMZA.OLProPolygon.prototype = Object.create(WPGMZA.OLPolygon.prototype);
	WPGMZA.OLProPolygon.prototype.constructor = WPGMZA.OLProPolygon;
	
	WPGMZA.OLProPolygon.prototype.onMouseOver = function(event)
	{
		if(!this.olHoverStyle)
		{
			var params = {};
			
			if(this.settings.hoverOpacity)
				params.fill = new ol.style.Fill({
					color: WPGMZA.hexOpacityToRGBA(this.settings.hoverFillColor, this.settings.hoverOpacity)
				});
				
			if(this.settings.hoverStrokeColor)
				params.stroke = new ol.style.Stroke({
					color: WPGMZA.hexOpacityToRGBA(this.settings.hoverStrokeColor, 1)
				});
				
			this.olHoverStyle = new ol.style.Style(params);
		}
		
		this.layer.setStyle(this.olHoverStyle);
	}
	
	WPGMZA.OLProPolygon.prototype.onMouseOut = function(event)
	{
		this.layer.setStyle(this.olStyle);
	}
	
});