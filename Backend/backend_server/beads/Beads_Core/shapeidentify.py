# Idenfication of two shapes square(p==1) and circle(p==2)
# import beadplacement
import numpy as np
from sklearn import datasets
from sklearn.cluster import KMeans
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import copy
import math
from clustering import kmean


def lp_norm(point, p):
    if p == 100000:
        point = np.array(point)
        return max(abs(point))
    ret = 0.0
    p = float(p)
    for num in point:
        tnum = float(num)
        ret += (abs(tnum)**p)
    ret = ret**(1.0 / p)
    return ret


def find_bead_centroid(bead, dim):
    vals = [0 for i in range(dim)]
    tp = 0
    for point in bead:
        tp += 1
        j = 0
        for val in point:
            vals[j] += val
            j += 1
    for i in range(len(vals)):
        vals[i] = float(vals[i] / float(tp))
    return vals


def farthestDis(pearl, dim, p, clc):
    ret = -1
    retpoint = None
    for point in pearl:
        val = [0 for i in range(dim)]
        for j in range(dim):
            val[j] = point[j] - clc[j]
        temp = lp_norm(val, p)
        # print temp
        if temp > ret:
            ret = temp
            retpoint = point
    return [ret, retpoint]


def volumeConstant(p, dim):
    ret = 2**dim
    tmp1 = math.gamma(1.0 + 1.0 / float(p))
    tmp1 = tmp1**dim
    tmp2 = math.gamma(1.0 + 1.0 * float(dim) / float(p))
    ret = ret * (tmp1 / tmp2)
    return ret


def removeTenPP(bead, dim, p, clc):
    """
        This function removes 10 percentage of farthest points
    """
    return bead


def identify_shape(bead, dim):
    clc = find_bead_centroid(bead, dim)
    bead = removeTenPP(bead, dim, 2, clc)  # Currently not implemented
    bestf = None
    P = [100, 2, 1, 0.5]
    p = 0
    """
        Change this part for 3D shape identification
    """
    fD1 = [P[p], farthestDis(bead, dim, P[p], clc)]
    bestf = fD1
    vC = volumeConstant(P[p], dim)
    minVol = vC * (fD1[1][0]**dim)
    # print minVol
    p += 1
    while p != 4:
        fD2 = [P[p], farthestDis(bead, dim, P[p], clc)]
        cvC = volumeConstant(P[p], dim)
        cVol = cvC * (fD2[1][0]**dim)
        p += 1
        # print cVol
        if cVol < minVol:
            bestf = fD2
            minVol = cVol
    retdic = {'s': bestf[0], 'r': bestf[1][0], 'fp': bestf[1][1]}
    # print retdic
    return retdic


if __name__ == '__main__':
    # X = np.array([[1,0],[0,1],[-1,0],[0,-1],[0.71,0.71],[0.71,-0.71],[-0.71,-0.71],[-0.71,0.71]])
    X = np.array([[2, -2, 4, 5], [3, 2, 1, 4], [1, 3, 2, 2], [4, 3, -1, 4],
                  [1, 5, 4, 1]])
    print identify_shape(X, 4)
