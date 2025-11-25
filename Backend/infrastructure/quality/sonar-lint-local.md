# SonarLint Local Setup

## Installation

### Visual Studio Code
```bash
# Install SonarLint extension
code --install-extension SonarSource.sonarlint-vscode
```

### Visual Studio
Install from Extensions marketplace: "SonarLint for Visual Studio"

## Configuration

SonarLint reads rules from `.editorconfig` files in each project.

Global backend rules: `Backend/.editorconfig`

## Usage

SonarLint analyzes code in real-time as you type. Issues appear:
- In the Problems panel (VS Code)
- As squiggly underlines in the editor
- With Quick Fix suggestions

## Pre-Commit Check

Run SonarLint analysis before committing:
```bash
cd Backend
dotnet build /p:TreatWarningsAsErrors=true
```

This ensures no code quality issues reach the repository.
