import json

with open('serviceAccountKey.json', 'r') as f:
    service_account = json.load(f)

print("FIREBASE_SERVICE_ACCOUNT='" + json.dumps(service_account) + "'") 