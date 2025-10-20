
# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Project Abstract

The MCA Department Management System is a comprehensive, full-stack web application designed to modernize and streamline the academic and administrative operations of a Master of Computer Applications (MCA) department. Built with a modern technology stack including Next.js, React, and Tailwind CSS, the application provides a seamless and role-based experience for administrators, faculty, and students.

Key features include dedicated dashboards for each role, enabling efficient management of users, classes, and academic records. Students can access study materials, view their performance, explore placement opportunities, and submit anonymous feedback. A standout feature is the AI-powered feedback summarization tool, which uses Genkit to provide concise, sentiment-analyzed summaries, helping faculty and administration quickly identify areas for improvement. The project demonstrates best practices in modern web development, utilizing Next.js Server Components for performance and ShadCN for a polished, accessible UI.

---

## Getting Started: A Step-by-Step Guide

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### 1. Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 20.x or later. You can download it from [nodejs.org](https://nodejs.org/).
- **npm**: This comes bundled with Node.js.

### 2. Environment Setup

The project requires several environment variables to connect to services like the database and AI models.

#### Step 2.1: Create the Environment File

In the root directory of the project, create a new file named `.env.local`.

#### Step 2.2: Add Environment Variables

Copy the following content into your newly created `.env.local` file and fill in the values as described below.

```env
# MongoDB Connection String
# Replace with your actual MongoDB connection string.
# You can get a free cluster from MongoDB Atlas: https://www.mongodb.com/cloud/atlas
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority"

# NextAuth Secret
# A random string used to hash tokens. You can generate one using: `openssl rand -base64 32`
NEXTAUTH_SECRET="your-super-secret-key-here"

# Google AI (Gemini) API Key
# Required for AI features like feedback summarization.
# Get your key from Google AI Studio: https://aistudio.google.com/app/apikey
GEMINI_API_KEY="your-gemini-api-key-here"

# Optional: Custom Admin Credentials
# If not provided, the system defaults to: Admin01 / shaosaid05413
ADMIN_USERNAME="your-admin-username"
ADMIN_PASSWORD="your-admin-password"
```

**Where to get the values:**
- **`MONGODB_URI`**: Sign up for a free MongoDB Atlas account, create a new cluster, and get the connection string. Remember to replace `<user>`, `<password>`, `<cluster-url>`, and `<database-name>` with your actual credentials and database details.
- **`NEXTAUTH_SECRET`**: This is a critical security variable. Run the command `openssl rand -base64 32` in your terminal to generate a secure, random string and paste it here.
- **`GEMINI_API_KEY`**: This is required for the AI-powered features. Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to create and copy your API key.

### 3. Install Dependencies

Open your terminal in the project's root directory and run the following command to install all the necessary packages:

```bash
npm install
```

### 4. Running the Application

This project has two main components that need to be run simultaneously in separate terminal windows: the Next.js web application and the Genkit AI service.

#### Step 4.1: Run the Web Application

In your first terminal, run the following command to start the Next.js development server:

```bash
npm run dev
```

This will start the main application. By default, it will be available at [http://localhost:9002](http://localhost:9002).

#### Step 4.2: Run the Genkit AI Service

For the AI features (like feedback summarization) to work, you must also run the Genkit development server. In a **new, separate terminal window**, run:

```bash
npm run genkit:watch
```

This command starts the Genkit server and watches for any changes you make to the AI flows.

### 5. Accessing the Application

Once both servers are running, you can access the application in your web browser:
- **Landing Page**: [http://localhost:9002/landing](http://localhost:9002/landing)
- **Login Page**: [http://localhost:9002/login](http://localhost:9002/login)

You can log in using one of the three roles:
- **Admin**: Use the credentials you set in `.env.local` (or the defaults if not set).
- **Faculty/Student**: Use the "User Management" section in the admin dashboard to create faculty and student accounts.

You're all set! The project should now be running perfectly on your local machine.
