(function() {
    function $(selector) {
        return document.querySelector(selector);
    }
    function $$(selector) {
        return document.querySelectorAll(selector);
    }

    //MAP构造函数
    function Map(opt) {
        this.dom = opt.dom;
        this.w = opt.col;
        this.h = opt.row;
        this.len = opt.len;
        this.render();   
    }
    Map.prototype = {
        render: function() {
            var html = '';
            this.dom.style.width = this.w * this.len + 'px';
            for(i=0, length=this.w*this.h; i<length; i++) {
                html += '<div style="width:'+ this.len +'px;height:'+ this.len +'px;" class="map-box"></div>';
            }
            this.dom.innerHTML = html;
        }
    }
    //BOX构造函数
    function Box(opt) {
        this.map = opt.map;
        this.w = opt.map.len;
        this.h = opt.map.len;
        this.direction = 0; // 0~3 - 上、右、下、左
        this.pos = opt.pos || [0, 0];
        this.init();
    }
    Box.prototype = {
        init: function(){
            var dom = document.createElement('div');
            dom.className = 'gobox';
            this.map.dom.appendChild(dom);
            this.dom = dom;
            this.flashBox();
        },
        runCom: function(str) {
            var _this = this;
            var map = _this.map;
            var dir = _this.direction;
            var pos = _this.pos;
            var x = pos[0];
            var y = pos[1];
            //trim
            str = str.replace(/(^\s*)|(\s*$)/, '').toUpperCase();
            //指令处理
            switch(str) {
                case 'GO': {
                    switch(dir) {
                        case 0: _this.pos = move(x, y-1);break;
                        case 1: _this.pos = move(x+1, y);break;
                        case 2: _this.pos = move(x, y+1);break;
                        case 3: _this.pos = move(x-1, y);break;
                    }
                    break;
                }
                case 'TUN LEF': {
                    _this.direction = (dir + 4 - 1) % 4;
                    break;
                }
                case 'TUN RIG': {
                    _this.direction = (dir + 1) % 4;
                    break;
                }
                case 'TUN BAC': {
                    _this.direction = (dir + 2) % 4;
                    break;
                }
            }
            this.flashBox();
            //防止溢出
            function move(x ,y) {
                if(x > map.w - 1) {
                    x--;
                } else if(x < 0) {
                    x++;
                }
                if(y > map.h - 1) {
                    y--;
                } else if(y < 0) {
                    y++;
                }
                return [x, y];
            }
        },
        //渲染box
        flashBox: function() {
            var offset = this.map.len;
            var x = this.pos[0];
            var y = this.pos[1];
            var dir = this.direction;
            var pos = this.pos;
            var dom = this.dom;
            dom.style.left = x*offset + 'px';
            dom.style.top = y*offset + 'px';
            dom.style.width = offset + 'px';
            dom.style.height = offset + 'px';
            dom.className = 'gobox d-' + dir;
        }
    }

    var map = new Map({
        dom: $('.box-map'),
        col: 8,
        row: 8,
        len: 60
    });
    var box = new Box({
        map: map,
        pos: [1, 3],
    });
    //监听输入框按钮
    $('.ctrl-input .btn').addEventListener('click', function(e) {
        e.preventDefault();
        var str = $('.ctrl-input input').value;
        box.runCom(str);
    });
    $('body').addEventListener('keydown', function(e) {
        console.log(e.keyCode);
        if(e.keyCode === 13) {
            var str = $('.ctrl-input input').value;
            box.runCom(str);
        }
    });
    //监听按钮
    $('.ctrl-btn').addEventListener('click', function(e) {
        e.preventDefault();
        var str = e.target.innerText;
        box.runCom(str);
    });
})();