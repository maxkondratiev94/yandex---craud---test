import Slider from "./slider.js";

const playersSlider = new Slider(
    document.getElementById('slider1'),
    {
        slideCount: 1,
        autoPlay: true,
        loop: true,
        autoPlayInterval: 4000,
        showIndicators: false,
    }
);
playersSlider.init();

const stagesSlider = new Slider(
    document.getElementById('slider2'),
    {
        slideCount: 1,
        autoPlay: false,
        loop: false,
        autoPlayInterval: null,
        showIndicators: true
    }
)
stagesSlider.init();