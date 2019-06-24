<?php
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

     // var_dump($product_overview);

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

        $images_gallery_wrapper = '<div id="product-gallery">' . $image_html . '</div>';
        $images_featured_wrapper = '<div id="product-featured">' . $image_html . '</div>';
        $gallery = $all_images;
        // $gallery = do_shortcode("[av_gallery ids='". $all_images ."' style='big_thumb' preview_size='featured_large' crop_big_preview_thumbnail='avia-gallery-big-crop-thumb' thumb_size='thumbnail' columns='". $total_images ."' imagelink='lightbox' lazyload='avia_lazyload' av_uid='av-jq87vh3j' custom_class='product-images' admin_preview_bg='']");
    } ?>

        <div class='container_wrap container_wrap_first main_color <?php avia_layout_class( 'main' ); ?>' style="border:0;">

            <div class='container'>

                <main class='template-page template-product content clearfix ' <?php avia_markup_helper(array('context' => 'content','post_type'=>'product'));?> style="border:0;">
                    <?php
                        // Left half image gallery
                        echo do_shortcode("[av_one_half first  min_height='' vertical_alignment='' space='' custom_margin='' margin='0px' row_boxshadow='' row_boxshadow_color='' row_boxshadow_width='10' link='' linktarget='' link_hover='' padding='0px' highlight='' highlight_size='' border='0px' border_color='' radius='0px' column_boxshadow='' column_boxshadow_color='' column_boxshadow_width='10' background='bg_color' background_color='' background_gradient_color1='' background_gradient_color2='' background_gradient_direction='vertical' src='' background_position='top left' background_repeat='no-repeat' animation='' mobile_breaking='' mobile_display='' av_uid='']". $images_featured_wrapper . $images_gallery_wrapper ."[/av_one_half]");
                    ?>
                    <?php
                        // Right half content preview, price, call outs
                        echo do_shortcode("[av_one_half  min_height='' vertical_alignment='' space='' custom_margin='' margin='0px' row_boxshadow='' row_boxshadow_color='' row_boxshadow_width='10' link='' linktarget='' link_hover='' padding='0px' highlight='' highlight_size='' border='0px' border_color='' radius='0px' column_boxshadow='' column_boxshadow_color='' column_boxshadow_width='10' background='bg_color' background_color='' background_gradient_color1='' background_gradient_color2='' background_gradient_direction='vertical' src='' background_position='top left' background_repeat='no-repeat' animation='' mobile_breaking='' mobile_display='' av_uid='']
                                <strong class='post-title'>" . $post_title . "</strong>
                                ". $product_excerpt ."
                                <div class='product-price'>
                                From <span>" . $product_price . "</span><sup>*</sup>
                                </div>
                                <div class='product-links'>
                                    <a href='#' class='request-info button'>Request Info</a><a href='#' class='find-a-dealer button'>Find a Dealer</a>
                                </div>
                                <div class='product-excerpt'><small>". $product_fine_print ."</small></div>
                                [DISPLAY_ULTIMATE_SOCIAL_ICONS]
                            [/av_one_half]");

                    ?>

                    <?php
                    /* Run the loop to output the posts.
                    * If you want to overload this in a child theme then include a file
                    * called loop-page.php and that will be used instead.
                    */

                    $avia_config['size'] = avia_layout_class( 'main' , false) == 'entry_without_sidebar' ? '' : 'entry_with_sidebar';
                    get_template_part( 'includes/loop', 'product-single' );
                    ?>

                <!--end content-->
                </main>
                <?php
                    $tabs = '';
                    // Product overview
                    if ( !is_field_empty( $product_overview ) ) {
                        $overview_title = 'Overview';
                        $tabs .= "<div id='product-overview-content'>[av_tab title='". $overview_title ."' icon_select='no' icon='ue800' font='']" . trim( wpautop( $product_overview ) ) . "[/av_tab]</div>";
                    }

                    // Product specifications
                    if ( !is_field_empty( $product_specifications ) ) {
                        $specs_title = 'Specifications';
                        $tabs .= "[av_tab title='". $specs_title ."' icon_select='no' icon='ue800' font='']" . $specifications . "[/av_tab]";
                    }

                    // Product compatibility
                    if ( !is_field_empty( $product_compatibility ) ) {
                        $comp_title = 'Compatibility';
                        $tabs .= "[av_tab title='". $comp_title ."' icon_select='no' icon='ue800' font='']" . $product_compatibility['compatibility_details'] . "[/av_tab]";
                    }

                    // Product functionality
                    if ( !is_field_empty( $product_functionality ) ) {
                        $func_title = 'Functionality';
                        $tabs .= "[av_tab title='". $func_title ."' icon_select='no' icon='ue800' font='']" . $product_functionality['functionality_detials'] . "[/av_tab]";
                    }

                    // Product documents
                    if ( !is_field_empty( $product_documents ) ) {
                        $doc_title = 'Documentation';
                        $tabs .= "[av_tab title='". $doc_title ."' icon_select='no' icon='ue800' font='']" . $documents . "[/av_tab]";
                    }

                    echo do_shortcode("[av_tab_container position='top_tab' boxed='border_tabs' initial='1' av_uid='av-jqmqim52' custom_class='']
                                ". $tabs ."
                                [/av_tab_container]");

                    echo '<div class="related-spacer clearfix"></div>';

                    echo do_shortcode("[avidyne-related-products]");
                ?>
            </div><!--end container-->

        </div><!-- close default .container_wrap element -->



<?php get_footer(); ?>