<?php
    // Template Name: Full Width
	if ( !defined('ABSPATH') ){ die(); }

	global $avia_config;

	/*
	 * get_header is a basic wordpress function, used to retrieve the header.php file in your theme directory.
	 */
	 get_header();


 	 if( get_post_meta(get_the_ID(), 'header', true) != 'no') echo avia_title();

 	 do_action( 'ava_after_main_title' );
     echo do_shortcode('[avidyne-fallback-header]'); ?>

		<div class='container_wrap container_wrap_first main_color <?php avia_layout_class( 'main' ); ?>'>

			<div class='container'>

				<main class='template-page content full-width <?php avia_layout_class( 'content' ); ?> units' <?php avia_markup_helper(array('context' => 'content','post_type'=>'page'));?>>

                    <?php
                    /* Run the loop to output the posts.
                    * If you want to overload this in a child theme then include a file
                    * called loop-page.php and that will be used instead.
                    */

                    $avia_config['size'] = avia_layout_class( 'main' , false) == 'fullsize' ? 'entry_without_sidebar' : 'entry_with_sidebar';
                    get_template_part( 'includes/loop', 'page' );
                    ?>

				<!--end content-->
				</main>

			</div><!--end container-->

		</div><!-- close default .container_wrap element -->



<?php get_footer(); ?>
