var container, scene, camera, renderer, controls;
var flag = false;
var timestamp = 0;
var list = {};
var N = 208;

init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
    scene.add(camera);
    camera.position.set(0, 150, 400);
    camera.lookAt(scene.position);

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('ThreeJS').appendChild(renderer.domElement);

    var x = -150;
    var y = -200;
    var z = 0;

    for (i = 0; i < N; i++) {
        var animated = i % 7 == 0;
        var fontColor = animated ? {
            r: 255,
            g: 255,
            b: 255,
            a: 1.0
        } : {
            r: 255,
            g: 255,
            b: 0,
            a: 1.0
        };
        var spritey = makeTextSprite('' + getRandom(1000, 9999), fontColor);
        spritey.name = 'text-' + i;
        spritey.position.set(x, y, z);

        if (animated) {
            list[spritey.name] = spritey;
        }

        y += 20;
        if (y > 100) {
            x += 30;
            y = -200;
        }

        scene.add(spritey);
    }
}

function getRandom(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function updateText(id, text) {
    var animated = false;
    var name = 'text-' + id;
    var obj = scene.getObjectByName(name);
    if (obj == undefined) {
        console.log('obj undefined!');
        return;
    }

    var fontColor = {
        r: 255,
        g: 255,
        b: 0,
        a: 1.0
    };

    if (name in list) {
        fontColor = {
            r: 255,
            g: 255,
            b: 255,
            a: 1.0
        };
        animated = true;
    }

    var x = obj.position.x;
    var y = obj.position.y;
    var z = obj.position.z;
    var materialColor = obj.material.color.clone();

    scene.remove(obj);

    obj.material.map.dispose();
    obj.geometry.dispose();
    obj.material.dispose();
    obj = null;

    var spritey = makeTextSprite("" + text, fontColor, materialColor);
    spritey.name = name;
    spritey.position.x = x;
    spritey.position.y = y;
    spritey.position.z = z;

    if (animated) {
        list[spritey.name] = spritey;
    }

    scene.add(spritey);
}

function makeTextSprite(message, fontColor, materialColor) {
    var fontface = "Georgia";
    var fontsize = 24;
    var borderThickness = 4;
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var backgroundColor = {
        r: 255,
        g: 255,
        b: 255,
        a: 0.0
    };
    context.font = "Bold " + fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    var metrics = context.measureText(message);
    var textWidth = metrics.width;
    context.fillStyle = "rgba(" + fontColor.r + "," + fontColor.g + "," + fontColor.b + "," + fontColor.a + ")";
    //context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";

    context.fillText(message, borderThickness, fontsize + borderThickness);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        color: materialColor != undefined ? materialColor : 0xffffff
    });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(100, 50, 1.0);
    return sprite;
}

function animate() {
    var d = new Date();
    var t = d.getTime();

    if (t - timestamp > 1000) {
        for (var x in list) {
            var obj = list[x];

            if (flag) {
                obj.material.color = new THREE.Color(0xff0000);
            } else {
                obj.material.color = new THREE.Color(0x00aa00);
            }
            console.log(obj.name + ': ' + JSON.stringify(obj.material.color) + ' - ' + flag);
        }

        flag = !flag;
        timestamp = t;
    }

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

var timer = setInterval(function () {
    var id = getRandom(0, N);
    var value = getRandom(1000, 9999);
    updateText(id, value);
}, 100);
