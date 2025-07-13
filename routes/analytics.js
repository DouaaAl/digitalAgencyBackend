const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/track', async (req, res) => {
  const { path } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.get('User-Agent');

  await prisma.pageView.create({
    data: {
      path,
      ipAddress: ip,
      userAgent,
    },
  });

  res.json({ message: "Tracked" });
});

router.get('/stats', async (req, res) => {
  const pageViews = await prisma.pageView.count();
  const uniqueVisitors = await prisma.pageView.findMany({
    distinct: ['ipAddress'],
    select: { ipAddress: true }
  });

  res.json({
    pageViews,
    visits: uniqueVisitors.length
  });
});

module.exports = router;
