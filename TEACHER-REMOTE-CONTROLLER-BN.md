# Teacher Remote Controller

## কীভাবে ব্যবহার করবেন

1. Teacher PC-তে live quiz চালু করুন এবং `/host/<PIN>` projector-এ রাখুন।
2. একই Teacher account দিয়ে মোবাইলে `/teacher/controller/<PIN>` খুলুন।
3. মোবাইল থেকে Start, Next, Previous, Pause, Resume, Reveal, Leaderboard, +10/+30 sec এবং End নিয়ন্ত্রণ করুন।
4. প্রতিটি command একই live session-এ broadcast হবে; projector ও student screens real-time update হবে।

## Local XAMPP / Mobile Hotspot

PC ও mobile একই hotspot/Wi-Fi-তে রাখুন। PC-এর `ipconfig` থেকে IPv4 address নিন।

```bash
npm run dev -- --hostname 0.0.0.0
```

তারপর mobile-এ, উদাহরণ:

`http://192.168.43.125:3000/teacher/controller/482913`

PC-তে যদি `localhost` দিয়ে project খোলা থাকে, mobile থেকে `localhost` ব্যবহার করবেন না। PC-এর LAN IPv4 ব্যবহার করবেন।

## নিরাপত্তা

Remote controller route authenticated teacher/staff session-এর মধ্যে সীমাবদ্ধ। Live API-ও session ownership/role যাচাই করে। Student controller ব্যবহার করতে পারবে না।
