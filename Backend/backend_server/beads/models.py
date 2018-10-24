from django.db import models

class File(models.Model):
  file = models.FileField(blank=False, null=False)
  remark = models.CharField(max_length=20)
  timestamp = models.DateTimeField(auto_now_add=True)

class PEARLS(models.Model):
    cluster_id = models.IntegerField(default=-1);
    centroid_x = models.FloatField();
    centroid_y = models.FloatField();
    centroid_z = models.FloatField();
    centroid_r = models.FloatField();
    centroid_s = models.IntegerField();
    centroid_c = models.CharField(max_length=10);

    def convert_to_dict(self):

        bead_dic = {
            'x' : self.centroid_x,
            'y' : self.centroid_y,
            'z' : self.centroid_z,
            'r' : self.centroid_r,
            's' : self.centroid_s,
            'c' : self.centroid_c
        }
        return bead_dic
#
# class Points(models.Model):
#     cluster_id = models.IntegerField(default=-1);
#     beads_id = models.IntegerField(default=-1);
#     point_x = models.FloatField();
#     point_y = models.FloatField();
#     point_c = models.CharField(max_length=10);
#
#     def convert_to_dict(self):
#
#         point_dic = {
#             'x' : self.point_x,
#             'y' : self.point_y,
#             'c' : self.point_c
#         }
#         return point_dic
