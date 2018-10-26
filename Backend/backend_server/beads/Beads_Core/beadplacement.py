from sklearn import datasets
from sklearn.cluster import KMeans
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import copy
import math
from clustering import kmean
from shapeidentify import identify_shape,volumeConstant

def find_cluster_centroid(beads, dim):
    vals = [0 for i in range(dim)]
    tp=0
    for key in beads:
        # print key
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

def lp_norm(point, p):
    if p==100000:
        point  = np.array(point)
        return max(abs(point))
    ret=0.0
    p=float(p)
    for num in point:
        tnum=float(num)
        ret+=(abs(tnum)**p)
    ret=ret**(1.0/p)
    return ret;

def find_dist(a1, a2, p):
    if len(a1)==len(a2):
        a1 = np.array(a1);
        a2 = np.array(a2);
        dist=lp_norm(a1-a2,p);
        return dist
    return -1

def convert_to_2D(point, cluster_centroid, dim, p):
    """
        write new function similar to this function for 3D
    """
    dist = find_dist(point, cluster_centroid,p)
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

def convert_to_3D(point, cluster_centroid, dim, p, cos_phi):
    sin_phi = 1 - cos_phi**2;
    dist = find_dist(point, cluster_centroid,p)
    i=0
    sector=0
    for i in range(dim):
        if(point[i]>=cluster_centroid[i]):
            sector += 2**i

    theta = (2 * math.pi * sector)/float(2**dim)

    cor3D = {}
    cor3D['x'] = dist * math.cos(theta) * sin_phi
    cor3D['y'] = dist * math.sin(theta) * sin_phi
    cor3D['z'] = dist * cos_phi
    return cor3D

def find_maximum_phi(pearl, DIM, pearl_centroid, cluster_centroid):

    l = len(pearl)

    stdvs = [0 for i in range(DIM)]
    for i in range(l):
        for j in range(DIM):
            stdvs[j] += (pearl[i][j]-pearl_centroid[j])**2

    ind = stdvs.index(min(stdvs))

    cos_phi = (pearl_centroid[ind] - cluster_centroid[ind])/find_dist(pearl_centroid, cluster_centroid, 2)
    return cos_phi


def beadplacement(bead, dim, cluster_centroid,flag,attribute_num=-1):
    v4 = 4.933
    bead_centroid = find_bead_centroid(bead, dim)
    cos_phi = find_maximum_phi(bead, dim, bead_centroid, cluster_centroid)
    new_cent = convert_to_3D(bead_centroid, cluster_centroid, dim, 2, cos_phi)

    shape = identify_shape(bead, dim)
    mdis = float("-inf")
    obj = {}
    # for point in bead:
    #     ncor = convert_to_2D(point, bead_centroid, dim)
    #     dis = np.sqrt(((ncor['x'])**2) + ((ncor['y'])**2))
    #     if dis>mdis :
    #         mdis = dis
    #         if shape==1:
    #             obj['x'] = ncor['x']
    #             obj['y'] = ncor['y']
    #         else:
    #             obj['x'] = new_cent['x']
    #             obj['y'] = new_cent['y']
    #
    # if shape==1:
    #     theta = math.atan((obj['y']-new_cent['y'])/float((obj['x']-new_cent['x'])))
    #     if(new_cent['x']>obj['x']):
    #         theta += math.pi
    #     obj['t'] = (theta*180)/math.pi

    obj['x'] = new_cent['x']
    obj['y'] = new_cent['y']

    if not flag:
        obj['z'] = new_cent['z']
    else:
        obj['z'] = bead_centroid[attribute_num]
    obj['r'] = shape['r']
    obj['s'] = shape['s']
    return obj

if __name__ == '__main__':
    X = np.array([[2,-2,4,5],[3,2,1,4],[1,3,2,2],[4,3,-1,4],[1,5,4,1]])
    print beadplacement(X,4,[0,0,0,0])
