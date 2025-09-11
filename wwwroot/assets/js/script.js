document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    function showSlide(n) {
        slides[currentSlide].classList.remove('active');
        currentSlide = (n + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Prev';
    prevButton.classList.add('prev');
    prevButton.addEventListener('click', prevSlide);

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.classList.add('next');
    nextButton.addEventListener('click', nextSlide);

    document.querySelector('.slider').appendChild(prevButton);
    document.querySelector('.slider').appendChild(nextButton);

    setInterval(nextSlide, 5000);
});

// Chat bot

 