# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beads', '0002_points'),
    ]

    operations = [
        migrations.CreateModel(
            name='File',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to=b'')),
                ('remark', models.CharField(max_length=20)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
