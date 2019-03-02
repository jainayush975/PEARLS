function error_action(xhr, status, error) {
    if(error == "Internal Server Error") {
        alert("The system has encountered \"Internal Server Error\"\nEither server is not up or some backend error occured\nIf some error occured please report at below link\nhttps://goo.gl/forms/Lt73a13d3bULiq1I3");
    }
    else {
        alert(error);
    }
    return ;
}

function handle_request(url, data, suc, type="GET") {

    $.ajax({
        type: type,
        url: url,
        data: data,
        success: function(result){
            suc(result);
        },
        error: function(xhr, status, error) {
            error_action(xhr, status, error);
        }
    });
}

function getNoOfClusters() {
    var url = "http://127.0.0.1:8000/beads/getnoofclusters";
    var data = {}
    var suc = function(result) {
        addClusterList(result);
    }
    handle_request(url, data, suc);
    return;
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

function deleteCluster() {

    if(current_cluster_id == null) {
        window.alert("Please select a cluster to delete");
    }
    else {
        var data = {
            'cluster_no' : current_cluster_id,
         }
         var url = "http://127.0.0.1:8000/beads/deleteCluster"
         var suc = function(result) {
             return deleteAllPearlFrontend();
         }
         handle_request(url, data, suc);
    }
    return ;
}

function attFilterForm() {
    document.getElementById('attfilter').style.display='block';

    var suc = addAttributeList;

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
        // document.body.removeEventListener("keydown");

        var cameraZ = 0;
        var cameraY = 0;
        var camera=null;
        var scene=null;
        var canvasC=null;
        element = document.getElementById('mycanvas');
        screenW = Math.floor(element.clientWidth);//Math.floor(window.innerWidth*0.60);
        screenH = Math.floor(element.clientHeight);//Math.floor(window.innerHeight*0.70);
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

$('body').on('contextmenu', '#mycanvas', function(e){ return false; });
