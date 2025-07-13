const prisma = require('../utils/prisma');
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const posts = await prisma.post.findMany({});
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
});

router.post("/", async (req, res) => {
    try {
        const { title, description, imagesUrls, category, links } = req.body;

        if (
            title && typeof title === "string" &&
            description && typeof description === "string" &&
            Array.isArray(imagesUrls) &&
            category && typeof category === "string" &&
            Array.isArray(links)
        ) {
            const newPost = await prisma.post.create({
                data: {
                    title,
                    description,
                    imagesUrls,
                    category,
                    links
                }
            });
            res.status(200).json(newPost);
        } else {
            res.status(400).send("Missing or invalid fields");
        }
    } catch (error) {
        res.status(500).send(`${error}`);
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    if (Number(id)) {
        try {
            const post = await prisma.post.findFirst({
                where: { id: Number(id) }
            });
            res.status(200).json(post);
        } catch (error) {
            res.status(500).send(`${error}`);
        }
    } else {
        res.status(400).send("Missing Info");
    }
});

router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const { title, description, imagesUrls, category, links } = req.body;

    if (
        Number(id) &&
        title && typeof title === "string" &&
        description && typeof description === "string" &&
        Array.isArray(imagesUrls) &&
        category && typeof category === "string" &&
        Array.isArray(links)
    ) {
        try {
            const updatedPost = await prisma.post.update({
                where: { id: Number(id) },
                data: {
                    title,
                    description,
                    imagesUrls,
                    category,
                    links
                }
            });
            res.status(200).json(updatedPost);
        } catch (error) {
            res.status(500).send(`${error}`);
        }
    } else {
        res.status(400).send("Missing or invalid fields");
    }
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    if (Number(id)) {
        try {
            const deletedPost = await prisma.post.delete({
                where: { id: Number(id) }
            });
            res.status(200).json(deletedPost);
        } catch (error) {
            res.status(500).send(`${error}`);
        }
    } else {
        res.status(400).send("Missing Info");
    }
});


router.delete("/", async (req, res) => {
    try {
        const deleted = await prisma.post.deleteMany({});
        res.status(200).json(deleted);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
});

module.exports = router;
