String.prototype.repeat = function(count) {
    if (count < 1) return '';
    var result = '', pattern = this.valueOf();
    while (count > 1) {
        if (count & 1) result += pattern;
        count >>= 1, pattern += pattern;
    }
    return result + pattern;
};

function getAnimation(name, frames, restore, delay) {
    if (typeof(restore) === 'undefined') {
        restore = true;
    }
    if (typeof(delay) === 'undefined') {
        delay = 0.04;
    }
    var animation = new cc.Animation();
    for (var i = 1; i <= frames; i++) {
        var number = "" + i;
        var _number = "0".repeat(4 - number.length) + number;
        var frameName = name + _number + ".png";
        animation.addSpriteFrame(cc.spriteFrameCache.getSpriteFrame(frameName));
    }
    animation.setDelayPerUnit(delay);
    animation.setRestoreOriginalFrame(restore);

    return animation;
}

var evenRandomSequences = {};
function getEvenRandom(min, max, period, name) {
    var ret = min + (cc.rand() | 0)%(max - min);

    // if (typeof(period) !== "undefined" && typeof(name) !== "undefined") {
    //     var seq = evenRandomSequences[name] || [];
    //     for (var i = 0; i < seq.length; i++) {
    //        
    //     }
    //
    //     seq.push(ret);
    //     if (seq.length > period) {
    //         seq.shift();
    //     }
    //     evenRandomSequences[name] = seq;
    // }
    
    return ret;
}

function isWeb() {
    return (cc.sys.platform in [cc.sys.DESKTOP_BROWSER, cc.sys.MOBILE_BROWSER]);
}
