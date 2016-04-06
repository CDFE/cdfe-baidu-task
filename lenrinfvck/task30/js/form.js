(function() {
    'use strict';
    //公用方法
    function $(selector) {
        return document.querySelector(selector);
    }
    function $$(selector) {
        return document.querySelectorAll(selector);
    }
    function trim(str) {
        return str.replace(/^\s+|\s+$/, '');
    };
    function isEmpty(obj) {
        if (obj == null) return true;
        for (var key in obj) {
            if(hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    };
    //剔除对象的某些属性
    function unpick(obj, arr) {
        var res = {};
        for(var i in obj) {
            if(arr.indexOf(i) < 0) {
                res[i] = obj[i];
            }
        }
        return res;
    }

    /**
      * 配置属性
      * mainForm: string, 表单对象的CSS选择器
      * formList: { #验证策略
      *     name: string, 空间的name属性
      *     require: boolean, 必填
      *     max/min: number, 输入长度 
      *     equal: string, 检测和该name属性对应的表单的值是否相同 
      *     reg: string, 自定义正则
      * },
      * checkEvent: string, 当控件触发该事件时自动校验
      * handler: { #配置回调事件
      *     'eventName': fn(item, ctrl) #触发事件的控件的DOM， 整个表单对象
      * }
    **/
    var config = {
        mainForm: '.maincon',
        formList: [
        {
            name: 'name',
            require: true,
            max: 16,
            min: 4
        },{
            name: 'pass',
            require: true,
        },{
            name: 'pass2',
            require: true,
            equal: 'pass',
        },{
            name: 'email',
            reg: '^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*'
        },{
            name: 'tel',
            reg: '^1[3458][0-9]\\d{8}$'
        },
        ],
        checkEvent: 'blur',
        handler: {
            focus: function(item, ctrl) {
                var target = item.parentNode.querySelector('.msg');
                if(ctrl.dom.querySelector('.msg.normal')) {
                    ctrl.dom.querySelector('.msg.normal').className = 'msg';
                }
                if(/ok|normal|error|empty/.test(target.className)) {
                    return false;
                }else {
                    target.className = 'msg normal';
                }
            }
        }
    };

    //校验依赖数据与方法
    var ch = /[\u4E00-\uFA29]|[\uE7C7-\uE7F3]/g;
    var checkFn = {
        require : function(val) {
            if(!trim(val)) {
                return 'empty';
            }
            return false;
        },
        equal: function(val, name) {
            return val === $('[name='+name+']').value;
        },
        min: function(val, len) {
            val = trim(val).replace(ch, '++');
            return val.length >= len;
        },
        max: function(val, len) {
            val = trim(val).replace(ch, '++');
            return val.length <= len;
        },
        reg: function(val, regStr) {
            return (new RegExp(regStr)).test(val);
        }
    };

    //主表单对象，传入以上config初始化
    function FormCtrl(opt) {
        this.dom = $(opt.mainForm);
        this.formList = opt.formList;
        this.itemList = [];
        this.checkFn = checkFn;
        this.config = opt;
        this.init();
        this.bindUI();
    }
    FormCtrl.prototype = {
        init: function() {
            var _this = this;
            var itemList = _this.itemList;
            var formList = _this.formList;
            formList.forEach(function(item) {
                itemList.push(new FormItem(item, _this));
            });
        },
        bindUI: function() {
            var _this = this;
            var handler = _this.config.handler;
            this.dom.addEventListener(_this.config.checkEvent, function(e) {
                var currItem = e.target;
                var itemList = _this.itemList;
                for(var i in itemList) {
                    if(itemList[i].item == currItem) {
                        itemList[i].check();
                        _this.render(itemList[i].item , itemList[i].status);
                    }
                }
            }, true);
            for(var key in handler) {
                _this.dom.addEventListener(key, function(e) {
                    var currItem = e.target;
                    var itemList = _this.itemList;
                    for(var i in itemList) {
                        if(itemList[i].item == currItem) {
                            handler[key](currItem, _this);
                        }
                    }
                }, true);
            }
        },
        render: function(item, status) {
            item.className = status;
            item.parentNode.querySelector('.msg').className = 'msg ' + status;
        },
        upData: function(cb) {
            var itemList = this.itemList;
            var item;
            for(var i in itemList) {
                item = itemList[i];
                item.check();
                if(!/ok|normal/.test(item.status)) {
                    alert(item.item.parentNode.querySelector('span.'+item.status).innerText);
                    return false;
                }
            }
            alert('校验通过');
        }
    }
    //单个表单控件对象
    function FormItem(opt, ctrl) {
        this.item = ctrl.dom.querySelector('[name='+opt.name+']');
        this.task = opt;
        this.ctrl = ctrl;
        this.status = '';
        this.init();
    }
    FormItem.prototype = {
        init: function() {
        },
        check: function() {
            var val = this.item.value;
            var task = this.task;
            var checkFn = this.ctrl.checkFn;
            var _this = this;
            var _task = unpick(task, ['name', 'require']);
            var flag = true;
            if(checkFn.require(val)) {
                if(task.require) {
                    _this.status = 'empty';
                }else {
                    _this.status = 'normal';
                }
                return false;
            }else {
                _this.status = 'ok';
            }
            if(!isEmpty(_task)) {
                for(var key in _task) {
                    if(checkFn[key]) {
                        checkFn[key](val, _task[key]) ? flag &= true : flag &= false;
                    }
                }
                flag ? _this.status = 'ok' : _this.status = 'error';
            }
            
            return false;
        }
    }
    //启动表单校验
    var formCtrl = new FormCtrl(config);
    $('.btn').addEventListener('click', function() {
        formCtrl.upData();
    });
})();