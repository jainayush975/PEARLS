/////////////////       Update Camera View          \\\\\\\\\\\\\\\\\\\\\\\
function update_camera(to_type) {
    CAMER_VIEW = to_type
    return ;
}

/////////////////       Adding Cluster List          \\\\\\\\\\\\\\\\\\\\\\\
function addClusterList(result) {

    var n = result['no_of_cluster'];
    element = document.getElementById("cluster-list");

    element.innerHTML = "";
    for(var i=0;i<n;i++) {
        element.innerHTML = element.innerHTML + "<li><a id=\"clusterLink\" title=\"Click to do something\" href=\"#\" onclick=\"getCluster(" + i.toString() + ");return false;\">Cluster " + i.toString() + "</a></li>";
    }
    return ;
}

/////////////////       Fill Info Box and Table          \\\\\\\\\\\\\\\\\\\\\\\
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

/////////////////       Attribute Filtering Feature          \\\\\\\\\\\\\\\\\\\\\\\
function addAttributeList(result) {
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
}

/////////////////       Delete PEARL Feature          \\\\\\\\\\\\\\\\\\\\\\\
function deletePearlFrontend(){
    // getCluster(current_cluster_id);
    to_be_deleted = currently_selected;
    currently_selected = null;
    currently_loaded = null;
}

function deleteAllPearlFrontend(){
    getCluster(current_cluster_id);
}

/////////////////       Download PEARL Feature          \\\\\\\\\\\\\\\\\\\\\\\
function downloadCSV(csv, filename) {
    var csvFile;
    var downloadLink;

    csvFile = new Blob([csv], {type: "text/csv"});
    downloadLink = document.createElement("a");

    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
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

    downloadCSV(csv.join("\n"), filename);
}
