(function() {
    'use strict';
    function $(selector) {
        return document.querySelector(selector);
    }
    function $$(selector) {
        return document.querySelectorAll(selector);
    }
    /*$('.input-con .btn').addEventListener('click', function() {
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
    });*/
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
    function unpick(obj, arr) {
        var res = {};
        for(var i in obj) {
            if(arr.indexOf(i) < 0) {
                res[i] = obj[i];
            }
        }
        return res;
    }
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
        },{
            name: 'tel',
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
    var checkFn = {
        require : function(val) {
            if(!trim(val)) {
                return 'empty';
            }
            return false;
        },
        equal: function(val, name) {
            return val === $('[name='+name+']').value;
        }
    };

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
        }
    }
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
                    return false;
                }else {
                    _this.status = 'normal';
                }
            }else {
                _this.status = 'ok';
            }
            if(!isEmpty(_task)) {
                for(var key in _task) {
                    if(checkFn[key]) {
                        checkFn[key](val, _task[key]) ? flag = true : flag = false;
                    }
                }
                flag ? _this.status = 'ok' : _this.status = 'error';
            }
            
            return false;
        }
    }
    var formCtrl = new FormCtrl(config);
})();