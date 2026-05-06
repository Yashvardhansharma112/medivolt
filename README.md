# Medical-Repository-Website

A web application for securely storing, managing, and sharing medical records.

## Features

- User authentication and authorization
- Upload and manage medical documents
- Role-based access for users and path labs
- Secure storage and retrieval of records
- Dashboard with statistics and recent activity
- Responsive and modern UI

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Other:** JWT for authentication

## Getting Started

### Prerequisites

- Node.js and npm installed
- (Optional) Database server running

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/manmohan1008/Medical-Repository-Website.git
    cd Medical-Repository-Website
    ```

2. Install dependencies for frontend and backend:
    ```sh
    npm install
    cd server
    npm install
    cd ..
    ```

3. Set up environment variables:
    - Copy `.env.example` to `.env` in the `server` directory and update values as needed.

4. Initialize the database:
    ```sh
    cd server
    # Run your DB init script, e.g.:
    npm run db:init
    cd ..
    ```

5. Start the development servers:
    - Frontend:
        ```sh
        npm run dev
        ```
    - Backend:
        ```sh
        cd server
        npm start
        cd ..
        ```

## Usage

- Register as a user or path lab
- Upload, view, and manage medical records
- Share records securely

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
