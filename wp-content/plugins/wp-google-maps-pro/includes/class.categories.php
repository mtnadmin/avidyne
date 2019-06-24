<?php

namespace WPGMZA;

class Categories
{
	public static function createMarkersHasCategoriesTable()
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MARKERS_HAS_CATEGORIES;
		
		$stmt = $wpdb->prepare("SHOW TABLES LIKE %s", array($WPGMZA_TABLE_NAME_MARKERS_HAS_CATEGORIES));
		$table = $wpdb->get_var($stmt);
		
		if($table)
			return;
		
		$wpdb->query("CREATE TABLE `$WPGMZA_TABLE_NAME_MARKERS_HAS_CATEGORIES` (
				marker_id int(11) NOT NULL,
				category_id int(11) NOT NULL,
				PRIMARY KEY  (marker_id, category_id)
			) ENGINE=InnoDB DEFAULT CHARSET=utf8;
		");
	}
	
	public static function migrateMarkerCategoryField()
	{
		global $wpdb;
		global $wpgmza_tblname;
		
		Categories::createMarkersHasCategoriesTable();
		
		$markers = $wpdb->get_results("SELECT id, category FROM $wpgmza_tblname");
		
		foreach($markers as $marker)
		{
			if(empty($marker->category))
				continue;
			
			$categories = explode(',', $marker->category);
			
			foreach($categories as $category_id)
				$wpdb->query("INSERT INTO $WPGMZA_TABLE_NAME_MARKERS_HAS_CATEGORIES (marker_id, category_id) VALUES ({$marker->id}, {$category_id})");
		}
	}
}

