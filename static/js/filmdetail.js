const swiper = new Swiper('.filmdetail-swiper', {

    direction: 'horizontal',
    loop: true,
    spaceBetween: 15,
    pagination: {
    el: '.swiper-pagination',
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    scrollbar: {
      el: '.swiper-scrollbar',
    },

  });


const selectBtn = document.querySelector('.filmdetail-recipe-button')
const selectMenu = document.querySelector('.filmdetail-recipe1')
const selectBtn2 = document.querySelector('.filmdetail-recipe-button2')
const selectMenu2 = document.querySelector('.filmdetail-recipe2')

selectBtn.addEventListener('click', () => {
    selectMenu.classList.toggle('filmdetail-active')
    closeAllMenus(selectMenu)
})
selectBtn2.addEventListener('click', () => {
    selectMenu2.classList.toggle('filmdetail-active')
    closeAllMenus(selectMenu2)
})

const closeAllMenus = (currentMenu) => {
    const allMenus = document.querySelectorAll('.filmdetail-recipe-lists')
    allMenus.forEach( menu => {
        if (menu !== currentMenu) {
            menu.classList.add('filmdetail-active')
        }
    })
}

document.addEventListener("DOMContentLoaded", (event) => {
  var circle = document.querySelector('.filmdetail-cursor');

  const moveCircle = (e) => {
     gsap.to(circle, 0.4, {
         css: {
              left: e.pageX,
              top: e.pageY
        }
     });
    }

    (window).addEventListener('mousemove', moveCircle);
});  

const observer =  new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    console.log(entry)
    if (entry.isIntersecting) {
      entry.target.classList.add('filmdetail-show')
    } else {
      entry.target.classList.remove('filmdetail-show')
    }
  })
})
const hiddenElements = document.querySelectorAll('.filmdetail-hidden')
hiddenElements.forEach((el) => observer.observe(el))

