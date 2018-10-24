from sklearn import datasets
from sklearn.cluster import KMeans
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import copy
import KrNN

def kmean(data,numclu,name,flag):
    # data is given as array of arrays
    lendata=len(data[0])
    x = pd.DataFrame(data,columns=[str(i) for i in range(1,lendata+1)])
    model = KMeans(n_clusters=min(int(numclu),len(data)))
    model.fit(x)
    predictedY = np.choose(model.labels_, [i for i in range(min(int(numclu),len(data)))]).astype(np.int64)
    ddic = {}
    ndic = {}
    ret = {}
    for i in range(len(predictedY)):
        temp=copy.deepcopy(data[i])
        temp2=copy.deepcopy(name[i])
        if predictedY[i] not in ddic:
            ddic[predictedY[i]]=[temp]
            ndic[predictedY[i]]=[temp2]
        else:
            ddic[predictedY[i]].append(temp)
            ndic[predictedY[i]].append(temp2)
    # # ret = []
    # # for key in dic:
    # #     ret[len(dic[key]['points'])] = dic[key]
    # dic = {}
    # m=0
    # for key in sorted(ret.keys()):
    #     dic[m] = ret[key]
    #     m += 1
    return ddic,ndic

if __name__ == '__main__':
    iris=datasets.load_iris()
    names = [str(i) for i in range(150)]
    dic=kmean(iris.data,3,names,0)
    print dic
