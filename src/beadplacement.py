from sklearn import datasets
from sklearn.cluster import KMeans
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import copy
import math
from clustering import kmean
from shapeidentify import identify_shape

def find_cluster_centroid(beads, dim):
    vals = [0 for i in range(dim)]
    tp=0
    for key in beads:
        for point in beads[key]:
            tp+=1
            j=0
            for val in point:
                vals[j] += val
                j+=1

    for i in range(len(vals)):
        vals[i] = float(vals[i]/float(tp))
    return vals

def find_bead_centroid(bead, dim):
    vals = [0 for i in range(dim)]
    tp=0
    for point in bead:
        tp+=1
        j=0
        for val in point:
            vals[j] += val
            j+=1

    for i in range(len(vals)):
        vals[i] = float(vals[i]/float(tp))
    return vals

def find_dist(a1, a2):
    if len(a1)==len(a2):
        dist = 0
        for i in range(len(a1)):
            dist += (a1[i]-a2[i])*(a1[i]-a2[i])
        dist = np.sqrt(dist)
        return dist
    return -1

def convert_to_2D(point, cluster_centroid, dim):

    dist = find_dist(point, cluster_centroid)
    i=0
    sector=0
    for i in range(dim):
        if(point[i]>=cluster_centroid[i]):
            sector += 2**i

    theta = (2 * math.pi * sector)/float(2**dim)

    cor2D = {}
    cor2D['x'] = dist * math.cos(theta)
    cor2D['y'] = dist * math.sin(theta)
    return cor2D

def beadplacement(bead, dim, cluster_centroid):
    # dim = 4
    # cluster_centroid=find_cluster_centroid(beads, dim)

    v4 = 4.933
    # rad = {}
    # x_cor = {}
    # y_cor = {}
    # bead_centroid = {}
    #
    # min_dist = float("inf")
    #for key in beads:
    #min_dist = min(dist, min_dist)
    bead_centroid=find_bead_centroid(bead, dim)
    new_cent = convert_to_2D(bead_centroid, cluster_centroid, dim)

    shape = identify_shape(bead, dim)
    mdis = float("-inf")
    obj = {}

    for point in bead:
        ncor = convert_to_2D(point, bead_centroid, dim)
        dis = np.sqrt(((ncor['x'])**2) + ((ncor['y'])**2))
        if dis>mdis :
            mdis = dis
            if shape==1:
                obj['x'] = ncor['x']
                obj['y'] = ncor['y']
            else:
                obj['x'] = new_cent['x']
                obj['y'] = new_cent['y']

    if shape==1:
        theta = math.atan((obj['y']-new_cent['y'])/float((obj['x']-new_cent['x'])))
        if(new_cent['x']>obj['x']):
            theta += math.pi
        # theta = (5*(math.pi/float(4))) - theta
        obj['t'] = (theta*180)/math.pi

    obj['r'] = mdis
    obj['s'] = shape
    return obj
