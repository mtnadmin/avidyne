<?php
/**
 * Class that integrates ALB in WP Block editor (since version 5.0), Gutenberg plugin and Classic Editor
 * 
 * @since 4.4.2
 * @since 4.5.1 integrate WP Block editor
 * @added_by Günter
 */
if ( ! defined( 'ABSPATH' ) ) {  exit;  }    // Exit if accessed directly


global $wp_version;


/**
 * For WP 5.0-beta-xx we need to compare with 4.9999
 */
$load_gutenberg = version_compare( $wp_version, '4.9999', '>' );
if( ! $load_gutenberg )
{
	$load_gutenberg = defined( 'GUTENBERG_VERSION' );
}

if ( ! $load_gutenberg ) 
{
	return;
}

if( ! class_exists( 'Avia_Gutenberg' ) )
{
	
	class Avia_Gutenberg 
	{
		/**
		 * @since 4.5.1
		 */
		const AJAX_NONCE =		'avia_gutenberg_nonce';
		const AJAX_JS_VAR =		'avia_gutenberg_i18';
		
		/**
		 * Holds the instance of this class
		 * 
		 * @since 4.4.2
		 * @var AviaBuilder 
		 */
		static private $_instance = null;
		
		/**
		 *
		 * @since 4.5.1
		 * @var string			'classic' | 'gutenberg' 
		 */
		protected $request_editor_type;
		
		/**
		 * Stores the link target for page/post/... 
		 * Target can be:		'classic-editor' | 'gutenberg'
		 * 
		 * @since 4.4.2
		 * @var array			keys:	'page'|'post'   
		 */
		protected $non_classic_editor_post_types;
		
		/**
		 * Flag if classic editor plugin has been activated - needed to add additional links to open classic editor instead of gutenberg
		 * 
		 * @since 4.5.1
		 * @var boolean 
		 */
		protected $classic_editor_plugin_active;
		
		/**
		 * Flag if Gutenberg plugin has been activated - needed to add additional info to links to open gutenberg editor instead of classic editor
		 * 
		 * @since 4.5.1
		 * @var boolean 
		 */
		protected $gutenberg_plugin_active;
		
		/**
		 * Flag if we have the WP Block Editor ( = Gutenberg Editor ) integrated in WP (since 5.0)
		 * 
		 * @since 4.5.1
		 * @var boolean 
		 */
		protected $has_wp_block_editor;
		
		/**
		 * Based on the classic editor Writing Settings option "Classic editor settings"
		 * Defaults to no-replace.
		 * 
		 * @since 4.5.1
		 * @var string			'replace' | 'no-replace'
		 */
		protected $replace_block_editor;
		
		
		/**
		 * Return the instance of this class
		 * 
		 * @since 4.4.2
		 * @return Avia_Gutenberg
		 */
		static public function instance()
		{
			if( is_null( Avia_Gutenberg::$_instance ) )
			{
				Avia_Gutenberg::$_instance = new Avia_Gutenberg();
			}
			
			return Avia_Gutenberg::$_instance;
		}
		
		/**
		 * Initializes plugin variables and sets up WordPress hooks/actions.
		 * 
		 * @since 4.4.2
		 */
		protected function __construct() 
		{
			global $wp_version;
			
			$this->request_editor_type = '';
			$this->non_classic_editor_post_types = array();
			
			/**
			 * This is a hack to speed up loading - might be necessary to change if this function is removed by Classic Editor plugin
			 */
			$this->classic_editor_plugin_active = function_exists( 'classic_editor_init_actions' );
			$this->gutenberg_plugin_active = defined( 'GUTENBERG_VERSION' );
			$this->has_wp_block_editor = version_compare( $wp_version, '4.9999', '>' );
			
			$this->replace_block_editor = 'no-replace';
			if( $this->classic_editor_plugin_active )
			{
				$this->replace_block_editor = get_option( 'classic-editor-replace' );
			}
			
			/**
			 * Default link filters - we change them a little to add more information and links to classic editor pages
			 */
			remove_action( 'admin_init', 'gutenberg_add_edit_link_filters' );
			remove_action( 'admin_bar_menu', 'classic_editor_admin_bar_menu', 120 );
			
			add_filter( 'display_post_states', array( $this, 'handler_display_post_states'), 99, 2 );
			add_filter( 'page_row_actions', array( $this, 'handler_add_edit_link' ), 10, 2 );
			add_filter( 'post_row_actions', array( $this, 'handler_add_edit_link' ), 10, 2 );
			add_filter( 'get_edit_post_link', array( $this, 'handler_edit_post_link' ), 999, 3 );
			
			/**
			 * Adjust admin bar links frontend and backend and admin menu. We hook after theme handler.
			 */
			add_action( 'admin_menu', array( $this, 'handler_admin_menu' ), 999 );
			add_action( 'admin_bar_menu', array( $this, 'handler_admin_bar_menu' ), 999, 1 );
			
			add_action( 'init', array( $this, 'handler_wp_register_scripts' ), 10 );
			add_action( 'admin_enqueue_scripts', array( $this, 'handler_wp_admin_enqueue_scripts' ), 10 );
			
			
			/**
			 * Add metaboxes and content and default timyMCE editor area
			 */
			add_filter( 'all_admin_notices', array( $this, 'handler_wp_all_admin_notices' ), 99999, 0 );
			
			add_filter( 'avf_builder_boxes', array( $this, 'handler_avf_builder_boxes' ), 20, 1 );
			add_filter( 'avf_builder_elements', array( $this, 'handler_avf_builder_elements' ), 20, 1 );
			add_filter( 'avf_builder_metabox_editor_before', array( $this, 'handler_avf_builder_metabox_editor_before' ), 10, 2 );
			
			/**
			 * Add logic when post are saved or layout is switched
			 */
			add_filter( 'avf_before_save_alb_post_data', array( $this, 'handler_before_save_alb_post_data' ), 5, 2 );	//	hook to save post title
			add_filter( 'avf_in_shortcode_handler_prepare', array( $this, 'handler_avf_in_shortcode_handler_prepare' ), 10 );
			
			add_action( 'wp_ajax_avia_gutenberg_autosave_metaboxes', array( $this, 'handler_ajax_avia_gutenberg_autosave_metaboxes' ) );
		}	

		/**
		 * @since 4.4.2
		 */
		public function __destruct() 
		{
			unset( $this->non_classic_editor_post_types );
		}
		
		
		/**
		 * 
		 * @since 4.5.1
		 */
		public function handler_wp_register_scripts()
		{	
			$theme = wp_get_theme();
			if( false !== $theme->parent() )
			{
				$theme = $theme->parent();
			}
			$vn = $theme->get( 'Version' );
			
			$template_url = get_template_directory_uri();
			
			wp_register_style( 'avia_gutenberg_css', $template_url.'/config-gutenberg/css/avia_gutenberg.css', array( 'avia-modal-style', 'avia-builder-style' ), $vn );
			wp_register_script( 'avia_gutenberg_script', $template_url.'/config-gutenberg/js/avia_gutenberg.js' , array( 'avia_builder_js' ), $vn, true );
			
			/**
			 * Temp. fix for localhost and EDGE (might also be for other browsers) - works on live server
			 */
			if( false !== stripos( get_bloginfo( 'url' ), '//localhost' ) )
			{
				$this->fix_wp50_broken_url();
			}
		}
		
		
		/**
		 * URL relative path is broken for localhost on Edge browser (might also happen on other browsers) - we replace it with full path
		 * 
		 * @since 4.5.1
		 */
		protected function fix_wp50_broken_url()
		{
			global $wp_scripts;
			
			if( ! isset( $wp_scripts->registered['wp-polyfill'] ) || ! isset( $wp_scripts->registered['wp-polyfill']->extra['after'][1] ) )
			{
				return;
			}
			
			$code = $wp_scripts->registered['wp-polyfill']->extra['after'][1];
			
			$search = '"/wp-includes/js/dist/vendor';
			$replace = '"' . get_bloginfo( 'url' ) . '/wp-includes/js/dist/vendor';
			
			$new = str_replace( $search, $replace, $code );
			
			$wp_scripts->registered['wp-polyfill']->extra['after'][1] = $new;
		}

		/**
		 * @since 4.5.1
		 */
		public function handler_wp_admin_enqueue_scripts()
		{
			wp_enqueue_style( 'avia_gutenberg_css' );
		
			wp_enqueue_script( 'avia_gutenberg_script' );
			
			$switch_block_msg  = __( 'You got content in your editor that can\'t be convert to Layout Builder content. Click OK if you want to proceed and lose this content.', 'avia_framework' ) . ' ';
			//$switch_block_msg .= __( 'To have a fallback you can save this block editor page before switching the editors.', 'avia_framework' );
			
			$var = array( 
					'switch_block_msg' => $switch_block_msg
				);		
				
			wp_localize_script( 'avia_gutenberg_script', Avia_Gutenberg::AJAX_JS_VAR, $var );
			
//			wp_enqueue_script( 'wp-polyfill-formdata' );
		}
		
		/**
		 * Returns which editor is requested on the current edit page
		 * (does not return a valid value on update page)
		 * 
		 * @since 4.5.1
		 * @return string			'classic' | 'gutenberg'
		 */
		public function requested_editor()
		{
			if( empty( $this->request_editor_type ) )
			{
				$this->request_editor_type = isset( $_REQUEST['classic-editor'] ) ? 'classic' : 'gutenberg';
			
				//	reset if user wants to remove block editor
				if( $this->has_wp_block_editor && $this->classic_editor_plugin_active && ( 'no-replace' != $this->replace_block_editor ) )
				{
					$this->request_editor_type = 'classic';
				}
			}
			
			return $this->request_editor_type;
		}
		
		/**
		 * Checks, if we need to add extra classic editor links
		 * 
		 * @since 4.5.1
		 * @return boolean
		 */
		protected function need_classic_editor_links()
		{
			if( $this->has_wp_block_editor )
			{
				if( $this->classic_editor_plugin_active && ( 'no-replace' == $this->replace_block_editor) )
				{
					return true;
				}
			}
			else 		
			{
				/**
				 * Backwards comp. for WP < 5.0
				 */
				if( $this->gutenberg_plugin_active )
				{
					return true;
				}
			}
			
			return false;
		}

		/**
		 * Allows to filter post types that cannot be edited with "classic editor"
		 * 
		 * @since 4.5.1
		 * @param WP_Post $post
		 * @return boolean
		 */
		protected function is_classic_editor_editable( WP_Post $post )
		{
			$non_classic_editor_post_types = apply_filters( 'avf_non_classic_editor_post_types', $this->non_classic_editor_post_types );	
			return ! in_array( $post->post_type, $non_classic_editor_post_types );
		}
		
		
		/**
		 * Wrapper function for backwards comp with Gutenberg plugin
		 * Allows to filter post types that can be edited with "block editor"
		 * 
		 * @since 4.5.1
		 * @param WP_Post|string		WP_Post object or post_type
		 * @return boolean
		 */
		protected function can_use_block_editor( $post )
		{
			$use_block = false;
			
			if( $post instanceof WP_Post )
			{
				$post_type = $post->post_type;
				$use_block = function_exists( 'use_block_editor_for_post' ) ? use_block_editor_for_post( $post ) : gutenberg_can_edit_post( $post );
			}
			else if( is_string( $post ) )
			{
				$post_type = $post;
				$use_block = function_exists( 'use_block_editor_for_post_type' ) ? use_block_editor_for_post_type( $post_type ) : gutenberg_can_edit_post_type( $post_type );
			}
				
			/**
			 * Allows to overwrite the standard WP block filter "use_block_editor_for_post_type"
			 * 
			 * @since 4.5.1
			 */
			return apply_filters( 'avf_can_use_block_editor_for_post', $use_block, $post_type );
		}
		
		
		/**
		 * Add info about ALB to post title
		 * 
		 * @since 4.5.1
		 * @param array $post_states
		 * @param WP_Post $post
		 * @return array
		 */
		public function handler_display_post_states( array $post_states, WP_Post $post )
		{
			if( $this->has_wp_block_editor )
			{
				if( $this->classic_editor_plugin_active && ( 'no-replace' == $this->replace_block_editor) )
				{
					if( has_blocks( $post->ID ) )
					{
						$post_states['wp_editor'] = $this->gutenberg_plugin_active ? __( 'Gutenberg Editor', 'avia_framework' ) : __( 'Block Editor', 'avia_framework' );
					}
					else
					{
						$post_states['wp_editor'] = __( 'Classic Editor', 'avia_framework' );
					}
				}
				
				$key = array_search( 'Gutenberg', $post_states );
				if( false !== $key )
				{
					unset( $post_states[ $key ] );
				}
			}
			else if( $this->gutenberg_plugin_active )
			{
				if( ! has_blocks( $post->ID ) )
				{
					$post_states['wp_editor'] = __( 'Classic Editor', 'avia_framework' );
				}
			}
			
			if( '' != Avia_Builder()->get_alb_builder_status( $post->ID ) )
			{
				$post_states['avia_alb'] = __( 'Advanced Layout Builder', 'avia_framework' );
			}
			
			return $post_states;
		}

		/**
		 * Registers an additional link in the post/page screens to edit any post/page in
		 * the Classic editor.
		 * 
		 * Modified function gutenberg_add_edit_link( $actions, $post ) 
		 * 
		 * @since 4.4.2
		 * @param array $actions	
		 * @param WP_Post $post
		 * @return array
		 */
		public function handler_add_edit_link( array $actions, WP_Post $post )
		{
			if( ! $this->need_classic_editor_links() )
			{
				return $actions;
			}
			
			$use_block = $this->can_use_block_editor( $post );
			if ( ! $use_block ) 
			{
				return $actions;
			}
			
			$edit_url = get_edit_post_link( $post->ID, 'av_gutenberg' );
			$classic_url = add_query_arg( 'classic-editor', '1', $edit_url );
			
			$title = _draft_or_post_title( $post->ID );
			
			$classic_action = array(
						'edit' => sprintf(
										'<a href="%s" aria-label="%s">%s</a>',
										esc_url( $classic_url ),
										esc_attr( sprintf(
												/* translators: %s: post title */
												__( 'Edit &#8220;%s&#8221; in the Classic Editor', 'avia_framework' ),
												$title
											) ),
										__( 'Classic Editor', 'avia_framework' )
								),
						);
			
			if( ! $this->gutenberg_plugin_active )
			{
				/* translators: %s: post title */
				$aria = __( 'Edit &#8220;%s&#8221; in the Block Editor', 'avia_framework' );
				$out = __( 'Block Editor', 'avia_framework' );
			}
			else
			{
				/* translators: %s: post title */
				$aria = __( 'Edit &#8220;%s&#8221; in the Gutenberg Editor', 'avia_framework' );
				$out = __( 'Gutenberg Editor', 'avia_framework' );
			}
			$gutenberg_action = array(
						'classic' => sprintf(
										'<a href="%s" aria-label="%s">%s</a>',
										esc_url( $edit_url ),
										esc_attr( sprintf(
												/* translators: %s: post title */
//												__( 'Edit &#8220;%s&#8221; in the Gutenberg editor', 'avia_framework' ),
												$aria,
												$title
											) ),
										$out
								),
						);
			
			/**
			 * Filter the actions
			 * 
			 * @since 4.4.2
			 */
			$classic_action = apply_filters( 'avf_gutenberg_edit_post_action', $classic_action, $actions, $post, 'classic' );
			$gutenberg_action = apply_filters( 'avf_gutenberg_edit_post_action', $gutenberg_action, $actions, $post, 'gutenberg' );
			
			/**
			 * Replace the standard edit action
			 */
			$actions['edit'] = $classic_action['edit'];
			
			/**
			 * Insert Gutenberg action after the Classic Edit action.
			 */
			$edit_offset = array_search( 'edit', array_keys( $actions ), true );
			$actions = array_merge(
							array_slice( $actions, 0, $edit_offset + 1 ),
							$gutenberg_action,
							array_slice( $actions, $edit_offset + 1 )
						);

			return $actions;
		}
		
		
		/**
		 * Change edit post link to selected target
		 * 
		 * @since 4.4.2
		 * @param string $link
		 * @param int $id
		 * @param string $context
		 * @return string
		 */
		public function handler_edit_post_link( $link, $id, $context )
		{
			global $pagenow;
			
			if( ! $this->need_classic_editor_links() || in_array( $context, array( 'av_gutenberg', 'raw' ) ) )
			{
				/**
				 * Fixes a problem with Gutenberg plugin when you open a block page in Classic editor - Warning box has a wrong link to classic editor
				 */
				if( $this->gutenberg_plugin_active && doing_action( 'admin_footer' ) && ( 'raw' == $context ) && ( 'post.php' == $pagenow ) )
				{
					if( $_REQUEST['post'] == $id )
					{
						$link = remove_query_arg( 'classic-editor', $link );
					}
				}
			
				
				return $link;
			}
			
			$post = get_post( $id );
			if( ! $post instanceof WP_Post )
			{
				return $link;
			}
			
			if( ! $this->is_classic_editor_editable( $post ) )
			{
				return $link;
			}
			
			if( ! has_blocks( $id ) )
			{
				$link = add_query_arg( 'classic-editor', '1', $link );
			}
			
			return $link;
		}
		
		
		/**
		 * Adjust admin bar for classic editor. We hook after theme handler.
		 * 
		 * @since 4.4.2
		 * @param WP_Admin_Bar $wp_admin_bar		(passed by reference)
		 * @return WP_Admin_Bar
		 */
		public function handler_admin_bar_menu( WP_Admin_Bar $wp_admin_bar )
		{
			
			if( ! current_user_can( 'manage_options' ) ) 
			{
				return;
			}
			
			/**
			 * Adjust "Edit Page" link in frontend
			 */
			if( ! is_admin() )
			{
				$viewed_id = avia_get_the_ID();
				$set_front_id = avia_get_option( 'frontpage' );
				$post = get_post( $viewed_id );
				
				if( $post instanceof WP_Post )
				{
					/**
					 * If the page/post/... does not contain gutenberg we must create a link to classic editor
					 */
					$is_gutenberg = has_blocks( $post );
					$is_alb = ( Avia_Builder()->get_alb_builder_status( $viewed_id ) == 'active' );

					$edit_url = get_edit_post_link( $post->ID, 'av_gutenberg' );
					
					if( ! $is_gutenberg )
					{
						if( $this->classic_editor_plugin_active && ( 'no-replace' == $this->replace_block_editor ) )
						{	
							$edit_url = add_query_arg( 'classic-editor', '1', $edit_url );
						}
					}

					if( is_front_page() &&  ( ( $viewed_id == $set_front_id ) || ( '' == $set_front_id ) ) )
					{
						if( $this->need_classic_editor_links() )
						{
							if( $is_gutenberg )
							{
								$title = $this->has_wp_block_editor ? __( 'Edit Frontpage (Block Editor)', 'avia_framework' ) : __( 'Edit Frontpage (Gutenberg)', 'avia_framework' );
							}
							else if( $is_alb )
							{
								$title = __( 'Edit Frontpage (Advanced Layout Builder)', 'avia_framework' );
							}
							else
							{
								$title = __( 'Edit Frontpage (Classic Editor)', 'avia_framework' );
							}
						}
						else 
						{
							$title = $is_alb ? __( 'Edit Frontpage (Advanced Layout Builder)', 'avia_framework' ) : __( 'Edit Frontpage', 'avia_framework' );
						}
					}
					else
					{
						$obj = get_post_type_object( $post->post_type );
						
						if( $this->need_classic_editor_links() )
						{
							if( $is_gutenberg )
							{
								$title = $this->has_wp_block_editor ? sprintf( __( 'Edit %s (Block Editor)', 'avia_framework' ), $obj->labels->singular_name ) : sprintf( __( 'Edit %s (Gutenberg)', 'avia_framework' ), $obj->labels->singular_name );
							}
							else if( $is_alb )
							{
								$title = sprintf( __( 'Edit %s (Advanced Layout Builder)', 'avia_framework' ), $obj->labels->singular_name );
							}
							else
							{
								$title = sprintf( __( 'Edit %s (Classic Editor)', 'avia_framework' ), $obj->labels->singular_name );
							}
						}
						else
						{
							if( $is_alb )
							{
								$title = sprintf( __( 'Edit %s (Advanced Layout Builder)', 'avia_framework' ), $obj->labels->singular_name );
							}
							else
							{
								$title = sprintf( __( 'Edit %s', 'avia_framework' ), $obj->labels->singular_name );
							}
						}
					}
					
					$menu = array(
									'id'	=> 'edit',
									'title'	=> $title,
									'href'	=> $edit_url,
									'meta'	=> array( 'target' => 'blank' )
								);

					$wp_admin_bar->add_menu( $menu );
				}
			}
			
			if( ! $this->need_classic_editor_links() )
			{
				return;
			}
	
			/**
			 * Adjust the "New" dropdown
			 */
			$nodes = $wp_admin_bar->get_nodes();
			
			$new_nodes = array();
	
			foreach( $nodes as $key => $node ) 
			{
				if( 0 !== strpos( $key, 'new-' ) )
				{
					continue;
				}
				
				if( 'new-content' == $key )
				{
					continue;
				}
				
				$post_type = str_replace( 'new-', '', $key );
				
				$wp_admin_bar->remove_node( $key );
				
				if( is_admin() )
				{
					$use_block = $this->can_use_block_editor( $post_type );
				}
				else
				{
					$use_block = false;
					
					if ( post_type_supports( $post_type, 'editor' ) )
					{
						$post_type_object = get_post_type_object( $post_type );
						$use_block = ( $post_type_object instanceof WP_Post_Type && $post_type_object->show_in_rest );
					}
				}
					
				if ( ! $use_block )
				{
					$new_nodes[] = $node;
					continue;
				}
				
				$classic = clone $node;

				$text = $this->has_wp_block_editor ? __( 'Block Editor', 'avia_framework' ) : __( 'Gutenberg Editor', 'avia_framework' );
				$node->title .= ' ( ' . $text . ' )';
				$new_nodes[] = $node;
				
				$classic->id .= '-classic';
				$text = $this->has_wp_block_editor ? __( 'Classic Editor', 'avia_framework' ) : __( 'Classic Editor/Advanced Layout Builder', 'avia_framework' );
				$classic->title .= ' ( ' . $text . ' )';
				$classic->href = add_query_arg( 'classic-editor', '1', $classic->href );
				$new_nodes[] = $classic;
			}
			
			/**
			 * Save reordered menus
			 */
			foreach( $new_nodes as $key => $node ) 
			{
				$wp_admin_bar->add_menu( $node );
			}
		}
		
		/**
		 * Add classic editor to main menus
		 * Based on the code from WP plugin classic-editor function classic_editor_add_submenus
		 * 
		 * @since 4.4.2
		 */
		public function handler_admin_menu() 
		{
			if( ! $this->need_classic_editor_links() )
			{
				return;
			}
			
			$post_types = get_post_types( array( 'show_ui' => true ) );
			
			foreach( $post_types as $post_type ) 
			{
				$type_obj = get_post_type_object( $post_type );

				if ( ! $type_obj->show_in_menu || ! post_type_supports( $post_type, 'editor' ) ) 
				{
					continue;
				}
				
				$use_block = $this->can_use_block_editor( $post_type );
				if ( ! $use_block )
				{
					continue;
				}
				
				if( $this->classic_editor_plugin_active && in_array( $post_type, array( 'post', 'page' ) ) )
				{
					continue;
				}
				
				if( $type_obj->show_in_menu === true ) 
				{
					if ( 'post' === $post_type ) 
					{
						$parent_slug = 'edit.php';
					} 
					else
					{
						$parent_slug = 'edit.php?post_type=' . $post_type;
					} 
				} 
				else 
				{
					$parent_slug = $type_obj->show_in_menu;
				}

				$item_name = $type_obj->labels->add_new . ' ' . __( '(Classic)', 'avia_framework' );
				$url = 'post-new.php?post_type=' . $post_type . '&classic-editor=1';

				add_submenu_page( $parent_slug, $type_obj->labels->add_new, $item_name, $type_obj->cap->edit_posts, $url );
			}
			
		}
		
		/**
		 * Checks for new post or edit post page and if post supports block editor
		 * 
		 * @since 4.5.1
		 * @return boolean
		 */
		public function needs_block_editor_extra_data()
		{
			global $pagenow;
			
			if( ! in_array( $pagenow, array( 'post-new.php', 'post.php' ) ) )
			{
				return false;
			}
			
			if( 'post-new.php' == $pagenow )
			{
				$post_type = isset( $_REQUEST['post_type'] ) ? $_REQUEST['post_type'] : 'post';
			}
			else
			{
				$post_id = isset( $_REQUEST['post'] ) ? $_REQUEST['post'] : 0;
				$post = get_post( $post_id );
				$post_type = $post instanceof WP_Post ? $post->post_type : '';
			}
			
			return $this->can_use_block_editor( $post_type );
		}

		/**
		 * 
		 * @since 4.5.1
		 * @param array $boxes
		 * @return array
		 */
		public function handler_avf_builder_boxes( array $boxes )
		{
			if( 'classic' == $this->requested_editor() )
			{
				return $boxes;
			}
			
			if( ! $this->needs_block_editor_extra_data() )
			{
				return $boxes;
			}
			
			$boxes[] = array( 
							'title'			=> __('Enfold Actions','avia_framework' ), 
							'id'			=> 'avia_alb_actions', 
							'page'			=> Avia_Builder()->get_supported_post_types(), 
							'context'		=> 'side', 
							'priority'		=> 'high', 
							'expandable'	=> false 
						);
			
			return $boxes;
		}

		
		/**
		 * 
		 * @since 4.5.1
		 * @param array $elements
		 * @return array
		 */
		public function handler_avf_builder_elements( array $elements )
		{
			if( 'classic' == $this->requested_editor() )
			{
				return $elements;
			}
			
			if( ! $this->needs_block_editor_extra_data() )
			{
				return $elements;
			}
			
			$elements[] = array(
							"slug"          => "avia_alb_actions",
							"name"          => __("Enfold Actions Window", 'avia_framework' ),
							"id"            => "avia_alb_actions_info",
							"type"          => array( $this, 'handler_alb_actions_panel' )
						);
			
			return $elements;
		}

		
		/**
		 * Function called by the metabox class that creates the interface in your wordpress backend - 
		 * Output the ALB action panel in the sidebar. Only called on gutenberg pages.
		 * 
		 * @since 4.5.1
		 * @param array $element
		 * @return string
		 */
		public function handler_alb_actions_panel( array $element )
		{
			global $post;
			
			if( 'classic' == $this->requested_editor() )
			{
				return $element;
			}
			
			$output =	'';
			
			/**
			 * Add the classic Advanced Layout Builder button
			 * 
			 * @used_by			AviaBuilder							100000
			 * @since 4.5.1
			 */
			ob_start();
			do_action( 'edit_form_after_title', $post, 'close' );
			$output .=		ob_get_clean();
			
			
			$output = str_replace( "id='postdivrich_wrap'", "id='postdivrich_wrap_meta'", $output );
			$output = str_replace( 'id="avia-builder-button"', 'id="avia-builder-button-meta"', $output );
			
			return $output;
		}
		
		
		/**
		 * We move default editor (TinyMCE) outside metabox to avoid conflicts if metaboxes are moved around
		 * 
		 * @since 4.5.1
		 * @return boolean
		 */
		public function handler_wp_all_admin_notices()
		{
			global $post, $pagenow;

			if( ! $post instanceof WP_Post )
			{
				return;
			}
			
			if( 'classic' == $this->requested_editor() )
			{
				return;
			}
			
			if( ! in_array( $pagenow, array( 'post-new.php', 'post.php' ) ) )
			{
				return;
			}
			
			$use_block = $this->can_use_block_editor( $post->post_type );
			if( ! $use_block )
			{
				return;
			}
			
			$output = '';
			
			$post_content = '';
			$alb_content = Avia_Builder()->get_posts_alb_content( $post->ID );
			
			if( trim( $alb_content ) != '' )
			{
				$post_content = $alb_content;
			}
			else
			{
				$post_content = $post->post_content;
			}
			
			
			ob_start();
			
			wp_editor(
					$post_content,
					'content',
					array(
						'_content_editor_dfw' => false,
						'drag_drop_upload'    => true,
						'tabfocus_elements'   => 'content-html,save-post',
						'editor_height'       => 300,
						'tinymce'             => array(
							'resize'                  => false,
							'wp_autoresize_on'        => false,
							'add_unload_trigger'      => false,
							'wp_keep_scroll_position' => true,
						),
					)
				);
			
			$editor = ob_get_clean();
			
			/**
			 * Create a div which is outside Gutenberg div
			 */
			$output .=	'<div class="avia_temp_editor" style="display: none;">';
			$output .=		'<div id="postdivrich_wrap" class="">';
			$output .=			'<div id="postdivrich" class="">';
			$output .=				$editor;
			$output .=			'</div>';
			$output .=		'</div>';
			$output .=	'</div>';
			
			echo $output;
			
			return;
		}
		
		
		/**
		 * Add the classic editor to metabox to allow ALB js to work without any changes
		 * 
		 * @since 4.5.1
		 * @param string $output
		 * @param array $element
		 * @return string
		 */
		public function handler_avf_builder_metabox_editor_before( $output, array $element )
		{
			global $post_type, $post_type_object, $post;
			
			if( 'classic' == $this->requested_editor() )
			{
				return $output;
			}
			
			if( ! $this->can_use_block_editor( $post) )
			{
				return $output;
			}
				
			$output .=	'<div id="post-body-content">';
			
			$output .=		'<div id="titlediv">';

			if ( post_type_supports( $post_type, 'title' ) ) 
			{ 
				/**
				 * Standard WP filter
				 */
				$title_placeholder = apply_filters( 'enter_title_here', __( 'Enter title here', 'avia_framework' ), $post );
				
				$output .=		'<div id="titlewrap">';
				$output .=			'<label class="screen-reader-text" id="title-prompt-text" for="title">' . $title_placeholder . '</label>';
				$output .=			'<input type="text" name="av_alb_post_title" size="30" value="' . esc_attr( $post->post_title ) . '" id="title" spellcheck="true" autocomplete="off" />';
				$output .=		'</div>';
			}
			else
			{
				$output .=		'<input type="hidden" name="av_alb_post_title" value="" id="title" />';
			}
			
			/**
			 * Fires before the permalink field in the edit form.
			 * 
			 * @used_by				currently unused
			 * 
			 * @since 4.5.1
			 * @param string $output
			 * @param WP_Post $post Post object.
			 */
			$output = apply_filters( 'ava_edit_form_before_permalink', $output, $post, 'gutenberg' );
		
			$output .=			'<div class="inside">';
			
			if ( is_post_type_viewable( $post_type_object ) )
			{
				$sample_permalink_html = $post_type_object->public ? get_sample_permalink_html( $post->ID ) : '';
				$sample_permalink_html = str_replace( 'edit-slug', 'av-edit-alb-permalink', $sample_permalink_html );
				
				// As of 4.4, the Get Shortlink button is hidden by default.
				if ( has_filter( 'pre_get_shortlink' ) || has_filter( 'get_shortlink' ) ) 
				{
					$shortlink = wp_get_shortlink( $post->ID, 'post' );

					if ( ! empty( $shortlink ) && $shortlink !== $permalink && $permalink !== home_url('?page_id=' . $post->ID) ) 
					{
						$sample_permalink_html .= '<input id="shortlink" type="hidden" value="' . esc_attr( $shortlink ) . '" /><button type="button" class="button button-small" onclick="prompt(&#39;URL:&#39;, jQuery(\'#shortlink\').val());">' . __( 'Get Shortlink' ) . '</button>';
					}
				}
				
				if ( $post_type_object->public && ! ( 'pending' == get_post_status( $post ) && ! current_user_can( $post_type_object->cap->publish_posts ) ) ) 
				{
					$has_sample_permalink = $sample_permalink_html && 'auto-draft' != $post->post_status;
					
					$output .=		'<div id="edit-slug-box" class="hide-if-no-js">';
					if ( $has_sample_permalink )
					{
						$output .=		$sample_permalink_html;
					}
					
					$output .=		'</div>   <!-- id="edit-slug-box"  -->';
				}
			}
			
			$output .=			'</div>   <!-- class="inside"  -->';
			
			$output .=		'</div>    <!-- id="titlediv"  -->';
				
			/**
			 * Add the classic Advanced Layout Builder button
			 * 
			 * @used_by			AviaBuilder							100000
			 * @since 4.5.1
			 */
			ob_start();
			do_action( 'edit_form_after_title', $post );
			$output .=		ob_get_clean();
			
			$output = str_replace( "id='postdivrich_wrap'", "id='postdivrich_wrap_builder_meta'", $output );
				
			/**
			 * Close the div postdivrich_wrap
			 * 
			 * @used_by			AviaBuilder							1
			 * @since 4.5.1
			 */
			ob_start();
			do_action( 'edit_form_after_editor', $post );
			$output .=		ob_get_clean();
			
			$output .=		'<input type="hidden" name="' . Avia_Gutenberg::AJAX_NONCE . '" value="' . wp_create_nonce( Avia_Gutenberg::AJAX_NONCE ) . '"/>';
			
			$output .=	'</div>   <!-- id="post-body-content"  -->';
			
			return $output;
		}
		
		
		/**
		 * Should be sync in frontend already - just for a fallback
		 * 
		 * @since 4.5.1
		 * @param array $data
		 * @param array $postarr
		 * @return array
		 */
		public function handler_before_save_alb_post_data( array $data, array $postarr )
		{
			$builder_stat = Avia_Builder()->get_alb_builder_status();
			
			if( 'active' == $builder_stat )
			{
				if( isset( $postarr['av_alb_post_title'] ) )
				{
					$data['post_title'] = sanitize_text_field( $postarr['av_alb_post_title'] );
				}
			}
			
			/**
			 * As WP saves revisions with RestAPI we do not get the metabox data - we have to set manually now the revision id
			 */
			$revisions = wp_get_post_revisions( $postarr['ID'], array( 'check_enabled' => true ) );
			if( ! empty( $revisions ) )
			{
				$revision = reset( $revisions );
				Avia_Builder()->set_revision_id( $revision->ID );
			}
			
			return $data;
		}
		
		/**
		 * WP5.0 uses block API and REST API calls with 'the_content' filter for own post content in backend
		 * This causes to run our shortcode handlers and produces notices (meta['index'] is undefined because $meta = array('el_class'=>'');)
		 * 
		 * @since 4.5.1
		 * @param array $args
		 * @return boolean
		 */
		public function handler_avf_in_shortcode_handler_prepare( array &$args )
		{
			if( 'classic' == $this->requested_editor() )
			{
				return $args[0];
			}
			
			if( defined( 'REST_REQUEST' ) && REST_REQUEST )
			{
				return false;
			}
			
			if( isset( $_REQUEST['action'] ) && ( 'edit' == $_REQUEST['action'] ) )
			{
				return false;
			}
			
			return $args[0];
		}
		
		/**
		 * Autosave of ALB metabox content. Element manager data are updated to reflect a valid state of the post.
		 * Postcontent is not modified to avoid a message by block editor.
		 * 
		 * @since 4.5.1
		 */
		public function handler_ajax_avia_gutenberg_autosave_metaboxes()
		{
			global $post;
			
			header( "Content-Type: application/json" );
		
			$return = check_ajax_referer( Avia_Gutenberg::AJAX_NONCE, Avia_Gutenberg::AJAX_NONCE, false );
				
				// response output
			$response = array( Avia_Gutenberg::AJAX_NONCE => wp_create_nonce( Avia_Gutenberg::AJAX_NONCE ) );
			
			/**
			 * Return error and allow to resend data
			 */
			if( false === $return )
			{
				$response['success'] = false;
				$response['expired_nonce'] = true;
				echo json_encode( $response );
				exit;
			}
			
			/**
			 * Save the ALB relevant data - as we do not want to interfere with the classic editor we do not call routines but copy the logic only
			 */
			$builder = Avia_Builder();
			$post_id = $_POST['post_id'];
			$save_to_revision = false;
			
			if( ! $post instanceof WP_Post )
			{
				$post = get_post( $post_id );
			}
			
			/**
			 * Autosaving a new post does not have an autosave post
			 */
			$autosave = wp_get_post_autosave( $post_id );
			if( false !== $autosave )
			{
				$post_id = $autosave->ID;
				$post = $autosave;
				$save_to_revision = true;
				
				Avia_Builder()->set_revision_id( $post_id );
				Avia_Builder()->save_alb_revision_data( $_POST['post_id'] );
			}
			
			/**
			 * see function handler_before_save_alb_post_data
			 */
			$builder_stat = $builder->get_alb_builder_status();
			$builder->set_alb_builder_status( $builder_stat, $post_id, '', $save_to_revision );
			
			$parser_state = isset( $_POST['_avia_sc_parser_state'] ) ?  $_POST['_avia_sc_parser_state'] : '';
			$parser_state = $builder->set_posts_shortcode_parser_state( $parser_state, $post_id, $save_to_revision );
			
			$builder->get_shortcode_parser()->set_builder_save_location( 'clean_data' );
			$clean_data = ShortcodeHelper::clean_up_shortcode( $_POST['_aviaLayoutBuilderCleanData'], 'balance_only' );
			
			/**
			 * We do not add id's because this is only an autosave
			 */
//			$clean_data = $builder->element_manager()->set_element_ids_in_content( $clean_data, $post_id );
			
			/**
			 * see function meta_box_save()
			 */
			$builder->save_posts_alb_content( $post_id, $clean_data, $save_to_revision );
			
			$tree = ShortcodeHelper::build_shortcode_tree( $clean_data );
			$builder->save_shortcode_tree( $post_id, $tree, $save_to_revision );
				
			if( ! $save_to_revision )
			{
				$builder->element_manager()->updated_post_content( $clean_data, $post_id );
			}
			
			/**
			 * @used_by			enfold\includes\admin\register-portfolio.php				10
			 * 
			 * @since 4.2.1
			 */
			$meta_keys = apply_filters( 'avf_alb_meta_field_names', array(), $post_id, 'save' );
			
			/**
			 * Save new values to post meta
			 */
			if( is_array( $meta_keys ) && ! empty( $meta_keys ) )
			{
				foreach( $meta_keys as $key ) 
				{
					if( isset( $_REQUEST[ $key ] ) )
					{
						update_metadata( 'post', $post_id, $key, $_REQUEST[ $key ] );
					}
					else
					{
						delete_metadata( 'post', $post_id, $key );
					}
				}
			}
			
			/**
			 * 
			 * @used_by				currently unused
			 * @since 4.5.1
			 */
			do_action( 'ava_gutenberg_autosave_metaboxes' );
			
			$response['success'] = true;
			echo json_encode( $response );
			exit;
		}
	
	}
	
	/**
	 * Returns the main instance of Avia_Gutenberg to prevent the need to use globals
	 * 
	 * @since 4.4.2
	 * @return AviaBuilder
	 */
	function AviaGutenberg()
	{
		return Avia_Gutenberg::instance();
	}
	
	/**
	 * Activate class
	 */
	AviaGutenberg();
	
}	//	end ! class_exists( 'Avia_Gutenberg' )

