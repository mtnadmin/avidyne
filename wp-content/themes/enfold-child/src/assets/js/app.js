import $ from 'jquery';
import whatInput from 'what-input';
import slick from 'slick-carousel';

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
            nextArrow: '<i class="fa fa-chevron-right slick-next"></i>'
        });

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
                console.log(this.$php);
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
                        productAnchor.prepend(el.post_name.replace(/&amp;/g, '&'));
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
            }
        }
        var avidyne = new avidyneSupportFilters();
    });
})(jQuery);