import express from "express";
import cors from "cors";
import routes from "./routes";

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend Express + MySQL berjalan!",
  });
});

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});