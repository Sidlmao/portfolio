// Navbar scroll effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Typing animation
var typed = new Typed("#typed-text", {
  strings: [", a Developer", ", a Designer", ", an Innovator" , ", an Entrepreneur"],
  typeSpeed: 50,
  backSpeed: 70,
  loop: true
});





