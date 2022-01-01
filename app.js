function EventHandlers() {
    EventHandlers.swipeDistance = 160;
    EventHandlers.swipeMaxtime = 800;
    EventHandlers.clickTime = 200;
    EventHandlers.touchEvent = false;
    EventHandlers._mouseDownWhen = 0;
    EventHandlers._mouseSwipeStart = null;
    EventHandlers.callbackList = null;
    EventHandlers._showDebugWindowData = 0;
    EventHandlers._debugText = null;
    EventHandlers._handledDownTime = -1;
    window.addEventListener("resize", EventHandlers.resizeEvent, false);
    window.addEventListener("orientationchange", EventHandlers.orientationEvent, false)
}
EventHandlers.resetInput = function() {
    EventHandlers._mouseDownWhen = 0;
    EventHandlers._mouseSwipeStart = null
};
EventHandlers.pixiListeners = function(_pixi) {
    _pixi.plugins.interaction.on("mousedown", EventHandlers.mouseDownHandler);
    _pixi.plugins.interaction.on("mouseup", EventHandlers.mouseUpHandler);
    _pixi.plugins.interaction.on("mousemove", EventHandlers.mouseMoveHandler);
    _pixi.plugins.interaction.on("mouseout", EventHandlers.mouseOutHandler);
    _pixi.plugins.interaction.on("touchstart", EventHandlers.touchDownHandler);
    _pixi.plugins.interaction.on("touchmove", EventHandlers.touchMoveHandler);
    _pixi.plugins.interaction.on("touchend", EventHandlers.touchUpHandler);
    if (Main.isIE) {
        _pixi.plugins.interaction.on("pointerdown", EventHandlers.touchDownHandler);
        _pixi.plugins.interaction.on("pointermove", EventHandlers.touchMoveHandler);
        _pixi.plugins.interaction.on("pointerup", EventHandlers.touchUpHandler);
        _pixi.plugins.interaction.on("pointercancel", EventHandlers.touchUpHandler)
    }
};
EventHandlers.mouseToStage = function(_x, _y) {
    return {
        x: _x,
        y: _y
    }
};
EventHandlers.inputClickHandler = function(_evt) {
    Main.click = EventHandlers.mouseToStage(_evt.data.global.x, _evt.data.global.y);
    Main.mouseMoveLocal = _evt.data.getLocalPosition(Main.playLayer);
    Main.mouseUpLocal = _evt.data.getLocalPosition(Main.playLayer)
};
EventHandlers.inputSwipeHandler = function(_evt) {
    if (Math.abs(_evt.deltaX) > Math.abs(_evt.deltaY)) {
        if (Math.abs(_evt.deltaX) >= 20) {
            Main.swipe = _evt.deltaX
        } else {
            Main.swipe = 0
        }
    }
};
EventHandlers.mouseOutHandler = function() {
    Main.mouseOut = true
};
EventHandlers.mouseMoveHandler = function(_evt) {
    EventHandlers.touchEvent = false;
    return EventHandlers.touchMoveHandler(_evt)
};
EventHandlers.touchMoveHandler = function(_evt) {
    if (Main.mouseOut) Main.mouseOut = false;
    Main.hover = EventHandlers.mouseToStage(_evt.data.global.x, _evt.data.global.y);
    Main.mouseMoveLocal = _evt.data.getLocalPosition(Main.playLayer);
    if (EventHandlers._mouseSwipeStart && Main.swipeEnabled) {
        if (Utils.distanceBetween(EventHandlers._mouseSwipeStart, Main.hover) >= EventHandlers.swipeDistance) {
            if (Main.nowTime - EventHandlers._mouseDownWhen < EventHandlers.swipeMaxtime) {
                EventHandlers.inputSwipeHandler({
                    deltaX: Main.hover.x - EventHandlers._mouseSwipeStart.x,
                    deltaY: Main.hover.y - EventHandlers._mouseSwipeStart.y
                });
                EventHandlers._mouseDownWhen = 0;
                Main.mouseDown = null
            }
        }
    }
};
EventHandlers.touchDownHandler = function(_evt) {
    EventHandlers.touchEvent = true;
    EventHandlers.mouseDownHandler(_evt);
    Main.mouseMoveLocal = Main.mouseDownLocal
};
EventHandlers.mouseDownHandler = function(_evt) {
    if (Main.nowTime == EventHandlers._handledDownTime) return;
    EventHandlers._handledDownTime = Main.nowTime;
    if (EventHandlers._showDebugWindowData) {
        if (EventHandlers._showDebugWindowData < Main.nowTime) {
            EventHandlers._debugText.destroy();
            EventHandlers._debugText = null;
            EventHandlers._showDebugWindowData = 0
        }
    }
    EventHandlers._mouseDownWhen = Main.nowTime;
    Main.mouseDown = EventHandlers.mouseToStage(_evt.data.global.x, _evt.data.global.y);
    Main.mouseDownLocal = _evt.data.getLocalPosition(Main.playLayer);
    if (!EventHandlers._mouseSwipeStart && Main.swipeEnabled) {
        EventHandlers._mouseSwipeStart = EventHandlers.mouseToStage(_evt.data.global.x, _evt.data.global.y)
    }
    EventHandlers.triggerCallback("mousedown", Main.mouseDown.x, Main.mouseDown.y)
};
EventHandlers.touchUpHandler = function(_evt) {
    EventHandlers.touchEvent = true;
    EventHandlers.mouseUpHandler(_evt);
    Main.mouseMoveLocal = Main.mouseUpLocal
};
EventHandlers.mouseUpHandler = function(_evt) {
    var dragDistance = 0;
    if (Main.mouseUp && Main.mouseDown) {
        dragDistance = Utils.distanceBetween(Main.mouseUp, Main.mouseDown)
    }
    if (Main.mouseDown) {
        if (!Main.swipeEnabled || dragDistance < EventHandlers.swipeDistance && (!EventHandlers._mouseDownWhen || Main.nowTime - EventHandlers._mouseDownWhen < EventHandlers.clickTime)) {
            EventHandlers.inputClickHandler(_evt)
        } else {
            Main.mouseUp = EventHandlers.mouseToStage(_evt.data.global.x, _evt.data.global.y);
            Main.mouseUpLocal = _evt.data.getLocalPosition(Main.playLayer);
            if (Main.mouseUp && Main.mouseDown) {
                if (dragDistance >= EventHandlers.swipeDistance) EventHandlers.inputSwipeHandler({
                    deltaX: Main.mouseUp.x - Main.mouseDown.x,
                    deltaY: Main.mouseUp.y - Main.mouseDown.y
                })
            }
        }
    }
    EventHandlers._mouseDownWhen = 0;
    Main.mouseDown = null;
    Main.mouseDownLocal = null;
    EventHandlers._mouseSwipeStart = null
};
EventHandlers.resizeEvent = function() {
    if (Main.debug) console.log("resize event");
    EventHandlers.checkDimensions(true)
};
EventHandlers.orientationEvent = function() {
    if (Main.debug) console.log("orientation event");
    EventHandlers.checkDimensions(true)
};
EventHandlers.checkDimensions = function(_eventTriggered) {
    if (Main.resized) return;
    if (_eventTriggered || (Main.width != window.innerWidth || Main.height != window.innerHeight)) {
        Main.resized = true;
        Main.resizeTime = Main.nowTime;
        if (Main.debug) console.log("screen dimensions have changed from " + Main.width + "x" + Main.height)
    }
};
EventHandlers.resizeContent = function() {
    Main.width = window.innerWidth;
    Main.height = window.innerHeight;
    Main.aspectRatio = Main.width / Main.height;
    if (Main.debug) console.log("resizeContent to " + Main.width + "x" + Main.height + ". aspectRatio is " + Main.aspectRatio);
    Main.isPortrait = Main.height >= Main.width;
    Main.lowResolutionAssets = Math.max(Main.width, Main.height) < 640 || Math.min(Main.width, Main.height) < 480;
    Main.aspectRatio = Main.width / Main.height;
    Main.isPortrait = Main.height >= Main.width;
    Main.lowResolutionAssets = Math.max(Main.width, Main.height) < 640 || Math.min(Main.width, Main.height) < 480;
    Main.app.renderer.resize(Main.width, Main.height);
    Main.stage.x = Math.round(Main.width / 2);
    Main.stage.y = Math.round(Main.height / 2);
    var sx = Main.width / Main.gameWide;
    var sy = Main.height / Main.gameHigh;
    var bgScale = Math.max(sx, sy);
    Main.bgImage.scale.set(bgScale);
    Main.playLayer.scale.set(bgScale);
    Main.largeUI.scale.set(bgScale);
    var uiScale = Math.min(sx, sy);
    Main.centreTopUI.scale.set(uiScale);
    Main.centreTopUI.x = 0;
    Main.centreTopUI.y = -Main.height / 2;
    Main.leftBottomUI.scale.set(uiScale);
    Main.leftBottomUI.x = -Main.width / 2;
    Main.leftBottomUI.y = Main.height / 2;
    Main.leftTopUI.scale.set(uiScale);
    Main.leftTopUI.x = -Main.width / 2;
    Main.leftTopUI.y = -Main.height / 2;
    Main.rightBottomUI.scale.set(uiScale);
    Main.rightBottomUI.x = Main.width / 2;
    Main.rightBottomUI.y = Main.height / 2;
    Main.rightTopUI.scale.set(uiScale);
    Main.rightTopUI.x = Main.width / 2;
    Main.rightTopUI.y = -Main.height / 2;
    Main.fullUI.scale.set(uiScale);
    if (Main.debugSpam) {
        console.log("aspectRatio:", Main.aspectRatio, Main.isPortrait ? "portrait" : "landscape");
        console.log("doc window.inner:   ", window.innerWidth, "x", window.innerHeight);
        console.log("Resolution: ", Main.lowResolutionAssets ? "low" : "high");
        console.log("View ratio: ", sx, ":", sy);
        console.log("stage offset: ", Main.stage.x, ",", Main.stage.y, "\n")
    }
};
EventHandlers.registerCallback = function(_event, _callback, _arg) {
    if (Main.debugSpam) console.log("registerCallback for", _event);
    if (!EventHandlers.callbackList) EventHandlers.callbackList = [];
    EventHandlers.callbackList.push({
        event: _event,
        callback: _callback,
        arg: _arg
    })
};
EventHandlers.triggerCallback = function(_event, _x, _y) {
    if (!EventHandlers.callbackList) return;
    for (var i = EventHandlers.callbackList.length - 1; i >= 0; --i) {
        var e = EventHandlers.callbackList[i];
        if (e.event == _event) {
            if (Main.debugSpam) console.log("triggerCallback for", _event);
            e.callback.call(e.arg.context, _x, _y, e.arg.args)
        }
    }
};
EventHandlers.clearCallback = function(_event, _callback) {
    if (!EventHandlers.callbackList) return;
    for (var i = EventHandlers.callbackList.length - 1; i >= 0; --i) {
        var e = EventHandlers.callbackList[i];
        if (e.event == _event && e.callback == _callback) {
            EventHandlers.callbackList.splice(i, 1);
            if (Main.debugSpam) console.log("clearCallback for", _event);
            break
        }
    }
    if (EventHandlers.callbackList.length === 0) EventHandlers.callbackList = null
};
EventHandlers.clearCallbacks = function() {
    EventHandlers.callbackList = null
};
EventHandlers.debugWindowData = function() {
    if (!EventHandlers._showDebugWindowData) {
        var sx = Main.width / Main.gameWide;
        var sy = Main.height / Main.gameHigh;
        var s = "aspectRatio: " + Main.aspectRatio + " " + (Main.isPortrait >= 1 ? "portrait" : "landscape") + "\n";
        s += "devicePixelRatio: " + window.devicePixelRatio + "\n";
        s += "window.inner: " + window.innerWidth + " x " + window.innerHeight + "\n";
        s += "resolution: " + (Main.lowResolutionAssets ? "low" : "high") + "\n";
        s += "view ratio: " + sx + " : " + sy;
        var t = new Text(s, Main.textStyleMediumTiny);
        t.create(Main.topUI, -.5 + .05, .25, true);
        t.anchor.y = 1;
        EventHandlers._debugText = t;
        EventHandlers._showDebugWindowData = Main.nowTime + 5e3
    }
};
var Keys = {};
Keys.isIgnored = null;
Keys.isPressed = null;
Keys.edgeDown = null;
Keys.edgeUp = null;
Keys.debug = false;
Keys.create = function(_debug) {
    Keys.debug = _debug || false;
    Keys.reset();
    if (document.body && document.body.addEventListener) document.body.addEventListener("keydown", Keys.keyDown, true);
    else if (document.addEventListener) document.addEventListener("keydown", Keys.keyDown, true);
    else if (window.addEventListener) window.addEventListener("keydown", Keys.keyDown, true);
    else if (document.attachEvent) document.attachEvent("onkeydown", Keys.keyDown);
    if (document.body && document.body.addEventListener) document.body.addEventListener("keyup", Keys.keyUp, true);
    else if (document.addEventListener) document.addEventListener("keyup", Keys.keyUp, true);
    else if (window.addEventListener) window.addEventListener("keyup", Keys.keyUp, true);
    else if (document.attachEvent) document.attachEvent("onkeyup", Keys.keyUp)
};
Keys.destroy = function() {
    Keys.isPressed = null;
    Keys.edgeDown = null;
    Keys.edgeUp = null
};
Keys.update = function() {
    return true
};
Keys.reset = function(_key) {
    if (_key === undefined) {
        Keys.isPressed = [];
        Keys.edgeDown = [];
        Keys.edgeUp = []
    } else {
        Keys.isPressed[_key] = false;
        Keys.edgeDown[_key] = false;
        Keys.edgeUp[_key] = false
    }
};
Keys.ignoreKey = function(_key) {
    Keys.ignoreKey[_key] = true
};
Keys.getCode = function(_evt) {
    if (_evt.keyCode !== undefined) return _evt.keyCode;
    if (_evt.charCode !== undefined) return _evt.charCode;
    if (_evt.which !== undefined) return _evt.which;
    if (_evt.key !== undefined) return _evt.key;
    if (Main.debug) console.log("ERROR: Keys.getCode unable to recognise what the key value is called in this object: ", _evt);
    return undefined
};
Keys.keyDown = function(_evt) {
    var code = Keys.getCode(_evt);
    if (Keys.ignoreKey[code]) return;
    _evt.preventDefault();
    if (!Keys.isPressed[code]) {
        Keys.edgeDown[code] = true
    }
    Keys.isPressed[code] = true
};
Keys.keyUp = function(_evt) {
    var code = Keys.getCode(_evt);
    if (Keys.ignoreKey[code]) return;
    _evt.preventDefault();
    if (Keys.isPressed[code]) {
        Keys.edgeUp[code] = true
    }
    Keys.isPressed[code] = false
};
var KeyCodes = {
    backspace: 8,
    tab: 9,
    enter: 13,
    shift: 16,
    ctrl: 17,
    alt: 18,
    pause: 19,
    caps_lock: 20,
    escape: 27,
    space_bar: 32,
    page_up: 33,
    page_down: 34,
    end: 35,
    home: 36,
    left_arrow: 37,
    up_arrow: 38,
    right_arrow: 39,
    down_arrow: 40,
    insert_key: 45,
    delete_key: 46,
    key_0: 48,
    key_1: 49,
    key_2: 50,
    key_3: 51,
    key_4: 52,
    key_5: 53,
    key_6: 54,
    key_7: 55,
    key_8: 56,
    key_9: 57,
    key_a: 65,
    key_b: 66,
    key_c: 67,
    key_d: 68,
    key_e: 69,
    key_f: 70,
    key_g: 71,
    key_h: 72,
    key_i: 73,
    key_j: 74,
    key_k: 75,
    key_l: 76,
    key_m: 77,
    key_n: 78,
    key_o: 79,
    key_p: 80,
    key_q: 81,
    key_r: 82,
    key_s: 83,
    key_t: 84,
    key_u: 85,
    key_v: 86,
    key_w: 87,
    key_x: 88,
    key_y: 89,
    key_z: 90,
    left_window_key: 91,
    right_window_key: 92,
    select_key: 93,
    numpad_0: 96,
    numpad_1: 97,
    numpad_2: 98,
    numpad_3: 99,
    numpad_4: 100,
    numpad_5: 101,
    numpad_6: 102,
    numpad_7: 103,
    numpad_8: 104,
    numpad_9: 105,
    multiply: 106,
    add: 107,
    subtract: 109,
    decimal_point: 110,
    divide: 111,
    f1: 112,
    f2: 113,
    f3: 114,
    f4: 115,
    f5: 116,
    f6: 117,
    f7: 118,
    f8: 119,
    f9: 120,
    f10: 121,
    f11: 122,
    f12: 123,
    num_lock: 144,
    scroll_lock: 145,
    semi_colon: 186,
    equal_sign: 187,
    comma: 188,
    dash: 189,
    period: 190,
    forward_slash: 191,
    grave_accent: 192,
    open_bracket: 219,
    back_slash: 220,
    close_braket: 221,
    single_quote: 222
};
var Utils = {};
Math.sgn0 = function(a) {
    if (a > 0) return 1;
    if (a < 0) return -1;
    return 0
};
Utils.shuffleList = function(_list) {
    var currentIndex = _list.length,
        temporaryValue, randomIndex;
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        temporaryValue = _list[currentIndex];
        _list[currentIndex] = _list[randomIndex];
        _list[randomIndex] = temporaryValue
    }
    return _list
};
Utils.pickRandomFromList = function(_list) {
    if (_value >= 0) return Math.min(_value, _limit);
    return Math.max(_value, -_negLimit)
};
Utils.countInList = function(_list, _item) {
    var c = 0;
    for (var i = 0, l = _list.length; i < l; i++)
        if (_list[i] == _item) c++;
    return c
};
Utils.formatBigNumber = function(_value) {
    var s = _value.toString();
    if (s.length <= 3) return s;
    for (var i = s.length - 3; i > 0; i -= 3) s = s.slice(0, i) + "," + s.slice(i);
    return s
};
Utils.sign0 = function(_value) {
    if (_value > 0) return 1;
    if (_value < 0) return -1;
    return 0
};
Utils.near = function(_location, _range) {
    return {
        x: _location.x + Math.random() * 2 * _range - _range,
        y: _location.y + Math.random() * 2 * _range - _range
    }
};
Utils.removeFromIndexedList = function(_list, _getAtIndex, _param, _value, _all) {
    if (_list) {
        for (var i = 0, l = _list.length; i < l; i++) {
            var listValue = _getAtIndex(_list, i);
            if (_param && listValue[_param] == _value || !_param && listValue == _value) {
                _list.splice(i, 1);
                if (!_all) return _list
            }
        }
    }
    return _list
};
Utils.removeFromArray = function(_list, _item) {
    var i = _list.indexOf(_item);
    if (i == -1) return _list;
    return _list.splice(i, 1)
};
Utils.whereInGrid2D = function(_object, _grid) {
    for (var gx = 0; gx < _grid.length; gx++)
        for (var gy = 0; gy < _grid[gx].length; gy++)
            if (_grid[gx][gy] == _object) return {
                x: gx,
                y: gy
            };
    return null
};
Utils.findPointInList = function(_pnt, _list, _param) {
    if (_list) {
        var pl;
        for (var i = 0, l = _list.length; i < l; i++) {
            if (_param === undefined) pl = _list[i];
            else pl = _list[i][param];
            if (pl && pl.x == _pnt.x && pl.y == _pnt.y) return i
        }
    }
    return -1
};
Utils.findNearestPointInList = function(_pnt, _list, _param) {
    var min2 = Number.POSITIVE_INFINITY;
    var best = -1;
    if (_list) {
        var pl;
        for (var i = 0, l = _list.length; i < l; i++) {
            pl = _param === undefined ? _list[i] : _list[i][param];
            if (pl) {
                var dx = pl.x - _pnt.x;
                var dy = pl.y - _pnt.y;
                var d2 = dx * dx + dy * dy;
                if (d2 < min2) {
                    min2 = d2;
                    best = i
                }
            }
        }
    }
    return best
};
Utils.weightedPickRandomFromList = function(_list, _weights, _rndFnc) {
    if (!_rndFnc) _rndFnc = Math.random;
    var total = 0,
        i, l;
    for (i = 0, l = _weights.length; i < l; i++) total += _weights[i];
    var r = _rndFnc() * total;
    var accumulate = 0;
    for (i = 0; i < l; i++) {
        accumulate += _weights[i];
        if (accumulate >= r) return _list[i]
    }
    return _list[l - 1]
};
Utils.pickRandomFromList = function(_list, _rndFnc) {
    if (!_rndFnc) _rndFnc = Math.random;
    if (!_list || _list.length === 0) return null;
    var r = Math.floor(_rndFnc() * _list.length);
    return _list[r]
};
Utils.normaliseAngle = function(_angle, _fullCircle) {
    if (!_fullCircle) _fullCircle = Math.PI * 2;
    var halfCircle = _fullCircle / 2;
    while (_angle < -halfCircle) _angle += _fullCircle;
    while (_angle >= halfCircle) _angle -= _fullCircle;
    return _angle
};
Utils.normaliseAnglePositive = function(_angle, _fullCircle) {
    if (!_fullCircle) _fullCircle = Math.PI * 2;
    while (_angle < 0) _angle += _fullCircle;
    while (_angle >= _fullCircle) _angle -= _fullCircle;
    return _angle
};
Utils.distance = function(_x1, _y1, _x2, _y2) {
    var dx = _x2 - _x1;
    var dy = _y2 - _y1;
    return Math.sqrt(dx * dx + dy * dy)
};
Utils.distanceBetween = function(_p1, _p2) {
    var dx = _p2.x - _p1.x;
    var dy = _p2.y - _p1.y;
    return Math.sqrt(dx * dx + dy * dy)
};
Utils.distanceBetweenScaled = function(_p1, _p2, _sx, _sy) {
    var dx = (_p2.x - _p1.x) * _sx;
    var dy = (_p2.y - _p1.y) * _sy;
    return Math.sqrt(dx * dx + dy * dy)
};
Utils.rotateTo = function(_current, _desired, _speed, _fullCircle) {
    if (!_fullCircle) _fullCircle = Math.PI * 2;
    var halfCircle = _fullCircle / 2;
    var r;
    var rotFar = Utils.normaliseAnglePositive(_current - _desired + _fullCircle, _fullCircle);
    if (rotFar > halfCircle) {
        r = _current + Math.min(_fullCircle - rotFar, _speed)
    } else if (rotFar !== 0) {
        r = _current - Math.min(rotFar, _speed)
    } else {
        r = _desired
    }
    return Utils.normaliseAngle(r, _fullCircle)
};
Utils.replaceAt = function(string, index, character) {
    return string.substr(0, index) + character + string.substr(index + character.length)
};
Utils.setValuesFromObject = function(_self, _object) {
    if (_object) {
        for (var key in _object) {
            if (_object.hasOwnProperty(key)) {
                _self[key] = _object[key]
            }
        }
    }
};
Utils.indexOfParameter = function(_list, _parameter, _value) {
    if (!_list) return -1;
    for (var i = 0, l = _list.length; i < l; i++) {
        if (_list[i][_parameter] == _value) return i
    }
    return -1
};
Utils.indexOfStringNoCase = function(_list, _string) {
    if (!_list) return -1;
    for (var i = 0, l = _list.length; i < l; i++) {
        if (_list[i].toLowerCase() == _string.toLowerCase()) return i
    }
    return -1
};
Utils.timeToString = function(ms) {
    if (ms === undefined || ms === null || isNaN(ms)) ms = 0;
    var s = ms / 1e3;
    var m = s / 60;
    var mstr = Math.floor(m).toString();
    var sstr = (Math.floor(s) % 60).toString();
    if (sstr.length < 2) sstr = "0" + sstr;
    return mstr + ":" + sstr
};
Utils.clamp = function(_value, _min, _max) {
    return Math.min(Math.max(_value, _min), _max)
};
Utils.padToLength = function(_string, _length, _pad, _tail) {
    while (_string.length < _length)
        if (_tail) _string += _pad;
        else _string = _pad + _string;
    return _string
};
Utils.makeFunctionForSprite = function(_sprite) {
    return function(_state) {
        Utils.setValuesFromObject(_sprite, _state)
    }
};
Utils.focusChangeCallback = null;
Utils.focusChangeContext = null;
Utils._visListener = false;
Utils._hidden = false;
Utils._focusIn = function() {
    Utils._hidden = false;
    if (Main.debug) console.log("Utils._focusIn hidden =", Utils._hidden);
    if (Utils.focusChangeContext && Utils.focusChangeCallback) Utils.focusChangeCallback.call(Utils.focusChangeContext, Utils._hidden)
};
Utils._focusOut = function() {
    Utils._hidden = true;
    if (Main.debug) console.log("Utils._focusOut hidden =", Utils._hidden);
    if (Utils.focusChangeContext && Utils.focusChangeCallback) Utils.focusChangeCallback.call(Utils.focusChangeContext, Utils._hidden)
};
Utils.detectHidden = function() {
    if (!Utils._visListener) {
        var prefix = getBrowserPrefix();
        var hidden = hiddenProperty(prefix);
        var visEvent = visibilityEvent(prefix);
        document.addEventListener(visEvent, function() {
            if (!document[hidden]) {
                Utils._focusIn()
            } else {
                Utils._focusOut()
            }
        });
        window.addEventListener("focus", Utils._focusIn, false);
        window.addEventListener("blur", Utils._focusOut, false);
        Utils._visListener = true
    }
};
Utils.isHidden = function() {
    return document["hidden"]
};

function getBrowserPrefix() {
    if ("hidden" in document) {
        return null
    }
    var browserPrefixes = ["moz", "ms", "o", "webkit"];
    for (var i = 0; i < browserPrefixes.length; i++) {
        var prefix = browserPrefixes[i] + "Hidden";
        if (prefix in document) {
            return browserPrefixes[i]
        }
    }
    return null
}

function hiddenProperty(prefix) {
    if (prefix) {
        return prefix + "Hidden"
    } else {
        return "hidden"
    }
}

function visibilityState(prefix) {
    if (prefix) {
        return prefix + "VisibilityState"
    } else {
        return "visibilityState"
    }
}

function visibilityEvent(prefix) {
    if (prefix) {
        return prefix + "visibilitychange"
    } else {
        return "visibilitychange"
    }
}
Utils.blanker = null;
Utils.addBlanker = function(_textures, _key) {
    if (Utils.blanker !== null) {
        Utils.blanker.instances++;
        return Utils.blanker
    }
    if (_key === undefined) _key = "blanker";
    Utils.blanker = new Sprite;
    Utils.blanker.create(Main.fullUI, _key, _textures, 0, 0);
    Utils.blanker.anchor.set(.5);
    Utils.blanker.scale.set(40);
    Utils.blanker.alpha = 1;
    Utils.blanker.instances = 1;
    Utils.blanker.moveToFront();
    return Utils.blanker
};
Utils.removeBlanker = function() {
    if (Utils.blanker) {
        Utils.blanker.instances--;
        if (Utils.blanker.instances <= 0) {
            Utils.blanker.destroy();
            Utils.blanker = null
        }
    }
};
Math.rnd = function(s) {
    return function() {
        s = Math.sin(s) * 1e4;
        var r = s - Math.floor(s);
        return r
    }
};
Math.mySeed = function(s) {
    if (s === 0) s = 1;
    Math.myRandom = Math.rnd(s)
};
var SpriteData = [];
SpriteData.UNDEFINED = {
    type: -1,
    name: "undefined",
    animations: {
        interval: 0,
        default: ["undefined"]
    }
};
SpriteData.PRELOADER_ANIM = {
    name: "preloader_anim",
    animations: {
        noRepeat: true,
        interval: 100,
        default: ["loader_animation0001.png", "loader_animation0002.png", "loader_animation0003.png", "loader_animation0004.png", "loader_animation0005.png", "loader_animation0006.png", "loader_animation0007.png", "loader_animation0008.png", "loader_animation0009.png", "loader_animation0010.png"]
    }
};
(function() {
    for (var type in SpriteData) {
        if (SpriteData[type].type !== undefined) SpriteData[SpriteData[type].type] = SpriteData[type];
        if (SpriteData[type].name !== undefined) SpriteData[SpriteData[type].name] = SpriteData[type]
    }
})();
Game.snapRange = 80;
Game.guidePercent = .4;
Game.guidePercentSq = .3;
Game.tooSlow = 1e3 * 60 * 3;
Game.frameCount = 0;
Game.paused = false;
Game.requestQuit = false;
Game.score = 0;
Game.timeLeft = 0;
Game.self = null;
Game.pieceIsTweening = 0;
Game.STARTING = 0;
Game.PLAYING = 1;
Game.WON_LEVEL = 2;
Game.NEXT_LEVEL = 4;
Game.WAIT_DELAY = 8;
Game.QUIT = 9;

function Game(_wide, _high) {
    Game.self = this;
    this.managers = null;
    this.level = 0;
    this.numLevels = 0;
    this.help = null;
    this.confirm = null;
    this.bigMessagePopup = null;
    this.lastState = -1;
    this.state = Game.STARTING;
    this.nextState = -1;
    this.delay = 0;
    this.won = false;
    this.puzzleWide = _wide;
    this.puzzleHigh = _high;
    this.tutorialPointer = null;
    this.nextTutorial = 0;
    this.resumeButton = null;
    this.closeButton = null;
    this.muteButton = null;
    this.layoutResizeCheck = false;
    this.guideImageResizeAndCentreTimer = Main.nowTime;
    Game.paused = false;
    Game.requestQuit = false;
    Game.timeLeft = 0;
    Game.score = 0;
    Game.pieceIsTweening = 0
}
Game.prototype.create = function(_managers, _numLevels, _numImages) {
    this.managers = _managers;
    this.numLevels = _numLevels;
    this.numImages = _numImages;
    Game.paused = false;
    Game.requestQuit = false;
    Game.score = 0;
    Game.timeLeft = Main.timerStart;
    this.level = 1 - 1;
    this.help = null;
    this.confirm = null;
    this.bigMessagePopup = null;
    this.state = Game.STARTING;
    this.nextState = -1;
    this.delay = 0;
    this.won = false;
    this.buttons = [];
    if (Main.showMuteButton) {
        this.muteButton = new Button(Button.TYPE_BUTTON, .5, .5);
        this.muteButton.create(Main.leftTopUI, "mute_button_unmute", this.managers, 90, -190, false, "mute_button_unmute", "mute_button_unmute_hover", "mute_button_unmute_hover", "click_mute", null, "mute_button_muted", "mute_button_muted_hover", "mute_button_muted_hover", "click_unmute", null);
        this.muteButton.sfx = "snd_clickPlay";
        this.muteButton.toggled = !this.managers.audio.mute;
        this.muteButton.callbackMouseDown = function() {
            Main.mouseDownLocal = null
        };
        this.buttons.push(this.muteButton)
    }
    this.pauseButton = new Button(Button.TYPE_BUTTON, .5, .5);
    this.pauseButton.create(Main.leftBottomUI, "pause_button", this.managers, 90, 190, false, "pause_button", "pause_button_hover", "pause_button_hover", "click_pause");
    this.pauseButton.sfx = "snd_clickPlay";
    this.pauseButton.sfxHover = "snd_rollOver";
    this.pauseButton.callbackMouseDown = function() {
        Main.mouseDownLocal = null
    };
    this.buttons.push(this.pauseButton);
    EventSignals.listen("click_pause", this.pauseToggle, this);
    if (this.muteButton) {
        new TWEEN.Tween(this.muteButton).to({
            y: 90
        }, 800).easing(TWEEN.Easing.Quadratic.Out).start()
    }
    new TWEEN.Tween(this.pauseButton).to({
        y: -90
    }, 800).easing(TWEEN.Easing.Quadratic.Out).start();
    var order = [];
    for (var i = 0; i < this.numImages; i++) order[i] = i;
    Utils.shuffleList(order);
    this.levelOrder = [];
    for (var i = 0; i < this.numImages; i++) this.levelOrder[i] = "jigsaw_image_" + (order[i] + 1).toString();
    this.startPrepare = Main.nowTime;
    this.spinner = null
};
Game.prototype.prepare = function() {
    var sprite = this.jigsaw.buildOnePiece();
    if (sprite) {
        if (!this.spinner && Main.nowTime - this.startPrepare > 1e3) {
            this.spinner = new Sprite(.5, .5);
            this.spinner.create(Main.fullUI, "please_wait", this.managers.textures, 0, 0, false);
            this.spinner.alpha = 0
        }
        if (this.spinner) {
            this.spinner.alpha += .02;
            this.spinner.rotation += .1;
            if (this.spinner.rotation >= Math.PI * 2) this.spinner.rotation -= Math.PI * 2
        }
        var w = Main.width / Main.playLayer.scale.x;
        var h = Main.height / Main.playLayer.scale.y;
        var _that = this;
        sprite.x = Math.random() * w - w / 2;
        sprite.y = Math.random() * h - h / 2;
        sprite.rotation = Math.random() * 2 * Math.PI;
        sprite.scale.set(.25, .25);
        sprite.visible = true;
        this.managers.audio.play(["snd_pieceLand1", "snd_pieceLand2", "snd_pieceLand3", "snd_pieceLand4"]);
        return true
    }
    if (this.spinner) {
        this.spinner.destroy();
        this.spinner = null
    }
    this.resize();
    if (Main.showTutorial) {
        this.nextTutorial = Main.nowTime + 1e3
    }
    return false
};
Game.prototype.cleanUpAfterLevel = function() {
    if (this.jigsaw) {
        this.jigsaw.destroy();
        this.jigsaw = null
    }
    if (this.jigsawGuide) {
        this.jigsawGuide.destroy();
        this.jigsawGuide = null
    }
    if (this.bg) {
        this.bg.destroy();
        this.bg = null
    }
    if (this.spinner) {
        this.spinner.destroy();
        this.spinner = null
    }
};
Game.prototype.destroy = function() {
    if (this.jigsaw) {
        this.jigsaw.destroy();
        this.jigsaw = null
    }
    if (this.jigsawGuide) {
        this.jigsawGuide.destroy();
        this.jigsawGuide = null
    }
    if (this.jigsawGuideBg) {
        this.jigsawGuideBg.destroy();
        this.jigsawGuideBg = null
    }
    if (this.bg) {
        this.bg.destroy();
        this.bg = null
    }
    if (this.bigMessagePopup) {
        this.bigMessagePopup.destroy();
        this.bigMessagePopup = null
    }
    if (this.help) {
        this.help.destroy();
        this.help = null
    }
    if (this.confirm) {
        this.confirm.destroy();
        this.confirm = null
    }
    if (this.muteButton) {
        this.muteButton.destroy();
        this.muteButton = null
    }
    if (this.pauseButton) {
        this.pauseButton.destroy();
        this.pauseButton = null
    }
    if (this.spinner) {
        this.spinner.destroy();
        this.spinner = null
    }
    if (this.tutorialPointer) {
        this.tutorialPointer.destroy();
        this.tutorialPointer = null
    }
    EventSignals.remove("click_pause", this.pauseToggle);
    this.managers = null
};
Game.prototype.update = function() {
    var event = null;
    var ret = true;
    Game.frameCount++;
    if (this.buttons) {
        for (i = 0; i < this.buttons.length; i++) {
            var b = this.buttons[i];
            event = b.update();
            if (event !== null) break
        }
    }
    if (!event && this.closeButton) {
        event = this.closeButton.update()
    }
    if (!event && this.resumeButton) {
        event = this.resumeButton.update()
    }
    switch (event) {
        case "click_mute":
            this.muteButton.toggled = false;
            this.managers.audio.setMute(true, false);
            this.managers.audio.muteTunes(true, false);
            break;
        case "click_unmute":
            this.muteButton.toggled = true;
            this.managers.audio.setMute(false, false);
            this.managers.audio.muteTunes(false, false);
            break;
        case "click_resume":
            this.pauseToggle();
            break;
        case "click_close":
            this.pauseToggle();
            Game.requestQuit = true;
            break
    }
    if (this.confirm) {
        if (this.confirm.update()) {
            return ret
        }
        this.confirm.destroy();
        this.confirm = null
    }
    if (this.help) {
        if (this.help.update()) {
            return ret
        }
        var _this = this;
        this.help.remove(function() {
            _this.help = null
        })
    }
    if (Game.requestQuit) {
        Game.requestQuit = false;
        this.state = Game.QUIT
    }
    var again;
    do {
        again = false;
        var newState = this.lastState != this.state;
        this.lastState = this.state;
        switch (this.state) {
            case Game.STARTING:
                if (newState) {
                    var bgNum = this.level % 5 + 1;
                    this.bg = new Sprite;
                    this.bg.create(Main.bgImage, "game_bg_" + bgNum.toString(), this.managers.textures);
                    this.bg.anchor.set(.5, 1);
                    this.bg.y = Main.height / 2 / this.bg.parent.scale.y;
                    this.jigsaw = new Jigsaw(this.managers);
                    this.jigsaw.create(Main.playLayer, this.levelOrder[this.level % this.levelOrder.length], this.puzzleWide, this.puzzleHigh);
                    this.jigsawGuideBg = new Sprite(.5, .5);
                    this.jigsawGuideBg.create(Main.bgImage, "puzzle_guide_bg", this.managers.textures, 0, 0, false);
                    this.jigsawGuideBg.alpha = 0;
                    this.jigsawGuideBg.visible = true;
                    this.jigsawGuide = new Sprite(.5, .5);
                    this.jigsawGuide.create(Main.bgImage, this.jigsaw.name, this.managers.textures, 0, 0, false);
                    this.jigsawGuide.alpha = .2;
                    this.jigsawGuide.visible = false;
                    this.setGuideLoc();
                    var whiteBlank = Utils.addBlanker(this.managers.textures, "blanker_white");
                    new TWEEN.Tween(whiteBlank).to({
                        alpha: 0
                    }, 750).onComplete(function() {
                        Utils.removeBlanker()
                    }).start()
                }
                if (!this.prepare()) {
                    this.state = Game.PLAYING;
                    again = true
                }
                break;
            case Game.PLAYING:
                if (newState) {
                    this.managers.audio.play("snd_puzzleStart");
                    Main.hover = null;
                    Main.mouseDownLocal = null;
                    this.dragPiece = null;
                    var s = this.jigsawGuide.scale.x;
                    this.jigsawGuide.scaleFactor = s * 1.25;
                    new TWEEN.Tween(this.jigsawGuide).to({
                        scaleFactor: s
                    }, 1e3).easing(TWEEN.Easing.Bounce.Out).start();
                    this.jigsawGuideBg.scaleFactor = s * 1.25;
                    new TWEEN.Tween(this.jigsawGuideBg).to({
                        scaleFactor: s
                    }, 1e3).easing(TWEEN.Easing.Bounce.Out).start();
                    this.jigsawGuide.visible = true;
                    this.layoutResizeCheck = true;
                    this.puzzleStartTime = Main.time
                }
                if (Main.cheatKeys) {
                    if (Keys.isPressed[KeyCodes.key_c]) {
                        this.state = Game.WON_LEVEL;
                        break
                    }
                }
                if (Main.nowTime > this.guideImageResizeAndCentreTimer + 1e3) {
                    this.setGuideLoc();
                    this.guideImageResizeAndCentreTimer = Main.nowTime
                }
                if (this.jigsawGuideBg && this.jigsawGuideBg.alpha < 1) {
                    this.jigsawGuideBg.alpha += Main.elapsedTime / (16 * 60)
                }
                if (GameControl.tutorialActive && !this.tutorialPointer && this.nextTutorial && Main.showTutorial) {
                    if (Main.nowTime > this.nextTutorial) this.createTutorialPointer()
                }
                if (!Game.paused) {
                    if (!this.dragPiece) {
                        if (Main.mouseDownLocal && Game.pieceIsTweening == 0) {
                            if (Main.debugSpam) console.log("mousedownlocal");
                            var x = Main.mouseDownLocal.x;
                            var y = Main.mouseDownLocal.y;
                            var piece = this.jigsaw.clickedPiece(x, y);
                            if (piece) {
                                if (this.tutorialPointer) {
                                    var _that = this;
                                    TWEEN.removeAll();
                                    this.tutorialPointer.tween = new TWEEN.Tween(this.tutorialPointer).to({
                                        alpha: 0
                                    }, 500).onComplete(function() {
                                        _that.tutorialPointer.destroy();
                                        _that.tutorialPointer = null
                                    }).start()
                                }
                                this.nextTutorial = 0;
                                this.managers.audio.play("snd_piecePickUp");
                                this.dragPiece = piece;
                                var sprite = piece.sprite;
                                new TWEEN.Tween(sprite).to({
                                    scaleFactor: sprite.originalScale * this.jigsawGuide.scale.x
                                }, 250).easing(TWEEN.Easing.Quadratic.Out).onComplete(function() {
                                    Game.pieceIsTweening--
                                }).start();
                                Game.pieceIsTweening++;
                                sprite.moveToFront();
                                Main.mouseMoveLocal = Main.mouseDownLocal;
                                if (Main.debugSpam) console.log("select " + sprite.key)
                            }
                            Main.mouseUpLocal = null;
                            Main.mouseDownLocal = null
                        }
                    } else {
                        if (Main.mouseMoveLocal) {
                            var sprite = this.dragPiece.sprite;
                            sprite.x = Main.mouseMoveLocal.x - this.dragPiece.data.wide / 2 * sprite.scale.x;
                            sprite.y = Main.mouseMoveLocal.y - this.dragPiece.data.high / 2 * sprite.scale.y;
                            if (Main.debugSpam) console.log("dragging " + sprite.key)
                        }
                        if (Main.mouseUpLocal) {
                            this.managers.audio.play(["snd_pieceLand1", "snd_pieceLand2", "snd_pieceLand3", "snd_pieceLand4"]);
                            var sprite = this.dragPiece.sprite;
                            var snapLock = this.jigsaw.pieceSnap(this.dragPiece, {
                                x: sprite.originalScale * this.jigsawGuide.scale.x,
                                y: sprite.originalScale * this.jigsawGuide.scale.y
                            });
                            if (snapLock) {
                                GameControl.tutorialActive = false;
                                this.managers.audio.play(["snd_pieceCorrect1", "snd_pieceCorrect2", "snd_pieceCorrect3", "snd_pieceCorrect4"]);
                                sprite.onTableX = sprite.x = snapLock.x;
                                sprite.onTableY = sprite.y = snapLock.y;
                                sprite.scaleOnTable = sprite.originalScale * this.jigsawGuide.scale.x;
                                if (this.jigsaw.piecePlaced(this.dragPiece)) {
                                    this.state = Game.WON_LEVEL
                                }
                            } else {
                                this.nextTutorial = Main.nowTime + 2e3;
                                this.managers.audio.play("snd_pieceWrong");
                                new TWEEN.Tween(sprite).to({
                                    x: sprite.onTableX,
                                    y: sprite.onTableY,
                                    scaleFactor: sprite.scaleOnTable
                                }, 200).easing(TWEEN.Easing.Quadratic.Out).onComplete(function() {
                                    Game.pieceIsTweening--
                                }).start();
                                Game.pieceIsTweening++
                            }
                            this.dragPiece = null;
                            Main.click = null
                        }
                    }
                }
                break;
            case Game.WON_LEVEL:
                if (newState) {
                    this.managers.audio.play("snd_puzzleComplete");
                    this.managers.audio.play(["child_cheer01", "child_cheer02", "child_cheer03"]);
                    this.timeTaken = Main.time - this.puzzleStartTime;
                    this.delay = 3 * 1e3;
                    this.state = Game.WAIT_DELAY;
                    this.nextState = Game.NEXT_LEVEL;
                    //ShowInter();
                    if (typeof sdk !== 'undefined' && sdk.showBanner !== 'undefined') {
                        sdk.showBanner();
                    }
                    this.jigsaw.hidePieces();
                    var s = this.jigsawGuide.scale.x;
                    new TWEEN.Tween(this.jigsawGuide).to({
                        scaleFactor: s * .95,
                        alpha: 1
                    }, 300).easing(TWEEN.Easing.Quadratic.Out).start().chain(new TWEEN.Tween(this.jigsawGuide).to({
                        scaleFactor: s * 1.2
                    }, 500).easing(TWEEN.Easing.Quadratic.InOut));
                    s = this.jigsawGuideBg.scale.x;
                    new TWEEN.Tween(this.jigsawGuideBg).to({
                        scaleFactor: s * .95,
                        alpha: 1
                    }, 300).easing(TWEEN.Easing.Quadratic.Out).start().chain(new TWEEN.Tween(this.jigsawGuideBg).to({
                        scaleFactor: s * 1.2
                    }, 500).easing(TWEEN.Easing.Quadratic.InOut))
                }
                break;
            case Game.NEXT_LEVEL:
                if (newState) {

                    this.level++;
                    if (this.level > this.numLevels - 1) {
                        this.won = true;
                        again = true;
                        this.state = Game.QUIT;
                        break
                    }
                    this.cleanUpAfterLevel();
                    if (this.timeTaken > Game.tooSlow) {
                        this.puzzleWide = Math.max(this.puzzleWide - 1, 3);
                        this.puzzleHigh = Math.max(this.puzzleHigh - 1, 3)
                    } else {
                        if (this.level % 3 == 0) {
                            this.puzzleWide = Math.min(this.puzzleWide + 1, 5);
                            this.puzzleHigh = Math.min(this.puzzleHigh + 1, 5)
                        }
                    }
                    this.state = Game.STARTING;
                    again = true
                }
                break;
            case Game.WAIT_DELAY:
                this.delay = Math.max(this.delay - Main.elapsedTime, 0);
                if (this.delay === 0) {
                    this.state = this.nextState;
                    again = true
                } else {}
                break;
            case Game.QUIT:
                ret = false;
                TWEEN.removeAll();
                Game.pieceIsTweening = 0;
                Utils.addBlanker(this.managers.textures, "blanker_white");
                break
        }
    } while (again);
    if (this.layoutResizeCheck && this.state != Game.STARTING) {
        this.wasResized();
        this.layoutResizeCheck = false
    }
    return ret
};
Game.prototype.pauseToggle = function() {
    Game.paused = !Game.paused;
    if (Main.debug) {
        if (Game.paused) console.log("Game.pauseToggle to true");
        else console.log("Game.pauseToggle to false")
    }
    this.managers.audio.pauseMute(Game.paused);
    if (Game.paused) {
        if (this.muteButton) this.muteButton.enabled = false;
        Utils.addBlanker(this.managers.textures);
        this.resumeButton = new Button(Button.TYPE_BUTTON, .5, .5);
        this.resumeButton.create(Main.fullUI, "resume_button", this.managers, 0, -120, false, "resume_button", "resume_button_hover", "resume_button_hover", "click_resume");
        this.closeButton = new Button(Button.TYPE_BUTTON, .5, .5);
        this.closeButton.create(Main.fullUI, "close_button", this.managers, 0, 120, false, "close_button", "close_button_hover", "close_button_hover", "click_close")
    } else {
        if (this.muteButton) this.muteButton.enabled = true;
        Utils.removeBlanker();
        if (this.resumeButton) {
            this.resumeButton.destroy();
            this.resumeButton = null
        }
        if (this.closeButton) {
            this.closeButton.destroy();
            this.closeButton = null
        }
    }
};
Game.prototype.createTutorialPointer = function() {
    this.tutorialPointer = new Sprite(0, 1);
    var topLeftPiece = this.jigsaw.topLeftPiece;
    this.tutorialPointer.create(topLeftPiece.sprite.parent, "tutorial_pointer", this.managers.textures, 0, 0, false);
    this.tutorialPointer.scale.set(.7);
    this.tutorialPointer.alpha = 0;
    this.tutorialPointer.x = topLeftPiece.sprite.onTableX + topLeftPiece.sprite.widest / 2 * topLeftPiece.sprite.scale.x;
    this.tutorialPointer.y = topLeftPiece.sprite.onTableY + topLeftPiece.sprite.tallest / 2 * topLeftPiece.sprite.scale.y;
    this.restartTutorialPointer()
};
Game.prototype.restartTutorialPointer = function() {
    if (!this.tutorialPointer || !this.jigsaw.topLeftPiece) return;
    var topLeftPiece = this.jigsaw.topLeftPiece;
    this.tutorialPointer.x = topLeftPiece.sprite.onTableX + topLeftPiece.sprite.widest / 2 * topLeftPiece.sprite.scale.x;
    this.tutorialPointer.y = topLeftPiece.sprite.onTableY + topLeftPiece.sprite.tallest / 2 * topLeftPiece.sprite.scale.y;
    var s = Sprite.getGlobalScale(this.tutorialPointer);
    if (this.tutorialPointer.y * s.y < -Main.height * .4) this.tutorialPointer.rotation = Math.PI / 4;
    else this.tutorialPointer.rotation = 0;
    this.tutorialPointer.moveToFront();
    var destx = (topLeftPiece.data.drawX + topLeftPiece.sprite.widest / 2) * topLeftPiece.sprite.originalScale * this.jigsawGuide.scale.x - this.jigsawGuide.width / 2;
    var desty = (topLeftPiece.data.drawY + topLeftPiece.sprite.tallest / 2) * topLeftPiece.sprite.originalScale * this.jigsawGuide.scale.x - this.jigsawGuide.height / 2;
    var _that = this;
    this.tutorialPointer.tween = new TWEEN.Tween(this.tutorialPointer).to({
        alpha: 1
    }, 750).chain(new TWEEN.Tween(this.tutorialPointer).to({
        x: destx,
        y: desty
    }, 1250).chain(new TWEEN.Tween(this.tutorialPointer).to({
        alpha: 0
    }, 300).onComplete(function() {
        _that.restartTutorialPointer()
    })).easing(TWEEN.Easing.Quadratic.InOut)).start()
};
Game.prototype.resize = function() {
    this.bg.y = Main.height / 2 / this.bg.parent.scale.y;
    this.layoutResizeCheck = true
};
Game.prototype.setGuideLoc = function() {
    var w = Main.width / Main.playLayer.scale.x;
    var h = Main.height / Main.playLayer.scale.y;
    var ratio = w / h;
    if (ratio > 1) ratio = 1 / ratio;
    var area = w * h * (ratio > .9 ? Game.guidePercentSq : Game.guidePercent);
    var scale = this.jigsawGuide.parent.scale.x;
    while (this.jigsawGuide._texture.width * scale * this.jigsawGuide._texture.height * scale > area || this.jigsawGuide._texture.width * scale > w * .9 || this.jigsawGuide._texture.height * scale > h * .9) scale -= .001;
    this.jigsawGuideBg.scale.set(scale, scale);
    this.jigsawGuide.scale.set(scale, scale);
    return scale
};
Game.prototype.wasResized = function() {
    this.setGuideLoc();
    var w = Main.width / Main.playLayer.scale.x;
    var h = Main.height / Main.playLayer.scale.y;
    this.jigsaw.pieceGuide = {
        width: this.jigsawGuide.width,
        height: this.jigsawGuide.height
    };
    this.jigsaw.boundsInner = {
        width: this.jigsawGuideBg.width,
        height: this.jigsawGuideBg.height
    };
    this.jigsaw.boundsOuter = {
        width: w,
        height: h
    };
    this.jigsaw.uiBoxes = null;
    this.jigsaw.addUiBox(w - 90, 0, 90, 90);
    this.jigsaw.addUiBox(0, 0, 90, 90);
    this.jigsaw.addUiBox(0, h - 90, 90, 90);
    this.jigsaw.scatter(this.jigsaw.pieceGuide, this.jigsaw.boundsInner, this.jigsaw.boundsOuter, this.jigsawGuide.scale)
};
Game.isDragging = function() {
    if (Game.self) return Game.self.dragPiece;
    return false
};

function Main() {
    Main.self = this;
    Main.VERSION = "v0.73";
    Main.debug = false;
    Main.debugSpam = false;
    Main.showFPS = false;
    Main.cheatKeys = false;
    Main.showTutorial = true;
    Main.testLanguage = false;
    Main.pauseOnFocusLoss = !Main.debug;
    Main.timerStart = (2 * 60 + 0) * 1e3 + 999;
    Main.gameWide = 1200;
    Main.gameHigh = 1200;
    Main.volumeControl = .5;
    Main.shortTapDurationMS = 400;
    Main.noSfxIE = false;
    Main.showMuteButton = Main.checkAudio();
    Main.click = null;
    Main.hover = null;
    Main.mouseDown = null;
    Main.mouseUp = null;
    Main.mouseMoveLocal = null;
    Main.mouseDownLocal = null;
    Main.mouseUpLocal = null;
    Main.swipe = 0;
    Main.swipeEnabled = false;
    Main.forceResize = false;
    Main.resized = false;
    Main.time = 0;
    Main.elapsedTime = 0;
    Main.muteUntil = -1;
    Main.nowTime = 0;
    Main.aspectRatio = 1;
    Main.isPortrait = false;
    Main.lowResolutionAssets = false;
    Main.pieceScale = 1;
    Main._lastTime = 0;
    this.gameControl = null;
    if (!window.devicePixelRatio) window.devicePixelRatio = 1
}
Main.timeStarted = Date.now();
Main.width = null;
Main.height = null;
Main.self = null;
Main.lockedLevels = null;
Main.levelScores = null;
Main.levelStars = null;
Main.levelLosses = null;
Main.prototype.createGame = function() {
    new EventHandlers;
    var pixelRatio = window ? window.devicePixelRatio : 1;
    Main.app = new PIXI.Application({
        autoResize: true,
        resolution: pixelRatio,
        backgroundColor: 8859527,
        transparent: "notMultiplied",
        forceCanvas: false
    }, Main.gameWide, Main.gameHigh);
    Main.app.renderer = Main.app.renderer;
    if (Main.app.renderer instanceof PIXI.CanvasRenderer) {
        console.log("PIXI using Canvas Renderer");
        if (PIXI.utils.isMobile.any) console.log("Mobile device")
    } else {
        console.log("PIXI using WebGl Renderer");
        if (PIXI.utils.isMobile.any) console.log("Mobile device")
    }
    document.body.appendChild(Main.app.view);
    Main.getFocus();
    var versionIE = Main.detectIE();
    Main.isIE = versionIE ? versionIE < 12 : false;
    if (Main.debug && Main.isIE) console.log("Main.isIE =", Main.isIE);
    Main.isAndroid = PIXI.utils.isMobile.android.phone || PIXI.utils.isMobile.android.seven_inch || PIXI.utils.isMobile.android.tablet;
    if (Main.debug) console.log("Main.android device =", Main.isAndroid);
    Main.isChromeMobile = PIXI.utils.isMobile.other.chrome;
    if (Main.debug) console.log("Main.isChromeMobile =", Main.isChromeMobile);
    Main.stage = Main.app.stage;
    Main.stage.x = Main.gameWide / 2;
    Main.stage.y = Main.gameHigh / 2;
    Main.bgImage = new PIXI.Sprite;
    Main.bgImage.anchor.set(.5, .5);
    Main.stage.addChild(Main.bgImage);
    Main.playLayer = new PIXI.Sprite;
    Main.playLayer.anchor.set(.5, .5);
    Main.stage.addChild(Main.playLayer);
    Main.leftBottomUI = new PIXI.Sprite;
    Main.leftBottomUI.anchor.set(0, 1);
    Main.stage.addChild(Main.leftBottomUI);
    Main.rightBottomUI = new PIXI.Sprite;
    Main.rightBottomUI.anchor.set(1, 0);
    Main.stage.addChild(Main.rightBottomUI);
    Main.centreTopUI = new PIXI.Sprite;
    Main.centreTopUI.anchor.set(.5, 0);
    Main.stage.addChild(Main.centreTopUI);
    Main.leftTopUI = new PIXI.Sprite;
    Main.leftTopUI.anchor.set(0, 0);
    Main.stage.addChild(Main.leftTopUI);
    Main.rightTopUI = new PIXI.Sprite;
    Main.rightTopUI.anchor.set(1, 0);
    Main.stage.addChild(Main.rightTopUI);
    Main.largeUI = new PIXI.Sprite;
    Main.largeUI.anchor.set(.5, .5);
    Main.stage.addChild(Main.largeUI);
    Main.fullUI = new PIXI.Sprite;
    Main.fullUI.anchor.set(.5, .5);
    Main.stage.addChild(Main.fullUI);
    EventHandlers.resizeEvent();
    EventHandlers.pixiListeners(Main.app.renderer);
    Main.nowTime = Date.now();
    Main.time = 0;
    this.gameControl = new GameControl;
    this.gameControl.create();
    this.playGame()
};
Main.prototype.playGame = function() {
    if (Main.debug) console.log("starting game loop");
    var stats = null;
    if (Main.showFPS) {
        stats = new Stats;
        stats.showPanel(0);
        document.body.appendChild(stats.dom)
    }
    var _this = this;
    var ticker = PIXI.ticker.shared;
    ticker.autoStart = false;
    ticker.stop();
    ticker = PIXI.ticker;
    ticker.autoStart = false;
    var inLoop = false;
    var onLoop = function() {
        if (!inLoop) {
            inLoop = true;
            Main._lastTime = Main.nowTime;
            Main.nowTime = Date.now();
            Main.elapsedTime = Math.min(Main.nowTime - Main._lastTime, 50);
            if (!Game.paused) {
                Main.time += Main.elapsedTime
            }
            requestAnimationFrame(onLoop);
            if (stats) stats.begin();
            if (Main.resized) {
                if (Main.nowTime - Main.resizeTime > 250) {
                    _this.resize();
                    Main.resized = false
                }
            }
            _this.gameControl.update();
            if (Main.forceResize) {
                if (Main.debug) console.log("Main.forceResize");
                _this.resize();
                Main.forceResize = false
            }
            if (stats) stats.end();
            inLoop = false
        } else {
            requestAnimationFrame(onLoop)
        }
    };
    requestAnimationFrame(onLoop)
};
Main.prototype.resize = function() {
    EventHandlers.resizeContent();
    if (this.gameControl) this.gameControl.resize();
    window.scrollTo(0, 0)
};
Main.createTextStyles = function(_dataManager) {
    var ts = _dataManager.get("text_styles");
    Main.textStyleVersionTiny = Main.wrapTextStyle(ts.textStyleVersionTiny)
};
Main.wrapTextStyle = function(_style) {
    var ts = new PIXI.TextStyle;
    Utils.setValuesFromObject(ts, _style);
    return ts
};
Main.checkAudio = function() {
    function isStock() {
        var matches = window.navigator.userAgent.match(/Android.*AppleWebKit\/([\d.]+)/);
        return matches && parseFloat(matches[1]) < 537
    }
    var ua = window.navigator.userAgent;
    var isSharpStock = /SHL24|SH-01F/i.test(ua) && isStock();
    var isXperiaAStock = /SO-04E/i.test(ua) && isStock();
    var isFujitsuStock = /F-01F/i.test(ua) && isStock();
    return !isSharpStock && !isXperiaAStock && !isFujitsuStock && (typeof window.AudioContext !== "undefined" || typeof window.webkitAudioContext !== "undefined" || ua.indexOf("Android") == -1)
};
Main.detectIE = function() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    if (msie > 0) {
        return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10)
    }
    var trident = ua.indexOf("Trident/");
    if (trident > 0) {
        var rv = ua.indexOf("rv:");
        return parseInt(ua.substring(rv + 3, ua.indexOf(".", rv)), 10)
    }
    var edge = ua.indexOf("Edge/");
    if (edge > 0) {
        return parseInt(ua.substring(edge + 5, ua.indexOf(".", edge)), 10)
    }
    return false
};
Main.render = function() {
    Main.app.renderer.render(Main.stage);
    EventHandlers.checkDimensions(false)
};
Main.resetInput = function() {
    EventHandlers.resetInput();
    Main.click = null;
    Main.hover = null;
    Main.mouseDown = null;
    Main.mouseUp = null;
    Main.swipe = 0
};
Main.getFocus = function() {
    if (Main.app && Main.app.view) {
        if (Main.debugSpam) console.log("Main.getFocus - grab keyboard focus");
        Main.app.view.setAttribute("tabindex", "-1");
        Main.app.view.focus()
    }
    Keys.create()
};
(function() {
    var root = this;
    var SmartPhone = function(obj) {
        if (obj instanceof SmartPhone) return obj;
        if (!(this instanceof SmartPhone)) return new SmartPhone(obj);
        this._wrapped = obj
    };
    SmartPhone.userAgent = null;
    SmartPhone.getUserAgent = function() {
        return this.userAgent
    };
    SmartPhone.setUserAgent = function(userAgent) {
        this.userAgent = userAgent
    };
    SmartPhone.isAndroid = function() {
        return this.getUserAgent().match(/Android/i)
    };
    SmartPhone.isBlackBerry = function() {
        return this.getUserAgent().match(/BlackBerry/i)
    };
    SmartPhone.isBlackBerryPlayBook = function() {
        return this.getUserAgent().match(/PlayBook/i)
    };
    SmartPhone.isBlackBerry10 = function() {
        return this.getUserAgent().match(/BB10/i)
    };
    SmartPhone.isIOS = function() {
        return this.isIPhone() || this.isIPad() || this.isIPod()
    };
    SmartPhone.isIPhone = function() {
        return this.getUserAgent().match(/iPhone/i)
    };
    SmartPhone.isIPad = function() {
        return this.getUserAgent().match(/iPad/i)
    };
    SmartPhone.isIPod = function() {
        return this.getUserAgent().match(/iPod/i)
    };
    SmartPhone.isOpera = function() {
        return this.getUserAgent().match(/Opera Mini/i)
    };
    SmartPhone.isWindows = function() {
        return this.isWindowsDesktop() || this.isWindowsMobile()
    };
    SmartPhone.isWindowsMobile = function() {
        return this.getUserAgent().match(/IEMobile/i)
    };
    SmartPhone.isWindowsDesktop = function() {
        return this.getUserAgent().match(/WPDesktop/i)
    };
    SmartPhone.isFireFox = function() {
        return this.getUserAgent().match(/Firefox/i)
    };
    SmartPhone.isNexus = function() {
        return this.getUserAgent().match(/Nexus/i)
    };
    SmartPhone.isKindleFire = function() {
        return this.getUserAgent().match(/Kindle Fire/i)
    };
    SmartPhone.isPalm = function() {
        return this.getUserAgent().match(/PalmSource|Palm/i)
    };
    SmartPhone.isAny = function() {
        var foundAny = false;
        var getAllMethods = Object.getOwnPropertyNames(SmartPhone).filter(function(property) {
            return typeof SmartPhone[property] == "function"
        });
        for (var index in getAllMethods) {
            if (getAllMethods[index] === "setUserAgent" || getAllMethods[index] === "getUserAgent" || getAllMethods[index] === "isAny" || getAllMethods[index] === "isWindows" || getAllMethods[index] === "isIOS") {
                continue
            }
            if (SmartPhone[getAllMethods[index]]()) {
                foundAny = true;
                break
            }
        }
        return foundAny
    };
    if (typeof window === "function" || typeof window === "object") {
        SmartPhone.setUserAgent(navigator.userAgent)
    }
    if (typeof exports !== "undefined") {
        var middleware = function(isMiddleware) {
            isMiddleware = isMiddleware === void 0 ? true : isMiddleware;
            if (isMiddleware) {
                return function(req, res, next) {
                    var userAgent = req.headers["user-agent"] || "";
                    SmartPhone.setUserAgent(userAgent);
                    req.SmartPhone = SmartPhone;
                    if ("function" === typeof res.locals) {
                        res.locals({
                            SmartPhone: SmartPhone
                        })
                    } else {
                        res.locals.SmartPhone = SmartPhone
                    }
                    next()
                }
            } else {
                return SmartPhone
            }
        };
        if (typeof module !== "undefined" && module.exports) {
            exports = module.exports = middleware
        }
        exports = middleware
    } else {
        root.SmartPhone = SmartPhone
    }
}).call(this);

function Sprite(_anchorX, _anchorY) {
    PIXI.Sprite.call(this);
    this.x = 0;
    this.y = 0;
    this.anchor.set(_anchorX ? _anchorX : 0, _anchorY ? _anchorY : 0);
    this.myFilters = null;
    this.pickerMaskData = null;
    this.fader = null;
    this.button = null;
    this.updateCallback = null;
    this.globalScale = null
}
Sprite.prototype = Object.create(PIXI.Sprite.prototype);
Sprite.prototype.constructor = Sprite;
Sprite.prototype.create = function(_parent, _type, _textureManager, _x, _y, _pcnt, _behind) {
    this.textures = _textureManager;
    this.animation = "default";
    this.frameIndex = 0;
    this.atEnd = false;
    this.animInterval = 0;
    this.animNextTick = 0;
    this.taskDone = false;
    this.setType(_type);
    this.myFilters = null;
    this.destroyTexture = false;
    this.updateCallback = null;
    if (this.key) {
        this.texture = this.textures.get(this.key);
        if (!this.texture && Main.debug) console.log("WARNING: unrecognised texture applied to Sprite " + this.key)
    }
    if (!_behind) _parent.addChild(this);
    else _parent.addChildAt(this, 0);
    if (_pcnt) {
        this.pcntx = _x || 0;
        this.pcnty = _y || 0
    } else {
        this.x = _x || 0;
        this.y = _y || 0
    }
    this.bounds = this.getBounds(false);
    this.getGlobalScale()
};
Sprite.prototype.destroy = function() {
    if (this.fader) {
        this.fader.destroy();
        this.fader = null
    }
    this.myFilters = null;
    this.pickerMaskData = null;
    this.globalScale = null;
    if (this.texture && this.destroyTexture) {
        this.texture.destroy({
            texture: true,
            baseTexture: true
        })
    }
    this.texture = null;
    this.textures = null;
    PIXI.Sprite.prototype.destroy.call(this);
    this.parent = null
};
Sprite.prototype.update = function(_ctx) {
    if (this._texture && !this._texture.orig) {
        console.log("_texture has no orig! " + this.key)
    }
    if (Main.resized) {
        this.getGlobalScale(true);
        if (!isNaN(this.percentx)) this.pcntx = this.percentx;
        if (!isNaN(this.percenty)) this.pcnty = this.percenty
    }
    if (this.fader) {
        this.alpha = this.fader.fadeValue;
        this.fader.fading(_ctx)
    }
    if (this.animInterval !== 0 && this.animNextTick !== 0) {
        if (Main.nowTime >= this.animNextTick) {
            this.animNextTick = Main.nowTime + this.animInterval;
            this.frameIndex++;
            if (this.frameIndex >= SpriteData[this.type].animations[this.animation].length) {
                this.atEnd = true;
                if (!this.noRepeat) this.frameIndex = 0;
                else this.frameIndex = SpriteData[this.type].animations[this.animation].length - 1
            }
            this.setFrame(SpriteData[this.type].animations[this.animation][this.frameIndex])
        }
    }
    if (this.updateCallback) {
        this.updateCallback(this)
    }
    return true
};
Sprite.prototype.addFilter = function(_filter) {
    if (!this.myFilters) {
        this.myFilters = []
    }
    if (this.myFilters.indexOf(_filter) === -1) {
        this.myFilters.push(_filter);
        this.filters = this.myFilters
    }
};
Sprite.prototype.removeFilter = function(_filter) {
    if (!this.myFilters) {
        this.filters = null;
        return
    }
    var i = this.myFilters.indexOf(_filter);
    if (i !== -1) {
        this.myFilters.splice(i, 1);
        this.filters = this.myFilters
    }
};
Sprite.prototype.setPickerData = function(_data) {
    this.pickerMaskData = _data
};
Sprite.prototype.setAnimation = function(_animation, _dontReset, _force) {
    if (_force || this.animation != _animation) {
        this.animation = _animation;
        this.atEnd = false;
        if (!_dontReset) this.frameIndex = 0;
        var a = SpriteData[this.type].animations;
        if (a) {
            this.setFrame(a[this.animation][this.frameIndex]);
            this.noRepeat = a.noRepeat;
            this.animInterval = a.interval;
            if (a.randomise) this.animNextTick = Main.nowTime + Math.floor(this.animInterval * Math.random());
            else this.animNextTick = Main.nowTime + this.animInterval;
            return true
        }
    }
    return false
};
Sprite.prototype.setFrame = function(_key, _force) {
    if (_force || this.key != _key) {
        this.key = _key;
        if (this.key) {
            this.texture = this.textures.get(_key);
            return true
        }
    }
    return false
};
Sprite.prototype.setType = function(_type) {
    if (_type != this.type) {
        this.type = _type;
        this.animation = "default";
        this.animInterval = 0;
        this.animNextTick = 0;
        this.frameIndex = 0;
        this.atEnd = false
    }
    if (!SpriteData[this.type]) this.setFrame(this.type);
    else {
        if (!this.setAnimation(this.animation, true, true)) {
            if (SpriteData[this.type].key) this.setFrame(SpriteData[this.type].key);
            else console.error("ERROR: Sprite.create there is no key or animations for _type: '" + _type + "'!")
        }
    }
};
Sprite.prototype.moveToFront = function() {
    var p = this.parent;
    p.removeChild(this);
    p.addChildAt(this, p.children.length)
};
Sprite.moveToFront = function(_sprite) {
    var p = _sprite.parent;
    p.removeChild(_sprite);
    p.addChildAt(_sprite, p.children.length)
};
Sprite.prototype.getGlobalScale = function(_recalc) {
    if (_recalc || this.globalScale === null) {
        var sx = 1;
        var sy = 1;
        var parent = this.parent;
        while (parent) {
            sx *= parent.scale.x;
            sy *= parent.scale.y;
            parent = parent.parent
        }
        this.globalScale = {
            x: sx,
            y: sy
        }
    }
    return this.globalScale
};
Sprite.getGlobalScale = function(_sprite) {
    var sx = 1;
    var sy = 1;
    var parent = _sprite.parent;
    while (parent) {
        sx *= parent.scale.x;
        sy *= parent.scale.y;
        parent = parent.parent
    }
    return {
        x: sx,
        y: sy
    }
};
Sprite.prototype.pixelPicker = function(_x, _y) {
    this.bounds = this.getBounds(false);
    if (_x < this.bounds.left || _x >= this.bounds.right) return 0;
    if (_y < this.bounds.top || _y >= this.bounds.bottom) return 0;
    this.getGlobalScale();
    var ix = Math.floor((_x - this.bounds.left) / this.globalScale.x) * 4 + 3;
    var iy = Math.floor((_y - this.bounds.top) / this.globalScale.y);
    var p = this.pickerMaskData[ix + iy * this.texture.frame.width * 4];
    if (p) return true;
    return false
};
Sprite.prototype.createCanvasFromTexture = function() {
    var canvas = document.createElement("canvas");
    canvas.width = this.texture.frame.width;
    canvas.height = this.texture.frame.height;
    var context = canvas.getContext("2d");
    context.drawImage(this.texture.baseTexture.source, this.texture.frame.x, this.texture.frame.y, this.texture.frame.width, this.texture.frame.height, 0, 0, this.texture.frame.width, this.texture.frame.height);
    return canvas
};
Sprite.prototype.setCallback = function(_fnc, _ctx, _arg) {
    this.fadeCallback = _fnc;
    this.fadeCtx = _ctx;
    this.fadeArg = _arg
};
Sprite.prototype.addFader = function(_dir, _start, _callback, _context, _args, _trigger) {
    this.fader = new FadeState;
    this.fader.setFade(_dir, _start, _callback, _context, _args, _trigger)
};
Sprite.prototype.getPixels = function() {
    var rt = PIXI.RenderTexture.create(this.texture._frame.width, this.texture._frame.height);
    Main.app.renderer.render(this, rt);
    return Main.app.renderer.extract.pixels(rt)
};
Object.defineProperties(Sprite.prototype, {
    scaleFactor: {
        get: function() {
            return this.scale.x
        },
        set: function(_first) {
            if (typeof _first == "number") {
                this.scale.x = _first;
                this.scale.y = _first
            } else {
                if (_first.hasOwnProperty("x")) {
                    this.scale.x = _first.x
                }
                if (_first.hasOwnProperty("y")) {
                    this.scale.y = _first.y
                }
            }
        }
    },
    pcntx: {
        set: function(_pcnt) {
            this.percentx = _pcnt;
            if (this.parent) {
                if (this.parent.texture.noFrame) {
                    this.x = _pcnt / this.parent.scale.x * Main.width
                } else this.x = _pcnt / this.parent.scale.x * this.parent.width
            }
        }
    },
    pcnty: {
        set: function(_pcnt) {
            this.percenty = _pcnt;
            if (this.parent) {
                if (this.parent.texture.noFrame) {
                    this.y = _pcnt / this.parent.scale.y * Main.height
                } else this.y = _pcnt / this.parent.scale.y * this.parent.height
            }
        }
    },
    setx: {
        set: function(_x) {
            this.x = _x;
            if (this.parent) this.percentx = _x / this.parent.width
        }
    },
    sety: {
        set: function(_y) {
            this.y = _y;
            if (this.parent) this.percenty = _y / this.parent.height
        }
    }
});

function Text(_text, _style) {
    PIXI.Text.call(this, _text, _style);
    this.x = 0;
    this.y = 0
}
Text.prototype = Object.create(PIXI.Text.prototype);
Text.prototype.constructor = Text;
Text.prototype.create = function(_parent, _x, _y, _pcnt) {
    _parent.addChild(this);
    if (_pcnt) {
        this.pcntx = _x || 0;
        this.pcnty = _y || 0
    } else {
        this.x = _x || 0;
        this.y = _y || 0
    }
};
Text.prototype.destroy = function() {
    PIXI.Text.prototype.destroy.call(this)
};
Text.prototype.update = function() {
    if (Main.resized) {
        if (!isNaN(this.percentx)) this.pcntx = this.percentx;
        if (!isNaN(this.percenty)) this.pcnty = this.percenty
    }
    return true
};
Object.defineProperties(Text.prototype, {
    scaleFactor: {
        get: function() {
            return this.scale
        },
        set: function(_first) {
            if (typeof _first == "number") {
                this.scale.x = _first;
                this.scale.y = _first
            } else {
                if (_first.hasOwnProperty("x")) {
                    this.scale.x = _first.x
                }
                if (_first.hasOwnProperty("y")) {
                    this.scale.y = _first.y
                }
            }
        }
    },
    pcntx: {
        set: function(_pcnt) {
            this.percentx = _pcnt;
            if (this.parent) {
                if (this.parent.texture.noFrame) {
                    this.x = _pcnt / this.parent.scale.x * Main.width
                } else {
                    this.x = _pcnt / this.parent.scale.x * this.parent.width
                }
            }
        }
    },
    pcnty: {
        set: function(_pcnt) {
            this.percenty = _pcnt;
            if (this.parent) {
                if (this.parent.texture.noFrame) {
                    this.y = _pcnt / this.parent.scale.y * Main.height
                } else {
                    this.y = _pcnt / this.parent.scale.y * this.parent.height
                }
            }
        }
    },
    setx: {
        set: function(_x) {
            this.x = _x;
            if (this.parent) {
                if (this.parent.texture.noFrame) {
                    this.percentx = _x / Main.width
                } else {
                    this.percentx = _x / this.parent.width
                }
            }
        }
    },
    sety: {
        set: function(_y) {
            this.y = _y;
            if (this.parent) {
                if (this.parent.texture.noFrame) {
                    this.percenty = _y / Main.height
                } else {
                    this.percenty = _y / this.parent.height
                }
            }
        }
    }
});

function Button(_type, _anchorX, _anchorY) {
    Sprite.call(this, _anchorX, _anchorY);
    this.textures = null;
    this.buttonType = _type || Button.TYPE_BUTTON;
    this.downDetected = true;
    this._toggled = "on";
    this.text = null;
    this.sfx = null;
    this.sfxHover = null;
    this.enabled = false;
    this.callbackMouseDown = null;
    this.updateCallback = null;
    this.callbackHover = null;
    this.callbackHoverOut = null
}
Button.TYPE_BUTTON = 1;
Button.TYPE_CHECKBOX = 2;
Button.TYPE_TOGGLE = 3;
Button.TYPE_NOLATCH = 4;
Button.prototype = Object.create(Sprite.prototype);
Button.prototype.constructor = Button;
Button.prototype.create = function(_parent, _type, _managers, _x, _y, _pcnt, _upKey, _overKey, _downKey, _downEvent, _overEvent, _upKey2, _overKey2, _downKey2, _downEvent2, _overEvent2) {
    this.managers = _managers;
    Sprite.prototype.create.call(this, _parent, _type, this.managers.textures, _x, _y, _pcnt);
    this.upKey = {
        on: _upKey,
        off: _upKey2
    };
    this.overKey = {
        on: _overKey,
        off: _overKey2
    };
    this.downKey = {
        on: _downKey,
        off: _downKey2
    };
    this.downEvent = {
        on: _downEvent,
        off: _downEvent2
    };
    this.overEvent = {
        on: _overEvent,
        off: _overEvent2
    };
    this.downDetected = true;
    this._toggled = "on";
    this.text = null;
    this.sfx = null;
    this.sfxHover = null;
    this.enabled = true;
    EventHandlers.registerCallback("mousedown", this.playSfx, {
        context: this
    })
};
Button.prototype.destroy = function() {
    EventHandlers.clearCallback("mousedown", this.playSfx);
    this.managers = null;
    Sprite.prototype.destroy.call(this);
    if (this.text) {
        this.text.destroy();
        this.text = null
    }
    this.upKey = this.overKey = this.downKey = this.downEvent = this.overEvent = null;
    this._toggled = null;
    this.sfx = this.sfxHover = null;
    this.callbackMouseDown = null;
    this.callbackHover = null;
    this.callbackHoverOut = null
};
Button.prototype.update = function() {
    var event = null;
    var o = false;
    var c = false;
    this.calculateBounds();
    var r = this.getBounds();
    if (Game.isDragging()) {
        return null
    }
    if (this.updateCallback) {
        this.updateCallback(this)
    }
    if (!Main.resized) {
        if (this.callbackMouseDown && Main.mouseDown && r.contains(Main.mouseDown.x, Main.mouseDown.y)) {
            this.callbackMouseDown.call(null)
        }
        if (this.buttonType == Button.TYPE_BUTTON || this.buttonType == Button.TYPE_NOLATCH) {
            c = this.downDetected && Main.mouseDown !== null && r.contains(Main.mouseDown.x, Main.mouseDown.y) || Main.click !== null && r.contains(Main.click.x, Main.click.y)
        } else {
            c = Main.click !== null && r.contains(Main.click.x, Main.click.y)
        }
        if (c) {
            Main.mouseDown = Main.click = null;
            this.setFrame(this.downKey[this._toggled]);
            if (this.enabled) {
                event = this.downEvent[this._toggled];
                if (event) EventSignals.signal(event)
            }
            o = true
        }
    } else if (Main.debug) {
        console.log("Ignoring mouse input on button, resize is pending")
    }
    if (!o && Main.hover) {
        if (r.contains(Main.hover.x, Main.hover.y)) {
            if (this.callbackHover) this.callbackHover.call(this);
            if (this.setFrame(this.overKey[this._toggled])) {
                if (this.sfxHover) this.managers.audio.play(this.sfxHover)
            }
            if (this.overEvent) {
                if (this.enabled) {
                    event = this.overEvent[this._toggled];
                    if (event) EventSignals.signal(event)
                }
            }
            o = true
        }
    }
    if (!o && this.buttonType != Button.TYPE_TOGGLE) {
        if (this.callbackHoverOut) this.callbackHoverOut.call(this);
        this.setFrame(this.upKey[this._toggled])
    }
    Sprite.prototype.update.call(this);
    if (this.text) {
        this.text.update()
    }
    return event
};
Button.prototype.playSfx = function(_x, _y) {
    if (this && this.managers && this.sfx && this.enabled) {
        this.calculateBounds();
        var r = this.getBounds();
        if (r.contains(_x, _y)) this.managers.audio.play(this.sfx)
    }
};
Object.defineProperties(Button.prototype, {
    toggled: {
        set: function(_state) {
            this._toggled = _state ? "on" : "off";
            this.setFrame(this.upKey[this._toggled])
        },
        get: function() {
            return this._toggled == "on"
        }
    }
});

function FadeState() {
    this.fadeValue = 0;
    this.fadedir = 0;
    this.trigger = undefined;
    this.direction = undefined;
    this.callback = null;
    this.context = null;
    this.args = null
}
FadeState.prototype.destroy = function() {
    this.callback = null;
    this.context = null;
    this.args = null
};
FadeState.prototype.setFade = function(_dir, _value, _callback, _context, _args, _trigger) {
    if (_dir !== null && _dir !== undefined) this.fadedir = _dir;
    if (_value !== null && _value !== undefined) this.fadeValue = _value;
    this.callback = _callback;
    this.context = _context;
    this.args = _args;
    if (_trigger !== null) {
        this.trigger = _trigger;
        if (this.trigger !== undefined) {
            if (this.fadeValue >= this.trigger) this.direction = -1;
            else this.direction = 1
        }
    }
};
FadeState.prototype.reached = function(_target) {
    return this.fadeValue == _target
};
FadeState.prototype.fading = function() {
    var ret = true;
    if (this.fadedir !== 0) {
        this.fadeValue += this.fadedir;
        if (isNaN(this.trigger) || this.direction === undefined) {
            if (this.fadeValue <= 0) {
                this.fadeValue = 0;
                this.fadedir = 0;
                if (Main.debug) console.log("FadeState: finished fading out");
                ret = false
            } else if (this.fadeValue >= 1) {
                this.fadeValue = 1;
                this.fadedir = 0;
                if (Main.debug) console.log("FadeState: finished fading in");
                ret = false
            }
        }
    }
    if (!isNaN(this.trigger) && this.direction !== undefined) {
        if (this.direction === -1) {
            if (this.fadeValue <= this.trigger) {
                if (this.callback.call(this.context, this.args)) {
                    this.callback = null;
                    return false
                }
            }
        } else {
            if (this.fadeValue >= this.trigger) {
                if (this.callback.call(this.context, this.args)) {
                    this.callback = null;
                    return false
                }
            }
        }
    }
    return ret
};

function Point(_x, _y) {
    this.x = _x || 0;
    this.y = _y || 0
}
Point.prototype.distance = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
};
Point.distance = function(_p1, _p2) {
    var dx = _p1.x - _p2.x;
    var dy = _p1.y - _p2.y;
    return Math.sqrt(dx * dx + dy * dy)
};
Point.angle = function(_p1, _p2) {
    var dx = _p1.x - _p2.x;
    var dy = _p1.y - _p2.y;
    return Math.atan2(dy, dx)
};
var EventSignals = {
    signalList: [],
    create: function() {
        signalList = []
    },
    destroy: function() {
        signalList = null
    },
    listen: function(_key, _callback, _context) {
        if (!signalList[_key]) signalList[_key] = [];
        var i = EventSignals.find(_key, _callback);
        if (i != -1) signalList[_key][i] = {
            callback: _callback,
            context: _context
        };
        else signalList[_key].push({
            callback: _callback,
            context: _context
        })
    },
    remove: function(_key, _callback) {
        if (_callback === undefined) {
            if (signalList[_key]) signalList[_key] = null;
            return
        }
        var i = EventSignals.find(_key, _callback);
        if (i != -1) {
            signalList[_key].splice(i, 1);
            if (signalList[_key].length == 0) signalList[_key] = null
        }
    },
    find: function(_key, _callback) {
        if (signalList[_key])
            for (var i = 0, l = signalList[_key].length; i < l; i++)
                if (signalList[_key][i].callback == _callback) return i;
        return -1
    },
    signal: function(_key) {
        if (signalList[_key])
            for (var i = 0, l = signalList[_key].length; i < l; i++) signalList[_key][i].callback.call(signalList[_key][i].context)
    }
};
Hermite.ACCURACY = 10;

function Hermite(p1x, p1y, p2x, p2y, v1x, v1y, v2x, v2y) {
    this._p1x = p1x;
    this._p1y = p1y;
    this._p2x = p2x;
    this._p2y = p2y;
    this._v1x = v1x;
    this._v1y = v1y;
    this._v2x = v2x;
    this._v2y = v2y;
    this._points = [];
    this.recalculate()
}
Hermite.prototype.recalculate = function() {
    this._ax = 2 * this._p1x - 2 * this._p2x + this._v1x + this._v2x;
    this._ay = 2 * this._p1y - 2 * this._p2y + this._v1y + this._v2y;
    this._bx = -3 * this._p1x + 3 * this._p2x - 2 * this._v1x - this._v2x;
    this._by = -3 * this._p1y + 3 * this._p2y - 2 * this._v1y - this._v2y;
    this.length = this.calculateEvenPoints()
};
Hermite.prototype.calculateEvenPoints = function() {
    var totalLength = 0;
    var pnt = new Point;
    var lastPnt = new Point(this._p1x, this._p1y);
    this._points[0] = 0;
    for (var i = 1; i <= Hermite.ACCURACY; i++) {
        this.getPoint(i / Hermite.ACCURACY, pnt);
        totalLength += pnt.distance(lastPnt);
        this._points[i] = totalLength;
        lastPnt.x = pnt.x;
        lastPnt.y = pnt.y
    }
    return totalLength
};
Hermite.prototype.findT = function(distance) {
    var ti = Math.floor(distance / this.length * Hermite.ACCURACY);
    while (ti > 0 && this._points[ti] > distance) ti--;
    while (ti < Hermite.ACCURACY && this._points[ti] < distance) ti++;
    var dt = this._points[ti] - this._points[ti - 1];
    var d = distance - this._points[ti - 1];
    return (ti - 1) / Hermite.ACCURACY + d / (dt * Hermite.ACCURACY)
};
Hermite.prototype.getPoint = function(t, point) {
    if (!point) point = new Point;
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    var t2 = t * t;
    var t3 = t * t2;
    point.x = t3 * this._ax + t2 * this._bx + t * this._v1x + this._p1x;
    point.y = t3 * this._ay + t2 * this._by + t * this._v1y + this._p1y;
    return point
};
Hermite.prototype.getPointWithDistance = function(distance, point) {
    if (distance <= 0) {
        point.x = this._p1x;
        point.y = this._p1y;
        return point
    }
    return this.getPoint(this.findT(distance), point)
};
Hermite.prototype.getAngle = function(t) {
    var p0 = this.getPoint(t - .01);
    var p1 = this.getPoint(t + .01);
    return Math.atan2(p1.y - p0.y, p1.x - p0.x)
};
Hermite.prototype.getAngleWithDistance = function(distance) {
    if (distance <= 0) return Math.atan2(this._v1y, this._v1x);
    return this.getAngle(this.findT(distance))
};
Hermite.prototype.getEntryTangent = function(point) {
    point.x = this._v1x;
    point.y = this._v1y
};
Hermite.prototype.draw = function(data, lx, ty, quality, samples, thickness, color, edges) {
    var point = new Point;
    samples = samples | 10;
    thickness = (thickness | 1) * quality;
    color = color | 1;
    for (var i = 0; i <= samples; i++) {
        var t = i / samples;
        this.getPoint(t, point);
        var ix = Math.floor((lx + point.x) * quality);
        var iy = Math.floor((ty + point.y) * quality);
        if (i == 0) this.moveTo(ix, iy);
        else this.lineTo(data, ix, iy, thickness, color, edges)
    }
};
Hermite.prototype.moveTo = function(x, y) {
    this.px = x;
    this.py = y
};
Hermite.prototype.lineTo = function(data, x, y, thickness, color, edges) {
    this._drawLine(data, this.px, this.py, x, y, thickness, color, edges);
    this.px = x;
    this.py = y
};
Hermite.prototype._drawCircle = function(data, x, y, diameter, color) {
    if (diameter == 1) {
        if (data[x] !== undefined && data[x][y] !== undefined) data[x][y] = color;
        return
    }
    var radius = diameter >> 1;
    var r2 = radius * radius;
    var area = r2 << 2;
    var rr = radius << 1;
    for (var i = 0; i < area; i++) {
        var tx = i % rr - radius;
        var ty = Math.floor(i / rr) - radius;
        if (tx * tx + ty * ty <= r2) {
            if (data[x + tx] !== undefined && data[x + tx][y + ty] !== undefined) data[x + tx][y + ty] = color
        }
    }
};
Hermite.prototype._drawLine = function(data, x0, y0, x1, y1, thickness, color, edges) {
    var dx = Math.abs(x1 - x0);
    var dy = Math.abs(y1 - y0);
    var sx = x0 < x1 ? 1 : -1;
    var sy = y0 < y1 ? 1 : -1;
    var err = dx - dy;
    while (true) {
        this._drawCircle(data, x0, y0, thickness, color);
        if (edges) edges.push([x0, y0]);
        if (x0 == x1 && y0 == y1) break;
        var e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy
        }
    }
};
JigsawPiece.edges = {
    TOP: 0,
    LEFT: 1,
    BOTTOM: 2,
    RIGHT: 3
};
JigsawPiece.margin = 4;
JigsawPiece.prototype.shape = null;
JigsawPiece.prototype.description = null;

function JigsawPiece(managers, x, y, wide, high, tl, tr, bl, br, description) {
    this.managers = managers;
    this.description = description;
    var left = x == 0;
    var top = y == 0;
    var right = x == description.width - 1;
    var bottom = y == description.height - 1;
    this.shape = [];
    this.gridPixelX = Math.floor(x * wide);
    this.gridPixelY = Math.floor(y * high);
    this.limits = null;
    this.shape[JigsawPiece.edges.RIGHT] = [];
    this.shape[JigsawPiece.edges.BOTTOM] = [];
    var width = Point.distance(tl, tr);
    var height = Point.distance(tl, bl);
    if (left) {
        this.shape[JigsawPiece.edges.LEFT] = [];
        this.shape[JigsawPiece.edges.LEFT][0] = new Hermite(tl.x - this.gridPixelX, tl.y - this.gridPixelY, bl.x - this.gridPixelX, bl.y - this.gridPixelY, 0, height * .25, 0, height * .25)
    }
    if (top) {
        this.shape[JigsawPiece.edges.TOP] = [];
        this.shape[JigsawPiece.edges.TOP][0] = new Hermite(tl.x - this.gridPixelX, tl.y - this.gridPixelY, tr.x - this.gridPixelX, tr.y - this.gridPixelY, width * .25, 0, width * .25, 0)
    }
    if (right) this.shape[JigsawPiece.edges.RIGHT][0] = new Hermite(tr.x - this.gridPixelX, tr.y - this.gridPixelY, br.x - this.gridPixelX, br.y - this.gridPixelY, 0, height * .25, 0, height * .25);
    else this.shape[JigsawPiece.edges.RIGHT] = this.createNubEdge(tr.x - this.gridPixelX, tr.y - this.gridPixelY, br.x - this.gridPixelX, br.y - this.gridPixelY);
    if (bottom) this.shape[JigsawPiece.edges.BOTTOM][0] = new Hermite(bl.x - this.gridPixelX, bl.y - this.gridPixelY, br.x - this.gridPixelX, br.y - this.gridPixelY, width * .25, 0, width * .25, 0);
    else this.shape[JigsawPiece.edges.BOTTOM] = this.createNubEdge(bl.x - this.gridPixelX, bl.y - this.gridPixelY, br.x - this.gridPixelX, br.y - this.gridPixelY);
    this.gx = this.gy = 0
}
JigsawPiece.prototype.createNubEdge = function(sx, sy, ex, ey) {
    var list = [];
    var scale = Math.sqrt((ex - sx) * (ex - sx) + (ey - sy) * (ey - sy)) / this.description.length;
    var angle = Math.atan2(ey - sy, ex - sx);
    if (Math.random() < .5) {
        angle += Math.PI;
        sx = ex;
        sy = ey;
        list.push(true)
    } else {
        list.push(false)
    }
    var pl = this.description.pointList.length;
    for (var i = 0; i < pl - 1; i++) {
        var pnt1 = this.rotate(this.description.pointList[i], angle - this.description.angle);
        var pnt2 = this.rotate(this.description.pointList[i + 1], angle - this.description.angle);
        list.push(new Hermite(pnt1.x * scale + sx, pnt1.y * scale + sy, pnt2.x * scale + sx, pnt2.y * scale + sy, pnt1.vx * scale, pnt1.vy * scale, pnt2.vx * scale, pnt2.vy * scale))
    }
    return list
};
JigsawPiece.prototype.rotate = function(a, angle) {
    var r = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0
    };
    var ca = Math.cos(angle);
    var sa = Math.sin(angle);
    r.x = a.x * ca - a.y * sa;
    r.y = a.y * ca + a.x * sa;
    r.vx = a.vx * ca - a.vy * sa;
    r.vy = a.vy * ca + a.vx * sa;
    return r
};
JigsawPiece.prototype.findInteriorPoint = function() {
    var b1 = this.shape[JigsawPiece.edges.BOTTOM][0];
    var l1 = this.shape[JigsawPiece.edges.BOTTOM].length;
    if (b1 === true) var c1 = this.shape[JigsawPiece.edges.BOTTOM][1];
    else c1 = this.shape[JigsawPiece.edges.BOTTOM][l1 - 1];
    var p1 = c1.getPoint(.5);
    var b2 = this.shape[JigsawPiece.edges.RIGHT][0];
    var l2 = this.shape[JigsawPiece.edges.RIGHT].length;
    if (b2 === true) var c2 = this.shape[JigsawPiece.edges.RIGHT][1];
    else c2 = this.shape[JigsawPiece.edges.RIGHT][l2 - 1];
    var p2 = c2.getPoint(.5);
    var p = new Point((p1.x + p2.x) * .5, (p1.y + p2.y) * .5);
    p.x = Math.floor(p.x + this.gridPixelX + .5);
    p.y = Math.floor(p.y + this.gridPixelY + .5);
    return p
};
JigsawPiece.prototype._drawEdges = function(data, lx, ty, quality, thickness, color, edges) {
    for (var i in this.shape) {
        if (this.shape.hasOwnProperty(i)) {
            var curves = this.shape[i];
            for (var j in curves) {
                if (curves.hasOwnProperty(j)) {
                    if (typeof curves[j] !== "boolean") {
                        curves[j].draw(data, lx, ty, quality, 10, thickness, color, edges)
                    }
                }
            }
        }
    }
};
JigsawPiece.prototype.createPiece = function(index, edgeDataTable, edgeDataWidth, edgeDataHeight, quality, gx, gy) {
    this.gx = gx;
    this.gy = gy;
    var start = this.findInteriorPoint();
    var fill = floodFill(edgeDataTable, start.x * quality, start.y * quality, edgeDataWidth * quality, edgeDataHeight * quality);
    if (!fill) {
        console.log("ERROR: floodFill failed!");
        return null
    }
    this.limits = {
        minx: fill.minx,
        maxx: fill.maxx,
        miny: fill.miny,
        maxy: fill.maxy
    };
    var wide = this.limits.maxx - this.limits.minx + JigsawPiece.margin;
    var high = this.limits.maxy - this.limits.miny + JigsawPiece.margin;
    if (wide <= JigsawPiece.margin || high <= JigsawPiece.margin) {
        console.log("ERROR: floodFill did not find any pixels!", fill.list.length, wide, high);
        return null
    }
    var key = "jigsaw_piece_" + index.toString();
    if (this.managers.textures.exists(key)) this.managers.textures.remove(key);
    var base = Textures.createCanvas(key, wide, high);
    var bctx = base.getContext("2d");
    bctx.clearRect(0, 0, wide, high);
    var imgData = bctx.getImageData(0, 0, wide, high);
    var pixels = imgData.data;
    for (var i = 0, l = fill.list.length; i < l; i++) {
        var x = Math.floor(fill.list[i][0]);
        var y = Math.floor(fill.list[i][1]);
        var pix = Textures.getPixel(JigsawPiece.srcPixels, Math.floor(x / quality), Math.floor(y / quality), JigsawPiece.srcWidth);
        var pi = (x + JigsawPiece.margin / 2 - this.limits.minx + (y + JigsawPiece.margin / 2 - this.limits.miny) * wide) * 4;
        pixels[pi + 0] = pix.r;
        pixels[pi + 1] = pix.g;
        pixels[pi + 2] = pix.b;
        pixels[pi + 3] = 255
    }
    bctx.putImageData(imgData, 0, 0);
    this.drawEdgeHighlights(bctx, wide, high, quality);
    return {
        key: key,
        canvas: base,
        wide: wide,
        high: high,
        drawX: this.limits.minx - JigsawPiece.margin / 2,
        drawY: this.limits.miny - JigsawPiece.margin / 2
    }
};
JigsawPiece.prototype.drawEdgeHighlights = function(bctx, wide, high, quality) {
    var offset = quality + 5;
    var imgData = bctx.getImageData(0, 0, wide, high);
    for (var i = 0, l = this.edgePixels.length; i < l; i++) {
        var px = this.edgePixels[i][0] + JigsawPiece.margin / 2 - this.limits.minx;
        var py = this.edgePixels[i][1] + JigsawPiece.margin / 2 - this.limits.miny;
        bctx.globalAlpha = .5;
        setPixel(bctx, px, py, "#000000");
        var pi = (px - offset + (py - offset) * wide) * 4;
        if (px - offset < 0 || py - offset < 0 || imgData.data[pi + 3] == 0) {
            pi = (px + (py + quality * 2) * wide) * 4;
            if (pi < wide * high * 4 && imgData.data[pi + 3] != 0) {
                pi = (px + offset + (py + offset) * wide) * 4;
                if (imgData.data[pi + 3] != 0) {
                    bctx.globalAlpha = .05;
                    drawCircle(bctx, px + quality + 2, py + quality, quality * 2, "#ffffff");
                    drawCircle(bctx, px + quality + 2, py + quality, 1, "#ffffff")
                }
            }
        }
        pi = (px + offset + (py + offset) * wide) * 4;
        if (px + offset >= wide || py + offset >= high || imgData.data[pi + 3] == 0) {
            pi = (px - quality + (py - (quality + 2)) * wide) * 4;
            if (px - quality > 0 && py - (quality + 2) > 0 && imgData.data[pi + 3] != 0) {
                pi = (px - offset + (py - offset) * wide) * 4;
                if (imgData.data[pi + 3] != 0) {
                    bctx.globalAlpha = .05;
                    drawCircle(bctx, px, py, quality + 2, "#000000");
                    drawCircle(bctx, px, py, 2, "#000000")
                }
            }
        }
    }
    bctx.globalAlpha = 1
};
JigsawPiece.createJigsawPieceEdges = function(managers, srcImage, description, edges, pixelsWide, pixelsHigh) {
    JigsawPiece.srcPixels = Textures.getPixels(srcImage);
    JigsawPiece.srcWidth = srcImage.width;
    var pieces = [];
    var piecesWide = description.width;
    var piecesHigh = description.height;
    var wide = pixelsWide / piecesWide;
    var high = pixelsHigh / piecesHigh;
    var grid = [];
    for (var x = 0; x <= piecesWide; x++) {
        grid[x] = [];
        for (var y = 0; y <= piecesHigh; y++) {
            var rx = 0;
            var ry = 0;
            if (x > 0 && x < piecesWide) rx = (Math.random() - .5) * description.jitterX * wide;
            if (y > 0 && y < piecesHigh) ry = (Math.random() - .5) * description.jitterY * high;
            grid[x][y] = new Point(x * wide + rx, y * high + ry)
        }
    }
    var pi = 0;
    for (y = 0; y < piecesHigh; y++) {
        for (x = 0; x < piecesWide; x++) {
            pieces[pi++] = new JigsawPiece(managers, x, y, wide, high, grid[x][y], grid[x + 1][y], grid[x][y + 1], grid[x + 1][y + 1], description)
        }
    }
    for (x = 0; x < pixelsWide * description.quality; x++) {
        edges[x] = [];
        for (y = 0; y < pixelsHigh * description.quality; y++) edges[x][y] = 0
    }
    var lx = 0,
        ty = 0;
    pi = 0;
    for (y = 0; y < piecesHigh; y++) {
        for (x = 0; x < piecesWide; x++) {
            lx = Math.floor(x * wide);
            ty = Math.floor(y * high);
            var piece = pieces[pi++];
            piece.edgePixels = [];
            piece._drawEdges(edges, lx, ty, description.quality, 1, 1, piece.edgePixels)
        }
    }
    return pieces
};

function floodFill(pixels, x, y, width, height) {
    var fill = {
        list: [],
        minx: x,
        maxx: x,
        miny: y,
        maxy: y
    };
    var pixel_stack = [{
        x: x,
        y: y
    }];
    while (pixel_stack.length > 0) {
        var new_pixel = pixel_stack.shift();
        var px = new_pixel.x;
        var py = new_pixel.y;
        while (py-- >= 0 && pixels[px][py] == 0) {}
        py++;
        var reached_left = false;
        var reached_right = false;
        while (py++ < height) {
            var p = pixels[px][py];
            if (p == 2) break;
            if (px < fill.minx) fill.minx = px;
            if (px > fill.maxx) fill.maxx = px;
            if (py < fill.miny) fill.miny = py;
            if (py > fill.maxy) fill.maxy = py;
            if (p == 0) {
                pixels[px][py] = 2;
                fill.list.push([px, py])
            } else if (p == 1) {
                pixels[px][py] = 2;
                fill.list.push([px, py]);
                break
            }
            if (px > 0) {
                var p = pixels[px - 1][py];
                if (p == 0) {
                    if (!reached_left) {
                        pixel_stack.push({
                            x: px - 1,
                            y: py
                        });
                        reached_left = true
                    }
                } else if (reached_left && p != 2) {
                    reached_left = false
                }
            }
            if (px < width - 1) {
                var p = pixels[px + 1][py];
                if (p == 0) {
                    if (!reached_right) {
                        pixel_stack.push({
                            x: px + 1,
                            y: py
                        });
                        reached_right = true
                    }
                } else if (reached_right && p != 2) {
                    reached_right = false
                }
            }
        }
    }
    return fill
}

function drawCircle(ctx, x, y, r, colour) {
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r, 0, 0, Math.PI * 2);
    ctx.fill()
}

function setPixel(ctx, x, y, colour) {
    ctx.fillStyle = colour;
    ctx.fillRect(Math.floor(x), Math.floor(y), 2, 2)
}(function() {
    if (CanvasRenderingContext2D.prototype.ellipse == undefined) {
        CanvasRenderingContext2D.prototype.ellipse = function(x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
            this.save();
            this.translate(x, y);
            this.rotate(rotation);
            this.scale(radiusX, radiusY);
            this.arc(0, 0, 1, startAngle, endAngle, antiClockwise);
            this.restore()
        }
    }
})();

function Jigsaw(_managers) {
    this.managers = _managers;
    this.edges = null;
    this.pieces = null;
    this.description = null;
    this.sourceImage = null;
    this.gx = this.gy = 0;
    this.pieceIndex = 0;
    this.puzzleSolved = null;
    this.piecesWide = 0;
    this.piecesHigh = 0;
    this.jsonName = "";
    this.quality = 0;
    this.cornerJitterX = 0;
    this.cornerJitterY = 0;
    this.topLeftPiece = null;
    this.uiBoxes = null
}
Jigsaw.prototype.create = function(_parent, _key, _piecesWide, _piecesHigh) {
    this.parent = _parent;
    this.name = _key;
    this.piecesWide = _piecesWide;
    this.piecesHigh = _piecesHigh;
    this.jsonName = "regularPieces";
    if (PIXI.utils.isMobile.any || Main.isIE) this.quality = 1;
    else this.quality = 2;
    this.cornerJitterX = .2;
    this.cornerJitterY = .2;
    this.sourceImage = new PIXI.Sprite(this.managers.textures.get(_key));
    this.sourceImage.x = this.sourceImage.y = -3e3;
    if (Main.debug) {
        console.log("source image: " + _key + " size: " + this.sourceImage.width + "x" + this.sourceImage.height);
        console.log("pieces: " + this.piecesWide + "x" + this.piecesHigh + " nub shape: " + this.jsonName);
        console.log("quality: " + this.quality + " corner jitter: " + this.cornerJitterX + "," + this.cornerJitterY)
    }
    this.parseJSON(this.jsonName);
    this.edges = [];
    this.pieces = JigsawPiece.createJigsawPieceEdges(this.managers, this.sourceImage, this.description, this.edges, this.sourceImage.width, this.sourceImage.height);
    this.gx = 0;
    this.gy = 0;
    this.pieceIndex = 0;
    this.puzzleSolved = []
};
Jigsaw.prototype.addUiBox = function(_x, _y, _wide, _high) {
    if (!this.uiBoxes) this.uiBoxes = [];
    this.uiBoxes.push({
        x: _x,
        y: _y,
        wide: _wide,
        high: _high
    })
};
Jigsaw.prototype.destroy = function() {
    if (this.pieces) {
        for (var i = 0, pl = this.pieces.length; i < pl; i++) {
            this.pieces[i].sprite.destroy();
            this.pieces[i] = null
        }
    }
    if (this.sourceImage) {
        this.sourceImage.destroy();
        this.sourceImage = null
    }
    this.uiBoxes = null;
    this.description = null;
    this.edges = null;
    this.pieces = null;
    this.parent = null;
    this.managers = null
};
Jigsaw.prototype.parseJSON = function(jsonName) {
    this.description = this.managers.data.get(jsonName);
    var pl = this.description.pointList.length;
    this.description.length = Point.distance(this.description.pointList[pl - 1], this.description.pointList[0]);
    this.description.angle = Point.angle(this.description.pointList[pl - 1], this.description.pointList[0]);
    this.description.width = this.piecesWide;
    this.description.height = this.piecesHigh;
    this.description.jitterX = this.cornerJitterX;
    this.description.jitterY = this.cornerJitterY;
    this.description.quality = this.quality
};
Jigsaw.prototype.buildOnePiece = function() {
    var piece = this.pieces[this.pieceIndex];
    if (piece) {
        piece.data = piece.createPiece(this.pieceIndex++, this.edges, this.sourceImage.width, this.sourceImage.height, this.quality, this.gx, this.gy);
        if (piece.data) {
            var texture = this.managers.textures.new(piece.data.key, piece.data.canvas.width, piece.data.canvas.height);
            this.managers.textures.set(piece.data.key, piece.data.canvas);
            piece.sprite = new Sprite;
            piece.sprite.create(this.parent, piece.data.key, this.managers.textures);
            piece.sprite.visible = false;
            piece.sprite.scale.set(1 / this.quality);
            piece.sprite.originalScale = 1 / this.quality;
            if (Main.debugSpam) console.log(piece.data.key + " at " + piece.data.drawX, piece.data.drawY);
            if (++this.gx >= this.piecesWide) {
                this.gx = 0;
                this.gy++
            }
            return piece.sprite
        } else {
            console.warn("Jigsaw Piece " + this.pieceIndex + " failed to create properly!")
        }
    }
    return null
};
Jigsaw.prototype.scatter = function(_pieceGuide, _boundsInner, _boundsOuter, _solvedScale) {
    var pl = this.pieces.length;
    var randomIndices = [];
    var widest = 0,
        tallest = 0;
    for (var i = 0; i < pl; i++) {
        var piece = this.pieces[i];
        var sprite = piece.sprite;
        if (piece.data.wide > widest) widest = piece.data.wide;
        if (piece.data.high > tallest) tallest = piece.data.high;
        randomIndices[i] = i;
        sprite.startTweenPos = {
            x: sprite.x,
            y: sprite.y
        }
    }
    Utils.shuffleList(randomIndices);
    var x = 0,
        y = 0;
    var lx = (_boundsOuter.width - _pieceGuide.width) / 2 / 2;
    var ty = (_boundsOuter.height - _pieceGuide.height) / 2 / 2;
    var rx = _boundsOuter.width - lx;
    var by = _boundsOuter.height - ty;
    var sx = widest + 4,
        sy = tallest + 4;
    var scale = 1;
    if (Main.debug) console.log("pieces: widest " + widest + " tallest " + tallest);
    if (Main.isPortrait) {
        switch (pl) {
            case 9:
                scale = _boundsOuter.width / 7 / sx;
                y = ty;
                var blocked = Jigsaw.findBlockedRow(y, tallest * scale, this.uiBoxes, _boundsOuter.width);
                var wide = blocked.rx - blocked.lx;
                sx = wide / 6;
                x = blocked.lx + sx;
                for (var i = 0; i < 5; i++) {
                    var piece = this.pieces[randomIndices[i]];
                    var sprite = piece.sprite;
                    sprite.x = x;
                    sprite.y = y;
                    x += sx
                }
                y = by;
                blocked = Jigsaw.findBlockedRow(y, tallest * scale, this.uiBoxes, _boundsOuter.width);
                var wide = blocked.rx - blocked.lx;
                sx = wide / 5;
                x = blocked.lx + sx;
                for (var i = 5; i < 9; i++) {
                    var piece = this.pieces[randomIndices[i]];
                    var sprite = piece.sprite;
                    sprite.x = x;
                    sprite.y = y;
                    x += sx
                }
                break;
            case 16:
                scale = _boundsOuter.width / 7 / sx;
                while (sy * scale * 2 > .9 * (_boundsOuter.height - _boundsInner.height) / 2) scale *= .99;
                for (var j = 0; j < 2; j++) {
                    y = ty + sy * scale * (j - .5);
                    var blocked = Jigsaw.findBlockedRow(y, tallest * scale, this.uiBoxes, _boundsOuter.width);
                    var wide = blocked.rx - blocked.lx;
                    sx = wide / 5;
                    x = blocked.lx + sx;
                    for (var i = 0; i < 4; i++) {
                        var piece = this.pieces[randomIndices[i + j * 4]];
                        var sprite = piece.sprite;
                        sprite.x = x;
                        sprite.y = y;
                        x += sx
                    }
                }
                for (var j = 0; j < 2; j++) {
                    y = by + sy * scale * (j - .5);
                    blocked = Jigsaw.findBlockedRow(y, tallest * scale, this.uiBoxes, _boundsOuter.width);
                    var wide = blocked.rx - blocked.lx;
                    sx = wide / 5;
                    x = blocked.lx + sx;
                    for (var i = 0; i < 4; i++) {
                        var piece = this.pieces[randomIndices[i + 8 + j * 4]];
                        var sprite = piece.sprite;
                        sprite.x = x;
                        sprite.y = y;
                        x += sx
                    }
                }
                break;
            case 25:
                scale = _boundsOuter.width / 7 / sx;
                while (sy * scale * 3 > .9 * (_boundsOuter.height - _boundsInner.height) / 2) scale *= .99;
                for (var j = 0; j < 3; j++) {
                    y = ty + sy * scale * (j - 1);
                    var blocked = Jigsaw.findBlockedRow(y, tallest * scale, this.uiBoxes, _boundsOuter.width);
                    var wide = blocked.rx - blocked.lx;
                    var add = j == 2 ? 1 : 0;
                    sx = wide / (5 + add);
                    x = blocked.lx + sx;
                    for (var i = 0; i < 4 + add; i++) {
                        var piece = this.pieces[randomIndices[i + j * 4]];
                        var sprite = piece.sprite;
                        sprite.x = x;
                        sprite.y = y;
                        x += sx
                    }
                }
                for (var j = 0; j < 3; j++) {
                    y = by + sy * scale * (j - 1);
                    blocked = Jigsaw.findBlockedRow(y, tallest * scale, this.uiBoxes, _boundsOuter.width);
                    var wide = blocked.rx - blocked.lx;
                    sx = wide / 5;
                    x = blocked.lx + sx;
                    for (var i = 0; i < 4; i++) {
                        var piece = this.pieces[randomIndices[i + 13 + j * 4]];
                        var sprite = piece.sprite;
                        sprite.x = x;
                        sprite.y = y;
                        x += sx
                    }
                }
                break
        }
    } else {
        switch (pl) {
            case 9:
                scale = _boundsOuter.height / 7 / sy;
                x = lx;
                var blocked = Jigsaw.findBlockedColumn(x, widest * scale, this.uiBoxes, _boundsOuter.height);
                var high = blocked.by - blocked.ty;
                sy = high / 6;
                y = blocked.ty + sy;
                for (var i = 0; i < 5; i++) {
                    var piece = this.pieces[randomIndices[i]];
                    var sprite = piece.sprite;
                    sprite.x = x;
                    sprite.y = y;
                    y += sy
                }
                x = rx;
                var blocked = Jigsaw.findBlockedColumn(x, widest * scale, this.uiBoxes, _boundsOuter.height);
                var high = blocked.by - blocked.ty;
                sy = high / 5;
                y = blocked.ty + sy;
                for (var i = 5; i < 9; i++) {
                    var piece = this.pieces[randomIndices[i]];
                    var sprite = piece.sprite;
                    sprite.x = x;
                    sprite.y = y;
                    y += sy
                }
                break;
            case 16:
                scale = _boundsOuter.height / 7 / sx;
                while (sx * scale * 2 > .9 * (_boundsOuter.width - _boundsInner.width) / 2) scale *= .99;
                for (var j = 0; j < 2; j++) {
                    x = lx + sx * scale * (j - .5);
                    var blocked = Jigsaw.findBlockedColumn(x, widest * scale, this.uiBoxes, _boundsOuter.height);
                    var high = blocked.by - blocked.ty;
                    sy = high / 5;
                    y = blocked.ty + sy;
                    for (var i = 0; i < 4; i++) {
                        var piece = this.pieces[randomIndices[i + j * 4]];
                        var sprite = piece.sprite;
                        sprite.x = x;
                        sprite.y = y;
                        y += sy
                    }
                }
                for (var j = 0; j < 2; j++) {
                    x = rx + sx * scale * (j - .5);
                    blocked = Jigsaw.findBlockedColumn(x, widest * scale, this.uiBoxes, _boundsOuter.height);
                    var high = blocked.by - blocked.ty;
                    sy = high / 5;
                    y = blocked.ty + sy;
                    for (var i = 0; i < 4; i++) {
                        var piece = this.pieces[randomIndices[i + 8 + j * 4]];
                        var sprite = piece.sprite;
                        sprite.x = x;
                        sprite.y = y;
                        y += sy
                    }
                }
                break;
            case 25:
                scale = _boundsOuter.height / 7 / sx;
                while (sx * scale * 3 > .9 * (_boundsOuter.width - _boundsInner.width) / 2) scale *= .99;
                for (var j = 0; j < 3; j++) {
                    x = lx + sx * scale * (j - 1);
                    var blocked = Jigsaw.findBlockedColumn(x, widest * scale, this.uiBoxes, _boundsOuter.height);
                    var high = blocked.by - blocked.ty;
                    var add = j == 2 ? 1 : 0;
                    sy = high / (5 + add);
                    y = blocked.ty + sy;
                    for (var i = 0; i < 4 + add; i++) {
                        var piece = this.pieces[randomIndices[i + j * 4]];
                        var sprite = piece.sprite;
                        sprite.x = x;
                        sprite.y = y;
                        y += sy
                    }
                }
                for (var j = 0; j < 3; j++) {
                    x = rx + sx * scale * (j - 1);
                    blocked = Jigsaw.findBlockedColumn(x, widest * scale, this.uiBoxes, _boundsOuter.height);
                    var high = blocked.by - blocked.ty;
                    sy = high / 5;
                    y = blocked.ty + sy;
                    for (var i = 0; i < 4; i++) {
                        var piece = this.pieces[randomIndices[i + 13 + j * 4]];
                        var sprite = piece.sprite;
                        sprite.x = x;
                        sprite.y = y;
                        y += sy
                    }
                }
                break
        }
    }
    for (var i = 0; i < pl; i++) {
        var piece = this.pieces[i];
        var sprite = piece.sprite;
        sprite.widest = widest;
        sprite.tallest = tallest;
        var w = widest / 2,
            t = tallest / 2;
        sprite.radius = Math.sqrt(w * w + t * t);
        if (!this.puzzleSolved[piece.gx] || !this.puzzleSolved[piece.gx][piece.gy]) {
            sprite.scale.set(scale, scale);
            sprite.onTableX = sprite.x - _boundsOuter.width / 2 - widest / 2 * scale;
            sprite.onTableY = sprite.y - _boundsOuter.height / 2 - tallest / 2 * scale;
            if (!this.topLeftPiece || sprite.onTableX + sprite.onTableY <= this.topLeftPiece.sprite.onTableX + this.topLeftPiece.sprite.onTableY) {
                this.topLeftPiece = piece
            }
            sprite.x = sprite.startTweenPos.x;
            sprite.y = sprite.startTweenPos.y;
            sprite.scaleOnTable = scale;
            var wx = widest / 2 - sprite._texture.width / 2;
            if (wx > 0) sprite.onTableX += wx * scale;
            var wy = tallest / 2 - sprite._texture.height / 2;
            if (wy > 0) sprite.onTableY += wy * scale;
            var _that = this;
            new TWEEN.Tween(sprite).to({
                x: sprite.onTableX,
                y: sprite.onTableY,
                rotation: 0
            }, 250).onComplete(function() {
                _that.managers.audio.play(["snd_pieceLand1", "snd_pieceLand2", "snd_pieceLand3", "snd_pieceLand4"])
            }).start()
        } else {
            sprite.scale.set(sprite.originalScale * _solvedScale.x);
            sprite.x = piece.data.drawX * sprite.scale.x - _pieceGuide.width / 2;
            sprite.y = piece.data.drawY * sprite.scale.y - _pieceGuide.height / 2
        }
    }
};
Jigsaw.prototype.hidePieces = function() {
    var pl = this.pieces.length;
    for (var i = 0; i < pl; i++) {
        var piece = this.pieces[i];
        var sprite = piece.sprite;
        sprite.visible = false
    }
};
Jigsaw.prototype.clickedPiece = function(_x, _y) {
    var found = this.findNearestPiece(_x, _y);
    if (found.index != -1) {
        var index = found.index;
        var sprite = this.pieces[index].sprite;
        if (found.nearest < sprite.radius * sprite.scale.x) {
            return this.pieces[index]
        }
    }
    return null
};
Jigsaw.prototype.pieceSnap = function(_piece, _scale) {
    var sprite = _piece.sprite;
    var sx = _piece.data.drawX * _scale.x - this.pieceGuide.width / 2;
    var sy = _piece.data.drawY * _scale.y - this.pieceGuide.height / 2;
    var dx = sprite.x - sx;
    var dy = sprite.y - sy;
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d < Game.snapRange) return {
        x: sx,
        y: sy
    };
    return null
};
Jigsaw.prototype.findNearestPiece = function(_x, _y) {
    var nearest2 = Number.MAX_VALUE;
    var index = -1;
    var pl = this.pieces.length;
    for (var i = 0; i < pl; i++) {
        var sprite = this.pieces[i].sprite;
        var sx = sprite.x + sprite.radius * sprite.scale.x;
        var sy = sprite.y + sprite.radius * sprite.scale.y;
        var dx = sx - _x;
        var dy = sy - _y;
        var d2 = dx * dx + dy * dy;
        if (d2 < nearest2) {
            nearest2 = d2;
            index = i
        }
    }
    return {
        index: index,
        nearest: Math.sqrt(nearest2)
    }
};
Jigsaw.prototype.piecePlaced = function(_piece) {
    if (!this.puzzleSolved[_piece.gx]) this.puzzleSolved[_piece.gx] = [];
    this.puzzleSolved[_piece.gx][_piece.gy] = true;
    return this.puzzleComplete()
};
Jigsaw.prototype.puzzleComplete = function() {
    for (var y = 0; y < this.piecesHigh; y++)
        for (var x = 0; x < this.piecesWide; x++)
            if (!this.puzzleSolved[x] || !this.puzzleSolved[x][y]) return false;
    return true
};
Jigsaw.isClear = function(_x, _y, _radiusx, _radiusy, _list) {
    var l = _x - _radiusx;
    var r = _x + _radiusx;
    var t = _y - _radiusy;
    var b = _y + _radiusy;
    for (var i = 0; i < _list.length; i++) {
        var box = _list[i];
        if (l >= box.x + box.wide) continue;
        if (r < box.x) continue;
        if (t >= box.y + box.high) continue;
        if (b < box.y) continue;
        return false
    }
    return true
};
Jigsaw.isBetween = function(_x, _y, _radius, _boundsInner, _boundsOuter) {
    var l = (_boundsOuter.width - _boundsInner.width) / 2;
    var r = l + _boundsInner.width;
    var t = (_boundsOuter.height - _boundsInner.height) / 2;
    var b = t + _boundsInner.height;
    return !(_x + _radius >= l && _x - _radius < r && _y + _radius >= t && _y - _radius < b) && (_x - _radius >= 0 && _x + _radius < _boundsOuter.width && _y - _radius >= 0 && _y + _radius < _boundsOuter.height)
};
Jigsaw.findBlockedRow = function(_y, _biggest, _list, _width) {
    var x = 0;
    while (!Jigsaw.isClear(x, _y, 2, _biggest / 2, _list)) {
        x++
    }
    var lx = x;
    while (Jigsaw.isClear(x, _y, 2, _biggest / 2, _list) && x < _width) {
        x++
    }
    if (x >= _width) return {
        lx: lx,
        rx: _width
    };
    return {
        lx: lx,
        rx: x
    }
};
Jigsaw.findBlockedColumn = function(_x, _biggest, _list, _height) {
    var y = 0;
    while (!Jigsaw.isClear(_x, y, _biggest / 2, 2, _list)) {
        y++
    }
    var ty = y;
    while (Jigsaw.isClear(_x, y, _biggest / 2, 2, _list) && y < _height) {
        y++
    }
    if (y >= _height) return {
        ty: ty,
        by: _height
    };
    return {
        ty: ty,
        by: y
    }
};

function Titles() {
    this.bg = null;
    this.sprites = null;
    this.buttons = null;
    this.fader = null;
    this.managers = null;
    this.fallingPieces = null;
    this.startButton = null;
    this.startButtonHighlight = null;
    this.exitWhenReady = false
}
Titles.ready = false;
Titles.prototype.applyOrientationParams = function() {
    this.shinyGlowSprite.y = this.startButtonY;
    this.startButton.y = this.startButtonY;
    this.startButtonHighlight.y = this.startButtonY;
    //this.gameTitleLogo.y = this.gameTitleY - this.titleGap;
    this.gameTitleSprite.y = this.gameTitleY;
    this.gameTitleSprite.scale.set(this.showTitleScale);
    //this.gameTitleLogo.scale.set(this.showLogoScale);
    this.characterSpriteLeft.scale.set(this.characterScale);
    this.characterSpriteRight.scale.set(this.characterScale)
};
Titles.prototype.setOrientationParams = function() {
    this.gameTitleY = -100;
    this.characterScale = 1;
    this.startButtonScale = 1;
    if (Main.aspectRatio > .9 && Main.aspectRatio < 1.15) {
        this.gameTitleY = -50;
        this.startButtonY = 390;
        this.showLogoScale = .9;
        this.showTitleScale = .8;
        this.titleGap = 230
    } else if (Main.isPortrait) {
        this.startButtonY = 550;
        if (Main.aspectRatio < .5) {
            this.showLogoScale = .85;
            this.showTitleScale = .6;
            this.titleGap = 200;
            this.startButtonScale = 1.5;
            this.characterScale = 1.5
        } else if (Main.aspectRatio < .68) {
            this.showLogoScale = .9;
            this.showTitleScale = .7;
            this.titleGap = 220;
            this.startButtonScale = 1.4;
            this.characterScale = 1.5
        } else if (Main.aspectRatio < .83) {
            this.showLogoScale = 1;
            this.showTitleScale = .85;
            this.titleGap = 260;
            this.startButtonScale = 1.3;
            this.characterScale = 1.3
        } else {
            this.showLogoScale = .9;
            this.showTitleScale = .75;
            this.titleGap = 225;
            this.startButtonY = 500;
            this.startButtonScale = 1.1;
            this.characterScale = 1.2
        }
    } else {
        this.startButtonScale = 1;
        if (Main.aspectRatio >= 2.31) {
            this.showLogoScale = .5;
            this.showTitleScale = .35;
            this.gameTitleY = 0;
            this.startButtonScale = 1.25;
            this.startButtonY = 360;
            this.titleGap = 120;
            this.characterScale = 1.6
        } else if (Main.aspectRatio >= 2) {
            this.showLogoScale = .6;
            this.showTitleScale = .5;
            this.gameTitleY = 0;
            this.startButtonScale = 1.2;
            this.startButtonY = 400;
            this.titleGap = 150;
            this.characterScale = 1.6
        } else if (Main.aspectRatio >= 1.8) {
            this.showLogoScale = .65;
            this.showTitleScale = .6;
            this.gameTitleY = -10;
            this.startButtonY = 400;
            this.startButtonScale = 1.1;
            this.titleGap = 180;
            this.characterScale = 1.4
        } else if (Main.aspectRatio > 1.4) {
            this.showLogoScale = .8;
            this.showTitleScale = .7;
            this.gameTitleY = -20;
            this.startButtonY = 400;
            this.titleGap = 215;
            this.characterScale = 1.3
        } else if (Main.aspectRatio > 1.25) {
            this.showLogoScale = .9;
            this.showTitleScale = .75;
            this.gameTitleY = -40;
            this.startButtonY = 400;
            this.titleGap = 225;
            this.characterScale = 1.2
        } else {
            this.showLogoScale = .9;
            this.showTitleScale = .75;
            this.gameTitleY = -80;
            this.startButtonY = 380;
            this.titleGap = 225;
            this.characterScale = 1.2
        }
    }
    this.titleGap *= .95;
    this.showLogoScale *= 1.2
};
Titles.prototype.create = function(_preloader) {
    Titles.ready = false;
    this.exitWhenReady = false;
    this.rememberOrientation = Main.isPortrait;
    this.preloader = _preloader;
    this.managers = this.preloader.getManagers();
    this.bg = new Sprite;
    this.bg.create(Main.bgImage, "game_title_bg", this.managers.textures);
    this.bg.anchor.set(.5);
    this.bg.scale.set(Main.gameWide / this.bg.width);
    this.bgScale = Sprite.getGlobalScale(this.bg);
    this.setOrientationParams();
    var btnStartY = Main.height / 2 / this.bgScale.y;
    this.sprites = [];
    this.buttons = [];
    this.shinyGlowSprite = new Sprite(.5, .5);
    this.shinyGlowSprite.create(Main.fullUI, "start_button_glow", this.managers.textures, 0, btnStartY);
    this.shinyGlowSprite.visible = false;
    this.sprites.push(this.shinyGlowSprite);
    this.startButton = new Button(Button.TYPE_BUTTON, .5, .5);
    this.startButton.create(Main.fullUI, "play_button", this.managers, 0, btnStartY, false, "play_button", "play_button_hover", "play_button_hover", "click_start");
    this.startButton.sfx = "snd_clickPlay";
    var _that = this;
    this.startButton.callbackHover = function(_btn) {
        _that.shinyGlowSprite.visible = true
    };
    this.startButton.callbackHoverOut = function(_btn) {
        _that.shinyGlowSprite.visible = false
    };
    this.buttons.push(this.startButton);
    this.characterSpriteLeft = new Sprite(0, 1);
    this.characterSpriteLeft.create(Main.leftBottomUI, "game_title_characters_left", this.managers.textures, 0, -60);
    this.sprites.push(this.characterSpriteLeft);
    this.characterSpriteRight = new Sprite(1, 1);
    this.characterSpriteRight.create(Main.rightBottomUI, "game_title_characters_right", this.managers.textures, 0, -16);
    this.sprites.push(this.characterSpriteRight);
    this.startButtonHighlight = new Sprite(.5, .5);
    this.startButtonHighlight.create(Main.fullUI, "play_button_hover", this.managers.textures, 0, btnStartY);
    this.sprites.push(this.startButtonHighlight);
    //this.gameTitleLogo = new Sprite(.5, .5);
    //this.gameTitleLogo.create(Main.largeUI, "game_title_logo", this.managers.textures, 0, -(Main.height / 2) / this.bgScale.y - this.titleGap);
    //this.sprites.push(this.gameTitleLogo);
    this.gameTitleSprite = new Sprite(.5, .5);
    this.gameTitleSprite.create(Main.largeUI, "game_title", this.managers.textures, 0, -(Main.height / 2) / this.bgScale.y);
    this.sprites.push(this.gameTitleSprite);
    if (Main.showMuteButton) {
        this.muteButton = new Button(Button.TYPE_BUTTON, .5, .5);
        this.muteButton.create(Main.leftTopUI, "mute_button_unmute", this.managers, 90, -190, false, "mute_button_unmute", "mute_button_unmute_hover", "mute_button_unmute_hover", "click_mute", null, "mute_button_muted", "mute_button_muted_hover", "mute_button_muted_hover", "click_unmute", null);
        this.muteButton.sfx = "snd_clickPlay";
        this.muteButton.toggled = !this.managers.audio.mute;
        this.buttons.push(this.muteButton)
    } else {
        this.muteButton = null
    }
    this.logoSprite = new Sprite(.5, .5);
    this.logoSprite.create(Main.leftBottomUI, "logo", this.managers.textures, 120, 190);
    this.sprites.push(this.logoSprite);
    new TWEEN.Tween(this.shinyGlowSprite).to({
        y: this.startButtonY
    }, 800).easing(TWEEN.Easing.Quadratic.Out).start();
    new TWEEN.Tween(this.startButton).to({
        y: this.startButtonY
    }, 800).easing(TWEEN.Easing.Quadratic.Out).onComplete(function() {
        Titles.ready = true
    }).start();
    new TWEEN.Tween(this.startButtonHighlight).to({
        y: this.startButtonY
    }, 800).easing(TWEEN.Easing.Quadratic.Out).start();
    if (this.muteButton) {
        new TWEEN.Tween(this.muteButton).to({
            y: 90
        }, 800).easing(TWEEN.Easing.Quadratic.Out).start()
    }
    new TWEEN.Tween(this.logoSprite).to({
        y: -90
    }, 800).easing(TWEEN.Easing.Quadratic.Out).start();
    var _that = this;
    this.characterSpriteLeft.x = -this.characterSpriteLeft.width / 2;
    this.characterSpriteLeft.tween = new TWEEN.Tween(this.characterSpriteLeft).to({
        x: 0
    }, 500).easing(TWEEN.Easing.Quadratic.Out).start();
    this.characterSpriteRight.x = this.characterSpriteLeft.width / 2;
    this.characterSpriteRight.tween = new TWEEN.Tween(this.characterSpriteRight).to({
        x: 0
    }, 500).easing(TWEEN.Easing.Quadratic.Out).start();
    // this.gameTitleLogo.tween = new TWEEN.Tween(this.gameTitleLogo).to({
    //     y: 0 - this.titleGap
    // }, 800).easing(TWEEN.Easing.Quadratic.Out).start().onComplete(function() {
    //     _that.gameTitleLogo.tween = new TWEEN.Tween(_that.gameTitleLogo).to({
    //         y: _that.gameTitleY - _that.titleGap
    //     }, 600).easing(TWEEN.Easing.Quadratic.InOut).start()
    // });
    this.gameTitleSprite.tween = new TWEEN.Tween(this.gameTitleSprite).to({
        y: 0
    }, 800).easing(TWEEN.Easing.Quadratic.Out).start().onComplete(function() {
        _that.gameTitleSprite.tween = new TWEEN.Tween(_that.gameTitleSprite).to({
            y: _that.gameTitleY
        }, 600).easing(TWEEN.Easing.Quadratic.InOut).start()
    });
    this.fallingPieces = [];
    for (var i = 0; i < 15; i++) {
        var s = new Sprite;
        s.create(this.bg, Utils.pickRandomFromList(["ghost_piece_1", "ghost_piece_2", "ghost_piece_3"]), this.managers.textures, Math.random() * this.bg.width - this.bg.width / 2, this.bg.height / 2 - Math.random() * this.bg.height * 2, false);
        s.rotation = Math.random() * Math.PI * 2;
        s.vr = (Math.random() - .5) * .05;
        s.scale.set(.75);
        s.anchor.set(.5);
        this.fallingPieces[i] = s
    }
    //this.gameTitleLogo.moveToFront();
    this.gameTitleSprite.moveToFront();
    Main.forceResize = true;
    var whiteBlank = Utils.addBlanker(this.managers.textures, "blanker_white");
    new TWEEN.Tween(whiteBlank).to({
        alpha: 0
    }, 600).onComplete(function() {
        Utils.removeBlanker()
    }).start();
    EventHandlers.registerCallback("mousedown", this.startTune, {
        context: this
    });
    this.fader = new FadeState;
    this.fader.setFade(.1);
    this.resize()
};
Titles.prototype.startTune = function() {
    EventHandlers.clearCallback("mousedown", this.startTune);
    if (this.managers && this.managers.audio) {
        if (!this.managers.audio.sfxLoaded()) {
            console.log("retry loadAudioAssets from input gesture");
            this.preloader.loadAudioAssets()
        }
        this.managers.audio.startTune("game_tune")
    }
};
Titles.prototype.destroy = function() {
    var i;
    Main.forceResize = true;
    if (this.version) {
        this.version.destroy();
        this.version = null
    }
    if (this.fallingPieces) {
        for (i = 0; i < this.fallingPieces.length; i++) this.fallingPieces[i].destroy();
        this.fallingPieces = null
    }
    if (this.sprites) {
        for (i = 0; i < this.sprites.length; i++) this.sprites[i].destroy();
        this.sprites = null
    }
    if (this.buttons) {
        for (i = 0; i < this.buttons.length; i++) this.buttons[i].destroy();
        this.buttons = null
    }
    if (this.fader) {
        this.fader.destroy();
        this.fader = null
    }
    if (this.bg) {
        this.bg.destroy();
        this.bg = null
    }
    this.managers = null
};
Titles.prototype.update = function() {
    var i;
    var event = "";
    this.gameTitleSprite.scale.set(this.showTitleScale);
    //this.gameTitleLogo.scale.set(this.showLogoScale);
    this.fader.fading();
    if (this.startButtonHighlight) {
        this.startButtonHighlight.alpha = (Math.sin(Main.nowTime * .004) + 1) * .5
    }
    if (this.shinyGlowSprite) {
        this.shinyGlowSprite.rotation += .025;
        this.shinyGlowSprite.scale.set((Math.sin(Main.nowTime * .003) + 1) / 2 * .25 + 1.25)
    }
    if (this.startButton) {
        var sx = (Math.sin(Main.nowTime * .01) + 1) * .5 * .07 + .93 * this.startButtonScale;
        var sy = (Math.sin(Main.nowTime * .01 + Math.PI) + 1) * .5 * .07 + .93 * this.startButtonScale;
        this.startButton.scale.set(sx, sy);
        if (this.startButtonHighlight) this.startButtonHighlight.scale.set(sx, sy)
    }
    this.bg.alpha = this.fader.fadeValue;
    this.bg.update();
    if (this.fallingPieces) {
        for (i = 0; i < this.fallingPieces.length; i++) {
            var s = this.fallingPieces[i];
            s.y += 6;
            s.rotation += s.vr;
            if (s.rotation < -Math.PI) s.rotation += Math.PI * 2;
            if (s.rotation >= Math.PI) s.rotation -= Math.PI * 2;
            if (s.y > this.bg.height * .6) {
                s.x = Math.random() * this.bg.width - this.bg.width / 2;
                s.y = -this.bg.height * .6 - Math.random() * this.bg.height * .25;
                s.rotation = Math.random() * Math.PI * 2;
                s.vr = (Math.random() - .5) * .05
            }
        }
    }
    if (this.sprites) {
        for (i = 0; i < this.sprites.length; i++) this.sprites[i].update()
    }
    if (this.buttons) {
        for (i = 0; i < this.buttons.length; i++) {
            var b = this.buttons[i];
            event = b.update();
            if (event !== null) break
        }
    }
    if (this.version) {
        this.version.update()
    }
    if (Keys.isPressed[KeyCodes.space_bar] || this.exitWhenReady) {
        event = "click_start"
    }
    switch (event) {
        case "click_start":
            Main.hover = null;
            Main.click = null;
            Keys.reset(32);
            this.exitWhenReady = true;
            if (this.fader.reached(1) && Titles.ready) {
                this.exitWhenReady = false;
                TWEEN.removeAll();
                Utils.removeBlanker();
                this.startButton.enabled = false;
                Utils.addBlanker(this.managers.textures, "blanker_white");
                return false
            }
            break;
        case "click_mute":
            this.muteButton.toggled = false;
            this.managers.audio.setMute(true, false);
            this.managers.audio.muteTunes(true, false);
            break;
        case "click_unmute":
            this.muteButton.toggled = true;
            this.managers.audio.setMute(false, false);
            this.managers.audio.muteTunes(false, false);
            break
    }
    return true
};
Titles.prototype.resize = function() {
    this.rememberOrientation = Main.isPortrait;
    this.setOrientationParams();
    this.applyOrientationParams()
};

function GameControl() {
    this.preloader = null;
    this.titles = null;
    this.game = null
}
GameControl.GameStates = {
    NONE: -1,
    PRELOAD: 0,
    TITLES: 1,
    PLAY: 2
};
GameControl.pageHidden = false;
GameControl.tutorialActive = false;
GameControl.prototype.create = function() {
    this.preloader = new Preloader("./");
    this.preloader.preload(this, Main.lowResolutionAssets);
    this.lastState = GameControl.GameStates.NONE;
    this.state = GameControl.GameStates.PRELOAD;
    EventSignals.create();
    this.titles = null;
    this.game = null;
    this.puzzleWide = 3;
    this.puzzleHigh = 3;
    Utils.focusChangeCallback = this.onFocusChange;
    Utils.focusChangeContext = this;
    Utils.detectHidden();
    GameControl.pageHidden = Utils.isHidden();
    GameControl.tutorialActive = true
};
GameControl.prototype.update = function() {
    if (!Game.paused) {
        TWEEN.update()
    }
    var again;
    do {
        again = false;
        var newState = this.lastState != this.state;
        this.lastState = this.state;
        if (Main.debugSpam && newState) {
            console.log("GameControl.state changed to", this.state)
        }
        switch (this.state) {
            case GameControl.GameStates.PRELOAD:
                this.preloader.update();
                if (this.preloader.allLoaded()) {
                    this.state = GameControl.GameStates.TITLES;
                    again = true
                }
                break;
            case GameControl.GameStates.TITLES:
                if (newState) {
                    Keys.create();
                    if (Main.debug) {
                        Keys.ignoreKey(KeyCodes.shift);
                        Keys.ignoreKey(KeyCodes.ctrl);
                        Keys.ignoreKey(KeyCodes.key_i);
                        Keys.ignoreKey(KeyCodes.f8)
                    }
                    EventHandlers.clearCallbacks();
                    this.resetInput();
                    this.titles = new Titles;
                    this.titles.create(this.preloader)
                }
                this.preloader.audioManager.update();
                if (!this.titles.update()) {
                    this.titles.destroy();
                    this.titles = null;
                    this.state = GameControl.GameStates.PLAY
                }
                break;
            case GameControl.GameStates.PLAY:
                if (newState) {
                    this.game = new Game(this.puzzleWide, this.puzzleHigh);
                    this.game.create(this.preloader.getManagers(), Preloader.levels, Preloader.images);
                    Main.playLayer.x = 0;
                    Main.playLayer.y = 0;
                    Utils.removeBlanker();
                    this.resetInput()
                }
                this.preloader.audioManager.update();
                if (!this.game.update()) {
                    this.game.destroy();
                    this.game = null;
                    this.state = GameControl.GameStates.TITLES
                }
                break
        }
    } while (again);
    if (Main.mouseDown) {
        Main.getFocus()
    }
    Main.render()
};
GameControl.prototype.resetInput = function() {
    Keys.reset();
    Main.resetInput()
};
GameControl.prototype.onFocusChange = function(_hidden) {
    if (!_hidden) Main.getFocus();
    if (!Main.pauseOnFocusLoss) {
        this.preloader.audioManager.visibilityMute(_hidden);
        if (!PIXI.utils.isMobile.any) {
            return
        }
    }
    if (_hidden) {
        this.preloader.audioManager.pauseMute(true);
        Game.paused = true
    } else {
        this.preloader.audioManager.pauseMute(false);
        Game.paused = false
    }
    this.preloader.audioManager.visibilityMute(GameControl.pageHidden);
    if (Main.debug) console.log("GameControl.onFocusChange hidden =", _hidden, "at time =", Date.now())
};
GameControl.prototype.resize = function() {
    if (this.titles) this.titles.resize();
    if (this.game) this.game.resize()
};

function Preloader(_baseUrl) {
    this.root = null;
    this.textureManager = null;
    this.dataManager = null;
    this.audioManager = null;
    this.lowResolution = false;
    this.totalFileCount = 0;
    this.introAnimationFinished = false;
    this.loadingBarAnimationFinished = false;
    this.lastPcent = 0;
    this.baseUrl = _baseUrl;
    this.titleName = "en.png"
}
Preloader.prototype.preload = function(_root, _lowResolution) {
    this.root = _root;
    this.lowResolution = _lowResolution;
    this.textureManager = new Textures;
    this.textureManager.create();
    this.dataManager = new DataManager;
    this.dataManager.create();
    this.audioManager = new AudioManager;
    this.audioManager.create(this.getManagers());
    var res = "high";
    if (!Main.testLanguage) {
        var _this = this;
        this.dataManager.loadData("language", this.baseUrl + "json/lang.json", function() {
            var json = _this.dataManager.get("language");
            if (json && json["lang"]) _this.titleName = json["lang"] + ".png"
        })
    }
    this.textureManager.addImage("empty_square", this.baseUrl + "images/_reduced/high/empty.png");
    this.textureManager.addImage("preloader_bg", this.baseUrl + "images/_reduced/high/mike_bg_02.jpg");
    this.textureManager.addImage("preloader_bouncer", this.baseUrl + "images/_reduced/high/preloader/bouncer.png");
    this.textureManager.addAtlas("preloader_sprites", this.baseUrl + "images/_reduced/high/preloader/preloader.json");
    this.textureManager.startLoading(this.preloaderReady, this)
};
Preloader.prototype.preloaderReady = function() {
    var _this = this;
    Main.rightTopUI.texture = this.textureManager.get("empty_square");
    Main.leftBottomUI.texture = this.textureManager.get("empty_square");
    this.bg = new Sprite;
    this.bg.create(Main.bgImage, "preloader_bg", this.textureManager);
    this.bg.anchor.set(.5, 1);
    this.bg.y = this.bg.height / 2;
    this.bgLogo = new Sprite;
    this.bgLogo.create(this.bg, "logo", this.textureManager);
    this.bgLogo.anchor.set(.5);
    this.bgLogo.x = 0;
    this.bgLogo.y = -484;
    if (Main.aspectRatio > 2) {
        this.bg.y -= 100
    }
    this.bgCover = new Sprite;
    this.bgCover.create(this.bg, "background_cover", this.textureManager);
    this.bgCover.anchor.set(.5, 1);
    this.bgCover.x = 0;
    this.bgCover.y = 0;
    this.bgBouncer = new Sprite;
    this.bgBouncer.create(this.bg, "preloader_bouncer", this.textureManager);
    this.bgBouncer.anchor.set(.5);
    this.bgBouncer.x = 0;
    this.bgBouncer.y = -this.bg.height - this.bgBouncer.height / 2;
    var _that = this;
    new TWEEN.Tween(this.bgBouncer).to({
        y: this.bgLogo.y - this.bgBouncer.height / 2
    }, 800).easing(TWEEN.Easing.Quadratic.In).onComplete(function() {
        new TWEEN.Tween(_that.bgBouncer).to({
            y: _that.bgBouncer.y + 34
        }, 200).easing(TWEEN.Easing.Quadratic.Out).start();
        new TWEEN.Tween(_that.bgLogo).to({
            y: _that.bgLogo.y + 34
        }, 200).easing(TWEEN.Easing.Quadratic.Out).onComplete(function() {
            new TWEEN.Tween(_that.bgBouncer).to({
                y: _that.bgBouncer.y - 34
            }, 200).easing(TWEEN.Easing.Quadratic.In).onComplete(function() {
                new TWEEN.Tween(_that.bgBouncer).to({
                    y: -_that.bg.height - _that.bgBouncer.height / 2
                }, 800).easing(TWEEN.Easing.Quadratic.Out).onComplete(function() {
                    _that.bgBouncer.visible = false;
                    _that.introAnimationFinished = true
                }).start()
            }).start();
            new TWEEN.Tween(_that.bgLogo).to({
                y: _that.bgLogo.y - 34
            }, 200).easing(TWEEN.Easing.Quadratic.In).start()
        }).start()
    }).start();
    this.loadBg = new Sprite;
    this.loadBg.create(this.bg, "loader_under", this.textureManager, 0, 200, false);
    this.loadBg.anchor.set(.5);
    this.loadBg.y = this.bgLogo.y + this.bgLogo.height * .8;
    this.loadBar = new Sprite;
    this.loadBar.create(this.bg, "loader_over", this.textureManager, -330, 200, false);
    this.loadBar.anchor.set(0, .5);
    this.loadBar.x = -this.loadBar.width / 2;
    this.loadBar.fullWidth = this.loadBar._texture.width;
    this.loadBar._texture.width = 10;
    this.loadBar.y = this.loadBg.y;
    if (Main.aspectRatio < .43) {
        this.loadBg.scale.set(this.loadBg.scale.x * .8);
        this.loadBar.scale.set(this.loadBar.scale.x * .8);
        this.loadBar.x = -this.loadBar.width / 2
    }
    var imageAssetPath = this.baseUrl + "images/_reduced/high/";
    this.textureManager.addImage("game_title_bg", imageAssetPath + "title_bg.jpg");
    this.textureManager.addImage("game_title_characters_left", imageAssetPath + "sprites/title_char_left.png");
    this.textureManager.addImage("game_title_characters_right", imageAssetPath + "sprites/title_char_right.png");
    this.textureManager.addImage("game_title_logo", imageAssetPath + "sprites/show_logo.png");
    if (Main.testLanguage && typeof URLSearchParams !== "undefined") {
        var urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("lang")) this.titleName = urlParams.get("lang") + ".png"
    }
    this.textureManager.addImage("game_title", imageAssetPath + "sprites/titles/" + this.titleName);
    Preloader.levels = 100;
    Preloader.images = 24;
    for (var i = 1; i <= Preloader.images; i++) {
        this.textureManager.addImage("jigsaw_image_" + i.toString(), imageAssetPath + "puzzles/" + "puzzle_" + Utils.padToLength(i.toString(), 2, "0", false) + ".jpg")
    }
    this.textureManager.addAtlas("atlas_sprites", imageAssetPath + "sprites/_loose_files.json");
    this.textureManager.addImage("blanker", imageAssetPath + "blanker.png");
    this.textureManager.addImage("blanker_white", imageAssetPath + "white.png");
    this.textureManager.addImage("game_bg_1", imageAssetPath + "mike_bg_02.jpg");
    this.textureManager.addImage("game_bg_2", imageAssetPath + "mike_bg_01.jpg");
    this.textureManager.addImage("game_bg_3", imageAssetPath + "mike_bg_03.jpg");
    this.textureManager.addImage("game_bg_4", imageAssetPath + "mike_bg_04.jpg");
    this.textureManager.addImage("game_bg_5", imageAssetPath + "mike_bg_05.jpg");
    this.textureManager.startLoading();
    this.loadAudioAssets();
    this.dataManager.loadData("regularPieces", this.baseUrl + "json/JSON/regularPieces.json");
    this.dataManager.loadData("text_styles", this.baseUrl + "json/text_styles.json", function() {
        Main.createTextStyles(_this.dataManager)
    });
    this.totalFileCount = this.textureManager.pending + this.dataManager.pending + this.audioManager.pending
};
Preloader.prototype.loadAudioAssets = function() {
    this.audioManager.loadAudio("game_tune", this.baseUrl + "audio/music", ["mp3"]);
    this.audioManager.loadSoundSprite("sound_sprite", this.baseUrl + "audio/_sprite/sound_sprite", ["m4a", "ogg", "wav"], {
        sprite: {
            snd_puzzleStart: [0, 1141],
            snd_pieceLand1: [1500, 392],
            snd_pieceLand2: [2500, 352],
            snd_pieceLand3: [3e3, 397],
            snd_pieceLand4: [3500, 345],
            snd_piecePickUp: [4e3, 235],
            snd_pieceCorrect1: [4500, 940],
            snd_pieceCorrect2: [5500, 833],
            snd_pieceCorrect3: [6500, 881],
            snd_pieceCorrect4: [7500, 940],
            snd_pieceWrong: [8500, 380],
            snd_puzzleComplete: [9e3, 1763],
            snd_clickPlay: [11e3, 1112],
            child_cheer01: [12500, 3320],
            child_cheer02: [16e3, 3381],
            child_cheer03: [19500, 4133]
        }
    })
};
Preloader.prototype.cleanUp = function() {
    this.root = null;
    if (this.loadBg) {
        this.loadBg.destroy();
        this.loadBg = null
    }
    if (this.loadBar) {
        this.loadBar.destroy();
        this.loadBar = null
    }
    if (this.bg) {
        this.bg.destroy();
        this.bg = null
    }
    if (this.bgLogo) {
        this.bgLogo.destroy();
        this.bgLogo = null
    }
    if (this.bgCover) {
        this.bgCover.destroy();
        this.bgCover = null
    }
    if (this.bgBouncer) {
        this.bgBouncer.destroy();
        this.bgBouncer = null
    }
};
Preloader.prototype.update = function() {
    if (this.loadBar && this.totalFileCount > 0) {
        var pcent = 1 - (this.textureManager.pending + this.dataManager.pending + this.audioManager.pending) / this.totalFileCount;
        if (pcent > this.lastPcent + .1) pcent = this.lastPcent + .1;
        this.lastPcent = pcent;
        var texture = PIXI.Texture.fromImage("loader_over");
        var texture2 = new PIXI.Texture(texture, new PIXI.Rectangle(texture.frame.x, texture.frame.y, texture.frame.width * Math.min(pcent, 1), texture.frame.height));
        this.loadBar.texture = texture2;
        if (pcent >= 1) this.loadingBarAnimationFinished = true
    }
};
Preloader.prototype.allLoaded = function() {
    var done = this.textureManager.pending === 0 && this.dataManager.pending === 0 && this.audioManager.pending === 0 && this.introAnimationFinished && this.loadingBarAnimationFinished;
    if (done) {
        this.cleanUp();
        return true
    }
    return false
};
Preloader.prototype.getManagers = function() {
    return {
        preloader: this,
        textures: this.textureManager,
        data: this.dataManager,
        audio: this.audioManager
    }
};

function Textures() {
    this.pending = 0;
    this.loader = null
}
Textures.prototype.create = function() {
    this.pending = 0;
    this.loader = PIXI.loader
};
Textures.prototype.destroy = function() {
    this.pending = 0;
    this.loader = null
};
Textures.prototype.addImage = function(_key, _resourceURL) {
    this.loader.add(_key, _resourceURL);
    if (Main.debugSpam) console.log("Textures.addImage ", _key, _resourceURL);
    this.pending++
};
Textures.prototype.addAtlas = function(_key, _atlasURL) {
    this.loader.add(_key, _atlasURL);
    if (Main.debugSpam) console.log("Textures.addAtlas ", _key, _atlasURL);
    this.pending++
};
Textures.prototype.startLoading = function(_callback, _context) {
    var _this = this;
    if (Main.debug) console.log("Textures.startLoading");
    if (this.pending > 0) {
        this.loader.once("complete", function() {
            _this.pending = 0;
            if (Main.debug) console.log("Textures all loaded.");
            if (_callback && _context) _callback.call(_context)
        }).load()
    } else {
        if (Main.debug) console.log("WARNING: Textures.startLoading - no images to load!")
    }
};
Textures.prototype.loadImage = function(_key, _resourceURL, _callback, _context) {
    if (Main.debugSpam) console.log("Textures.loadImage", _key, _resourceURL);
    this.loader.add(_key, _resourceURL);
    this.loader.once("complete", function() {
        if (Main.debugSpam) console.log("Texture loaded");
        _callback.call(_context)
    }).load()
};
Textures.prototype.new = function(_key, _wide, _high) {
    if (Main.debugSpam) console.log("new texture created ", _key, _wide, _high);
    if (this.exists(_key)) {
        console.warn("duplicate key, a texture already exists " + _key + "!");
        return null
    }
    var canvas = Textures.createCanvas(_key, _wide, _high);
    var img = PIXI.Texture.fromCanvas(canvas);
    PIXI.loader.resources[_key] = {
        texture: img
    };
    return img
};
Textures.prototype.get = function(_key, _dontConvert) {
    if (!PIXI.loader.resources[_key]) {
        return PIXI.Texture.fromFrame(_key)
    }
    if (PIXI.loader.resources[_key].texture) return PIXI.loader.resources[_key].texture;
    if (_dontConvert) return null;
    if (Main.debugSpam) console.log("texture created from canvas", _key);
    var img = PIXI.Texture.fromCanvas(PIXI.loader.resources[_key]);
    PIXI.loader.resources[_key].texture = img;
    return img
};
Textures.prototype.set = function(_key, _img) {
    var resource = PIXI.loader.resources[_key];
    if (resource && resource != _img) {
        if (Main.debugSpam) console.log("Textures.set removing image from cache", _key);
        this.remove(_key)
    }
    if (Main.debugSpam) console.log("Textures.set adding image to cache", _key, _img.width, "x", _img.height);
    PIXI.loader.resources[_key] = _img
};
Textures.prototype.exists = function(_key) {
    if (!PIXI.loader.resources[_key]) return false;
    return true
};
Textures.prototype.remove = function(_key) {
    var resource = PIXI.loader.resources[_key];
    if (!resource) {
        if (Main.debug) alert("ERROR: Textures.remove can't remove a null resource", _key);
        return
    }
    if (!resource.texture) {
        if (Main.debug) {
            if (!Textures.isCanvas(resource)) console.log("Textures.remove can't remove a null texture", _key);
            else console.log("Textures.remove removing a Canvas", _key)
        }
        PIXI.loader.resources[_key] = null;
        delete PIXI.loader.resources[_key];
        return
    }
    if (!Textures.isCanvas(resource.texture)) resource.texture.destroy({
        texture: true,
        baseTexture: true
    });
    resource.texture = null;
    if (!Textures.isCanvas(resource)) {
        if (Main.debugSpam) console.log("Textures.remove removing a Texture", _key);
        if (resource.destroy) resource.destroy({
            texture: true,
            baseTexture: true
        })
    } else {
        if (Main.debugSpam) console.log("Textures.remove removing a Texture with a Canvas", _key)
    }
    PIXI.loader.resources[_key] = null;
    delete PIXI.loader.resources[_key]
};
Textures.isCanvas = function(_object) {
    if (!_object) {
        if (Main.debug) alert("ERROR: null or undefined object being tested for HTMLCanvasElement!");
        return false
    }
    return _object instanceof HTMLCanvasElement || _object.constructor.name == "HTMLCanvasElement" || (_object.prototype ? _object.prototype.constructor : _object.constructor).toString() == "HTMLCanvasElement"
};

function nextPo2(value) {
    v = value - 1;
    v |= v >> 1;
    v |= v >> 2;
    v |= v >> 4;
    v |= v >> 8;
    v |= v >> 16;
    v++;
    return v
}
Textures.createCanvas = function(id, width, height) {
    var canvas = document.createElement("canvas");
    if (typeof id === "string" && id !== "") canvas.id = id;
    canvas.width = nextPo2(width);
    canvas.height = nextPo2(height);
    canvas.style.display = "block";
    return canvas
};
Textures.getPixels = function(_sprite) {
    var rt = PIXI.RenderTexture.create(_sprite._texture._frame.width, _sprite._texture._frame.height);
    Main.app.renderer.render(_sprite, rt);
    return Main.app.renderer.extract.pixels(rt)
};
Textures.getPixels = function(_texture) {
    return Main.app.renderer.extract.pixels(_texture)
};
Textures.getPixel = function(_pixels, _x, _y, _width) {
    var i = (_x + _width * _y) * 4;
    var r = _pixels[i++];
    var g = _pixels[i++];
    var b = _pixels[i++];
    var a = _pixels[i];
    return {
        r: r,
        g: g,
        b: b,
        a: a
    }
};

function DataManager() {
    this.list = null;
    this.pending = 0
}
DataManager.prototype.create = function() {
    this.list = []
};
DataManager.prototype.destroy = function() {
    this.list = null
};
DataManager.prototype.loadData = function(_key, _path, _onComplete) {
    var data;
    if (this.list[_key]) {
        data = this.list[_key];
        return data
    }
    if (Main.debug) console.log("DataManager.loadData ", _key, _path);
    data = {};
    data.isReady = false;
    this.list[_key] = data;
    var _this = this;
    var xobj = new XMLHttpRequest;
    xobj.overrideMimeType("application/json");
    xobj.open("GET", _path, true);
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200") {
            data.isReady = true;
            data.data = JSON.parse(xobj.responseText);
            if (_onComplete) _onComplete();
            _this.pending--
        }
    };
    xobj.send(null);
    this.pending++;
    data.src = _path;
    return data
};
DataManager.prototype.get = function(_key) {
    if (this.list && this.list[_key] && this.list[_key].isReady !== false) {
        return this.list[_key].data || this.list[_key]
    }
    if (Main.debug) console.log("DataManager.get(): data not in cache", _key);
    return null
};
DataManager.prototype.set = function(_key, _data) {
    if (this.list[_key]) {
        if (Main.debug) console.log("WARNING: attempt to overwrite existing cache item", _key);
        return
    }
    for (var k in this.list) {
        if (this.list[k] == _data) {
            if (Main.debug) console.log("WARNING: adding additional key to existing cache item", k, "==", _key);
            this.list[_key] = this.list[k];
            return
        }
    }
    this.list[_key] = _data;
    if (Main.debug) console.log("DataManager.set(): data added to cache", _key)
};

function AudioManager() {
    this.list = null;
    this.mute = false;
    this.gameTune = null;
    this.tunesMuted = false;
    this.rememberMute = undefined;
    this.rememberTunesMuted = undefined;
    this.delayed = null;
    this.pending = 0;
    this.managers = null;
    this.playedThisFrame = null;
    this.sfxQueued = null
}
AudioManager.sfxVolume = .75;
AudioManager.musicVolume = .5;
AudioManager.prototype.create = function(_managers) {
    this.managers = _managers;
    this.list = [];
    this.delayed = [];
    this.pending = 0;
    this.playedThisFrame = [];
    this.sfxQueued = [];
    this.playedOne = false;
    this.mute = !Main.showMuteButton;
    this.tunesMuted = !Main.showMuteButton
};
AudioManager.prototype.destroy = function() {
    this.managers = null;
    if (this.list) {
        for (var i in this.list) {
            if (this.list.hasOwnProperty(i)) {
                var sound = this.list[i];
                sound.unload();
                this.list[i] = null
            }
        }
        this.list = null
    }
    this.delayed = null;
    this.gameTune = null;
    this.delayed = null;
    this.playedThisFrame = null;
    this.sfxQueued = null
};
AudioManager.prototype.update = function() {
    var now = Main.time;
    for (var i = this.delayed.length - 1; i >= 0; --i) {
        var p = this.delayed[i];
        if (p.cancelCallback && p.cancelCallback.call(p.context, now > p.time)) {
            this.delayed.splice(i, 1);
            continue
        }
        if (now > p.time) {
            if (p.playCallback) p.playCallback.call(this);
            if (!this.mute) {
                var sfx = this.list[p.key];
                sfx.play()
            }
            this.delayed.splice(i, 1)
        }
    }
    if (!this.playedOne) {
        while (this.sfxQueued.length > 0) {
            var q = this.sfxQueued.shift();
            if (q.time >= Main.time - 100) {
                this._playOne(q.key, false);
                break
            }
        }
    }
    this.playedThisFrame = [];
    this.playedOne = false
};
AudioManager.prototype.loadSoundSprite = function(_key, _path, _subScripts, json) {
    var urls = [];
    for (var i = 0, l = _subScripts.length; i < l; i++) {
        urls.push(_path + "." + _subScripts[i])
    }
    this.pending++;
    if (Main.debug) console.log("AudioManager.loadSoundSprite " + _key + " " + _path);
    var _this = this;
    json.src = urls;
    json.onload = function() {
        _this.pending--
    };
    this.list[_key] = new Howl(json)
};
AudioManager.prototype.loadAudio = function(_key, _path, _subScripts) {
    var urls = [];
    for (var i = 0, l = _subScripts.length; i < l; i++) {
        urls.push(_path + "." + _subScripts[i])
    }
    this.pending++;
    if (Main.debugSpam) console.log("AudioManager.loadAudio " + _key + " " + _path);
    var _this = this;
    this.list[_key] = new Howl({
        src: urls,
        onload: function() {
            _this.pending--
        }
    })
};
AudioManager.prototype.play = function(_key) {
    if (this.mute) return null;
    if (Array.isArray(_key)) {
        var key = Utils.pickRandomFromList(_key);
        return this._playOne(key, false)
    }
    return this._playOne(_key, false)
};
AudioManager.prototype._playOne = function(_key, _isTune) {
    if (Main.muteUntil <= Main.time) {
        if (Main.noSfxIE && Main.isIE && !_isTune) return null;
        if (Main.isIE && this.playedOne && !_isTune) {
            if (this.sfxQueued.length > 6) this.sfxQueued.shift();
            this.sfxQueued.push({
                key: _key,
                time: Main.time
            });
            return null
        }
        if (this.playedThisFrame.indexOf(_key) != -1) return null;
        this.playedThisFrame.push(_key);
        this.playedOne = true;
        if (this.list && this.list[_key]) {
            var sfx = this.list[_key];
            if (sfx._state != "loaded") {
                if (Main.debug) console.log("AudioManager.playOne " + _key + " SFX not loaded!");
                return null
            }
            sfx.volume(AudioManager.sfxVolume);
            var res = sfx.play();
            if (Main.debugSpam) {
                console.log("AudioManager.playOne " + _key + " = " + res);
                if (!res) {
                    console.log("SFX not playable!")
                }
            }
            return sfx
        } else {
            var sndSprite = this.list["sound_sprite"];
            if (sndSprite) {
                sndSprite.volume(AudioManager.sfxVolume);
                sndSprite.play(_key);
                return sndSprite
            }
        }
    }
    return null
};
AudioManager.prototype.playDelayed = function(_key, _delay, _playCallback, _cancelCallback, _context) {
    if (Array.isArray(_key)) {
        _key = Utils.pickRandomFromList(_key)
    }
    if (_key && this.list && this.list[_key]) {
        this.delayed.push({
            key: _key,
            time: Main.time + _delay * 1e3,
            playCallback: _playCallback,
            cancelCallback: _cancelCallback,
            context: _context
        })
    }
};
AudioManager.prototype.visibilityMute = function(_hidden) {
    if (Main.debug) console.log("AudioManager.visibilityMute", _hidden);
    if (_hidden) {
        if (this.rememberMute === undefined) {
            this.rememberMute = this.mute;
            this.rememberTunesMuted = this.tunesMuted;
            this.setMute(true, true);
            this.muteTunes(true, true)
        }
    } else {
        if (this.rememberMute !== undefined) {
            this.setMute(this.rememberMute, true);
            this.muteTunes(this.rememberTunesMuted, true);
            this.rememberMute = undefined;
            this.rememberTunesMuted = undefined
        }
    }
};
AudioManager.prototype.setMute = function(_muted, _noSave) {
    if (Main.debug) console.log("AudioManager.setMute", _muted);
    if (Main.showMuteButton) this.mute = _muted;
    for (var i in this.list) {
        if (this.list.hasOwnProperty(i)) {
            var sfx = this.list[i];
            if (sfx !== this.gameTune) sfx.mute(_muted)
        }
    }
};
AudioManager.prototype.muteTunes = function(_muted, _noSave) {
    if (Main.debug) console.log("AudioManager.muteTunes", _muted);
    if (Main.showMuteButton) this.tunesMuted = _muted;
    if (this.gameTune) {
        this.gameTune.mute(this.tunesMuted)
    }
};
AudioManager.prototype.pauseMute = function(_paused) {
    if (this.gameTune) {
        if (_paused) {
            this.gameTune.mute(true)
        } else {
            this.gameTune.mute(this.tunesMuted)
        }
    }
};
AudioManager.prototype.startTune = function(_key, _noLoop) {
    if (Main.debug) console.log("AudioManager.startTune " + _key);
    if (!this.gameTune) {
        this.list[_key].loop(_noLoop ? false : true);
        this.gameTune = this._playOne(_key, true);
        if (this.gameTune) {
            this.gameTune.volume(AudioManager.musicVolume * Main.volumeControl)
        }
        this.muteTunes(this.tunesMuted, true)
    }
};
AudioManager.prototype.stopTune = function() {
    if (this.gameTune) {
        this.gameTune.stop();
        this.gameTune = null
    }
};
AudioManager.prototype.setMusicVolume = function(_vol) {
    AudioManager.musicVolume = _vol;
    if (this.gameTune) this.gameTune.volume(AudioManager.musicVolume * Main.volumeControl)
};
AudioManager.prototype.sfxLoaded = function() {
    for (var _key in this.list) {
        var sfx = this.list[_key];
        if (sfx._state != "loaded") return false
    }
    return true
};