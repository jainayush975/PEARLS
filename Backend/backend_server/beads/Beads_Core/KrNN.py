from sklearn.neighbors import NearestNeighbors
import numpy as np
import sys
import operator
import math
from sklearn import datasets
import matplotlib.pyplot as plt

class Graph(object):
    def __init__(self, g, n, m):
        self.graph = g
        self.nodes = n
        self.edges = m
        self.explored = [0]*(n+1)

    def reverse(self):
        graph = {}
        for i, j_list in self.graph.iteritems():
            for j in j_list:
                if j not in graph:
                    graph[j] = []
                graph[j].append(i)
        return Graph(graph, self.nodes, self.edges)

def scc(g):
    results = []
    search_stack = []
    for v, explored in enumerate(g.explored):
        if not explored and v in g.graph:
            # print v
            dfs(g, v, search_stack)
    gr = g.reverse()
    while len(search_stack) > 0:
        u = search_stack[-1]
        scc_stack = []
        dfs(gr, u, scc_stack)
        for v in scc_stack:
            if v in gr.graph:
                del gr.graph[v]
            search_stack.remove(v)
        results.append(scc_stack)
    return results

def dfs(g,u,stack):
    g.explored[u] = 1
    if u in g.graph:
        for v in g.graph[u]:
            if not g.explored[v] and v in g.graph:
                dfs(g, v, stack)
    stack.append(u)


def KrNN(data,k):
    data = np.array(data)
    nbrs = NearestNeighbors(n_neighbors=k,algorithm='auto').fit(data)
    # Make reverse neighbors graph
    RG = {}
    distances, indices = nbrs.kneighbors(data)
    # print indices
    for i in range(indices.shape[0]):
        for j in range(indices.shape[1]):
            if indices[i][j] not in RG:
                RG[indices[i][j]]=[i]
            else:
                RG[indices[i][j]].append(i)
    # print RG
    RGG = {}
    RGL = {}
    for i in RG:
        if len(RG[i])>=k:
            RGG[i] = RG[i]
        else:
            RGL[i] = RG[i]
    # print RGG
    G = Graph(RGG,data.shape[0],data.shape[0]*k)
    results = [sorted(result) for result in scc(G)]
    results.sort(key=lambda result: result[0])
    cldic = {}
    whclu = {}

    for i in range(len(results)):
        cldic[i] =[]
        for j in results[i]:
            cldic[i].append(data[j])
            whclu[j] = i

    # return cldic
    # Classifying outliers
    kdth = math.ceil(k/data.shape[1])
    # print kdth
    outliers = []
    for i in RGL:
        clu = {}
        for j in RGL[i]:
            if j in RGG:
                if whclu[j] not in clu:
                    clu[whclu[j]]=1
                else:
                    clu[whclu[j]] += 1
        if len(clu)!=0:
            maxik = max(clu.iteritems(), key=operator.itemgetter(1))[0]
            if clu[maxik]>=kdth:
                cldic[maxik].append(data[i])
                whclu[i] = maxik
            else:
                outliers.append(i)
        else:
            outliers.append(i)
    # print outliers
    return cldic


if __name__ == '__main__':
    X = np.array([[5,5],[5,6],[4,5],[4,6],[-5,5],[-5,6],[-4,5],[-4,6],[5,-5],[5,-6],[4,-5],[4,-6],[-5,-5],[-5,-6],[-4,-5],[-4,-6]])
    print KrNN(X,4)
