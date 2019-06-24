<?php
    // Template Name: Documentation
    if ( !defined('ABSPATH') ){ die(); }
    
    global $avia_config;

    /*
     * get_header is a basic wordpress function, used to retrieve the header.php file in your theme directory.
     */
     get_header();


     if( get_post_meta(get_the_ID(), 'header', true) != 'no') echo avia_title();

    if ( post_password_required() ) {
        get_template_part( 'page' ); exit();
    }

     do_action( 'ava_after_main_title' );
     echo do_shortcode('[avidyne-fallback-header]'); ?>

        <div class='container_wrap container_wrap_first main_color full-width <?php avia_layout_class( 'main' ); ?>'>

            <div class='container'>

                <main class='template-page content  <?php avia_layout_class( 'content' ); ?> units' <?php avia_markup_helper(array('context' => 'content','post_type'=>'page'));?>>

                    <?php
                    $products = get_posts( array( 'post_type' => 'product', 'numberposts' => -1, 'order' => 'ASC', 'orderby' => 'name' ) );
                    $documents = get_posts( array( 'post_type' => 'wpdmpro', 'numberposts' => -1 ) );
                    $document_terms = get_terms( array( 'taxonomy' => 'product_categories', 'hide_empty' => true, 'number' => 0 ) );
                    $document_data = array();

                    $doc_tags = get_terms(
                        array(
                            'taxonomy' => 'post_tag',
                            'hide_empty' => true,
                            'number' => 0
                        )
                    );

                    // Downloads by type
                    foreach($doc_tags as $tag) :

                        $all_docs = get_posts(
                            array(
                                'post_type' => 'wpdmpro',
                                'numberposts' => -1,
                                'order' => 'ASC',
                                'orderby' => 'name',
                                'tax_query' => array(
                                    array(
                                        'taxonomy' => $tag->taxonomy,
                                        'field'    => 'slug',
                                        'terms'    => $tag->slug,
                                    ),
                                ),
                            )
                        );
                        $file_count = ' (' . count( $all_docs ) . ')';
                        if ( !empty($all_docs) ) {
                            $current_doc = array();
                            foreach( $all_docs as $document ) {
                                $document_data = array();
                                $files = maybe_unserialize(get_post_meta($document->ID, '__wpdm_files', true));
                                $fileinfo = get_post_meta($document->ID, '__wpdm_fileinfo', true);
                                $file_size = get_post_meta($document->ID, '__wpdm_package_size', true);
                                $part_number = get_field('part_number',$document->ID);
                                $file_revision = get_field('file_revision',$document->ID);
                                $file_state = get_field('current_or_legacy',$document->ID);
                                $upload_date = get_the_date();
                                if ( is_array($files) ) {
                                    foreach( $fileinfo as $id => $file ) {
                                        $download_url = get_bloginfo('url') . '/avidyne?wpdmdl='. $document->ID .'&ind='. $id;
                                        $file_data = array(
                                            'id' => $id,
                                            'pid' => $document->ID,
                                            'title' => $file['title'],
                                            'password' => $file['password'],
                                            'url' => $download_url,
                                            'date' => $upload_date,
                                            'revision' => $file_revision,
                                            'state' => $file_state,
                                            'part' => $part_number,
                                            'size' => $file_size
                                        );
                                        array_push( $document_data, $file_data );
                                    }
                                }
                                array_push( $current_doc, array( 'term' => $term, 'product' => $doc, 'files' => $document_data ) );
                            }
                            $product_title = $tag->name;
                            $total_files = count( $current_doc['files'] );
                            foreach( $current_doc as $item ) {
                                foreach( $item['files'] as $file ) {
                                    $download_url = $file['url'];
                                    $download_title = $file['title'];
                                    $download_part_number = $file['part'];
                                    $download_date = $file['date'];
                                    $download_revision = $file['revision'];
                                    $download_size = $file['size'];
                                    $download_state = strtolower($file['state']);

                                    $toggle .= "<div class='support-document ". $download_state ."'><div class='document-wrapper'><div class='avidyne-rows clearfix'><div class='row avidyne-12 avidyne-6'><a href='". $download_url ."'>". $download_title ."</a></div><div class='row avidyne-12 avidyne-3'><div class='data-block'><span class='document-date'>Date: 11/28/2017</span><span class='document-part-number'>Part Number: ". $download_part_number ."</span><span class='document-file-size'>File Size: ". $download_size ."</span><span class='document-revision'>File Revision: ". $download_revision ."</span></div></div><div class='row avidyne-12 avidyne-3'><a href='". $download_url ."' class='document-download'>Download PDF</a></div></div></div></div>";
                                }
                            }
                            $type_downloads .= "
                                [av_toggle_container initial='0' mode='accordion' sort='' styling='' colors='' font_color='' background_color='' border_color='' hover_colors='' hover_background_color='' hover_font_color='' colors_current='' font_color_current='' background_current='' background_color_current='' background_gradient_current_color1='' background_gradient_current_color2='' background_gradient_current_direction='vertical' av_uid='' custom_class='avidyne-documentation-section all legacy current'][av_toggle title='". $product_title . $file_count . "' tags='']". $toggle ."[/av_toggle][/av_toggle_container]
                            ";
                        }

                    endforeach;

                    $toggle = '';
                    // Downloads by products
                    foreach( $document_terms as $term ) {
                        $current_doc = [];
                        // Exclude generic parent terms
                        if ($term->parent === (int) 0) {
                            continue;
                        }

                        $product = array();
                        $product_title = $page_fields = '';
                        $docs = get_posts(
                            array(
                                'post_type' => 'wpdmpro',
                                'numberposts' => -1,
                                'order' => 'ASC',
                                'orderby' => 'name',
                                'tax_query' => array(
                                    array(
                                        'taxonomy' => $term->taxonomy,
                                        'field'    => 'slug',
                                        'terms'    => $term->slug,
                                    ),
                                ),
                            )
                        );

                        if ( !empty($docs) ) {
                            $current_doc = array();
                            foreach( $docs as $doc ) {
                                $document_data = array();
                                $files = maybe_unserialize(get_post_meta($doc->ID, '__wpdm_files', true));
                                $fileinfo = get_post_meta($doc->ID, '__wpdm_fileinfo', true);
                                $file_size = get_post_meta($doc->ID, '__wpdm_package_size', true);
                                $part_number = get_field('part_number',$doc->ID);
                                $file_revision = get_field('file_revision',$doc->ID);
                                $file_state = get_field('current_or_legacy',$doc->ID);
                                $upload_date = get_the_date();
                                if ( is_array($files) ) {
                                    foreach( $fileinfo as $id => $file ) {
                                        $download_url = get_bloginfo('url') . '/avidyne?wpdmdl='. $doc->ID .'&ind='. $id;
                                        $file_data = array(
                                            'id' => $id,
                                            'pid' => $doc->ID,
                                            'title' => $file['title'],
                                            'password' => $file['password'],
                                            'url' => $download_url,
                                            'date' => $upload_date,
                                            'revision' => $file_revision,
                                            'state' => $file_state,
                                            'part' => $part_number,
                                            'size' => $file_size
                                        );
                                        array_push( $document_data, $file_data );
                                    }
                                }
                                array_push( $current_doc, array( 'term' => $term, 'product' => $doc, 'files' => $document_data ) );
                            }
                            $products = get_posts(
                                array(
                                    'post_type' => 'product',
                                    'numberposts' => -1,
                                    'order' => 'DESC',
                                    'orderby' => 'name',
                                    'tax_query' => array(
                                        array(
                                            'taxonomy' => $term->taxonomy,
                                            'field'    => 'slug',
                                            'terms'    => $term->slug,
                                        ),
                                    ),
                                )
                            );
                            foreach( $products as $i => $product ) :
                                $current_or_legacy = get_field('current_or_legacy',$doc->ID);
                                $page_fields = get_field('general_product_details',$product->ID);
                                $product_title = !empty( $page_fields['product_identifier'] ) ? trim($page_fields['product_identifier']) : $term->name;
                                if ( true ) {
                                    $toggle = '';
                                    $total_files = count( $current_doc ) ;
                                    foreach( $current_doc as $item ) {
                                        foreach( $item['files'] as $file ) {
                                            $download_url = $file['url'];
                                            $download_title = $file['title'];
                                            $download_part_number = $file['part'];
                                            $download_date = $file['date'];
                                            $download_revision = $file['revision'];
                                            $download_size = $file['size'];
                                            $download_state = strtolower($file['state']);

                                            $toggle .= "<div class='support-document ". $download_state ."'><div class='document-wrapper'><div class='avidyne-rows clearfix'><div class='row avidyne-12 avidyne-6'><a href='". $download_url ."'>". $download_title ."</a></div><div class='row avidyne-12 avidyne-3'><div class='data-block'><span class='document-date'>Date: 11/28/2017</span><span class='document-part-number'>Part Number: ". $download_part_number ."</span><span class='document-file-size'>File Size: ". $download_size ."</span><span class='document-revision'>File Revision: ". $download_revision ."</span></div></div><div class='row avidyne-12 avidyne-3'><a href='". $download_url ."' class='document-download'>Download PDF</a></div></div></div></div>";
                                        }
                                    }
                                    $product_downloads .= "
                                        [av_toggle_container initial='0' mode='accordion' sort='' styling='' colors='' font_color='' background_color='' border_color='' hover_colors='' hover_background_color='' hover_font_color='' colors_current='' font_color_current='' background_current='' background_color_current='' background_gradient_current_color1='' background_gradient_current_color2='' background_gradient_current_direction='vertical' av_uid='' custom_class='avidyne-documentation-section all legacy current'][av_toggle title='". $product_title ." (" . $total_files . ")' tags='']". $toggle ."[/av_toggle][/av_toggle_container]
                                    ";
                                }
                            endforeach;
                        }
                    }
                    $tabs = "[av_tab title='DOWNLOADS BY PRODUCT' icon_select='no' icon='ue800' font='']". $product_downloads ."[/av_tab]";
                    $tabs .= "[av_tab title='DOWNLOADS BY TYPE' icon_select='no' icon='ue800' font='']". $type_downloads ."[/av_tab]";
                    echo do_shortcode("[av_tab_container position='top_tab' boxed='border_tabs' initial='1' av_uid='av-jqmqim52' custom_class='']
                        <div id='product-download-heading'>
                            <h2 id='type-product-title' class='support-main-title'>Downloads By Product</h2>
                            <div id='support-filters'>
                                <div class='filter-wrapper'>
                                    <div id='filter-all' class='active-filter all'>All</div>
                                    <div id='filter-current' class='current'>Current</div>
                                    <div id='filter-legacy' class='legacy'>Legacy</div>
                                </div>
                            </div>
                        </div>
                        <div id='type-download-heading' style='display:none;'>
                            <h2 id='by-product-title' class='support-main-title'>Downloads By Type</h2>
                        </div>
                        ". $tabs ."
                        [/av_tab_container]"); ?>

                <!--end content-->
                </main>

            </div><!--end container-->

        </div><!-- close default .container_wrap element -->

<?php get_footer(); ?>
