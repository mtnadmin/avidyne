/**
 * @namespace WPGMZA.Integration
 * @module ProGutenberg
 * @requires WPGMZA.Gutenberg
 */

/**
 * Internal block libraries
 */
jQuery(function($) {
	
	if(!window.wp || !wp.i18n || !wp.blocks || !wp.editor || !wp.components)
		return;
	
	const { __ } = wp.i18n;

	const { registerBlockType } = wp.blocks;

	const {
		InspectorControls,
		BlockControls
	} = wp.editor;

	const {
		Dashicon,
		Toolbar,
		Button,
		Tooltip,
		PanelBody,
		TextareaControl,
		TextControl,
		RichText,
		SelectControl
	} = wp.components;
	
	WPGMZA.Integration.ProGutenberg = function()
	{
		WPGMZA.Integration.Gutenberg.call(this);
	}
	
	WPGMZA.Integration.ProGutenberg.prototype = Object.create(WPGMZA.Integration.Gutenberg.prototype);
	WPGMZA.Integration.ProGutenberg.prototype.constructor = WPGMZA.Integration.ProGutenberg;
	
	WPGMZA.Integration.Gutenberg.getConstructor = function()
	{
		return WPGMZA.Integration.ProGutenberg;
	}
	
	WPGMZA.Integration.ProGutenberg.prototype.getMapSelectOptions = function()
	{
		var result = [];
		
		WPGMZA.gutenbergData.maps.forEach(function(el) {
			
			result.push({
				value: el.id,
				label: el.map_title + " (" + el.id + ")"
			});
			
		});
		
		return result;
	}
	
	WPGMZA.Integration.ProGutenberg.prototype.getBlockInspectorControls = function(props)
	{
		const onChangeMap = value => {
			props.setAttributes({id: value});
		};
		
		const onChangeMashupIDs = value => {
			props.setAttributes({mashup_ids: value});
		};
		
		const onEditMap = event => {
			
			var select = $("select[name='map_id']");
			var map_id = select.val();
			
			window.open(WPGMZA.adminurl + "admin.php?page=wp-google-maps-menu&action=edit&map_id=" + map_id);
			
			event.preventDefault();
			return false;
			
		};
		
		let selectedMapID = "1";
		
		if(props.attributes.id)
			selectedMapID = props.attributes.id;
		else if(WPGMZA.gutenbergData.maps.length)
			selectedMapID = WPGMZA.gutenbergData.maps[0].id;
		
		return (
			<InspectorControls key="inspector">
				<PanelBody title={ __( 'Map Settings' ) } >
				
					<SelectControl
						name="map_id"
						label={__("Map")}
						value={selectedMapID}
						options={this.getMapSelectOptions()}
						onChange={onChangeMap}
						/>
						
					<SelectControl
						label={__("Mashup IDs")}
						value={props.attributes.mashup_ids || []}
						options={this.getMapSelectOptions()}
						multiple
						onChange={onChangeMashupIDs}
						/>
					
					<p class="map-block-gutenberg-button-container">
						<a href={WPGMZA.adminurl + "admin.php?page=wp-google-maps-menu"} 
							onClick={onEditMap}
							target="_blank" 
							class="button button-primary">
							<i class="fa fa-pencil-square-o" aria-hidden="true"></i>
							{__('Go to Map Editor')}
						</a>
					</p>
					
					<p class="map-block-gutenberg-button-container">
						<a href="https://www.wpgmaps.com/documentation/creating-your-first-map/"
							target="_blank"
							class="button button-primary">
							<i class="fa fa-book" aria-hidden="true"></i>
							{__('View Documentation')}
						</a>
					</p>
					
				</PanelBody>
			</InspectorControls>
		);
	}
	
	WPGMZA.Integration.ProGutenberg.prototype.getBlockAttributes = function(props)
	{
		return {
			"id": {
				type: "string"
			},
			"mashup_ids": {
				type: "array"
			}
		}
	}
	
	WPGMZA.Integration.ProGutenberg.prototype.getBlockDefinition = function(props)
	{
		var definition = WPGMZA.Integration.Gutenberg.prototype.getBlockDefinition.call(this, props);
		
		return definition;
	}
	
	WPGMZA.integrationModules.gutenberg = WPGMZA.Integration.Gutenberg.createInstance();
	
});