<?php
if (!defined('ABSPATH')) die();
global $current_user; ?>

<div class="w3eden user-dashboard">
    <div class="row">
        <div class="col-md-3" id="wpdm-dashboard-sidebar">
            <img style="margin-bottom: 10px;border-radius: 3px;padding: 15px" class="thumbnail shop-logo" id="shop-logo" src="<?php echo get_avatar_url( $current_user->user_email, 512 ); ?>"/>

            <div class="list-group">
                <?php
                $udb_url = get_permalink(get_the_ID());
                foreach($this->dashboard_menu as $page_id => $menu_item){
                    $menu_url = get_permalink(get_the_ID());
                    if($page_id != '')
                        $menu_url = add_query_arg(array('udb_page' => $page_id), $udb_url);
                    if(isset($params['flaturl']) && $params['flaturl'] == 1 && !strstr($udb_url, "?"))
                        $menu_url = $udb_url.$page_id.($page_id!=''?'/':'');
                    ?>
                    <a class="list-group-item <?php echo $udb_page == $page_id?'selected':'';?>" href="<?php echo $menu_url; ?>"><?php echo $menu_item['name']; ?></a>
                <?php } ?>
                <a class="list-group-item" href="<?php echo wpdm_logout_url(); ?>"><span class="color-red"><?php _e('Logout', 'wmdpro'); ?></span></a>

            </div>

            <?php do_action("wpdm_user_dashboard_sidebar") ?>

        </div>
        <div class="col-md-9" id="wpdm-dashboard-contents">


            <?php echo $dashboard_contents; ?>


        </div>





    </div>
</div>



 