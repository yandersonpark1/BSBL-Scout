"""Backend connecting to Database for Oberlin Pitching Staff"""
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load .env file
load_dotenv()

uri = os.getenv("uri")

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

#choose your database
db = client["Oberlin_staff"]
collection = db["players"]

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)
