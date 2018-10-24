var animation_id = null;
var current_cluster_centroid = null;
var canvasC = null;
var camera = null;
var scene = null;
var screenW = 0.75*window.innerWidth;
var screenH = 0.75*window.innerHeight; /*SCREEN*/
var pearl_3d_obj_map = {};
var attribute_list = [];
var noofSec = Math.pow(2,6);
var scrollFactor = 500.0;
var mouseVec = new THREE.Vector2();
var pearl_3d_obj_map = {};
var current_cluster_id = null;
var currPearlN = null;
var zperiod = 1.0;
var rotObjectMatrix;
function rotateAroundObjectAxis(object, axis, radians) {
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    // object.matrix.multiplySelf(rotObjectMatrix);      // post-multiply
    // new code for Three.JS r55+:
    object.matrix.multiply(rotObjectMatrix);

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js r50-r58:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // new code for Three.js r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}

var mouse_down = function(event) {

    event.preventDefault();

    var canvas = document.getElementById('mycanvas');
    var rect = canvas.getBoundingClientRect();

    var mX = event.clientX - rect.left;
    var mY = event.clientY - rect.top;

    var chX,chY;
    chX = 2 * (mX/screenW) - 1;
    chY = 1 - 2 * (mY/screenH);
    console.log(chX, chY);
    mouseVec.x = chX;
    mouseVec.y = chY;
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseVec, camera);
    var intersects  = raycaster.intersectObjects(scene.children);

    for(var i = 0; i<intersects.length; i++) {
        intersects[i].object.material.color.set(0x000000);
    }

    if(intersects.length != 0) {
      currPearlN = pearl_3d_obj_map[intersects[0].object.id];
      getBead(pearl_3d_obj_map[intersects[0].object.id], current_cluster_id);
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

function makeWireFrame(shapedic, pearl_number)
{
    console.log(shapedic)
    var ret;
    var geom;
    var rad = shapedic['r']*2;
    if(rad==0.0)
    {
        rad = 10.0;
    }
    if(shapedic['s']==2)
    {
        console.log("Yo I am sphere")
        geom =  new THREE.SphereGeometry( rad, 32, 16 );
        return "nod"
    }
    else if(shapedic['s']==100)
    {
        console.log("Yo I am cube")
        geom =  new THREE.CubeGeometry( 2*rad, 2*rad, 2*rad );

    }
    else {
        console.log("Yo I am rhombus3D")
        geom =  new THREE.OctahedronGeometry( 2*rad, 0);
        // geom =  new THREE.OctahedronGeometry( 1, 0);
    }
    var edges = new THREE.EdgesGeometry(geom);
    // var Material = new THREE.MeshBasicMaterial({
    //    color: "black",
    //    wireframe: true
    //  });
    ret = new THREE.LineSegments( edges, new THREE.LineBasicMaterial({color: 0x000000}) );
    ret.position.set(10*shapedic['x'],10*shapedic['y'],10*shapedic['z']);
    return ret
}

function makeShape(shapedic, pearl_number)
{
    console.log(shapedic)
    var ret;
    var geom;
    var rad = shapedic['r']*2;
    if(rad==0.0)
    {
        rad = 10.0;
    }
    if(shapedic['s']==2)
    {
        console.log("Yo I am sphere")
        geom =  new THREE.SphereGeometry( rad, 32, 16 );

    }
    else if(shapedic['s']==100)
    {
        console.log("Yo I am cube")
        geom =  new THREE.CubeGeometry( 2*rad, 2*rad, 2*rad );

    }
    else {
        console.log("Yo I am rhombus3D")
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
    ret.position.set(10*shapedic['x'],10*shapedic['y'],10*shapedic['z']);

    pearl_3d_obj_map[ret.id] = pearl_number;

    return ret
}

function getLabel(font,label) {
    var Label = new THREE.TextGeometry(label.toString(), {font: font, size: 20.0, height: 35, material: 0, bevelThickness: 1, extrudeMaterial: 1});  //TextGeometry(text, parameters)
    var LabelMaterial = new THREE.MeshBasicMaterial({color: '#000000'});
    var retMesh = new THREE.Mesh(Label, LabelMaterial);
    retMesh.position.z = 10.0*label;
    retMesh.position.x = 0.0;
    retMesh.position.y = 0.0;
    return retMesh;
}

function makeAxis(origin,terminus,size,color){
    var direction = new THREE.Vector3().subVectors(terminus, origin).normalize();
    var arrow = new THREE.ArrowHelper(direction, origin,size,color);
    return arrow;
}

function makeText(font,text,tx,ty,tz,tcolor,size){
    var axisLabel = new THREE.TextGeometry(text, {font: font, size: 0.1, height: 0.1, material: 0, bevelThickness: 1, extrudeMaterial: 1});  //TextGeometry(text, parameters)
    var axisMaterial = new THREE.MeshBasicMaterial({color:tcolor});
    var textMesh = new THREE.Mesh(axisLabel, axisMaterial);
    textMesh.position.z = tz
    textMesh.position.x = tx
    textMesh.position.y = ty
    return textMesh;
}

function myFunction(pearls, cirgrid) {

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

                        camera = new THREE.PerspectiveCamera(45, screenW/screenH , 1, 3000);

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
                        // Drawing objects

                        for (var key in pearls['shapes']) {
                          var shape = pearls['shapes'][key];
                          if(Math.abs(shape['z'])>zmax)
                          {
                              zmax = Math.abs(shape['z']);
                          }
                          var obj = makeShape(shape, parseInt(key));
                          var wireObj = makeWireFrame(shape, parseInt(key));
                          scene.add(obj)
                          if(wireObj!="nod")
                            scene.add(wireObj)
                        }
                        zperiod = max(1.0,zmax/10.0);
                        zperiod = Math.floor(zperiod);
                        // var glabel = -580;
                        // var tempMesh = getLabel(font,glabel);
                        // // var zAxis = new THREE.Vector3(0,0,1);
                        // var yAxis = new THREE.Vector3(0,1,0);
                        // var zAxis = new THREE.Vector3(0,0,1);
                        // rotateAroundObjectAxis(tempMesh,yAxis,Math.PI/2.0);
                        // rotateAroundObjectAxis(tempMesh,zAxis,Math.PI/2.0);
                        // scene.add(tempMesh);

                        for(var i=1;i<24;i++)
                        {
                            var glabel = i*zperiod;
                            var tempMesh = getLabel(font,glabel);
                            // var zAxis = new THREE.Vector3(0,0,1);
                            var yAxis = new THREE.Vector3(0,1,0);
                            var zAxis = new THREE.Vector3(0,0,1);
                            rotateAroundObjectAxis(tempMesh,yAxis,Math.PI/2.0);
                            rotateAroundObjectAxis(tempMesh,zAxis,Math.PI/2.0);
                            scene.add(tempMesh);
                        }
                        for(var i=1;i<24;i++)
                        {
                            var glabel = -i*zperiod;
                            var tempMesh = getLabel(font,glabel);
                            // var zAxis = new THREE.Vector3(0,0,1);
                            var yAxis = new THREE.Vector3(0,1,0);
                            var zAxis = new THREE.Vector3(0,0,1);
                            rotateAroundObjectAxis(tempMesh,yAxis,Math.PI/2.0);
                            rotateAroundObjectAxis(tempMesh,zAxis,Math.PI/2.0);
                            scene.add(tempMesh);
                        }
                        console.log(zmax);
                        console.log(zperiod);
                        document.getElementById('mycanvas').addEventListener("wheel", wheel_movement, false);
                        document.getElementById('mycanvas').addEventListener("mousedown", mouse_down, false);
                        // var Mytestshape ={'s':1,'r':1,'x':0,'y':0,'z':0,'c':'#00ff00'};
                        // var obj = makeShape(Mytestshape, 1);
                        // scene.add(obj);
                        function render() {

                            new_camera = new THREE.PerspectiveCamera(45, screenW/screenH , 1, 3000);
                            camera = new_camera;
                            for(i=0; i<scene.children.length; i++) {
                                if(scene.children[i].type=="Object3D") {
                                    scene.remove(scene.children[i]);
                                }
                                else if (scene.children[i].type=="Mesh") {
                                    scene.children[i].scale = new THREE.Vector3(scrollFactor/500.0,scrollFactor/500.0,scrollFactor/500.0);
                                }
                            }

                            switch (CAMER_VIEW) {
                                case 'PX':
                                    new_camera.position.set(scrollFactor, 0, 0);
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
                                    new_camera.position.set(scrollFactor, 0, 0);
                                    new_camera.up = new THREE.Vector3(1, 0, 0);
                                    light1.position.set(scrollFactor, 0, 0).normalize();
                                    scene.add(y_axisp);scene.add(y_axisn);scene.add(z_axisp);scene.add(z_axisn);
                                    break;
                            }

                            new_camera.lookAt(new THREE.Vector3(0, 0, 0));
                            animation_id = requestAnimationFrame(render);
                            renderer.render(scene, new_camera);
                        }
                        return 0;

}
