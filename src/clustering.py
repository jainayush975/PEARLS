from sklearn import datasets
from sklearn.cluster import KMeans
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import copy

def kmean(data,numclu,flag):
    # print data
    # data is given as array of arrays
    lendata=len(data[0])
    # print type(data)
    x = pd.DataFrame(data,columns=[str(i) for i in range(1,lendata+1)])
    model = KMeans(n_clusters=int(numclu))
    model.fit(x)
    predictedY = np.choose(model.labels_, [i for i in range(numclu)]).astype(np.int64)
    # print predictedY
    dic = {}
    ret = {}
    # print type(data[i])
    # print len(data),len(predictedY)
    for i in range(len(predictedY)):
        temp=copy.deepcopy(data[i])
        if predictedY[i] not in dic:
            dic[predictedY[i]]=[temp]
        else:
            dic[predictedY[i]].append(temp)
    ret = {}
    for key in dic:
        ret[len(dic[key])] = dic[key]
    # print ret
    dic = {}
    m=0
    for key in sorted(ret.keys()):
        # print key
        dic[m] = ret[key]
        m += 1
    # print  "boom"
    return dic

if __name__ == '__main__':
    iris=datasets.load_iris()
    dic=kmean(iris.data,3,0)
    dic1 = {}
    for var in dic:
        tmp = np.asarray(dic[var])
        dic1[var] = kmean(tmp,3,0)
