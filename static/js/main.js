// Selecteer alle elementen met de klasse 'gsap-slide'
const slides = document.querySelectorAll('.gsap-slide');

// Stel de huidige slide in op 0 (eerste slide)
let currentSlide = 0;

// Bepaal de breedte van een slide
const slideWidth = slides[0].offsetWidth;

// Bepaal het totale aantal slides
const totalSlides = slides.length;

// Functie om naar een specifieke slide te gaan
function slideTo(index) {
    // Gebruik de GSAP library om te animeren naar de gewenste slide
    gsap.to('.gsap-wrapper', {
        // De horizontale scrollpositie wordt bepaald door de breedte van een slide te vermenigvuldigen met de index van de gewenste slide
        scrollLeft: slideWidth * index,
        // De duur van de animatie is 1 seconde
        duration: 1,
        // De animatie versnelt in het begin en vertraagt aan het einde
        ease: 'power1.inOut'
    });
    // Update de huidige slide naar de index van de slide waar we naartoe geanimeerd hebben
    currentSlide = index;
}

window.addEventListener('load', function() {
    const loader = document.querySelector('.loader');
    loader.className += ' hidden';
});