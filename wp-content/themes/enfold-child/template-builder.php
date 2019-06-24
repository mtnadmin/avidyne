<?php

if ( in_array('single-product',get_body_class()) ) {
    if ( !defined('ABSPATH') ){ die(); }

    global $avia_config;
    $product = $post;

    /*
     * get_header is a basic wordpress function, used to retrieve the header.php file in your theme directory.
     */
     get_header();

     if ( !function_exists('is_field_empty') ) {
        function is_field_empty($field) {
            if ( !empty($field) && NULL !== $field ) {
                return false;
            }
            return true;
        }
     }

     if( get_post_meta(get_the_ID(), 'header', true) != 'no') echo avia_title();

     do_action( 'ava_after_main_title' );

     // Above the fold
     $general_product_details = get_field( 'general_product_details', $post->ID );
     $post_title = get_the_title( $post );
     $product_price = $general_product_details['product_price'];
     $product_excerpt = $general_product_details['product_excerpt'];
     $product_fine_print = $general_product_details['product_fine_print'];

     // Below the fold
     $product_overview = get_post( $post->ID )->post_content;
     $product_specifications = get_field( 'product_specifications', $post->ID );
     $product_compatibility = get_field( 'compatibility_details', $post->ID );
     $product_functionality = get_field( 'product_functionality', $post->ID );
     $product_documents = get_field( 'product_documentation', $post->ID );
     $advance_layout_builder_overview_content = get_field( 'product_overview_content_sections', $post->ID );
     $docs = single_product_avidyne_documentation();

     // For multiple content sections
     if ( !empty($advance_layout_builder_overview_content) ) {
     	$total_sections = count($advance_layout_builder_overview_content);
     	if ( $total_sections >= 1 ) {
            foreach( $advance_layout_builder_overview_content as $i => $section ) :
                $sections .= '
                    <div id="product-overview-section-'. $i .'" class="product-overview-section '. $advance_layout_builder_overview_content[$i]['section_identifier'] .'">
                        <div class="container clearfix">
                            ' . $advance_layout_builder_overview_content[$i]['single_overview_content_section'] . '
                        </div>
                    </div>';
            endforeach;
     	}
     } else {
        $sections = do_shortcode('<div id="product-overview-content" class="product-overview-section"><div class="container clearfix">' . $product_overview . '</div></div>');
        $total_sections = true;
     }

     // Product specifications
     foreach($product_specifications['product_specification_field'] as $specification) :
        $spec_title = $specification['specification_title'];
        $spec_content = $specification['specification_content'];
        $spec = '';

        // Specification content
        foreach( $spec_content as $content ) {
            $spec .= '<li>'. $content['specification_content_field'] .'</li>';
        }

        $specifications .= '<div class="product-specification"><strong style="display:block;">'. $spec_title  .'</strong><ul>'. $spec .'</ul></div>';
     endforeach;

     // Product compatibility
     foreach($product_compatibility['product_compatibility_details'] as $compatibility) :
        $comp_title = $compatibility['compatibility_title'];
        $comp_content = $compatibility['compatibility_content'];
        $comp = '';

        // Compatibility content
        foreach( $comp_content as $content ) {
            $comp .= '<li>'. $content['compatibility_content_field'] .'</li>';
        }

        $compatibilities .= '<div class="product-specification"><strong style="display:block;">'. $comp_title  .'</strong><ul>'. $comp .'</ul></div>';
     endforeach;

     // Product functionality
     foreach($product_functionality['product_functionality_detaill'] as $functionality) :
        $func_title = $functionality['functionality_title'];
        $func_content = $functionality['functionality_content'];
        $func = '';

        // Functionality content
        foreach( $func_content as $content ) {
            $func .= '<li>'. $content['functionality_content_field'] .'</li>';
        }

        $functionalities .= '<div class="product-specification"><strong style="display:block;">'. $func_title  .'</strong><ul>'. $func .'</ul></div>';
     endforeach;


     // Header image section + main title
     if ( !empty($general_product_details['product_header_image']['url']) && NULL !== $general_product_details['product_header_image']['url'] ) { ?>
        <div id="header-area" style="background-image: url(<?php echo $general_product_details['product_header_image']['url']; ?>);background-size: cover; background-position: center center;">
            <div class="container">
                <h1 id="product-main-title">
                    <span><?php echo $general_product_details['product_identifier']; ?></span>
                    <br />
                    <?php echo $general_product_details['product_header_title']; ?>
                </h1>
                <div id="jump" data-smooth-scroll data-animation-easing="swing" data-offset="69">
                    <a href="#to-content">
                        <i class="fa fa-chevron-down"></i>
                    </a>
                </div>
                <div id="to-content"></div>
            </div>
        </div>
     <?php }

    // Check if gallery images
    if ( !empty($general_product_details['image_gallery']) && NULL !== $general_product_details['image_gallery']) {
        $all_images = $total_images = '';
        $images = $general_product_details['image_gallery'];
        $total_images = count($images);
        foreach($images as $image) :
            $image_id = $image['id'];
            $image_url = $image['url'];
            $all_images .= $image_id . ', ';
            $image_html .= '<div class="gallery-image"><img src="' . $image_url . '" alt="" /></div>';
        endforeach;
        if ( $total_images > 1 ) {
            $images_gallery_wrapper = '<div id="product-gallery">' . $image_html . '</div>';
        }
        $images_featured_wrapper = '<div id="product-featured">' . $image_html . '</div>';
        $gallery = $all_images;
    } ?>

        <div class='container_wrap container_wrap_first main_color <?php avia_layout_class( 'main' ); ?>' style="border:0;">

            <div class='container full-width'>

                <main class='template-page template-product content clearfix ' <?php avia_markup_helper(array('context' => 'content','post_type'=>'product'));?> style="border:0;">
                	<div class="container">
                    <?php
                        // Left half image gallery
                        echo do_shortcode("[av_one_half first  min_height='' vertical_alignment='' space='' custom_margin='' margin='0px' row_boxshadow='' row_boxshadow_color='' row_boxshadow_width='10' link='' linktarget='' link_hover='' padding='0px' highlight='' highlight_size='' border='0px' border_color='' radius='0px' column_boxshadow='' column_boxshadow_color='' column_boxshadow_width='10' background='bg_color' background_color='' background_gradient_color1='' background_gradient_color2='' background_gradient_direction='vertical' src='' background_position='top left' background_repeat='no-repeat' animation='' mobile_breaking='' mobile_display='' av_uid='']". $images_featured_wrapper . $images_gallery_wrapper ."[/av_one_half]");

                        $price = "<div class='product-price'></div>";
                        if ( !empty($product_price) ) {
                            $price = "
                                <div class='product-price'>
                                    <span>" . $product_price . "</span>
                                </div>
                            ";
                        }

                        // Setup anchor tags
                        $anchors = "<div class='product-links'><a href='#' class='request-info button'>Request Info</a><a href='". get_bloginfo('url') ."/find-a-dealer/' class='find-a-dealer button'>Find a Dealer</a></div>";
                        if ( $product->ID === 2691 ) {
                            $price = '';
                            $anchors = "<div class='product-links'><a href='https://itunes.apple.com/us/app/avidyne-ifd100/id1094839820?mt=8' class='download-now button'>Download Now</a></div>";
                        }

                        // Right half content preview, price, call outs
                        echo do_shortcode("[av_one_half  min_height='' vertical_alignment='' space='' custom_margin='' margin='0px' row_boxshadow='' row_boxshadow_color='' row_boxshadow_width='10' link='' linktarget='' link_hover='' padding='0px' highlight='' highlight_size='' border='0px' border_color='' radius='0px' column_boxshadow='' column_boxshadow_color='' column_boxshadow_width='10' background='bg_color' background_color='' background_gradient_color1='' background_gradient_color2='' background_gradient_direction='vertical' src='' background_position='top left' background_repeat='no-repeat' animation='' mobile_breaking='' mobile_display='' av_uid='']
                                <strong class='post-title'>" . $post_title . "</strong>
                                ". $product_excerpt . $price . $anchors ."
                                <div class='product-excerpt'><small>". $product_fine_print ."</small></div>
                                [DISPLAY_ULTIMATE_SOCIAL_ICONS]
                            [/av_one_half]");

                    ?>
					</div>
                    <?php
                    /* Run the loop to output the posts.
                    * If you want to overload this in a child theme then include a file
                    * called loop-page.php and that will be used instead.
                    */
                    $avia_config['size'] = avia_layout_class( 'main' , false) == 'entry_without_sidebar' ? '' : 'entry_with_sidebar';
                    // echo do_shortcode('[thin-content-divider]');
                    echo get_template_part( 'includes/loop', 'product-single' );
					// $content = apply_filters( 'avia_builder_precompile', get_post_meta( get_the_ID(), '_aviaLayoutBuilderCleanData', true ) );
                    ?>

                <!--end content-->
                </main>
                <div class="clearfix"></div>
                <?php
                    $tabs = '';
                    // Product overview
                    if ( $total_sections >= 1 ) {
                        $tabs .= "<div id='product-overview-content'>[av_tab title='Overview' icon_select='no' icon='ue800' font='']" . trim( wpautop( $sections ) ) . "[/av_tab]</div>";
                    }

                    // Product specifications
                    if ( !is_field_empty( $product_specifications ) && false !== $product_specifications['product_specification_field'] ) {
                        $specs_title = 'Specifications';
                        $tabs .= "[av_tab title='". $specs_title ."' icon_select='no' icon='ue800' font='']<div class='container clearfix'>" . $specifications . "</div>[/av_tab]";
                    }

                    // Product compatibility
                    if ( !is_field_empty( $product_compatibility  ) && '' !== $product_compatibility['product_compatibility_details'] ) {
                        $comp_title = 'Compatibility';
                        $tabs .= "[av_tab title='". $comp_title ."' icon_select='no' icon='ue800' font='']<div class='container compatibility-container clearfix'>" . $compatibilities . "</div>[/av_tab]";
                    }

                    // Product functionality
                    if ( !is_field_empty( $product_functionality ) &&
                    '' !== $product_functionality['functionality_detials'] ) {
                        $func_title = 'Functionality';
                        $tabs .= "[av_tab title='". $func_title ."' icon_select='no' icon='ue800' font='']<div class='container clearfix'>" . $functionalities . "</div>[/av_tab]";
                    }

                    // Product documents
                    if ( !is_field_empty( $docs ) && NULL !== $docs ) {
                        $doc_title = 'Documentation';
                        $tabs .= "[av_tab title='". $doc_title ."' icon_select='no' icon='ue800' font='']<div class='container clearfix'>" .  $docs . "</div>[/av_tab]";

                    }

                    ?><?php
                    if ( $product->ID !== 2691 ) {
                        echo do_shortcode("[av_tab_container position='top_tab' boxed='border_tabs' initial='1' av_uid='av-jqmqim52' custom_class='']
                                    ". wpautop($tabs) ."
                                    [/av_tab_container]");
                    } else {
                        echo do_shortcode("<div id='product-overview-content'>" . trim( wpautop( $sections ) ) . "</div>");
                    }
                    echo '<div class="related-spacer clearfix"></div>';
                    echo do_shortcode("[avidyne-related-products]");
                ?>
            </div><!--end container-->

        </div><!-- close default .container_wrap element -->



		<?php get_footer();
} else {

	if ( !defined('ABSPATH') ){ die(); }
	
	global $avia_config, $post;

	if ( post_password_required() )
    {
		get_template_part( 'page' ); exit();
    }
	
	/**
	 * Temporary: Get all used elements for this post. Creates the option entries if they do not exist for this post
	 * ==========
	 * 
	 * Also hooked in 'get_header' 10 - can then be used in every page
	 * fires add_action( 'ava_current_post_element_info_available', $this ); in 'get_header'
	 */
//	$used_elements = Avia_Builder()->element_manager()->get_current_post_elements();
	

	/*
	 * get_header is a basic wordpress function, used to retrieve the header.php file in your theme directory.
	 */
	get_header();

	if( false === in_the_loop() )
	{
		/**
		 * To allow other plugins to hook into 'the_content' filter we call this function to set internal WP variables as we do on non ALB templates.
		 * Performs a call to setup_postdata().
		 */
		the_post();
	}
	else
	{
		/**
		 * This is for a fallback only
		 */
		setup_postdata( $post );
	}
	 

	//check if we want to display breadcumb and title
	if( get_post_meta(get_the_ID(), 'header', true) != 'no') echo avia_title();
	 
	do_action( 'ava_after_main_title' );

	if ( isset( $_REQUEST['avia_alb_parser'] ) && ( 'show' == $_REQUEST['avia_alb_parser'] ) && current_user_can( 'edit_post', get_the_ID() ) )
	{
		/**
		 * Display the parser info
		 */
		$content = Avia_Builder()->get_shortcode_parser()->display_parser_info();
		
		/**
		 * Allow e.g. codeblocks to hook properly
		 */
		$content = apply_filters( 'avia_builder_precompile', $content );
		
		Avia_Builder()->get_shortcode_parser()->set_builder_save_location( 'none' );
		$content = ShortcodeHelper::clean_up_shortcode( $content, 'balance_only' );
		ShortcodeHelper::$tree = ShortcodeHelper::build_shortcode_tree( $content );
	}
	else if( ! is_preview() )
	{
		/**
		 * Filter the content for content builder elements
		 */
		$content = apply_filters( 'avia_builder_precompile', get_post_meta( get_the_ID(), '_aviaLayoutBuilderCleanData', true ) );
	}
	else 
	{
		/**
		 * If user views a preview we must use the content because WordPress doesn't update the post meta field
		 */
		$content = apply_filters( 'avia_builder_precompile', get_the_content() );
		
		/**
		 * In preview we must update the shortcode tree to reflect the current page structure.
		 * Prior make sure that shortcodes are balanced.
		 */
		Avia_Builder()->get_shortcode_parser()->set_builder_save_location( 'preview' );
		$content = ShortcodeHelper::clean_up_shortcode( $content, 'balance_only' );
		ShortcodeHelper::$tree = ShortcodeHelper::build_shortcode_tree( $content );
	}

	/**
	 * @since 4.4.1
	 */
	do_action( 'ava_before_content_templatebuilder_page' ); ?>
	<?php echo do_shortcode("[avidyne-fallback-header]");?>
	<?php //check first builder element. if its a section or a fullwidth slider we dont need to create the default openeing divs here
	$first_el = isset(ShortcodeHelper::$tree[0]) ? ShortcodeHelper::$tree[0] : false;
	$last_el  = !empty(ShortcodeHelper::$tree)   ? end(ShortcodeHelper::$tree) : false;
	if(!$first_el || !in_array($first_el['tag'], AviaBuilder::$full_el ) )
	{
        echo avia_new_section(array('close'=>false,'main_container'=>true, 'class'=>'main_color container_wrap_first'));
	}
	$content = apply_filters('the_content', $content);
	$content = apply_filters('avf_template_builder_content', $content);
	echo $content;


	$avia_wp_link_pages_args = apply_filters('avf_wp_link_pages_args', array(
    	'before' =>'<nav class="pagination_split_post">'.__('Pages:','avia_framework'),
        'after'  =>'</nav>',
        'pagelink' => '<span>%</span>',
        'separator'        => ' ',
    ));

	wp_link_pages($avia_wp_link_pages_args);

	//only close divs if the user didnt add fullwidth slider elements at the end. also skip sidebar if the last element is a slider
	if(!$last_el || !in_array($last_el['tag'], AviaBuilder::$full_el_no_section ) )
	{
		$cm = avia_section_close_markup();

		echo "</div>";
		echo "</div>$cm <!-- section close by builder template -->";

		//get the sidebar
		if (is_singular('post')) {
		    $avia_config['currently_viewing'] = 'blog';
		}else{
		    $avia_config['currently_viewing'] = 'page';
		}
		
		// get_sidebar();
		
	}
	else
	{
		echo "<div><div>";
	}

	// global fix for https://kriesi.at/support/topic/footer-disseapearing/#post-427764
	if(in_array($last_el['tag'], AviaBuilder::$full_el_no_section ))
	{
		avia_sc_section::$close_overlay = "";
	}


	echo avia_sc_section::$close_overlay;
	echo '		</div><!--end builder template-->';
	echo '</div><!-- close default .container_wrap element -->';

	/**
	 * @since 4.4.1
	 */
	do_action( 'ava_after_content_templatebuilder_page' );

	get_footer();

}
