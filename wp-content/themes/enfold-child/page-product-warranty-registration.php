<?php
    // Template Name: Warranty & Registration
    if ( !defined('ABSPATH') ){ die(); }
    
    global $avia_config;

    /*
     * get_header is a basic wordpress function, used to retrieve the header.php file in your theme directory.
     */
     get_header();


     if( get_post_meta(get_the_ID(), 'header', true) != 'no') echo avia_title();

     do_action( 'ava_after_main_title' );
     echo do_shortcode('[avidyne-fallback-header]');

     $warranty_registration_page = get_post(3196);

     $advance_layout_builder_overview_content = get_field( 'product_overview_content_sections', $warranty_registration_page->ID );
     $warranty_registration_content = '<div class="container clearfix">' . wpautop( $warranty_registration_page->post_content ) . '</div>';

     $standard_warranty_content = '
        <div class="product-overview-section '. $advance_layout_builder_overview_content[1]['section_identifier'] .'" style="padding-top:0!important;">
            <div class="container clearfix">
                ' . wpautop( $advance_layout_builder_overview_content[1]['single_overview_content_section'] ) . '
            </div>
        </div>';

     $extended_warranty_content = '
        <div class="product-overview-section '. $advance_layout_builder_overview_content[2]['section_identifier'] .'" style="padding-top:0!important;">
            <div class="container clearfix">
                ' . wpautop( $advance_layout_builder_overview_content[2]['single_overview_content_section'] ) . '
            </div>
        </div>';

     // For multiple content sections
     if ( !empty($advance_layout_builder_overview_content) ) {
        $total_sections = count($advance_layout_builder_overview_content);
        if ( $total_sections >= 1 ) {
            foreach( $advance_layout_builder_overview_content as $i => $section ) :
                $warranty_registration_sections .= '
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

     ?>

        <div class='container_wrap container_wrap_first main_color full-width <?php avia_layout_class( 'main' ); ?>'>

            <div class='wrapper'>

                <main class='template-page content full-width-thin-content  <?php avia_layout_class( 'content' ); ?> units' <?php avia_markup_helper(array('context' => 'content','post_type'=>'page'));?>>

                    <?php
                    $tabs = "[av_tab title='WARRANTY REGISTRATION' icon_select='no' icon='ue800' font='']". $warranty_registration_content .  $warranty_registration_sections ."[/av_tab]";
                    $tabs .= "[av_tab title='STANDARD WARRANTY' id='standard-warranty' icon_select='no' icon='ue800' font='']". $standard_warranty_content ."[/av_tab]";
                    $tabs .= "[av_tab title='EXTENDED WARRANTY' id='extended-warranty' icon_select='no' icon='ue800' font='']". $extended_warranty_content ."[/av_tab]";
                    echo do_shortcode("[av_tab_container position='top_tab' boxed='border_tabs' initial='1' av_uid='av-jqmqim52' custom_class='']
                        ". $tabs ."
                        [/av_tab_container]"); ?>

                <!--end content-->
                </main>

            </div><!--end container-->

        </div><!-- close default .container_wrap element -->

<?php get_footer(); ?>
