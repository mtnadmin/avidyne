<?php

namespace WPGMZA;

class MarkerListing extends AjaxTable
{
	const STYLE_NONE					= 0;
	const STYLE_BASIC_TABLE				= 1;
	const STYLE_BASIC_LIST 				= 4;
	const STYLE_ADVANCED_TABLE			= 2;
	const STYLE_CAROUSEL				= 3;
	const STYLE_MODERN					= 6;
	
	const ORDER_BY_ID					= 1;
	const ORDER_BY_TITLE				= 2;
	const ORDER_BY_ADDRESS				= 3;
	const ORDER_BY_DESCRIPTION			= 4;
	const ORDER_BY_CATEGORY				= 5;
	const ORDER_BY_CATEGORY_PRIORITY	= 6;
	const ORDER_BY_DISTANCE				= 7;
	
	const ORDER_ASC						= 1;
	const ORDER_DESC					= 2;
	
	private static $_cachedColumnNames;
	protected $map;
	
	// TODO: Pass the map object rather than ID
	public function __construct($map_id)
	{
		global $wpdb;
		global $wpgmza;
		
		AjaxTable::__construct("{$wpdb->prefix}wpgmza", '/marker-listing/');
		
		$this->map = Map::createInstance($map_id);
		
		// HTML attributes
		$this->element->setAttribute('data-wpgmza-marker-listing', null);
		
		// Legacy HTML
		if($wpgmza->settings->useLegacyHTML)
		{
			$this->element->addClass('wpgmza_marker_list_class');
			$this->element->setInlineStyle('width', '100%');
		}
		
		// Pagination
		$proDir = plugin_dir_url(dirname(__DIR__));
		wp_enqueue_style('wpgmza_pagination', $proDir . 'lib/pagination.css');
		wp_enqueue_script('wpgmza_pagination', $proDir . 'lib/pagination.min.js');
	}
	
	public function __get($name)
	{
		global $wpgmza;
		
		switch($name)
		{
			case 'hideIcon':
				return !empty($wpgmza->settings->wpgmza_settings_markerlist_icon);
				break;
			
			case 'hideLink':
				return !empty($wpgmza->settings->wpgmza_settings_markerlist_link);
				break;
			
			case 'hideTitle':
				return !empty($wpgmza->settings->wpgmza_settings_markerlist_title);
				break;
			
			case 'hideAddress':
				return !empty($wpgmza->settings->wpgmza_settings_markerlist_address);
				break;
			
			case 'hideCategories':
				// Only applicable for AdvancedTable
				break;
				
			case 'hideDescription':
				return !empty($wpgmza->settings->wpgmza_settings_markerlist_description);
				break;
		}
		
		return AjaxTable::__get($name);
	}
	
	protected function getItemHTMLPath()
	{
		global $wpgmza;
		
		$path = plugin_dir_path(dirname(__DIR__)) . 'html/marker-listings/';
		
		if($wpgmza->settings->useLegacyHTML)
			$path .= 'legacy/';
		
		return $path;
	}
	
	public function getColumns()
	{
		global $wpdb;
		
		if(empty(MarkerListing::$_cachedColumnNames))
		{
			$cols = $wpdb->get_col("SHOW COLUMNS FROM {$this->table_name}");
			MarkerListing::$_cachedColumnNames = array_combine($cols, $cols);
		}
		
		$result = (array)MarkerListing::$_cachedColumnNames;
		
		return $result;
	}
	
	protected function filterColumns(&$columns, $input_params)
	{
		AjaxTable::filterColumns($columns, $input_params);
		
		foreach($columns as $key => $value)
		{
			$name = $this->getColumnNameByIndex($key);
			
			switch($name)
			{					
				case 'icon':
				
					$columns[$key] = \WPGMZA\ProMarker::getIconSQL($this->map->id);
					
					break;
			}
		}
		
		if($this->map->order_markers_by == MarkerListing::ORDER_BY_DISTANCE && !empty($input_params['filteringParams']['center']))
		{
			$lat = floatval($input_params['filteringParams']['center']['lat']) / 180 * 3.1415926;
			$lng = floatval($input_params['filteringParams']['center']['lng']) / 180 * 3.1415926;
			
			$columns['distance'] = "
				(
					6381 *
				
					2 *
				
					ATAN2(
						SQRT(
							POW( SIN( ( (X(latlng) / 180 * 3.1415926) - $lat ) / 2 ), 2 ) +
							COS( X(latlng) / 180 * 3.1415926 ) * COS( $lat ) *
							POW( SIN( ( (Y(latlng) / 180 * 3.1415926) - $lng ) / 2 ), 2 )
						),
						
						SQRT(1 - 
							(
								POW( SIN( ( (X(latlng) / 180 * 3.1415926) - $lat ) / 2 ), 2 ) +
								COS( X(latlng) / 180 * 3.1415926 ) * COS( $lat ) *
								POW( SIN( ( (Y(latlng) / 180 * 3.1415926) - $lng ) / 2 ), 2 )
							)
						)
					)
				) AS distance
			";
		}
		
		return $columns;
	}
	
	public function filterOrderBy($orderBy, $keys)
	{
		global $WPGMZA_TABLE_NAME_MARKERS;
		global $WPGMZA_TABLE_NAME_MARKERS_HAS_CATEGORIES;
		global $WPGMZA_TABLE_NAME_CATEGORIES;
		
		$column = (empty($this->map->order_markers_by) ? MarkerListing::ORDER_BY_ID : $this->map->order_markers_by);
		
		switch($column)
		{
			case MarkerListing::ORDER_BY_TITLE:
				$orderBy = "title";
				break;
				
			case MarkerListing::ORDER_BY_ADDRESS:
				$orderBy = "address";
				break;
				
			case MarkerListing::ORDER_BY_DESCRIPTION:
				$orderBy = "description";
				break;
				
			case MarkerListing::ORDER_BY_CATEGORY:
				$orderBy = "category";
				break;
				
			case MarkerListing::ORDER_BY_CATEGORY_PRIORITY:
				return "(
					SELECT MAX(priority) FROM $WPGMZA_TABLE_NAME_CATEGORIES
					WHERE $WPGMZA_TABLE_NAME_CATEGORIES.id IN (
						SELECT category_id FROM $WPGMZA_TABLE_NAME_MARKERS_HAS_CATEGORIES
						WHERE marker_id = $WPGMZA_TABLE_NAME_MARKERS.id
					)
				)";
				break;
				
			case MarkerListing::ORDER_BY_DISTANCE:
				if(!empty($_REQUEST['filteringParams']['center']))
				{
					$orderBy = "distance";
					break;
				}
				
			default:
				$orderBy = "$WPGMZA_TABLE_NAME_MARKERS.id";
				break;
		}
		
		return $orderBy;
	}
	
	public function filterOrderDirection($input_params)
	{
		$dir = (empty($this->map->order_markers_choice) ? MarkerListing::ORDER_DESC : $this->map->order_markers_choice);
		
		return ($dir == MarkerListing::ORDER_DESC ? 'DESC' : 'ASC');
	}
	
	public function setAjaxParameters($params)
	{
		global $wpgmza;
		
		AjaxTable::setAjaxParameters($params);
		
		$obj = (object)$params;
		
		if($wpgmza->settings->useLegacyHTML && property_exists($obj, 'map_id'))
			$this->element->setAttribute('id', 'wpgmza_marker_list_' . $obj->map_id);
	}
	
	public function getImageDimensions()
	{
		global $wpgmza;
		
		$dimensions = (object)array(
			'width'		=> 100,
			'height'	=> 'auto'
		);
		
		if(!empty($wpgmza->settings->wpgmza_settings_image_width))
			$dimensions->width = $wpgmza->settings->wpgmza_settings_image_width;
		
		if(!empty($wpgmza->settings->wpgmza_settings_image_height))
			$dimensions->height = $wpgmza->settings->wpgmza_settings_image_height;
		
		return $dimensions;
	}
	
	protected function removeHiddenFields($item, $marker)
	{
		global $wpgmza;
		
		// Hide the icon if setting is selected
		if($this->hideIcon && $el = $item->querySelector('.wpgmza_marker_icon'))
			$el->remove();
		
		// Hide the link if selected
		if($link = $item->querySelector('.wpgmza-link, .wpgmza_marker_link'))
		{
			if(empty($marker->link) || $this->hideLink)
				$link->remove();
		}
		
		// Hide title if selected
		if($this->hideTitle && $el = $item->querySelector('.wpgmza_marker_title, .wpgmza_div_title'))
			$el->remove();
		
		// Hide address if selected
		if($this->hideAddress && $el = $item->querySelector('.wpgmza_div_address, .wpgmza-address, .wpgmza_marker_address'))
			$el->remove();
		
		// Hide description if selected
		if($this->hideDescription && $el = $item->querySelector('.wpgmza-desc, .wpgmza_marker_description'))
			$el->remove();
	}
	
	protected function appendListingItem($document, $item, $marker)
	{
		global $wpgmza;
		
		$container = $document->querySelector('body');
		
		if($wpgmza->settings->useLegacyHTML)
		{
			$even = ($container->childNodes->length % 2 == 1);
			$item->addClass(($even ? 'wpgmaps_even' : 'wpgmaps_odd'));
		}
		
		$this->removeHiddenFields($item, $marker);
		
		$container->appendChild($item);
	}
	
	public static function createInstanceFromStyle($style, $map_id)
	{
		$class = apply_filters('wpgmza_get_marker_listing_class_from_style', $style);
		
		if(!$class)
			return null;
		
		return $class::createInstance($map_id);
	}
}

// TODO: Don't use a closure, allow this filter to be removed
add_filter('wpgmza_get_marker_listing_class_from_style', function($style) {
	
	switch($style)
	{
		case MarkerListing::STYLE_BASIC_TABLE:
			return '\WPGMZA\MarkerListing\BasicTable';
			break;
			
		case MarkerListing::STYLE_BASIC_LIST:
			return '\WPGMZA\MarkerListing\BasicList';
			break;
			
		case MarkerListing::STYLE_ADVANCED_TABLE:
			return '\WPGMZA\MarkerListing\AdvancedTable';
			break;
			
		case MarkerListing::STYLE_CAROUSEL:
			return '\WPGMZA\MarkerListing\Carousel';
			break;
			
		case MarkerListing::STYLE_MODERN:
			return '\WPGMZA\MarkerListing\Modern';
			break;
	}
	
	return null;
	
}, 1, 1);
