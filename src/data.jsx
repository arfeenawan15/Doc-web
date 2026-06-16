export const DOCTOR = {
  name:      "Dr. Waqas Ahmad Awan",
  title:     "Pediatric Surgeon",
  tagline:   "MBBS, MS — Pediatric Surgeon",
  bio1:      "Dr. Waqas Ahmad Awan, MBBS, MS is a dedicated Paediatric Surgeon with more than 8 years of clinical experience in managing surgical conditions in infants and children. He is currently serving as a Senior Registrar at Al Manzoor Hospital, Mian Channu, and Sughran Wazeer Hospital, Multan.",
  bio2:      "Dr. Waqas has a special interest in Paediatric Gastrointestinal Surgery, Neonatal Surgery, and Minimally Invasive (Laparoscopic) Surgery. He is committed to providing safe, evidence-based, and compassionate surgical care for children. He is also a member of the Association of Paediatric Surgeons of Pakistan.",
  whatsapp:  "923318034846",
  phone1:    "+92 65 2663232",
  phone2:    "+92 3023569088",
};

export const EDUCATION = [
  { degree: "MBBS",                           institution: "Sahiwal Teaching Hospital" },
  { degree: "Specialization – Pediatric Surgery", institution: "Children's Hospital & Institute of Child Health Multan" },
  { degree: "Member",                         institution: "Association of Paediatric Surgeons of Pakistan" },
];

export const STATS = [
  { target: 1000, suffix: "+", label: "Surgeries Performed" },
  { target: 8,    suffix: "+", label: "Years Experience" },
  { target: 1000, suffix: "+", label: "Happy Patients" },
];

export const SERVICES = [
  { 
    icon: "fas fa-male", 
    title: "Undescended Testes", 
    desc: "Surgical correction (orchidopexy) to reposition undescended testes into the scrotum, preventing long-term complications in young boys.",
    image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&q=80",
    details: "An undescended testicle (cryptorchidism) is a testicle that hasn't moved into its proper position in the scrotum before birth. Surgery (orchidopexy) is typically recommended between 6 and 18 months of age to reposition the testicle, reducing the risk of fertility issues and testicular cancer later in life. The procedure is performed under general anesthesia, and patients usually go home the same day."
  },
  { 
    icon: "fas fa-brain", 
    title: "VP Shunting", 
    desc: "Ventriculoperitoneal shunt placement to drain excess cerebrospinal fluid in children with hydrocephalus, relieving pressure on the brain.",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
    details: "Ventriculoperitoneal (VP) shunting is a surgical procedure used to relieve pressure on the brain caused by fluid accumulation (hydrocephalus). A thin plastic tube (shunt) is placed in the brain to drain the excess cerebrospinal fluid into the abdominal cavity, where it is safely absorbed. This vital procedure helps protect the child's developing brain from damage and requires careful long-term follow-up."
  },
  { 
    icon: "fas fa-notes-medical", 
    title: "MMC Repair", 
    desc: "Surgical closure of myelomeningocele (open spina bifida) in newborns to protect the exposed spinal cord and prevent serious infection.",
    image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&q=80",
    details: "Myelomeningocele (MMC) is a severe form of spina bifida where the spinal canal remains open, exposing the spinal cord and nerves. Surgical repair is typically performed within the first 48 hours of life. The surgery involves closing the opening in the back to protect the spinal cord from infection and further trauma. Comprehensive post-operative care and rehabilitation are essential for optimal outcomes."
  },
  { 
    icon: "fas fa-smile", 
    title: "Cleft Lip & Palate", 
    desc: "Reconstructive surgery to repair cleft lip and palate, restoring normal appearance, feeding function, and speech development.",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80",
    details: "Cleft lip and cleft palate are common congenital conditions where the tissues of the mouth or lip do not form properly during fetal development. Reconstructive surgery aims to close the cleft, restoring normal function for feeding, speech development, and improving facial appearance. Cleft lip repair is typically done at 3-6 months, while palate repair is done around 9-12 months of age."
  },
  { 
    icon: "fas fa-procedures", 
    title: "Rectal Polyps", 
    desc: "Endoscopic or surgical removal of rectal polyps, addressing rectal bleeding, prolapse, and bowel irregularities safely and effectively.",
    image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=800&q=80",
    details: "Rectal polyps are growths on the inner lining of the rectum, often causing painless rectal bleeding in children. Most pediatric polyps are benign (juvenile polyps). They are typically removed safely and effectively via endoscopy or minor surgery under general anesthesia. The removed polyps are sent for biopsy to confirm they are benign, ensuring peace of mind for the family."
  },
  { 
    icon: "fas fa-dot-circle", 
    title: "Umbilical Granuloma", 
    desc: "Safe and effective treatment of umbilical granuloma in newborns and infants, preventing infection and promoting healthy navel healing.",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&q=80",
    details: "An umbilical granuloma is a small piece of red, moist tissue that remains in the belly button after the umbilical cord falls off. It is a common, minor issue in newborns. Treatment often involves applying a small amount of silver nitrate to cauterize the tissue, or in rare cases, a minor surgical tie or excision. The procedure is quick, painless, and promotes healthy healing of the navel."
  },
  { 
    icon: "fas fa-band-aid", 
    title: "Intestinal Obstruction", 
    desc: "Emergency and elective surgical management of intestinal obstruction caused by adhesions, intussusception, volvulus, or congenital anomalies.",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80",
    details: "Intestinal obstruction in children can be caused by various conditions, including intussusception, malrotation, atresia, or hernias. It prevents food and fluids from passing through the intestines, leading to symptoms like severe pain, vomiting, and bloating. Depending on the cause, emergency surgery may be required to remove the blockage or repair the bowel, preventing serious complications and restoring normal digestive function."
  },
];

export const HOSPITALS = {
  almanzoor: {
    key:         "almanzoor",
    name:        "Al Manzoor Hospital",
    address:     "Tulamba Road, Mian Channu, Punjab",
    badge:       "Sunday Only",
    number:      "01",
    days:        "Sunday",
    hours:       "11:00 AM – 4:00 PM",
    allowedDays: [0],
    dayNames:    ["Sunday"],
    slots:       ["11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM"],
    hintDays:    "Sunday only",
    hintTime:    "11:00 AM – 4:00 PM",
    phones:      ["+92 65 2663232", "+92 3098683232"],
    mapSrc:      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3470.1!2d72.35277!3d30.45230!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3919355a4ad0a0ef%3A0xffefd788757db61a!2sAl%20Manzoor%20Hospital!5e0!3m2!1sen!2spk!4v1700000000000",
    mapsLink:    "https://maps.google.com/?cid=17289175519676733035",
  },
  sughran: {
    key:         "sughran",
    name:        "Sughran Wazir Medical Complex",
    address:     "Syedan Wala Bypass, Bosan Road, Multan",
    badge:       "Thu – Sat",
    number:      "02",
    days:        "Thursday – Saturday",
    hours:       "6:00 PM – 9:00 PM",
    allowedDays: [4, 5, 6],
    dayNames:    ["Thursday", "Friday", "Saturday"],
    slots:       ["06:00 PM", "07:00 PM", "08:00 PM"],
    hintDays:    "Thursday – Saturday",
    hintTime:    "6:00 PM – 9:00 PM",
    phones:      ["+92 3023569088"],
    mapSrc:      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3474.5!2d71.48430!3d30.24879!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393901904ec4de1d%3A0x7f30eaf172fdf93e!2sSughran%20wazeer%20child%20clinic!5e0!3m2!1sen!2spk!4v1700000000001",
    mapsLink:    "https://maps.google.com/?cid=9165083016827858750",
  },
};

export const SCHEDULE = {
  almanzoor: [
    { day: "Monday",    timing: "—",                  open: false },
    { day: "Tuesday",   timing: "—",                  open: false },
    { day: "Wednesday", timing: "—",                  open: false },
    { day: "Thursday",  timing: "—",                  open: false },
    { day: "Friday",    timing: "—",                  open: false },
    { day: "Saturday",  timing: "—",                  open: false },
    { day: "Sunday",    timing: "11:00 AM – 4:00 PM", open: true  },
  ],
  sughran: [
    { day: "Monday",    timing: "—",                  open: false },
    { day: "Tuesday",   timing: "—",                  open: false },
    { day: "Wednesday", timing: "—",                  open: false },
    { day: "Thursday",  timing: "6:00 PM – 9:00 PM",  open: true  },
    { day: "Friday",    timing: "6:00 PM – 9:00 PM",  open: true  },
    { day: "Saturday",  timing: "6:00 PM – 9:00 PM",  open: true  },
    { day: "Sunday",    timing: "—",                  open: false },
  ],
};

export const NAV_LINKS = [
  { label: "Home",        href: "#home"        },
  { label: "About",       href: "#about"       },
  { label: "Services",    href: "#services"    },
  { label: "Schedule",    href: "#schedule"    },
  { label: "Locations",   href: "#locations"   },
  { label: "Contact",     href: "#contact"     },
];

export const SERVICES_FORM = [
  "Undescended Testes",
  "VP Shunting",
  "MMC Repair",
  "Cleft Lip & Palate",
  "Rectal Polyps",
  "Umbilical Granuloma",
  "Intestinal Obstruction",
  "General Consultation",
  "Other",
];
