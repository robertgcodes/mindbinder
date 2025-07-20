#!/bin/bash

echo "Deploying Firebase Rules..."
echo "=========================="

# Deploy Firestore rules
echo "Deploying Firestore rules..."
firebase deploy --only firestore:rules

# Deploy Storage rules
echo "Deploying Storage rules..."
firebase deploy --only storage:rules

echo "=========================="
echo "Deployment complete!"
echo ""
echo "Rules deployed:"
echo "- Firestore: firestore.rules"
echo "- Storage: storage.rules"