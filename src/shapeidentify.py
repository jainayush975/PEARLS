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

def lp_norm(point,p):
    ret=0.0
    p=float(p)
    for num in point:
        tnum=float(num)
        ret+=(abs(tnum)**p)
    ret=ret**(1.0/p)
    return ret;

def find_bead_centroid(bead, dim):
    vals = [0 for i in range(dim)]
    tp=0
    # print bead
    for point in bead:
        tp+=1
        j=0
        for val in point:
            vals[j] += val
            j+=1
    for i in range(len(vals)):
        vals[i] = float(vals[i]/float(tp))
    return vals

def identify_shape(bead,dim):
    # print bead
    clc = find_bead_centroid(bead,dim)

    clc = np.array(clc)
    # print clc
    lbead=len(bead)
    minsum=None
    coshape=None
    for p in range(1,3):
        tsum=0
        for i in range(lbead):
            tpoint=bead[i]
            tpoint=np.array(tpoint)
            # print type(tpoint)
            # print type(clc)
            # print clc
            # print tpoint,clc
            tpoint =  tpoint-clc
            # print tpoint
            tsum+=lp_norm(tpoint,p)
        # print tsum
        if minsum==None:
            minsum=tsum
            coshape=p
        elif minsum>tsum:
            minsum=tsum
            coshape=p
    return coshape
if __name__=='__main__':
    iris=datasets.load_iris()
    x=iris.data[:2]
    print identify_shape(x,4)
