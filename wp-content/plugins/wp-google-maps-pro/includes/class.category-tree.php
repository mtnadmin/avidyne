<?php

namespace WPGMZA;

require_once(plugin_dir_path(__FILE__) . 'class.category-tree-node.php');

class CategoryTree extends CategoryTreeNode
{
	public function __construct($map=null)
	{
		global $wpdb;
		global $wpgmza;
		global $WPGMZA_TABLE_NAME_MARKERS;
		global $WPGMZA_TABLE_NAME_CATEGORIES;
		global $WPGMZA_TABLE_NAME_MARKERS_HAS_CATEGORIES;
		
		CategoryTreeNode::__construct();
		
		$this->id = "0";
		$this->name = apply_filters('wpgmza_all_categories_text', __('All Categories', 'wp-google-maps'));
		
		// Build the tree
		$qstr = "SELECT *,
			(
				SELECT COUNT(marker_id) 
				FROM $WPGMZA_TABLE_NAME_MARKERS_HAS_CATEGORIES 
				WHERE category_id=$WPGMZA_TABLE_NAME_CATEGORIES.id 
				AND marker_id IN
				(
					SELECT id FROM $WPGMZA_TABLE_NAME_MARKERS 
					WHERE 
					" . ($map == null ? '' : 'map_id = %d AND') . "
					approved = 1
				)
			) AS marker_count 
			FROM $WPGMZA_TABLE_NAME_CATEGORIES
			ORDER BY priority";
		
		$params = array();
		if($map)
			$params[] = $map->id;
		
		$qstr = apply_filters('wpgmza_category_tree_query_string', $qstr);
		$params = apply_filters('wpgmza_category_tree_query_params', $params);
		
		if(!empty($params))
			$stmt = $wpdb->prepare($qstr, $params);
		else
			$stmt = $qstr;
		
		$categoryData = $wpdb->get_results($stmt);
		
		$nodesByID = array(
			"0" => $this
		);
		
		// Create nodes
		foreach($categoryData as $obj)
		{
			$node = new CategoryTreeNode();
			
			foreach($obj as $key => $value)
			{
				$node->{$key} = $value;
			}
			
			$nodesByID[$obj->id] = $node;
		}
		
		// Build the structure
		foreach($nodesByID as $id => $node)
		{
			$parentID = $node->parent;
			
			if($node == $this)
				continue;
			
			if(!isset($nodesByID[$parentID]))
			{
				if($wpgmza->isInDeveloperMode() && !(defined( 'DOING_AJAX' ) && DOING_AJAX))
					trigger_error("Parent category $parentID missing", E_USER_NOTICE);
				
				// Drop the node
				unset($nodesByID[$id]);
				
				continue;
			}
			
			$parent = $nodesByID[$parentID];
			$parent->children[] = $node;
			$node->parent = $parent;
		}
		
		// Get hierarchical marker count
		foreach($nodesByID as $node)
			$node->own_marker_count = $node->marker_count = (int)$node->marker_count;
		
		$leafNodes = $this->getLeafNodes();
		foreach($leafNodes as $node)
		{
			$accum = $node->own_marker_count;
			$ancestors = $node->getAncestors();
			
			foreach($ancestors as $ancestor)
			{
				$ancestor->marker_count += $accum;
				$accum += $ancestor->own_marker_count;
			}
		}
	}
}
