# AI-Powered Smart Lost & Found Management Platform

An intelligent, client-side web application designed to streamline the reporting, heuristic matching, and recovery of lost and found items. The platform automates item correlation using a multi-attribute rule-based comparison engine, displays estimated match confidence with transparent reasoning, and provides persistent in-app notifications and real-time dashboard analytics.

---

## 📅 5-Day Development Progression

- [x] **Day 1: Project Setup & Responsive Home Page**
  - Scaffolding, responsive layout, CSS custom properties, navigation drawer, system status card, and 5-day roadmap.
- [x] **Day 2: Intake Forms, Validation & Persistent Storage**
  - Standardized Missing & Found report forms, field validation, image compression via HTML5 Canvas, and `localStorage` persistence.
- [x] **Day 3: Rule-Based Matching Engine & Similarity Scoring**
  - Multi-attribute heuristics (Category, Semantic keywords, Brand, Colour, Location, Organization, Description, Timeline plausibility) with score estimation (0–98%) and explanation breakdowns.
- [x] **Day 4: Live Dashboard Statistics & In-App Match Notifications**
  - Dynamic platform statistics, match alert dispatching with duplicate suppression, unread counters, and mark-as-read workflows.
- [x] **Day 5: Final Testing, Bug Fixing & Production Polish**
  - Complete test suite, cross-device responsiveness verification, safe handling of corrupted/empty data, and prototype delivery.

---

## 🚀 Key Features

1. **Structured Item Intake (Missing & Found Forms)**:
   - Captures item name, standardized category, date, organization/facility, specific location, primary colour, brand/model, and detailed description.
   - Optional photo upload with automatic client-side canvas downsampling (max 500px dimension) to preserve image clarity without exceeding browser storage limits.
   - Real-time client-side field validation with clear success and error banners.

2. **Rule-Based Smart Matching Engine**:
   - Compares every missing report against found reports across 8 heuristic dimensions:
     - **Category Match (+25%)**: Exact category match, general category overlap (+8%), or penalty for conflicting categories (-15%).
     - **Item Name & Semantic Concept (+14% to +30%)**: Exact match, token intersection, substring match, and synonym cluster recognition (e.g., iPhone ↔ Smartphone, AirPods ↔ Earbuds, Backpack ↔ Rucksack).
     - **Brand Correlation (+10% to +15% / -15%)**: Case-insensitive brand match, brand mention in description, or penalty for conflicting explicit brands.
     - **Colour Palette (+12%)**: Automatic keyword extraction against standard colour palettes.
     - **Organization Proximity (+8% to +12% / -10%)**: Shared campus, transit facility, or corporate building.
     - **Location Keywords (+7% to +10%)**: Room, floor, or station landmark proximity.
     - **Descriptive Keywords (up to +8%)**: Distinguishing physical characteristics.
     - **Timeline Plausibility (+4% to -10%)**: Validates plausible date sequence (rewards items found within 30 days; penalizes chronologically impossible dates).
   - **Transparent Heuristic Estimation**: Scores are clamped between 0% and 98% and clearly badged as *"Heuristic Estimate (not guaranteed accuracy)"*.

3. **In-App Match Notifications**:
   - Automatically generates a notification when a potential match is detected (score >= 25%).
   - **Duplicate Suppression**: Tracks unique report pairs (`${missingId}_${foundId}`) to guarantee no duplicate alerts are generated for the same items.
   - **Unread Tracking**: Live badges in the section header, hero section, and navigation bar.
   - **Interactive Actions**: Individual "Mark as Read", global "Mark All Read", "Dismiss" alert, and "View Match" jump button.
   - **Automated Orphan Cleanup**: Automatically purges notifications if either associated report is deleted.

4. **Platform Dashboard**:
   - Real-time counters for **Total Missing Reports**, **Total Found Reports**, **Possible Matches**, and **Unread Match Alerts**.
   - Dynamically computed from `localStorage` records with zero hardcoded values.

5. **Data Resilience & Privacy**:
   - Pure client-side execution; data persists across page refreshes and browser restarts.
   - Handles empty, sparse, or corrupted `localStorage` entries gracefully without runtime exceptions.
   - Privacy-focused: prompts finders not to reveal sensitive secrets (e.g. private PINs, serials, cash amounts) to safeguard ownership verification.

---

## 🛠️ Technologies Used

- **HTML5**: Semantic tags (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`), accessible ARIA attributes (`aria-expanded`, `aria-selected`, `role="tab"`, `role="alert"`).
- **CSS3**: Custom properties (CSS variables), CSS Grid, Flexbox, responsive typography clamp, keyframe animations, mobile-first media queries.
- **Vanilla JavaScript (ES6+)**: Zero external libraries or frameworks. Clean modular architecture (`ReportStore`, `NotificationStore`, `MatchingEngine`, `app.js`).
- **Web Storage API**: `localStorage` JSON serialization with defensive schema validation.
- **HTML5 Canvas API**: Client-side photo resizing and JPEG compression.

---

## 📁 Project Folder Structure

```
AI-Powered Smart Lost & Found Management Platform/
├── css/
│   └── style.css            # Responsive layout, form grid, badges, cards, match comparator, dashboard & notifications
├── js/
│   ├── app.js               # UI coordination, dashboard counters, notifications manager, validation & match renderer
│   ├── matching.js          # Rule-based multi-attribute comparison & semantic scoring engine
│   └── data/
│       └── storage.js       # LocalStorage persistence layer for reports and notifications
├── index.html               # Main responsive entry point and single-page application shell
└── README.md                # Project documentation and test steps
```

---

## 💻 How to Run and Test Locally

### Option 1: Direct File Launch (Fastest, No Installation Needed)
1. Navigate to the project root:
   ```text
   c:\Users\Asus\OneDrive\Desktop\AI-Powered Smart Lost & Found Management Platform
   ```
2. Double-click `index.html` (or right-click → **Open with** → Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari).

### Option 2: Command Line (PowerShell)
```powershell
Start-Process "index.html"
```

### Option 3: Local HTTP Development Server (Node.js)
```bash
npx serve .
# or
npx http-server -p 8080 .
```
Then visit `http://localhost:8080` in your web browser.

---

## 🧪 Browser Demonstration & Verification Steps

1. **Dashboard Initial State**:
   - Notice the **Platform Dashboard**: Missing (0), Found (0), Matches (0), Alerts (0).
   - Scroll to **Match Notifications**: Notice the empty state `🔕 No Match Notifications Yet`.
2. **Report a Missing Item**:
   - Go to **Report an Item** -> **Report Missing Item**.
   - Fill in:
     - Name: `Apple iPhone 14 Pro`
     - Category: `Electronics`
     - Organization: `Central Metro Station`
     - Location: `Platform 2 Waiting Bench`
     - Colour: `Space Black`
     - Brand: `Apple`
     - Description: `Black iPhone in clear MagSafe case with small scratch on top corner.`
   - Click **🚨 Submit Missing Item Report**.
   - Verify: Green success alert displays, form resets, and Dashboard shows **Missing Reports: 1**.
3. **Report a Matching Found Item**:
   - Switch to **🎁 Report Found Item** tab.
   - Fill in:
     - Name: `Black Smartphone`
     - Category: `Electronics`
     - Organization: `Central Metro Station`
     - Location: `Platform 2 Waiting Bench`
     - Colour: `Black`
     - Brand: `Apple`
     - Description: `Found iPhone in clear case near bench; handed to transit staff.`
   - Click **🎁 Submit Found Item Report**.
4. **Inspect Automated Match & Alert**:
   - Verify Dashboard updates: **Missing: 1**, **Found: 1**, **Matches: 1**, **Alerts: 1**.
   - Scroll to **🔔 Match Notifications**:
     - See the unread notification card with title, `98% High Match Estimate` badge, summary explanation, and matching attribute tags.
     - Notice the unread counter badge `1` in the top navbar and hero button.
   - Scroll to **🔍 AI Smart Match Finder**:
     - Inspect side-by-side comparison of the Missing item vs. Found item with the full list of matching reasons.
5. **Test Duplicate Prevention**:
   - Toggle match filters (`All Estimates`, `Moderate+`, `High Confidence`) or refresh the browser (`F5`).
   - Verify: The notification count remains `1`—no duplicate alerts are generated for the same pair.
6. **Test Mark as Read & Filter Pills**:
   - Click **✓ Mark as Read** on the notification card: card transitions to read status and unread badges clear to `0`.
   - Click the **Unread** filter pill: displays `✅ All Caught Up!`.
   - Click **All Alerts**: shows the read notification card.
7. **Test Deletion & Cleanup**:
   - Under **Submitted Reports**, delete the Missing report.
   - Verify: Dashboard immediately decrements Missing count and Matches count to `0`.
   - Verify: The notification tied to the deleted report is automatically removed from Match Notifications.

---

## ⚠️ Current Prototype Limitations

1. **Local Storage Scoping**: Data is stored in browser `localStorage`. Reports and notifications are scoped to the local device and browser profile; they are not yet synchronized across multiple independent users' devices.
2. **Storage Quota**: Browser `localStorage` typically has a 5MB to 10MB quota per origin. While images are automatically compressed via canvas down to ~30–50KB, storing hundreds of photos locally will approach browser limits.
3. **Deterministic Heuristics**: The matching engine uses rule-based keyword intersection, tokenization, synonym clusters, and location/timeline heuristics rather than deep learning neural embeddings.

---

## 🔮 Future Backend Integration Possibilities

1. **Centralized Cloud Database & API**:
   - Migrate storage to PostgreSQL or MongoDB with a REST/GraphQL API (Node.js/Express, FastAPI, or Go).
   - Multi-tenant organization support (universities, airports, municipal transit systems).
2. **Multi-Modal AI Embeddings**:
   - Integrate vector embeddings (e.g. Google Vertex AI / Gemini Embeddings, CLIP) for cross-modal text-and-image semantic search.
3. **Automated Push & Email Notifications**:
   - Web Push API and transactional email (SendGrid/Resend) or SMS alerts when high-confidence matches are found.
4. **Zero-Knowledge Ownership Verification**:
   - Cryptographic challenge-response or hidden verification questions (e.g. asking the claimant to describe an unlisted engraving or serial number before releasing finder contact info).
5. **Secure Return & Custody Tracking**:
   - QR-code based physical handoff verification, chain-of-custody logging, and digital receipt generation.
