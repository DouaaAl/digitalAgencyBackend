const prisma = require('../utils/prisma');
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const forms = await prisma.contactForm.findMany();
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contact forms" });
  }
});

router.post("/", async (req, res) => {
  const { name, lastName, email, phone, message, services } = req.body;

  try {
    const newForm = await prisma.contactForm.create({
      data: {
        name,
        lastName,
        email,
        phone,
        message,
        services,
      },
    });

    res.status(201).json(newForm);
  } catch (err) {
    res.status(400).json({ error: "Failed to create contact form", details: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await prisma.contactForm.delete({ where: { id } });
    res.json({ message: `Deleted contact form with id ${id}` });
  } catch (err) {
    res.status(404).json({ error: "Contact form not found" });
  }
});

router.delete("/", async (req, res) => {
  try {
    await prisma.contactForm.deleteMany({});
    res.json({ message: "All contact forms deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete contact forms" });
  }
});


module.exports = router;
