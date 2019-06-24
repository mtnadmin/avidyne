<?php

namespace WPGMZA;

class CategoryTreeNode
{
	public $id;
	public $name;
	public $children;
	public $parent;
	public $marker_count = 0;
	
	public function __construct($parent=null)
	{
		$this->children = array();
	}
	
	public function getChildByID($id)
	{
		if($this->id == $id)
			return $this;
		
		foreach($this->children as $child)
		{
			if($result = $child->getChildByID($id))
				return $result;
		}
		
		return null;
	}
	
	public function getAncestors()
	{
		$result = array();
		
		for($node = $this->parent; $node != null; $node = $node->parent)
			$result[] = $node;
		
		return $result;
	}
	
	public function getDescendants()
	{
		$result = array();
		
		foreach($this->children as $child)
		{
			$result[] = $child;
			$result = array_merge($result, $child->getDescendants());
		}
			
		return $result;
	}
	
	public function getLeafNodes()
	{
		$result = array();
		$descendants = $this->getDescendants();
		
		foreach($descendants as $node)
			if(empty($node->children))
				$result[] = $node;
			
		return $result;
	}
}
