(function() {
    function $(selector) {
        return document.querySelector(selector);
    }
    $('.input-con .btn').addEventListener('click', function() {
        var val = $('.input-con input').value;
        var $input = $('.input-con');
        var ch = /[\u4E00-\uFA29]|[\uE7C7-\uE7F3]/g;
        val = val.replace(/^\s+|\s+$/, '').replace(ch, '++');
        if(val) {
            if(/^[\w\W]{4,16}$/.test(val)) {
                $input.className = 'input-con ok';
            } else {
                $input.className = 'input-con error';
            }
        }else {
            $input.className = 'input-con empty';
        }
    });
})()