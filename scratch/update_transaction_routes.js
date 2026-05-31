const fs = require('fs');
const tsPath = 'E:/speak/DOANCOSO/doancoso/backend/src/routes/transactionRoutes.ts';
let content = fs.readFileSync(tsPath, 'utf8');

if (!content.includes('/my-history')) {
    const route = 
// L?y l?ch s? giao d?ch c?a user hi?n t?i
router.get('/my-history', authRequired, async (req, res) => {
  try {
    const user = req.user;
    const transactions = await Transaction.find({ userId: user._id })
      .populate('packageId', 'name price')
      .sort({ createdAt: -1 });
    return res.json({ transactions });
  } catch (error) {
    logger.error('[transactions my-history] ' + error);
    return res.status(500).json({ message: 'L?i khi l?y l?ch s? giao d?ch.' });
  }
});
;
    // Insert after POST /create
    content = content.replace("router.get('/status/:code'", route + "\nrouter.get('/status/:code'");
    fs.writeFileSync(tsPath, content);
    console.log("Added /my-history route to backend.");
} else {
    console.log("Route already exists.");
}
