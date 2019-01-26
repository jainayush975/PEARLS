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
