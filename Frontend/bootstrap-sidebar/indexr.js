var animation_id = null;
var current_cluster_centroid = null;
var canvasC = null;
var camera = null;
var scene = null;
var extra_objects = [];
var oldObjects = null;
var oldColor = null;
var projector, mouse = { x: 0, y: 0 };
var raycaster = new THREE.Raycaster();
var acmouse = new THREE.Vector3();
var screenW = 0.75*window.innerWidth;
var screenH = 0.75*window.innerHeight; /*SCREEN*/
var spdx = 0, spdy = 0; mouseX = 0, mouseY = 0, mouseUp = false,mouseDown = false;
var scrollFactor = 390.0;
var changeScrollFac = 0;
var currOBJ = null;
var current_cluster_id = null;
var currBeadN = null;
var bead_3d_obj_map = {};
var attribute_list = [];
var point_3d_obj_map = {};
var deleted_beads = {};
var deleted_objects = [];
var deleted_beads_lst = [];
var isDone = true;
var noofSec = Math.pow(2,0);
var scaleFactor;
function undo() {
    if(deleted_beads_lst.length>0)
    {
        var lasobj = deleted_objects.pop();
        var lasbe = deleted_beads_lst.pop();
        delete deleted_beads[lasbe];
        var len = lasobj.length;
        for(i=0;i<len;i++)
        {
            scene.add(lasobj[i]);
        }
    }
}

var mouse_move = function(event) {
        mousePos = getMousePos(canvasC,camera,event);
        if(mousePos!=-1)
        {
            mouseX = mousePos['x'];
            mouseY = mousePos['y'];
            acmouse.x = mouseX;
            acmouse.y = mouseY;
        }
}

var mouse_up = function(event) {
    mousePos = getMousePos(canvasC,camera,event);
    if(mousePos!=-1)
        event.preventDefault();
}

var wheel_movement = function(event) {
    mousePos = getMousePos(canvasC,camera,event);
    if(mousePos!=-1)
    {
        event.preventDefault();
        scrollFactor -= event.deltaY;
        if(scrollFactor>1000)
            scrollFactor = 1000.0;
        if(scrollFactor<20)
            scrollFactor = 20.0;
    }
    // changeScrollFac = event.deltaY;
}

var mouse_down = function(event) {

    var isRightMB;
    if ("which" in event)
        isRightMB = event.which == 3;
    mousePos = getMousePos(canvasC,camera,event);
    if(mousePos!=-1){
        event.preventDefault();
        if(mouseDown)
            mouseDown = false;
        else
            mouseDown = true;

        var cp = camera.position;
        acmouse.x = mouseX;
        acmouse.y = mouseY;
        acmouse.z = -5;
        var dir = acmouse;
        dir.x -= cp.x;
        dir.y -= cp.y;
        dir.z -= cp.z;
        var miniRad = null;
        var objID = null;
        raycaster.set(cp,dir.normalize());
        var intersects = raycaster.intersectObjects( scene.children );

        	for ( var i = 0; i < intersects.length; i++ ) {
                if(intersects[i].object.geometry.type == "BoxGeometry"){
        		      // intersects[ i ].object.material.color.set( 0x000000 );
                      trad = intersects[i].object.geometry.length;
                      trad/=2;
                      if(miniRad==null) {
                          miniRad = trad;
                          objID = intersects[i];
                      }
                      else {
                          if(trad<miniRad) {
                              miniRad = trad;
                              objID = intersects[i];
                          }
                      }
                  }
                  else if(intersects[i].object.geometry.type == "CircleGeometry") {
                      trad = intersects[i].object.geometry.radius;
                      if(miniRad==null) {
                          miniRad = trad;
                          objID = intersects[i];
                      }
                      else {
                          if(trad<miniRad){
                              miniRad = trad;
                              objID = intersects[i];
                          }
                      }
                  }
        	}
            currOBJ = objID;
            if(isRightMB==false && currOBJ!=null)
            {
                if(currOBJ.object.id in bead_3d_obj_map) {
                    currBeadN = bead_3d_obj_map[currOBJ.object.id];
                    getBead(bead_3d_obj_map[currOBJ.object.id], current_cluster_id);
                }
            }
            else if(currOBJ!=null){
                // if(currOBJ.object.material.opacity == 0.5)
                //     currOBJ.object.material.opacity = 0;
                // else {
                //     currOBJ.object.material.opacity = 0.5;
                // }
                window.alert("Do you really want to delete?")
                deleted_beads[bead_3d_obj_map[currOBJ.object.id]] = 1;
                deleted_beads_lst.push(currOBJ.object.id);
                isDone = false;
                mouseDown = !mouseDown;
            }
    }
}

function getMousePos(canvas, camera,evt) {
    var rect = canvas.getBoundingClientRect();
    var mX = evt.clientX - rect.left;
    var mY = evt.clientY - rect.top;
    if(mX>screenW || mY>screenH || mX<0 || mY<0)
        return -1;
    // console.log(rect.left,rect.top);
    // console.log(evt.clientX,event.clientY);
    var Cvec = camera.position.clone();
    mX *= 2.0/scrollFactor;
    mY *= -2.0/scrollFactor;
    var cX,cY; // Before transform
    // console.log(screenW,screenH);
    cX = 1 * screenW/scrollFactor;
    cY = 1 * screenH/scrollFactor;
    // console.log(mX,mY,cX,cY);
    mX -= cX;
    mY += cY;
    mX += Cvec['x'];
    mY += Cvec['y'];
    return {
      x: mX,
      y: mY
    };
}

function makeCircles(pointdic, bead_no) {

    if(pointdic['r']==0)
        pointdic['r']=scaleFactor/5.0;
    if(pointdic['s'] == 2){
            var geometry = new THREE.CircleGeometry( pointdic['r']/scaleFactor, 100 );
    }
    else if (pointdic['s'] == 100000){
        var geometry = new THREE.BoxGeometry( 2*pointdic['r']/scaleFactor, 2*pointdic['r']/scaleFactor, 0 );
    }
    else{
        var geometry = new THREE.BoxGeometry( 2*pointdic['r']/scaleFactor, 2*pointdic['r']/scaleFactor, 0 );
    }

    var material = new THREE.MeshBasicMaterial( {
        color: pointdic['c'],
        transparent: true,
        opacity: 0.5,
    } );

    var circle = new THREE.Mesh( geometry, material );
    circle.position.set((acRfac*pointdic['x'])/scaleFactor, (acRfac*pointdic['y'])/scaleFactor, -5);
    if(pointdic['s'] == 1) {
        circle.rotation.z += (Math.PI/4.0);
    }
    bead_3d_obj_map[circle.id] = bead_no;
    return circle;
}

function makeCircles1(pointdic, bead_no) {

    if(pointdic['s'] == 2){
        var geometry = new THREE.CircleGeometry( pointdic['r'], 100 );
        // var geometry = new THREE.
    }
    else if (pointdic['s'] == 100000){
        var geometry = new THREE.BoxGeometry( 2*pointdic['r']/scaleFactor, 2*pointdic['r']/scaleFactor, 0 );
    }
    else{
        var geometry = new THREE.BoxGeometry( 2*pointdic['r']/scaleFactor, 2*pointdic['r']/scaleFactor, 0 );
    }

    var material = new THREE.MeshBasicMaterial( {
        color: pointdic['c'],
        transparent: false,
        opacity: 1,
    } );

    var circle = new THREE.Mesh( geometry, material );
    circle.position.set((acRfac*pointdic['x'])/scaleFactor, (acRfac*pointdic['y'])/scaleFactor, -4.5);
    if(pointdic['s'] == 1) {
        circle.rotation.z += (Math.PI/4.0);
    }
    // bead_3d_obj_map[circle.id] = bead_no;
    return circle;
}


function plotPoint(beadCenter, circledic, bead_no, blackornot) {
    var geometry = new THREE.CircleGeometry( 0.02, 100 );
    var material;
    if(blackornot){
        geometry = new THREE.CircleGeometry( 0.03, 100 );
        material = new THREE.MeshBasicMaterial( {
        color: '#000000',
        } );
    }
    else {
        geometry = new THREE.CircleGeometry( 0.02, 100 );
        material = new THREE.MeshBasicMaterial( {
        color: circledic['c'],
        });
    }
    var circle = new THREE.Mesh( geometry, material );
    if(blackornot)
        circle.position.set((acRfac*beadCenter['x']+(circledic['x']-beadCenter['x']))/scaleFactor, (acRfac*beadCenter['y']+(circledic['y']-beadCenter['y']))/scaleFactor, -3);
    else {
        circle.position.set((acRfac*beadCenter['x']+(circledic['x']-beadCenter['x']))/scaleFactor, (acRfac*beadCenter['y']+(circledic['y']-beadCenter['y']))/scaleFactor, -2);
    }
    point_3d_obj_map[circle.id] = bead_no;
    return circle;
}

function getLabel(font,label,xoy) {
    var Label = new THREE.TextGeometry(label.toString(), {font: font, size: 0.1, height: 5, material: 0, bevelThickness: 1, extrudeMaterial: 1});  //TextGeometry(text, parameters)
    var LabelMaterial = new THREE.MeshBasicMaterial({color: '#000000'});
    var retMesh = new THREE.Mesh(Label, LabelMaterial);
    retMesh.position.z = -10;
    if(xoy==1)
        retMesh.position.y =label/scaleFactor;
    else
        retMesh.position.x = label/scaleFactor;
    return retMesh;
}

function makeAxis(origin,terminus,size,color){
    var direction = new THREE.Vector3().subVectors(terminus, origin).normalize();
    var arrow = new THREE.ArrowHelper(direction, origin,size,color);
    return arrow;
}

function makeText(font,text,tx,ty,tz,tcolor,size){
    var axisLabel = new THREE.TextGeometry(text, {font: font, size: 0.1, height: 5, material: 0, bevelThickness: 1, extrudeMaterial: 1});  //TextGeometry(text, parameters)
    var axisMaterial = new THREE.MeshBasicMaterial({color:tcolor});
    var textMesh = new THREE.Mesh(axisLabel, axisMaterial);
    textMesh.position.z = tz
    textMesh.position.x = tx
    textMesh.position.y = ty
    return textMesh;
}

function myFunction(result,cirgrid) {
                noofSec = Math.pow(2, dimension);
                var maxi = -1.0;
                var maxix = -1.0;
                var maxiy = -1.0;
                for (var key in result['shapes']) {
                    if(2.0*result['shapes'][key]['r']>maxi)
                    {
                        maxi = 2.0*result['shapes'][key]['r'];
                    }
                    if(result['shapes'][key]['x']>maxix)
                        maxix = result['shapes'][key]['x'];
                    if(result['shapes'][key]['y']>maxiy)
                        maxiy = result['shapes'][key]['y']
                }
                console.log(maxi);
                if(maxi==0.0)
                    if(maxix>maxiy)
                        maxi = maxix;
                    else {
                        maxi = maxiy;
                    }
                scaleFactor = (maxi/1.5);
                scaleFactor = Math.floor(scaleFactor);
                if(scaleFactor<1)
                    scaleFactor = 1.0;
                current_cluster_centroid = result['cluster_centroid'];
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

                        // var camera = new THREE.PerspectiveCamera(35, window.innerWidth/ window.innerHeight, 0.1, 3000);
                        // console.log(window.innerWidth)
                        camera = new THREE.OrthographicCamera(screenW/ -scrollFactor, screenW/ scrollFactor,  screenH/ scrollFactor, screenH/ -scrollFactor, 0.1, 3000);
                        scene = new THREE.Scene();

                        // camera.poition.set(0,0,-3);

                        var material = new THREE.LineBasicMaterial({
                        	color: 0x0000ff,
                            linewidth: 1,
                        	// linecap: 'round', //ignored by WebGLRenderer
                        	// linejoin:  'round' //ignored by WebGLRenderer
                        });

                        var loader = new THREE.FontLoader();
                        let font = loader.parse(fontJSON);

                        for( var x=0; x<extra_objects.length; x++) {
                            scene.add(makeText(font,'x',acRfac*extra_objects[x]['x']/scaleFactor,acRfac*extra_objects[x]['y']/scaleFactor,-10,'#000000',0.1));
                        }

                        var j=0;
                        for (var key in result['shapes']) {
                            if(!(j in deleted_beads))
                            {
                                var obj = makeCircles(result['shapes'][key], j);
                                scene.add(obj);
                                var obj2 = plotPoint(result['shapes'][key],result['shapes'][key],j,true);
                                scene.add(obj2);
                                console.log('boom');
                            }
                            j++;
                        }
                        // console.log(j);
                        j = 0;
                        for (var key in result['points']) {
                            var len = result['points'][key].length;
                            for (var i=0; i<len; i++) {
                                if(!(j in deleted_beads))
                                {
                                    var obj = plotPoint(result['shapes'][key],result['points'][key][i], j,false);
                                    scene.add(obj);
                                    obj = plotPoint(result['shapes'][key],result['points'][key][i], j,true);
                                    scene.add(obj);

                                }
                            }
                            j++;
                        }
                        if(cirgrid)
                        {
                            for(var i=0;i<noofSec;i++)
                            {
                                    var origint = new THREE.Vector3(0,0,-5);
                                    var terminust = new THREE.Vector3(2*Math.sin(2*i*Math.PI/noofSec),2*Math.cos(2*i*Math.PI/noofSec),-5);
                                    // var terminust = new THREE.Vector3(0,2,-5);
                                    var axis = makeAxis(origint,terminust,10*10.5,'#7386D5');
                                    scene.add(axis);
                                    // axis.geometry.rotateZ(i*Math.PI/16.0);
                            }
                        }
                        else {

                            var gridHelper = new THREE.GridHelper( 4*10, 16*10, '#7386D5', '#7386D5' );
                            gridHelper.position.set(-0, -0, -50);
                            gridHelper.geometry.rotateX(Math.PI/2.0);
                            scene.add( gridHelper );
                            var origin1 = new THREE.Vector3(0,0,-5);
                            var terminus1 = new THREE.Vector3(0,2,-5);
                            var origin2 = new THREE.Vector3(0,0,-5);
                            var terminus2 = new THREE.Vector3(2,0,-5);
                            scene.add(makeAxis(origin1,terminus1,100.5,'#ff0000'));
                            scene.add(makeAxis(origin2,terminus2,100.5,'#0000ff'));
                            // Adding x label
                        }
                        // var origin1 = new THREE.Vector3(0,0,-5);
                        // var terminus1 = new THREE.Vector3(0,2,-5);
                        // var origin2 = new THREE.Vector3(0,0,-5);
                        // var terminus2 = new THREE.Vector3(2,0,-5);
                        // scene.add(makeAxis(origin1,terminus1,10.5,'#ff0000'));
                        // scene.add(makeAxis(origin2,terminus2,10.5,'#0000ff'));
                        // Adding x label

                        scene.add(makeText(font,'x-axis',1.5,-0.1,-10,'#0000ff',0.1));
                        // Adding y label
                        scene.add(makeText(font,'y-axis',-0.1,1,-10,'#ff0000',0.1));

                        for(var i=1;i<24;i++){
                            var glabel = (i/2.0)*scaleFactor;
                            var tempMesh = getLabel(font,glabel,0);
                            scene.add(tempMesh);
                        }
                        for(var i=1;i<24;i++){
                            var glabel = (i/2.0)*scaleFactor;
                            var tempMesh = getLabel(font,glabel,1);
                            scene.add(tempMesh);
                        }

                            document.body.addEventListener('mousemove', mouse_move, false);
                            document.body.addEventListener("mousedown", mouse_down, false);
                            document.body.addEventListener("mouseup", mouse_up, false);
                            document.body.addEventListener("wheel", wheel_movement, false);

                            requestAnimationFrame(render);

                        // renderer.render(scene, camera);
                                function render() {
                                    // adder += 1;
                                    // if(adder > 100) adder = 0;
                                    // camera.position.set(0,0,cameraz+(adder/100));

                                    animation_id = requestAnimationFrame(render);
                                    renderer.render(scene, camera);
                                    // scrollFactor -= changeScrollFac;
                                    // changeScrollFac = 0;
                                    camera = new THREE.OrthographicCamera(screenW/ -scrollFactor, screenW/ scrollFactor,  screenH/ scrollFactor, screenH/ -scrollFactor, 0.1, 3000);

                                    // spdx =  (screenW / 2 - mouseX) / 40;
                                    // spdy =  (screenH / 2 - mouseY) / 40;
                                    if (mouseDown){
                                        mouse.x = mouseX;
                                        mouse.y = mouseY;
                                    }
                                    camera.position.set(mouse.x/5.0,mouse.y/5.0,0);
                                    if(!isDone)
                                    {
                                        var tmp_list=[];
                                        for (let i = scene.children.length - 1; i >= 0; i--) {

                                                if(scene.children[i].type === "Mesh")
                                                {
                                                    if(scene.children[i].id in bead_3d_obj_map)
                                                    {
                                                        if(bead_3d_obj_map[scene.children[i].id] in deleted_beads)
                                                        {
                                                            tmp_list.push(scene.children[i]);
                                                            scene.remove(scene.children[i]);
                                                            // scene.children[i].material.opacity = 0.0
                                                        }
                                                    }
                                                    if(scene.children[i].id in point_3d_obj_map)
                                                    {
                                                        if(point_3d_obj_map[scene.children[i].id] in deleted_beads)
                                                        {
                                                            tmp_list.push(scene.children[i]);
                                                            scene.remove(scene.children[i]);
                                                            // scene.children[i].material.opacity = 0.0
                                                        }
                                                    }
                                                }
                                            }
                                            deleted_objects.push(tmp_list);
                                        isDone = true;
                                    }
                                }
                        return 0;

}
