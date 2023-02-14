module.exports = (app) => {

  app.get('/', (req, res) => {
    res.send(
      {
        version: "1.0.16",
        message: 'Hello from a serverless containerized and continuously deployed Servey Maker!',
        oauth: 'Google'
      }
    );
  });

};