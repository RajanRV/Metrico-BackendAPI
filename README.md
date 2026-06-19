# Introduction 
TODO: Give a short introduction of your project. Let this section explain the objectives or the motivation behind this project. 

# Getting Started
TODO: Guide users through getting your code up and running on their own system. In this section you can talk about:
1.	Installation process
2.	Software dependencies
3.	Latest releases
4.	API references

# Build and Test
TODO: Describe and show how to build your code and run the tests. 

# Contribute
TODO: Explain how other users and developers can contribute to make your code better. 

If you want to learn more about creating good readme files then refer the following [guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops). You can also seek inspiration from the below readme files:
- [ASP.NET Core](https://github.com/aspnet/Home)
- [Visual Studio Code](https://github.com/Microsoft/vscode)
- [Chakra Core](https://github.com/Microsoft/ChakraCore)

# Metrico Backend

Compliance Console API built with Express.js, Sequelize ORM, and PostgreSQL.

## Tech Stack
- Node.js + Express.js
- Sequelize ORM
- PostgreSQL

## Getting Started

### 1. Clone the repo
git clone <repo-url>
cd metrico-backend

### 2. Install dependencies
npm install

### 3. Setup environment
cp .env.example .env
# Fill in your values in .env

### 4. Run the server
npm run dev



# Metrico Deployment Guide

## Project Overview

**Project Name:** Metrico

**Description:**
Metrico is an administrative web application that allows administrators to manage and review test results through a centralized dashboard.

---

# Technology Stack

## Frontend

* React
* Vite
* AWS S3 (Static Hosting)
* AWS CloudFront (CDN)

## Backend

* Node.js 24.x
* Express.js
* AWS Lambda
* AWS API Gateway

## Database

* PostgreSQL (AWS RDS)
* Sequelize ORM

## Monitoring

* AWS CloudWatch Logs

---

# Infrastructure Details

## Frontend Infrastructure

| Component                  | Value                                 |
| -------------------------- | ------------------------------------- |
| S3 Bucket                  | metrico.com                           |
| CloudFront Distribution ID | E1FXP7R78IWCWX                        |
| CloudFront Domain          | https://d1ndb63wrhd1tm.cloudfront.net |

---

## Backend Infrastructure

| Component       | Value                                                  |
| --------------- | ------------------------------------------------------ |
| Lambda Function | Metrico-API                                            |
| Runtime         | nodejs24.x                                             |
| Handler         | index.handler                                          |
| API Gateway     | Metrico-api                                            |
| API URL         | https://6fm29vpijk.execute-api.us-east-1.amazonaws.com |

---

## Database Infrastructure

| Component     | Value      |
| ------------- | ---------- |
| Database Type | PostgreSQL |
| Hosting       | AWS RDS    |
| Database Name | metrico-db |
| ORM           | Sequelize  |

---

# Application URLs

## Frontend

https://d1ndb63wrhd1tm.cloudfront.net

## Backend

https://6fm29vpijk.execute-api.us-east-1.amazonaws.com

---

# Environment Configuration

Environment variables are maintained using:

```bash
.env.example
```

Before deployment, create a `.env` file based on `.env.example`.

The `.env` file is included inside the Lambda deployment package.

---

# Frontend Deployment Process

## Step 1: Pull Latest Changes

```bash
git pull
```

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Create Production Build

```bash
npm run build
```

The build output will be generated inside:

```text
dist/
```

---

## Step 4: Upload Build to S3

Open AWS Console:

1. Navigate to S3
2. Open bucket:

```text
metrico.com
```

3. Delete existing frontend files if required.
4. Upload all contents from the local `dist` folder to the root of the bucket.

Example bucket structure:

```text
metrico.com
├── assets/
├── index.html
├── favicon.ico
└── ...
```

---

## Step 5: Invalidate CloudFront Cache

Navigate to:

AWS Console → CloudFront → Distribution → Invalidations

Distribution ID:

```text
E1FXP7R78IWCWX
```

Create invalidation:

```text
/*
```

Wait until invalidation status becomes **Completed**.

---

## Step 6: Verify Deployment

Open:

```text
https://d1ndb63wrhd1tm.cloudfront.net
```

Verification Checklist:

* Application loads successfully
* Login page loads correctly
* User authentication works
* API requests succeed

---

# Backend Deployment Process

## Step 1: Pull Latest Changes

```bash
git pull
```

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Configure Environment Variables

Create `.env` file using:

```bash
.env.example
```

Verify all production environment variables are populated correctly.

---

## Step 4: Create Deployment Package

From the project root directory, create a ZIP archive containing all project files including:

```text
project-root/
├── node_modules/
├── src/
├── package.json
├── package-lock.json
├── .env
├── index.js
└── all other project files
```

Ensure the Lambda handler file remains accessible as:

```text
index.handler
```

---

## Step 5: Execute Database Migrations

Run migrations before deploying code that depends on schema changes.

```bash
npx sequelize-cli db:migrate
```

Confirm migrations complete successfully.

---

## Step 6: Upload ZIP to AWS Lambda

Navigate to:

AWS Console → Lambda → Metrico-API

1. Select **Upload from**
2. Choose **.zip file**
3. Upload newly created deployment package
4. Save changes

AWS Lambda will automatically deploy the new version.

---

## Step 7: Verify API Deployment

Test API endpoint:

```text
https://6fm29vpijk.execute-api.us-east-1.amazonaws.com
```

Check:

* API responds successfully
* Database connection succeeds
* No startup errors
* CloudWatch logs are clean

---

# Monitoring

## CloudWatch Logs

Navigate to:

```text
AWS Console
→ CloudWatch
→ Log Groups
→ /aws/lambda/Metrico-API
```

Review logs for:

* Application startup errors
* Database connection issues
* Runtime exceptions
* Migration-related errors

---

# Rollback Procedure

## Frontend Rollback

If deployment introduces issues:

1. Open S3 bucket:

```text
metrico.com
```

2. Restore previous build files.
3. Upload previous working version.
4. Create CloudFront invalidation:

```text
/*
```

5. Verify application functionality.

---

## Backend Rollback

If deployment introduces issues:

1. Open AWS Lambda.
2. Navigate to:

```text
Metrico-API
```

3. Select previously published stable version.
4. Re-publish or restore the version.
5. Verify API functionality.

---

# Deployment Checklist

## Frontend

* [ ] Latest code pulled
* [ ] Dependencies installed
* [ ] Production build generated
* [ ] Build uploaded to S3 root
* [ ] CloudFront invalidation completed
* [ ] Frontend verified

---

## Backend

* [ ] Latest code pulled
* [ ] Dependencies installed
* [ ] Environment variables verified
* [ ] ZIP package created
* [ ] Database migrations executed
* [ ] ZIP uploaded to Lambda
* [ ] API verified
* [ ] CloudWatch logs reviewed

---

# Troubleshooting

## Frontend Changes Not Visible

Possible causes:

* CloudFront cache not invalidated
* Old browser cache
* Incorrect files uploaded to S3

Resolution:

* Create CloudFront invalidation (`/*`)
* Hard refresh browser
* Verify uploaded files in S3

---

## API Returning 500 Errors

Possible causes:

* Missing environment variables
* Database connection failure
* Migration mismatch

Resolution:

* Review CloudWatch logs
* Verify `.env` values
* Verify database connectivity
* Confirm migrations executed successfully

---

## Database Errors After Deployment

Possible causes:

* Migration not executed
* Incorrect schema version
* Database credentials mismatch

Resolution:

```bash
npx sequelize-cli db:migrate
```

Verify migration status and database connectivity.

---

# Ownership

Deployment ownership resides with the development team. Developers are responsible for:

* Frontend deployment
* Backend deployment
* Database migrations
* Deployment verification
* Rollback execution when required
