var allps;

class WPDM {

    constructor(eid) {
        return $(eid);
    }

    static beep() {
        if(WPDM.audio == undefined)
            var snd = new  Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
        else
            var snd = new  Audio(WPDM.audio);
        snd.play();
    }

    static popupWindow(url, title, w, h) {
        /* Fixes dual-screen position                         Most browsers      Firefox */
        var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
        var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

        var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        var left = ((width / 2) - (w / 2)) + dualScreenLeft;
        var top = ((height / 2) - (h / 2)) + dualScreenTop;
        var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

        /* Puts focus on the newWindow */
        if (window.focus) {
            newWindow.focus();
        }

        return false;
    }

    static bootAlert(heading, content, width) {
        var html;
        if(!width) width = 400;
        jQuery("#w3eden__bootModal").remove();
        html = '<div class="w3eden" id="w3eden__bootModal"><div id="__bootModal" class="modal fade" tabindex="-1" role="dialog">\n' +
            '  <div class="modal-dialog" style="width: '+width+'px" role="document">\n' +
            '    <div class="modal-content" style="border-radius: 3px;overflow: hidden">\n' +
            '      <div class="modal-header" style="padding: 12px 15px;background: #f5f5f5;">\n' +
            '        <h4 class="modal-title" style="font-size: 9pt;font-weight: 500;padding: 0;margin: 0;font-family:Montserrat, san-serif;letter-spacing: 0.5px">'+heading+'</h4>\n' +
            '      </div>\n' +
            '      <div class="modal-body fetfont" style="line-height: 1.5;text-transform: unset;font-weight:400;letter-spacing:0.5px;font-size: 12px">\n' +
            '        '+content+'\n' +
            '      </div>\n' +
            '      <div class="modal-footer" style="padding: 10px 15px">\n' +
            '        <button type="button" class="btn btn-secondary btn-xs" data-dismiss="modal">Close</button>\n' +
            '      </div>\n' +
            '    </div>\n' +
            '  </div>\n' +
            '</div></div>';
        jQuery('body').append(html);
        jQuery("#__bootModal").modal('show');
    }


    /**
     * Local push notification
     * @param title
     * @param message
     * @param icon
     * @param image
     * @param url
     */
    static pushNotify(title, message, icon, image, url){
        if (!('Notification' in window) || !('ServiceWorkerRegistration' in window)) {
            return;
        }

        Notification.requestPermission(function (result) {
            if(result === 'granted'){
                console.log('Notification: ' + result);
                try {
                    var notification = new Notification(title, {body: message, icon: icon?icon:'https://cdn1.iconfinder.com/data/icons/hawcons/32/698558-icon-47-note-important-512.png', image: image?image:''});
                    if(url) {
                        notification.onclick = function (e) {
                            e.preventDefault();
                            window.open(url, '_blank');
                        };
                    }
                } catch (err) {
                    console.log('Notification API error: ' + err);
                }
            } else {
                console.log('Notification: ' + result);
            }
        });

    }



    /**
     * Shows notification
     * @param message
     * @param type
     * @param position
     */
    static notify(message, type = 'info', position = 'top-right'){
        var $ = jQuery;
        var notifycont = '#wpdm-notify-'+position;
        if($(notifycont).length  == 0)
            $('body').prepend("<div id='wpdm-notify-"+position+"'></div>");
        var notif = $("<div class='wpdm-notify fetfont wpdm-notify-"+type+"' style='margin-right: -500px'>"+message+"</div>");
        $(notifycont).append(notif);
        $(notif).animate({marginRight: '0px'});
        return $(notif);
    }

    /**
     * Shows notification
     * @param message
     * @param type
     * @param position
     */
    static floatify(html, position = 'top-right'){
        var $ = jQuery;
        var floatifycont = '#wpdm-floatify-'+position;
        if($(floatifycont).length  == 0)
            $('body').prepend("<div class='w3eden' id='wpdm-floatify-"+position+"'></div>");
        var floatify = $("<div class='wpdm-floatify fetfont style='margin-right: -500px'>"+html+"</div>");
        $(floatifycont).append(floatify);
        $(floatify).animate({marginRight: '0px'});
        return $(floatify);
    }

    static blockUI(element, xhr){
        jQuery(element).addClass("blockui");
        if(xhr)
            xhr.addEventListener("load", function () {
                jQuery(element).removeClass("blockui");
            });
    }

    static unblockUI(element){
        jQuery(element).removeClass("blockui");
    }

    static overlay(element, html){
        var $ = jQuery;
        var overlaycontent = $("<div class='wpdm-overlay-content' style='display: none'>"+html+"<div class='wpdm-overlay-close' style='cursor: pointer'><i class='far fa-times-circle'></i> close</div></div>");
        $(element).addClass('wpdm-overlay').append(overlaycontent);
        $(overlaycontent).fadeIn();
        $('body').on('click', '.wpdm-overlay-close', function () {
            $(overlaycontent).fadeOut(function () {
                $(this).remove();
            });
        });
        return $(overlaycontent);
    }


    static confirm(heading, content, buttons) {
        var html, $ = jQuery;
        $("#w3eden__boot_popup").remove();
        var _buttons = '';
        if(buttons) {
            _buttons = '<div class="modal-footer" style="padding: 8px 15px;">\n';
            $.each(buttons, function (i, button) {
                var id = 'btx_' + i;
                _buttons += "<button id='" + id + "' class='" + button.class + " btn-xs' style='font-size: 10px;padding: 3px 20px;'>" + button.label + "</button> ";
            });
            _buttons += '</div>\n';
        }

        html = '<div class="w3eden" id="w3eden__boot_popup"><div id="__boot_popup" style="z-index: 9999999 !important;" class="modal fade" tabindex="-1" role="dialog">\n' +
            '  <div class="modal-dialog" role="document" style="max-width: 100%;width: 350px">\n' +
            '    <div class="modal-content" style="border-radius: 3px;overflow: hidden">\n' +
            '      <div class="modal-header" style="padding: 12px 15px;background: #f5f5f5;">\n' +
            '        <h4 class="modal-title" style="font-size: 9pt;font-weight: 500;padding: 0;margin: 0;font-family:var(--fetfont), san-serif;letter-spacing: 0.5px">'+heading+'</h4>\n' +
            '      </div>\n' +
            '      <div class="modal-body text-center" style="font-family:var(--fetfont), san-serif;letter-spacing: 0.5px;font-size: 10pt;font-weight: 300;padding: 25px;line-height: 1.5">\n' +
            '        '+content+'\n' +
            '      </div>\n' + _buttons +
            '    </div>\n' +
            '  </div>\n' +
            '</div></div>';
        $('body').append(html);
        $("#__boot_popup").modal('show');
        $.each(buttons, function (i, button) {
            var id = 'btx_'+i;
            $('#'+id).unbind('click');
            $( '#'+id).bind('click' , function () {
                button.callback.call($("#__boot_popup"));
                return false;
            });
        });
        return $("#__boot_popup");
    }

}



jQuery(function ($) {

    $('body').on('click', '.wpdm-notify', function () {
        /* $(this).addClass('wpdm-hide-right'); */
        $(this).animate({marginRight: '-500px'}, 1000, function () {
            $(this).remove();
        });
    });

    $('body').on('click', '.wpdm-download-link.wpdm-download-locked', function (e) {
        e.preventDefault();
        hideLockFrame();

        var parentWindow = document.createElement("a");
        parentWindow.href = document.referrer.toString();

        if(parentWindow.hostname === window.location.hostname)
            $(window.parent.document.body).append("<iframe id='wpdm-lock-frame' style='left:0;top:0;width: 100%;height: 100%;z-index: 999999999;position: fixed;background: rgba(255,255,255,0.4) url("+wpdm_home_url+"wp-content/plugins/download-manager/assets/images/loader.svg) center center no-repeat;background-size: 100px 100px;border: 0;' src='"+wpdm_home_url+"?__wpdmlo="+$(this).data('package')+"'></iframe>");
        else
            window.parent.postMessage({
                'task': 'showiframe',
                'iframe': "<iframe id='wpdm-lock-frame' style='left:0;top:0;width: 100%;height: 100%;z-index: 999999999;position: fixed;background: rgba(255,255,255,0.4) url("+wpdm_home_url+"wp-content/plugins/download-manager/assets/images/loader.svg) center center no-repeat;background-size: 100px 100px;border: 0;' src='"+wpdm_home_url+"?__wpdmlo="+$(this).data('package')+"'></iframe>"
            }, "*");

    });


    $('body').on('click', '.__wpdm_playvideo', function (e) {
        e.preventDefault();
        $('#__wpdm_videoplayer').children('source').attr('src', $(this).data('video'));
        console.log('loading...');
        var vid = document.getElementById("__wpdm_videoplayer");
        vid.onloadeddata = function() {
            console.log('loaded....');
        };
        $("#__wpdm_videoplayer").get(0).load();

        //$('#__wpdm_videoplayer').get(0).play();
    });

    $('body').on('click', function (e) {

        if ($(e.target).data('toggle') !== 'popover'
            && $(e.target).parents('.popover.in').length === 0) {
            try {

                $('.wpdm-download-locked.pop-over').each(function(){
                    if($(this).data('ready') == 'show'){
                        $(this).popover('hide');
                        $(this).data('ready', 'hide');
                    }
                });
            }catch(e){}
        }
    });

    $('body').on('change', '.terms_checkbox', function (e) {
        if($(this).is(':checked'))
            $('#wpdm-filelist-'+$(this).data('pid')+' .btn.inddl, #xfilelist .btn.inddl').removeAttr('disabled');
        else
            $('#wpdm-filelist-'+$(this).data('pid')+' .btn.inddl, #xfilelist .btn.inddl').attr('disabled', 'disabled');
    });

    $('body').on('click', '.wpdm-social-lock', function (e) {

            try {


                _PopupCenter($(this).data('url'), 'Social Lock', 600, 400);

            }catch(e){}

    });

    $('body').on('click', '.po-close', function (e) {

            try {

                $('.wpdm-download-locked.pop-over').each(function(){
                    if($(this).data('ready') == 'show'){
                        $(this).popover('hide');
                        $(this).data('ready', 'hide');
                    }
                });
            }catch(e){}

    });

    $('body').on('click', '#wpdm-dashboard-sidebar a.list-group-item', function (e) {

           location.href = this.href;

    });

    $('.input-group input').on('focus', function () {
        $(this).parent('.input-group').find('.input-group-addon').addClass('input-group-addon-active');
    });
    $('.input-group input').on('blur', function () {
        $(this).parent().find('.input-group-addon').removeClass('input-group-addon-active');
    });

    //$('.inddl').unbind('click');
    $('body').on('click', 'button.btn.inddl', function (e) {
        e.preventDefault();
        var tis = this;
        if($(this).data('dlurl') != undefined){
            location.href = $(this).data('dlurl');
            return;
        }
        $.post( wpdm_ajax_url, {
            action: 'wpdm_verify_file_pass',
            wpdmfileid: $(tis).data('pid'),
            wpdmfile: $(tis).data('file'),
            actioninddlpvr: 1,
            filepass: $($(tis).data('pass')).val()
        }, function (res) {
            var _res = res;
            res = res.split('|');
            if (_res.match(/error/)) $($(tis).data('pass')).addClass('input-error');
            if (_res.match(/ok/)) {
                var dlurl = wpdm_home_url + '?wpdmdl=' + $(tis).data('pid') + '&ind=' + $(tis).data('file') + '&_wpdmkey=' + res[2];
                $(tis).data('dlurl', dlurl);
                wpdm_boot_popup("Password Verified!", "<div style='padding: 50px;'>Please click following button to start download.<br/><br/><a href='"+dlurl+"' class='btn btn-lg btn-success' target='_blank'>Start Download</a></div>",
                    [{
                            label: 'Close',
                            class: 'btn btn-secondary',
                            callback: function () {
                                this.modal('hide');
                                return false;
                            }
                        }]
                    );
            }
        });
    });

    $('body').on('click', '.wpdm-download-locked.pop-over', function () {
        var $dc = $($(this).attr('href'));
        var prts = $(this).attr('href').split('_');
        var pid = prts[1];

        if ($(this).attr('data-ready') == undefined || $(this).attr('data-ready') == 'hide') {

            $(this).popover({
                placement: 'bottom',
                html: true,
                content: function () {

                    if(wpdm_ajax_popup == 1)
                    return "<div id='popcnt_"+pid+"'><i class='fa fa-refresh fa-spin'></i> Loading...</div>"+'<div style="padding-top: 10px;border-top: 1px solid #eeeeee;text-align: right"><button class="btn btn-danger btn-xs po-close" s><i class="fa fa-times-circle"></i> Close</button></div>';

                    else
                        return $dc.html()+'<div style="padding-top: 10px;border-top: 1px solid #eeeeee;text-align: right"><button class="btn btn-danger btn-xs po-close" s><i class="fa fa-times-circle"></i> Close</button></div>';


                }
            });
            $(this).popover('show');

            if(wpdm_ajax_popup == 1)
                $("#popcnt_"+pid).load(ajax_url,{action:'showLockOptions',id:pid});

            $(this).data('ready', 'show');
        } else {
            $(this).popover('hide');
            $(this).date('ready', 'hide');
        }

        return false;
    });



    $('body').on('click', '.wpdm-indir', function (e) {
        e.preventDefault();
        $('#xfilelist').load(location.href, {
            action: 'wpdmfilelistcd',
            pid: $(this).data('pid'),
            cd: $(this).data('dir')
        });
    });


    $('body').on('click', '.role-tabs a', function (e) {
        $('.role-tabs a').removeClass('active');
        $(this).addClass('active');
    });



    $('body').on('click', '.btn-wpdm-a2f', function (e) {
            var a2fbtn = $(this);
            $.post(ajax_url, {action: 'wpdm_addtofav', pid: $(this).data('package')}, function (res) {
                if(a2fbtn.hasClass('btn-secondary'))
                    a2fbtn.removeClass('btn-secondary').addClass('btn-danger').html(a2fbtn.data('rlabel'));
                else
                    a2fbtn.removeClass('btn-danger').addClass('btn-secondary').html(a2fbtn.data('alabel'));
            });
    });

    $('body').on('click', '.wpdm-btn-play', function (e) {
        e.preventDefault();
        var player = $('#' + $(this).data('player'));
        var btn = $(this);

        if (btn.data('state') == 'playing') {
            $(this).data('state', 'paused');
            player.trigger('pause');
            $(this).html("<i class='fa fa-play'></i>");
            return false;
        }

        if (btn.data('state') == 'paused') {
            $(this).data('state', 'playing');
            player.trigger('play');
            $('.wpdm-btn-play').html("<i class='fa fa-play'></i>");
            $(this).html("<i class='fa fa-pause'></i>");
            return false;
        }


        player.attr('src', $(this).data('song') + "&play=song.mp3");
        player.slideDown();
        $('.wpdm-btn-play').data("state", "stopped");
        $('.wpdm-btn-play').html("<i class='fa fa-play'></i>");
        btn.html("<i class='fas fa-sun  fa-spin'></i>");
        player.unbind('loadedmetadata');
        player.on('loadedmetadata', function () {
            console.log("Playing " + this.src + ", for: " + this.duration + "seconds.");
            btn.html("<i class='fa fa-pause'></i>");
            btn.data('state', 'playing');

        });
    });

    $('.wpdm_remove_empty').remove();

    /* Uploading files */
    var file_frame, dfield;

    $('body').on('click', '.wpdm-media-upload', function (event) {
        event.preventDefault();
        dfield = $($(this).attr('rel'));

        /* If the media frame already exists, reopen it. */
        if (file_frame) {
            file_frame.open();
            return;
        }

        /* Create the media frame. */
        file_frame = wp.media.frames.file_frame = wp.media({
            title: $(this).data('uploader_title'),
            button: {
                text: $(this).data('uploader_button_text')
            },
            multiple: false  /* Set to true to allow multiple files to be selected */
        });

        /* When an image is selected, run a callback. */
        file_frame.on('select', function () {
            /* We set multiple to false so only get one image from the uploader */
            attachment = file_frame.state().get('selection').first().toJSON();
            dfield.val(attachment.url);

        });

        /* Finally, open the modal */
        file_frame.open();
    });

    $('body').on('click', '.btn-image-selector' , function( event ){
        event.preventDefault();
        dfield = $($(this).attr('rel'));
        var dfield_h = $($(this).attr('rel')+'_hidden');

        // If the media frame already exists, reopen it.
        if ( file_frame ) {
            file_frame.open();
            return;
        }

        // Create the media frame.
        file_frame = wp.media.frames.file_frame = wp.media({
            title: $( this ).data( 'uploader_title' ),
            button: {
                text: $( this ).data( 'uploader_button_text' )
            },
            multiple: false  // Set to true to allow multiple files to be selected
        });

        // When an image is selected, run a callback.
        file_frame.on( 'select', function() {
            // We set multiple to false so only get one image from the uploader
            attachment = file_frame.state().get('selection').first().toJSON();
            dfield.attr('src', attachment.url);
            dfield_h.val(attachment.url);

        });

        // Finally, open the modal
        file_frame.open();
    });

    $('body').on('click', '.pagination.async a', function (e) {
        e.preventDefault();
        var _cont = $(this).data('container');
        console.log(_cont);
        $(_cont).addClass('blockui');
        $.get(this.href, function (res) {
            $(_cont).html($(res).find(_cont).html());
            $(_cont).removeClass('blockui');
        });
    });



    /* Bootstrap 4 *
    $('.panel').addClass('card').removeClass('panel');
    $('.panel-body').addClass('card-body').removeClass('panel-body');
    $('.panel-heading').addClass('card-header').removeClass('panel-heading');
    $('.panel-footer').addClass('card-footer').removeClass('panel-footer');
    $('.panel-danger').addClass('bg-danger text-white').removeClass('panel-danger');
    $('.dashboard-panel').removeClass('.dashboard-panel');
    //*/



});

function _PopupCenter(url, title, w, h) {
    /* Fixes dual-screen position                         Most browsers      Firefox */
    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;
    var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

    /* Puts focus on the newWindow */
    if (window.focus) {
        newWindow.focus();
    }

    return false;
}

function generatepass(id){
    tb_show('Generate Password',ajaxurl+'?action=wpdm_generate_password&id='+id);
}

function hideLockFrame() {
    jQuery('#wpdm-lock-frame').remove();
}

function wpdm_bootModal(heading, content, width) {
    var html;
    if(!width) width = 400;
    jQuery("#w3eden__bootModal").remove();
    html = '<div class="w3eden" id="w3eden__bootModal"><div id="__bootModal" class="modal fade" tabindex="-1" role="dialog">\n' +
        '  <div class="modal-dialog" style="width: '+width+'px" role="document">\n' +
        '    <div class="modal-content" style="border-radius: 3px;overflow: hidden">\n' +
        '      <div class="modal-header" style="padding: 12px 15px;background: #f5f5f5;">\n' +
        '        <h4 class="modal-title" style="font-size: 9pt;font-weight: 500;padding: 0;margin: 0;font-family:Montserrat, san-serif;letter-spacing: 0.5px">'+heading+'</h4>\n' +
        '      </div>\n' +
        '      <div class="modal-body fetfont" style="line-height: 1.5;text-transform: unset;font-weight:400;letter-spacing:0.5px;font-size: 12px">\n' +
        '        '+content+'\n' +
        '      </div>\n' +
        '      <div class="modal-footer" style="padding: 10px 15px">\n' +
        '        <button type="button" class="btn btn-secondary btn-xs" data-dismiss="modal">Close</button>\n' +
        '      </div>\n' +
        '    </div>\n' +
        '  </div>\n' +
        '</div></div>';
    jQuery('body').append(html);
    jQuery("#__bootModal").modal('show');
}

function wpdm_boot_popup(heading, content, buttons) {
    var html, $ = jQuery;
    $("#w3eden__boot_popup").remove();
    var _buttons = '';
    if(buttons) {
        _buttons = '<div class="modal-footer" style="padding: 8px 15px;">\n';
        $.each(buttons, function (i, button) {
            var id = 'btx_' + i;
            _buttons += "<button id='" + id + "' class='" + button.class + " btn-xs' style='font-size: 10px;padding: 3px 20px;'>" + button.label + "</button> ";
        });
        _buttons += '</div>\n';
    }

    html = '<div class="w3eden" id="w3eden__boot_popup"><div id="__boot_popup" style="z-index: 9999999 !important;" class="modal fade" tabindex="-1" role="dialog">\n' +
        '  <div class="modal-dialog" role="document" style="max-width: 100%;width: 350px">\n' +
        '    <div class="modal-content" style="border-radius: 3px;overflow: hidden">\n' +
        '      <div class="modal-header" style="padding: 12px 15px;background: #f5f5f5;">\n' +
        '        <h4 class="modal-title" style="font-size: 9pt;font-weight: 500;padding: 0;margin: 0;font-family:Montserrat, san-serif;letter-spacing: 0.5px">'+heading+'</h4>\n' +
        '      </div>\n' +
        '      <div class="modal-body text-center" style="letter-spacing: 0.5px;font-size: 10pt;font-weight: 300;padding: 25px;line-height: 1.5">\n' +
        '        '+content+'\n' +
        '      </div>\n' + _buttons +
        '    </div>\n' +
        '  </div>\n' +
        '</div></div>';
    $('body').append(html);
    $("#__boot_popup").modal('show');
    $.each(buttons, function (i, button) {
        var id = 'btx_'+i;
        $('#'+id).unbind('click');
        $( '#'+id).bind('click' , function () {
            button.callback.call($("#__boot_popup"));
            return false;
        });
    });
    return $("#__boot_popup");
}

function wpdm_iframe_modal(url, closebutton = false) {
    var iframe, $ = jQuery;
    if(url === 'close') {
        $('#wpdm_iframe_modal').remove();
        $('body').removeClass('wpdm-iframe-modal-open');
        return false;
    }
    var closebutton_html = "";
    if(closebutton)
        closebutton_html = "<a href='#' onclick='return wpdm_iframe_modal(\"close\");' style='border-radius: 0;position: absolute;top: 0;right: 0;z-index: 999999;width: 40px;line-height: 40px;padding: 0' class='btn btn-danger'><i class='fas fa-times-circle'></i></a>";

    iframe = '<iframe src="'+url+'" style="width: 100%;height: 100%;position: fixed;z-index: 999999999 !important;border: 0;left: 0;top: 0;right: 0;bottom: 0;background: rgba(0,0,0,0.2);display: none;" id="wpdm_iframe_modal"></iframe>'+closebutton_html;
    $('body').append(iframe).addClass('wpdm-iframe-modal-open');
    $('#wpdm_iframe_modal').fadeIn();

}