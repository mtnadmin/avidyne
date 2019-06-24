import $ from 'jquery';
import whatInput from 'what-input';
import slick from 'slick-carousel';
import magnificPopup from 'magnific-popup';

window.$ = $;

import Foundation from 'foundation-sites';
//import './lib/foundation-explicit-pieces';

$(document).foundation();

(($) => {
    $(() => {

        console.log('All setup!');
        let productThumbs = $('#product-gallery'),
            productFeatured = $('#product-featured'),
            homeTestimonials = $('#home-testimonials #testimonials'),
            relatedProducts = $('#related-products');

        // Product gallery
        productThumbs.slick({
            centerMode: true,
            centerPadding: '20px',
            slidesToShow: 3,
            slidesToScroll: 1,
            speed: 800,
            asNavFor: '#product-featured',
            focusOnSelect: true,
            arrows: true,
            prevArrow: '<i class="fa fa-angle-left slick-prev"></i>',
            nextArrow: '<i class="fa fa-angle-right slick-next"></i>'
        });

        // Product featured
        productFeatured.slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            fade: true,
            asNavFor: '#product-gallery'
        });

        // Home testimonials carousel
        homeTestimonials.slick({
            centerMode: true,
            slidesToShow: 1,
            speed: 1500,
            dots: false,
            fade: true,
            prevArrow: '<i class="fa fa-chevron-left slick-prev"></i>',
            nextArrow: '<i class="fa fa-chevron-right slick-next"></i>'
        });

        // Product page related products
        relatedProducts.slick({
            arrows: true,
            centerMode: false,
            slidesToShow: 5,
            speed: 750,
            dots: true,
            fade: false,
            prevArrow: '<i class="fa fa-chevron-left slick-prev"></i>',
            nextArrow: '<i class="fa fa-chevron-right slick-next"></i>',
            responsive: [
                {
                  breakpoint: 1200,
                  settings: {
                    slidesToShow: 5,
                    slidesToScroll: 5,
                    infinite: true,
                    dots: true
                  }
                },
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: true,
                    dots: true
                  }
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                  }
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                  }
                }
              ]

        });

        var relatedProductsItems = relatedProducts.find('.slick-slide'),
            relatedProductsItemsImage = $('.slick-slide img');
        relatedProductsItemsImage.on({
            mouseover: function() {
                var li = $(this).parent();
                li.find('.product-title').dequeue().show();
            },
            mouseout: function() {
                var li = $(this).parent();
                li.find('.product-title').dequeue().hide();
            }
        });

        setTimeout(function() {
            var isotope_item = $('.isotope-item');
            $.each(isotope_item, function(i,elem) {
                var anchor = $(elem).attr('href');
                if ( undefined !== anchor ) {
                    if ( anchor.includes('download') ) {
                        $(elem).css('display','none');
                    }
                }
            });
        }, 2000);

        var home_slider = $('.home #layer_slider_1'),
            goToBtn = '<div id="jump" data-smooth-scroll data-animation-easing="swing" data-offset="69"><a href="#to-content"><i class="fa fa-chevron-down"></i></a></div><div id="to-content"></div>';

            home_slider.append(goToBtn);
    });
})(jQuery);

(($, php) => {
    $(() => {
        "use strict";
        var avidyneMegaMenus = function(data) {
            this.$php = data;
            this.init();
        };
        avidyneMegaMenus.prototype = {
            init: function() {
                this.getData();
                this.setVars();
                this.removeCurrentLi();
                this.setupUpdatedLi();
            },
            getData: function() {
                // console.log(this.$php);
            },
            setVars: function() {
                this.termsMegaMenu = $('.terms-mega-menu');
                this.termsMegaMenuUl = $('.terms-mega-menu ul');
                this.productsMegaMenu = $('.products-mega-menu');
            },
            setupUpdatedLi: function() {
                var baseUrl = this.$php.site_url,
                    termsUlContainer = this.termsMegaMenuUl[0],
                    productsUlContainer = this.productsMegaMenu;
                $.each(this.$php.product_items, function(i,el) {

                    // Create new list items and insert anchor tags
                    var termLi = document.createElement('li'),
                        termAnchor = document.createElement('a'),
                        productUl = document.createElement('ul');

                    // Setup and insert parent terms
                    termLi.setAttribute('id',el.slug);
                    termAnchor.innerHTML = '<span class="avia-bullet"></span>';
                    termAnchor.prepend(el.name.replace(/&amp;/g, '&'));
                    termAnchor.setAttribute('href', baseUrl + '/product_categories/' + el.slug + '/');
                    termLi.append(termAnchor);
                    termsUlContainer.append(termLi);

                    // Setup and insert products
                    productUl.setAttribute('id','products-' + el.slug);
                    productUl.setAttribute('class','sub-menu avidyne-mega-hover');
                    productUl.setAttribute('style','display:none;');
                    $.each(el.products, function(i, el) {
                        var productLi = document.createElement('li'),
                            productAnchor = document.createElement('a');
                        productAnchor.innerHTML = '<span class="avia-bullet"></span>';
                        productAnchor.prepend(el.post_title.replace(/&amp;/g, '&'));
                        // console.log(el);
                        productAnchor.setAttribute('href', baseUrl + '/product/' + el.post_name + '/');
                        productLi.append(productAnchor);
                        productUl.append(productLi);
                    });
                    productsUlContainer.append(productUl);
                });
                this.addListeners();
                this.setActiveOnLoad();
            },
            removeCurrentLi: function() {
                var termsUlContainer = this.termsMegaMenuUl[0];
                while (termsUlContainer.firstChild) {
                    termsUlContainer.removeChild(termsUlContainer.firstChild);
                }
            },
            addListeners: function() {
                var element = this.termsMegaMenuUl[0],
                    productsUlContainer = this.productsMegaMenu,
                    elements = $(element).find('li');
                elements.each(function(i,el) {
                    var termAnchor = $(el),
                        termId = $(el).attr('id'),
                        term = '#' + termId;
                    termAnchor.on('mouseover', function() {
                        var associatedProducts = $( '#products-' + $(this)[0].id );
                        productsUlContainer.find('ul').not(associatedProducts).hide();
                        associatedProducts.show();
                    });
                });
            },
            setActiveOnLoad: function() {
                var current = $('.terms-mega-menu ul'),
                    items = $(current)[0].childNodes;
                setTimeout(function() {
                    $.each(items, function(i,e) {
                       if ( 'current-menu-item' == $(this)[0].className ) {
                           console.log('There seems to be one!');
                           $('#products-' + $(this)[0].id).css('display','block');
                       }
                    });
                }, 500);
            }

        }
        var avidyne = new avidyneMegaMenus(php);
    });
})(jQuery, php_vars);


(($) => {
    $(() => {
        var avidyneSupportFilters = function(data) {
            this.init();
        };
        avidyneSupportFilters.prototype = {
            init: function() {
                this.getElements();
                this.addFilterEvents();
                this.addTabEvents();
            },
            getElements: function() {
                this.filterWrapperDivs = $('.filter-wrapper div');
                this.allFilter = $('#filter-all');
                this.currentFilter = $('#filter-current');
                this.legacyFilter = $('#filter-current');
                this.current = $('.support-document.current');
                this.legacy = $('.support-document.legacy');
            },
            addFilterEvents: function() {
                this.filterWrapperDivs.on('click', function() {
                    var filter = this.id.split('-').pop(),
                        tabsSection = $('.av_tab_section');

                    $('.filter-wrapper div').removeClass('active-filter')
                    $('#' + this.id).addClass('active-filter');
                    tabsSection.find('.togglecontainer').not('.togglecontainer.' + filter).hide();
                    tabsSection.find('.togglecontainer.' + filter).show();
                });
            },
            addTabEvents: function() {
                setTimeout(function() {
                    var downloads_tab = $('.page-template-page-product-documentation .template-page.content .tab_titles .tab'),
                        product_downloads_heading = $('#product-download-heading'),
                        type_downloads_heading = $('#type-download-heading');

                    downloads_tab.on('click', function() {
                        var active_tab = $(this).attr('data-fake-id');
                        if (active_tab === '#tab-id-1') {
                            product_downloads_heading.show();
                            type_downloads_heading.hide();
                        } else {
                            product_downloads_heading.hide();
                            type_downloads_heading.show();
                        }
                    });
                }, 1000);
            },
            addDocumentEvents: function() {
                setTimeout(function() {
                    var currentDoc = $('.support-document.current'),
                        legacyDoc = $('.support-document.legacy'),
                        allDocs = $('#type-download-heading'),
                        allFilter = $('#filter-all'),
                        currentFilter = $('#filter-current'),
                        legacyFilter = $('#filter-legacy');

                    allFilter.on('click', function() {
                        legacyDoc.show();
                        currentDoc.show();
                    });

                    currentFilter.on('click', function() {
                        legacyDoc.hide();
                        currentDoc.show();
                    });

                    legacyFilter.on('click', function() {
                        legacyDoc.show();
                        currentDoc.hide();
                    });
                }, 1000);
            }
        }
        var avidyne = new avidyneSupportFilters();
    });
})(jQuery);

(function($) {
    $(function() {
        var width = $(window).width(),
            height = $(window).height(),
            map = $('#wpgmza_map_1'),
            slideOut = $('#slide-out-form'),
            slideOutTrigger = $('#slide-out-form .slide-out-trigger'),
            slideOutClose = $('#slide-out-form .fa-times-circle, .slide-out .close-form'),
            requestInfo = $('a.request-info'),
            slideOutClose2 = $('.slide-out .close-form');

        if ( map.length ) {
            map.width(width);
            map.height(height);
        }

        slideOutTrigger.on('click', function() {
            slideOut.find('.slide-out').css('right','0');
            slideOutClose2.css('left',-50);
        });

        slideOutClose.on('click', function() {
            slideOut.find('.slide-out').css('right',-300);
            slideOutClose2.css('left',350);
        });

        requestInfo.click(function(e) {
            e.preventDefault();
            slideOutTrigger.trigger('click');
        });

        $('.portrait-ipad').on({
            mouseout: function() {
                $('.landscape-ipad').removeClass('active').stop().dequeue().fadeOut(0);
                $(this).stop().dequeue().fadeIn(0);
            }
        });

        $('.portrait-ipad').on('hover', function() {
            $(this).stop().dequeue().fadeOut(0);
            $('.landscape-ipad').addClass('active').stop().dequeue().fadeIn(0);
        });

        $('.wpgmza_sl_search_button').on('click', function() {
            if ( !$('.dealer-locator-reset').length ) {
                $('.wpgmza-modern-store-locator').after('<div class="dealer-locator-reset"><i class="fa fa-times-circle"><span>Reset Search</span></i></div>');
            }
            $('.wpgmza-modern-store-locator').fadeOut(500);
            $('.dealer-locator-reset').fadeIn(500);

            $('.dealer-locator-reset').on('click', function() {
                $('.wpgmza-modern-store-locator').fadeIn(500);
                $('.dealer-locator-reset').fadeOut(500);
                $('.wpgmza_sl_reset_button_div').trigger('click');
                $('#addressInput_1').val('');
            });
        });
        $('.wpgmza_checkbox').trigger('click');
    });
})(jQuery);

// Filtering for product documentation and media assets
(function($) {
    $(function() {
        var mediaLibraryFilters = $('.page-template-page-media-library div[id*="filter-"]');
        $('.page-template-page-media-library div[id*="filter-"], .page-template-page-product-documentation div[id*="filter-"]').on('click', function() {
            var filter = this.id,
                filterArray = filter.split('-'),
                filterId = filterArray[1];
            if ('panel' === filterId) {
                filterId = filterArray[1] + '-' + filterArray[2];
            }
            var filterClass = $('.' + filterId);
            if ( 'all' == filterId ) {
                $('.support-document').show();
            } else {
                $('.support-document').not(filterClass).hide();
                filterClass.show();
            }
        });
    });
})(jQuery);

(function($) {
    $(function() {
        var form = $('.slide-out button');
        $('button.sales').addClass('selected');
        form.on({
             change: function(e) {
                 form.removeClass('selected');
                 $(this).addClass('selected');
             }
         });
        form.bind({
            click: function(e) {
                e.preventDefault();
                var department = $(this).text().replace(' ', '-').toLowerCase();
                if ( department == 'general-inquiry' ) { // General
                    $('.general-inquiry-form').trigger('click');
                    $('#general-inquiry').fadeIn(1000);
                } else if ( department == 'customer-support' ) { // Support
                    console.log('CLICKED');
                    $('#customer-support a').trigger('click');
                     window.open($('#customer-support a').attr("href"), this.target);
                } else { // Sales
                    $('.sales-form').trigger('click');
                    $('#sales').fadeIn(1000);
                }
                // Close slideout form
                $(this).closest('.slide-out').css('right',-300);
                $(this).closest('.close-form').css('left',-50);
            }
        });
        $('.sales-form, .general-inquiry-form').magnificPopup({
            type:'inline',
            midClick: true
        });
        $('#menu-item-25').on({
            click: function(e) {
                e.preventDefault();
                $('.slide-out-trigger').trigger('click');
            }
        });
    });
})(jQuery);