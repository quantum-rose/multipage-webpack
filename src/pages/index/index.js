import '@utils/common.scss';
import '@assets/iconfont/iconfont.css';
import 'swiper/css/swiper.css';
import './index.scss';
import $ from 'jquery';
import Swiper from 'swiper';
import bg from '@images/webpack.svg';
import data from '@assets/data.json';

/* eslint-disable no-new */
new Swiper('.swiper-container', {
    loop: true, // 循环模式选项

    // 如果需要分页器
    pagination: {
        el: '.swiper-pagination',
    },

    // 如果需要前进后退按钮
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

    // 如果需要滚动条
    scrollbar: {
        el: '.swiper-scrollbar',
    },
});

console.log($);
console.log(bg);
console.log(data);

const jsBackgroundImage = document.querySelector('.js-background-image');
jsBackgroundImage.style.backgroundImage = `url(${bg})`;

$.ajax({
    type: 'get',
    url: `${process.env.BASE_URL}city.json`, // 一般情况下静态资源地址和接口地址是不一样的，此 baseUrl 非彼 baseUrl
    dataType: 'json',
    success(response) {
        console.log(response);
    },
});
