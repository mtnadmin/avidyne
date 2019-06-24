<?php

namespace WPGMZA;

class AddMapDialog extends ModalDialog
{
	public function __construct()
	{
		ModalDialog::__construct();
		
		$this->loadPHPFile(plugin_dir_path(__DIR__) . 'html/add-map-dialog.html.php');
		
		wp_enqueue_script('wpgmza_dummy', plugin_dir_url(__DIR__) . 'dummy.js');
		wp_localize_script('wpgmza_dummy', 'wpgmza_map_select_dialog_html', $this->saveInnerBody());
		
		$apiLoader = new GoogleMapsAPILoader();
		$apiLoader->enqueueGoogleMaps();
	}
	
	public static function onQuickCreateMap()
	{
		$map = new Map(array(
			'map_title' 			=> $_POST['title'],
			'map_start_lat' 		=> $_POST['lat'],
			'map_start_lng' 		=> $_POST['lng'],
			'map_start_location'	=> $_POST['lat'] . ',' . $_POST['lng']
		));
		
		$marker = new Marker(array(
			'map_id' 				=> $map->id,
			'title' 				=> $_POST['title'],
			'address' 				=> $_POST['address'],
			'lat' 					=> $_POST['lat'],
			'lng' 					=> $_POST['lng']
		));
		
		$response = array(
			'success' => true,
			'map_id' => $map->id
		);
		
		wp_send_json($response);

		exit;
	}
}

add_action('wp_ajax_wpgmza_quick_create_map', array('WPGMZA\\AddMapDialog', 'onQuickCreateMap'));
