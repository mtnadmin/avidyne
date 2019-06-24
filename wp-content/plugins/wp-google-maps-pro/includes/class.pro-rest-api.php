<?php

namespace WPGMZA;

class ProRestAPI extends RestAPI
{
	public function __construct()
	{
		RestAPI::__construct();
	}
	
	public function onRestAPIInit()
	{
		RestAPI::onRestAPIInit();
		
		register_rest_route(RestAPI::NS, '/marker-listing/', array(
			'methods' => array('GET', 'POST'),
			'callback' => array($this, 'markerListing')
		));
	}
	
	public function markerListing($request)
	{
		$request = $_REQUEST;
		$map_id = $request['map_id'];
		
		$class = '\\' . stripslashes( $request['phpClass'] );
		$instance = $class::createInstance($map_id);
		
		if(!($instance instanceof MarkerListing))
			return WP_Error('wpgmza_invalid_datatable_class', 'Specified PHP class must extend WPGMZA\\MarkerListing', array('status' => 403));
		
		$response = $instance->getAjaxResponse($request);
		
		return $response;
	}
}

add_filter('wpgmza_create_WPGMZA\\RestAPI', function() {
	
	return new ProRestAPI();
	
}, 10, 0);
