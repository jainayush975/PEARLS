

from django.conf.urls import include, url
# from django.conf.urls import path
from . import views

urlpatterns = [
    url('makeclusters', views.updateDB, name='makeclusters'),
    url('getbead', views.getBead, name='getbead'),
    url('getcluster', views.getCluster, name='getcluster'),
    url('upload', views.FileView.as_view(), name='file-upload'),
    url('searchvector', views.searchVector, name='searchvector'),
    url('restoreAll', views.restoreAll, name='restoreAll'),
    url('deletePearl', views.deletePearl, name='deletePearl'),
    url('getallattributelist', views.getAllAttributeList, name='getallattributelist'),
    url('filterattributes', views.filterAttributes, name='filterattributes'),
    url('getattributelist', views.getAttributeList, name='getattributelist'),
    url('getnoofclusters', views.getNoOfClusters, name='getnoofclusters')
]
