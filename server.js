const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

const { Fertilizer, Tomato } = require("./models");

const app = express();
const port = 5501;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://tomatix234:tomatix@tomatix.mgvot.mongodb.net/?retryWrites=true&w=majority&appName=Tomatix', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.post('/fertilizers', async (req, res) => {
    try {
        const fertilizer = new Fertilizer(req.body);
        const result = await fertilizer.save();
        res.status(201).send({ message: 'Fertilizer added successfully', id: result._id });
    } catch (err) {
        res.status(500).send({ error: 'Failed to add fertilizer' });
    }
});

app.get('/fertilizers', async (req, res) => {
    try {
        const fertilizers = await Fertilizer.find({});
        res.status(200).send(fertilizers);
    } catch (err) {
        res.status(500).send({ error: 'Failed to fetch fertilizers' });
    }
});

app.post('/tomatoes', async (req, res) => {
    try {
        const tomato = new Tomato(req.body);
        const result = await tomato.save();
        res.status(201).send({ message: 'Tomato added successfully', id: result._id });
    } catch (err) {
        res.status(500).send({ error: 'Failed to add tomato' });
    }
});

app.get('/tomatoes', async (req, res) => {
    try {
        const tomatoes = await Tomato.find({});
        res.status(200).send(tomatoes);
    } catch (err) {
        res.status(500).send({ error: 'Failed to fetch tomatoes' });
    }
});

app.post('/getmarketintelligence', async (req, res) => {
    try {
        const state_name = req.body.statename;

        if (typeof state_name !== 'undefined' && state_name.trim() === "") {
            return res.status(400).send({ message: "No state name provided" });
        }

        const url = `https://www.kisandeals.com/mandiprices/TOMATO/${state_name}/ALL`;

        const response = await axios.get(url);
        const cheer = cheerio.load(response.data);

        let tables = [];
        cheer('table').each(function (i, table) {
            let tabledata = [];
            cheer(table).find('tr').each(function (j, row) {
                let rowdata = [];
                cheer(row).find('td,th').each(function (k, box) {
                    rowdata.push(cheer(box).text().trim());
                });
                tabledata.push(rowdata);
            });
            tables.push(tabledata);
        });

        let q_and_a = [];
        cheer('body > div:nth-child(10) > div > div > ul > li').each(function (i, li) {
            const q = cheer(li).find('h5').text().trim();
            const a = cheer(li).find('p').text().trim();
            q_and_a.push({ q, a });
        });

        res.status(200).send({ table: tables, qanda: q_and_a, success: true, message: "successful" });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send({ success: false, message: "Error fetching market intelligence data" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
