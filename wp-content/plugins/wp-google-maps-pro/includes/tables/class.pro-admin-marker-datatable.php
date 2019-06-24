<?php

namespace WPGMZA;

class ProAdminMarkerDataTable extends AdminMarkerDataTable
{
	public function __construct($ajax_parameters=null)
	{
		AdminMarkerDataTable::__construct($ajax_parameters);
	}
	
	protected function getActionButtons()
	{
		global $wpgmza_ugm_version;
		
		$string = AdminMarkerDataTable::getActionButtons();
		
		if(!empty($wpgmza_ugm_version))
		{
			if(!preg_match('/REPLACE\((.+\')/msi', $string, $m, PREG_OFFSET_CAPTURE))
				return $string;
			
			$inside = $m[1][0];
			$inside_original_length = strlen($inside);
			$inside_position = $m[1][1];
			
			if(!preg_match('/<a.+?class="wpgmza_del_btn/', $inside, $m, PREG_OFFSET_CAPTURE))
				return $string;
			
			$button_insert_position = $m[0][1];
			$button_html = '<a href="javascript: ;" 
				title="' . esc_attr( __('Approve this marker', 'wp-google-maps') ) . '" 
				class="wpgmza_approve_btn button" 
				id="' . AdminMarkerDataTable::ID_PLACEHOLDER . '">
					<i class="fa fa-check"></i>
				</a>';
			
			$before = substr($inside, 0, $button_insert_position);
			$after = substr($inside, $button_insert_position);
			
			$replacement = "CONCAT($before', 
			
				CASE WHEN approved = '0' THEN '$button_html'
				ELSE '' END,
				
			'$after)";
			
			$result = substr_replace($string, $replacement, $inside_position, $inside_original_length);
			
			return $result;
		}
		
		return $string;
	}
	
	protected function filterColumns(&$columns, $input_params)
	{
		global $WPGMZA_TABLE_NAME_MARKERS;
		global $WPGMZA_TABLE_NAME_CATEGORIES;
		global $WPGMZA_TABLE_NAME_MARKERS_HAS_CATEGORIES;
		
		AdminMarkerDataTable::filterColumns($columns, $input_params);
		
		// Temporary workaround for map ID not passed through datatables endpoint
		if(isset($_REQUEST['wpgmzaDataTableRequestData']))
			$map_id = (int)$_REQUEST['wpgmzaDataTableRequestData']['map_id'];
		
		foreach($columns as $key => $value)
		{
			$name = $this->getColumnNameByIndex($key);
			
			switch($name)
			{
				case 'icon':
					
					// TODO: Update to use ProMarker::getIconSQL. Need to transmit map_id first
					$columns[$key] = ProMarker::getIconSQL($map_id, true);
					
					break;
				
				case 'category':
					
					$columns[$key] = "(
						SELECT GROUP_CONCAT(category_name SEPARATOR ', ')
						FROM $WPGMZA_TABLE_NAME_CATEGORIES
						WHERE $WPGMZA_TABLE_NAME_CATEGORIES.id IN (
							SELECT category_id
							FROM $WPGMZA_TABLE_NAME_MARKERS_HAS_CATEGORIES
							WHERE marker_id = $WPGMZA_TABLE_NAME_MARKERS.id
						)
					) AS category";
						
					break;
					
				case 'description':
				
					$columns[$key] = 'description';
				
					break;
					
				case 'pic':
				
					$columns[$key] = "(
						CASE WHEN LENGTH(pic)=0 THEN 
							''
						ELSE 
							CONCAT(
								'<img src=\"', 
								pic,
								'\" width=\"40\"/>'
							)
						END
					) AS pic";
				
					break;
					
				case 'link':
					
					$columns[$key] = "(
					
						CASE WHEN LENGTH(link)=0 THEN 
							''
						ELSE 
							CONCAT(
								'<a href=\"',
								link,
								'\" target=\"_blank\">&gt;&gt;</a>'
							)
						END
					
					) AS link";
				
					break;
			}
		}
		
		return $columns;
	}
}

add_filter('wpgmza_create_WPGMZA\\AdminMarkerDataTable', function($ajax_parameters=null) {
	
	return new ProAdminMarkerDataTable($ajax_parameters);
	
});
