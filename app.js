const cities = ["Hyderabad", "Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata", "Pune", "Goa"];

const flights = [
  { id: "AV101", air: "AirVista", from: "Hyderabad", to: "Delhi", dep: "06:15", arr: "08:35", mins: 140, price: 4899, capacity: 24 },
  { id: "AV203", air: "SkyWays", from: "Hyderabad", to: "Delhi", dep: "10:40", arr: "13:05", mins: 145, price: 5299, capacity: 24 },
  { id: "AV315", air: "IndiSky", from: "Hyderabad", to: "Delhi", dep: "18:20", arr: "20:40", mins: 140, price: 6199, capacity: 24 },
  { id: "AV118", air: "AirVista", from: "Delhi", to: "Mumbai", dep: "07:10", arr: "09:20", mins: 130, price: 3999, capacity: 24 },
  { id: "AV225", air: "SkyWays", from: "Delhi", to: "Mumbai", dep: "13:30", arr: "15:45", mins: 135, price: 4299, capacity: 24 },
  { id: "AV410", air: "IndiSky", from: "Mumbai", to: "Bengaluru", dep: "08:00", arr: "09:40", mins: 100, price: 3599, capacity: 24 },
  { id: "AV512", air: "AirVista", from: "Bengaluru", to: "Chennai", dep: "11:25", arr: "12:30", mins: 65, price: 2499, capacity: 24 },
  { id: "AV608", air: "SkyWays", from: "Chennai", to: "Hyderabad", dep: "16:10", arr: "17:30", mins: 80, price: 2899, capacity: 24 },
  { id: "AV712", air: "IndiSky", from: "Hyderabad", to: "Mumbai", dep: "09:20", arr: "11:00", mins: 100, price: 3799, capacity: 24 },
  { id: "AV814", air: "AirVista", from: "Pune", to: "Delhi", dep: "14:00", arr: "16:10", mins: 130, price: 4499, capacity: 24 },
  { id: "AV906", air: "SkyWays", from: "Kolkata", to: "Delhi", dep: "07:45", arr: "10:10", mins: 145, price: 5199, capacity: 24 },
  { id: "AV921", air: "IndiSky", from: "Goa", to: "Mumbai", dep: "17:35", arr: "18:45", mins: 70, price: 2699, capacity: 24 }
];

const $ = id => document.getElementById(id);
const KEY = "airvoyage_bookings_v1";

let query = {
  from: "Hyderabad",
  to: "Delhi",
  date: "",
  pax: 1
};

let activeFlight = null;
let chosen = [];
let toastTimer;
let currentUser = null;

const USERS_KEY = "airvoyage_users_v1";
const SESSION_KEY = "airvoyage_session_v1";

// ==========================================
// REGISTRATION OTP
// ==========================================

let pendingOTP = null;
let pendingUser = null;
let otpExpiry = null;

// ==========================================
// EMAILJS CONFIGURATION
// ==========================================

const EMAILJS_CONFIG = {
  serviceId: "service_qvtdr99",
  templateId: "template_2o4vtop",
  publicKey: "4hcgpCxyFELXShx65"
};

function emailIsConfigured() {
  return Boolean(
    window.emailjs &&
    EMAILJS_CONFIG.serviceId !== "YOUR_SERVICE_ID" &&
    EMAILJS_CONFIG.templateId !== "YOUR_TEMPLATE_ID" &&
    EMAILJS_CONFIG.publicKey !== "YOUR_PUBLIC_KEY"
  );
}

// ==========================================
// SEND REGISTRATION OTP
// ==========================================

async function sendRegistrationOTP(name, email, password) {
  if (!emailIsConfigured()) {
    return toast("EmailJS is not configured. Check your EmailJS settings.");
  }

  const otp = String(
    Math.floor(100000 + Math.random() * 900000)
  );

  pendingOTP = otp;
  pendingUser = { name, email, password };
  otpExpiry = Date.now() + 5 * 60 * 1000;

  const params = {
    to_email: email,
    to_name: name,
    email_subject: "Your Airfare Registration OTP",
    event_type: "EMAIL VERIFICATION",
    booking_reference: "REGISTRATION",
    booking_status: "OTP Verification",
    flight_name: "Airfare Reservation System",
    flight_number: "N/A",
    from_city: "N/A",
    to_city: "N/A",
    departure_date: "N/A",
    departure_time: "N/A",
    arrival_time: "N/A",
    seat_numbers: "N/A",
    passenger_count: "N/A",
    total_amount: "N/A",
    phone_number: "N/A",
    message:
      `Your registration OTP is ${otp}. ` +
      "It expires in 5 minutes. Do not share it with anyone."
  };

  try {
    await window.emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      params,
      {
        publicKey: EMAILJS_CONFIG.publicKey
      }
    );

    $("otpSection").classList.remove("hidden");
    document.getElementById("registrationOTP").disabled = false;
document.getElementById("registrationOTP").required = true;

    toast("OTP sent to your email. Check your inbox!");

    console.log("Registration OTP email request successful.");
  } catch (err) {
    console.error("OTP email failed:", err);

    console.error("EmailJS error details:", {
      status: err.status,
      text: err.text,
      message: err.message
    });

    pendingOTP = null;
    pendingUser = null;
    otpExpiry = null;

    toast(
      `OTP email failed: ${
        err.text || err.message || "Check browser Console."
      }`
    );
  }
}

// ==========================================
// VERIFY REGISTRATION OTP
// ==========================================

function verifyRegistrationOTP() {
  const enteredOTP = $("registrationOTP").value.trim();

  if (!pendingOTP || !pendingUser) {
    return toast("Please request an OTP first.");
  }

  if (Date.now() > otpExpiry) {
    pendingOTP = null;
    pendingUser = null;
    otpExpiry = null;

    $("registrationOTP").value = "";

    return toast("OTP expired. Please register again.");
  }

  if (!/^\d{6}$/.test(enteredOTP)) {
    return toast("Enter a valid 6-digit OTP.");
  }

  if (enteredOTP !== pendingOTP) {
    return toast("Incorrect OTP. Please try again.");
  }

  const users = allUsers();

  if (
    users.some(
      u =>
        u.email.toLowerCase() ===
        pendingUser.email.toLowerCase()
    )
  ) {
    pendingOTP = null;
    pendingUser = null;
    otpExpiry = null;

    $("otpSection").classList.add("hidden");

    return toast(
      "This email already has an account. Please sign in."
    );
  }

  users.push(pendingUser);

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(users)
  );

  localStorage.setItem(
    SESSION_KEY,
    pendingUser.email
  );

  pendingOTP = null;
  pendingUser = null;
  otpExpiry = null;

  $("registrationOTP").value = "";
  $("otpSection").classList.add("hidden");
  $("registerForm").reset();

  updateAccountUI();

  toast("Email verified! Account created successfully.");
}

// ==========================================
// SEND BOOKING / CANCELLATION EMAIL
// ==========================================

async function sendEmailNotification(type, b) {
  const subject =
    type === "booking"
      ? `Booking confirmed — ${b.id}`
      : `Booking cancelled — ${b.id}`;

  const params = {
    to_email: b.email,
    to_name: b.name,
    email_subject: subject,

    event_type:
      type === "booking"
        ? "BOOKING CONFIRMED"
        : "BOOKING CANCELLED",

    booking_reference: b.id,
    booking_status: b.status,
    flight_name: b.air,
    flight_number: b.flightId,
    from_city: b.from,
    to_city: b.to,
    departure_date: dateFmt(b.date),
    departure_time: b.dep,
    arrival_time: b.arr,
    seat_numbers: b.seats.join(", "),
    passenger_count: String(b.pax),
    total_amount: fmt(b.total),
    phone_number: b.phone || "Not provided",

    message:
      type === "booking"
        ? `Your booking ${b.id} is confirmed. Have a safe journey!`
        : `Your booking ${b.id} has been cancelled. The reserved seats have been released.`
  };

  if (!emailIsConfigured()) {
    console.info(
      "Email notification not sent: configure EmailJS.",
      params
    );

    toast(
      type === "booking"
        ? "Booking saved. Configure EmailJS to send confirmation emails."
        : "Cancelled. Configure EmailJS to send cancellation emails."
    );

    return false;
  }

  try {
    await window.emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      params,
      {
        publicKey: EMAILJS_CONFIG.publicKey
      }
    );

    toast(
      type === "booking"
        ? "Booking confirmed. Email notification sent!"
        : "Booking cancelled. Cancellation email sent!"
    );

    return true;
  } catch (err) {
    console.error("EmailJS notification failed:", err);

    console.error("EmailJS error details:", {
      status: err.status,
      text: err.text,
      message: err.message
    });

    toast(
      "Reservation saved, but email failed. Check EmailJS setup."
    );

    return false;
  }
}

// ==========================================
// USERS AND ACCOUNT
// ==========================================

function allUsers() {
  try {
    return JSON.parse(
      localStorage.getItem(USERS_KEY) || "[]"
    );
  } catch (e) {
    return [];
  }
}

function userFor(email) {
  return allUsers().find(
    u =>
      u.email.toLowerCase() === email.toLowerCase()
  );
}

function updateAccountUI() {
  const saved = localStorage.getItem(SESSION_KEY);

  currentUser = saved ? userFor(saved) : null;

  $("accountStatus").textContent = currentUser
    ? "● Signed in: " + currentUser.name
    : "● Demo booking · Ready to fly";

  $("signedInPanel").classList.toggle(
    "hidden",
    !currentUser
  );

  $("authForms").classList.toggle(
    "hidden",
    !!currentUser
  );

  if (currentUser) {
    $("signedInTitle").textContent =
      "Hello, " + currentUser.name + "!";

    $("signedInText").textContent =
      "Signed in as " +
      currentUser.email +
      ". You can now make reservations.";
  }
}

// ==========================================
// BOOKINGS
// ==========================================

function allBookings() {
  try {
    return JSON.parse(
      localStorage.getItem(KEY) || "[]"
    );
  } catch (e) {
    return [];
  }
}

function saveBookings(b) {
  localStorage.setItem(KEY, JSON.stringify(b));
}

function fmt(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function dateFmt(d) {
  return d
    ? new Date(d + "T12:00:00").toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric"
        }
      )
    : "Date not selected";
}

function toast(s) {
  $("toast").textContent = s;
  $("toast").classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(
    () => $("toast").classList.remove("show"),
    2600
  );
}

function page(p) {
  for (const id of [
    "search",
    "bookings",
    "account",
    "admin"
  ]) {
    $(id + "Page").classList.toggle(
      "hidden",
      id !== p
    );
  }

  document.querySelectorAll("[data-page]").forEach(b => {
    b.classList.toggle(
      "active",
      b.dataset.page === p
    );
  });

  if (p === "bookings") renderBookings();
  if (p === "admin") renderAdmin();
  if (p === "account") updateAccountUI();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// ==========================================
// SEAT AVAILABILITY
// ==========================================

function taken(id) {
  return allBookings()
    .filter(
      b =>
        b.flightId === id &&
        b.status === "Confirmed"
    )
    .flatMap(b => b.seats);
}

function left(f) {
  return f.capacity - taken(f.id).length;
}

// ==========================================
// FLIGHT SEARCH AND DISPLAY
// ==========================================

function renderFlights() {
  let fs = flights.filter(
    f =>
      f.from === query.from &&
      f.to === query.to
  );

  const s = $("sort").value;

  if (s === "price") {
    fs.sort((a, b) => a.price - b.price);
  }

  if (s === "duration") {
    fs.sort((a, b) => a.mins - b.mins);
  }

  if (s === "time") {
    fs.sort((a, b) => a.dep.localeCompare(b.dep));
  }

  $("results").classList.remove("hidden");

  $("resulttitle").textContent =
    query.from + " to " + query.to;

  $("resultsub").textContent =
    dateFmt(query.date) +
    " · " +
    query.pax +
    " passenger(s) · " +
    fs.length +
    " flight options";

  $("none").classList.toggle(
    "hidden",
    fs.length > 0
  );

  $("flights").innerHTML = fs
    .map(f => {
      const n = left(f);
      const disabled = n < query.pax;

      return `
        <article class="flight">

          <div class="airline">
            <div class="airicon">✈</div>

            <div>
              <div class="airname">${f.air}</div>
              <div class="sub">${f.id} · Economy</div>
            </div>
          </div>

          <div class="route">
            <div class="point">
              <strong>${f.dep}</strong>
              <small>${f.from}</small>
            </div>

            <div class="routeLine">
              ${Math.floor(f.mins / 60)}h ${f.mins % 60}m
              <div class="line"></div>
              Non-stop
            </div>

            <div class="point">
              <strong>${f.arr}</strong>
              <small>${f.to}</small>
            </div>
          </div>

          <div class="price">
            <strong>${fmt(f.price)}</strong>
            <small>per passenger</small>

            <div class="actions">
              <span class="seats ${n <= 5 ? "low" : ""}">
                ${n} seats left
              </span>

              <button
                class="primary book"
                data-book="${f.id}"
                ${disabled ? "disabled" : ""}
              >
                ${disabled ? "Sold out" : "Book now →"}
              </button>
            </div>
          </div>

        </article>
      `;
    })
    .join("");
}

// ==========================================
// OPEN BOOKING MODAL
// ==========================================

function openBooking(id) {
  if (!currentUser) {
    toast("Please register or sign in before booking.");
    page("account");
    return;
  }

  activeFlight = flights.find(f => f.id === id);
  chosen = [];

  $("flightSummary").textContent =
    `${activeFlight.air} ${activeFlight.id} · ` +
    `${activeFlight.from} → ${activeFlight.to} · ` +
    `${dateFmt(query.date)}`;

  $("bookpax").value = query.pax;
  $("each").textContent = fmt(activeFlight.price);
  $("paxcount").textContent = query.pax;

  $("total").textContent = fmt(
    activeFlight.price * query.pax
  );

  $("name").value = "";
  $("email").value = "";
  $("phone").value = "";

  $("name").value = currentUser.name;
  $("email").value = currentUser.email;

  drawSeats();

  $("bookingModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

// ==========================================
// SEAT SELECTION
// ==========================================

function drawSeats() {
  let html = "";
  const busy = taken(activeFlight.id);

  for (let r = 1; r <= 4; r++) {
    for (let c = 0; c < 7; c++) {
      if (c === 3) {
        html += '<div class="aisle">·</div>';
        continue;
      }

      const letter = String.fromCharCode(
        65 + (c < 3 ? c : c - 1)
      );

      const seat = r + letter;
      const b = busy.includes(seat);
      const sel = chosen.includes(seat);

      html += `
        <button
          type="button"
          class="seat ${b ? "booked" : ""} ${sel ? "selected" : ""}"
          data-seat="${seat}"
          ${b ? "disabled" : ""}
        >
          ${seat}
        </button>
      `;
    }
  }

  $("seatmap").innerHTML = html;

  $("seatmsg").textContent =
    `${chosen.length} of ${query.pax} seat(s) selected · ` +
    `${activeFlight.capacity - busy.length} currently available`;

  $("seatmap")
    .querySelectorAll("[data-seat]")
    .forEach(btn => {
      btn.onclick = () => {
        const s = btn.dataset.seat;

        if (chosen.includes(s)) {
          chosen = chosen.filter(x => x !== s);
        } else if (chosen.length < query.pax) {
          chosen.push(s);
        } else {
          return toast(
            `Choose only ${query.pax} seat(s).`
          );
        }

        drawSeats();
      };
    });
}

// ==========================================
// CLOSE MODALS
// ==========================================

function closeModal(id) {
  $(id).classList.add("hidden");

  if (
    $("bookingModal").classList.contains("hidden") &&
    $("confirmModal").classList.contains("hidden")
  ) {
    document.body.style.overflow = "";
  }
}

// ==========================================
// CONFIRM BOOKING
// ==========================================

function confirmBooking(e) {
  e.preventDefault();

  if (chosen.length !== query.pax) {
    return toast(`Please select ${query.pax} seat(s).`);
  }

  const busy = taken(activeFlight.id);

  if (chosen.some(s => busy.includes(s))) {
    chosen = [];
    drawSeats();

    return toast(
      "Seat availability changed. Please choose again."
    );
  }

  const b = {
    id:
      "AV-" +
      Math.random().toString(36).slice(2, 8).toUpperCase(),

    flightId: activeFlight.id,
    air: activeFlight.air,
    from: activeFlight.from,
    to: activeFlight.to,
    date: query.date,
    dep: activeFlight.dep,
    arr: activeFlight.arr,
    price: activeFlight.price,
    pax: query.pax,
    seats: [...chosen],

    name: $("name").value.trim(),
    email: $("email").value.trim(),
    phone: $("phone").value.trim(),

    userEmail: currentUser.email,
    total: activeFlight.price * query.pax,
    status: "Confirmed",
    created: new Date().toISOString()
  };

  const all = allBookings();

  all.unshift(b);
  saveBookings(all);

  closeModal("bookingModal");
  showTicket(b);
  renderFlights();

  sendEmailNotification("booking", b);
}

// ==========================================
// BOOKING CONFIRMATION TICKET
// ==========================================

function showTicket(b) {
  $("downloadConfirmTicket").onclick = () =>
    downloadTicket(b);

  $("ticket").innerHTML = `
    <div class="ticket">

      <div class="ref">${b.id}</div>

      <p>BOOKING REFERENCE · Keep this ID</p>

      <div class="ticketroute">

        <div>
          <strong>${b.from.slice(0, 3).toUpperCase()}</strong>
          <br>
          <small>${b.dep}</small>
        </div>

        <span>✈ ───── ✈</span>

        <div>
          <strong>${b.to.slice(0, 3).toUpperCase()}</strong>
          <br>
          <small>${b.arr}</small>
        </div>

      </div>

      <p>
        <b>${b.name}</b>
        <br>
        ${dateFmt(b.date)}
        · Seat(s): ${b.seats.join(", ")}
        <br>
        ${b.air} ${b.flightId}
        · ${b.pax} passenger(s)
      </p>

      <p><b>Total: ${fmt(b.total)}</b></p>

    </div>
  `;

  $("confirmModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

// ==========================================
// BOOKINGS HISTORY
// ==========================================

function renderBookings() {
  const bs = allBookings().filter(
    b =>
      !currentUser ||
      b.userEmail === currentUser.email ||
      (!b.userEmail && b.email === currentUser.email)
  );

  $("count").textContent =
    bs.length + " booking(s)";

  $("noBookings").classList.toggle(
    "hidden",
    bs.length > 0
  );

  $("bookingList").innerHTML = bs
    .map(b => bookingHTML(b))
    .join("");
}

function bookingHTML(b) {
  return `
    <article class="booking">

      <div>
        <div class="ref">${b.id}</div>

        <h3>${b.from} → ${b.to}</h3>

        <p>${b.air} ${b.flightId} · ${dateFmt(b.date)}</p>

        <p>
          ${b.dep}–${b.arr}
          · Seat(s): ${b.seats.join(", ")}
        </p>

        <p>${b.name} · ${b.pax} passenger(s)</p>
      </div>

      <div>
        <span class="status ${b.status === "Cancelled" ? "cancelled" : ""}">
          ${b.status}
        </span>

        <p>${b.email}</p>
        <p>Reference: ${b.id}</p>
      </div>

      <div class="bookactions">

        <strong>${fmt(b.total)}</strong>

        ${
          b.status === "Confirmed"
            ? `
              <button
                class="secondary"
                data-download="${b.id}"
              >
                Download ticket
              </button>

              <button
                class="danger"
                data-cancel="${b.id}"
              >
                Cancel booking
              </button>
            `
            : `
              <small class="muted">Seats released</small>

              <button
                class="secondary"
                data-download="${b.id}"
              >
                Download ticket
              </button>
            `
        }

      </div>

    </article>
  `;
}

// ==========================================
// DOWNLOAD PDF TICKET
// ==========================================

function downloadTicket(b) {
  if (!window.jspdf?.jsPDF) {
    toast("Ticket PDF is loading. Please try again in a moment.");
    return;
  }

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    unit: "mm",
    format: "a4"
  });

  const W = 210;

  const purple = [119, 76, 220];
  const dark = [20, 18, 30];
  const muted = [105, 101, 118];
  const light = [247, 245, 252];

  pdf.setFillColor(...dark);
  pdf.rect(0, 0, W, 48, "F");

  pdf.setFillColor(...purple);
  pdf.rect(0, 45, W, 3, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(19);

  pdf.text("AIRFARE RESERVATION", 16, 19);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);

  pdf.text(
    "FLIGHT TICKET  /  PASSENGER ITINERARY",
    16,
    27
  );

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);

  pdf.text(
    String(b.status || "Confirmed").toUpperCase(),
    194,
    19,
    { align: "right" }
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);

  pdf.text("Booking reference", 16, 38);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);

  pdf.text(String(b.id), 16, 44);

  pdf.setTextColor(...dark);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");

  pdf.text("ITINERARY", 16, 61);

  pdf.setFillColor(...light);
  pdf.roundedRect(14, 66, 182, 48, 4, 4, "F");

  pdf.setTextColor(...purple);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(23);

  pdf.text(
    String(b.from || "---").slice(0, 3).toUpperCase(),
    24,
    83
  );

  pdf.text(
    String(b.to || "---").slice(0, 3).toUpperCase(),
    148,
    83
  );

  pdf.setTextColor(...muted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);

  pdf.text(String(b.from || "Departure"), 24, 90);
  pdf.text(String(b.to || "Destination"), 148, 90);

  pdf.setDrawColor(...purple);
  pdf.setLineWidth(0.7);

  pdf.line(65, 81, 143, 81);

  pdf.setFillColor(...purple);
  pdf.circle(65, 81, 1.5, "F");
  pdf.circle(143, 81, 1.5, "F");

  pdf.setTextColor(...dark);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);

  pdf.text(String(b.dep || "--:--"), 24, 101);
  pdf.text(String(b.arr || "--:--"), 148, 101);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...muted);

  pdf.text("DEPARTURE", 24, 106);
  pdf.text("ARRIVAL", 148, 106);

  pdf.setTextColor(...dark);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);

  pdf.text("PASSENGER & FLIGHT DETAILS", 16, 128);

  const rows = [
    ["Passenger name", b.name || "—"],
    ["Email address", b.email || "—"],
    ["Airline", b.air || "—"],
    ["Flight number", b.flightId || "—"],
    ["Travel date", dateFmt(b.date)],
    ["Passengers", String(b.pax || 1)],
    ["Seat number(s)", (b.seats || []).join(", ") || "—"]
  ];

  let y = 138;

  rows.forEach((row, i) => {
    if (i % 2 === 0) {
      pdf.setFillColor(250, 249, 253);
      pdf.rect(14, y - 5, 182, 9, "F");
    }

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...muted);

    pdf.text(row[0], 19, y);

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...dark);

    pdf.text(String(row[1]), 83, y, {
      maxWidth: 106
    });

    y += 10;
  });

  pdf.setFillColor(...dark);
  pdf.roundedRect(14, 212, 182, 25, 3, 3, "F");

  pdf.setTextColor(220, 215, 235);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);

  pdf.text("TOTAL FARE", 20, 222);

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(17);

  pdf.text(fmt(b.total), 190, 228, {
    align: "right"
  });

  pdf.setTextColor(...muted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);

  pdf.text(
    "Booking created: " +
      (b.created
        ? new Date(b.created).toLocaleString()
        : "—"),
    16,
    249
  );

  pdf.setDrawColor(220, 216, 230);
  pdf.line(14, 257, 196, 257);

  pdf.setFontSize(8);

  pdf.text(
    "Please keep your booking reference for future enquiries.",
    16,
    266
  );

  pdf.setFont("helvetica", "bold");

  pdf.text(
    "STUDENT PROJECT DEMO",
    194,
    266,
    { align: "right" }
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);

  pdf.text(
    "This is a sample ticket generated by a front-end demo. It is not a real airline ticket or proof of payment.",
    16,
    274,
    { maxWidth: 178 }
  );

  pdf.save(
    `Airfare-Reservation-Ticket-${b.id}.pdf`
  );

  toast("Professional PDF ticket downloaded.");
}

// ==========================================
// ADMIN DASHBOARD
// ==========================================

function renderAdmin() {
  const bs = allBookings();

  const confirmed = bs.filter(
    b => b.status === "Confirmed"
  );

  const passengers = confirmed.reduce(
    (n, b) => n + Number(b.pax || 0),
    0
  );

  const revenue = confirmed.reduce(
    (n, b) => n + Number(b.total || 0),
    0
  );

  const available = flights.reduce(
    (n, f) => n + left(f),
    0
  );

  $("adminBookings").textContent = bs.length;
  $("adminRevenue").textContent = fmt(revenue);
  $("adminPassengers").textContent = passengers;
  $("adminSeats").textContent = available;

  $("adminBookingList").innerHTML = bs.length
    ? bs.slice(0, 8).map(bookingHTML).join("")
    : `
      <div class="empty">
        <h3>No reservations yet</h3>
        <p>
          Bookings will appear here after customers make reservations.
        </p>
      </div>
    `;
}

// ==========================================
// BOOKING LOOKUP
// ==========================================

function lookup() {
  const id = $("lookup").value.trim().toUpperCase();

  if (!id) {
    return toast("Enter a booking reference first.");
  }

  const b = allBookings().find(x => x.id === id);

  $("lookupResult").innerHTML = b
    ? bookingHTML(b)
    : `
      <div class="empty" style="margin-top:12px">
        <h3>Booking not found</h3>
        <p>Check the reference ID and try again.</p>
      </div>
    `;
}

// ==========================================
// CANCEL BOOKING
// ==========================================

function cancel(id) {
  const bs = allBookings();
  const b = bs.find(x => x.id === id);

  if (!b || b.status !== "Confirmed") {
    return;
  }

  if (
    !confirm(
      "Cancel booking " +
      id +
      "? Its seats will become available again."
    )
  ) {
    return;
  }

  b.status = "Cancelled";
  b.cancelledAt = new Date().toISOString();

  saveBookings(bs);

  renderBookings();
  renderAdmin();

  if (
    $("lookup").value.trim().toUpperCase() === id
  ) {
    lookup();
  }

  renderFlights();

  sendEmailNotification("cancellation", b);
}

// ==========================================
// INITIALIZE APPLICATION
// ==========================================

function init() {
  // Populate city dropdowns.

  for (const id of ["from", "to"]) {
    $(id).innerHTML = cities
      .map(c => `<option>${c}</option>`)
      .join("");
  }

  $("from").value = "Hyderabad";
  $("to").value = "Delhi";

  const now = new Date();

  const today = new Date(
    now - now.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);

  $("date").min = today;
  $("date").value = today;

  query.date = today;

  // Navigation.

  document.querySelectorAll("[data-page]").forEach(b => {
    b.onclick = () => page(b.dataset.page);
  });

  // Flight search.

  $("searchForm").onsubmit = e => {
    e.preventDefault();

    if ($("from").value === $("to").value) {
      return toast("Choose two different cities.");
    }

    query = {
      from: $("from").value,
      to: $("to").value,
      date: $("date").value,
      pax: Number($("pax").value)
    };

    renderFlights();

    $("results").scrollIntoView({
      behavior: "smooth"
    });
  };

  // Swap departure and destination.

  $("swap").onclick = () => {
    const a = $("from").value;

    $("from").value = $("to").value;
    $("to").value = a;
  };

  // Flight sorting.

  $("sort").onchange = renderFlights;

  // Open booking modal.

  $("flights").onclick = e => {
    const b = e.target.closest("[data-book]");

    if (b && !b.disabled) {
      openBooking(b.dataset.book);
    }
  };

  // Booking form submission.

  $("bookingForm").onsubmit = confirmBooking;

  // Modal close buttons.

  document.querySelectorAll("[data-close]").forEach(b => {
    b.onclick = () => closeModal(b.dataset.close);
  });

  // View bookings after confirmation.

  $("viewBookings").onclick = () => {
    closeModal("confirmModal");
    page("bookings");
  };

  // Booking lookup.

  $("lookupBtn").onclick = lookup;

  $("lookup").onkeydown = e => {
    if (e.key === "Enter") {
      lookup();
    }
  };

  // Cancel booking and download tickets.

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-cancel]");

    if (b) {
      cancel(b.dataset.cancel);
    }

    const d = e.target.closest("[data-download]");

    if (d) {
      const booking = allBookings().find(
        x => x.id === d.dataset.download
      );

      if (booking) {
        downloadTicket(booking);
      }
    }
  });

  // ==========================================
  // REGISTRATION WITH EMAIL OTP
  // ==========================================

  $("registerForm").onsubmit = async e => {
    e.preventDefault();

    const name = $("regName").value.trim();

    const email = $("regEmail")
      .value
      .trim()
      .toLowerCase();

    const password = $("regPassword").value;

    if (!name || !email || !password) {
      return toast("Please fill in all registration fields.");
    }

    if (userFor(email)) {
      return toast(
        "An account with this email already exists. Please sign in."
      );
    }

    await sendRegistrationOTP(
      name,
      email,
      password
    );
  };

  // Verify OTP button.

  $("verifyOTPBtn").onclick = verifyRegistrationOTP;

  // ==========================================
  // LOGIN
  // ==========================================

  $("loginForm").onsubmit = e => {
    e.preventDefault();

    const email = $("loginEmail")
      .value
      .trim()
      .toLowerCase();

    const password = $("loginPassword").value;

    const user = userFor(email);

    if (!user || user.password !== password) {
      return toast("Email or password is incorrect.");
    }

    localStorage.setItem(SESSION_KEY, email);

    updateAccountUI();

    toast("Signed in successfully.");
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  $("logoutBtn").onclick = () => {
    localStorage.removeItem(SESSION_KEY);

    currentUser = null;

    updateAccountUI();

    toast("You have signed out.");
  };

  // Initial page rendering.

  renderFlights();
  updateAccountUI();
}

init();