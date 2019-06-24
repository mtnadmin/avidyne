<?php

add_filter('acf/settings/remove_wp_meta_box', '__return_false');

if ( !function_exists('avidyne_assets') ) {
    function avidyne_assets() {
        $child_theme_url    = get_stylesheet_directory_uri();
        // Styles
        wp_enqueue_style( 'google-fonts' ,  "https://fonts.googleapis.com/css?family=Maven+Pro:300,400,500,700,900", array(), '', 'all' );
        wp_enqueue_style( 'child-style' ,  $child_theme_url."/style.css", array(), '', 'all' );
        wp_enqueue_style( 'avidyne-style' ,  $child_theme_url."/dist/assets/css/app.css", array(), '', 'all' );

        // Scripts
        wp_enqueue_script( 'avidyne', $child_theme_url."/dist/assets/js/app.js", array(), '2.4.0', true );
    }
    add_action( 'wp_enqueue_scripts', 'avidyne_assets' );
}

if ( !function_exists('avidyne_admin_assets') ) {
    function avidyne_admin_assets() {
        $child_theme_url    = get_stylesheet_directory_uri();
        wp_enqueue_style( 'avidyne-style' ,  $child_theme_url."/dist/assets/css/admin.css", array(), '', 'all' );

        // Scripts
        // wp_enqueue_script( 'avidyne', $child_theme_url."/dist/assets/js/admin.js", array(), '2.4.0', true );
    }
    add_action( 'admin_enqueue_scripts', 'avidyne_admin_assets' );
}

if ( !function_exists('mobile_chart_filter') ) {
    function mobile_chart_filter($args,$content,$name) {
        return '
            <div id="'. $name .'">
                <div class="container">
                    <div class="550">
                        <button>IFD550</button>
                    </div>
                    <div class="545">
                        <button>IFD545</button>
                    </div>
                    <div class="540">
                        <button>IFD540</button>
                    </div>
                    <div class="510">
                        <button>IFD510</button>
                    </div>
                    <div class="440">
                        <button>IFD440</button>
                    </div>
                    <div class="410">
                        <button>IFD410</button>
                    </div>
                </div>
            </div>';
        }
        add_shortcode( 'mobile-chart-filter', 'mobile_chart_filter' );
}

if ( !function_exists('avidyne_careers') ) {
    function avidyne_careers() {
        $careers = get_posts(array(
            'post_type' => 'careers',
            'numberposts' => -1,
            'order' => 'DESC',
            'orderby' => 'date',
        ));
        foreach( $careers as $career ) :
            $position = $career->post_title;
            $state = get_field( 'location-state', $career->ID );
            $city = get_field( 'location-city', $career->ID );
            $department = get_the_terms( $career->ID, 'departments' );
            $output .= '
                <div class="career-listing">
                    <div class="container clearfix">
                        <h3>'. $position .'</h3>
                        <div class="listing-department">Department: '. $department[0]->name .'</div>
                        <div class="listing-location">Location: '. $city .', '. $state .'</div>
                    </div>
                </div>
            ';
        endforeach;
        return '<div id="careers">'. $output .'</div>';
    }
    add_shortcode( 'avidyne-careers', 'avidyne_careers' );
}

if ( !function_exists('avidyne_localization_scripts') ) {
    function avidyne_localization_scripts() {
        if ( is_admin() ) {
            return;
        }
        $product_items = array();
        // Get product terms object
        $product_terms = get_terms(
            array(
                'taxonomy' => 'product_categories',
                'hide_empty' => true,
                'parent' => 0,
                'exclude' => array(54,36)
            )
        );
        // Setup terms and related products
        foreach( $product_terms as $term ) :
            $products = get_posts(
                array(
                    'post_type' => 'product',
                    'numberposts' => -1,
                    'tax_query' => array(
                        array(
                            'taxonomy' => $term->taxonomy,
                            'field'    => 'slug',
                            'terms'    => $term->slug,
                        )
                    )
                )
            );
            $term->products = $products;
            $product_items[$term->name] = $term;
        endforeach;
        $datatoBePassed = array(
            'site_url' => get_bloginfo('url'),
            'theme_uri' => get_stylesheet_directory_uri(),
            'product_items' => $product_items
        );
        wp_localize_script( 'avidyne', 'php_vars', $datatoBePassed );
    }
    add_action( 'wp_enqueue_scripts', 'avidyne_localization_scripts' );
}

if ( !function_exists('remove_portfolio') ) {
    function remove_portfolio() {
        remove_action('init', 'portfolio_register');
    }
    add_action('after_setup_theme', 'remove_portfolio');
}

if ( !function_exists('latest_news') ) {
    function latest_news() {
        $posts = get_posts(array(
            'post_type' => 'post',
            'numberposts' => 3,
            'order' => 'DESC',
            'orderby' => 'date',
            'tax_query' => array(
                array(
                    'taxonomy' => 'category',
                    'field'    => 'slug',
                    'terms'    => 'press-release',
                ),
            )
        ));

        foreach($posts as $post) : setup_postdata($post);
            $date = get_the_date('M d', $post);
            $permalink = get_the_permalink($post->ID);
            $image = get_the_post_thumbnail_url($post, 'large');
            $excerpt = get_the_content($post);
            $excerpt = strip_tags($excerpt);
            $excerpt = substr($excerpt, 0, 100);
            $excerpt = substr($excerpt, 0, strripos($excerpt, " "));
            $excerpt = $excerpt.'...';
            $title = $post->post_title;
            $title = strip_tags($title);
            $title = substr($title, 0, 125);
            $title = substr($title, 0, strripos($title, " "));
            $title = $title.'...';
            $image_class = 'custom-image';
            if (!$image) {
                $image_class = 'fallback-image';
                $image = get_stylesheet_directory_uri() . '/dist/assets/images/avidyne-logo-news-4x.png';
            }
            $feed .= '
                <div>
                    <div class="av-layout-grid-container entry-content-wrapper av-flex-cells container_wrap fullsize">
                        <div class="item flex_cell no_margin content-wrapper">
                            <div class="image-container '. $image_class .'">
                                <img src="'. $image .'" alt="">
                            </div>
                            <div class="item-content">
                                <a href="'. $permalink .'">
                                    <strong>'. $title .'</strong>
                                </a>
                                <p>
                                    <span class="date">'. $date .'</span> -
                                    '. $excerpt .'
                                    <a href="'. $permalink .'" class="read-more">more <i class="fa fa-angle-double-right"></i></a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ';
        endforeach;
        return '<div id="latest-news-section"><div class="row clearfix" data-equalizer>'. $feed .'</div></div>';
    }
    add_shortcode( 'latest-news', 'latest_news' );
}

if ( !function_exists('latest_events') ) {
    function latest_events() {
        $posts = get_posts(array(
            'post_type' => 'post',
            'numberposts' => 20,
            'order' => 'DESC',
            'orderby'  => array( 'meta_value_num' => 'ASC', 'title' => 'DESC' ),
            'meta_key' => 'start_date',
            'tax_query' => array(
                array(
                    'taxonomy' => 'category',
                    'field'    => 'slug',
                    'terms'    => 'trade-shows-events',
                ),
            )
        ));

        foreach($posts as $post) : setup_postdata($post);
            $source = get_field('start_date', $post->ID);
            $todays_date = new DateTime;
            $todays_date = $todays_date->format('Ymd');
            if ( strtotime($todays_date) > strtotime($source) || $count > 3 ) {
                continue;
            }

            $date = new DateTime($source);
            $date = $date->format('F j, Y');
            $permalink = get_the_permalink($post->ID);
            $image = get_the_post_thumbnail_url($post, 'large');
            $excerpt = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam scelerisque nisi nec justo suscipit, eu lacinia enim pulvinar. Cras a maximus lectus. Vestibulum ut est a dui feugiat congue. Pellentesque eleifend nibh turpis, a dapibus velit volutpat et. Nunc consequat viverra ipsum, sit amet tempor lectus laoreet a.';
            $excerpt = strip_tags($excerpt);
            $excerpt = substr($excerpt, 0, 100);
            $excerpt = substr($excerpt, 0, strripos($excerpt, " "));
            $excerpt = $excerpt.'...';
            $alt_title = get_field( 'venue', $post->ID );
            $title = !empty($alt_title) ? $alt_title : $post->post_title;
            if (!$image) {
                $image = get_stylesheet_directory_uri() . '/dist/assets/images/avidyne-logo-news-4x.png';
            }
            $feed .= '
                <div class="avidyne-event">
                    <div class="av-layout-grid-container entry-content-wrapper av-flex-cells container_wrap fullsize">
                        <div class="item flex_cell no_margin content-wrapper">
                            <div class="image-container">
                                <img src="'. $image .'" alt="">
                            </div>
                            <div class="item-content">
                                <a href="'. $permalink .'">
                                    <strong>'. $title .'</strong>
                                </a>
                                <p>
                                    <span class="date">'. $date .'</span> -
                                    '. $excerpt .'
                                    <a href="'. $permalink .'" class="read-more">more <i class="fa fa-angle-double-right"></i></a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ';
        endforeach;
        return '<div id="latest-news-section"><div class="row clearfix" data-equalizer>'. $feed .'</div></div>';
    }
    add_shortcode( 'latest-events', 'latest_events' );
}

if ( !function_exists('home_testimonials') ) {
    function home_testimonials() {
        return '<div id="home-testimonials">
            <div class="wrapper clearfix">
                <ul id="testimonials">
                    <li class="av-layout-grid-container entry-content-wrapper av-flex-cells container_wrap fullsize">
                        <div class="flex_cell no_margin no_padding av_one_half">
                            <img src="'. get_stylesheet_directory_uri() .'/dist/assets/images/bill-elliott-1920x1080.jpg" alt="">
                        </div>
                        <div class="flex_cell no_margin no_padding av_one_half background-gradient">
                            <div class="wrapper">
                                <p>Going fast is my business. That\'s why I chose Avidyne\'s IFD540 for my GPS/NAV/COM upgrade. The direct replacement of my old 530 took no time at all, and entering flightplans is fast and easy.</p>
                                <div class="divider"></div>
                                <strong>BILL ELLIOTT</strong>
                                <span>IFD540 Customer, NASCAR® Legend</span>
                            </div>
                        </div>
                    </li>
                    <li class="av-layout-grid-container entry-content-wrapper av-flex-cells container_wrap fullsize">
                        <div class="flex_cell no_margin no_padding av_one_half">
                            <img src="'. get_stylesheet_directory_uri() .'/dist/assets/images/larry-levin-1920x1080.jpg" alt="">
                        </div>
                        <div class="flex_cell no_margin no_padding av_one_half background-gradient">
                            <div class="wrapper">
                                <p>I rely on my airplane for business travel and the IFD540 makes my flights uneventful, even in hard IFR.</p>
                                <div class="divider"></div>
                                <strong>TONY CANCEL</strong>
                                <span>IFD540 Customer, <br /> Beech Bonanza Owner</span>
                            </div>
                        </div>
                    </li>
                    <li class="av-layout-grid-container entry-content-wrapper av-flex-cells container_wrap fullsize">
                        <div class="flex_cell no_margin no_padding av_one_half">
                            <img src="'. get_stylesheet_directory_uri() .'/dist/assets/images/mike-sutton-1920x1080.jpg" alt="">
                        </div>
                        <div class="flex_cell no_margin no_padding av_one_half background-gradient">
                            <div class="wrapper">
                                <p>What an upgrade! The IFD540 does everything far better than the Garmin it replaced. Entering complex IFR flight plans is much more intuitive and takes a fraction of the time it used to.</p>
                                <div class="divider"></div>
                                <strong>Mike Sutton</strong>
                                <span>IFD540 Customer, Cessna 210 Owner</span>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>';
    }
    add_shortcode( 'home-testimonials', 'home_testimonials' );
}

if ( !function_exists('single_product_social') ) {
    function single_product_social() {
        echo do_shortcode('<div class="single-product-social">
            <div class="container clearfix">
                <div class="social-wrapper">
                    <!-- <a href="#">
                        <i class="fa fa-facebook-f"></i>
                    </a> -->
                    [av_social_share title="Share this entry" style="" buttons="" share_facebook="" share_twitter="" share_pinterest="" share_gplus="" share_reddit="" share_linkedin="" share_tumblr="" share_vk="" share_mail="" av-desktop-hide="" av-medium-hide="" av-small-hide="" av-mini-hide="" av_uid=""]
                </div>
            </div>
        </div>');
    }
    add_shortcode('single-product-social','single_product_social');
}


if ( !function_exists('thin_content_divider') ) {
    function thin_content_divider() {
        return '<div class="thin-content-divider">
            <div class="container clearfix">
                <div></div>
            </div>
        </div>';
    }
    add_shortcode('thin-content-divider','thin_content_divider');
}

if ( !function_exists('avidyne_icon') ) {
    function avidyne_icon( $args,  $content=null, $name ) {
        $icon = $args['url'];
        return '<div class="avidyne-icon">
            <div class="container clearfix">
                <div>
                    <img src="'. $icon .'" alt="">
                </div>
            </div>
        </div>';
    }
    add_shortcode('avidyne-icon','avidyne_icon');
}

if ( !function_exists('avidyne_fallback_header') ) {
    function avidyne_fallback_header( $args,  $content=null, $name ) {
        if ( is_front_page() ) {
            return;
        }
        global $post;
        $obj = get_queried_object();
        $page_fields = get_field('general_header_details',$post->ID);
        $custom_image = $page_fields['product_header_image'];
        $custom_title = $page_fields['product_identifier'];
        $custom_title_description = $page_fields['product_header_title'];
        $fallback_image = get_bloginfo('url') . '/wp-content/uploads/2019/03/promo-guarantee.jpg';
        $image = $custom_image ? $custom_image['url'] : $fallback_image;
        if ( $obj->name != '' ) {
            $page_title = $obj->name;
        } else {
            $page_title = !empty($custom_title) ? $custom_title : get_the_title();
        }

        return '<div id="header-area" style="background-image: url('. $image .');background-size: cover; background-position: top center;">
            <div class="container">
                <h1 id="page-main-title">
                    <span>'. $page_title .'</span>
                    <br />
                    '. $custom_title_description .'
                </h1>
                <div id="jump" data-smooth-scroll data-animation-easing="swing" data-offset="69">
                    <a href="#to-content">
                        <i class="fa fa-chevron-down"></i>
                    </a>
                </div>
                <div id="to-content"></div>
            </div>
        </div>';
    }
    add_shortcode('avidyne-fallback-header','avidyne_fallback_header');
}

if ( !function_exists('avidyne_forced_fullwidth') ) {
    function avidyne_forced_fullwidth($args,  $content=null, $name) {
        return '
            <div class="full-width-section">
                <div class="container">
                    '. $content .'
                </div>
            </div>
        ';
    }
    add_shortcode('avidyne-forced-fullwidth','avidyne_forced_fullwidth');
}

if ( !function_exists('avidyne_gradient_section') ) {
    function avidyne_gradient_section($args,  $content=null, $name) {
        $class = $args['class'];
        return '
            <div class="general-section-wrapper '. $class .'">
                <div class="container">
                    '. $content .'
                </div>
            </div>
        ';
    }
    add_shortcode('avidyne-gradient-section','avidyne_gradient_section');
}

if ( !function_exists('avidyne_related_products') ) {
    function avidyne_related_products($args, $content=null, $name) {
        global $post;
        $posts = get_posts(array(
            'post_type' => 'product',
            'numberposts' => -1,
            'orderby'  => 'name',
            'order' => 'ASC'
        ));
        foreach( $posts as $post ) :
            $image = get_the_post_thumbnail_url($post->ID, 'large');
            $general_product_details = get_field( 'general_product_details', $post->ID );
            $solutions .= '
                <li class="related-product">
                    <a href="'. get_the_permalink($post->ID) .'">
                        <img src="' . $image . '" alt="">
                        <span>'. $general_product_details['product_identifier'] .'</span>
                    </a>
                </li>
            ';
        endforeach;
        return do_shortcode("[av_one_full first]<h5 id='related-products-title'>AVIDYNE SOLUTIONS</h5><div class='container'><ul id='related-products'>". $solutions ."</ul></div>[/av_one_full]");
    }
    add_shortcode('avidyne-related-products','avidyne_related_products');
}

if ( !function_exists('related_vertical_products') ) {
    function related_vertical_products($args, $content=null, $name) {
        global $post;
        $ids = explode(',',$args['ids']);
        $posts = get_posts(array(
            'post_type' => 'product',
            'numberposts' => -1,
            'orderby'  => 'name',
            'order' => 'ASC',
            'tax_query' => array(
                array(
                    'taxonomy' => 'product_categories',
                    'field'    => 'term_id',
                    'terms'    => $ids,
                ),
            ),
        ));

        $semi_relevant_posts = get_posts(array(
            'post_type' => 'product',
            'numberposts' => -1,
            'orderby'  => 'name',
            'order' => 'ASC',
            'tax_query' => array(
                array(
                    'taxonomy' => 'product_categories',
                    'field'    => 'term_id',
                    'terms'    => $ids,
                    'operator' => 'NOT IN'
                ),
            ),
        ));

        foreach( $posts as $post ) :
            $image = get_the_post_thumbnail_url($post->ID, 'large');
            $general_product_details = get_field( 'general_product_details', $post->ID );
            $solutions .= '
                <li class="related-product highlight">
                    <a href="'. get_the_permalink($post->ID) .'">
                        <div style="position:relative;padding: 0 10px;"><img src="' . $image . '" alt=""><div class="compatible-product">Compatible Product</div><span>'. $general_product_details['product_identifier'] .'</span>
                    </a>
                </li>
            ';
        endforeach;

        foreach( $semi_relevant_posts as $post ) :
            $image = get_the_post_thumbnail_url($post->ID, 'large');
            $general_product_details = get_field( 'general_product_details', $post->ID );
            $solutions .= '
                <li class="related-product">
                    <a href="'. get_the_permalink($post->ID) .'">
                       <div style="position:relative;padding: 0 10px;"><img src="' . $image . '" alt=""><span>'. $general_product_details['product_identifier'] .'</span></div>
                    </a>
                </li>
            ';
        endforeach;

        return do_shortcode("[av_one_full first]<h5 id='related-products-title'>ALL AVIDYNE SOLUTIONS</h5><div class='container'><ul id='related-products'>". $solutions ."</ul></div>[/av_one_full]");
    }
    add_shortcode('related-vertical-products','related_vertical_products');
}

if ( !function_exists('avidyne_ifd_series_features') ) {
    function avidyne_ifd_series_features($args, $content=null, $name) {
        $image = get_bloginfo('url') . $args['image'];
        $class = $args['class'];
        $first = $args['first'];
        $second = $args['second'];
        if ( '' === $image ) {
            $image = get_stylesheet_directory_uri() . '/dist/assets/images/avidyne-logo-news-4x.png';
        }
        $image = '<img src="'. $image .'" alt="" title="" />';
        return do_shortcode("<div class='". $class ." clearfix'>
            [". $first ." first min_height='' vertical_alignment='' space='' custom_margin='' margin='0px' row_boxshadow='' row_boxshadow_color='' row_boxshadow_width='10' link='' linktarget='' link_hover='' padding='0px' highlight='' highlight_size='' border='' border_color='' radius='0px' column_boxshadow='' column_boxshadow_color='' column_boxshadow_width='10' background='bg_color' background_color='' background_gradient_color1='' background_gradient_color2='' background_gradient_direction='vertical' src='' background_position='top left' background_repeat='no-repeat' animation='' mobile_breaking='' mobile_display='' av_uid='']". $image ."[/". $first ."][". $second ." min_height='' vertical_alignment='' space='' custom_margin='' margin='0px' row_boxshadow='' row_boxshadow_color='' row_boxshadow_width='10' link='' linktarget='' link_hover='' padding='0px' highlight='' highlight_size='' border='' border_color='' radius='0px' column_boxshadow='' column_boxshadow_color='' column_boxshadow_width='10' background='bg_color' background_color='' background_gradient_color1='' background_gradient_color2='' background_gradient_direction='vertical' src='' background_position='top left' background_repeat='no-repeat' animation='' mobile_breaking='' mobile_display='' av_uid='']". trim($content) ."[/". $second ."]</div>
        ");
    }
    add_shortcode('ifd-series-features','avidyne_ifd_series_features');
}

if ( !function_exists('avidyne_support_mega_menu') ) {
    function avidyne_support_mega_menu() {
       return wp_nav_menu(array('menu' => 45,'echo' => false));
    }
    add_shortcode( 'avidyne-support-mega-menu', 'avidyne_support_mega_menu' );
}

if ( !function_exists('avidyne_company_mega_menu') ) {
    function avidyne_company_mega_menu() {
       return wp_nav_menu(array('menu' => 46,'echo' => false));
    }
    add_shortcode( 'avidyne-company-mega-menu', 'avidyne_company_mega_menu' );
}


if ( !function_exists('avidyne_documentation') ) {
    function avidyne_documentation() {
        global $post;
        $terms = get_terms(
            array(
                'taxonomy' => 'product_categories',
                'hide_empty' => false,
            )
        );
        foreach( $terms as $term ) :
            var_dump($term);
            echo '<br /><br />';
        endforeach;
        return;
        $related_documents = get_posts(array(
            'post_type' => 'wpdmpro',
            'numberposts' => -1,
            'tax_query' => array(
                array(
                    'taxonomy' => 'product_categories',
                    'field'    => 'term_id',
                    'terms'    => $term_id,
                )
            )
        ));
        foreach($related_documents as $doc) :
            $doc_title = get_the_title($doc);
            $doc_content = get_the_content($doc);
            $document_details = wpdm_get_package($doc->ID);
            $doc_size = $document_details['package_size'];
            $files = $document_details['files'];
            $file_info = $document_details['fileinfo'];
            $total_docs = count($document_details['files']);
            if ( $total_docs > 0 ) {
                foreach( $files as $id => $file ) {
                    var_dump($file);
                    // Setup data
                    $file_download_link = get_bloginfo('url') . '?wpdmdl=' . $doc->ID . '&ind=' . $id;
                    $file_title = $file_info[$id]['title'];
                    $part_number = $document_details['part_number'];
                    $file_revision = $document_details['file_revision'];
                    $file_post_date = $document_details['post_date'];
                    $file_post_date = date('m/d/Y', strtotime($file_post_date));
                    $file_anchor = '<a href="'. $file_download_link .'" target="_self" class="download-link" download>' . $file_title . '</a>';
                    $file_download = '<a href="'. $file_download_link .'" target="_self" class="download-link with-icon" download>Download PDF</a>';

                    $meta = '<div class="file-date">Date: ' . $file_post_date . '</div>';
                    $meta .= '<div class="file-part-number">Part Number: ' . $part_number . '</div>';
                    $meta .= '<div class="file-size">File Size: ' . $doc_size . '</div>';
                    $meta .= '<div class="file-revision">File Revision: ' . $file_revision . '</div>';

                    // Setup layout and presentation
                    $the_files = "[av_one_half first min_height='' vertical_alignment='' space='' custom_margin='' margin='0px' row_boxshadow='' row_boxshadow_color='' row_boxshadow_width='10' link='' linktarget='' link_hover='' padding='0px' highlight='' highlight_size='' border='' border_color='' radius='0px' column_boxshadow='' column_boxshadow_color='' column_boxshadow_width='10' background='bg_color' background_color='' background_gradient_color1='' background_gradient_color2='' background_gradient_direction='vertical' src='' background_position='top left' background_repeat='no-repeat' animation='' mobile_breaking='' mobile_display='' av_uid='']" . $file_anchor ."[/av_one_half]";
                    $the_files .= "[av_one_fourth min_height='' vertical_alignment='' space='' custom_margin='' margin='0px' row_boxshadow='' row_boxshadow_color='' row_boxshadow_width='10' link='' linktarget='' link_hover='' padding='0px' highlight='' highlight_size='' border='' border_color='' radius='0px' column_boxshadow='' column_boxshadow_color='' column_boxshadow_width='10' background='bg_color' background_color='' background_gradient_color1='' background_gradient_color2='' background_gradient_direction='vertical' src='' background_position='top left' background_repeat='no-repeat' animation='' mobile_breaking='' mobile_display='' av_uid='']" . $meta ."[/av_one_fourth]";
                    $the_files .= "[av_one_fourth min_height='' vertical_alignment='' space='' custom_margin='' margin='0px' row_boxshadow='' row_boxshadow_color='' row_boxshadow_width='10' link='' linktarget='' link_hover='' padding='0px' highlight='' highlight_size='' border='' border_color='' radius='0px' column_boxshadow='' column_boxshadow_color='' column_boxshadow_width='10' background='bg_color' background_color='' background_gradient_color1='' background_gradient_color2='' background_gradient_direction='vertical' src='' background_position='top left' background_repeat='no-repeat' animation='' mobile_breaking='' mobile_display='' av_uid='']" . $file_download ."[/av_one_fourth]";                }
            }
            // var_dump($file_info);
            $docs .= '
                [av_toggle title="'. $file_title .'" tags=""]
                    <div class="avidyne-document clearfix">
                        <div class="wrapper clearfix">
                            <h4></h4>
                            <div class="document-content">
                                '. $the_files .'
                            </div>
                        </div>
                    </div>
                [/av_toggle]
            ';
        endforeach;
        return "[av_toggle_container initial='0' mode='toggle' sort='' styling='' colors='' font_color='' background_color='' border_color='' hover_colors='' hover_background_color='' hover_font_color='' colors_current='' font_color_current='' background_current='' background_color_current='' background_gradient_current_color1='' background_gradient_current_color2='' background_gradient_current_direction='vertical' av_uid='' custom_class='']" . $docs . "[/av_toggle_container]";
    }
    add_shortcode( 'avidyne-documentation', 'avidyne_documentation' );
}

if ( !function_exists('home_accordion_for_mobile') ) {
    function home_accordion_for_mobile() {
        return '
            <div id="home-mobile-accordion-slider">
                <div class="wrapper">
                    <div class="mobile-accordion-slide general-aviation">
                    <div class="wrapper">
                        <h3 class="aviaccordion-title " itemprop="headline">General Aviation</h3>
                        <div class="aviaccordion-excerpt " itemprop="text">
                            <p>Avidyne avionics for General Aviation <br> are made by pilots, for pilots.  Easy to <br> use, simple to install with all the <br> features and benefits  you need to make <br> your mission safer and more enjoyable.</p>
                            <p><a href="'. get_bloginfo('url') .'/premium-avionics-for-general-aviation/">Learn More</a></p>
                        </div>
                    </div>
                    </div>
                    <div class="mobile-accordion-slide corporate-jets">
                        <div class="wrapper">
                            <h3 class="aviaccordion-title " itemprop="headline">Corporate Jets</h3>
                            <div class="aviaccordion-excerpt " itemprop="text">
                                <p>An FMS/LPV/ADS-B solution that provides a better,<br> more affordable way to navigate the skies. Get SBAS/<br> LPV precision navigation designed to meet the <br> accuracy and integrity requirements for ADS-B.</p>
                                <p><a href="'. get_bloginfo('url') .'/fms-adsb-system-for-corporate-jets/">Learn More</a></p>
                            </div>
                        </div>
                    </div>
                    <div class="mobile-accordion-slide helicopters">
                        <div class="wrapper">
                            <h3 class="aviaccordion-title " itemprop="headline">Helicopters</h3>
                            <div class="aviaccordion-excerpt " itemprop="text">
                                <p>The Avidyne IFD-Series of GPS navigators <br> for helicopters and fleets are direct slide-in replacements <br> of the GNS navigators.  More capabilities for less cost <br> and downtime.</p>
                                <p><a href="'. get_bloginfo('url') .'/gps-navigators-for-helicopters/">Learn More</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>';
        }
        add_shortcode( 'home-accordion-for-mobile', 'home_accordion_for_mobile' );
}



if ( !function_exists('ifd_accordion_for_mobile') ) {
    function ifd_accordion_for_mobile() {
        return '
            <div id="ifd-mobile-accordion-slider">
                <div class="wrapper">
                    <div class="mobile-accordion-slide money-back">
                    <div class="wrapper">
                        <h3 class="aviaccordion-title " itemprop="headline">Money Back Guarantee: <br /> Fly it for 30 days!</h3>
                        <div class="aviaccordion-excerpt " itemprop="text">
                            <p> Avidyne is so confident you will <br> love our IFD series product, we will<br> will let you try them for 30 days.*</p>
                            <p><a href="'. get_bloginfo('url') .'/#">Learn More</a></p>
                        </div>
                    </div>
                    </div>
                    <div class="mobile-accordion-slide big-glass">
                        <div class="wrapper">
                            <h3 class="aviaccordion-title " itemprop="headline">IFD100 App: Big glass <br> for any aircraft</h3>
                            <div class="aviaccordion-excerpt " itemprop="text">
                                <p>Get big glass at a <br> fraction of the cost <br> Free with any IFD.</p>
                                <p><a href="'. get_bloginfo('url') .'/#">Learn More</a></p>
                            </div>
                        </div>
                    </div>
                    <div class="mobile-accordion-slide better-together">
                        <div class="wrapper">
                            <h3 class="aviaccordion-title " itemprop="headline">IFD + NGT-9000 <br> Better Together</h3>
                            <div class="aviaccordion-excerpt " itemprop="text">
                                <p>Buy an IFD solution and <br> get the NGT-9000 ADS-B <br> transponder</p>
                                <p><a href="'. get_bloginfo('url') .'/#">Learn More</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>';
        }
        add_shortcode( 'ifd-accordion-for-mobile', 'ifd_accordion_for_mobile' );
}



if ( !function_exists('single_product_avidyne_documentation') ) {
    function single_product_avidyne_documentation() {
        global $post;
        if ( !in_array('single-product',get_body_class()) ) {
            return;
        }
        $product_terms = wp_get_object_terms($post->ID, 'product_categories');
        $term_id = $product_terms[0]->term_id;
        $related_documents = get_posts(array(
            'post_type' => 'wpdmpro',
            'numberposts' => -1,
            'tax_query' => array(
                array(
                    'taxonomy' => 'product_categories',
                    'field'    => 'term_id',
                    'terms'    => $term_id,
                )
            )
        ));

        foreach($related_documents as $doc) :
            $doc_title = get_the_title($doc);
            $doc_content = get_the_content($doc);
            $document_details = wpdm_get_package($doc->ID);
            $doc_size = $document_details['package_size'];
            $files = $document_details['files'];
            $file_info = $document_details['fileinfo'];
            $total_docs = count($document_details['files']);
            if ( $total_docs > 0 ) {
                foreach( $files as $id => $file ) {

                    // Setup data
                    $file_download_link = get_bloginfo('url') . '?wpdmdl=' . $doc->ID . '&ind=' . $id;
                    $file_title = $file_info[$id]['title'];
                    $part_number = $document_details['part_number'];
                    $file_revision = $document_details['file_revision'];
                    $file_post_date = $document_details['post_date'];
                    $file_post_date = date('m/d/Y', strtotime($file_post_date));
                    $file_anchor = '<a href="'. $file_download_link .'" target="_self" class="download-link" download>' . $file_title . '</a>';
                    $file_download = '<a href="'. $file_download_link .'" target="_self" class="download-link with-icon" download>Download PDF</a>';

                    $meta = '<div class="file-date">Date: ' . $file_post_date . '</div>';
                    $meta .= '<div class="file-part-number">Part Number: ' . $part_number . '</div>';
                    $meta .= '<div class="file-size">File Size: ' . $doc_size . '</div>';
                    $meta .= '<div class="file-revision">File Revision: ' . $file_revision . '</div>';

                    // Setup layout and presentation
                    $the_files = "[av_one_half first min_height='' vertical_alignment='' space='' custom_margin='' margin='0px' row_boxshadow='' row_boxshadow_color='' row_boxshadow_width='10' link='' linktarget='' link_hover='' padding='0px' highlight='' highlight_size='' border='' border_color='' radius='0px' column_boxshadow='' column_boxshadow_color='' column_boxshadow_width='10' background='bg_color' background_color='' background_gradient_color1='' background_gradient_color2='' background_gradient_direction='vertical' src='' background_position='top left' background_repeat='no-repeat' animation='' mobile_breaking='' mobile_display='' av_uid='']" . $file_anchor ."[/av_one_half]";
                    $the_files .= "[av_one_fourth min_height='' vertical_alignment='' space='' custom_margin='' margin='0px' row_boxshadow='' row_boxshadow_color='' row_boxshadow_width='10' link='' linktarget='' link_hover='' padding='0px' highlight='' highlight_size='' border='' border_color='' radius='0px' column_boxshadow='' column_boxshadow_color='' column_boxshadow_width='10' background='bg_color' background_color='' background_gradient_color1='' background_gradient_color2='' background_gradient_direction='vertical' src='' background_position='top left' background_repeat='no-repeat' animation='' mobile_breaking='' mobile_display='' av_uid='']" . $meta ."[/av_one_fourth]";
                    $the_files .= "[av_one_fourth min_height='' vertical_alignment='' space='' custom_margin='' margin='0px' row_boxshadow='' row_boxshadow_color='' row_boxshadow_width='10' link='' linktarget='' link_hover='' padding='0px' highlight='' highlight_size='' border='' border_color='' radius='0px' column_boxshadow='' column_boxshadow_color='' column_boxshadow_width='10' background='bg_color' background_color='' background_gradient_color1='' background_gradient_color2='' background_gradient_direction='vertical' src='' background_position='top left' background_repeat='no-repeat' animation='' mobile_breaking='' mobile_display='' av_uid='']" . $file_download ."[/av_one_fourth]";                }
            }
            // var_dump($file_info);
            $docs .= '
                <div class="avidyne-document clearfix">
                    <div class="wrapper clearfix">
                        <h4></h4>
                        <div class="document-content">
                            '. $the_files .'
                        </div>
                    </div>
                </div>
            ';
        endforeach;
        return $docs;
    }
}

function cptui_register_my_cpts_dealers() {

    /**
     * Post Type: Dealers.
     */

    $labels = array(
        "name" => __( "Dealers", "custom-post-type-ui" ),
        "singular_name" => __( "Dealer", "custom-post-type-ui" ),
    );

    $args = array(
        "label" => __( "Dealers", "custom-post-type-ui" ),
        "labels" => $labels,
        "description" => "",
        "public" => true,
        "publicly_queryable" => true,
        "show_ui" => true,
        "delete_with_user" => false,
        "show_in_rest" => true,
        "rest_base" => "",
        "rest_controller_class" => "WP_REST_Posts_Controller",
        "has_archive" => false,
        "show_in_menu" => true,
        "show_in_nav_menus" => true,
        "exclude_from_search" => false,
        "capability_type" => "post",
        "map_meta_cap" => true,
        "hierarchical" => true,
        "rewrite" => false,
        "query_var" => true,
        "menu_position" => 5,
        "menu_icon" => "dashicons-groups",
        "supports" => array( "title", "editor", "thumbnail", "custom-fields", "revisions" ),
    );

    register_post_type( "dealers", $args );
}

add_action( 'init', 'cptui_register_my_cpts_dealers' );


if ( !function_exists('footer_social') ) {
    function footer_social() {
        $social_args = array('outside'=>'ul', 'inside'=>'li', 'append' => '');
        $social = avia_social_media_icons($social_args, false);
        return "<div class='av-sidebar-social-container'>".$social."</div>";
    }
    add_shortcode( 'footer-social', 'footer_social' );
}


function avidyne_pagination() {

    if( is_singular() )
        return;

    global $wp_query;

    /** Stop execution if there's only 1 page */
    if( $wp_query->max_num_pages <= 1 )
        return;

    $paged = get_query_var( 'paged' ) ? absint( get_query_var( 'paged' ) ) : 1;
    $max   = intval( $wp_query->max_num_pages );
    $hash = '#to-content';

    /** Add current page to the array */
    if ( $paged >= 1 )
        $links[] = $paged;

    /** Add the pages around the current page to the array */
    if ( $paged >= 3 ) {
        $links[] = $paged - 1;
        $links[] = $paged - 2;
    }

    if ( ( $paged + 2 ) <= $max ) {
        $links[] = $paged + 2;
        $links[] = $paged + 1;
    }

    echo '<div class="navigation"><ul class="pagination" aria-label="Pagination">';
    $uri = '/case-studies/page/';
    if ( in_array( 'blog', get_body_class() ) ) {
        $uri = '/news/page/';
    }
    /** Previous Post Link */
    $class = '';
    $link = '<a href="' . get_bloginfo( 'url' ) . $uri . ( $paged - 1 ) .'/'. $hash .'"></a>';
    if ( $paged === (int) 1 ) {
        $class = ' disabled';
        $link = '<a class="disabled"></a>';
    }
    printf( '<li class="pagination-previous %s">%s</li>', $class, $link );

    /** Link to first page, plus ellipses if necessary */
    if ( ! in_array( 1, $links ) ) {
        $class = 1 == $paged ? ' class="pagination-item-current"' : ' class="paginated"';

        printf( '<li%s><a href="%s'. $hash .'">%s</a></li>', $class, esc_url( get_pagenum_link( 1 ) ), '1' );

        if ( ! in_array( 2, $links ) )
            echo '<li>…</li>';
    }

    /** Link to current page, plus 2 pages in either direction if necessary */
    sort( $links );
    foreach ( (array) $links as $link ) {
        $class = $paged == $link ? ' class="pagination-item-current"' : '';
        printf( '<li class="paginated"><a href="%s'. $hash .'" %s>%s</a></li>', esc_url( get_pagenum_link( $link ) ), $class, $link );
    }

    /** Link to last page, plus ellipses if necessary */
    if ( ! in_array( $max, $links ) ) {
        if ( ! in_array( $max - 1, $links ) )
            echo '<li class="paginated">…</li>';

        $class = $paged == $max ? ' class="pagination-item-current"' : ' class="paginated"';
        printf( '<li%s><a href="%s'. $hash .'">%s</a></li>', $class, esc_url( get_pagenum_link( $max ) ), $max );
    }

     /** Next Post Link */
    $class = '';
    $link = '<a href="' . get_bloginfo( 'url' ) . $uri . ( $paged + 1 ) .  '/'. $hash .'"></a>';
    if ( $paged === $max ) {
        $class = $paged == $max ? ' disabled' : '';
        $link = '<a class="disabled"></a>';
    }

    printf( '<li class="pagination-next %s">%s</li>', $class, $link  );

    echo '</ul></div>';

}