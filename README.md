# Dr. Waqas Ahmad Awan — React Website

Complete React frontend for Dr. Waqas Ahmad Awan's pediatric surgery website.

## Project Structure

```
drwaqas-react/
├── index.html                  ← Vite HTML entry
├── package.json
├── vite.config.js
├── public/
│   └── assets/                 ← PUT YOUR IMAGES HERE
│       ├── logo.png
│       ├── pic1.png
│       └── pic2.avif
└── src/
    ├── main.jsx                ← React root mount
    ├── App.jsx                 ← Root component
    ├── index.css               ← Global styles + CSS variables
    ├── data.js                 ← All static data (doctor info, hospitals, etc.)
    ├── hooks.js                ← Custom hooks (useScrolled, useInView, useCounter)
    └── components/
        ├── Navbar.jsx / .css   ← Fixed navbar with scroll spy + mobile hamburger
        ├── Hero.jsx / .css     ← Hero with bg image, animated counters, floating cards
        ├── About.jsx / .css    ← Doctor bio, education timeline, photo
        ├── Services.jsx / .css ← 7 service cards with hover effect
        ├── Schedule.jsx / .css ← Weekly schedule tables with today highlight
        ├── Locations.jsx / .css← Location cards with Google Maps
        ├── AppointmentForm.jsx / .css ← Full smart form with hospital-aware dates
        ├── Appointment.jsx / .css     ← Section wrapper with success state
        ├── Contact.jsx / .css  ← 4 contact cards
        ├── Footer.jsx / .css   ← Footer with links and contact info
        └── Widgets.jsx         ← Toast + WhatsApp float button
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your images
Copy your image files into `public/assets/`:
```
public/
└── assets/
    ├── logo.png    ← doctor logo/photo for navbar
    ├── pic1.png    ← doctor photo for hero and about sections
    └── pic2.avif   ← hero background image
```

### 3. Run development server
```bash
npm run dev
```
Open http://localhost:5173

### 4. Build for production
```bash
npm run build
```
Output goes to `dist/` folder — upload these files to your server.

## Connecting to PHP Backend

The appointment form posts to `api/appointments.php?action=book`.

In development (localhost:5173), add a proxy in `vite.config.js`:
```js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost/doctor-website'
    }
  }
})
```

## React Concepts Used

| Concept | Where |
|---------|-------|
| `useState` | Form fields, errors, loading, success, toast, menu open, hover |
| `useEffect` | Scroll listener, counter animation, IntersectionObserver, date auto-select |
| `useRef` | Element refs for IntersectionObserver |
| Custom Hooks | `useScrolled`, `useActiveSection`, `useInView`, `useCounter`, `useToast` |
| Props | `onSuccess` callback, `card` data, `hospKey`, `index` for stagger delay |
| Conditional rendering | Success state, error messages, schedule hint, date warning |
| Component composition | App → Navbar, Hero, About, Services, Schedule, Locations, Appointment, Contact, Footer |
| Data separation | All content in `data.js`, logic in components and `hooks.js` |
