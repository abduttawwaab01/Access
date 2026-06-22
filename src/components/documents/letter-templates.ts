export interface LetterData {
  studentName: string
  studentId: string
  studentClass: string
  reference: string
  createdAt: string
  schoolName: string
  schoolMotto: string
  schoolAddress: string
  schoolPhone: string
  schoolEmail: string
  schoolLogo: string
}

export interface EditableLetterData extends LetterData {
  subject?: string
  body?: string
  recipient?: string
  salutation?: string
  closing?: string
  signatory?: string
  signatoryTitle?: string
  additionalFields?: Record<string, string>
}

export interface LetterTemplateDef {
  id: string
  type: string
  name: string
  category: "academic" | "disciplinary" | "administrative" | "certification" | "finance"
  description: string
  icon: string
  color: string
}

export const LETTER_TEMPLATES: LetterTemplateDef[] = [
  { id: "acceptance", type: "acceptance", name: "Admission Acceptance", category: "academic", description: "Offer provisional admission to a student", icon: "GraduationCap", color: "from-blue-600 to-blue-500" },
  { id: "transfer", type: "transfer", name: "Transfer / Withdrawal", category: "administrative", description: "Release student for transfer to another school", icon: "ArrowRightLeft", color: "from-violet-600 to-violet-500" },
  { id: "suspension", type: "suspension", name: "Suspension Letter", category: "disciplinary", description: "Notify parents of student suspension", icon: "Ban", color: "from-red-600 to-red-500" },
  { id: "query", type: "query", name: "Query Letter", category: "disciplinary", description: "Issue a query to a student for misconduct", icon: "HelpCircle", color: "from-orange-600 to-orange-500" },
  { id: "warning", type: "warning", name: "Warning Letter", category: "disciplinary", description: "Issue a formal warning to a student", icon: "AlertTriangle", color: "from-amber-600 to-amber-500" },
  { id: "recommendation", type: "recommendation", name: "Recommendation Letter", category: "certification", description: "Provide a recommendation for a student", icon: "ThumbsUp", color: "from-emerald-600 to-emerald-500" },
  { id: "transcript", type: "transcript", name: "Transcript Request", category: "certification", description: "Acknowledge request for academic transcript", icon: "FileText", color: "from-teal-600 to-teal-500" },
  { id: "fee_reminder", type: "fee_reminder", name: "Fee Reminder", category: "finance", description: "Remind parents about outstanding fees", icon: "CreditCard", color: "from-rose-600 to-rose-500" },
  { id: "job_acceptance", type: "job_acceptance", name: "Job Acceptance Letter", category: "administrative", description: "Accept a job offer from the school", icon: "Briefcase", color: "from-indigo-600 to-indigo-500" },
  { id: "resumption", type: "resumption", name: "Resumption Letter", category: "academic", description: "Notify parents about school resumption date", icon: "Calendar", color: "from-cyan-600 to-cyan-500" },
  { id: "event_invitation", type: "event_invitation", name: "Event Invitation", category: "academic", description: "Invite parents/students to school events", icon: "PartyPopper", color: "from-pink-600 to-pink-500" },
  { id: "character_cert", type: "character_cert", name: "Character Certificate", category: "certification", description: "Certify a student's good character", icon: "Award", color: "from-yellow-600 to-yellow-500" },
]

export function getDefaultLetterContent(type: string, schoolName: string): { subject: string; body: string; recipient: string; salutation: string; closing: string; signatory: string; signatoryTitle: string } {
  const defaults: Record<string, { subject: string; body: string; recipient: string; salutation: string; closing: string; signatory: string; signatoryTitle: string }> = {
    acceptance: {
      subject: "Letter of Acceptance",
      recipient: "The Parent/Guardian",
      salutation: "Dear Parent/Guardian,",
      body: `We are pleased to inform you that your ward has been offered provisional admission into our institution for the upcoming academic session.\n\nThis offer is subject to the following conditions:\n1. Completion and return of the attached acceptance form within two weeks of receipt of this letter.\n2. Payment of the required acceptance fee and first term school fees as specified in the attached fee schedule.\n3. Submission of original copies of all academic credentials and birth certificate for verification.\n4. All new students must attend the orientation programme scheduled for the first week of the term.\n\nWe are confident that your ward will find their time at ${schoolName} both rewarding and fulfilling. Our dedicated staff and comprehensive curriculum are designed to nurture academic excellence, character development, and leadership skills.\n\nPlease note that this admission is provisional and may be withdrawn if any information provided during the application process is found to be false or misleading.`,
      closing: "Yours faithfully,",
      signatory: "Principal",
      signatoryTitle: "Principal",
    },
    transfer: {
      subject: "Letter of Transfer / Withdrawal",
      recipient: "The Principal",
      salutation: "Dear Sir/Ma'am,",
      body: `This is to certify that the student named herein was a student of this institution.\n\nDuring their time at our institution, the student demonstrated commendable character and academic diligence. We have no record of any disciplinary issues or outstanding financial obligations.\n\nWe wish the student the very best in their future academic endeavours and trust that they will continue to uphold the values and standards instilled during their time at ${schoolName}.\n\nThis transfer letter is issued upon the request of the parent/guardian for the purpose of transferring to another educational institution.`,
      closing: "Yours faithfully,",
      signatory: "Principal",
      signatoryTitle: "Principal",
    },
    suspension: {
      subject: "Student Suspension Notice",
      recipient: "The Parent/Guardian",
      salutation: "Dear Parent/Guardian,",
      body: `I am writing to inform you that your ward has been suspended from ${schoolName} effective immediately.\n\nThe suspension is as a result of the student's involvement in the following:\n1. [Describe the incident or misconduct here]\n2. [Additional details if applicable]\n\nThe suspension period is [duration] school days, during which the student is expected to remain at home. The student must not be found on the school premises during this period.\n\nDuring the suspension, the student is expected to:\n- Complete any pending assignments or homework\n- Reflect on their actions and prepare a written apology letter\n- Maintain good conduct at all times\n\nThe student is expected to resume school on [resumption date]. Please ensure that your ward reports to the school office upon return.\n\nWe strongly advise that you monitor your ward's activities during this period and ensure that such behaviour is not repeated. Please note that any further misconduct may result in more severe disciplinary action, including permanent expulsion.\n\nWe are available to discuss this matter further if you have any concerns.`,
      closing: "Yours faithfully,",
      signatory: "Principal",
      signatoryTitle: "Principal",
    },
    query: {
      subject: "Query Letter",
      recipient: "The Parent/Guardian",
      salutation: "Dear Parent/Guardian,",
      body: `We are writing to bring to your attention a matter of concern regarding your ward's conduct at ${schoolName}.\n\nThe following incident(s) have been reported:\n1. [Describe the incident or misconduct here]\n2. [Additional details if applicable]\n\nYour ward has been given the opportunity to explain their side of the story. The student's response has been considered, but we believe further clarification is needed.\n\nWe kindly request that you:\n1. Discuss this matter with your ward at home\n2. Visit the school on [date] to meet with the class teacher and administration\n3. Provide any relevant information that may help resolve this matter\n\nPlease note that this query does not constitute a punishment. It is a formal process to ensure that we understand all perspectives before making any decisions.\n\nWe value your partnership in your child's education and look forward to resolving this matter amicably.`,
      closing: "Yours faithfully,",
      signatory: "Principal",
      signatoryTitle: "Principal",
    },
    warning: {
      subject: "Formal Warning Letter",
      recipient: "The Parent/Guardian",
      salutation: "Dear Parent/Guardian,",
      body: `This letter serves as a formal warning regarding your ward's conduct at ${schoolName}.\n\nThe following issues have been observed:\n1. [Describe the issue here]\n2. [Additional details if applicable]\n\nDespite previous verbal warnings and counselling sessions, the student continues to exhibit the same behaviour. This is unacceptable and contrary to the values and standards of our institution.\n\nPlease note that:\n- This is an official warning that will be recorded in the student's file\n- Any further misconduct will result in more severe disciplinary action\n- The school reserves the right to take further action if the behaviour persists\n\nWe urge you to have a serious discussion with your ward about their behaviour and the consequences of continued misconduct. Your cooperation in ensuring proper conduct is essential.\n\nWe are committed to working with you to help your child develop into a responsible individual.`,
      closing: "Yours faithfully,",
      signatory: "Principal",
      signatoryTitle: "Principal",
    },
    recommendation: {
      subject: "Letter of Recommendation",
      recipient: "To Whom It May Concern",
      salutation: "To Whom It May Concern,",
      body: `I am pleased to recommend the above-named student for your consideration.\n\nDuring their time at ${schoolName}, the student has consistently demonstrated exceptional academic performance, strong character traits, and active participation in school activities.\n\nThe student's key strengths include:\n- Outstanding academic achievement\n- Excellent moral character and integrity\n- Strong leadership and teamwork skills\n- Active participation in extracurricular activities\n- Punctuality and reliability\n\nI am confident that the student will be a valuable addition to any institution or programme they choose to pursue. I recommend them without reservation.\n\nShould you require any further information, please do not hesitate to contact the school.`,
      closing: "Yours sincerely,",
      signatory: "Principal",
      signatoryTitle: "Principal",
    },
    transcript: {
      subject: "Academic Transcript",
      recipient: "The Parent/Guardian",
      salutation: "Dear Parent/Guardian,",
      body: `This is to acknowledge receipt of your request for your ward's academic transcript.\n\nThe requested transcript has been prepared and is attached herewith. Please note the following:\n- This transcript is an official document of ${schoolName}\n- It contains the student's complete academic record for the specified period\n- This document is confidential and should be handled accordingly\n- Any alteration or modification of this document is strictly prohibited\n\nPlease ensure that you handle this document with care. A replacement fee may apply for any future requests.\n\nThank you for your patience.`,
      closing: "Yours faithfully,",
      signatory: "Principal",
      signatoryTitle: "Principal",
    },
    fee_reminder: {
      subject: "Outstanding Fee Reminder",
      recipient: "The Parent/Guardian",
      salutation: "Dear Parent/Guardian,",
      body: `We write to remind you of the outstanding fees owed to ${schoolName}.\n\nOur records indicate that your ward has an outstanding balance that needs to be settled. We kindly request that you make payment as soon as possible.\n\nPlease note:\n1. Late payment may attract additional charges\n2. Students with outstanding fees may be restricted from certain school activities\n3. Persistent non-payment may result in suspension from school\n\nWe understand that financial difficulties may arise, and we are willing to discuss possible payment arrangements if needed. Please contact the school bursar to discuss any concerns.\n\nWe appreciate your prompt attention to this matter.`,
      closing: "Yours faithfully,",
      signatory: "Bursar",
      signatoryTitle: "Bursar",
    },
    job_acceptance: {
      subject: "Job Acceptance Letter",
      recipient: "The Management",
      salutation: "Dear Sir/Ma'am,",
      body: `I am writing to formally accept the position of [Position] at ${schoolName}, as offered to me on [Date of Offer Letter].\n\nI am pleased to accept the terms and conditions of employment as outlined in the offer letter, including:\n- Position: [Position]\n- Department: [Department]\n- Start Date: [Start Date]\n- Salary: [Salary]\n\nI am committed to fulfilling my responsibilities to the best of my abilities and contributing positively to the growth and development of the school. I look forward to working with the team and upholding the values and standards of ${schoolName}.\n\nPlease let me know if there are any additional documents or formalities required before my resumption date.\n\nThank you for this opportunity.`,
      closing: "Yours faithfully,",
      signatory: "[Staff Name]",
      signatoryTitle: "[Position]",
    },
    resumption: {
      subject: "School Resumption Notice",
      recipient: "The Parent/Guardian",
      salutation: "Dear Parent/Guardian,",
      body: `I am pleased to inform you that ${schoolName} will resume for the [Term] term on [Resumption Date].\n\nPlease take note of the following important information:\n1. School resumes on [Resumption Date]\n2. School fees should be paid before or on the resumption date\n3. Students are expected to arrive in proper school uniform\n4. All school materials and textbooks should be brought on resumption day\n5. Students must bring their school ID cards\n\nThe academic calendar for the term will be communicated shortly. Parents are encouraged to ensure their wards are well-prepared for the new term.\n\nFor any enquiries, please do not hesitate to contact the school office.\n\nWe look forward to welcoming our students back.`,
      closing: "Yours faithfully,",
      signatory: "Principal",
      signatoryTitle: "Principal",
    },
    event_invitation: {
      subject: "Invitation to School Event",
      recipient: "The Parent/Guardian",
      salutation: "Dear Parent/Guardian,",
      body: `We are delighted to invite you to [Event Name] organized by ${schoolName}.\n\nEvent Details:\n- Date: [Event Date]\n- Time: [Event Time]\n- Venue: [Event Venue]\n- Dress Code: [Dress Code]\n\nThis event promises to be an exciting and enriching experience for both students and parents. We have lined up various activities including:\n- [Activity 1]\n- [Activity 2]\n- [Activity 3]\n\nYour presence and participation will be highly appreciated. Please confirm your attendance by [RSVP Date] to enable us make adequate preparations.\n\nWe look forward to seeing you there.`,
      closing: "Yours faithfully,",
      signatory: "Principal",
      signatoryTitle: "Principal",
    },
    character_cert: {
      subject: "Character Certificate",
      recipient: "To Whom It May Concern",
      salutation: "To Whom It May Concern,",
      body: `This is to certify that the student named herein was a student of ${schoolName} from [Start Date] to [End Date].\n\nDuring their period of study at this institution, the student exhibited exemplary conduct, discipline, and moral character. We have no record of any behavioural or disciplinary issues against the student.\n\nThe student is known to be:\n- Well-behaved and respectful\n- Honest and trustworthy\n- Diligent and hardworking\n- A good team player\n\nThis certificate is issued upon request for the purpose of [Purpose].\n\nWe wish the student continued success in all future endeavours.`,
      closing: "Yours faithfully,",
      signatory: "Principal",
      signatoryTitle: "Principal",
    },
  }

  return defaults[type] || defaults.acceptance
}

export function getTemplateAccentColor(type: string): string {
  const colors: Record<string, string> = {
    acceptance: "#2563eb",
    transfer: "#7c3aed",
    suspension: "#dc2626",
    query: "#ea580c",
    warning: "#d97706",
    recommendation: "#16a34a",
    transcript: "#0d9488",
    fee_reminder: "#e11d48",
    job_acceptance: "#4f46e5",
    resumption: "#0891b2",
    event_invitation: "#db2777",
    character_cert: "#ca8a04",
  }
  return colors[type] || "#2563eb"
}
