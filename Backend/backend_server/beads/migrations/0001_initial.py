# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Beads',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cluster_id', models.IntegerField(default=-1)),
                ('centroid_x', models.FloatField()),
                ('centroid_y', models.FloatField()),
                ('centroid_r', models.FloatField()),
                ('centroid_s', models.IntegerField()),
                ('centroid_c', models.CharField(max_length=10)),
            ],
        ),
    ]
