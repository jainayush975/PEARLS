var animation_id = null;
var current_cluster_centroid = null;
var canvasC = null;
var camera = null;
var scene = null;
var screenW = 0.75*window.innerWidth;
var screenH = 0.75*window.innerHeight; /*SCREEN*/
var pearl_3d_obj_map = {};
var reverse_pearl_3d_obj_map = {};
var reverse_pearl_3d_obj_map2 = {};
var attribute_list = [];
var noofSec = Math.pow(2,6);
var scrollFactor = 500.0;
var mouseVec = new THREE.Vector2();
var current_cluster_id = null;
var currPearlN = null;
var zperiod = 1.0;
var scaleFactor = 1.0;
var currPearls;
var cameraZ = 0;
var cameraY = 0;
var acRfac=10.0;

var mouse_down = function(event) {

    event.preventDefault();

    var canvas = document.getElementById('mycanvas');
    var rect = canvas.getBoundingClientRect();

    var mX = event.clientX - rect.left;
    var mY = event.clientY - rect.top;

    var chX,chY;
    chX = 2 * (mX/screenW) - 1;
    chY = 1 - 2 * (mY/screenH);
    // console.log(chX, chY);
    mouseVec.x = chX;
    mouseVec.y = chY;
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseVec, camera);
    var intersects  = raycaster.intersectObjects(scene.children);

    // for(var i = 0; i<intersects.length; i++) {
    //     intersects[i].object.material.color.set(0x000000);
    // }
    // console.log(intersects);
    // intersects[0].object.material.color.set(0x000000);

    if(intersects.length != 0) {
        currPearlN = pearl_3d_obj_map[intersects[0].object.id];
        if(currently_selected!=null)
        {
            if(currPearlN!=currently_selected["bead_no"] || current_cluster_id!=currently_selected["cluster_no"])
            {
                var obj = scene.getObjectById(reverse_pearl_3d_obj_map[currently_selected["bead_no"]])
                obj.material.color.set(currPearls['shapes'][currently_selected["bead_no"]]['c']);
            }
            intersects[0].object.material.color.set(0x000000);
        }
        else {
            intersects[0].object.material.color.set(0x000000);
        }
        getBead(currPearlN, current_cluster_id,1);
    }

    return ;
}

var mouse_move = function(event) {

    event.preventDefault();

    var canvas = document.getElementById('mycanvas');
    var rect = canvas.getBoundingClientRect();

    var mX = event.clientX - rect.left;
    var mY = event.clientY - rect.top;

    var chX,chY;
    chX = 2 * (mX/screenW) - 1;
    chY = 1 - 2 * (mY/screenH);
    mouseVec.x = chX;
    mouseVec.y = chY;
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseVec, camera);
    var intersects  = raycaster.intersectObjects(scene.children);

    // for(var i = 0; i<intersects.length; i++) {
    //     intersects[i].object.material.color.set(0x000000);
    // }

    if(intersects.length != 0) {
        if(intersects[0].object.type=="Mesh")
        {
            currPearlN = pearl_3d_obj_map[intersects[0].object.id];
            getBead(currPearlN, current_cluster_id,0);
        }
    }

    return ;
}

var wheel_movement = function(event) {
    // mousePos = getMousePos(canvasC,camera,event);
    if(1)
    {
        event.preventDefault();
        scrollFactor -= event.deltaY;
        if(scrollFactor>10000)
            scrollFactor = 10000.0;
        if(scrollFactor<1)
            scrollFactor = 1.0;
    }
    // changeScrollFac = event.deltaY;
}

var key_down = function(event){
    var key_code = event.keyCode;

    if(key_code==37) {
        cameraY -= scrollFactor/500;
    }
    else if(key_code==39) {
        cameraY += scrollFactor/500;
    }
    else if(key_code==38) {
        cameraZ += scrollFactor/500;
    }
    else if(key_code==40) {
        cameraZ -= scrollFactor/500;
    }
    return ;
}

function makeWireFrame(shapedic, pearl_number){

    var ret;
    var geom;
    var rad = shapedic['r']*2;
    if(rad==0.0)
    {
        rad = 10.0;
    }
    if(shapedic['s']==2)
    {
        geom =  new THREE.SphereGeometry( rad, 32, 16 );
        return "nod"
    }
    else if(shapedic['s']==100)
    {
        geom =  new THREE.CubeGeometry( 2*rad, 2*rad, 2*rad );
    }
    else {
        geom =  new THREE.OctahedronGeometry( 2*rad, 0);
        // geom =  new THREE.OctahedronGeometry( 1, 0);
    }
    var edges = new THREE.EdgesGeometry(geom);
    // var Material = new THREE.MeshBasicMaterial({
    //    color: "black",
    //    wireframe: true
    //  });
    ret = new THREE.LineSegments( edges, new THREE.LineBasicMaterial({color: 0x000000}) );
    console.log(acRfac);
    ret.position.set(acRfac*shapedic['x'],acRfac*shapedic['y'],acRfac*shapedic['z']);
    pearl_3d_obj_map[ret.id] = pearl_number;
    reverse_pearl_3d_obj_map2[pearl_number] = ret.id;
    return ret
}

function makeShape(shapedic, pearl_number){
    var ret;
    var geom;
    var rad = shapedic['r']*2;
    if(rad==0.0)
    {
        rad = 10.0;
    }
    if(shapedic['s']==2)
    {
        geom =  new THREE.SphereGeometry( rad, 32, 16 );

    }
    else if(shapedic['s']==100)
    {
        geom =  new THREE.CubeGeometry( 2*rad, 2*rad, 2*rad );

    }
    else {
        geom =  new THREE.OctahedronGeometry( 2*rad, 0);
        // geom =  new THREE.OctahedronGeometry( 1, 0);
    }
    var Material = new THREE.MeshPhongMaterial({
       color: shapedic['c'],
       transparent : true,
       depthWrite: false,
       opacity : 0.5,
       refractionRatio : 1
     });
     if(shapedic['s']==2)
      Material.opacity=0.7
    ret = new THREE.Mesh( geom, Material );
    ret.position.set(acRfac*shapedic['x'],acRfac*shapedic['y'],acRfac*shapedic['z']);
    console.log(acRfac);
    pearl_3d_obj_map[ret.id] = pearl_number;
    reverse_pearl_3d_obj_map[pearl_number]=ret.id;
    return ret
}

function makeAxis(origin,terminus,size,color){
    var direction = new THREE.Vector3().subVectors(terminus, origin).normalize();
    var arrow = new THREE.ArrowHelper(direction, origin,size,color);
    return arrow;
}

function makeTextSprite(message, fontColor, materialColor) {
    var fontface = "Georgia";
    var fontsize = 24;
    var borderThickness = 0;
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
    sprite.center.set(0,1);
    return sprite;
}

function myFunction(pearls, cirgrid) {
                        currently_loaded = null;
                        currently_selected = null;
                        to_be_deleted = null;
                        currPearls = pearls;
                        current_cluster_centroid = pearls['cluster_centroid'];
                        canvasC = document.getElementById('mycanvas')
                        var renderer = new THREE.WebGLRenderer({
                            canvas: canvasC,//document.getElementById('mycanvas'),
                            antialias: true
                        })

                        renderer.setClearColor('#ffffff');
                        renderer.setPixelRatio(window.devicePixelRatio);
                        screenW = Math.floor(window.innerWidth*0.60);
                        screenH = Math.floor(window.innerHeight*0.70);
                        screenW = screenW - screenW%2;
                        screenH = screenH - screenH%2;
                        renderer.setSize(screenW, screenH);

                        camera = new THREE.PerspectiveCamera(45, screenW/screenH , 1, 10000);

                        scene = new THREE.Scene();
                        camera.position.set(scrollFactor, 0, 0);
                        camera.up = new THREE.Vector3(0, 0, 1);
                        camera.lookAt(new THREE.Vector3(0, 0, 0));

                        var light1 = new THREE.DirectionalLight('white');
                        light1.position.set(scrollFactor,0,0).normalize();
                        scene.add(light1);

                        var material = new THREE.LineBasicMaterial({
                        	color: 0x0000ff,
                            linewidth: 1,
                        });

                        var loader = new THREE.FontLoader();
                        let font = loader.parse(fontJSON);

                        // This part contains axis addition to scene


                        // for(var i=0;i<noofSec;i++)
                        // {
                        //         var origint = new THREE.Vector3(0,0,0);
                        //         var terminust = new THREE.Vector3(2*Math.sin(2*i*Math.PI/noofSec),2*Math.cos(2*i*Math.PI/noofSec),0);
                        //         // var terminust = new THREE.Vector3(0,2,-5);
                        //         var axis = makeAxis(origint,terminust,1000,'#000000');
                        //         scene.add(axis);
                        //         // axis.geometry.rotateZ(i*Math.PI/16.0);
                        // }
                        var origin1 = new THREE.Vector3(0,0,0);
                        var terminus1 = new THREE.Vector3(2, 0, 0);
                        var origin2 = new THREE.Vector3(0,0,0);
                        var terminus2 = new THREE.Vector3(0, 2, 0);
                        var origin3 = new THREE.Vector3(0,0,0);
                        var terminus3 = new THREE.Vector3(0,0,2);
                        var origin4 = new THREE.Vector3(0,0,0);
                        var terminus4 = new THREE.Vector3(-2, 0,0);
                        var origin5 = new THREE.Vector3(0,0,0);
                        var terminus5 = new THREE.Vector3(0, -2, 0);
                        var origin6 = new THREE.Vector3(0,0,0);
                        var terminus6 = new THREE.Vector3(0,0,-2);

                        var x_axisp = makeAxis(origin1, terminus1, 10000, '#000000');
                        var y_axisp = makeAxis(origin2, terminus2, 10000, '#000000');
                        var z_axisp = makeAxis(origin3, terminus3, 10000, '#000000');
                        var x_axisn = makeAxis(origin4, terminus4, 10000, '#000000');
                        var y_axisn = makeAxis(origin5, terminus5, 10000, '#000000');
                        var z_axisn = makeAxis(origin6, terminus6, 10000, '#000000');

                        scene.add(y_axisp);
                        scene.add(z_axisp);
                        scene.add(y_axisn);
                        scene.add(z_axisn);

                        requestAnimationFrame(render);

                        var zmax = -1.0;
                        scrollFactor = 500.0;
                        var rmax = 1.0;
                        // Drawing objects

                        for(var key in pearls['shapes']) {
                            var shape = pearls['shapes'][key];
                            rmax = max(rmax,shape['r']);
                        }

                        for (var key in pearls['shapes']) {
                          var shape = pearls['shapes'][key];

                          if(Math.abs(shape['z'])>zmax){
                              zmax = Math.abs(shape['z']);
                        }
                          // shape['r'] = 50.0 * shape['r']/rmax;
                          shape['r'] = min(50.0,shape['r']);
                          var obj = makeShape(shape, parseInt(key));
                          var wireObj = makeWireFrame(shape, parseInt(key));
                          scene.add(obj)
                          if(wireObj!="nod")
                            scene.add(wireObj)
                        }
                        zperiod = max(1.0,zmax/10.0);
                        zperiod = Math.floor(zperiod);
                        zperiod *= 2;
                        var fontColor = {
                            r: 0,
                            g: 0,
                            b: 0,
                            a: 1.0
                        };

                        // var spritey = makeTextSprite(''+0, fontColor)
                        // spritey.name = "meranaamchunchunchun"
                        // spritey.position.set(0,0,0);
                        for(var i=0;i<12;i++)
                        {
                            var spritey = makeTextSprite(''+i*zperiod, fontColor)
                            spritey.position.set(0,0,10*i*zperiod+8);
                            spritey.name = i;
                            spritey.scale.set(200.0*scrollFactor/500.0,100.0*scrollFactor/500.0,2.0*scrollFactor/500.0);
                            scene.add(spritey);
                        }
                        // for(var i=1;i<12;i++)
                        // {
                        //     var spritey = makeTextSprite(''+i*zperiod*-1, fontColor)
                        //     spritey.position.set(0,0,10*-1*i*zperiod+8);
                        //     spritey.name = i;
                        //     spritey.scale.set(200.0*scrollFactor/500.0,100.0*scrollFactor/500.0,2.0*scrollFactor/500.0);
                        //     scene.add(spritey);
                        // }

                        document.getElementById('mycanvas').addEventListener("wheel", wheel_movement, false);
                        document.getElementById('mycanvas').addEventListener("mousedown", mouse_down, false);
                        document.getElementById('mycanvas').addEventListener("mousemove", mouse_move, false);

                        // var Mytestshape ={'s':1,'r':1,'x':0,'y':0,'z':0,'c':'#00ff00'};
                        // var obj = makeShape(Mytestshape, 1);
                        // scene.add(obj);
                        function render() {

                            var obj_id1=null,obj_id2=null;
                            if(to_be_deleted!=null)
                            {
                                obj_id1 = reverse_pearl_3d_obj_map[to_be_deleted["bead_no"]];
                                obj_id2 = reverse_pearl_3d_obj_map2[to_be_deleted["bead_no"]];
                                scene.remove(scene.getObjectById(obj_id1));
                                scene.remove(scene.getObjectById(obj_id2));
                                to_be_deleted =null;
                            }



                            new_camera = new THREE.PerspectiveCamera(45, screenW/screenH , 1, 10000);
                            camera = new_camera;
                            for(i=0; i<scene.children.length; i++) {
                                if(scene.children[i].type=="Object3D") {
                                    scene.remove(scene.children[i]);
                                }
                                else if (scene.children[i].type=="Mesh") {
                                    scene.children[i].scale = new THREE.Vector3(scrollFactor/500.0,scrollFactor/500.0,scrollFactor/500.0);
                                }
                                else if(scene.children[i].type=="Sprite")
                                {
                                    scene.children[i].scale.set(200.0*scrollFactor/500.0,100.0*scrollFactor/500.0,2.0*scrollFactor/500.0);
                                    var tmpi = scene.children[i].name;
                                    scene.children[i].position.set(0,0,10*tmpi*zperiod+8-(8*(500.0-scrollFactor)/500.0));
                                }

                            }

                            switch (CAMER_VIEW) {
                                case 'PX':
                                    new_camera.position.set(scrollFactor, cameraY, cameraZ);
                                    new_camera.up = new THREE.Vector3(0, 0, 1);
                                    light1.position.set(scrollFactor,0,0).normalize();
                                    scene.add(y_axisp);scene.add(y_axisn);scene.add(z_axisp);scene.add(z_axisn);
                                    break;
                                case 'NX':
                                    new_camera.position.set(-1*scrollFactor, 0, 0);
                                    new_camera.up = new THREE.Vector3(0, 0, 1);
                                    light1.position.set(-1*scrollFactor,0,0).normalize();
                                    scene.add(y_axisp);scene.add(y_axisn);scene.add(z_axisp);scene.add(z_axisn);
                                    break;
                                case 'PY':
                                    new_camera.position.set(0, scrollFactor, 0);
                                    new_camera.up = new THREE.Vector3(0, 0, 1);
                                    light1.position.set(0, scrollFactor, 0).normalize();
                                    scene.add(x_axisp);scene.add(x_axisn);scene.add(z_axisp);scene.add(z_axisn);
                                    break;
                                case 'NY':
                                    new_camera.position.set(0, -1*scrollFactor, 0);
                                    new_camera.up = new THREE.Vector3(0, 0, 1);
                                    light1.position.set(0, -1*scrollFactor, 0).normalize();
                                    scene.add(x_axisp);scene.add(x_axisn);scene.add(z_axisp);scene.add(z_axisn);
                                    break;
                                case 'PZ':
                                    new_camera.position.set(0, 0, scrollFactor);
                                    new_camera.up = new THREE.Vector3(0, 1, 0);
                                    light1.position.set(0, 0, scrollFactor).normalize();
                                    scene.add(x_axisp);scene.add(x_axisn);scene.add(y_axisp);scene.add(y_axisn);
                                    break;
                                case 'NZ':
                                    new_camera.position.set(0, 0, -1*scrollFactor);
                                    new_camera.up = new THREE.Vector3(0, 1, 0);
                                    light1.position.set(0, 0, -1*scrollFactor).normalize();
                                    scene.add(x_axisp);scene.add(x_axisn);scene.add(y_axisp);scene.add(y_axisn);
                                    break;
                                default:
                                    new_camera.position.set(scrollFactor, cameraY, cameraZ);
                                    new_camera.up = new THREE.Vector3(1, 0, 0);
                                    light1.position.set(scrollFactor, 0, 0).normalize();
                                    scene.add(y_axisp);scene.add(y_axisn);scene.add(z_axisp);scene.add(z_axisn);
                                    break;
                            }

                            new_camera.lookAt(new THREE.Vector3(0, cameraY, cameraZ));
                            animation_id = requestAnimationFrame(render);
                            renderer.render(scene, new_camera);
                        }
                        return 0;
}
