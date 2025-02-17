<div class="w3eden author-dashbboard">
    <?php if (is_user_logged_in()) {

        $adb_url = get_permalink(get_the_ID());
        $menu_url = add_query_arg(array('adb_page' => '%s'), $adb_url);
        //$menu_url = get_permalink(get_the_ID()).$sap.'adb_page=%s';

        if(isset($params['flaturl']) && $params['flaturl'] == 1 && !strstr($adb_url, '?'))
            $menu_url = rtrim($adb_url, '/').'/%s/';

        $store = get_user_meta(get_current_user_id(), '__wpdm_public_profile', true);

    ?>
<div class="row">
    <div class="col-md-2" id="wpdm-dashboard-sidebar">
    <?php if(isset($store['logo']) && $store['logo'] != ''){ ?>
        <img style="margin-bottom: 10px;border-radius: 3px;padding: 10px" class="thumbnail shop-logo" id="shop-logo" src="<?php echo $store['logo']; ?>"/>
    <?php } ?>

    <div id="tabs" class="list-group" style="margin: 0;padding: 0">
        <?php foreach ($tabs as $tid => $tab): ?>
            <a  id="wpdm-ad-<?php echo $tid ?>" class="list-group-item <?php if ($task == $tid) { ?>active<?php } ?>" href="<?php echo $tid != ''?sprintf("$menu_url", $tid):get_permalink(get_the_ID()); ?>"><?php echo $tab['label']; ?></a>
        <?php endforeach; ?>
        
        <a id="wpdm-ad-edit-profile" class="list-group-item <?php if ($task == 'edit-profile') { ?>active<?php } ?>" href="<?php echo sprintf("$menu_url", "edit-profile"); ?>"><?php _e( "Edit Profile" , "download-manager" ); ?></a>

        <a id="wpdm-ad-settings" class="list-group-item <?php if ($task == 'settings') { ?>active<?php } ?>" href="<?php echo sprintf("$menu_url", "settings"); ?>"><?php _e( "Settings" , "download-manager" ); ?></a>
        <a id="wpdm-ad-logout" class="list-group-item" href="<?php echo wpdm_logout_url(); ?>"><?php _e( "Logout" , "download-manager" ); ?></a>
    </div>

    </div>
    <div class="col-md-10">

<?php

    if ($task == 'add-new' || $task == 'edit-package')
        include(wpdm_tpl_path('wpdm-add-new-file-front.php'));
    else if ($task == 'edit-profile')
        include(wpdm_tpl_path('wpdm-edit-user-profile.php'));
    else if ($task == 'settings')
       echo do_shortcode("[wpdm_author_settings]");
    else if ($task != '' && isset($tabs[$task]['callback']) && $tabs[$task]['callback'] != '')
        call_user_func($tabs[$task]['callback']);
    else if ($task != '' && isset($tabs[$task]['shortcode']) && $tabs[$task]['shortcode'] != '')
        echo do_shortcode($tabs[$task]['shortcode']);
    //else
        //include(wpdm_tpl_path('list-packages-table.php'));
?>

    </div>
    </div>
        <?php
} else {

    include(wpdm_tpl_path('wpdm-be-member.php'));
}
?>

    <script>jQuery(function($){ $("#tabs > li > a").click(function(){ location.href=this.href; });  });</script>

<?php if (is_user_logged_in()) echo "</div>";


