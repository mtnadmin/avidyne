		<?php
		
		if ( ! defined( 'ABSPATH' ) ) {  exit;  }    // Exit if accessed directly
			
		
		do_action( 'ava_before_footer' );	
			
		global $avia_config;
		$blank = isset($avia_config['template']) ? $avia_config['template'] : "";

		//reset wordpress query in case we modified it
		wp_reset_query();


		//get footer display settings
		$the_id 				= avia_get_the_id(); //use avia get the id instead of default get id. prevents notice on 404 pages
		$footer 				= get_post_meta( $the_id, 'footer', true );
		$footer_options			= avia_get_option( 'display_widgets_socket', 'all' );
		
		$avia_post_nav = '';
		if( avia_get_option('disable_post_nav') != "disable_post_nav" )
		{
			//get link to previous and next portfolio entry
			$avia_post_nav = avia_post_nav();
		}

		/**
		 * Reset individual page override to defaults if widget or page settings are different (user might have changed theme options)
		 * (if user wants a page as footer he must select this in main options - on individual page it's only possible to hide the page)
		 */
		if( false !== strpos( $footer_options, 'page' ) )
		{
			/**
			 * User selected a page as footer in main options
			 */
			if( ! in_array( $footer, array( 'page_in_footer_socket', 'page_in_footer', 'nofooterarea' ) ) ) 
			{
				$footer = '';
			}
		}
		else
		{
			/**
			 * User selected a widget based footer in main options
			 */
			if( in_array( $footer, array( 'page_in_footer_socket', 'page_in_footer' ) ) ) 
			{
				$footer = '';
			}
		}
		
		$footer_widget_setting 	= ! empty( $footer ) ? $footer : $footer_options;

		/*
		 * Check if we should display a page content as footer
		 */
		if( ! $blank && in_array( $footer_widget_setting, array( 'page_in_footer_socket', 'page_in_footer' ) ) )
		{
			/**
			 * Allow e.g. translation plugins to hook and change the id to translated post
			 * 
			 * @since 4.4.2
			 * @param int
			 */
			$post = get_post( apply_filters( 'avf_footer_page_id', avia_get_option( 'footer_page', 0 ), $the_id ) );
			
			if( ( $post instanceof WP_Post ) && ( $post->ID != $the_id ) )
			{
				/**
				 * Make sure that footerpage is set to fullwidth
				 */
				$old_avia_config = $avia_config;
				
				$avia_config['layout']['current'] = array(
											'content'	=> 'av-content-full alpha', 
											'sidebar'	=> 'hidden', 
											'meta'		=> '', 
											'entry'		=> '',
											'main'		=> 'fullsize'
										);    
				
				$builder_stat = ( 'active' == Avia_Builder()->get_alb_builder_status( $post->ID ) );
				$avia_config['conditionals']['is_builder'] = $builder_stat;
				$avia_config['conditionals']['is_builder_template'] = $builder_stat;
				
				$content = Avia_Builder()->compile_post_content( $post );
				
				$avia_config = $old_avia_config;
				
				/* was removed in 4.2.7 before rollout - should not break the output - can be removed completly when no errors are reported !
				 *		<div class='container_wrap footer_color footer-page-content' id='footer'>
				 */
				echo $content;
			}
		}
		
		/**
		 * Check if we should display a footer
		 */
		if( ! $blank && $footer_widget_setting != 'nofooterarea' )
		{
			if( in_array( $footer_widget_setting, array( 'all', 'nosocket' ) ) )
			{
				//get columns
				$columns = avia_get_option('footer_columns');
		?>
				<div class='container_wrap footer_color' id='footer'>

					<div class='container'>

						<?php
						do_action('avia_before_footer_columns');

						//create the footer columns by iterating

						
				        switch($columns)
				        {
				        	case 1: $class = ''; break;
				        	case 2: $class = 'av_one_half'; break;
				        	case 3: $class = 'av_one_third'; break;
				        	case 4: $class = 'av_one_fourth'; break;
				        	case 5: $class = 'av_one_fifth'; break;
				        	case 6: $class = 'av_one_sixth'; break;
				        }
				        
				        $firstCol = "first el_before_{$class}";

						//display the footer widget that was defined at appearenace->widgets in the wordpress backend
						//if no widget is defined display a dummy widget, located at the bottom of includes/register-widget-area.php
						for ($i = 1; $i <= $columns; $i++)
						{
							$class2 = ""; // initialized to avoid php notices
							if($i != 1) $class2 = " el_after_{$class}  el_before_{$class}";
							echo "<div class='flex_column {$class} {$class2} {$firstCol}'>";
							if (function_exists('dynamic_sidebar') && dynamic_sidebar('Footer - column'.$i) ) : else : avia_dummy_widget($i); endif;
							echo "</div>";
							$firstCol = "";
						}

						do_action('avia_after_footer_columns');

						?>


					</div>


				<!-- ####### END FOOTER CONTAINER ####### -->
				</div>

	<?php   } //endif   array( 'all', 'nosocket' ) ?>



			

			<?php

			//copyright
			$copyright = do_shortcode( avia_get_option('copyright', "&copy; ".__('Copyright','avia_framework')."  - <a href='".home_url('/')."'>".get_bloginfo('name')."</a>") );

			// you can filter and remove the backlink with an add_filter function
			// from your themes (or child themes) functions.php file if you dont want to edit this file
			// you can also remove the kriesi.at backlink by adding [nolink] to your custom copyright field in the admin area
			// you can also just keep that link. I really do appreciate it ;)
			$kriesi_at_backlink = kriesi_backlink(get_option(THEMENAMECLEAN."_initial_version"), 'Enfold');


			
			if($copyright && strpos($copyright, '[nolink]') !== false)
			{
				$kriesi_at_backlink = "";
				$copyright = str_replace("[nolink]","",$copyright);
			}

			if( in_array( $footer_widget_setting, array( 'all', 'nofooterwidgets', 'page_in_footer_socket' ) ) )
			{

			?>

				<!-- <footer class='container_wrap socket_color' id='socket' <?php // avia_markup_helper(array('context' => 'footer')); ?>>
                    <div class='container'> -->

                        <!-- <span class='copyright'><?php // echo $copyright . $kriesi_at_backlink; ?></span> -->

                        <?php
                        	if(avia_get_option('footer_social', 'disabled') != "disabled")
                            {
                            	$social_args 	= array('outside'=>'ul', 'inside'=>'li', 'append' => '');
								echo avia_social_media_icons($social_args, false);
                            }
                        
                            
                                $avia_theme_location = 'avia3';
                                $avia_menu_class = $avia_theme_location . '-menu';

                                $args = array(
                                    'theme_location'=>$avia_theme_location,
                                    'menu_id' =>$avia_menu_class,
                                    'container_class' =>$avia_menu_class,
                                    'fallback_cb' => '',
                                    'depth'=>1,
                                    'echo' => false,
                                    'walker' => new avia_responsive_mega_menu(array('megamenu'=>'disabled'))
                                );

                            $menu = wp_nav_menu($args);
                            
                            if($menu){ 
                            echo "<nav class='sub_menu_socket' ".avia_markup_helper(array('context' => 'nav', 'echo' => false)).">";
                            echo $menu;
                            echo "</nav>";
							}
                        ?>

                    <!-- </div> -->

	            <!-- ####### END SOCKET CONTAINER ####### -->
				<!-- </footer> -->


			<?php
			} //end nosocket check - array( 'all', 'nofooterwidgets', 'page_in_footer_socket' )



		} //end blank & nofooterarea check
		?>
		<!-- end main -->
		</div>

		<?php

		//display link to previous and next portfolio entry
		echo	$avia_post_nav;
		echo "<!-- end wrap_all --></div>";


		if(isset($avia_config['fullscreen_image']))
		{ ?>
			<!--[if lte IE 8]>
			<style type="text/css">
			.bg_container {
			-ms-filter:"progid:DXImageTransform.Microsoft.AlphaImageLoader(src='<?php echo $avia_config['fullscreen_image']; ?>', sizingMethod='scale')";
			filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='<?php echo $avia_config['fullscreen_image']; ?>', sizingMethod='scale');
			}
			</style>
			<![endif]-->
		<?php
			echo "<div class='bg_container' style='background-image:url(".$avia_config['fullscreen_image'].");'></div>";
		}
	?>


<a href='#top' title='<?php _e('Scroll to top','avia_framework'); ?>' id='scroll-top-link' <?php echo av_icon_string( 'scrolltop' ); ?>><span class="avia_hidden_link_text"><?php _e('Scroll to top','avia_framework'); ?></span></a>

<div id="fb-root"></div>
<div id="slide-out-form">
	<div class="slide-out-trigger">
		<img src="<?php echo get_stylesheet_directory_uri(); ?>/dist/assets/images/contact-form-btn-teal-open.jpg" alt="">
	</div>
	<div class="slide-out">
		<img src="<?php echo get_stylesheet_directory_uri(); ?>/dist/assets/images/contact-form-btn-teal-close.jpg" alt="" class="close-form">
		<div class="wrapper clearfix">
			<i class="fa fa-times-circle" aria-hidden="true"></i>
			<h4>How can we help you?</h4>
			<button class="sales">Sales Request</button>
			<button class="customer-support">Customer Support</button>
			<button class="general-inquiry">General Inquiry</button>
		</div>
	</div>
</div>
<!-- <a href="manually" class="avia-slideshow-button avia-button avia-color-light avia-multi-slideshow-button" data-duration="800" data-easing="easeInOutQuad">Learn more</a> -->
<a href="#sales" class="sales-form"></a>
<a href="#customer-support" class="customer-support-form"></a>
<a href="#general-inquiry" class="general-inquiry-form"></a>

<div id="sales" style="display:none;">
	<form accept-charset="UTF-8" action="https://lz314.infusionsoft.com/app/form/process/e1e73195dc1a3e9a40a6d10657dc4d96" class="infusion-form" id="inf_form_e1e73195dc1a3e9a40a6d10657dc4d96" method="POST">
    <input name="inf_form_xid" type="hidden" value="e1e73195dc1a3e9a40a6d10657dc4d96" />
    <input name="inf_form_name" type="hidden" value="Contact Us" />
    <input name="infusionsoft_version" type="hidden" value="1.70.0.104964" />
    <div class="infusion-field">
        <label for="inf_field_FirstName">First Name *</label>
        <input class="infusion-field-input" id="inf_field_FirstName" name="inf_field_FirstName" placeholder="First Name *" type="text" />
    </div>
    <div class="infusion-field">
        <label for="inf_field_LastName">Last Name *</label>
        <input class="infusion-field-input" id="inf_field_LastName" name="inf_field_LastName" placeholder="Last Name *" type="text" />
    </div>
    <div class="infusion-field">
        <label for="inf_field_Country">Country *</label>
        <div class="infusion-field-input-container">
            <select id="inf_field_Country" name="inf_field_Country"><option value="">Please select one</option><option value="Afghanistan">Afghanistan</option><option value="Åland Islands">Åland Islands</option><option value="Albania">Albania</option><option value="Algeria">Algeria</option><option value="American Samoa">American Samoa</option><option value="Andorra">Andorra</option><option value="Angola">Angola</option><option value="Anguilla">Anguilla</option><option value="Antarctica">Antarctica</option><option value="Antigua and Barbuda">Antigua and Barbuda</option><option value="Argentina">Argentina</option><option value="Armenia">Armenia</option><option value="Aruba">Aruba</option><option value="Australia">Australia</option><option value="Austria">Austria</option><option value="Azerbaijan">Azerbaijan</option><option value="Bahamas (the)">Bahamas (the)</option><option value="Bahrain">Bahrain</option><option value="Bangladesh">Bangladesh</option><option value="Barbados">Barbados</option><option value="Belarus">Belarus</option><option value="Belgium">Belgium</option><option value="Belize">Belize</option><option value="Benin">Benin</option><option value="Bermuda">Bermuda</option><option value="Bhutan">Bhutan</option><option value="Bolivia (Plurinational State of)">Bolivia (Plurinational State of)</option><option value="Bonaire, Sint Eustatius and Saba">Bonaire, Sint Eustatius and Saba</option><option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option><option value="Botswana">Botswana</option><option value="Bouvet Island">Bouvet Island</option><option value="Brazil">Brazil</option><option value="British Indian Ocean Territory (the)">British Indian Ocean Territory (the)</option><option value="Brunei Darussalam">Brunei Darussalam</option><option value="Bulgaria">Bulgaria</option><option value="Burkina Faso">Burkina Faso</option><option value="Burundi">Burundi</option><option value="Cabo Verde">Cabo Verde</option><option value="Cambodia">Cambodia</option><option value="Cameroon">Cameroon</option><option value="Canada">Canada</option><option value="Cayman Islands (the)">Cayman Islands (the)</option><option value="Central African Republic (the)">Central African Republic (the)</option><option value="Chad">Chad</option><option value="Chile">Chile</option><option value="China">China</option><option value="Christmas Island">Christmas Island</option><option value="Cocos (Keeling) Islands (the)">Cocos (Keeling) Islands (the)</option><option value="Colombia">Colombia</option><option value="Comoros (the)">Comoros (the)</option><option value="Congo (the Democratic Republic of the)">Congo (the Democratic Republic of the)</option><option value="Congo (the)">Congo (the)</option><option value="Cook Islands (the)">Cook Islands (the)</option><option value="Costa Rica">Costa Rica</option><option value="Côte d'Ivoire">Côte d'Ivoire</option><option value="Croatia">Croatia</option><option value="Cuba">Cuba</option><option value="Curaçao">Curaçao</option><option value="Cyprus">Cyprus</option><option value="Czech Republic (the)">Czech Republic (the)</option><option value="Denmark">Denmark</option><option value="Djibouti">Djibouti</option><option value="Dominica">Dominica</option><option value="Dominican Republic (the)">Dominican Republic (the)</option><option value="Ecuador">Ecuador</option><option value="Egypt">Egypt</option><option value="El Salvador">El Salvador</option><option value="Equatorial Guinea">Equatorial Guinea</option><option value="Eritrea">Eritrea</option><option value="Estonia">Estonia</option><option value="Ethiopia">Ethiopia</option><option value="Falkland Islands (the) [Malvinas]">Falkland Islands (the) [Malvinas]</option><option value="Faroe Islands (the)">Faroe Islands (the)</option><option value="Fiji">Fiji</option><option value="Finland">Finland</option><option value="France">France</option><option value="French Guiana">French Guiana</option><option value="French Polynesia">French Polynesia</option><option value="French Southern Territories (the)">French Southern Territories (the)</option><option value="Gabon">Gabon</option><option value="Gambia (the)">Gambia (the)</option><option value="Georgia">Georgia</option><option value="Germany">Germany</option><option value="Ghana">Ghana</option><option value="Gibraltar">Gibraltar</option><option value="Greece">Greece</option><option value="Greenland">Greenland</option><option value="Grenada">Grenada</option><option value="Guadeloupe">Guadeloupe</option><option value="Guam">Guam</option><option value="Guatemala">Guatemala</option><option value="Guernsey">Guernsey</option><option value="Guinea">Guinea</option><option value="Guinea-Bissau">Guinea-Bissau</option><option value="Guyana">Guyana</option><option value="Haiti">Haiti</option><option value="Heard Island and McDonald Islands">Heard Island and McDonald Islands</option><option value="Holy See (the)">Holy See (the)</option><option value="Honduras">Honduras</option><option value="Hong Kong">Hong Kong</option><option value="Hungary">Hungary</option><option value="Iceland">Iceland</option><option value="India">India</option><option value="Indonesia">Indonesia</option><option value="Iran (Islamic Republic of)">Iran (Islamic Republic of)</option><option value="Iraq">Iraq</option><option value="Ireland">Ireland</option><option value="Isle of Man">Isle of Man</option><option value="Israel">Israel</option><option value="Italy">Italy</option><option value="Jamaica">Jamaica</option><option value="Japan">Japan</option><option value="Jersey">Jersey</option><option value="Johnston Island">Johnston Island</option><option value="Jordan">Jordan</option><option value="Kazakhstan">Kazakhstan</option><option value="Kenya">Kenya</option><option value="Kiribati">Kiribati</option><option value="Korea (the Democratic People's Republic of)">Korea (the Democratic People's Republic of)</option><option value="Korea (the Republic of)">Korea (the Republic of)</option><option value="Kuwait">Kuwait</option><option value="Kyrgyzstan">Kyrgyzstan</option><option value="Lao People's Democratic Republic (the)">Lao People's Democratic Republic (the)</option><option value="Latvia">Latvia</option><option value="Lebanon">Lebanon</option><option value="Lesotho">Lesotho</option><option value="Liberia">Liberia</option><option value="Libya">Libya</option><option value="Liechtenstein">Liechtenstein</option><option value="Lithuania">Lithuania</option><option value="Luxembourg">Luxembourg</option><option value="Macao">Macao</option><option value="Macedonia (the former Yugoslav Republic of)">Macedonia (the former Yugoslav Republic of)</option><option value="Madagascar">Madagascar</option><option value="Malawi">Malawi</option><option value="Malaysia">Malaysia</option><option value="Maldives">Maldives</option><option value="Mali">Mali</option><option value="Malta">Malta</option><option value="Marshall Islands (the)">Marshall Islands (the)</option><option value="Martinique">Martinique</option><option value="Mauritania">Mauritania</option><option value="Mauritius">Mauritius</option><option value="Mayotte">Mayotte</option><option value="Mexico">Mexico</option><option value="Micronesia (Federated States of)">Micronesia (Federated States of)</option><option value="Midway Islands">Midway Islands</option><option value="Moldova (the Republic of)">Moldova (the Republic of)</option><option value="Monaco">Monaco</option><option value="Mongolia">Mongolia</option><option value="Montenegro">Montenegro</option><option value="Montserrat">Montserrat</option><option value="Morocco">Morocco</option><option value="Mozambique">Mozambique</option><option value="Myanmar">Myanmar</option><option value="Namibia">Namibia</option><option value="Nauru">Nauru</option><option value="Nepal">Nepal</option><option value="Netherlands (the)">Netherlands (the)</option><option value="New Caledonia">New Caledonia</option><option value="New Zealand">New Zealand</option><option value="Nicaragua">Nicaragua</option><option value="Niger (the)">Niger (the)</option><option value="Nigeria">Nigeria</option><option value="Niue">Niue</option><option value="Norfolk Island">Norfolk Island</option><option value="Northern Mariana Islands (the)">Northern Mariana Islands (the)</option><option value="Norway">Norway</option><option value="Oman">Oman</option><option value="Pakistan">Pakistan</option><option value="Palau">Palau</option><option value="Palestine, State of">Palestine, State of</option><option value="Panama">Panama</option><option value="Papua New Guinea">Papua New Guinea</option><option value="Paraguay">Paraguay</option><option value="Peru">Peru</option><option value="Philippines (the)">Philippines (the)</option><option value="Pitcairn">Pitcairn</option><option value="Poland">Poland</option><option value="Portugal">Portugal</option><option value="Puerto Rico">Puerto Rico</option><option value="Qatar">Qatar</option><option value="Réunion">Réunion</option><option value="Romania">Romania</option><option value="Russian Federation (the)">Russian Federation (the)</option><option value="Rwanda">Rwanda</option><option value="Saint Barthélemy">Saint Barthélemy</option><option value="Saint Helena, Ascension and Tristan da Cunha">Saint Helena, Ascension and Tristan da Cunha</option><option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option><option value="Saint Lucia">Saint Lucia</option><option value="Saint Martin (French part)">Saint Martin (French part)</option><option value="Saint Pierre and Miquelon">Saint Pierre and Miquelon</option><option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option><option value="Samoa">Samoa</option><option value="San Marino">San Marino</option><option value="Sao Tome and Principe">Sao Tome and Principe</option><option value="Saudi Arabia">Saudi Arabia</option><option value="Senegal">Senegal</option><option value="Serbia">Serbia</option><option value="Seychelles">Seychelles</option><option value="Sierra Leone">Sierra Leone</option><option value="Singapore">Singapore</option><option value="Sint Maarten (Dutch part)">Sint Maarten (Dutch part)</option><option value="Slovakia">Slovakia</option><option value="Slovenia">Slovenia</option><option value="Solomon Islands">Solomon Islands</option><option value="Somalia">Somalia</option><option value="South Africa">South Africa</option><option value="South Georgia and the South Sandwich Islands">South Georgia and the South Sandwich Islands</option><option value="South Sudan">South Sudan</option><option value="Southern Rhodesia">Southern Rhodesia</option><option value="Spain">Spain</option><option value="Sri Lanka">Sri Lanka</option><option value="Sudan (the)">Sudan (the)</option><option value="Suriname">Suriname</option><option value="Svalbard and Jan Mayen">Svalbard and Jan Mayen</option><option value="Swaziland">Swaziland</option><option value="Sweden">Sweden</option><option value="Switzerland">Switzerland</option><option value="Syrian Arab Republic">Syrian Arab Republic</option><option value="Taiwan (Province of China)">Taiwan (Province of China)</option><option value="Tajikistan">Tajikistan</option><option value="Tanzania, United Republic of">Tanzania, United Republic of</option><option value="Thailand">Thailand</option><option value="Timor-Leste">Timor-Leste</option><option value="Togo">Togo</option><option value="Tokelau">Tokelau</option><option value="Tonga">Tonga</option><option value="Trinidad and Tobago">Trinidad and Tobago</option><option value="Tunisia">Tunisia</option><option value="Turkey">Turkey</option><option value="Turkmenistan">Turkmenistan</option><option value="Turks and Caicos Islands (the)">Turks and Caicos Islands (the)</option><option value="Tuvalu">Tuvalu</option><option value="Uganda">Uganda</option><option value="Ukraine">Ukraine</option><option value="United Arab Emirates (the)">United Arab Emirates (the)</option><option value="United Kingdom">United Kingdom</option><option value="United States">United States</option><option value="United States Minor Outlying Islands (the)">United States Minor Outlying Islands (the)</option><option value="Upper Volta">Upper Volta</option><option value="Uruguay">Uruguay</option><option value="Uzbekistan">Uzbekistan</option><option value="Vanuatu">Vanuatu</option><option value="Venezuela (Bolivarian Republic of)">Venezuela (Bolivarian Republic of)</option><option value="Viet Nam">Viet Nam</option><option value="Virgin Islands (British)">Virgin Islands (British)</option><option value="Virgin Islands (U.S.)">Virgin Islands (U.S.)</option><option value="Wallis and Futuna">Wallis and Futuna</option><option value="Western Sahara">Western Sahara</option><option value="Yemen">Yemen</option><option value="Zambia">Zambia</option><option value="Zimbabwe">Zimbabwe</option></select>
        </div>
    </div>
    <div class="infusion-field">
        <label for="inf_field_State">State *</label>
        <input class="infusion-field-input" id="inf_field_State" name="inf_field_State" placeholder="State *" type="text" />
    </div>
    <div class="infusion-field">
        <label for="inf_field_Email">Email *</label>
        <input class="infusion-field-input" id="inf_field_Email" name="inf_field_Email" placeholder="Email *" type="text" />
    </div>
    <div class="infusion-field">
        <label for="inf_custom_AircraftModel0">Aircraft Make *</label>
        <input class="infusion-field-input" id="inf_custom_AircraftModel0" name="inf_custom_AircraftModel0" placeholder="Aircraft Make *" type="text" />
    </div>
    <div class="infusion-field">
        <label for="inf_custom_AircraftModel">Aircraft Model *</label>
        <input class="infusion-field-input" id="inf_custom_AircraftModel" name="inf_custom_AircraftModel" placeholder="Aircraft Model *" type="text" />
    </div>
    <div class="infusion-field">
        <label for="inf_custom_AircraftSerialNumber0">Aircraft Tail Number *</label>
        <input class="infusion-field-input" id="inf_custom_AircraftSerialNumber0" name="inf_custom_AircraftSerialNumber0" placeholder="Aircraft Tail Number *" type="text" />
    </div>
    <div class="infusion-field">
        <span class="infusion-option">
            <input id="inf_option_FMSGPSNavigators" name="inf_option_FMSGPSNavigators" type="checkbox" value="2713" />
            <label for="inf_option_FMSGPSNavigators">FMS/GPS Navigators</label>
        </span>
    </div>
    <div class="infusion-field">
        <span class="infusion-option">
            <input id="inf_option_Transponders" name="inf_option_Transponders" type="checkbox" value="2715" />
            <label for="inf_option_Transponders">Transponders</label>
        </span>
    </div>
    <div class="infusion-field">
        <span class="infusion-option">
            <input id="inf_option_AudioPanel" name="inf_option_AudioPanel" type="checkbox" value="2717" />
            <label for="inf_option_AudioPanel">Audio Panel</label>
        </span>
    </div>
    <div class="infusion-field">
        <span class="infusion-option">
            <input id="inf_option_Autopilot" name="inf_option_Autopilot" type="checkbox" value="2719" />
            <label for="inf_option_Autopilot">Autopilot</label>
        </span>
    </div>
    <div class="infusion-field">
        <span class="infusion-option">
            <input id="inf_option_TrafficWeather" name="inf_option_TrafficWeather" type="checkbox" value="2721" />
            <label for="inf_option_TrafficWeather">Traffic/Weather</label>
        </span>
    </div>
    <div class="infusion-field">
        <label for="inf_misc_Comment">Comment</label>
        <textarea cols="24" id="inf_misc_Comment" name="inf_misc_Comment" placeholder="Comment" rows="5"></textarea></div>
    <div class="infusion-submit">
        <button type="submit">Submit</button>
    </div>
</form>
<script type="text/javascript" src="https://lz314.infusionsoft.app/app/webTracking/getTrackingCode"></script>
<script type="text/javascript" src="https://lz314.infusionsoft.com/app/timezone/timezoneInputJs?xid=e1e73195dc1a3e9a40a6d10657dc4d96"></script>


</div>

<div id="customer-support" style="display:none;">
	<a href="https://pilotsupport.avidyne.com/new" target="_blank"></a>
</div>

<div id="general-inquiry" style="display:none;">
	<button title="Close (Esc)" type="button" class="mfp-close">×</button>
	<?php echo do_shortcode('[gravityform id="3" title="false" description="false" ajax="true"]'); ?>
</div>


<?php // echo do_shortcode('[gtranslate]'); ?>
<?php
	/* Always have wp_footer() just before the closing </body>
	 * tag of your theme, or you will break many plugins, which
	 * generally use this hook to reference JavaScript files.
	 */

wp_footer();
?>
<div rel="lightbox" style="display:none;" id="general-inquiry-form"><?php echo do_shortcode('[gravityform id="3" title="false" description="false" ajax="true"]'); ?></div>
</body>
</html>
