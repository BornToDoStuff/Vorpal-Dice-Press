$(window).on("load",function() {
  $("body").removeClass("preload");
});

$(document).ready(function(){
  $('.slider').slick({
    dots: false,
    infinite: true,
    speed: 250,
    cssEase: 'ease-out',
    variableWidth: true,
    touchMove: true,
    swipeToSlide: true,
    draggable: true,
    initialSlide: -1,
    mobileFirst: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 3,
        }
      },
      {
        breakpoint: 600,
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
});
