
    var heatmap = [];
    var WPGM_PathLine = [];
	var WPGM_Path = [];
	var WPGM_PathLineData = [];
	var WPGM_PathData = [];

    var marker_pull = wpgmza_legacy_map_edit_page_vars.marker_pull;
	var db_marker_array = wpgmza_legacy_map_edit_page_vars.db_marker_array;
	
    jQuery(function() {
    	var placeSearch, autocomplete, wpgmza_def_i;

        
        function fillInAddress() {
          // Get the place details from the autocomplete object.
          //var place = autocomplete.getPlace();	
        }	

        
        var wpgmza_table_length;


                jQuery(document).ready(function(){
                	var wpgmzaTable;
                	wpgmza_def_i = jQuery("#wpgmza_cmm").html();


                    

                     if (window.google && window.google.maps.places && typeof document.getElementById('wpgmza_add_address') !== "undefined") {
	                    /* initialize the autocomplete form */
	                    autocomplete = new google.maps.places.Autocomplete(
	                      /** @type {HTMLInputElement} */(document.getElementById('wpgmza_add_address')),
	                      { fields: ["name", "formatted_address"], types: ['geocode'] });
	                    // When the user selects an address from the dropdown,
	                    // populate the address fields in the form.
	                    google.maps.event.addListener(autocomplete, 'place_changed', function() {
	                    fillInAddress();
	                    });
                	}
                    
                    jQuery("#wpgmaps_show_advanced").click(function() {
                      jQuery("#wpgmaps_advanced_options").show();
                      jQuery("#wpgmaps_show_advanced").hide();
                      jQuery("#wpgmaps_hide_advanced").show();

                    });
                    jQuery("#wpgmaps_hide_advanced").click(function() {
                      jQuery("#wpgmaps_advanced_options").hide();
                      jQuery("#wpgmaps_show_advanced").show();
                      jQuery("#wpgmaps_hide_advanced").hide();

                    });



                    wpgmzaTable = jQuery('#wpgmza_table').DataTable({
                        "bProcessing": true,
                        "aaSorting": [[ wpgmza_legacy_map_edit_page_vars.order_by, wpgmza_legacy_map_edit_page_vars.order_choice ]]
                    });
                    function wpgmza_reinitialisetbl() {
                        var elem = jQuery("#wpgmza_marker_holder>[data-wpgmza-table]")[0];
						elem.wpgmzaDataTable.reload();
                    }
                    function wpgmza_InitMap() {
                        var myLatLng = {
							lat: wpgmza_legacy_map_edit_page_vars.wpgmza_lat,
							lng: wpgmza_legacy_map_edit_page_vars.wpgmza_lng
						};
						
                        MYMAP.init('#wpgmza_map', myLatLng, wpgmza_legacy_map_edit_page_vars.start_zoom);
                        UniqueCode=Math.round(Math.random()*10000);
                        MYMAP.placeMarkers(
							wpgmza_legacy_map_edit_page_vars.marker_url + '?u='+UniqueCode,
							wpgmza_legacy_map_edit_page_vars.map_id
						);
                    }

                    jQuery("#wpgmza_map").css({
                        height: wpgmza_legacy_map_edit_page_vars.wpgmza_height + wpgmza_legacy_map_edit_page_vars.wpgmza_height_type,
                        width: wpgmza_legacy_map_edit_page_vars.wpgmza_width + wpgmza_legacy_map_edit_page_vars.wpgmza_width_type

                    });
                    
                    
                    jQuery("#sl_line_color").focusout(function() {
                        poly.setOptions({ strokeColor: "#"+jQuery("#poly_line").val() }); 
                    });
                    jQuery("#sl_fill_color").keyup(function() {
                        poly.setOptions({ strokeOpacity: jQuery("#poly_opacity").val() }); 
                    });
                    jQuery("#sl_opacity").keyup(function() {
                        poly.setOptions({ strokeWeight: jQuery("#poly_thickness").val() }); 
                    });
                    
					var geocoder = WPGMZA.Geocoder.createInstance();
                    wpgmza_InitMap();


                    jQuery("select[name=wpgmza_table_length]").change(function () {
                    	wpgmza_table_length = jQuery(this).val();
                    })
                    jQuery("body").on("click", ".wpgmza_del_btn", function() {
                    	
                        var cur_id = jQuery(this).attr("id");

                      

                            
                    
                        var wpgm_map_id = "0";
                        if (document.getElementsByName("wpgmza_id").length > 0) { wpgm_map_id = jQuery("#wpgmza_id").val(); }
                        var data = {
                                action: 'delete_marker',
                                security: wpgmza_legacy_map_edit_page_vars.ajax_nonce,
                                map_id: wpgm_map_id,
                                marker_id: cur_id
                        };
                        
                        jQuery.post(ajaxurl, data, function(response) {
                                returned_data = JSON.parse(response);
                                db_marker_array = JSON.stringify(returned_data.marker_data);
                                wpgmza_InitMap();

	                    		//jQuery("#wpgmza_marker_holder").html(JSON.parse(response).table_html);
	                            wpgmza_reinitialisetbl();
                                
                        });

                    });
                    jQuery("body").on("click", ".wpgmza_approve_btn", function() {
                        var cur_id = jQuery(this).attr("id");
                        var wpgm_map_id = "0";
                        if (document.getElementsByName("wpgmza_id").length > 0) { wpgm_map_id = jQuery("#wpgmza_id").val(); }
                        var data = {
                                action: 'approve_marker',
                                security: wpgmza_legacy_map_edit_page_vars.ajax_nonce,
                                map_id: wpgm_map_id,
                                marker_id: cur_id
                        };
                        jQuery.post(ajaxurl, data, function(response) {
                                returned_data = JSON.parse(response);
                                db_marker_array = JSON.stringify(returned_data.marker_data);
                                wpgmza_InitMap();
                                //jQuery("#wpgmza_marker_holder").html(JSON.parse(response).table_html);
                                wpgmza_reinitialisetbl();

                        });

                    });
                    jQuery("body").on("click", ".wpgmza_poly_del_btn", function() {
                        var cur_id = parseInt(jQuery(this).attr("id"));
                        var wpgm_map_id = "0";
                        if (document.getElementsByName("wpgmza_id").length > 0) { wpgm_map_id = jQuery("#wpgmza_id").val(); }
                        var data = {
                                action: 'delete_poly',
                                security: wpgmza_legacy_map_edit_page_vars.ajax_nonce,
                                map_id: wpgm_map_id,
                                poly_id: cur_id
                        };
                        jQuery.post(ajaxurl, data, function(response) {
                                
                                	
                                WPGM_Path[cur_id].setMap(null);
                                delete WPGM_PathData[cur_id];
                                delete WPGM_Path[cur_id];
                                /*wpgmza_InitMap();*/
                                jQuery("#wpgmza_poly_holder").html(response);
                                /*window.location.reload();*/
                        });

                    });
                    jQuery("body").on("click", ".wpgmza_polyline_del_btn", function() {
                        var cur_id = jQuery(this).attr("id");
                        var wpgm_map_id = "0";
                        if (document.getElementsByName("wpgmza_id").length > 0) { wpgm_map_id = jQuery("#wpgmza_id").val(); }
                        var data = {
                                action: 'delete_polyline',
                                security: wpgmza_legacy_map_edit_page_vars.ajax_nonce,
                                map_id: wpgm_map_id,
                                poly_id: cur_id
                        };
                        jQuery.post(ajaxurl, data, function(response) {
                                WPGM_PathLine[cur_id].setMap(null);
                                delete WPGM_PathLineData[cur_id];
                                delete WPGM_PathLine[cur_id];
                                /*wpgmza_InitMap();*/
                                jQuery("#wpgmza_polyline_holder").html(response);
                                /*window.location.reload();*/
                        });

                    });
                    jQuery("body").on("click", ".wpgmza_dataset_del_btn", function() {
                        var cur_id = jQuery(this).attr("id");
                        var wpgm_map_id = "0";
                        if (document.getElementsByName("wpgmza_id").length > 0) { wpgm_map_id = jQuery("#wpgmza_id").val(); }
                        var data = {
                                action: 'delete_dataset',
                                security: wpgmza_legacy_map_edit_page_vars.ajax_nonce,
                                map_id: wpgm_map_id,
                                poly_id: cur_id
                        };
                        jQuery.post(ajaxurl, data, function(response) {
							heatmap[cur_id].setMap(null);
                                delete heatmap[cur_id];
                                /*wpgmza_InitMap();*/
                                jQuery("#wpgmza_heatmap_holder").html(response);
                                /*window.location.reload();*/
                        });

                    });
					
					jQuery("body").on("click", ".wpgmza_circle_del_btn", function() {
						
						var circle_id = jQuery(this).attr("id");
						var map_id = jQuery("#wpgmza_id").val();
						
						var wpgm_map_id = "0";
                        if (document.getElementsByName("wpgmza_id").length > 0) { wpgm_map_id = jQuery("#wpgmza_id").val(); }
                        var data = {
                                action: 'delete_circle',
                                security: wpgmza_legacy_map_edit_page_vars.ajax_nonce,
                                map_id: wpgm_map_id,
                                circle_id: circle_id
                        };
                        jQuery.post(ajaxurl, data, function(response) {
                            jQuery("#tabs-m-5 table").replaceWith(response);
							circle_array.forEach(function(circle) {
								
								if(circle.id == circle_id)
								{
									circle.setMap(null);
									return false;
								}
								
							});
                            
                        });
						
					});
					
					jQuery("body").on("click", ".wpgmza_rectangle_del_btn", function() {
						
						var rectangle_id = jQuery(this).attr("id");
						var map_id = jQuery("#wpgmza_id").val();
						
						var wpgm_map_id = "0";
                        if (document.getElementsByName("wpgmza_id").length > 0) { wpgm_map_id = jQuery("#wpgmza_id").val(); }
                        var data = {
                                action: 'delete_rectangle',
                                security: wpgmza_legacy_map_edit_page_vars.ajax_nonce,
                                map_id: wpgm_map_id,
                                rectangle_id: rectangle_id
                        };
                        jQuery.post(ajaxurl, data, function(response) {
                            jQuery("#tabs-m-6 table").replaceWith(response);
							rectangle_array.forEach(function(rectangle) {
								
								if(rectangle.id == rectangle_id)
								{
									rectangle.setMap(null);
									return false;
								}
								
							});
                            
                        });
						
					});

                    var wpgmza_edit_address = ""; /* set this here so we can use it in the edit marker function below */
                    var wpgmza_edit_lat = ""; 
                    var wpgmza_edit_lng = ""; 

                    jQuery("body").on("click", ".wpgmza_edit_btn", function() {
                        var cur_id = jQuery(this).attr("id");
						
						jQuery("#tabs-m-1>.wpgmza-panel-preloader").show();
								
						WPGMZA.restAPI.call("/markers/" + cur_id, {
							success: function(result, textStatus, xhr) {
								
								jQuery("#tabs-m-1>.wpgmza-panel-preloader").hide();
								
								jQuery("#wpgmza_edit_id").val(result.id);
								jQuery("#wpgmza_add_title").val(result.title);
								jQuery("#wpgmza_add_address").val(result.address);
								
								if (jQuery("#wp-wpgmza_add_desc-wrap").hasClass("tmce-active")){
									var tinymce_editor_id = 'wpgmza_add_desc'; 
									tinyMCE.get(tinymce_editor_id).setContent(result.description);
								}else{
									jQuery("#wpgmza_add_desc").val(result.description);
								}
								
								jQuery("#wpgmza_add_pic").val(result.pic);
								jQuery("#wpgmza_link_url").val(result.link);
								
								jQuery("#wpgmza_add_retina").prop('checked', result.retina == "1");

								var categories = result.category.split(",");
								jQuery('input[name=wpgmza_cat_checkbox]').removeAttr('checked');
								for(var i = 0; i < categories.length; i++)
								{
									var category_id = categories[i];
									
									if(category_id == "0")
										continue;
									
									jQuery("#wpgmza_cat_checkbox_" + category_id).prop('checked', true);
								}
								
								if(result.anim.length == 0)
									jQuery("#wpgmza_animation").val( jQuery("#wpgmza_animation>option:first-child").val() );
								else
									jQuery("#wpgmza_animation").val(result.anim);
								
								if(result.infoopen.length == 0)
									jQuery("#wpgmza_infoopen").val( jQuery("#wpgmza_infoopen>option:first-child").val() );
								else
									jQuery("#wpgmza_infoopen").val(result.infoopen);
								
								jQuery("#wpgmza_approved").val(result.approved);
								jQuery("#wpgmza_add_custom_marker").val(result.icon);
								
								if(result.icon && result.icon.length)
								{
									var img = jQuery("<img/>");
									img.attr("src", result.icon);
									
									var container = jQuery("#wpgmza_cmm");
									
									container.html("");
									container.append(img);
								}
								else
									jQuery("#wpgmza_cmm").html(wpgmza_def_i);
								
								jQuery("input[data-custom-field-name]").val("");
								
								if(result.custom_field_data)
								{
									for(var name in result.custom_field_data)
									{
										var value = "";
										
										if(name in result.custom_field_data)
											value = result.custom_field_data[name];
										
										jQuery("input[data-custom-field-name='" + CSS.escape(name) + "']").val(value);
									}
								}
								
								jQuery("#wpgmza_addmarker_div").hide();
								jQuery("#wpgmza_editmarker_div").show();
								
							}
						});
						
                    });

                    

                    jQuery("#wpgmza_addmarker").click(function(){
                        jQuery("#wpgmza_addmarker").hide();
                        jQuery("#wpgmza_addmarker_loading").show();



                        var wpgm_title = "";
                        var wpgm_address = "0";
                        var wpgm_desc = "0";
                        var wpgm_pic = "0";
                        var wpgm_link = "0";
                        var wpgm_icon = "0";
                        var wpgm_approved = "0";
                        var wpgm_gps = "0";

                        var wpgm_anim = "0";
                        var wpgm_category = "0";
                        var wpgm_retina = "0";
                        var wpgm_infoopen = "0";
                        var wpgm_map_id = "0";
                        var wpgmza_add_custom_marker_on_click = '';
                        if (document.getElementsByName("wpgmza_add_title").length > 0) { wpgm_title = jQuery("#wpgmza_add_title").val(); }
                        if (document.getElementsByName("wpgmza_add_address").length > 0) { wpgm_address = jQuery("#wpgmza_add_address").val(); }

                        if (jQuery("#wp-wpgmza_add_desc-wrap").hasClass("tmce-active")){
                        	var tinymce_editor_id = 'wpgmza_add_desc'; 
							wpgm_desc = tinyMCE.get(tinymce_editor_id).getContent();
					    }else{
					        if (document.getElementsByName("wpgmza_add_desc").length > 0) { wpgm_desc = jQuery("#wpgmza_add_desc").val(); }
					    }

                        					    
                        if (document.getElementsByName("wpgmza_add_pic").length > 0) { wpgm_pic = jQuery("#wpgmza_add_pic").val(); }
                        if (document.getElementsByName("wpgmza_link_url").length > 0) { wpgm_link = jQuery("#wpgmza_link_url").val(); }
                        if (document.getElementsByName("wpgmza_add_custom_marker").length > 0) { wpgm_icon = jQuery("#wpgmza_add_custom_marker").val(); }
                        if (document.getElementsByName("wpgmza_add_custom_marker_on_click").length > 0) { wpgmza_add_custom_marker_on_click = jQuery("#wpgmza_add_custom_marker_on_click").val(); }
                        if (document.getElementsByName("wpgmza_animation").length > 0) { wpgm_anim = jQuery("#wpgmza_animation").val(); }
                        
                        var Checked = jQuery('input[name="wpgmza_add_retina"]:checked').length > 0;
                        if (Checked) { wpgm_retina = "1"; } else { wpgm_retina = "0"; }

                        if (document.getElementsByName("wpgmza_category").length > 0) { wpgm_category = jQuery("#wpgmza_category").val(); }
                        
                    
                        var checkValues = jQuery('input[name=wpgmza_cat_checkbox]:checked').map(function() {
                            return jQuery(this).val();
                        }).get();
                        if (checkValues.length > 0) { wpgm_category = checkValues; }
                        wpgm_category.toString();
                        
                        
                        if (document.getElementsByName("wpgmza_infoopen").length > 0) { wpgm_infoopen = jQuery("#wpgmza_infoopen").val(); }
                        if (document.getElementsByName("wpgmza_approved").length > 0) { wpgm_approved = jQuery("#wpgmza_approved").val(); }
                        if (document.getElementsByName("wpgmza_id").length > 0) { wpgm_map_id = jQuery("#wpgmza_id").val(); }
                        /* first check if user has added a GPS co-ordinate */
                        checker = wpgm_address.split(",");
                        var wpgm_lat = "";
                        var wpgm_lng = "";
                        wpgm_lat = checker[0];
                        wpgm_lng = checker[1];
                        checker1 = parseFloat(checker[0]);
                        checker2 = parseFloat(checker[1]);
                        if (typeof wpgm_lat !== "undefined" && typeof wpgm_lng !== "undefined" && (wpgm_lat.match(/[a-zA-Z]/g) === null && wpgm_lng.match(/[a-zA-Z]/g) === null) && checker.length === 2 && (checker1 != NaN && (checker1 <= 90 || checker1 >= -90)) && (checker2 != NaN && (checker2 <= 90 || checker2 >= -90))) {
                            var data = {
                                action: 'add_marker',
                                security: wpgmza_legacy_map_edit_page_vars.ajax_nonce,
                                map_id: wpgm_map_id,
                                title: wpgm_title,
                                address: wpgm_address,
                                desc: wpgm_desc,
                                link: wpgm_link,
                                icon: wpgm_icon,
                                icon_on_click: wpgmza_add_custom_marker_on_click,
                                retina: wpgm_retina,
                                pic: wpgm_pic,
                                anim: wpgm_anim,
                                category: wpgm_category,
                                infoopen: wpgm_infoopen,
                                approved: wpgm_approved,
                                lat: wpgm_lat,
                                lng: wpgm_lng,
								custom_fields: []
                            };
							
							jQuery("#wpgmaps_tabs_markers input[name^='wpgmza-custom-field-']").each(function(index, el) {
								data.custom_fields.push({
									field_id: parseInt( jQuery(el).attr("name").match(/\d+/)[0] ),
									marker_id: -1,
									value: jQuery(el).val()
								});
							});

                            jQuery.post(ajaxurl, data, function(response) {
                                    returned_data = JSON.parse(response);
                                    
                                    db_marker_array = JSON.stringify(returned_data.marker_data);
                                    wpgmza_InitMap();

                                    //jQuery("#wpgmza_marker_holder").html(JSON.parse(response).table_html);
                                    
                                    jQuery("#wpgmza_addmarker").show();
                                    jQuery("#wpgmza_addmarker_loading").hide();
                                    jQuery("#wpgmza_add_title").val("");
                                    jQuery("#wpgmza_add_address").val("");
			                        if (jQuery("#wp-wpgmza_add_desc-wrap").hasClass("tmce-active")){
			                        	var tinymce_editor_id = 'wpgmza_add_desc'; 
										tinyMCE.get(tinymce_editor_id).setContent('');
								    }else{
	                                    jQuery("#wpgmza_add_desc").val("");
								    }
                                    jQuery("#wpgmza_add_pic").val("");
                                    jQuery("#wpgmza_link_url").val("");
                                    jQuery("#wpgmza_animation").val("0");
                                    jQuery("#wpgmza_approved").val("1");
                                    jQuery("#wpgmza_add_retina").attr('checked',false);
                                    jQuery("#wpgmza_edit_id").val("");
                                    jQuery("#wpgmza_cmm").html(wpgmza_def_i);
                                    jQuery("#wpgmza_cmm_custom").html(wpgmza_def_i);
                                    jQuery("#wpgmza_add_custom_marker").val("");
	                                jQuery("#wpgmza_add_custom_marker_on_click").val("");
                                    jQuery('input[name=wpgmza_cat_checkbox]').attr('checked',false);
									
									jQuery("input[name^='wpgmza-custom-field-']").val("");

                                    marker_data_point = new WPGMZA.LatLng(wpgm_lat, wpgm_lng);
                                    MYMAP.map.setCenter(marker_data_point);

                                    wpgmza_reinitialisetbl();

                                	if( jQuery("#wpgmaps_marker_cache_reminder").length > 0 ){

				                        jQuery("#wpgmaps_marker_cache_reminder").fadeIn();

				                    }
                            });
                            
                            
                        } else { 
							try{
								geocoder.geocode( { 'address': wpgm_address}, function(results, status) {
									if (status == WPGMZA.Geocoder.SUCCESS) {
										wpgm_gps = String(results[0].geometry.location);
										var latlng1 = wpgm_gps.replace("(","");
										var wpgm_lat = results[0].geometry.location.lat;
										var wpgm_lng = results[0].geometry.location.lng;

										var data = {
											action: 'add_marker',
											security: wpgmza_legacy_map_edit_page_vars.ajax_nonce,
											map_id: wpgm_map_id,
											title: wpgm_title,
											address: wpgm_address,
											desc: wpgm_desc,
											link: wpgm_link,
											icon: wpgm_icon,
											icon_on_click: wpgmza_add_custom_marker_on_click,
											retina: wpgm_retina,
											pic: wpgm_pic,
											anim: wpgm_anim,
											category: wpgm_category,
											infoopen: wpgm_infoopen,
											approved: wpgm_approved,
											lat: wpgm_lat,
											lng: wpgm_lng,
											custom_fields: []
										};

										jQuery("#wpgmaps_tabs_markers input[name^='wpgmza-custom-field-']").each(function(index, el) {
											data.custom_fields.push({
												field_id: parseInt( jQuery(el).attr("name").match(/\d+/)[0] ),
												marker_id: -1,
												value: jQuery(el).val()
											});
										});

										jQuery.post(ajaxurl, data, function(response) {
												returned_data = JSON.parse(response);
												db_marker_array = JSON.stringify(returned_data.marker_data);
												wpgmza_InitMap();


												//jQuery("#wpgmza_marker_holder").html(JSON.parse(response).table_html);
												jQuery("#wpgmza_addmarker").show();
												jQuery("#wpgmza_addmarker_loading").hide();

												jQuery("#wpgmza_add_title").val("");
												jQuery("#wpgmza_add_address").val("");
												if (jQuery("#wp-wpgmza_add_desc-wrap").hasClass("tmce-active")){
													var tinymce_editor_id = 'wpgmza_add_desc'; 
													tinyMCE.get(tinymce_editor_id).setContent('');
												}else{
													jQuery("#wpgmza_add_desc").val("");
												}
												jQuery("#wpgmza_add_pic").val("");
												jQuery("#wpgmza_link_url").val("");
												jQuery("#wpgmza_animation").val("0");
												jQuery("#wpgmza_approved").val("1");
												jQuery("#wpgmza_add_retina").attr('checked',false);
												jQuery("#wpgmza_cmm").html(wpgmza_def_i);
												jQuery("#wpgmza_cmm_custom").html(wpgmza_def_i);
												jQuery("#wpgmza_add_custom_marker").val("");
												jQuery("#wpgmza_add_custom_marker_on_click").val("");
												jQuery("#wpgmza_edit_id").val("");
												jQuery('input[name=wpgmza_cat_checkbox]').attr('checked',false);
										
												jQuery("input[name^='wpgmza-custom-field-']").val("");
										
												marker_data_point = new WPGMZA.LatLng(wpgm_lat,wpgm_lng);
												MYMAP.map.setCenter(marker_data_point);

												wpgmza_reinitialisetbl();

												if( jQuery("#wpgmaps_marker_cache_reminder").length > 0 ){

													jQuery("#wpgmaps_marker_cache_reminder").fadeIn();

												}
										});

									} else {
										alert(wpgmza_legacy_map_edit_page_vars.geocode_unsuccessful + ": " + status);
										jQuery("#wpgmza_addmarker").show();
										jQuery("#wpgmza_addmarker_loading").hide();
									}
								});
							}catch(e) {
								alert(e);
								jQuery("#wpgmza_addmarker").show();
								jQuery("#wpgmza_addmarker_loading").hide();
							}
                        }


                    });
					
					/*
					TODO: This should really be refactored with a callback instead of copying the code twice. Use an onGeocodeSuccess callback to do the heavy lifting. Just call it instantly if the address is a latlng string.
					
					TODO: This code should be dynamic, if the fields names match the POST names you can just iterate over the elements and build the POST data dynamically. This would save us having to add code here every time we add a field.
					*/
					
                    jQuery("#wpgmza_editmarker").click(function(){

                        jQuery("#wpgmza_editmarker_div").hide();
                        jQuery("#wpgmza_editmarker_loading").show();


                        var wpgm_edit_id;
                        wpgm_edit_id = parseInt(jQuery("#wpgmza_edit_id").val());
                        var wpgm_title = "";
                        var wpgm_address = "0";
                        var wpgm_desc = "0";
                        var wpgm_pic = "0";
                        var wpgm_link = "0";
                        var wpgm_anim = "0";
                        var wpgm_category = "0";
                        var wpgm_infoopen = "0";
                        var wpgm_approved = "0";
                        var wpgm_icon = "";
                        var wpgm_retina = "0";
                        var wpgm_map_id = "0";
                        var wpgm_gps = "0";
                        var wpgmza_add_custom_marker_on_click = "";

                        if (document.getElementsByName("wpgmza_add_title").length > 0) { wpgm_title = jQuery("#wpgmza_add_title").val(); }
                        if (document.getElementsByName("wpgmza_add_address").length > 0) { wpgm_address = jQuery("#wpgmza_add_address").val(); }

                        if (jQuery("#wp-wpgmza_add_desc-wrap").hasClass("tmce-active")){
                        	var tinymce_editor_id = 'wpgmza_add_desc'; 
							wpgm_desc = tinyMCE.get(tinymce_editor_id).getContent();
					    }else{
					        if (document.getElementsByName("wpgmza_add_desc").length > 0) { wpgm_desc = jQuery("#wpgmza_add_desc").val(); }
					    }


                        if (document.getElementsByName("wpgmza_add_pic").length > 0) { wpgm_pic = jQuery("#wpgmza_add_pic").val(); }
                        if (document.getElementsByName("wpgmza_link_url").length > 0) { wpgm_link = jQuery("#wpgmza_link_url").val(); }
                        if (document.getElementsByName("wpgmza_animation").length > 0) { wpgm_anim = jQuery("#wpgmza_animation").val(); }
                        if (document.getElementsByName("wpgmza_category").length > 0) { wpgm_category = jQuery("#wpgmza_category").val(); }
                        var Checked = jQuery('input[name="wpgmza_add_retina"]:checked').length > 0;
                        if (Checked) { wpgm_retina = "1"; } else { wpgm_retina = "0"; }
                        
                        
                        var checkValues = jQuery('input[name=wpgmza_cat_checkbox]:checked').map(function() {
                            return jQuery(this).val();
                        }).get();
                        if (checkValues.length > 0) { wpgm_category = checkValues; }
                        wpgm_category.toString();
                        if (document.getElementsByName("wpgmza_infoopen").length > 0) { wpgm_infoopen = jQuery("#wpgmza_infoopen").val(); }
                        if (document.getElementsByName("wpgmza_approved").length > 0) { wpgm_approved = jQuery("#wpgmza_approved").val(); }
                        if (document.getElementsByName("wpgmza_add_custom_marker").length > 0) { wpgm_icon = jQuery("#wpgmza_add_custom_marker").val(); }
                        if (document.getElementsByName("wpgmza_add_custom_marker_on_click").length > 0) { wpgmza_add_custom_marker_on_click = jQuery("#wpgmza_add_custom_marker_on_click").val(); } else { wpgmza_add_custom_marker_on_click = ''; }
                        if (document.getElementsByName("wpgmza_id").length > 0) { wpgm_map_id = jQuery("#wpgmza_id").val(); }



                        var do_geocode;
                        if (wpgm_address === wpgmza_edit_address) {
                            do_geocode = false;
                            var wpgm_lat = wpgmza_edit_lat;
                            var wpgm_lng = wpgmza_edit_lng;
                        } else { 
                            do_geocode = true;
                        }
						
						jQuery("#tabs-m-1 .wpgmza-panel-preloader").show();

                        if (do_geocode === true) {


	                        geocoder.geocode( { 'address': wpgm_address}, function(results, status) {
	                            if (status == WPGMZA.Geocoder.SUCCESS) {
	                                wpgm_gps = results[0].toString();
									
	                                var wpgm_lat;// = results[0].lat;
									var wpgm_lng;// = results[0].lng;
									
									if("lat" in results[0])
									{
										wpgm_lat = results[0].lat;
										wpgm_lng = results[0].lng;
									}
									else
									{
										wpgm_lat = results[0].latLng.lat;
										wpgm_lng = results[0].latLng.lng;
									}

	                                var data = {
										action: 'edit_marker',
										security: wpgmza_legacy_map_edit_page_vars.ajax_nonce,
										map_id: wpgm_map_id,
										edit_id: wpgm_edit_id,
										title: wpgm_title,
										address: wpgm_address,
										lat: wpgm_lat,
										lng: wpgm_lng,
										icon: wpgm_icon,
										icon_on_click: wpgmza_add_custom_marker_on_click,
										retina: wpgm_retina,
										desc: wpgm_desc,
										link: wpgm_link,
										pic: wpgm_pic,
										approved: wpgm_approved,
										anim: wpgm_anim,
										category: wpgm_category,
										infoopen: wpgm_infoopen,
										custom_fields: []
	                                };
									
									jQuery("#wpgmaps_tabs_markers input[name^='wpgmza-custom-field-']").each(function(index, el) {
										data.custom_fields.push({
											field_id: parseInt( jQuery(el).attr("name").match(/\d+/)[0] ),
											marker_id: -1,
											value: jQuery(el).val()
										});
									});

	                                jQuery.post(ajaxurl, data, function(response) {
										
										jQuery("#tabs-m-1 .wpgmza-panel-preloader").hide();
										
	                                    returned_data = JSON.parse(response);
	                                    db_marker_array = JSON.stringify(returned_data.marker_data);
	                                    wpgmza_InitMap();
	                                    //jQuery("#wpgmza_marker_holder").html(JSON.parse(response).table_html);
	                                    jQuery("#wpgmza_addmarker_div").show();
	                                    jQuery("#wpgmza_editmarker_loading").hide();
	                                    jQuery("#wpgmza_add_title").val("");
	                                    jQuery("#wpgmza_add_address").val("");
				                        if (jQuery("#wp-wpgmza_add_desc-wrap").hasClass("tmce-active")){
				                        	var tinymce_editor_id = 'wpgmza_add_desc'; 
											tinyMCE.get(tinymce_editor_id).setContent('');
									    }else{
		                                    jQuery("#wpgmza_add_desc").val("");
									    }
	                                    jQuery("#wpgmza_add_pic").val("");
	                                    jQuery("#wpgmza_cmm").html(wpgmza_def_i);
	                                    jQuery("#wpgmza_cmm_custom").html(wpgmza_def_i);
	                                    jQuery("#wpgmza_add_custom_marker").val("");
		                                jQuery("#wpgmza_add_custom_marker_on_click").val("");
	                                    jQuery("#wpgmza_link_url").val("");
	                                    jQuery("#wpgmza_edit_id").val("");
	                                    jQuery("#wpgmza_add_retina").attr('checked',false);
	                                    jQuery("#wpgmza_animation").val("0");
	                                    jQuery("#wpgmza_approved").val("1");
	                                    jQuery('input[name=wpgmza_cat_checkbox]').attr('checked',false);
										
										jQuery("input[name^='wpgmza-custom-field-']").val("");
										
	                                    wpgmza_reinitialisetbl();

	                                    if( jQuery("#wpgmaps_marker_cache_reminder").length > 0 ){

					                        jQuery("#wpgmaps_marker_cache_reminder").fadeIn();

					                    }
	                                });

	                            } else {
	                                alert(wpgmza_legacy_map_edit_page_vars.geocode_unsuccessful + ": " + status);
		                            jQuery("#wpgmza_editmarker_div").show();
		                			jQuery("#wpgmza_editmarker_loading").hide();
	                            }
	                        });
                        } else {
                            /* address was the same, no need for geocoding */
                            var data = {
                                action: 'edit_marker',
                                security: wpgmza_legacy_map_edit_page_vars.ajax_nonce,
                                map_id: wpgm_map_id,
                                edit_id: wpgm_edit_id,
                                title: wpgm_title,
                                address: wpgm_address,
                                lat: wpgm_lat,
                                lng: wpgm_lng,
                                icon: wpgm_icon,
                                icon_on_click: wpgmza_add_custom_marker_on_click,
                                retina: wpgm_retina,
                                desc: wpgm_desc,
                                link: wpgm_link,
                                approved: wpgm_approved,
                                pic: wpgm_pic,
                                anim: wpgm_anim,
                                category: wpgm_category,
                                infoopen: wpgm_infoopen,
								custom_fields: []
                            };
							
							jQuery("#wpgmaps_tabs_markers input[name^='wpgmza-custom-field-']").each(function(index, el) {
								data.custom_fields.push({
									field_id: parseInt( jQuery(el).attr("name").match(/\d+/)[0] ),
									marker_id: -1,
									value: jQuery(el).val()
								});
							});

                            jQuery.post(ajaxurl, data, function(response) {
								
								jQuery("#tabs-m-1 .wpgmza-panel-preloader").hide();
								
                                returned_data = JSON.parse(response);
                                db_marker_array = JSON.stringify(returned_data.marker_data);
                                wpgmza_InitMap();
                                //jQuery("#wpgmza_marker_holder").html(JSON.parse(response).table_html);
                                jQuery("#wpgmza_addmarker_div").show();
                                jQuery("#wpgmza_editmarker_loading").hide();
                                jQuery("#wpgmza_add_title").val("");
                                jQuery("#wpgmza_add_address").val("");
			                        if (jQuery("#wp-wpgmza_add_desc-wrap").hasClass("tmce-active")){
			                        	var tinymce_editor_id = 'wpgmza_add_desc'; 
										tinyMCE.get(tinymce_editor_id).setContent('');
								    }else{
	                                    jQuery("#wpgmza_add_desc").val("");
								    }
                                jQuery("#wpgmza_cmm").html(wpgmza_def_i);
                                jQuery("#wpgmza_cmm_custom").html(wpgmza_def_i);
                                jQuery("#wpgmza_add_custom_marker").val("");
                                jQuery("#wpgmza_add_custom_marker_on_click").val("");
                                jQuery("#wpgmza_add_pic").val("");
                                jQuery("#wpgmza_link_url").val("");
                                jQuery("#wpgmza_add_retina").attr('checked',false);
                                jQuery("#wpgmza_edit_id").val("");
                                jQuery("#wpgmza_animation").val("0");
                                jQuery("#wpgmza_approved").val("1");
                                jQuery("#wpgmza_category").val("Select");
                                jQuery('input[name=wpgmza_cat_checkbox]').attr('checked',false);
								
								jQuery("input[name^='wpgmza-custom-field-']").val("");
								
                                wpgmza_reinitialisetbl();

                                if( jQuery("#wpgmaps_marker_cache_reminder").length > 0 ){

			                        jQuery("#wpgmaps_marker_cache_reminder").fadeIn();

			                    }
                            });
                        }





                    });
            });

            });

			window.WPGM_PathData = wpgmza_legacy_map_edit_page_vars.WPGM_PathData;
			
			jQuery(function($) {
				if(WPGMZA.settings.engine == "google-maps" && window.google) {
					
					function stringCoordinateArrayToGoogleMapsLagLngArray(stringCoordinatePairs)
					{
						var points = [];
						
						for(var i = 0; i < stringCoordinatePairs.length; i++)
						{
							var latLng = WPGMZA.stringToLatLng(stringCoordinatePairs[i]);
							points.push(latLng.toGoogleLatLng());
						}
						
						return points;
					}
				
					for(var poly_id in wpgmza_legacy_map_edit_page_vars.WPGM_PathData)
					{
						var options = jQuery.extend(
							{
								path: stringCoordinateArrayToGoogleMapsLagLngArray( wpgmza_legacy_map_edit_page_vars.WPGM_PathData[poly_id] )
							}, 
							wpgmza_legacy_map_edit_page_vars.polygon_options_by_id[poly_id]
						);
						
						WPGM_Path[poly_id] = new google.maps.Polygon(options);
					}
					
					for(var polyline_id in wpgmza_legacy_map_edit_page_vars.WPGM_PathLineData)
					{
						var options = jQuery.extend(
							{
								path: stringCoordinateArrayToGoogleMapsLagLngArray( wpgmza_legacy_map_edit_page_vars.WPGM_PathLineData[polyline_id] )
							},
							wpgmza_legacy_map_edit_page_vars.polyline_options_by_id[polyline_id]
						);
						
						WPGM_PathLine[polyline_id] = new google.maps.Polyline(options);
					}
				
					for(var dataset_id in wpgmza_legacy_map_edit_page_vars.heatmaps)
					{
						var stringCoordinatePairs = wpgmza_legacy_map_edit_page_vars.heatmaps[dataset_id];
						var points = stringCoordinateArrayToGoogleMapsLagLngArray(stringCoordinatePairs);
						
						heatmap[dataset_id] = new google.maps.visualization.HeatmapLayer({
							data: points
						});              	
					}
				}
			});
			
            var MYMAP = {
                map: null,
                bounds: null,
                mc: null
            }
            MYMAP.init = function(selector, latLng, zoom) {
              var myOptions = {
                zoom: parseInt(zoom),
                minZoom: parseInt(wpgmza_legacy_map_edit_page_vars.max_zoom),
                maxZoom: 21,
                center: latLng
              };
			  
			  jQuery.extend(myOptions, wpgmza_legacy_map_edit_page_vars.mapOptions);
			  
			if(WPGMZA.settings.engine == "google-maps" && window.google)
				myOptions.mapTypeId = google.maps.MapTypeId[wpgmza_legacy_map_edit_page_vars.map_type];
			
			var element = jQuery(selector)[0];
			var map_id = window.location.href.match(/map_id=(\d+)/)[1];
			element.setAttribute("data-map-id", map_id);
			element.setAttribute("data-maps-engine", WPGMZA.settings.engine);
			
			this.map = WPGMZA.Map.createInstance(element, myOptions);
            this.bounds = new WPGMZA.LatLngBounds();
			
			var theme_data = wpgmza_legacy_map_edit_page_vars.theme_data;
			if(theme_data && theme_data.length)
			{
				try{
					this.map.setOptions({
						styles: JSON.parse(theme_data)
					});
				}catch(e) {
					console.warn("Error applying theme data");
				}
			}
			
			if(WPGMZA.settings.engine == "google-maps") {
				window.circle_array = [];
				for(var circle_id in wpgmza_circle_data_array)
				{
					var data = jQuery.extend({}, wpgmza_circle_data_array[circle_id]);
					data.map = MYMAP.map;

					if(!data.center)
					{
						console.warn("No center data for circle ID " + circle_id)
						continue;
					}
					
					var m = data.center.match(/-?\d+(\.\d*)?/g);
					data.center = new WPGMZA.LatLng({
						lat: parseFloat(m[0]),
						lng: parseFloat(m[1]),
					});
					
					data.radius = parseFloat(data.radius);
					data.fillColor = data.color;
					data.fillOpacity = parseFloat(data.opacity);
					
					data.strokeOpacity = 0;
					
					var circle = WPGMZA.Circle.createInstance(data);
					circle_array.push(circle);
				}
				
				window.rectangle_array = [];
				for(var rectangle_id in wpgmza_rectangle_data_array)
				{
					var data = jQuery.extend({}, wpgmza_rectangle_data_array[rectangle_id]);
					data.map = MYMAP.map.googleMap;
					
					if(!data.cornerA || !data.cornerB)
					{
						console.warn("No center data for rectangle ID " + rectangle_id)
						continue;
					}
					
					var northWest = data.cornerA;
					var southEast = data.cornerB;
					
					var m = northWest.match(/-?\d+(\.\d+)?/g);
					var north = parseFloat(m[0]);
					var west = parseFloat(m[1]);
					
					m = southEast.match(/-?\d+(\.\d+)?/g);
					var south = parseFloat(m[0]);
					var east = parseFloat(m[1]);
					
					data.bounds = {
						north: north,
						west: west,
						south: south,
						east: east
					};
					
					data.fillColor = data.color;
					data.fillOpacity = parseFloat(data.opacity);
					
					data.strokeOpacity = 0;
					
					var rectangle = new google.maps.Rectangle(data);
					rectangle_array.push(rectangle);
				}
			}

            //google.maps.event.addListener(MYMAP.map, 'zoom_changed', function() {
			MYMAP.map.on("zoomchanged", function() {
                zoomLevel = MYMAP.map.getZoom();
                jQuery("#wpgmza_start_zoom").val(zoomLevel);
            });
            
			MYMAP.map.on("rightclick", function(event) {
				
                if(!WPGMZA.mapEditor)
					WPGMZA.mapEditor = {};
				
				var marker;
				
				if(!WPGMZA.mapEditor.rightClickMarker)
				{
					marker = WPGMZA.mapEditor.rightClickMarker = WPGMZA.Marker.createInstance({
						draggable: true
					});
					
					marker.on("dragend", function(event) {
						jQuery("#wpgmza_add_address").val(event.latLng.lat+','+event.latLng.lng);
					} );

					MYMAP.map.on("click", function() {
						marker.setMap(null);
					});
				}
				else
					marker = WPGMZA.mapEditor.rightClickMarker;
				
				marker.setPosition(event.latLng);
				marker.setMap(MYMAP.map);
				
                jQuery("#wpgmza_add_address").val(event.latLng.lat+', '+event.latLng.lng);
                jQuery("#wpgm_notice_message_save_marker").show();
                setTimeout(function() {
                    jQuery("#wpgm_notice_message_save_marker").fadeOut('slow')
                }, 3000);
               
            });

			MYMAP.map.on("bounds_changed", function() {
				
				var center = MYMAP.map.getCenter();
				var zoom = MYMAP.map.getZoom();
				var $ = jQuery;
				
				$("#wpgmza_start_location").val(center.lat + "," + center.lng);
				$("#wpgmza_start_zoom").val(zoom);
				
				$("#wpgmaps_save_reminder").show();
				
			});
			
			for(var dataset_id in wpgmza_legacy_map_edit_page_vars.heatmaps)
			{
				var options = wpgmza_legacy_map_edit_page_vars.heatmap_options_by_id[dataset_id];
				var heatmapInstance = heatmap[dataset_id];
				
				heatmapInstance.setMap(this.map.googleMap);
				heatmapInstance.set("opacity", options.opacity);
				heatmapInstance.set("radius", options.radius);
				
				if(options.gradient)
					heatmapInstance.set("gradient", JSON.parse(options.gradient));
			}
			
			for(var polygon_id in WPGM_Path)
			{
				WPGM_Path[polygon_id].setMap(this.map.googleMap);
			}
            
			for(var polyline_id in WPGM_PathLine)
			{
				WPGM_PathLine[polyline_id].setMap(this.map.googleMap);
			}

			MYMAP.map.on("bounds_changed", function() {
                var location = MYMAP.map.getCenter();
                jQuery("#wpgmza_start_location").val(location.lat+","+location.lng);
                jQuery("#wpgmaps_save_reminder").show();
            });

			if(window.google)
			{
				if(wpgmza_legacy_map_edit_page_vars.bicycle_layer == "1")
				{
					var bikeLayer = new google.maps.BicyclingLayer();
					bikeLayer.setMap(this.map.googleMap);
				}
				
				if(wpgmza_legacy_map_edit_page_vars.traffic_layer == "1")
				{
					var trafficLayer = new google.maps.TrafficLayer();
					trafficLayer.setMap(this.map.googleMap);
				}
				
				if(wpgmza_legacy_map_edit_page_vars.transport_layer == "1")
				{
					var transitLayer = new google.maps.TransitLayer();
					transitLayer.setMap(this.map.googleMap);
				}
				
				var now = new Date();
				var timestamp = now.getTime();
				
				if(wpgmza_legacy_map_edit_page_vars.kml_urls && wpgmza_legacy_map_edit_page_vars.kml_urls.length)
				{
					var temp = wpgmza_legacy_map_edit_page_vars.kml_urls;
					arr = temp.split(',');
					arr.forEach(function(entry) {
						var georssLayer = new google.maps.KmlLayer(entry+'?tstamp='+timestamp, {
								preserveViewport: true
						});
						georssLayer.setMap(MYMAP.map.googleMap);
					});
				}
				
				if(wpgmza_legacy_map_edit_page_vars.fusion_table && wpgmza_legacy_map_edit_page_vars.fusion_table.length)
				{
					var fusionlayer = new google.maps.FusionTablesLayer(wpgmza_legacy_map_edit_page_vars.fusion, {
						  suppressInfoWindows: false
					});
					fusionlayer.setMap(this.map.googleMap);
				}
			}


            } // End MYMAP.init

			jQuery(function($) {
				window.infoWindow = WPGMZA.InfoWindow.createInstance();
				
				if(wpgmza_legacy_map_edit_page_vars.infowindow_width && 
					wpgmza_legacy_map_edit_page_vars.infowindow_width.length &&
					parseInt(wpgmza_legacy_map_edit_page_vars.infowindow_width) > 0)
					infoWindow.setOptions({maxWidth: parseInt(wpgmza_legacy_map_edit_page_vars.infowindow_width)});
			});
			
			// TODO: Re-do, come up with proper JS solution to remember center before resize, then set after resize, rather than hard coding center
            /*google.maps.event.addDomListener(window, 'resize', function() {
                var myLatLng = new WPGMZA.LatLng(<?php echo $wpgmza_lat; ?>,<?php echo $wpgmza_lng; ?>);
                MYMAP.map.setCenter(myLatLng);
            });*/

            MYMAP.placeMarkers = function(filename,map_id) {
                marker_array = [];
                if (marker_pull === '1') {
                        jQuery.get(filename, function(xml) {
                                jQuery(xml).find("marker").each(function(){
                                        var wpgmza_def_icon = wpgmza_legacy_map_edit_page_vars.default_marker_icon;
                                        var wpmgza_map_id = jQuery(this).find('map_id').text();

                                        if (wpmgza_map_id == map_id) {
                                            var wpmgza_title = jQuery(this).find('title').text();
                                            var wpmgza_show_address = jQuery(this).find('address').text();
                                            var wpmgza_address = jQuery(this).find('address').text();
                                            var wpmgza_mapicon = jQuery(this).find('icon').text();
                                            var wpmgza_image = jQuery(this).find('pic').text();
                                            var wpmgza_desc  = jQuery(this).find('desc').text();
                                            var wpmgza_anim  = jQuery(this).find('anim').text();
                                            var wpmgza_retina  = jQuery(this).find('retina').text();
                                            var wpmgza_infoopen  = jQuery(this).find('infoopen').text();
                                            var wpmgza_linkd = jQuery(this).find('linkd').text();
                                            if (wpmgza_title != "") {
                                                wpmgza_title = wpmgza_title+'<br />';
                                            }

                                            /* check image */
                                            if (wpmgza_image != "")
											{
												var styles = "";
											
												if (wpgmza_legacy_map_edit_page_vars.infowindow_resize_image) {
													
													styles += "width='" + wpgmza_legacy_map_edit_page_vars.infowindow_image_width + "' height='" + wpgmza_legacy_map_edit_page_vars.infowindow_image_height + "'";
													
	                                            }
												
	                                        	wpmgza_image = "<img src='"+wpmgza_image+"' class='wpgmza_map_image wpgmza_map_image_"+wpmgza_map_id+"' style='float:right;' " + styles + "/>";
                                            }
											
                                            if (wpmgza_linkd != "") {
												wpmgza_linkd = "<a href='"+wpmgza_linkd+"' " +
													wpgmza_legacy_map_edit_page_vars.infowindow_link_target +
													"title='" + wpgmza_legacy_map_edit_page_vars.infowindow_link_text + "'>" +
													wpgmza_legacy_map_edit_page_vars.infowindow_link_text +
													"</a>";
											}
											
                                            if (wpmgza_mapicon == "" || !wpmgza_mapicon) { if (wpgmza_def_icon != "") { wpmgza_mapicon = wpgmza_legacy_map_edit_page_vars.default_marker_icon; } }
											
                                            var wpgmza_optimized = true;
                                            if (WPGMZA.settings.engine != "open-layers" && wpmgza_retina === "1" && wpmgza_mapicon !== "") {
                                                wpmgza_mapicon = new google.maps.MarkerImage(wpmgza_mapicon, null, null, null, new google.maps.Size(
													wpgmza_legacy_map_edit_page_vars.retina_width,
													wpgmza_legacy_map_edit_page_vars.retina_height
												));
                                                wpgmza_optimized = false;
                                            }
                                            var lat = jQuery(this).find('lat').text();
                                            var lng = jQuery(this).find('lng').text();
                                            var point = new WPGMZA.LatLng(parseFloat(lat),parseFloat(lng));
                                            MYMAP.bounds.extend(point);
											
											var options = {
												position: point,
												map: MYMAP.map,
												icon: wpmgza_mapicon
											};
											
											if(wpmgza_anim)	
												options.animation = wpmgza_anim;
											
											var marker = WPGMZA.Marker.createInstance(options);
                                            var infowindow_address = wpmgza_show_address;
											
											if(wpgmza_legacy_map_edit_page_vars.hide_infowindow_address)
												infowindow_address = "";
											
                                            var html='<div id="wpgmza_markerbox">'+wpmgza_image+'<p><strong>'+wpmgza_title+'</strong>'+infowindow_address+'<br />'
                                                    +wpmgza_desc+
                                                    '<br />'
                                                    +wpmgza_linkd+
                                                    ''
                                                    +'</p></div>';
                                            if (wpmgza_infoopen == "1") {

                                                infoWindow.setContent(html);
                                                infoWindow.open(MYMAP.map, marker);
                                            }
											
											var infowindow_open_event = "click";
											if(wpgmza_legacy_map_edit_page_vars.infowindow_open_by == 2)
												infowindow_open_event = "mouseover";

											marker.on(infowindow_open_event, function() {
												
												infoWindow.close();
                                                infoWindow.setContent(html);
                                                infoWindow.open(MYMAP.map, marker);
												
											});

                                        }

                            });
                    });
                
                } else {
                    
                    if (db_marker_array.length > 0) {
						var dec_marker_array = db_marker_array;
						
						if(typeof dec_marker_array == "string")
							dec_marker_array = JSON.parse(dec_marker_array);
						
						jQuery.each(dec_marker_array, function(i, val) {

                        var wpgmza_def_icon = wpgmza_legacy_map_edit_page_vars.default_marker_icon;
                        var wpmgza_map_id = val.map_id;

                        if (wpmgza_map_id == map_id) {
                            if( val.title !== null ){
								var wpmgza_title = val.title.replace(/\\/g, '');
							} else {
								var wpmgza_title = val.title;
							}
                            var wpmgza_show_address = val.address;
                            var wpmgza_address = val.address;
                            var wpmgza_mapicon = val.icon;
                            var wpmgza_image = val.pic;
                            
                            if( val.desc !== null ){
								var wpmgza_desc = val.desc.replace(/\\/g, '');
							} else {
								var wpmgza_desc = val.desc;
							}
                            var wpmgza_anim  = val.anim;
                            var wpmgza_retina  = val.retina;
                            var wpmgza_infoopen  = val.infoopen;
                            var wpmgza_linkd = val.linkd;
                            if (wpmgza_title != "") {
                                wpmgza_title = wpmgza_title+'<br />';
                            }
                           /* check image */
                            if (wpmgza_image != "") {

								if (wpgmza_legacy_map_edit_page_vars.infowindow_resize_image) {
                                	wpgmza_resize_string = "width=" + wpgmza_legacy_map_edit_page_vars.infowindow_image_width + "; height=" + wpgmza_legacy_map_edit_page_vars.infowindow_image_height + ";";
                                } else {
                                	wpgmza_resize_string = "";
                                }
                        	    
                            	wpmgza_image = "<img src='"+wpmgza_image+"' class='wpgmza_map_image wpgmza_map_image_"+wpmgza_map_id+"' style='float:right;' "+wpgmza_resize_string+" />";

                            }

                            if (wpmgza_linkd != "") {
								wpmgza_linkd = "<a href='"+wpmgza_linkd+"' " +
									wpgmza_legacy_map_edit_page_vars.infowindow_link_target +
									"title='" + wpgmza_legacy_map_edit_page_vars.infowindow_link_text + "'>" +
									wpgmza_legacy_map_edit_page_vars.infowindow_link_text + 
									"</a>";
							}
							
                            if ((wpmgza_mapicon == "" || !wpmgza_mapicon) && wpgmza_def_icon != "")
								wpmgza_mapicon = wpgmza_legacy_map_edit_page_vars.default_marker_icon;
							
							var wpgmza_optimized = true;
							
                            if (WPGMZA.settings.engine != "open-layers" && wpmgza_retina === "1" && wpmgza_mapicon !== "")
							{
                                wpmgza_mapicon = new google.maps.MarkerImage(wpmgza_mapicon, 
									null, 
									null, 
									null, 
									new google.maps.Size(
										wpgmza_legacy_map_edit_page_vars.retina_width,
										wpgmza_legacy_map_edit_page_vars.retina_height
									)
								);
								
                                wpgmza_optimized = false;
                            }
                            var lat = val.lat;
                            var lng = val.lng;
							
							try{
								var point = new WPGMZA.LatLng(parseFloat(lat),parseFloat(lng));
							}catch(error) {
								var message = WPGMZA.localized_strings.failed_to_create_marker.replace(/%d/, val.marker_id);
								var notice = $("<div class='notice notice-warning'><p></p></div>");
								
								if(error.message)
									message += " (" + error.message + ")";
								
								notice.find("p").text(message);
								$("#wpgmaps_tabs").before(notice);
								
								return true;
							}
							
                            MYMAP.bounds.extend(point);
							
							var options = jQuery.extend(val, {
								position: point,
								map: MYMAP.map
							});
							options.id = val.marker_id;
							delete options.marker_id;
							
							if(wpmgza_mapicon && wpmgza_mapicon.length)
								options.icon = wpmgza_mapicon;
							
							var marker = WPGMZA.Marker.createInstance(options);
							
							if(wpgmza_legacy_map_edit_page_vars.hide_infowindow_address && wpgmza_legacy_map_edit_page_vars.hide_infowindow_address.length)
								wpmgza_show_address = "";
							
                            var html='<div id="wpgmza_markerbox">'+wpmgza_image+'<p><strong>'+wpmgza_title+'</strong>'+wpmgza_show_address+'<br />'
                                    +wpmgza_desc+
                                    '<br />'
                                    +wpmgza_linkd+
                                    ''
                                    +'</p></div>';
                            if (wpmgza_infoopen == "1") {

                                infoWindow.setContent(html);
                                infoWindow.open(MYMAP.map, marker);
                            }
							
							var infowindow_open_event = "click";
							if(wpgmza_legacy_map_edit_page_vars.infowindow_open_by == 2)
								infowindow_open_event = "mouseover";

							marker.on(infowindow_open_event, function() {

								//infoWindow.close();
								//infoWindow.setContent(html);
								//infoWindow.open(MYMAP.map, marker);
								
								marker.openInfoWindow();
								marker.infoWindow.setContent(html);

							});


                        }






                  }); // End loop over markers
                  }
                
                
                
                
                
                
                
                }
            }