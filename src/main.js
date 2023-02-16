import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import jquery from "jquery/src/jquery.js";
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import moment from 'moment';

window.$ = jquery;
window.bootstrap = bootstrap;

import config from './config';
import { fixedEncodeURIComponent, getUTCTimeStr } from "./utils"

const currentHour = moment().hour();
let minusday = currentHour >= 15 ? 0 : 1;
let basehour = (currentHour >= 15 || currentHour <= 5) ? 8 : 20;

let basetime = moment().hour(basehour).subtract(minusday, 'days');
let validtime = basetime.clone().add(12, 'hours');


let productType = 'medium-uv-rh';
let level = '500';

async function getProduct() {

    //const openchartsApi = 'https://charts.ecmwf.int/opencharts-api/v1/export/';
    const openchartsApi = 'https://ecmwf-apps.tianqitu.net/opencharts-api/v1/export/';

    //const cors_api = 'https://icors.vercel.app/';

    const productConfig = config[productType];

    let fetch_body = {
        "package": "opencharts",
        "product": productType,
        "format": "png",
        "base_time": getUTCTimeStr(basetime),
        "valid_time": getUTCTimeStr(validtime),
        
    };

    if (productConfig.type) {

        if (productConfig.type === 'point-based') {
            fetch_body.epsgram = level;
            fetch_body.station_name = productConfig.name;
            fetch_body.lat = '34.6836';
            fetch_body.lon = '112.454';
        }else if(productConfig.type === 'point-based-profile'){
            fetch_body.station_name = productConfig.name;
            fetch_body.lat = '34.6836';
            fetch_body.lon = '112.454';
        }
    }else{
        fetch_body.level = level;
        fetch_body.projection = "opencharts_eastern_asia";
    }

    //var ajax_api = `${cors_api}?${fixedEncodeURIComponent(fetch_url)}`;

    let f = await fetch(openchartsApi, {
        "body": JSON.stringify(fetch_body),
        "method": "POST",
        "mode": "cors"
    });

    let result = await f.json();

    console.log(result)

    return result.url;
}

async function refresh() {
    $('#chart-spinner').show();
    //$('#result .chart').hide();

    $('#result .chart').attr('src', '#');
    let link = await getProduct();
    $('#result .chart').attr('src', link);
}

$('#result .chart').on('load', function () {
    $('#chart-spinner').hide();
    //$('#result .chart').show();
})

function update_levels() {
    const levels = config[productType].levels;

    const list = $('#levels');
    list.html('');

    let contain = false;

    levels.forEach(function (val) {

        let active_str = ` " `;
        if (val + '' === level) {
            contain = true;
            active_str = ` active" aria-current="true" `;
        }

        list.prepend(`<a href="#" data-level='${val}' class="list-group-item list-group-item-action ${active_str}>
            ${val}
          </a>`);

    })

    if (!contain) {
        list.find('a').eq(0).trigger('click');
    }
}

function update_validdates() {


    const list = $('#validdates');
    list.html('');

    for (let span = 0; span <= 168; span += 12) {
        let date = basetime.clone().add(span, 'hours');

        list.append(`<li class="page-item ${date.isSame(validtime) ? 'active' : ''}" aria-current="page">
            <a class="page-link" href="#" data-utc='${getUTCTimeStr(date)}'  data-local='${+date}'><span class="fs-4">${date.date()}</span><span class="fs-6">${date.format("HH")}</span></a>
          </li>`)

    }
}

update_validdates();

$('#validdates').on('click', '.page-link', function () {
    const time = $(this).data('local');
    validtime = moment(time);

    update_validdates();

    refresh();
})

$('#levels').on('click', 'a', function () {
    level = $(this).data('level') + '';
    update_levels();

    refresh();
})

$('#select-products').on('change', function () {
    productType = $(this).val();
    update_levels();

    const productConfig = config[productType];
    if (productConfig.type && productConfig.type === 'point-based') {
        $('#validdates').html('');
    } else {
        update_validdates();
    }

    refresh();
});

//refresh();

function set_basetime() {
    $('#basetime').val('起始场 ' + basetime.format('YYYY-MM-DD HH') + ' 北京时');
    $('#select-products').trigger('change');
}

$('#prevtime').on('click', function () {
    basetime.subtract(12, 'hours');
    set_basetime();
})

$('#nexttime').on('click', function () {
    basetime.add(12, 'hours');
    set_basetime();
})

set_basetime();
