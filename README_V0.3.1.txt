RAFIQ LAND SURVEY CAD — V0.3.1 PATCH
====================================

এই ZIP সম্পূর্ণ অ্যাপ নয়; এটি আপনার বর্তমান GitHub V0.3 ফাইলের জন্য সংশোধনী প্যাচ।
আপনার আগের index.html, app.js, style.css, manifest.json, sw.js, logo.png রেখে দিন।

১) app.js
- `function cross(a,b,c,d)` থেকে শুরু করে `$("trimBtn").onclick...` পর্যন্ত পুরোনো Trim/Extend অংশটি খুঁজুন।
- ওই অংশটি বাদ দিয়ে `APP_JS_TRIM_EXTEND_REPLACEMENT.txt`-এর সম্পূর্ণ কোড বসান।
- পুরোনো `$("menuBtn").onclick=...` লাইনটি খুঁজে `APP_JS_MOBILE_MENU_REPLACEMENT.txt`-এর কোড বসান।
- একই নামে আগের Trim/Extend click handler যেন আর না থাকে।

২) style.css
- ফাইলের একদম শেষে `MOBILE_PANEL_CSS.txt`-এর CSS যোগ করুন।

৩) GitHub
- app.js ও style.css commit করুন।
- ওয়েবসাইটে গিয়ে মোবাইলে উপরের ⋮ বোতাম চাপুন। ডান পাশের Properties প্যানেল খুলবে।
- সেখানে Modify Tools এবং Add Layer ব্যবহার করা যাবে.

Trim: নির্বাচিত LINE-এর A/B প্রান্ত থেকে, রেখার ভেতরের দিকে প্রথম ছেদবিন্দুতে কাটবে।
Extend: নির্বাচিত LINE-এর A/B প্রান্ত থেকে, রেখার বাইরের দিকে প্রথম ছেদবিন্দু পর্যন্ত বাড়াবে।
দুই ক্ষেত্রেই অন্য অবজেক্টের রেখা/সীমানার সঙ্গে ছেদ থাকা প্রয়োজন।

গুরুত্বপূর্ণ:
- Trim/Extend এখনও 2D drafting-এর সাধারণ segment intersection; complex CAD topology, curve trimming বা legal survey validation নয়।
- মোবাইল প্যানেল ⋮ বোতাম দিয়ে খোলা/বন্ধ হবে।
- পরিবর্তনের আগে GitHub-এ বর্তমান ফাইলগুলোর backup রেখে দিন।
