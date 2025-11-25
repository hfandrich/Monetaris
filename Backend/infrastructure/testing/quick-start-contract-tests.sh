#!/bin/bash
# Quick start script for Schemathesis testing

echo "Monetaris API Contract Tests - Quick Start"
echo ""

# Install if not present
if ! command -v schemathesis &> /dev/null; then
    echo "📦 Installing Schemathesis..."
    ./install-schemathesis.sh
else
    echo "✅ Schemathesis already installed"
fi

echo ""
echo "📝 To run contract tests:"
echo "1. Start backend: cd ../../MonetarisApi && dotnet run"
echo "2. Run tests: ./run-contract-tests.sh"
echo ""
echo "See SCHEMATHESIS_GUIDE.md for full documentation."
