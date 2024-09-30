// استيراد المكتبات المطلوبة
const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

require("dotenv").config(); // تحميل متغيرات البيئة من ملف .env

const app = express();
const PORT = process.env.PORT || 3800; // استخدام منفذ من المتغيرات البيئية

// إعداد multer لتحميل الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // تأكد من إنشاء مجلد باسم uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // تسمية الملفات
  },
});

const upload = multer({ storage: storage });

// إعداد معالجة بيانات الطلبات
app.use(express.json());
app.use(cors()); // السماح بطلبات من جميع المصادر

app.use(express.urlencoded({ extended: true }));

// إعداد nodemailer باستخدام متغيرات البيئة
const transporter = nodemailer.createTransport({  service: process.env.EMAIL_SERVICE || "gmail", // خدمة البريد الإلكتروني
  auth: {
    user: process.env.EMAIL_USER, // بريدك الإلكتروني من المتغيرات البيئية
    pass: process.env.EMAIL_PASS, // كلمة مرور بريدك من المتغيرات البيئية
  },
});

// نقطة نهاية لاستلام بيانات الاستمارة
app.post("/send-form", upload.single("file"), async (req, res) => {
  try {
    const { name, email, option } = req.body;
    const file = req.file ? req.file.path : "";

    // إعداد الرسالة
    const mailOptions = {
      from: process.env.EMAIL_FROM || "example@gmail.com", // البريد المرسل منه
      to: process.env.EMAIL_TO || "example@domain.com", // البريد الذي ستستلم عليه البيانات
      subject: "New Form Submission",
      text: `You have a new submission:\n\nName: ${name}\nEmail: ${email}\nProblem: ${option}\n`,
      attachments: file ? [{ path: file }] : [], // إرفاق الملف إذا وُجد
    };

    // إرسال البريد الإلكتروني
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    res.send("Form submitted successfully!");
  } catch (error) {
    console.log("Error sending email:", error);
    res.status(500).send("Error sending email");
  }
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
