var dimension = null;
acRfac = 1.0;
gridType = false;
var CAMER_VIEW = "PX";
var currently_loaded = null;
var currently_selected = null;
var to_be_deleted = null;

function update_camera(to_type) {
    console.log("Changing view");
    CAMER_VIEW = to_type
    return ;
}

function handle_request(url, data, suc, type="GET") {

    $.ajax({
        type: type,
        url: url,
        data: data,
        success: function(result){
            suc(result);
        }
    });
}

function downloadCSV(csv, filename) {
    var csvFile;
    var downloadLink;

    // CSV file
    csvFile = new Blob([csv], {type: "text/csv"});

    // Download link
    downloadLink = document.createElement("a");

    // File name
    downloadLink.download = filename;

    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);

    // Hide download link
    downloadLink.style.display = "none";

    // Add the link to DOM
    document.body.appendChild(downloadLink);

    // Click download link
    downloadLink.click();
}

function exportTableToCSV(filename="data.csv") {
    var csv = [];
    var rows = document.querySelectorAll("table tr");

    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll("td, th");

        for (var j = 0; j < cols.length; j++)
            row.push(cols[j].innerText);

        csv.push(row.join(","));
    }

    // Download CSV file
    downloadCSV(csv.join("\n"), filename);
}

function restorePearl() {

    var url = "http://127.0.0.1:8000/beads/restoreAll";
    var data = {}
    var suc = function(result) {
        window.alert("Backend restored the dataset\n Please Recluster To Continue Minning\n Happy Data Mining !!! :)");
    }
    handle_request(url, data, suc);
    return;
}

function deletePearl() {

    if(currently_selected == null)  {
        window.alert("Please select a PEARL to delete");
    }
    else {

        var data = {
            'pearl_no' : currently_selected['bead_no'],
            'cluster_no' : currently_selected['cluster_no'],
        }
        var url = "http://127.0.0.1:8000/beads/deletePearl";
        var suc = function(result) {
            return deletePearlFrontend();
        }

        handle_request(url, data, suc);
    }
    return ;
}

function deletePearlFrontend(){
    console.log("Mai chal raha hoo");
    to_be_deleted = currently_selected;
    currently_selected = null;
    currently_loaded = null;
}

function attFilterForm() {
    document.getElementById('attfilter').style.display='block';

    var suc = function(result) {
        container = document.getElementById('attfilter_container');

        while(container.firstChild) {
            container.removeChild(container.firstChild);
        }

        for(i=0; i<result.length; i++) {
            var checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.name = result[i];
            checkbox.value = result[i];
            checkbox.id = result[i];

            var label = document.createElement('label')
            label.htmlFor = result[i];
            label.appendChild(document.createTextNode(result[i]));

            container.appendChild(checkbox);
            container.appendChild(label);
        }
        return ;
    };

    data = {}
    var url = "http://127.0.0.1:8000/beads/getallattributelist"

    handle_request(url, data, suc);
    return ;
}

function filter_attributes() {

    container = document.getElementById('attfilter_container');
    checked = [];

    checked.push(container.childNodes[0].name);

    for(i=2; i<container.childElementCount; i+=2) {
        if(container.childNodes[i].type == 'checkbox' && container.childNodes[i].checked) {
            checked.push(container.childNodes[i].name);
        }
    }

    var suc = function (result) {
        window.alert("The attributes are filtered in backend please recluster !\n Happy Data Mining :)")
    }

    data = {
        'length' : checked.length
    }

    for(var j=0; j<checked.length; j++) {
        key = "attribute_" + j;
        val = checked[j];
        data[key] = val;
    }
    var url = "http://127.0.0.1:8000/beads/filterattributes"

    var modal = document.getElementById('attfilter');
    modal.style.display = "none";

    handle_request(url, data, suc);
    return false;
}

function getFrom() {
    document.getElementById('id01').style.display='block';

    var suc = function(result) {

        obj = document.getElementById('dd');
        var i;

        while(obj.options.length > 1) {
            obj.options[1] = null;
        }

        for(i=0; i<result.length; i++) {
            var opt = document.createElement("option");
            opt.text = result[i];
            opt.value = result[i];
            obj.add(opt);
        }
        return ;
    }
    data = {}
    var url = "http://127.0.0.1:8000/beads/getattributelist"

    handle_request(url, data, suc);
    return ;
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
    var element3 = document.getElementById("basicinfo");
    var Mean=getMean(result);
    var Maxi=getMax(result);
    var Mini=getMin(result);

    basicinfo_result = [Mean,Maxi,Mini];
    var tbb = makeTable(basicinfo_result,3,m);
    element3.innerHTML = "";
    element3.appendChild(tbb);

    var text = "<button type=\"button\" onclick=\"document.getElementById('info_modal').style.display='block'\">Expand</button>"
    var text1 = "<ul class=\"list-unstyled components\">\n<li><a style=\"padding: 10px;font-size: 2em;display: block;\"><b> PEARL Number : " + currPearlN.toString() + "</b></a></li>\n<li><a style=\"padding: 10px;font-size: 1.2em;display: block;\"> Total Number Points : " + n.toString() + "</a></li></ul>";

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
    tbb.setAttribute("border", "2");
    tbb.style.margin = "auto";
    tbb.style.width = "90%";
    tbb.style.backgroundColor = "#ffffff";
    tbb.style.color = "#000000";
    return false;
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
    var dd = document.getElementById("dd").value;
    var no_of_bins = document.getElementById("number-of-bins").value;

    var url = "http://127.0.0.1:8000/beads/makeclusters"
    var data = {
        'no_of_cluster' : no_of_cluster,
        'no_of_beads' : no_of_beads,
        'first_algo' : calgo,
        'second_algo' : balgo,
        'data_dimension' : dd,
        'no_of_bins' : no_of_bins,
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

function getBead(bead_no, cluster_no,load_or_select) {

    var tmpKeyvs = {"bead_no":bead_no,"cluster_no":cluster_no};
    if(load_or_select==0)
    {
        // console.log("Jai badhra kali")
        // console.log(tmpKeyvs);
        // console.log(currently_loaded);
        // console.log("Jai badhra kali")
        if(currently_loaded==null)
        {
            currently_loaded = tmpKeyvs;
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
        else if(tmpKeyvs["bead_no"]!=currently_loaded["bead_no"] || tmpKeyvs["cluster_no"]!=currently_loaded["cluster_no"])
        {
            currently_loaded = tmpKeyvs;
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
    }
    else {
        currently_selected = tmpKeyvs;
    }
}

function getCluster(i) {
    var url = "http://127.0.0.1:8000/beads/getcluster"
    var data = {
        'cluster' : i
    }
    var suc = function(result) {
        cancelAnimationFrame( animation_id );
        document.body.removeEventListener("mousedown", mouse_down);
        // document.body.removeEventListener("mouseup", mouse_up);
        document.body.removeEventListener("mousemove", mouse_move);
        document.body.removeEventListener("wheel", wheel_movement);

        var camera=null;
        var scene=null;
        var canvasC=null;
        var screenW = 0.75*window.innerWidth;
        var screenH = 0.75*window.innerHeight; /*SCREEN*/
        var pearl_3d_obj_map = {};
        var reverse_pearl_3d_obj_map = {};
        var reverse_pearl_3d_obj_map2 = {};
        currently_loaded = null;
        currently_selected = null;
        return myFunction(result, gridType);
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

function getMean(result){

    var n = result.length;
    var m = null;
    if(n>0)
        m = result[0].length;
    var ret = ["Mean"];
    for(var i=1;i<m;i++) {
        ret.push(0.0);
    }
    for(var i=0;i<n;i++){
        for(var j=1;j<m;j++){
            ret[j] += result[i][j];
        }
    }
    for(var i=1;i<m;i++){
        ret[i]/=n;
    }
    return ret;
}

function getMax(result) {

    var n = result.length;
    var m = null;
    var ret=["Max"];
    if(n>0){
        m = result[0].length;
    }
    for(var i=1;i<m;i++){
        ret.push(result[0][i]);
    }
    for(var i=1;i<n;i++){
        for(var j=1;j<m;j++){
            ret[j] = max(ret[j],result[i][j]);
        }
    }
    return ret;
}

function getMin(result){
    var n = result.length;
    var m = null;
    var ret=["Min"];
    if(n>0){
        m = result[0].length;
    }
    for(var i=1;i<m;i++){
        ret.push(result[0][i]);
    }
    for(var i=1;i<n;i++){
        for(var j=1;j<m;j++)
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

$('body').on('contextmenu', '#mycanvas', function(e){ return false; });
