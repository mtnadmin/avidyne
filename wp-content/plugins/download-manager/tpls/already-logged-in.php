<?php
/**
 * Author: shahnuralam
 * Date: 2018-12-30
 * Time: 02:44
 */
if (!defined('ABSPATH')) die();
?>
<div class="media">
    <div class="pull-left text-center" style="width: 200px">
        <img style="width: 84px;" src="<?php echo get_avatar_url($current_user->ID, 84); ?>" />
        <h3><?php echo $current_user->display_name; ?></h3>
    </div>
    <div class="media-body">

        <div class="list-group" style="margin: 0 0 0 20px">
            <a class='list-group-item' href='<?php echo get_permalink(get_option('__wpdm_user_dashboard')); ?>'><?php _e( "Dashboard" , "download-manager" ); ?></a>
            <a class='list-group-item' href='<?php echo wpdm_user_dashboard_url(array('udb_page' => 'edit-profile')); ?>'><?php _e( "Edit Profile" , "download-manager" ); ?></a>
            <a class='list-group-item' href='<?php echo wpdm_logout_url(); ?>'><?php _e( "Logout" , "download-manager" ); ?></a>
        </div>

    </div>
</div>

<style>
    .w3eden #wpdmlogin .media .list-group-item,
    .w3eden #wpdmlogin .media h3{
        font-family: var(--fetfont) !important;
    }
    .w3eden #wpdmlogin{
        border: 0 !important;
        background: rgb(18,57,165) !important;
        background: -moz-linear-gradient(-45deg, rgba(18,57,165,1) 0%, rgba(69,131,237,1) 100%) !important;
        background: -webkit-linear-gradient(-45deg, rgba(18,57,165,1) 0%,rgba(69,131,237,1) 100%) !important;
        background: linear-gradient(135deg, rgba(18,57,165,1) 0%,rgba(69,131,237,1) 100%) !important;
        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#1239a5', endColorstr='#4583ed',GradientType=1 ) !important;
        background-attachment: fixed;
        background-size: cover;
        color: #ffffff;
    }
    #wpdmlogin h3{
        color: #ffffff;
    }
    #wpdmlogin .list-group{
        border: 0;
        background: transparent !important;
        border-radius: 5px !important;
        overflow: hidden !important;
    }
    #wpdmlogin .list-group .list-group-item{
        border: 0 !important;
        background: rgba(255,255,255, 0.9);
        color: #2F63CE;
        margin-bottom: 1px !important;
        -webkit-transition: all 400ms ease-in-out;
        -moz-transition: all 400ms ease-in-out;
        -ms-transition: all 400ms ease-in-out;
        -o-transition: all 400ms ease-in-out;
        transition: all 400ms ease-in-out;
    }
    #wpdmlogin .list-group .list-group-item:hover{
        background: rgba(255,255,255, 0.7);
    }
</style>
