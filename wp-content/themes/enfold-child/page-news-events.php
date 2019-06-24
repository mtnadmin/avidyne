<?php
    // Template Name: Blog
	if ( !defined('ABSPATH') ){ die(); }

	global $avia_config;

	/*
	 * get_header is a basic wordpress function, used to retrieve the header.php file in your theme directory.
	 */
	 get_header();


 	 if( get_post_meta(get_the_ID(), 'header', true) != 'no') echo avia_title();

 	 do_action( 'ava_after_main_title' );
     echo do_shortcode('[avidyne-fallback-header]'); ?>

		<div class='container_wrap container_wrap_first main_color gray-gradient full-width <?php avia_layout_class( 'main' ); ?>'>

			<div class='container'>

				<main class='template-page content full-width <?php avia_layout_class( 'content' ); ?> units' <?php avia_markup_helper(array('context' => 'content','post_type'=>'page'));?> style="width:100%">

                    <?php $posts = get_posts(array(
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
                        $date = get_the_date('F jS, Y', $post);
                        $permalink = get_the_permalink($post->ID);
                        $image = get_the_post_thumbnail_url($post, 'large');
                        $excerpt = get_the_content($post);
                        $excerpt = strip_tags($excerpt);
                        $excerpt = substr($excerpt, 0, 150);
                        $excerpt = substr($excerpt, 0, strripos($excerpt, " "));
                        $excerpt = strip_tags($excerpt.'...');
                        $title = $post->post_title;
                        $title = strip_tags($title);
                        $title = substr($title, 0, 100);
                        $title = substr($title, 0, strripos($title, " "));
                        $title = $title . '...';
                        if (!$image) {
                            $image = get_bloginfo('url') . '/wp-content/uploads/2018/12/Avidyne-logo-green-2017.png';
                        }
                        $events .= '
                            <div>
                                <div class="av-layout-grid-container entry-content-wrapper av-flex-cells container_wrap fullsize">
                                    <div class="item flex_cell no_margin content-wrapper" data-equalizer>
                                    [av_two_fifth first min_height="" vertical_alignment="" space="" custom_margin="" margin=""0px"" row_boxshadow="" row_boxshadow_color="" row_boxshadow_width=""10"" link="" linktarget="" link_hover="" padding=""0px"" highlight="" highlight_size="" border="" border_color="" radius=""0px"" column_boxshadow="" column_boxshadow_color="" column_boxshadow_width=""10"" background=""bg_color"" background_color="" background_gradient_color1="" background_gradient_color2="" background_gradient_direction=""vertical"" src="" background_position=""top left"" background_repeat=""no-repeat"" animation="" mobile_breaking="" mobile_display="" av_uid=""]
                                            <div class="image-container" data-equalizer-watch>
                                                <img src="'. $image .'" alt="">
                                            </div>
                                        [/av_two_fifth]
                                        [av_three_fifth min_height="" vertical_alignment="" space="" custom_margin="" margin=""0px"" row_boxshadow="" row_boxshadow_color="" row_boxshadow_width=""10"" link="" linktarget="" link_hover="" padding=""0px"" highlight="" highlight_size="" border="" border_color="" radius=""0px"" column_boxshadow="" column_boxshadow_color="" column_boxshadow_width=""10"" background=""bg_color"" background_color="" background_gradient_color1="" background_gradient_color2="" background_gradient_direction=""vertical"" src="" background_position=""top left"" background_repeat=""no-repeat"" animation="" mobile_breaking="" mobile_display="" av_uid=""]
                                            <div class="item-content clearfix" data-equalizer-watch><a href="'. $permalink .'"><strong>'. $title .'</strong></a><div class="date">'. $date .'</div>'. strip_tags($excerpt) .'<a href="'. $permalink .'" class="read-more avidyne-teal">Read more</a></div>
                                        [/av_three_fifth]
                                    </div>
                                </div>
                            </div>
                        ';
                    endforeach;
                    echo do_shortcode('<div id="latest-news-section"><h2>Latest Media</h2><div class="row clearfix" data-equalizer>'. $events .'</div></div>'); ?>

				<!--end content-->
				</main>

			</div><!--end container-->

		</div><!-- close default .container_wrap element -->

        <div class='container_wrap container_wrap_first main_color gray-gradient full-width <?php avia_layout_class( 'main' ); ?>'>

            <div class='container'>


                <?php $posts = get_posts(array(
                        'post_type' => 'post',
                        'numberposts' => 10,
                        'order' => 'DESC',
                        'orderby'  => array( 'meta_value_num' => 'ASC', 'title' => 'ASC' ),
                        'meta_key' => 'start_date',
                        'tax_query' => array(
                            array(
                                'taxonomy' => 'category',
                                'field'    => 'slug',
                                'terms'    => 'trade-shows-events',
                            ),
                        )
                    ));
                    $count = 0;
                    foreach($posts as $post) : setup_postdata($post);
                        $source = get_field('start_date', $post->ID);
                        $todays_date = new DateTime;
                        $todays_date = $todays_date->format('Ymj');

                        if ( $todays_date > $source || $count > 2 ) {
                            continue;
                        }
                        $first = '';
                        $date = get_the_date('F jS, Y', $post);
                        $event_date = get_field('start_date',$post->ID);
                        $formatted_event_date = new DateTime($event_date);
                        $formatted_event_day = $formatted_event_date->format('j');
                        $formatted_event_month = $formatted_event_date->format('F');
                        $permalink = get_the_permalink($post->ID);
                        $image = get_the_post_thumbnail_url($post, 'large');
                        $excerpt = get_the_content($post);
                        $title = $post->post_title;
                        $location = get_field('location',$post->ID);
                        $placeholder_content = '';
                        if ( empty($excerpt) ) {
                            $excerpt = $placeholder_content;
                        } else {
                            $excerpt = strip_tags($excerpt);
                            $excerpt = substr($excerpt, 0, 150);
                            $excerpt = substr($excerpt, 0, strripos($excerpt, " "));
                            $excerpt = strip_tags($excerpt.'...');
                        }

                        $title = !empty($title) ? $title : $title;
                        if (!$image) {
                            $image = get_bloginfo('url') . '/wp-content/uploads/2018/12/Avidyne-logo-green-2017.png';
                        }
                        if ( (int) 0 === $count ) {
                            $first = 'first';
                        }
                        $feed .= '
                        [av_one_third '. $first .' min_height="" vertical_alignment="" space="" custom_margin="" margin=""0px"" row_boxshadow="" row_boxshadow_color="" row_boxshadow_width=""10"" link="" linktarget="" link_hover="" padding=""0px"" highlight="" highlight_size="" border="" border_color="" radius=""0px"" column_boxshadow="" column_boxshadow_color="" column_boxshadow_width=""10"" background=""bg_color"" background_color="" background_gradient_color1="" background_gradient_color2="" background_gradient_direction=""vertical"" src="" background_position=""top left"" background_repeat=""no-repeat"" animation="" mobile_breaking="" mobile_display="" av_uid=""]
                                <div>
                                    <div class="av-layout-grid-container entry-content-wrapper av-flex-cells container_wrap fullsize">
                                        <div class="item flex_cell no_margin content-wrapper" data-equalizer>
                                            <div class="event-start-date">'. $formatted_event_day . '<div>' . $formatted_event_month . '</div></div>
                                            <div class="image-container">
                                                <div><img src="'. $image .'" alt=""></div>
                                            </div>
                                                <div class="item-content clearfix"><a href="'. $permalink .'"><strong>'. $title .'</strong></a><div class="location">'. $location .'</div>'. $excerpt .'<a href="'. $permalink .'" class="read-more avidyne-teal">Read more</a></div>
                                        </div>
                                    </div>
                                </div>
                            [/av_one_third]
                        ';
                        $count++;
                    endforeach;
                    echo do_shortcode('<div id="latest-events-section"><h2>Upcoming Events</h2><div class="row clearfix" data-equalizer>'. $feed .'</div><a href="#" class="view-all">View All</a></div>'); ?>


            </div>

        </div>



<?php get_footer(); ?>
