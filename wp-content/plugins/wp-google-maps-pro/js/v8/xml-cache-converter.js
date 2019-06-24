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