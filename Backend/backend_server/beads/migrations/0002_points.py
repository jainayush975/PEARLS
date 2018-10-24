# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beads', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Points',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cluster_id', models.IntegerField(default=-1)),
                ('beads_id', models.IntegerField(default=-1)),
                ('point_x', models.FloatField()),
                ('point_y', models.FloatField()),
                ('point_c', models.CharField(max_length=10)),
            ],
        ),
    ]
