
# Tattletale 



Tattletale is a social media feed parser designed to assist investigators by automating the process of capturing and documenting relevant information from platforms like Instagram, Twitter, WhatsApp, and Telegram. By minimizing human error, it ensures accurate evidence collection and simplifies the review process.








## Features

- Automated Data Extraction: Scrapes data such as posts, messages, and contact lists from platforms like Instagram, Twitter, WhatsApp, and Telegram.
- Cross-Platform Compatibility: Available as a web app and a standalone tool for Windows and Android devices.
- Advanced Search and Filtering: Enables investigators to quickly find specific data points with OSINT (Open Source Intelligence) integration.
- Secure Data Handling: Data is encrypted and can be uploaded to Google Drive or Blockchain for secure storage.
- AI/ML Integration: Assists in analyzing and visualizing data for actionable insights
## flowchart
<img src="./Readme Section Flowchart.png" alt="Flowchart"/>

## Tech Stack

**Backend:** [Node](https://nodejs.org/en), [Python 3.10.15](https://www.python.org/downloads/release/python-31015/), [Express](https://expressjs.com/), [MongoDB](https://www.mongodb.com/try), [Puppeteer](https://pptr.dev/), [Mongoose](https://mongoosejs.com/docs/), [bcrypt](https://www.npmjs.com/package/bcrypt), [JWT](hatgpt.com)

**Frontend:** [React](https://react.dev/), [Flutter](https://flutter.dev/?gad_source=1), [Tailwind](https://tailwindcss.com/)

**Web Scraper** [Typescript](https://www.typescriptlang.org/), [Crawlee](https://crawlee.dev/), [Playwright](https://playwright.dev/)
## Installation


Setup and Installation
Prerequisites
Before you begin, ensure you have the following installed:

- Node.js: Version 22.11.0. You can download it from the official website: Node.js.

npm: The Node Package Manager (npm) comes bundled with Node.js. Make sure it's updated by running:    
```bash
  npm install -g npm@latest
```
- Python: Version 3.10.15
Download and install Python 3.10.15 from the official Python website.
During installation, ensure the "Add Python to PATH" option is selected.

pip: Python Package Installer 

pip is the default package manager for Python and comes bundled with Python. Ensure it’s updated to the latest version by running:

```bash
python -m pip install --upgrade pip 
```

Virtual Environment (Optional but Recommended)
It’s a good practice to create a virtual environment to manage dependencies. Run the following commands:

1.  Create a virtual environment:
```bash
python -m venv venv  

```
2.  Activate the virtual environment:
```bash
.\venv\Scripts\activate  
```
- Installing Dependencies
Run the following command to install the required dependencies listed in the requirements.txt file:

```bash
pip install -r requirements.txt  
  
```



## Usage

Step 1: Clone the Repository
First, clone the repository to your local machine:
```bash
  git clone https://github.com/aayushman-singh/project-NARC.git
```
Go to the project directory

```bash
  cd project-NARC
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start:all
```

## Scripts

You can start individual services using the following commands:

- Python script server:
```bash
  npm run start:script  

```
- Authentication server:
```bash
  npm run start:auth  

```
- Maigret service:
```bash
  npm run start:maigret  

```
- Instagram scraper:
```bash
  npm run start:instagram  

```
- X scraper:
```bash
  npm run start:x  

```
- Facebook scraper:
```bash
  npm run start:facebook

```
- Facebook scraper:
```bash
  npm run start:frontend

```
