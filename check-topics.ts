import { CLASS_BROAD_SECTION } from "./src/seed/data";
import { resetIdCounter, nextId } from "./src/seed/generators";
import { generateAllQuestions } from "./src/seed/questions";

resetIdCounter();

const classes = [
  { id: "c1", name: "Nursery 1" },
  { id: "c2", name: "Primary 3" },
  { id: "c3", name: "JSS 2" },
  { id: "c4", name: "SSS 1 - Science" },
];

const subjects: { id: string; name: string; classId: string }[] = [];
for (const c of classes) {
  const sec = CLASS_BROAD_SECTION[c.name];
  if (sec === "Nursery") {
    subjects.push({ id: c.id + "_m", name: "Number Work", classId: c.id });
    subjects.push({ id: c.id + "_e", name: "Letter Work", classId: c.id });
  } else {
    subjects.push({ id: c.id + "_m", name: "Mathematics", classId: c.id });
    subjects.push({ id: c.id + "_e", name: "English Language", classId: c.id });
  }
}

const qs = generateAllQuestions(classes, subjects, "admin");
const topicCount: Record<string, number> = {};
const generalMath: string[] = [];
const generalEng: string[] = [];

for (const q of qs) {
  topicCount[q.topic] = (topicCount[q.topic] || 0) + 1;
  if ((q.topic as string) === "General Mathematics") generalMath.push(q.text);
  if ((q.topic as string) === "General English") generalEng.push(q.text);
}

console.log("=== TOPIC DISTRIBUTION ===");
Object.entries(topicCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([topic, count]) => {
    console.log(`  ${topic}: ${count}`);
  });
console.log(`\nTotal questions: ${qs.length}`);
console.log(
  `\n=== "General Mathematics" questions (${generalMath.length}) ===`
);
generalMath.forEach((t) => console.log(t.substring(0, 80)));
console.log(
  `\n=== "General English" questions (${generalEng.length}) ===`
);
generalEng.forEach((t) => console.log(t.substring(0, 80)));
