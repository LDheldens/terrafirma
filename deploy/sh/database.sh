#!/bin/bash

echo "Borrando base de datos actual"
sudo rm -r /home/tics/cristhian/polariss/app/db/polariss.sqlite3

echo "Restaurando base de datos nueva"
sudo cp /home/tics/cristhian/polariss/app/deploy/data/polariss.sqlite3 /home/tics/cristhian/polariss/app/db/polariss.sqlite3

sudo chmod 7777 /home/tics/cristhian/polariss/app/db/polariss.sqlite3

sudo supervisorctl restart heytest

echo "Terminado proceso"
