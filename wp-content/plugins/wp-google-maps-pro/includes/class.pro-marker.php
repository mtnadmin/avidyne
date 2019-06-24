<?php

namespace WPGMZA;

class ProMarker extends Marker
{
	public function __construct($id_or_fields=-1)
	{
		Marker::__construct($id_or_fields);
	}
	
	public static function getIconSQL($map_id=null, $as_html_tag=false)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MARKERS;
		global $WPGMZA_TABLE_NAME_MAPS;
		global $WPGMZA_TABLE_NAME_CATEGORIES;
		global $WPGMZA_TABLE_NAME_MARKERS_HAS_CATEGORIES;
		
		$default = Marker::DEFAULT_ICON;
		
		$map_id = intval($map_id);
		
		$concat_prefix = ($as_html_tag ? "<img src=\"" : '');
		$concat_suffix = ($as_html_tag ? "\">" : '');
		
		$result = "(
			CASE WHEN LENGTH(icon) > 0 THEN 
				CONCAT(
					'" . ($as_html_tag ? "<img class=\"wpgmza-custom-marker-icon\" src=\"" : '') . "', 
					icon,
					'$concat_suffix'
				)
			WHEN (
				SELECT COUNT(*) FROM $WPGMZA_TABLE_NAME_CATEGORIES
				WHERE LENGTH(category_icon) > 0
				AND $WPGMZA_TABLE_NAME_CATEGORIES.id IN (
					SELECT category_id
					FROM $WPGMZA_TABLE_NAME_MARKERS_HAS_CATEGORIES
					WHERE marker_id = $WPGMZA_TABLE_NAME_MARKERS.id
				)
				LIMIT 1
			) THEN CONCAT(
				'" . ($as_html_tag ? "<img class=\"wpgmza-category-marker-icon\" src=\"" : '') . "',
				(
					SELECT category_icon FROM $WPGMZA_TABLE_NAME_CATEGORIES
					WHERE $WPGMZA_TABLE_NAME_CATEGORIES.id IN (
						SELECT category_id
						FROM $WPGMZA_TABLE_NAME_MARKERS_HAS_CATEGORIES
						WHERE marker_id = $WPGMZA_TABLE_NAME_MARKERS.id
					)
					ORDER BY priority DESC
					LIMIT 1
				),
				'$concat_suffix'
			)
			WHEN (
				SELECT LENGTH(default_marker) FROM $WPGMZA_TABLE_NAME_MAPS WHERE $WPGMZA_TABLE_NAME_MAPS.id = $map_id
			) > 0
			AND (
				SELECT default_marker FROM $WPGMZA_TABLE_NAME_MAPS WHERE $WPGMZA_TABLE_NAME_MAPS.id = $map_id
			) <> '0'
			THEN
				CONCAT(
					'" . ($as_html_tag ? "<img class=\"wpgmza-map-marker-icon\" src=\"" : '') . "',
					(
						SELECT default_marker 
						FROM $WPGMZA_TABLE_NAME_MAPS
						WHERE $WPGMZA_TABLE_NAME_MAPS.id = map_id
					),
					'$concat_suffix'
				)
			ELSE
				CONCAT(
					'" . ($as_html_tag ? "<img class=\"wpgmza-default-marker-icon\" src=\"" : '') . "', 
					'$default',
					'$concat_suffix'
				)
			END
		) AS icon";
		
		return $result;
	}
}

add_filter('wpgmza_create_WPGMZA\\Marker', function($id_or_fields=-1) {
	
	return new ProMarker($id_or_fields);
	
}, 10, 1);