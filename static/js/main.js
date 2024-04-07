const slides = document.querySelectorAll('.gsap-slide');
let currentSlide = 0;
const slideWidth = slides[0].offsetWidth;
const totalSlides = slides.length;

function slideTo(index) {
    gsap.to('.gsap-wrapper', {
        scrollLeft: slideWidth * index,
        duration: 1,
        ease: 'power1.inOut'
    });
    currentSlide = index;
}

window.addEventListener('load', function() {
    const loader = document.querySelector('.loader');
    loader.className += ' hidden';
});