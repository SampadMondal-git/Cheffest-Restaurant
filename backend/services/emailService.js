import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendResetEmail(email, link) {
  const templatePath = path.join(
    process.cwd(),
    "templates/resetPassword.template.html"
  );

  let html = await fs.promises.readFile(templatePath, "utf8");

  html = html.replace(/{{RESET_LINK}}/g, link);

  await transporter.sendMail({
    from: `${process.env.WEBSITE_NAME} <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your password",
    html,
  });
}

export default sendResetEmail;