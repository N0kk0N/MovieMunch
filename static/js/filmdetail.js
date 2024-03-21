// import Swiper from 'swiper'
// import { Navigation, Pagination } from 'swiper/modules'

// import 'swiper/css'
// import 'swiper/css/navigation'
// import 'swiper/css/pagination'

 const swiper = new Swiper ('.swiper',  {
    modules: [Navigation, Pagination],

    direction: 'horizontal',
    loop: 'true',

    pagination: {
        el:  '.swiper-pagination',
    },
    
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
    },

    scrollbar: {
        el: '.swiper-scrollbar',
      },
}) 
