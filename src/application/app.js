import "dotenv/config";
import express from "express";
import expressEjsLayouts from "express-ejs-layouts";

import subdomainRouter from "../routers/route-subdomain.js";

const app = express();

app.use("/static", express.static("./public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "src/views");
app.use(expressEjsLayouts);
// app.set("layout", "layouts/base");

app.use("/", subdomainRouter);

export default app;
