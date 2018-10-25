from sklearn import datasets
from sklearn.cluster import KMeans
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import copy
import math
from clustering import kmean
from beadplacement import beadplacement, find_cluster_centroid, convert_to_2D, find_bead_centroid
from colors import colors_lst
from KrNN import KrNN
import json

colors = ["red", "blue", "green","cyan","yellow","black"]

def display_bead(bead_num, bead, plt, cluster_centroid, dim):
    obj = beadplacement(bead, dim, cluster_centroid)
    if obj['s']==2:
        shape = plt.Circle((obj['x'], obj['y']), obj['r'], color=colors[bead_num] ,fill=False)
    else:
        shape = plt.Rectangle((obj['x'], obj['y']), (obj['r']/math.sqrt(2)), (obj['r']/math.sqrt(2)), obj['t']+135, fill=False)
    return shape;

def getdicofdic(data, numofclu, numofbea, dim, first_algo, second_algo, names):
    """ This function returns a dictionary of dictionary storing each cluster append
    it's BEADS
    """
    if first_algo == "kmean":
        dic,na = kmean(data, numofclu, names,0)
    else:
        dic = KrNN(data, 6)

    ret = {}
    retn = {}
    for i in dic:
        if second_algo == "kmean":
            ret[i],retn[i] = kmean(dic[i], numofbea,na[i], 0)
        else:
            ret[i]=KrNN(dic[i], 6)
    return ret,retn;

def find_bin_num(input_list,input_num):
    ret = 0
    for i in range(len(input_list)):
        ret = i
        if input_num > input_list[i]:
            break
    return ret

def binpointsdic(data,names,attribute_num, number_of_bins):
    mini = None
    maxi = None
    for i in range(len(data)):
        if mini==None:
            mini = data[i][attribute_num]
        else:
            mini = min(mini,data[i][attribute_num])

        if maxi==None:
            maxi = data[i][attribute_num]
        else:
            maxi = max(maxi,data[i][attribute_num])
    print maxi,mini

    range_per_bin = (maxi-mini)/number_of_bins
    if (maxi-mini)%number_of_bins!=0:
        range_per_bin += 1;
    ranges_upper = []
    tmp_range_upper = maxi
    for i in range(number_of_bins):
        tmp_range_upper -= range_per_bin
        ranges_upper.append(tmp_range_upper)
    print ranges_upper
    ret = {}
    retn = {}
    for i in range(len(data)):
        x = find_bin_num(ranges_upper,data[i][attribute_num])
        if x not in ret:
            ret[x] = [data[i]]
            retn[x] = [names[i]]
        else:
            ret[x].append(data[i])
            retn[x].append(names[i])
    return ret,retn;

def get_data_dimensionised_dic(data, numofclu, numofbea, dim, first_algo, second_algo, names, attributes, data_dimension,number_of_bins):
    """
    In case of data dimension
    This function returns a dictionary of dictionary storing each cluster append
    it's BEADS
    """

    if first_algo == "kmean":
        dic,na = kmean(data, numofclu, names,0)
    else:
        dic = KrNN(data, 6)

    try:
        attribute_num = attributes.index(data_dimension)
    except ValueError:
        attribute_num = 0;

    ret = {}
    retn = {}
    for i in dic:
        tmp_dic = {};
        tmp_name = {};
        binned_points, binned_points_name = binpointsdic(dic[i],na[i],attribute_num,number_of_bins);
        curr_ind = 0;
        for j in binned_points:
            binned_cluster,binned_name = kmean(binned_points[j],numofbea,binned_points_name[j], 0);
            for k in binned_cluster:
                tmp_dic[curr_ind] = binned_cluster[k]
                tmp_name[curr_ind] = binned_name[k]
                curr_ind += 1
        ret[i] = tmp_dic
        retn[i] = tmp_name
    return ret,retn;



def processEachCluster(data,dim,clunum):
    """ It process each cluster by calculating beads centroid and plot shape and
    points inside bead
    """
    global shapes
    dic = data[clunum]
    cluster_centroid=find_cluster_centroid(dic, dim)
    for bead in dic:
        shapes.append(display_bead(bead,dic[bead], plt, cluster_centroid, dim))
    fig, ax = plt.subplots()
    for shape in shapes:
        ax.add_artist(shape)
    it = 0
    j=0
    for bead in dic:
        bec = find_bead_centroid(dic[bead],dim)
        obj = beadplacement(dic[bead], dim, cluster_centroid)
        for point in dic[bead]:
            j+=1
            point2D = convert_to_2D(point, bec, dim)
            # print point2D
            point2D['x'] += obj['x']
            point2D['y'] += obj['y']
            plt.plot(point2D['x'], point2D['y'], marker='o', markersize=3, color=colors[it])
        it+=1
    plt.xlim([-5,5])
    plt.ylim([-5,5])
    plt.show()

def dumpJsonFiles(data,names,dim,clunum):
    dicshapes = {}
    dicpoints = {}
    dic = data[clunum]
    cluster_centroid=find_cluster_centroid(dic, dim)
    m = 0
    for bead in dic:
        obj = beadplacement(dic[bead], dim, cluster_centroid)
        obj['c'] = colors_lst[m]
        dicshapes[bead] = obj
        m+=1
    dic1 = {
        "shapes" : dicshapes,
        "cluster_centroid" : cluster_centroid
    }
    return dic1
    # with open('beads'+str(clunum)+'.json','w') as fp1:
    #     json.dump(dic1,fp1)
    # with open('points'+str(clunum)+'.json','w') as fp2:
    #     json.dump(dicpoints,fp2)

def load_dataset(file_path):
    import csv

    path = file_path[1:]
    with open(path, 'rb') as fl:
        reader = csv.reader(fl)

        data = []
        names = []
        i = 0
        for row in reader:
            if i==0:
                attributes = row[:]
                # print attributes
                i+=1
            else:
                rw = row[1:]
                rw = [float(x) for x in rw]
                names.append(row[0]);
                i+=1
                data.append(rw)

        npdata = np.array(data)
        return npdata, attributes, names



def main(no_of_cluster, no_of_beads, first_algo, second_algo, current_file_path, data_dimension,number_of_bins=0):
    global iris
    global shapes

    iris, attributes, names = load_dataset(current_file_path)#datasets.load_iris()
    dic = {}

    dim = len(iris[0])

    if data_dimension == "no_data_dimension":
        dic, na = getdicofdic(iris, no_of_cluster, no_of_beads, dim, first_algo, second_algo,names)
    else:
        dic, na = get_data_dimensionised_dic(iris, no_of_cluster, no_of_beads, dim, first_algo, second_algo, names, attributes, data_dimension, number_of_bins)

    shapes = []
    all_cluster_data = {}

    for i in dic:
        out = dumpJsonFiles(dic,na,dim,i)
        all_cluster_data[i] = out

    return all_cluster_data, dim, attributes

if __name__ == '__main__':
    # fln = "/IRIS.csv"
    # a,b,c,=main(3,3,"kmean","kmean",fln,"no_data_dimension")
    # print a
    # print a[0]['points']
    # iris=datasets.load_iris()
    # names = [str(i) for i in range(150)]
    # dic,na = getdicofdic(iris.data,3,3,4,'kmean','kmean',names)
    # print na
    data = [[1,2,3,4],[2,3,4,1],[3,2,4,2],[3,3,3,3],[1,1,1,1],[5,6,5,6]];
    names = ['point1','point2','point3','point4','point5','point6']
    attributes = ['at1','at2','at3','at4']
    data_dimension = 'at3'
    print get_data_dimensionised_dic(data, 1, 3,4,'kmean','kmean',names, attributes, data_dimension, 2)
