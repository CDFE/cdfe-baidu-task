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
            
            var com, arr;
            //trim
            str = str.replace(/(^\s*)|(\s*$)/, '').toUpperCase();
            com = str.split(' ')[0];
            arg = str.split(' ')[1];
            //指令处理
            switch(com) {
                case 'GO': {
                    switch(dir) {
                        case 0: _this.boxMove('TOP');break;
                        case 1: _this.boxMove('RIG');break;
                        case 2: _this.boxMove('BOT');break;
                        case 3: _this.boxMove('LEF');break;
                    }
                    break;
                }
                case 'TUN': {
                    _this.boxTurn(arg);break;
                }
                case 'TRA': {
                    _this.boxMove(arg);break;
                }
                case 'MOV': {
                    _this.boxStaticTurn(arg);
                    _this.boxMove(arg);
                    break;
                }
            }
            this.flashBox();
            
        },
        boxStaticTurn: function(arg) {
            switch(arg) {
                case 'TOP': {
                    this.direction = 0;break;
                }
                case 'RIG': {
                    this.direction = 1;break;
                }
                case 'BOT': {
                    this.direction = 2;break;
                }
                case 'LEF': {
                    this.direction = 3;break;
                }
            }
        },
        boxTurn: function(arg) {
            var dir = this.direction;
            switch(arg) {
                case 'LEF': {
                    this.direction = (dir + 4 - 1) % 4;break;
                }
                case 'RIG': {
                    this.direction = (dir + 1) % 4;break;
                }
                case 'BAC': {
                    this.direction = (dir + 2) % 4;break;
                }
            }
        },
        boxMove: function(arg) {
            var _this = this;
            var pos = _this.pos;
            var x = pos[0];
            var y = pos[1];
            switch(arg) {
                case 'TOP': {
                    _this.pos = move(x, y-1);break;
                }
                case 'RIG': {
                    _this.pos = move(x+1, y);break;
                }
                case 'BOT': {
                    _this.pos = move(x, y+1);break;
                }
                case 'LEF': {
                    _this.pos = move(x-1, y);break;
                }
            }

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
        len: 50
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