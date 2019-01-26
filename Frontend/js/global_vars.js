// index
var animation_id = null;
var current_cluster_centroid = null;
var canvasC = null;
var camera = null;
var scene = null;
// var screenW = document.getElementById('mycanvas').width;//0.75*window.innerWidth;
// var screenH = document.getElementById('mycanvas').height;//0.75*window.innerHeight; /*SCREEN*/
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

// controllers
var dimension = null;
acRfac = 10.0;
gridType = false;
var CAMER_VIEW = "PX";
var currently_loaded = null;
var currently_selected = null;
var to_be_deleted = null;
