const ADJECTIVES = [
  "স্মার্ট", "দ্রুত", "ঝলমলে", "চটপটে", "বুদ্ধিমান", "দারুণ", "চ্যাম্পিয়ন", "কৌতূহলী",
  "সাহসী", "হাসিখুশি", "বিজয়ী", "তীক্ষ্ণ", "ফাস্ট", "সুপার", "স্টার"
];
const ANIMALS = [
  "পান্ডা", "ঈগল", "বাঘ", "শিয়াল", "ডলফিন", "খরগোশ", "পেঙ্গুইন", "হাতি",
  "বাজপাখি", "সিংহ", "জিরাফ", "প্রজাপতি", "ড্রাগন", "রোবট", "রকেট"
];

export function generateNickname() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const number = Math.floor(10 + Math.random() * 90);
  return `${adjective} ${animal} ${number}`;
}
