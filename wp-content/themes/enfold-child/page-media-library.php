<?php
    // Template Name: Media Library
    if ( !defined('ABSPATH') ){ die(); }
    
    global $avia_config;

    /*
     * get_header is a basic wordpress function, used to retrieve the header.php file in your theme directory.
     */
     get_header();


     if( get_post_meta(get_the_ID(), 'header', true) != 'no') echo avia_title();

     do_action( 'ava_after_main_title' );
     echo do_shortcode('[avidyne-fallback-header]'); ?>

        <div class='container_wrap container_wrap_first main_color full-width <?php avia_layout_class( 'main' ); ?>'>

            <div class='container'>

                <main class='template-page content  <?php avia_layout_class( 'content' ); ?> units' <?php avia_markup_helper(array('context' => 'content','post_type'=>'page'));?>>

                    <?php
                    $documents = get_posts( array( 'post_type' => 'wpdmpro', 'numberposts' => -1 ) );
                    $document_terms = get_terms( array( 'taxonomy' => 'wpdmcategory', 'hide_empty' => true, 'number' => 0 ) );
                    $document_data = array();
                    // var_dump($document_terms);
                    foreach( $document_terms as $term ) {
                        $current_doc = [];
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
                                // var_dump($docs);
                                // echo '<br /><br />';
                                if ( is_array($files) ) {
                                    foreach( $fileinfo as $id => $file ) {
                                        $dl_link = get_permalink($doc->ID);
                                        $download_url = $dl_link . '?wpdmdl='. $doc->ID .'&ind='. $id;
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
                                            'size' => $file_size,
                                            'name' => $files[$id]
                                        );
                                        array_push( $document_data, $file_data );
                                    }
                                }
                                array_push( $current_doc, array( 'term' => $term, 'product' => $doc, 'files' => $document_data ) );
                            }

                            foreach( $current_doc as $item ) {
                                $downloads = '';
                                foreach( $item['files'] as $file ) {
                                    $total_files = count( $item['files'] );
                                    $download_url = $file['url'];
                                    $download_title = $file['title'];
                                    $download_part_number = $file['part'];
                                    $download_date = $file['date'];
                                    $download_revision = $file['revision'];
                                    $download_size = $file['size'];
                                    $download_state = strtolower($file['state']);
                                    $file_type = substr($file['name'], strrpos($file['name'], '.' ) + 1);
                                    $file_type = strtoupper($file_type);
                                    $downloads .= "<a href='". $download_url ."' class='document-download'>Download ". $file_type ."</a>";
                                    $image = get_the_post_thumbnail_url($file['pid']);
                                    $image = $download_url;
                                    $set_image_url = wp_get_attachment_image_src($file['id']);
                                    // var_dump($set_image_url);
                                    // echo 'This: ' . $filepath;
                                }
                                $toggle .= "
                                    <div class='support-document ". $download_state . " " . $term->slug . "'>
                                        <div class='document-wrapper'>
                                            <div class='avidyne-rows clearfix' data-equalizer>
                                                <div class='row avidyne-12 avidyne-2 media-preview'>
                                                    <a href='". $image  ."' rel='lightbox'>
                                                        <div data-equalizer-watch><div><img src='". $download_url ."' alt='". $download_title ."'></div></div>
                                                    </a>
                                                </div>
                                                <div class='row avidyne-12 avidyne-4 media-title'>
                                                    <div data-equalizer-watch><a href='". $download_url ."'>". $download_title ."</a></div>
                                                </div>
                                                <div class='row avidyne-12 avidyne-6 media-download'>
                                                    <div data-equalizer-watch>". $downloads ."</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>";
                            }
                        }
                    }
                    echo do_shortcode("[av_tab_container position='top_tab' boxed='border_tabs' initial='1' av_uid='av-jqmqim52' custom_class='']
                        <div id='product-download-heading'>
                            <h2 id='type-product-title' class='support-main-title'>Avidyne Image & Logo Library</h2>
                            <div id='support-filters'>
                                <div class='filter-wrapper'>
                                    <div id='filter-all' class='active-filter all'>All</div>
                                    <div id='filter-logos' class='current'>Logos</div>
                                    <div id='filter-products' class='legacy'>Products</div>
                                    <div id='filter-panel-installations' class='legacy'>Panel Installations</div>
                                </div>
                            </div>
                        </div>
                        ". $toggle ."
                        [/av_tab_container]"); ?>

                <!--end content-->
                </main>

            </div><!--end container-->

        </div><!-- close default .container_wrap element -->

<?php get_footer(); ?>
