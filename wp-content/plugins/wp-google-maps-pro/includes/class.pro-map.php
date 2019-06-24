<?php

namespace WPGMZA;

$dir = preg_replace('/wp-google-maps-pro/', 'wp-google-maps', __DIR__);

require_once(plugin_dir_path($dir) . 'includes/class.factory.php');
require_once(plugin_dir_path($dir) . 'includes/class.crud.php');
require_once(plugin_dir_path($dir) . 'includes/class.map.php');

class ProMap extends Map
{
	public function __construct($id_or_fields=-1)
	{
		Map::__construct($id_or_fields);
	}
	
	public function isDirectionsEnabled()
	{
		global $wpgmza;
		
		if($wpgmza->settings->engine != "google-maps")
			return false;
		
		if($this->directions_enabled == "1")
			return true;
		
		return false;
	}
}

add_filter('wpgmza_create_WPGMZA\\Map', function($id_or_fields) {
	
	return new ProMap($id_or_fields);
	
});
