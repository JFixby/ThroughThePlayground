var PrologueLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        this._super();

        var size = cc.winSize;
        var self = this;

        cc.spriteFrameCache.addSpriteFrames(res.lamp_plist);

        var back = new cc.Sprite(res.back);
        back.x = size.width / 2;
        back.y = size.height / 2;
        back.opacity = 0;
        this.addChild(back, -10);

        back.runAction(cc.fadeTo(1.5, 255));

        var girl = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("open_game_002_0001.png"));
        girl.x = size.width / 2;
        girl.y = size.height / 2;
        girl.opacity = 0;
        this.addChild(girl, -10);

        var animation = getAnimation("open_game_002_", 100);
        girl.runAction(cc.repeatForever(cc.animate(animation)));

        girl.runAction(cc.fadeTo(1.5, 255));

        var fontSize = 120;

        var why = new cc.LabelTTF("", "Pribambas", fontSize);
        why.x = size.width / 2 - 420;
        why.y = size.height / 2 + 225;
        why.anchorX = 0.0;
        why.color = cc.color(229, 133, 123);
        this.addChild(why);

        var whyText = " why are you here?";

        var t = 0;
        for (var i = 0; i < whyText.length; i++) {
            why.runAction(cc.sequence(
                    cc.delayTime(1.5 + 0.15*i),
                    cc.callFunc(function () {
                        why.setString(whyText.substr(0, t + 1));
                        t += 1;
                        self.playTypingSound();
                    })));
        }

        var canType = false;
        this.runAction(cc.sequence(cc.delayTime(5.0), cc.callFunc(function() {
            canType = true;
        })));

        var sample = new cc.LabelTTF("i want to play", "Pribambas", fontSize);
        sample.x = size.width / 2;
        sample.y = size.height / 2 - 225;
        sample.color = cc.color(32, 39, 46);
        sample.opacity = 0;
        this.addChild(sample);
        sample.runAction(cc.sequence(cc.delayTime(4.0), cc.fadeTo(0.5, 100)));

        var text = new cc.LabelTTF("", "Pribambas", fontSize);
        text.x = size.width / 2 - 0.5*sample.getBoundingBox().width;
        text.y = size.height / 2 - 225;
        text.anchorX = 0;
        text.color = cc.color(110, 150, 195);
        this.addChild(text);

        var dots = new cc.LabelTTF(". . . . . . . . . . . . . . . .", "Pribambas", fontSize);
        dots.x = size.width / 2;
        dots.y = size.height / 2 - 275;
        dots.color = cc.color(110, 150, 195);
        dots.opacity = 0;
        this.addChild(dots);
        dots.runAction(cc.sequence(cc.delayTime(4.0), cc.fadeTo(0.5, 255)));

        var arrow = new cc.Sprite(res.prologue_arrow);
        arrow.x = sample.getPositionX() + 0.5*sample.getBoundingBox().width;
        arrow.y = sample.getPositionY() + 0.5*sample.getBoundingBox().height;
        arrow.anchorX = 0;
        arrow.anchorY = 0;
        arrow.opacity = 0;
        arrow.cascadeOpacity = true;
        this.addChild(arrow);

        var typeIt = new cc.LabelTTF("type it!", "Pribambas", fontSize*0.4);
        typeIt.x = arrow.getContentSize().width;
        typeIt.y = arrow.getContentSize().height;
        typeIt.anchorX = 0;
        typeIt.anchorY = 0.5;
        typeIt.color = cc.color(150, 150, 132);
        arrow.addChild(typeIt);

        arrow.runAction(cc.sequence(
            cc.delayTime(5.5),
            cc.fadeTo(0.5, 255),
            cc.repeat(cc.sequence(
                cc.scaleTo(0.1, 1.05),
                cc.scaleTo(0.1, 1.0),
                cc.delayTime(1.5)
            ), 1000)
        ));

        var letter = 0;
        if ('keyboard' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function (key, event) {
                    if (canType != true) {
                        return;
                    }

                    var want = "i want to play";
                    if (key == 32 || (key >= 65 && key < 90)) {
                        var add = 1;
                        if (want[letter] == " ") {
                            add = 2;
                        }
                        letter += add;
                        text.setString(want.substr(0, letter));
                        self.playTypingSound();
                    }

                    if (letter == 14) {
                        var transition = new cc.TransitionFade(2.5, new PlaygroundScene());
                        cc.director.runScene(transition);
                        canType = false;
                    }
                },
            }, this);
        } else {
            cc.log("KEYBOARD Not supported");
        }

        cc.audioEngine.playMusic(res.prologue_theme, true);
        // cc.audioEngine.playEffect(res.lamp, true);

        return true;
    },

    playTypingSound:function() {
        var number = 1; // + (cc.rand() | 0)%3;
        var sound = "typing_" + number.toString();
        cc.audioEngine.playEffect(res[sound], false);
    }
});

var PrologueScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new PrologueLayer();
        this.addChild(layer);
    }
});

