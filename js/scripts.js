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
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 3,
          centerMode: false
        }
      },
      {

        breakpoint: 425,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          centerMode: false
        }
      }
    ]
  });

  document.getElementsByClassName('blog-content').forEach((ele) => {
    if ((ele.scrollHeight > ele.clientHeight) || (ele.scrollWidth > ele.clientWidth))
      ele.classList.add("show-more");
  });
  document.getElementsByClassName('review-content').forEach((ele) => {
    if ((ele.scrollHeight > ele.clientHeight) || (ele.scrollWidth > ele.clientWidth))
      ele.classList.add("show-more");
  });

});
