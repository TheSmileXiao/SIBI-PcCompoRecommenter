const express = require("express");
const cors = require("cors");
const neo4j = require("neo4j-driver");

const config = require("config");
const { response } = require("express");
const uri = config.get("NEO4J_URI");
const user = config.get("NEO4J_USERNAME");
const password = config.get("NEO4J_PASSWORD");

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), { disableLosslessIntegers: true }
);
const app = express();

//middleware
app.use(express.json());
app.use(cors());

//comprobar si está en modo de producción
if(process.env.NODE_ENV === "production") {
  app.use(express.static("../frontend/build"));
  app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
  });
}

//asignar el puerto que escucha las peticiones
const PORT = process.env.PORT || 5000;

app.get("/home"), function (req, res) {
  res.send("Servidor activada");
}

app.post("/api/getProduct", function (request, response) {
  console.log("ejecutando " + request.body.query);
  const query = request.body.query;
  const session = driver.session();
  const resultPromise = session.run(query);
  resultPromise
    .then((result) => {
      const datos = result.records;
      var clean = [];
      datos.forEach((element) => {
        element.forEach((element1) => {
          console.log(element1.properties);
          clean.push(element1.properties);
        });
      });
      response.send(clean);
      session.close();
    })
    .catch((error) => {
      console.log(error);
      session.close();
    });
});

app.post("/api/getProductAmount", function (request, response) {
  console.log("ejecutando " + request.body.query);
  const query = request.body.query;
  const session = driver.session();
  const resultPromise = session.run(query);
  resultPromise
    .then((result) => {
      const datos = result.records;
      response.send(datos[0]._fields);
      session.close();
    })
    .catch((error) => {
      console.log(error);
      session.close();
    });
});

app.post("/api/query", function (request, response) {
  console.log("ejecutando " + request.body.query);
  const query = request.body.query;
  const session = driver.session();
  const resultPromise = session.run(query);
  resultPromise
    .then((result) => {
      const datos = result.records;
      response.send(datos);
      session.close();
    })
    .catch((error) => {
      console.log(error);
      session.close();
    });
});


app.listen(PORT, () => console.log(`Servidor  con puerto ${PORT}`));