# ✈️ Airfare Reservation System
🌐 **Live Demo:** https://navya-potula.github.io/airfare-reservation-system/

A responsive, front-end flight reservation web application built using HTML, CSS, and JavaScript. Users can search flights, compare fares, select seats, manage bookings, receive email notifications, and download professional PDF tickets.

## 📌 Overview

The Airfare Reservation System demonstrates the core workflow of an online flight booking platform through an interactive user interface. It includes flight search, user registration with email OTP verification, seat selection, booking management, and an admin-style dashboard.

This project is designed for learning and demonstration purposes. It uses browser local storage and sample flight data rather than a production backend or live airline services.

## ✨ Features

### 🔎 Flight Search
- Search flights by departure and destination cities.
- Select a travel date and number of passengers.
- View sample flight schedules, prices, and durations.
- Sort available flights by price, duration, and departure time.

### 👤 User Registration and Login
- Register using a name, email address, and password.
- Request an email OTP for registration verification.
- Sign in and sign out using demo account data.
- Display the current account status.

### 💺 Seat Selection
- Interactive seat-selection interface.
- View unavailable seats based on saved bookings.
- Select seats according to the passenger count.
- Prevent selecting seats already marked as booked in the current browser's stored data.

### 🎫 Booking Management
- Confirm reservations and generate booking references.
- View booking history.
- Look up bookings using a reference ID.
- Cancel confirmed bookings.
- Make cancelled seats available again within the stored demo data.

### 📧 Email Notifications
- EmailJS integration for registration OTP emails.
- Booking confirmation email notifications.
- Booking cancellation email notifications.

### 📄 PDF Tickets
- Generate and download PDF booking tickets.
- Display passenger, flight, seat, fare, and booking reference details.

### 📊 Admin Dashboard
- View saved booking counts.
- View confirmed passenger counts.
- Calculate total fare value for confirmed bookings.
- View estimated remaining seat availability.

### 🎨 User Interface
- Responsive web interface.
- Interactive navigation and booking modals.
- Booking status indicators and notification messages.

## 🛠️ Technologies Used

- **HTML5** — Page structure
- **CSS3** — Styling and responsive layout
- **JavaScript** — Application logic and interactions
- **Browser localStorage** — Demo users, sessions, and bookings
- **EmailJS** — Email notifications and OTP delivery
- **jsPDF** — PDF ticket generation

## 📁 Project Structure

```text
Airfare_Reservation_System/
│
├── index.html
├── style.css
├── app.js
├── README.md
└── .gitignore
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- A code editor such as Visual Studio Code
- An internet connection for the external EmailJS and jsPDF libraries

### Installation

1. Clone or download this repository.
2. Open the project folder in your code editor.
3. Check the EmailJS configuration in `app.js`.
4. Open `index.html` in your browser, or use the Live Server extension in Visual Studio Code.

### EmailJS Configuration

The application uses EmailJS to send OTP, booking confirmation, and cancellation emails.

Configure the following values in `app.js` with your own EmailJS project settings:

```javascript
const EMAILJS_CONFIG = {
  serviceId: "YOUR_SERVICE_ID",
  templateId: "YOUR_TEMPLATE_ID",
  publicKey: "YOUR_PUBLIC_KEY"
};
```

Ensure your EmailJS email template supports the parameters used by the application, including `to_email`, `to_name`, `email_subject`, and `message`.

**Security note:** EmailJS public configuration values are intended for frontend use, but they should still be protected with appropriate service and domain restrictions. Never publish Gmail passwords, app passwords, private API keys, or other confidential credentials.

## 🧪 How to Use

1. Open the application in your browser.
2. Choose the departure city, destination, travel date, and passenger count.
3. Search for available sample flights.
4. Register and complete the email OTP step.
5. Sign in to your demo account.
6. Select a flight and choose available seats.
7. Confirm the booking.
8. View the booking reference and download the PDF ticket.
9. Visit the bookings section to view or cancel reservations.

## ⚠️ Limitations

This is a front-end demonstration project, not a production-ready airline reservation system.

- Flight schedules and fares are sample data.
- There is no backend server or central database.
- User accounts, sessions, and bookings are stored in browser localStorage.
- Passwords are stored as plain text in localStorage in this demo. Do not use real or reused passwords.
- OTP generation and verification happen in browser-side JavaScript and are not secure enough for production.
- Booking and seat availability are not synchronized between different browsers or devices.
- The admin dashboard is a demonstration interface, not a securely authenticated admin system.
- No real airline inventory, payment gateway, or payment processing is integrated.
- Email delivery depends on the EmailJS configuration and service availability.
- PDF tickets are sample documents and are not valid airline tickets or proof of payment.

For production use, implement a secure backend, database, server-side OTP verification, password hashing, proper authentication and authorization, reliable seat reservation logic, and a trusted payment integration.

## 🔒 Security

- Do not commit passwords, app passwords, private keys, or real user data.
- Keep `.env` files and local secret files out of version control.
- Restrict EmailJS usage to authorized domains where supported.
- Use a backend for secure account management and OTP verification in a production application.

## 🎯 Project Objective

The objective of this project is to demonstrate front-end development skills through a practical booking workflow, including form handling, DOM manipulation, client-side data storage, seat selection, email integration, and PDF generation.

## 👩‍💻 Author

**Navya Potula**

## 📜 Disclaimer

This project is developed for educational and portfolio demonstration purposes only. Airline names, flight numbers, schedules, and fares are illustrative sample data.