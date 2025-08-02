$(function() {
"use strict";
	function Isotope_filter()  {
	/* ----- filter Start  ------ */
		var $container = $('.isotope').isotope({
			itemSelector: '.grid-item ,.blog-item',
			getSortData: {
			}
		});
	/* ----- filter End  ------ */
		$('.portfolio-filter li a').on("click", function() {
			$(this).parent().addClass('active').siblings().removeClass('active');
			var filterValue = $(this).attr('data-filter');
			// use filterFn if matches value
			$container.isotope({
			filter: filterValue
			});
		});
	}
	
	function scrollfix () {
		var scroll = $(window).scrollTop();
		if (scroll >0) {
			$("#home #header").css({"background":"rgba(0,0,0,0.9)","padding":"5px 0"});
		}
		else
		{
			 $("#home #header").css({"background":"rgba(0,0,0,0)","padding":"20px 0"});
		}
	}
	function bannerheight () {
		var bannerheight = $(".banner").height();
		$(".banner-detail").css('top', Math.round(bannerheight/2)+'px');
		var full_onescreen_banner_height = $("#container").height();
		$(".banner-detail").css('top', Math.round(full_onescreen_banner_height/3)+'px');
	}
	function re_size () {
		if ($( window ).width() <= 991) {
                        $('.nav li').on('click', function () {
                        $('#menu ul').css({"display":"none"});
                        });
	
			/* ------------bannre button margin ------------- */
			$('.cd-intro').children('button').removeClass('mt_30').addClass('mt_20');
		}
		if ($(window).width() > 991) {
			/* ------------bannre button margin ------------- */
			 $('.cd-intro').children('button').addClass('mt_30').removeClass('mt_20');
		}
	}
	
	function owl_carousel () {
	/* ------------ OWL Slider Start  ------------- */
		/* ----- client slider Start  ------ */
		$('.client').owlCarousel({
			loop:true,
			autoplay:true,
			responsiveClass:true,
			items : 1, //10 items above 1000px browser width
			responsive:{
				0:{
					items:1,
					nav:false
				},
				600:{
					items:1,
					nav:true
				},
				1000:{
					items:1,
					nav:true,
					loop:true
				}
			}
		})
		/* ----- client slider End  ------ */
	
		/* ----- blog post Start  ------ */
		$('#blog-post').owlCarousel({
			loop:false,
			autoplay:false,
			responsiveClass:true,
			items : 3, //10 items above 1000px browser width
			responsive:{
				0:{
					items:1,
					nav:false
				},
				600:{
					items:2,
					nav:false
				},
				1000:{
					items:3,
					nav:true,
					loop:true
				}
			}
		})
		/* ----- blog post End  ------ */
	
		/* ----- team Start  ------ */
		$('.team3col').owlCarousel({
			autoplay:false,
			responsiveClass:true,
			items : 3, //10 items above 1000px browser width
			responsive:{
				0:{
					items:1,
					nav:false
				},
				600:{
					items:2,
					nav:true
				},
				1000:{
					items:3,
					nav:true,
				}
			}
	
		})
	
		/* ----- team End  ------ */
	/* ------------ OWL Slider End  ------------- */
	}
	function colorswitcher (){
		$(".style1" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style1.css" );
			return false;
		});
		$(".style2" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style2.css" );
			return false;
		});
		$(".style3" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style3.css" );
			return false;
		});
		$(".style4" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style4.css" );
			return false;
		});
		$(".style5" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style5.css" );
			return false;
		});
		$(".style6" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style6.css" );
			return false;
		});
		$(".style7" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style7.css" );
			return false;
		});
		$(".style8" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style8.css" );
			return false;
		});
		$(".style9" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style9.css" );
			return false;
		});
		$(".style10" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style10.css" );
			return false;
		});
		$(".style11" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style11.css" );
			return false;
		});
		$(".style12" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style12.css" );
			return false;
		});
		$(".style13" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style13.css" );
			return false;
		});
		$(".style14" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style14.css" );
			return false;
		});
		$(".style15" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style15.css" );
			return false;
		});
		$(".style16" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style16.css" );
			return false;
		});
		$(".style17" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style17.css" );
			return false;
		});
		$(".style18" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style18.css" );
			return false;
		});
		$(".style19" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style19.css" );
			return false;
		});
		$(".style20" ).on("click", function(){
			$("#colors" ).attr("href", "css/color/style20.css" );
			return false;
		});
		// Style Switcher
		$('#colors-switcher').animate({
			left: '-160px'
		});
	
		$('#colors-switcher h2 a').on("click", function(e){
			e.preventDefault();
			var div = $('#colors-switcher');
			console.log(div.css('left'));
			if (div.css('left') === '-160px') {
				$('#colors-switcher').animate({
					left: '0px'
				});
			} else {
				$('#colors-switcher').animate({
					left: '-160px'
				});
			}
		});
	
		$('.colors li a').on("click", function(e){
			e.preventDefault();
			$(this).parent().parent().find('a').removeClass('active');
			$(this).addClass('active');
		});
	}
	function parallax (){
		var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
		if(!isMobile) {
			if($(".parallax").length){  $(".parallax").sitManParallex({  invert: false });};
		}else{
			$(".parallax").sitManParallex({  invert: true });
	
		}
	}
	function wowanimations (){
		var wow = new WOW()
		wow = new WOW(
			{
			boxClass:     'wow',      // default
			animateClass: 'animated', // default
			offset:       0,          // default
			mobile:       true,       // default
			live:         true        // default
			}
		)
		wow.init();
	}
	function menu_scroll (){
	  // Add scrollspy to <body>
	  $('body').scrollspy({ target: '#menu' })
	  $("#menu ul li a[href^='#'], .home-arrow-down a").on('click', function(e) {
	   // prevent default anchor click behavior
	   e.preventDefault();
	   // store hash
	   var hash = this.hash;
	   // animate
	   $('html, body').animate({
		   scrollTop: $(hash).offset().top
		 }, 600, function(){
		   // when done, add hash to url
		   // (default click behaviour)
		   window.location.hash = hash;
		 });
	  });
	}
	
	/* ===== Right Click Disable   =====   */
	//document.oncontextmenu = document.body.oncontextmenu = function() {return false;}
	
	$( window ).on("load", function() {
		$(".loder").fadeOut("slow");
		bannerheight ();
		Isotope_filter();
	});
	$( window ).ready(function() {
		$('[data-toggle="tooltip"]').tooltip();
		scrollfix ();
		menu_scroll ();
		owl_carousel ();
		bannerheight ();
		re_size();
		colorswitcher ();
		parallax ();
		wowanimations ();
		Isotope_filter();
	});
	$( window ).on("resize", function() {
		re_size();
		bannerheight ();
	});

	$(window).on("scroll", function() {
		scrollfix ();
	});

});
