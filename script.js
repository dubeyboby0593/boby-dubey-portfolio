const socialIcons = document.querySelector('.social-media-icons');
socialIcons.addEventListener('wheel', (event) => {
    if (event.deltaY !== 0) {
        event.preventDefault();
        socialIcons.scrollLeft += event.deltaY;
    }
});
