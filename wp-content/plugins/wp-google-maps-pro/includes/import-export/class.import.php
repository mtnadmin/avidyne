<?php
/**
 * WP Google Maps Pro Import / Export API: Import abstract class
 *
 * @package WPGMapsPro\ImportExport
 * @since 7.0.0
 */

namespace WPGMZA;

/**
 * Importer for WP Google Maps Pro
 *
 * This handles importing of files.
 *
 * @since 7.0.0
 */
abstract class Import {

	/**
	 * Absolute path to file.
	 *
	 * @var string $file Absolute path to file.
	 */
	protected $file = '';

	/**
	 * URL to file.
	 *
	 * @var string $file URL to file.
	 */
	protected $file_url = '';

	/**
	 * Decoded file data.
	 *
	 * @var mixed $file_data Decoded file data.
	 */
	protected $file_data = null;

	/**
	 * Import options.
	 *
	 * @var array $options Import options.
	 */
	protected $options = array();

	/**
	 * Database insertion defaults.
	 *
	 * @var array $db_defaults Array of object types with key value pairs of default data.
	 */
	protected $db_defaults = array();
	
	private $recorded_start_time;
	
	/**
	 * Import constructor.
	 *
	 * @throws \Exception If unable to load file.
	 *
	 * @param string $file     Optional. Absolute path to file.
	 * @param string $file_url Optional. URL to file.
	 * @param array  $options  Optional. Import options.
	 */
	public function __construct( $file = '', $file_url = '', $options = array() ) {

		$this->options = $options;
		if ( file_exists( $file ) ) {

			$this->file = $file;

		}

		if ( strpos( $file_url, 'http' ) === 0 ) {

			$this->file_url = $file_url;

		}

		$this->load_file();
		$this->parse_file();
		
		if ( empty( $this->file_data ) ) {

			throw new \Exception( __( 'Error: Unable to load file.', 'wp-google-maps' ) );

		}

		$this->options = $options;
		$this->check_options();
		
		$this->record_start_time();
		$this->attempt_set_time_limit();
	}

	/**
	 * Sanitize options.
	 */
	abstract protected function check_options();

	/**
	 * Check ids.
	 *
	 * @throws \Exception On bad id.
	 *
	 * @param array $ids Integer array of ids.
	 * @return array Integer array of ids.
	 */
	protected function check_ids( $ids ) {

		$id_count = count( $ids );

		for ( $i = 0; $i < $id_count; $i++ ) {

			if ( ! is_numeric( $ids[ $i ] ) ) {

				throw new \Exception( __( 'Error: Malformed options. Bad id.', 'wp-google-maps' ) );

			}

			$ids[ $i ] = absint( $ids[ $i ] );

			if ( $ids[ $i ] < 1 ) {

				throw new \Exception( __( 'Error: Malformed options. Bad id.', 'wp-google-maps' ) );

			}
		}

		return $ids;

	}

	/**
	 * Load file data from file.
	 */
	protected function load_file() {

		if ( ! empty( $this->file ) ) {

			$file_contents = file_get_contents( $this->file );

			if ( ! empty( $file_contents ) ) {

				$this->file_data = $file_contents;

			}
			
		}

		if ( empty( $file_contents ) && ! empty( $this->file_url ) ) {

			$file_contents = wp_remote_get( $this->file_url );
			
			if ( ! is_wp_error( $file_contents ) ) {

				$this->file_data = wp_remote_retrieve_body( $file_contents );

			}
		}
	}
	
	protected function attempt_set_time_limit()
	{
		$desired_time_limit = 60 * 15;
		
		if(function_exists('set_time_limit'))
			set_time_limit($desired_time_limit);
		
		if(function_exists('get_time_limit'))
			ini_set('max_execution_time', $desired_time_limit);
	}
	
	protected function record_start_time()
	{
		$this->recorded_start_time = time();
	}
	
	protected function get_time_limit()
	{
		if(function_exists('ini_get'))
			return (int)ini_get('max_execution_time');
		
		return 30; // PHP default
	}
	
	protected function get_remaining_time()
	{
		$now = time();
		$elapsed = (int)$now - (int)$this->recorded_start_time;
		$limit = $this->get_time_limit();
		
		return $limit - $elapsed;
	}
	
	protected function bail_if_near_time_limit()
	{
		$remaining = $this->get_remaining_time();
		$threshold = 5;
		
		if($remaining < $threshold)
			throw new \Exception(__('Time limit threshold reached. Please speak to your host to increase your PHP execution time limit, or break your data into smaller parts', 'wp-google-maps'));
	}

	/**
	 * Parse file data.
	 */
	abstract protected function parse_file();

	/**
	 * Output admin import options.
	 *
	 * @return string Options html.
	 */
	abstract public function admin_options();

	/**
	 * Import the file.
	 */
	abstract public function import();
	
	public function onImportComplete()
	{
		global $wpdb;
		global $wpgmza_tblname_maps;
		
		// TODO: Use global settings module
		$settings = get_option('WPGMZA_OTHER_SETTINGS');
		
		if(!empty($settings['wpgmza_settings_marker_pull']) && $settings['wpgmza_settings_marker_pull'] == '1') // TODO: Replace with constant
		{
			$map_ids = $wpdb->get_col("SELECT id FROM $wpgmza_tblname_maps");
			
			foreach($map_ids as $map_id)
				wpgmaps_update_xml_file($map_id);
		}
		
		do_action('wpgmza_import_complete');
	}

	/**
	 * Sets the import progress for this session.
	 *
	 * @param float $value A number between 0 and 1 representing the progress.
	 */
	public function set_progress( $value ) {

		@session_start();

		$_SESSION['wpgmza_import_progress_' . $_POST['wpgmaps_security']] = $value;

		session_write_close();

	}

	/**
	 * Returns HTML for the admin notices.
	 *
	 * @return string
	 */
	public function get_admin_notices() {

		return '';

	}

	/**
	 * Geocode.
	 *
	 * @param string $location Either an address or latitude, longitude coordinates.
	 * @param string $type     Optional. 'address' to geocode, 'latlng' to reverse geocode. Default 'address'.
	 * @return string|array|bool Address or array of latitude and longitude, false on failure or no results.
	 */
	protected function geocode( $location, $type = 'address' ) {

		$api_key = get_option( 'wpgmza_google_maps_api_key' );

		if ( empty( $api_key ) || empty( $location ) || ( 'address' !== $type && 'latlng' !== $type ) ) {

			return false;

		}

		$url = add_query_arg( array(
			$type => rawurlencode( $location ),
			'key' => $api_key,
		), 'https://maps.googleapis.com/maps/api/geocode/json' );

		$start_time = microtime( true );

		$response = wp_remote_get( $url );

		if ( is_wp_error( $response ) ) {

			return false;

		}

		$response = wp_remote_retrieve_body( $response );
		$response = json_decode( $response );

		$this->geocode_response = $response;

		$result = false;

		switch ( $type ) {

			case 'address':

				if ( isset( $response->results[0]->geometry->location->lat, $response->results[0]->geometry->location->lng ) ) {

					$result = array( $response->results[0]->geometry->location->lat, $response->results[0]->geometry->location->lng );

				}
				break;

			case 'latlng':

				if ( isset( $response->results[0]->formatted_address ) ) {

					$result = $response->results[0]->formatted_address;

				}
				break;

		}

		$end_time = microtime( true );
		$delta_time = $end_time - $start_time;
		$min_time_between_requests = 1000000 / 10;

		if ( $delta_time < $min_time_between_requests ) {

			$delay = $min_time_between_requests - $delta_time;
			usleep( $delay );

		}

		return $result;

	}
}
