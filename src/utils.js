function fixedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
        return '%' + c.charCodeAt(0).toString(16);
    });
}

function getUTCTimeStr(time) {
    return time.clone().subtract(8, 'hours').format('YYYYMMDDHH')+'00';
}

export { fixedEncodeURIComponent, getUTCTimeStr };

