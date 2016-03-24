(function() {
    function $(selector) {
        return document.querySelector(selector);
    }
    function $$(selector) {
        return document.querySelectorAll(selector);
    }
    function creEle(tag) {
        return document.createElement(tag);
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
            var dom = creEle('div');
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
            if(!str) {
                return false;
            }
            //trim
            str = str.replace(/(^\s*)|(\s*$)/, '').toUpperCase();
            com = str.split(' ')[0];
            arg = str.split(' ')[1];
            arg2 = str.split(' ')[2];
            //指令处理
            switch(com) {
                case 'GO': {
                    switch(dir) {
                        case 0: _this.boxMove('TOP', arg);break;
                        case 1: _this.boxMove('RIG', arg);break;
                        case 2: _this.boxMove('BOT', arg);break;
                        case 3: _this.boxMove('LEF', arg);break;
                    }
                    break;
                }
                case 'TUN': {
                    _this.boxTurn(arg);break;
                }
                case 'TRA': {
                    _this.boxMove(arg, arg2);break;
                }
                case 'MOV': {
                    _this.boxStaticTurn(arg);
                    _this.boxMove(arg, arg2);
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
        boxMove: function(arg, arg2) {
            var _this = this;
            var pos = _this.pos;
            var x = pos[0];
            var y = pos[1];
            var offset = 1;
            if(arg2 > 1) {
                offset = parseInt(arg2);
            }
            switch(arg) {
                case 'TOP': {
                    _this.pos = move(x, y-offset);break;
                }
                case 'RIG': {
                    _this.pos = move(x+offset, y);break;
                }
                case 'BOT': {
                    _this.pos = move(x, y+offset);break;
                }
                case 'LEF': {
                    _this.pos = move(x-offset, y);break;
                }
            }

            //防止溢出
            function move(x ,y) {
                if(x > map.w - 1) {
                    x = map.w - 1;
                } else if(x < 0) {
                    x = 0;
                }
                if(y > map.h - 1) {
                    y = map.h - 1;
                } else if(y < 0) {
                    y = 0;
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
    //textarea构造函数
    function Myarea(opt) {
        this.dom = opt.dom;
        this.box = opt.box;
        this.list = []
        this.flag = '';
        this.init();
    }
    Myarea.prototype = {
        init: function() {
            this.renderUI();
            this.bindUI();
        },
        renderUI: function() {
            var textarea = creEle('textarea');
            var side = creEle('ul');
            textarea.className = 'text-area';
            side.className = 'left-index';
            this.area = textarea;
            this.side = side;
            this.dom.appendChild(side);
            this.dom.appendChild(textarea);
        },
        bindUI: function() {
            var _this = this;
            this.area.addEventListener('input', function() {
                _this.flag = setTimeout(function() {
                    clearTimeout(_this.flag);
                    _this.flashArea();
                }, 300);
            });
            this.area.addEventListener('scroll', function() {
                _this.sideScroll();
            });
        },
        runList: function() {
            var _this = this;
            _this.area.scrollTop = 0;
            _this.sideScroll();
            runNext(0);
            function runNext(num) {
                setTimeout(function() {
                    if($('#curr')) {
                        $('#curr').id = '';
                    }
                    var $curr = _this.side.childNodes[num]
                    $curr.id = 'curr';
                    if($curr.offsetTop-_this.side.scrollTop>(parseInt(_this.side.offsetTop +_this.side.offsetHeight)-22)) {
                        _this.area.scrollTop += 22;
                        _this.sideScroll();
                    }
                    _this.box.runCom(_this.list[num]);
                    if(_this.list[num + 1]) {
                        runNext(num + 1);
                    }else {
                        return false;
                    }
                }, 600);
            }
        },
        clear: function() {
            this.area.value = '';
            this.flashArea();
        },
        flashArea: function() {
            var str = this.area.value;
            var html = '';
            var cls = '';
            if(str) {
                this.list = str.split('\n');
            } else {
                this.list = [];
            }
            for(var i in this.list) {
                if(!this.checkCom(this.list[i])) {
                    cls = 'error'
                }else {
                    cls = '';
                }
                var index = parseInt(i) + 1;
                html += '<li class='+ cls +'>' + index + '</li>';
            }
            this.side.innerHTML = html;
        },
        sideScroll: function() {
            var top = this.area.scrollTop;
            this.side.scrollTop = top;
        },
        checkCom: function(str) {
            str = str.replace(/(^\s*)|(\s*$)/, '').toUpperCase();
            return /^(GO|TUN|TRA|MOV)(\s\S)*/.test(str);
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
    window.myarea = new Myarea({
        dom: $('.my-area'),
        box: box,
    });

    //监听输入框按钮
    $('.ctrl-input .run').addEventListener('click', function(e) {
        e.preventDefault();
        myarea.runList();
    });
    //refresh按钮
    $('.ctrl-input .refresh').addEventListener('click', function(e) {
        e.preventDefault();
        myarea.clear();
    });
    //用于辅助输入的按钮
    $('.ctrl-btn').addEventListener('click', function(e) {
        if(e.target.className !== 'btn') {
            return false;
        }
        e.preventDefault();
        var str = e.target.innerText;
        var val = myarea.area.value;
        if((val.slice(-1)!=='')&&(val.slice(-1)!== '\n')){
            myarea.area.value += '\n';
        }
        myarea.area.value += str;
        myarea.flashArea();
    });
})();