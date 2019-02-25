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

colors = ["red", "blue", "green"]

def display_bead(bead_num,bead, plt, cluster_centroid, dim):

    obj = beadplacement(bead, dim, cluster_centroid)

    if obj['s']==2:
        shape = plt.Circle((obj['x'], obj['y']), obj['r'], color=colors[bead_num] ,fill=False)
    else:
        shape = plt.Rectangle((obj['x'], obj['y']), (obj['r']/math.sqrt(2)), (obj['r']/math.sqrt(2)), obj['t']+135, fill=False)
    return shape;

def getdicofdic(data,numofclu,numofbea,dim):
    dic = kmean(iris.data,numofclu,0)
    # print dic
    ret = {}
    for i in range(numofclu):
        ret[i]=kmean(dic[i],numofbea,0)
    return ret;
def processEachCluster(data,dim,clunum):
    dic = data[clunum]
    cluster_centroid=find_cluster_centroid(dic, dim)
    for bead in dic:
        shapes.append(display_bead(bead,dic[bead], plt, cluster_centroid, dim))
    fig, ax = plt.subplots()
    # print "boom"
    for shape in shapes:
        ax.add_artist(shape)

    # colors = colors_lst[:len(dic)]
    it = 0
    j=0
    for bead in dic:
        bec = find_bead_centroid(dic[bead],dim)
        obj = beadplacement(dic[bead], dim, cluster_centroid)
        for point in dic[bead]:
            j+=1
            point2D = convert_to_2D(point, bec, dim)
            point2D['x'] += obj['x']
            point2D['y'] += obj['y']
            plt.plot(point2D['x'], point2D['y'], marker='o', markersize=3, color=colors[it])
        it+=1
    plt.xlim([-5,5])
    plt.ylim([-5,5])
    plt.show()


if __name__=='__main__':
    iris=datasets.load_iris()
    dic = {}
    # print iris.data
    dim = len(iris.data[0])
    dic=getdicofdic(iris.data,3,3,dim)
    shapes = []
    x = raw_input()
    x = int(x)
    processEachCluster(dic,dim,x)
