var TitlesLayer = cc.Layer.extend({
    ctor:function () {
        this._super();

        var size = cc.winSize;
        var self = this;

        var blank = new cc.Sprite(res.titles_blank);
        blank.x = size.width / 2;
        blank.y = size.height / 2;
        this.addChild(blank);

        var titles = [];
        for (var i = 0; i < 4; i++) {
            var name = "titles_" + i;
            var page = new cc.Sprite(res[name]);
            page.x = size.width / 2;
            page.y = size.height / 2;
            page.opacity = 0;
            this.addChild(page);
            titles.push(page);
        }
        this.titles = titles;

        this.page = 0;
        titles[0].opacity = 255;

        if ('keyboard' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function (key, event) {
                    self.showNext();
                }
            }, this);
        } else {
            cc.log("KEYBOARD Not supported");
        }

        if ('mouse' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseDown: function (event) {
                    self.showNext();
                }
            }, this);
        } else {
            cc.log("MOUSE Not supported");
        }

        return true;
    },

    showNext:function() {
        if (this.page == 3) {
            return;
        }
        if (this.busy) {
            return;
        }

        var self = this;
        var fadeDuration = 0.75;

        this.busy = true;
        this.runAction(cc.sequence(
            cc.callFunc(function() {
                self.titles[self.page].runAction(cc.fadeTo(fadeDuration, 0));
            }),
            cc.delayTime(fadeDuration),
            cc.callFunc(function() {
                self.titles[++self.page].runAction(cc.fadeTo(fadeDuration, 255));
            }),
            cc.delayTime(2*fadeDuration),
            cc.callFunc(function() {
                self.busy = false;
            })
        ));
    }
});

var TitlesScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new TitlesLayer();
        this.addChild(layer);
    }
});

