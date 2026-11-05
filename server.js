require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // phục vụ index.html

// ----- Mô hình dữ liệu (collection "products") -----
const Product = mongoose.model("Product", new mongoose.Schema({
  name:  { type: String, required: true },
  price: { type: Number, required: true },
  tag:   { type: String, default: "" },
  icon:  { type: String, default: "☕" },
}));

// ----- API -----
app.get("/api/products", async (req, res) => {
  res.json(await Product.find().sort({ _id: 1 }));
});

app.post("/api/products", async (req, res) => {
  try {
    res.status(201).json(await Product.create(req.body));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// ----- Kết nối DB rồi mở server -----
async function start() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Đã kết nối MongoDB");

  // Lần đầu chạy: thêm dữ liệu mẫu
  if ((await Product.countDocuments()) === 0) {
    await Product.insertMany([
      { name: "Phin Sữa Đá",   price: 29000, tag: "BÁN CHẠY!", icon: "🧋" },
      { name: "Phin Đen Đá",   price: 29000, tag: "BÁN CHẠY!", icon: "☕" },
      { name: "Bạc Xỉu Đá",    price: 29000, tag: "THỬ NGAY!", icon: "🥛" },
      { name: "Phin Sữa Nóng", price: 29000, icon: "☕" },
      { name: "Phin Đen Nóng", price: 29000, icon: "☕" },
    ]);
    console.log("Đã thêm dữ liệu mẫu");
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Mở http://localhost:${port}`));
}
start().catch(err => { console.error("Lỗi kết nối MongoDB:", err.message); process.exit(1); });
