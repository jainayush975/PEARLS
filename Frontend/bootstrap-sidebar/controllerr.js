var dimension = null;
acRfac = 1.0;
gridType = false;
function handle_request(url, data, suc) {

    $.ajax({url: url,
        data: data,
        success: function(result){
            suc(result);
        }});
    }

function makeTable(result, n, m) {
    var tbl = document.createElement("table");
    var tblBody = document.createElement("tbody");
    tbl.setAttribute("id", "data_table");

    var r = document.createElement("tr");

    for(var t=0;t<m;t++) {
        var cell = document.createElement("th");
        if(attribute_list.length==m) {
            var cellText = document.createTextNode(attribute_list[t]);
        }
        else {
            var cellText = document.createTextNode("x" + t.toString());
        }
        cell.appendChild(cellText);
        r.appendChild(cell);
    }
    tblBody.appendChild(r);

    for(var i=0;i<n;i++) {
        // tmph3 = "<p>"
        var row = document.createElement("tr");
        for(var j=0;j<m;j++){
            var cell = document.createElement("td");
            var cellText = document.createTextNode(result[i][j].toString());
            cell.appendChild(cellText);
            row.appendChild(cell);
        }
        tblBody.appendChild(row);
    }
    tbl.appendChild(tblBody);
    return tbl;
}
function fillInfoBox(result) {
    // console.log(result)
    var n = result.length;
    var m = null;
    if(n>0){
        m = result[0].length;
    }
    var element = document.getElementById("infoBox");
    var element1 = document.getElementById("infoBox1");
    var Mean=getMean(result);
    var Maxi=getMax(result);
    var Mini=getMin(result);

    var text = "<button type=\"button\" onclick=\"document.getElementById('info_modal').style.display='block'\">Expand</button>"
    var text1 = "<ul class=\"list-unstyled components\">\n<li><a style=\"padding: 10px;font-size: 2em;display: block;\"><b> Bead Number : " + currBeadN.toString() + "</b></a></li>\n<li><a style=\"padding: 10px;font-size: 1.2em;display: block;\"> Total Number Points : " + n.toString() + "</a></li></ul>";

    element.innerHTML = text + text1;
    element1.innerHTML = text1;

    var tbl = makeTable(result, n, m);
    var tbl1 = makeTable(result, n, m);

    element.appendChild(tbl);
    element1.appendChild(tbl1);
    tbl.setAttribute("border", "2");
    tbl.style.margin = "auto";
    tbl.style.width = "90%";
    tbl.style.backgroundColor = "#ffffff";
    tbl.style.color = "#000000";
    tbl1.setAttribute("border", "2");
    tbl1.style.margin = "auto";
    tbl1.style.width = "90%";
    tbl1.style.backgroundColor = "#ffffff";
    tbl1.style.color = "#000000";
    return false;
}

function getMean(result){

    var n = result.length;
    var m = null;
    if(n>0)
        m = result[0].length;
    var ret = [];
    for(var i=0;i<m;i++) {
        ret.push(0.0);
    }
    for(var i=0;i<n;i++){
        for(var j=0;j<m;j++){
            ret[j] += result[i][j];
        }
    }
    for(var i=0;i<m;i++){
        ret[i]/=n;
    }
    return ret;
}

function getMax(result) {

    var n = result.length;
    var m = null;
    var ret=[];
    if(n>0){
        m = result[0].length;
    }
    for(var i=0;i<m;i++){
        ret.push(result[0][i]);
    }
    for(var i=1;i<n;i++){
        for(var j=0;j<m;j++){
            ret[j] = max(ret[j],result[i][j]);
        }
    }
    return ret;
}

function getMin(result){
    var n = result.length;
    var m = null;
    var ret=[];
    if(n>0){
        m = result[0].length;
    }
    for(var i=0;i<m;i++){
        ret.push(result[0][i]);
    }
    for(var i=1;i<n;i++){
        for(var j=0;j<m;j++)
        {
            ret[j] = min(ret[j],result[i][j]);
        }
    }
    return ret;
}

function max(a,b){
    if(a>b)
        return(a);
    else {
        return(b);
    }
}

function min(a,b){
    if(a<b)
        return(a);
    else {
        return(b);
    }
}

function addClusterList(result) {

    var n = result['no_of_cluster'];
    element = document.getElementById("cluster-list");

    element.innerHTML = "";
    for(var i=0;i<n;i++) {
        element.innerHTML = element.innerHTML + "<li><a id=\"clusterLink\" title=\"Click to do something\" href=\"#\" onclick=\"getCluster(" + i.toString() + ");return false;\">Cluster " + i.toString() + "</a></li>";
    }
    return ;
}

function searchVector() {
    var loader = new THREE.FontLoader();
    let font = loader.parse(fontJSON);
    var vector = document.getElementById("feature_vector").value;
    var url = "http://127.0.0.1:8000/beads/searchvector"
    var data = {
        "current_cluster" : current_cluster_id,
        "dimension" : dimension,
        "vector" : vector,
    }
    var suc = function(result) {
        // var obj = makeCircles1(result, -1);
        scene.add(makeText(font,'x',acRfac*result['x']/scaleFactor,acRfac*result['y']/scaleFactor,-10,'#000000',0.1));
        extra_objects.push(result);
    }

    var modal = document.getElementById('sfeature');
    modal.style.display = "none";
    handle_request(url, data, suc);
    // addClusterList(val);
    return false;

}

function makeClusterDB() {
    var no_of_cluster = document.getElementById("number-of-cluster").value;
    var no_of_beads = document.getElementById("number-of-beads").value;
    var calgo = document.getElementById("calg").value;
    var balgo = document.getElementById("balg").value;

    var url = "http://127.0.0.1:8000/beads/makeclusters"
    var data = {
        'no_of_cluster' : no_of_cluster,
        'no_of_beads' : no_of_beads,
        'first_algo' : calgo,
        'second_algo' : balgo,
    }
    var suc = function(result) {
        dimension = result["dimension"];
        attribute_list =  result["attributes"];
        return addClusterList(result);
    }

    var modal = document.getElementById('id01');
    modal.style.display = "none";
    handle_request(url, data, suc);
    // addClusterList(val);
    return false;
}

function getBead(bead_no, cluster_no) {

    var url = "http://127.0.0.1:8000/beads/getbead";
    var data = {
        cluster_no : cluster_no,
        bead_no : bead_no,
    }
    var suc = function(result) {
        return fillInfoBox(result);
    }

    handle_request(url, data, suc);
    return false;
}

function getCluster(i) {
    var url = "http://127.0.0.1:8000/beads/getcluster"
    var data = {
        'cluster' : i
    }
    var suc = function(result) {
        cancelAnimationFrame( animation_id );
        document.body.removeEventListener("mousedown", mouse_down);
        document.body.removeEventListener("mouseup", mouse_up);
        document.body.removeEventListener("mousemove", mouse_move);
        document.body.removeEventListener("wheel", wheel_movement);

        var camera=null;
        var scene=null;
        var canvasC=null;
        var oldObjects=null;
        var oldColor = null;
        var extra_objects = [];
        var projector, mouse = { x: 0, y: 0 };
        var raycaster = new THREE.Raycaster();
        var acmouse = new THREE.Vector3();
        var screenW = 0.75*window.innerWidth;
        var screenH = 0.75*window.innerHeight; /*SCREEN*/
        var spdx = 0, spdy = 0; mouseX = 0, mouseY = 0, mouseUp = false,mouseDown = false;
        var scrollFactor = 390.0;
        var changeScrollFac = 0;
        var currOBJ=null;
        // var current_cluster_id = null;
        var bead_3d_obj_map = {};
        deleted_beads = {};
        deleted_objects = [];
        var isDone = true;
        deleted_beads_lst = [];
        currently_loaded = null;
        currently_selected = null;
        // var rFac = 5.0;
        return myFunction(result,gridType);
    }

    current_cluster_id = i;
    handle_request(url, data, suc);
    return false;
}

function sliderChange(val) {
    acRfac = val/10.0;
    getCluster(current_cluster_id);
}

function spreadAlert(){
    window.alert("How much spreaded away beads you want ?")
}

function changeGrid(){
    gridType = !gridType;
    getCluster(current_cluster_id);
}

$('body').on('contextmenu', '#mycanvas', function(e){ return false; });
