from django.http import HttpResponse
from django.http import JsonResponse
from .Beads_Core import display
from .Beads_Core.beadplacement import convert_to_2D
from beads.models import PEARLS
import json
import csv
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .serializers import FileSerializer

current_file_path = ""

class FileView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    def post(self, request, *args, **kwargs):
        file_serializer = FileSerializer(data=request.data)
        if file_serializer.is_valid():
            file_serializer.save()
            global current_file_path
            current_file_path = str(file_serializer.data['file'])
            return Response(file_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def getAttributeList(request):

    attributes = []
    if current_file_path is not "":
        with open(current_file_path[1:], 'rb') as fl:
            reader = csv.reader(fl)
            data = []
            names = []
            i = 0
            for row in reader:
                attributes = row[:]
                break
    return JsonResponse(attributes, safe=False)


def searchVector(request):

    vec = str(request.GET.get('vector'))
    cid = int(request.GET.get('current_cluster'))
    dim = int(request.GET.get('dimension'))

    with open('cluster_centroids.json') as json_data:
        data = json.load(json_data)

    cluster_centroid = data[str(cid)]

    vec = vec.split(',')
    vec = [float(x) for x in vec]

    obj = convert_to_2D(vec, cluster_centroid, dim, 2)
    obj['r'] = 0.05
    obj['s'] = 2
    obj['c'] = '#000000'

    return JsonResponse(obj, safe=False)

def getBead(request):

    cluster_no = int(request.GET.get('cluster_no'))
    bead_no = int(request.GET.get('bead_no'))

    with open('modified_data_points.json') as json_data:
        data = json.load(json_data)

    return JsonResponse(data[str(cluster_no)][str(bead_no)], safe=False)

def updateDB(request):

    no_of_cluster = int(request.GET.get('no_of_cluster'))
    no_of_beads = int(request.GET.get('no_of_beads'))
    first_algo = str(request.GET.get('first_algo'))
    second_algo = str(request.GET.get('second_algo'))
    data_dimension = str(request.GET.get('data_dimension'))

    """
        Delete previous state of database
        So as to fill with new database
    """
    PEARLS.objects.all().delete();
    # Points.objects.all().delete();

    global current_file_path

    data, dimension, attributes = display.main(no_of_cluster, no_of_beads, first_algo, second_algo, current_file_path, data_dimension)
    modified_data_points = {}

    for cluster in data:
        shapes = data[cluster]['shapes']
        for bd in shapes:
            bdb = PEARLS(cluster_id=cluster, centroid_x=shapes[bd]['x'], centroid_y=shapes[bd]['y'], centroid_z=shapes[bd]['z'], centroid_r=shapes[bd]['r'], centroid_s=shapes[bd]['s'], centroid_c=shapes[bd]['c'])
            bdb.save()

    # for cluster in data:
    #     all_bead_points = data[cluster]['points']
    #
    #     for bead in all_bead_points:
    #         points = all_bead_points[bead]
    #
    #         for point in points:
    #             dbpnt = Points(cluster_id=cluster, beads_id=bead, point_x=point['x'], point_y=point['y'], point_c=point['c'])
    #             dbpnt.save()

    cluster_centroids = {}
    for cluster in data:
        cluster_centroids[cluster] = data[cluster]['cluster_centroid']
    with open('cluster_centroids.json','w') as fp2:
        json.dump(cluster_centroids, fp2)

    # for cluster in data:
    #     dt = {}
    #     # print data[cluster]['pointName']
    #     for bead in data[cluster]['acpoints']:
    #         bd = []
    #         i = 0
    #         for points in data[cluster]['acpoints'][bead]:
    #             arr = points.tolist()
    #             arr.insert(0, data[cluster]['pointName'][bead][i])
    #             bd.append(arr)
    #             i+=1
    #         dt[bead] = bd
    #     modified_data_points[cluster] = dt
    #
    # with open('modified_data_points.json','w') as fp1:
    #     json.dump(modified_data_points, fp1)

    output = {
        'result' : 1,
        'no_of_cluster' : no_of_cluster,
        'dimension' : dimension,
        'attributes' : attributes
    }
    return JsonResponse(output, safe=False)


def getCluster(request):

    clusterno = int(request.GET.get('cluster'))
    beads = PEARLS.objects.filter(cluster_id=clusterno)
    all_shapes = {}
    all_points = {}
    out = {}
    i=0

    for bead in beads:
        dic = bead.convert_to_dict()
        all_shapes[i] = dic
        i+=1

    # for i in range(len(all_shapes)):
    #     points = Points.objects.filter(cluster_id=clusterno, beads_id=i)
    #     points_of_this_bead = []
    #     for point in points:
    #         dic = point.convert_to_dict()
    #         points_of_this_bead.append(dic)
    #     all_points[i] = points_of_this_bead

    with open('cluster_centroids.json') as json_data:
        data = json.load(json_data)

    cluster_centroid = data[str(clusterno)]

    out = {
        'shapes' : all_shapes,
        'cluster_centroid' : cluster_centroid
    }
    # 'points' : all_points,
    return JsonResponse(out, safe=False)

def index(request):

    output = handleGet()
        # data = display.main(clusterno)
        # # print data
