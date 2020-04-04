import '@utils/common.scss';
import '@assets/iconfont/iconfont.css';
import './index.scss';
import $ from 'jquery';
import bg from '@images/webpack.svg';
import data from '@assets/data.json';

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
