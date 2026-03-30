# ProLink: Comprehensive Job Placement Portal

[![Maintained by Arya](https://img.shields.io/badge/Maintained%20by-Arya8569-blue?style=for-the-badge&logo=github)](https://github.com/Arya8569)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.6-38b2ac?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com/)

ProLink is a modern, responsive job placement application built to seamlessly connect talent with opportunity. Featuring dedicated portals for both Job Seekers and Recruiters, it provides an intuitive, end-to-end recruitment lifecycle management experience. 

## 🌟 Key Features

### 👤 For Job Seekers
*   **Intuitive Dashboard:** Personalized hub featuring application metrics, saved jobs, and profile strength indicators.
*   **Advanced Job Search:** Powerful search with filters to discover relevant opportunities efficiently.
*   **Application Tracking:** Real-time visibility into the status of submitted applications.
*   **Dynamic Profiles:** Easily manage your professional brand, resume, and experience details.

### 🏢 For Recruiters
*   **Recruiter Dashboard:** Centralized command center to manage active job listings, candidate pipelines, and placement analytics.
*   **Job Management:** Create, edit, and organize public job postings to attract top talent.
*   **Applicant Tracking System (ATS):** Review portfolios and manage candidates across different stages of the hiring funnel.

### 🔐 Security & Architecture
*   **Role-Based Access Control:** Secure, isolated experiences tailored automatically based on user type (Candidate vs. Recruiter).
*   **Secure Authentication:** Powered by Supabase Auth, keeping user data encrypted and protected.

## 🛠 Tech Stack

**Frontend Framework:** React 18 powered by Vite for blazing-fast development and optimized production builds.
**State Management:** Redux Toolkit & React Router v6.
**Styling & UI:** TailwindCSS, Framer Motion for animations, and a rich component library ensuring a modern premium aesthetic. 
**Backend & Database:** Supabase (PostgreSQL, Authentication, Edge Functions).
**Data Visualization:** Recharts and D3.js for dynamic, interactive applicant and job metrics.

## 🚀 Getting Started

To run this project locally, follow these steps:

### Prerequisites
*   Node.js (v18.x or higher recommended)
*   npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Arya8569/prolink.git
   cd prolink
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *(Note: The `.env` file is heavily guarded and gitignored for robust security.)*

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be running on `http://localhost:5173`.

## 📁 Project Structure

```text
prolink/
├── public/             # Static assets (Favicons, images)
├── src/
│   ├── components/     # Reusable UI components (Cards, Forms, Navigation)
│   ├── pages/          # Full page components grouped by route details
│   ├── styles/         # Global styles and Tailwind configs
│   ├── utils/          # Helper modules and constants
│   ├── App.jsx         # Main application wrapper
│   ├── Routes.jsx      # Core React Router routing logic
│   ├── supabaseClient.js # Supabase connection utility
│   └── index.jsx       # Application entry point
├── .env                # Environment variables (excluded via .gitignore)
├── package.json        # Dependencies & scripts
└── tailwind.config.js  # Tailwind utility configuration
```

## 🛡️ Security

We take security seriously. All sensitive keys and local environment variables are tracked in `.gitignore` to prevent accidental credential leaks into version control. Ensure you never commit your API keys.

---
**Built with ❤️ by [@Arya8569](https://github.com/Arya8569)**
