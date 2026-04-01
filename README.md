# 🌟 AI Dermatologist & Skincare Analyzer

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-00B4D8?style=for-the-badge&logo=google&logoColor=white)

An advanced, full-stack health-tech application that acts as a virtual dermatologist. It utilizes **Google MediaPipe** for real-time 3D facial geometric scanning and **Google Gemini 2.5 Flash** for multimodal visual analysis. 

The system provides users with personalized, budget-friendly skincare routines, tracks their progress chronologically in a MySQL database, and maintains an AI "memory" of past clinical notes to evaluate routine effectiveness over time.

---

## ✨ Core Features

- **📸 3D Geometric Face Scanner**: Uses edge-computing (MediaPipe) in the browser to ensure optimal head rotation (Center, Left, Right) before capturing images to prevent motion blur.
- **🧠 Stateful AI Memory**: The backend stores the AI's "private clinical notes." When a user returns for a follow-up scan, the AI compares the new images to its past notes to track improvement.
- **📐 Strict JSON Output**: Utilizes `Pydantic` models to force the Generative AI to return perfectly structured, predictable JSON data (no missing brackets or conversational text).
- **🗄️ Relational Data Tracking**: Robust MySQL database architecture connecting user profiles to chronological scan histories.

---

## 🏗️ System Architecture

* **Frontend**: HTML5, CSS3, Vanilla JavaScript, Google MediaPipe (Face Mesh).
* **Backend**: Python, FastAPI, Uvicorn.
* **AI Engine**: Google GenAI SDK (`gemini-2.5-flash` model).
* **Database**: MySQL, SQLAlchemy (ORM), PyMySQL.

---

## 🚀 Installation & Setup Guide

Follow these steps to run the project locally on your machine.

### 1. Prerequisites
Ensure you have the following installed:
* [Python 3.9+](https://www.python.org/downloads/)
* [MySQL Server](https://dev.mysql.com/downloads/installer/) (or XAMPP/WAMP)
* A [Google Gemini API Key](https://aistudio.google.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/VP5412/VRP_skincare.git
cd VRP_skincare
