#!/bin/bash
# Install Schemathesis for API contract testing

echo "Installing Schemathesis..."
pip install schemathesis

echo "Schemathesis installed successfully!"
echo "Version:"
schemathesis --version
