<?php
	if ( !defined('ABSPATH') ){ die(); }

	global $avia_config, $more;

	/*
	 * get_header is a basic wordpress function, used to retrieve the header.php file in your theme directory.
	 */
	 get_header();

		$showheader = true;
		if(avia_get_option('frontpage') && $blogpage_id = avia_get_option('blogpage'))
		{
			if(get_post_meta($blogpage_id, 'header', true) == 'no') $showheader = false;
		}

	 	if($showheader)
	 	{
			echo avia_title(array('title' => avia_which_archive()));
		}

		do_action( 'ava_after_main_title' );

        $term = get_queried_object();
        $term_id = $term->term_id;
        $term_tax = $term->taxonomy;
        $term_header_image = z_taxonomy_image_url( $term_id, '', TRUE );
        $term_name = $term->name;
        $term_description = get_field( 'content_title', $term_tax . '_' . $term_id );
        $term_content = get_field( 'category_content', $term_tax . '_' . $term_id ); ?>



		<div class='container_wrap container_wrap_first main_color <?php avia_layout_class( 'main' ); ?>'>

            <?php
            // Header image section + main title
            if ( !empty($term_header_image ) && NULL !== $term_header_image ) { ?>
                <div id="header-area" style="background-image: url(<?php echo $term_header_image; ?>);background-size: cover; background-position: center center;">
                    <div class="container">
                        <h1 id="product-main-title">
                            <span><?php echo $term_name; ?> Solutions</span>
                        </h1>
                    </div>
                </div>
             <?php } ?>

             <?php
                $advance_layout_builder_overview_content = get_field( 'product_overview_content_sections', $term );

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
                    } else {
                        $product_overview = trim( $advance_layout_builder_overview_content[0]['single_overview_content_section'] );
                    }
                 }
             ?>

            <div class="wrapper main-content-wrapper">

    			<div class='container'>

    				<main class='content full-width <?php avia_layout_class( 'content' ); ?> units' <?php avia_markup_helper(array('context' => 'content','post_type'=>'products'));?>>
                        <h2><?php echo $term_description; ?></h2>
                        <div style=" margin-top:0; margin-bottom:30px;" class="hr hr-custom hr-center hr-icon-no   avia-builder-el-3  el_after_av_heading  el_before_av_textblock ">
                            <span class="hr-inner   inner-border-av-border-fat" style=" width:150px; border-color:#929292;">
                                <span class="hr-inner-style"></span>
                            </span>
                        </div>
                        <div class="entry-content">
                            <?php echo do_shortcode($term_content); ?>
                        </div>
                        <?php echo do_shortcode($sections); ?>
    				<!--end content-->
    				</main>

    				<?php

    				//get the sidebar
                    if (avia_get_option('archive_sidebar') == 'archive_sidebar_separate') {
                        $avia_config['currently_viewing'] = 'archive';
                    }
                    else {
                        $avia_config['currently_viewing'] = 'blog';
                    }
                    
    				?>
    			</div><!--end container-->

            </div>

            <div class="container">
                <?php echo do_shortcode("[avidyne-related-products]"); ?>
            </div>

		</div><!-- close default .container_wrap element -->




<?php get_footer(); ?>
