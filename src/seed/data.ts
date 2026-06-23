// ============================================================
// SEED DATA CONSTANTS – Nigerian School Management System
// ============================================================

// --- SCHOOL ---
export const SEED_SCHOOL = {
  id: "school_1",
  name: "Royal Kiddies Academy",
  shortName: "RKA",
  slug: "royal-kiddies-academy",
  logo: "",
  phone: "+234 801 234 5678",
  email: "info@royalkiddiesacademy.edu.ng",
  address: "42 Education Avenue, Ikeja, Lagos State",
  primaryColor: "#6366f1",
  secondaryColor: "#06b6d4",
  accentColor: "#f59e0b",
}

// --- CLASSES (No arms, SSS has sections) ---
export const CLASS_NAMES = [
  "Nursery 1",
  "Nursery 2",
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SSS 1 - Science",
  "SSS 1 - Arts",
  "SSS 1 - Commerce",
  "SSS 2 - Science",
  "SSS 2 - Arts",
  "SSS 2 - Commerce",
  "SSS 3 - Science",
  "SSS 3 - Arts",
  "SSS 3 - Commerce",
]

export const CLASS_SECTIONS: Record<string, string> = {
  "Nursery 1": "Early Years",
  "Nursery 2": "Early Years",
  "Primary 1": "Primary",
  "Primary 2": "Primary",
  "Primary 3": "Primary",
  "Primary 4": "Primary",
  "Primary 5": "Primary",
  "Primary 6": "Primary",
  "JSS 1": "Junior Secondary",
  "JSS 2": "Junior Secondary",
  "JSS 3": "Junior Secondary",
  "SSS 1 - Science": "Science",
  "SSS 1 - Arts": "Arts",
  "SSS 1 - Commerce": "Commerce",
  "SSS 2 - Science": "Science",
  "SSS 2 - Arts": "Arts",
  "SSS 2 - Commerce": "Commerce",
  "SSS 3 - Science": "Science",
  "SSS 3 - Arts": "Arts",
  "SSS 3 - Commerce": "Commerce",
}

export const CLASS_BROAD_SECTION: Record<string, string> = {
  "Nursery 1": "Nursery",
  "Nursery 2": "Nursery",
  "Primary 1": "Primary",
  "Primary 2": "Primary",
  "Primary 3": "Primary",
  "Primary 4": "Primary",
  "Primary 5": "Primary",
  "Primary 6": "Primary",
  "JSS 1": "JSS",
  "JSS 2": "JSS",
  "JSS 3": "JSS",
  "SSS 1 - Science": "SSS",
  "SSS 1 - Arts": "SSS",
  "SSS 1 - Commerce": "SSS",
  "SSS 2 - Science": "SSS",
  "SSS 2 - Arts": "SSS",
  "SSS 2 - Commerce": "SSS",
  "SSS 3 - Science": "SSS",
  "SSS 3 - Arts": "SSS",
  "SSS 3 - Commerce": "SSS",
}

// --- SUBJECTS per section (comprehensive Nigerian curriculum) ---
export const SUBJECTS_NURSERY = [
  { name: "Number Work", code: "NUM" },
  { name: "Letter Work", code: "LET" },
  { name: "General Science", code: "GSC" },
  { name: "Social Habits", code: "SOH" },
  { name: "Health Habits", code: "HHB" },
  { name: "Writing", code: "WRI" },
  { name: "Rhymes & Phonics", code: "RHY" },
  { name: "Creative Arts", code: "CAT" },
  { name: "Physical Development", code: "PED" },
  { name: "Moral Instruction", code: "MOR" },
]

export const SUBJECTS_PRIMARY = [
  { name: "Mathematics", code: "MTH" },
  { name: "English Language", code: "ENG" },
  { name: "Basic Science", code: "BSC" },
  { name: "Social Studies", code: "SST" },
  { name: "Agricultural Science", code: "AGR" },
  { name: "Home Economics", code: "HEC" },
  { name: "Civic Education", code: "CVE" },
  { name: "Physical & Health Education", code: "PHE" },
  { name: "Computer Studies", code: "COM" },
  { name: "Christian Religious Studies", code: "CRS" },
  { name: "Yoruba Language", code: "YOR" },
  { name: "Creative Arts", code: "CAT" },
  { name: "Music", code: "MUS" },
  { name: "Quantitative Reasoning", code: "QUR" },
  { name: "Verbal Reasoning", code: "VER" },
]

export const SUBJECTS_JSS = [
  { name: "Mathematics", code: "MTH" },
  { name: "English Language", code: "ENG" },
  { name: "Integrated Science", code: "ISC" },
  { name: "Social Studies", code: "SST" },
  { name: "Agricultural Science", code: "AGR" },
  { name: "Civic Education", code: "CVE" },
  { name: "Physical & Health Education", code: "PHE" },
  { name: "Computer Studies", code: "COM" },
  { name: "Christian Religious Studies", code: "CRS" },
  { name: "Business Studies", code: "BUS" },
  { name: "Home Economics", code: "HEC" },
  { name: "Basic Technology", code: "BTE" },
  { name: "French", code: "FRN" },
  { name: "Yoruba Language", code: "YOR" },
  { name: "Creative Arts", code: "CAT" },
  { name: "Quantitative Reasoning", code: "QUR" },
  { name: "Verbal Reasoning", code: "VER" },
]

export const SUBJECTS_SSS_SCIENCE = [
  { name: "Mathematics", code: "MTH" },
  { name: "English Language", code: "ENG" },
  { name: "Biology", code: "BIO" },
  { name: "Chemistry", code: "CHM" },
  { name: "Physics", code: "PHY" },
  { name: "Further Mathematics", code: "FMH" },
  { name: "Agricultural Science", code: "AGR" },
  { name: "Computer Studies", code: "COM" },
  { name: "Christian Religious Studies", code: "CRS" },
  { name: "Yoruba Language", code: "YOR" },
  { name: "Physical & Health Education", code: "PHE" },
  { name: "Data Processing", code: "DAP" },
]

export const SUBJECTS_SSS_ARTS = [
  { name: "Mathematics", code: "MTH" },
  { name: "English Language", code: "ENG" },
  { name: "Literature-in-English", code: "LIT" },
  { name: "Government", code: "GOV" },
  { name: "Christian Religious Studies", code: "CRS" },
  { name: "Yoruba Language", code: "YOR" },
  { name: "Economics", code: "ECO" },
  { name: "History", code: "HIS" },
  { name: "Geography", code: "GEO" },
  { name: "Commerce", code: "COM" },
  { name: "Physical & Health Education", code: "PHE" },
  { name: "French", code: "FRN" },
]

export const SUBJECTS_SSS_COMMERCE = [
  { name: "Mathematics", code: "MTH" },
  { name: "English Language", code: "ENG" },
  { name: "Economics", code: "ECO" },
  { name: "Commerce", code: "COM" },
  { name: "Accounting", code: "ACC" },
  { name: "Business Studies", code: "BUS" },
  { name: "Christian Religious Studies", code: "CRS" },
  { name: "Geography", code: "GEO" },
  { name: "Government", code: "GOV" },
  { name: "Yoruba Language", code: "YOR" },
  { name: "Physical & Health Education", code: "PHE" },
  { name: "Data Processing", code: "DAP" },
]

export function getSubjectsForClass(className: string) {
  const sec = CLASS_BROAD_SECTION[className]
  const specific = className.includes(" - ") ? className.split(" - ")[1] : null
  if (sec === "Nursery") return SUBJECTS_NURSERY
  if (sec === "Primary") return SUBJECTS_PRIMARY
  if (sec === "JSS") return SUBJECTS_JSS
  if (sec === "SSS") {
    if (specific === "Science") return SUBJECTS_SSS_SCIENCE
    if (specific === "Arts") return SUBJECTS_SSS_ARTS
    if (specific === "Commerce") return SUBJECTS_SSS_COMMERCE
    return SUBJECTS_SSS_SCIENCE
  }
  return SUBJECTS_PRIMARY
}

// --- NAMES for realistic Nigerian data ---
export const NIGERIAN_FIRST_NAMES_MALE = [
  "Chidi", "Emeka", "Oluwaseun", "Tunde", "Musa", "Kelechi", "Segun",
  "Ayobami", "Chibueze", "Damilola", "Ebere", "Femi", "Goke", "Ifeanyi",
  "Jibril", "Kunle", "Lateef", "Nnamdi", "Obinna", "Peter", "Rasheed",
  "Suleiman", "Uche", "Wale", "Yusuf", "Zubair", "Chukwudi", "Dele",
  "Ekene", "Francis", "Gabriel", "Henry", "Ikenna", "John", "Kayode",
  "Lukman", "Michael", "Ndubuisi", "Okey", "Paul", "Quadri", "Rilwan",
  "Samuel", "Tobi", "Umar", "Victor", "Williams", "Yemi", "Abdullahi",
  "Bashir", "Chibuzo", "Daniel", "Ebuka", "Faruq", "Gideon",
]

export const NIGERIAN_FIRST_NAMES_FEMALE = [
  "Chioma", "Aisha", "Folake", "Ngozi", "Yetunde", "Zainab", "Bisi",
  "Chidinma", "Damilola", "Ezinne", "Funke", "Gloria", "Hadiza",
  "Ijeoma", "Joy", "Kemi", "Lola", "Maryam", "Nkechi", "Opeyemi",
  "Patience", "Queen", "Roseline", "Sade", "Tolani", "Ujunwa",
  "Victoria", "Wumi", "Yewande", "Amaka", "Bolanle", "Chiamaka",
  "Deborah", "Esther", "Favour", "Grace", "Hannah", "Immaculate",
  "Janet", "Khadija", "Loveth", "Mercy", "Nancy", "Olivia",
  "Priscilla", "Ruth", "Sarah", "Temitope", "Ugochi", "Veronica",
  "Blessing", "Cynthia", "Diana", "Eunice", "Faith", "Gift",
]

export const NIGERIAN_LAST_NAMES = [
  "Okafor", "Abubakar", "Adebayo", "Ogunlade", "Okonkwo", "Bello",
  "Eze", "Olawale", "Nwachukwu", "Yusuf", "Adeyemi", "Okafor",
  "Ibrahim", "Oluwole", "Ekene", "Mohammed", "Okoro", "Adegoke",
  "Chukwu", "Oyedele", "Suleiman", "Nwosu", "Akinlade", "Obi",
  "Mensah", "Ogundele", "Umeh", "Babatunde", "Emenike", "Ogunbiyi",
  "Kalu", "Oladipo", "Ugwu", "Adedoyin", "Enyi", "Ogunyemi",
  "Nnadi", "Adebisi", "Okeke", "Afolabi", "Nnamani", "Adegbola",
  "Igwe", "Ogunseye", "Uba", "Adeleke", "Egbuna", "Ogunleye",
  "Nwachukwu", "Adeniran", "Okafor", "Akinyemi", "Opara", "Adeosun",
]

export const NIGERIAN_CITIES = [
  "Ikeja, Lagos", "Enugu", "Kano", "Ibadan", "Abuja", "Port Harcourt",
  "Aba", "Onitsha", "Warri", "Benin City", "Kaduna", "Jos",
  "Maiduguri", "Ilorin", "Oyo", "Sokoto", "Uyo", "Calabar",
  "Owerri", "Akure", "Lokoja", "Minna", "Makurdi", "Bauchi",
  "Yola", "Gombe", "Damaturu", "Osogbo", "Ado Ekiti", "Abeokuta",
]

// --- ACADEMIC ---
export const CURRENT_SESSION = "2024/2025"
export const CURRENT_TERM = "First Term"
export const TERM_NAMES = ["First Term", "Second Term", "Third Term"]

// --- TEACHERS (5 subject-area specialists) ---
export const TEACHER_DATA = [
  {
    firstName: "Chidi",
    lastName: "Okonkwo",
    email: "chidi.okonkwo@royalkiddies.edu.ng",
    role: "teacher",
    department: "Mathematics",
    qualification: "B.Sc. Mathematics Education",
    gender: "Male",
    phone: "+234 802 111 0001",
    subjects: ["Mathematics", "Number Work"],
  },
  {
    firstName: "Aisha",
    lastName: "Abubakar",
    email: "aisha.abubakar@royalkiddies.edu.ng",
    role: "teacher",
    department: "Languages",
    qualification: "B.A. English Language",
    gender: "Female",
    phone: "+234 802 111 0002",
    subjects: ["English Language", "Letter Work", "Literature-in-English"],
  },
  {
    firstName: "Folake",
    lastName: "Adebayo",
    email: "folake.adebayo@royalkiddies.edu.ng",
    role: "teacher",
    department: "Science",
    qualification: "B.Sc. Biology",
    gender: "Female",
    phone: "+234 802 111 0003",
    subjects: ["Basic Science", "Integrated Science", "Biology", "Chemistry", "Physics", "General Science"],
  },
  {
    firstName: "Segun",
    lastName: "Ogunlade",
    email: "segun.ogunlade@royalkiddies.edu.ng",
    role: "teacher",
    department: "Arts & Social Sciences",
    qualification: "B.Sc. Social Studies",
    gender: "Male",
    phone: "+234 802 111 0004",
    subjects: ["Social Studies", "Government", "Social Habits", "Economics", "Commerce", "Christian Religious Studies"],
  },
  {
    firstName: "Ngozi",
    lastName: "Eze",
    email: "ngozi.eze@royalkiddies.edu.ng",
    role: "teacher",
    department: "Agriculture & Vocational",
    qualification: "B.Sc. Agricultural Science",
    gender: "Female",
    phone: "+234 802 111 0005",
    subjects: ["Agricultural Science", "Accounting", "Health & Physical Education"],
  },
]

export const ADMIN_DATA = {
  firstName: "Admin",
  lastName: "User",
  email: "admin@skoolar.org",
  role: "admin",
  department: "Administration",
  qualification: "M.Ed. Educational Administration",
  gender: "Male",
  phone: "+234 800 000 0001",
}

// --- PARENT DATA ---
export const PARENT_DATA = [
  { firstName: "Emeka", lastName: "Okafor", email: "emeka.okafor@email.com", phone: "+234 803 100 0001" },
  { firstName: "Yetunde", lastName: "Adebayo", email: "yetunde.adebayo@email.com", phone: "+234 803 100 0002" },
  { firstName: "Musa", lastName: "Bello", email: "musa.bello@email.com", phone: "+234 803 100 0003" },
  { firstName: "Chioma", lastName: "Nwachukwu", email: "chioma.nwachukwu@email.com", phone: "+234 803 100 0004" },
  { firstName: "Tunde", lastName: "Olawale", email: "tunde.olawale@email.com", phone: "+234 803 100 0005" },
  { firstName: "Aisha", lastName: "Mohammed", email: "aisha.mohammed@email.com", phone: "+234 803 100 0006" },
  { firstName: "Kelechi", lastName: "Eze", email: "kelechi.eze@email.com", phone: "+234 803 100 0007" },
  { firstName: "Folake", lastName: "Ogunlade", email: "folake.ogunlade@email.com", phone: "+234 803 100 0008" },
  { firstName: "Nnamdi", lastName: "Okonkwo", email: "nnamdi.okonkwo@email.com", phone: "+234 803 100 0009" },
  { firstName: "Zainab", lastName: "Yusuf", email: "zainab.yusuf@email.com", phone: "+234 803 100 0010" },
  { firstName: "Chibueze", lastName: "Ibrahim", email: "chibueze.ibrahim@email.com", phone: "+234 803 100 0011" },
  { firstName: "Funke", lastName: "Adeyemi", email: "funke.adeyemi@email.com", phone: "+234 803 100 0012" },
  { firstName: "Damilola", lastName: "Ogundele", email: "damilola.ogundele@email.com", phone: "+234 803 100 0013" },
  { firstName: "Suleiman", lastName: "Kalu", email: "suleiman.kalu@email.com", phone: "+234 803 100 0014" },
  { firstName: "Grace", lastName: "Obi", email: "grace.obi@email.com", phone: "+234 803 100 0015" },
  { firstName: "Peter", lastName: "Mensah", email: "peter.mensah@email.com", phone: "+234 803 100 0016" },
  { firstName: "Ruth", lastName: "Nwosu", email: "ruth.nwosu@email.com", phone: "+234 803 100 0017" },
  { firstName: "Gabriel", lastName: "Ugwu", email: "gabriel.ugwu@email.com", phone: "+234 803 100 0018" },
  { firstName: "Blessing", lastName: "Adebisi", email: "blessing.adebisi@email.com", phone: "+234 803 100 0019" },
  { firstName: "Henry", lastName: "Okeke", email: "henry.okeke@email.com", phone: "+234 803 100 0020" },
]

// --- TIMETABLE SLOTS ---
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
export const TIME_SLOTS = [
  { start: "08:00", end: "08:40" },
  { start: "08:40", end: "09:20" },
  { start: "09:20", end: "10:00" },
  { start: "10:00", end: "10:30", break: true },
  { start: "10:30", end: "11:10" },
  { start: "11:10", end: "11:50" },
  { start: "11:50", end: "12:30" },
  { start: "12:30", end: "13:10", break: true },
  { start: "13:10", end: "13:50" },
]

// --- GRADE BOUNDARIES ---
export const GRADE_BOUNDARIES = [
  { min: 75, grade: "A", remark: "Excellent" },
  { min: 65, grade: "B", remark: "Very Good" },
  { min: 55, grade: "C", remark: "Good" },
  { min: 45, grade: "D", remark: "Fair" },
  { min: 0, grade: "F", remark: "Needs Improvement" },
]

export function getGradeAndRemark(score: number, total: number = 100) {
  const pct = (score / total) * 100
  for (const b of GRADE_BOUNDARIES) {
    if (pct >= b.min) return { grade: b.grade, remark: b.remark }
  }
  return { grade: "F", remark: "Needs Improvement" }
}

// --- DOMAINS (affective/psychomotor) for report cards ---
export const REPORT_DOMAINS = [
  { name: "Punctuality", max: 10 },
  { name: "Neatness", max: 10 },
  { name: "Attentiveness", max: 10 },
  { name: "Honesty", max: 10 },
  { name: "Leadership", max: 10 },
]
