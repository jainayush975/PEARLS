

from django.conf.urls import include, url
# from django.conf.urls import path
from . import views

urlpatterns = [
    url('makeclusters', views.updateDB, name='makeclusters'),
    url('getbead', views.getBead, name='getbead'),
    url('getcluster', views.getCluster, name='getcluster'),
    url('upload', views.FileView.as_view(), name='file-upload'),
    url('searchvector', views.searchVector, name='searchvector'),
    url('getattributelist', views.getAttributeList, name='getattributelist')
]
