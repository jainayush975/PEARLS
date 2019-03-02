import csv
import json
from beads.models import PEARLS
from django.db.models import Q

def debug(msgs):
    print "Debut Printing ",
    for msg in msgs:
        print msg[0], msg[1],
    print


def stringify_keys(d):
    """Convert a dict's keys to strings if they are not."""
    for key in d.keys():

        # check inner dict
        if isinstance(d[key], dict):
            value = stringify_keys(d[key])
        else:
            value = d[key]

        # convert nonstring to string if needed
        if not isinstance(key, str):
            try:
                d[str(key)] = value
            except Exception:
                try:
                    d[repr(key)] = value
                except Exception:
                    raise

            # delete old key
            del d[key]
    return d


def dumpToJson(fileName, data):
    data1 = stringify_keys(data)
    with open(fileName, 'w') as fl:
        json.dump(data1, fl)

def extractFromClusters(clusterFile, dataFile):

    with open(clusterFile, 'r') as fl:
        clusters = json.load(fl)

    txt = []
    txt.append(clusters[str(-1)][str(-1)])
    for cluster in clusters:
        for pearl in clusters[cluster]:
            if ((int(cluster) != -1) or (int(pearl) != -1)):
                dbobj = PEARLS.objects.filter(Q(cluster_id=cluster) & Q(pearl_id=pearl))
                for obj in dbobj:
                    if not obj.is_deleted:
                        points = clusters[cluster][pearl]

                        for point in points:
                            txt.append(point)

    with open(dataFile, 'w') as fl:
        writer = csv.writer(fl)
        writer.writerows(txt)
    return ;
