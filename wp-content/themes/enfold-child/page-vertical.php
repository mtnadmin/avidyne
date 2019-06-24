<?php
    // Template Name: Vertical
	if ( !defined('ABSPATH') ){ die(); }

	global $avia_config;

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
     $product_compatibility = get_field( 'product_compatibility', $post->ID );
     $product_functionality = get_field( 'product_functionality', $post->ID );
     $product_documents = get_field( 'product_documentation', $post->ID );
     $advance_layout_builder_overview_content = get_field( 'product_overview_content_sections', $post->ID );
     // var_dump($advance_layout_builder_overview_content);

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

     // Product documentation
     foreach($product_documents['documentation_details'] as $document_detail) :
        $document_title = $document_detail['document_title'];
        $document_url = $document_detail['document_link'];
        $document_url_text = $document_detail['document_link_text'];
        $documents .= '<div class="product-document"><strong style="display:block;">'. $document_title  .'</strong><a href="'. $document_url .'">'. $document_url_text .'</a></div>';
     endforeach;

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


     // Header image section + main title
     if ( !empty($general_product_details['product_header_image']['url']) && NULL !== $general_product_details['product_header_image']['url'] ) { ?>
        <div id="header-area" style="background-image: url(<?php echo $general_product_details['product_header_image']['url']; ?>);background-size: cover; background-position: center center;">
            <div class="container">
                <h1 id="product-main-title">
                    <span><?php echo $general_product_details['product_identifier']; ?></span>
                    <br />
                    <?php echo $general_product_details['product_header_title']; ?>
                </h1>
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


                        <?php if( get_post_meta(get_the_ID(), 'header', true) != 'no') echo avia_title();

                        do_action( 'ava_after_main_title' );
                         echo do_shortcode('[avidyne-fallback-header]'); ?>

                        <main class='template-page content full-width' <?php avia_markup_helper(array('context' => 'content','post_type'=>'page'));?>>
                            <div class="container">
                                <?php
                                $avia_config['size'] = avia_layout_class( 'main' , false) == 'fullsize' ? 'entry_without_sidebar' : 'entry_with_sidebar';
                                get_template_part( 'includes/loop', 'page' );
                                ?>
                            </div>
                    <?php
                    /* Run the loop to output the posts.
                    * If you want to overload this in a child theme then include a file
                    * called loop-page.php and that will be used instead.
                    */

                    $avia_config['size'] = avia_layout_class( 'main' , false) == 'entry_without_sidebar' ? '' : 'entry_with_sidebar';
                    // get_template_part( 'includes/loop', 'product-single' );
                    global $avia_config, $post;
                    // echo do_shortcode( get_template_part( 'page' ) );
                    $content = apply_filters( 'avia_builder_precompile', get_post_meta( get_the_ID(), '_aviaLayoutBuilderCleanData', true ) );
                    // echo do_shortcode('[thin-content-divider]' . $content);
                    ?>

                <!--end content-->
                </main>
                <div class="clearfix"></div>
                <?php
                    echo do_shortcode(trim( wpautop( $sections ) ));

                    echo '<div class="related-spacer clearfix"></div>';

                    echo do_shortcode("[avidyne-related-products]");
                ?>
            </div><!--end container-->

        </div><!-- close default .container_wrap element -->



        <?php get_footer();
