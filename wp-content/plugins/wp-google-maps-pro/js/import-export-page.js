(function($) {
	
	jQuery(document).ready(function () {
		$('.import_data_type').change(function(){
			if ('URL' === $(this).val()) {
				$('#import_from_file').hide();
				$('#import_from_url').show();
			} else {
				$('#import_from_url').hide();
				$('#import_from_file').show();
			}
		});
		$('#wpgmaps_import_file').change(function () {
			if ($(this)[0].files.length > 0) {
				$('#wpgmaps_import_file_name').text($(this)[0].files[0].name);
			} else {
				$('#wpgmaps_import_file_name').html('');
			}
		});

		$('#wpgmaps_import_upload_button').click(function (e) {
			if ($('#wpgmaps_import_file')[0].files.length < 1) {
				alert(WPGMZA.localized_strings.please_select_a_file_to_upload);
				return;
			}

			$('#wpgmaps_import_file,#wpgmaps_import_upload_button').prop('disabled', true);
			$('#wpgmaps_import_file + label,#wpgmaps_import_upload_button').css('opacity', '0.5');
			$('#wpgmaps_import_upload_spinner').addClass('is-active');

			var form_data = new FormData();
			form_data.append('action', 'wpgmza_import_upload');
			form_data.append('wpgmaps_security', WPGMZA.import_security_nonce);
			form_data.append('wpgmaps_import_file', $('#wpgmaps_import_file')[0].files[0]);

			wp.ajax.send({
				data: form_data,
				processData: false,
				contentType: false,
				cache: false,
				success: function (data) {
					if (typeof data !== 'undefined' && data.hasOwnProperty('id') && data.hasOwnProperty('title')) {
						$('#wpgmap_import_file_list_table tbody').prepend('<tr id="import-list-item-' + data.id + '"><td><strong><span class="import_file_title" style="font-size:larger;">' + data.title + '</span></strong><br>' +
							'<a href="javascript:void(0);" class="import_import" data-import-id="' + data.id + '">' + WPGMZA.localized_strings.import_reservedwordsfix + '</a>' +
							' | <a href="javascript:void(0);" class="import_delete" data-import-id="' + data.id + '">' + WPGMZA.localized_strings.delete_reservedwordsfix + '</a></td></tr>');
						wpgmaps_import_setup_file_links(data.id);
						$('#wpgmaps_import_file_list').show();
						$('#import-list-item-' + data.id + ' .import_import').click();
					}
				},
				error: function (data) {
					if (typeof data !== 'undefined') {
						wpgmaps_import_add_notice(data, 'error');
					}
				}
			}).always(function () {
				$('#wpgmaps_import_file_name').html('');
				$('#wpgmaps_import_file').replaceWith($('#wpgmaps_import_file').val('').clone(true));
				$('#wpgmaps_import_file,#wpgmaps_import_upload_button').prop('disabled', false);
				$('#wpgmaps_import_file + label,#wpgmaps_import_upload_button').css('opacity', '1.0');
				$('#wpgmaps_import_upload_spinner').removeClass('is-active');
			});
		});

		function wpgmaps_import_setup_file_links(id = '') {
			var del_select = '.import_delete';
			var imp_select = '.import_import';
			if (parseInt(id) > 1){
				del_select = '#import-list-item-' + id + ' ' + del_select;
				imp_select = '#import-list-item-' + id + ' ' + imp_select;
			}
			$(imp_select).click(function () {
				$('#import_files').hide();
				$('#import_loader_text').html('<br>Loading import options...');
				$('#import_loader').show();
				wp.ajax.send({
					data: {
						action: 'wpgmza_import_file_options',
						wpgmaps_security: WPGMZA.import_security_nonce,
						import_id: $(this).attr('data-import-id')
					},
					success: function (data) {
						if (typeof data !== 'undefined' && data.hasOwnProperty('options_html')) {
							$('#import_loader').hide();
							$('#import_options').html('<div style="margin:5px 0;"><a href="javascript:void(0);" onclick="jQuery(\'#import_options\').html(\'\').hide();jQuery(\'#import_files\').show();">' + WPGMZA.localized_strings.back_to_import_data + '</a></div>' + data.options_html).show();
						}
					},
					error: function (data) {
						if (typeof data !== 'undefined') {
							wpgmaps_import_add_notice(data, 'error');
						}
						$('#import_loader').hide();
						$('#import_options').html('').hide();
						$('#import_files').show();
					}
				});
			});
			$(del_select).click(function () {
				if (confirm(WPGMZA.localized_strings.are_you_sure_you_wish_to_delete_this_file + $(this).parent().find('.import_file_title').text())) {
					wp.ajax.send({
						data: {
							action: 'wpgmza_import_delete',
							wpgmaps_security: WPGMZA.import_security_nonce,
							import_id: $(this).attr('data-import-id')
						},
						success: function (data) {
							if (typeof data !== 'undefined' && data.hasOwnProperty('id')) {
								$('#import-list-item-' + data.id).remove();
								wpgmaps_import_add_notice('<p>' + WPGMZA.localized_strings.file_deleted + '</p>');
							}
						},
						error: function (data) {
							if (typeof data !== 'undefined') {
								wpgmaps_import_add_notice(data, 'error');
							}
						}
					});
				}
			});
		}

		wpgmaps_import_setup_file_links();

		$('#wpgmaps_import_url_button').click(function () {
			var import_url = $('#wpgmaps_import_url').val();

			if (import_url.length < 1) {
				alert(WPGMZA.localized_strings.please_enter_a_url_to_import_from);
				return;
			}
			$('#import_files').hide();
			$('#import_options').html('<div style="text-align:center;"><div class="spinner is-active" style="float:none;"></div></div>').show();
			wp.ajax.send({
				data: {
					action: 'wpgmza_import_file_options',
					wpgmaps_security: WPGMZA.import_security_nonce,
					import_url: import_url
				},
				success: function (data) {
					if (typeof data !== 'undefined' && data.hasOwnProperty('options_html')) {
						$('#import_options').html('<div style="margin:5px 0;"><a href="javascript:void(0);" onclick="jQuery(\'#import_options\').html(\'\').hide();jQuery(\'#import_files\').show();">' + WPGMZA.localized_strings.back_to_import_data + '</a></div>' + data.options_html);
					}
				},
				error: function (data) {
					if (typeof data !== 'undefined') {
						wpgmaps_import_add_notice(data, 'error');
					}
					$('#import_options').html('').hide();
					$('#import_files').show();
				}
			});
		});
		function wpgmaps_import_add_notice( notice, type = 'success', noclear ) {
			if(!noclear)
				$('.notice').remove();
			
			if(typeof notice == "object")
			{
				if(notice.responseText)
					notice = "<p>" + notice.responseText + "</p>";
				else if(notice.statusText)
					notice = "<p>" + notice.statusText + "</p>";
				else
					notice = "<p>Unknown error - Status " + notice.status + "</p>";
			}

			var notice = '<div class="notice notice-' + type + ' is-dismissible">' + notice + '</div>';
			
			$('#wpgmaps_tabs').before(notice);
			
			$(notice).append('<button type="button" class="notice-dismiss"><span class="screen-reader-text"></span></button>');
			$(notice).find(".notice-dismiss").on("click", function() {
				$(notice).fadeTo(100, 0, function() {
					$(notice).slideUp(100, function() {
						$(notice).remove();
					});
				});
			});
		}
		window.wpgmaps_import_add_notice = wpgmaps_import_add_notice;
		
		function wpgmaps_import_setup_schedule_links(id = '') {
			var del_select = '.import_schedule_delete';
			var edt_select = '.import_schedule_edit';
			if (id.length > 1){
				del_select = '#import-schedule-list-item-' + id + ' ' + del_select;
				edt_select = '#import-schedule-list-item-' + id + ' ' + edt_select;
			}
			$(edt_select).click(function () {
				$('a[href="#import-tab"]').click();
				$('#import_files').hide();
				$('#import_loader_text').html(WPGMZA.localized_strings.loading_import_options);
				$('#import_loader').show();
				wp.ajax.send({
					data: {
						action: 'wpgmza_import_file_options',
						wpgmaps_security: WPGMZA.import_security_nonce,
						schedule_id: $(this).attr('data-schedule-id'),
					},
					success: function (data) {
						if (typeof data !== 'undefined' && data.hasOwnProperty('options_html')) {
							$('#import_loader').hide();
							$('#import_options').html('<div style="margin:5px 0;"><a href="javascript:void(0);" onclick="jQuery(\'#import_options\').html(\'\').hide();jQuery(\'#import_files\').show();">' + WPGMZA.localized_strings.back_to_import_data + '</a></div>' + data.options_html).show();
						}
					},
					error: function (data) {
						if (typeof data !== 'undefined') {
							wpgmaps_import_add_notice(data, 'error');
						}
						$('#import_loader').hide();
						$('#import_options').html('').hide();
						$('#import_files').show();
					}
				});
			});
			$(del_select).click(function () {
				if (confirm(WPGMZA.localized_strings.are_you_sure_you_wish_to_delete_this_scheduled_import + $(this).parent().find('.import_schedule_title').text())) {
					wp.ajax.send({
						data: {
							action: 'wpgmza_import_delete_schedule',
							wpgmaps_security: WPGMZA.import_security_nonce,
							schedule_id: $(this).attr('data-schedule-id')
						},
						success: function (data) {
							if (typeof data !== 'undefined' && data.hasOwnProperty('schedule_id')) {
								$('#import-schedule-list-item-' + data.schedule_id).remove();
								wpgmaps_import_add_notice('<p>' + scheduled_import_deleted + '</p>');
							}
						},
						error: function (data) {
							if (typeof data !== 'undefined') {
								wpgmaps_import_add_notice(data, 'error');
							}
						}
					});
				}
			});
		}
		window.wpgmaps_import_setup_schedule_links = wpgmaps_import_setup_schedule_links;

		wpgmaps_import_setup_schedule_links();
		
		$('#maps_export_select_all').click(function(){
			$('.maps_export').prop('checked',true);
		});
		$('#maps_export_select_none').click(function(){
			$('.maps_export').prop('checked',false);
		});
		$('#export-json').click(function(){
			var download_url = '?page=wp-google-maps-menu-advanced&action=export_json';
			var maps_check = $('.maps_export:checked');
			var map_ids = [];
			if (maps_check.length < 1){
				alert(WPGMZA.localized_strings.please_select_at_least_one_map_to_export);
				return;
			}
			maps_check.each(function(){
				map_ids.push($(this).val());
			});
			if (map_ids.length < $('.maps_export').length){
				download_url += '&maps=' + map_ids.join(',');
			}
			$('.map_data_export').each(function(){
				if ($(this).prop('checked')){
					download_url += '&' + $(this).attr('id').replace('_export', '');
				}
			});
			window.open(download_url + '&export_nonce=' + WPGMZA.export_security_nonce, '_blank');
		});
	});
	
})(jQuery);