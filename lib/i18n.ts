export type Lang = "en" | "gu";

const GU_DIGITS = ["૦","૧","૨","૩","૪","૫","૬","૭","૮","૯"] as const;

export const STR: Record<string, [string, string]> = {
  home: ["Home", "હોમ"],
  employee: ["Employee", "કર્મચારી"],
  employees: ["Employees", "કર્મચારીઓ"],
  production: ["Production", "ઉત્પાદન"],
  reports: ["Reports", "રિપોર્ટ"],
  add: ["Add", "ઉમેરો"],
  dashboard: ["Dashboard", "ડેશબોર્ડ"],
  goodMorning: ["Good morning", "સુપ્રભાત"],
  goodAfternoon: ["Good afternoon", "શુભ બપોર"],
  goodEvening: ["Good evening", "શુભ સાંજ"],
  monthStitches: ["Stitches this month", "આ મહિને કુલ ટાંકા"],
  ofTarget: ["of target", "લક્ષ્યનું"],
  dailyAvg: ["Daily avg", "દૈનિક સરેરાશ"],
  today: ["Today", "આજે"],
  yesterday: ["Yesterday", "ગઈકાલે"],
  stitches: ["stitches", "ટાંકા"],
  stitch: ["Stitch", "ટાંકા"],
  bonus: ["Bonus", "બોનસ"],
  bonusEarned: ["Bonus earned", "મળેલ બોનસ"],
  extra: ["Extra", "વધારાના"],
  entries: ["Entries", "એન્ટ્રીઓ"],
  thisMonth: ["this month", "આ મહિને"],
  activeDays: ["Active days", "સક્રિય દિવસો"],
  totalPayout: ["total payout", "કુલ ચૂકવણી"],
  dailyProduction: ["Daily production", "દૈનિક ઉત્પાદન"],
  last14: ["Last 14 active days", "છેલ્લા ૧૪ સક્રિય દિવસ"],
  bestDay: ["Best day", "શ્રેષ્ઠ દિવસ"],
  shiftSplit: ["Shift split", "પાળી વિભાજન"],
  monthToDate: ["Month to date", "આજ સુધી"],
  day: ["Day", "દિવસ"],
  night: ["Night", "રાત"],
  dayShift: ["Day shift", "દિવસ પાળી"],
  nightShift: ["Night shift", "રાત પાળી"],
  machineUtil: ["Machine utilisation", "મશીન વપરાશ"],
  machine: ["Machine", "મશીન"],
  live: ["Live", "ચાલુ"],
  idle: ["Idle", "બંધ"],
  topPerformers: ["Top performers", "ટોચના કર્મચારી"],
  recentEntries: ["Recent entries", "તાજેતરની એન્ટ્રીઓ"],
  seeAll: ["See all", "બધું જુઓ"],
  pace: ["Pace", "ગતિ"],
  projected: ["Projected month-end", "મહિનાના અંતે અંદાજ"],
  onTrack: ["On track", "લક્ષ્ય તરફ"],
  logEntry: ["Log stitch entry", "ટાંકા એન્ટ્રી નોંધો"],
  quickFill: ["Tap to fill each field", "દરેક ક્ષેત્ર ભરવા ટેપ કરો"],
  selectEmployee: ["Select employee", "કર્મચારી પસંદ કરો"],
  date: ["Date", "તારીખ"],
  other: ["Other", "અન્ય"],
  shift: ["Shift", "પાળી"],
  machineNo: ["Machine no.", "મશીન નં."],
  stitchCount: ["Stitch count", "ટાંકાની સંખ્યા"],
  bonusRange: ["Bonus range", "બોનસ રેન્જ"],
  rate: ["Rate", "દર"],
  perStitch: ["per extra stitch", "વધારાના ટાંકા દીઠ"],
  bonusEngine: ["Bonus engine", "બોનસ એન્જિન"],
  extraStitches: ["Extra stitches", "વધારાના ટાંકા"],
  base: ["Base", "બેઝ"],
  atThisPace: ["at this pace, ~", "આ ગતિએ, ~"],
  perMonth: ["/mo projected", "/મહિને અંદાજ"],
  logged: ["logged", "નોંધાયું"],
  addAnother: ["Add another", "બીજું ઉમેરો"],
  done: ["Done", "પૂર્ણ"],
  save: ["Save", "સાચવો"],
  cancel: ["Cancel", "રદ કરો"],
  saveChanges: ["Save changes", "ફેરફાર સાચવો"],
  search: ["Search employees…", "કર્મચારી શોધો…"],
  teamMembers: ["Team members", "ટીમ સભ્યો"],
  noPhone: ["No phone", "ફોન નથી"],
  salary: ["Salary", "પગાર"],
  joined: ["Joined", "જોડાયા"],
  edit: ["Edit", "ફેરફાર"],
  delete: ["Delete", "કાઢી નાખો"],
  addEmployee: ["Add employee", "કર્મચારી ઉમેરો"],
  monthlyReports: ["Monthly reports", "માસિક રિપોર્ટ"],
  reportCenter: ["Report center", "રિપોર્ટ કેન્દ્ર"],
  payout: ["Payout", "ચૂકવણી"],
  daily: ["Daily", "દૈનિક"],
  machines: ["Machines", "મશીનો"],
  summary: ["Summary", "સારાંશ"],
  savePdf: ["Save PDF", "PDF સાચવો"],
  csv: ["CSV", "CSV"],
  baseSalary: ["Base salary", "મૂળ પગાર"],
  prodBonus: ["Production bonus", "ઉત્પાદન બોનસ"],
  netPayable: ["Net payable", "ચૂકવવાપાત્ર"],
  payoutBreakdown: ["Employee payout breakdown", "કર્મચારી ચૂકવણી વિગત"],
  total: ["Total", "કુલ"],
  welcomeBack: ["Welcome back", "ફરી સ્વાગત છે"],
  signInToContinue: ["Sign in to your workshop", "તમારા વર્કશોપમાં સાઇન ઇન કરો"],
  emailAddress: ["Email address", "ઇમેઇલ સરનામું"],
  password: ["Password", "પાસવર્ડ"],
  rememberMe: ["Remember me", "મને યાદ રાખો"],
  forgot: ["Forgot password?", "પાસવર્ડ ભૂલી ગયા?"],
  signIn: ["Sign in", "સાઇન ઇન"],
  noAccount: ["Don't have an account?", "એકાઉન્ટ નથી?"],
  createOne: ["Create one", "બનાવો"],
  tagline: ["Embroidery production Suite.", "ભરતકામ ઉત્પાદન શુદ્ધ."],
  myProfile: ["My profile", "મારી પ્રોફાઇલ"],
  logout: ["Log out", "લોગ આઉટ"],
  theme: ["Theme", "થીમ"],
  language: ["Language", "ભાષા"],
  records: ["records", "રેકોર્ડ"],
  activeAvg: ["Active avg", "સક્રિય સરેરાશ"],
  target: ["Target", "લક્ષ્ય"],
  name: ["Name", "નામ"],
  phone: ["Phone", "ફોન"],
  confirm: ["Confirm", "પુષ્ટિ"],
  deleteEmployee: ["Delete employee", "કર્મચારી કાઢો"],
  confirmDelete: ["Are you sure you want to delete", "શું તમે ખરેખર કાઢી નાખવા માંગો છો"],
  noEmployees: ["No employees found", "કોઈ કર્મચારી મળ્યા નહીં"],
  noEntries: ["No entries for this date", "આ તારીખ માટે કોઈ એન્ટ્રી નહીં"],
  selectMonth: ["Select month", "મહિનો પસંદ કરો"],
  selectYear: ["Select year", "વર્ષ પસંદ કરો"],
  salaryMgmt: ["Monthly Salary", "માસિક પગાર"],
  leaveDays: ["Leave days", "રજા દિવસ"],
  dailyRate: ["Daily rate", "દૈનિક દર"],
  deduction: ["Deduction", "કપાત"],
  finalSalary: ["Final salary", "અંતિમ પગાર"],
  noSalarySet: ["No salary set", "પગાર સેટ નથી"],
  absent: ["Absent", "ગેરહાજર"],
  fullPay: ["Full pay", "સંપૂર્ણ પગાર"],
};

export function t(key: string, lang: Lang): string {
  const entry = STR[key];
  if (!entry) return key;
  return entry[lang === "gu" ? 1 : 0];
}

export function nums(str: string | number, lang: Lang): string {
  if (lang !== "gu") return String(str);
  return String(str).replace(/[0-9]/g, (d) => GU_DIGITS[+d]);
}

export function fmt(n: number, lang: Lang): string {
  return nums(Math.round(n).toLocaleString("en-IN"), lang);
}

export function money(n: number, lang: Lang): string {
  return "₹" + nums(Math.round(n).toLocaleString("en-IN"), lang);
}

export function greet(lang: Lang): string {
  const h = new Date().getHours();
  return h < 12 ? t("goodMorning", lang) : h < 17 ? t("goodAfternoon", lang) : t("goodEvening", lang);
}

export const BONUS_RANGES = [200, 250, 300, 350, 400] as const;
export const RATES = [0.75, 1, 1.25, 1.5, 2] as const;
