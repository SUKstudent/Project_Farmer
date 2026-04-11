
const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { waterLevel } = req.body;

  let data = {
    crops: waterLevel === 'Low' ? ['Jowar', 'Millets'] : ['Groundnut'],
    income: ['Goat Farming', 'Dairy']
  };

  res.json({ success: true, data });
});

module.exports = router;
