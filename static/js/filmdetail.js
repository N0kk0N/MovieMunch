
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
  

// const dropDownButton = document.querySelector('.filmdetail-recepten-button')
// const menu = document.querySelector('.menu')

// button.addEventListener('click', () => {
//     menu.classList.toggle('activated');

// });

const dropDownButtons = document.querySelector('.filmdetail-dropdown-button')


const menuButtonsArray = Array.from(menuButtons);

menuButtonsArray.forEach(button => {

    button.addEventListener('click', () => {
       closeAnotherButtons(button);       
       button.classList.toggle('activated');       
              
    });
}); 

