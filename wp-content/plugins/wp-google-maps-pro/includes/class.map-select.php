<?php

namespace WPGMZA;

class MapSelect
{
	public function __construct()
	{
		
	}
	
	public function html()
	{
		global $wpdb;
		
		$maps = $wpdb->get_results("SELECT id, map_title FROM {$wpdb->prefix}wpgmza_maps");
		
		$options = "";
		foreach($maps as $map)
			$options .= "<option value='{$map->id}'>" . htmlentities($map->map_title) . "</option>";
		
		$html = '<select name="map">' . $options . '</select>';
		
		return $html;
	}
}