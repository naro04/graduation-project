const app = require('./app');

const PORT = app.get('port');

app.listen(PORT, () => {
    console.log(`Server running on ${process.env.API_URL}`);
});
 
