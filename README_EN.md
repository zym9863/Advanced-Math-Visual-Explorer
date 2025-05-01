# Advanced Math Visual Explorer

[中文](README.md) | [English](README_EN.md)

An interactive mathematical function visualization tool based on Three.js, supporting the plotting and exploration of 2D and 3D function graphs.

## Features

- **Function Visualization**: Real-time rendering of 2D and 3D function graphs
- **Interactive Controls**: Rotate, zoom, and pan using mouse operations
- **Example Functions**: Built-in examples of commonly used mathematical functions
- **Custom Functions**: Support for user-defined function expressions
- **Visual Feedback**: Function graphs with color gradient effects for enhanced visual experience

## Technology Stack

- **Three.js**: 3D graphics rendering
- **Math.js**: Mathematical expression parsing
- **HTML/CSS/JavaScript**: Frontend interface

## How to Use

1. Enter a mathematical function expression in the input box (e.g., `sin(x) * cos(y)`)
2. Select the desired dimension (2D or 3D)
3. Click the "Render" button or choose from preset example functions
4. Interact using the mouse:
   - Drag: Rotate view
   - Scroll wheel: Zoom view
   - Shift+drag: Pan view

## Function Expression Syntax

This tool uses Math.js to parse mathematical expressions and supports the following syntax:

- Basic operations: `+`, `-`, `*`, `/`, `^` (power)
- Trigonometric functions: `sin()`, `cos()`, `tan()`, `asin()`, `acos()`, `atan()`
- Hyperbolic functions: `sinh()`, `cosh()`, `tanh()`
- Exponential and logarithmic: `exp()`, `log()`, `log10()`
- Other functions: `abs()`, `sqrt()`, `ceil()`, `floor()`, `round()`

## Example Functions

- 3D functions:
  - `sin(x) * cos(y)` - Wave-shaped surface
  - `x^2 + y^2` - Paraboloid
  - `sin(x*y)` - Complex ripples
  
- 2D functions:
  - `sin(x)` - Sine curve
  - `x^2` - Parabola

## Local Setup

1. Clone or download this repository
2. Launch the project using any HTTP server (such as Python's `http.server` or VS Code's Live Server plugin)
3. Access the corresponding address in your browser
