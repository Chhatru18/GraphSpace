#!/bin/bash

# Generates a new secret key

# Using hardcoded secret key so skip this step
# python setup/generate_secret_key.py

# while read line
# do
# 	secret_key = line
# done < secret.txt

# rm secret.txt

# export SECRET_KEY=secret_key

# Email functionality tested only on gmail
export EMAIL_HOST='smtp.gmail.com'

# REPLACE THE FOLLOWING TWO PROPERTIES WITH 
# EMAIL ADDRESS AND PASSWORD TO EMAIL ADDRESS
# TO ALLOW GRAPHSPACE TO SEND EMAILS THROUGH
# SPECIFIED ACCOUNTc
export EMAIL_HOST_USER='graphspacevt@gmail.com'
export EMAIL_HOST_PASSWORD='vtresearch'

# You should not need to modify any of the lines below
export DEBUG=False
export TEMPLATE_DEBUG=False

# Runs configuration script 
# and installs all the necessary dependencies
# It also creates a database
python setup/configure.py