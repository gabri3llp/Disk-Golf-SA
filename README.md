# Disc Golf South Africa (DGSA)

**A web application promoting disc golf in South Africa.**

Disc Golf South Africa is a web application where users can explore tournaments, sign up for membership, and register for events. Administrators can manage events, members, and payment approvals.

**Module:** Interactive Development 200 (DV200)  
**Student:** Gabriel Pulella

*This is a demo project. No real payments are processed.*

## 🌐 Live Deployments

| Platform | Link |
|---|---|
| Azure Static Web Apps | [Visit website](https://victorious-desert-0caf98b00.4.azurestaticapps.net) |
| AWS Amplify | [Visit website](https://main.dukd5mhqsue22.amplifyapp.com) |

## ✨ Features

- Responsive home page with upcoming events and FAQs.
- User registration and login.
- Free and paid membership options.
- Event registration for one or multiple players.
- Player dashboard for viewing registrations and events.
- Admin dashboard for managing members, payments, and registrations.
- Create, edit, and delete tournaments.
- Upload event posters and proof of payment.
- Secure login and admin access.
- SEO features and Google Analytics integration.

## 🎨 Design Reference

The website was developed using a UX design created by **[DESIGNER NAME]** for UX200.

The implementation follows the supplied design, with additional functionality such as event management, multi-player registration, mobile navigation, and demo payment notices.

The membership fee is displayed as R375 throughout the application for consistency.

## 🛠️ Technologies Used

**Frontend**
- React
- Vite
- JavaScript
- CSS

**Backend**
- Node.js
- Express
- JWT authentication
- Axios
- Multer

**Database and Storage**
- MySQL
- Azure Database for MySQL
- Azure Blob Storage

**Deployment and Tools**
- Azure Static Web Apps
- AWS Amplify
- Azure App Service
- Git and GitHub

## 🏗️ Project Structure

```text
Disk-Golf-SA/
├── Backend/
│   ├── server.js
│   ├── Database.js
│   ├── storage.js
│   ├── data/
│   ├── middleware/
│   └── routes/
└── Frontend/
    ├── public/
    └── src/
        ├── components/
        ├── pages/
        └── styles/
```

## 🚀 Running the Project Locally

**Requirements:** Node.js 20 or newer and MySQL or MariaDB.

1. Clone the repository:

   ```bash
   git clone https://github.com/gabri3llp/Disk-Golf-SA.git
   cd Disk-Golf-SA
   ```

2. Create a MySQL database named `discgolf_sa` and import `Backend/schema.sql`.

3. Create a `Backend/.env` file with the required database settings and a JWT secret.

4. Install the backend dependencies and start the server:

   ```bash
   cd Backend
   npm install
   npm run dev
   ```

5. In a separate terminal, start the frontend:

   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

The frontend runs locally at `http://localhost:5173`.

## ☁️ Deployment

The frontend is deployed on Azure Static Web Apps and AWS Amplify. GitHub is used to manage the project source code and deployment workflows.

Both deployments allow users to access the website online.

## ⚠️ Challenges and Solutions

- **Hosting limitations:** Investigated availability issues and the limits of the free hosting plan.
- **Backend startup errors:** Checked environment settings and corrected a malformed storage connection setting.
- **CORS issues:** Resolved cross-origin configuration problems affecting the deployed websites.
- **Database migration:** Used a database schema and import script to move the database to Azure.

These challenges helped me improve my debugging and deployment skills.

## 🔒 Security

- Secrets and database credentials are stored outside the public repository.
- Passwords are hashed.
- JWT authentication protects private features.
- Admin operations require the appropriate role.
- File uploads are restricted by file type and size.

Administrator login details are provided separately with the Canvas submission and are not published in this repository.

## 🙌 Acknowledgements

- UX design supplied for the UX200 project.
- Disc golf content and FAQ material supplied for the project.

**Built by Gabriel Pulella for DV200 — Interactive Development 200.**
