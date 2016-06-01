var PlaygroundLayer = cc.Layer.extend({
    state:0,
    zMap:{},
    graph:{},
    points:null,
    edges:null,

    moving:false,
    girl:null,
    girlSpeed:220.0,

    root:null,
    screenSize:null,
    objects:{},
    
    busy:false,
    buttonPressed:false,
    ctor:function () {
        this._super();

        var size = cc.winSize;
        this.screenSize = size;

        var self = this;

        var cursor = new cc.Sprite(res.cursor);
        cursor.anchorX = 0.0;
        cursor.anchorY = 1.0;
        this.addChild(cursor, 100);
        this.cursor = cursor;

        if ('mouse' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseMove: function(event) {
                    self.cursor.setPosition(event.getLocation());
                },

                onMouseUp: function (event) {
                    if (self.justClicked) {
                        return;
                    }

                    self.clicked();

                    if (self.dialogueOn) {
                        self.showPhrase();
                        return;
                    }

                    if (self.busy || self.buttonPressed) {
                        return;
                    }

                    if (self.moving) {
                        self.girl.stopActionByTag(1000);
                        self.wayId = 0;
                    } else {
                        self.animateWalk();
                    }

                    self.say(self.girl, "");
                    var p = self.root.convertToNodeSpace(event.getLocation());
                    var nearest = self.findNearestPoint(p)
                    self.way = self.findWay(nearest);
                    self.move();
                }
            }, this);
        } else {
            cc.log("MOUSE Not supported");
        }

        this.root = new cc.Node();
        this.addChild(this.root);

        cc.spriteFrameCache.addSpriteFrames(res.playground_plist);
        cc.spriteFrameCache.addSpriteFrames(res.actions_plist);
        cc.spriteFrameCache.addSpriteFrames(res.walk_plist);
        cc.spriteFrameCache.addSpriteFrames(res.idle_1_plist);
        cc.spriteFrameCache.addSpriteFrames(res.idle_2_plist);
        cc.spriteFrameCache.addSpriteFrames(res.idle_3_plist);
        cc.spriteFrameCache.addSpriteFrames(res.slide_1_plist);
        cc.spriteFrameCache.addSpriteFrames(res.slide_2_plist);
        cc.spriteFrameCache.addSpriteFrames(res.swing_plist);
        cc.spriteFrameCache.addSpriteFrames(res.croc_plist);
        cc.spriteFrameCache.addSpriteFrames(res.moth_plist);
        cc.spriteFrameCache.addSpriteFrames(res.keykeeper_1_plist);
        cc.spriteFrameCache.addSpriteFrames(res.keykeeper_2_plist);
        cc.spriteFrameCache.addSpriteFrames(res.ants_plist);
        cc.spriteFrameCache.addSpriteFrames(res.shroom_bug_plist);

        var data = cc.loader.getRes(res.playground_json);
        for (var key in data) {
            try {
                var obj = data[key];
                var z = obj.z;
                cc.log(obj.name + '.png');
                var sprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame(obj.name + '.png'));
                sprite.getTexture().setAliasTexParameters();
                sprite.attr({
                    x: self.scale*obj.x - 0.5*size.width,
                    y: size.height - self.scale*obj.y,
                });
                this.objects[obj.name] = sprite;
                self.root.addChild(sprite, z);

                self.zMap[z] = self.zMap[z] || [];
                self.zMap[z].push(sprite);
            } catch(error) {
                cc.log(error);
            }
        }

        var points = [];
        points.push(cc.p(-189, 274));
        points.push(cc.p(-94, 251));
        points.push(cc.p(-3, 235));
        points.push(cc.p(76, 216));
        points.push(cc.p(111, 268));
        points.push(cc.p(194, 289));
        points.push(cc.p(265, 298));
        points.push(cc.p(87, 164));
        points.push(cc.p(67, 103));
        points.push(cc.p(159, 155));
        points.push(cc.p(269, 147));
        points.push(cc.p(373, 142));
        points.push(cc.p(484, 129));
        points.push(cc.p(602, 128));
        points.push(cc.p(703, 121));
        points.push(cc.p(814, 119));
        points.push(cc.p(829, 194));
        points.push(cc.p(852, 256));
        points.push(cc.p(799, 290));
        points.push(cc.p(735, 316));
        points.push(cc.p(915, 271));
        points.push(cc.p(978, 316));
        points.push(cc.p(892, 90));
        points.push(cc.p(1023, 74));
        points.push(cc.p(1135, 96));
        points.push(cc.p(1250, 115));
        points.push(cc.p(1347, 145));
        this.points = points;
        this.fixPoints();

        var edges = {};
        edges[0] = [1];
        edges[1] = [0, 2];
        edges[2] = [1, 3];
        edges[3] = [2, 4, 7];
        edges[4] = [3, 5];
        edges[5] = [4, 6];
        edges[6] = [5];
        edges[7] = [3, 8, 9];
        edges[8] = [7];
        edges[9] = [7, 10];
        edges[10] = [9, 11];
        edges[11] = [10, 12];
        edges[12] = [11, 13];
        edges[13] = [12, 14];
        edges[14] = [13, 15];
        edges[15] = [14, 16, 22];
        edges[16] = [15, 17];
        edges[17] = [16, 18, 20];
        edges[18] = [17, 19];
        edges[19] = [18];
        edges[20] = [17, 21];
        edges[21] = [20];
        edges[22] = [15, 23];
        edges[23] = [22, 24];
        edges[24] = [23, 25];
        edges[25] = [24, 26];
        edges[26] = [25];
        this.edges = edges;

        var girl = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("girl_idle_001_0001.png"));
        girl.x = points[0].x;
        girl.y = points[0].y;
        girl.anchorY = 0.3;
        self.root.addChild(girl, -1);
        this.girl = girl;
        this.animateIdle();

        centers = {};
        centers["play_slide"] = cc.p(0.75, 0.45);
        centers["idol_shrooms"] = cc.p(0.8, 0.35);
        centers["idol_keykeeper"] = cc.p(0.5, 0.4);
        centers["idol_croc"] = cc.p(0.8, 0.2);
        centers["decor_umbrella"] = cc.p(0.5, 0.9);
        centers["decor_dino"] = cc.p(0.85, 0.35);
        centers["idol_bear"] = cc.p(0.5, 0.5);
        centers["idol_hare"] = cc.p(0.45, 0.85);
        this.centers = centers;

        radii = {};
        radii["idol_shrooms"] = 300;
        radii["play_swing"] = 80;
        radii["idol_hare"] = 100;
        radii["idol_horse"] = 100;
        radii["idol_yaga"] = 100;
        radii["idol_bear"] = 270;
        radii["decor_steps"] = 400;
        // radii["idol_croc"] = 120;
        this.radii = radii;

        canUse = {};
        canUse["play_slide"] = true;
        canUse["idol_croc"] = true;
        canUse["play_swing"] = true;
        this.canUse = canUse;

        canLook = {};
        canLook["play_slide"] = true;
        canLook["idol_croc"] = true;
        canLook["play_swing"] = true;
        this.canLook = canLook;

        this.addButtons();
        var idol = this.objects["idol_keykeeper"];
        var nosePos = cc.p(0.5*idol.getContentSize().width, 0.75*idol.getContentSize().height);
        this.addButton("idol_keykeeper", nosePos, 300, "nose", res.use);
        var leftPos = cc.p(0.38*idol.getContentSize().width, 0.66*idol.getContentSize().height);
        this.addButton("idol_keykeeper", leftPos, 400, "left", res.use);
        var rightPos = cc.p(0.62*idol.getContentSize().width, 0.66*idol.getContentSize().height);
        this.addButton("idol_keykeeper", rightPos, 500, "right", res.use);

        var dino = this.objects["decor_dino"];
        var keyPos = cc.p(0, 0);
        keyPos.x = dino.getContentSize().width*this.centers["decor_dino"].x + 30;
        keyPos.y = dino.getContentSize().height*this.centers["decor_dino"].y;
        this.addButton("decor_dino", keyPos, 600, "key", res.key);

        var shrooms = this.objects["idol_shrooms"];
        var sawPos = cc.p(0, 0);
        sawPos.x = shrooms.getContentSize().width*this.centers["idol_shrooms"].x;
        sawPos.y = shrooms.getContentSize().height*this.centers["idol_shrooms"].y + 50;
        this.addButton("idol_shrooms", sawPos, 700, "saw", res.saw);

        var mouth = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("keykeeper_mouth_0001.png"));
        mouth.runAction(cc.repeatForever(cc.animate(getAnimation("keykeeper_mouth_", 20))));
        mouth.x = 0.5*idol.getContentSize().width;
        mouth.y = 0.665*idol.getContentSize().height;
        mouth.visible = false;
        mouth.opacity = 0;
        this.objects["mouth"] = mouth;
        this.objects["idol_keykeeper"].addChild(mouth);

        var mothPositions = {};
        mothPositions["idol_bear"] = this.objects["idol_bear"].getPosition();
        mothPositions["idol_bear"].y += 110;
        mothPositions["idol_hare"] = this.objects["idol_hare"].getPosition();
        mothPositions["idol_hare"].y += 90;
        mothPositions["idol_horse"] = this.objects["idol_horse"].getPosition();
        mothPositions["idol_horse"].y += 110;
        mothPositions["idol_keykeeper"] = this.objects["idol_keykeeper"].getPosition();
        mothPositions["idol_keykeeper"].y += 140;
        this.mothPositions = mothPositions;
        
        this.objects["decor_dino_open"].opacity = 0;

        this.addNotes();

        var inv = new cc.Sprite(res.inventory_key);
        inv.x = 640;
        inv.y = 60;
        inv.opacity = 0;
        this.addChild(inv);
        this.key = inv;

        var saw = new cc.Sprite(res.inventory_saw);
        saw.x = 640;
        saw.y = 60;
        saw.opacity = 0;
        this.addChild(saw);
        this.saw = saw;

        var ants = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("crocodile_ants_001_0001.png"));
        ants.x = this.objects["idol_croc"].getContentSize().width / 2;
        ants.y = this.objects["idol_croc"].getContentSize().height / 2;
        ants.runAction(cc.repeat(cc.sequence(
            cc.delayTime(8.0),
            cc.animate(getAnimation("crocodile_ants_001_", 80))
        ), 10000));
        this.objects["idol_croc"].addChild(ants);

        var shroom = this.objects["Layer_363"];
        var bug = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("shroom_bug_0001.png"));
        bug.x = 0.345*shroom.getContentSize().width;
        bug.y = 0.16*shroom.getContentSize().height;
        bug.runAction(cc.repeat(cc.sequence(
            cc.delayTime(20.0),
            cc.moveBy(1.0, 0, 50),
            cc.animate(getAnimation("shroom_bug_", 195)),
            cc.moveBy(0.0, 0, -50),
            cc.delayTime(20.0)
        ), 10000));
        shroom.addChild(bug);

        this.scheduleUpdate();

        cc.audioEngine.stopMusic();
        cc.audioEngine.playMusic(res.playground_theme, true);

        // this.debugOn();

        return true;
    },

    centers:null,
    radius:null,
    canUse:null,
    canLook:null,
    update:function (dt) {
        var pw = this.root.convertToWorldSpace(this.girl.getPosition());
        var dx = 0.0;
        if (pw.x < 0.3*this.screenSize.width) {
            dx = pw.x - 0.3*this.screenSize.width;
        }
        if (pw.x > 0.7*this.screenSize.width) {
            dx = pw.x - 0.7*this.screenSize.width;
        }

        if (dx != 0.0) {
            var rp = this.root.getPosition();
            rp.x -= dx;
            this.root.setPosition(rp);

            for (var key in this.zMap) {
                var z = parseInt(key) + 1;
                if (z == -3) {
                    z = 0;
                }
                // if (z == -1) {
                //     z = 0;
                // }
                var array = this.zMap[key];
                var len = array.length;
                for (var i = 0; i < len; i++) {
                    var sprite = array[i];
                    var sp = sprite.getPosition();
                    sp.x -= z*dx*0.25;
                    sprite.setPosition(sp);
                }
            }
        }

        var depth = this.girl.getPosition().y;
        this.girl.setScale(1.0 - 0.3*(depth - 130.0)/200.0);

        var girlPos = this.girl.getPosition();
        girlPos.y += 0.5*this.girl.getBoundingBox().height;

        for (var i = 0; i < this.usable.length; i++) {
            var name = this.usable[i];
            var object = this.objects[name];
            if (object == null) {
                continue;
            }

            var objPos = object.getPosition();
            if (name in this.centers) {
                objPos.x += (this.centers[name].x - 0.5)*object.getBoundingBox().width;
                objPos.y += (this.centers[name].y - 0.5)*object.getBoundingBox().height;
            }

            var radius = 200;
            if (name in this.radii) {
                radius = this.radii[name];
            }

            if (!this.dialogueOn && !this.busy && cc.pDistance(girlPos, objPos) < radius) {
                if (this.canLook[name]) {
                    object.getChildByTag(100).setVisible(true);
                }
                if (this.canUse[name]) {
                    object.getChildByTag(200).setVisible(true);
                }
                if (name == "idol_keykeeper" && this.bearSpoke && !this.keykeeperOpened) {
                    object.getChildByTag(300).setVisible(true);
                    object.getChildByTag(400).setVisible(true);
                    object.getChildByTag(500).setVisible(true);
                }
                if (name == "decor_dino" && this.hasKey) {
                    object.getChildByTag(600).setVisible(true);
                }
                if (name == "idol_shrooms" && this.hasSaw && !this.sawUsed) {
                    object.getChildByTag(700).setVisible(true);
                }
            } else {
                object.getChildByTag(100).setVisible(false);
                object.getChildByTag(200).setVisible(false);
                if (name == "idol_keykeeper") {
                    object.getChildByTag(300).setVisible(false);
                    object.getChildByTag(400).setVisible(false);
                    object.getChildByTag(500).setVisible(false);
                }
                if (name == "decor_dino") {
                    object.getChildByTag(600).setVisible(false);
                }
                if (name == "idol_shrooms") {
                    object.getChildByTag(700).setVisible(false);
                }
            }
        }
    },

    setState:function(newState) {
        if (this.state == newState) {
            return;
        }
        this.state = newState;
        this.girl.setFlippedX(newState == -1);
        this.animateWalk();
    },

    idleEffectId:null,
    animateIdle:function() {
        var number = 1 + (cc.rand() | 0)%3;
        if (number == 3 && (cc.rand() | 0)%3 != 2) {
            number = 1;
        }
        var framesByNumber = {
            1 : 6,
            2 : 51,
            3 : 41
        };
        var animation = getAnimation("girl_idle_00" + number + "_", framesByNumber[number]);
        var self = this;
        var action = cc.sequence(
            cc.delayTime(7.0),
            cc.callFunc(function() {
                if (number != 1) {
                    self.idleEffectId = cc.audioEngine.playEffect(res["idle_" + number], false);
                }
            }),
            cc.animate(animation),
            cc.callFunc(function() {
                self.animateIdle();
            })
        );
        this.girl.runAction(action);
    },

    stepsLeftUntilEvent:0,
    playStepEvent:function() {
        this.stepsLeftUntilEvent--;
        if (this.stepsLeftUntilEvent == 0) {
            var eventName = "step_event_" + getEvenRandom(1, 9, 5, "step_event");
            cc.audioEngine.playEffect(res[eventName], false);
        }

        if (this.stepsLeftUntilEvent < 0) {
            this.stepsLeftUntilEvent = getEvenRandom(8, 16);
        }
    },

    animateWalk:function() {
        var self = this;
        this.girl.stopAllActions();
        cc.audioEngine.stopEffect(this.idleEffectId);
        var animation = getAnimation("girl_walk_", 31, true, 0.03);
        var action = cc.repeatForever(cc.animate(animation));
        this.girl.runAction(action);

        var delay = 0.45;
        var sound = cc.repeat(cc.sequence(
            cc.callFunc(function() {
                cc.audioEngine.playEffect(res.step_1, false);
                self.playStepEvent();
            }),
            cc.delayTime(delay),
            cc.callFunc(function() {
                cc.audioEngine.playEffect(res.step_2, false);
                self.playStepEvent();
            }),
            cc.delayTime(delay)
        ), 10000);
        this.girl.runAction(sound);
    },

    stopWalk:function() {
        this.girl.stopAllActions();
        this.girl.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("girl_idle_001_0001.png"));
        this.animateIdle();
    },

    fixPoints:function() {
        for (var i = 0; i < this.points.length; i++) {
            this.points[i].x += 150;
        }
    },

    drawNode:null,
    drawDebugGraph:function() {
        if (this.drawNode == null) {
            this.drawNode = new cc.DrawNode();
            this.root.addChild(this.drawNode, 100);
        }

        var pointCount = this.points.length;
        for (var i = 0; i < pointCount; i++) {
            this.drawNode.drawPoint(this.points[i], 20.0, cc.color.RED);

            var text = new cc.LabelTTF("" + i, "Pribambas", 20);
            text.x = this.points[i].x;
            text.y = this.points[i].y;
            text.anchorY = 1.0;
            this.root.addChild(text, 10);
        }

        for (var v1 in this.edges) {
            var vs = this.edges[v1];
            var vsl = vs.length;
            for (var i = 0; i < vsl; i++) {
                this.drawNode.drawLine(this.points[v1], this.points[vs[i]], cc.color.RED);
            }
        }
    },

    currentPoint:0,
    gotoPoint:function(id) {
        var p1 = this.girl.getPosition();
        var p2 = this.points[id];
        var distance = cc.pDistance(p1, p2);
        var time = distance/this.girlSpeed;
        var self = this;
        this.girl.setFlippedX(p2.x < p1.x);
        var walk = cc.sequence(
            cc.moveTo(time, this.points[id]),
            cc.callFunc(function() {
                self.move();
            }));
        walk.tag = 1000;
        this.girl.runAction(walk);
        this.currentPoint = id;
    },

    way:null,
    wayId:0,
    move:function() {
        this.wayId += 1;
        if (this.wayId == this.way.length) {
            this.stopWalk();
            this.wayId = 0;
            this.moving = false;
        } else {
            this.moving = true;
            this.gotoPoint(this.way[this.wayId]);
        }
    },

    findNearestPoint:function(p) {
        var l = this.points.length;
        var md = 10000.0;
        var mi = -1;
        for (var i = 0; i < l; i++) {
            var d = cc.pDistance(p, this.points[i]);
            if (d < md) {
                md = d;
                mi = i;
            }
        }

        return mi;
    },

    findWay:function(p) {
        var way = [];
        var m = p;
        var w = this.findWayHelper(p, [this.currentPoint], {});

        way.push(p);
        while (m != this.currentPoint) {
            way.push(w[m]);
            m = w[m];
        }
        return way.reverse();
    },

    findWayHelper:function(p, v, w) {
        var v2 = [];
        for (var i = 0; i < v.length; i++) {
            var n = this.edges[v[i]];
            for (var j = 0; j < n.length; j++) {
                if (!(n[j] in w)) {
                    w[n[j]] = v[i];
                    v2.push(n[j]);
                }
                if (n[j] == p) {
                    return w;
                }
            }
        }
        return this.findWayHelper(p, v2, w);
    },

    say:function(object, text, ignore, fade) {
        if (object == null) {
            return;
        }
        if (typeof(ignore) === 'undefined') {
            ignore = false;
        }
        if (typeof(fade) === 'undefined') {
            fade = true;
        }

        if (!ignore) {
            var old = this.root.getChildByTag(10);
            if (old != null) {
                old.tag = 0;
                old.stopAllActions();
                old.runAction(cc.sequence(
                    cc.fadeTo(0.1, 0),
                    cc.removeSelf()
                ));
            }
        }

        //isWeb() ? "Pribambas" :
        var phrase = new cc.LabelTTF(text, "Pribambas", 25);
        phrase.x = object.getPosition().x;
        phrase.y = object.getPosition().y + (1.0 - object.anchorY)*object.getBoundingBox().height;
        if (object === this.objects["idol_croc"]) {
            phrase.x += 220;
            phrase.y -= 380;
        }
        if (object == this.objects["idol_bear"]) {
            phrase.x -= 100;
            phrase.y -= 150;
        }
        if (object == this.objects["idol_yaga"]) {
            phrase.y -= 50;
        }
        if (object == this.objects["idol_horse"]) {
            phrase.y -= 20;
        }
        if (object == this.objects["idol_shrooms"]) {
            phrase.x += 200;
        }
        phrase.anchorY = 0.0;
        phrase.opacity = 0;
        phrase.setDimensions(450, 0);
        phrase.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        if (!ignore) {
            phrase.setTag(10);
        }
        if (object != this.girl) {
            phrase.color = cc.color(229, 133, 123);
        }
        this.root.addChild(phrase, 1000);

        if (text == "") {
            return;
        }

        var duration = Math.max(ignore ? 4.0 : 2.5, 0.125*text.length);
        var box = new cc.Scale9Sprite(res.text_box);
        box.setColor(cc.color.BLACK);
        // box.setCapInsets(cc.rect(50, 50, 50, 50));
        // box.setContentSize(100, 100);
        box.setContentSize(phrase.getContentSize().width + 20, Math.max(128, phrase.getContentSize().height + 20));
        box.x = phrase.getContentSize().width / 2;
        box.y = phrase.getContentSize().height / 2;
        box.opacity = 0;
        phrase.addChild(box, -100);

        if (fade) {
            phrase.runAction(cc.sequence(
                cc.fadeTo(0.2, 255),
                cc.delayTime(duration),
                cc.fadeTo(0.2, 0),
                cc.removeSelf()
            ));

            box.runAction(cc.sequence(
                cc.fadeTo(0.2, 240),
                cc.delayTime(duration),
                cc.fadeTo(0.2, 0)
            ));
        } else {
            phrase.runAction(cc.fadeTo(0.2, 255));
            box.runAction(cc.fadeTo(0.2, 240));
        }
    },

    sayHello:function(object) {
        var number = 1 + (cc.rand() | 0)%6;
        this.say(object, strings["hey_" + number]);
    },

    sayBoring:function() {
        var number = 1 + (cc.rand() | 0)%3;
        this.say(this.girl, strings["boring_" + number]);
    },

    phrase:-1,
    phrases:null,
    dialogueCallback:null,
    dialogueOn:false,
    showDialogue:function(phrases, callback) {
        this.dialogueOn = true;
        this.phrases = phrases;
        this.dialogueCallback = callback;
        this.showPhrase();
    },

    showPhrase:function() {
        this.phrase++;
        if (this.phrase == this.phrases.length) {
            this.phrase = -1;
            this.say(this.girl, "");
            this.dialogueOn = false;
            if (typeof(this.dialogueCallback) !== 'undefined') {
                this.runAction(cc.callFunc(this.dialogueCallback));
            }
        } else {
            this.say(this.phrases[this.phrase][0], this.phrases[this.phrase][1], false, false);
        }
    },

    usable:["idol_bear", "idol_shrooms", "idol_keykeeper", "idol_hare", "idol_horse", "idol_yaga", "idol_croc",
        "play_swing", "play_slide", "play_crocodile",
        "decor_streetlamp", "decor_umbrella", "decor_tires", "decor_steps", "decor_dino", "dino_door", "moth"],

    addButtons:function() {
        var self = this;

        for (var i = 0; i < this.usable.length; i++) {
            var name = this.usable[i];
            var object = this.objects[name];
            if (object == null) {
                continue;
            }

            var buttonPos = cc.p(object.getContentSize().width*0.5, object.getContentSize().height*0.65)
            if (name in this.centers) {
                buttonPos.x = object.getContentSize().width*this.centers[name].x;
                buttonPos.y = object.getContentSize().height*this.centers[name].y;
            }

            var lookButton = new ccui.Button();
            lookButton.loadTextures(res.look, "", "");
            lookButton.x = buttonPos.x - 30;
            lookButton.y = buttonPos.y;
            lookButton.setPropagateTouchEvents(false);
            lookButton.addTouchEventListener(this.createListener(name, "look"), this);
            lookButton.setTag(100);
            lookButton.setVisible(false);
            object.addChild(lookButton);

            var useButton = new ccui.Button();
            useButton.loadTextures(res.use, "", "");
            useButton.x = buttonPos.x + 30;
            useButton.y = buttonPos.y;
            useButton.setPropagateTouchEvents(false);
            useButton.addTouchEventListener(this.createListener(name, "use"), this);
            useButton.setTag(200);
            useButton.setVisible(false);
            object.addChild(useButton);
        }
    },

    addButton:function(name, pos, tag, action, icon) {
        var object = this.objects[name];
        if (object == null) {
            return;
        }

        var button = new ccui.Button();
        button.loadTextures(icon, "", "");
        button.x = pos.x;
        button.y = pos.y;
        button.setPropagateTouchEvents(false);
        button.addTouchEventListener(this.createListener(name, action), this);
        button.setTag(tag);
        button.setVisible(false);
        object.addChild(button);
    },

    createListener:function(name, action) {
        var self = this;
        var listener = function(sender, type) {
            if (type == ccui.Widget.TOUCH_ENDED) {
                self.buttonPressed = true;
                self.processTouch(name, action);
                self.runAction(cc.sequence(
                    cc.delayTime(0.01),
                    cc.callFunc(function() {
                        self.buttonPressed = false;
                    })
                ));
            }
        };
        return listener;
    },

    clicked:function() {
        var self = this;
        self.justClicked = true;
        self.runAction(cc.sequence(
            cc.delayTime(0.2),
            cc.callFunc(function() {
                self.justClicked = false;
            })
        ));
    },

    note:0,
    noteSequence : ["idol_bear", "idol_hare", "idol_horse", "idol_shrooms", "idol_yaga"],
    noteLetters : ["A", "N", "G", "E", "R"],
    notesOn : false,

    swingUsed:false,
    slideUsed:false,
    crocUsed:false,
    bearSpoke:false,
    pressed:0,
    keykeeperSequence:["left", "right", "nose"],
    keykeeperOpened:false,
    processTouch:function(name, action) {
        var self = this;

        if (self.justClicked) {
            return;
        }
        self.clicked();

        if (self.moving || self.busy) {
            return;
        }

        var object = self.objects[name];
        if (action == "look") {
            if (name == "idol_keykeeper" && this.fractured) {
                this.say(self.girl, "I believe some anger management won't hurt.");
            } else {
                this.say(self.girl, strings[name + "_look"]);
            }
            return;
        }

        this.say(this.girl, "");

        if (this.notesOn && action == "use" && (name != "play_swing") && (name != "play_slide") && (name != "idol_croc") && (name != "idol_keykeeper")) {
            this.checkNote(name);
            return;
        }

        switch (name) {
            case "play_swing":
                this.girl.setVisible(false);
                cc.audioEngine.stopEffect(this.idleEffectId);
                this.busy = true;
                this.swingUsed = true;
                var times = 3;
                cc.audioEngine.playEffect(res.swing, false);
                object.runAction(
                    cc.sequence(
                        cc.repeat(cc.sequence(
                            cc.animate(getAnimation("swing_", 41))),
                            times),
                        cc.callFunc(function () {
                            self.girl.setVisible(true);
                            self.busy = false;
                            self.checkBear();
                        })
                    )
                );
                break;

            case "play_slide":
                this.girl.setVisible(false);
                cc.audioEngine.stopEffect(this.idleEffectId);
                this.busy = true;
                cc.audioEngine.playEffect(res.slide_down, false);
                object.runAction(cc.sequence(
                    cc.animate(getAnimation("girl_slide_001_", 86)),
                    cc.callFunc(function () {
                        self.girl.setPosition(self.points[22]);
                        self.currentPoint = 22;
                        self.girl.setFlippedX(true);
                        self.girl.setVisible(true);
                        self.busy = false;
                        self.checkBear();
                    })
                ));
                this.slideUsed = true;
                break;

            case "idol_croc":
                if (this.crocUsed) {
                    if (this.notesOn && !this.fractured) {
                        self.say(object, "The keeper is falling apart. Don't let them sing the song of ANGER, he won't survive it...");
                    } else {
                        self.say(self.girl, "Mr. Crocodile asked not to hop on him anymore.");
                    }
                } else {
                    this.busy = true;
                    this.girl.setVisible(false);
                    cc.audioEngine.stopEffect(this.idleEffectId);
                    cc.audioEngine.playEffect(res.croc_jump, false);
                    object.runAction(cc.sequence(
                        cc.animate(getAnimation("crocodile_jamping_fix_", 55)),
                        cc.callFunc(function() {
                            self.girl.setVisible(true);
                        }),
                        cc.delayTime(0.5),
                        cc.callFunc(function() {
                            self.showDialogue([
                                [object, "[Cough]"],
                                [self.girl, "HEY! Are you talking?\nYou're alive? For real?"],
                                [object, "No!"],
                                [self.girl, "Well who's talking then?"],
                                [object, "Nobody. Leave now, girl!"],
                                [self.girl, "But..."],
                                [object, "Leave, I can't speak to you.\nPlay on the playground and go away.\nAnd don't jump on me anymore!"]
                            ], function() {
                                self.busy = false;
                                self.crocUsed = true;
                                self.checkBear();
                            });
                        })
                    ));
                }
                break;

            case "idol_bear":
                if (this.mothPos == "idol_bear") {
                    this.driveAwayMoth("idol_hare");
                } else {
                    if (this.bearSpoke) {
                        this.sayHello(this.girl);
                    } else {
                        this.busy = true;
                        self.showDialogue([
                            [self.girl, "Mr. Bear? Will you speak to me?\nSay anything?"],
                            [object, "...for the time of youth was fled,\nAnd grey hairs were on my head."],
                            [self.girl, "Mr. Bear? What are you talking about?\nGrey hairs on your head? You don't have any grey hair."],
                            [object, "I'm not allowed to talk to you.\nLeave now, so nobody could see us talking."],
                            [self.girl, "Ok, I've got to find out what this grey haired head is all about!"],
                        ], function() {
                            self.busy = false;
                            self.bearSpoke = true;
                        });
                    }
                }
                break;

            case "idol_hare":
                if (this.mothPos == "idol_hare") {
                    this.driveAwayMoth("idol_horse");
                } else {
                    this.sayHello(self.girl);
                }
                break;

            case "idol_horse":
                if (this.mothPos == "idol_horse") {
                    this.driveAwayMoth("idol_keykeeper");
                } else {
                    this.sayHello(self.girl);
                }
                break;

            case "idol_yaga":
                this.sayHello(self.girl);
                break;

            case "idol_shrooms":
                if (this.hasSaw && ! this.sawUsed && action == "saw") {
                    this.say(self.girl, "I'm going to remove this ugly worm. Here we go.");
                    this.sawUsed = true;
                    this.saw.runAction(cc.fadeTo(0.25, 0));
                    object.getChildByTag(700).setVisible(false);

                    var moth = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("moth_idle_0001.png"));
                    var idle = cc.repeatForever(cc.animate(getAnimation("moth_idle_", 40)));
                    idle.tag = 10;
                    moth.runAction(idle);
                    moth.setPosition(this.mothPositions["idol_bear"]);
                    this.root.addChild(moth, 1000);
                    this.moth = moth;
                    this.mothPos = "idol_bear";

                    this.busy = true;
                    this.runAction(cc.sequence(
                        cc.delayTime(1.0),
                        cc.callFunc(function() {
                            cc.audioEngine.playEffect(res.saw_sound, false);
                        }),
                        cc.delayTime(1.0),
                        cc.callFunc(function() {
                            self.objects["idol_shrooms"].runAction(cc.fadeTo(0.25, 0));
                        }),
                        cc.delayTime(1.0),
                        cc.callFunc(function() {
                            self.showDialogue([
                                [self.girl, "That's better. Now, when the worm is no more, are you feeling better,\nMr. Shroom? I know you hear me. Please, talk!"],
                                [object, "Oooooh, thank you, girl! This worm has tortured me forever! It's going to be much easier to keep the watch now."],
                                [self.girl, "What watch? What are you talking about?"],
                                [object, "We are guarding the entrance to...\nOh! Tsssk! I shouldn't talk about it!\nI CAN NOT TALK ABOUT IT!\nMUST NOT, MUST NOT!\nLEAVE BEFORE SOMEONE SEES THAT WE'RE TALKING!"],
                                [self.girl, "Entrance to where? Mr. Shroom? Hey?..\nWell, he's silent again."],
                            ], function () {
                                self.busy = false;
                                cc.audioEngine.stopMusic();
                                cc.audioEngine.playMusic(res.angry_theme, true);
                            });
                        })
                    ));
                } else {
                    this.sayHello(self.girl);
                }
                break;

            case "idol_keykeeper":
                if (action == "nose" || action == "left" || action == "right") {
                    if (this.keykeeperSequence[this.pressed] == action) {
                        this.pressed += 1;
                    } else {
                        if (this.keykeeperSequence[0] == action) {
                            this.pressed = 1;
                        } else {
                            this.pressed = 0;
                        }
                    }

                    if (this.pressed == 3) {
                        this.keykeeperOpened = true;
                    }

                    this.busy = true;
                    object.getChildByTag(300).setVisible(false);
                    object.getChildByTag(400).setVisible(false);
                    object.getChildByTag(500).setVisible(false);
                    this.runAction(cc.sequence(
                        cc.delayTime(1.5),
                        cc.callFunc(function(){
                            if (!self.keykeeperOpened) {
                                self.busy = false;
                                object.getChildByTag(300).setVisible(true);
                                object.getChildByTag(400).setVisible(true);
                                object.getChildByTag(500).setVisible(true);
                            } else {
                                self.canUse["idol_keykeeper"] = true;
                                cc.audioEngine.playEffect(res.fin_pose);
                                object.runAction(cc.animate(getAnimation("keykeeper_fin_pose_", 21, false)));
                                self.runAction(cc.sequence(
                                    cc.delayTime(1.0),
                                    cc.callFunc(function () {
                                        self.busy = false;
                                        self.objects["mouth"].visible = true;
                                        self.objects["mouth"].runAction(cc.fadeTo(0.1, 255));
                                    })
                                ));
                            }
                        })
                    ));
                }

                if (action == "nose") {
                    cc.audioEngine.playEffect(res.nose);
                    object.runAction(cc.animate(getAnimation("keykeeper_nose_", 21)));
                } else if (action == "right") {
                    cc.audioEngine.playEffect(res.mustache_left);
                    object.runAction(cc.animate(getAnimation("keykeeper_mustache_left_", 21)));
                } else if (action == "left") {
                    cc.audioEngine.playEffect(res.mustache_right);
                    object.runAction(cc.animate(getAnimation("keykeeper_mustache_right_", 21)));
                } else if (action == "use") {
                    if (this.keykeeperOpened && !this.hasSaw && !this.sawUsed) {
                        this.say(this.girl, "It looks like there's something in his mouth. It's a mandible. Sharp as a saw.");
                        this.hasSaw = true;
                        this.animateAction();
                        this.saw.runAction(cc.sequence(
                            cc.delayTime(1.0),
                            cc.fadeTo(0.25, 255)
                        ));
                        self.objects["mouth"].visible = false;
                    } else if (this.fractured && !this.hasKey) {
                        this.say(self.girl, "A key. Now I need a door to open.");
                        object.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("idol_keykeeper_empty.png"));
                        this.hasKey = true;
                        this.animateAction();
                        this.key.runAction(cc.sequence(
                            cc.delayTime(1.0),
                            cc.fadeTo(0.25, 255)
                        ));
                        this.canUse["decor_dino"] = true;
                        this.canUse["idol_keykeeper"] = false;
                        object.getChildByTag(200).setVisible(false);
                    } else {
                        if (this.sneezed) {
                            this.say(self.girl, "He doesn't seem well.\nI better stay away.")
                        } else {
                            this.sayHello(self.girl);
                        }
                    }
                }

                break;

            case "decor_dino":
                if (action == "key" && this.hasKey) {
                    this.busy = true;
                    this.key.runAction(cc.fadeTo(0.25, 0));
                    object.getChildByTag(100).setVisible(false);
                    object.getChildByTag(200).setVisible(false);
                    object.getChildByTag(600).setVisible(false);
                    self.animateAction();
                    this.runAction(cc.sequence(
                        cc.delayTime(1.5),
                        cc.callFunc(function() {
                            self.objects["decor_dino_open"].runAction(cc.fadeTo(0.25, 255));
                            cc.audioEngine.playEffect(res.door, false);
                        }),
                        cc.delayTime(1.5),
                        cc.callFunc(function() {
                            self.say(self.girl, "Wow, a passage! I wonder where it leads?");
                        }),
                        cc.delayTime(6.0),
                        cc.callFunc(function() {
                            var transition = new cc.TransitionFade(2.5, new TitlesScene());
                            cc.director.runScene(transition);
                        })
                    ));
                } else {
                    this.sayHello(self.girl);
                }
                break;
        }
    },
    
    checkBear:function() {
        if (!this.crocUsed) {
            return;
        }

        this.canLook["idol_keykeeper"] = true;
        this.canLook["decor_umbrella"] = true;
        this.canLook["decor_dino"] = true;
        this.canLook["decor_steps"] = true;
        this.canLook["idol_shrooms"] = true;
        this.canLook["idol_hare"] = true;
        this.canLook["idol_horse"] = true;
        this.canLook["idol_yaga"] = true;
        this.canLook["idol_bear"] = true;

        this.canUse["idol_keykeeper"] = true;
        this.canUse["idol_shrooms"] = true;
        this.canUse["idol_hare"] = true;
        this.canUse["idol_horse"] = true;
        this.canUse["idol_yaga"] = true;
        this.canUse["idol_bear"] = true;
    },

    animateAction:function() {
        var self = this;
        this.girl.stopAllActions();
        cc.audioEngine.stopEffect(this.idleEffectId);
        cc.audioEngine.playEffect(res.action, false);
        this.girl.runAction(cc.sequence(
            cc.animate(getAnimation("girl_action_up_", 45)),
            cc.callFunc(function() {
                self.animateIdle();
            })
        ));
    },

    driveAwayMoth:function(to) {
        var self = this;
        var current = this.objects[this.mothPos];
        this.girl.setFlippedX(current.x < this.girl.x);

        this.mothPos = to;
        var next = this.mothPositions[to];

        this.animateAction();

        this.busy = true;
        var duration = cc.pDistance(current.getPosition(), next)/600.0;
        var points = [
            cc.p(0.33*next.x + 0.67*current.x, 0.33*next.y + 0.67*current.y + 220),
            cc.p(0.67*next.x + 0.33*current.x, 0.67*next.y + 0.33*current.y + 150),
            cc.p(next.x, next.y)
        ];

        this.moth.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.callFunc(function () {
                self.moth.stopActionByTag(10);
                self.moth.setFlippedX(current.x < next.x);
                var fly = cc.repeatForever(cc.animate(getAnimation("moth_fly_loop_", 10)));
                fly.tag = 10;
                self.moth.runAction(fly);
            }),
            cc.bezierTo(duration, points),
            cc.callFunc(function() {
                self.moth.stopActionByTag(10);
                var idle = cc.repeatForever(cc.animate(getAnimation("moth_idle_", 40)));
                idle.tag = 10;
                self.moth.runAction(idle);
                self.busy = false;

                if (to == "idol_keykeeper") {
                    self.sneeze();
                }
            })
        ));
    },
    
    sneeze:function() {
        var self = this;
        cc.audioEngine.stopMusic();
        cc.audioEngine.playMusic(res.culmination_theme, true);
        cc.audioEngine.playEffect(res.fracture, false);

        this.moth.stopActionByTag(10);
        var fly = cc.repeatForever(cc.animate(getAnimation("moth_fly_loop_", 10)));
        this.moth.setFlippedX(true);
        this.moth.runAction(fly);
        this.moth.runAction(cc.moveTo(2.0, this.objects["idol_bear"].getPosition()));
        this.moth.runAction(cc.fadeTo(2.0, 0));

        var idol = this.objects["idol_keykeeper"];
        idol.runAction(cc.animate(getAnimation("keykeeper_fractured_", 30, false)));
        
        this.busy = true;
        this.sneezed = true;
        this.runAction(cc.sequence(
            cc.delayTime(1.0),
            cc.callFunc(function() {
                self.busy = false;
                self.say(self.objects["idol_hare"], "AWFUL, AWFUL GIRL!", true);
                self.say(self.objects["idol_croc"], "DAMN IT! THIS IS IRREVERSIBLE!", true);
                // self.say(self.objects["idol_horse"], "NOOOOO!!!", true);
                self.say(self.objects["idol_yaga"], "WHAT HAVE YOU DONE???", true);
                self.notesOn = true;
            })
        ));
    },

    crack:function() {
        var self = this;
        this.busy = true;
        this.fractured = true;
        cc.audioEngine.playEffect(res.fracture_fin);

        var idol = this.objects["idol_keykeeper"];
        idol.runAction(cc.animate(getAnimation("keykeeper_fractured_fin_", 20, false)));
        this.runAction(cc.sequence(
            cc.delayTime(1.0),
            cc.callFunc(function() {
                self.busy = false;
            })
        ));
        // this.canUse["idol_keykeeper"] = true;
    },

    noteSprites : [],
    addNotes : function() {
        for (var i = 0; i < 5; i++) {
            var name = this.noteSequence[i];
            var object = this.objects[name];
            var letter = new cc.LabelTTF(this.noteLetters[i], "Pribambas", 60);
            letter.x = object.getContentSize().width / 2;
            letter.y = object.getContentSize().height / 2 + 100;
            letter.color = cc.color(229, 133, 123);
            letter.opacity = 0;
            letter.runAction(cc.repeat(cc.sequence(
                cc.moveBy(1.0, 0, 20).easing(cc.easeInOut(2.0)),
                cc.moveBy(1.0, 0, -20).easing(cc.easeInOut(2.0))
            ), 10000));
            this.noteSprites.push(letter);
            object.addChild(letter);
        }
    },

    hideNotes : function() {
        for (var i = 0; i < 5; i++) {
            this.noteSprites[i].runAction(cc.fadeTo(0.25, 0));
        }
    },

    checkNote : function(name) {
        var self = this;

        this.busy = true;
        this.runAction(cc.sequence(
            cc.delayTime(2.0),
            cc.callFunc(function() {
                self.busy = false;
            })
        ));

        var hasNote = false;
        for (var i = 0; i < this.noteSequence.length; i++) {
            if (name == this.noteSequence[i]) {
                hasNote = true;
                this.noteSprites[i].runAction(cc.fadeTo(0.25, 255));
                cc.audioEngine.playEffect(res["letter_" + (i + 1)]);
            }
        }

        if (!hasNote) {
            return;
        }

        this.runAction(cc.sequence(
            cc.delayTime(1.0),
            cc.callFunc(function() {
                if (name != self.noteSequence[self.note]) {
                    cc.audioEngine.playEffect(res.letter_wrong, false);
                    self.hideNotes();
                    self.note = 0;
                } else {
                    self.note++;
                }

                if (self.note == 5) {
                    cc.audioEngine.playEffect(res.letter_success, false);
                    self.hideNotes();
                    self.notesOn = false;
                    self.runAction(cc.sequence(
                        cc.delayTime(3.0),
                        cc.callFunc(function() {
                            self.crack();
                        })
                    ))
                }
            })
        ));
    },


    debugOn:function() {
        var self = this;

        self.sneezed = true;
        // self.crocUsed = true;
        // self.checkBear();

        cc.audioEngine.stopMusic();
        cc.audioEngine.stopMusic();

        // this.notesOn = true;
        this.girlSpeed = 220;

        this.canLook["idol_keykeeper"] = true;
        this.canLook["decor_umbrella"] = true;
        this.canLook["decor_dino"] = true;
        this.canLook["decor_steps"] = true;
        this.canLook["idol_shrooms"] = true;
        this.canLook["idol_hare"] = true;
        this.canLook["idol_horse"] = true;
        this.canLook["idol_yaga"] = true;
        this.canLook["idol_bear"] = true;

        this.canUse["idol_keykeeper"] = true;
        this.canUse["idol_shrooms"] = true;
        this.canUse["idol_hare"] = true;
        this.canUse["idol_horse"] = true;
        this.canUse["idol_yaga"] = true;
        this.canUse["idol_bear"] = true;

        if ('keyboard' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function (key, event) {
                    switch(key) {
                        case 82:
                            cc.game.restart();
                            break;
                        // case 37:
                        //     self.setState(-1);
                        //     break;
                        // case 39:
                        //     self.setState(1);
                        //     break;
                    }
                },
                onKeyReleased: function (key, event) {
                    if (self.state != 0) {
                        self.state = 0;
                        self.stopWalk();
                    }
                }
            }, this);
        } else {
            cc.log("KEYBOARD Not supported");
        }
    }

});

var PlaygroundScene = cc.Scene.extend({
    onEnter:function() {
        this._super();
        var layer = new PlaygroundLayer();
        this.addChild(layer);
    }
});

