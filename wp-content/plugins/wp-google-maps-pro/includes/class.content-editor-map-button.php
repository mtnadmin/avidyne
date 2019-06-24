<?php

namespace WPGMZA;

require_once(plugin_dir_path(__FILE__) . 'class.add-map-dialog.php');

class ContentEditorMapButton
{
	public static $dialog;
	
	public static function enqueue()
	{
		global $wpdb;
		
		wp_enqueue_script('wpgmza-content-editor-map-button',  plugin_dir_url(__DIR__) . 'js/content-editor-map-button.js');
		
		ContentEditorMapButton::$dialog = new AddMapDialog();
	}
	
	public static function render()
	{
		echo '<a href="#" class="button wpgmza-content-editor-add-map">
				<span class="dashicons dashicons-location-alt"></span>
				' . __('Add Map', 'wp-google-maps') . '
			</a>';
	}
}

// TODO: Re-enable
//add_action('media_buttons', array('WPGMZA\\ContentEditorMapButton', 'render'));
//add_action('admin_enqueue_scripts', array('WPGMZA\\ContentEditorMapButton', 'enqueue'));
