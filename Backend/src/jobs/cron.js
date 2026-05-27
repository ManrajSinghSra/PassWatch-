const cron = require('node-cron');
const runAllScrapers = require('../scrapers');

function startCronJobs() {
  // Every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('⏰ Cron triggered');
    try {
      await runAllScrapers();
    } catch (err) {
      console.error('Cron error:', err.message);
    }
  });
  
  // Run once on startup (after 5 sec delay)
  setTimeout(() => {
    runAllScrapers().catch(console.error);
  }, 5000);
  
  console.log('🕒 Cron scheduled (every 30 mins)');
}

module.exports = startCronJobs;