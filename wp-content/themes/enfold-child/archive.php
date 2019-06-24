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
	?>
    <?php echo do_shortcode("[avidyne-fallback-header]");?>
		<div class='container_wrap container_wrap_first main_color full-width <?php avia_layout_class( 'main' ); ?>'>

			<div class='container template-blog '>

				<main class='content' style="border:0;">

					<?php
                    $vars = get_queried_object();
                    $posts = get_posts(array(
                            'post_type' => 'post',
                            'numberposts' => 5,
                            'order' => 'DESC',
                            'orderby' => 'date',
                            'paged'   => $paged,
                            'tax_query' => array(
                                array(
                                    'taxonomy' => 'category',
                                    'field'    => 'slug',
                                    'terms'    => $vars->slug,
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
                        $image_class = 'custom-image';
                        if (!$image) {
                            $image_class = 'fallback-image';
                            $image = get_bloginfo('url') . '/wp-content/uploads/2018/12/Avidyne-logo-green-2017.png';
                        }
                        $events .= '
                            <div>
                                <div class="av-layout-grid-container entry-content-wrapper av-flex-cells container_wrap fullsize">
                                    <div class="item flex_cell no_margin content-wrapper" data-equalizer>
                                    [av_two_fifth first min_height="" vertical_alignment="" space="" custom_margin="" margin=""0px"" row_boxshadow="" row_boxshadow_color="" row_boxshadow_width=""10"" link="" linktarget="" link_hover="" padding=""0px"" highlight="" highlight_size="" border="" border_color="" radius=""0px"" column_boxshadow="" column_boxshadow_color="" column_boxshadow_width=""10"" background=""bg_color"" background_color="" background_gradient_color1="" background_gradient_color2="" background_gradient_direction=""vertical"" src="" background_position=""top left"" background_repeat=""no-repeat"" animation="" mobile_breaking="" mobile_display="" av_uid=""]
                                            <div class="image-container '. $image_class .'" data-equalizer-watch>
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
                    wp_reset_query();
                    echo do_shortcode('<div id="latest-news-section"><h2>Latest Media</h2><div class="row clearfix" data-equalizer>'. $events .'</div></div>'); avidyne_pagination(); ?>
				</main>

				<?php

				//get the sidebar
    //             if (avia_get_option('archive_sidebar') == 'archive_sidebar_separate') {
    //                 $avia_config['currently_viewing'] = 'archive';
    //             }
    //             else {
    //                 $avia_config['currently_viewing'] = 'blog';
    //             }
				// get_sidebar();

				?>

			</div><!--end container-->

		</div><!-- close default .container_wrap element -->




<?php get_footer(); ?>
